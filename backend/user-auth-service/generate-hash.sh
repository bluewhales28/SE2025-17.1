#!/bin/bash
# Generate BCrypt hash for password123

docker exec user-auth-service sh -c "
cd /app
java -cp 'classes:lib/*' -Dspring.main.banner-mode=off org.springframework.boot.SpringApplication \
  --spring.main.web-application-type=none \
  -e 'import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder; 
      System.out.println(new BCryptPasswordEncoder().encode(\"password123\"));'
" 2>/dev/null
