package com.checkmate.checkit.global.config.properties;

import java.util.HashMap;
import java.util.Map;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import lombok.Getter;
import lombok.Setter;

@Getter
@Component
@ConfigurationProperties(prefix = "oauth")
public class OAuthProperties {
	private final Map<String, Provider> providers = new HashMap<>();

	@Getter
	@Setter
	public static class Provider {
		private String clientId;
		private String clientSecret;
		private String redirectUri;
		private String scope;
		private String authorizationUri;
		private String tokenUri;
		private String userInfoUri;
		private String userNameAttribute;
	}

	public Provider getProvider(String name) {
		return providers.get(name);
	}
}
