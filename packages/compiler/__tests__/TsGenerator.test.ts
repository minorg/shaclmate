import path from "node:path";
import { fileURLToPath } from "node:url";
import type PrefixMap from "@rdfjs/prefix-map/PrefixMap.js";
import {
  type ShapesGraph,
  ShapesGraphToAstTransformer,
  TsGenerator,
} from "@shaclmate/compiler";
import ts from "typescript";
import { describe, expect, it } from "vitest";
import { testData } from "./testData.js";

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

function compile(source: string, sourceDirectoryPath?: string): void {
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
  const diagnostics = emitResult.diagnostics
    .concat(ts.getPreEmitDiagnostics(program))
    .filter(
      (diagnostic) => diagnostic.category !== 1 || diagnostic.code !== 6133,
    ); // Ignore unused code
  expect(diagnostics).toHaveLength(0);
}

function generate(parameters: {
  iriPrefixMap: PrefixMap;
  shapesGraph: ShapesGraph;
}): string {
  const source = new TsGenerator().generate(
    new ShapesGraphToAstTransformer(parameters).transform().unsafeCoerce(),
  );
  expect(source).not.toHaveLength(0);
  return source;
}

describe("TsGenerator", () => {
  for (const [id, shapesGraphEither] of Object.entries(testData.wellFormed)) {
    if (shapesGraphEither === null) {
      continue;
    }

    it(id, () => {
      let sourceDirectoryPath: string | undefined;
      switch (id) {
        case "compilerInput":
          sourceDirectoryPath = path.join(
            thisDirectoryPath,
            "..",
            "src",
            "input",
          );
          break;
        case "kitchenSink":
          sourceDirectoryPath = path.join(
            thisDirectoryPath,
            "..",
            "..",
            "..",
            "examples",
            "kitchen-sink",
            "src",
          );
          break;
        case "shaclAst":
          sourceDirectoryPath = path.join(
            thisDirectoryPath,
            "..",
            "..",
            "shacl-ast",
            "src",
          );
          break;
        case "skos":
          // TODO: re-enable once rdfjs-resource upgrade is complete
          return;
      }

      compile(generate(shapesGraphEither.unsafeCoerce()), sourceDirectoryPath);
    }, 60000);
  }
});
