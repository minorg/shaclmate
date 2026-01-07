export function mergeSnippetDeclarations(
  leftSnippetDeclarations: Readonly<Record<string, string>>,
  rightSnippetDeclarations: Readonly<Record<string, string>>,
): Readonly<Record<string, string>> {
  const mergedSnippetDeclarations: Record<string, string> = {
    ...leftSnippetDeclarations,
  };
  for (const [rightKey, rightSnippetDeclaration] of Object.entries(
    rightSnippetDeclarations,
  )) {
    const existingSnippetDeclaration = mergedSnippetDeclarations[rightKey];
    if (!existingSnippetDeclaration) {
      mergedSnippetDeclarations[rightKey] = rightSnippetDeclaration;
    } else if (existingSnippetDeclaration !== rightSnippetDeclaration) {
      throw new Error(`conflicting snippet declarations for ${rightKey}`);
    }
  }
  return mergedSnippetDeclarations;
}
