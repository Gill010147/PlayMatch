package com.playmatch.playmatch;

import com.playmatch.playmatch.config.TestRedisConfig;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import javax.sql.DataSource;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Import(TestRedisConfig.class)  // 추가: TestConfiguration Import
public abstract class BaseTest {

    @PersistenceContext
    protected EntityManager entityManager;

    @Autowired
    protected DataSource dataSource;

    @Autowired
    protected RedisTemplate<String, Object> redisTemplate;

    @Autowired
    protected SimpMessageSendingOperations messagingTemplate;

    @BeforeEach
    void baseSetUp() {
        // EntityManager 초기화
        if (entityManager != null) {
            entityManager.clear();
            entityManager.getEntityManagerFactory().getCache().evictAll();
        }
    }
}
