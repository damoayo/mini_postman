package com.minipostman.tarae.domain;

import com.minipostman.tarae.domain.common.BaseEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@Table(name = "users")
@NoArgsConstructor // 기본 생성자 추가
public class User extends BaseEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false, length = 50)
	private String name;

	@Column(nullable = false, length = 50, unique = true)
	private String email;

	@Builder // 빌더 패턴을 사용하여 객체 생성
	public User(String name, String email) {
		this.name = name;
		this.email = email;
	}

	/**
	 * 사용자 정보 수정 메서드
	 *
	 * 학습 포인트: - JPA에서는 엔티티 객체를 직접 수정하면 트랜잭션 끝날 때 자동으로 UPDATE 쿼리 실행 - 이것을 "더티
	 * 체킹(Dirty Checking)" 이라고 합니다 - Setter를 열지 않고 의미 있는 메서드명(update)을 사용하는 것이 좋은
	 * 설계입니다
	 */
	public void update(String name, String email) {
		if (name != null) {
			this.name = name;
		}
		if (email != null) {
			this.email = email;
		}
	}
}
