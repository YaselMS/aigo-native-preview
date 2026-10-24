import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";

const manifestPath = process.argv[2];
assert.ok(manifestPath, "Pass the unsigned build manifest path.");
const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
assert.equal(manifest.signed, false);
assert.equal(manifest.remotePushEnabled, false);
manifest.integration = {
  name: "gentle-task-chat",
  sourceCommit: "b8e132c10ee78f961415ff481b83ed365f0ef741",
  baselineCommit: "7b8e73b06b3f95463209b532e3e67fa77c97416b",
  patchSha256: createHash("sha256")
    .update(readFileSync("patches/gentle-task-chat.patch"))
    .digest("hex"),
  protocol: "task-device-v3",
  matchingPcSourceCommit: "b8e132c10ee78f961415ff481b83ed365f0ef741",
  pairingEnabledInArtifact: false,
  qualification: "Selected-task chat client. Requires the matching default-off development PC host and explicit volatile pairing. Physical iPhone acceptance remains pending; desktop and push are unverified.",
};
writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
