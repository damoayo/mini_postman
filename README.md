# Mini Postman Clone 개발 계획서

**Spring Boot와 Next.js를 활용한 REST API 학습 프로젝트**

---

## 목차

1. [프로젝트 개요](#1-프로젝트-개요)
2. [시스템 아키텍처](#2-시스템-아키텍처)
3. [기술 스택](#3-기술-스택)
4. [Phase별 개발 계획](#4-phase별-개발-계획)
5. [API 설계](#5-api-설계)
6. [데이터 모델](#6-데이터-모델)
7. [프론트엔드 구조](#7-프론트엔드-구조)
8. [학습 포인트](#8-학습-포인트)
9. [개발 체크리스트](#9-개발-체크리스트)
10. [트러블슈팅 가이드](#10-트러블슈팅-가이드)

---

## 1. 프로젝트 개요

### 1.1 핵심 목표

Spring MVC와 REST API를 실전처럼 배우고, JPA와 MyBatis를 모두 경험합니다.

* **CRUD API 구현:** Spring Boot로 완전한 REST API 서버 구현
* **데이터베이스 연동:** JPA를 활용한 데이터 영속성 관리
* **프론트-백 통신:** 프론트엔드-백엔드 통신 이해
* **기술 비교:** 나중에 MyBatis 추가하여 두 ORM 기술 비교
* **실전 배포:** Docker를 활용한 실제 배포 경험

### 1.2 프로젝트 구성

두 개의 독립된 프로젝트를 개발하여 연결합니다:

**Backend (Spring Boot)**
* User CRUD API
* Post CRUD API  
* Request History API
* JPA 데이터베이스 연동

**Frontend (Next.js)**
* API 요청 작성 UI
* 응답 시각화
* 요청 히스토리 관리

---

## 2. 시스템 아키텍처

### 2.1 전체 구성도

```
┌─────────────────────────────────────────────────────────────┐
│                        사용자 브라우저                        │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ HTTP (localhost:3000)
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   Frontend (Next.js)                         │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │ Request UI  │  │ Response UI  │  │ History UI   │       │
│  └─────────────┘  └──────────────┘  └──────────────┘       │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ HTTP API 호출 (localhost:8080)
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   Backend (Spring Boot)                      │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Controller Layer                         │   │
│  │  UserController | PostController | HistoryController │   │
│  └────────────────────┬─────────────────────────────────┘   │
│                       │                                      │
│  ┌────────────────────▼─────────────────────────────────┐   │
│  │              Service Layer                            │   │
│  │  UserService | PostService | HistoryService          │   │
│  └────────────────────┬─────────────────────────────────┘   │
│                       │                                      │
│  ┌────────────────────▼─────────────────────────────────┐   │
│  │              Repository Layer (JPA)                   │   │
│  │  UserRepository | PostRepository | HistoryRepository │   │
│  └────────────────────┬─────────────────────────────────┘   │
└─────────────────────────┼─────────────────────────────────────┘
                         │
                         ▼
                  ┌─────────────┐
                  │   H2 DB     │
                  │  (개발용)    │
                  └─────────────┘
```

### 2.2 프로젝트 폴더 구조

```
mini-postman/
│
├── backend/                          # Spring Boot 프로젝트
│   ├── src/main/java/com/minipostman/
│   │   ├── controller/               # REST API 엔드포인트
│   │   │   ├── UserController.java
│   │   │   ├── PostController.java
│   │   │   └── HistoryController.java
│   │   ├── service/                  # 비즈니스 로직
│   │   │   ├── UserService.java
│   │   │   ├── PostService.java
│   │   │   └── HistoryService.java
│   │   ├── repository/               # 데이터 접근 (JPA)
│   │   │   ├── UserRepository.java
│   │   │   ├── PostRepository.java
│   │   │   └── HistoryRepository.java
│   │   ├── domain/                   # Entity 클래스
│   │   │   ├── User.java
│   │   │   ├── Post.java
│   │   │   └── History.java
│   │   ├── dto/                      # 요청/응답 DTO
│   │   │   ├── request/
│   │   │   └── response/
│   │   ├── exception/                # 예외 처리
│   │   │   ├── GlobalExceptionHandler.java
│   │   │   └── ErrorResponse.java
│   │   └── config/                   # 설정 클래스
│   │       └── WebConfig.java        # CORS 설정
│   └── src/main/resources/
│       └── application.yml           # 설정 파일
│
└── frontend/                         # Next.js 프로젝트
    ├── app/
    │   ├── page.tsx                  # 메인 페이지
    │   └── layout.tsx
    ├── components/
    │   ├── request/                  # 요청 관련 컴포넌트
    │   │   ├── MethodSelector.tsx
    │   │   ├── UrlInput.tsx
    │   │   ├── HeadersEditor.tsx
    │   │   └── BodyEditor.tsx
    │   ├── response/                 # 응답 관련 컴포넌트
    │   │   ├── StatusDisplay.tsx
    │   │   ├── HeadersDisplay.tsx
    │   │   └── BodyDisplay.tsx
    │   └── history/                  # 히스토리 관련
    │       └── HistoryList.tsx
    ├── lib/
    │   └── api.ts                    # API 호출 함수
    └── types/
        └── index.ts                  # TypeScript 타입 정의
```

---

## 3. 기술 스택

### 3.1 Backend

| 카테고리 | 기술 | 버전 | 사용 이유 |
|---------|------|------|----------|
| Language | Java | 21 | 최신 LTS, 이미 설치됨 |
| Framework | Spring Boot | 3.5.10 | 안정적인 최신 버전 |
| Database | H2 | latest | 개발 단계 빠른 시작 |
| ORM (1차) | Spring Data JPA | - | 먼저 학습 (자동 CRUD) |
| ORM (2차) | MyBatis | - | 나중에 추가 (SQL 직접) |
| Build Tool | Gradle | 8.5+ | 의존성 관리 |
| IDE | Eclipse | latest | Spring Tools 포함 |

### 3.2 Frontend

| 카테고리 | 기술 | 버전 | 사용 이유 |
|---------|------|------|----------|
| Framework | Next.js | 14 | React 기반, SSR 지원 |
| Language | TypeScript | 5.0+ | 타입 안정성 |
| Styling | Tailwind CSS | 3.0+ | 빠른 UI 개발 |
| HTTP Client | Fetch API | - | 브라우저 내장 |
| State | React Hooks | - | useState로 시작 |
| IDE | VS Code | latest | 프론트 개발 최적화 |

### 3.3 DevOps

| 카테고리 | 기술 | 용도 |
|---------|------|------|
| Container | Docker | 애플리케이션 컨테이너화 |
| Orchestration | Docker Compose | 로컬 개발 환경 |
| Version Control | Git | 소스 코드 관리 |
| Deployment | Vercel (FE), Railway (BE) | 실제 배포 |

---

## 4. Phase별 개발 계획

### 전체 타임라인 (6-8주)

| Phase | 기간 | 목표 |
|-------|------|------|
| Phase 1 | 1주 | Backend 기초 - User CRUD |
| Phase 2 | 1주 | Backend 확장 - Post CRUD, 예외처리 |
| Phase 3 | 1주 | Backend 완성 - History API |
| Phase 4 | 1주 | Frontend 기초 - UI 구현 |
| Phase 5 | 1주 | Frontend 고도화 - History 기능 |
| Phase 6 | 1-2주 | 통합 및 배포 |

---

### Phase 1: Backend 기초 (1주차)

**목표: Spring Boot 프로젝트 생성 및 첫 번째 REST API 만들기**

#### 1.1 프로젝트 생성

**Spring Initializr 설정:**
```
Project: Gradle - Groovy
Language: Java
Spring Boot: 3.5.10

Project Metadata:
- Group: com.minipostman
- Artifact: backend
- Package name: com.minipostman.tarae
- Java: 21

Dependencies:
- Spring Web
- Spring Data JPA
- H2 Database
- Lombok
- Validation
- Spring Boot DevTools
```

**Eclipse Import:**
```
File → Import → Existing Gradle Project
→ 압축 푼 폴더 선택
```

#### 1.2 Lombok 설치 (필수)

```bash
# 1. lombok.jar 다운로드
https://projectlombok.org/download

# 2. 설치 실행
java -jar lombok.jar

# 3. Eclipse 실행 파일 선택 후 Install/Update
# 4. Eclipse 재시작
```

#### 1.3 User Entity 작성

```java
// domain/User.java
package com.minipostman.domain;

import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Getter
@NoArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class User {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, length = 50)
    private String name;
    
    @Column(nullable = false, unique = true)
    private String email;
    
    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    private LocalDateTime updatedAt;
    
    @Builder
    public User(String name, String email) {
        this.name = name;
        this.email = email;
    }
}
```

#### 1.4 Repository 작성

```java
// repository/UserRepository.java
package com.minipostman.repository;

import com.minipostman.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
}
```

#### 1.5 DTO 작성

```java
// dto/request/UserCreateRequest.java
package com.minipostman.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class UserCreateRequest {
    
    @NotBlank(message = "이름은 필수입니다")
    @Size(max = 50, message = "이름은 50자 이하여야 합니다")
    private String name;
    
    @NotBlank(message = "이메일은 필수입니다")
    @Email(message = "올바른 이메일 형식이 아닙니다")
    private String email;
}
```

```java
// dto/response/UserResponse.java
package com.minipostman.dto.response;

import com.minipostman.domain.User;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class UserResponse {
    private Long id;
    private String name;
    private String email;
    private LocalDateTime createdAt;
    
    public static UserResponse from(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
```

#### 1.6 Service 작성

```java
// service/UserService.java
package com.minipostman.service;

import com.minipostman.domain.User;
import com.minipostman.dto.request.UserCreateRequest;
import com.minipostman.dto.response.UserResponse;
import com.minipostman.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserService {
    
    private final UserRepository userRepository;
    
    public List<UserResponse> findAll() {
        return userRepository.findAll().stream()
                .map(UserResponse::from)
                .toList();
    }
    
    public UserResponse findById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다: " + id));
        return UserResponse.from(user);
    }
    
    @Transactional
    public UserResponse create(UserCreateRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("이미 존재하는 이메일입니다: " + request.getEmail());
        }
        
        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .build();
        
        User savedUser = userRepository.save(user);
        return UserResponse.from(savedUser);
    }
    
    @Transactional
    public void delete(Long id) {
        if (!userRepository.existsById(id)) {
            throw new IllegalArgumentException("사용자를 찾을 수 없습니다: " + id);
        }
        userRepository.deleteById(id);
    }
}
```

#### 1.7 Controller 작성

```java
// controller/UserController.java
package com.minipostman.controller;

import com.minipostman.dto.request.UserCreateRequest;
import com.minipostman.dto.response.UserResponse;
import com.minipostman.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
    
    private final UserService userService;
    
    @GetMapping
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        return ResponseEntity.ok(userService.findAll());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getUser(@PathVariable Long id) {
        return ResponseEntity.ok(userService.findById(id));
    }
    
    @PostMapping
    public ResponseEntity<UserResponse> createUser(@Valid @RequestBody UserCreateRequest request) {
        UserResponse response = userService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
```

#### 1.8 application.yml 설정

```yaml
spring:
  application:
    name: mini-postman-backend
  
  # H2 Database 설정
  h2:
    console:
      enabled: true
      path: /h2-console
  
  datasource:
    url: jdbc:h2:mem:testdb
    driver-class-name: org.h2.Driver
    username: sa
    password:
  
  # JPA 설정
  jpa:
    hibernate:
      ddl-auto: create
    show-sql: true
    properties:
      hibernate:
        format_sql: true
    defer-datasource-initialization: true

server:
  port: 8080

# 로깅 설정
logging:
  level:
    com.minipostman: DEBUG
    org.hibernate.SQL: DEBUG
```

#### 1.9 JPA Auditing 활성화

```java
// TaraeApplication.java (메인 클래스)
package com.minipostman;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing  // 이 어노테이션 추가!
public class TaraeApplication {
    public static void main(String[] args) {
        SpringApplication.run(TaraeApplication.class, args);
    }
}
```

#### 1.10 테스트

**Eclipse에서 실행:**
```
Run As → Spring Boot App
```

**H2 Console 확인:**
```
URL: http://localhost:8080/h2-console
JDBC URL: jdbc:h2:mem:testdb
Username: sa
Password: (비워두기)
```

**Postman/curl로 API 테스트:**

```bash
# 사용자 생성
curl -X POST http://localhost:8080/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"홍길동","email":"hong@example.com"}'

# 전체 사용자 조회
curl http://localhost:8080/api/users

# 특정 사용자 조회
curl http://localhost:8080/api/users/1

# 사용자 삭제
curl -X DELETE http://localhost:8080/api/users/1
```

#### ✅ 학습 체크포인트

- [ ] `@RestController`와 `@Controller`의 차이 이해
- [ ] `@RequestBody`로 JSON 데이터 받기
- [ ] `@PathVariable`로 URL 경로 변수 받기
- [ ] JPA Entity와 DTO의 분리 이유 이해
- [ ] 서비스 계층에서 `@Transactional` 역할 이해
- [ ] HTTP 상태 코드 (200, 201, 204, 400, 404) 이해

---

### Phase 2: Backend 확장 (2주차)

**목표: Post CRUD 구현 및 전역 예외 처리 + CORS 설정**

#### 2.1 Post Entity 구현

```java
// domain/Post.java
package com.minipostman.domain;

import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "posts")
@Getter
@NoArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class Post {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, length = 200)
    private String title;
    
    @Column(columnDefinition = "TEXT")
    private String content;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User author;
    
    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    private LocalDateTime updatedAt;
    
    @Builder
    public Post(String title, String content, User author) {
        this.title = title;
        this.content = content;
        this.author = author;
    }
}
```

#### 2.2 Post CRUD API 구현

User와 동일한 패턴으로 구현:
- PostRepository (JpaRepository 상속)
- PostCreateRequest, PostResponse (DTO)
- PostService (비즈니스 로직)
- PostController (REST API)

**추가 학습 포인트:**
- `@ManyToOne` 연관관계 이해
- `FetchType.LAZY` vs `EAGER`
- N+1 문제 인지

#### 2.3 전역 예외 처리

```java
// dto/response/ErrorResponse.java
package com.minipostman.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class ErrorResponse {
    private int status;
    private String message;
    private LocalDateTime timestamp;
}
```

```java
// exception/GlobalExceptionHandler.java
package com.minipostman.exception;

import com.minipostman.dto.response.ErrorResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {
    
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleIllegalArgument(IllegalArgumentException e) {
        ErrorResponse error = ErrorResponse.builder()
                .status(HttpStatus.BAD_REQUEST.value())
                .message(e.getMessage())
                .timestamp(LocalDateTime.now())
                .build();
        return ResponseEntity.badRequest().body(error);
    }
    
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationException(MethodArgumentNotValidException e) {
        String message = e.getBindingResult().getFieldErrors().stream()
                .map(FieldError::getDefaultMessage)
                .collect(Collectors.joining(", "));
        
        ErrorResponse error = ErrorResponse.builder()
                .status(HttpStatus.BAD_REQUEST.value())
                .message(message)
                .timestamp(LocalDateTime.now())
                .build();
        return ResponseEntity.badRequest().body(error);
    }
    
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGenericException(Exception e) {
        ErrorResponse error = ErrorResponse.builder()
                .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
                .message("서버 오류가 발생했습니다")
                .timestamp(LocalDateTime.now())
                .build();
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }
}
```

#### 2.4 CORS 설정 (중요!)

```java
// config/WebConfig.java
package com.minipostman.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")                    // /api로 시작하는 모든 경로
                .allowedOrigins("http://localhost:3000")  // Frontend 주소
                .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}
```

**CORS 문제 해결 방법:**

**1. Backend에서 허용 (권장):**
- 위의 `WebConfig.java` 설정 사용

**2. Controller에 어노테이션:**
```java
@RestController
@CrossOrigin(origins = "http://localhost:3000")
public class UserController { ... }
```

**3. 배포 시:**
- 같은 도메인 사용: `example.com` (Frontend) + `api.example.com` (Backend)
- Nginx로 프록시 설정

---

### Phase 3: History API (3주차)

**목표: Request History 저장 및 조회 기능 구현**

#### 3.1 History Entity

```java
// domain/History.java
package com.minipostman.domain;

import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "request_histories")
@Getter
@NoArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class History {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, length = 10)
    private String method;
    
    @Column(nullable = false, length = 1000)
    private String url;
    
    @Column(columnDefinition = "TEXT")
    private String headers;
    
    @Column(columnDefinition = "TEXT")
    private String requestBody;
    
    @Column(columnDefinition = "TEXT")
    private String responseBody;
    
    private Integer statusCode;
    
    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime executedAt;
    
    @Builder
    public History(String method, String url, String headers,
                   String requestBody, String responseBody, Integer statusCode) {
        this.method = method;
        this.url = url;
        this.headers = headers;
        this.requestBody = requestBody;
        this.responseBody = responseBody;
        this.statusCode = statusCode;
    }
}
```

#### 3.2 History API 구현

동일한 패턴으로 구현:
- HistoryRepository
- HistorySaveRequest, HistoryResponse
- HistoryService
- HistoryController

---

### Phase 4: Frontend 기초 (4주차)

**목표: Next.js 프로젝트 생성 및 기본 UI 구현**

#### 4.1 Next.js 프로젝트 생성

```bash
# frontend 폴더 생성
npx create-next-app@latest frontend

# 설정
Would you like to use TypeScript? Yes
Would you like to use ESLint? Yes
Would you like to use Tailwind CSS? Yes
Would you like to use `src/` directory? No
Would you like to use App Router? Yes
Would you like to customize the default import alias? No

# 프로젝트 이동 및 실행
cd frontend
npm run dev
```

#### 4.2 API 클라이언트 작성

```typescript
// lib/api.ts
const API_BASE_URL = 'http://localhost:8080/api';

export interface ApiRequest {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  url: string;
  headers?: Record<string, string>;
  body?: string;
}

export interface ApiResponse {
  status: number;
  headers: Record<string, string>;
  body: string;
  executionTime: number;
}

export async function executeRequest(request: ApiRequest): Promise<ApiResponse> {
  const startTime = Date.now();
  
  const options: RequestInit = {
    method: request.method,
    headers: {
      ...request.headers,
      'Content-Type': 'application/json',
    },
  };
  
  if (request.body && request.method !== 'GET') {
    options.body = request.body;
  }
  
  try {
    const response = await fetch(request.url, options);
    const responseBody = await response.text();
    const executionTime = Date.now() - startTime;
    
    return {
      status: response.status,
      headers: Object.fromEntries(response.headers.entries()),
      body: responseBody,
      executionTime,
    };
  } catch (error) {
    throw new Error(`Request failed: ${error}`);
  }
}
```

#### 4.3 메인 페이지

```typescript
// app/page.tsx
'use client';

import { useState } from 'react';
import MethodSelector from '@/components/request/MethodSelector';
import UrlInput from '@/components/request/UrlInput';
import { executeRequest, ApiRequest, ApiResponse } from '@/lib/api';

export default function Home() {
  const [method, setMethod] = useState<'GET' | 'POST' | 'PUT' | 'DELETE'>('GET');
  const [url, setUrl] = useState('http://localhost:8080/api/users');
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    setLoading(true);
    try {
      const request: ApiRequest = { method, url };
      const result = await executeRequest(request);
      setResponse(result);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Mini Postman</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex gap-4 mb-4">
            <MethodSelector value={method} onChange={setMethod} />
            <UrlInput value={url} onChange={setUrl} />
            <button
              onClick={handleSend}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded"
            >
              {loading ? 'Sending...' : 'Send'}
            </button>
          </div>
        </div>
        
        {response && (
          <div className="bg-white rounded-lg shadow p-6">
            <p>Status: {response.status}</p>
            <p>Time: {response.executionTime}ms</p>
            <pre>{response.body}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
```

---

### Phase 5: Frontend 고도화 (5주차)

**목표: History 기능 및 UI 개선**

#### 5.1 History API 함수

```typescript
// lib/historyApi.ts
const API_BASE_URL = 'http://localhost:8080/api';

export async function saveHistory(request: ApiRequest, response: ApiResponse) {
  await fetch(`${API_BASE_URL}/histories`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      method: request.method,
      url: request.url,
      headers: JSON.stringify(request.headers || {}),
      requestBody: request.body || '',
      responseBody: response.body,
      statusCode: response.status,
    }),
  });
}

export async function getHistories() {
  const response = await fetch(`${API_BASE_URL}/histories`);
  return response.json();
}
```

---

### Phase 6: 통합 및 배포 (6주차)

**목표: Docker 설정 및 실제 배포**

#### 6.1 Docker 설정

**Backend Dockerfile:**
```dockerfile
FROM openjdk:21-jdk-slim
WORKDIR /app
COPY build/libs/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

**Frontend Dockerfile:**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

#### 6.2 Docker Compose

```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "8080:8080"
    environment:
      - SPRING_PROFILES_ACTIVE=prod

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    depends_on:
      - backend
```

#### 6.3 배포 옵션

| 서비스 | 용도 | 가격 | 특징 |
|--------|------|------|------|
| Vercel | Frontend | 무료 | Next.js 최적화 |
| Railway | Backend | 무료~$5 | 간편한 배포 |
| Render | Backend | 무료 | 자동 배포 |

---

## 5. API 설계

### 5.1 User API

| Method | Endpoint | Description | Request | Response |
|--------|----------|-------------|---------|----------|
| GET | `/api/users` | 전체 사용자 조회 | - | `List<UserResponse>` |
| GET | `/api/users/{id}` | 특정 사용자 조회 | - | `UserResponse` |
| POST | `/api/users` | 사용자 생성 | `UserCreateRequest` | `UserResponse` |
| DELETE | `/api/users/{id}` | 사용자 삭제 | - | `204 No Content` |

**요청/응답 예시:**

```bash
# POST /api/users
curl -X POST http://localhost:8080/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"홍길동","email":"hong@example.com"}'

# Response (201 Created)
{
  "id": 1,
  "name": "홍길동",
  "email": "hong@example.com",
  "createdAt": "2024-01-01T10:00:00"
}
```

### 5.2 Post API

| Method | Endpoint | Description | Request | Response |
|--------|----------|-------------|---------|----------|
| GET | `/api/posts` | 전체 게시글 조회 | - | `List<PostResponse>` |
| POST | `/api/posts` | 게시글 생성 | `PostCreateRequest` | `PostResponse` |
| DELETE | `/api/posts/{id}` | 게시글 삭제 | - | `204 No Content` |

### 5.3 History API

| Method | Endpoint | Description | Request | Response |
|--------|----------|-------------|---------|----------|
| GET | `/api/histories` | 전체 히스토리 조회 | - | `List<HistoryResponse>` |
| POST | `/api/histories` | 히스토리 저장 | `HistorySaveRequest` | `HistoryResponse` |
| DELETE | `/api/histories/{id}` | 히스토리 삭제 | - | `204 No Content` |

---

## 6. 데이터 모델

### 6.1 ERD (Entity Relationship Diagram)

```
┌─────────────────┐         ┌─────────────────┐
│     users       │         │     posts       │
├─────────────────┤         ├─────────────────┤
│ id (PK)         │◄───┐    │ id (PK)         │
│ name            │    │    │ title           │
│ email (unique)  │    └────│ user_id (FK)    │
│ created_at      │         │ content         │
│ updated_at      │         │ created_at      │
└─────────────────┘         │ updated_at      │
                            └─────────────────┘

┌──────────────────────┐
│  request_histories   │
├──────────────────────┤
│ id (PK)              │
│ method               │
│ url                  │
│ headers (TEXT)       │
│ request_body (TEXT)  │
│ response_body (TEXT) │
│ status_code          │
│ executed_at          │
└──────────────────────┘
```

### 6.2 샘플 데이터

**User 테이블:**
```sql
INSERT INTO users (name, email, created_at, updated_at) VALUES
('홍길동', 'hong@example.com', NOW(), NOW()),
('김철수', 'kim@example.com', NOW(), NOW());
```

**Post 테이블:**
```sql
INSERT INTO posts (title, content, user_id, created_at, updated_at) VALUES
('첫 번째 게시글', '안녕하세요!', 1, NOW(), NOW()),
('Spring Boot 학습', 'JPA는 편리합니다.', 1, NOW(), NOW());
```

---

## 7. 프론트엔드 구조

### 7.1 화면 구성

```
┌──────────────────────────────────────────────────────────┐
│  Mini Postman                                             │
├──────────────────────────────────────────────────────────┤
│  ┌────────┐  ┌───────────────────────────┐  ┌─────────┐ │
│  │ Method │  │ URL Input                  │  │  Send   │ │
│  │  GET ▼ │  │ http://localhost:8080/api/ │  │         │ │
│  └────────┘  └───────────────────────────┘  └─────────┘ │
│                                                           │
│  ┌────────────────────────────────────────────────────┐  │
│  │ Headers                                             │  │
│  │ + Add Header                                        │  │
│  └────────────────────────────────────────────────────┘  │
│                                                           │
├──────────────────────────────────────────────────────────┤
│  Response                                                 │
│  ┌────────────────────────────────────────────────────┐  │
│  │ Status: 200 OK    Time: 245ms                      │  │
│  │ { "id": 1, "name": "홍길동" }                       │  │
│  └────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
```

### 7.2 컴포넌트 계층

```
App (page.tsx)
├── RequestPanel
│   ├── MethodSelector
│   ├── UrlInput
│   └── HeadersEditor
├── ResponsePanel
│   ├── StatusDisplay
│   └── BodyDisplay
└── HistoryPanel
    └── HistoryList
```

---

## 8. 학습 포인트

### 8.1 Spring MVC 핵심 개념

**계층 구조:**
```
HTTP Request
     ↓
@RestController  ← 요청/응답 처리
     ↓
@Service        ← 비즈니스 로직
     ↓
@Repository     ← 데이터 접근
     ↓
Database
```

**각 계층의 역할:**

| 계층 | 어노테이션 | 역할 |
|------|-----------|------|
| Controller | `@RestController` | HTTP 요청/응답 |
| Service | `@Service` | 비즈니스 로직 |
| Repository | `@Repository` | 데이터 접근 |
| Domain | `@Entity` | DB 테이블 매핑 |

### 8.2 REST API 원칙

**1. 리소스 중심 설계:**

| ✅ 올바름 | ❌ 잘못됨 |
|---------|---------|
| `GET /api/users` | `GET /api/getUsers` |
| `POST /api/users` | `POST /api/createUser` |

**2. HTTP 메서드:**

| 메서드 | 용도 |
|--------|------|
| GET | 조회 |
| POST | 생성 |
| PUT | 전체 수정 |
| DELETE | 삭제 |

**3. 상태 코드:**

| 코드 | 의미 |
|------|------|
| 200 | 성공 |
| 201 | 생성 성공 |
| 204 | 삭제 성공 |
| 400 | 잘못된 요청 |
| 404 | 리소스 없음 |

### 8.3 JPA 핵심 개념

**Entity와 Repository:**

```java
// Entity: DB 테이블과 매핑
@Entity
public class User { ... }

// Repository: 자동 CRUD 제공
public interface UserRepository extends JpaRepository<User, Long> { }
```

**영속성 컨텍스트:**
* 1차 캐시
* 변경 감지 (Dirty Checking)
* 지연 로딩 (Lazy Loading)

### 8.4 CORS 이해

```
Frontend (localhost:3000) → Backend (localhost:8080)
         ↑ CORS 설정 필요
```

**해결:**
```java
@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:3000");
    }
}
```

---

## 9. 개발 체크리스트

### Phase 1: Backend 기초
- [ ] Spring Boot 프로젝트 생성
- [ ] Lombok 설치
- [ ] User Entity 작성
- [ ] UserRepository 작성
- [ ] UserService 작성
- [ ] UserController 작성
- [ ] Postman 테스트
- [ ] H2 Console 확인

### Phase 2: Backend 확장
- [ ] Post Entity 작성
- [ ] Post CRUD API 구현
- [ ] 전역 예외 처리
- [ ] CORS 설정
- [ ] Validation 테스트

### Phase 3: History API
- [ ] History Entity 작성
- [ ] History CRUD API 구현
- [ ] API 동작 검증

### Phase 4: Frontend 기초
- [ ] Next.js 프로젝트 생성
- [ ] API 클라이언트 작성
- [ ] Request UI 구현
- [ ] Response UI 구현
- [ ] API 호출 테스트

### Phase 5: Frontend 고도화
- [ ] History 저장 기능
- [ ] History 조회 UI
- [ ] UI 스타일링 개선

### Phase 6: 통합 및 배포
- [ ] Docker 설정
- [ ] 로컬 테스트
- [ ] 배포

---

## 10. 트러블슈팅 가이드

### 10.1 자주 발생하는 문제

#### ⚠️ CORS 에러

```
Access to fetch blocked by CORS policy
```

**해결:** `WebConfig.java`에서 CORS 설정 확인

#### ⚠️ Lombok 에러

```
Getter/Setter가 인식되지 않음
```

**해결:** Lombok 재설치 및 Eclipse 재시작

#### ⚠️ JPA LazyInitializationException

```
could not initialize proxy
```

**해결:** 
- `@Transactional` 추가
- DTO로 변환

#### ⚠️ H2 Console 접속 안됨

**해결:** `application.yml`에서 `enabled: true` 확인

### 10.2 디버깅 팁

**로깅 활성화:**
```yaml
logging:
  level:
    com.minipostman: DEBUG
    org.hibernate.SQL: DEBUG
```

**H2 Console:**
```
URL: http://localhost:8080/h2-console
JDBC URL: jdbc:h2:mem:testdb
Username: sa
Password: (비워두기)
```

---

## 11. 추가 학습 (선택사항)

### MyBatis 추가 (Phase 7, 2주)

프로젝트 완성 후 MyBatis 추가:

```java
// JPA 방식
public interface UserRepository extends JpaRepository<User, Long> { }

// MyBatis 방식
@Mapper
public interface UserMapper {
    @Select("SELECT * FROM users WHERE id = #{id}")
    User findById(Long id);
}
```

**학습 목표:**
* SQL 직접 작성 경험
* JPA vs MyBatis 비교
* 상황별 기술 선택 능력

### 고급 기능
* Spring Security (인증/인가)
* JWT 토큰
* Redis 캐싱
* N+1 문제 해결

---

## 12. 학습 자료

**공식 문서:**
* [Spring Boot Reference](https://docs.spring.io/spring-boot/docs/current/reference/html/)
* [Spring Data JPA](https://docs.spring.io/spring-data/jpa/docs/current/reference/html/)
* [Next.js Documentation](https://nextjs.org/docs)

**추천 강의:**
* 인프런: "스프링 입문 - 코드로 배우는 스프링 부트" (김영한)
* 인프런: "실전! 스프링 부트와 JPA 활용" (김영한)

---

## 프로젝트 진행 상황

- [ ] 프로젝트 생성
- [ ] User CRUD 완성
- [ ] Post CRUD 완성
- [ ] History API 완성
- [ ] Frontend 기본 UI
- [ ] Frontend-Backend 연동
- [ ] History 기능
- [ ] Docker 설정
- [ ] 배포 성공 🎉

---

## 라이선스

본 프로젝트는 학습 목적으로 자유롭게 사용 가능합니다.

---

**Made for learning Spring Boot & REST API**