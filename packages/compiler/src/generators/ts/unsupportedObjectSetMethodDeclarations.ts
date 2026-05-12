import type { NamedObjectType } from "./NamedObjectType.js";
import { objectSetMethodSignatures } from "./objectSetMethodSignatures.js";
import type { TsGenerator } from "./TsGenerator.js";
import { type Code, code } from "./ts-poet-wrapper.js";

function unsupportedObjectSetMethodDeclaration(
  this: TsGenerator,
  {
    name,
    parameters,
    returnType,
  }: {
    readonly name: string;
    readonly parameters: Code;
    readonly returnType: Code;
  },
) {
  return code`\
async ${name}(${parameters}): ${returnType} {
  return ${this.reusables.imports.Left}(new Error("${name}: not supported")) satisfies Awaited<${returnType}>;
}`;
}

export function unsupportedObjectSetMethodDeclarations(
  this: TsGenerator,
  {
    namedObjectType,
  }: {
    namedObjectType: {
      readonly filterType: Code;
      readonly identifierTypeAlias: Code;
      readonly objectSetMethodNames: NamedObjectType.ObjectSetMethodNames;
      readonly name: string;
    };
  },
): Readonly<Record<keyof NamedObjectType.ObjectSetMethodNames, Code>> {
  const methodSignatures = objectSetMethodSignatures.call(this, {
    namedObjectType,
    parameterNamePrefix: "_",
  });
  return {
    object: unsupportedObjectSetMethodDeclaration.call(
      this,
      methodSignatures.object,
    ),
    objectCount: unsupportedObjectSetMethodDeclaration.call(
      this,
      methodSignatures.objectCount,
    ),
    objectIdentifiers: unsupportedObjectSetMethodDeclaration.call(
      this,
      methodSignatures.objectIdentifiers,
    ),
    objects: unsupportedObjectSetMethodDeclaration.call(
      this,
      methodSignatures.objects,
    ),
  };
}
