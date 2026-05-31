import type { IntersectionType } from "./IntersectionType.js";
import type { ObjectType } from "./ObjectType.js";

export type ObjectIntersectionType = IntersectionType<
  IntersectionType<ObjectType> | ObjectType
>;
