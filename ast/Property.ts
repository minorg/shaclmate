import { Maybe } from "purify-ts";
import { Type, Name } from ".";

export interface Property {
  readonly name: Name;
  readonly maxCount: Maybe<number>;
  readonly minCount: Maybe<number>;
  readonly type: Type;
}
