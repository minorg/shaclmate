import type { Type } from "../Type.js";
import type { IdentifierPrefixProperty } from "./IdentifierPrefixProperty.js";
import type { IdentifierProperty } from "./IdentifierProperty.js";
import type { ShaclProperty } from "./ShaclProperty.js";
import type { TypeDiscriminantProperty } from "./TypeDiscriminantProperty.js";

export type Property =
  | IdentifierProperty
  | IdentifierPrefixProperty
  | ShaclProperty<Type>
  | TypeDiscriminantProperty;
