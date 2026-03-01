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

import com.minipostman.tarae.domain.Post;
import com.minipostman.tarae.domain.User;
import com.minipostman.tarae.dto.request.PostCreateRequest;
import com.minipostman.tarae.dto.response.PostResponse;
import com.minipostman.tarae.repository.PostRepository;
import com.minipostman.tarae.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class PostServiceTest {

	@Mock
	private PostRepository postRepository;

	@Mock
	private UserRepository userRepository;

	@InjectMocks
	private PostService postService;

	@Nested
	@DisplayName("findAll()")
	class FindAll {

		@Test
		@DisplayName("게시글 전체 조회 성공")
		void findAll_success() {
			User author = User.builder().name("홍길동").email("hong@test.com").build();
			Post post = Post.builder().title("첫 번째 글").content("내용입니다").author(author).build();
			given(postRepository.findAll()).willReturn(List.of(post));

			List<PostResponse> result = postService.findAll();

			assertThat(result).hasSize(1);
			assertThat(result.get(0).getTitle()).isEqualTo("첫 번째 글");
		}
	}

	@Nested
	@DisplayName("findById()")
	class FindById {

		@Test
		@DisplayName("존재하는 게시글 조회 성공")
		void findById_success() {
			User author = User.builder().name("홍길동").email("hong@test.com").build();
			Post post = Post.builder().title("테스트 글").content("내용").author(author).build();
			given(postRepository.findById(1L)).willReturn(Optional.of(post));

			PostResponse result = postService.findById(1L);

			assertThat(result.getTitle()).isEqualTo("테스트 글");
		}

		@Test
		@DisplayName("존재하지 않는 게시글 조회 시 예외")
		void findById_notFound() {
			given(postRepository.findById(999L)).willReturn(Optional.empty());

			assertThatThrownBy(() -> postService.findById(999L)).isInstanceOf(IllegalArgumentException.class)
					.hasMessageContaining("게시글이 존재하지 않습니다");
		}
	}

	@Nested
	@DisplayName("create()")
	class Create {

		@Test
		@DisplayName("게시글 생성 성공")
		void create_success() {
			User author = User.builder().name("홍길동").email("hong@test.com").build();
			PostCreateRequest request = createPostRequest("새 글", "내용입니다", 1L);

			given(userRepository.findById(1L)).willReturn(Optional.of(author));
			given(postRepository.save(any(Post.class)))
					.willReturn(Post.builder().title("새 글").content("내용입니다").author(author).build());

			PostResponse result = postService.create(request);

			assertThat(result.getTitle()).isEqualTo("새 글");
			assertThat(result.getAuthorName()).isEqualTo("홍길동");
		}

		@Test
		@DisplayName("존재하지 않는 작성자로 생성 시 예외")
		void create_authorNotFound() {
			PostCreateRequest request = createPostRequest("새 글", "내용", 999L);
			given(userRepository.findById(999L)).willReturn(Optional.empty());

			assertThatThrownBy(() -> postService.create(request)).isInstanceOf(IllegalArgumentException.class)
					.hasMessageContaining("작성자를 찾을 수 없습니다");
		}
	}

	@Nested
	@DisplayName("delete()")
	class Delete {

		@Test
		@DisplayName("게시글 삭제 성공")
		void delete_success() {
			given(postRepository.existsById(1L)).willReturn(true);

			postService.delete(1L);

			verify(postRepository).deleteById(1L);
		}

		@Test
		@DisplayName("존재하지 않는 게시글 삭제 시 예외")
		void delete_notFound() {
			given(postRepository.existsById(999L)).willReturn(false);

			assertThatThrownBy(() -> postService.delete(999L)).isInstanceOf(IllegalArgumentException.class)
					.hasMessageContaining("게시글을 찾을 수 없습니다");
		}
	}

	// === 헬퍼 메서드 ===
	private PostCreateRequest createPostRequest(String title, String content, Long authorId) {
		try {
			PostCreateRequest request = new PostCreateRequest();
			setField(request, "title", title);
			setField(request, "content", content);
			setField(request, "authorId", authorId);
			return request;
		} catch (Exception e) {
			throw new RuntimeException("테스트 데이터 생성 실패", e);
		}
	}

	private void setField(Object obj, String fieldName, Object value) throws Exception {
		var field = obj.getClass().getDeclaredField(fieldName);
		field.setAccessible(true);
		field.set(obj, value);
	}
}