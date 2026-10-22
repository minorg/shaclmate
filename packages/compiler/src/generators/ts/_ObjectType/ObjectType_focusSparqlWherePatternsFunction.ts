import type { Callable } from "../Callable.js";
import { DeclaredCallable } from "../DeclaredCallable.js";
import { InlineCallable } from "../InlineCallable.js";
import type { ObjectType } from "../ObjectType.js";
import { type Code, code, joinCode } from "../ts-poet-wrapper.js";

function ObjectType_focusSparqlWherePatternsFunctionExpression(
  this: ObjectType,
): Code {
  let patternsVariableDeclarationKeyword = "const";
  const statements: Code[] = [];

  const variables = {
    filter: code`parameters.filter`,
    preferredLanguages: code`parameters.preferredLanguages`,
    focusIdentifier: code`parameters.focusIdentifier`,
    ignoreRdfType: code`parameters.ignoreRdfType`,
    schema: this.name.map((name) => code`${name}.schema`),
    variablePrefix: code`parameters.variablePrefix`,
  };

  for (const property of this.properties) {
    if (property.recursive) {
      continue;
    }

    property
      .sparqlWherePatternsExpression({ variables })
      .ifJust(({ condition, patterns }) => {
        const concatStatement = code`patterns = patterns.concat(${patterns});`;
        if (condition) {
          statements.push(code`if (${condition}) { ${concatStatement} }`);
        } else {
          statements.push(concatStatement);
        }
        patternsVariableDeclarationKeyword = "let";
      });
  }

  return code`\
(${statements.length === 0 ? "_" : ""}parameters) => {
${
  statements.length > 0
    ? joinCode([
        code`${patternsVariableDeclarationKeyword} patterns: ${this.reusables.snippets.SparqlPattern}[] = [];`,
        ...statements,
        code`return patterns;`,
      ])
    : "return [];"
}
}`;
}

export function ObjectType_focusSparqlWherePatternsFunction(
  this: ObjectType,
): Callable {
  const type = code`${this.reusables.snippets.FocusSparqlWherePatternsFunction}<${this.filterType}>`;
  const unannotatedExpression = () =>
    ObjectType_focusSparqlWherePatternsFunctionExpression.call(this);

  return this.name
    .map<Callable>(
      (name) =>
        new DeclaredCallable({
          qualifiedName: [name, "focusSparqlWherePatterns"],
          type,
          unannotatedExpression,
        }),
    )
    .orDefault(new InlineCallable(unannotatedExpression, { type }));
}
