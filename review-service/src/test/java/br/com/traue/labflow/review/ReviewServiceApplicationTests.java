package br.com.traue.labflow.review;

import com.fasterxml.jackson.databind.ObjectMapper;
import br.com.traue.labflow.review.dto.ReviewRequest;
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
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.List;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class ReviewServiceApplicationTests {

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
    void createAndListReviews_shouldSucceed() throws Exception {
        ReviewRequest reviewReq = ReviewRequest.builder()
                .submissionId(100L)
                .comment("Good work")
                .score(new BigDecimal("85.00"))
                .maxScore(new BigDecimal("100.00"))
                .build();

        String reviewJson = mockMvc.perform(post("/api/reviews")
                        .header("Authorization", "Bearer " + profToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(reviewReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.submissionId").value(100))
                .andExpect(jsonPath("$.comment").value("Good work"))
                .andExpect(jsonPath("$.score").value(85.00))
                .andReturn().getResponse().getContentAsString();

        Long reviewId = objectMapper.readTree(reviewJson).get("id").asLong();

        mockMvc.perform(get("/api/reviews/" + reviewId)
                        .header("Authorization", "Bearer " + profToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.comment").value("Good work"));

        mockMvc.perform(get("/api/submissions/100/reviews")
                        .header("Authorization", "Bearer " + profToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].submissionId").value(100));
    }

    @Test
    void unauthenticatedRequest_shouldReturn403() throws Exception {
        mockMvc.perform(get("/api/reviews/1"))
                .andExpect(status().isForbidden());
    }

    @Test
    void studentCannotCreateReview() throws Exception {
        String studentToken = generateToken(2L, "student1", "ROLE_STUDENT");
        ReviewRequest reviewReq = ReviewRequest.builder()
                .submissionId(1L)
                .comment("Self review")
                .build();

        mockMvc.perform(post("/api/reviews")
                        .header("Authorization", "Bearer " + studentToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(reviewReq)))
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
