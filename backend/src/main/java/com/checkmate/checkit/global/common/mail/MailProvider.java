package com.checkmate.checkit.global.common.mail;

public interface MailProvider {
	void send(String to, String subject, String content);
}
