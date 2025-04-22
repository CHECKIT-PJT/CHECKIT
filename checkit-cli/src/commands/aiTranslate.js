import { translateToEnglish } from "../src/translate.js";
import { execa } from "execa";

export async function aiTranslateAndCommit(text, type) {
  const translated = await translateToEnglish(text);

  if (!translated) {
    console.error("번역 실패");
    return;
  }

  console.log("번역 결과:", translated);

  if (type === "commit") {
    try {
      await execa("git", ["commit", "-m", translated]);
      console.log("커밋 완료!");
    } catch (err) {
      console.error("Git 커밋 실패:", err.message);
    }
  } else {
    console.log("아직 지원하지 않는 타입입니다.");
  }
}
