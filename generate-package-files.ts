#!/usr/bin/env npm exec tsx --

import fs from "node:fs";
import path from "node:path";
import url from "node:url";
import { stringify as stringifyYaml } from "yaml";

const VERSION = "3.0.4";

const externalDependencies = {
  "@biomejs/biome": "2.3.10",
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
  "@rdfjs/prefix-map": "~0.1.2",
  "@rdfjs/serializer-turtle": "~1.1.5",
  "@rdfjs/term-map": "~2.0.2",
  "@rdfjs/term-set": "~2.0.3",
  "@rdfjs/types": "~2.0.1",
  "@sindresorhus/base62": "~0.1.0",
  "@tpluscode/rdf-ns-builders": "~4.3.0",
  "@tsconfig/node18": "~18.2.4",
  "@tsconfig/strictest": "~2.0.8",
  "@types/node": "~18",
  "@types/n3": "~1.26.0",
  "@types/rdfjs__data-model": "~2.0.9",
  "@types/rdfjs__dataset": "~2.0.7",
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
  depcheck: "~1.4.7",
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
  "rdfjs-resource": "3.0.6",
  "reserved-identifiers": "~1.0.0",
  react: "~18",
  "react-dom": "~18",
  rimraf: "~6.0.1",
  sparqljs: "3.7.3",
  toposort: "2.0.2",
  "ts-poet": "~6.12.0",
  "ts-invariant": "~0.10.3",
  tsx: "~4.16.2",
  turbo: "~2.5.5",
  typescript: "5.9.3",
  "typescript-memoize": "~1.1.1",
  uuid: "~9.0.1",
  vite: "6.0.7",
  vitest: "~4.0.18",
  "@vitest/coverage-v8": "~4.0.18",
  yaml: "~2.5.0",
  zod: "~4.1.12",
};

type PackageName = "compiler" | "shacl-ast";

