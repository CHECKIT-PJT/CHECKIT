package com.checkmate.checkit.global.interceptor;

import com.checkmate.checkit.global.config.JwtTokenProvider;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

import java.security.Principal;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class JwtHandshakeInterceptor implements HandshakeInterceptor {

    private final JwtTokenProvider jwtUtil;

    @Override
    public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response,
                                   WebSocketHandler wsHandler, Map<String, Object> attributes) {

        if (request instanceof ServletServerHttpRequest servletRequest) {
            HttpServletRequest httpRequest = servletRequest.getServletRequest();
            String token = httpRequest.getParameter("token");
            if (token == null) {
                token = httpRequest.getHeader("Authorization");

                if (token != null && token.startsWith("Bearer ")) {
                    token = token.substring(7);
                }
            }

            // 유효성 검증
            if (token != null && jwtUtil.validateToken(token)) {
                String userId = jwtUtil.getUserNameFromToken(token);
                Principal principal = () -> userId;
                attributes.put("principal", principal);
                return true;
            }
        }


        return false;
    }

    @Override
    public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response,
                               WebSocketHandler wsHandler, Exception exception) {
        log.info("웹소켓 JWT토큰 인증이 완료되어 hand-shake가 완료 되었습니다.");
    }
}