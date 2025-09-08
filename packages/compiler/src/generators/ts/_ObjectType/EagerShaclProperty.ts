import { Maybe } from "purify-ts";
import type {} from "ts-morph";

import { Memoize } from "typescript-memoize";
import type { Type } from "../Type.js";
import { ShaclProperty } from "./ShaclProperty.js";

export class EagerShaclProperty<
  TypeT extends Type,
> extends ShaclProperty<TypeT> {
  override readonly mutable: boolean;
  override readonly recursive: boolean;

  constructor({
    mutable,
    recursive,
    ...superParameters
  }: {
    mutable: boolean;
    recursive: boolean;
  } & ConstructorParameters<typeof ShaclProperty<TypeT>>[0]) {
    super(superParameters);
    this.mutable = mutable;
    this.recursive = recursive;
  }

  @Memoize()
  override get graphqlField(): ShaclProperty<TypeT>["graphqlField"] {
    return Maybe.of({
      description: this.comment.map(JSON.stringify).extract(),
      name: this.name,
      resolve: `(source) => ${this.type.graphqlResolveExpression({ variables: { value: `source.${this.name}` } })}`,
      type: this.type.graphqlName,
    });
  }

  override constructorStatements({
    variables,
  }: Parameters<
    ShaclProperty<TypeT>["constructorStatements"]
  >[0]): readonly string[] {
    const typeConversions = this.type.conversions;
    if (typeConversions.length === 1) {
      switch (this.objectType.declarationType) {
        case "class":
          return [`this.${this.name} = ${variables.parameter};`];
        case "interface":
          return [`const ${this.name} = ${variables.parameter};`];
      }
    }

    let lhs: string;
    const statements: string[] = [];
    switch (this.objectType.declarationType) {
      case "class":
        lhs = `this.${this.name}`;
        break;
      case "interface":
        lhs = this.name;
        statements.push(`let ${this.name}: ${this.type.name};`);
        break;
    }

    statements.push(
      typeConversions
        .map(
          (conversion) =>
            `if (${conversion.sourceTypeCheckExpression(variables.parameter)}) { ${lhs} = ${conversion.conversionExpression(variables.parameter)}; }`,
        )
        // We shouldn't need this else, since the parameter now has the never type, but have to add it to appease the TypeScript compiler
        .concat(`{ ${lhs} = (${variables.parameter}) satisfies never; }`)
        .join(" else "),
    );

    return statements;
  }
}
