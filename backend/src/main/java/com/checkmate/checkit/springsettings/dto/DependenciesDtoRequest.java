package com.checkmate.checkit.springsettings.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DependenciesDtoRequest {
	private SpringSettingsDtoRequest springSettings; // 스프링 세팅 정보
	private List<String> selectedDependencies;       // 사용자가 선택한 의존성 이름 리스트
}
