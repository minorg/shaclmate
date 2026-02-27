import { rdf } from "@tpluscode/rdf-ns-builders";
import { Maybe } from "purify-ts";
import { imports } from "../imports.js";
import type { ObjectType } from "../ObjectType.js";
import { rdfjsTermExpression } from "../rdfjsTermExpression.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { type Code, code, joinCode } from "../ts-poet-wrapper.js";

export function ObjectType_toRdfFunctionOrMethodDeclaration(
  this: ObjectType,
): Maybe<Code> {
  if (!this.features.has("rdf")) {
    return Maybe.empty();
  }

  this.ensureAtMostOneSuperObjectType();

  let preamble: string = "";
  if (this.declarationType === "interface") {
    preamble = "export function ";
  }

  const parameters: Code[] = [];
  if (this.declarationType === "interface") {
    parameters.push(code`${this.thisVariable}: ${this.name}`);
  }
  parameters.push(
    code`options?: { ${variables.ignoreRdfType}?: boolean; ${variables.graph}?: Exclude<${imports.Quad_Graph}, ${imports.Variable}>, ${variables.resourceSet}?: ${imports.ResourceSet} }`,
  );

  const statements: Code[] = [
    code`const ${variables.resourceSet} = options?.${variables.resourceSet} ?? new ${imports.ResourceSet}(${imports.datasetFactory}.dataset(), { dataFactory: ${imports.dataFactory} });`,
  ];

  if (this.parentObjectTypes.length > 0) {
    const superToRdfOptions = code`{ ${variables.ignoreRdfType}: true, ${variables.graph}: options?.${variables.graph}, ${variables.resourceSet} }`;
    let superToRdfCall: Code;
    switch (this.declarationType) {
      case "class":
        preamble = "override ";
        superToRdfCall = code`super.${syntheticNamePrefix}toRdf(${superToRdfOptions})`;
        break;
      case "interface":
        superToRdfCall = code`${this.parentObjectTypes[0].staticModuleName}.${syntheticNamePrefix}toRdf(${this.thisVariable}, ${superToRdfOptions})`;
        break;
    }
    statements.push(code`const ${variables.resource} = ${superToRdfCall};`);
  } else {
    statements.push(
      code`const ${variables.resource} = ${variables.resourceSet}.resource(${this.thisVariable}.${this.identifierProperty.name});`,
    );
  }

  if (this.toRdfTypes.length > 0) {
    statements.push(
      code`if (!options?.${variables.ignoreRdfType}) { ${joinCode(
        this.toRdfTypes.map(
          (toRdfType) =>
            code`${variables.resource}.add(${rdfjsTermExpression(rdf.type)}, ${imports.dataFactory}.namedNode("${toRdfType.value}"), options?.${variables.graph});`,
        ),
        { on: " " },
      )} }`,
    );
  }

  for (const property of this.properties) {
    statements.push(
      ...property.toRdfStatements({
        variables: {
          ...variables,
          graph: code`options?.${variables.graph}`,
          value: code`${this.thisVariable}.${property.name}`,
        },
      }),
    );
  }

  statements.push(code`return ${variables.resource};`);

  return Maybe.of(code`\
${preamble}${syntheticNamePrefix}toRdf(${joinCode(parameters, { on: "," })}): ${this.toRdfjsResourceType} {
  ${joinCode(statements)}
}`);
}

const variables = {
  ignoreRdfType: code`ignoreRdfType`,
  graph: code`graph`,
  resource: code`resource`,
  resourceSet: code`resourceSet`,
};