interface Workspace {
  bin?: Record<string, string>;
  dependencies?: {
    external?: readonly (keyof typeof externalDependencies)[];
    internal?: readonly PackageName[];
  };
  devDependencies?: {
    external?: readonly (keyof typeof externalDependencies)[];
    internal?: readonly PackageName[];
  };
  scripts?: Record<string, string>;
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
    },
  } satisfies Record<string, Workspace>,
  examples: {
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
        test: "biome check",
        "test:coverage": "biome check",
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
          devDependencies: {
            ...(workspace.devDependencies?.internal ?? []).toSorted().reduce(
              (map, packageName) => {
                map[`@shaclmate/${packageName}`] = VERSION;
                return map;
              },
              {} as Record<string, string>,
            ),
            ...(workspace.devDependencies?.external ?? [])
              .concat(
                "@biomejs/biome",
                "@tsconfig/node18",
                "@tsconfig/strictest",
                "@types/node",
                "depcheck",
                "rimraf",
                "typescript",
                ...(testsDirectoryPath !== null
                  ? (["vitest", "@vitest/coverage-v8"] as const)
                  : []),
              )
              .toSorted()
              .reduce(
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
          license: "Apache-2.0",
          main: files.size > 0 ? "./dist/index.js" : undefined,
          name: `@shaclmate/${workspaceName}${workspacesDirectoryName === "examples" ? "-example" : ""}`,
          packageManager: "npm@10.9.0",
          private: workspacesDirectoryName === "examples" ? true : undefined,
          repository: {
            type: "git",
            url: "git+https://github.com/minorg/shaclmate",
          },
          scripts: {
            build: `tsc -b${
              workspace.bin
                ? ` && ${Object.values(workspace.bin)
                    .map((bin) => `chmod +x ${bin}`)
                    .join(" && ")}`
                : ""
            }`,
            "build:noEmit": "tsc --noEmit",
            check: "biome check",
            "check:write": "biome check --write",
            "check:write:unsafe": "biome check --write --unsafe",
            clean: "rimraf dist",
            depcheck: "depcheck .",
            dev: "tsc -w --preserveWatchOutput",
            "dev:noEmit": "tsc --noEmit -w --preserveWatchOutput",
            ...(testsDirectoryPath !== null
              ? {
                  "dev:tests": "tsc -p __tests__ -w --preserveWatchOutput",
                  test: "biome check && vitest run",
                  "test:coverage": "biome check && vitest run --coverage",
                  "test:watch": "biome check && vitest watch",
                }
              : {}),
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

    for (const fileName of ["biome.json", "LICENSE"]) {
      const packageFilePath = path.resolve(packageDirectoryPath, fileName);
      if (fs.existsSync(packageFilePath)) {
        continue;
      }
      fs.symlinkSync(`../../${fileName}`, packageFilePath);
    }

    if (workspaceName !== "forms") {
      fs.writeFileSync(
        path.resolve(packageDirectoryPath, "tsconfig.json"),
        JSON.stringify(
          {
            compilerOptions: {
              baseUrl: "src",
              declaration: true,
              declarationMap: true,
              exactOptionalPropertyTypes: false,
              experimentalDecorators: true,
              forceConsistentCasingInFileNames: true,
              incremental: true,
              noUncheckedIndexedAccess: false,
              outDir: "dist",
              sourceMap: true,
            },
            extends: [
              "@tsconfig/strictest/tsconfig.json",
              "@tsconfig/node18/tsconfig.json",
            ],
            include: ["src/**/*.ts"],
          },
          undefined,
          2,
        ),
      );
    }

    if (testsDirectoryPath !== null) {
      fs.writeFileSync(
        path.join(testsDirectoryPath, "tsconfig.json"),
        JSON.stringify(
          {
            compilerOptions: {
              baseUrl: ".",
              exactOptionalPropertyTypes: false,
              experimentalDecorators: true,
              forceConsistentCasingInFileNames: true,
              noEmit: true,
              noUncheckedIndexedAccess: false,
            },
            extends: [
              "@tsconfig/strictest/tsconfig.json",
              "@tsconfig/node18/tsconfig.json",
            ],
            include: ["./**/*.ts"],
          },
          undefined,
          2,
        ),
      );
    }
  }
}

// Root package.json
fs.writeFileSync(
  path.join(myDirPath, "package.json"),
  `${JSON.stringify(
    {
      devDependencies: (
        [
          "tsx",
          "turbo",
          "yaml",
          "vitest",
          "@vitest/coverage-v8",
        ] satisfies readonly (keyof typeof externalDependencies)[]
      )
        .toSorted()
        .reduce(
          (map, packageName) => {
            map[packageName] = externalDependencies[packageName];
            return map;
          },
          {} as Record<string, string>,
        ),
      name: "shaclmate",
      optionalDependencies: {
        "@biomejs/cli-linux-x64": externalDependencies["@biomejs/biome"],
      },
      packageManager: "npm@11.11.0",
      private: true,
      scripts: {
        build: "turbo run build",
        "build:packages": 'turbo run --filter "./packages/*" build',
        "build:noEmit": "turbo run build:noEmit",
        check: "biome check",
        "check:write": "biome check --write",
        "check:write:unsafe": "biome check --write --unsafe",
        clean: "turbo run clean",
        depcheck: "turbo run depcheck",
        dev: "turbo run --concurrency 11 dev dev:tests",
        "dev:noEmit": "turbo run --concurrency 11 dev:noEmit dev:tests",
        test: "turbo run test",
        "test:coverage": "turbo run test:coverage",
        // ...packages.reduce(
        //   (watchEntries, workspace) => {
        //     watchEntries[`watch:${workspaceName}`] =
        //       `npm run watch -w @shaclmate/${workspaceName}`;
        //     return watchEntries;
        //   },
        //   {} as Record<string, string>,
        // ),
      },
      workspaces: Object.entries(workspaces).flatMap(
        ([workspacesDirectoryName, workspaces_]) =>
          Object.keys(workspaces_).map(
            (workspaceName) => `${workspacesDirectoryName}/${workspaceName}`,
          ),
      ),
    },
    undefined,
    2,
  )}\n`,
);

// Continuous Integration workflow file
fs.writeFileSync(
  path.join(myDirPath, ".github", "workflows", "continuous-integration.yml"),
  stringifyYaml({
    name: "Continuous Integration",
    on: {
      push: {
        "branches-ignore": ["main"],
      },
      workflow_dispatch: null,
    },
    jobs: {
      build: {
        env: {
          DO_NOT_TRACK: 1,
        },
        name: "Build and test",
        "runs-on": "ubuntu-latest",
        steps: [
          {
            uses: "actions/checkout@v4",
          },
          {
            uses: "actions/setup-node@v4",
            with: {
              cache: "npm",
              "node-version": 20,
            },
          },
          {
            name: "Install dependencies",
            run: "npm ci",
          },
          {
            name: "Build",
            run: "npm run build",
          },
          {
            name: "Test",
            run: "npm run test:coverage",
          },
          {
            name: "Run CLI",
            run: "apps/cli/dist/cli.js generate examples/kitchen-sink/src/kitchen-sink.shaclmate.ttl >/dev/null",
          },
          ...Object.entries(workspaces).flatMap(
            ([workspacesDirectoryName, workspaces_]) =>
              Object.keys(workspaces_).flatMap((workspaceName) =>
                workspacesDirectoryName === "packages" &&
                fs.existsSync(
                  path.join(
                    myDirPath,
                    workspacesDirectoryName,
                    workspaceName,
                    "__tests__",
                  ),
                )
                  ? [
                      {
                        if: "always()",
                        uses: "davelosert/vitest-coverage-report-action@v2",
                        with: {
                          "file-coverage-mode": "all",
                          name: workspaceName,
                          "json-final-path": `./packages/${workspaceName}/coverage/coverage-final.json`,
                          "json-summary-path": `./packages/${workspaceName}/coverage/coverage-summary.json`,
                        },
                      },
                    ]
                  : [],
              ),
          ),
        ],
      },
    },
  }),
);
