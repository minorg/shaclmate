import { type FunctionDeclarationStructure, StructureKind } from "ts-morph";
import type { ObjectUnionType } from "../ObjectUnionType.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";

function fromRdfFunctionDeclaration(
  this: ObjectUnionType,
): FunctionDeclarationStructure {
  return {
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
        type: `{ [_index: string]: any; ignoreRdfType?: boolean; objectSet?: ${syntheticNamePrefix}ObjectSet; preferredLanguages?: readonly string[] }`,
      },
    ],
    returnType: `purify.Either<Error, ${this.name}>`,
    statements: [
      `return ${this.concreteMemberTypes.reduce((expression, memberType) => {
        const memberTypeExpression = `(${memberType.staticModuleName}.${syntheticNamePrefix}fromRdf(resource, { ...options, ignoreRdfType: false }) as purify.Either<Error, ${this.name}>)`;
        return expression.length > 0
          ? `${expression}.altLazy(() => ${memberTypeExpression})`
          : memberTypeExpression;
      }, "")};`,
    ],
  };
}

export function rdfFunctionDeclarations(
  this: ObjectUnionType,
): readonly FunctionDeclarationStructure[] {
  if (!this.features.has("rdf")) {
    return [];
  }

  return [
    fromRdfFunctionDeclaration.bind(this)(),
    toRdfFunctionDeclaration.bind(this)(),
  ];
}

function toRdfFunctionDeclaration(
  this: ObjectUnionType,
): FunctionDeclarationStructure {
  const parametersVariable = "_parameters";

  return {
    isExported: true,
    kind: StructureKind.Function,
    name: `${syntheticNamePrefix}toRdf`,
    parameters: [
      {
        name: this.thisVariable,
        type: this.name,
      },
      {
        hasQuestionToken: true,
        name: parametersVariable,
        type: "{ mutateGraph?: rdfjsResource.MutableResource.MutateGraph, resourceSet?: rdfjsResource.MutableResourceSet }",
      },
    ],
    returnType: (() => {
      let returnType: string | undefined;
      for (const memberType of this.concreteMemberTypes) {
        const memberRdfjsResourceType = memberType.toRdfjsResourceType;

        if (typeof returnType === "undefined") {
          returnType = memberRdfjsResourceType;
        } else if (memberRdfjsResourceType !== returnType) {
          return "rdfjsResource.Resource";
        }
      }
      // The types agree
      return returnType!;
    })(),
    statements: this.concreteMemberTypes
      .map((memberType) => {
        let returnExpression: string;
        switch (memberType.declarationType) {
          case "class":
            returnExpression = `${this.thisVariable}.${syntheticNamePrefix}toRdf(${parametersVariable})`;
            break;
          case "interface":
            returnExpression = `${memberType.staticModuleName}.${syntheticNamePrefix}toRdf(${this.thisVariable}, ${parametersVariable})`;
            break;
        }
        return `if (${memberType.staticModuleName}.is${memberType.name}(${this.thisVariable})) { return ${returnExpression}; }`;
      })
      .concat(
        `${this.thisVariable} satisfies never; throw new Error("unrecognized type");`,
      ),
  };
}
