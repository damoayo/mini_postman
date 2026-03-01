package com.minipostman.tarae.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 사용자 수정 요청 DTO
 *
 * 학습 포인트: - Create DTO와 달리 @NotBlank 대신 @Size만 사용 - null이면 기존 값 유지, 값이 있으면 변경하는
 * "부분 수정(Partial Update)" 패턴 - 이렇게 하면 이름만 바꾸고 싶을 때 email을 보내지 않아도 됩니다
 */

@Getter
@NoArgsConstructor
public class UserUpdateRequest {

	@Size(max = 50, message = "이름은 최대 50자까지 입력 가능합니다.")
	private String name;

	@Email(message = "유효한 이메일 형식이 아닙니다.")
	private String email;

}
