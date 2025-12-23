FROM maven:3.9.9-eclipse-temurin-17-alpine AS builder
WORKDIR /app

# Copy only pom.xml first for better caching
COPY pom.xml .
RUN --mount=type=cache,target=/root/.m2 \
    mvn dependency:go-offline -B -T 1C

# Copy source and build with parallel compilation
COPY src ./src
RUN --mount=type=cache,target=/root/.m2 \
    mvn clean package -Dmaven.test.skip=true -T 1C -q

# JLink stage - create custom JRE with only required modules
FROM eclipse-temurin:17-jdk-alpine AS jlink
RUN jlink \
    --add-modules java.base,java.logging,java.xml,java.naming,java.desktop,java.management,java.sql,java.instrument,java.security.jgss,java.security.sasl,java.prefs,jdk.unsupported,jdk.crypto.ec \
    --strip-debug \
    --no-man-pages \
    --no-header-files \
    --compress=2 \
    --output /jre

# Runtime stage with custom minimal JRE
FROM alpine:3.19
WORKDIR /app

# Copy custom JRE from jlink stage
COPY --from=jlink /jre /opt/java/openjdk

# Install only wget for healthcheck
RUN apk add --no-cache wget && \
    addgroup -S spring && \
    adduser -S spring -G spring

COPY --from=builder /app/target/user-auth-service-0.0.1-SNAPSHOT.jar app.jar

USER spring:spring
EXPOSE 8082

ENV JAVA_HOME=/opt/java/openjdk \
    PATH="/opt/java/openjdk/bin:$PATH" \
    SPRING_PROFILES_ACTIVE=default \
    JAVA_OPTS="-Xms256m -Xmx512m -XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -XX:+UseSerialGC"

HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8082/actuator/health || exit 1

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
