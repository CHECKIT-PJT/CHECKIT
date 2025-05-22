package com.checkmate.checkit.projectbuilder.util;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Comparator;

/**
 * 파일 및 디렉터리 삭제 유틸
 */
public class FileUtil {

	public static void deleteFolder(String pathStr) {
		Path path = Paths.get(pathStr);
		if (!Files.exists(path))
			return;

		try {
			Files.walk(path)
				.sorted(Comparator.reverseOrder())
				.map(Path::toFile)
				.forEach(File::delete);
		} catch (IOException e) {
			throw new RuntimeException("디렉터리 삭제 실패: " + pathStr, e);
		}
	}
}
