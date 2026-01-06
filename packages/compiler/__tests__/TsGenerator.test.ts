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
  const diagnostics = emitResult.diagnostics.concat(
    ts.getPreEmitDiagnostics(program),
  );
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
  it("should generate from the kitchen sink shapes graph", () => {
    compile(
      generate(testData.kitchenSink.unsafeCoerce()),
      path.join(
        thisDirectoryPath,
        "..",
        "..",
        "..",
        "examples",
        "kitchen-sink",
        "src",
      ),
    );
  }, 60000);

  testData.skos.ifJust((parameters) => {
    it("should generate from a SKOS shapes graph", () => {
      compile(generate(parameters.unsafeCoerce()));
    });
  });

  testData.externalProject.ifJust((parameters) => {
    it("should generate from an external project shapes graph", () => {
      compile(generate(parameters.unsafeCoerce()));
    });
  });
});
