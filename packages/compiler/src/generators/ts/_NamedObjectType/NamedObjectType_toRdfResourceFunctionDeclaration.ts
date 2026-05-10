import { rdf } from "@tpluscode/rdf-ns-builders";
import { Maybe } from "purify-ts";
import { imports } from "../imports.js";
import type { NamedObjectType } from "../NamedObjectType.js";
import { rdfjsTermExpression } from "../rdfjsTermExpression.js";
import { snippets } from "../snippets.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { type Code, code, joinCode } from "../ts-poet-wrapper.js";

export function NamedObjectType_toRdfResourceFunctionDeclaration(
  this: NamedObjectType,
): Maybe<Code> {
  if (!this.features.has("rdf")) {
    return Maybe.empty();
  }

  const statements: Code[] = [
    code`const ${variables.resourceSet} = options?.${variables.resourceSet} ?? new ${imports.ResourceSet}({ dataFactory: ${imports.dataFactory}, dataset: ${imports.datasetFactory}.dataset() });`,
  ];

  if (this.parentObjectTypes.length > 0) {
    statements.push(
      code`const ${variables.resource} = ${this.parentObjectTypes[0].staticModuleName}.${syntheticNamePrefix}toRdfResource(${this.thisVariable}, { ${variables.ignoreRdfType}: true, ${variables.graph}: options?.${variables.graph}, ${variables.resourceSet} });`,
    );
  } else {
    statements.push(
      code`const ${variables.resource} = ${variables.resourceSet}.resource(${this.thisVariable}.${syntheticNamePrefix}identifier());`,
    );
  }

  if (this.toRdfTypes.length > 0) {
    statements.push(
      code`if (!options?.${variables.ignoreRdfType}) { ${joinCode(
        this.toRdfTypes.map(
          (toRdfType) =>
            code`${variables.resource}.add(${rdfjsTermExpression(rdf.type, { logger: this.logger })}, ${imports.dataFactory}.namedNode("${toRdfType.value}"), options?.${variables.graph});`,
        ),
        { on: " " },
      )} }`,
    );
  }

  for (const property of this.properties) {
    statements.push(
      ...property.toRdfRdfResourceValuesStatements({
        variables: {
          graph: code`options?.${variables.graph}`,
          resource: variables.resource,
          resourceSet: variables.resourceSet,
          value: property.accessExpression({
            variables: { object: this.thisVariable },
          }),
        },
      }),
    );
  }

  statements.push(code`return ${variables.resource};`);

  return Maybe.of(code`\
export function ${syntheticNamePrefix}toRdfResource(${this.thisVariable}: ${this.name}, options?: Parameters<${snippets.ToRdfResourceFunction}<${this.name}>>[1]): ${this.toRdfjsResourceType} {
  ${joinCode(statements)}
}`);
}

const variables = {
  ignoreRdfType: code`ignoreRdfType`,
  graph: code`graph`,
  resource: code`resource`,
  resourceSet: code`resourceSet`,
};
