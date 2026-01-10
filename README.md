# Mini Postman Clone 개발 계획서

## 1. 프로젝트 개요

**Mini Postman Clone** 은 Spring 기반 **Proxy API 서버** 와 Next.js 기반 **클라이언트 UI** 로 구성된 API 테스팅 도구이다.

### 핵심 목표
- 브라우저 CORS 제약을 우회하여 외부 API 테스트 지원
- API Key, Token 을 클라이언트에 노출하지 않고 안전하게 관리
- 요청 실행, 응답 시각화, 히스토리 저장을 통해 Postman 유사 워크플로 제공
- 운영 관점의 기본 안전장치(SSRF 방지, 타임아웃, 크기 제한, 로깅) 내장

---

## 2. 기술 스택

### Backend
- Java 21
- Spring Boot 3.2+ (Spring MVC 기반으로 시작 후 Boot 로 통합)
- HTTP Client 선택
  - 기본: WebClient
  - 옵션: Virtual Threads 적용은 서버 전체 동시성 설계와 맞물릴 때 단계적으로 도입
- Spring Data JPA
- Spring Security (MVP 이후 단계 도입)
- Bean Validation
- Actuator

### Frontend
- Next.js 14 (App Router)
- TypeScript
- Zustand
- Tailwind CSS
- JSON Viewer 라이브러리(React JSON View 또는 대체)
- Resizable Panels

### Infrastructure
- Docker, Docker Compose
- PostgreSQL
- Redis (Rate Limiting, 캐시)
- Nginx (리버스 프록시)

---

## 3. 시스템 아키텍처

### 구성
`Client UI (Next.js)` → `Proxy Server (Spring Boot)` → `Target API (외부 서버)`

### Proxy Server 공통 정책 적용
- SSRF 방지
- 헤더 필터링
- 타임아웃 제어
- 응답 크기 제한
- 로깅 및 추적(Trace ID)

---

## 4. 기능 범위 정의

### 4.1 MVP 범위(Phase 0, 2 주)

MVP 목표는 **엔드투엔드 동작** 이다.  
즉, UI 에서 요청을 구성하고 프록시를 통해 실행한 뒤 응답이 화면에 정상 표시되어야 한다.

#### MVP 기능

**Proxy 실행 API**
- 메서드: GET, POST, PUT, DELETE
- 프로토콜: http, https 만 허용
- Query Params 다중 키 값 지원
- Headers 입력 지원(단, 금지 헤더는 서버에서 제거)
- Body: Raw 텍스트(JSON, XML, Text)

**기본 안전장치**
- 기본 타임아웃(서버 기본값 + 사용자 입력은 상한 제한)
- 최대 응답 크기 제한
- 기본 SSRF 차단
  - localhost, loopback, 사설망 대역
  - 클라우드 메타데이터 IP 차단(예: 169.254.169.254)
  - 포트 제한(기본 80, 443 위주, 확장은 이후)

**프론트 최소 UI**
- Method 선택, URL 입력, Headers, Body, Send 버튼
- Response Viewer: status, headers, body, elapsedMs

#### MVP 에서 제외(의도적으로 미포함)
- 회원가입, 로그인, Workspace, Collection, Environment
- Redis 기반 Rate Limiting
- cURL import/export, OpenAPI import
- WebSocket, GraphQL

---

## 5. 보안 및 운영 정책

### 5.1 SSRF 방지 정책(강화 로드맵 포함)

#### A. MVP 차단 기준
- URL 스킴: http, https 만 허용
- IP 직접 입력 또는 DNS 리졸브 결과가 다음에 해당하면 차단
  - loopback, private network, link-local
  - IPv6 localhost 및 로컬 범위
  - 클라우드 메타데이터 IP
- 포트 제한: 기본 80, 443 만 허용(또는 지정 allowlist)
- Host 헤더는 클라이언트가 임의로 바꾸지 못하게 서버가 통제

