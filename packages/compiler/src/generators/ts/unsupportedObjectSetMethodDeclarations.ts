import { imports } from "./imports.js";
import type { NamedObjectType } from "./NamedObjectType.js";
import { objectSetMethodSignatures } from "./objectSetMethodSignatures.js";
import { type Code, code } from "./ts-poet-wrapper.js";

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
  return ${imports.Left}(new Error("${name}: not supported")) satisfies Awaited<${returnType}>;
}`;
}

export function unsupportedObjectSetMethodDeclarations({
  namedObjectType,
}: {
  namedObjectType: {
    readonly filterType: Code;
    readonly identifierTypeAlias: Code;
    readonly objectSetMethodNames: NamedObjectType.ObjectSetMethodNames;
    readonly name: string;
  };
}): Readonly<Record<keyof NamedObjectType.ObjectSetMethodNames, Code>> {
  const methodSignatures = objectSetMethodSignatures({
    namedObjectType,
    parameterNamePrefix: "_",
  });
  return {
    object: unsupportedObjectSetMethodDeclaration(methodSignatures.object),
    objectCount: unsupportedObjectSetMethodDeclaration(
      methodSignatures.objectCount,
    ),
    objectIdentifiers: unsupportedObjectSetMethodDeclaration(
      methodSignatures.objectIdentifiers,
    ),
    objects: unsupportedObjectSetMethodDeclaration(methodSignatures.objects),
  };
}
