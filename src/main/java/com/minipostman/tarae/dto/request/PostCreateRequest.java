package com.minipostman.tarae.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class PostCreateRequest {

	@NotBlank(message = "제목은 필수입니다.")
	@Size(max = 200, message = "제목은 최대 200자까지 입력 가능합니다.")
	private String title;

	private String content;

	@NotBlank(message = "작성자 ID는 필수입니다.")
	private Long authorId;
}
