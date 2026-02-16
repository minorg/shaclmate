import { imports } from "../imports.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_RdfVocabularies = conditionalOutput(
  `${syntheticNamePrefix}RdfVocabularies`,
  code`\
namespace ${syntheticNamePrefix}RdfVocabularies {
  export namespace rdf {
    export const first = ${imports.dataFactory}.namedNode("http://www.w3.org/1999/02/22-rdf-syntax-ns#first");
    export const nil = ${imports.dataFactory}.namedNode("http://www.w3.org/1999/02/22-rdf-syntax-ns#nil");
    export const rest = ${imports.dataFactory}.namedNode("http://www.w3.org/1999/02/22-rdf-syntax-ns#rest");
    export const subject = ${imports.dataFactory}.namedNode("http://www.w3.org/1999/02/22-rdf-syntax-ns#subject");
    export const type = ${imports.dataFactory}.namedNode("http://www.w3.org/1999/02/22-rdf-syntax-ns#type");
  }

  export namespace rdfs {
    export const subClassOf = ${imports.dataFactory}.namedNode("http://www.w3.org/2000/01/rdf-schema#subClassOf");
  }

  export namespace xsd {
    export const boolean = ${imports.dataFactory}.namedNode("http://www.w3.org/2001/XMLSchema#boolean");
    export const date = ${imports.dataFactory}.namedNode("http://www.w3.org/2001/XMLSchema#date");
    export const dateTime = ${imports.dataFactory}.namedNode("http://www.w3.org/2001/XMLSchema#dateTime");
    export const decimal = ${imports.dataFactory}.namedNode("http://www.w3.org/2001/XMLSchema#decimal");
    export const double = ${imports.dataFactory}.namedNode("http://www.w3.org/2001/XMLSchema#double");
    export const integer = ${imports.dataFactory}.namedNode("http://www.w3.org/2001/XMLSchema#integer");
  }
}
`,
);
