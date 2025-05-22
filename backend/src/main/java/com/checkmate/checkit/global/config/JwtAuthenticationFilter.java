package com.checkmate.checkit.global.config;

import java.io.IOException;
import java.util.Collections;
import java.util.Optional;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import com.checkmate.checkit.user.entity.User;
import com.checkmate.checkit.user.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RequiredArgsConstructor
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {

	private final JwtTokenProvider jwtTokenProvider;
	private final UserRepository userRepository;

	@Override
	protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
		FilterChain filterChain) throws ServletException, IOException {
		try {
			String jwt = extractJwtFromRequest(request);

			if (StringUtils.hasText(jwt) && jwtTokenProvider.validateToken(jwt)) {
				// 블랙 리스트 체크
				if (jwtTokenProvider.isTokenBlacklisted(jwt)) {
					log.warn("블랙리스트에 등록된 JWT 토큰입니다.");
					throw new ServletException("블랙리스트에 등록된 JWT 토큰입니다.");
				}

				Integer userId = jwtTokenProvider.getUserIdFromToken(jwt);

				Optional<User> userOptional = userRepository.findById(userId);

				if (userOptional.isPresent()) {
					User user = userOptional.get();

					// 인증 객체 생성 및 SecurityContext에 저장
					UsernamePasswordAuthenticationToken authentication =
						new UsernamePasswordAuthenticationToken(
							user,
							null,
							Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER"))
						);

					SecurityContextHolder.getContext().setAuthentication(authentication);
				}
			}
		} catch (Exception ex) {
			log.error("JWT 인증에 실패했습니다", ex);
		}

		filterChain.doFilter(request, response);
	}

	private String extractJwtFromRequest(HttpServletRequest request) {
		String bearerToken = request.getHeader("Authorization");
		if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
			return bearerToken.substring(7);
		}
		return null;
	}
}
