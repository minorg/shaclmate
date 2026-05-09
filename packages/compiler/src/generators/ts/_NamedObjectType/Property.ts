import type { Type } from "../Type.js";
import type { DiscriminantProperty } from "./DiscriminantProperty.js";
import type { IdentifierProperty } from "./IdentifierProperty.js";
import type { ShaclProperty } from "./ShaclProperty.js";

export type Property =
  | IdentifierProperty
  | ShaclProperty<Type>
  | DiscriminantProperty;
