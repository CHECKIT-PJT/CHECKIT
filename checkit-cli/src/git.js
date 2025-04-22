import { execa } from "execa";

export async function commitMessage(message) {
  try {
    console.log("커밋 메시지:", message);

    // git commit 실행
    const { stdout } = await execa("git", ["commit", "-m", message]);

    console.log("Git 커밋 성공:\n", stdout);
  } catch (error) {
    if (error.stderr?.includes("nothing added to commit")) {
      console.error("커밋할 변경 사항이 없습니다.");
    } else if (error.stderr?.includes("fatal")) {
      console.error("Git 에러 발생:", error.stderr);
    } else {
      console.error("Git 커밋 실패:", error.message);
    }
  }
}
