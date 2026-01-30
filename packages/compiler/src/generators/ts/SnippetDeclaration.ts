export type SnippetDeclaration =
  | Readonly<{
      code: string;
      dependencies?: Record<string, SnippetDeclaration>;
    }>
  | string;
export namespace SnippetDeclaration {
  export function code(snippetDeclaration: SnippetDeclaration): string {
    return typeof snippetDeclaration === "object"
      ? snippetDeclaration.code
      : snippetDeclaration;
  }
}
