import { AbstractDiscriminatedUnionType } from "./AbstractDiscriminatedUnionType.js";
import type { Type } from "./Type.js";

export class DiscriminatedUnionType extends AbstractDiscriminatedUnionType<Type> {
  override readonly kind = "DiscriminatedUnion";
}
