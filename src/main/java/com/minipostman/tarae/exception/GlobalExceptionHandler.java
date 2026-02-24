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

@RestControllerAdvice
public class GlobalExceptionHandler {

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
