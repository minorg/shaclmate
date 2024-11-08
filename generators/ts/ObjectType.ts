import type { NamedNode } from "@rdfjs/types";
import { Maybe } from "purify-ts";
import { Memoize } from "typescript-memoize";
import { MintingStrategy } from "../../ast";
import type { IdentifierType } from "./IdentifierType.js";
import type { RdfjsTermType } from "./RdfjsTermType";
import { Type } from "./Type.js";
import * as _ObjectType from "./_ObjectType";

export class ObjectType extends Type {
  readonly astName: string;
  readonly classQualifiedName: string;
  readonly identifierType: IdentifierType;
  interfaceDeclaration = _ObjectType.interfaceDeclaration;
  readonly interfaceQualifiedName: string;
  readonly kind = "Object";
  readonly mintingStrategy: Maybe<MintingStrategy>;
  moduleDeclaration = _ObjectType.moduleDeclaration;
  readonly moduleQualifiedName: string;
  readonly rdfType: Maybe<NamedNode>;
  readonly sparqlGraphPatternsClassQualifiedName: string;
  protected readonly classUnqualifiedName: string = "Class";
  protected readonly interfaceUnqualifiedName: string;
  protected readonly sparqlGraphPatternsClassUnqualifiedName: string =
    "SparqlGraphPatterns";
  private readonly lazyAncestorObjectTypes: () => readonly ObjectType[];
  private readonly lazyDescendantObjectTypes: () => readonly ObjectType[];
  private readonly lazyParentObjectTypes: () => readonly ObjectType[];
  private readonly lazyProperties: () => readonly ObjectType.Property[];

  constructor({
    astName,
    identifierType,
    lazyAncestorObjectTypes,
    lazyDescendantObjectTypes,
    lazyParentObjectTypes,
    lazyProperties,
    mintingStrategy,
    rdfType,
    ...superParameters
  }: {
    astName: string;
    identifierType: IdentifierType;
    lazyAncestorObjectTypes: () => readonly ObjectType[];
    lazyDescendantObjectTypes: () => readonly ObjectType[];
    lazyParentObjectTypes: () => readonly ObjectType[];
    lazyProperties: () => readonly ObjectType.Property[];
    mintingStrategy: Maybe<MintingStrategy>;
    rdfType: Maybe<NamedNode>;
  } & ConstructorParameters<typeof Type>[0]) {
    super(superParameters);
    // Lazily initialize some members in getters to avoid recursive construction
    this.lazyAncestorObjectTypes = lazyAncestorObjectTypes;
    this.lazyDescendantObjectTypes = lazyDescendantObjectTypes;
    this.lazyParentObjectTypes = lazyParentObjectTypes;
    this.lazyProperties = lazyProperties;
    this.identifierType = identifierType;
    this.mintingStrategy = mintingStrategy;
    this.rdfType = rdfType;

    this.astName = astName;
    this.interfaceUnqualifiedName = astName;
    this.moduleQualifiedName = astName;
    this.classQualifiedName = `${this.moduleQualifiedName}.${this.classUnqualifiedName}`;
    this.interfaceQualifiedName = this.interfaceUnqualifiedName;
    this.sparqlGraphPatternsClassQualifiedName = `${astName}.${this.sparqlGraphPatternsClassUnqualifiedName}`;
  }

  @Memoize()
  get ancestorObjectTypes(): readonly ObjectType[] {
    return this.lazyAncestorObjectTypes();
  }

  @Memoize()
  get descendantObjectTypes(): readonly ObjectType[] {
    return this.lazyDescendantObjectTypes();
  }

  override get discriminatorProperty(): Maybe<Type.DiscriminatorProperty> {
    return Maybe.of({
      name: this.configuration.objectTypeDiscriminatorPropertyName,
      type: "string" as const,
      values: [this.name],
    });
  }

  override get name(): string {
    return this.interfaceQualifiedName;
  }

