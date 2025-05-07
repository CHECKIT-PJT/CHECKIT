package com.checkmate.checkit.api.entity;

import com.checkmate.checkit.codegenerator.service.DtoGenerateService;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "Api_request_params")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApiRequestParamEntity implements DtoGenerateService.ApiField {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	// 연관관계: 여러 요청 파라미터는 하나의 ApiSpec에 속함 (N:1)
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "api_spec_id", nullable = false)
	private ApiSpecEntity apiSpec;

	@Column(name = "request_param_name", length = 255)
	private String requestParamName;

	@Column(name = "request_param_data_type", length = 255)
	private String requestParamDataType;

	@Override
	public String getFieldName() {
		return this.requestParamName;
	}

	@Override
	public String getDataType() {
		return this.requestParamDataType;
	}

}
