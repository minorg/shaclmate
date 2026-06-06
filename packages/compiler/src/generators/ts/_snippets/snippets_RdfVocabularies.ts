import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_RdfVocabularies: SnippetFactory = ({
  imports,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}RdfVocabularies`,
    code`\
namespace ${syntheticNamePrefix}RdfVocabularies {
  export const rdf = {
    first: ${imports.dataFactory}.namedNode("http://www.w3.org/1999/02/22-rdf-syntax-ns#first"),
    nil: ${imports.dataFactory}.namedNode("http://www.w3.org/1999/02/22-rdf-syntax-ns#nil"),
    rest: ${imports.dataFactory}.namedNode("http://www.w3.org/1999/02/22-rdf-syntax-ns#rest"),
    subject: ${imports.dataFactory}.namedNode("http://www.w3.org/1999/02/22-rdf-syntax-ns#subject"),
    type: ${imports.dataFactory}.namedNode("http://www.w3.org/1999/02/22-rdf-syntax-ns#type"),
  };

  export const rdfs = {
    subClassOf: ${imports.dataFactory}.namedNode("http://www.w3.org/2000/01/rdf-schema#subClassOf")
  };

  export const xsd = {
    boolean: ${imports.dataFactory}.namedNode("http://www.w3.org/2001/XMLSchema#boolean"),
    byte: ${imports.dataFactory}.namedNode("http://www.w3.org/2001/XMLSchema#byte"),
    date: ${imports.dataFactory}.namedNode("http://www.w3.org/2001/XMLSchema#date"),
    dateTime: ${imports.dataFactory}.namedNode("http://www.w3.org/2001/XMLSchema#dateTime"),
    decimal: ${imports.dataFactory}.namedNode("http://www.w3.org/2001/XMLSchema#decimal"),
    double: ${imports.dataFactory}.namedNode("http://www.w3.org/2001/XMLSchema#double"),
    float: ${imports.dataFactory}.namedNode("http://www.w3.org/2001/XMLSchema#float"),
    int: ${imports.dataFactory}.namedNode("http://www.w3.org/2001/XMLSchema#int"),
    integer: ${imports.dataFactory}.namedNode("http://www.w3.org/2001/XMLSchema#integer"),
    long: ${imports.dataFactory}.namedNode("http://www.w3.org/2001/XMLSchema#long"),
    negativeInteger: ${imports.dataFactory}.namedNode("http://www.w3.org/2001/XMLSchema#negativeInteger"),
    nonNegativeInteger: ${imports.dataFactory}.namedNode("http://www.w3.org/2001/XMLSchema#nonNegativeInteger"),
    nonPositiveInteger: ${imports.dataFactory}.namedNode("http://www.w3.org/2001/XMLSchema#nonPositiveInteger"),
    positiveInteger: ${imports.dataFactory}.namedNode("http://www.w3.org/2001/XMLSchema#positiveInteger"),
    short: ${imports.dataFactory}.namedNode("http://www.w3.org/2001/XMLSchema#short"),
    string: ${imports.dataFactory}.namedNode("http://www.w3.org/2001/XMLSchema#string"),
    unsignedByte: ${imports.dataFactory}.namedNode("http://www.w3.org/2001/XMLSchema#unsignedByte"),
    unsignedInt: ${imports.dataFactory}.namedNode("http://www.w3.org/2001/XMLSchema#unsignedInt"),
    unsignedLong: ${imports.dataFactory}.namedNode("http://www.w3.org/2001/XMLSchema#unsignedLong"),
    unsignedShort: ${imports.dataFactory}.namedNode("http://www.w3.org/2001/XMLSchema#unsignedShort")
  };
}
`,
  );
