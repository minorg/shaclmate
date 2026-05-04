import type { Term } from "@rdfjs/types";

export function termToJson(term: Term) {
  switch (term.termType) {
    case "BlankNode":
      return { termType: term.termType, value: term.value };
    case "Literal":
      return {
        datatype: term.datatype.value,
        language: term.language,
        termType: term.termType,
        value: term.value,
      };
    case "NamedNode":
      return { termType: term.termType, value: term.value };
    default:
      throw new Error(`unsupported term type: ${term.termType}`);
  }
}
