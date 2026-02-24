package com.minipostman.tarae.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.minipostman.tarae.domain.History;
import com.minipostman.tarae.dto.request.HistorySaveRequest;
import com.minipostman.tarae.dto.response.HistoryResponse;
import com.minipostman.tarae.repository.HistoryRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class HistoryService {

	private final HistoryRepository historyRepository;

	// 전체 히스토리 조회 (최신 순)
	public List<HistoryResponse> findAll() {
		return historyRepository.findAllByOrderByExecutedAtDesc().stream().map(HistoryResponse::from).toList();
	}

	// 특정 히스토리 조회
	public HistoryResponse findById(Long id) {
		History history = historyRepository.findById(id)
				.orElseThrow(() -> new IllegalArgumentException("해당 히스토리가 존재하지 않습니다. id=" + id));
		return HistoryResponse.from(history);
	}

	// 히스토리 저장
	public HistoryResponse save(HistorySaveRequest request) {
		History history = History.builder().method(request.getMethod()).url(request.getUrl())
				.headers(request.getHeaders()).requestBody(request.getRequestBody())
				.responseBody(request.getResponseBody()).statusCode(request.getStatusCode()).build();
		return HistoryResponse.from(historyRepository.save(history));
	}

	// 히스토리 삭제
	public void deleteById(Long id) {
		if (!historyRepository.existsById(id)) {
			throw new IllegalArgumentException("히스토리를 찾을 수 없습니다: " + id);
		}
		historyRepository.deleteById(id);

	}
}
