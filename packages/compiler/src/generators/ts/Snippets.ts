import { invariant } from "ts-invariant";
import type { Logger } from "ts-log";
import { Memoize } from "typescript-memoize";
import { snippets__FromRdfResourceFunction } from "./_snippets/snippets__FromRdfResourceFunction.js";
import { snippets__ToRdfResourceFunction } from "./_snippets/snippets__ToRdfResourceFunction.js";
import { snippets_arrayEquals } from "./_snippets/snippets_arrayEquals.js";
import { snippets_arrayIntersection } from "./_snippets/snippets_arrayIntersection.js";
import { snippets_BlankNodeFilter } from "./_snippets/snippets_BlankNodeFilter.js";
import { snippets_BlankNodeSchema } from "./_snippets/snippets_BlankNodeSchema.js";
import { snippets_BooleanFilter } from "./_snippets/snippets_BooleanFilter.js";
import { snippets_BooleanSchema } from "./_snippets/snippets_BooleanSchema.js";
import { snippets_bigDecimalLiteral } from "./_snippets/snippets_bigDecimalLiteral.js";
import { snippets_bigDecimalSparqlWherePatterns } from "./_snippets/snippets_bigDecimalSparqlWherePatterns.js";
import { snippets_blankNodeSparqlWherePatterns } from "./_snippets/snippets_blankNodeSparqlWherePatterns.js";
import { snippets_booleanEquals } from "./_snippets/snippets_booleanEquals.js";
import { snippets_booleanSparqlWherePatterns } from "./_snippets/snippets_booleanSparqlWherePatterns.js";
import { snippets_CollectionFilter } from "./_snippets/snippets_CollectionFilter.js";
import { snippets_CollectionSchema } from "./_snippets/snippets_CollectionSchema.js";
import { snippets_ConversionFunction } from "./_snippets/snippets_ConversionFunction.js";
import { snippets_compactRecord } from "./_snippets/snippets_compactRecord.js";
import { snippets_convertToArraySet } from "./_snippets/snippets_convertToArraySet.js";
import { snippets_convertToBlankNode } from "./_snippets/snippets_convertToBlankNode.js";
import { snippets_convertToBlankNodeIdentifierProperty } from "./_snippets/snippets_convertToBlankNodeIdentifierProperty.js";
import { snippets_convertToIdentifier } from "./_snippets/snippets_convertToIdentifier.js";
import { snippets_convertToIdentifierProperty } from "./_snippets/snippets_convertToIdentifierProperty.js";
import { snippets_convertToIri } from "./_snippets/snippets_convertToIri.js";
import { snippets_convertToIriIdentifierProperty } from "./_snippets/snippets_convertToIriIdentifierProperty.js";
import { snippets_convertToLazy } from "./_snippets/snippets_convertToLazy.js";
import { snippets_convertToLazyOption } from "./_snippets/snippets_convertToLazyOption.js";
import { snippets_convertToLazySet } from "./_snippets/snippets_convertToLazySet.js";
import { snippets_convertToList } from "./_snippets/snippets_convertToList.js";
import { snippets_convertToLiteral } from "./_snippets/snippets_convertToLiteral.js";
import { snippets_convertToMaybe } from "./_snippets/snippets_convertToMaybe.js";
import { snippets_convertToScalarSet } from "./_snippets/snippets_convertToScalarSet.js";
import { snippets_convertWithDefaultValue } from "./_snippets/snippets_convertWithDefaultValue.js";
import { snippets_DateFilter } from "./_snippets/snippets_DateFilter.js";
import { snippets_DateSchema } from "./_snippets/snippets_DateSchema.js";
import { snippets_DefaultValueSchema } from "./_snippets/snippets_DefaultValueSchema.js";
import { snippets_dateEquals } from "./_snippets/snippets_dateEquals.js";
import { snippets_dateSparqlWherePatterns } from "./_snippets/snippets_dateSparqlWherePatterns.js";
import { snippets_decodeBigDecimalLiteral } from "./_snippets/snippets_decodeBigDecimalLiteral.js";
import { snippets_deduplicateSparqlPatterns } from "./_snippets/snippets_deduplicateSparqlPatterns.js";
import { snippets_defaultValueFromRdfResourceValues } from "./_snippets/snippets_defaultValueFromRdfResourceValues.js";
import { snippets_defaultValueSparqlWherePatterns } from "./_snippets/snippets_defaultValueSparqlWherePatterns.js";
import { snippets_EqualsResult } from "./_snippets/snippets_EqualsResult.js";
import { snippets_ensureRdfResourceType } from "./_snippets/snippets_ensureRdfResourceType.js";
import { snippets_FocusSparqlConstructTriplesFunction } from "./_snippets/snippets_FocusSparqlConstructTriplesFunction.js";
import { snippets_FocusSparqlWherePatternsFunction } from "./_snippets/snippets_FocusSparqlWherePatternsFunction.js";
import { snippets_FromRdfResourceFunction } from "./_snippets/snippets_FromRdfResourceFunction.js";
import { snippets_FromRdfResourceValuesFunction } from "./_snippets/snippets_FromRdfResourceValuesFunction.js";
import { snippets_filterArray } from "./_snippets/snippets_filterArray.js";
import { snippets_filterBigDecimal } from "./_snippets/snippets_filterBigDecimal.js";
import { snippets_filterBlankNode } from "./_snippets/snippets_filterBlankNode.js";
import { snippets_filterBoolean } from "./_snippets/snippets_filterBoolean.js";
import { snippets_filterDate } from "./_snippets/snippets_filterDate.js";
import { snippets_filterIdentifier } from "./_snippets/snippets_filterIdentifier.js";
import { snippets_filterIri } from "./_snippets/snippets_filterIri.js";
import { snippets_filterLiteral } from "./_snippets/snippets_filterLiteral.js";
import { snippets_filterMaybe } from "./_snippets/snippets_filterMaybe.js";
import { snippets_filterNumeric } from "./_snippets/snippets_filterNumeric.js";
import { snippets_filterString } from "./_snippets/snippets_filterString.js";
import { snippets_filterTerm } from "./_snippets/snippets_filterTerm.js";
import { snippets_Hasher } from "./_snippets/snippets_Hasher.js";
import { snippets_HashFunction } from "./_snippets/snippets_HashFunction.js";
import { snippets_hashArray } from "./_snippets/snippets_hashArray.js";
import { snippets_hashBigDecimal } from "./_snippets/snippets_hashBigDecimal.js";
import { snippets_hashBoolean } from "./_snippets/snippets_hashBoolean.js";
import { snippets_hashDate } from "./_snippets/snippets_hashDate.js";
import { snippets_hashDateTime } from "./_snippets/snippets_hashDateTime.js";
import { snippets_hashMaybe } from "./_snippets/snippets_hashMaybe.js";
import { snippets_hashNumeric } from "./_snippets/snippets_hashNumeric.js";
import { snippets_hashString } from "./_snippets/snippets_hashString.js";
import { snippets_hashTerm } from "./_snippets/snippets_hashTerm.js";
import { snippets_IdentifierFilter } from "./_snippets/snippets_IdentifierFilter.js";
import { snippets_IdentifierSchema } from "./_snippets/snippets_IdentifierSchema.js";
import { snippets_IdentifierSet } from "./_snippets/snippets_IdentifierSet.js";
import { snippets_IriFilter } from "./_snippets/snippets_IriFilter.js";
import { snippets_IriSchema } from "./_snippets/snippets_IriSchema.js";
import { snippets_identifierSparqlWherePatterns } from "./_snippets/snippets_identifierSparqlWherePatterns.js";
import { snippets_identityConversionFunction } from "./_snippets/snippets_identityConversionFunction.js";
import { snippets_identityValidationFunction } from "./_snippets/snippets_identityValidationFunction.js";
import { snippets_iriSparqlWherePatterns } from "./_snippets/snippets_iriSparqlWherePatterns.js";
import { snippets_Lazy } from "./_snippets/snippets_Lazy.js";
import { snippets_LazyOption } from "./_snippets/snippets_LazyOption.js";
import { snippets_LazySet } from "./_snippets/snippets_LazySet.js";
import { snippets_LiteralFilter } from "./_snippets/snippets_LiteralFilter.js";
import { snippets_LiteralSchema } from "./_snippets/snippets_LiteralSchema.js";
import { snippets_liftSparqlPatterns } from "./_snippets/snippets_liftSparqlPatterns.js";
import { snippets_listFromRdfResourceValues } from "./_snippets/snippets_listFromRdfResourceValues.js";
import { snippets_listSparqlConstructTriples } from "./_snippets/snippets_listSparqlConstructTriples.js";
import { snippets_listSparqlWherePatterns } from "./_snippets/snippets_listSparqlWherePatterns.js";
import { snippets_literalFactory } from "./_snippets/snippets_literalFactory.js";
import { snippets_literalSchemaSparqlPatterns } from "./_snippets/snippets_literalSchemaSparqlPatterns.js";
import { snippets_literalSparqlWherePatterns } from "./_snippets/snippets_literalSparqlWherePatterns.js";
import { snippets_MaybeFilter } from "./_snippets/snippets_MaybeFilter.js";
import { snippets_MaybeSchema } from "./_snippets/snippets_MaybeSchema.js";
import { snippets_maybeEquals } from "./_snippets/snippets_maybeEquals.js";
import { snippets_maybeFromRdfResourceValues } from "./_snippets/snippets_maybeFromRdfResourceValues.js";
import { snippets_maybeSparqlConstructTriples } from "./_snippets/snippets_maybeSparqlConstructTriples.js";
import { snippets_maybeSparqlWherePatterns } from "./_snippets/snippets_maybeSparqlWherePatterns.js";
import { snippets_monkeyPatchObject } from "./_snippets/snippets_monkeyPatchObject.js";
import { snippets_NumericFilter } from "./_snippets/snippets_NumericFilter.js";
import { snippets_NumericSchema } from "./_snippets/snippets_NumericSchema.js";
import { snippets_normalizeSparqlWherePatterns } from "./_snippets/snippets_normalizeSparqlWherePatterns.js";
import { snippets_numericSparqlWherePatterns } from "./_snippets/snippets_numericSparqlWherePatterns.js";
import { snippets_PropertyPath } from "./_snippets/snippets_PropertyPath.js";
import { snippets_parseBlankNode } from "./_snippets/snippets_parseBlankNode.js";
import { snippets_parseIdentifier } from "./_snippets/snippets_parseIdentifier.js";
import { snippets_parseIri } from "./_snippets/snippets_parseIri.js";
import { snippets_RdfVocabularies } from "./_snippets/snippets_RdfVocabularies.js";
import { snippets_ShaclPropertySchema } from "./_snippets/snippets_ShaclPropertySchema.js";
import { snippets_SparqlFilterPattern } from "./_snippets/snippets_SparqlFilterPattern.js";
import { snippets_SparqlPattern } from "./_snippets/snippets_SparqlPattern.js";
import { snippets_SparqlPattern_isSolutionGenerating } from "./_snippets/snippets_SparqlPattern_isSolutionGenerating.js";
import { snippets_StringFilter } from "./_snippets/snippets_StringFilter.js";
import { snippets_StringSchema } from "./_snippets/snippets_StringSchema.js";
import { snippets_sequenceRecord } from "./_snippets/snippets_sequenceRecord.js";
import { snippets_setFromRdfResourceValues } from "./_snippets/snippets_setFromRdfResourceValues.js";
import { snippets_setSparqlConstructTriples } from "./_snippets/snippets_setSparqlConstructTriples.js";
import { snippets_setSparqlWherePatterns } from "./_snippets/snippets_setSparqlWherePatterns.js";
import { snippets_shaclPropertyFromRdf } from "./_snippets/snippets_shaclPropertyFromRdf.js";
import { snippets_shaclPropertySparqlConstructTriples } from "./_snippets/snippets_shaclPropertySparqlConstructTriples.js";
import { snippets_shaclPropertySparqlWherePatterns } from "./_snippets/snippets_shaclPropertySparqlWherePatterns.js";
import { snippets_sortSparqlPatterns } from "./_snippets/snippets_sortSparqlPatterns.js";
import { snippets_sparqlInstancesOfPattern } from "./_snippets/snippets_sparqlInstancesOfPattern.js";
import { snippets_sparqlPropertyPath } from "./_snippets/snippets_sparqlPropertyPath.js";
import { snippets_sparqlValueInPattern } from "./_snippets/snippets_sparqlValueInPattern.js";
import { snippets_strictEquals } from "./_snippets/snippets_strictEquals.js";
import { snippets_stringFromRdfResourceValues } from "./_snippets/snippets_stringFromRdfResourceValues.js";
import { snippets_stringSparqlWherePatterns } from "./_snippets/snippets_stringSparqlWherePatterns.js";
import { snippets_TermFilter } from "./_snippets/snippets_TermFilter.js";
import { snippets_TermSchema } from "./_snippets/snippets_TermSchema.js";
import { snippets_ToRdfResourceFunction } from "./_snippets/snippets_ToRdfResourceFunction.js";
import { snippets_ToRdfResourceValuesFunction } from "./_snippets/snippets_ToRdfResourceValuesFunction.js";
import { snippets_termFilterSparqlPatterns } from "./_snippets/snippets_termFilterSparqlPatterns.js";
import { snippets_termLikeFromRdfResourceValues } from "./_snippets/snippets_termLikeFromRdfResourceValues.js";
import { snippets_termSchemaSparqlPatterns } from "./_snippets/snippets_termSchemaSparqlPatterns.js";
import { snippets_termSparqlWherePatterns } from "./_snippets/snippets_termSparqlWherePatterns.js";
import { snippets_toIsoDateString } from "./_snippets/snippets_toIsoDateString.js";
import { snippets_UnwrapR } from "./_snippets/snippets_UnwrapR.js";
import { snippets_ValidationFunction } from "./_snippets/snippets_ValidationFunction.js";
import { snippets_ValueSparqlConstructTriplesFunction } from "./_snippets/snippets_ValueSparqlConstructTriplesFunction.js";
import { snippets_ValueSparqlWherePatternsFunction } from "./_snippets/snippets_ValueSparqlWherePatternsFunction.js";
import { snippets_validateArray } from "./_snippets/snippets_validateArray.js";
import { snippets_validateMaybe } from "./_snippets/snippets_validateMaybe.js";
import { snippets_wrap_FromRdfResourceFunction } from "./_snippets/snippets_wrap_FromRdfResourceFunction.js";
import { snippets_wrap_ToRdfResourceFunction } from "./_snippets/snippets_wrap_ToRdfResourceFunction.js";
import type { Imports } from "./Imports.js";
import { rdfjsTermExpression } from "./rdfjsTermExpression.js";
import type { Snippet } from "./Snippet.js";
import type { SnippetFactory } from "./SnippetFactory.js";
import type { TsGenerator } from "./TsGenerator.js";
import { type Code, code } from "./ts-poet-wrapper.js";

