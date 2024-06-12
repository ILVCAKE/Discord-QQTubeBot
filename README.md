# Discord-QQTubeBot
이 Discord 봇은 QQTube API를 사용하여 유튜브 서비스를 구매하고 잔액을 확인할 수 있도록 합니다. 사용자는 Discord 명령어를 통해 서비스를 구매하고 구매 내역을 확인할 수 있습니다.

# 기능
QQTube 서비스 구매: Discord 명령어를 사용하여 QQTube 서비스를 구매할 수 있습니다.
잔액 확인: Discord 명령어를 사용하여 현재 QQTube 계정의 잔액을 확인할 수 있습니다.
구매 내역 확인: Discord 명령어를 사용하여 이전에 구매한 QQTube 서비스의 구매 내역을 확인할 수 있습니다.
사용자별 API 키 설정: 사용자마다 별도의 API 키를 설정하여 API 호출을 인증할 수 있습니다.
설치 및 설정

# 이 저장소를 클론합니다.

.env.example 파일을 복사하여 .env 파일을 생성합니다.
Discord 봇 토큰과 QQTube API 키를 .env 파일에 추가합니다.
필요에 따라 Discord 클라이언트 ID와 길드 ID도 .env 파일에 추가합니다.
필요한 패키지를 설치합니다.

# npm install

사용법
QQTube 서비스 구매
bash
Copy code
/qqtube id_service quantity url [share_type]
id_service: 구매할 QQTube 서비스의 ID입니다.
quantity: 구매할 수량입니다.
url: 유튜브 비디오의 URL입니다.
share_type (옵션): 공유 유형입니다.
잔액 확인
bash
Copy code
/balance
구매 내역 확인
bash
Copy code
/history
사용자별 API 키 설정
bash
Copy code
/setkey new_api_key
new_api_key: 새로운 QQTube API 키입니다.
