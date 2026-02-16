package com.minipostman.tarae.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.minipostman.tarae.domain.User;
import com.minipostman.tarae.dto.request.UserCreateRequest;
import com.minipostman.tarae.dto.response.UserResponse;
import com.minipostman.tarae.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor // final 필드에 대한 생성자 자동 생성
@Transactional(readOnly = true) // 기본적으로 읽기 전용 트랜잭션 적용
public class UserService {

	private final UserRepository userRepository;

	public List<UserResponse> findAll() {
		return userRepository.findAll().stream().map(UserResponse::from).toList();
	}

	public UserResponse findById(Long id) {
		User user = userRepository.findById(id)
				.orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다: " + id));
		return UserResponse.from(user);
	}

	@Transactional // 쓰기 작업이므로 트랜잭션 적용
	public UserResponse create(UserCreateRequest request) {
		if (userRepository.existsByEmail(request.getEmail())) {
			throw new IllegalArgumentException("이미 존재하는 이메일입니다: " + request.getEmail());
		}

		User user = User.builder().name(request.getName()).email(request.getEmail()).build();

		User savedUser = userRepository.save(user);
		return UserResponse.from(savedUser);

	}

	@Transactional // 쓰기 작업이므로 트랜잭션 적용
	public void delete(Long id) {
		if (!userRepository.existsById(id)) {
			throw new IllegalArgumentException("사용자를 찾을 수 없습니다: " + id);
		}
		userRepository.deleteById(id);
	}
}
