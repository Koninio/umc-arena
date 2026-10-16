# GitHub 배포 패키지

브라우저 업로드를 위해 게임 소스, 도트 시트, 1,800개 프레임 PNG, 테스트와 제작 문서를 source.partXX로 분할했습니다. 각 파일은 SHA-256으로 검증됩니다. 원본 구조 복원: `node restore-source.mjs`. 그다음 `npm ci` 및 `npm test`를 실행합니다. Render 빌드 명령: `node restore-source.mjs && npm ci --omit=dev`. 시작 명령: `npm start`. 복원은 dist/server/test/docs/asset-sources 폴더를 갱신하므로 로컬 수정이 있다면 먼저 커밋하세요.

# UMC · 마법사의 귀환

독창적인 2.5D 도트 마법사 대결 게임 개발판. `umc-arena.code-workspace`를 Visual Studio Code에서 열면 됩니다.

## 현재 상태

- 플레이 가능한 로비·AI 훈련장, 5개 계보, 기본 공격+25개 스킬, 계보별 10개 연계.
- 50×50m 전장, 8종 바이옴 장식, 안개 시야, 화면 방향 알림, 추적·가속 수축 자기장.
- 60Hz 서버 판정, 초당20회 상태 전송, 30Hz 입력, 클라이언트 시각 보간, 친구 코드·매칭 대기열.
- Generated image sheets: 25 skill sheets×60frames +5 character sheets×60frames =1,800 individual PNGs. Each sheet was generated once by built-in ImageGen then cropped/padded/repacked; these are not1,800 independent image-generation calls.
- 캐릭터 한 시트의60프레임은 대기·걷기·시전·대시·점프 각각12프레임으로 구성됩니다. 방향은 좌우 반전이며8방향 전용 원화는 아닙니다.
- AI 원화의 위치·크기 흔들림, 일부 잔광 잘림·배경 입자와 반복 프레임이 남아 있습니다. 물리 판정은 원화가 아닌 서버의 미터 단위 충돌체로 처리합니다.
- **Agent Audio 실제 음원 생성은 미완료이며 현재 무음입니다.** 클라우드 실행 환경과 사용자 모델 약관 검토가 필요합니다. `docs/AUDIO-CLOUD.md` 참고.
- 클라우드 게임 서버 배포와 외부2인 접속 테스트는 별도 확인해야 합니다. 정적 사이트 게시만으로 실시간 서버가 가동되는 것은 아닙니다.

## 조작

WASD(대각선 속도 정규화), SPACE 점프, SHIFT 대시, F 점멸, R 선행 패링, Q 시전 취소, E 기본 공격.

스킬1~5: 좌클릭 / 우클릭 / 엄지 위 / 엄지 아래 / 휠 클릭. 대체 키는1~5. 충전 중에도 이동·대시 가능.

짧은 입력은 최소 피해,1.3초 충전으로 최대 위력. 패링은 적의 시전 시작보다 먼저 켜고 방향을 맞춰야 성공. 반사는 서버 시드 난수로 경로 결정. 정확한 투사체 충돌은 상쇄, 가까운 반격 또는 실패 패링에 맞으면 절반 피해.

## 개발 검증

```sh
npm ci
npm test
npm run check
npm run preview
```

`preview`는127.0.0.1:4173 정적 미리보기만 제공합니다. 온라인 서버를 사용자PC에서 공개하지 않습니다. `npm test`의 통신 테스트는 잠깐 열었다 닫는 loopback 격리 서버입니다.

## 클라우드 서버

`render.yaml`은 Singapore의 단일 Free Node 서비스 설정입니다. 연결된GitHub 저장소에서 배포하면 됩니다. 게임과 WebSocket은 같은 서비스의`/`와`/ws`를 사용합니다. `/health`로protocol:1 상태를 확인합니다. 서버가 제공하는`/config.js`는 동일 출처를 자동 연결합니다. 정적Sites판은 설정에서 배포된HTTPS주소를 넣거나`dist/config.js`에 반영합니다.

Render Free는15분간 수신 트래픽이 없으면 잠들며 재기동에 약1분이 걸릴 수 있습니다. 월750시간·대역폭·빌드 한도가 있고 무료 인스턴스는 재시작될 수 있습니다. 요금제·결제수단·지출 상한을 확인해야 무료 범위를 넘는 비용을 막을 수 있습니다. 임의 유료 전환은 하지 않습니다. [공식문서](https://render.com/docs/free)

방과 대전은 메모리에만 보관합니다. 서버 재기동 시 대전은 복구되지 않습니다. 랭크·로그인·영구기록은 구현하지 않았습니다. 대회급 지연 보상·재접속 복구·실사용 부하 검증은 아직 하지 않았습니다.

## 산출물

- `dist/`: 정적 게임·생성 아트·프레임PNG
- `server/`: 권위 서버 및 정적 미리보기
- `test/`: 전투/통신 회귀검증
- `docs/`: 클라우드 오디오 명세/설치절차 및 원본 기록
- `asset-sources/`: 생성 원본·추출기·프롬프트 등

오디오 모델이나 인증정보는 저장소에 포함하지 않습니다.

