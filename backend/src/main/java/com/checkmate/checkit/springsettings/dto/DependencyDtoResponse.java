package com.checkmate.checkit.springsettings.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class DependencyDtoResponse {
	private List<String> dependencies;
}
