#!/usr/bin/env npm exec tsx --

import fs from "node:fs";
import path from "node:path";
import url from "node:url";
import type { CompilerOptions } from "typescript";

const VERSION = "4.0.15";

const externalDependencies = {
  "@jsonforms/core": "3.5.1",
  "@jsonforms/material-renderers": "3.5.1",
  "@jsonforms/react": "3.5.1",
  "@kos-kit/sparql-client": "2.0.116",
  "@mui/icons-material": "~6.1.0",
  // "@mui/lab": "6.0.0-beta.22",
  "@mui/material": "~6.1.0",
  "@mui/x-date-pickers": "~7.17.0",
  "@rdfjs/data-model": "~2.1.1",
  "@rdfjs/dataset": "~2.0.2",
  "@rdfjs/namespace": "~2.0.1",
  "@rdfjs/prefix-map": "~0.1.2",
  "@rdfjs/serializer-turtle": "~1.1.5",
  "@rdfjs/term-map": "~2.0.2",
  "@rdfjs/term-set": "~2.0.3",
  "@rdfjs/types": "~2.0.1",
  "@sindresorhus/base62": "~0.1.0",
  "@tpluscode/rdf-ns-builders": "~4.3.0",
  "@types/n3": "~1.26.0",
  "@types/rdfjs__data-model": "~2.0.9",
  "@types/rdfjs__dataset": "~2.0.7",
  "@types/rdfjs__namespace": "~2.0.10",
  "@types/rdfjs__prefix-map": "~0.1.5",
  "@types/rdfjs__serializer-turtle": "~1.1.0",
  "@types/rdfjs__term-map": "~2.0.10",
  "@types/rdfjs__term-set": "~2.0.9",
  "@types/react": "~18",
  "@types/react-dom": "~18",
  "@types/sparqljs": "3.1.12",
  "@types/toposort": "2.0.7",
  "@types/uuid": "~9.0.1",
  "@vitejs/plugin-react": "~4.3.4",
  "change-case": "~5.4.4",
  "cmd-ts": "~0.13.0",
  "decimal.js": "~10.6.0",
  graphql: "16.11.0",
  "graphql-scalars": "1.24.2",
  "graphql-yoga": "5.14.0",
  "js-sha256": "~0.11.0",
  n3: "~1.26.0",
  oxigraph: "0.4.11",
  pino: "~9.1.0",
  plur: "~5.1.0",
  "purify-ts": "~2.1.4",
  "rdf-validate-shacl": "0.5.8",
  "rdfjs-resource": "3.0.7",
  "reserved-identifiers": "~1.0.0",
  react: "~18",
  "react-dom": "~18",
  sparqljs: "3.7.3",
  toposort: "2.0.2",
  "ts-poet": "~6.12.0",
  "ts-invariant": "~0.10.3",
  "typescript-memoize": "~1.1.1",
  uuid: "~9.0.1",
  vite: "6.0.7",
  zod: "~4.1.12",
};

type PackageName = "compiler" | "shacl-ast";

interface Tsconfig {
  compilerOptions?: CompilerOptions;
  // exclude?: string[];
  extends?: string | string[];
  // files?: string[];
  include?: string[];
  // references?: { path: string; prepend?: boolean }[];
}

const tsconfigDefault: Tsconfig = {
  compilerOptions: {
    declaration: true,
    declarationMap: true,
    exactOptionalPropertyTypes: false,
    experimentalDecorators: true,
    forceConsistentCasingInFileNames: true,
    noUncheckedIndexedAccess: false,
    outDir: "dist",
    rootDir: "src",
    sourceMap: true,
    types: ["node"],
  },
  extends: [
    "@tsconfig/strictest/tsconfig.json",
    "@tsconfig/node20/tsconfig.json",
  ],
  include: ["src/**/*.ts"],
};

interface Workspace {
  bin?: Record<string, string>;
  dependencies?: {
    external?: readonly (keyof typeof externalDependencies)[];
    internal?: readonly PackageName[];
  };
  description?: string;
  devDependencies?: {
    external?: readonly (keyof typeof externalDependencies)[];
    internal?: readonly PackageName[];
  };
  keywords?: readonly string[];
  homepage?: string;
  scripts?: Record<string, string>;
  tsconfig?: Tsconfig;
}

