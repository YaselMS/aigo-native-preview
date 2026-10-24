import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const configPath = process.argv[2];
assert.ok(configPath, "Pass the JSON output of expo config --type prebuild.");
const parsed = JSON.parse(readFileSync(configPath, "utf8"));
const config = parsed.expo ?? parsed;
assert.equal(config.name, "AiGo Task Chat");
assert.equal(config.slug, "aigo-preview");
assert.equal(config.scheme, "aigo-task-chat");
assert.equal(config.ios?.bundleIdentifier, "dev.aigo.taskchat.preview");
assert.equal(config.extra?.aigoNativePreview, true);
assert.equal(config.extra?.aigoPreviewLabel, "AiGo Task Chat Preview 8");
assert.equal(config.extra?.aigoNotificationDiagnostics, false);
assert.equal(config.version, "0.7.9");
assert.equal(config.ios?.buildNumber, "7009999");
assert.equal(config.orientation, "default", "Preview must permit landscape rotation.");
assert.equal(config.owner, undefined, "Preview must not use an upstream Expo owner.");
assert.equal(config.extra?.eas, undefined, "Preview must not use an upstream EAS project.");
assert.equal(config.ios?.googleServicesFile, undefined);
assert.ok(
  (config.plugins ?? []).some((plugin) =>
    (Array.isArray(plugin) ? plugin[0] : plugin) === "expo-notifications",
  ),
  "The diagnostic preview must include the native notification capability.",
);
console.log("Independent AiGo display branding, preview identity, and native notification diagnostic configuration verified.");
