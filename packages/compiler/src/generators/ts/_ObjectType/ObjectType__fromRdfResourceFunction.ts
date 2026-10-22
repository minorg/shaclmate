import { invariant } from "ts-invariant";
import type { Callable } from "../Callable.js";
import { DeclaredCallable } from "../DeclaredCallable.js";
import { InlineCallable } from "../InlineCallable.js";
import type { ObjectType } from "../ObjectType.js";
import { arrayOf, type Code, code, joinCode } from "../ts-poet-wrapper.js";

function ObjectType__fromRdfResourceFunctionExpression(this: ObjectType): Code {
  const optionsVariable = code`options`;

  const variables = {
    context: code`${optionsVariable}.context`,
    graph: code`${optionsVariable}.graph`,
    ignoreRdfType: code`${optionsVariable}.ignoreRdfType`,
    objectSet: code`${optionsVariable}.objectSet`,
    preferredLanguages: code`${optionsVariable}.preferredLanguages`,
    resource: code`resource`,
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
          variables: {
            focusResource: variables.resource,
            options: optionsVariable,
          },
        })
        .toList(),
    );
  invariant(Object.keys(propertyFromRdfResourceValuesInitializers).length > 0);
  chains.push({
    expression: code`${this.reusables.snippets.sequenceRecord}({ ${joinCode(propertyFromRdfResourceValuesInitializers, { on: ", " })} })`,
    variable: "properties",
  });

  return code`\
(${variables.resource}, ${optionsVariable}) => ${chains
    .reverse()
    .reduce(
      (acc, { expression, variable }) =>
        code`(${expression}).chain(${variable} => ${acc})`,
      code`(${this.createFunction.unannotatedUsage}(properties))`,
    )}`;
}

export function ObjectType__fromRdfResourceFunction(
  this: ObjectType,
): Callable {
  const type = code`${this.reusables.snippets._FromRdfResourceFunction}<${this.expression}>`;
  const unannotatedExpression = () =>
    ObjectType__fromRdfResourceFunctionExpression.call(this);

  return this.name
    .map<Callable>(
      (name) =>
        new DeclaredCallable({
          qualifiedName: [name, "_fromRdfResource"],
          type,
          unannotatedExpression,
        }),
    )
    .orDefault(new InlineCallable(unannotatedExpression, { type }));
}
