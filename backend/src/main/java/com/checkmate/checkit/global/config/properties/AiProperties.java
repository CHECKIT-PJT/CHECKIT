package com.checkmate.checkit.global.config.properties;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import lombok.Getter;
import lombok.Setter;

@Component
@ConfigurationProperties(prefix = "ai")
@Getter
@Setter
public class AiProperties {

	private Server server;
	private Llm llm;

	@Getter
	@Setter
	public static class Server {
		private String url;
	}

	@Getter
	@Setter
	public static class Llm {
		private String type;
	}
}

