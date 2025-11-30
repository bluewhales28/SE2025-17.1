package com.example.class_assignment_service.service;

import com.example.class_assignment_service.dto.request.CreateClassRequest;
import com.example.class_assignment_service.dto.response.ClassResponse;
import com.example.class_assignment_service.model.ClassEntity;
import com.example.class_assignment_service.model.ClassMember;
import com.example.class_assignment_service.model.enums.MemberRole;
import com.example.class_assignment_service.repository.ClassMemberRepository;
import com.example.class_assignment_service.repository.ClassRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ClassServiceTest {
    
    @Mock
    private ClassRepository classRepository;
    
    @Mock
    private ClassMemberRepository classMemberRepository;
    
    @Mock
    private PermissionService permissionService;
    
    @InjectMocks
    private ClassService classService;
    
    private CreateClassRequest createClassRequest;
    private ClassEntity classEntity;
    private Long userId = 1L;
    
    @BeforeEach
    void setUp() {
        createClassRequest = CreateClassRequest.builder()
            .name("Test Class")
            .description("Test Description")
            .subject("Math")
            .build();
        
        classEntity = ClassEntity.builder()
            .id(1L)
            .name("Test Class")
            .description("Test Description")
            .subject("Math")
            .createdBy(userId)
            .build();
    }
    
    @Test
    void testCreateClass() {
        when(classRepository.save(any(ClassEntity.class))).thenReturn(classEntity);
        when(classMemberRepository.save(any(ClassMember.class))).thenReturn(new ClassMember());
        when(classMemberRepository.countByClassIdAndRole(anyLong(), any())).thenReturn(1L);
        
        ClassResponse response = classService.createClass(createClassRequest, userId);
        
        assertNotNull(response);
        assertEquals("Test Class", response.getName());
        verify(classRepository, times(1)).save(any(ClassEntity.class));
        verify(classMemberRepository, times(1)).save(any(ClassMember.class));
    }
    
    @Test
    void testGetClassById() {
        when(classRepository.findById(1L)).thenReturn(Optional.of(classEntity));
        doNothing().when(permissionService).checkMemberAccess(1L, userId);
        when(classMemberRepository.countByClassIdAndRole(anyLong(), any())).thenReturn(1L);
        
        ClassResponse response = classService.getClassById(1L, userId);
        
        assertNotNull(response);
        assertEquals("Test Class", response.getName());
    }
}

