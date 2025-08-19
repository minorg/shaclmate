import { xsd } from "@tpluscode/rdf-ns-builders";
import { syntheticNamePrefix } from "./syntheticNamePrefix.js";

export namespace SnippetDeclarations {
  export const arrayEquals = `\
export function ${syntheticNamePrefix}arrayEquals<T>(
  leftArray: readonly T[],
  rightArray: readonly T[],
  elementEquals: (left: T, right: T) => boolean | ${syntheticNamePrefix}EqualsResult,
): ${syntheticNamePrefix}EqualsResult {
  if (leftArray.length !== rightArray.length) {
    return purify.Left({
      left: leftArray,
      right: rightArray,
      type: "ArrayLength",
    });
  }

  for (
    let leftElementIndex = 0;
    leftElementIndex < leftArray.length;
    leftElementIndex++
  ) {
    const leftElement = leftArray[leftElementIndex];

    const rightUnequals: ${syntheticNamePrefix}EqualsResult.Unequal[] = [];
    for (
      let rightElementIndex = 0;
      rightElementIndex < rightArray.length;
      rightElementIndex++
    ) {
      const rightElement = rightArray[rightElementIndex];

      const leftElementEqualsRightElement =
        ${syntheticNamePrefix}EqualsResult.fromBooleanEqualsResult(
          leftElement,
          rightElement,
          elementEquals(leftElement, rightElement),
        );
      if (leftElementEqualsRightElement.isRight()) {
        break; // left element === right element, break out of the right iteration
      }
      rightUnequals.push(
        leftElementEqualsRightElement.extract() as ${syntheticNamePrefix}EqualsResult.Unequal,
      );
    }

    if (rightUnequals.length === rightArray.length) {
      // All right elements were unequal to the left element
      return purify.Left({
        left: {
          array: leftArray,
          element: leftElement,
          elementIndex: leftElementIndex,
        },
        right: {
          array: rightArray,
          unequals: rightUnequals,
        },
        type: "ArrayElement",
      });
    }
    // Else there was a right element equal to the left element, continue to the next left element
  }

  return ${syntheticNamePrefix}EqualsResult.Equal;
}
`;

  export const booleanEquals = `\
/**
 * Compare two objects with equals(other: T): boolean methods and return an ${syntheticNamePrefix}EqualsResult.
 */
export function ${syntheticNamePrefix}booleanEquals<T extends { equals: (other: T) => boolean }>(
  left: T,
  right: T,
): ${syntheticNamePrefix}EqualsResult {
  return ${syntheticNamePrefix}EqualsResult.fromBooleanEqualsResult(
    left,
    right,
    left.equals(right),
  );
}`;

  export const dateEquals = `\
/**
 * Compare two Dates and return an ${syntheticNamePrefix}EqualsResult.
 */
export function ${syntheticNamePrefix}dateEquals(left: Date, right: Date): ${syntheticNamePrefix}EqualsResult {
  return ${syntheticNamePrefix}EqualsResult.fromBooleanEqualsResult(
    left,
    right,
    left.getTime() === right.getTime(),
  );
}`;

  export const EqualsResult = `\
export type ${syntheticNamePrefix}EqualsResult = purify.Either<${syntheticNamePrefix}EqualsResult.Unequal, true>;

export namespace ${syntheticNamePrefix}EqualsResult {
  export const Equal: ${syntheticNamePrefix}EqualsResult = purify.Either.of<Unequal, true>(true);

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

    return purify.Left({ left, right, type: "BooleanEquals" });
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
}    
`;

  export const maybeEquals = `\
export function ${syntheticNamePrefix}maybeEquals<T>(
  leftMaybe: purify.Maybe<T>,
  rightMaybe: purify.Maybe<T>,
  valueEquals: (left: T, right: T) => boolean | ${syntheticNamePrefix}EqualsResult,
): ${syntheticNamePrefix}EqualsResult {
  if (leftMaybe.isJust()) {
    if (rightMaybe.isJust()) {
      return ${syntheticNamePrefix}EqualsResult.fromBooleanEqualsResult(
        leftMaybe,
        rightMaybe,
        valueEquals(leftMaybe.unsafeCoerce(), rightMaybe.unsafeCoerce()),
      );
    }
    return purify.Left({
      left: leftMaybe.unsafeCoerce(),
      type: "RightNull",
    });
  }

  if (rightMaybe.isJust()) {
    return purify.Left({
      right: rightMaybe.unsafeCoerce(),
      type: "LeftNull",
    });
  }

  return ${syntheticNamePrefix}EqualsResult.Equal;
}
`;
  xsd;

  export const RdfVocabularies = (dataFactoryVariable: string) => `\
export namespace ${syntheticNamePrefix}RdfVocabularies {
  export namespace rdf {
    export const first = ${dataFactoryVariable}.namedNode("http://www.w3.org/1999/02/22-rdf-syntax-ns#first");
    export const nil = ${dataFactoryVariable}.namedNode("http://www.w3.org/1999/02/22-rdf-syntax-ns#nil");
    export const rest = ${dataFactoryVariable}.namedNode("http://www.w3.org/1999/02/22-rdf-syntax-ns#rest");
    export const subject = ${dataFactoryVariable}.namedNode("http://www.w3.org/1999/02/22-rdf-syntax-ns#subject");
    export const type = ${dataFactoryVariable}.namedNode("http://www.w3.org/1999/02/22-rdf-syntax-ns#type");
  }

  export namespace rdfs {
    export const subClassOf = ${dataFactoryVariable}.namedNode("http://www.w3.org/2000/01/rdf-schema#subClassOf");
  }

  export namespace xsd {
    export const boolean = ${dataFactoryVariable}.namedNode("http://www.w3.org/2001/XMLSchema#boolean");
    export const date = ${dataFactoryVariable}.namedNode("http://www.w3.org/2001/XMLSchema#date");
    export const dateTime = ${dataFactoryVariable}.namedNode("http://www.w3.org/2001/XMLSchema#dateTime");
    export const integer = ${dataFactoryVariable}.namedNode("http://www.w3.org/2001/XMLSchema#integer");
  }
}`;

  export const strictEquals = `\
/**
 * Compare two values for strict equality (===), returning an ${syntheticNamePrefix}EqualsResult rather than a boolean.
 */
export function ${syntheticNamePrefix}strictEquals<T extends bigint | boolean | number | string>(
  left: T,
  right: T,
): ${syntheticNamePrefix}EqualsResult {
  return ${syntheticNamePrefix}EqualsResult.fromBooleanEqualsResult(left, right, left === right);
}`;

  export const UnwrapL = `type ${syntheticNamePrefix}UnwrapL<T> = T extends purify.Either<infer L, any> ? L : never`;
  export const UnwrapR = `type ${syntheticNamePrefix}UnwrapR<T> = T extends purify.Either<any, infer R> ? R : never`;
}
