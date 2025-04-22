import { pipeline } from "@xenova/transformers";
import ort from "onnxruntime-web";

const ortEnv = ort.env;
ortEnv.logLevel = "fatal"; // 최대한 조용하게 설정

const translator = await pipeline("translation", "Xenova/opus-mt-ko-en");

export async function translateToEnglish(koreanText) {
  // 🔇 stderr와 console.warn 차단
  const originalStderrWrite = process.stderr.write;
  const originalConsoleWarn = console.warn;
  process.stderr.write = () => {};
  console.warn = () => {};

  try {
    const hintPrefix = "[Commit message style] ";
    const result = await translator(hintPrefix + koreanText);

    let message = result[0].translation_text.trim();
    message = message.replace(/\.+$/, "");
    message = message.charAt(0).toUpperCase() + message.slice(1);

    return message;
  } catch (error) {
    console.error("번역 오류:", error.message);
    return null;
  } finally {
    process.stderr.write = originalStderrWrite;
    console.warn = originalConsoleWarn;
  }
}
