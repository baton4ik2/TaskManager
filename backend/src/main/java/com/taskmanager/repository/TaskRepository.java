package com.taskmanager.repository;

import com.taskmanager.model.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    Optional<Task> findByKey(String key);
    List<Task> findByProjectId(Long projectId);
    List<Task> findByProjectIdIn(List<Long> projectIds);
    List<Task> findByAssigneeId(Long assigneeId);
    List<Task> findByReporterId(Long reporterId);
    List<Task> findByProjectIdAndStatus(Long projectId, Task.TaskStatus status);
}

