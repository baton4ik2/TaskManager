package com.taskmanager.service;

import com.taskmanager.dto.ProjectDto;
import com.taskmanager.model.Project;
import com.taskmanager.model.User;
import com.taskmanager.repository.ProjectRepository;
import com.taskmanager.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProjectService {
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    public List<ProjectDto> getAllProjects(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        List<Project> projects = projectRepository.findByOwnerIdOrMembersId(user.getId());
        return projects.stream().map(this::toDto).collect(Collectors.toList());
    }

    public ProjectDto getProjectById(Long id) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        return toDto(project);
    }

    @Transactional
    public ProjectDto createProject(ProjectDto projectDto, String username) {
        User owner = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Project project = new Project();
        project.setName(projectDto.getName());
        project.setDescription(projectDto.getDescription());
        project.setKey(projectDto.getKey().toUpperCase());
        project.setOwner(owner);

        project = projectRepository.save(project);
        return toDto(project);
    }

    @Transactional
    public ProjectDto updateProject(Long id, ProjectDto projectDto) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        if (projectDto.getName() != null) project.setName(projectDto.getName());
        if (projectDto.getDescription() != null) project.setDescription(projectDto.getDescription());
        if (projectDto.getKey() != null) project.setKey(projectDto.getKey().toUpperCase());

        project = projectRepository.save(project);
        return toDto(project);
    }

    @Transactional
    public void deleteProject(Long id) {
        projectRepository.deleteById(id);
    }

    private ProjectDto toDto(Project project) {
        ProjectDto dto = new ProjectDto();
        dto.setId(project.getId());
        dto.setName(project.getName());
        dto.setDescription(project.getDescription());
        dto.setKey(project.getKey());
        dto.setOwnerId(project.getOwner().getId());
        dto.setOwnerUsername(project.getOwner().getUsername());
        dto.setMemberIds(project.getMembers().stream().map(User::getId).collect(Collectors.toList()));
        dto.setCreatedAt(project.getCreatedAt());
        dto.setUpdatedAt(project.getUpdatedAt());
        return dto;
    }
}

