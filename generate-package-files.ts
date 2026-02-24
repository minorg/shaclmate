#!/usr/bin/env npm exec tsx --

import fs from "node:fs";
import path from "node:path";
import url from "node:url";
import { stringify as stringifyYaml } from "yaml";

const VERSION = "3.0.4";

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
  directory: "apps" | "examples" | "packages";
  linkableDependencies?: readonly string[];
  name: "cli" | "compiler" | "kitchen-sink" | "graphql" | "forms" | "shacl-ast";
  scripts?: Record<string, string>;
}

const externalDependencyVersions = {
  "@biomejs/biome": { "@biomejs/biome": "2.3.10" },
  "@rdfjs/prefix-map": { "@rdfjs/prefix-map": "~0.1.2" },
  "@rdfjs/serializer-turtle": { "@rdfjs/serializer-turtle": "~1.1.5" },
  "@rdfjs/term-map": { "@rdfjs/term-map": "~2.0.2" },
  "@rdfjs/term-set": { "@rdfjs/term-set": "~2.0.3" },
  "@rdfjs/types": { "@rdfjs/types": "~2.0.1" },
  "@tpluscode/rdf-ns-builders": { "@tpluscode/rdf-ns-builders": "~4.3.0" },
  "@tsconfig/node18": { "@tsconfig/node18": "~18.2.4" },
  "@tsconfig/strictest": { "@tsconfig/strictest": "~2.0.8" },
  "@types/node": { "@types/node": "~22" },
  "@types/n3": { "@types/n3": "~1.26.0" },
  "@types/rdfjs__prefix-map": { "@types/rdfjs__prefix-map": "~0.1.5" },
  "@types/rdfjs__serializer-turtle": {
    "@types/rdfjs__serializer-turtle": "~1.1.0",
  },
  "@types/rdfjs__term-map": { "@types/rdfjs__term-map": "~2.0.10" },
  "@types/rdfjs__term-set": { "@types/rdfjs__term-set": "~2.0.9" },
  "@types/sparqljs": { "@types/sparqljs": "3.1.12" },
  "@types/uuid": { "@types/uuid": "~9.0.1" },
  depcheck: { depcheck: "~1.4.7" },
  graphql: { graphql: "16.11.0" },
  "graphql-scalars": { "graphql-scalars": "1.24.2" },
  "js-sha256": { "js-sha256": "~0.11.0" },
  n3: { n3: "~1.26.0" },
  pino: { pino: "~9.1.0" },
  "purify-ts": { "purify-ts": "~2.1.4" },
  "rdf-literal": { "rdf-literal": "~1.3.2" }, // TODO: remove me
  "rdf-validate-shacl": { "rdf-validate-shacl": "0.5.8" },
  "rdfjs-resource": { "rdfjs-resource": "2.0.2" },
  rimraf: { rimraf: "~6.0.1" },
  sparqljs: { sparqljs: "3.7.3" },
  "ts-poet": { "ts-poet": "~6.12.0" },
  "ts-invariant": { "ts-invariant": "~0.10.3" },
  typescript: { typescript: "5.9.3" },
  "typescript-memoize": { "typescript-memoize": "~1.1.1" },
  uuid: { uuid: "~9.0.1" },
  zod: {
    zod: "~4.1.12",
  },
  vitest: { vitest: "~4.0.18" },
  "@vitest/coverage-v8": { "@vitest/coverage-v8": "~4.0.18" },
};

