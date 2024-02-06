예전에 만든 코어키퍼 컨트롤러를 약간 개조하여 팰월드 컨트롤러로 재탄생시켰습니다.

# 사용방법 (Linux)

node.js가 깔려있고 셸을 통해 서버를 실행할 수 있어야 사용가능합니다.

```sh
git clone https://github.com/joongwon/gameserver-controller.git
cd gameserver-controller
npm install
npm run build
```

.env를 열어 필요한 인자들을 넣어줍니다. 예시:

```env
ADMIN_PASSWORD=password # 웹에서 사용할 패스워드
JWT_SECRET=secret       # JWT 생성에 필요한 private key
BIN_PATH=/home/user/Steam/Pal/Binaries/Linux/PalServer-Linux-Test # 서버 바이너리의 위치
BIN_ARG=Pal             # 공백문자(' ')로 구분된 인자
CWD=/home/user/Steam    # working directory
```

```sh
npm run start
# 백그라운드로 실행하려면:
# nohup npm run start &
```

이제 `localhost:3003`으로 접속할 수 있습니다.

# 구성

- 프론트엔드: HTML + Vanilla JS (+ bootstrap)
- 백엔드: Node.js fastify 서버

# 작동방식

1. (자동) 웹에서 백엔드에 요청을 보내 로그 수신용 웹소켓을 엽니다.
2. 사용자가 정해진 ID/PW로 로그인하면 토큰을 발급받습니다.
3. 사용자가 “시작” 버튼을 누르면 백엔드로 요청이 가서 자식 프로세스로 팰월드 서버가 실행됩니다.
4. 즉시 접속 - 서버의 ON/OFF 상태도 알 수 있어요.
5. 24시간 틀어놓으면 전기세가 나오고 서버 성능이 느려지기 때문에 “정지” 버튼을 눌러 꺼주는게 좋습니다. 버튼을 누르면 역시 백엔드로 요청이 가서 SIGINT로 종료하게 됩니다.
  - 그전에는 바로 SIGKILL을 보냈었는데 시프를 듣고 제가 어떤 짓을 하고 있는지 알게 되어 고쳤습니다. (설명: SIGKILL을 보내면 프로세스는 준비할 시간도 거의 없이 바로 죽어야 합니다. 저장이 랜덤한 타이밍에 날아가거나 중단될 수 있을듯 합니다)
6. 추가로 로그를 지우거나 카테고리별로 정리할 수 있습니다.

# 앞으로 추가할 기능

- 메모리 및 CPU 사용량 모니터링.
- 디스코드 봇: 웹과 비슷한 기능들을 디스코드로도 사용할 수 있게 구현해보고 싶네요.
