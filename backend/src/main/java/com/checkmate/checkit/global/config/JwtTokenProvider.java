package com.checkmate.checkit.global.config;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import com.checkmate.checkit.global.code.ErrorCode;
import com.checkmate.checkit.global.exception.CommonException;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.UnsupportedJwtException;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.SignatureException;
import jakarta.annotation.PostConstruct;
import jakarta.servlet.http.HttpServletRequest;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class JwtTokenProvider {

	@Value("${app.jwt.secret}")
	private String jwtSecret;

	@Getter
	@Value("${app.jwt.access-expiration}")
	private int jwtAccessExpiration;

	@Value("${app.jwt.refresh-expiration}")
	private int jwtRefreshExpiration;

	private Key key;

	@Autowired
	private RedisTemplate<String, Object> redisTemplate;

	// @PostConstruct를 사용하여 빈 초기화시 한 번만 키를 생성
	@PostConstruct
	public void init() {
		this.key = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
	}

	/**
	 * 액세스 토큰 생성 (짧은 유효기간)
	 */
	public String createAccessToken(Integer userId, String userName, String nickname) {
		Date now = new Date();
		Date expiryDate = new Date(now.getTime() + jwtAccessExpiration);

		return Jwts.builder()
			.setSubject(Integer.toString(userId))
			.claim("userName", userName)
			.claim("nickname", nickname)
			.setIssuedAt(now)
			.setExpiration(expiryDate)
			.signWith(key, SignatureAlgorithm.HS256)
			.compact();
	}

	/**
	 * 리프레시 토큰 생성 (긴 유효기간)
	 */
	public String createRefreshToken(Integer userId) {
		Date now = new Date();
		Date expiryDate = new Date(now.getTime() + jwtRefreshExpiration);

		return Jwts.builder()
			.setSubject(Integer.toString(userId))
			.setIssuedAt(now)
			.setExpiration(expiryDate)
			.signWith(key, SignatureAlgorithm.HS256)
			.compact();
	}

	/**
	 * JWT에서 사용자 ID를 추출하는 메서드
	 *
	 * @param token JWT 토큰
	 * @return 사용자 ID
	 * */
	public Integer getUserIdFromToken(String token) {
		return Integer.parseInt(Jwts.parserBuilder()
			.setSigningKey(key)
			.build()
			.parseClaimsJws(token)
			.getBody()
			.getSubject());
	}

	/**
	 * JWT에서 사용자 이름을 추출하는 메서드
	 *
	 * @param token JWT 토큰
	 * @return 사용자 이름
	 * */
	public String getUserNameFromToken(String token) {
		return Jwts.parserBuilder()
			.setSigningKey(key)
			.build()
			.parseClaimsJws(token)
			.getBody()
			.get("userName", String.class);
	}

	public boolean validateToken(String authToken) {
		try {
			Jwts.parserBuilder()
				.setSigningKey(key)
				.build()
				.parseClaimsJws(authToken);
			return true;
		} catch (SignatureException ex) {
			log.error("유효하지 않은 JWT 서명입니다.");
			throw new CommonException(ErrorCode.INVALID_JWT_SIGNATURE);
		} catch (MalformedJwtException ex) {
			log.error("유효하지 않은 JWT 토큰입니다.");
			throw new CommonException(ErrorCode.INVALID_JWT_TOKEN);
		} catch (ExpiredJwtException ex) {
			log.error("만료된 JWT 토큰입니다.");
			throw new CommonException(ErrorCode.EXPIRED_JWT_TOKEN);
		} catch (UnsupportedJwtException ex) {
			log.error("지원하지 않는 JWT 토큰입니다.");
			throw new CommonException(ErrorCode.UNSUPPORTED_JWT_TOKEN);
		} catch (IllegalArgumentException ex) {
			log.error("JWT 토큰이 비어있습니다.");
			throw new CommonException(ErrorCode.EMPTY_JWT_TOKEN);
		}
	}

	public String extractTokenFromRequest(HttpServletRequest request) {
		String bearerToken = request.getHeader("Authorization");
		if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
			return bearerToken.substring(7);
		}
		return null;
	}

	public boolean isTokenBlacklisted(String jwt) {
		// Redis에서 블랙리스트 체크
		String redisKey = "blacklist:" + jwt;

		return redisTemplate.hasKey(redisKey);
	}
}
