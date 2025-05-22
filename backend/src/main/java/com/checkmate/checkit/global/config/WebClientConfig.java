package com.checkmate.checkit.global.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.web.reactive.function.client.WebClient;

import com.checkmate.checkit.global.config.properties.AiProperties;
import lombok.RequiredArgsConstructor;

@Configuration
@RequiredArgsConstructor
public class WebClientConfig {

	private final AiProperties aiProperties;

	@Bean
	public WebClient webClient() {
		return WebClient.builder()
			.build();
	}

	@Bean(name = "aiWebClient")
	public WebClient aiWebClient() {
		return WebClient.builder()
			.baseUrl(aiProperties.getServer().getUrl())
			.defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
			.build();
	}
}
