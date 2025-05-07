package com.checkmate.checkit.api.entity;

import java.time.LocalDateTime;

import com.checkmate.checkit.project.entity.ProjectEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
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
@Table(name = "Api_spec")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApiSpecEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "project_id", nullable = false)
	private ProjectEntity project;

	@Column(name = "api_name", nullable = false, length = 50)
	private String apiName;

	@Column(name = "endpoint", nullable = false)
	private String endpoint;

	@Enumerated(EnumType.STRING)
	@Column(name = "method", nullable = false)
	private HttpMethod method;

	@Column(name = "category", nullable = false, length = 100)
	private String category;

	@Column(name = "description")
	private String description;

	@Enumerated(EnumType.STRING)
	@Column(name = "status", nullable = false)
	private ApiStatus status;

	@Column(name = "header")
	private String header;

	@Column(name = "created_at", nullable = false)
	private LocalDateTime createdAt;

	@Column(name = "updated_at")
	private LocalDateTime updatedAt;

	@Column(name = "deleted_at")
	private LocalDateTime deletedAt;

	@Column(name = "is_deleted", nullable = false)
	private Boolean isDeleted;

	public enum HttpMethod {
		GET,
		POST,
		PUT,
		DELETE,
		PATCH,
	}

	public enum ApiStatus {
		시작전,
		진행중,
		완료
	}

}