export class Snippets {
  private readonly configuration: TsGenerator.Configuration;
  private readonly imports: Imports;
  private readonly logger: Logger;

  constructor({
    configuration,
    imports,
    logger,
  }: {
    configuration: TsGenerator.Configuration;
    imports: Imports;
    logger: Logger;
  }) {
    this.configuration = configuration;
    this.imports = imports;
    this.logger = logger;
  }

  @Memoize()
  get BlankNodeFilter(): Snippet {
    return this.snippet(snippets_BlankNodeFilter);
  }

  @Memoize()
  get BlankNodeSchema(): Snippet {
    return this.snippet(snippets_BlankNodeSchema);
  }

  @Memoize()
  get BooleanFilter(): Snippet {
    return this.snippet(snippets_BooleanFilter);
  }

  @Memoize()
  get BooleanSchema(): Snippet {
    return this.snippet(snippets_BooleanSchema);
  }

  @Memoize()
  get CollectionFilter(): Snippet {
    return this.snippet(snippets_CollectionFilter);
  }

  @Memoize()
  get CollectionSchema(): Snippet {
    return this.snippet(snippets_CollectionSchema);
  }

  @Memoize()
  get ConversionFunction(): Snippet {
    return this.snippet(snippets_ConversionFunction);
  }

  @Memoize()
  get DateFilter(): Snippet {
    return this.snippet(snippets_DateFilter);
  }

