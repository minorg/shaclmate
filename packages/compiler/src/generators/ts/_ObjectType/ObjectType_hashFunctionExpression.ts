import { codeEquals } from "../codeEquals.js";
import type { ObjectType } from "../ObjectType.js";
import { type Code, code, joinCode, literalOf } from "../ts-poet-wrapper.js";

const hasherVariable = code`hasher`;

export function ObjectType_hashFunctionExpression(this: ObjectType): Code {
  let statements: Code[] = [];
  const replacePropertyDeclarations: Record<string, Code> = {};
  for (const property of this.properties) {
    const propertyHashStatements = property.hashStatements({
      variables: {
        hasher: hasherVariable,
        value: code`${this.thisVariable}.${property.name}`,
      },
    });
    if (propertyHashStatements.length === 0) {
      continue;
    }
    statements = statements.concat(propertyHashStatements);

    const declaration = property.declaration.extract();
    const hashFunctionParameter = property.hashFunctionParameter.extract();
    if (
      declaration &&
      hashFunctionParameter &&
      !codeEquals(hashFunctionParameter, declaration)
    ) {
      replacePropertyDeclarations[property.name] =
        code`${hashFunctionParameter}`;
    }
  }
  statements.push(code`return ${hasherVariable};`);

  let thisTypeExpression = this.expression;
  if (Object.keys(replacePropertyDeclarations).length > 0) {
    thisTypeExpression = code`Omit<${thisTypeExpression}, ${joinCode(
      Object.keys(replacePropertyDeclarations).map(
        (propertyName) => code`${literalOf(propertyName)}`,
      ),
      { on: " | " },
    )}> & { ${joinCode(Object.values(replacePropertyDeclarations))} }`;
  }

  return code`<HasherT extends ${this.reusables.snippets.Hasher}>(${hasherVariable}: HasherT, ${this.thisVariable}: ${thisTypeExpression}): HasherT => { ${joinCode(statements)} }`;
}