#### B. 강화 기준
- 리다이렉트(3xx) 허용 시 최종 목적지에 대해 재검증
- DNS Rebinding 대응
  - 최초 리졸브 결과와 실제 연결 대상이 바뀌는 패턴 탐지
- 도메인 allowlist 모드(옵션)
  - 운영 배포 시 허용된 도메인만 호출 모드 제공

---

### 5.2 헤더 필터링 정책

#### 자동 제거(서버가 통제)
- Host, Content-Length, Transfer-Encoding, Connection, Keep-Alive
- Proxy-Authorization, Proxy-Connection 등 프록시 관련 헤더

#### 서버 재작성 또는 추가
- User-Agent: 프록시 식별자 포함
- Trace ID 전파: X-Request-ID 지원(없으면 서버 생성)

#### 검증
- Content-Type 과 실제 Body 형태 불일치 시 에러 처리(가능 범위 내)

---

### 5.3 타임아웃 정책
- 서버 기본값 제공
- 사용자 입력 timeoutMs 는 범위 제한
  - minAllowedMs, maxAllowedMs 사이로 강제 clamp

---

### 5.4 크기 제한 정책
- 요청 최대 크기 제한
- 응답 최대 크기 제한

**응답 처리 방식 원칙**
- 스트리밍으로 읽되 제한 초과 시 즉시 중단
- 초과분은 버리고 `truncated: true` 같은 메타데이터 반환(Phase 1 에서 정교화)

---

### 5.5 로깅 및 추적
- Trace ID 발급 및 전파
- 구조화 로깅(JSON 로그 권장)

**민감정보 마스킹 기본 규칙**
- Authorization, Cookie, Set-Cookie, X-Api-Key 계열 기본 마스킹
- Body 는 JSON 일 때 특정 키(token, password 등) 마스킹 옵션(Phase 2 이후)

---

## 6. API 설계

### 6.1 Proxy 실행 API
- `POST /api/v1/proxy/execute`

#### 요청
- method, url, queryParams, headers, body, timeoutMs

#### 응답 표준 포맷
- success, traceId, data(status, headers, body, size, elapsedMs, truncated), timestamp

#### 에러 표준 포맷
- success=false, traceId, error(code, message, details), timestamp

---

## 7. 데이터 모델링(JPA)

### 원칙
- MVP 에서는 저장 기능을 히스토리 최소로 제한하거나 저장 없이도 동작 가능하게 설계
- 저장 기능은 Phase 2 에서 본격 도입

### Phase 2 이후 추천 엔티티
- User
- Workspace
- Collection
- Request
- History
- Environment

### 초기 우선순위
- History 부터 저장(사용자 경험 상승)
- 그 다음 Request 저장(컬렉션 구조화)

---

## 8. 프론트엔드 아키텍처

### MVP 프론트 목표
- 요청 편집 상태와 응답 상태가 명확히 분리
- 실행 중 로딩, 실패 메시지, 응답 렌더링까지 끊김 없이 동작

### Zustand 상태
- RequestStore: method, url, queryParams, headers, body, timeout
- ResponseStore: currentResponse, isLoading, error, executionTime
- HistoryStore: 2단계 이후 도입

### UI 구성(최소)
- Sidebar(옵션, MVP 에서는 없어도 됨)
- RequestBuilder(UrlBar, HeadersEditor, BodyEditor)
- ResponseViewer(Status, Headers, Body Pretty View)

---

## 9. 개발 로드맵(현실 버전)

###  - 1단계: MVP(2 주)
#### 목표
- UI → Proxy → Target API → UI 응답 표시, 엔드투엔드 완성

#### 포함
- Proxy execute API (GET, POST, PUT, DELETE)
- http, https 제한
- 타임아웃 clamp
- 응답 크기 제한(간단 버전)
- 기본 SSRF 차단(사설망, loopback, 메타데이터 IP)
- 최소 UI(Request Builder + Response Viewer)