const workspaces = {
  apps: {
    cli: {
      bin: {
        shaclmate: "dist/cli.js",
      },
      dependencies: {
        external: [
          "@rdfjs/types",
          "@rdfjs/prefix-map",
          "@types/n3",
          "@types/rdfjs__prefix-map",
          "cmd-ts",
          "n3",
          "pino",
          "rdf-validate-shacl",
        ],
        internal: ["compiler"],
      },
      description:
        "Command line program to generate TypeScript code from SHACL shapes",
      homepage: "https://github.com/minorg/shaclmate",
      keywords: ["rdf", "shacl", "typescript"],
    },
  } satisfies Record<string, Workspace>,
  examples: {
    api: {
      devDependencies: {
        external: [
          "@rdfjs/namespace",
          "@tpluscode/rdf-ns-builders",
          "@types/rdfjs__namespace",
        ],
        internal: ["compiler"],
      },
      scripts: {
        compile: "NODE_ENV=development tsx src/compile.ts",
        dump: "NODE_ENV=development tsx src/dump.ts",
      },
      tsconfig: {
        compilerOptions: {
          exactOptionalPropertyTypes: false,
          experimentalDecorators: true,
          forceConsistentCasingInFileNames: true,
          noEmit: true,
          noUncheckedIndexedAccess: false,
          types: ["node"],
        },
        extends: [
          "@tsconfig/strictest/tsconfig.json",
          "@tsconfig/node20/tsconfig.json",
        ],
        include: ["src/**/*.ts"],
      },
    },
    forms: {
      dependencies: {
        external: [
          "@jsonforms/core",
          "@jsonforms/material-renderers",
          "@jsonforms/react",
          "@mui/icons-material",
          // "@mui/lab": "6.0.0-beta.22",
          "@mui/material",
          "@mui/x-date-pickers",
          "react",
          "react-dom",
          "@rdfjs/data-model",
          "@rdfjs/dataset",
          "@rdfjs/types",
          "@types/rdfjs__data-model",
          "@types/rdfjs__dataset",
          "@types/n3",
          "n3",
          "purify-ts",
          "rdfjs-resource",
          "zod",
        ],
      },
      devDependencies: {
        external: [
          "@types/react",
          "@types/react-dom",
          "@vitejs/plugin-react",
          "vite",
        ],
      },
      scripts: {
        build: "tsc && vite build",
        start: "vite dev --port 3000",
      },
      tsconfig: {
        compilerOptions: {
          tsBuildInfoFile: "./node_modules/.tmp/tsconfig.tsbuildinfo",
          target: "es2020",
          exactOptionalPropertyTypes: false,
          useDefineForClassFields: true,
          noUncheckedIndexedAccess: false,
          lib: ["ES2020", "DOM", "DOM.Iterable"],
          module: "esnext",
          skipLibCheck: true,

          moduleResolution: "bundler",
          allowImportingTsExtensions: true,
          isolatedModules: true,
          moduleDetection: "force",
          noEmit: true,
          jsx: "react-jsx",
        },
        extends: ["@tsconfig/strictest/tsconfig.json"],
        include: ["src"],
      },
    },

    graphql: {
      dependencies: {
        external: [
          "@rdfjs/data-model",
          "@rdfjs/dataset",
          "@rdfjs/types",
          "graphql",
          "graphql-yoga",
          "purify-ts",
          "rdfjs-resource",
        ],
      },
      devDependencies: {
        external: ["@types/rdfjs__data-model", "@types/rdfjs__dataset"],
      },
      scripts: {
        start: "NODE_ENV=development tsx src/server.ts",
      },
      tsconfig: {
        compilerOptions: {
          exactOptionalPropertyTypes: false,
          experimentalDecorators: true,
          forceConsistentCasingInFileNames: true,
          noEmit: true,
          noUncheckedIndexedAccess: false,
          types: ["node"],
        },
        extends: [
          "@tsconfig/strictest/tsconfig.json",
          "@tsconfig/node20/tsconfig.json",
        ],
        include: ["src/**/*.ts"],
      },
    },

    "kitchen-sink": {
      dependencies: {
        external: [
          "@rdfjs/data-model",
          "@rdfjs/dataset",
          "@rdfjs/types",
          "decimal.js",
          "js-sha256",
          "purify-ts",
          "rdfjs-resource",
          "sparqljs",
          "uuid",
          "zod",
        ],
      },
      devDependencies: {
        external: [
          "@kos-kit/sparql-client",
          "@rdfjs/prefix-map",
          "@rdfjs/serializer-turtle",
          "@tpluscode/rdf-ns-builders",
          "@types/n3",
          "@types/rdfjs__data-model",
          "@types/rdfjs__dataset",
          "@types/rdfjs__prefix-map",
          "@types/rdfjs__serializer-turtle",
          "@types/sparqljs",
          "@types/uuid",
          "n3",
          "oxigraph",
          "rdf-validate-shacl",
        ],
      },
    },
  } satisfies Record<string, Workspace>,
  packages: {
    compiler: {
      dependencies: {
        external: [
          "@rdfjs/prefix-map",
          "@rdfjs/data-model",
          "@rdfjs/dataset",
          "@rdfjs/term-map",
          "@rdfjs/term-set",
          "@rdfjs/types",
          "@sindresorhus/base62",
          "@tpluscode/rdf-ns-builders",
          "@types/rdfjs__data-model",
          "@types/rdfjs__dataset",
          "@types/rdfjs__prefix-map",
          "@types/rdfjs__term-map",
          "@types/rdfjs__term-set",
          "@types/toposort",
          "change-case",
          "pino",
          "plur",
          "purify-ts",
          "rdfjs-resource",
          "reserved-identifiers",
          "toposort",
          "ts-invariant",
          "ts-poet",
          "typescript-memoize",
        ],
        internal: ["shacl-ast"],
      },
      devDependencies: {
        external: ["@types/n3", "n3"],
        // internal: ["kitchen-sink-example"],
      },
    },
    "shacl-ast": {
      dependencies: {
        external: [
          "@rdfjs/data-model",
          "@rdfjs/dataset",
          "@rdfjs/term-map",
          "@rdfjs/term-set",
          "@rdfjs/types",
          "@tpluscode/rdf-ns-builders",
          "@types/rdfjs__data-model",
          "@types/rdfjs__dataset",
          "@types/rdfjs__term-map",
          "@types/rdfjs__term-set",
          "purify-ts",
          "rdfjs-resource",
          "typescript-memoize",
        ],
      },
      devDependencies: {
        external: ["@types/n3", "n3", "ts-invariant"],
      },
    },
  } satisfies Record<PackageName, Workspace>,
} as const;

