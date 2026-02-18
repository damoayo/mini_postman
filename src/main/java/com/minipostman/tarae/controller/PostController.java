package com.minipostman.tarae.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.minipostman.tarae.dto.request.PostCreateRequest;
import com.minipostman.tarae.dto.response.PostResponse;
import com.minipostman.tarae.service.PostService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
public class PostController {

	private final PostService postService;

	// Get /api/posts → 전체 게시글 조회
	@GetMapping
	public ResponseEntity<List<PostResponse>> getAllPosts() {
		return ResponseEntity.ok(postService.findAll());
	}

	// 특정 게시글 조회
	@GetMapping("/{id}")
	public ResponseEntity<PostResponse> getPostById(@PathVariable("id") Long postId) {
		return ResponseEntity.ok(postService.findById(postId));
	}

	// GET /api/posts?authorId=1 → 특정 사용자의 게시글 조회
	@GetMapping(params = "authorId")
	public ResponseEntity<List<PostResponse>> getPostsByAuthor(@RequestParam("authorId") Long authorId) {
		return ResponseEntity.ok(postService.findByAuthorId(authorId));
	}

	@PostMapping
	public ResponseEntity<PostResponse> createPost(@Valid @RequestBody PostCreateRequest request) {
		return ResponseEntity.status(HttpStatus.CREATED).body(postService.create(request));

	}
}
