package com.minipostman.tarae.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.minipostman.tarae.domain.Post;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {

	// 특정 사용자가 작성한 게시글 전체 조회
	// → SELECT * FROM posts WHERE user_id = ?
	List<Post> findByAuthorId(Long authorId);

}
