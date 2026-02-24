package com.minipostman.tarae.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.minipostman.tarae.dto.request.HistorySaveRequest;
import com.minipostman.tarae.dto.response.HistoryResponse;
import com.minipostman.tarae.service.HistoryService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/histories")
@RequiredArgsConstructor
public class HistoryController {

	private final HistoryService historyService;

	// GET /api/histories → 전체 히스토리 조회 (최신 순)
	@GetMapping
	public ResponseEntity<List<HistoryResponse>> getAllHistories() {
		List<HistoryResponse> histories = historyService.findAll();
		return ResponseEntity.ok(histories);
	}

	// GET /api/histories/1 → 특정 히스토리 조회
	@GetMapping("/{id}")
	public ResponseEntity<HistoryResponse> getHistoryById(@PathVariable("id") Long id) {
		HistoryResponse history = historyService.findById(id);
		return ResponseEntity.ok(history);
	}

	// POST /api/histories → 히스토리 저장
	@PostMapping
	public ResponseEntity<HistoryResponse> saveHistory(@Valid @RequestBody HistorySaveRequest request) {
		return ResponseEntity.status(HttpStatus.CREATED).body(historyService.save(request));
	}

	// DELETE /api/histories/1 → 히스토리 삭제
	@DeleteMapping("/{id}")
	public ResponseEntity<Void> deleteHistory(@PathVariable("id") Long id) {
		historyService.deleteById(id);
		return ResponseEntity.noContent().build();
	}

}
