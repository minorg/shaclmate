import type { DatasetCore } from "@rdfjs/types";
import { Parser, Store } from "n3";

/**
 * A subset of DASH (https://datashapes.org/dash.html) that's added to command line inputs for convenience.
 *
 * Parts that don't validate with SHACL-SHACL have been excised.
 */
export const dashDataset: DatasetCore = new Store(
  new Parser({ format: "text/turtle" }).parse(`
# baseURI: http://datashapes.org/dash
# imports: http://www.w3.org/ns/shacl#
# prefix: dash

@prefix dash: <http://datashapes.org/dash#> .
@prefix owl: <http://www.w3.org/2002/07/owl#> .
@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
@prefix sh: <http://www.w3.org/ns/shacl#> .
@prefix tosh: <http://topbraid.org/tosh#> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .

<http://datashapes.org/dash>
  a owl:Ontology ;
  rdfs:comment "DASH is a SHACL library for frequently needed features and design patterns. The constraint components in this library are 100% standards compliant and will work on any engine that fully supports SHACL." ;
  rdfs:label "DASH Data Shapes Vocabulary" ;
  owl:imports sh: ;
  sh:declare [
      sh:namespace "http://datashapes.org/dash#"^^xsd:anyURI ;
      sh:prefix "dash" ;
    ] ;
  sh:declare [
      sh:namespace "http://purl.org/dc/terms/"^^xsd:anyURI ;
      sh:prefix "dcterms" ;
    ] ;
  sh:declare [
      sh:namespace "http://www.w3.org/1999/02/22-rdf-syntax-ns#"^^xsd:anyURI ;
      sh:prefix "rdf" ;
    ] ;
  sh:declare [
      sh:namespace "http://www.w3.org/2000/01/rdf-schema#"^^xsd:anyURI ;
      sh:prefix "rdfs" ;
    ] ;
  sh:declare [
      sh:namespace "http://www.w3.org/2001/XMLSchema#"^^xsd:anyURI ;
      sh:prefix "xsd" ;
    ] ;
  sh:declare [
      sh:namespace "http://www.w3.org/2002/07/owl#"^^xsd:anyURI ;
      sh:prefix "owl" ;
    ] ;
  sh:declare [
      sh:namespace "http://www.w3.org/2004/02/skos/core#"^^xsd:anyURI ;
      sh:prefix "skos" ;
    ] ;
.

dash:StringOrLangString
  a rdf:List ;
  rdf:first [
      sh:datatype xsd:string ;
    ] ;
  rdf:rest (
      [
        sh:datatype rdf:langString ;
      ]
    ) ;
  rdfs:comment "An rdf:List that can be used in property constraints as value for sh:or to indicate that all values of a property must be either xsd:string or rdf:langString." ;
  rdfs:label "String or langString" ;
.
`),
);