  @Memoize()
  get DateSchema(): Snippet {
    return this.snippet(snippets_DateSchema);
  }

  @Memoize()
  get DefaultValueSchema(): Snippet {
    return this.snippet(snippets_DefaultValueSchema);
  }

  @Memoize()
  get EqualsResult(): Snippet {
    return this.snippet(snippets_EqualsResult);
  }

  @Memoize()
  get FocusSparqlConstructTriplesFunction(): Snippet {
    return this.snippet(snippets_FocusSparqlConstructTriplesFunction);
  }

  @Memoize()
  get FocusSparqlWherePatternsFunction(): Snippet {
    return this.snippet(snippets_FocusSparqlWherePatternsFunction);
  }

  @Memoize()
  get FromRdfResourceFunction(): Snippet {
    return this.snippet(snippets_FromRdfResourceFunction);
  }

  @Memoize()
  get FromRdfResourceValuesFunction(): Snippet {
    return this.snippet(snippets_FromRdfResourceValuesFunction);
  }

  @Memoize()
  get HashFunction(): Snippet {
    return this.snippet(snippets_HashFunction);
  }

  @Memoize()
  get Hasher(): Snippet {
    return this.snippet(snippets_Hasher);
  }

  @Memoize()
  get IdentifierFilter(): Snippet {
    return this.snippet(snippets_IdentifierFilter);
  }

