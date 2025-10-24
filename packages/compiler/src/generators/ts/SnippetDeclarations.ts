import { syntheticNamePrefix } from "./syntheticNamePrefix.js";

export namespace SnippetDeclarations {
  export const arrayEquals = `\
/**
 * Compare two arrays element-wise with the provided elementEquals function.
 */  
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

  export const arrayIntersection = `\
export function ${syntheticNamePrefix}arrayIntersection<T>(left: readonly T[], right: readonly T[]): readonly T[] {
  if (left.length === 0) {
    return right;
  }
  if (right.length === 0) {
    return left;
  }

  const intersection = new Set<T>();
  if (left.length <= right.length) {
    const rightSet = new Set(right);
    for (const leftElement of left) {
      if (rightSet.has(leftElement)) {
        intersection.add(leftElement);
      }
    }
  } else {
    const leftSet = new Set(left);
    for (const rightElement of right) {
      if (leftSet.has(rightElement)) {
        intersection.add(rightElement);
      }  
    }
  }
  return [...intersection];
}`;

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
}`;

  export const isBooleanArray = `\
function ${syntheticNamePrefix}isBooleanArray(x: unknown): x is readonly boolean[] {
  return Array.isArray(x) && x.every(z => typeof z === "boolean");
}`;

  export const isNumberArray = `\
function ${syntheticNamePrefix}isNumberArray(x: unknown): x is readonly number[] {
  return Array.isArray(x) && x.every(z => typeof z === "number");
}`;

  export const isObjectArray = `\
function ${syntheticNamePrefix}isObjectArray(x: unknown): x is readonly object[] {
  return Array.isArray(x) && x.every(z => typeof z === "object");
}`;

  export const isStringArray = `\
function ${syntheticNamePrefix}isStringArray(x: unknown): x is readonly string[] {
  return Array.isArray(x) && x.every(z => typeof z === "string");
}`;

  export const LazyObjectSet = `\
/**
 * Type of lazy properties that return a set of objects. This is a class instead of an interface so it can be instanceof'd elsewhere.
 */
export class ${syntheticNamePrefix}LazyObjectSet<ObjectIdentifierT extends rdfjs.BlankNode | rdfjs.NamedNode, ResolvedObjectT extends { ${syntheticNamePrefix}identifier: ObjectIdentifierT }, StubObjectT extends { ${syntheticNamePrefix}identifier: ObjectIdentifierT }> {
  private readonly resolver: (identifiers: readonly ObjectIdentifierT[]) => Promise<purify.Either<Error, readonly ResolvedObjectT[]>>;
  readonly stubs: readonly StubObjectT[];

  constructor({ resolver, stubs }: {
    resolver: (identifiers: readonly ObjectIdentifierT[]) => Promise<purify.Either<Error, readonly ResolvedObjectT[]>>,
    stubs: readonly StubObjectT[]
  }) {
    this.resolver = resolver;
    this.stubs = stubs;
  }

  async resolve(options?: { limit?: number; offset?: number }): Promise<purify.Either<Error, readonly ResolvedObjectT[]>> {
    if (this.stubs.length === 0) {
      return purify.Either.of([]);
    }

    const limit = options?.limit ?? Number.MAX_SAFE_INTEGER;
    if (limit <= 0) {
      return purify.Either.of([]);
    }

    let offset = options?.offset ?? 0;
    if (offset < 0) {
      offset = 0;
    }

    return await this.resolver(this.stubs.slice(offset, offset + limit).map(stub => stub.${syntheticNamePrefix}identifier));
  }
}`;

