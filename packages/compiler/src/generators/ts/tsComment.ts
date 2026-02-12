import { type Code, code } from "ts-poet";

/**
 * Prefix a comment with multiline comment delimiters.
 */
export function tsComment(comment: string): Code {
  return code`/**\n${comment
    .trim()
    .split(/\r?\n|\r|\n/g)
    .map((line) => ` * ${line}`)
    .join("\n")}\n */\n`;
}
