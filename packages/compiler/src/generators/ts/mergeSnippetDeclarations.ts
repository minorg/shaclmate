export function mergeSnippetDeclarations(
  ...snippetDeclarations: Readonly<Record<string, string>>[]
): Readonly<Record<string, string>> {
  if (snippetDeclarations.length === 0) {
    return {};
  }
  if (snippetDeclarations.length === 1) {
    return snippetDeclarations[0];
  }

  const mergedSnippetDeclarations: Record<string, string> = {
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
      } else if (existingSnippetDeclaration !== snippetDeclaration) {
        throw new Error(
          `conflicting snippet declarations for ${key}:\nExisting:\n${existingSnippetDeclaration}\n\nNew:\n${snippetDeclaration}\n\n`,
        );
      }
    }
  }
  return mergedSnippetDeclarations;
}
