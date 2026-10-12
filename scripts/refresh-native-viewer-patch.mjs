import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import {
  existsSync,
  mkdtempSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { spawnSync } from "node:child_process";

const UPSTREAM_COMMIT = "9400a49af670fdb5db4af58e73f8df98588dbea9";
const args = process.argv.slice(2);

function option(name) {
  const index = args.indexOf(name);
  return index === -1 ? undefined : args[index + 1];
}

if (args.includes("--help")) {
  console.log(
    "Usage: node scripts/refresh-native-viewer-patch.mjs --source <paseo-checkout> " +
      "[--output patches/native-viewer.patch] --confirm-quiescent",
  );
  process.exit(0);
}

const sourceArgument = option("--source");
assert.ok(sourceArgument, "Pass --source with the local Paseo checkout.");
assert.ok(
  args.includes("--confirm-quiescent"),
  "Wait for every source editor/worker to finish, then pass --confirm-quiescent.",
);

const source = resolve(sourceArgument);
const output = resolve(option("--output") ?? "patches/native-viewer.patch");
const scopesPath = resolve("patches/native-viewer.paths");
const exclusionsPath = resolve("patches/native-viewer.excluded-paths");
assert.ok(existsSync(scopesPath), `Missing patch scope file: ${scopesPath}`);
assert.ok(existsSync(exclusionsPath), `Missing patch exclusions file: ${exclusionsPath}`);
assert.ok(
  relative(source, output).startsWith(`..${sep}`) || isAbsolute(relative(source, output)),
  "Write the public patch outside the private source checkout.",
);

const scopes = readFileSync(scopesPath, "utf8")
  .split(/\r?\n/)
  .map((line) => line.trim())
  .filter((line) => line && !line.startsWith("#"));
assert.ok(scopes.length > 0, "The patch scope list is empty.");
assert.ok(scopes.every((path) => !isAbsolute(path) && !path.startsWith("..")));
const exclusions = readFileSync(exclusionsPath, "utf8")
  .split(/\r?\n/)
  .map((line) => line.trim())
  .filter((line) => line && !line.startsWith("#"));
assert.ok(exclusions.every((path) => !isAbsolute(path) && !path.startsWith("..")));

function git(parameters, { cwd = source, env = {}, encoding = "utf8" } = {}) {
  const result = spawnSync("git", parameters, {
    cwd,
    encoding,
    env: { ...process.env, ...env },
    maxBuffer: 256 * 1024 * 1024,
  });
  if (result.error) throw result.error;
  assert.equal(
    result.status,
    0,
    `git ${parameters.join(" ")} failed:\n${String(result.stderr ?? "").trim()}`,
  );
  return result.stdout;
}

function permitted(path) {
  const normalized = path.replaceAll("\\", "/");
  return scopes.some((scope) => normalized === scope || normalized.startsWith(`${scope}/`));
}

function excluded(path) {
  const normalized = path.replaceAll("\\", "/");
  return exclusions.some(
    (exclusion) => normalized === exclusion || normalized.startsWith(`${exclusion}/`),
  );
}

function nulPaths(buffer) {
  return buffer
    .toString("utf8")
    .split("\0")
    .filter(Boolean);
}

git(["cat-file", "-e", `${UPSTREAM_COMMIT}^{commit}`]);

const changed = new Set([
  ...nulPaths(git(["diff", "--name-only", "-z", UPSTREAM_COMMIT], { encoding: null })),
  ...nulPaths(git(["ls-files", "--others", "--exclude-standard", "-z"], { encoding: null })),
]);
const outsideScope = [...changed].filter((path) => !permitted(path) && !excluded(path)).sort();
assert.deepEqual(
  outsideScope,
  [],
  `Refusing to omit unreviewed paths outside the scopes and exclusions:\n${outsideScope.join("\n")}`,
);
const intentionallyExcluded = [...changed].filter(excluded).sort();
const patchPaths = [...changed].filter(permitted).sort();

const temporary = mkdtempSync(join(tmpdir(), "aigo-native-patch-"));
try {
  function snapshot(indexName) {
    const index = join(temporary, indexName);
    const env = { GIT_INDEX_FILE: index };
    git(["read-tree", UPSTREAM_COMMIT], { env });
    git(["add", "-A", "--", ...scopes], { env });
    return git(
      [
        "diff",
        "--cached",
        "--binary",
        "--full-index",
        "--no-ext-diff",
        "--no-renames",
        UPSTREAM_COMMIT,
        "--",
        ...scopes,
      ],
      { env, encoding: null },
    );
  }

  const first = snapshot("index-one");
  const second = snapshot("index-two");
  assert.ok(first.length > 0, "The approved paths contain no changes from the pinned upstream commit.");
  assert.deepEqual(
    first,
    second,
    "The source changed while the patch was being captured. Wait for all workers and retry.",
  );

  const candidate = join(temporary, "native-viewer.patch");
  writeFileSync(candidate, first);

  const verificationCheckout = join(temporary, "verify");
  git(["clone", "--no-checkout", "--shared", source, verificationCheckout], { cwd: temporary });
  git(["checkout", "--detach", UPSTREAM_COMMIT], { cwd: verificationCheckout });
  git(["apply", "--check", candidate], { cwd: verificationCheckout });

  mkdirSync(dirname(output), { recursive: true });
  writeFileSync(output, first);
  const sha256 = createHash("sha256").update(first).digest("hex");
  console.log(`Wrote ${output}`);
  console.log(`Pinned upstream: ${UPSTREAM_COMMIT}`);
  console.log(`Patch files: ${patchPaths.length}`);
  console.log(`Intentionally excluded local files: ${intentionallyExcluded.length}`);
  console.log(`SHA-256: ${sha256}`);
  console.log("Review the complete patch before committing or running any public workflow.");
} finally {
  rmSync(temporary, { recursive: true, force: true });
}
