import { rdf } from "@tpluscode/rdf-ns-builders";
import { Maybe } from "purify-ts";
import { type FunctionDeclarationStructure, StructureKind } from "ts-morph";
import type { ObjectType } from "../ObjectType.js";
import { rdfjsTermExpression } from "../rdfjsTermExpression.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { toRdfFunctionOrMethodDeclaration } from "./toRdfFunctionOrMethodDeclaration.js";

function fromRdfFunctionDeclarations(
  this: ObjectType,
): readonly FunctionDeclarationStructure[] {
  const initializers: string[] = [];
  const propertySignatures: string[] = [];
  const propertiesFromRdfReturnType: string[] = [];
  const propertiesFromRdfStatements: string[] = [];

  if (this.ownProperties.length > 0 || this.parentObjectTypes.length > 0) {
    propertiesFromRdfStatements.push(
      "// @ts-ignore",
      `const ${syntheticNamePrefix}objectSet = ${syntheticNamePrefix}objectSetParameter ?? new ${syntheticNamePrefix}RdfjsDatasetObjectSet({ dataset: ${variables.resource}.dataset });`,
    );
  }

  this.parentObjectTypes.forEach((parentObjectType, parentObjectTypeI) => {
    propertiesFromRdfStatements.push(
      `const ${syntheticNamePrefix}super${parentObjectTypeI}Either = ${parentObjectType.staticModuleName}.${syntheticNamePrefix}propertiesFromRdf({ ...${variables.context}, ignoreRdfType: true, languageIn: ${variables.languageIn}, objectSet: ${variables.objectSet}, resource: ${variables.resource} });`,
      `if (${syntheticNamePrefix}super${parentObjectTypeI}Either.isLeft()) { return ${syntheticNamePrefix}super${parentObjectTypeI}Either; }`,
      `const ${syntheticNamePrefix}super${parentObjectTypeI} = ${syntheticNamePrefix}super${parentObjectTypeI}Either.unsafeCoerce()`,
    );
    initializers.push(`...${syntheticNamePrefix}super${parentObjectTypeI}`);
    propertiesFromRdfReturnType.push(
      `${syntheticNamePrefix}UnwrapR<ReturnType<typeof ${parentObjectType.staticModuleName}.${syntheticNamePrefix}propertiesFromRdf>>`,
    );
  });

  this.fromRdfType.ifJust((rdfType) => {
    const predicate = rdfjsTermExpression(rdf.type);
    propertiesFromRdfStatements.push(
      `\
if (!${variables.ignoreRdfType} && !${variables.resource}.isInstanceOf(${syntheticNamePrefix}fromRdfType)) {
  return ${variables.resource}.value(${predicate}).chain(actualRdfType => actualRdfType.toIri()).chain((actualRdfType) => purify.Left(new Error(\`\${rdfjsResource.Resource.Identifier.toString(${variables.resource}.identifier)} has unexpected RDF type (actual: \${actualRdfType.value}, expected: ${rdfType.value})\`)));
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
      propertiesFromRdfStatements.push(...propertyFromRdfStatements);
      initializers.push(property.name);
      propertySignatures.push(`${property.name}: ${property.type.name};`);
    }
  }
  propertiesFromRdfStatements.push(
    `return purify.Either.of({ ${initializers.join(", ")} })`,
  );
  if (propertySignatures.length > 0) {
    propertiesFromRdfReturnType.splice(
      0,
      0,
      `{ ${propertySignatures.join(" ")} }`,
    );
  }

  const functionDeclarations: FunctionDeclarationStructure[] = [];

  functionDeclarations.push({
    isExported: true,
    kind: StructureKind.Function,
    name: `${syntheticNamePrefix}propertiesFromRdf`,
    parameters: [
      {
        name: `{ ignoreRdfType: ${variables.ignoreRdfType}, languageIn: ${variables.languageIn}, objectSet: ${syntheticNamePrefix}objectSetParameter, resource: ${variables.resource},\n// @ts-ignore\n...${variables.context} }`,
        type: `{ [_index: string]: any; ignoreRdfType?: boolean; languageIn?: readonly string[]; objectSet?: ${syntheticNamePrefix}ObjectSet; resource: rdfjsResource.Resource; }`,
      },
    ],
    returnType: `purify.Either<Error, ${propertiesFromRdfReturnType.join(" & ")}>`,
    statements: propertiesFromRdfStatements,
  });

  const fromRdfStatements: string[] = [];
  let fromRdfReturnStatement: string | undefined;
  if (this.abstract) {
    if (this.childObjectTypes.length > 0) {
      // Can't ignore the RDF type if we're doing a union.
      fromRdfStatements.push(
        "const { ignoreRdfType: _, ...otherParameters } = parameters;",
      );
      // Similar to an object union type, alt-chain the fromRdf of the different concrete subclasses together
      fromRdfReturnStatement = `return ${this.childObjectTypes.reduce(
        (expression, childObjectType) => {
          const childObjectTypeExpression = `(${childObjectType.staticModuleName}.${syntheticNamePrefix}fromRdf(otherParameters) as purify.Either<Error, ${this.name}>)`;
          return expression.length > 0
            ? `${expression}.altLazy(() => ${childObjectTypeExpression})`
            : childObjectTypeExpression;
        },
        "",
      )};`;
    }
  } else {
    let propertiesFromRdfExpression: string;
    switch (this.declarationType) {
      case "class":
        propertiesFromRdfExpression = `${this.staticModuleName}.${syntheticNamePrefix}propertiesFromRdf(parameters).map(properties => new ${this.name}(properties))`;
        break;
      case "interface":
        propertiesFromRdfExpression = `${this.staticModuleName}.${syntheticNamePrefix}propertiesFromRdf(parameters)`;
        break;
    }

    if (this.childObjectTypes.length > 0) {
      // Can't ignore the RDF type if we're trying the child object type.
      fromRdfStatements.push(
        "const { ignoreRdfType: _, ...otherParameters } = parameters;",
      );
      fromRdfReturnStatement = `${this.childObjectTypes.reduce(
        (expression, childObjectType) => {
          const childObjectTypeExpression = `(${childObjectType.staticModuleName}.${syntheticNamePrefix}fromRdf(otherParameters) as purify.Either<Error, ${this.name}>)`;
          return expression.length > 0
            ? `${expression}.altLazy(() => ${childObjectTypeExpression})`
            : childObjectTypeExpression;
        },
        "",
      )}.altLazy(() => ${propertiesFromRdfExpression})`;
    } else {
      fromRdfReturnStatement = propertiesFromRdfExpression;
    }
    fromRdfReturnStatement = `return ${fromRdfReturnStatement};`;
  }

  if (fromRdfReturnStatement) {
    fromRdfStatements.push(fromRdfReturnStatement);
  }

  if (fromRdfStatements.length > 0) {
    functionDeclarations.push({
      isExported: true,
      kind: StructureKind.Function,
      name: `${syntheticNamePrefix}fromRdf`,
      parameters: [
        {
          name: "parameters",
          type: `Parameters<typeof ${this.staticModuleName}.${syntheticNamePrefix}propertiesFromRdf>[0]`,
        },
      ],
      returnType: `purify.Either<Error, ${this.name}>`,
      statements: fromRdfStatements,
    });
  }

  return functionDeclarations;
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
    ...fromRdfFunctionDeclarations.bind(this)(),
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
