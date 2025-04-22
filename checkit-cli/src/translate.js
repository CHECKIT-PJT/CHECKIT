import { pipeline } from "@xenova/transformers";

const translator = await pipeline("translation", "Xenova/opus-mt-ko-en");

export async function translateToEnglish(koreanText) {
  try {
    // 커밋 스타일 유도를 위한 힌트 추가
    const hintPrefix = "[Commit message style] ";
    const result = await translator(hintPrefix + koreanText);

    let message = result[0].translation_text.trim();

    // 맨 끝 마침표 제거
    message = message.replace(/\.+$/, "");

    // 첫 글자를 대문자로 (일반적인 커밋 컨벤션 스타일)
    message = message.charAt(0).toUpperCase() + message.slice(1);

    return message;
  } catch (error) {
    console.error("번역 오류:", error.message);
    return null;
  }
}
