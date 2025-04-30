package com.checkmate.checkit.auth.entity;

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
import jakarta.persistence.OneToOne;
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

	@OneToOne
	@JoinColumn(name = "user_id", nullable = false)
	private User user;

	@Enumerated(EnumType.STRING)
	@Column(name = "service_provider", nullable = false, length = 10)
	private AuthProvider serviceProvider;

	@Column(name = "access_token", nullable = false, length = 100)
	private String accessToken;

	@Builder
	public OAuthToken(User user, AuthProvider serviceProvider, String accessToken) {
		this.user = user;
		this.serviceProvider = serviceProvider;
		this.accessToken = accessToken;
	}

	public void updateAccessToken(String accessToken) {
		this.accessToken = accessToken;
	}
}
