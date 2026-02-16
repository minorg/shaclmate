import { imports } from "../imports.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_EqualsResult = conditionalOutput(
  `${syntheticNamePrefix}EqualsResult`,
  code`\
export type ${syntheticNamePrefix}EqualsResult = ${imports.Either}<${syntheticNamePrefix}EqualsResult.Unequal, true>;

export namespace ${syntheticNamePrefix}EqualsResult {
  export const Equal: ${syntheticNamePrefix}EqualsResult = ${imports.Either}.of<Unequal, true>(true);

  export function fromBooleanEqualsResult(
    left: any,
    right: any,
    equalsResult: boolean | ${syntheticNamePrefix}EqualsResult,
  ): ${syntheticNamePrefix}EqualsResult {
    if (typeof equalsResult !== "boolean") {
      return equalsResult;
    }

    if (equalsResult) {
      return Equal;
    }

    return ${imports.Left}({ left, right, type: "BooleanEquals" });
  }

  export type Unequal =
  | {
    readonly left: {
      readonly array: readonly any[];
      readonly element: any;
      readonly elementIndex: number;
    };
    readonly right: {
      readonly array: readonly any[];
      readonly unequals: readonly Unequal[];
    };
    readonly type: "ArrayElement";
  }
  | {
    readonly left: readonly any[];
    readonly right: readonly any[];
    readonly type: "ArrayLength";
  }
  | {
    readonly left: any;
    readonly right: any;
    readonly type: "BooleanEquals";
  }
  | {
    readonly left: any;
    readonly right: any;
    readonly type: "LeftError";
  }
  | {
    readonly right: any;
    readonly type: "LeftNull";
  }
  | {
    readonly left: bigint | boolean | number | string;
    readonly right: bigint | boolean | number | string;
    readonly type: "Primitive";
  }
  | {
    readonly left: any;
    readonly right: any;
    readonly propertyName: string;
    readonly propertyValuesUnequal: Unequal;
    readonly type: "Property";
  }
  | {
    readonly left: any;
    readonly right: any;
    readonly type: "RightError";
  }
  | {
    readonly left: any;
    readonly type: "RightNull";
  };
}`,
);
