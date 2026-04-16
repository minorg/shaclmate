import path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const compilerOptions: ts.CompilerOptions = {
  // @tsconfig/node18
  // lib: ["ES2022"],
  module: ts.ModuleKind.Node16,
  moduleResolution: ts.ModuleResolutionKind.Node16,
  target: ts.ScriptTarget.ES2022,

  // @tsconfig/strictest
  strict: true,
  allowUnusedLabels: false,
  allowUnreachableCode: false,
  // exactOptionalPropertyTypes: true,
  noFallthroughCasesInSwitch: true,
  noImplicitOverride: true,
  noImplicitReturns: true,
  noPropertyAccessFromIndexSignature: true,
  // noUncheckedIndexedAccess: true,
  noUnusedLocals: true,
  noUnusedParameters: true,
  isolatedModules: true,
  esModuleInterop: true,
  skipLibCheck: true,
};

const thisDirectoryPath = path.dirname(fileURLToPath(import.meta.url));

export function compileTs(source: string, sourceDirectoryPath?: string) {
  const host = ts.createCompilerHost(compilerOptions, true);

  const generatedFilePath = path.join(
    sourceDirectoryPath ?? thisDirectoryPath,
    "generated.ts",
  );
  host.getCurrentDirectory = () => thisDirectoryPath;
  host.getSourceFile = (fileName, languageVersion) => {
    if (fileName === generatedFilePath) {
      return ts.createSourceFile(fileName, source, languageVersion);
    }
    return ts.sys.readFile(fileName)
      ? ts.createSourceFile(
          fileName,
          ts.sys.readFile(fileName)!,
          languageVersion,
        )
      : undefined;
  };

  // Capture output in memory
  const outputs = new Map<string, string>();
  host.writeFile = (fileName, content) => {
    outputs.set(fileName, content);
  };

  const program = ts.createProgram([generatedFilePath], compilerOptions, host);
  const emitResult = program.emit();
  return emitResult.diagnostics
    .concat(ts.getPreEmitDiagnostics(program))
    .filter(
      (diagnostic) => diagnostic.category !== 1 || diagnostic.code !== 6133,
    ); // Ignore unused code
}
