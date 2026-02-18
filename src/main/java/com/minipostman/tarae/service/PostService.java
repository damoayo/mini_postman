package com.minipostman.tarae.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.minipostman.tarae.domain.Post;
import com.minipostman.tarae.domain.User;
import com.minipostman.tarae.dto.request.PostCreateRequest;
import com.minipostman.tarae.dto.response.PostResponse;
import com.minipostman.tarae.repository.PostRepository;
import com.minipostman.tarae.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PostService {

	private final PostRepository postRepository;
	private final UserRepository userRepository;

	// 전체 게시글 조회
	public List<PostResponse> findAll() {
		return postRepository.findAll().stream().map(PostResponse::from).toList();
	}

	public PostResponse findById(Long postId) {
		return postRepository.findById(postId).map(PostResponse::from)
				.orElseThrow(() -> new IllegalArgumentException("게시글이 존재하지 않습니다." + postId));
	}

	// 특정 사용자의 게시글 조회
	public List<PostResponse> findByAuthorId(Long authorId) {
		// 먼저 해당 User가 존재하는지 확인
		if (!userRepository.existsById(authorId)) {
			throw new IllegalArgumentException("작성자를 찾을 수 없습니다: " + authorId);
		}
		return postRepository.findByAuthorId(authorId).stream().map(PostResponse::from).toList();
	}

	// 게시글 생성
	@Transactional
	public PostResponse create(PostCreateRequest request) {
		// ★ authorId로 User Entity를 먼저 조회
		User author = userRepository.findById(request.getAuthorId())
				.orElseThrow(() -> new IllegalArgumentException("작성자를 찾을 수 없습니다: " + request.getAuthorId()));

		Post post = Post.builder().title(request.getTitle()).content(request.getContent()).author(author).build();

		Post savedPost = postRepository.save(post);
		return PostResponse.from(savedPost);
	}

	// 게시글 삭제
	@Transactional
	public void delete(Long id) {
		if (!postRepository.existsById(id)) {
			throw new IllegalArgumentException("게시글을 찾을 수 없습니다: " + id);
		}
		postRepository.deleteById(id);
	}

}
