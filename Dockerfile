# 1. 빌드 단계
FROM gradle:8.5.0-jdk17 AS builder
WORKDIR /build
COPY build.gradle settings.gradle /build/
COPY gradle /build/gradle
COPY src /build/src
COPY libs /build/libs

RUN gradle clean
RUN gradle bootJar --no-daemon

# 2. 실행 단계
FROM openjdk:17-jdk-slim
WORKDIR /app
COPY --from=builder /build/build/libs/*.jar app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]