package com.minipostman.tarae.dto.response;

import java.time.LocalDateTime;

import com.minipostman.tarae.domain.History;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class HistoryResponse {

	private Long id;
	private String method;
	private String url;
	private String headers;
	private String requestBody;
	private String responseBody;
	private Integer statusCode;
	private LocalDateTime executedAt;

	public static HistoryResponse from(History history) {
		return HistoryResponse.builder().id(history.getId()).method(history.getMethod()).url(history.getUrl())
				.headers(history.getHeaders()).requestBody(history.getRequestBody())
				.responseBody(history.getResponseBody()).statusCode(history.getStatusCode())
				.executedAt(history.getExecutedAt()).build();
	}
}
