package com.checkmate.checkit.user.entity;

import com.checkmate.checkit.global.common.entity.BaseEntity;
import com.checkmate.checkit.global.common.enums.AuthProvider;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "Users")
@Getter
@NoArgsConstructor
public class User extends BaseEntity {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer id;

	@Column(name = "external_id", nullable = false, length = 50)
	private String externalId;

	@Column(name = "user_name", nullable = false, length = 30)
	private String userName;

	@Column(name = "user_email", nullable = false, length = 50)
	private String userEmail;

	@Enumerated(EnumType.STRING)
	@Column(name = "login_provider", nullable = false, length = 10)
	private AuthProvider loginProvider;

	@Column(name = "refresh_token", length = 200)
	private String refreshToken;

	@Builder
	public User(String externalId, String userName, String userEmail, AuthProvider loginProvider, String refreshToken) {
		this.externalId = externalId;
		this.userName = userName;
		this.userEmail = userEmail;
		this.loginProvider = loginProvider;
		this.refreshToken = refreshToken;
	}

	public void updateRefreshToken(String refreshToken) {
		this.refreshToken = refreshToken;
	}

	public void updateUserName(String userName) {
		this.userName = userName;
	}

	public void updateUserEmail(String email) {
		this.userEmail = email;
	}
}
