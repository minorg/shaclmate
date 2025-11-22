import { Memoize } from "typescript-memoize";
import type { DeclaredType } from "../DeclaredType.js";
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

  get _discriminatorProperty() {
    return this.delegate._discriminatorProperty;
  }

  @Memoize()
  get discriminatorPropertyValues(): readonly string[] {
    // A member type's combined discriminator property values are its "own" values plus any descendant values that are
    // not the "own" values of some other member type.
    // So if you have type A, type B, and B inherits A, then
    // A has
    //   own discriminator property values: ["A"]
    //   descendant discriminator property values: ["B"]
    // and B has
    //  own discriminator property values: ["B"]
    //  descendant discriminator property values ["B"]
    // In this case A shouldn't have "B" as a combined discriminator property value since it's "claimed" by B.
    const memberOwnDiscriminatorPropertyValues = new Set<string>();
    for (const memberType of this.universe) {
      for (const ownDiscriminatorPropertyValue of memberType.discriminatorProperty.unsafeCoerce()
        .ownValues) {
        memberOwnDiscriminatorPropertyValues.add(ownDiscriminatorPropertyValue);
      }
    }

    return this.delegate._discriminatorProperty.ownValues.concat(
      this.delegate._discriminatorProperty.descendantValues.filter(
        (value) => !memberOwnDiscriminatorPropertyValues.has(value),
      ),
    );
  }

  get features() {
    return this.delegate.features;
  }

  get fromRdfType() {
    return this.delegate.fromRdfType;
  }

  get fromRdfTypeVariable() {
    return this.delegate.fromRdfTypeVariable;
  }

  get graphqlName() {
    return this.delegate.graphqlName;
  }

  get identifierTypeAlias() {
    return this.delegate.identifierTypeAlias;
  }

  get jsonName() {
    return this.delegate.jsonName;
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

  jsonZodSchema(parameters: Parameters<DeclaredType["jsonZodSchema"]>[0]) {
    return this.delegate.jsonZodSchema(parameters);
  }

  newExpression(
    parameters: Parameters<ObjectType["newExpression"]>[0],
  ): string {
    return this.delegate.newExpression(parameters);
  }

  snippetDeclarations(
    parameters: Parameters<DeclaredType["snippetDeclarations"]>[0],
  ): readonly string[] {
    return this.delegate.snippetDeclarations(parameters);
  }

  toObjectType(): ObjectType {
    return this.delegate;
  }

  useImports() {
    return this.delegate.useImports();
  }
}
