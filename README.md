# Mini Postman Clone
Spring MVC 기반의 Proxy API 서버와, 요청 구성 및 응답 확인을 위한 클라이언트 UI 로 구성된 미니 Postman 스타일 프로젝트입니다.

브라우저에서 외부 API 를 직접 호출할 때 발생하는 CORS 제약을 피하기 위해, 서버가 사용자의 요청을 대신 실행하고 응답을 표준 포맷으로 반환합니다.  
초기 버전은 Spring MVC 로 구현하고, 이후 단계적으로 Spring Boot, JPA, Security, Next.js 기반 UI 로 확장합니다.

---

## 주요 기능

### Proxy 요청 실행
- 지원 메서드: GET, POST, PUT, PATCH, DELETE
- URL: http, https 만 허용
- Query Params: Key Value 리스트 형태 지원
- Headers: 사용자 입력 헤더 지원 (정책에 따라 일부 헤더 필터링)
- Body: raw string 기반 (JSON 포함)
- Timeout: 연결 / 응답 timeout 설정
- 반환: status, headers, body, elapsedTime, traceId

### 보안 및 안정성 (기본 정책)
- SSRF 최소 방지: localhost 및 사설망 접근 차단
- 입력 크기 제한: URL 길이, 헤더 개수 및 길이, body 최대 크기
- 응답 크기 제한: response body 최대 크기
- hop-by-hop 헤더 제거 정책 (예: Connection, Host, Content-Length 등)
- 표준 에러 응답 포맷 제공 (errorCode, message, traceId)

---

## 확장 기능 (계획)

### 사용자 기능
- 회원가입, 로그인, 로그아웃
- 인증 사용자만 Proxy 호출 가능
- 사용자별 요청 히스토리 및 저장 요청 분리

### 저장 기능
- History: 최근 요청 목록, 상세 조회
- Saved Requests: 요청 저장, 조회, 수정
- Collections: 폴더 구조 확장

### Import 기능
- JSON 기반 컬렉션 import (단순 포맷부터)
- cURL import (선택)

### 운영 기능
- 로깅 및 추적: traceId 기반 요청 추적
- 호출 남용 방지: 사용자별 rate limit (간단 정책부터)
- 상태 점검: health endpoint, (확장) metrics

---

## 기술 스택

### Backend
- Java
- Spring MVC
- WebClient (외부 HTTP 호출)
- Bean Validation
- (확장) Spring Boot, Spring Data JPA, Spring Security

### Frontend
- (확장) Next.js + TypeScript

### Infra
- (확장) Docker, Nginx

---

## 아키텍처 개요
1. Client 가 Proxy 요청 정보를 서버로 전송  
2. Server 가 요청을 검증하고 최종 URI 를 조립  
3. Server 가 WebClient 로 외부 API 를 호출  
4. 응답 status, headers, body 를 수집하고 표준 응답으로 반환  
5. (확장) 사용자 인증 및 히스토리 / 저장 요청 DB 저장

---

## API (초안)

### Proxy 요청 전송
`POST /api/proxy/send`

Request Body
```json
{
  "method": "GET",
  "url": "https://example.com/api",
  "queryParams": [
    { "key": "page", "value": "1" },
    { "key": "size", "value": "10" }
  ],
  "headers": [
    { "key": "Accept", "value": "application/json" }
  ],
  "body": "",
  "timeoutMs": 5000
}
```

Response
```json
{
  "traceId": "7b9f3e0c-1a2b-4c3d-9e8f-123456789abc",
  "status": 200,
  "headers": {
    "content-type": ["application/json"]
  },
  "body": "{\"ok\":true}",
  "elapsedMs": 132
}
Error Response (표준)
{
  "traceId": "7b9f3e0c-1a2b-4c3d-9e8f-123456789abc",
  "errorCode": "INVALID_REQUEST",
  "message": "url 은 http 또는 https 만 허용됩니다.",
  "timestamp": "2026-01-05T15:00:00+09:00"
}
```

로컬 실행
요구사항

JDK 17 이상 권장

실행
./gradlew bootRun

서버 확인
curl -i http://localhost:8080/health

구성 및 정책 (초안)

PROXY_TIMEOUT_MS : 기본 timeout

PROXY_MAX_BODY_BYTES : 요청 body 최대 크기

PROXY_MAX_RESPONSE_BYTES : 응답 body 최대 크기

PROXY_RATE_LIMIT_PER_MIN : 분당 호출 제한 (확장)

버전 업그레이드 계획
v0 (Spring MVC)

Proxy API MVP

표준 에러 응답

기본 SSRF 차단 및 크기 제한

v1 (Spring Boot)

설정 프로파일 분리

운영 편의 기능 (actuator 등) 적용

v2 (Persistence)

JPA 기반 저장 기능 전환 (History, Saved Requests)

v3 (Auth)

Security 기반 로그인, 권한 적용

v4 (UI)

Next.js 프론트 적용

Postman 스타일 UI (컬렉션, 탭, 히스토리)

라이선스

개인 프로젝트