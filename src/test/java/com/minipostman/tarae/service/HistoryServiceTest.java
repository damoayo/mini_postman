package com.minipostman.tarae.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;

import java.util.List;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.minipostman.tarae.domain.History;
import com.minipostman.tarae.dto.request.HistorySaveRequest;
import com.minipostman.tarae.dto.response.HistoryResponse;
import com.minipostman.tarae.repository.HistoryRepository;

@ExtendWith(MockitoExtension.class)
class HistoryServiceTest {

	@Mock
	private HistoryRepository historyRepository;

	@InjectMocks
	private HistoryService historyService;

	@Nested
	@DisplayName("findAll()")
	class FindAll {

		@Test
		@DisplayName("히스토리 전체 조회 (최신순)")
		void findAll_success() {
			History history = History.builder().method("GET").url("http://localhost:8080/api/users").statusCode(200)
					.build();
			given(historyRepository.findAllByOrderByExecutedAtDesc()).willReturn(List.of(history));

			List<HistoryResponse> result = historyService.findAll();

			assertThat(result).hasSize(1);
			assertThat(result.get(0).getMethod()).isEqualTo("GET");
			assertThat(result.get(0).getStatusCode()).isEqualTo(200);
		}
	}

	@Nested
	@DisplayName("save()")
	class Save {

		@Test
		@DisplayName("히스토리 저장 성공")
		void save_success() {
			HistorySaveRequest request = createHistoryRequest("POST", "http://localhost:8080/api/users", 201);
			History savedHistory = History.builder().method("POST").url("http://localhost:8080/api/users")
					.statusCode(201).build();
			given(historyRepository.save(any(History.class))).willReturn(savedHistory);

			HistoryResponse result = historyService.save(request);

			assertThat(result.getMethod()).isEqualTo("POST");
			assertThat(result.getStatusCode()).isEqualTo(201);
		}
	}

	@Nested
	@DisplayName("deleteById()")
	class DeleteById {

		@Test
		@DisplayName("히스토리 삭제 성공")
		void delete_success() {
			given(historyRepository.existsById(1L)).willReturn(true);

			historyService.deleteById(1L);

			verify(historyRepository).deleteById(1L);
		}

		@Test
		@DisplayName("존재하지 않는 히스토리 삭제 시 예외")
		void delete_notFound() {
			given(historyRepository.existsById(999L)).willReturn(false);

			assertThatThrownBy(() -> historyService.deleteById(999L)).isInstanceOf(IllegalArgumentException.class)
					.hasMessageContaining("히스토리를 찾을 수 없습니다");
		}
	}

	// === 헬퍼 메서드 ===
	private HistorySaveRequest createHistoryRequest(String method, String url, Integer statusCode) {
		try {
			HistorySaveRequest request = new HistorySaveRequest();
			setField(request, "method", method);
			setField(request, "url", url);
			setField(request, "statusCode", statusCode);
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
