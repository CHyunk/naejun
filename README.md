# 연성중 롤 내전

Riot ID로 참가자를 등록하고 한국 서버 솔로 랭크 점수를 기준으로 두 팀을 편성하는 웹 앱입니다.

## 실행 방법

Node.js 18 이상이 필요합니다.

```bash
cd 내전
npm install
```

`.env.example`을 `.env`로 복사하고 Riot Developer Portal에서 발급한 API 키를 입력합니다.

```env
RIOT_API_KEY=RGAPI-your-api-key
RIOT_PLATFORM=kr
RIOT_REGION=asia
PORT=3000
```

```bash
npm start
```

브라우저에서 `http://localhost:3000`을 엽니다.

## 팀 편성 방식

- 솔로 랭크의 티어, 단계, LP를 하나의 점수로 환산합니다.
- 언랭크 플레이어는 600점으로 계산합니다.
- 가능한 모든 동일 인원 조합을 비교해 팀 점수 차가 가장 작은 결과를 선택합니다.
- 최적 결과가 여러 개면 그중 하나를 무작위로 선택합니다.
- 조합 계산량과 일반적인 내전 규모를 고려해 참가자는 최대 10명까지 등록할 수 있습니다.

## 테스트

```bash
npm test
```

## 환경 변수

| 이름 | 기본값 | 설명 |
| --- | --- | --- |
| `RIOT_API_KEY` | 없음 | Riot API 키, 필수 |
| `RIOT_PLATFORM` | `kr` | 플랫폼 라우팅 값 |
| `RIOT_REGION` | `asia` | 리전 라우팅 값 |
| `PORT` | `3000` | 서버 포트 |
