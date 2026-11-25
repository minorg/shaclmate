import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_UnknownError: SnippetFactory = ({
  configuration,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}UnknownError`,
    code`
export interface ${syntheticNamePrefix}UnknownError {
  readonly error: Error;
}
  
export namespace ${syntheticNamePrefix}UnknownError {
  export type Discriminated = ${syntheticNamePrefix}UnknownError & { ${configuration.objectDiscriminantProperty.name}: "${syntheticNamePrefix}UnknownError" };

  export function fromError(error: Error): Discriminated {
    return {
      error,
      ${configuration.objectDiscriminantProperty.name}: "${syntheticNamePrefix}UnknownError"
    }
  }
}`,
  );