  export const LazyOptionalObject = `\
/**
 * Type of lazy properties that return a single optional object. This is a class instead of an interface so it can be instanceof'd elsewhere.
 */
export class ${syntheticNamePrefix}LazyOptionalObject<ObjectIdentifierT extends rdfjs.BlankNode | rdfjs.NamedNode, ResolvedObjectT extends { ${syntheticNamePrefix}identifier: ObjectIdentifierT }, StubObjectT extends { ${syntheticNamePrefix}identifier: ObjectIdentifierT }> {
  private readonly resolver: (identifier: ObjectIdentifierT) => Promise<purify.Either<Error, ResolvedObjectT>>;
  readonly stub: purify.Maybe<StubObjectT>;

  constructor({ resolver, stub }: {
    resolver: (identifier: ObjectIdentifierT) => Promise<purify.Either<Error, ResolvedObjectT>>,
    stub: purify.Maybe<StubObjectT>
  }) {
    this.resolver = resolver;
    this.stub = stub;
  }

  async resolve(): Promise<purify.Either<Error, purify.Maybe<ResolvedObjectT>>> {
    if (this.stub.isNothing()) {
      return purify.Either.of(purify.Maybe.empty());
    }
    return (await this.resolver(this.stub.unsafeCoerce().${syntheticNamePrefix}identifier)).map(purify.Maybe.of);
  }
}`;

  export const LazyRequiredObject = `\
/**
 * Type of lazy properties that return a single required object. This is a class instead of an interface so it can be instanceof'd elsewhere.
 */
export class ${syntheticNamePrefix}LazyRequiredObject<ObjectIdentifierT extends rdfjs.BlankNode | rdfjs.NamedNode, ResolvedObjectT extends { ${syntheticNamePrefix}identifier: ObjectIdentifierT }, StubObjectT extends { ${syntheticNamePrefix}identifier: ObjectIdentifierT }> {
  private readonly resolver: (identifier: ObjectIdentifierT) => Promise<purify.Either<Error, ResolvedObjectT>>;
  readonly stub: StubObjectT;

  constructor({ resolver, stub }: {
    resolver: (identifier: ObjectIdentifierT) => Promise<purify.Either<Error, ResolvedObjectT>>,
    stub: StubObjectT
  }) {
    this.resolver = resolver;
    this.stub = stub;
  }

  resolve(): Promise<purify.Either<Error, ResolvedObjectT>> {
    return this.resolver(this.stub.${syntheticNamePrefix}identifier);
  }
}`;

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
}`;

  export const RdfVocabularies = `\
export namespace ${syntheticNamePrefix}RdfVocabularies {
  export namespace rdf {
    export const first = dataFactory.namedNode("http://www.w3.org/1999/02/22-rdf-syntax-ns#first");
    export const nil = dataFactory.namedNode("http://www.w3.org/1999/02/22-rdf-syntax-ns#nil");
    export const rest = dataFactory.namedNode("http://www.w3.org/1999/02/22-rdf-syntax-ns#rest");
    export const subject = dataFactory.namedNode("http://www.w3.org/1999/02/22-rdf-syntax-ns#subject");
    export const type = dataFactory.namedNode("http://www.w3.org/1999/02/22-rdf-syntax-ns#type");
  }

  export namespace rdfs {
    export const subClassOf = dataFactory.namedNode("http://www.w3.org/2000/01/rdf-schema#subClassOf");
  }

  export namespace xsd {
    export const boolean = dataFactory.namedNode("http://www.w3.org/2001/XMLSchema#boolean");
    export const date = dataFactory.namedNode("http://www.w3.org/2001/XMLSchema#date");
    export const dateTime = dataFactory.namedNode("http://www.w3.org/2001/XMLSchema#dateTime");
    export const integer = dataFactory.namedNode("http://www.w3.org/2001/XMLSchema#integer");
  }
}`;

  export const sparqlInstancesOfPattern = `\
/**
 * A sparqljs.Pattern that's the equivalent of ?subject rdf:type/rdfs:subClassOf* ?rdfType .
 */
export function ${syntheticNamePrefix}sparqlInstancesOfPattern({ rdfType, subject }: { rdfType: rdfjs.NamedNode | rdfjs.Variable, subject: sparqljs.Triple["subject"] }): sparqljs.Pattern {
  return {
    triples: [
      {
        subject,
        predicate: {
          items: [
            $RdfVocabularies.rdf.type,
            {
              items: [$RdfVocabularies.rdfs.subClassOf],
              pathType: "*",
              type: "path",
            },
          ],
          pathType: "/",
          type: "path",
        },
        object: rdfType,
      },
    ],
    type: "bgp",
  };
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
