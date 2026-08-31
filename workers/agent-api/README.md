# KLAS+ Agent API

Cloudflare Workers에서 OpenAI Responses API를 호출하고, 웹 UI에 정규화된 SSE 이벤트를 전달하는 독립 런타임입니다. Rybbit UUID의 해시를 대화 소유자와 OpenAI safety identifier로 사용하며, 요청마다 서울 기준 현재 시각을 prompt에 추가합니다. 이미지와 문서 첨부 원본은 Responses API 입력에만 전달하고 Durable Object에는 파일명과 MIME 타입만 기록합니다. KLAS 세션은 웹 클라이언트가 `localStorage.klasSessionToken`에서 먼저 읽고 `window.receiveToken`으로 보완하며, Worker로는 보내지 않습니다. 실제 KLAS 호출은 WebView 안에서 사전 정의된 endpoint와 payload 변환기를 통해 수행되고 Worker에는 도구 결과만 전달됩니다.

## 로컬 실행

1. `.dev.vars.example`을 `.dev.vars`로 복사하고 `OPENAI_API_KEY`를 설정합니다.
2. 저장소 루트에서 `npm run agent:dev`를 실행합니다.
3. 웹 앱의 `.env.local`에 `NEXT_PUBLIC_AGENT_API_URL=http://localhost:8788`을 설정합니다.

## 배포

```sh
npx wrangler secret put OPENAI_API_KEY --config workers/agent-api/wrangler.jsonc
npm run agent:deploy
```

배포 후 웹 앱의 `NEXT_PUBLIC_AGENT_API_URL`을 Worker 주소로 설정합니다. `ALLOWED_ORIGINS`에는 실제 웹 앱 origin만 남겨야 합니다. Worker는 긴 연결을 유지하되 OpenAI 응답을 버퍼링하지 않고 즉시 전달하므로 전체 요청 timeout에 덜 민감합니다.

Worker의 Rate Limiting binding은 브라우저별 익명 ID를 기준으로 분당 30회의 모델 호출을 허용합니다. 도구 호출 뒤 모델을 재개하는 요청도 이 횟수에 포함됩니다. 공개 서비스에서는 이 제한에 더해 Cloudflare WAF 또는 서비스 로그인 기반의 서명된 사용자 ID를 적용해야 합니다.

대화 연속성은 OpenAI `previous_response_id`로 유지하고, 질문과 최종 답변은 대화별 SQLite Durable Object에 최대 60개까지 저장하여 화면 재진입 시 복원합니다. `OPENAI_TITLE_MODEL`의 기본값인 `gpt-5-nano`가 첫 턴과 이후 10턴마다 제목을 생성하며, 사용자가 직접 변경한 제목은 자동 갱신하지 않습니다. 대화 이름 변경과 삭제는 소유자 해시를 검증한 뒤 처리합니다. 저장된 대화는 마지막 사용 30일 후 자동 만료됩니다. KLAS SESSION과 원본 도구 응답은 저장하지 않습니다.

쓰기 도구는 `requiresApproval` 이벤트로 클라이언트에 전달됩니다. 개인 일정 추가·수정·삭제는 클라이언트 승인 카드에서 사용자가 허용한 뒤에만 고정된 KLAS 일정 payload로 실행됩니다.
