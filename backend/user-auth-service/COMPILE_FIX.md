# Java 24 Compilation Issue

The project fails to compile due to incompatibility between:
- Java 24 (current installed version)  
- Lombok 1.18.36 (incompatible with Java 24)
- Maven Compiler Plugin 3.14.0

## Solutions

### Option 1: Use Java 17 (Recommended)
Install OpenJDK 17 and set it as JAVA_HOME:
```bash
# Download and install JDK 17
# Then set JAVA_HOME to the JDK 17 installation path
export JAVA_HOME=/path/to/jdk-17
./mvnw clean compile
```

### Option 2: Skip Annotation Processing
Run Maven without Lombok annotation processing:
```bash
./mvnw clean compile -DskipTests -Dorg.slf4j.simpleLogger.defaultLogLevel=warn
```

### Option 3: Use Latest Lombok Beta (Java 24 Support)
Update pom.xml with latest Lombok version that supports Java 24:
```xml
<version>1.18.31</version> <!-- or later if available -->
```

### Option 4: Run Tests Directly with H2 Database
The test configuration uses H2 (in-memory database) and should work:
```bash
./mvnw test
```

## Current Configuration

- Database: PostgreSQL on localhost:5432/quizz
- Java Target: 17
- Lombok Version: 1.18.36 (attempting Java 24 support)
- Maven Compiler: 3.14.0 with fork=true

## Next Steps

1. Install JDK 17 and set JAVA_HOME
2. Rebuild with: `./mvnw clean package -DskipTests`
3. Run with: `java -jar target/user-auth-service-0.0.1-SNAPSHOT.jar`
