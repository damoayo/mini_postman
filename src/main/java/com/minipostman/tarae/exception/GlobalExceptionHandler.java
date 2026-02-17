package com.minipostman.tarae.exception;

import java.time.LocalDateTime;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.minipostman.tarae.dto.response.ErrorResponse;

@RestControllerAdvice // 이 어노테이션은 Spring MVC에서 발생하는 예외를 전역적으로 처리하기 위한 클래스임을 나타냅니다. 모든 컨트롤러에서 발생하는 예외를
						// 이 클래스에서 처리할 수 있도록 합니다.
public class GlobalExceptionHandler {

	// 이 클래스에서는 다양한 예외 상황에 대한 핸들러 메서드를 정의할 수 있습니다. 예를 들어, 특정 예외가 발생했을 때 적절한 HTTP 상태
	// 코드와 메시지를 반환하도록 설정할 수 있습니다.

	// 예시로, IllegalArgumentException이 발생했을 때 400 Bad Request를 반환하는 핸들러 메서드를
	// 작성해보겠습니다.

	// Validation 실패 처리 (@NotBlank, @Email 등)
	@ExceptionHandler(MethodArgumentNotValidException.class)
	public ResponseEntity<ErrorResponse> handleValidationException(MethodArgumentNotValidException e) {

		String message = e.getBindingResult().getFieldErrors().stream().map(FieldError::getDefaultMessage)
				.collect(Collectors.joining(", "));

		ErrorResponse error = ErrorResponse.builder().status(HttpStatus.BAD_REQUEST.value()).message(message)
				.timestamp(LocalDateTime.now()).build();

		return ResponseEntity.badRequest().body(error);
	}

	// 비즈니스 로직 예외 처리 (이메일 중복 등)
	@ExceptionHandler(IllegalArgumentException.class)
	public ResponseEntity<ErrorResponse> handleIllegalArgument(IllegalArgumentException e) {

		ErrorResponse error = ErrorResponse.builder().status(HttpStatus.BAD_REQUEST.value()).message(e.getMessage())
				.timestamp(LocalDateTime.now()).build();

		return ResponseEntity.badRequest().body(error);
	}

	// 그 외 모든 예외 처리
	@ExceptionHandler(Exception.class)
	public ResponseEntity<ErrorResponse> handleGenericException(Exception e) {

		ErrorResponse error = ErrorResponse.builder().status(HttpStatus.INTERNAL_SERVER_ERROR.value())
				.message("서버 오류가 발생했습니다").timestamp(LocalDateTime.now()).build();

		return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
	}
}
