package com.checkmate.checkit.global.common.mail;

import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MailService {

	private final NaverProvider naverProvider;

	@Async
	public void sendInviteEmail(String to, String inviteLink) {
		String subject = "[CheckIt] 프로젝트 초대 링크 안내";
		String body = String.format("""
				<!DOCTYPE html>
				<html lang="ko">
				<head>
				    <meta charset="UTF-8">
				    <style>
				        .container {
				            font-family: Arial, sans-serif;
				            background-color: #f9f9f9;
				            padding: 20px;
				            border-radius: 8px;
				            max-width: 600px;
				            margin: auto;
				            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
				        }
				        .button {
				            display: inline-block;
				            padding: 12px 24px;
				            background-color: #4CAF50;
				            color: white;
				            text-decoration: none;
				            border-radius: 5px;
				            font-weight: bold;
				            margin-top: 20px;
				        }
				    </style>
				</head>
				<body>
				    <div class="container">
				        <h2>[CheckIt] 프로젝트 초대</h2>
				        <p>안녕하세요,</p>
				        <p>아래 버튼을 클릭하여 프로젝트에 참여 요청을 하실 수 있습니다.</p>
				        <a href="%s" class="button">프로젝트 참여하기</a>
				        <p style="margin-top:20px;">만약 버튼이 작동하지 않는 경우 아래 링크를 복사해 브라우저에 붙여넣기 하세요:</p>
				        <p><a href="%s">%s</a></p>
				    </div>
				</body>
				</html>
			""", inviteLink, inviteLink, inviteLink);

		naverProvider.send(to, subject, body);
	}
}
