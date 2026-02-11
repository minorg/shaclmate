import type { Code } from "ts-poet";

export function codeEquals(left: Code, right: Code): boolean {
  return left.toString() === right.toString();
}
