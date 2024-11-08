import { type ClassDeclarationStructure, StructureKind } from "ts-morph";
import type { ObjectType } from "../ObjectType.js";

const ignoreRdfTypeVariable = "ignoreRdfType";
const optionsVariable = "_options";
const subjectVariable = "subject";

export function sparqlGraphPatternsClassDeclaration(
  this: ObjectType,
): ClassDeclarationStructure {
  this.ensureAtMostOneSuperObjectType();

  const constructorStatements: string[] = [];

  if (this.parentObjectTypes.length > 0) {
    constructorStatements.push(
      `super(${subjectVariable}, { ignoreRdfType: true });`,
    );
  } else {
    constructorStatements.push(`super(${subjectVariable});`);
  }

  this.rdfType.ifJust((rdfType) =>
    constructorStatements.push(
      `if (!${optionsVariable}?.${ignoreRdfTypeVariable}) { this.add(...new sparqlBuilder.RdfTypeGraphPatterns(${subjectVariable}, ${this.rdfJsTermExpression(rdfType)})); }`,
    ),
  );

  for (const property of this.properties) {
    property
      .sparqlGraphPatternExpression()
      .ifJust((sparqlGraphPattern) =>
        constructorStatements.push(`this.add(${sparqlGraphPattern})`),
      );
  }

  return {
    ctors: [
      {
        parameters: [
          {
            name: subjectVariable,
            type: "sparqlBuilder.ResourceGraphPatterns.SubjectParameter",
          },
          {
            hasQuestionToken: true,
            name: optionsVariable,
            type: `{ ${ignoreRdfTypeVariable}?: boolean }`,
          },
        ],
        statements: constructorStatements,
      },
    ],
    extends:
      this.parentObjectTypes.length > 0
        ? this.parentObjectTypes[0].sparqlGraphPatternsClassQualifiedName
        : "sparqlBuilder.ResourceGraphPatterns",
    isExported: true,
    kind: StructureKind.Class,
    name: this.sparqlGraphPatternsClassUnqualifiedName,
  };
}
