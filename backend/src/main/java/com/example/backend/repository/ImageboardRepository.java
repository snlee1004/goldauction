package com.example.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.backend.entity.Imageboard;


public interface ImageboardRepository extends JpaRepository<Imageboard, Integer>{
	@Query(value = "select * from "
				 + "(select rownum rn, tt.* from "
				 + "(select * from imageboard order by seq desc) tt) "
				 + "where rn>=:startNum and rn<=:endNum", nativeQuery = true)
	List<Imageboard> findByStartnumAndEndnum(@Param("startNum") int startNum,
											 @Param("endNum") int endNum);
	
	// 검색어가 포함된 목록 조회
	@Query(value = "select * from "
				 + "(select rownum rn, tt.* from "
				 + "(select * from imageboard where imagename like '%'||:keyword||'%' order by seq desc) tt) "
				 + "where rn>=:startNum and rn<=:endNum", nativeQuery = true)
	List<Imageboard> findByKeywordAndStartnumAndEndnum(@Param("keyword") String keyword,
														@Param("startNum") int startNum,
														@Param("endNum") int endNum);
	
	// 검색어가 포함된 총 글 수
	@Query(value = "select count(*) from imageboard where imagename like '%'||:keyword||'%'", nativeQuery = true)
	int getCountByKeyword(@Param("keyword") String keyword);
}
