# 심사용 데모 모드

Native 이슈: https://github.com/IceCream0910/kw-klas-plus/issues/113

기준 Native: `5533dffc4b6b906641ef41c5de4b36a0779a606b` + #113 변경.
기준 웹: `9c64dec7bcb8fc5739209aac03270680ff438d13`.

Native·웹 변경을 함께 배포해야 한다. 기존 로그인 화면에 학번 `0000000000`, 비밀번호 `KlasplusDemo!123`을 입력한다. 일반 사용자용 진입 버튼은 추가하지 않는다.

Native가 신뢰된 origin의 document-start에서 `window.__klasDemoSession = {version:1,generation}`을 설치한다. 이 마커는 웹에서 읽는 상태이며 Native 활성화 권한이 아니다. 실제 세션·자격증명은 웹으로 전달하지 않는다. 새 브리지 메서드는 없으며 기존 Native KLAS API 최소 지원 Android 34 / iOS 2는 유지한다.

- `KLAS`는 데모에서 Native transport만 사용한다. legacy proxy로 fallback하지 않는다.
- Native는 수업·시간표·공지·학적·성적·캘린더·과제·강의 fixture를 제공한다. 미지원 요청은 실패로 종료하며 실제 KLAS 요청을 하지 않는다.
- 학교 웹 화면이 필요한 동작은 `/demo?feature=...`로 연결한다. 과제·프로젝트·퀴즈·평가·토론·설문은 예시 텍스트 제출, 강의는 학습 시작·일시 정지·배속·진행률 저장을 모의한다. 학교 동영상·출석 인정·실제 파일 제출은 수행하지 않는다.
- 학식·학교 공지는 웹 메모리 fixture를 사용하고, 그 외 서버 `/api/` 경로는 데모에서 거부한다. AI 응답과 대화 작업도 외부 Agent 요청 없이 모의한다.
- Native가 웹 저장소를 데모 세대별로 분리한다. 일반 사용자의 localStorage를 읽거나 덮어쓰지 않는다. 가상 캘린더 변경·제출·진행률·설정은 로그아웃 시 초기화한다.
- 앱 UI와 정적 자산을 받으려면 KLAS+ 웹 서버 접속은 필요하다. 완전한 오프라인 앱 모드는 아니다.

검증: `node --test tests/*.test.cjs`, `npm run build`. 브라우저에서는 Native 모의 브리지를 연결한 별도 로컬 서버로 과제 제출과 강의 제어를 확인한다. 실제 Native·운영 웹의 연동, 실기기와 App Store 심사는 별도 검증한다.

롤백은 Native·웹 변경을 함께 되돌린다. 마커가 없는 기존 앱과 일반 세션의 동작은 유지한다. 신규 데이터 마이그레이션은 없다.
