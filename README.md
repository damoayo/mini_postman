# Mini Postman Clone 개발 계획서 (수정안 v2)

## 1. 프로젝트 개요

Mini Postman Clone 은 Spring 기반 Proxy API 서버와 Next.js 기반 클라이언트 UI 로 구성된 API 테스팅 도구입니다.

### 핵심 목표
- 브라우저 CORS 제약을 우회하여 외부 API 테스트 지원
- API Key, Token 을 클라이언트에 노출하지 않고 안전하게 관리
- 요청 실행, 응답 시각화, 히스토리 저장을 통해 Postman 유사 워크플로 제공
- 운영 관점의 기본 안전장치(SSRF 방지, 타임아웃, 크기 제한, 로깅) 내장

---

## 2. 기술 스택

### Backend
- Java 21 (최신 LTS 버전 활용)
- Spring Boot 3.2+ (Spring MVC 기반 시작 후 Boot 로 통합)
- HTTP Client: WebClient (Non-blocking 기본)
- Virtual Threads: 서버 전체 동시성 설계와 맞물려 단계적 도입(고도화 단계에서 검토)
- Spring Data JPA (데이터 영속성)
- Spring Security (MVP 이후 단계 도입)
- Bean Validation (입력 검증)
- Actuator (운영 모니터링)

### Frontend
- Next.js 14 (App Router)
- TypeScript
- Zustand (상태 관리)
- Tailwind CSS (스타일링)
- JSON Viewer 라이브러리(React JSON View 또는 대체)
- Resizable Panels (레이아웃 조정)

### Infrastructure
- Docker, Docker Compose (컨테이너화)
- PostgreSQL (주 데이터베이스)
- Redis (Rate Limiting, 캐시)
- Nginx (리버스 프록시)

---

## 3. 시스템 아키텍처

```
Client UI (Next.js)  →  Proxy Server (Spring Boot)  →  Target API (외부 서버)

Proxy Server 공통 정책
- SSRF 방지
- 헤더 필터링
- 타임아웃 제어
- 요청 및 응답 크기 제한
- 로깅 및 추적(Trace ID)
```

---

## 4. 기능 범위 정의

### 4.1 MVP 범위 (1 단계, 2 주)

MVP 목표는 엔드투엔드 동작(UI → Proxy → Target API → UI 응답) 입니다.

#### MVP 기능

**Proxy 실행 API**
- 메서드: GET, POST, PUT, DELETE
- 프로토콜: http, https 만 허용
- Query Params: 다중 키 값 지원
- Headers: 입력 지원(금지 헤더는 서버에서 제거)
- Body: Raw 텍스트(JSON, XML, Text)

**기본 안전장치**
- 기본 타임아웃(서버 기본값 + 사용자 입력 상한 제한)
- 최대 응답 크기 제한(10 MB)
- 최대 요청 크기 제한(5 MB)
- 기본 SSRF 차단
  - localhost, loopback, 사설망 대역
  - 클라우드 메타데이터 IP(169.254.169.254 등)
  - 포트 제한(80, 443 위주)
- 리다이렉트 처리 정책(MVP)
  - 기본값: 리다이렉트 follow 비활성화
  - 고도화 단계에서 최종 목적지 재검증 후 허용

**프론트 최소 UI**
- Request Builder: Method 선택, URL 입력, Headers, Body, Send 버튼
- Response Viewer: status, headers, body, elapsedMs, truncated

#### MVP 에서 제외
- 회원가입, 로그인, Workspace, Collection, Environment
- Redis 기반 Rate Limiting
- cURL import/export, OpenAPI import
- WebSocket, GraphQL

---

## 5. 보안 및 운영 정책

### 5.1 SSRF 방지 정책

#### A. MVP 차단 기준(1 단계)

