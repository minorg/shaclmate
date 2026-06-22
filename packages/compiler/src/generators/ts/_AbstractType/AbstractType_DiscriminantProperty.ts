export interface AbstractType_DiscriminantProperty {
  readonly jsonName: string;
  readonly name: string;
  readonly values: readonly AbstractType_DiscriminantProperty.Value[];
}

export namespace AbstractType_DiscriminantProperty {
  export type Value = number | string;
}
