import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_filterTerm: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}filterTerm`,
    code`\
  function ${syntheticNamePrefix}filterTerm(filter: ${this.snippets.TermFilter}, value: ${this.imports.BlankNode} | ${this.imports.Literal} | ${this.imports.NamedNode}): boolean {
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
