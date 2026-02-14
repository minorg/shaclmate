import { snippets_arrayEquals } from "./_snippets/snippets_arrayEquals.js";
import { snippets_arrayIntersection } from "./_snippets/snippets_arrayIntersection.js";
import { snippets_BlankNodeFilter } from "./_snippets/snippets_BlankNodeFilter.js";
import { snippets_BlankNodeSchema } from "./_snippets/snippets_BlankNodeSchema.js";
import { snippets_BooleanFilter } from "./_snippets/snippets_BooleanFilter.js";
import { snippets_BooleanSchema } from "./_snippets/snippets_BooleanSchema.js";
import { snippets_blankNodeFromString } from "./_snippets/snippets_blankNodeFromString.js";
import { snippets_blankNodeSparqlWherePatterns } from "./_snippets/snippets_blankNodeSparqlWherePatterns.js";
import { snippets_booleanEquals } from "./_snippets/snippets_booleanEquals.js";
import { snippets_booleanSparqlWherePatterns } from "./_snippets/snippets_booleanSparqlWherePatterns.js";
import { snippets_CollectionFilter } from "./_snippets/snippets_CollectionFilter.js";
import { snippets_CollectionSchema } from "./_snippets/snippets_CollectionSchema.js";
import { snippets_DateFilter } from "./_snippets/snippets_DateFilter.js";
import { snippets_DateSchema } from "./_snippets/snippets_DateSchema.js";
import { snippets_DefaultValueSchema } from "./_snippets/snippets_DefaultValueSchema.js";
import { snippets_datasetFactory } from "./_snippets/snippets_datasetFactory.js";
import { snippets_dateEquals } from "./_snippets/snippets_dateEquals.js";
import { snippets_dateSparqlWherePatterns } from "./_snippets/snippets_dateSparqlWherePatterns.js";
import { snippets_deduplicateSparqlPatterns } from "./_snippets/snippets_deduplicateSparqlPatterns.js";
import { snippets_defaultValueSparqlWherePatterns } from "./_snippets/snippets_defaultValueSparqlWherePatterns.js";
import { snippets_EqualsResult } from "./_snippets/snippets_EqualsResult.js";
import { snippets_FromRdfOptions } from "./_snippets/snippets_FromRdfTypeOptions.js";
import { snippets_filterArray } from "./_snippets/snippets_filterArray.js";
import { snippets_filterBlankNode } from "./_snippets/snippets_filterBlankNode.js";
import { snippets_filterBoolean } from "./_snippets/snippets_filterBoolean.js";
import { snippets_filterDate } from "./_snippets/snippets_filterDate.js";
import { snippets_filterIdentifier } from "./_snippets/snippets_filterIdentifier.js";
import { snippets_filterNumber } from "./_snippets/snippets_filterNumber.js";
import { snippets_filterString } from "./_snippets/snippets_filterString.js";
import { snippets_filterTerm } from "./_snippets/snippets_filterTerm.js";
import { snippets_fromRdfPreferredLanguages } from "./_snippets/snippets_fromRdfPreferredLanguages.js";
import { snippets_Hasher } from "./_snippets/snippets_Hasher.js";
import { snippets_IdentifierFilter } from "./_snippets/snippets_IdentifierFilter.js";
import { snippets_IdentifierSchema } from "./_snippets/snippets_IdentifierSchema.js";
import { snippets_IdentifierSet } from "./_snippets/snippets_IdentifierSet.js";
import { snippets_identifierFromString } from "./_snippets/snippets_identifierFromString.js";
import { snippets_identifierSparqlWherePatterns } from "./_snippets/snippets_identifierSparqlWherePatterns.js";
import { snippets_isReadonlyBooleanArray } from "./_snippets/snippets_isReadonlyBooleanArray.js";
import { snippets_isReadonlyNumberArray } from "./_snippets/snippets_isReadonlyNumberArray.js";
import { snippets_isReadonlyObjectArray } from "./_snippets/snippets_isReadonlyObjectArray.js";
import { snippets_isReadonlyStringArray } from "./_snippets/snippets_isReadonlyStringArray.js";
import { snippets_liftSparqlPatterns } from "./_snippets/snippets_liftSparqlPatterns.js";
import { snippets_literalSchemaSparqlPatterns } from "./_snippets/snippets_literalSchemaSparqlPatterns.js";
import { snippets_NumberFilter } from "./_snippets/snippets_NumberFilter.js";
import { snippets_NumberSchema } from "./_snippets/snippets_NumberSchema.js";
import { snippets_normalizeSparqlWherePatterns } from "./_snippets/snippets_normalizeSparqlWherePatterns.js";
import { snippets_numberSparqlWherePatterns } from "./_snippets/snippets_numberSparqlWherePatterns.js";
import { snippets_PropertiesFromRdfParameters } from "./_snippets/snippets_PropertiesFromRdfParameters.js";
import { snippets_RdfVocabularies } from "./_snippets/snippets_RdfVocabularies.js";
import { snippets_SparqlFilterPattern } from "./_snippets/snippets_SparqlFilterPattern.js";
import { snippets_SparqlPattern } from "./_snippets/snippets_SparqlPattern.js";
import { snippets_SparqlPattern_isSolutionGenerating } from "./_snippets/snippets_SparqlPattern_isSolutionGenerating.js";
import { snippets_SparqlWherePatternsFunction } from "./_snippets/snippets_SparqlWherePatternsFunction.js";
import { snippets_SparqlWherePatternsFunctionParameters } from "./_snippets/snippets_SparqlWherePatternsFunctionParameters.js";
import { snippets_StringFilter } from "./_snippets/snippets_StringFilter.js";
import { snippets_StringSchema } from "./_snippets/snippets_StringSchema.js";
import { snippets_setSparqlWherePatterns } from "./_snippets/snippets_setSparqlWherePatterns.js";
import { snippets_sortSparqlPatterns } from "./_snippets/snippets_sortSparqlPatterns.js";
import { snippets_sparqlInstancesOfPattern } from "./_snippets/snippets_sparqlInstancesOfPattern.js";
import { snippets_sparqlValueInPattern } from "./_snippets/snippets_sparqlValueInPattern.js";
import { snippets_strictEquals } from "./_snippets/snippets_strictEquals.js";
import { snippets_stringSparqlWherePatterns } from "./_snippets/snippets_stringSparqlWherePatterns.js";
import { snippets_TermFilter } from "./_snippets/snippets_TermFilter.js";
import { snippets_TermSchema } from "./_snippets/snippets_TermSchema.js";
import { snippets_termFilterSparqlPatterns } from "./_snippets/snippets_termFilterSparqlPatterns.js";
import { snippets_termSchemaSparqlPatterns } from "./_snippets/snippets_termSchemaSparqlPatterns.js";
import { snippets_termSparqlWherePatterns } from "./_snippets/snippets_termSparqlWherePatterns.js";
import { snippets_toLiteral } from "./_snippets/snippets_toLiteral.js";
import { snippets_UnwrapR } from "./_snippets/snippets_UnwrapR.js";

