package com.minipostman.tarae.dto.response;

import java.time.LocalDateTime;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
// 이 클래스는 API 요청 처리 중 발생한 오류에 대한 정보를 담는 DTO입니다. 클라이언트에게 오류 상태, 메시지, 그리고 발생 시각을 전달하는 역할을 합니다.
public class ErrorResponse {

	private int status;
	private String message;
	private LocalDateTime timestamp;

}
