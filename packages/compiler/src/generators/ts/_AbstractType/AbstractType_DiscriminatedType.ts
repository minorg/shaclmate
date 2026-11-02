import type { Code } from "../ts-poet-wrapper.js";

export interface AbstractType_DiscriminatedType {
  readonly discriminantProperty: {
    readonly name: string;
    readonly values: readonly (number | string)[];
  };
  readonly expression: Code;
}
