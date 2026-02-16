import type { Maybe } from "purify-ts";
import type { TsFeature } from "../../enums/index.js";
import { AbstractType } from "./AbstractType.js";
import type { Code } from "./ts-poet-wrapper.js";

export abstract class AbstractDeclaredType extends AbstractType {
  abstract readonly declaration: Maybe<Code>;
  readonly export: boolean;
  readonly features: ReadonlySet<TsFeature>;
  readonly name: string;

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
    this.name = name;
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
