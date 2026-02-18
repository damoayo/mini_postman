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
	private Long authorId;
	private String authorName;
	private LocalDateTime createdAt;
	private LocalDateTime updatedAt;

	public static PostResponse from(Post post) {
		return PostResponse.builder().id(post.getId()).title(post.getTitle()).content(post.getContent())
				.authorId(post.getAuthor().getId()).authorName(post.getAuthor().getName())
				.createdAt(post.getCreatedAt()).updatedAt(post.getUpdatedAt()).build();
	}

}