  @Memoize()
  get IdentifierSchema(): Snippet {
    return this.snippet(snippets_IdentifierSchema);
  }

  @Memoize()
  get IdentifierSet(): Snippet {
    return this.snippet(snippets_IdentifierSet);
  }

  @Memoize()
  get IriFilter(): Snippet {
    return this.snippet(snippets_IriFilter);
  }

  @Memoize()
  get IriSchema(): Snippet {
    return this.snippet(snippets_IriSchema);
  }

  @Memoize()
  get Lazy(): Snippet {
    return this.snippet(snippets_Lazy);
  }

  @Memoize()
  get LazyOption(): Snippet {
    return this.snippet(snippets_LazyOption);
  }

  @Memoize()
  get LazySet(): Snippet {
    return this.snippet(snippets_LazySet);
  }

  @Memoize()
  get LiteralFilter(): Snippet {
    return this.snippet(snippets_LiteralFilter);
  }

  @Memoize()
  get LiteralSchema(): Snippet {
    return this.snippet(snippets_LiteralSchema);
  }

  @Memoize()
  get MaybeFilter(): Snippet {
    return this.snippet(snippets_MaybeFilter);
  }

  @Memoize()
  get MaybeSchema(): Snippet {
    return this.snippet(snippets_MaybeSchema);
  }

