package com.minipostman.tarae.dto.request;

import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class PostUpdateRequest {

	@Size(max = 200, message = "제목은 최대 200자까지 입력 가능합니다.")
	private String title;

	private String content;

}
