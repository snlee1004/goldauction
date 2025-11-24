package com.example.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.backend.entity.BoardNoticeSetting;

public interface BoardNoticeSettingRepository extends JpaRepository<BoardNoticeSetting, Long> {
}

