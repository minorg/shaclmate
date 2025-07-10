export namespace SnippetDeclarations {
  export const arrayEquals = `\
export function $arrayEquals<T>(
  leftArray: readonly T[],
  rightArray: readonly T[],
  elementEquals: (left: T, right: T) => boolean | $EqualsResult,
): $EqualsResult {
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

    const rightUnequals: $EqualsResult.Unequal[] = [];
    for (
      let rightElementIndex = 0;
      rightElementIndex < rightArray.length;
      rightElementIndex++
    ) {
      const rightElement = rightArray[rightElementIndex];

      const leftElementEqualsRightElement =
        $EqualsResult.fromBooleanEqualsResult(
          leftElement,
          rightElement,
          elementEquals(leftElement, rightElement),
        );
      if (leftElementEqualsRightElement.isRight()) {
        break; // left element === right element, break out of the right iteration
      }
      rightUnequals.push(
        leftElementEqualsRightElement.extract() as $EqualsResult.Unequal,
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

  return $EqualsResult.Equal;
}
`;

  export const booleanEquals = `\
/**
 * Compare two objects with equals(other: T): boolean methods and return an $EqualsResult.
 */
export function $booleanEquals<T extends { equals: (other: T) => boolean }>(
  left: T,
  right: T,
): $EqualsResult {
  return $EqualsResult.fromBooleanEqualsResult(
    left,
    right,
    left.equals(right),
  );
}`;

  export const dateEquals = `\
/**
 * Compare two Dates and return an $EqualsResult.
 */
export function $dateEquals(left: Date, right: Date): $EqualsResult {
  return $EqualsResult.fromBooleanEqualsResult(
    left,
    right,
    left.getTime() === right.getTime(),
  );
}`;

  export const EqualsResult = `\
export type $EqualsResult = purify.Either<$EqualsResult.Unequal, true>;

export namespace $EqualsResult {
  export const Equal: $EqualsResult = purify.Either.of<Unequal, true>(true);

  export function fromBooleanEqualsResult(
    left: any,
    right: any,
    equalsResult: boolean | $EqualsResult,
  ): $EqualsResult {
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
export function $maybeEquals<T>(
  leftMaybe: purify.Maybe<T>,
  rightMaybe: purify.Maybe<T>,
  valueEquals: (left: T, right: T) => boolean | $EqualsResult,
): $EqualsResult {
  if (leftMaybe.isJust()) {
    if (rightMaybe.isJust()) {
      return $EqualsResult.fromBooleanEqualsResult(
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

  return $EqualsResult.Equal;
}
`;

  export const ObjectSet = `
export interface $ObjectSet {
  object<ObjectT extends { type: keyof typeof $ObjectTypes }>(
    identifier: rdfjs.NamedNode,
    type: ObjectT["type"],
  ): Promise<purify.Either<Error, ObjectT>>;

  // objectCount(
  //   type: keyof typeof $ObjectTypes,
  // ): Promise<purify.Either<Error, number>>;

  // objectIdentifiers(
  //   type: keyof typeof $ObjectTypes,
  //   options?: { limit?: number; offset?: number },
  // ): Promise<purify.Either<Error, readonly rdfjs.NamedNode[]>>;

  // objects<ObjectT>(
  //   identifiers: readonly rdfjs.NamedNode[],
  //   type: keyof typeof $ObjectTypes,
  // ): Promise<readonly purify.Either<Error, ObjectT>[]>;  
}`;

  export const RdfjsDatasetObjectSet = `
export class $RdfjsDatasetObjectSet implements $ObjectSet {
  readonly resourceSet: rdfjsResource.ResourceSet;

  constructor({
    dataset,
  }: {
    dataset: rdfjs.DatasetCore;
  }) {
    this.resourceSet = new rdfjsResource.ResourceSet({
      dataset,
    });
  }

  async object<ObjectT extends { type: keyof typeof $ObjectTypes }>(
    identifier: rdfjs.NamedNode,
    type: ObjectT["type"],
  ): Promise<purify.Either<Error, ObjectT>> {
    return this.objectSync<ObjectT>(identifier, type);
  }

  objectSync<ObjectT extends { type: keyof typeof $ObjectTypes }>(
    identifier: rdfjs.NamedNode,
    type: ObjectT["type"],
  ): purify.Either<Error, ObjectT> {
    const fromRdf = $ObjectTypes[type].fromRdf;
    const resource = this.resourceSet.resource(identifier);
    return fromRdf({ resource }) as unknown as purify.Either<Error, ObjectT>;
  }

  // async objects<ObjectT extends Object>(
  //   type: ObjectT["type"],
  // ): Promise<Either<Error, readonly ObjectT[]>> {
  //   return this.objectsSync(type);
  // }

  // objectsSync<ObjectT extends Object>(
  //   type: ObjectT["type"],
  // ): Either<Error, readonly ObjectT[]> {
  //   const fromRdf = $ObjectTypes[type].fromRdf;
  //   const objects: ObjectT[] = [];
  //   for (const resource of this.resourceSet.instancesOf(
  //     $ObjectTypes[type].fromRdfType,
  //   )) {
  //     const objectEither = fromRdf({ resource }) as unknown as Either<
  //       Error,
  //       ObjectT
  //     >;
  //     if (objectEither.isLeft()) {
  //       return objectEither;
  //     }
  //     objects.push(objectEither.unsafeCoerce());
  //   }
  //   return Either.of(objects);
  // }

  // async objectCount(type: Object["type"]): Promise<Either<Error, number>> {
  //   return this.objectCountSync(type);
  // }

  // objectCountSync(type: Object["type"]): Either<Error, number> {
  //   const fromRdf = $ObjectTypes[type].fromRdf;
  //   let count = 0;
  //   for (const resource of this.resourceSet.instancesOf(
  //     $ObjectTypes[type].fromRdfType,
  //   )) {
  //     const objectEither = fromRdf({ resource });
  //     if (objectEither.isRight()) {
  //       count++;
  //     }
  //   }
  //   return Either.of(count);
  // }
}
`;

  export const strictEquals = `\
/**
 * Compare two values for strict equality (===), returning an $EqualsResult rather than a boolean.
 */
export function $strictEquals<T extends bigint | boolean | number | string>(
  left: T,
  right: T,
): $EqualsResult {
  return $EqualsResult.fromBooleanEqualsResult(left, right, left === right);
}`;

  export const UnwrapL =
    "type $UnwrapL<T> = T extends purify.Either<infer L, any> ? L : never";
  export const UnwrapR =
    "type $UnwrapR<T> = T extends purify.Either<any, infer R> ? R : never";
}
