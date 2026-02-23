package br.com.traue.labflow.project;

import com.fasterxml.jackson.databind.ObjectMapper;
import br.com.traue.labflow.project.dto.CourseRequest;
import br.com.traue.labflow.project.dto.ProjectRequest;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.List;
import java.util.Objects;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class ProjectServiceApplicationTests {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;
    @Value("${jwt.secret}") private String jwtSecret;

    private String profToken;

    @BeforeEach
    void setUp() {
        profToken = generateToken(1L, "prof1", "ROLE_PROF");
    }

    @Test
    void contextLoads() {
    }

    @Test
    void createCourseAndProject_shouldSucceed() throws Exception {
        // 1. Create a course (PROF role)
        CourseRequest courseReq = CourseRequest.builder()
                .code("CS101")
                .title("Intro to CS")
                .term("2025.1")
                .build();

        String courseJson = mockMvc.perform(post("/api/courses")
                        .header("Authorization", "Bearer " + profToken)
                        .contentType(Objects.requireNonNull(MediaType.APPLICATION_JSON))
                        .content(Objects.requireNonNull(objectMapper.writeValueAsString(courseReq))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.code").value("CS101"))
                .andExpect(jsonPath("$.term").value("2025.1"))
                .andReturn().getResponse().getContentAsString();

        Long courseId = objectMapper.readTree(courseJson).get("id").asLong();

        // 2. Create a project in the course
        ProjectRequest projectReq = ProjectRequest.builder()
                .title("Lab 1")
                .description("First lab project")
                .courseId(courseId)
                .build();

        mockMvc.perform(post("/api/courses/" + courseId + "/projects")
                        .header("Authorization", "Bearer " + profToken)
                        .contentType(Objects.requireNonNull(MediaType.APPLICATION_JSON))
                        .content(Objects.requireNonNull(objectMapper.writeValueAsString(projectReq))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title").value("Lab 1"))
                .andExpect(jsonPath("$.courseId").value(courseId));

        // 3. List courses
        mockMvc.perform(get("/api/courses")
                        .header("Authorization", "Bearer " + profToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].code").value("CS101"));

        // 4. List projects of the course
        mockMvc.perform(get("/api/courses/" + courseId + "/projects")
                        .header("Authorization", "Bearer " + profToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].title").value("Lab 1"));
    }

    @Test
    void unauthenticatedRequest_shouldReturn403() throws Exception {
        mockMvc.perform(get("/api/courses"))
                .andExpect(status().isForbidden());
    }

    @Test
    void studentCannotCreateCourse() throws Exception {
        String studentToken = generateToken(2L, "student1", "ROLE_STUDENT");
        CourseRequest courseReq = CourseRequest.builder()
                .code("CS202")
                .title("Data Structures")
                .term("2025.1")
                .build();

        mockMvc.perform(post("/api/courses")
                        .header("Authorization", "Bearer " + studentToken)
                        .contentType(Objects.requireNonNull(MediaType.APPLICATION_JSON))
                        .content(Objects.requireNonNull(objectMapper.writeValueAsString(courseReq))))
                .andExpect(status().isForbidden());
    }

    private String generateToken(Long userId, String username, String role) {
        SecretKey key = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
        return Jwts.builder()
                .subject(String.valueOf(userId))
                .claim("username", username)
                .claim("roles", List.of(role))
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + 3600000))
                .signWith(key)
                .compact();
    }
}
