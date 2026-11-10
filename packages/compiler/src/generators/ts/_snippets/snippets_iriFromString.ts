import type { SnippetFactory } from "../SnippetFactory.js";
import {
  code,
  conditionalOutput,
  joinCode,
  literalOf,
} from "../ts-poet-wrapper.js";

export const snippets_iriFromString: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) => {
  const leadingDoubleSlashSchemes = [
    "file",
    "ftp",
    "http",
    "https",
    "git",
    "irc",
    "ldap",
    "postgres",
    "rtsp",
    "sftp",
    "smb",
    "ssh",
    "ws",
    "wss",
  ];

  return conditionalOutput(
    `${syntheticNamePrefix}iriFromString`,
    code`\
export function ${syntheticNamePrefix}iriFromString(
  string: string,
  options?: {
    defaultNamespace?: ${snippets.NamespaceBuilder};
    prefixMap?: ${imports.PrefixMap};
  }
): ${imports.Either}<Error, ${imports.NamedNode}> {
  if (string.trim().length === 0) {
    return ${imports.Left}(new Error("empty/blank IRI"));
  }

  const defaultNamespace = options?.defaultNamespace;

  const colonIndex = string.indexOf(":");
  if (colonIndex === -1) {
    // No : in the string.
    if (defaultNamespace) {
      return ${imports.Right}(defaultNamespace(string));
    } else {
      return ${imports.Left}(new Error(\`ill-formed IRI: \${string}\`));
    }
  }

  const prefix = string.substring(0, colonIndex);
  const path = string.substring(colonIndex + 1);
  if (path.length === 0) {
    return ${imports.Left}(new Error(\`ill-formed IRI: \${string}\`));
  }

  // Absolute IRIs with scheme:// always win over prefixes with the same name.
  switch (prefix.toLowerCase()) {
${joinCode(leadingDoubleSlashSchemes.map((scheme) => code`    case ${literalOf(scheme)}:`, { on: "\n" }))}
    if (path.startsWith("//")) {
      return ${imports.Right}(${imports.dataFactory}.namedNode(string));
    }
    break;
  }

  const prefixMap = options?.prefixMap;
  if (prefixMap) {
    const prefixNamespace = prefixMap.get(prefix);
    if (prefixNamespace !== undefined) {
      return ${imports.Right}(
        ${imports.dataFactory}.namedNode(\`\${prefixNamespace.value}\${path}\`),
      );
    }
  }

  if (prefix.length === 0 && defaultNamespace) {
    // a "" prefixMap entry takes precedence, above.
    return ${imports.Right}(defaultNamespace(path));
  }

  return ${imports.Right}(${imports.dataFactory}.namedNode(string));
}`,
  );
};
