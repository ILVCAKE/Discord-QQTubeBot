const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } = require('discord.js');
const axios = require('axios');
const fs = require('fs');
require('dotenv').config();

// 기본 API 키와 Discord 토큰
const defaultApiKey = process.env.QQTUBE_API_KEY; // 기본 API 키 (환경 변수에서 가져옴)
const apiUrl = 'https://www.qqtube.com/v1-api';
const clientToken = process.env.DISCORD_BOT_TOKEN;
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;

// 사용자별 API 키 저장 파일
const userApiKeysFile = 'userapikeys.json';

// 사용자별 API 키 저장 데이터 (JSON 형식)
let userApiKeys = {};

// 파일에서 사용자별 API 키 로딩
try {
  const data = fs.readFileSync(userApiKeysFile);
  userApiKeys = JSON.parse(data);
} catch (err) {
  console.log('userapikeys.json 파일을 로딩하지 못했습니다. 새 파일을 생성합니다.');
}

// Discord 클라이언트 설정
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

// 명령어 정의
const commands = [
  new SlashCommandBuilder()
    .setName('qqtube')
    .setDescription('QQTube 서비스를 구매합니다.')
    .addIntegerOption(option =>
      option.setName('id_service')
        .setDescription('서비스 ID')
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName('quantity')
        .setDescription('수량')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('url')
        .setDescription('URL')
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName('share_type')
        .setDescription('공유 유형')
        .setRequired(false)),
  new SlashCommandBuilder()
    .setName('balance')
    .setDescription('현재 잔액을 확인합니다.'),
  new SlashCommandBuilder()
    .setName('history')
    .setDescription('구매 내역을 확인합니다.'),
  new SlashCommandBuilder()
    .setName('setkey')
    .setDescription('QQTube API 키를 설정합니다.')
    .addStringOption(option =>
      option.setName('key')
        .setDescription('새로운 API 키')
        .setRequired(true)),
];

// Discord REST API 설정
const rest = new REST({ version: '10' }).setToken(clientToken);

(async () => {
  try {
    console.log('Started refreshing application (/) commands.');

    // 특정 서버에 명령어 등록
    await rest.put(
      Routes.applicationGuildCommands(clientId, guildId),
      { body: commands.map(command => command.toJSON()) },
    );

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
})();

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;

  const { commandName, options, user } = interaction;

  if (commandName === 'qqtube') {
    const id_service = options.getInteger('id_service');
    const quantity = options.getInteger('quantity');
    const url = options.getString('url');
    const share_type = options.getInteger('share_type') || null;
    const apiKey = userApiKeys[user.id] || defaultApiKey; // 사용자 API 키를 가져오거나 기본 키 사용

    try {
      const response = await submitToQQTube(apiKey, id_service, quantity, url, share_type);
      if (response.error) {
        await interaction.reply(`제출 실패: ${response.error}`);
      } else {
        await interaction.reply(`제출 성공! ID: ${response.id_service_submission}`);
      }
    } catch (error) {
      console.error(error);
      await interaction.reply('오류가 발생했습니다!');
    }
  } else if (commandName === 'balance') {
    const apiKey = userApiKeys[user.id] || defaultApiKey; // 사용자 API 키를 가져오거나 기본 키 사용

    try {
      const balance = await getBalance(apiKey);
      if (balance.error) {
        await interaction.reply(`잔액 가져오기 실패: ${balance.error}`);
      } else {
        await interaction.reply(`현재 잔액: ${balance.funds}`);
      }
    } catch (error) {
      console.error(error);
      await interaction.reply('오류가 발생했습니다!');
    }
  } else if (commandName === 'history') {
    const apiKey = userApiKeys[user.id] || defaultApiKey; // 사용자 API 키를 가져오거나 기본 키 사용

    try {
      const history = await getPurchaseHistory(apiKey);
      if (history.error) {
        await interaction.reply(`구매 내역 가져오기 실패: ${history.error}`);
      } else {
        const historyString = history.submissions.map(submission => `- ID: ${submission.id_service_submission}, 서비스: ${submission.id_service}, 수량: ${submission.quantity}, URL: ${submission.short_url}`).join('\n');
        await interaction.reply(`**구매 내역:**\n${historyString}`);
      }
    } catch (error) {
      console.error(error);
      await interaction.reply('오류가 발생했습니다!');
    }
  } else if (commandName === 'setkey') {
    const newKey = options.getString('key');
    userApiKeys[user.id] = newKey; // 사용자 API 키 저장
    fs.writeFileSync(userApiKeysFile, JSON.stringify(userApiKeys)); // 파일 저장
    await interaction.reply('QQTube API 키가 성공적으로 설정되었습니다.');
  }
});

// QQTube API 호출 함수들
async function submitToQQTube(apiKey, id_service, quantity, url, share_type) {
  const data = {
    api_key: apiKey,
    action: 'submission',
    id_service,
    quantity,
    short_url: url,
    share_type,
  };

  try {
    const response = await axios.post(apiUrl, data);
    return response.data;
  } catch (error) {
    console.error('submitToQQTube error:', error);
    return { error: 'API 호출 실패' };
  }
}

async function getBalance(apiKey) {
  const data = {
    api_key: apiKey,
    action: 'funds',
  };

  try {
    const response = await axios.get(apiUrl, { params: data });
    return response.data;
  } catch (error) {
    console.error('getBalance error:', error);
    return { error: 'API 호출 실패' };
  }
}

async function getPurchaseHistory(apiKey) {
  const data = {
    api_key: apiKey,
    action: 'submissions',
  };

  try {
    const response = await axios.get(apiUrl, { params: data });
    return response.data;
  } catch (error) {
    console.error('getPurchaseHistory error:', error);
    return { error: 'API 호출 실패' };
  }
}

client.login(clientToken);