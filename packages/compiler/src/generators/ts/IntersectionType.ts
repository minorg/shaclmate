import { AbstractIntersectionType } from "./AbstractIntersectionType.js";
import type { Type } from "./Type.js";

export class IntersectionType extends AbstractIntersectionType<Type> {
  override readonly kind = "Intersection";
}
