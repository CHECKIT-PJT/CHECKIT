package com.checkmate.checkit.project.common;

import com.checkmate.checkit.global.code.ErrorCode;
import com.checkmate.checkit.global.exception.CommonException;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum DatabaseType {
	MYSQL("MySQL"),
	POSTGRESQL("PostgreSQL"),
	MONGODB("MongoDB"),
	REDIS("Redis");

	private final String value;

	public static DatabaseType fromValue(String value) {
		for (DatabaseType type : DatabaseType.values()) {
			if (type.getValue().equalsIgnoreCase(value)) {
				return type;
			}
		}
		throw new CommonException(ErrorCode.INVALID_DATABASE_TYPE);
	}
}
