package com.minipostman.tarae.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

	@Override
	public void addCorsMappings(CorsRegistry registry) {
		registry.addMapping("/api/**").allowedOrigins("http://localhost:3000", // 로컬 개발용 (기존)
				"https://mini-postman-nine.vercel.app" // Vercel 배포용 (추가!)
		).allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH").allowedHeaders("*").allowCredentials(false); // Vercel에서는
																												// false로
	}
}