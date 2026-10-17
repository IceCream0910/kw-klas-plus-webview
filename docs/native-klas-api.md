# Native KLAS API 전환

추적: 이후 PR에서 검토한다. 원격 push와 PR 생성은 보류한다.

## 적용과 기준

- Web 기준 main: `0e626adec5963ebe9ecffc87d2c05c9c186bb282`.
- Native 기준 main: `182ac5825022a4cb12046817af4fc7f373bd22c8`.
- 양 저장소 `feat/native-klas-api`의 변경을 함께 적용한다. push·배포는 하지 않았다.
- `lib/core/nativeApp.js`의 klasApi 기준은 Android versionCode 34, iOS CFBundleVersion 2다. 구 빌드·식별 불가 환경은 기존 API router를 유지한다.
- 일부 Android 보조 WebView에는 기존 앱 UA가 없어 Native가 문서 시작 시 주입하는 `__klasNativeApiApp`을 klasApi 판정에만 사용한다. 기존 헤더·검색·탐색 등의 UI 판정에는 이 보조 정보를 사용하지 않는다. User-Agent나 이 값은 보안 권한을 부여하지 않는다.

## 호출 경로

지원 빌드: 화면/Agent/검색 → lib/core/klas.ts → nativeTransport → Bridge v1 → Native KlasApiCore → KLAS.
구 빌드: 기존 /api/proxy 또는 /api/lecturePlan·lectureNotice·search → lib/server/klas.js → KLAS.

API router의 KLAS 직접 fetch는 제거했다. 서버 및 웹은 lib/klas/contract.js의 정확한 HTTPS host 검증을 사용한다. 서버 코드는 브라우저 transport에서 import하지 않는다. redirect는 서버와 Native에서 자동 추적하지 않는다. Native 오류·timeout·미지원 메서드를 proxy로 자동 fallback하지 않는다.

lib/klas/aggregates.js는 transport를 주입받는 순수 집계다. services.js는 빌드 기준으로 기존 내부 API와 직접 집계를 선택한다. 강의계획서는 성공한 필드만 유지하고 공지는 페이지 순서를 보존하면서 최대 3페이지를 병렬 조회한다. 비정상 페이지 수는 거부하며 전체 공지는 최대 1,000페이지다.

검색 coordinator의 60초 메모리 캐시·중복 병합·onResult 계약을 유지한다. 지원 빌드의 KLAS 게시판 검색은 nativeSearchBatch로 실행하고 학교 공개 공지는 자격증명 없는 기존 크롤러를 사용한다. 검색 메타데이터의 기존 IndexedDB 5 MiB·3,000건·7일 만료·계정/학기 무효화 계약은 유지한다.

Agent의 KLAS 공식 페이지 읽기는 Native GET 후 공통 pageContent.js로 Markdown 변환한다. 구 빌드와 kw.ac.kr/www.kw.ac.kr 공개 페이지는 기존 크롤러를 유지한다. 학교 공식 WebView 자체의 내부 XHR·강의 플레이어·파일 전송은 이번 API 이관과 별개의 기존 경로다.

## 브리지와 세션

- requestKlasApi(operationId, endpoint, payloadJson)
- readKlasApiChunk(responseId, index)
- cancelKlasApi(operationId)

인자는 모두 문자열이며 endpoint는 KLAS POST 경로 또는 page: 접두사의 KLAS GET 경로다. Native가 SecureStore에서 SESSION을 읽으며 웹은 토큰·Cookie·임의 헤더를 전달하지 않는다. JSON 응답을 최대 6,144 UTF-16 code unit 청크로 받아 기존 JSON 값으로 조립한다. 응답은 4 MiB, Native 요청 envelope는 64 KiB로 제한한다. 청크는 30초 만료, 문서 내 총 요청/응답 16개 및 문자 버퍼 예산 16 MiB를 적용한다. 정상 응답을 다른 요청 때문에 퇴출하지 않는다.

