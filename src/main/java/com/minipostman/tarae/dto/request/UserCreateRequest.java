package com.minipostman.tarae.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class UserCreateRequest {

	@NotBlank(message = "이름은 필수입니다.")
	@Size(max = 50, message = "이름은 최대 50자까지 입력 가능합니다.")
	private String name;

	@NotBlank(message = "이메일은 필수입니다.")
	@Email(message = "유효한 이메일 형식이 아닙니다.")
	private String email;

}
