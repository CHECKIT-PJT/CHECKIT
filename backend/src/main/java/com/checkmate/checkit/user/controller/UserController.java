package com.checkmate.checkit.user.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.checkmate.checkit.global.code.SuccessCode;
import com.checkmate.checkit.global.response.JSONResponse;
import com.checkmate.checkit.user.dto.response.UserResponse;
import com.checkmate.checkit.user.service.UserService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

	private final UserService userService;

	@GetMapping("/info")
	public ResponseEntity<JSONResponse<UserResponse>> getUserInfo(
		@RequestHeader("Authorization") String authorization) {

		String token = authorization.substring(7); // "Bearer" 제거

		UserResponse userInfo = userService.getUserInfo(token);

		return ResponseEntity.ok(JSONResponse.of(SuccessCode.SEARCH_SUCCESS, userInfo));
	}
}
