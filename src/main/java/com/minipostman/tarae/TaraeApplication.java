package com.minipostman.tarae;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class TaraeApplication {
	public static void main(String[] args) {
		SpringApplication.run(TaraeApplication.class, args);
	}
}