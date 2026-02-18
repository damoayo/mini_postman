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

	public List<PostResponse> findAll() {
		return postRepository.findAll().stream().map(PostResponse::from).toList();
	}

	public PostResponse findById(Long id) {
		Post post = postRepository.findById(id)
				.orElseThrow(() -> new IllegalArgumentException("게시글을 찾을 수 없습니다: " + id));
		return PostResponse.from(post);
	}

	public List<PostResponse> findByUserId(Long userId) {
		return postRepository.findByAuthorId(userId).stream().map(PostResponse::from).toList();
	}

	@Transactional
	public PostResponse create(PostCreateRequest request) {
		User author = userRepository.findById(request.getUserId())
				.orElseThrow(() -> new IllegalArgumentException("작성자를 찾을 수 없습니다: " + request.getUserId()));

		Post post = Post.builder()
				.title(request.getTitle())
				.content(request.getContent())
				.author(author)
				.build();

		Post savedPost = postRepository.save(post);
		return PostResponse.from(savedPost);
	}

	@Transactional
	public void delete(Long id) {
		if (!postRepository.existsById(id)) {
			throw new IllegalArgumentException("게시글을 찾을 수 없습니다: " + id);
		}
		postRepository.deleteById(id);
	}
}
