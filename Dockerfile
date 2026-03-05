# === 1단계: 빌드 (Build Stage) ===
# Gradle로 프로젝트를 빌드하여 .jar 파일을 만드는 단계
# 
# 왜 2단계로 나누나?
# - 빌드에 필요한 도구(Gradle, 소스코드)는 실행 시에는 필요 없음
# - 최종 이���지를 작게 만들기 위해 빌드와 실행을 분리 (Multi-stage build)
FROM gradle:8.5-jdk21 AS build

WORKDIR /app

# Gradle 설정 파일만 먼저 복사 (캐싱 최적화)
# → 의존성이 바뀌지 않으면 이 단계를 다시 실행하지 않아서 빌드가 빨라짐
COPY build.gradle settings.gradle ./
COPY gradle ./gradle

# 의존성만 먼저 다운로드
RUN gradle dependencies --no-daemon || true

# 소스 코드 복사 후 빌드
COPY src ./src
RUN gradle bootJar --no-daemon

# === 2단계: 실행 (Runtime Stage) ===
# 빌드된 .jar 파일만 가져와서 실행하는 가벼운 이미지
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# 빌드 단계에서 만든 .jar 파일만 복사
COPY --from=build /app/build/libs/*.jar app.jar

# Render가 사용할 포트
EXPOSE 8080

# Spring Boot 실행
# -Dserver.port=$PORT → Render가 제공하는 포트 사용
ENTRYPOINT ["java", "-jar", "app.jar"]