// Packages should be topologically sorted
const packages: readonly Package[] = [
  // Compiler tests depend on kitchen sink
  {
    dependencies: {
      external: {
        ...externalDependencyVersions["@rdfjs/types"],
        ...externalDependencyVersions["@types/n3"],
        ...externalDependencyVersions["@types/sparqljs"],
        ...externalDependencyVersions["@types/uuid"],
        ...externalDependencyVersions["js-sha256"],
        ...externalDependencyVersions["n3"],
        ...externalDependencyVersions["purify-ts"],
        ...externalDependencyVersions["rdfjs-resource"],
        ...externalDependencyVersions["sparqljs"],
        ...externalDependencyVersions["uuid"],
        ...externalDependencyVersions["zod"],
      },
    },
    devDependencies: {
      external: {
        "@kos-kit/sparql-client": "2.0.116",
        ...externalDependencyVersions["@rdfjs/prefix-map"],
        ...externalDependencyVersions["@rdfjs/serializer-turtle"],
        ...externalDependencyVersions["@tpluscode/rdf-ns-builders"],
        ...externalDependencyVersions["@types/rdfjs__prefix-map"],
        ...externalDependencyVersions["@types/rdfjs__serializer-turtle"],
        oxigraph: "0.4.11",
        ...externalDependencyVersions["rdf-validate-shacl"],
      },
    },
    directory: "examples",
    linkableDependencies: ["rdfjs-resource"],
    name: "kitchen-sink",
  },
  {
    dependencies: {
      external: {
        ...externalDependencyVersions["@rdfjs/term-map"],
        ...externalDependencyVersions["@rdfjs/term-set"],
        ...externalDependencyVersions["@rdfjs/types"],
        ...externalDependencyVersions["@tpluscode/rdf-ns-builders"],
        ...externalDependencyVersions["@types/n3"],
        ...externalDependencyVersions["@types/rdfjs__term-map"],
        ...externalDependencyVersions["@types/rdfjs__term-set"],
        ...externalDependencyVersions["n3"],
        ...externalDependencyVersions["purify-ts"],
        ...externalDependencyVersions["rdfjs-resource"],
        ...externalDependencyVersions["typescript-memoize"],
      },
    },
    devDependencies: {
      external: {
        ...externalDependencyVersions["ts-invariant"],
      },
    },
    directory: "packages",
    linkableDependencies: ["rdfjs-resource"],
    name: "shacl-ast",
  },
  {
    dependencies: {
      external: {
        ...externalDependencyVersions["@rdfjs/prefix-map"],
        ...externalDependencyVersions["@rdfjs/term-map"],
        ...externalDependencyVersions["@rdfjs/term-set"],
        ...externalDependencyVersions["@rdfjs/types"],
        "@sindresorhus/base62": "~0.1.0",
        ...externalDependencyVersions["@tpluscode/rdf-ns-builders"],
        ...externalDependencyVersions["@types/n3"],
        ...externalDependencyVersions["@types/rdfjs__prefix-map"],
        ...externalDependencyVersions["@types/rdfjs__term-map"],
        ...externalDependencyVersions["@types/rdfjs__term-set"],
        "@types/toposort": "2.0.7",
        "change-case": "~5.4.4",
        ...externalDependencyVersions["n3"],
        ...externalDependencyVersions["pino"],
        plur: "~5.1.0",
        ...externalDependencyVersions["purify-ts"],
        ...externalDependencyVersions["rdf-literal"],
        ...externalDependencyVersions["rdfjs-resource"],
        "reserved-identifiers": "~1.0.0",
        toposort: "2.0.2",
        ...externalDependencyVersions["ts-invariant"],
        ...externalDependencyVersions["ts-poet"],
        "typescript-memoize": "~1.1.1",
      },
      internal: ["shacl-ast"],
    },
    devDependencies: {
      internal: ["kitchen-sink-example"],
    },
    directory: "packages",
    linkableDependencies: ["@kos-kit/sparql-client", "rdfjs-resource"],
    name: "compiler",
  },
  {
    bin: {
      shaclmate: "dist/cli.js",
    },
    dependencies: {
      external: {
        ...externalDependencyVersions["@rdfjs/types"],
        ...externalDependencyVersions["@rdfjs/prefix-map"],
        ...externalDependencyVersions["@types/n3"],
        ...externalDependencyVersions["@types/rdfjs__prefix-map"],
        "cmd-ts": "~0.13.0",
        ...externalDependencyVersions["n3"],
        ...externalDependencyVersions["pino"],
        ...externalDependencyVersions["rdf-validate-shacl"],
      },
      internal: ["compiler"],
    },
    directory: "apps",
    name: "cli",
  },
  {
    dependencies: {
      external: {
        "@jsonforms/core": "3.5.1",
        "@jsonforms/material-renderers": "3.5.1",
        "@jsonforms/react": "3.5.1",
        "@mui/icons-material": "~6.1.0",
        // "@mui/lab": "6.0.0-beta.22",
        "@mui/material": "~6.1.0",
        "@mui/x-date-pickers": "~7.17.0",
        react: "~18",
        "react-dom": "~18",
        ...externalDependencyVersions["@rdfjs/types"],
        ...externalDependencyVersions["@types/n3"],
        ...externalDependencyVersions["n3"],
        ...externalDependencyVersions["purify-ts"],
        ...externalDependencyVersions["rdfjs-resource"],
        ...externalDependencyVersions["zod"],
      },
    },
    devDependencies: {
      external: {
        "@types/react": "~18",
        "@types/react-dom": "~18",
        "@vitejs/plugin-react": "~4.3.4",
        vite: "6.0.7",
      },
    },
    directory: "examples",
    linkableDependencies: ["rdfjs-resource"],
    name: "forms",
    scripts: {
      build: "tsc && vite build",
      start: "vite dev --port 3000",
      test: "biome check",
      "test:coverage": "biome check",
    },
  },
  {
    dependencies: {
      external: {
        ...externalDependencyVersions["@rdfjs/types"],
        ...externalDependencyVersions["graphql"],
        "graphql-yoga": "5.14.0",
        ...externalDependencyVersions["n3"],
        ...externalDependencyVersions["purify-ts"],
        ...externalDependencyVersions["rdfjs-resource"],
      },
    },
    directory: "examples",
    name: "graphql",
    scripts: {
      start: "NODE_ENV=development tsx src/server.ts",
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
        bin: package_.bin,
        dependencies: {
          ...internalDependencies,
          ...package_?.dependencies?.external,
        },
        devDependencies: {
          ...internalDevDependencies,
          ...package_.devDependencies?.external,
          ...externalDependencyVersions["@biomejs/biome"],
          ...externalDependencyVersions["@tsconfig/node18"],
          ...externalDependencyVersions["@tsconfig/strictest"],
          ...externalDependencyVersions["@types/node"],
          ...externalDependencyVersions["depcheck"],
          ...externalDependencyVersions["rimraf"],
          ...externalDependencyVersions["typescript"],
          ...(testsDirectoryPath !== null
            ? {
                ...externalDependencyVersions["vitest"],
                ...externalDependencyVersions["@vitest/coverage-v8"],
              }
            : {}),
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
        name: `@shaclmate/${package_.name}${package_.directory === "examples" ? "-example" : ""}`,
        packageManager: "npm@10.9.0",
        peerDependencies: package_.peerDependencies?.external,
        private: package_.directory === "examples" ? true : undefined,
        repository: {
          type: "git",
          url: "git+https://github.com/minorg/shaclmate",
        },
        scripts: {
          build: `tsc -b${
            package_.bin
              ? ` && ${Object.values(package_.bin)
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
          "link-dependencies": "npm link rdfjs-resource",
          ...(testsDirectoryPath !== null
            ? {
                "dev:tests": "tsc -p __tests__ -w --preserveWatchOutput",
                test: "biome check && vitest run",
                "test:coverage": "biome check && vitest run --coverage",
                "test:watch": "biome check && vitest watch",
              }
            : {}),
          unlink: `npm unlink -g @shaclmate/${package_.name}`,
          ...package_.scripts,
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

  if (package_.name !== "forms") {
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

// Root package.json
fs.writeFileSync(
  path.join(myDirPath, "package.json"),
  `${JSON.stringify(
    {
      devDependencies: {
        tsx: "~4.16.2",
        turbo: "~2.5.5",
        yaml: "~2.5.0",
        ...externalDependencyVersions["vitest"],
        ...externalDependencyVersions["@vitest/coverage-v8"],
      },
      name: "shaclmate",
      optionalDependencies: {
        "@biomejs/cli-linux-x64": "1.9.4",
        "@rollup/rollup-linux-x64-gnu": "4.24.0",
      },
      packageManager: "npm@10.9.0",
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
        link: "npm link --workspaces",
        "link-dependencies": "turbo run link-dependencies",
        test: "turbo run test",
        "test:coverage": "turbo run test:coverage",
        unlink: "turbo run unlink",
        // ...packages.reduce(
        //   (watchEntries, package_) => {
        //     watchEntries[`watch:${package_.name}`] =
        //       `npm run watch -w @shaclmate/${package_.name}`;
        //     return watchEntries;
        //   },
        //   {} as Record<string, string>,
        // ),
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
