# 통합 검색

검색 제출 및 1.5초 입력 대기는 `/api/search`의 POST 한 번으로 묶는다. 서버는 과목×게시판 및 학교 공지를 최대 3개씩 병렬 조회하며, 완료된 소스부터 NDJSON으로 전달한다. 웹은 각 소스 결과를 즉시 병합한다. 서버는 고정된 KLAS·학교 경로만 사용하고, 인증된 응답은 공용 캐시나 로그에 남기지 않는다. 연결 종료는 진행 중 조회와 대기 작업을 취소한다. 웹의 60초 캐시 및 진행 중 요청 공유로 이미 확보한 소스는 요청에서 제외한다. 더 보기는 선택한 소스·페이지에만 적용한다.

Header는 Android 33·iOS 1 이상에서 통합 검색 버튼을 표시하고, 그 이전의 Agent 지원 버전에서는 기존 `/agent` 진입 버튼을 표시한다.

학교 공지 검색의 기본 조건은 `searchKey=1`(제목)이다. 학교 서버의 제목+내용 검색은 HTML 본문 수신이 느리므로 기본 요청에서 사용하지 않는다. crawler API에서 `searchKey=3`을 명시하면 제목+내용 검색을 사용할 수 있다. 카테고리와 페이지는 두 검색 조건 모두 유지한다.

`SearchProvider`는 홈 탭의 공통 Header에 검색 버튼을 노출한다. Native 학습 데이터 수신 전에도 메뉴 검색을 열 수 있다. 신규 브리지는 Native v1 전용이며 기존 Android fallback으로 호출하지 않는다.

- `requestSearchData()` → `window.receiveSearchData(snapshot)` 및 기존 `receiveToken` 콜백.
- `setSearchOverlayOpen(boolean)` → Native 시트와 독립적인 내비게이션 숨김 상태.
- `openSearchBoard(kind, term, courseId, boardNo, masterNo)` → 현재 학기·과목을 검증한 게시판 이동.
- `openSearchAgent(contextJson)` → Native 메모리에 질문·최대 5개 목록 메타데이터를 잠시 보관하고 기존 `/agent`를 연다.
- `/agent`의 `takeSearchContext(id)` → 60초 이내 일회성 조회. 질문만 초안으로 채우고 결과는 컨텍스트 카드로 표시하며 자동 전송하지 않는다. 질문과 결과는 URL이나 검색 저장소에 넣지 않는다.

오버레이의 검색·에이전트 모드는 공용 입력값을 유지한다. AgentExperience와 AgentComposer를 기존 `/agent` 페이지와 공유한다. 검색 결과는 별도 컨텍스트 카드로 전달하고 기존 Agent Worker 요청에 `searchContext`를 추가한다. Worker 변경도 함께 배포해야 하며 새 AI 엔드포인트는 만들지 않는다. 자연어 질문 제안은 정적 규칙을 사용한다. 일반 검색은 단일 줄 입력이며 한글 조합 중에도 1.5초 대기 후 조회한다. 오버레이 종료까지 배경 스크롤·홈 새로고침을 잠그고, 다시 열면 입력과 검색 상태를 초기화한다.

로컬 검색은 150ms, 원격 조회는 명시적 제출 또는 1.5초 입력 대기 후 실행한다. 검색 router는 승인된 기존 프록시와 같은 서버·KLAS 인증 전달 경계를 사용한다. KLAS 요청 제한은 8초, 학교 공지는 20초다. 서버는 일시 네트워크 오류·5xx만 한 번 재시도하고 인증 실패·취소·timeout은 재시도하지 않는다. 스트림 연결 자체를 재시도하지 않아 이미 받은 소스를 중복 조회하지 않는다. 별도 토큰 저장소나 AI API는 만들지 않는다.

IndexedDB는 현재 scope/학기의 허용된 목록 필드만 저장한다. 조회 후 24시간은 오래됨 표시, 7일은 만료이며 읽기로 연장하지 않는다. 5MiB 직렬화 payload와 3,000개 상한을 함께 적용한다. 계정·학기 변경 및 로그아웃 시 폐기하고 저장 실패 시 메모리 검색을 유지한다. Native scope가 홈 런타임마다 바뀌므로 앱 재실행 뒤 기존 검색 캐시도 폐기한다.

검색 응답의 게시판 메타데이터는 누적하지만 일반 게시판 화면의 조회 연동은 아직 없다. 학습 결과는 기존 종류별 목록으로 이동한다. 실제 KLAS `ALL` 검색 필드·제목 필드, 로그인된 원본 이동, Android/iOS 키보드·뒤로가기·복귀는 실기기 검증이 필요하다.

기준 WebView `ec5ee370cd96441a73064bd4e8a9c305e2bcbe39`, Native `dd6f4f5873e1c0fbe7dbde2cfa8836dbc7725958` 위의 검색 변경을 함께 배포한다. 구 Native의 Agent 진입과 구 웹의 기존 계약은 유지한다. 롤백은 검색 변경을 되돌리며 검색 전용 DB 이외의 저장소를 지우지 않는다.

초기 구현 검증: `node --test tests/search.test.cjs tests/security.test.cjs tests/deadline-notifications.test.cjs` (24개 통과), `npx tsc --noEmit --incremental false --pretty false` 통과. 이후 사용자 요청으로 테스트·브라우저 검증을 중단했다. 최종 스트리밍·IME·공유 입력·컨텍스트 변경은 재검증하지 않았다. 전체 Webpack 빌드는 기존 `components/common/Skeleton.js`의 `SkeletonLayouts` 중복 export로 실패한다.
