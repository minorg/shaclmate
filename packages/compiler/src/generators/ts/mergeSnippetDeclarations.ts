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
  for (const snippetDeclarations_ of snippetDeclarations.slice(1)) {
    for (const [key, snippetDeclaration] of Object.entries(
      snippetDeclarations_,
    )) {
      const existingSnippetDeclaration = mergedSnippetDeclarations[key];
      if (!existingSnippetDeclaration) {
        mergedSnippetDeclarations[key] = snippetDeclaration;
      } else if (existingSnippetDeclaration !== snippetDeclaration) {
        throw new Error(`conflicting snippet declarations for ${key}`);
      }
    }
  }
  return mergedSnippetDeclarations;
}
