package com.minipostman.tarae.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.minipostman.tarae.domain.User;
import com.minipostman.tarae.dto.request.UserCreateRequest;
import com.minipostman.tarae.dto.response.UserResponse;
import com.minipostman.tarae.repository.UserRepository;

/**
 * UserService 단위 테스트
 *
 * 학습 포인트: 1. @Mock — 가짜(Mock) 객체를 생성. 실제 DB에 접근하지 않음 2. @InjectMocks — Mock 객체를
 * 주입받는 테스트 대상 3. given().willReturn() — "이 메서드가 호출되면 이 값을 반환해라" 4. assertThat()
 * — 결과를 검증하는 AssertJ 메서드 5. @Nested — 테스트를 논리적 그룹으로 분류 6. @DisplayName — 테스트
 * 결과에 한글 설명 표시
 */
@ExtendWith(MockitoExtension.class)
class UserServiceTest {

	@Mock
	private UserRepository userRepository;

	@InjectMocks
	private UserService userService;

	@Nested
	@DisplayName("findAll()")
	class FindAll {

		@Test
		@DisplayName("사용자 전체 조회 성공")
		void findAll_success() {
			// given — 테스트 데이터 준비
			User user1 = User.builder().name("홍길동").email("hong@test.com").build();
			User user2 = User.builder().name("김철수").email("kim@test.com").build();
			given(userRepository.findAll()).willReturn(List.of(user1, user2));

			// when — 테스트 실행
			List<UserResponse> result = userService.findAll();

			// then — 결과 검증
			assertThat(result).hasSize(2);
			assertThat(result.get(0).getName()).isEqualTo("홍길동");
			assertThat(result.get(1).getName()).isEqualTo("김철수");
		}

		@Test
		@DisplayName("사용자가 없으면 빈 리스트 반환")
		void findAll_empty() {
			given(userRepository.findAll()).willReturn(List.of());

			List<UserResponse> result = userService.findAll();

			assertThat(result).isEmpty();
		}
	}

	@Nested
	@DisplayName("findById()")
	class FindById {

		@Test
		@DisplayName("존재하는 ID로 조회 성공")
		void findById_success() {
			User user = User.builder().name("홍길동").email("hong@test.com").build();
			given(userRepository.findById(1L)).willReturn(Optional.of(user));

			UserResponse result = userService.findById(1L);

			assertThat(result.getName()).isEqualTo("홍길동");
			assertThat(result.getEmail()).isEqualTo("hong@test.com");
		}

		@Test
		@DisplayName("존재하지 않는 ID로 조회 시 예외 발생")
		void findById_notFound() {
			given(userRepository.findById(999L)).willReturn(Optional.empty());

			assertThatThrownBy(() -> userService.findById(999L)).isInstanceOf(IllegalArgumentException.class)
					.hasMessageContaining("사용자를 찾을 수 없습니다");
		}
	}

	@Nested
	@DisplayName("create()")
	class Create {

		@Test
		@DisplayName("사용자 생성 성공")
		void create_success() {
			// given
			UserCreateRequest request = createUserRequest("홍길동", "hong@test.com");
			User savedUser = User.builder().name("홍길동").email("hong@test.com").build();

			given(userRepository.existsByEmail("hong@test.com")).willReturn(false);
			given(userRepository.save(any(User.class))).willReturn(savedUser);

			// when
			UserResponse result = userService.create(request);

			// then
			assertThat(result.getName()).isEqualTo("홍길동");
			assertThat(result.getEmail()).isEqualTo("hong@test.com");
			verify(userRepository).save(any(User.class)); // save가 호출되었는지 검증
		}

		@Test
		@DisplayName("중복 이메일로 생성 시 예외 발생")
		void create_duplicateEmail() {
			UserCreateRequest request = createUserRequest("홍길동", "existing@test.com");
			given(userRepository.existsByEmail("existing@test.com")).willReturn(true);

			assertThatThrownBy(() -> userService.create(request)).isInstanceOf(IllegalArgumentException.class)
					.hasMessageContaining("이미 존재하는 이메일");
		}
	}

	@Nested
	@DisplayName("delete()")
	class Delete {

		@Test
		@DisplayName("존재하는 사용자 삭제 성공")
		void delete_success() {
			given(userRepository.existsById(1L)).willReturn(true);

			userService.delete(1L);

			verify(userRepository).deleteById(1L); // deleteById가 호출되었는지 검증
		}

		@Test
		@DisplayName("존재하지 않는 사용자 삭제 시 예외 발생")
		void delete_notFound() {
			given(userRepository.existsById(999L)).willReturn(false);

			assertThatThrownBy(() -> userService.delete(999L)).isInstanceOf(IllegalArgumentException.class)
					.hasMessageContaining("사용자를 찾을 수 없습니다");
		}
	}

	// === 테스트 헬퍼 메서드 ===

	/**
	 * Reflection으로 UserCreateRequest 생성 (NoArgsConstructor + @Getter만 있고 Setter가
	 * 없으므로)
	 */
	private UserCreateRequest createUserRequest(String name, String email) {
		try {
			UserCreateRequest request = new UserCreateRequest();
			var nameField = UserCreateRequest.class.getDeclaredField("name");
			nameField.setAccessible(true);
			nameField.set(request, name);

			var emailField = UserCreateRequest.class.getDeclaredField("email");
			emailField.setAccessible(true);
			emailField.set(request, email);

			return request;
		} catch (Exception e) {
			throw new RuntimeException("테스트 데이터 생성 실패", e);
		}
	}
}