  @Memoize()
  get NumericFilter(): Snippet {
    return this.snippet(snippets_NumericFilter);
  }

  @Memoize()
  get NumericSchema(): Snippet {
    return this.snippet(snippets_NumericSchema);
  }

  @Memoize()
  get PropertyPath(): Snippet {
    return this.snippet(snippets_PropertyPath);
  }

  @Memoize()
  get RdfVocabularies(): Snippet {
    return this.snippet(snippets_RdfVocabularies);
  }

  @Memoize()
  get ShaclPropertySchema(): Snippet {
    return this.snippet(snippets_ShaclPropertySchema);
  }

  @Memoize()
  get SparqlFilterPattern(): Snippet {
    return this.snippet(snippets_SparqlFilterPattern);
  }

  @Memoize()
  get SparqlPattern(): Snippet {
    return this.snippet(snippets_SparqlPattern);
  }

  @Memoize()
  get SparqlPattern_isSolutionGenerating(): Snippet {
    return this.snippet(snippets_SparqlPattern_isSolutionGenerating);
  }

  @Memoize()
  get StringFilter(): Snippet {
    return this.snippet(snippets_StringFilter);
  }

  @Memoize()
  get StringSchema(): Snippet {
    return this.snippet(snippets_StringSchema);
  }

  @Memoize()
  get TermFilter(): Snippet {
    return this.snippet(snippets_TermFilter);
  }

  @Memoize()
  get TermSchema(): Snippet {
    return this.snippet(snippets_TermSchema);
  }

  @Memoize()
  get ToRdfResourceFunction(): Snippet {
    return this.snippet(snippets_ToRdfResourceFunction);
  }

  @Memoize()
  get ToRdfResourceValuesFunction(): Snippet {
    return this.snippet(snippets_ToRdfResourceValuesFunction);
  }

  @Memoize()
  get UnwrapR(): Snippet {
    return this.snippet(snippets_UnwrapR);
  }

  @Memoize()
  get ValidationFunction(): Snippet {
    return this.snippet(snippets_ValidationFunction);
  }

  @Memoize()
  get ValueSparqlConstructTriplesFunction(): Snippet {
    return this.snippet(snippets_ValueSparqlConstructTriplesFunction);
  }

  @Memoize()
  get ValueSparqlWherePatternsFunction(): Snippet {
    return this.snippet(snippets_ValueSparqlWherePatternsFunction);
  }

  @Memoize()
  get _FromRdfResourceFunction(): Snippet {
    return this.snippet(snippets__FromRdfResourceFunction);
  }

  @Memoize()
  get _ToRdfResourceFunction(): Snippet {
    return this.snippet(snippets__ToRdfResourceFunction);
  }

  @Memoize()
  get arrayEquals(): Snippet {
    return this.snippet(snippets_arrayEquals);
  }

  @Memoize()
  get arrayIntersection(): Snippet {
    return this.snippet(snippets_arrayIntersection);
  }

  @Memoize()
  get bigDecimalLiteral(): Snippet {
    return this.snippet(snippets_bigDecimalLiteral);
  }

