package com.checkmate.checkit.auth.dto.response;

import com.checkmate.checkit.user.dto.response.LoginResponse;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class AuthResponse {
	private String accessToken;
	private LoginResponse user;

	public AuthResponse(String accessToken, LoginResponse user) {
		this.accessToken = accessToken;
		this.user = user;
	}
}