export const snippets = {
  arrayIntersection: snippets_arrayIntersection,
  arrayEquals: snippets_arrayEquals,
  BlankNodeFilter: snippets_BlankNodeFilter,
  BlankNodeSchema: snippets_BlankNodeSchema,
  blankNodeFromString: snippets_blankNodeFromString,
  blankNodeSparqlWherePatterns: snippets_blankNodeSparqlWherePatterns,
  booleanEquals: snippets_booleanEquals,
  BooleanFilter: snippets_BooleanFilter,
  BooleanSchema: snippets_BooleanSchema,
  booleanSparqlWherePatterns: snippets_booleanSparqlWherePatterns,
  CollectionFilter: snippets_CollectionFilter,
  CollectionSchema: snippets_CollectionSchema,
  datasetFactory: snippets_datasetFactory,
  dateEquals: snippets_dateEquals,
  DateFilter: snippets_DateFilter,
  DateSchema: snippets_DateSchema,
  dateSparqlWherePatterns: snippets_dateSparqlWherePatterns,
  deduplicateSparqlPatterns: snippets_deduplicateSparqlPatterns,
  defaultValueSparqlWherePatterns: snippets_defaultValueSparqlWherePatterns,
  DefaultValueSchema: snippets_DefaultValueSchema,
  EqualsResult: snippets_EqualsResult,
  filterArray: snippets_filterArray,
  filterBlankNode: snippets_filterBlankNode,
  filterBoolean: snippets_filterBoolean,
  filterDate: snippets_filterDate,
  filterIdentifier: snippets_filterIdentifier,
  filterNumber: snippets_filterNumber,
  filterString: snippets_filterString,
  filterTerm: snippets_filterTerm,
  FromRdfOptions: snippets_FromRdfOptions,
  fromRdfPreferredLanguages: snippets_fromRdfPreferredLanguages,
  Hasher: snippets_Hasher,
  IdentifierFilter: snippets_IdentifierFilter,
  identifierFromString: snippets_identifierFromString,
  IdentifierSchema: snippets_IdentifierSchema,
  IdentifierSet: snippets_IdentifierSet,
  identifierSparqlWherePatterns: snippets_identifierSparqlWherePatterns,
  isReadonlyBooleanArray: snippets_isReadonlyBooleanArray,
  isReadonlyNumberArray: snippets_isReadonlyNumberArray,
  isReadonlyObjectArray: snippets_isReadonlyObjectArray,
  isReadonlyStringArray: snippets_isReadonlyStringArray,
  liftSparqlPatterns: snippets_liftSparqlPatterns,
  literalSchemaSparqlPatterns: snippets_literalSchemaSparqlPatterns,
  normalizeSparqlWherePatterns: snippets_normalizeSparqlWherePatterns,
  NumberFilter: snippets_NumberFilter,
  NumberSchema: snippets_NumberSchema,
  numberSparqlWherePatterns: snippets_numberSparqlWherePatterns,
  PropertiesFromRdfParameters: snippets_PropertiesFromRdfParameters,
  RdfVocabularies: snippets_RdfVocabularies,
  setSparqlWherePatterns: snippets_setSparqlWherePatterns,
  sortSparqlPatterns: snippets_sortSparqlPatterns,
  SparqlFilterPattern: snippets_SparqlFilterPattern,
  sparqlInstancesOfPattern: snippets_sparqlInstancesOfPattern,
  SparqlPattern_isSolutionGenerating:
    snippets_SparqlPattern_isSolutionGenerating,
  SparqlPattern: snippets_SparqlPattern,
  sparqlValueInPattern: snippets_sparqlValueInPattern,
  SparqlWherePatternsFunction: snippets_SparqlWherePatternsFunction,
  SparqlWherePatternsFunctionParameters:
    snippets_SparqlWherePatternsFunctionParameters,
  strictEquals: snippets_strictEquals,
  StringFilter: snippets_StringFilter,
  StringSchema: snippets_StringSchema,
  stringSparqlWherePatterns: snippets_stringSparqlWherePatterns,
  TermFilter: snippets_TermFilter,
  termFilterSparqlPatterns: snippets_termFilterSparqlPatterns,
  TermSchema: snippets_TermSchema,
  termSchemaSparqlPatterns: snippets_termSchemaSparqlPatterns,
  termSparqlWherePatterns: snippets_termSparqlWherePatterns,
  toLiteral: snippets_toLiteral,
  UnwrapR: snippets_UnwrapR,
};