  @Memoize()
  get bigDecimalSparqlWherePatterns(): Snippet {
    return this.snippet(snippets_bigDecimalSparqlWherePatterns);
  }

  @Memoize()
  get blankNodeSparqlWherePatterns(): Snippet {
    return this.snippet(snippets_blankNodeSparqlWherePatterns);
  }

  @Memoize()
  get booleanEquals(): Snippet {
    return this.snippet(snippets_booleanEquals);
  }

  @Memoize()
  get booleanSparqlWherePatterns(): Snippet {
    return this.snippet(snippets_booleanSparqlWherePatterns);
  }

  @Memoize()
  get compactRecord(): Snippet {
    return this.snippet(snippets_compactRecord);
  }

  @Memoize()
  get convertToArraySet(): Snippet {
    return this.snippet(snippets_convertToArraySet);
  }

  @Memoize()
  get convertToBlankNode(): Snippet {
    return this.snippet(snippets_convertToBlankNode);
  }

  @Memoize()
  get convertToBlankNodeIdentifierProperty(): Snippet {
    return this.snippet(snippets_convertToBlankNodeIdentifierProperty);
  }

  @Memoize()
  get convertToIdentifier(): Snippet {
    return this.snippet(snippets_convertToIdentifier);
  }

  @Memoize()
  get convertToIdentifierProperty(): Snippet {
    return this.snippet(snippets_convertToIdentifierProperty);
  }

  @Memoize()
  get convertToIri(): Snippet {
    return this.snippet(snippets_convertToIri);
  }

  @Memoize()
  get convertToIriIdentifierProperty(): Snippet {
    return this.snippet(snippets_convertToIriIdentifierProperty);
  }

  @Memoize()
  get convertToLazy(): Snippet {
    return this.snippet(snippets_convertToLazy);
  }

  @Memoize()
  get convertToLazyOption(): Snippet {
    return this.snippet(snippets_convertToLazyOption);
  }

  @Memoize()
  get convertToLazySet(): Snippet {
    return this.snippet(snippets_convertToLazySet);
  }

  @Memoize()
  get convertToList(): Snippet {
    return this.snippet(snippets_convertToList);
  }

  @Memoize()
  get convertToLiteral(): Snippet {
    return this.snippet(snippets_convertToLiteral);
  }

  @Memoize()
  get convertToMaybe(): Snippet {
    return this.snippet(snippets_convertToMaybe);
  }

  @Memoize()
  get convertToScalarSet(): Snippet {
    return this.snippet(snippets_convertToScalarSet);
  }

  @Memoize()
  get convertWithDefaultValue(): Snippet {
    return this.snippet(snippets_convertWithDefaultValue);
  }

  @Memoize()
  get dateEquals(): Snippet {
    return this.snippet(snippets_dateEquals);
  }

  @Memoize()
  get dateSparqlWherePatterns(): Snippet {
    return this.snippet(snippets_dateSparqlWherePatterns);
  }

  @Memoize()
  get decodeBigDecimalLiteral(): Snippet {
    return this.snippet(snippets_decodeBigDecimalLiteral);
  }

  @Memoize()
  get deduplicateSparqlPatterns(): Snippet {
    return this.snippet(snippets_deduplicateSparqlPatterns);
  }

  @Memoize()
  get defaultValueFromRdfResourceValues(): Snippet {
    return this.snippet(snippets_defaultValueFromRdfResourceValues);
  }

  @Memoize()
  get defaultValueSparqlWherePatterns(): Snippet {
    return this.snippet(snippets_defaultValueSparqlWherePatterns);
  }

  @Memoize()
  get ensureRdfResourceType(): Snippet {
    return this.snippet(snippets_ensureRdfResourceType);
  }

  @Memoize()
  get filterArray(): Snippet {
    return this.snippet(snippets_filterArray);
  }

  @Memoize()
  get filterBigDecimal(): Snippet {
    return this.snippet(snippets_filterBigDecimal);
  }

  @Memoize()
  get filterBlankNode(): Snippet {
    return this.snippet(snippets_filterBlankNode);
  }

  @Memoize()
  get filterBoolean(): Snippet {
    return this.snippet(snippets_filterBoolean);
  }

  @Memoize()
  get filterDate(): Snippet {
    return this.snippet(snippets_filterDate);
  }

  @Memoize()
  get filterIdentifier(): Snippet {
    return this.snippet(snippets_filterIdentifier);
  }

  @Memoize()
  get filterIri(): Snippet {
    return this.snippet(snippets_filterIri);
  }

