package com.checkmate.checkit.project.dto.request;

import java.util.List;

import com.checkmate.checkit.project.common.DatabaseType;

public record DockerComposeCreateRequest(
	List<DatabaseType> databases
) {

}
