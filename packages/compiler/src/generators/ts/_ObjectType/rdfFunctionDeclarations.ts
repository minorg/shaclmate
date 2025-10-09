import { rdf } from "@tpluscode/rdf-ns-builders";
import { Maybe } from "purify-ts";
import { invariant } from "ts-invariant";
import { type FunctionDeclarationStructure, StructureKind } from "ts-morph";
import type { ObjectType } from "../ObjectType.js";
import { rdfjsTermExpression } from "../rdfjsTermExpression.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { toRdfFunctionOrMethodDeclaration } from "./toRdfFunctionOrMethodDeclaration.js";

function fromRdfFunctionDeclaration(
  this: ObjectType,
): Maybe<FunctionDeclarationStructure> {
  const statements: string[] = [];

  statements.push(
    "let { ignoreRdfType = false, languageIn, objectSet, ...context } = (options ?? {});",
    `if (!objectSet) { objectSet = new ${syntheticNamePrefix}RdfjsDatasetObjectSet({ dataset: resource.dataset }); }`,
  );

  let returnExpression: string | undefined;
  if (this.childObjectTypes.length > 0) {
    // Can't ignore the RDF type.
    // Similar to an object union type, alt-chain the fromRdf of the different concrete subclasses together
    returnExpression = this.childObjectTypes.reduce(
      (expression, childObjectType) => {
        const childObjectTypeExpression = `(${childObjectType.staticModuleName}.${syntheticNamePrefix}fromRdf(resource, { ...context, ignoreRdfType: false, objectSet }) as purify.Either<Error, ${this.name}>)`;
        return expression.length > 0
          ? `${expression}.altLazy(() => ${childObjectTypeExpression})`
          : childObjectTypeExpression;
      },
      "",
    );
  }

  if (!this.abstract) {
    let propertiesFromRdfExpression = `${this.staticModuleName}.${syntheticNamePrefix}propertiesFromRdf({ ...context, ignoreRdfType, languageIn, objectSet, resource })`;
    if (this.declarationType === "class") {
      propertiesFromRdfExpression = `${propertiesFromRdfExpression}.map(properties => new ${this.name}(properties))`;
    }

    if (this.childObjectTypes.length > 0) {
      invariant(returnExpression);
      returnExpression = `${returnExpression}.altLazy(() => ${propertiesFromRdfExpression})`;
    } else {
      invariant(!returnExpression);
      returnExpression = propertiesFromRdfExpression;
    }
  }

  if (returnExpression) {
    statements.push(`return ${returnExpression};`);
  }

  if (statements.length === 0) {
    return Maybe.empty();
  }

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
        type: `{ [_index: string]: any; ignoreRdfType?: boolean; languageIn?: readonly string[]; objectSet?: ${syntheticNamePrefix}ObjectSet; }`,
      },
    ],
    returnType: `purify.Either<Error, ${this.name}>`,
    statements: statements,
  });
}

function propertiesFromRdfFunctionDeclaration(
  this: ObjectType,
): FunctionDeclarationStructure {
  const initializers: string[] = [];
  const propertySignatures: string[] = [];
  const returnType: string[] = [];
  const statements: string[] = [];

  this.parentObjectTypes.forEach((parentObjectType, parentObjectTypeI) => {
    statements.push(
      `const ${syntheticNamePrefix}super${parentObjectTypeI}Either = ${parentObjectType.staticModuleName}.${syntheticNamePrefix}propertiesFromRdf({ ...${variables.context}, ignoreRdfType: true, languageIn: ${variables.languageIn}, objectSet: ${variables.objectSet}, resource: ${variables.resource} });`,
      `if (${syntheticNamePrefix}super${parentObjectTypeI}Either.isLeft()) { return ${syntheticNamePrefix}super${parentObjectTypeI}Either; }`,
      `const ${syntheticNamePrefix}super${parentObjectTypeI} = ${syntheticNamePrefix}super${parentObjectTypeI}Either.unsafeCoerce()`,
    );
    initializers.push(`...${syntheticNamePrefix}super${parentObjectTypeI}`);
    returnType.push(
      `${syntheticNamePrefix}UnwrapR<ReturnType<typeof ${parentObjectType.staticModuleName}.${syntheticNamePrefix}propertiesFromRdf>>`,
    );
  });

  this.fromRdfType.ifJust((fromRdfType) => {
    const fromRdfTypeVariable = this.fromRdfTypeVariable.unsafeCoerce();
    const predicate = rdfjsTermExpression(rdf.type);
    statements.push(
      `\
if (!${variables.ignoreRdfType}) {
  const ${syntheticNamePrefix}rdfTypeCheck: purify.Either<Error, true> = ${variables.resource}.value(${predicate})
    .chain(actualRdfType => actualRdfType.toIri())
    .chain((actualRdfType) => {
      // Check the expected type and its known subtypes
      switch (actualRdfType.value) {
        ${[`case "${fromRdfType.value}":`].concat(this.descendantFromRdfTypes.map((descendantFromRdfType) => `case "${descendantFromRdfType.value}":`)).join("\n")}
          return purify.Either.of(true);
      }

      // Check arbitrary rdfs:subClassOf's of the expected type
      if (${variables.resource}.isInstanceOf(${fromRdfTypeVariable})) {
        return purify.Either.of(true);
      }

      return purify.Left(new Error(\`\${rdfjsResource.Resource.Identifier.toString(${variables.resource}.identifier)} has unexpected RDF type (actual: \${actualRdfType.value}, expected: ${fromRdfType.value})\`));
    });
  if (${syntheticNamePrefix}rdfTypeCheck.isLeft()) {
    return ${syntheticNamePrefix}rdfTypeCheck;
  }
}`,
    );
  });

  const propertyFromRdfVariables = {
    context: variables.context,
    languageIn: variables.languageIn,
    objectSet: variables.objectSet,
    resource: variables.resource,
  };
  for (const property of this.properties) {
    const propertyFromRdfStatements = property.fromRdfStatements({
      variables: propertyFromRdfVariables,
    });
    if (propertyFromRdfStatements.length > 0) {
      statements.push(...propertyFromRdfStatements);
      initializers.push(property.name);
      propertySignatures.push(`${property.name}: ${property.type.name};`);
    }
  }
  statements.push(`return purify.Either.of({ ${initializers.join(", ")} })`);
  if (propertySignatures.length > 0) {
    returnType.splice(0, 0, `{ ${propertySignatures.join(" ")} }`);
  }

  return {
    isExported: true,
    kind: StructureKind.Function,
    name: `${syntheticNamePrefix}propertiesFromRdf`,
    parameters: [
      {
        name: `{ ignoreRdfType: ${variables.ignoreRdfType}, languageIn: ${variables.languageIn}, objectSet: ${variables.objectSet}, resource: ${variables.resource},\n// @ts-ignore\n...${variables.context} }`,
        type: `{ [_index: string]: any; ignoreRdfType: boolean; languageIn?: readonly string[]; objectSet: ${syntheticNamePrefix}ObjectSet; resource: rdfjsResource.Resource; }`,
      },
    ],
    returnType: `purify.Either<Error, ${returnType.join(" & ")}>`,
    statements: statements,
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

const variables = {
  context: `${syntheticNamePrefix}context`,
  ignoreRdfType: `${syntheticNamePrefix}ignoreRdfType`,
  languageIn: `${syntheticNamePrefix}languageIn`,
  objectSet: `${syntheticNamePrefix}objectSet`,
  resource: `${syntheticNamePrefix}resource`,
};
