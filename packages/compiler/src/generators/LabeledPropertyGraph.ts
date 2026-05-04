export interface LabeledPropertyGraph {
  readonly nodes: readonly LabeledPropertyGraph.Node[];
  readonly propertySchemas: readonly LabeledPropertyGraph.PropertySchema[];
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

  export interface PropertySchema<
    PropertyTypeT extends PropertyType = PropertyType,
  > {
    readonly default?: PropertyTypeValueMap[PropertyTypeT];
    readonly name: PropertyName;
    readonly type: PropertyTypeT;
  }

  export interface Relationship {
    readonly id: Id;
    readonly properties: Record<PropertyName, PropertyValue>;
    readonly sourceNodeId: Id;
    readonly targetNodeId: Id;
  }
}
