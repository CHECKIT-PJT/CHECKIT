package com.checkmate.checkit.user.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.checkmate.checkit.global.code.ErrorCode;
import com.checkmate.checkit.global.config.JwtTokenProvider;
import com.checkmate.checkit.global.exception.CommonException;
import com.checkmate.checkit.user.dto.response.UserResponse;
import com.checkmate.checkit.user.entity.User;
import com.checkmate.checkit.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService {
	private final UserRepository userRepository;
	private final JwtTokenProvider jwtTokenProvider;

	@Transactional(readOnly = true)
	public UserResponse getUserInfo(String token) {

		Integer userId = jwtTokenProvider.getUserIdFromToken(token);

		User user = userRepository.findById(userId)
			.orElseThrow(() -> new CommonException(ErrorCode.USER_NOT_FOUND));

		return new UserResponse(user);
	}
}
