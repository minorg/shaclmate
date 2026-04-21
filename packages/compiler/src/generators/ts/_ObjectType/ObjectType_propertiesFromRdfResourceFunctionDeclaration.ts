import { rdf } from "@tpluscode/rdf-ns-builders";
import { Maybe } from "purify-ts";
import { imports } from "../imports.js";
import type { ObjectType } from "../ObjectType.js";
import { rdfjsTermExpression } from "../rdfjsTermExpression.js";
import { snippets } from "../snippets.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { type Code, code, joinCode } from "../ts-poet-wrapper.js";

export function ObjectType_propertiesFromRdfResourceFunctionDeclaration(
  this: ObjectType,
): Maybe<Code> {
  if (!this.features.has("rdf")) {
    return Maybe.empty();
  }

  const chains: { expression: Code; variable: string }[] = [];
  const initializers: Code[] = [];
  const propertySignatures: Code[] = [];
  const returnType: Code[] = [];

  const variables = {
    context: code`${syntheticNamePrefix}options.context`,
    graph: code`${syntheticNamePrefix}options.graph`,
    ignoreRdfType: code`${syntheticNamePrefix}options.ignoreRdfType`,
    objectSet: code`${syntheticNamePrefix}options.objectSet`,
    preferredLanguages: code`${syntheticNamePrefix}options.preferredLanguages`,
    resource: code`${syntheticNamePrefix}resource`,
  };

  this.parentObjectTypes.forEach((parentObjectType, parentObjectTypeI) => {
    chains.push({
      expression: code`${parentObjectType.staticModuleName}.${syntheticNamePrefix}propertiesFromRdf(${variables.resource}, { ...${syntheticNamePrefix}options, ignoreRdfType: true })`,
      variable: `${syntheticNamePrefix}super${parentObjectTypeI}`,
    });
    initializers.push(code`...${syntheticNamePrefix}super${parentObjectTypeI}`);
    returnType.push(
      code`${snippets.UnwrapR}<ReturnType<typeof ${parentObjectType.staticModuleName}.${syntheticNamePrefix}propertiesFromRdf>>`,
    );
  });

  this.fromRdfType.ifJust((fromRdfType) => {
    const fromRdfTypeVariable = this.fromRdfTypeVariable.unsafeCoerce();
    const predicate = rdfjsTermExpression(rdf.type);
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
          return ${imports.Right}(true as const);
      }

      // Check arbitrary rdfs:subClassOf's of the expected type
      if (${variables.resource}.isInstanceOf(${fromRdfTypeVariable}, ${{ graph: variables.graph }})) {
        return ${imports.Right}(true as const);
      }

      return ${imports.Left}(new Error(\`\${${imports.Resource}.Identifier.toString(${variables.resource}.identifier)} has unexpected RDF type (actual: \${actualRdfType.value}, expected: ${fromRdfType.value})\`));
    }) : ${imports.Right}(true as const)`,
      variable: "_rdfTypeCheck",
    });
  });

  const propertyFromRdfVariables = {
    context: variables.context,
    graph: variables.graph,
    preferredLanguages: variables.preferredLanguages,
    objectSet: variables.objectSet,
    resource: variables.resource,
  };
  for (const property of this.properties) {
    property
      .fromRdfExpression({
        variables: propertyFromRdfVariables,
      })
      .ifJust((propertyFromRdfExpression) => {
        chains.push({
          expression: propertyFromRdfExpression,
          variable: property.name,
        });
        initializers.push(code`${property.name}`);
        propertySignatures.push(code`${property.name}: ${property.type.name};`);
      });
  }

  const statements: Code[] = [];
  const resultExpression = code`{ ${joinCode(initializers, { on: "," })} }`;
  if (chains.length === 0) {
    statements.push(code`return ${imports.Right}(${resultExpression});`);
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

  if (propertySignatures.length > 0) {
    returnType.splice(
      0,
      0,
      code`{ ${joinCode(propertySignatures, { on: " " })} }`,
    );
  }

  return Maybe.of(code`\
const ${syntheticNamePrefix}propertiesFromRdfResource: ${snippets.PropertiesFromRdfResourceFunction}<${joinCode(returnType, { on: " & " })}> = (${syntheticNamePrefix}resource, ${syntheticNamePrefix}options) => {
${joinCode(statements)}
}`);
}
