import type { Type } from "../Type.js";
import type { DiscriminantProperty } from "./DiscriminantProperty.js";
import type { IdentifierPrefixProperty } from "./IdentifierPrefixProperty.js";
import type { IdentifierProperty } from "./IdentifierProperty.js";
import type { ShaclProperty } from "./ShaclProperty.js";

export type Property =
  | IdentifierProperty
  | IdentifierPrefixProperty
  | ShaclProperty<Type>
  | DiscriminantProperty;