- URL 스킴: http, https 만 허용
- 포트 제한: 80, 443 중심(또는 allowlist)
- DNS 리졸브 결과의 모든 IP 를 검사하여 내부망 접근 차단
- 메타데이터 접근 차단(호스트명 및 리졸브 결과 기반)
- Host 헤더는 서버가 통제하며, 클라이언트가 임의로 지정하지 못하게 처리

```java
@Component
public class SSRFValidator {

    private static final List<CIDR> BLOCKED_NETWORKS = Arrays.asList(
        new CIDR("127.0.0.0/8"),      // IPv4 loopback
        new CIDR("10.0.0.0/8"),       // Private network
        new CIDR("172.16.0.0/12"),    // Private network
        new CIDR("192.168.0.0/16"),   // Private network
        new CIDR("169.254.0.0/16"),   // Link-local (includes 169.254.169.254)
        new CIDR("::1/128"),          // IPv6 localhost
        new CIDR("fc00::/7")          // IPv6 unique local
    );

    private static final Set<Integer> ALLOWED_PORTS = Set.of(80, 443);

    // 호스트 차단(예: 클라우드 메타데이터)
    private static final Set<String> BLOCKED_HOSTS = Set.of(
        "metadata.google.internal"
    );

    public ValidationResult validate(URI uri) {
        // Scheme 검증
        String scheme = uri.getScheme();
        if (!"http".equalsIgnoreCase(scheme) && !"https".equalsIgnoreCase(scheme)) {
            return ValidationResult.blocked("INVALID_SCHEME", "Only http and https schemes are allowed");
        }

        // Port 검증
        int port = uri.getPort();
        if (port != -1 && !ALLOWED_PORTS.contains(port)) {
            return ValidationResult.blocked("RESTRICTED_PORT", "Only ports 80 and 443 are allowed");
        }

        // Host 차단(문자열 기준)
        String host = uri.getHost();
        if (host == null || host.isBlank()) {
            return ValidationResult.blocked("INVALID_HOST", "Host is required");
        }
        if (BLOCKED_HOSTS.contains(host.toLowerCase())) {
            return ValidationResult.blocked("METADATA_ACCESS", "Blocked host");
        }

        // DNS Resolve 및 IP 검증: 모든 IP 검사
        try {
            InetAddress[] addresses = InetAddress.getAllByName(host);

            for (InetAddress address : addresses) {
                for (CIDR cidr : BLOCKED_NETWORKS) {
                    if (cidr.contains(address)) {
                        return ValidationResult.blocked(
                            "PRIVATE_NETWORK",
                            "Access to private or local network blocked: " + address.getHostAddress()
                        );
                    }
                }
            }

            return ValidationResult.allowed();

        } catch (UnknownHostException e) {
            return ValidationResult.blocked("UNRESOLVABLE_HOST", "Host cannot be resolved");
        }
    }
}
```

#### B. 강화 기준(2 단계: Proxy 안전장치 고도화)
- 리다이렉트(3xx) 허용 시 최종 목적지에 대해 재검증
- DNS Rebinding 대응: 최초 리졸브 vs 실제 연결 IP 비교
- 도메인 allowlist 모드(운영 배포 시 옵션)

---

### 5.2 헤더 필터링 정책

핵심 원칙
- 외부 API 로 실제 전달되는 헤더에서는 인증 정보를 변경하지 않는다
- 로그에 남길 때만 민감 헤더를 마스킹한다

#### A. 요청 전달용 헤더 필터
```java
@Component
public class HeaderFilter {

    // 자동 제거 헤더(Hop-by-hop, 프록시 관련)
    private static final Set<String> REMOVED_HEADERS = Set.of(
        "host", "content-length", "transfer-encoding",
        "connection", "keep-alive", "upgrade",
        "proxy-connection", "proxy-authenticate", "proxy-authorization"
    );

    public HttpHeaders filterForForwarding(HttpHeaders incoming) {
        HttpHeaders out = new HttpHeaders();

        incoming.forEach((key, values) -> {
            String k = key.toLowerCase();
            if (!REMOVED_HEADERS.contains(k)) {
                out.addAll(key, values);
            }
        });

        // 서버 재작성 헤더
        out.set("User-Agent", "MiniPostmanProxy/1.0");

        return out;
    }
}
```

