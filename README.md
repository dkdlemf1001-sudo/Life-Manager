# LifeOS Manager - 개인 라이프 스타일 관리 대시보드

차량 관리, 투자(주식) 현황, 목표 달성 및 AI 비서를 포함한 개인 맞춤형 웹 애플리케이션입니다.

## 📱 주요 기능

### 1. 🚗 차량 관리 (Car Manager)
- **정비 상태 확인**: 엔진오일, 타이어, 브레이크 오일, 냉각수 등 주요 소모품의 교체 주기를 시각적으로 확인합니다.
- **정비 기록 로그**: 언제, 얼마의 비용으로 정비했는지 기록하고 히스토리를 관리합니다.
- **주행거리 연동**: 현재 주행거리를 입력하면 다음 정비 시기를 자동으로 계산합니다.

### 2. 📈 투자 관리 (Finance Manager)
- **자산 대시보드**: 보유 주식의 현재 가치와 수익률을 차트와 함께 확인합니다.
- **포트폴리오**: 자산 배분 현황을 파이 차트로 시각화합니다.

### 3. 🎯 목표 관리 (Goal Tracker)
- **올해의 목표**: 금융, 건강, 커리어 등 카테고리별 목표 진행률을 추적합니다.
- **시각적 동기부여**: 전체 달성률 게이지를 통해 성취감을 제공합니다.

### 4. 🤖 AI 비서 (AI Assistant)
- **Google Gemini 연동**: 차량 정비 팁, 투자 조언 등을 자연어로 질문할 수 있습니다.
- **문맥 인식**: "Life Manager" 페르소나를 가진 AI가 친절하게 답변합니다.

## 🛠 설치 및 실행 방법

### 요구 사항
- Node.js 18.0.0 이상
- npm 또는 yarn

### 로컬 실행
1. 리포지토리를 클론합니다.
   ```bash
   git clone https://github.com/your-username/lifeos-manager.git
   cd lifeos-manager
   ```

2. 패키지를 설치합니다.
   ```bash
   npm install
   ```

3. 개발 서버를 실행합니다.
   ```bash
   npm run dev
   ```

### 환경 변수 설정 (AI 기능 사용 시)
프로젝트 루트에 `.env` 파일을 생성하고 Google Gemini API 키를 입력하세요.
```
REACT_APP_GEMINI_API_KEY=your_api_key_here
```

## 🚀 배포 방법 (GitHub Pages)

이 프로젝트는 정적 웹사이트로 쉽게 배포할 수 있습니다.

1. `package.json`에 `homepage` 필드를 추가합니다.
   ```json
   "homepage": "https://yourusername.github.io/lifeos-manager"
   ```

2. 배포 스크립트를 실행합니다.
   ```bash
   npm run deploy
   ```

## 📂 프로젝트 구조
```
lifeos-manager/
├── src/
│   ├── components/    # 기능별 컴포넌트 (Car, Finance, Goal, AI 등)
│   ├── App.tsx        # 메인 레이아웃 및 라우팅
│   ├── constants.ts   # 초기 데이터 및 설정값
│   └── types.ts       # TypeScript 타입 정의
├── public/            # 정적 파일
└── README.md
```

## 📄 라이선스
MIT License
