#!/usr/bin/env node

import { Command } from "commander";
import { translateToEnglish } from "../src/translate.js";
import { commitMessage } from "../src/git.js";

const program = new Command();
program.name("checkit");

const aiCommand = new Command("ai");

aiCommand
  .command("translate <text...>")
  .description("한글 커밋 메시지를 영어로 번역하고 작업 수행")
  .option("--type <type>", "작업 타입 예: commit")
  .option("--scope <scope>", "커밋 prefix 예: feat, fix 등", "feat")
  .action(async (text, options) => {
    const fullText = text.join(" "); // 정상적으로 배열로 들어옴
    const translated = await translateToEnglish(fullText);

    if (!translated) {
      console.error("❌ 번역 실패");
      process.exit(1);
    }

    const finalMessage = `${options.scope}: ${translated}`;
    console.log("🔁 번역된 메시지:", finalMessage);

    if (options.type === "commit") {
      await commitMessage(finalMessage);
      console.log("✅ 커밋 완료!");
    } else {
      console.log("ℹ️ --type commit을 명시해야 커밋됩니다.");
    }
  });

program.addCommand(aiCommand); // ai 하위 명령으로 translate 등록
program.parse();
