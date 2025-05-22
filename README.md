# **Checkit - 실시간 협업 개발 플랫폼**

> ### **Checkit**은 기획서 작성부터 코드 생성, Git 연동, 배포까지 **모든 개발 과정을 자동화**하는 오픈소스 기반의 실시간 협업 개발 플랫폼입니다.<br><br>팀원 간 실시간 협업이 가능하며, 문서와 코드의 불일치를 방지하여 **생산성과 일관성을 극대화**합니다.

<br>

## 🧩 주요 기능

| 기능 | 설명 |
|------|------|
| 📝  실시간 명세 작성 | WebSocket 기반 협업 에디터를 통한 ERD / API / 기능명세 작성 |
| 💻 Spring Boot 코드 자동 생성 | 명세서를 기반으로 DTO, Entity, Controller, Service, Repository 생성 |
| 📁  Spring Boot 프로젝트 다운로드 | 설정한 Spring 환경에 맞춰 자동 생성된 코드를 포함한 프로젝트를 zip으로 제공합니다 |
| 🪄 프로젝트 AI 편집기 | PULL 받은 프로젝트를 코드를 편집 및 git push 제공 / 코드 편집 시 AI를 통한 코드 추천 기능 |
| 💬 AI 문서 챗봇 지원 | 명세서 기반 문서 작성 중 궁금한 점을 실시간으로 물어볼 수 있는 Gemma 기반 챗봇 기능 제공 |
| 🔥 Git 자동 연동 | GitHub / GitLab 저장소 생성, .gitignore, 커밋 메시지 컨벤션 자동화 |
| 💎 AI 기반 문서 생성 | Gemma 기반 AI로 README.md, 시퀀스 다이어그램 자동 생성 |
| 🌐 배포 환경 구성 자동화 | DB 선택 기반 `docker-compose.yml` 자동 생성 및 zip 다운로드 제공 |
| 🌓 다크모드 지원 | 사용자의 설정에 따라 라이트/다크 테마 전환 가능 |

<br>

## 🛠 기술 스택

| 💻 Frontend | ⚙️ Backend | 🤖 AI 서버 | 🗄️ DB | 🚀 CI/CD | 🧑‍💻 IDE | 🧰 Tool |
| --- | --- | --- | --- | --- | --- | --- |
| HTML5, CSS3, JavaScript, TypeScript 5.7.2 | Java 17 | Python 3.10 | MySQL 8.0.29 | AWS EC2 | IntelliJ IDEA | Git |
| React 19.0.0 + React DOM 19.0.0 | Spring Boot 3.4.5 | FastAPI 0.110.0 | Redis (캐시/세션 관리) | Docker | VSCode | Jira |
| TailwindCSS 3.4.1 | Spring Data JPA 2.0 | SQLAlchemy 2.0.29 |  | Jenkins |  | Notion |
| Vite 6.3.1 | Spring WebFlux (Reactive) | transformers 4.51.3 |  | NGINX |  | Google Spreadsheets |
| Zustand 5.0.4 (전역 상태 관리) | Spring WebSocket, Security, OAuth2 | **vLLM 0.8.5.post1** |  | SSL |  | Mattermost |
| Axios 1.9.0 | Redis Starter, Mail Sender, Validation | **Gemma 2B (google/gemma-2b-it)** |  |  |  |  |
| React Router DOM 7.5.1 | JJWT, JGit, Zip4j | openai 0.28.0, tiktoken 0.5.1 |  |  |  |  |
| ESLint 9.25.1 + Prettier 3.5.3 |  |  |  |  |  |  |
| React Toastify 11.0.5 |  |  |  |  |  |  |
| @monaco-editor/react 4.7.0 (코드 에디터) |  |  |  |  |  |  |
| @dineug/erd-editor 3.2.7 (ERD 작성기) |  |  |  |  |  |  |

<br>

## 📡 EC2 포트 정리

| PORT | 이름 |
|------|------|
| 443 | HTTPS |
| 80 | HTTP, Nginx |
| 3306 | MySQL |
| 8080 | Jenkins |
| 8000 | vLLM (Gemma) |
| 8001 | FastAPI API Server|


<br>

