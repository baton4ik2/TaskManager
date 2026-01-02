package com.taskmanager.controller;

import com.taskmanager.dto.ProjectDto;
import com.taskmanager.service.ProjectService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/projects")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ProjectController {
    private final ProjectService projectService;

    @GetMapping
    public ResponseEntity<List<ProjectDto>> getAllProjects(Authentication authentication) {
        return ResponseEntity.ok(projectService.getAllProjects(authentication.getName()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProjectDto> getProjectById(@PathVariable Long id) {
        return ResponseEntity.ok(projectService.getProjectById(id));
    }

    @PostMapping
    public ResponseEntity<ProjectDto> createProject(@Valid @RequestBody ProjectDto projectDto, Authentication authentication) {
        return ResponseEntity.ok(projectService.createProject(projectDto, authentication.getName()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProjectDto> updateProject(@PathVariable Long id, @Valid @RequestBody ProjectDto projectDto) {
        return ResponseEntity.ok(projectService.updateProject(id, projectDto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProject(@PathVariable Long id) {
        projectService.deleteProject(id);
        return ResponseEntity.noContent().build();
    }
}

