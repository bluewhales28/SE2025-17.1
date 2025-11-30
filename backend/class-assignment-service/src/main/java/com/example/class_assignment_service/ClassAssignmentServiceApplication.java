package com.example.class_assignment_service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class ClassAssignmentServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(ClassAssignmentServiceApplication.class, args);
	}

}
