import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const configPath = process.argv[2];
assert.ok(configPath, "Pass the JSON output of expo config --type prebuild.");
const parsed = JSON.parse(readFileSync(configPath, "utf8"));
const config = parsed.expo ?? parsed;

assert.equal(config.name, "Paseo");
assert.equal(config.slug, "voice-mobile");
assert.equal(config.scheme, "paseo");
assert.equal(config.ios?.bundleIdentifier, "sh.paseo");
assert.equal(config.version, "0.7.2");
assert.equal(config.ios?.buildNumber, "7002999");
assert.equal(config.orientation, "portrait");
assert.equal(config.owner, "getpaseo");
assert.equal(config.extra?.eas?.projectId, "0e7f65ce-0367-46c8-a238-2b65963d235a");
assert.equal(config.extra?.fdroidBuild, false);
assert.equal(config.extra?.profileBuild, false);
assert.equal(config.ios?.googleServicesFile, undefined);

const notificationPlugin = (config.plugins ?? []).find((plugin) =>
  (Array.isArray(plugin) ? plugin[0] : plugin) === "expo-notifications",
);
assert.ok(notificationPlugin, "The upstream production app must include expo-notifications.");
assert.ok(Array.isArray(notificationPlugin), "Expected the upstream configured expo-notifications plugin.");
assert.equal(
  notificationPlugin[1]?.mode,
  undefined,
  "The control must preserve upstream's default development APNs environment.",
);

assert.equal(config.extra?.aigoNativePreview, undefined);
assert.equal(config.extra?.aigoPreviewLabel, undefined);
assert.equal(config.extra?.aigoNotificationDiagnostics, undefined);
console.log("Unmodified upstream Paseo production identity and remote-push configuration verified.");
