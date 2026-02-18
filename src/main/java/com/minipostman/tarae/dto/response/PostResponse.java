package com.minipostman.tarae.dto.response;

import java.time.LocalDateTime;

import com.minipostman.tarae.domain.Post;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class PostResponse {

	private Long id;
	private String title;
	private String content;
	private Long userId;
	private String authorName;
	private LocalDateTime createdAt;
	private LocalDateTime updatedAt;

	public static PostResponse from(Post post) {
		return PostResponse.builder()
				.id(post.getId())
				.title(post.getTitle())
				.content(post.getContent())
				.userId(post.getAuthor() != null ? post.getAuthor().getId() : null)
				.authorName(post.getAuthor() != null ? post.getAuthor().getName() : null)
				.createdAt(post.getCreatedAt())
				.updatedAt(post.getUpdatedAt())
				.build();
	}
}
