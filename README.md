# Mini Postman Clone 개발 계획서 (수정안 v3)

## 1. 프로젝트 개요

**Mini Postman Clone**은 Spring 기반 Proxy API 서버와 Next.js 기반 클라이언트 UI로 구성된 API 테스팅 도구입니다.

### 🎯 핵심 목표
- **CORS 해결:** 브라우저 CORS 제약을 우회하여 외부 API 테스트 지원
- **보안:** API Key, Token을 클라이언트에 노출하지 않고 안전하게 관리
- **워크플로:** 요청 실행, 응답 시각화, 히스토리 저장을 통해 Postman 유사 경험 제공
- **안전장치:** 운영 관점의 기본 안전장치(SSRF 방지, 타임아웃, 크기 제한, 로깅) 내장

---

## 2. 기술 스택

### Backend
- **Core:** Java 21 (최신 LTS), Spring Boot 3.2+
- **Network:** WebClient (Non-blocking I/O)
- **Concurrency:** Virtual Threads (고도화 단계 도입 검토)
- **Data:** Spring Data JPA
- **Security:** Spring Security (MVP 이후 도입)
- **Utils:** Bean Validation, Actuator

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **State:** Zustand
- **Style:** Tailwind CSS
- **UI:** Resizable Panels, JSON Viewer

### Infrastructure
- **Container:** Docker, Docker Compose
- **DB:** PostgreSQL, Redis (Rate Limiting)
- **Proxy:** Nginx

---

## 3. 시스템 아키텍처

```mermaid
graph LR
    %% 1. 메인 흐름
    Client[Client UI (Next.js)] --> ProxyServer[Proxy Server (Spring Boot)]
    ProxyServer --> Target[Target API (External)]

    %% 2. 정책 그룹 (ID를 'PolicyGroup'으로 변경하여 충돌 방지)
    subgraph PolicyGroup [Proxy Policies]
        direction TB
        P1[SSRF 방지]
        P2[헤더 필터링]
        P3[타임아웃 제어]
        P4[크기 제한]
        P5[로깅/TraceID]
    end
    
    %% (선택사항) 박스와 서버를 점선으로 연결하고 싶다면 아래 주석 제거
    %% PolicyGroup -.-> ProxyServer
```

---

## 4. 기능 범위 정의

### 4.1 MVP 범위 (1단계, 2주)
MVP 목표는 **엔드투엔드 동작(UI → Proxy → Target API → UI 응답)** 완성입니다.

#### ✅ MVP 기능

**Proxy 실행 API**
- `GET`, `POST`, `PUT`, `DELETE` 지원
- `http`, `https` 프로토콜만 허용
- Query Params 다중 키 값 지원
- Headers 입력 지원 (금지 헤더 자동 제거)
- Body: Raw 텍스트 (JSON, XML, Text)

**기본 안전장치**
- **타임아웃:** 서버 기본값 + 사용자 입력 상한 제한
- **크기 제한:** 응답 Max 10MB / 요청 Max 5MB
- **SSRF 차단:**
  - localhost, loopback, 사설망 대역 차단
  - 클라우드 메타데이터 IP(169.254.169.254) 차단
  - 포트 제한 (80, 443 위주)
- **리다이렉트:** MVP에서는 비활성화 (추후 고도화)

**프론트 최소 UI**
- **Request:** Method, URL, Headers, Body, Send 버튼
- **Response:** Status, Headers, Body, Elapsed Time, Truncated 여부

#### ❌ MVP 제외 항목
- 회원가입/로그인, Workspace
- Redis Rate Limiting
- cURL/OpenAPI Import
- WebSocket, GraphQL

---

## 5. 보안 및 운영 정책

### 5.1 SSRF 방지 정책

#### A. MVP 차단 기준 (1단계)
- URL 스킴(`http`, `https`) 및 포트(`80`, `443`) 제한
- DNS 리졸브 결과의 모든 IP 검사 (내부망 접근 차단)
- Host 헤더 변조 방지

```java
@Component
public class SSRFValidator {

    private static final List<CIDR> BLOCKED_NETWORKS = Arrays.asList(
        new CIDR("127.0.0.0/8"),      // IPv4 loopback
        new CIDR("10.0.0.0/8"),       // Private network
        new CIDR("172.16.0.0/12"),    // Private network
        new CIDR("192.168.0.0/16"),   // Private network
        new CIDR("169.254.0.0/16"),   // Link-local
        new CIDR("::1/128"),          // IPv6 localhost
        new CIDR("fc00::/7")          // IPv6 unique local
    );

    private static final Set<Integer> ALLOWED_PORTS = Set.of(80, 443);
    private static final Set<String> BLOCKED_HOSTS = Set.of("metadata.google.internal");

    public ValidationResult validate(URI uri) {
        // Scheme 검증
        if (!Set.of("http", "https").contains(uri.getScheme().toLowerCase())) {
            return ValidationResult.blocked("INVALID_SCHEME");
        }

        // Port 검증
        if (uri.getPort() != -1 && !ALLOWED_PORTS.contains(uri.getPort())) {
            return ValidationResult.blocked("RESTRICTED_PORT");
        }

        // Host 및 IP 검증 (DNS Resolve)
        try {
            InetAddress[] addresses = InetAddress.getAllByName(uri.getHost());
            for (InetAddress address : addresses) {
                for (CIDR cidr : BLOCKED_NETWORKS) {
                    if (cidr.contains(address)) return ValidationResult.blocked("PRIVATE_NETWORK");
                }
            }
            return ValidationResult.allowed();
        } catch (UnknownHostException e) {
            return ValidationResult.blocked("UNRESOLVABLE_HOST");
        }
    }
}
```

