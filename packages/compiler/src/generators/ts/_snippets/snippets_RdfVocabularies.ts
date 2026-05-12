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
  export namespace rdf {
    export const first = ${this.imports.dataFactory}.namedNode("http://www.w3.org/1999/02/22-rdf-syntax-ns#first");
    export const nil = ${this.imports.dataFactory}.namedNode("http://www.w3.org/1999/02/22-rdf-syntax-ns#nil");
    export const rest = ${this.imports.dataFactory}.namedNode("http://www.w3.org/1999/02/22-rdf-syntax-ns#rest");
    export const subject = ${this.imports.dataFactory}.namedNode("http://www.w3.org/1999/02/22-rdf-syntax-ns#subject");
    export const type = ${this.imports.dataFactory}.namedNode("http://www.w3.org/1999/02/22-rdf-syntax-ns#type");
  }

  export namespace rdfs {
    export const subClassOf = ${this.imports.dataFactory}.namedNode("http://www.w3.org/2000/01/rdf-schema#subClassOf");
  }

  export namespace xsd {
    export const boolean = ${this.imports.dataFactory}.namedNode("http://www.w3.org/2001/XMLSchema#boolean");
    export const byte = ${this.imports.dataFactory}.namedNode("http://www.w3.org/2001/XMLSchema#byte");
    export const date = ${this.imports.dataFactory}.namedNode("http://www.w3.org/2001/XMLSchema#date");
    export const dateTime = ${this.imports.dataFactory}.namedNode("http://www.w3.org/2001/XMLSchema#dateTime");
    export const decimal = ${this.imports.dataFactory}.namedNode("http://www.w3.org/2001/XMLSchema#decimal");
    export const double = ${this.imports.dataFactory}.namedNode("http://www.w3.org/2001/XMLSchema#double");
    export const float = ${this.imports.dataFactory}.namedNode("http://www.w3.org/2001/XMLSchema#float");
    export const int = ${this.imports.dataFactory}.namedNode("http://www.w3.org/2001/XMLSchema#int");
    export const integer = ${this.imports.dataFactory}.namedNode("http://www.w3.org/2001/XMLSchema#integer");
    export const long = ${this.imports.dataFactory}.namedNode("http://www.w3.org/2001/XMLSchema#long");
    export const negativeInteger = ${this.imports.dataFactory}.namedNode("http://www.w3.org/2001/XMLSchema#negativeInteger");
    export const nonNegativeInteger = ${this.imports.dataFactory}.namedNode("http://www.w3.org/2001/XMLSchema#nonNegativeInteger");
    export const nonPositiveInteger = ${this.imports.dataFactory}.namedNode("http://www.w3.org/2001/XMLSchema#nonPositiveInteger");
    export const positiveInteger = ${this.imports.dataFactory}.namedNode("http://www.w3.org/2001/XMLSchema#positiveInteger");
    export const short = ${this.imports.dataFactory}.namedNode("http://www.w3.org/2001/XMLSchema#short");
    export const string = ${this.imports.dataFactory}.namedNode("http://www.w3.org/2001/XMLSchema#string");
    export const unsignedByte = ${this.imports.dataFactory}.namedNode("http://www.w3.org/2001/XMLSchema#unsignedByte");
    export const unsignedInt = ${this.imports.dataFactory}.namedNode("http://www.w3.org/2001/XMLSchema#unsignedInt");
    export const unsignedLong = ${this.imports.dataFactory}.namedNode("http://www.w3.org/2001/XMLSchema#unsignedLong");
    export const unsignedShort = ${this.imports.dataFactory}.namedNode("http://www.w3.org/2001/XMLSchema#unsignedShort");
  }
}
`,
  );