## 🧱 시스템 아키텍처
![alt text](<checkit (4) (1)-1.jpg>)
```
[👤 사용자] ── 웹 클라이언트 (React, Zustand, WebSocket)
        │
        ▼
[📦 Nginx (Docker)]
        │  └─ 정적 자원 및 API Reverse Proxy
        ▼
[🚀 Spring Boot API 서버 (Docker)]
   ├─ 명세 관리 (ERD / API / 기능)
   ├─ 코드 생성기 (Entity / DTO / Controller / Service 등)
   ├─ Git 연동 (GitHub / GitLab)
   ├─ 프로젝트 패키징 (start.spring.io 기반 zip, Docker 포함)
   └─ AI 서버 연동 (README / 시퀀스 다이어그램 자동 생성)

[🧠 FastAPI AI 서버 (별도 EC2 + Docker)]
   ├─ 문서 자동화 (Gemma 기반 LLM)
   └─ Prompt 기반 README / 시퀀스 생성

[🗃️ 인프라]
   ├─ MySQL (Docker)        # 프로젝트 및 명세 DB 저장
   ├─ Redis (Docker)        # 세션/캐시 관리
   └─ S3 + CloudFront       # 생성 zip 파일 및 리소스 정적 파일 저장

[🔄 CI/CD]
   └─ Jenkins (Docker)
       └─ GitLab Webhook 기반 자동 빌드 및 배포

```

<br>

## 📁 프로젝트 구조

```
📦 frontend/                  
 ┣ 📂 api                     (서버 통신 API 호출 함수)
 ┣ 📂 assets                  (이미지, 폰트, 아이콘 등 정적 요소)
 ┣ 📂 components              (공통 UI 컴포넌트)
 ┣ 📂 constants               (API 경로, 에러 메시지 상수 값 모음) 
 ┣ 📂 hooks                   (커스텀 훅(Custom Hooks) 요소)
 ┣ 📂 molecules               (컴포넌트 조합 단위)
 ┣ 📂 pages                   (라우트 대응 페이지)
 ┣ 📂 router                  (라우팅 설정 파일)
 ┣ 📂 stores                  (전역 상태 관리)
 ┣ 📂 types                   (TypeScript 타입 정의)
 ┣ 📂 utils                   (유틸 함수 모음)
 ┣ 📜 App.css               
 ┣ 📜 App.tsx                 
 ┣ 📜 index.css               
 ┣ 📜 main.tsx              
 ┣ 📜 types.ts                
 ┗ 📜 vite-env.d.ts          

📦 backend/
┣ 📂 api                      (API 명세 관련)
 ┣ 📂 auth                    (인증 및 로그인)
 ┣ 📂 codegenerator           (자동 코드 생성기)
 ┣ 📂 erd                     (ERD 실시간 협업 기능)
 ┣ 📂 functional              (기능 명세 관리)
 ┣ 📂 git                     (Git 저장소 연동)
 ┣ 📂 global                  (전역 공통 설정 및 예외 처리)
 ┣ 📂 project                 (프로젝트 도메인)
 ┣ 📂 projectbuilder          (초기 Spring 프로젝트 빌더)
 ┣ 📂 readme                  (README 자동 생성 API)
 ┣ 📂 sequencediagram         (시퀀스 다이어그램 생성 API)
 ┣ 📂 socket                  (WebSocket 관련)
 ┣ 📂 springsettings          (Spring 설정 저장 및 처리)
 ┣ 📂 suggest                 (코드 추천 기능)
 ┗ 📂 user                    (사용자 정보 관리)

📦 ai-server/
 ┣ 📂 config/                 (설정 모듈 (로깅, 모델 매핑, 환경 변수 관리))
 ┣ 📂 db/                     (DB 연동 설정)
 ┣ 📂 llm/                    (LLM 추상화 및 모델 구현체)
 ┣ 📂 models/                 (SQLAlchemy ORM Entity 정의)
 ┣ 📂 prompts/                (프롬프트 템플릿 정의)
 ┣ 📂 routers/                (FastAPI 라우터 등록 (Controller))
 ┣ 📂 schemas/                (Pydantic 기반 Request/Response DTO)
 ┣ 📂 services/               (비즈니스 로직 레이어)
 ┣ 📂 utils/                  (보조 유틸 함수 및 상수 관리)
 ┣ 📜 .dockerignore           (도커 빌드 제외 파일 목록)
 ┣ 📜 .env                    (환경 변수 설정 파일)
 ┣ 📜 .gitignore              (Git 제외 파일 목록)
 ┣ 📜 docker-compose.yml      (전체 서비스(Docker) 구성 파일)
 ┣ 📜 Dockerfile              (FastAPI 앱 Docker 빌드 설정)
 ┣ 📜 main.py                 (FastAPI 앱 진입점 (서버 실행))
 ┗ 📜 requirements.txt        (Python 패키지 목록)

```

