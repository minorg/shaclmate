#!/usr/bin/env npm exec tsx --

import fs from "node:fs";
import path from "node:path";
import url from "node:url";
import { stringify as stringifyYaml } from "yaml";

const VERSION = "2.0.22";

type PackageName =
  | "cli"
  | "compiler"
  | "kitchen-sink"
  | "graphql"
  | "forms"
  | "runtime"
  | "shacl-ast";

interface Package {
  bin?: Record<string, string>;
  dependencies?: {
    external?: Record<string, string>;
    internal?: readonly string[];
  };
  devDependencies?: {
    external?: Record<string, string>;
    internal?: readonly string[];
  };
  peerDependencies?: {
    external?: Record<string, string>;
  };
  directory: "examples" | "packages";
  linkableDependencies?: readonly string[];
  name: PackageName;
  scripts?: Record<string, string>;
}

const externalDependencyVersions = {
  "@rdfjs/term-map": "^2.0.2",
  "@rdfjs/term-set": "^2.0.3",
  "@rdfjs/types": "^1.1.0",
  "@tpluscode/rdf-ns-builders": "^4.3.0",
  "@types/n3": "^1.21.1",
  "@types/rdfjs__term-map": "^2.0.10",
  "@types/rdfjs__term-set": "^2.0.9",
  graphql: "16.11.0",
  "graphql-scalars": "1.24.2",
  n3: "^1.21.3",
  pino: "^9.1.0",
  "purify-ts": "^2.1.0",
  "rdfjs-resource": "1.0.19",
};

