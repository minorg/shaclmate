import { AbstractConstruct } from "./AbstractConstruct.js";
import type { Operation } from "./Operation.js";

export class Service extends AbstractConstruct {
  /**
   * Name of this service.
   */
  readonly name: string;

  /**
   * Operations associated with this service.
   */
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
    this.operations = operations;
  }
}