<br>

## 💻 사용 방법

### 1. **GitHub 또는 GitLab로 로그인**  
    OAuth를 통해 GitHub 또는 GitLab 계정으로 간편하게 로그인합니다.

### 2. **프로젝트 생성**  
    협업할 프로젝트를 생성하고 기본 정보를 설정합니다.

### 3. **팀원 초대 및 수락**  
    팀원을 프로젝트에 초대하고, 초대된 팀원이 수락하면 협업이 시작됩니다.

### 4. **Jira 연동 설정**  
    기능 명세서를 Jira 이슈와 연동하여 이슈 기반 개발 흐름을 구성합니다.

### 5. **명세서 작성**  
    실시간 협업 에디터에서 ERD, API, 기능 명세서를 작성합니다.  
   

### 6. **Spring 환경 설정**  
    사용할 Java 버전, 빌드 툴, 의존성 모듈 등을 설정합니다.

### 7. **코드 자동 생성**  
    작성한 명세서와 설정을 기반으로 Entity, DTO, Controller, Service, Repository 등 Spring Boot 코드를 자동으로 생성합니다.

### 8. **Git 연동 및 AI 문서 생성**  
    Git 저장소를 자동 생성하고 코드를 Push합니다.  
    동시에 README.md와 시퀀스 다이어그램을 AI가 자동으로 생성합니다.

### 9. **프로젝트 다운로드**  
    설정된 환경에 맞춰 `docker-compose.yml`과 함께 전체 프로젝트를 zip 파일로 다운로드할 수 있습니다.

### 10. **Git Push 및 Pull 작업**  
    자동 생성된 코드를 팀원과 공유하기 위해 Git 저장소에 Push 및 Pull 작업을 수행합니다.


<br>

## 👨‍👩‍👧‍👦 팀 소개

| 이름   | 주요 역할 |
|--------|-----------|
| **조승근** | 🔧 **DevOps & Backend** <br>– 실시간 명세 편집(ERD, API, 기능 명세서) <br>– WebSocket 기반 실시간 반영 <br>– 서버 인프라 구성(Nginx, Docker, Jenkins, GPU 연동) <br>– S3/CloudFront 배포 및 모니터링 도구 설정 |
| **임태훈** | 🔐 **Backend - Git & API 개발** <br>– 회원/프로젝트/초대 기능 API <br>– Git 설정 자동화(.gitignore, 브랜치 전략 등) <br>– 공통 응답 포맷 통일 <br>– README 및 시퀀스 다이어그램 API <br>– GitHub/GitLab/Jira 연동 <br>– 코드 제안 기능 |
| **송우석** | 💻 **Backend - 자동 코드 생성기** <br>– Spring 설정 기반 프로젝트 구조 생성 <br>– Entity, DTO, Controller, Service, Repository 코드 자동 생성 <br>– 프로젝트 zip 압축 및 반환 API |
| **이지은** | 🎨 **Frontend - UI 및 화면 개발 총괄** <br>– 공통 컴포넌트(버튼, 입력창, 모달 등) 개발 <br>– 전역 라우팅/레이아웃/상태관리 설계 <br>– USER, API, ERD, PROJECT 등 화면 개발 |
| **이화정** | 🧩 **Frontend - API 연동 및 화면 연결** <br>– 각 명세서 및 Git, Build, AI API 연결 <br>– SpringSetting / Build 화면 개발 <br>– 전역 로딩 처리 및 상태 관리 |
| **김강민** | 🧠 **AI - 문서 자동 생성 & 챗봇** <br>– 기능 명세서 기반 README 및 시퀀스 다이어그램 자동 생성 <br>– Prompt 설계 및 입력/출력 구조 설정 <br>– AI API 문서화 및 Swagger 정리 <br>– 향후 RAG 기반 확장 고려 |



<br>


## 📜 라이선스

### MIT License
> Checkit 프로젝트는 [MIT License](https://opensource.org/licenses/MIT)를 따릅니다.
```
MIT License

Copyright (c) 2025 checkit

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
