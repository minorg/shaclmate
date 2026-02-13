import { type Code, code } from "ts-poet";
import type { ObjectType } from "./ObjectType.js";
import { objectSetMethodSignatures } from "./objectSetMethodSignatures.js";
import { sharedImports } from "./sharedImports.js";

function unsupportedObjectSetMethodDeclaration({
  name,
  parameters,
  returnType,
}: {
  readonly name: string;
  readonly parameters: Code;
  readonly returnType: Code;
}) {
  return code`\
async ${name}(${parameters}): ${returnType} {
  return ${sharedImports.Left}(new Error("${name}: not supported")) satisfies Awaited<${returnType}>;
}`;
}

export function unsupportedObjectSetMethodDeclarations({
  objectType,
}: {
  objectType: {
    readonly filterType: Code;
    readonly identifierTypeAlias: Code;
    readonly objectSetMethodNames: ObjectType.ObjectSetMethodNames;
    readonly name: string;
  };
}): Readonly<Record<keyof ObjectType.ObjectSetMethodNames, Code>> {
  const methodSignatures = objectSetMethodSignatures({
    objectType,
    parameterNamePrefix: "_",
  });
  return {
    object: unsupportedObjectSetMethodDeclaration(methodSignatures.object),
    objectIdentifiers: unsupportedObjectSetMethodDeclaration(
      methodSignatures.objectIdentifiers,
    ),
    objects: unsupportedObjectSetMethodDeclaration(methodSignatures.objects),
    objectsCount: unsupportedObjectSetMethodDeclaration(
      methodSignatures.objectsCount,
    ),
  };
}