새 웹은 Native API 사용 가능 여부로 기존 token gate를 대체한다. Native는 새 웹 문맥에서 receiveToken/receivedData의 첫 인자에 null을 전달하고 klasSessionToken 기록 대신 키 삭제를 실행한다. 구 웹은 이전 callback을 유지한다. 기존 저장 키·Native 로그인·SESSION cookie·추가 인증 절차를 바꾸지 않는다. 구 웹 호환 경로가 남아 있으므로 모든 앱에서 SESSION 노출이 제거됐다고 주장하지 않는다.

routeChangeStart·pagehide·klas-search-reset은 진행 중 호출을 취소한다. Native도 문서 이동·해제 시 정리하고 SESSION/학기 변경 후 늦은 응답과 청크를 폐기한다. 401·403·추가 인증/redirect·timeout·네트워크·잘못된 응답은 구분한다. 네트워크 오류만으로 세션을 지우거나 자동 로그인 반복을 시작하지 않는다.

모든 POST는 자동 재시도하지 않는다. OUTCOME_UNKNOWN이면 목록을 재조회하고 화면을 닫아 반영 여부 확인을 안내한다. Agent에도 자동 재실행 금지 메시지를 전달한다. 취소는 이미 전송한 변경을 취소했다는 뜻이 아니다. operationId 중복 억제는 문서 수명 내 120초·128개 범위이며 서버 멱등성을 대신하지 않는다.

## 검증

- `node --test tests/*.test.cjs`: 48개 통과. 빌드 경계, 보조 WebView, 외부 호스트/경로 거부, 구 집계 API 유지, Native 오류 시 fallback 금지, 큰 JSON 조립, AbortSignal, 부분 성공·공지 순서, 토큰 없는 실제 React 훅, 공식 페이지 변환을 포함한다.
- `npm run build -- --webpack`: production 빌드 통과. 기본 Turbopack 경로는 이 실행 환경의 포트 바인딩 제한으로 완료하지 못했다. webpack 검사에서 발견한 기존 SkeletonLayouts 중복 export는 별도 수정으로 제거했다.
- Native `:shared:testAndroidHostTest`: 320개 통과; `:shared:iosSimulatorArm64Test`: 345개 통과; `:androidApp:testDebugUnitTest`: 45개 통과. 모두 `--no-configuration-cache` 사용.
- Android Debug 및 instrumentation APK 컴파일 통과. 연결 기기가 없어 instrumentation 실행과 실기기 검증은 하지 않았다.
- iOS 전체 XCTest 224개 통과. 이후 변경된 브리지·홈 callback 관련 42개와 실제 WKWebView의 외부 endpoint 거부 1개도 별도 시뮬레이터에서 통과했다. 전체 실행 중 시뮬레이터 진단 수집 지연이 있었으나 결과 번들의 Passed/0 failures를 확인했다.

실제 KLAS의 신규/저장 로그인·만료/추가 인증·학교 응답 fixture, 캘린더 서버 반영과 위젯 갱신, 첨부·플레이어·실기기 사용자 흐름은 검증하지 않았다. 빌드 성공이나 mock 테스트를 운영 회귀 검증으로 간주하지 않는다.

## 롤백

웹 변경을 되돌리면 새 Native에서도 기존 callback과 서버 API로 동작한다. 지원 빌드 실패 시 자동 서버 우회는 두지 않는다. Native를 되돌릴 때 버전 코드 연속성과 웹의 적용 기준을 함께 조정한다. 새 비밀 키나 데이터 마이그레이션은 없다. 상세 Native 계약은 함께 작업한 저장소의 docs/adr/ADR-015-native-klas-api.md를 따른다.

Endpoint 확장: Native와 서버 core는 endpoint 목록을 유지하지 않는다. HTTPS klas.kw.ac.kr의 새 GET·JSON POST 경로와 query를 웹 배포만으로 추가한다. 사용자정보·비표준 포트·fragment·역슬래시·제어문자·dot segment·인코딩된 path와 redirect를 차단한다. 모든 POST는 경로에 관계없이 중복 억제와 네트워크/timeout 결과 불명 정책을 적용한다. query의 percent encoding은 허용한다.
