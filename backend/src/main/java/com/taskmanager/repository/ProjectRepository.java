package com.taskmanager.repository;

import com.taskmanager.model.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {
    Optional<Project> findByKey(String key);
    List<Project> findByOwnerId(Long ownerId);
    List<Project> findByMembersId(Long memberId);
    
    @Query("SELECT DISTINCT p FROM Project p LEFT JOIN p.members m WHERE p.owner.id = :userId OR m.id = :userId")
    List<Project> findByOwnerIdOrMembersId(@Param("userId") Long userId);
}

