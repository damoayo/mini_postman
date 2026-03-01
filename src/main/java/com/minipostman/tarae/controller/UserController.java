package com.minipostman.tarae.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.minipostman.tarae.dto.request.UserCreateRequest;
import com.minipostman.tarae.dto.request.UserUpdateRequest;
import com.minipostman.tarae.dto.response.UserResponse;
import com.minipostman.tarae.service.UserService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor // Lombok 어노테이션으로 final 필드에 대한 생성자 자동 생성
public class UserController {

	private final UserService userService;

	@GetMapping
	public ResponseEntity<List<UserResponse>> getAllUsers() {
		return ResponseEntity.ok(userService.findAll());
	}

	@GetMapping("/{id}")
	public ResponseEntity<UserResponse> getUserById(@PathVariable("id") Long id) {
		return ResponseEntity.ok(userService.findById(id));
	}

	@PostMapping
	public ResponseEntity<UserResponse> createUser(@Valid @RequestBody UserCreateRequest request) {
		return ResponseEntity.status(HttpStatus.CREATED).body(userService.create(request));
	}

	/**
	 * PUT /api/users/{id} → 사용자 수정
	 *
	 * 학습 포인트: - PUT은 "리소스 전체 교체", PATCH는 "부분 수정" 이 HTTP 스펙의 원칙 - 하지만 실무에서는 PUT으로 부분
	 * 수정을 하는 경우도 많음 - @Valid로 입력값 검증 → 실패 시 GlobalExceptionHandler가 처리
	 */
	@PutMapping("/{id}")
	public ResponseEntity<UserResponse> updateUser(@PathVariable("id") Long id,
			@Valid @RequestBody UserUpdateRequest request) {
		return ResponseEntity.ok(userService.update(id, request));
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<Void> deleteUser(@PathVariable("id") Long id) {
		userService.delete(id);
		return ResponseEntity.noContent().build();
	}

}
