import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_EqualsResult: SnippetFactory = ({
  imports,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}EqualsResult`,
    code`\
export type ${syntheticNamePrefix}EqualsResult = ${this.imports.Either}<${syntheticNamePrefix}EqualsResult.Unequal, true>;

export namespace ${syntheticNamePrefix}EqualsResult {
  export const Equal: ${syntheticNamePrefix}EqualsResult = ${this.imports.Right}(true);

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

    return ${this.imports.Left}({ left, right, type: "boolean" });
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
    readonly type: "array-element";
  }
  | {
    readonly left: readonly any[];
    readonly right: readonly any[];
    readonly type: "array-length";
  }
  | {
    readonly left: any;
    readonly right: any;
    readonly type: "boolean";
  }
  | {
    readonly right: any;
    readonly type: "left-null";
  }
  | {
    readonly left: any;
    readonly right: any;
    readonly propertyName: string;
    readonly propertyValuesUnequal: Unequal;
    readonly type: "property";
  }
  | {
    readonly left: any;
    readonly type: "right-null";
  };
}`,
  );