  @Memoize()
  get filterLiteral(): Snippet {
    return this.snippet(snippets_filterLiteral);
  }

  @Memoize()
  get filterMaybe(): Snippet {
    return this.snippet(snippets_filterMaybe);
  }

  @Memoize()
  get filterNumeric(): Snippet {
    return this.snippet(snippets_filterNumeric);
  }

  @Memoize()
  get filterString(): Snippet {
    return this.snippet(snippets_filterString);
  }

  @Memoize()
  get filterTerm(): Snippet {
    return this.snippet(snippets_filterTerm);
  }

  @Memoize()
  get hashArray(): Snippet {
    return this.snippet(snippets_hashArray);
  }

  @Memoize()
  get hashBigDecimal(): Snippet {
    return this.snippet(snippets_hashBigDecimal);
  }

  @Memoize()
  get hashBoolean(): Snippet {
    return this.snippet(snippets_hashBoolean);
  }

  @Memoize()
  get hashDate(): Snippet {
    return this.snippet(snippets_hashDate);
  }

  @Memoize()
  get hashDateTime(): Snippet {
    return this.snippet(snippets_hashDateTime);
  }

  @Memoize()
  get hashMaybe(): Snippet {
    return this.snippet(snippets_hashMaybe);
  }

  @Memoize()
  get hashNumeric(): Snippet {
    return this.snippet(snippets_hashNumeric);
  }

  @Memoize()
  get hashString(): Snippet {
    return this.snippet(snippets_hashString);
  }

  @Memoize()
  get hashTerm(): Snippet {
    return this.snippet(snippets_hashTerm);
  }

  @Memoize()
  get identifierSparqlWherePatterns(): Snippet {
    return this.snippet(snippets_identifierSparqlWherePatterns);
  }

  @Memoize()
  get identityConversionFunction(): Snippet {
    return this.snippet(snippets_identityConversionFunction);
  }

  @Memoize()
  get identityValidationFunction(): Snippet {
    return this.snippet(snippets_identityValidationFunction);
  }

  get ifUsed(): Code[] {
    return Object.entries(
      Object.getOwnPropertyDescriptors(Object.getPrototypeOf(this)),
    )
      .flatMap(([key, descriptor]) => {
        if (typeof descriptor.get !== "function") {
          return [];
        }
        switch (key) {
          case "ifUsed":
          case "snippets":
            return [];
        }
        const value = (this as any)[key];
        invariant(value, key);
        invariant((value as any).usageSiteName, key);
        return [value];
      })
      .sort((left, right) =>
        left.usageSiteName.localeCompare(right.usageSiteName),
      )
      .map((snippet) => code`${snippet.ifUsed}`);
  }

  @Memoize()
  get iriSparqlWherePatterns(): Snippet {
    return this.snippet(snippets_iriSparqlWherePatterns);
  }

  @Memoize()
  get liftSparqlPatterns(): Snippet {
    return this.snippet(snippets_liftSparqlPatterns);
  }

  @Memoize()
  get listFromRdfResourceValues(): Snippet {
    return this.snippet(snippets_listFromRdfResourceValues);
  }

  @Memoize()
  get listSparqlConstructTriples(): Snippet {
    return this.snippet(snippets_listSparqlConstructTriples);
  }

  @Memoize()
  get listSparqlWherePatterns(): Snippet {
    return this.snippet(snippets_listSparqlWherePatterns);
  }

  @Memoize()
  get literalFactory(): Snippet {
    return this.snippet(snippets_literalFactory);
  }

  @Memoize()
  get literalSchemaSparqlPatterns(): Snippet {
    return this.snippet(snippets_literalSchemaSparqlPatterns);
  }

  @Memoize()
  get literalSparqlWherePatterns(): Snippet {
    return this.snippet(snippets_literalSparqlWherePatterns);
  }

  @Memoize()
  get maybeEquals(): Snippet {
    return this.snippet(snippets_maybeEquals);
  }

  @Memoize()
  get maybeFromRdfResourceValues(): Snippet {
    return this.snippet(snippets_maybeFromRdfResourceValues);
  }

  @Memoize()
  get maybeSparqlConstructTriples(): Snippet {
    return this.snippet(snippets_maybeSparqlConstructTriples);
  }

  @Memoize()
  get maybeSparqlWherePatterns(): Snippet {
    return this.snippet(snippets_maybeSparqlWherePatterns);
  }

  @Memoize()
  get monkeyPatchObject(): Snippet {
    return this.snippet(snippets_monkeyPatchObject);
  }

