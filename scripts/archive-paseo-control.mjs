import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { basename, join, resolve } from "node:path";

assert.equal(process.platform, "darwin", "This script requires macOS and Xcode.");
assert.ok(
  process.argv[2] && process.argv[3],
  "Usage: node archive-paseo-control.mjs <paseo-checkout> <new-output-directory>",
);

const checkout = resolve(process.argv[2]);
const output = resolve(process.argv[3]);
assert.ok(!existsSync(output), "Choose a new output directory; existing output is never removed.");
const appDirectory = join(checkout, "packages", "app");
const ios = join(appDirectory, "ios");
const upstream = "9400a49af670fdb5db4af58e73f8df98588dbea9";
const expoProjectId = "0e7f65ce-0367-46c8-a238-2b65963d235a";

function run(command, args, cwd = appDirectory, capture = false) {
  const result = spawnSync(command, args, {
    cwd,
    encoding: "utf8",
    stdio: capture ? ["ignore", "pipe", "inherit"] : "inherit",
    env: process.env,
  });
  if (result.error) throw result.error;
  assert.equal(result.status, 0, `${command} failed with status ${result.status}`);
  return capture ? result.stdout.trim() : undefined;
}

function exactlyOne(directory, suffix) {
  const matches = readdirSync(directory).filter((name) => name.endsWith(suffix));
  assert.equal(matches.length, 1, `Expected one ${suffix} in ${directory}; found ${matches.length}`);
  return join(directory, matches[0]);
}

function plist(path) {
  return JSON.parse(run("plutil", ["-convert", "json", "-o", "-", path], appDirectory, true));
}

function checkEntitlements(directory) {
  let checked = 0;
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (entry.name === "Pods" || entry.name === "build") continue;
    const path = join(directory, entry.name);
    if (entry.isDirectory()) checked += checkEntitlements(path);
    else if (entry.name.endsWith(".entitlements")) {
      // This is the unchanged expo-notifications default requested by upstream.
      // The external signer determines the installed entitlement and provisioning profile.
      assert.equal(plist(path)["aps-environment"], "development", `Unexpected APNs entitlement: ${path}`);
      checked += 1;
    }
  }
  return checked;
}

assert.equal(run("git", ["rev-parse", "HEAD"], checkout, true), upstream);
const workspace = exactlyOne(ios, ".xcworkspace");
const project = exactlyOne(ios, ".xcodeproj");
const scheme = basename(project, ".xcodeproj");
const listing = JSON.parse(run("xcodebuild", ["-list", "-json", "-workspace", workspace], appDirectory, true));
assert.ok(listing.workspace?.schemes?.includes(scheme), `Generated scheme ${scheme} is missing.`);
assert.ok(checkEntitlements(ios) > 0, "The generated upstream app has no notification entitlement file.");

mkdirSync(output, { recursive: true });
const archive = join(output, "Paseo-Control.xcarchive");
run("xcodebuild", [
  "-workspace", workspace,
  "-scheme", scheme,
  "-configuration", "Release",
  "-sdk", "iphoneos",
  "-destination", "generic/platform=iOS",
  "-archivePath", archive,
  "-derivedDataPath", join(output, "DerivedData"),
  "archive",
  "CODE_SIGNING_ALLOWED=NO",
  "CODE_SIGNING_REQUIRED=NO",
  "CODE_SIGN_IDENTITY=",
  "DEVELOPMENT_TEAM=",
]);

const application = exactlyOne(join(archive, "Products", "Applications"), ".app");
const info = plist(join(application, "Info.plist"));
assert.equal(info.CFBundleIdentifier, "sh.paseo");
assert.equal(info.CFBundleDisplayName, "Paseo");
assert.equal(info.CFBundleShortVersionString, "0.7.2");
assert.equal(info.CFBundleVersion, "7002999");
assert.ok(info.CFBundleSupportedPlatforms?.includes("iPhoneOS"), "Expected a physical-device app.");
assert.ok(existsSync(join(application, "main.jsbundle")), "Release JavaScript bundle is missing.");
assert.ok(!existsSync(join(application, "embedded.mobileprovision")), "Unexpected provisioning credentials in unsigned app.");
const architectures = run("lipo", ["-archs", join(application, info.CFBundleExecutable)], appDirectory, true);
assert.ok(architectures.split(/\s+/).includes("arm64"), "The app is missing the iPhone arm64 architecture.");

const payload = join(output, "Payload");
mkdirSync(payload);
cpSync(application, join(payload, basename(application)), { recursive: true, dereference: false });
// Retain the upstream redistribution license in the packaged app resources.
cpSync(join(checkout, "LICENSE"), join(payload, basename(application), "LICENSE-Paseo.txt"));
const ipa = join(output, "Paseo-Control-unsigned.ipa");
run("ditto", ["-c", "-k", "--keepParent", "Payload", basename(ipa)], output);
writeFileSync(join(output, "build-manifest.json"), `${JSON.stringify({
  app: "Paseo",
  controlPurpose: "temporary upstream notification control",
  bundleIdentifier: info.CFBundleIdentifier,
  upstreamCommit: upstream,
  buildKitCommit: process.env.GITHUB_SHA ?? null,
  version: info.CFBundleShortVersionString,
  buildNumber: info.CFBundleVersion,
  configuration: "Release",
  devicePlatform: "iPhoneOS",
  architectures,
  signed: false,
  remotePushConfigured: true,
  deliveryUnverified: true,
  expoProjectId,
  requestedApnsEnvironment: "development",
  sha256: createHash("sha256").update(readFileSync(ipa)).digest("hex"),
  xcode: run("xcodebuild", ["-version"], appDirectory, true),
}, null, 2)}\n`);
console.log("Unsigned upstream Paseo control IPA packaged. Signing and remote delivery remain unverified.");
