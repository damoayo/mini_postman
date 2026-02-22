package com.minipostman.tarae.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.minipostman.tarae.domain.History;

@Repository
public interface HistoryRepository extends JpaRepository<History, Long> {

	// 최신 순으로 정렬하여 조회
	List<History> findAllByOrderByExecutedAtDesc(); // 실행 시간 내림차순으로 모든 기록 조회

	// 특정 HTTP 메서드로 필터링 (예: GET 요청만 조회)
	List<History> findByMethod(String method); // 특정 HTTP 메서드로 필터링하여 최신 순으로 조회

	// 특정 상태 코드로 필터링 (예: 에러 응답만 조회)
	List<History> findByStatusCode(Integer statusCode); // 특정 상태 코드로 필터링하여 최신 순으로 조회

}