// Packages should be topologically sorted
const packages: readonly Package[] = [
  // Compiler tests depend on kitchen sink
  {
    dependencies: {
      internal: ["runtime"],
    },
    directory: "examples",
    name: "kitchen-sink",
  },
  {
    dependencies: {
      external: {
        "@rdfjs/term-map": externalDependencyVersions["@rdfjs/term-map"],
        "@rdfjs/term-set": externalDependencyVersions["@rdfjs/term-set"],
        "@rdfjs/types": externalDependencyVersions["@rdfjs/types"],
        "@tpluscode/rdf-ns-builders":
          externalDependencyVersions["@tpluscode/rdf-ns-builders"],
        "@types/rdfjs__term-map":
          externalDependencyVersions["@types/rdfjs__term-map"],
        "@types/rdfjs__term-set":
          externalDependencyVersions["@types/rdfjs__term-set"],
        "purify-ts": externalDependencyVersions["purify-ts"],
        "rdfjs-resource": externalDependencyVersions["rdfjs-resource"],
      },
    },
    devDependencies: {
      external: {
        "@types/n3": externalDependencyVersions["@types/n3"],
        n3: externalDependencyVersions["n3"],
      },
    },
    directory: "packages",
    linkableDependencies: ["rdfjs-resource"],
    name: "shacl-ast",
  },
  {
    dependencies: {
      external: {
        "@rdfjs/prefix-map": "^0.1.2",
        "@rdfjs/term-map": externalDependencyVersions["@rdfjs/term-map"],
        "@rdfjs/term-set": externalDependencyVersions["@rdfjs/term-set"],
        "@rdfjs/types": externalDependencyVersions["@rdfjs/types"],
        "@sindresorhus/base62": "^0.1.0",
        "@tpluscode/rdf-ns-builders":
          externalDependencyVersions["@tpluscode/rdf-ns-builders"],
        "@types/rdfjs__prefix-map": "^0.1.5",
        "@types/rdfjs__term-map":
          externalDependencyVersions["@types/rdfjs__term-map"],
        "@types/rdfjs__term-set":
          externalDependencyVersions["@types/rdfjs__term-set"],
        "@types/toposort": "2.0.7",
        "change-case": "^5.4.4",
        pino: externalDependencyVersions["pino"],
        plur: "^5.1.0",
        "purify-ts": externalDependencyVersions["purify-ts"],
        "reserved-identifiers": "^1.0.0",
        toposort: "2.0.2",
        "ts-invariant": "^0.10.3",
        "ts-morph": "^26.0.0",
        "typescript-memoize": "^1.1.1",
      },
      internal: ["shacl-ast"],
    },
    devDependencies: {
      external: {
        "@kos-kit/sparql-client": "2.0.115",
        "@types/n3": externalDependencyVersions["@types/n3"],
        oxigraph: "^0.4.0",
        n3: externalDependencyVersions.n3,
        "rdfjs-resource": externalDependencyVersions["rdfjs-resource"],
      },
      internal: ["kitchen-sink-example", "runtime"],
    },
    directory: "packages",
    linkableDependencies: ["@kos-kit/sparql-client", "rdfjs-resource"],
    name: "compiler",
  },
  {
    dependencies: {
      external: {
        "@rdfjs/types": externalDependencyVersions["@rdfjs/types"],
        "@types/n3": externalDependencyVersions["@types/n3"],
        "@types/sparqljs": "3.1.12",
        "@types/uuid": "^9.0.1",
        "js-sha256": "^0.11.0",
        n3: externalDependencyVersions["n3"],
        "purify-ts": externalDependencyVersions["purify-ts"],
        "rdf-literal": "^1.3.2",
        "rdfjs-resource": externalDependencyVersions["rdfjs-resource"],
        sparqljs: "3.7.3",
        uuid: "^9.0.1",
        zod: "3.24.1",
        "zod-to-json-schema": "3.24.1",
      },
    },
    directory: "packages",
    linkableDependencies: ["rdfjs-resource"],
    peerDependencies: {
      external: {
        graphql: externalDependencyVersions.graphql,
        "graphql-scalars": externalDependencyVersions["graphql-scalars"],
      },
    },
    name: "runtime",
  },
  {
    bin: {
      shaclmate: "dist/cli.js",
    },
    dependencies: {
      external: {
        "@types/n3": externalDependencyVersions["@types/n3"],
        "@types/rdf-validate-shacl": "^0.4.7",
        "cmd-ts": "^0.13.0",
        n3: externalDependencyVersions["n3"],
        pino: externalDependencyVersions["pino"],
        "rdf-validate-shacl": "^0.5.6",
      },
      internal: ["compiler"],
    },
    directory: "packages",
    name: "cli",
  },
  {
    dependencies: {
      external: {
        "@jsonforms/core": "3.5.1",
        "@jsonforms/material-renderers": "3.5.1",
        "@jsonforms/react": "3.5.1",
        "@mui/icons-material": "^6.1.0",
        "@mui/lab": "6.0.0-beta.22",
        "@mui/material": "^6.1.0",
        "@mui/x-date-pickers": "^7.17.0",
        react: "^18",
        "react-dom": "^18",
      },
      internal: ["runtime"],
    },
    devDependencies: {
      external: {
        "@types/react": "^18",
        "@types/react-dom": "^18",
        "@vitejs/plugin-react": "^4.3.4",
        vite: "6.0.7",
      },
    },
    directory: "examples",
    name: "forms",
    scripts: {
      build: "tsc && vite build",
      clean: "rimraf dist",
      dev: "vite --port 3000",
      rebuild: "run-s clean build",
      start: "vite preview --port 3000",
    },
  },
  {
    dependencies: {
      external: {
        "@faker-js/faker": "^9.8.0",
        graphql: externalDependencyVersions.graphql,
        "graphql-scalars": externalDependencyVersions["graphql-scalars"],
        "graphql-yoga": "5.14.0",
      },
      internal: ["runtime"],
    },
    directory: "examples",
    name: "graphql",
    scripts: {
      build: "tsc",
      clean: "rimraf dist",
      dev: "tsx src/server.ts",
      rebuild: "run-s clean build",
      start: "tsx src/server.ts",
    },
  },
];

const myDirPath = path.dirname(url.fileURLToPath(import.meta.url));

