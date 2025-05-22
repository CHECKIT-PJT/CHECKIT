package com.checkmate.checkit.project.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.checkmate.checkit.project.entity.JiraProjectEntity;

@Repository
public interface JiraProjectRepository extends JpaRepository<JiraProjectEntity, Integer> {

}
