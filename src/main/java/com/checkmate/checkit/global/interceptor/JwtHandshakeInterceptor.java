package com.checkmate.checkit.global.interceptor;

import com.checkmate.checkit.global.config.JwtTokenProvider;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

import java.util.Map;

@Component
@RequiredArgsConstructor
public class JwtHandshakeInterceptor implements HandshakeInterceptor {

    private final JwtTokenProvider jwtUtil;

    @Override
    public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response,
                                   WebSocketHandler wsHandler, Map<String, Object> attributes) {

        if (request instanceof ServletServerHttpRequest servletRequest) {
            HttpServletRequest httpRequest = servletRequest.getServletRequest();

            // accessToken은 URL 파라미터 또는 헤더로 전달
            String token = httpRequest.getParameter("accessToken"); // ?accessToken=...
            if (token == null) {
                token = httpRequest.getHeader("Authorization"); // 헤더 방식 (Bearer 제거 필요)
                if (token != null && token.startsWith("Bearer ")) {
                    token = token.substring(7);
                }
            }

            // 유효성 검증
            if (token != null && jwtUtil.validateToken(token)) {
                String userId = jwtUtil.getUserNameFromToken(token);
                attributes.put("userId", userId); // 세션에 사용자 ID 저장
                return true;
            }
        }

        // 인증 실패 시 연결 거부
        return false;
    }

    @Override
    public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response,
                               WebSocketHandler wsHandler, Exception exception) {
        // 필요 시 로그 작성 등 후처리 가능
    }
}