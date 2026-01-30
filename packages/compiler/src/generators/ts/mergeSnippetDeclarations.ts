import { SnippetDeclaration } from "./SnippetDeclaration.js";

export function mergeSnippetDeclarations(
  ...snippetDeclarations: Readonly<Record<string, SnippetDeclaration>>[]
): Readonly<Record<string, SnippetDeclaration>> {
  if (snippetDeclarations.length === 0) {
    return {};
  }
  if (snippetDeclarations.length === 1) {
    return snippetDeclarations[0];
  }

  let mergedSnippetDeclarations: Record<string, SnippetDeclaration> = {
    ...snippetDeclarations[0],
  };
  for (
    let snippetDeclarationsI = 1;
    snippetDeclarationsI < snippetDeclarations.length;
    snippetDeclarationsI++
  ) {
    for (const [key, snippetDeclaration] of Object.entries(
      snippetDeclarations[snippetDeclarationsI],
    )) {
      const existingSnippetDeclaration = mergedSnippetDeclarations[key];
      if (!existingSnippetDeclaration) {
        mergedSnippetDeclarations[key] = snippetDeclaration;
      } else if (
        SnippetDeclaration.code(existingSnippetDeclaration) !==
        SnippetDeclaration.code(snippetDeclaration)
      ) {
        throw new Error(
          `conflicting snippet declarations for ${key}:\nExisting:\n${SnippetDeclaration.code(existingSnippetDeclaration)}\n\nNew:\n${SnippetDeclaration.code(snippetDeclaration)}\n\n`,
        );
      }

      if (
        typeof snippetDeclaration === "object" &&
        snippetDeclaration.dependencies
      ) {
        mergedSnippetDeclarations = mergeSnippetDeclarations(
          mergedSnippetDeclarations,
          snippetDeclaration.dependencies,
        );
      }
    }
  }
  return mergedSnippetDeclarations;
}
