// import { imports } from "../imports.js";
// import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
// import { code, conditionalOutput } from "../ts-poet-wrapper.js";
// import { snippets_ShaclPropertySchema } from "./snippets_ShaclPropertySchema.js";

// export const snippets_shaclPropertySparqlConstructTriples = conditionalOutput(
//   `${syntheticNamePrefix}shaclPropertySparqlConstructTriples`,
//   code`\
// function ${syntheticNamePrefix}shaclPropertySparqlConstructTriples({ propertySchema, typeSparqlConstructTriples }: {
//   focusIdentifier: ${imports.Resource}.Identifier,
//   propertySchema: ${snippets_ShaclPropertySchema};
//   typeSparqlConstructTriples: () => readonly ${imports.sparqljs}.Triple[]
// }): readonly ${imports.sparqljs}.Triple[] {

//     return [${{
//         object: code`valueVariable`,
//         predicate: code`propertySchema.identifier`,
//         subject: variables.focusIdentifier,
//       }}${this.type
//         .sparqlConstructTriples({
//           allowIgnoreRdfType: true,
//           variables: {
//             valueVariable,
//             variablePrefix: valueString,
//           },
//         })
//         .map((code_) => code`, ...${code_}`)
//         .orDefault(code``)}]`,

//   return typeFromRdf(${imports.Either}.of<Error, ${imports.Resource}.Values<${imports.Resource}.TermValue>>(resource.values(propertySchema.identifier, { graph, unique: true }))).chain(values => values.head());
// }`,
// );
