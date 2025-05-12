package com.checkmate.checkit.auth.entity;

import java.time.LocalDateTime;

import com.checkmate.checkit.global.common.enums.AuthProvider;
import com.checkmate.checkit.user.entity.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "OAuth_tokens")
@Getter
@NoArgsConstructor
public class OAuthToken {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer id;

	@ManyToOne
	@JoinColumn(name = "user_id", nullable = false)
	private User user;

	@Enumerated(EnumType.STRING)
	@Column(name = "service_provider", nullable = false, length = 10)
	private AuthProvider serviceProvider;

	@Column(name = "access_token", nullable = false, length = 100)
	private String accessToken;

	@Column(name = "refresh_token", length = 100)
	private String refreshToken;

	@Column(name = "expires_in")
	private LocalDateTime expiresIn;

	@Column(name = "cloud_id", length = 100)
	private String cloudId;

	@Builder
	public OAuthToken(User user, AuthProvider serviceProvider, String accessToken, String refreshToken,
		LocalDateTime expiresIn, String cloudId) {
		this.user = user;
		this.serviceProvider = serviceProvider;
		this.accessToken = accessToken;
		this.refreshToken = refreshToken;
		this.expiresIn = expiresIn;
		this.cloudId = cloudId;
	}

	public void updateAccessToken(String accessToken) {
		this.accessToken = accessToken;
	}
}
