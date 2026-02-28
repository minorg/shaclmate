import type { BigIntType } from "./BigIntType.js";
import type { BlankNodeType } from "./BlankNodeType.js";
import type { BooleanType } from "./BooleanType.js";
import type { DateTimeType } from "./DateTimeType.js";
import type { DateType } from "./DateType.js";
import type { DefaultValueType } from "./DefaultValueType.js";
import type { FloatType } from "./FloatType.js";
import type { IdentifierType } from "./IdentifierType.js";
import type { IntType } from "./IntType.js";
import type { IriType } from "./IriType.js";
import type { LazyObjectOptionType } from "./LazyObjectOptionType.js";
import type { LazyObjectSetType } from "./LazyObjectSetType.js";
import type { LazyObjectType } from "./LazyObjectType.js";
import type { ListType } from "./ListType.js";
import type { LiteralType } from "./LiteralType.js";
import type { ObjectType } from "./ObjectType.js";
import type { ObjectUnionType } from "./ObjectUnionType.js";
import type { OptionType } from "./OptionType.js";
import type { SetType } from "./SetType.js";
import type { StringType } from "./StringType.js";
import type { TermType } from "./TermType.js";
import type { UnionType } from "./UnionType.js";

export type Type =
  | BigIntType
  | BlankNodeType
  | BooleanType
  | DateTimeType
  | DateType
  | DefaultValueType<DefaultValueType.ItemType>
  | FloatType
  | IdentifierType
  | IntType
  | IriType
  | LazyObjectOptionType
  | LazyObjectSetType
  | LazyObjectType
  | ListType<ListType.ItemType>
  | LiteralType
  | ObjectType
  | ObjectUnionType
  | OptionType<OptionType.ItemType>
  | SetType<SetType.ItemType>
  | StringType
  | TermType
  | UnionType;
