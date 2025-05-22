package com.checkmate.checkit.global.config;

import java.util.Arrays;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.checkmate.checkit.user.repository.UserRepository;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

	private final JwtTokenProvider jwtTokenProvider;
	private final UserRepository userRepository;

	public SecurityConfig(JwtTokenProvider jwtTokenProvider, UserRepository userRepository) {
		this.jwtTokenProvider = jwtTokenProvider;
		this.userRepository = userRepository;
	}

	@Bean
	public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
		http
			.csrf(csrf -> csrf.disable())
			.cors(cors -> cors.configurationSource(corsConfigurationSource()))
			.sessionManagement(session -> session
				.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
			.authorizeHttpRequests(authz -> authz
				.requestMatchers("/api/auth/**").permitAll() // 인증 관련 API는 모두 허용
				.requestMatchers("/ws/erd/**").permitAll()
				.requestMatchers("/ws/chat/**").permitAll()
				.anyRequest().authenticated())
			.addFilterBefore(new JwtAuthenticationFilter(jwtTokenProvider, userRepository),
				UsernamePasswordAuthenticationFilter.class);

		return http.build();
	}

	@Bean
	public CorsConfigurationSource corsConfigurationSource() {
		CorsConfiguration configuration = new CorsConfiguration();
		configuration.setAllowedOrigins(Arrays.asList("http://localhost:5173",
			"https://checkit.my"));
		configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
		configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "X-Requested-With"));
		configuration.setAllowCredentials(true); // 쿠키를 포함한 요청 허용
		configuration.setMaxAge(3600L);
		UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
		source.registerCorsConfiguration("/**", configuration);

		return source;
	}
}
