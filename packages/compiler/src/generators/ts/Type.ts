import type { BigDecimalType } from "./BigDecimalType.js";
import type { BigIntType } from "./BigIntType.js";
import type { BlankNodeType } from "./BlankNodeType.js";
import type { BooleanType } from "./BooleanType.js";
import type { DateTimeType } from "./DateTimeType.js";
import type { DateType } from "./DateType.js";
import type { DefaultValueType } from "./DefaultValueType.js";
import type { DiscriminatedUnionType } from "./DiscriminatedUnionType.js";
import type { FloatType } from "./FloatType.js";
import type { IdentifierType } from "./IdentifierType.js";
import type { IntType } from "./IntType.js";
import type { IriType } from "./IriType.js";
import type { LangStringType } from "./LangStringType.js";
import type { LazyOptionType } from "./LazyOptionType.js";
import type { LazySetType } from "./LazySetType.js";
import type { LazyType } from "./LazyType.js";
import type { ListType } from "./ListType.js";
import type { LiteralType } from "./LiteralType.js";
import type { ObjectType } from "./ObjectType.js";
import type { ObjectUnionType } from "./ObjectUnionType.js";
import type { OptionType } from "./OptionType.js";
import type { SetType } from "./SetType.js";
import type { StringType } from "./StringType.js";
import type { TermType } from "./TermType.js";

export type Type =
  | BigDecimalType
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
  | LangStringType
  | LazyOptionType
  | LazySetType
  | LazyType
  | ListType<ListType.ItemType>
  | LiteralType
  | ObjectUnionType
  | ObjectType
  | OptionType<OptionType.ItemType>
  | SetType<SetType.ItemType>
  | StringType
  | TermType
  | DiscriminatedUnionType<Type>;
