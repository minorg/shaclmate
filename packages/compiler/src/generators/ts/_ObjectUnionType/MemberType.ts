import { Memoize } from "typescript-memoize";
import type { AbstractDeclaredType } from "../AbstractDeclaredType.js";
import type { ObjectType } from "../ObjectType.js";

export class MemberType {
  private readonly delegate: ObjectType;
  private readonly universe: readonly ObjectType[];

  constructor({
    delegate,
    universe,
  }: { delegate: ObjectType; universe: readonly ObjectType[] }) {
    this.delegate = delegate;
    this.universe = universe;
  }

  get ancestorObjectTypes() {
    return this.delegate.ancestorObjectTypes;
  }

  get declarationType() {
    return this.delegate.declarationType;
  }

  get descendantFromRdfTypeVariables() {
    return this.delegate.descendantFromRdfTypeVariables;
  }

  get _discriminantProperty() {
    return this.delegate._discriminantProperty;
  }

  @Memoize()
  get discriminantPropertyValues(): readonly string[] {
    // A member type's combined discriminant property values are its "own" values plus any descendant values that are
    // not the "own" values of some other member type.
    // So if you have type A, type B, and B inherits A, then
    // A has
    //   own discriminant property values: ["A"]
    //   descendant discriminant property values: ["B"]
    // and B has
    //  own discriminant property values: ["B"]
    //  descendant discriminant property values ["B"]
    // In this case A shouldn't have "B" as a combined discriminant property value since it's "claimed" by B.
    const memberOwnDiscriminantPropertyValues = new Set<string>();
    for (const memberType of this.universe) {
      for (const ownDiscriminantPropertyValue of memberType.discriminantProperty.unsafeCoerce()
        .ownValues) {
        memberOwnDiscriminantPropertyValues.add(ownDiscriminantPropertyValue);
      }
    }

    return this.delegate._discriminantProperty.ownValues.concat(
      this.delegate._discriminantProperty.descendantValues.filter(
        (value) => !memberOwnDiscriminantPropertyValues.has(value),
      ),
    );
  }

  get features() {
    return this.delegate.features;
  }

  get filterFunction() {
    return this.delegate.filterFunction;
  }

  get filterType() {
    return this.delegate.filterType;
  }

  get fromRdfType() {
    return this.delegate.fromRdfType;
  }

  get fromRdfTypeVariable() {
    return this.delegate.fromRdfTypeVariable;
  }

  get graphqlType() {
    return this.delegate.graphqlType;
  }

  get identifierTypeAlias() {
    return this.delegate.identifierTypeAlias;
  }

  get ownProperties() {
    return this.delegate.ownProperties;
  }

  get mutable() {
    return this.delegate.mutable;
  }

  get properties() {
    return this.delegate.properties;
  }

  get name() {
    return this.delegate.name;
  }

  get rootAncestorObjectType() {
    return this.delegate.rootAncestorObjectType;
  }

  get staticModuleName() {
    return this.delegate.staticModuleName;
  }

  get toRdfjsResourceType() {
    return this.delegate.toRdfjsResourceType;
  }

  jsonType() {
    return this.delegate.jsonType();
  }

  jsonZodSchema(
    parameters: Parameters<AbstractDeclaredType["jsonZodSchema"]>[0],
  ) {
    return this.delegate.jsonZodSchema(parameters);
  }

  newExpression(parameters: Parameters<ObjectType["newExpression"]>[0]) {
    return this.delegate.newExpression(parameters);
  }

  snippetDeclarations(
    parameters: Parameters<AbstractDeclaredType["snippetDeclarations"]>[0],
  ) {
    return this.delegate.snippetDeclarations(parameters);
  }

  toObjectType(): ObjectType {
    return this.delegate;
  }

  useImports() {
    return this.delegate.useImports();
  }
}
