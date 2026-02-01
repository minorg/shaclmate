import type { BlankNodeType } from "./BlankNodeType.js";
import type { BooleanType } from "./BooleanType.js";
import type { DateTimeType } from "./DateTimeType.js";
import type { DateType } from "./DateType.js";
import type { FloatType } from "./FloatType.js";
import type { IdentifierType } from "./IdentifierType.js";
import type { IntType } from "./IntType.js";
import type { LazyObjectOptionType } from "./LazyObjectOptionType.js";
import type { LazyObjectSetType } from "./LazyObjectSetType.js";
import type { LazyObjectType } from "./LazyObjectType.js";
import type { ListType } from "./ListType.js";
import type { LiteralType } from "./LiteralType.js";
import type { NamedNodeType } from "./NamedNodeType.js";
import type { ObjectType } from "./ObjectType.js";
import type { ObjectUnionType } from "./ObjectUnionType.js";
import type { OptionType } from "./OptionType.js";
import type { SetType } from "./SetType.js";
import type { StringType } from "./StringType.js";
import type { TermType } from "./TermType.js";
import type { UnionType } from "./UnionType.js";

export type Type =
  | BlankNodeType
  | BooleanType
  | DateTimeType
  | DateType
  | FloatType
  | IdentifierType
  | IntType
  | LazyObjectOptionType
  | LazyObjectSetType
  | LazyObjectType
  | ListType<Type>
  | LiteralType
  | NamedNodeType
  | ObjectType
  | ObjectUnionType
  | OptionType<Type>
  | SetType<Type>
  | StringType
  | TermType
  | UnionType;
