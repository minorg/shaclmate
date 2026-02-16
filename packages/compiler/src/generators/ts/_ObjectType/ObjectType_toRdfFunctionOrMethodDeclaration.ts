import { rdf } from "@tpluscode/rdf-ns-builders";
import { Maybe } from "purify-ts";
import { imports } from "../imports.js";
import type { ObjectType } from "../ObjectType.js";
import { rdfjsTermExpression } from "../rdfjsTermExpression.js";
import { snippets } from "../snippets.js";
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
    code`options?: { ${variables.ignoreRdfType}?: boolean; ${variables.mutateGraph}?: ${imports.MutableResource}.MutateGraph, ${variables.resourceSet}?: ${imports.MutableResourceSet} }`,
  );

  let usedIgnoreRdfTypeVariable = false;

  const statements: Code[] = [
    code`const ${variables.mutateGraph} = options?.${variables.mutateGraph};`,
    code`const ${variables.resourceSet} = options?.${variables.resourceSet} ?? new ${imports.MutableResourceSet}({ ${imports.dataFactory}, dataset: ${snippets.datasetFactory}.dataset() });`,
  ];

  if (this.parentObjectTypes.length > 0) {
    const superToRdfOptions = code`{ ${variables.ignoreRdfType}: true, ${variables.mutateGraph}, ${variables.resourceSet} }`;
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
    usedIgnoreRdfTypeVariable = !this.parentObjectTypes[0].abstract;
  } else if (this.identifierType.kind === "NamedNodeType") {
    statements.push(
      code`const ${variables.resource} = ${variables.resourceSet}.mutableNamedResource(${this.thisVariable}.${this.identifierProperty.name}, { ${variables.mutateGraph} });`,
    );
  } else {
    statements.push(
      code`const ${variables.resource} = ${variables.resourceSet}.mutableResource(${this.thisVariable}.${this.identifierProperty.name}, { ${variables.mutateGraph} });`,
    );
  }

  if (this.toRdfTypes.length > 0) {
    statements.push(
      code`if (!${variables.ignoreRdfType}) { ${joinCode(
        this.toRdfTypes.map(
          (toRdfType) =>
            code`${variables.resource}.add(${rdfjsTermExpression(rdf.type)}, ${imports.dataFactory}.namedNode("${toRdfType.value}"));`,
        ),
        { on: " " },
      )} }`,
    );
    usedIgnoreRdfTypeVariable = true;
  }

  for (const property of this.properties) {
    statements.push(
      ...property.toRdfStatements({
        variables: {
          ...variables,
          value: code`${this.thisVariable}.${property.name}`,
        },
      }),
    );
  }

  statements.push(code`return ${variables.resource};`);

  if (usedIgnoreRdfTypeVariable) {
    statements.unshift(
      code`const ${variables.ignoreRdfType} = !!options?.ignoreRdfType;`,
    );
  }

  return Maybe.of(code`\
${preamble}${syntheticNamePrefix}toRdf(${joinCode(parameters, { on: "," })}): ${this.toRdfjsResourceType} {
  ${joinCode(statements)}
}`);
}

const variables = {
  ignoreRdfType: code`ignoreRdfType`,
  mutateGraph: code`mutateGraph`,
  resource: code`resource`,
  resourceSet: code`resourceSet`,
};
