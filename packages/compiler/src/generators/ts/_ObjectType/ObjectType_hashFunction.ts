import { codeEquals } from "../codeEquals.js";
import type { ObjectType } from "../ObjectType.js";
import { type Code, code, joinCode, literalOf } from "../ts-poet-wrapper.js";

const hasherVariable = code`hasher`;

export function ObjectType_hashFunctionExpression(this: ObjectType): Code {
  return code`(${hasherVariable}, ${this.thisVariable}) => { ${joinCode(
    this.properties.flatMap((property) =>
      property.hashStatements({
        variables: {
          hasher: hasherVariable,
          object: code`${this.thisVariable}`,
        },
      }),
    ),
  )} }`;
}

export function ObjectType_hashFunctionType(this: ObjectType): Code {
  const replacePropertyDeclarations: Record<string, Code> = {};
  for (const property of this.properties) {
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

  let thisTypeExpression = this.expression;
  if (Object.keys(replacePropertyDeclarations).length > 0) {
    thisTypeExpression = code`Omit<${thisTypeExpression}, ${joinCode(
      Object.keys(replacePropertyDeclarations).map(
        (propertyName) => code`${literalOf(propertyName)}`,
      ),
      { on: " | " },
    )}> & { ${joinCode(Object.values(replacePropertyDeclarations))} }`;
  }

  return code`${this.reusables.snippets.HashFunction}<${thisTypeExpression}>`;
}
