import assert from "node:assert/strict";
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { basename, join, resolve } from "node:path";
import { spawnSync } from "node:child_process";

assert.equal(process.platform, "darwin", "This script requires macOS and Xcode.");
assert.equal(process.env.AIGO_PREVIEW_BUILD, "1", "Set AIGO_PREVIEW_BUILD=1 for every build step.");
assert.ok(process.argv[2] && process.argv[3], "Usage: node archive-ios.mjs <paseo-checkout> <new-output-directory>");
const checkout = resolve(process.argv[2]);
const output = resolve(process.argv[3]);
assert.ok(!existsSync(output), "Choose a new output directory; existing output is never removed.");
const appDirectory = join(checkout, "packages", "app");
const ios = join(appDirectory, "ios");
const upstream = "9400a49af670fdb5db4af58e73f8df98588dbea9";

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
      // Preserve the requested receiver capability. The external signer determines
      // the final entitlement/profile; this does not configure an APNs sender.
      assert.equal(plist(path)["aps-environment"], "production", `Missing APNs diagnostic entitlement: ${path}`);
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
assert.ok(checkEntitlements(ios) > 0, "The generated app has no notification entitlement file.");
mkdirSync(output, { recursive: true });
const archive = join(output, "Aigo.xcarchive");
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
assert.equal(info.CFBundleIdentifier, "dev.aigo.preview");
assert.equal(info.CFBundleShortVersionString, "0.7.6");
assert.equal(info.CFBundleVersion, "7006999");
assert.ok(info.UISupportedInterfaceOrientations?.includes("UIInterfaceOrientationLandscapeLeft"));
assert.ok(info.UISupportedInterfaceOrientations?.includes("UIInterfaceOrientationLandscapeRight"));
assert.ok(info.CFBundleSupportedPlatforms?.includes("iPhoneOS"), "Expected a physical-device app.");
assert.ok(existsSync(join(application, "main.jsbundle")), "Release JavaScript bundle is missing.");
assert.ok(!existsSync(join(application, "embedded.mobileprovision")), "Unexpected provisioning credentials in unsigned app.");
const architectures = run("lipo", ["-archs", join(application, info.CFBundleExecutable)], appDirectory, true);
assert.ok(architectures.split(/\s+/).includes("arm64"), "The app is missing the iPhone arm64 architecture.");
const payload = join(output, "Payload");
mkdirSync(payload);
cpSync(application, join(payload, basename(application)), { recursive: true, dereference: false });
const ipa = join(output, "Aigo-Preview-unsigned.ipa");
run("ditto", ["-c", "-k", "--keepParent", "Payload", basename(ipa)], output);
writeFileSync(join(output, "build-manifest.json"), `${JSON.stringify({
  app: "Aigo Preview",
  preview: 5,
  bundleIdentifier: info.CFBundleIdentifier,
  upstreamCommit: upstream,
  buildKitCommit: process.env.GITHUB_SHA ?? null,
  version: info.CFBundleShortVersionString,
  buildNumber: info.CFBundleVersion,
  configuration: "Release",
  devicePlatform: "iPhoneOS",
  architectures,
  signed: false,
  remotePushEnabled: false,
  notificationDiagnostics: true,
  requestedApnsEnvironment: "production",
  sha256: createHash("sha256").update(readFileSync(ipa)).digest("hex"),
  xcode: run("xcodebuild", ["-version"], appDirectory, true),
}, null, 2)}\n`);
console.log("Unsigned physical-device IPA packaged. Signing and iPhone execution remain unverified.");
