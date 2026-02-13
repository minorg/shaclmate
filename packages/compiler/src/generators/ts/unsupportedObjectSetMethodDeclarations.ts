import { type Code, code } from "ts-poet";
import type { ObjectType } from "./ObjectType.js";
import { objectSetMethodSignatures } from "./objectSetMethodSignatures.js";
import { sharedImports } from "./sharedImports.js";

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
  const methodNames = objectType.objectSetMethodNames;
  const methodSignatures = objectSetMethodSignatures({
    objectType,
    parameterNamePrefix: "_",
  });

  return {
    object: code`\
async ${methodSignatures.object} {
  return ${sharedImports.Left}(new Error("${methodNames.object}: not supported"));
}`,
    objectIdentifiers: code`\
async ${methodSignatures.objectIdentifiers} {
  return ${sharedImports.Left}(new Error("${methodNames.objectIdentifiers}: not supported"));
}`,
    objects: code`\
async ${methodSignatures.objects} {
  return ${sharedImports.Left}(new Error("${methodNames.objects}: not supported"));
}`,
    objectsCount: code`\
async ${methodSignatures.objectsCount} {
  return ${sharedImports.Left}(new Error("${methodNames.objectsCount}: not supported"));
}`,
  };
}
