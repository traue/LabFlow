package br.com.traue.labflow.auth.repository;

import br.com.traue.labflow.auth.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);

    @Query("SELECT u FROM User u LEFT JOIN u.profile p WHERE " +
           "LOWER(u.username) LIKE :term OR " +
           "LOWER(u.email) LIKE :term OR " +
           "LOWER(p.fullName) LIKE :term")
    List<User> searchByTerm(@Param("term") String term);
}
