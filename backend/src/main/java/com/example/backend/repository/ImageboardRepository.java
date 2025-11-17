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
}
