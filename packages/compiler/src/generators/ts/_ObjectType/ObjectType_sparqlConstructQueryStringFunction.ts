import type { Callable } from "../Callable.js";
import type { CodeThunk } from "../CodeThunk.js";
import type { Reusables } from "../Reusables.js";
import type { TsGenerator } from "../TsGenerator.js";
import { type Code, code } from "../ts-poet-wrapper.js";

export function ObjectType_sparqlConstructQueryStringFunction(this: {
  readonly configuration: TsGenerator.Configuration;
  readonly filterType: Code;
  _function(parameters: {
    type: CodeThunk;
    unannotatedExpression: CodeThunk;
    unqualifiedName: string;
  }): Callable;
  readonly reusables: Reusables;
  readonly sparqlConstructQueryFunction: Callable;
}): Callable {
  return this._function({
    type: code`${this.reusables.snippets.SparqlConstructQueryStringFunction}<${this.filterType}>`,
    unannotatedExpression: code`\
(parameters) => new ${this.reusables.imports.sparqljs}.Generator(parameters).stringify(${this.sparqlConstructQueryFunction.annotatedUsage}(parameters));
`,
    unqualifiedName: "sparqlConstructQueryString",
  });
}
