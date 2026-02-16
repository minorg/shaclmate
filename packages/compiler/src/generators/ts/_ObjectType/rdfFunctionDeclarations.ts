import { rdf } from "@tpluscode/rdf-ns-builders";
import { Maybe } from "purify-ts";
import { type Code, code, joinCode } from "ts-poet";
import { imports } from "../imports.js";
import type { ObjectType } from "../ObjectType.js";
import { rdfjsTermExpression } from "../rdfjsTermExpression.js";
import { snippets } from "../snippets.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { toRdfFunctionOrMethodDeclaration } from "./toRdfFunctionOrMethodDeclaration.js";

function fromRdfFunctionDeclaration(this: ObjectType): Maybe<Code> {
  if (this.abstract) {
    return Maybe.empty();
  }

  const statements: Code[] = [
    code`let { context, ignoreRdfType = false, objectSet, preferredLanguages } = (options ?? {});`,
    code`if (!objectSet) { objectSet = new ${syntheticNamePrefix}RdfjsDatasetObjectSet(resource.dataset); }`,
  ];

  let propertiesFromRdfExpression = code`${this.staticModuleName}.${syntheticNamePrefix}propertiesFromRdf({ context, ignoreRdfType, objectSet, preferredLanguages, resource })`;
  if (this.declarationType === "class") {
    propertiesFromRdfExpression = code`${propertiesFromRdfExpression}.map(properties => new ${this.name}(properties))`;
  }
  statements.push(code`return ${propertiesFromRdfExpression};`);

  return Maybe.of(code`\
export function ${syntheticNamePrefix}fromRdf(resource: ${imports.Resource}, options?: ${snippets.FromRdfOptions}): ${imports.Either}<Error, ${this.name}> {
${joinCode(statements)}
}`);
}

function propertiesFromRdfFunctionDeclaration(this: ObjectType): Code {
  const chains: { expression: Code; variable: string }[] = [];
  const initializers: Code[] = [];
  const propertySignatures: Code[] = [];
  const returnType: Code[] = [];

  const variables = {
    context: code`${syntheticNamePrefix}parameters.context`,
    ignoreRdfType: code`${syntheticNamePrefix}parameters.ignoreRdfType`,
    objectSet: code`${syntheticNamePrefix}parameters.objectSet`,
    preferredLanguages: code`${syntheticNamePrefix}parameters.preferredLanguages`,
    resource: code`${syntheticNamePrefix}parameters.resource`,
  };

  this.parentObjectTypes.forEach((parentObjectType, parentObjectTypeI) => {
    chains.push({
      expression: code`${parentObjectType.staticModuleName}.${syntheticNamePrefix}propertiesFromRdf({ ...${syntheticNamePrefix}parameters, ignoreRdfType: true })`,
      variable: `${syntheticNamePrefix}super${parentObjectTypeI}`,
    });
    initializers.push(code`...${syntheticNamePrefix}super${parentObjectTypeI}`);
    returnType.push(
      code`${syntheticNamePrefix}UnwrapR<ReturnType<typeof ${parentObjectType.staticModuleName}.${syntheticNamePrefix}propertiesFromRdf>>`,
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
      expression: code`!${variables.ignoreRdfType} ? ${variables.resource}.value(${predicate})
    .chain(actualRdfType => actualRdfType.toIri())
    .chain((actualRdfType) => {
      // Check the expected type and its known subtypes
      switch (actualRdfType.value) {
        ${[...cases].map((fromRdfType) => `case "${fromRdfType}":`).join("\n")}
          return ${imports.Either}.of<Error, true>(true);
      }

      // Check arbitrary rdfs:subClassOf's of the expected type
      if (${variables.resource}.isInstanceOf(${fromRdfTypeVariable})) {
        return ${imports.Either}.of<Error, true>(true);
      }

      return ${imports.Left}(new Error(\`\${${imports.Resource}.Identifier.toString(${variables.resource}.identifier)} has unexpected RDF type (actual: \${actualRdfType.value}, expected: ${fromRdfType.value})\`));
    }) : ${imports.Either}.of<Error, true>(true)`,
      variable: "_rdfTypeCheck",
    });
  });

  const propertyFromRdfVariables = {
    context: variables.context,
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
    statements.push(code`return ${imports.Either}.of(${resultExpression});`);
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

  return code`\
export function ${syntheticNamePrefix}propertiesFromRdf(${syntheticNamePrefix}parameters: ${snippets.PropertiesFromRdfParameters}): ${imports.Either}<Error, ${joinCode(returnType, { on: " & " })}> {
${joinCode(statements)}
}`;
}

export function rdfFunctionDeclarations(this: ObjectType): readonly Code[] {
  if (!this.features.has("rdf")) {
    return [];
  }

  return [
    ...fromRdfFunctionDeclaration.bind(this)().toList(),
    propertiesFromRdfFunctionDeclaration.bind(this)(),
    ...toRdfFunctionDeclaration.bind(this)().toList(),
  ];
}

function toRdfFunctionDeclaration(this: ObjectType): Maybe<Code> {
  if (this.declarationType !== "interface") {
    return Maybe.empty();
  }

  return toRdfFunctionOrMethodDeclaration.bind(this)();
}
