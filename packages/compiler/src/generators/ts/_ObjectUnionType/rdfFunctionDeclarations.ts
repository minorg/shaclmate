import { type Code, code, joinCode } from "ts-poet";
import { codeEquals } from "../codeEquals.js";
import { imports } from "../imports.js";
import type { ObjectUnionType } from "../ObjectUnionType.js";
import { snippets } from "../snippets.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";

function fromRdfFunctionDeclaration(this: ObjectUnionType): Code {
  return code`\
export function ${syntheticNamePrefix}fromRdf(resource: ${imports.Resource}, options?: ${snippets.FromRdfOptions}): ${imports.Either}<Error, ${this.name}> {
  return ${this.concreteMemberTypes.reduce(
    (expression, memberType) => {
      const memberTypeExpression = code`(${memberType.staticModuleName}.${syntheticNamePrefix}fromRdf(resource, { ...options, ignoreRdfType: false }) as ${imports.Either}<Error, ${this.name}>)`;
      return expression !== null
        ? code`${expression}.altLazy(() => ${memberTypeExpression})`
        : memberTypeExpression;
    },
    null as Code | null,
  )};
}`;
}

export function rdfFunctionDeclarations(
  this: ObjectUnionType,
): readonly Code[] {
  if (!this.features.has("rdf")) {
    return [];
  }

  return [
    fromRdfFunctionDeclaration.bind(this)(),
    toRdfFunctionDeclaration.bind(this)(),
  ];
}

function toRdfFunctionDeclaration(this: ObjectUnionType): Code {
  const parametersVariable = "_parameters";
  const returnType = () => {
    let returnType: Code | undefined;
    for (const memberType of this.concreteMemberTypes) {
      const memberRdfjsResourceType = memberType.toRdfjsResourceType;

      if (typeof returnType === "undefined") {
        returnType = memberRdfjsResourceType;
      } else if (!codeEquals(memberRdfjsResourceType, returnType)) {
        return code`${imports.Resource}`;
      }
    }
    // The types agree
    return returnType!;
  };

  return code`\
export function ${syntheticNamePrefix}toRdf(${this.thisVariable}: ${this.name}, ${parametersVariable}?: { mutateGraph?: ${imports.MutableResource}.MutateGraph, resourceSet?: ${imports.MutableResourceSet} }): ${returnType()} {
${joinCode(
  this.concreteMemberTypes
    .map((memberType) => {
      let returnExpression: Code;
      switch (memberType.declarationType) {
        case "class":
          returnExpression = code`${this.thisVariable}.${syntheticNamePrefix}toRdf(${parametersVariable})`;
          break;
        case "interface":
          returnExpression = code`${memberType.staticModuleName}.${syntheticNamePrefix}toRdf(${this.thisVariable}, ${parametersVariable})`;
          break;
      }
      return code`if (${memberType.staticModuleName}.is${memberType.name}(${this.thisVariable})) { return ${returnExpression}; }`;
    })
    .concat(code`throw new Error("unrecognized type");`),
)}
}`;
}
