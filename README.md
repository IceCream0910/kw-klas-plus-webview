
# KLAS+ WebView 페이지

안드로이드 앱: [icecream0910/kw-klas-plus](https://github.com/icecream0910/kw-klas-plus)


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

   # OPENAI API키(KLAS AI)
   NEXT_PUBLIC_OPENAI_API_KEY=your_openai_api_key
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
│   ├── 📁 core/               # API 호출, 데이터 저장 등 핵심 로직
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


## 안드로이드 앱 연동

WebView 페이지들은 안드로이드 네이티브 앱과 JavaScript Interface를 통해 데이터를 주고받습니다.

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