package com.checkmate.checkit.global.common.mail;

import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Component;

import com.checkmate.checkit.global.code.ErrorCode;
import com.checkmate.checkit.global.config.properties.MailProperties;
import com.checkmate.checkit.global.exception.CommonException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class NaverProvider implements MailProvider {

	private final JavaMailSender mailSender;
	private final MailProperties mailProperties;

	@Override
	public void send(String to, String subject, String content) {
		MimeMessage message = mailSender.createMimeMessage();
		try {
			MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
			helper.setTo(to);
			helper.setSubject(subject);
			helper.setText(content, true);
			helper.setFrom(mailProperties.getUsername());

			mailSender.send(message);
		} catch (Exception e) {
			log.error(e.getMessage(), e);
			throw new CommonException(ErrorCode.MAIL_SEND_FAILED);
		}
	}
}
