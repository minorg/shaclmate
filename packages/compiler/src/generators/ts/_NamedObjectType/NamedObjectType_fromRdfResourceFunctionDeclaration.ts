import { rdf } from "@tpluscode/rdf-ns-builders";
import { Maybe } from "purify-ts";
import type { NamedObjectType } from "../NamedObjectType.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { type Code, code, joinCode } from "../ts-poet-wrapper.js";

const optionsVariable = `_${syntheticNamePrefix}options`;

const variables = {
  context: code`${optionsVariable}.context`,
  graph: code`${optionsVariable}.graph`,
  ignoreRdfType: code`${optionsVariable}.ignoreRdfType`,
  objectSet: code`${optionsVariable}.objectSet`,
  preferredLanguages: code`${optionsVariable}.preferredLanguages`,
  resource: code`${syntheticNamePrefix}resource`,
};

const propertyFromRdfResourceValuesExpressionVariable = {
  context: variables.context,
  graph: variables.graph,
  preferredLanguages: variables.preferredLanguages,
  objectSet: variables.objectSet,
  resource: variables.resource,
};

export function NamedObjectType_fromRdfResourceFunctionDeclaration(
  this: NamedObjectType,
): Maybe<Code> {
  if (!this.features.has("rdf")) {
    return Maybe.empty();
  }

  const chains: { expression: Code; variable: string }[] = [];
  const initializers: Code[] = [];

  this.parentObjectTypes.forEach((parentObjectType, parentObjectTypeI) => {
    chains.push({
      expression: code`${parentObjectType.name}._fromRdfResource(${variables.resource}, { ...${optionsVariable}, ignoreRdfType: true })`,
      variable: `${syntheticNamePrefix}super${parentObjectTypeI}`,
    });
    initializers.push(code`...${syntheticNamePrefix}super${parentObjectTypeI}`);
  });

  this.fromRdfType.ifJust((fromRdfType) => {
    const fromRdfTypeVariable = this.fromRdfTypeVariable.unsafeCoerce();
    const predicate = this.rdfjsTermExpression(rdf.type);
    // Check the expected type and its known subtypes
    const cases = new Set<string>();
    cases.add(fromRdfType.value);
    for (const descendantFromRdfType of this.descendantFromRdfTypes) {
      cases.add(descendantFromRdfType.value);
    }
    chains.push({
      expression: code`!${variables.ignoreRdfType} ? ${variables.resource}.value(${predicate}, ${{ graph: variables.graph }})
    .chain(actualRdfType => actualRdfType.toIri())
    .chain((actualRdfType) => {
      // Check the expected type and its known subtypes
      switch (actualRdfType.value) {
        ${[...cases].map((fromRdfType) => `case "${fromRdfType}":`).join("\n")}
          return ${this.reusables.imports.Right}(true as const);
      }

      // Check arbitrary rdfs:subClassOf's of the expected type
      if (${variables.resource}.isInstanceOf(${fromRdfTypeVariable}, ${{ graph: variables.graph }})) {
        return ${this.reusables.imports.Right}(true as const);
      }

      return ${this.reusables.imports.Left}(new Error(\`\${${variables.resource}.identifier} has unexpected RDF type (actual: \${actualRdfType.value}, expected: ${fromRdfType.value})\`));
    }) : ${this.reusables.imports.Right}(true as const)`,
      variable: "_rdfTypeCheck",
    });
  });

  for (const property of this.properties) {
    property
      .fromRdfResourceValuesExpression({
        variables: propertyFromRdfResourceValuesExpressionVariable,
      })
      .ifJust((propertyFromRdfExpression) => {
        chains.push({
          expression: propertyFromRdfExpression,
          variable: property.name,
        });
        initializers.push(code`${property.name}`);
      });
  }

  const statements: Code[] = [];
  const resultExpression = code`${this.name}.create({ ${joinCode(initializers, { on: "," })} })`;
  if (chains.length === 0) {
    statements.push(
      code`return ${this.reusables.imports.Right}(${resultExpression});`,
    );
  } else {
    statements.push(
      code`return ${chains
        .reverse()
        .reduce(
          (acc, { expression, variable }, chainI) =>
            code`(${expression}).${chainI === 0 ? "map" : "chain"}(${variable} => ${acc})`,
          code`(${resultExpression})`,
        )}`,
    );
  }

  return Maybe.of(code`\
export const _fromRdfResource: ${this.reusables.snippets._FromRdfResourceFunction}<${this.name}> = (${variables.resource}, ${optionsVariable}) => {
${joinCode(statements)}
}

export const fromRdfResource = ${this.reusables.snippets.wrap_FromRdfResourceFunction}(_fromRdfResource);`);
}
