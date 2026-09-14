import type { Type } from "../Type.js";
import type { ObjectType_DiscriminantProperty } from "./ObjectType_DiscriminantProperty.js";
import type { ObjectType_IdentifierProperty } from "./ObjectType_IdentifierProperty.js";
import type { ObjectType_RdfTypeProperty } from "./ObjectType_RdfTypeProperty.js";
import type { ObjectType_ShaclProperty } from "./ObjectType_ShaclProperty.js";

export type ObjectType_Property =
  | ObjectType_IdentifierProperty
  | ObjectType_ShaclProperty<Type>
  | ObjectType_DiscriminantProperty
  | ObjectType_RdfTypeProperty;
