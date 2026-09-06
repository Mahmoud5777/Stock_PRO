package com.stockpro.repository.administration;

import com.stockpro.entity.administration.RefreshToken;
import com.stockpro.entity.administration.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;
import java.util.Optional;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, UUID> {

    // JOIN FETCH : le champ `user` est en FetchType.LAZY sur RefreshToken.
    // Sans ce fetch, `existing.getUser()` appelé plus tard côté controller
    // (hors de la transaction @Transactional(readOnly=true) de ce repository)
    // lève "Could not initialize proxy [...User...] - no session" (LazyInitializationException),
    // typiquement sur /api/auth/logout et /api/auth/refresh.
    @Query("SELECT r FROM RefreshToken r JOIN FETCH r.user WHERE r.token = :token")
    Optional<RefreshToken> findByToken(@Param("token") String token);

    @Modifying
    @Query("update RefreshToken r set r.revoked = true where r.user = :user and r.revoked = false")
    void revokeAllByUser(User user);

    void deleteByUser(User user);
}
