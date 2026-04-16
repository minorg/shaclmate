import { Maybe } from "purify-ts";
import { codeEquals } from "../codeEquals.js";
import { imports } from "../imports.js";
import type { ObjectUnionType } from "../ObjectUnionType.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { type Code, code, joinCode } from "../ts-poet-wrapper.js";

export function ObjectUnionType_toRdfFunctionDeclaration(
  this: ObjectUnionType,
): Maybe<Code> {
  if (!this.features.has("rdf")) {
    return Maybe.empty();
  }

  const parametersVariable = "_parameters";
  const returnType = () => {
    let returnType: Code | undefined;
    for (const memberType of this.concreteMemberTypes) {
      const memberRdfjsResourceType = memberType.toRdfjsResourceType;

      if (returnType === undefined) {
        returnType = memberRdfjsResourceType;
      } else if (!codeEquals(memberRdfjsResourceType, returnType)) {
        return code`${imports.Resource}`;
      }
    }
    // The types agree
    return returnType!;
  };

  return Maybe.of(code`\
export function ${syntheticNamePrefix}toRdf(${this.thisVariable}: ${this.name}, ${parametersVariable}?: { graph?: Exclude<${imports.Quad_Graph}, ${imports.Variable}>, resourceSet?: ${imports.ResourceSet} }): ${returnType()} {
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
}`);
}
