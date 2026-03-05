package com.minipostman.tarae.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.minipostman.tarae.domain.User;
import com.minipostman.tarae.dto.request.UserCreateRequest;
import com.minipostman.tarae.dto.request.UserUpdateRequest;
import com.minipostman.tarae.dto.response.UserResponse;
import com.minipostman.tarae.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor // 이 애노테이션을 안써서 생성자가 없으면 UserRepository를 주입할 수 없어서 NullPointerException이 발생할 수
							// 있음
@Transactional(readOnly = true) // @Transactional만 쓰면 모든 메서드가 트랜잭션이 걸리게 됨
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

	/**
	 * 사용자 수정
	 *
	 * 학습 포인트: - @Transactional 안에서 엔티티를 수정하면 JPA가 자동으로 UPDATE 쿼리 실행 -
	 * repository.save()를 호출하지 않아도 됩니다 (더티 체킹) - email 변경 시 다른 사용자와 중복 체크 필요
	 */
	@Transactional
	public UserResponse update(Long id, UserUpdateRequest request) {
		User user = userRepository.findById(id)
				.orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다: " + id));

		// 이메일 변경 시 중복 체크 (본인 이메일 제외)
		if (request.getEmail() != null && !request.getEmail().equals(user.getEmail())) {
			if (userRepository.existsByEmail(request.getEmail())) {
				throw new IllegalArgumentException("이미 존재하는 이메일입니다: " + request.getEmail());
			}
		}

		user.update(request.getName(), request.getEmail());
		return UserResponse.from(user);
	}

	@Transactional // 쓰기 작업이므로 트랜잭션 적용
	public void delete(Long id) {
		if (!userRepository.existsById(id)) {
			throw new IllegalArgumentException("사용자를 찾을 수 없습니다: " + id);
		}
		userRepository.deleteById(id);
	}
}
