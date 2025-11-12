import type { BlankNode, Literal, NamedNode } from "@rdfjs/types";
import { Name } from "ast/Name.js";
import { Resource } from "rdfjs-resource";
import { invariant } from "ts-invariant";
import type { IdentifierType } from "./IdentifierType.js";
import type { IntersectionType } from "./IntersectionType.js";
import type { ListType } from "./ListType.js";
import type { LiteralType } from "./LiteralType.js";
import type { ObjectIntersectionType } from "./ObjectIntersectionType.js";
import type { ObjectType } from "./ObjectType.js";
import type { ObjectUnionType } from "./ObjectUnionType.js";
import type { OptionType } from "./OptionType.js";
import type { PlaceholderType } from "./PlaceholderType.js";
import type { SetType } from "./SetType.js";
import type { TermType } from "./TermType.js";
import type { UnionType } from "./UnionType.js";
import {
  arrayEquals,
  maybeEquals,
  setEquals,
  strictEquals,
  termEquals,
} from "./equals.js";

export type Type =
  | IdentifierType
  | IntersectionType
  | ListType
  | LiteralType
  | ObjectIntersectionType
  | ObjectType
  | ObjectUnionType
  | OptionType
  | PlaceholderType
  | SetType
  | (Omit<
      TermType<Literal | NamedNode, BlankNode | Literal | NamedNode>,
      "kind"
    > & {
      readonly kind: "TermType";
    })
  | UnionType;

export namespace Type {
  export function equals(left: Type, right: Type): boolean {
    if (left.kind !== right.kind) {
      return false;
    }

    switch (left.kind) {
      case "IdentifierType":
      case "LiteralType":
      case "TermType": {
        invariant(
          right.kind === "IdentifierType" ||
            right.kind === "LiteralType" ||
            right.kind === "TermType",
        );

        if (!maybeEquals(left.defaultValue, right.defaultValue, termEquals)) {
          return false;
        }

        if (!arrayEquals(left.hasValues, right.hasValues, termEquals)) {
          return false;
        }

        if (!arrayEquals(left.in_, right.in_, termEquals)) {
          return false;
        }

        if (!setEquals(left.nodeKinds, right.nodeKinds, strictEquals)) {
          return false;
        }

        return true;
      }
      case "IntersectionType":
      case "UnionType": {
        invariant(
          right.kind === "IntersectionType" || right.kind === "UnionType",
        );
        return arrayEquals(left.memberTypes, right.memberTypes, Type.equals);
      }
      case "ListType": {
        invariant(right.kind === "ListType");

        if (!maybeEquals(left.comment, right.comment, strictEquals)) {
          return false;
        }

        if (
          !maybeEquals(
            left.identifierMintingStrategy,
            right.identifierMintingStrategy,
            strictEquals,
          )
        ) {
          return false;
        }

        if (left.identifierNodeKind !== right.identifierNodeKind) {
          return false;
        }

        if (!equals(left.itemType, right.itemType)) {
          return false;
        }

        if (!maybeEquals(left.label, right.label, strictEquals)) {
          return false;
        }

        if (!maybeEquals(left.mutable, right.mutable, strictEquals)) {
          return false;
        }

        if (!Name.equals(left.name, right.name)) {
          return false;
        }

        return true;
      }

      case "ObjectIntersectionType":
      case "ObjectType":
      case "ObjectUnionType": {
        invariant(
          right.kind === "ObjectIntersectionType" ||
            right.kind === "ObjectType" ||
            right.kind === "ObjectUnionType",
        );

        // Don't recurse
        return Name.equals(left.name, right.name);
      }

      case "OptionType": {
        invariant(right.kind === "OptionType");
        return Type.equals(left.itemType, right.itemType);
      }

      case "PlaceholderType":
        return true;

      case "SetType": {
        invariant(right.kind === "SetType");

        if (!Type.equals(left.itemType, right.itemType)) {
          return false;
        }

        if (left.minCount !== right.minCount) {
          return false;
        }

        if (!maybeEquals(left.mutable, right.mutable, strictEquals)) {
          return false;
        }

        return true;
      }
    }
  }

  // biome-ignore lint/suspicious/noShadowRestrictedNames: <explanation>
  export function toString(type: Type): string {
    switch (type.kind) {
      case "LiteralType":
      case "PlaceholderType":
        return `${type.kind}()`;
      case "IntersectionType":
      case "UnionType":
        return `${type.kind}(memberTypes=[${type.memberTypes.map(Type.toString).join(", ")}])`;
      case "IdentifierType":
      case "TermType":
        return `${type.kind}(nodeKinds=${[...type.nodeKinds].join(" | ")})`;
      case "ObjectIntersectionType":
      case "ObjectType":
      case "ObjectUnionType":
        return `${type.kind}(identifier=${Resource.Identifier.toString(type.name.identifier)})`;
      case "ListType":
      case "OptionType":
      case "SetType":
        return `${type.kind}(itemType=${toString(type.itemType)})`;
    }
  }
}
