#!/usr/bin/env npm exec tsx --

import fs from "node:fs";
import path from "node:path";
import url from "node:url";

const myDirectoryPath = path.dirname(url.fileURLToPath(import.meta.url));

const snippetNames: string[] = [];
for (const dirent of fs.readdirSync(
  path.join(myDirectoryPath, "src", "generators", "ts", "_snippets"),
  { withFileTypes: true },
)) {
  if (!dirent.isFile()) {
    continue;
  }
  if (!dirent.name.startsWith("snippets_") || !dirent.name.endsWith(".ts")) {
    throw new Error(
      `unexpected file name in snippets directory: ${dirent.name}`,
    );
  }
  snippetNames.push(
    path
      .basename(dirent.name, path.extname(dirent.name))
      .substring("snippets_".length),
  );
}
snippetNames.sort();

fs.writeFileSync(
  path.join(myDirectoryPath, "src", "generators", "ts", "Snippets.ts"),
  `\
import type { NamedNode } from "@rdfjs/types";
import { TermMap } from "@rdfx/collection";
import type { Logger } from "@rdfx/logger";
import { rdf, rdfs, xsd } from "@tpluscode/rdf-ns-builders";

import { Maybe } from "purify-ts";
import { invariant } from "ts-invariant";
import { Memoize } from "typescript-memoize";
${snippetNames
  .map(
    (snippetName) => `\
import { snippets_${snippetName} } from "./_snippets/snippets_${snippetName}.js";`,
  )
  .join("\n")}
import type { Imports } from "./Imports.js";
import { rdfjsTermExpression } from "./rdfjsTermExpression.js";
import type { Snippet } from "./Snippet.js";
import type { SnippetFactory } from "./SnippetFactory.js";
import type { TsGenerator } from "./TsGenerator.js";
import {
  type Code,
  code,
  conditionalOutput,
  literalOf,
} from "./ts-poet-wrapper.js";

export class Snippets {
  private readonly configuration: TsGenerator.Configuration;
  private readonly imports: Imports;
  private readonly logger: Logger;
  private readonly rdfjsNamedNodeSnippets = new TermMap<
    NamedNode,
    Maybe<Snippet>
  >();

  constructor({
    configuration,
    imports,
    logger,
  }: {
    configuration: TsGenerator.Configuration;
    imports: Imports;
    logger: Logger;
  }) {
    this.configuration = configuration;
    this.imports = imports;
    this.logger = logger;
  }

${snippetNames
  .map(
    (snippetName) => `\
  @Memoize()
  get ${snippetName}(): Snippet {
    return this.snippet(snippets_${snippetName});
  }`,
  )
  .join("\n\n")}

  get ifUsed(): Code[] {
    const snippets: Snippet[] = [];

    for (const [key, descriptor] of Object.entries(
      Object.getOwnPropertyDescriptors(Object.getPrototypeOf(this)),
    )) {
      if (typeof descriptor.get !== "function") {
        continue;
      }
      switch (key) {
        case "ifUsed":
        case "snippets":
          continue;
      }
      const snippet = (this as any)[key];
      invariant(snippet, key);
      invariant((snippet as any).usageSiteName, key);
      snippets.push(snippet);
    }

    for (const snippetMaybe of this.rdfjsNamedNodeSnippets.values()) {
      snippetMaybe.ifJust((snippet) => snippets.push(snippet));
    }

    return snippets
      .sort((left, right) =>
        left.usageSiteName.localeCompare(right.usageSiteName),
      )
      .map((snippet) => code\`\${snippet.ifUsed}\`);
  }

  protected get snippets(): Snippets {
    return this;
  }

  rdfjsNamedNode(namedNode: NamedNode): Maybe<Snippet> {
    {
      const snippet = this.rdfjsNamedNodeSnippets.get(namedNode);
      if (snippet !== undefined) {
        return snippet;
      }
    }

    for (const [prefix, namespace] of Object.entries({
      rdf,
      rdfs,
      xsd,
    } as const)) {
      if (namedNode.value.startsWith(namespace[""].value)) {
        const variable = \`\${this.configuration.syntheticNamePrefix}\${prefix}_\${namedNode.value.substring(namespace[""].value.length)}\`;
        const snippet = Maybe.of(
          conditionalOutput(
            variable,
            code\`const \${variable} = \${this.imports.dataFactory}.namedNode(\${literalOf(namedNode.value)})\`,
          ),
        );
        this.rdfjsNamedNodeSnippets.set(namedNode, snippet);
        return snippet;
      }
    }
    this.rdfjsNamedNodeSnippets.set(namedNode, Maybe.empty());
    return Maybe.empty();
  }

  private snippet(snippetFactory: SnippetFactory): Snippet {
    return snippetFactory({
      configuration: this.configuration,
      imports: this.imports,
      logger: this.logger,
      rdfjsTermExpression: rdfjsTermExpression.bind({
        imports: this.imports,
        logger: this.logger,
        snippets: this,
      }),
      snippets: this,
      syntheticNamePrefix: this.configuration.syntheticNamePrefix,
    });
  }
}
`,
);
