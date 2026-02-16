import type { Code } from "./ts-poet-wrapper.js";

function codeToString(code: Code | string) {
  return typeof code === "string" ? code : code.toString({});
}

export function codeEquals(left: Code | string, right: Code | string): boolean {
  return codeToString(left) === codeToString(right);
}
