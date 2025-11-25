package com.example.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.backend.entity.Imageboard;


public interface ImageboardRepository extends JpaRepository<Imageboard, Integer>{
	@Query(value = "select * from "
				 + "(select rownum rn, tt.* from "
				 + "(select * from IMAGEBOARD1 order by seq desc) tt) "
				 + "where rn>=:startNum and rn<=:endNum", nativeQuery = true)
	List<Imageboard> findByStartnumAndEndnum(@Param("startNum") int startNum,
											 @Param("endNum") int endNum);
	
	// 검색어가 포함된 목록 조회
	@Query(value = "select * from "
				 + "(select rownum rn, tt.* from "
				 + "(select * from IMAGEBOARD1 where imagename like '%'||:keyword||'%' order by seq desc) tt) "
				 + "where rn>=:startNum and rn<=:endNum", nativeQuery = true)
	List<Imageboard> findByKeywordAndStartnumAndEndnum(@Param("keyword") String keyword,
														@Param("startNum") int startNum,
														@Param("endNum") int endNum);
	
	// 검색어가 포함된 총 글 수
	@Query(value = "select count(*) from IMAGEBOARD1 where imagename like '%'||:keyword||'%'", nativeQuery = true)
	int getCountByKeyword(@Param("keyword") String keyword);
	
	// 카테고리와 검색어가 포함된 목록 조회
	@Query(value = "select * from "
				 + "(select rownum rn, tt.* from "
				 + "(select * from IMAGEBOARD1 where imagename like '%'||:keyword||'%' and (:category is null or category = :category) order by seq desc) tt) "
				 + "where rn>=:startNum and rn<=:endNum", nativeQuery = true)
	List<Imageboard> findByKeywordAndCategoryAndStartnumAndEndnum(@Param("keyword") String keyword,
																  @Param("category") String category,
																  @Param("startNum") int startNum,
																  @Param("endNum") int endNum);
	
	// 카테고리와 검색어가 포함된 총 글 수
	@Query(value = "select count(*) from IMAGEBOARD1 where imagename like '%'||:keyword||'%' and (:category is null or category = :category)", nativeQuery = true)
	int getCountByKeywordAndCategory(@Param("keyword") String keyword, @Param("category") String category);
	
	// 포기된 경매 목록 조회
	@Query(value = "select * from "
				 + "(select rownum rn, tt.* from "
				 + "(select * from IMAGEBOARD1 where status = :status order by seq desc) tt) "
				 + "where rn>=:startNum and rn<=:endNum", nativeQuery = true)
	List<Imageboard> findByStatusAndStartnumAndEndnum(@Param("status") String status,
													  @Param("startNum") int startNum,
													  @Param("endNum") int endNum);
	
	// 포기된 경매 총 개수
	@Query(value = "select count(*) from IMAGEBOARD1 where status = :status", nativeQuery = true)
	int countByStatus(@Param("status") String status);
	
	// 회원 ID로 경매 목록 조회
	@Query(value = "select * from IMAGEBOARD1 where imageid = :imageid order by seq desc", nativeQuery = true)
	List<Imageboard> findByImageid(@Param("imageid") String imageid);
	
	// 회원 ID와 상태로 경매 목록 조회
	@Query(value = "select * from IMAGEBOARD1 where imageid = :imageid and status = :status order by seq desc", nativeQuery = true)
	List<Imageboard> findByImageidAndStatus(@Param("imageid") String imageid, @Param("status") String status);
	
	// 전체 목록 조회 (관리자용, 페이지네이션 없음)
	@Query(value = "select * from IMAGEBOARD1 order by seq desc", nativeQuery = true)
	List<Imageboard> findAllOrderBySeqDesc();
	
	// 검색어가 포함된 전체 목록 조회 (관리자용, 페이지네이션 없음)
	@Query(value = "select * from IMAGEBOARD1 where imagename like '%'||:keyword||'%' order by seq desc", nativeQuery = true)
	List<Imageboard> findAllByKeywordOrderBySeqDesc(@Param("keyword") String keyword);
}
