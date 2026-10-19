# 달의 위상 마스터 (Moon Phase Master) - 레트로 에디션

초·중등 과학 교육용 달의 위상 탐구 학습 인터랙티브 웹 게임입니다.  
레트로 아케이드 콘솔 테마 디자인과 Web Audio 8비트 사운드, 고정밀 픽셀 아트 달 지형이 적용되어 있습니다.

---

## 📌 주요 특징
1. **달의 8대 위상 학습**: 삭, 초승달, 상현달, 상현~망, 보름달(망), 망~하현, 하현달, 그믐달.
2. **3단계 단서 제공**: 위상 명칭, 공전 궤도 다이어그램(지구-달-햇빛 위치), 음력 날짜.
3. **인터랙티브 4분할 달 색칠**: 터치로 달의 영역을 색칠하여 직관적으로 정답 입력.
4. **온라인 실시간 랭킹 (Firebase Firestore)**: 학급 전체 학생들이 실시간으로 점수를 공유하고 랭킹을 겨룰 수 있는 시스템 (오프라인 시 기기 로컬 자동 전환).
5. **모바일 및 태블릿 세로 화면 최적화**: 터치 지연 방지(`touch-action: manipulation`), 세로 모드 안내 오버레이, PWA 지원.

---

## 🚀 GitHub 배포 가이드

### 방법 1: 단일 파일(Single File `index.html`)로 배포하기 (가장 간편한 방법)
학생들에게 파일 하나만 공유하거나, GitHub 저장소 루트에 `index.html` 단 하나만 올려 배포할 수 있습니다.

1. 단일 파일 빌드 실행:
   ```bash
   npm run build:single
   ```
2. 생성된 `dist/index.html` 파일은 HTML, CSS, JS, SVG 지형 패턴이 모두 하나의 파일 안에 인라인으로 포함된 완성본입니다.
3. 이 `dist/index.html`을 GitHub 저장소의 `main` 브랜치 루트에 업로드하고, **Settings > Pages > Branch: main / root**로 설정하면 즉시 무료 웹사이트로 서비스할 수 있습니다.

---

### 방법 2: Vite 프로젝트 전체를 GitHub Pages(Actions)로 자동 배포하기
1. 저장소의 `vite.config.ts`에 이미 `base: './'` 설정이 적용되어 있어 `https://<사용자이름>.github.io/<저장소이름>/` 하위 경로에서도 정적 에셋이 정상 로드됩니다.
2. 저장소 루트에 `.github/workflows/deploy.yml`을 추가하거나, `npm run build` 후 생성되는 `dist/` 폴더 내용을 `gh-pages` 브랜치에 푸시하면 됩니다.

---

## ☁️ Firebase Firestore 랭킹 시스템 설정 방법

학생들이 각자의 태블릿/스마트폰에서 게임을 한 뒤 점수를 학급 전체 랭킹판에 공유하려면 무료 Firebase 프로젝트를 연결할 수 있습니다.

### 1. Firebase 콘솔 설정
1. [Firebase Console](https://console.firebase.google.com/) 접속 후 새 프로젝트 생성.
2. **웹 앱(</>) 추가** 후 생성된 `firebaseConfig` 객체 복사.
3. **Firestore Database 만들기** 클릭 (위치: `asia-northeast3(서울)` 또는 기본값 권장).
4. **규칙(Rules)** 탭에서 학생들의 점수 읽기/쓰기를 허용하도록 다음 규칙 적용:
   ```text
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /scores/{docId} {
         allow read: if true;
         allow create: if request.resource.data.name is string
                      && request.resource.data.score is number;
       }
     }
   }
   ```

### 2. 프로젝트에 설정 적용하기
- **방법 A (환경 변수 사용 - 권장)**:  
  `.env.local` 또는 GitHub Repository Secrets에 다음 항목 입력:
  ```env
  VITE_FIREBASE_API_KEY="AIzaSy..."
  VITE_FIREBASE_AUTH_DOMAIN="your-app.firebaseapp.com"
  VITE_FIREBASE_PROJECT_ID="your-app"
  VITE_FIREBASE_STORAGE_BUCKET="your-app.appspot.com"
  VITE_FIREBASE_MESSAGING_SENDER_ID="123456789"
  VITE_FIREBASE_APP_ID="1:123456789:web:abcdef"
  ```
- **방법 B (코드에 직접 입력)**:  
  `src/services/firebase.ts` 파일 상단의 `DEFAULT_CONFIG` 객체에 복사한 Firebase 설정을 붙여넣습니다.

> 💡 **안전한 폴백(Fallback) 보장**:  
> Firebase 설정이 입력되지 않았거나, 학교 무선망 방화벽/오프라인 상태일 때는 게임이 멈추거나 에러를 발생시키지 않고 **자동으로 기기 로컬 저장소(localStorage)로 원활하게 전환**됩니다.

---

## 📱 모바일 및 터치 환경 권장 사항
- 태블릿(아이패드, 갤럭시 탭) 및 스마트폰 화면 세로(Portrait) 모드에 최적화되어 있습니다.
- 모든 조작 버튼 및 달 영역에 더블 탭 확대 방지(`touch-action: manipulation`) 및 빠른 반응을 위한 햅틱 피드백 진동(`navigator.vibrate`)이 내장되어 있습니다.
