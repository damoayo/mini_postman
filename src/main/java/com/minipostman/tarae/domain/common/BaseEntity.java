package com.minipostman.tarae.domain.common;

import java.time.LocalDateTime;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import jakarta.persistence.Column;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.MappedSuperclass;
import lombok.Getter;

@MappedSuperclass // 상속받는 엔티티에서 공통 필드로 사용할 수 있도록 설정
@Getter
@EntityListeners(AuditingEntityListener.class) // Auditing 기능 활성화
public abstract class BaseEntity {

	@CreatedDate // 엔티티가 생성될 때 자동으로 현재 시간 저장
	@Column(updatable = false) // 생성 시간은 수정되지 않도록 설정
	private LocalDateTime createdAt; // 생성 시간

	@LastModifiedDate // 엔티티가 수정될 때 자동으로 현재 시간 저장
	private LocalDateTime updatedAt; // 수정 시간
}