#### B. 로깅용 헤더 마스킹(요청 전달과 분리)
```java
@Component
public class HeaderMasker {

    private static final Set<String> SENSITIVE_HEADERS = Set.of(
        "authorization", "cookie", "set-cookie",
        "x-api-key", "x-auth-token", "api-key"
    );

    public Map<String, Object> maskForLog(HttpHeaders headers) {
        Map<String, Object> masked = new HashMap<>();

        headers.forEach((key, values) -> {
            String k = key.toLowerCase();
            if (SENSITIVE_HEADERS.contains(k)) {
                masked.put(key, "***MASKED***");
            } else {
                masked.put(key, values);
            }
        });

        return masked;
    }
}
```

---

### 5.3 타임아웃 정책

```yaml
proxy:
  timeout:
    default-ms: 30000          # 기본 30 초
    min-allowed-ms: 1000       # 최소 1 초
    max-allowed-ms: 120000     # 최대 2 분
```

```java
@Component
public class TimeoutManager {

    @Value("${proxy.timeout.default-ms}")
    private int defaultTimeout;

    @Value("${proxy.timeout.min-allowed-ms}")
    private int minAllowed;

    @Value("${proxy.timeout.max-allowed-ms}")
    private int maxAllowed;

    public int validateTimeout(Integer userTimeout) {
        if (userTimeout == null) return defaultTimeout;
        return Math.max(minAllowed, Math.min(userTimeout, maxAllowed));
    }
}
```

---

### 5.4 크기 제한 정책

```yaml
proxy:
  limits:
    max-request-size: 5242880       # 5 MB
    max-response-size: 10485760     # 10 MB
```

원칙
- 스트리밍으로 읽되 제한 초과 시 즉시 중단
- 제한 초과 시 `truncated: true` 로 표시
- MVP 에서는 즉시 중단 형태로 구현하고, 고도화 단계에서 부분 절단 등 정교화

```java
public class StreamingResponseReader {

    private final int maxResponseSize;

    public StreamingResponseReader(int maxResponseSize) {
        this.maxResponseSize = maxResponseSize;
    }

    public Mono<ResponseData> readWithLimit(ClientResponse response) {
        AtomicInteger totalSize = new AtomicInteger(0);
        AtomicBoolean truncated = new AtomicBoolean(false);

        return response.bodyToFlux(DataBuffer.class)
            .takeWhile(buffer -> {
                int next = totalSize.get() + buffer.readableByteCount();
                if (next > maxResponseSize) {
                    truncated.set(true);
                    return false;
                }
                return true;
            })
            .map(buffer -> {
                byte[] bytes = new byte[buffer.readableByteCount()];
                buffer.read(bytes);
                DataBufferUtils.release(buffer);
                totalSize.addAndGet(bytes.length);
                return bytes;
            })
            .collectList()
            .map(chunks -> {
                byte[] fullBody = concatenate(chunks);
                return new ResponseData(fullBody, truncated.get());
            });
    }
}
```

---

### 5.5 로깅 및 추적(MVP 기준)

MVP 에서는 AOP 로깅 대신, 컨트롤러 또는 필터 레벨에서 최소 로깅을 사용합니다.

- traceId 생성 및 응답에 포함
- 구조화 로깅(JSON 로그 권장)
- URL 은 쿼리 파라미터를 제거하여 로그에 남김
- 민감 헤더는 로깅 시 마스킹

---

## 6. API 설계

### 6.1 Proxy 실행 API

```http
POST /api/v1/proxy/execute
Content-Type: application/json
```

요청 본문 예시

```json
{
  "method": "GET",
  "url": "https://api.example.com/data",
  "queryParams": [
    { "key": "page", "value": "1" },
    { "key": "limit", "value": "20" }
  ],
  "headers": [
    { "key": "Authorization", "value": "Bearer ***" },
    { "key": "Accept", "value": "application/json" }
  ],
  "body": "{\"test\": \"data\"}",
  "timeoutMs": 10000
}
```

