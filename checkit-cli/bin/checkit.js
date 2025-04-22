#!/usr/bin/env node

import inquirer from "inquirer";
import { translateToEnglish } from "../src/translate.js";
import { commitMessage } from "../src/git.js";

console.log("\nCheckit CLI - 한글 커밋 메시지 번역기\n");

// 1. 한글 메시지 입력
const { koreanMsg } = await inquirer.prompt([
  {
    type: "input",
    name: "koreanMsg",
    message: " 한글 커밋 메시지를 입력하세요:",
  },
]);

// 2. 번역 수행
const englishMsg = await translateToEnglish(koreanMsg);

if (!englishMsg) {
  console.log(" 번역에 실패했습니다. 다시 시도해 주세요.");
  process.exit(1);
}

console.log("\n 번역된 메시지:\n> " + englishMsg + "\n");

// 3. 커밋 타입 선택
const commitTypes = [
  { name: "feat: 기능 추가", value: "feat" },
  { name: "fix: 버그 수정", value: "fix" },
  { name: "docs: 문서 수정", value: "docs" },
  { name: "refactor: 리팩토링", value: "refactor" },
  { name: "test: 테스트 코드", value: "test" },
  { name: "chore: 기타 작업", value: "chore" },
];

const { type } = await inquirer.prompt([
  {
    type: "list",
    name: "type",
    message: " 커밋 타입을 선택하세요:",
    choices: commitTypes,
  },
]);

// 4. 커밋 메시지 조립
const fullCommitMessage = `${type}: ${englishMsg}`;

console.log("\n 최종 커밋 메시지:\n> " + fullCommitMessage + "\n");

// 5. 커밋 실행 여부 확인
const { confirm } = await inquirer.prompt([
  {
    type: "confirm",
    name: "confirm",
    message: "이 메시지로 커밋하시겠습니까?",
    default: true,
  },
]);

if (confirm) {
  await commitMessage(fullCommitMessage);
  console.log("\n커밋이 성공적으로 완료되었습니다!");
} else {
  console.log("\n커밋이 취소되었습니다.");
}
