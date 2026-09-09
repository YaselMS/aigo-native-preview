import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const configPath = process.argv[2];
assert.ok(configPath, "Pass the JSON output of expo config --type prebuild.");
const parsed = JSON.parse(readFileSync(configPath, "utf8"));
const config = parsed.expo ?? parsed;
assert.equal(config.name, "Aigo Preview");
assert.equal(config.slug, "aigo-preview");
assert.equal(config.scheme, "aigo-preview");
assert.equal(config.ios?.bundleIdentifier, "dev.aigo.preview");
assert.equal(config.extra?.aigoNativePreview, true);
assert.equal(config.extra?.aigoPreviewLabel, "Aigo Preview 3");
assert.equal(config.version, "0.7.4");
assert.equal(config.ios?.buildNumber, "7004999");
assert.equal(config.orientation, "default", "Preview must permit landscape rotation.");
assert.equal(config.owner, undefined, "Preview must not use an upstream Expo owner.");
assert.equal(config.extra?.eas, undefined, "Preview must not use an upstream EAS project.");
assert.equal(config.ios?.googleServicesFile, undefined);
assert.ok(
  !(config.plugins ?? []).some((plugin) =>
    (Array.isArray(plugin) ? plugin[0] : plugin) === "expo-notifications",
  ),
  "Remote push is deliberately disabled in the native preview.",
);
assert.equal(config.ios?.entitlements?.["aps-environment"], undefined);
console.log("Independent Aigo Preview identity and push-disabled build configuration verified.");