성공 응답 예시

```json
{
  "success": true,
  "traceId": "req_7b9f3e0c1a2b4c3d9e8f",
  "data": {
    "status": 200,
    "headers": {
      "content-type": ["application/json; charset=utf-8"],
      "cache-control": ["no-cache"]
    },
    "body": "{\"data\": [/* ... */]}",
    "size": 2048,
    "elapsedMs": 245,
    "truncated": false
  },
  "timestamp": "2024-01-10T10:30:00Z"
}
```

에러 응답 예시

```json
{
  "success": false,
  "traceId": "req_7b9f3e0c1a2b4c3d9e8f",
  "error": {
    "code": "SSRF_BLOCKED",
    "message": "내부 네트워크 접근이 차단되었습니다",
    "details": {
      "ip": "192.168.1.1",
      "reason": "private_network"
    }
  },
  "timestamp": "2024-01-10T10:30:00Z"
}
```

---

## 7. 데이터 모델링(JPA)

### 원칙
- MVP: 히스토리 최소 저장 또는 저장 없이 동작 가능
- 저장 기능: 3 단계(데이터 영속성)에서 본격 도입

### Phase 3 이후 엔티티 설계(예시)

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
    private Long elapsedMs;

    @Lob
    private String requestBody;

    @Lob
    private String responseBody;

    @CreationTimestamp
    private LocalDateTime executedAt;
}
```

```java
@Entity
@Table(name = "saved_requests")
public class SavedRequest {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    private String name;
    private String method;

    @Column(length = 2048)
    private String url;

    @Lob
    private String body;

    private Integer timeoutMs;

