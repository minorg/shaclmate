import { Memoize } from "typescript-memoize";
import { AbstractConstruct } from "./AbstractConstruct.js";
import type { Operation } from "./Operation.js";

export class Service extends AbstractConstruct {
  readonly name: string;
  readonly operations: readonly Operation[];

  constructor({
    name,
    operations,
    ...superParameters
  }: {
    name: string;
    operations: readonly Operation[];
  } & ConstructorParameters<typeof AbstractConstruct>[0]) {
    super(superParameters);
    this.name = name;
    this.operations = [];
  }

  @Memoize()
  get interfaceDeclaration(): Code {}
}
