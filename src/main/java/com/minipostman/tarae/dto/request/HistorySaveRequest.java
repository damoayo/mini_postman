package com.minipostman.tarae.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class HistorySaveRequest {

	@NotBlank(message = "HTTP 메서드는 필수입니다.")
	@Size(max = 10, message = "HTTP 메서드는 최대 10자입니다.")
	private String method;

	@NotBlank(message = "URL은 필수입니다.")
	@Size(max = 1000, message = "URL은 최대 1000자입니다.")
	private String url;

	private String headers; // 선택사항

	private String requestBody; // 선택사항

	private String responseBody; // 선택사항

	@NotNull(message = "상태 코드는 필수입니다.")
	private Integer statusCode;

}
