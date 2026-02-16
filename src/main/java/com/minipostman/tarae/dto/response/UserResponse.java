package com.minipostman.tarae.dto.response;

import java.time.LocalDateTime;

import com.minipostman.tarae.domain.User;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class UserResponse {

	private Long id;
	private String name;
	private String email;
	private LocalDateTime createdAt;

	public static UserResponse from(User user) {
		return UserResponse.builder().id(user.getId()).name(user.getName()).email(user.getEmail())
				.createdAt(user.getCreatedAt()).build();
	}
}