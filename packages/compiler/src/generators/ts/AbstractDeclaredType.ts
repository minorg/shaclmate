import { type Code, code, def } from "ts-poet";
import type { TsFeature } from "../../enums/index.js";
import { AbstractType } from "./AbstractType.js";

export abstract class AbstractDeclaredType extends AbstractType {
  abstract readonly declaration: Code;
  readonly export: boolean;
  readonly features: ReadonlySet<TsFeature>;
  readonly name: Code;

  constructor({
    export_,
    features,
    name,
    ...superParameters
  }: {
    export_: boolean;
    features: ReadonlySet<TsFeature>;
    name: string;
  } & ConstructorParameters<typeof AbstractType>[0]) {
    super(superParameters);
    this.export = export_;
    this.features = features;
    this.name = code`${def(name)}`;
  }
}

export namespace AbstractDeclaredType {
  export type Conversion = AbstractType.Conversion;
  export type DiscriminantProperty = AbstractType.DiscriminantProperty;
  export const GraphqlType = AbstractType.GraphqlType;
  export type GraphqlType = AbstractType.GraphqlType;
  export const JsonType = AbstractType.JsonType;
  export type JsonType = AbstractType.JsonType;
}
