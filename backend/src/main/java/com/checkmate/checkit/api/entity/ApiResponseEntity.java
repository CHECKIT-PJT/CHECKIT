package com.checkmate.checkit.api.entity;

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
@Table(name = "api_responses")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApiResponseEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	// ManyToOne 관계: 하나의 ApiSpec에 여러 응답이 연결됨
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "endpoint_id", nullable = false)
	private ApiSpecEntity apiSpec;

	@Column(name = "status_code")
	private Integer statusCode;

	@Column(name = "response_json", length = 255)
	private String responseJson;

	@Column(name = "response_description", length = 255)
	private String responseDescription;

}
