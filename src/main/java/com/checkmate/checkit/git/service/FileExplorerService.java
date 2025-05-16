package com.checkmate.checkit.git.service;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.checkmate.checkit.git.dto.response.GitFileNode;

@Service
public class FileExplorerService {

	/**
	 * Git 로컬 디렉토리를 순회하여 GitFileNode 목록 반환
	 * @param rootDir : Git Clone된 루트 디렉토리
	 */
	public List<GitFileNode> scanDirectory(File rootDir) {
		List<GitFileNode> nodes = new ArrayList<>();
		traverse(rootDir, rootDir, nodes);
		return nodes;
	}

	/**
	 * 디렉토리를 재귀적으로 순회
	 * @param rootDir : 기준 루트 (상대 경로 구할 때 사용)
	 * @param current : 현재 순회 중인 파일/디렉토리
	 * @param nodes : 결과 누적 리스트
	 */
	private void traverse(File rootDir, File current, List<GitFileNode> nodes) {
		if (current.getName().equals(".git"))
			return; // Git 메타데이터 무시

		String relativePath = rootDir.toPath().relativize(current.toPath()).toString().replace("\\", "/");

		if (current.isDirectory()) {
			nodes.add(new GitFileNode(relativePath, "folder", null));
			for (File file : current.listFiles()) {
				traverse(rootDir, file, nodes);
			}
		} else {
			try {
				String content = Files.readString(current.toPath());
				nodes.add(new GitFileNode(relativePath, "file", content));
			} catch (IOException e) {
				// 예외 처리: 바이너리 파일 등은 content 제외
				nodes.add(new GitFileNode(relativePath, "file", null));
			}
		}
	}
}
