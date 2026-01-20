package com.taskmanager.service;

import com.taskmanager.dto.TaskDto;
import com.taskmanager.model.Project;
import com.taskmanager.model.Task;
import com.taskmanager.model.User;
import com.taskmanager.repository.ProjectRepository;
import com.taskmanager.repository.TaskRepository;
import com.taskmanager.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class TaskService {
    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    public List<TaskDto> getAllTasks(Long projectId, Long assigneeId) {
        List<Task> tasks;
        if (projectId != null) {
            tasks = taskRepository.findByProjectId(projectId);
        } else if (assigneeId != null) {
            tasks = taskRepository.findByAssigneeId(assigneeId);
        } else {
            tasks = taskRepository.findAll();
        }
        return tasks.stream().map(this::toDto).collect(Collectors.toList());
    }

    public TaskDto getTaskById(Long id) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found"));
        return toDto(task);
    }

    @Transactional
    public TaskDto createTask(TaskDto taskDto, String username) {
        User reporter = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Project project = projectRepository.findById(taskDto.getProjectId())
                .orElseThrow(() -> new RuntimeException("Project not found"));

        Task task = new Task();
        task.setTitle(taskDto.getTitle());
        task.setDescription(taskDto.getDescription());
        task.setType(taskDto.getType() != null ? taskDto.getType() : Task.TaskType.TASK);
        task.setStatus(taskDto.getStatus() != null ? taskDto.getStatus() : Task.TaskStatus.TODO);
        task.setPriority(taskDto.getPriority() != null ? taskDto.getPriority() : Task.Priority.MEDIUM);
        task.setProject(project);
        task.setReporter(reporter);

        if (taskDto.getAssigneeId() != null) {
            User assignee = userRepository.findById(taskDto.getAssigneeId())
                    .orElseThrow(() -> new RuntimeException("Assignee not found"));
            task.setAssignee(assignee);
        }

        // Генерация ключа задачи
        String projectKey = project.getKey();
        long taskNumber = taskRepository.count() + 1;
        task.setKey(projectKey + "-" + taskNumber);

        task = taskRepository.save(task);
        return toDto(task);
    }

    @Transactional
    public TaskDto updateTask(Long id, TaskDto taskDto, String username) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        if (taskDto.getTitle() != null) task.setTitle(taskDto.getTitle());
        if (taskDto.getDescription() != null) task.setDescription(taskDto.getDescription());
        if (taskDto.getType() != null) task.setType(taskDto.getType());
        if (taskDto.getPriority() != null) task.setPriority(taskDto.getPriority());

        // Обработка изменения статуса
        if (taskDto.getStatus() != null) {
            Task.TaskStatus newStatus = taskDto.getStatus();
            task.setStatus(newStatus);

            // Если статус меняется на IN_PROGRESS и у задачи нет исполнителя, назначаем текущего пользователя
            if (newStatus == Task.TaskStatus.IN_PROGRESS && task.getAssignee() == null) {
                log.info("TaskService.updateTask - Assigning task to user: {}", username);
                User currentUser = userRepository.findByUsername(username)
                        .orElseGet(() -> {
                            log.info("User not found by username, trying by email: {}", username);
                            return userRepository.findByEmail(username)
                                    .orElseThrow(() -> new RuntimeException("User not found with username/email: " + username));
                        });
                log.info("TaskService.updateTask - Found user: ID={}, Username={}", currentUser.getId(), currentUser.getUsername());
                task.setAssignee(currentUser);
            }
            // Если статус меняется на TODO, убираем исполнителя
            else if (newStatus == Task.TaskStatus.TODO) {
                task.setAssignee(null);
            }
        }

        // Если assigneeId явно указан в DTO, используем его (для ручного назначения)
        if (taskDto.getAssigneeId() != null) {
            User assignee = userRepository.findById(taskDto.getAssigneeId())
                    .orElseThrow(() -> new RuntimeException("Assignee not found"));
            task.setAssignee(assignee);
        }

        task = taskRepository.save(task);
        return toDto(task);
    }

    @Transactional
    public void deleteTask(Long id) {
        taskRepository.deleteById(id);
    }

    private TaskDto toDto(Task task) {
        TaskDto dto = new TaskDto();
        dto.setId(task.getId());
        dto.setTitle(task.getTitle());
        dto.setDescription(task.getDescription());
        dto.setKey(task.getKey());
        dto.setType(task.getType());
        dto.setStatus(task.getStatus());
        dto.setPriority(task.getPriority());
        dto.setProjectId(task.getProject().getId());
        dto.setProjectName(task.getProject().getName());
        dto.setReporterId(task.getReporter().getId());
        dto.setReporterUsername(task.getReporter().getUsername());
        if (task.getAssignee() != null) {
            dto.setAssigneeId(task.getAssignee().getId());
            dto.setAssigneeUsername(task.getAssignee().getUsername());
        }
        dto.setCreatedAt(task.getCreatedAt());
        dto.setUpdatedAt(task.getUpdatedAt());
        return dto;
    }
}

