package com.checkmate.checkit.auth.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.checkmate.checkit.auth.entity.OAuthToken;
import com.checkmate.checkit.global.common.enums.AuthProvider;

@Repository
public interface OAuthTokenRepository extends JpaRepository<OAuthToken, Integer> {
	Optional<OAuthToken> findByUserIdAndServiceProvider(Integer userId, AuthProvider authProvider);

	Optional<OAuthToken> findByUserId(Integer userId);
}
