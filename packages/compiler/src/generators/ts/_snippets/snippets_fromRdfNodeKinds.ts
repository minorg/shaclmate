import { imports } from "../imports.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_fromRdfNodeKinds = conditionalOutput(
  `${syntheticNamePrefix}fromRdfNodeKinds`,
  code`\
function ${syntheticNamePrefix}fromRdfNodeKinds(${imports.Resource}.Value, nodeKinds: readonly ("BlankNode" | "Literal" | "NamedNode")[]): ${imports.Either}<Error, ${imports.Resource}.Value> {
  return values.chainMap(value =>
    nodeKinds.includes(value.term.termType) ?
      ${imports.Right}(value) :
      ${imports.Left}(new ${imports.Resource}.MistypedTermValueError(${{
        actualValue: code`value`,
        expectedValueType: code`nodeKinds.join(" | ")`,
        focusResource: code`value.focusResource`,
        propertyPath: code`value.propertyPath`,
      }}))
  );
}`,
);
