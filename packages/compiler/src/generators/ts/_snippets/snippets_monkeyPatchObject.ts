import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_monkeyPatchObject: SnippetFactory = ({
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}monkeyPatchObject`,
    code`\
function ${syntheticNamePrefix}monkeyPatchObject<T extends object>(obj: T, methods: { toJson?: ${snippets.ToJsonFunction}<T>, ${syntheticNamePrefix}toString?: ${snippets.ToStringFunction}<T> }): T {
  if (methods.toJson && !globalThis.Object.prototype.hasOwnProperty.call(obj, "toJSON")) {
    (obj as any).toJSON = methods.toJson;
  }

  if (methods.${syntheticNamePrefix}toString && !globalThis.Object.prototype.hasOwnProperty.call(obj, "toString")) {
    (obj as any).toString = methods.${syntheticNamePrefix}toString;
  }

  return obj;
}`,
  );
