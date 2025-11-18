package com.example.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.backend.entity.ImageboardImages;

public interface ImageboardImagesRepository extends JpaRepository<ImageboardImages, Integer> {
	// 게시글 번호로 이미지 목록 조회 (순서대로)
	@Query(value = "select * from IMAGEBOARD_IMAGES1 where IMAGEBOARD_SEQ = :seq order by IMAGE_ORDER", nativeQuery = true)
	List<ImageboardImages> findByImageboardSeqOrderByImageOrder(@Param("seq") int seq);
	
	// 게시글 번호로 이미지 삭제
	void deleteByImageboardSeq(int imageboardSeq);
}