  @Memoize()
  get parentObjectTypes(): readonly ObjectType[] {
    return this.lazyParentObjectTypes();
  }

  @Memoize()
  get properties(): readonly ObjectType.Property[] {
    const properties = this.lazyProperties()
      .concat()
      .sort((left, right) => left.name.localeCompare(right.name));
    const propertyNames = new Set<string>();
    for (const property of properties) {
      if (propertyNames.has(property.name)) {
        throw new Error(`duplicate property '${property.name}'`);
      }
    }
    return properties;
  }

  override equalsFunction(): string {
    return `${this.moduleQualifiedName}.equals`;
  }

  override fromRdfExpression({
    resourceValueVariable,
  }: Parameters<Type["fromRdfExpression"]>[0]): string {
    return `${resourceValueVariable}.to${this.rdfjsResourceType().named ? "Named" : ""}Resource().chain(resource => ${this.moduleQualifiedName}.fromRdf(resource))`;
  }

  override hashStatements({
    hasherVariable,
    valueVariable,
  }: Parameters<RdfjsTermType["hashStatements"]>[0]): readonly string[] {
    return [
      `${this.moduleQualifiedName}.hash(${valueVariable}, ${hasherVariable});`,
    ];
  }

  override importStatements(): readonly string[] {
    const importStatements = this.properties.flatMap((property) =>
      property.importStatements(),
    );
    this.mintingStrategy.ifJust((mintingStrategy) => {
      switch (mintingStrategy) {
        case MintingStrategy.SHA256:
          importStatements.push('import { sha256 } from "js-sha256";');
          break;
        case MintingStrategy.UUIDv4:
          importStatements.push('import * as uuid from "uuid";');
          break;
      }
    });
    return importStatements;
  }

  rdfjsResourceType(options?: { mutable?: boolean }): {
    readonly mutable: boolean;
    readonly name: string;
    readonly named: boolean;
  } {
    if (this.parentObjectTypes.length > 0) {
      return this.parentObjectTypes[0].rdfjsResourceType(options);
    }

    return {
      mutable: !!options?.mutable,
      name: `rdfjsResource.${options?.mutable ? "Mutable" : ""}Resource${this.identifierType.isNamedNodeKind ? "<rdfjs.NamedNode>" : ""}`,
      named: this.identifierType.isNamedNodeKind,
    };
  }

  override sparqlGraphPatternExpression({
    subjectVariable,
  }: Parameters<
    Type["sparqlGraphPatternExpression"]
  >[0]): Maybe<Type.SparqlGraphPatternExpression> {
    return Maybe.of({
      type: "GraphPatterns",
      value: `new ${this.moduleQualifiedName}.SparqlGraphPatterns(${subjectVariable})`,
    });
  }

  override toRdfExpression({
    mutateGraphVariable,
    resourceSetVariable,
    valueVariable,
  }: Parameters<Type["toRdfExpression"]>[0]): string {
    return `${this.moduleQualifiedName}.toRdf(${valueVariable}, { mutateGraph: ${mutateGraphVariable}, resourceSet: ${resourceSetVariable} }).identifier`;
  }

  protected ensureAtMostOneSuperObjectType() {
    if (this.parentObjectTypes.length > 1) {
      throw new RangeError(
        `object type '${this.astName}' has multiple super object types`,
      );
    }
  }
}

export namespace ObjectType {
  export const IdentifierProperty = _ObjectType.IdentifierProperty;
  export type IdentifierProperty = _ObjectType.IdentifierProperty;
  export const Property = _ObjectType.Property;
  export type Property = _ObjectType.Property;
  export const ShaclProperty = _ObjectType.ShaclProperty;
  export type ShaclProperty = _ObjectType.ShaclProperty;
  export const TypeDiscriminatorProperty =
    _ObjectType.TypeDiscriminatorProperty;
  export type TypeDiscriminatorProperty = _ObjectType.TypeDiscriminatorProperty;
}