const myDirPath = path.dirname(url.fileURLToPath(import.meta.url));

for (const [workspacesDirectoryAny, workspaces_] of Object.entries(
  workspaces,
)) {
  const workspacesDirectoryName = workspacesDirectoryAny as
    | "apps"
    | "examples"
    | "packages";
  for (const [workspaceName, workspaceAny] of Object.entries(workspaces_)) {
    const workspace = workspaceAny as Workspace;

    const packageDirectoryPath = path.join(
      myDirPath,
      workspacesDirectoryName,
      workspaceName,
    );

    fs.mkdirSync(packageDirectoryPath, { recursive: true });

    const files = new Set<string>();
    if (fs.existsSync(path.join(packageDirectoryPath, "README.md"))) {
      files.add("README.md");
    }
    const srcDirectoryPath = path.join(packageDirectoryPath, "src");
    if (workspaceName !== "forms" && fs.existsSync(srcDirectoryPath)) {
      for (const dirent of fs.readdirSync(srcDirectoryPath, {
        withFileTypes: true,
        recursive: true,
      })) {
        if (!dirent.name.endsWith(".ts") || !dirent.isFile()) {
          continue;
        }
        for (const fileNameGlob of ["*.js", "*.d.ts"]) {
          files.add(
            path.join(
              "dist",
              path.relative(srcDirectoryPath, dirent.parentPath),
              fileNameGlob,
            ),
          );
        }
      }
    }

    let testsDirectoryPath: string | null = path.join(
      packageDirectoryPath,
      "__tests__",
    );
    if (!fs.existsSync(testsDirectoryPath)) {
      testsDirectoryPath = null;
    }

    const packageName = `@shaclmate/${workspaceName}${workspacesDirectoryName === "examples" ? "-example" : ""}`;

    fs.writeFileSync(
      path.join(packageDirectoryPath, "package.json"),
      `${JSON.stringify(
        {
          bin: workspace.bin,
          dependencies: {
            ...(workspace.dependencies?.internal ?? []).toSorted().reduce(
              (map, packageName) => {
                map[`@shaclmate/${packageName}`] = VERSION;
                return map;
              },
              {} as Record<string, string>,
            ),
            ...(workspace.dependencies?.external ?? []).toSorted().reduce(
              (map, packageName) => {
                map[packageName] = externalDependencies[packageName];
                return map;
              },
              {} as Record<string, string>,
            ),
          },
          description: workspace.description,
          devDependencies: {
            ...(workspace.devDependencies?.internal ?? []).toSorted().reduce(
              (map, packageName) => {
                map[`@shaclmate/${packageName}`] = VERSION;
                return map;
              },
              {} as Record<string, string>,
            ),
            ...(workspace.devDependencies?.external ?? []).toSorted().reduce(
              (map, packageName) => {
                map[packageName] = externalDependencies[packageName];
                return map;
              },
              {} as Record<string, string>,
            ),
          },
          // 20251022: switch back to main + types to enable downstream "node" resolution
          // exports:
          //   files.size > 0
          //     ? {
          //         ".": {
          //           types: "./dist/index.d.ts",
          //           default: "./dist/index.js",
          //         },
          //       }
          //     : undefined,
          files: files.size > 0 ? [...files].sort() : undefined,
          homepage: workspace.homepage,
          keywords: workspace.keywords,
          license: "Apache-2.0",
          main: files.size > 0 ? "./dist/index.js" : undefined,
          name: packageName,
          packageManager: "npm@11.11.0",
          private: workspacesDirectoryName === "examples" ? true : undefined,
          repository: {
            type: "git",
            url: "git+https://github.com/minorg/shaclmate.git",
          },
          scripts: {
            build: `tsc -b${
              workspace.bin
                ? ` && ${Object.values(workspace.bin)
                    .map((bin) => `chmod +x ${bin}`)
                    .join(" && ")}`
                : ""
            }`,
            clean: "rimraf dist",
            depcheck: "depcheck .",
            dev: "tsc -w --preserveWatchOutput",
            ...(testsDirectoryPath !== null
              ? {
                  "dev:tests": "tsc -p __tests__ -w --preserveWatchOutput",
                }
              : {}),
            test: fs.existsSync(path.join(packageDirectoryPath, "__tests__"))
              ? `cd ../.. && vitest run --project ${packageName}`
              : undefined,
            typecheck: "tsc --noEmit",
            "typecheck:watch": "tsc --noEmit -w --preserveWatchOutput",
            ...workspace.scripts,
          },
          type: "module",
          types: files.size > 0 ? "./dist/index.d.ts" : undefined,
          version: VERSION,
        },
        undefined,
        2,
      )}\n`,
    );

    for (const fileName of ["LICENSE"]) {
      const packageFilePath = path.resolve(packageDirectoryPath, fileName);
      if (fs.existsSync(packageFilePath)) {
        continue;
      }
      fs.symlinkSync(`../../${fileName}`, packageFilePath);
    }

    fs.writeFileSync(
      path.resolve(packageDirectoryPath, "tsconfig.json"),
      JSON.stringify(workspace.tsconfig ?? tsconfigDefault, undefined, 2),
    );

    if (testsDirectoryPath !== null) {
      fs.writeFileSync(
        path.join(testsDirectoryPath, "tsconfig.json"),
        JSON.stringify(
          {
            compilerOptions: {
              exactOptionalPropertyTypes: false,
              experimentalDecorators: true,
              forceConsistentCasingInFileNames: true,
              noEmit: true,
              noUncheckedIndexedAccess: false,
            },
            extends: [
              "@tsconfig/strictest/tsconfig.json",
              "@tsconfig/node20/tsconfig.json",
            ],
            include: ["./**/*.ts", "../src/**/*"],
          },
          undefined,
          2,
        ),
      );
    }
  }
}
