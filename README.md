
# KLAS+ WebView 페이지

네이티브 앱(Android/iOS): [icecream0910/kw-klas-plus](https://github.com/icecream0910/kw-klas-plus)


## 시작하기

### 설치 및 실행

1. **저장소 클론**
   ```bash
   git clone https://github.com/IceCream0910/kw-klas-plus-webview.git
   cd kw-klas-plus-webview
   ```

2. **의존성 설치**
   ```bash
   npm install
   # 또는
   yarn install
   ```

3. **환경 변수 설정**
   ```bash
   cp .env.example .env.local
   ```
   
   `.env.local` 파일에 필요한 환경 변수를 설정하세요:
   ```env
   # 개발 모드 여부 (true/false)
   NEXT_PUBLIC_DEVELOPMENT=true
   ```

4. **개발 서버 실행**
   ```bash
   npm run dev
   # 또는
   yarn dev
   ```
### 빌드 및 배포

```bash
# 프로덕션 빌드
npm run build
# 또는
yarn build

# 프로덕션 서버 실행
npm run start
# 또는
yarn start
```

## 📁 프로젝트 구조

```
kw-klas-plus-webview/
├── 📁 lib/                    # 유틸리티 및 비즈니스 로직
│   ├── 📁 core/               # API 호출, 데이터 저장, 네이티브 브릿지
│   ├── 📁 calendar/           
│   ├── 📁 grade/              
│   ├── 📁 lecture/            
│   ├── 📁 lecturePlan/        
│   ├── 📁 timetable/         
│   ├── 📁 scholarship/        
│   ├── 📁 profile/            
│   ├── useBoardData.js        
│   ├── useSettings.js         
│   ├── pullToRefreshUtils.js  
│   └── index.js              
├── 📁 components/             # 페이지 별 컴포넌트
│   ├── 📁 common/             # 공통 컴포넌트
│   ├── 📁 calendar/           
│   ├── 📁 grade/             
│   ├── 📁 lecture/            
│   ├── 📁 lecturePlan/        
│   ├── 📁 timetable/          
│   ├── 📁 board/              
│   ├── 📁 scholarship/        
│   ├── 📁 profile/            
│   ├── 📁 feed/               
│   └── 📁 settings/           
├── 📁 pages/                  
│   ├── 📁 api/                
│   ├── 📁 modal/              
│   ├── calendar.js            # 캘린더 페이지
│   ├── grade.js               # 성적 조회 페이지
│   ├── profile.js             # 전체 메뉴 페이지
│   ├── feed.js                # 홈 피드 페이지
│   ├── timetableTab.js        # 시간표 페이지
│   ├── lecturePlan.js         # 강의계획서 페이지
│   ├── searchLecturePlan.js   # 강의계획서 검색 페이지
│   ├── lectureHome.js         # 강의 홈 페이지
│   ├── onlineLecture.js       # 온라인 강의 목록 페이지
│   ├── ranking.js             # 석차 페이지
│   ├── janghak.js             # 장학 조회 페이지
│   ├── agent.js               # KLAS AI 페이지
│   └── settings.js            # 설정 페이지
├── 📁 public/                 
└── 📁 styles/                 
```


## 네이티브 앱 브릿지 연동

WebView 페이지는 [`lib/core/klasNativeBridge.js`](lib/core/klasNativeBridge.js)의 `KlasNativeBridge`만 사용해 Android/iOS 네이티브 기능을 호출합니다. 페이지나 컴포넌트에서 `window.Android.*` 또는 `window.KlasNativeBridgeNative.postMessage()`를 직접 호출하지 않습니다.

```javascript
import KlasNativeBridge from '../lib/core/klasNativeBridge';

KlasNativeBridge.openPage('https://klas.kw.ac.kr');
KlasNativeBridge.openLectureActivity(subj, subjName);

// 반환값이 필요한 Bridge v1 호출은 Promise를 기다립니다.
const settingsJson = await KlasNativeBridge.getAppLockSettings();
```

메서드명, 인자 순서 및 Native→Web callback 이름은 기존 Android bridge 계약을 그대로 유지합니다. 별도의 기능별 helper는 제공하지 않으며 모든 호출은 `KlasNativeBridge.<method>(...args)` 형태로 작성합니다.

### Transport 선택과 호환성

`KlasNativeBridge`는 호출 시점마다 다음 순서로 transport를 선택합니다.

1. `window.KlasNativeBridgeNative`
   - Android/iOS 앱이 제공하는 Bridge
   - `postMessage()`로 JSON request envelope를 전송하고 `onmessage` 응답을 Promise와 연결
2. `window.Android`
   - 구 Android 앱 호환을 위한 legacy fallback
   - 동일한 메서드명과 인자 순서로 기존 JavaScript Interface 호출

Bridge v1 요청 형식은 다음과 같습니다.

```json
{
  "version": 1,
  "id": "web-request-id",
  "method": "openPage",
  "arguments": ["https://klas.kw.ac.kr"]
}
```

성공 및 실패 응답은 요청의 `id`로 연결됩니다.

```json
{
  "version": 1,
  "id": "web-request-id",
  "ok": true,
  "result": null
}
```

```json
{
  "version": 1,
  "id": "web-request-id",
  "ok": false,
  "error": { "code": "UNKNOWN_METHOD" }
}
```

- Bridge v1 응답 제한 시간은 15초입니다.
- 신규 transport가 없으면 legacy Android bridge를 사용합니다.
- Bridge v1이 `UNKNOWN_METHOD`를 반환하고 동일한 legacy 메서드가 있으면 해당 메서드로 한 번 fallback합니다.
- 일반 브라우저에는 네이티브 transport가 없으므로 호출 전 `KlasNativeBridge.isAvailable(methodName)`으로 확인하거나 UI 수준의 browser fallback을 구현합니다.

```javascript
if (KlasNativeBridge.isAvailable('openExternalLink')) {
  KlasNativeBridge.openExternalLink(url);
} else {
  window.open(url, '_blank');
}
```

### 다른 WebView 문서에서 호출

`evaluteKLASScript()`처럼 별도 공식 KLAS 페이지에서 실행되는 코드에는 이 모듈의 singleton이 존재하지 않습니다. 이 경우에만 `createInvocationScript()`로 독립 실행 가능한 호출 문자열을 생성합니다.

```javascript
KlasNativeBridge.evaluteKLASScript(`
  var link = getLinkFromKlasPage();
  ${KlasNativeBridge.createInvocationScript('openPage', ['link'])}
`);
```

`createInvocationScript()`의 두 번째 인자는 값이 아니라 대상 문서에서 평가되는 JavaScript 표현식입니다. 사용자 입력을 직접 넣지 말고 코드에 고정된 신뢰 가능한 표현식만 사용해야 합니다.

### Native→Web callback

Native에서 Web으로 데이터를 전달하는 기존 callback 이름은 변경하지 않습니다. 각 페이지는 필요한 callback을 `window`에 등록합니다.

### 공통
```javascript
window.receiveToken = function (receivedToken) {
   // 상태로 저장해 KLAS API 호출 시 사용
};
```

#### 피드 (`/feed`)
```javascript
window.receiveDeadlineData = function (json) {
   // 마감 데이터를 수신하여 처리하는 함수
};

window.receiveTimetableData = function (data) {
   // 시간표 데이터를 수신하여 처리하는 함수
};
```

#### 시간표 (`/timetableTab`)
```javascript
window.receiveTimetableData = function (data) {
   // 시간표 데이터를 수신하여 처리하는 함수
   // data: 시간표 데이터
};
```

#### 강의 홈 (`/lectureHome`)
```javascript
window.receivedData = function (token, subj, yearHakgi) {
   // 강의 홈 데이터를 수신하여 처리하는 함수
   // token: 세션 토큰
   // subj: 과목코드(예: U202456789Y000012)
   // yearHakgi: 학년도/학기(예: 2024,2)
};
```

#### 게시판 (`/boardList`, `/boardView`)
```javascript
window.receivedData = function (token, subj, yearHakgi, path) {
   // 게시판 데이터를 수신하여 처리하는 함수
   // token: 세션 토큰
   // subj: 과목코드
   // yearHakgi: 학년도/학기
   // path: 게시판 경로
};
```

#### KLAS AI (`/agent`)
```javascript
window.receiveSubjList = function (receivedSubjList) {
   // 과목 리스트 데이터를 수신하여 처리하는 함수
   // receivedSubjList: 수신된 과목 리스트
};
```

#### 설정 (`/settings`)
```javascript
window.receiveTheme = function (theme) {
   // 테마 데이터를 수신하여 처리하는 함수
   // theme: 수신된 테마(light | dark | system)
};

window.receiveYearHakgi = function (yearHakgi) {
   // 학년도 및 학기 데이터를 수신하여 처리하는 함수
};

window.receiveVersion = function (version) {
   // 버전 데이터를 수신하여 처리하는 함수
};
```

## 기여하기

1. 이 저장소를 포크합니다
2. 기능 브랜치를 생성합니다 (`git checkout -b feat/새기능`)
3. 변경사항을 커밋합니다 (`git commit -am '새 기능 추가'`)
4. 브랜치에 푸시합니다 (`git push origin feat/새기능`)
5. Pull Request를 생성합니다
