import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_monkeyPatchObject: SnippetFactory = ({
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}monkeyPatchObject`,
    code`\
function ${syntheticNamePrefix}monkeyPatchObject<T extends object>(obj: T, methods: { toJson?: (obj: T) => object, ${syntheticNamePrefix}toString?: (obj: T) => string }): T {
  if (methods.toJson && (!globalThis.Object.prototype.hasOwnProperty.call(obj, "toJSON") || typeof (obj as any).toJSON === "function")) {
    const toJsonMethod = methods.toJson;
    (obj as any).toJSON = function(this: T, _key: string) { return toJsonMethod(this); }
  }

  if (methods.${syntheticNamePrefix}toString && (!globalThis.Object.prototype.hasOwnProperty.call(obj, "toString") || typeof (obj as any).toJSON === "function")) {
    const toStringMethod = methods.${syntheticNamePrefix}toString;
    (obj as any).toString = function(this: T) { return toStringMethod(this); }
  }

  return obj;
}`,
  );
