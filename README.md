
# KLAS+ WebView 페이지

안드로이드 앱: [icecream0910/kw-klas-plus](https://github.com/icecream0910/kw-klas-plus)

## 📁 프로젝트 구조

```
kw-klas-plus-webview/
├── 📁 lib/                    # 유틸리티 및 비즈니스 로직
│   ├── 📁 core/               # 핵심 기능 (API, 상수, 스토리지)
│   ├── 📁 calendar/           # 캘린더 관련 유틸리티
│   ├── 📁 grade/              # 성적 관련 로직
│   ├── 📁 lecture/            # 강의 관련 기능
│   ├── 📁 timetable/          # 시간표 처리
│   ├── 📁 scholarship/        # 장학금 관련
│   ├── 📁 profile/            # 프로필 및 설정
│   └── 📁 ui/                 # UI 유틸리티
├── 📁 components/             # React 컴포넌트
│   ├── 📁 common/             # 공통 컴포넌트
│   ├── 📁 calendar/           # 캘린더 컴포넌트
│   ├── 📁 grade/              # 성적 관련 컴포넌트
│   ├── 📁 lecture/            # 강의 관련 컴포넌트
│   ├── 📁 timetable/          # 시간표 컴포넌트
│   ├── 📁 board/              # 게시판 컴포넌트
│   ├── 📁 scholarship/        # 장학금 컴포넌트
│   └── 📁 profile/            # 프로필 컴포넌트
├── 📁 pages/                  # Next.js 페이지
│   ├── 📁 api/                # API 라우트
│   ├── 📁 modal/              # 모달 페이지
│   ├── calendar.js            # 캘린더 페이지
│   ├── grade.js               # 성적 조회
│   ├── profile.js             # 메인 대시보드
│   ├── timetableTab.js        # 시간표
│   ├── lecturePlan.js         # 강의계획서
│   ├── onlineLecture.js       # 온라인 강의
│   ├── ranking.js             # 성적 순위
│   ├── janghak.js             # 장학금
│   ├── ai.js                  # AI 챗봇
│   └── settings.js            # 설정
├── 📁 public/                 # 정적 파일
└── 📁 styles/                 # 스타일 파일
```

## 🚀 시작하기

### 필수 요구사항
- Node.js 18.0.0 이상
- npm 또는 yarn 패키지 매니저

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
   NEXT_PUBLIC_API_URL=https://klas.kw.ac.kr
   OPENAI_API_KEY=your_openai_api_key
   SENTRY_DSN=your_sentry_dsn
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

## 🤝 기여하기

1. 이 저장소를 포크합니다
2. 기능 브랜치를 생성합니다 (`git checkout -b feat/새기능`)
3. 변경사항을 커밋합니다 (`git commit -am '새 기능 추가'`)
4. 브랜치에 푸시합니다 (`git push origin feat/새기능`)
5. Pull Request를 생성합니다