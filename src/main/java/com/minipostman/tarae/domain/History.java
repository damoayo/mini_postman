package com.minipostman.tarae.domain;

import java.time.LocalDateTime;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import com.minipostman.tarae.domain.common.BaseEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@Table(name = "request_history")
@NoArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class History extends BaseEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false, length = 10)
	private String method; // Get, Post, Put, Delete

	@Column(nullable = false, length = 1000)
	private String url; // 요청 URL http://localhost:8080/api/users

	@Column(columnDefinition = "TEXT")
	private String headers; // JSON 문자열로 저장: {"Content-Type":"application/json"}

	@Column(columnDefinition = "TEXT")
	private String requestBody; // 요청 본문 (POST/PUT 시)

	@Column(columnDefinition = "TEXT")
	private String responseBody; // 응답 본문 (성공/실패 여부 포함)

	private Integer statusCode; // HTTP 상태 코드 (200, 404, 500 등)

	@CreatedDate // 엔티티가 생성될 때 자동으로 현재 시간 저장
	@Column(nullable = false)
	private LocalDateTime executedAt; // 요청이 처리된 시간

	@Builder
	public History(String method, String url, String headers, String requestBody, String responseBody,
			Integer statusCode) {
		this.method = method;
		this.url = url;
		this.headers = headers;
		this.requestBody = requestBody;
		this.responseBody = responseBody;
		this.statusCode = statusCode;
	}

	/**
	 * 기존 코드와의 호환성을 위한 편의 메서드 BaseEntity.createdAt을 executedAt으로 접근 가능
	 */
	public java.time.LocalDateTime getExecutedAt() {
		return getCreatedAt();
	}
}
