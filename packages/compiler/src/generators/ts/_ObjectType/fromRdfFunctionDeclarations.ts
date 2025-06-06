import { type FunctionDeclarationStructure, StructureKind } from "ts-morph";
import type { ObjectType } from "../ObjectType.js";
import { objectInitializer } from "../objectInitializer.js";

const variables = {
  context: "_context",
  ignoreRdfType: "_ignoreRdfType",
  languageIn: "_languageIn",
  resource: "_resource",
};

export function fromRdfFunctionDeclarations(
  this: ObjectType,
): readonly FunctionDeclarationStructure[] {
  if (!this.features.has("rdf")) {
    return [];
  }

  if (this.extern) {
    return [];
  }

  const initializers: string[] = [];
  const propertySignatures: string[] = [];
  const propertiesFromRdfFunctionReturnType: string[] = [];
  const propertiesFromRdfFunctionStatements: string[] = [];

  this.parentObjectTypes.forEach((parentObjectType, parentObjectTypeI) => {
    propertiesFromRdfFunctionStatements.push(
      `const _super${parentObjectTypeI}Either = ${parentObjectType.staticModuleName}._propertiesFromRdf({ ...${variables.context}, ignoreRdfType: true, languageIn: ${variables.languageIn}, resource: ${variables.resource} });`,
      `if (_super${parentObjectTypeI}Either.isLeft()) { return _super${parentObjectTypeI}Either; }`,
      `const _super${parentObjectTypeI} = _super${parentObjectTypeI}Either.unsafeCoerce()`,
    );
    initializers.push(`..._super${parentObjectTypeI}`);
    propertiesFromRdfFunctionReturnType.push(
      `UnwrapR<ReturnType<typeof ${parentObjectType.staticModuleName}._propertiesFromRdf>>`,
    );
  });

  this.fromRdfType.ifJust((rdfType) => {
    propertiesFromRdfFunctionStatements.push(
      `if (!${variables.ignoreRdfType} && !${variables.resource}.isInstanceOf(${this.rdfjsTermExpression(rdfType)})) { return purify.Left(new rdfjsResource.Resource.ValueError(${objectInitializer({ focusResource: variables.resource, message: `\`\${rdfjsResource.Resource.Identifier.toString(${variables.resource}.identifier)} has unexpected RDF type (expected ${rdfType.value})\``, predicate: this.rdfjsTermExpression(rdfType) })})); }`,
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
      propertiesFromRdfFunctionStatements.push(...propertyFromRdfStatements);
      initializers.push(property.name);
      propertySignatures.push(`${property.name}: ${property.type.name};`);
    }
  }
  propertiesFromRdfFunctionStatements.push(
    `return purify.Either.of({ ${initializers.join(", ")} })`,
  );
  if (propertySignatures.length > 0) {
    propertiesFromRdfFunctionReturnType.splice(
      0,
      0,
      `{ ${propertySignatures.join(" ")} }`,
    );
  }

  const fromRdfFunctionDeclarations: FunctionDeclarationStructure[] = [];

  fromRdfFunctionDeclarations.push({
    isExported: true,
    kind: StructureKind.Function,
    name: "_propertiesFromRdf",
    parameters: [
      {
        name: `{ ignoreRdfType: ${variables.ignoreRdfType}, languageIn: ${variables.languageIn}, resource: ${variables.resource},\n// @ts-ignore\n...${variables.context} }`,
        type: `{ [_index: string]: any; ignoreRdfType?: boolean; languageIn?: readonly string[]; resource: ${this.rdfjsResourceType().name}; }`,
      },
    ],
    returnType: `purify.Either<rdfjsResource.Resource.ValueError, ${propertiesFromRdfFunctionReturnType.join(" & ")}>`,
    statements: propertiesFromRdfFunctionStatements,
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
        propertiesFromRdfExpression = `${this.staticModuleName}._propertiesFromRdf(parameters).map(properties => new ${this.name}(properties))`;
        break;
      case "interface":
        propertiesFromRdfExpression = `${this.staticModuleName}._propertiesFromRdf(parameters)`;
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
    fromRdfFunctionDeclarations.push({
      isExported: true,
      kind: StructureKind.Function,
      name: "fromRdf",
      parameters: [
        {
          name: "parameters",
          type: `Parameters<typeof ${this.staticModuleName}._propertiesFromRdf>[0]`,
        },
      ],
      returnType: `purify.Either<rdfjsResource.Resource.ValueError, ${this.name}>`,
      statements: fromRdfStatements,
    });
  }

  return fromRdfFunctionDeclarations;
}
