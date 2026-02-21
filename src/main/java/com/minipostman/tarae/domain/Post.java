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

}