#### B. 강화 기준 (2단계)
- 리다이렉트 최종 목적지 재검증
- DNS Rebinding 대응

### 5.2 헤더 필터링 정책

#### A. 요청 전달용 헤더 필터
```java
@Component
public class HeaderFilter {
    private static final Set<String> REMOVED_HEADERS = Set.of(
        "host", "content-length", "transfer-encoding", "connection", 
        "proxy-authorization", "upgrade"
    );

    public HttpHeaders filterForForwarding(HttpHeaders incoming) {
        HttpHeaders out = new HttpHeaders();
        incoming.forEach((key, values) -> {
            if (!REMOVED_HEADERS.contains(key.toLowerCase())) {
                out.addAll(key, values);
            }
        });
        out.set("User-Agent", "MiniPostmanProxy/1.0");
        return out;
    }
}
```

#### B. 로깅용 헤더 마스킹
```java
@Component
public class HeaderMasker {
    private static final Set<String> SENSITIVE = Set.of("authorization", "cookie", "x-api-key");

    public Map<String, Object> maskForLog(HttpHeaders headers) {
        Map<String, Object> masked = new HashMap<>();
        headers.forEach((key, values) -> {
            masked.put(key, SENSITIVE.contains(key.toLowerCase()) ? "***MASKED***" : values);
        });
        return masked;
    }
}
```

### 5.3 타임아웃 및 크기 제한

```yaml
proxy:
  timeout:
    default-ms: 30000       # 30초
    max-allowed-ms: 120000  # 2분
  limits:
    max-request-size: 5242880    # 5 MB
    max-response-size: 10485760  # 10 MB
```

**스트리밍 응답 처리 (Size Limit 적용)**
```java
public Mono<ResponseData> readWithLimit(ClientResponse response) {
    return response.bodyToFlux(DataBuffer.class)
        .takeWhile(buffer -> totalSize.get() + buffer.readableByteCount() <= maxResponseSize)
        .collectList()
        .map(this::createResponseData); // 초과 시 truncated: true 설정
}
```

---

## 6. API 설계

### 6.1 Proxy 실행 API
- **Endpoint:** `POST /api/v1/proxy/execute`

**Request Example**
```json
{
  "method": "GET",
  "url": "[https://api.example.com/data](https://api.example.com/data)",
  "queryParams": [{ "key": "page", "value": "1" }],
  "headers": [{ "key": "Authorization", "value": "Bearer ***" }],
  "timeoutMs": 10000
}
```

**Response Example (Success)**
```json
{
  "success": true,
  "traceId": "req_7b9f3e0c",
  "data": {
    "status": 200,
    "body": "{\"data\": []}",
    "size": 2048,
    "truncated": false
  }
}
```

---

## 7. 데이터 모델링 (JPA)

```java
@Entity
@Table(name = "histories")
public class History {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    private String traceId;
    private String method;
    private String url;
    private Integer statusCode;
    
    @Lob private String requestBody;
    @Lob private String responseBody;
    
    @CreationTimestamp private LocalDateTime executedAt;
}
```

---

## 8. 프론트엔드 구조

```bash
app/
├── components/
│   ├── request/     # MethodSelector, UrlInput, HeadersEditor
│   ├── response/    # StatusBadge, JsonViewer
│   └── common/      # LoadingSpinner, ErrorAlert
├── stores/          # Zustand (RequestStore, ResponseStore)
└── page.tsx
```

---

## 9. 개발 로드맵

### 🚩 1단계: MVP (2주)
- [ ] UI → Proxy → Target 연동
- [ ] Proxy execute API 구현 (Method, Header, Body 처리)
- [ ] 기본 SSRF 차단 (Loopback, 사설망)
- [ ] 타임아웃 및 응답 크기 제한 구현
- [ ] JSON 응답 뷰어 및 에러 핸들링 UI

### 🚩 2단계: 안전장치 고도화 (3주)
- [ ] DNS Rebinding 방지 및 리다이렉트 검증
- [ ] WebClient Connection Pool 최적화
- [ ] 대용량 응답 스트림 제어 강화

### 🚩 3단계: 데이터 영속성 (2주)
- [ ] JPA Entity 설계 및 DB 연동
- [ ] 요청 히스토리 자동 저장 및 조회 API
- [ ] 저장된 Request 불러오기 기능

### 🚩 4단계: 인증 및 개인화 (2주)
- [ ] Spring Security 로그인
- [ ] 사용자별 데이터 격리 및 Rate Limiting

### 🚩 5단계: 프론트 고도화 (4주)
- [ ] 사이드바, 컬렉션 관리 UI
- [ ] 다크모드 및 반응형 지원

### 🚩 6단계: 운영 준비 (2주)
- [ ] Docker Compose 전체 구성
- [ ] Actuator & Prometheus 모니터링 연동

---

## 10. 성능 목표
- **MVP:** 동시 사용자 10명, RPS 5 (안정성 우선)
- **Final:** RPS 100+, 응답 오버헤드 < 100ms, 가용성 99.9%

---

## 11. 라이선스
- Personal Project (MIT License 검토 중)