package com.taskmanager.dto;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class ProjectDto {
    private Long id;
    private String name;
    private String description;
    private String key;
    private Long ownerId;
    private String ownerUsername;
    private List<Long> memberIds;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

