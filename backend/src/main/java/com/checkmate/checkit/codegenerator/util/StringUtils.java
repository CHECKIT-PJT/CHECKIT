package com.checkmate.checkit.codegenerator.util;

// StringUtils.java (공통 유틸 클래스)
public class StringUtils {

	// User → user
	public static String decapitalize(String str) {
		if (str == null || str.isEmpty())
			return str;
		return str.substring(0, 1).toLowerCase() + str.substring(1);
	}

	// user → User
	public static String capitalize(String str) {
		if (str == null || str.isEmpty())
			return str;
		return str.substring(0, 1).toUpperCase() + str.substring(1);
	}

	// create-user → CreateUser
	public static String toPascalCase(String raw) {
		String[] parts = raw.split("[_\\-\\s]");
		StringBuilder sb = new StringBuilder();
		for (String part : parts) {
			if (!part.isEmpty())
				sb.append(capitalize(part));
		}
		return sb.toString();
	}

	// create-user → createUser
	public static String toCamelCase(String raw) {
		String pascal = toPascalCase(raw);
		return decapitalize(pascal);
	}
}
