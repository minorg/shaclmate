import { rdf } from "@tpluscode/rdf-ns-builders";
import { Maybe } from "purify-ts";
import { type FunctionDeclarationStructure, StructureKind } from "ts-morph";
import type { ObjectType } from "../ObjectType.js";
import { rdfjsTermExpression } from "../rdfjsTermExpression.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { toRdfFunctionOrMethodDeclaration } from "./toRdfFunctionOrMethodDeclaration.js";

function fromRdfFunctionDeclaration(
  this: ObjectType,
): Maybe<FunctionDeclarationStructure> {
  if (this.abstract) {
    return Maybe.empty();
  }

  const statements: string[] = [
    "let { context, ignoreRdfType = false, objectSet, preferredLanguages } = (options ?? {});",
    `if (!objectSet) { objectSet = new ${syntheticNamePrefix}RdfjsDatasetObjectSet({ dataset: resource.dataset }); }`,
  ];

  let propertiesFromRdfExpression = `${this.staticModuleName}.${syntheticNamePrefix}propertiesFromRdf({ context, ignoreRdfType, objectSet, preferredLanguages, resource })`;
  if (this.declarationType === "class") {
    propertiesFromRdfExpression = `${propertiesFromRdfExpression}.map(properties => new ${this.name}(properties))`;
  }
  statements.push(`return ${propertiesFromRdfExpression};`);

  return Maybe.of({
    isExported: true,
    kind: StructureKind.Function,
    name: `${syntheticNamePrefix}fromRdf`,
    parameters: [
      {
        name: "resource",
        type: "rdfjsResource.Resource",
      },
      {
        hasQuestionToken: true,
        name: "options",
        type: `{ context?: any; ignoreRdfType?: boolean; objectSet?: ${syntheticNamePrefix}ObjectSet; preferredLanguages?: readonly string[]; }`,
      },
    ],
    returnType: `purify.Either<Error, ${this.name}>`,
    statements,
  });
}

function propertiesFromRdfFunctionDeclaration(
  this: ObjectType,
): FunctionDeclarationStructure {
  const chains: { expression: string; variable: string }[] = [];
  const initializers: string[] = [];
  const propertySignatures: string[] = [];
  const returnType: string[] = [];

  const variables = {
    context: `${syntheticNamePrefix}parameters.context`,
    ignoreRdfType: `${syntheticNamePrefix}parameters.ignoreRdfType`,
    objectSet: `${syntheticNamePrefix}parameters.objectSet`,
    preferredLanguages: `${syntheticNamePrefix}parameters.preferredLanguages`,
    resource: `${syntheticNamePrefix}parameters.resource`,
  };

  this.parentObjectTypes.forEach((parentObjectType, parentObjectTypeI) => {
    chains.push({
      expression: `${parentObjectType.staticModuleName}.${syntheticNamePrefix}propertiesFromRdf({ ...${syntheticNamePrefix}parameters, ignoreRdfType: true })`,
      variable: `${syntheticNamePrefix}super${parentObjectTypeI}`,
    });
    initializers.push(`...${syntheticNamePrefix}super${parentObjectTypeI}`);
    returnType.push(
      `${syntheticNamePrefix}UnwrapR<ReturnType<typeof ${parentObjectType.staticModuleName}.${syntheticNamePrefix}propertiesFromRdf>>`,
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
      expression: `!${variables.ignoreRdfType} ? ${variables.resource}.value(${predicate})
    .chain(actualRdfType => actualRdfType.toIri())
    .chain((actualRdfType) => {
      // Check the expected type and its known subtypes
      switch (actualRdfType.value) {
        ${[...cases].map((fromRdfType) => `case "${fromRdfType}":`).join("\n")}
          return purify.Either.of<Error, true>(true);
      }

      // Check arbitrary rdfs:subClassOf's of the expected type
      if (${variables.resource}.isInstanceOf(${fromRdfTypeVariable})) {
        return purify.Either.of<Error, true>(true);
      }

      return purify.Left(new Error(\`\${rdfjsResource.Resource.Identifier.toString(${variables.resource}.identifier)} has unexpected RDF type (actual: \${actualRdfType.value}, expected: ${fromRdfType.value})\`));
    }) : purify.Either.of<Error, true>(true)`,
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
        initializers.push(property.name);
        propertySignatures.push(`${property.name}: ${property.type.name};`);
      });
  }

  const statements: string[] = [];
  const resultExpression = `{ ${initializers.join(", ")} }`;
  if (chains.length === 0) {
    statements.push(`return purify.Either.of(${resultExpression});`);
  } else {
    statements.push(
      `return ${chains
        .reverse()
        .reduce(
          (acc, { expression, variable }, chainI) =>
            `(${expression}).${chainI === 0 ? "map" : "chain"}(${variable} => ${acc})`,
          `(${resultExpression})`,
        )}`,
    );
  }

  if (propertySignatures.length > 0) {
    returnType.splice(0, 0, `{ ${propertySignatures.join(" ")} }`);
  }

  return {
    isExported: true,
    kind: StructureKind.Function,
    name: `${syntheticNamePrefix}propertiesFromRdf`,
    parameters: [
      {
        name: `${syntheticNamePrefix}parameters`,
        type: `{ context?: any; ignoreRdfType: boolean; objectSet: ${syntheticNamePrefix}ObjectSet; preferredLanguages?: readonly string[]; resource: rdfjsResource.Resource; }`,
      },
    ],
    returnType: `purify.Either<Error, ${returnType.join(" & ")}>`,
    statements,
  };
}

export function rdfFunctionDeclarations(
  this: ObjectType,
): readonly FunctionDeclarationStructure[] {
  if (!this.features.has("rdf")) {
    return [];
  }

  if (this.extern) {
    return [];
  }

  return [
    ...fromRdfFunctionDeclaration.bind(this)().toList(),
    propertiesFromRdfFunctionDeclaration.bind(this)(),
    ...toRdfFunctionDeclaration.bind(this)().toList(),
  ];
}

function toRdfFunctionDeclaration(
  this: ObjectType,
): Maybe<FunctionDeclarationStructure> {
  if (this.declarationType !== "interface") {
    return Maybe.empty();
  }

  return toRdfFunctionOrMethodDeclaration
    .bind(this)()
    .map((toRdfFunctionOrMethodDeclaration) => ({
      ...toRdfFunctionOrMethodDeclaration,
      isExported: true,
      kind: StructureKind.Function,
    }));
}
