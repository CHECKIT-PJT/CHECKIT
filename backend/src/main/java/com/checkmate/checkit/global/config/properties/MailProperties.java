package com.checkmate.checkit.global.config.properties;

import java.util.Properties;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import lombok.Getter;
import lombok.Setter;

@Getter
@Component
@ConfigurationProperties(prefix = "spring.mail")
@Setter
public class MailProperties {
	private String host;
	private int port;
	private String username;
	private String password;
	private final Properties properties = new Properties();
}
