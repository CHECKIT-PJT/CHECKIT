package com.checkmate.checkit.project.entity;

import com.checkmate.checkit.project.dto.request.JiraProjectUpdateRequest;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.MapsId;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "Jira_projects")
@Getter
@NoArgsConstructor
public class JiraProjectEntity {

	@Id
	@Column(name = "project_id")
	private Integer id;

	@OneToOne
	@MapsId
	@JoinColumn(name = "project_id")
	private ProjectEntity projectEntity;

	@Column(name = "jira_project_id")
	private Integer jiraProjectId;

	@Column(name = "jira_project_key", length = 255)
	private String jiraProjectKey;

	@Column(name = "jira_project_name", length = 255)
	private String jiraProjectName;

	@Column(name = "project_type_key", length = 100)
	private String projectTypeKey;

	@Column(name = "jira_board_id")
	private Long jiraBoardId;

	public JiraProjectEntity(ProjectEntity projectEntity, String projectId, String projectKey, String projectName,
		String projectTypeKey) {
		this.projectEntity = projectEntity;
		this.jiraProjectId = Integer.parseInt(projectId);
		this.jiraProjectKey = projectKey;
		this.jiraProjectName = projectName;
		this.projectTypeKey = projectTypeKey;
	}

	public void updateJiraBoardId(Long boardId) {
		this.jiraBoardId = boardId;
	}

	public void updateFromRequest(JiraProjectUpdateRequest jiraProjectUpdateRequest) {
		this.jiraProjectId = Integer.parseInt(jiraProjectUpdateRequest.projectId());
		this.jiraProjectKey = jiraProjectUpdateRequest.projectKey();
		this.jiraProjectName = jiraProjectUpdateRequest.projectName();
		this.projectTypeKey = jiraProjectUpdateRequest.projectTypeKey();
	}
}
