package com.taskmanager.controller;

import com.taskmanager.dto.TaskDto;
import com.taskmanager.service.TaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/tasks")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class TaskController {
    private final TaskService taskService;

    @GetMapping
    public ResponseEntity<List<TaskDto>> getAllTasks(
            @RequestParam(required = false) Long projectId,
            @RequestParam(required = false) Long assigneeId
    ) {
        return ResponseEntity.ok(taskService.getAllTasks(projectId, assigneeId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TaskDto> getTaskById(@PathVariable Long id) {
        return ResponseEntity.ok(taskService.getTaskById(id));
    }

    @PostMapping
    public ResponseEntity<TaskDto> createTask(@Valid @RequestBody TaskDto taskDto, Authentication authentication) {
        return ResponseEntity.ok(taskService.createTask(taskDto, authentication.getName()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TaskDto> updateTask(@PathVariable Long id, @Valid @RequestBody TaskDto taskDto) {
        return ResponseEntity.ok(taskService.updateTask(id, taskDto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable Long id) {
        taskService.deleteTask(id);
        return ResponseEntity.noContent().build();
    }
}