for (const package_ of packages) {
  const internalDependencies: Record<string, string> = {};
  for (const internalDependency of package_.dependencies?.internal ?? []) {
    internalDependencies[`@shaclmate/${internalDependency}`] = VERSION;
  }

  const internalDevDependencies: Record<string, string> = {};
  for (const internalDevDependency of package_.devDependencies?.internal ??
    []) {
    internalDevDependencies[`@shaclmate/${internalDevDependency}`] = VERSION;
  }

  const packageDirectoryPath = path.join(
    myDirPath,
    `${package_.directory}`,
    package_.name,
  );
  const srcDirectoryPath = path.join(packageDirectoryPath, "src");

  fs.mkdirSync(packageDirectoryPath, { recursive: true });

  const files = new Set<string>();
  if (package_.name !== "forms" && fs.existsSync(srcDirectoryPath)) {
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

  fs.writeFileSync(
    path.join(packageDirectoryPath, "package.json"),
    `${JSON.stringify(
      {
        bin: package_.bin,
        dependencies: {
          ...internalDependencies,
          ...package_?.dependencies?.external,
        },
        devDependencies: {
          ...internalDevDependencies,
          ...package_.devDependencies?.external,
        },
        exports:
          files.size > 0
            ? {
                ".": {
                  types: "./dist/index.d.ts",
                  default: "./dist/index.js",
                },
              }
            : undefined,
        files: files.size > 0 ? [...files].sort() : undefined,
        license: "Apache-2.0",
        name: `@shaclmate/${package_.name}${package_.directory === "examples" ? "-example" : ""}`,
        peerDependencies: package_.peerDependencies?.external,
        private: package_.directory !== "packages" ? true : undefined,
        repository: {
          type: "git",
          url: "git+https://github.com/minorg/shaclmate",
        },
        scripts: package_.scripts ?? {
          build: `tsc -b${
            package_.bin
              ? ` && ${Object.values(package_.bin)
                  .map((bin) => `chmod +x ${bin}`)
                  .join(" && ")}`
              : ""
          }`,
          check: "biome check",
          "check:write": "biome check --write",
          "check:write:unsafe": "biome check --write --unsafe",
          clean: "rimraf dist",
          dev: "tsc -w --preserveWatchOutput",
          "dev:noEmit": "tsc --noEmit -w --preserveWatchOutput",
          format: "biome format",
          "format:write": "biome format --write",
          "format:write:unsafe": "biome format --write --unsafe",
          rebuild: "run-s clean build",
          "link-dependencies": "npm link rdfjs-resource",
          lint: "biome lint",
          "lint:write": "biome lint --write",
          "lint:write:unsafe": "biome lint --write --unsafe",
          test: "biome check && vitest run",
          "test:coverage": "biome check && vitest run --coverage",
          "test:watch": "vitest watch",
          unlink: `npm unlink -g @shaclmate/${package_.name}`,
        },
        type: "module",
        version: VERSION,
      },
      undefined,
      2,
    )}\n`,
  );

  for (const fileName of ["biome.json", "LICENSE", "tsconfig.json"]) {
    // const rootFilePath = path.resolve(myDirPath, fileName);
    const packageFilePath = path.resolve(packageDirectoryPath, fileName);
    if (fs.existsSync(packageFilePath)) {
      continue;
    }
    fs.symlinkSync(`../../${fileName}`, packageFilePath);
  }
}

// Root package.json
fs.writeFileSync(
  path.join(myDirPath, "package.json"),
  `${JSON.stringify(
    {
      devDependencies: {
        "@biomejs/biome": "1.9.4",
        "@tsconfig/node18": "^18.2.4",
        "@tsconfig/strictest": "^2.0.5",
        "@types/node": "^22",
        "@vitest/coverage-v8": "^3.0.1",
        "npm-run-all": "^4.1.5",
        rimraf: "^6.0.1",
        tsx: "^4.16.2",
        typescript: "~5.6",
        vitest: "^3.0.1",
        yaml: "^2.5.0",
      },
      name: "shaclmate",
      optionalDependencies: {
        "@biomejs/cli-linux-x64": "1.9.4",
        "@rollup/rollup-linux-x64-gnu": "4.24.0",
      },
      private: true,
      scripts: {
        build: "npm run build --workspaces",
        check: "biome check",
        "check:write": "biome check --write",
        "check:write:unsafe": "biome check --write --unsafe",
        clean: "npm run clean --workspaces",
        "generate-package-files": "tsx generate-package-files.ts",
        link: "npm link --workspaces",
        "link-dependencies": "npm run link-dependencies --workspaces",
        rebuild: "npm run rebuild --workspaces",
        test: "npm run test --if-present --workspaces",
        "test:coverage": "npm run test:coverage --if-present --workspaces",
        unlink: "npm run unlink --workspaces",
        watch: "run-p watch:*",
        ...packages.reduce(
          (watchEntries, package_) => {
            watchEntries[`watch:${package_.name}`] =
              `npm run watch -w @shaclmate/${package_.name}`;
            return watchEntries;
          },
          {} as Record<string, string>,
        ),
      },
      workspaces: packages.map(
        (package_) => `${package_.directory}/${package_.name}`,
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
            run: "packages/cli/dist/cli.js generate examples/kitchen-sink/src/kitchen-sink.shaclmate.ttl >/dev/null",
          },
          ...packages
            .filter((package_) =>
              fs.existsSync(
                path.join(myDirPath, "packages", package_.name, "__tests__"),
              ),
            )
            .map((package_) => {
              return {
                if: "always()",
                uses: "davelosert/vitest-coverage-report-action@v2",
                with: {
                  "file-coverage-mode": "all",
                  name: package_.name,
                  "json-final-path": `./packages/${package_.name}/coverage/coverage-final.json`,
                  "json-summary-path": `./packages/${package_.name}/coverage/coverage-summary.json`,
                },
              };
            }),
        ],
      },
    },
  }),
);
