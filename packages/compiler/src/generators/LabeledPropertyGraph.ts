export interface LabeledPropertyGraph {
  readonly nodes: readonly LabeledPropertyGraph.Node[];
  readonly relationships: readonly LabeledPropertyGraph.Relationship[];
}

export namespace LabeledPropertyGraph {
  export type Id = string;

  export interface Node {
    readonly id: Id;
    readonly properties: Record<PropertyName, PropertyValue>;
  }

  export type PropertyName = string;

  type PropertyTypeValueMap = {
    boolean: boolean;
    "boolean[]": readonly boolean[];
    double: number;
    "double[]": readonly number[];
    integer: bigint;
    "integer[]": readonly bigint[];
    long: bigint;
    "long[]": readonly bigint[];
    string: string;
    "string[]": readonly string[];
  };

  export type PropertyType = keyof PropertyTypeValueMap;

  export type PropertyValue = {
    [K in PropertyType]: { type: K; value: PropertyTypeValueMap[K] };
  }[PropertyType];

  // export namespace PropertyValue {
  //   export function equals(left: PropertyValue, right: PropertyValue): boolean {
  //     if (left.type !== right.type) {
  //       return false;
  //     }

  //     switch (left.type) {
  //       case "boolean":
  //       case "double":
  //       case "integer":
  //       case "long":
  //       case "string":
  //         return left.value === right.value;
  //       case "boolean[]":
  //       case "double[]":
  //       case "integer[]":
  //       case "long[]":
  //       case "string[]":
  //         if (!Array.isArray(right.value)) {
  //           throw new Error("should never happen");
  //         }
  //         if (left.value.length !== right.value.length) {
  //           return false;
  //         }
  //         return left.value.every(
  //           (element, i) => element === (right.value as any)[i],
  //         );
  //     }
  //   }
  // }

  export interface Relationship {
    readonly id: Id;
    readonly properties: Record<PropertyName, PropertyValue>;
    readonly sourceNodeId: Id;
    readonly targetNodeId: Id;
  }
}
