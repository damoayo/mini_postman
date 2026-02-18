package com.minipostman.tarae.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
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

	@GetMapping
	public ResponseEntity<List<PostResponse>> getAllPosts() {
		return ResponseEntity.ok(postService.findAll());
	}

	@GetMapping("/{id}")
	public ResponseEntity<PostResponse> getPostById(@PathVariable("id") Long id) {
		return ResponseEntity.ok(postService.findById(id));
	}

	@GetMapping(params = "userId")
	public ResponseEntity<List<PostResponse>> getPostsByUserId(@RequestParam("userId") Long userId) {
		return ResponseEntity.ok(postService.findByUserId(userId));
	}

	@PostMapping
	public ResponseEntity<PostResponse> createPost(@Valid @RequestBody PostCreateRequest request) {
		return ResponseEntity.status(HttpStatus.CREATED).body(postService.create(request));
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<Void> deletePost(@PathVariable("id") Long id) {
		postService.delete(id);
		return ResponseEntity.noContent().build();
	}
}
