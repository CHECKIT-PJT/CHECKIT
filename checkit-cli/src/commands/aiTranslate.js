import { translateToEnglish } from "../src/translate.js";
import { execa } from "execa";

export async function aiTranslateAndCommit(text, type) {
  try {
    const translated = await translateToEnglish(text);

    if (!translated) {
      return;
    }

    if (type === "commit") {
      await execa("git", ["commit", "-m", translated]);
    }
  } catch (err) {
    // 필요시 에러 복구 후 메시지 출력
    originalError("Git 커밋 실패:", err.message);
  }
}
