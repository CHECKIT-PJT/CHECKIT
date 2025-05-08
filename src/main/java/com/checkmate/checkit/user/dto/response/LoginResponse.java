package com.checkmate.checkit.user.dto.response;

import com.checkmate.checkit.user.entity.User;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class LoginResponse {
	private Integer userId;
	private String userName;
	private String nickname;
	private String provider;

	public LoginResponse(User user) {
		this.userId = user.getId();
		this.userName = user.getUserName();
		this.nickname = user.getNickname();
		this.provider = user.getLoginProvider().name();
	}
}
