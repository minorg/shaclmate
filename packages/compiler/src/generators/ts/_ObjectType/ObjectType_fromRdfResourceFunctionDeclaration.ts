import { Maybe } from "purify-ts";
import { invariant } from "ts-invariant";
import type { ObjectType } from "../ObjectType.js";
import { arrayOf, type Code, code, joinCode } from "../ts-poet-wrapper.js";

export function ObjectType_fromRdfResourceFunctionDeclaration(
  this: ObjectType,
): Maybe<Code> {
  if (!this.configuration.features.has("Object.fromRdf")) {
    return Maybe.empty();
  }

  const syntheticNamePrefix = this.configuration.syntheticNamePrefix;

  const optionsVariable = `_${syntheticNamePrefix}options`;

  const variables = {
    context: code`${optionsVariable}.context`,
    graph: code`${optionsVariable}.graph`,
    ignoreRdfType: code`${optionsVariable}.ignoreRdfType`,
    objectSet: code`${optionsVariable}.objectSet`,
    preferredLanguages: code`${optionsVariable}.preferredLanguages`,
    resource: code`${syntheticNamePrefix}resource`,
  };

  const propertyFromRdfResourceValuesVariables = {
    context: variables.context,
    focusResource: variables.resource,
    graph: variables.graph,
    objectSet: variables.objectSet,
    preferredLanguages: variables.preferredLanguages,
  };

  const chains: { expression: Code; variable: string }[] = [];

  this.fromRdfTypeVariable.ifJust((fromRdfTypeVariable) => {
    chains.push({
      expression: code`!${variables.ignoreRdfType} ? ${this.reusables.snippets.ensureRdfResourceType}(${variables.resource}, ${arrayOf(fromRdfTypeVariable)}, ${{ graph: variables.graph }}) : ${this.reusables.imports.Right}(true as const)`,
      variable: `_rdfTypeCheck`,
    });
  });

  const propertyFromRdfResourceValuesInitializers: Code[] =
    this.properties.flatMap((property) =>
      property
        .fromRdfResourceValuesInitializer({
          variables: propertyFromRdfResourceValuesVariables,
        })
        .toList(),
    );
  invariant(Object.keys(propertyFromRdfResourceValuesInitializers).length > 0);
  chains.push({
    expression: code`${this.reusables.snippets.sequenceRecord}({ ${joinCode(propertyFromRdfResourceValuesInitializers, { on: ", " })} })`,
    variable: "properties",
  });

  return Maybe.of(code`\
export const _fromRdfResource: ${this.reusables.snippets._FromRdfResourceFunction}<${this.expression}> = (${variables.resource}, ${optionsVariable}) => {
  return ${chains
    .reverse()
    .reduce(
      (acc, { expression, variable }) =>
        code`(${expression}).chain(${variable} => ${acc})`,
      code`(create(properties))`,
    )};
}

export const fromRdfResource = ${this.reusables.snippets.wrap_FromRdfResourceFunction}(_fromRdfResource);`);
}
