import { FileNode } from './api/buildpreview';

export interface ApiResponse {
  status: string;
  message: string;
  data: {
    files: FileNode[];
  };
}

export interface ExpandedFolders {
  [key: string]: boolean;
}

export interface SelectedFile {
  name: string;
  content: string;
  path: string;
}

export interface Project {
  id: number;
  projectName: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
}

export interface GitData {
  branch: string;
  files: FileNode[];
}

export interface SpringSettings {
  springProject: string;
  springLanguage: string;
  springVersion: number;
  springGroup: string;
  springArtifact: string;
  springName: string;
  springDescription: string;
  springPackageName: string;
  springPackaging: string;
  springJavaVersion: number;
}

export interface Dependency {
  id: string;
  name: string;
  description: string;
  selected: boolean;
}

export interface ApiCategory {
  id: string;
  name: string;
  description: string;
}

export interface ApiEndpoint {
  id: string;
  name: string;
  description: string;
  method: string;
  path: string;
  categoryId: string;
}

export interface ApiParameter {
  id: string;
  name: string;
  type: string;
  required: boolean;
  description: string;
  endpointId: string;
}

export interface ApiResponse {
  id: string;
  name: string;
  type: string;
  description: string;
  endpointId: string;
}

export interface ApiRequestBody {
  id: string;
  name: string;
  type: string;
  required: boolean;
  description: string;
  endpointId: string;
}

export interface ApiResponseBody {
  id: string;
  name: string;
  type: string;
  description: string;
  endpointId: string;
}

export interface ApiError {
  id: string;
  name: string;
  code: string;
  description: string;
  endpointId: string;
}

export interface ApiExample {
  id: string;
  name: string;
  content: string;
  endpointId: string;
}

export interface ApiDocumentation {
  id: string;
  name: string;
  content: string;
  endpointId: string;
}

export interface ApiTest {
  id: string;
  name: string;
  content: string;
  endpointId: string;
}

export interface ApiMock {
  id: string;
  name: string;
  content: string;
  endpointId: string;
}

export interface ApiVersion {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiChange {
  id: string;
  name: string;
  description: string;
  type: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiComment {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  endpointId: string;
}

export interface ApiRating {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  endpointId: string;
}

export interface ApiFavorite {
  id: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  endpointId: string;
}

export interface ApiShare {
  id: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  endpointId: string;
}

export interface ApiView {
  id: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  endpointId: string;
}

export interface ApiDownload {
  id: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  endpointId: string;
}

export interface ApiReport {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  endpointId: string;
}

export interface ApiFeedback {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  endpointId: string;
}

export interface ApiSuggestion {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  endpointId: string;
}

export interface ApiQuestion {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  endpointId: string;
}

export interface ApiAnswer {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  questionId: string;
}

export interface ApiTag {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiTagEndpoint {
  id: string;
  tagId: string;
  endpointId: string;
}

export interface ApiTagCategory {
  id: string;
  tagId: string;
  categoryId: string;
}

export interface ApiTagUser {
  id: string;
  tagId: string;
  userId: string;
}

export interface ApiTagProject {
  id: string;
  tagId: string;
  projectId: string;
}

export interface ApiTagVersion {
  id: string;
  tagId: string;
  versionId: string;
}

export interface ApiTagChange {
  id: string;
  tagId: string;
  changeId: string;
}

export interface ApiTagComment {
  id: string;
  tagId: string;
  commentId: string;
}

export interface ApiTagRating {
  id: string;
  tagId: string;
  ratingId: string;
}

export interface ApiTagFavorite {
  id: string;
  tagId: string;
  favoriteId: string;
}

export interface ApiTagShare {
  id: string;
  tagId: string;
  shareId: string;
}

export interface ApiTagView {
  id: string;
  tagId: string;
  viewId: string;
}

export interface ApiTagDownload {
  id: string;
  tagId: string;
  downloadId: string;
}

export interface ApiTagReport {
  id: string;
  tagId: string;
  reportId: string;
}

export interface ApiTagFeedback {
  id: string;
  tagId: string;
  feedbackId: string;
}

export interface ApiTagSuggestion {
  id: string;
  tagId: string;
  suggestionId: string;
}

export interface ApiTagQuestion {
  id: string;
  tagId: string;
  questionId: string;
}

export interface ApiTagAnswer {
  id: string;
  tagId: string;
  answerId: string;
}