#### 완료 기준 체크리스트
- URL 이 http 또는 https 가 아니면 차단된다
- localhost 또는 사설망 목적지로 요청 시 SSRF_BLOCKED 로 떨어진다
- 응답이 JSON 인 경우 보기 좋게 렌더링된다
- timeoutMs 를 과도하게 주면 서버 상한으로 제한된다
- 응답이 제한 크기를 넘으면 truncated 표시로 반환된다
- traceId 가 항상 응답에 포함된다

---

###  - 2단계 : Proxy 안전장치 고도화(3 주)
#### 포함
- SSRF 강화
  - DNS 리졸브 기반 차단 고도화
  - 리다이렉트 최종 목적지 재검증
  - IPv6 로컬 범위 보강
  - WebClient 설정 고도화(풀, 타임아웃, max-in-memory-size)
  - 응답 처리 고도화
  - 제한 초과 시 즉시 중단, 성능 좋은 누적 방식으로 정리
  - 요청 및 응답 헤더 필터링 강화

#### 완료 기준 체크리스트
- 리다이렉트로 내부망 우회 시도도 차단된다
- 응답이 커질수록 메모리 사용이 폭증하지 않는다
- 금지 헤더는 서버에서 제거된다
- traceId 가 요청 헤더로 전달될 수 있다

---

####  - 3단계 : 데이터 영속성(2 주)
#### 포함
- JPA 엔티티 및 저장
  - History 저장
  - Request 저장(이름, URL, 메서드, 헤더, 바디)
  - History 조회 API
  - 기간, 상태코드, URL 키워드 필터

#### 완료 기준 체크리스트
- 실행한 요청이 히스토리에 저장된다
- 특정 기간 히스토리를 조회할 수 있다
- 저장된 Request 를 불러와 다시 실행할 수 있다

---

###  - 4단계 : 인증 및 사용자별 정책(2 주)
#### 포함
- Spring Security 로그인(간단한 형태로 시작)
- 사용자별 Rate Limiting( Redis )
- 사용자별 데이터 격리

#### 완료 기준 체크리스트
- 로그인 사용자만 히스토리 접근 가능
- 사용자별 호출 제한이 정상 작동
- 다른 사용자 데이터는 조회 불가

---

###  - 5단계 : 프론트 고도화(4 주)
#### 포함
- Sidebar, Collection, Saved Requests UI
- JSON Viewer 개선, 편집기 UX 개선
- 상태 관리 정리, 에러 UX 강화

#### 완료 기준 체크리스트
- 저장된 Request, Collection 을 UI 에서 관리 가능
- Response Viewer 가 큰 JSON 을 안정적으로 표시
- 실패 원인이 UI 에 명확히 뜬다

---

###  - 6단계 : 운영 준비(2 주)
#### 포함
- Docker Compose (API, DB, Redis, Nginx)
- Actuator, Metrics, Prometheus 노출
- Swagger 문서화
- 에러 모니터링 연동 옵션

#### 완료 기준 체크리스트
- 로컬에서 docker compose up 만으로 전체 실행
- health, metrics 확인 가능
- API 문서가 자동 생성된다

---

###  - 7단계 : 확장 기능(옵션, 3 주 이상)
- cURL import/export
- OpenAPI import
- 테스트 자동화(컬렉션 러너)
- WebSocket, GraphQL 지원

완료 기준은 기능별 별도 정의(필요 시 추가)

---

## 10. 성능 목표(단계 분리)

### MVP 목표(현실 기준)
- 단일 인스턴스, 안정적 기능 동작
- 제한 크기 및 타임아웃 정책이 정상 적용
- 에러 케이스에서 서버가 무너지지 않음

### 최종 목표(운영 확장 기준)
- RPS 100 수준(캐시, 풀 튜닝, 수평 확장 고려)
- 평균 응답 오버헤드 목표는 프록시 정책 적용 포함을 전제로 재측정
- 가용성 99.9 는 배포 구조(Nginx, 헬스체크, 재시작 정책) 포함 시점에만 명시

---

## 11. 라이선스
- 개인 프로젝트로 시작
