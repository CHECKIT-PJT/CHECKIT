package com.checkmate.checkit.auth.controller;

import java.net.URI;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.checkmate.checkit.auth.dto.response.AuthResponse;
import com.checkmate.checkit.auth.service.AuthService;
import com.checkmate.checkit.global.code.SuccessCode;
import com.checkmate.checkit.global.response.JSONResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

	private final AuthService authService;

	/**
	 * GitHub 로그인 시작
	 * 사용자를 GitHub 인증 페이지로 리다이렉트
	 */
	@GetMapping("/github/login")
	public ResponseEntity<Void> githubLogin() {
		String githubLoginUrl = authService.getGithubLoginUrl();

		HttpHeaders headers = new HttpHeaders();
		headers.setLocation(URI.create(githubLoginUrl));

		// 302 Found : GitHub 인증 페이지로 리다이렉트
		return new ResponseEntity<>(headers, HttpStatus.FOUND);
	}

	/**
	 * GitHub 로그인 콜백
	 * 사용자가 GitHub 인증 후 리다이렉트되는 URL
	 */
	@GetMapping("/github/callback")
	public ResponseEntity<JSONResponse<AuthResponse>> githubCallback(@RequestParam("code") String code,
		HttpServletResponse response) {

		AuthResponse authResponse = authService.processGithubCallback(code, response);

		return ResponseEntity.ok(JSONResponse.of(SuccessCode.REQUEST_SUCCESS, authResponse));
	}

	/**
	 * GitLab 로그인 시작
	 * 사용자를 GitLab 인증 페이지로 리다이렉트
	 */
	@GetMapping("/gitlab/login")
	public ResponseEntity<Void> gitlabLogin() {
		String gitlabLoginUrl = authService.getGitlabLoginUrl();

		HttpHeaders headers = new HttpHeaders();
		headers.setLocation(URI.create(gitlabLoginUrl));

		// 302 Found : GitLab 인증 페이지로 리다이렉트
		return new ResponseEntity<>(headers, HttpStatus.FOUND);
	}

	/**
	 * GitLab 로그인 콜백
	 * 사용자가 GitLab 인증 후 리다이렉트되는 URL
	 */
	@GetMapping("/gitlab/callback")
	public ResponseEntity<JSONResponse<AuthResponse>> gitlabCallback(@RequestParam("code") String code,
		HttpServletResponse response) {

		AuthResponse authResponse = authService.processGitlabCallback(code, response);

		return ResponseEntity.ok(JSONResponse.of(SuccessCode.REQUEST_SUCCESS, authResponse));
	}

	/**
	 * 액세스 토큰 갱신
	 * 리프레시 토큰은 HttpOnly 쿠키에서 읽음
	 */
	@PostMapping("/refresh")
	public ResponseEntity<JSONResponse<AuthResponse>> refresh(HttpServletRequest request,
		HttpServletResponse response) {

		AuthResponse authResponse = authService.refreshToken(request, response);

		return ResponseEntity.ok(JSONResponse.of(SuccessCode.REQUEST_SUCCESS, authResponse));
	}

	/**
	 * 토큰 유효성 검사
	 */
	@GetMapping("/verify")
	public ResponseEntity<JSONResponse<Void>> verify(@RequestHeader("Authorization") String authorization) {
		String token = authorization.substring(7); // "Bearer" 제거

		authService.verifyToken(token);

		return ResponseEntity.ok(JSONResponse.of(SuccessCode.VERIFY_SUCCESS));
	}

	/**
	 * 로그아웃
	 */
	@PostMapping("/logout")
	public ResponseEntity<JSONResponse<Void>> logout(@RequestHeader("Authorization") String authorization,
		HttpServletResponse response) {
		String token = authorization.substring(7); // "Bearer" 제거

		authService.logout(token, response);

		return ResponseEntity.ok(JSONResponse.of(SuccessCode.REQUEST_SUCCESS));
	}

	/**
	 * Jira 로그인 콜백
	 * 사용자가 Jira 인증 후 리다이렉트되는 URL
	 */
	@GetMapping("/jira/callback")
	public ResponseEntity<JSONResponse<Void>> jiraCallback(@RequestHeader("Authorization") String authorization,
		@RequestParam("code") String code,
		HttpServletResponse response) {

		String token = authorization.substring(7);

		authService.processJiraCallback(token, code, response);

		return ResponseEntity.ok(JSONResponse.of(SuccessCode.REQUEST_SUCCESS));
	}
}
