package com.taskmanager.dto;

import com.taskmanager.model.Task;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class TaskDto {
    private Long id;
    private String title;
    private String description;
    private String key;
    private Task.TaskType type;
    private Task.TaskStatus status;
    private Task.Priority priority;
    private Long projectId;
    private String projectName;
    private Long reporterId;
    private String reporterUsername;
    private Long assigneeId;
    private String assigneeUsername;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

