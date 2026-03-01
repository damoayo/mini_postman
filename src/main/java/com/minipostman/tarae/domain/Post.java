package com.minipostman.tarae.domain;

import com.minipostman.tarae.domain.common.BaseEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@Table(name = "posts")
@NoArgsConstructor
public class Post extends BaseEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false, length = 200)
	private String title;

	@Column(columnDefinition = "TEXT")
	private String content;

	@ManyToOne(fetch = FetchType.LAZY) // 지연 로딩으로 설정하여 필요할 때만 User 엔티티를 로드
	@JoinColumn(name = "user_id") // 외래 키 컬럼 이름 지정
	private User author;

	@Builder
	public Post(String title, String content, User author) {
		this.title = title;
		this.content = content;
		this.author = author;
	}

	/**
	 * 게시글 수정 — 작성자(author)는 변경 불가
	 *
	 * 학습 포인트: - 엔티티 설계 시 "무엇을 수정 가능하게 할 것인가"를 결정하는 것이 중요 - 작성자는 게시글의 핵심 속성이므로 변경
	 * 불가로 설계
	 */
	public void update(String title, String content) {
		if (title != null) {
			this.title = title;
		}
		if (content != null) {
			this.content = content;
		}
	}

}
