import { imports } from "../imports.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";
import { snippets_TermFilter } from "./snippets_TermFilter.js";

export const snippets_filterTerm = conditionalOutput(
  `${syntheticNamePrefix}filterTerm`,
  code`\
  function ${syntheticNamePrefix}filterTerm(filter: ${snippets_TermFilter}, value: ${imports.BlankNode} | ${imports.Literal} | ${imports.NamedNode}): boolean {
    if (filter.datatypeIn !== undefined && (value.termType !== "Literal" || !filter.datatypeIn.some(inDatatype => inDatatype.equals(value.datatype)))) {
      return false;
    }

    if (filter.in !== undefined && !filter.in.some(inTerm => inTerm.equals(value))) {
      return false;
    }

  
    if (filter.languageIn !== undefined && (value.termType !== "Literal" || !filter.languageIn.some(inLanguage => inLanguage === value.language))) {
      return false;
    }
  
    if (filter.typeIn !== undefined && !filter.typeIn.some(inType => inType === value.termType)) {
      return false;
    }
    
    return true;
  }`,
);
