/**
 * Prefix a comment with multiline comment delimiters.
 */
export function tsComment(comment: string): string {
  return `/**\n${comment
    .trim()
    .split(/\r?\n|\r|\n/g)
    .map((line) => ` * ${line}`)
    .join("\n")}\n */\n`;
}
