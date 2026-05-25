import { Maybe } from "purify-ts";
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

  const propertyFromRdfResourceValuesExpressionVariable = {
    context: variables.context,
    graph: variables.graph,
    objectSet: variables.objectSet,
    preferredLanguages: variables.preferredLanguages,
    resource: variables.resource,
  };

  const chains: { expression: Code; variable: string }[] = [];
  const partials: string[] = [];

  this.parentObjectTypes.forEach((parentObjectType, parentObjectTypeI) => {
    chains.push({
      expression: code`${parentObjectType.name}._fromRdfResource(${variables.resource}, { ...${optionsVariable}, ignoreRdfType: true })`,
      variable: `super${parentObjectTypeI}`,
    });
    partials.push(`super${parentObjectTypeI}`);
  });

  this.fromRdfTypeVariable.ifJust((fromRdfTypeVariable) => {
    chains.push({
      expression: code`!${variables.ignoreRdfType} ? ${this.reusables.snippets.ensureRdfResourceType}(${variables.resource}, ${arrayOf(fromRdfTypeVariable, ...this.descendantFromRdfTypeVariables)}, ${{ graph: variables.graph }}) : ${this.reusables.imports.Right}(true as const)`,
      variable: `_rdfTypeCheck`,
    });
  });

  const propertyFromRdfResourceValuesInitializers: Code[] =
    this.properties.flatMap((property) =>
      property
        .fromRdfResourceValuesInitializer({
          variables: propertyFromRdfResourceValuesExpressionVariable,
        })
        .toList(),
    );
  if (Object.keys(propertyFromRdfResourceValuesInitializers).length > 0) {
    chains.push({
      expression: code`${this.reusables.snippets.sequenceRecord}({ ${joinCode(propertyFromRdfResourceValuesInitializers, { on: ", " })} })`,
      variable: "properties",
    });
    partials.push("properties");
  }

  let partialsJoined: Code;
  switch (partials.length) {
    case 0:
      partialsJoined = code`{}`;
      break;
    case 1:
      partialsJoined = code`${partials[0]}`;
      break;
    default:
      partialsJoined = code`{ ${partials.map((partial) => `...${partial}`).join(", ")} }`;
      break;
  }

  let returnExpression: Code;
  const resultExpression = code`create(${partialsJoined})`;
  if (chains.length === 0) {
    returnExpression = code`${this.reusables.imports.Right}(${resultExpression})`;
  } else {
    returnExpression = code`${chains
      .reverse()
      .reduce(
        (acc, { expression, variable }) =>
          code`(${expression}).chain(${variable} => ${acc})`,
        code`(${resultExpression})`,
      )}`;
  }

  return Maybe.of(code`\
export const _fromRdfResource: ${this.reusables.snippets._FromRdfResourceFunction}<${this.name}> = (${variables.resource}, ${optionsVariable}) => {
  return ${returnExpression};
}

export const fromRdfResource = ${this.reusables.snippets.wrap_FromRdfResourceFunction}(_fromRdfResource);`);
}