  @Memoize()
  get normalizeSparqlWherePatterns(): Snippet {
    return this.snippet(snippets_normalizeSparqlWherePatterns);
  }

  @Memoize()
  get numericSparqlWherePatterns(): Snippet {
    return this.snippet(snippets_numericSparqlWherePatterns);
  }

  @Memoize()
  get parseBlankNode(): Snippet {
    return this.snippet(snippets_parseBlankNode);
  }

  @Memoize()
  get parseIdentifier(): Snippet {
    return this.snippet(snippets_parseIdentifier);
  }

  @Memoize()
  get parseIri(): Snippet {
    return this.snippet(snippets_parseIri);
  }

  @Memoize()
  get sequenceRecord(): Snippet {
    return this.snippet(snippets_sequenceRecord);
  }

  @Memoize()
  get setFromRdfResourceValues(): Snippet {
    return this.snippet(snippets_setFromRdfResourceValues);
  }

  @Memoize()
  get setSparqlConstructTriples(): Snippet {
    return this.snippet(snippets_setSparqlConstructTriples);
  }

  @Memoize()
  get setSparqlWherePatterns(): Snippet {
    return this.snippet(snippets_setSparqlWherePatterns);
  }

  @Memoize()
  get shaclPropertyFromRdf(): Snippet {
    return this.snippet(snippets_shaclPropertyFromRdf);
  }

  @Memoize()
  get shaclPropertySparqlConstructTriples(): Snippet {
    return this.snippet(snippets_shaclPropertySparqlConstructTriples);
  }

  @Memoize()
  get shaclPropertySparqlWherePatterns(): Snippet {
    return this.snippet(snippets_shaclPropertySparqlWherePatterns);
  }

  @Memoize()
  get sortSparqlPatterns(): Snippet {
    return this.snippet(snippets_sortSparqlPatterns);
  }

  @Memoize()
  get sparqlInstancesOfPattern(): Snippet {
    return this.snippet(snippets_sparqlInstancesOfPattern);
  }

  @Memoize()
  get sparqlPropertyPath(): Snippet {
    return this.snippet(snippets_sparqlPropertyPath);
  }

  @Memoize()
  get sparqlValueInPattern(): Snippet {
    return this.snippet(snippets_sparqlValueInPattern);
  }

  @Memoize()
  get strictEquals(): Snippet {
    return this.snippet(snippets_strictEquals);
  }

  @Memoize()
  get stringFromRdfResourceValues(): Snippet {
    return this.snippet(snippets_stringFromRdfResourceValues);
  }

  @Memoize()
  get stringSparqlWherePatterns(): Snippet {
    return this.snippet(snippets_stringSparqlWherePatterns);
  }

  @Memoize()
  get termFilterSparqlPatterns(): Snippet {
    return this.snippet(snippets_termFilterSparqlPatterns);
  }

  @Memoize()
  get termLikeFromRdfResourceValues(): Snippet {
    return this.snippet(snippets_termLikeFromRdfResourceValues);
  }

  @Memoize()
  get termSchemaSparqlPatterns(): Snippet {
    return this.snippet(snippets_termSchemaSparqlPatterns);
  }

  @Memoize()
  get termSparqlWherePatterns(): Snippet {
    return this.snippet(snippets_termSparqlWherePatterns);
  }

  @Memoize()
  get toIsoDateString(): Snippet {
    return this.snippet(snippets_toIsoDateString);
  }

  @Memoize()
  get validateArray(): Snippet {
    return this.snippet(snippets_validateArray);
  }

  @Memoize()
  get validateMaybe(): Snippet {
    return this.snippet(snippets_validateMaybe);
  }

  @Memoize()
  get wrap_FromRdfResourceFunction(): Snippet {
    return this.snippet(snippets_wrap_FromRdfResourceFunction);
  }

  @Memoize()
  get wrap_ToRdfResourceFunction(): Snippet {
    return this.snippet(snippets_wrap_ToRdfResourceFunction);
  }

  protected get snippets(): Snippets {
    return this;
  }

  private snippet(snippetFactory: SnippetFactory): Snippet {
    return snippetFactory({
      configuration: this.configuration,
      imports: this.imports,
      logger: this.logger,
      rdfjsTermExpression: rdfjsTermExpression.bind({
        imports: this.imports,
        logger: this.logger,
        snippets: this,
      }),
      snippets: this,
      syntheticNamePrefix: this.configuration.syntheticNamePrefix,
    });
  }
}
