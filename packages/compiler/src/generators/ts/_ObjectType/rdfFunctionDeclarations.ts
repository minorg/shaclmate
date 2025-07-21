import { Maybe } from "purify-ts";
import { type FunctionDeclarationStructure, StructureKind } from "ts-morph";

import { rdf } from "@tpluscode/rdf-ns-builders";
import type { ObjectType } from "../ObjectType.js";
import { objectInitializer } from "../objectInitializer.js";
import { toRdfFunctionOrMethodDeclaration } from "./toRdfFunctionOrMethodDeclaration.js";

function fromRdfFunctionDeclarations(
  this: ObjectType,
): readonly FunctionDeclarationStructure[] {
  const initializers: string[] = [];
  const propertySignatures: string[] = [];
  const propertiesFromRdfReturnType: string[] = [];
  const propertiesFromRdfStatements: string[] = [];

  this.parentObjectTypes.forEach((parentObjectType, parentObjectTypeI) => {
    propertiesFromRdfStatements.push(
      `const _super${parentObjectTypeI}Either = ${parentObjectType.staticModuleName}.propertiesFromRdf({ ...${variables.context}, ignoreRdfType: true, languageIn: ${variables.languageIn}, resource: ${variables.resource} });`,
      `if (_super${parentObjectTypeI}Either.isLeft()) { return _super${parentObjectTypeI}Either; }`,
      `const _super${parentObjectTypeI} = _super${parentObjectTypeI}Either.unsafeCoerce()`,
    );
    initializers.push(`..._super${parentObjectTypeI}`);
    propertiesFromRdfReturnType.push(
      `$UnwrapR<ReturnType<typeof ${parentObjectType.staticModuleName}.propertiesFromRdf>>`,
    );
  });

  this.fromRdfType.ifJust((rdfType) => {
    propertiesFromRdfStatements.push(
      `\
if (!${variables.ignoreRdfType} && !${variables.resource}.isInstanceOf(${this.rdfjsTermExpression(rdfType)})) {
  return ${variables.resource}.value(${this.rdfjsTermExpression(rdf.type)}).chain(actualRdfType => actualRdfType.toIri()).chain((actualRdfType) => purify.Left(new rdfjsResource.Resource.ValueError(${objectInitializer({ focusResource: variables.resource, message: `\`\${rdfjsResource.Resource.Identifier.toString(${variables.resource}.identifier)} has unexpected RDF type (actual: \${actualRdfType.value}, expected: ${rdfType.value})\``, predicate: this.rdfjsTermExpression(rdf.type) })})));
}`,
    );
  });

  const propertyFromRdfVariables = {
    context: variables.context,
    languageIn: variables.languageIn,
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
    name: "propertiesFromRdf",
    parameters: [
      {
        name: `{ ignoreRdfType: ${variables.ignoreRdfType}, languageIn: ${variables.languageIn}, resource: ${variables.resource},\n// @ts-ignore\n...${variables.context} }`,
        type: "{ [_index: string]: any; ignoreRdfType?: boolean; languageIn?: readonly string[]; resource: rdfjsResource.Resource; }",
      },
    ],
    returnType: `purify.Either<rdfjsResource.Resource.ValueError, ${propertiesFromRdfReturnType.join(" & ")}>`,
    statements: propertiesFromRdfStatements,
  });

  const fromRdfStatements: string[] = [];
  let fromRdfReturnStatement: string | undefined;
  if (this.abstract) {
    if (this.childObjectTypes.length > 0) {
      // Can't ignore the RDF type if we're doing a union.
      fromRdfStatements.push(
        "const { ignoreRdfType: _ignoreRdfType, ...otherParameters } = parameters",
      );
      // Similar to an object union type, alt-chain the fromRdf of the different concrete subclasses together
      fromRdfReturnStatement = `return ${this.childObjectTypes.reduce(
        (expression, childObjectType) => {
          const childObjectTypeExpression = `(${childObjectType.staticModuleName}.fromRdf(otherParameters) as purify.Either<rdfjsResource.Resource.ValueError, ${this.name}>)`;
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
        propertiesFromRdfExpression = `${this.staticModuleName}.propertiesFromRdf(parameters).map(properties => new ${this.name}(properties))`;
        break;
      case "interface":
        propertiesFromRdfExpression = `${this.staticModuleName}.propertiesFromRdf(parameters)`;
        break;
    }

    if (this.childObjectTypes.length > 0) {
      // Can't ignore the RDF type if we're trying the child object type.
      fromRdfStatements.push(
        "const { ignoreRdfType: _ignoreRdfType, ...otherParameters } = parameters",
      );
      fromRdfReturnStatement = `${this.childObjectTypes.reduce(
        (expression, childObjectType) => {
          const childObjectTypeExpression = `(${childObjectType.staticModuleName}.fromRdf(otherParameters) as purify.Either<rdfjsResource.Resource.ValueError, ${this.name}>)`;
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
      name: "fromRdf",
      parameters: [
        {
          name: "parameters",
          type: `Parameters<typeof ${this.staticModuleName}.propertiesFromRdf>[0]`,
        },
      ],
      returnType: `purify.Either<rdfjsResource.Resource.ValueError, ${this.name}>`,
      statements: fromRdfStatements,
    });
  }

  return functionDeclarations;
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
      name: "toRdf",
    }));
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

const variables = {
  context: "_context",
  ignoreRdfType: "_ignoreRdfType",
  languageIn: "_languageIn",
  resource: "_resource",
};
