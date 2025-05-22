package com.checkmate.checkit.user.dto.response;

import java.time.LocalDateTime;

import com.checkmate.checkit.user.entity.User;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class UserResponse {
	private Integer id;
	private String externalId;
	private String username;
	private String nickname;
	private String email;
	private String provider;
	private LocalDateTime createdAt;
	private LocalDateTime updatedAt;

	public UserResponse(User user) {
		this.id = user.getId();
		this.externalId = user.getExternalId();
		this.username = user.getUserName();
		this.nickname = user.getNickname();
		this.email = user.getUserEmail();
		this.provider = user.getLoginProvider().name();
		this.createdAt = user.getCreatedAt();
		this.updatedAt = user.getUpdatedAt();
	}
}
