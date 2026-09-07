# ---------- Build ----------
FROM maven:3.9-eclipse-temurin-17 AS builder

WORKDIR /app

COPY pom.xml .
RUN mvn -B dependency:go-offline

COPY src ./src
RUN mvn -B -DskipTests clean package

# ---------- Runtime ----------
FROM eclipse-temurin:17-jre-jammy

WORKDIR /app

RUN useradd --system --uid 10001 qualitytrack

COPY --from=builder /app/target/*.jar app.jar

USER qualitytrack

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
