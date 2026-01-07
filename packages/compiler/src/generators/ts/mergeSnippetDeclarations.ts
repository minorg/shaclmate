export function mergeSnippetDeclarations(
  leftSnippetDeclarations: Readonly<Record<string, string>>,
  rightSnippetDeclarations: Readonly<Record<string, string>>,
): Readonly<Record<string, string>> {
  const mergedSnippetDeclarations: Record<string, string> = {};
  for (const [leftKey, leftSnippetDeclaration] of Object.entries(
    leftSnippetDeclarations,
  )) {
    const rightSnippetDeclaration = rightSnippetDeclarations[leftKey];
    if (!rightSnippetDeclaration) {
      mergedSnippetDeclarations[leftKey] = leftSnippetDeclaration;
      continue;
    }
    if (rightSnippetDeclaration !== leftSnippetDeclaration) {
      throw new Error(`conflicting snippet declarations for ${leftKey}`);
    }
  }
  return mergedSnippetDeclarations;
}
