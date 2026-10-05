import { AbstractConstruct } from "./AbstractConstruct.js";

export class Operation extends AbstractConstruct {
  /**
   * Name of this operation.
   */
  readonly name: string;

  constructor({
    name,
    ...superParameters
  }: {
    name: string;
  } & ConstructorParameters<typeof AbstractConstruct>[0]) {
    super(superParameters);
    this.name = name;
  }
}
