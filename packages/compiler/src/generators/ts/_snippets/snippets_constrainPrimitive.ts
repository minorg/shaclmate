import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_constrainPrimitive: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}constrainPrimitive`,
    code`\
function ${syntheticNamePrefix}constrainPrimitive<ConstrainedT extends UnconstrainedT, UnconstrainedT extends ${snippets.Primitive}>(
  value: UnconstrainedT,
  in_?: readonly ConstrainedT[],
): ${imports.Either}<Error, ConstrainedT | UnconstrainedT> {
  if (in_ && !in_.some((check) => value === check)) {
    return ${imports.Left}(new Error(\`primitive \${value} does not match expected \${in_.map((_) => _.toString()).join(" | ")}\`));
  }
  return ${imports.Either}.of<Error, UnconstrainedT>(value as ConstrainedT);
}`,
  );
