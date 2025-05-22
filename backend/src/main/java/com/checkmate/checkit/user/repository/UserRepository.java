package com.checkmate.checkit.user.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.checkmate.checkit.global.common.enums.AuthProvider;
import com.checkmate.checkit.user.entity.User;

public interface UserRepository extends JpaRepository<User, Integer> {

	Optional<User> findByExternalIdAndLoginProvider(String externalId, AuthProvider provider);
}