    @CreationTimestamp
    private LocalDateTime createdAt;
}
```

---

## 8. 프론트엔드 아키텍처

### MVP 프론트 목표
- 요청 편집 상태와 응답 상태 명확 분리
- 실행 중 로딩, 실패 메시지, 응답 렌더링 끊김 없이 동작

### Zustand 상태 관리(요약)
- RequestStore: method, url, queryParams, headers, body, timeoutMs
- ResponseStore: currentResponse, isLoading, error, executionTime
- HistoryStore: 3 단계 이후 도입

### UI 구성(MVP)
```
app/
├── layout.tsx
├── page.tsx
├── components/
│   ├── request/
│   │   ├── MethodSelector.tsx
│   │   ├── UrlInput.tsx
│   │   ├── QueryParamsEditor.tsx
│   │   ├── HeadersEditor.tsx
│   │   ├── BodyEditor.tsx
│   │   └── SendButton.tsx
│   ├── response/
│   │   ├── StatusBadge.tsx
│   │   ├── HeadersViewer.tsx
│   │   ├── BodyViewer.tsx
│   │   └── ResponseMeta.tsx
│   └── common/
│       ├── LoadingSpinner.tsx
│       ├── ErrorAlert.tsx
│       └── JsonViewer.tsx
```

---

## 9. 개발 로드맵

### 1 단계: MVP(2 주)
목표: UI → Proxy → Target API → UI 응답 표시, 엔드투엔드 완성

포함 기능
- Proxy execute API (GET, POST, PUT, DELETE)
- http, https 프로토콜 제한
- 타임아웃 clamp 구현
- 응답 크기 제한(간단 버전)
- 기본 SSRF 차단(사설망, loopback, 메타데이터 IP)
- 최소 UI(Request Builder + Response Viewer)

완료 기준 체크리스트
- URL 이 http 또는 https 가 아니면 차단됨
- localhost, 사설망 요청 시 SSRF_BLOCKED 에러
- JSON 응답이 보기 좋게 렌더링됨
- timeoutMs 과도 입력 시 서버 상한으로 제한됨
- 응답 제한 크기 초과 시 truncated 표시
- traceId 가 항상 응답에 포함됨
- 실행 중 로딩 상태 표시됨
- 에러 발생 시 사용자 친화적 메시지 표시됨

---

### 2 단계: Proxy 안전장치 고도화(3 주)
포함 기능
- SSRF 강화
  - DNS 리졸브 기반 차단 고도화
  - 리다이렉트 최종 목적지 재검증
  - DNS Rebinding 대응
- WebClient 설정 고도화(풀, 타임아웃, max-in-memory-size)
- 응답 처리 고도화(제한 초과 시 즉시 중단, 성능 개선)
- 요청 및 응답 헤더 필터링 강화

완료 기준 체크리스트
- 리다이렉트로 내부망 우회 시도 차단됨
- 대용량 응답에서도 메모리 사용 폭증 없음
- 금지 헤더는 서버에서 자동 제거됨
- traceId 요청 헤더로 전달 가능
- Connection Pool 설정 적용됨

---

### 3 단계: 데이터 영속성(2 주)
포함 기능
- JPA 엔티티 및 저장소 구현
- History 저장(실행 기록)
- Request 저장(이름, URL, 메서드, 헤더, 바디)
- History 조회 API(기간, 상태코드, URL 키워드 필터)
- 히스토리 페이징 처리

완료 기준 체크리스트
- 실행한 요청이 히스토리에 자동 저장됨
- 특정 기간 히스토리 조회 가능
- 저장된 Request 불러와 재실행 가능
- 히스토리 페이징 처리됨

---

### 4 단계: 인증 및 사용자별 정책(2 주)
포함 기능
- Spring Security 기반 로그인(간단 형태)
- 사용자별 Rate Limiting(Redis)
- 사용자별 데이터 격리
- JWT 기반 인증

완료 기준 체크리스트
- 로그인 사용자만 히스토리 접근 가능
- 사용자별 호출 제한 정상 작동
- 다른 사용자 데이터 조회 불가
- 로그인, 로그아웃 기능 정상 동작

---

### 5 단계: 프론트 고도화(4 주)
포함 기능
- Sidebar, Collection, Saved Requests UI
- JSON Viewer 개선, 편집기 UX 개선
- 상태 관리 정리, 에러 UX 강화
- 다크모드 지원
- 반응형 디자인

완료 기준 체크리스트
- 저장된 Request, Collection UI 관리 가능
- 대용량 JSON 안정적 표시
- 실패 원인 UI 명확 표시
- 다크모드 전환 가능
- 모바일에서도 사용 가능

---

### 6 단계: 운영 준비(2 주)
포함 기능
- Docker Compose 구성(API, DB, Redis, Nginx)
- Actuator, Metrics, Prometheus 노출
- Swagger 문서화
- 에러 모니터링 연동 옵션
- 환경별 설정 분리

완료 기준 체크리스트
- docker compose up 으로 전체 실행 가능
- health, metrics 엔드포인트 정상 동작
- Swagger UI 로 API 문서 확인 가능
- 개발, 운영 환경 분리됨

---

### 7 단계: 확장 기능(옵션, 3 주 이상)
포함 기능
- cURL import/export
- OpenAPI import
- 테스트 자동화(컬렉션 러너)
- WebSocket, GraphQL 지원
- 변수 및 환경 관리

---

## 10. 성능 목표

### MVP 목표(현실 기준)
- 단일 인스턴스, 안정적 기능 동작
- 제한 크기 및 타임아웃 정책 정상 적용
- 에러 케이스에서 서버 장애 없음
- 동시 사용자 10 명, RPS 5 수준

### 최종 목표(운영 확장 기준)
- RPS 100 수준(캐시, 풀 튜닝, 수평 확장)
- 평균 응답 오버헤드: < 100 ms (프록시 처리)
- 가용성 99.9% (배포 구조 포함)
- 메모리 사용량: < 512 MB (평균)

---

## 11. 라이선스
- 개인 프로젝트로 시작, 필요 시 MIT License 채택 검토
