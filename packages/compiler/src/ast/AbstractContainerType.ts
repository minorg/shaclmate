import type { NodeKind } from "@shaclmate/shacl-ast";

import { AbstractType } from "./AbstractType.js";
import type { BlankNodeType } from "./BlankNodeType.js";
import type { DiscriminatedUnionType } from "./DiscriminatedUnionType.js";
import type { IdentifierType } from "./IdentifierType.js";
import type { IntersectionType } from "./IntersectionType.js";
import type { IriType } from "./IriType.js";
import type { ListType } from "./ListType.js";
import type { LiteralType } from "./LiteralType.js";
import type { StructType } from "./StructType.js";
import type { TermType } from "./TermType.js";
import { Type } from "./Type.js";

/**
 * Abstract base class for types that contain other types e.g., ListType, OptionType, SetType.
 */
export abstract class AbstractContainerType<
  ItemTypeT extends
    AbstractContainerType.ItemType = AbstractContainerType.ItemType,
> extends AbstractType {
  abstract override readonly kind: "DefaultValue" | "List" | "Option" | "Set";

  /**
   * Container item type.
   *
   * Mutable to support cycle-handling logic in the compiler.
   */
  itemType: ItemTypeT;

  constructor({
    itemType,
    ...superParameters
  }: {
    itemType: ItemTypeT;
  } & ConstructorParameters<typeof AbstractType>[0]) {
    super(superParameters);
    this.itemType = itemType;
  }

  override get nodeKinds(): ReadonlySet<NodeKind> {
    return this.itemType.nodeKinds;
  }

  override get recursive(): boolean {
    return this.itemType.recursive;
  }

  override equals(other: AbstractContainerType<ItemTypeT>): boolean {
    if (!super.equals(other)) {
      return false;
    }

    if (!Type.equals(this.itemType, other.itemType)) {
      return false;
    }

    return true;
  }

  override toJSON() {
    return {
      ...super.toJSON(),
      itemType: (this.itemType as any).toJSON(),
    };
  }
}

export namespace AbstractContainerType {
  export type ItemType =
    | BlankNodeType
    | IdentifierType
    | IntersectionType
    | IriType
    | ListType
    | LiteralType
    | StructType
    | TermType
    | DiscriminatedUnionType;

  export function isItemType(type: Type): type is ItemType {
    switch (type.kind) {
      case "BlankNode":
      case "Identifier":
      case "Intersection":
      case "Iri":
      case "List":
      case "Literal":
      case "Struct":
      case "Term":
      case "Union":
        return true;
      case "DefaultValue":
      case "LazyOption":
      case "LazySet":
      case "Lazy":
      case "Option":
      case "Set":
        return false;
    }
  }
}
