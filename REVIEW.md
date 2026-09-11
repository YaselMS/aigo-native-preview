# Public source package review

Published with explicit user approval: `YaselMS/aigo-native-preview`.

Only the contents of this build-kit directory are published:

- `patches/native-viewer.patch`: reviewed client/dependency changes against pinned upstream, including the native viewer, navigation/rotation repairs, notification diagnostics, pending requests, and subagent status/history checks.
- `aigo-native-desktop/`: plugin implementation, synthetic tests, package/typecheck configuration, and instructions. No installed dependencies.
- `.github/workflows/ios-preview.yml`: manually triggered macOS build; skips private repositories; no signing or publishing credentials.
- `scripts/`: identity validator and unsigned physical-device IPA packaging script.
- `.gitignore`, `README.md`, `REVIEW.md`, `LICENSE`, `NOTICE`.

The workflow downloads the public upstream source at its fixed commit. It does not upload the local checkout, runtime session files, project/chat data, screenshots, pairing records, or signing material. Test URLs and IDs are synthetic. The built application obtains host pairing and viewer access at runtime, not from bundled secrets.

The approved source publication and standard GitHub macOS build are complete. The unsigned native archive and downloaded IPA checks passed. The build workflow retains only the unsigned IPA and build manifest for one day and does not submit anything to Apple or Signulous. The separate manual publication workflow checks the exact first-build SHA-256 and publishes those two files as a GitHub prerelease for a stable phone download. `RELEASE-NOTES.md` records the validation boundary. Actual iPhone signing/install remains a user step.

First phone acceptance test:

1. Sign and install the IPA through the existing Signulous registration; open Aigo Preview.
2. Pair the isolated Windows test host and open its existing conversation.
3. Open Live desktop from that conversation, connect, and confirm live updates inside the app.
4. Take control and click/type in the disposable fixture. Return control to the agent, then return to the same chat.
5. Leave the viewer and background the app while holding control. Confirm host ownership expires/releases and reconnect never restores control automatically.

Notifications and final viewer layout are not acceptance criteria for this first build. They remain product work. Windows source checks and an iOS JavaScript bundle are not evidence of a successful native archive or device run.

Preview 6 source review: the added subagent paths contain only app code and synthetic tests. No host addresses, pairing records, notification topic, credentials or live conversation IDs are included. CI now runs the subagent selector/archive/presentation and history request/panel regressions. Identity validators require 0.7.7/build7007999. The gesture verification script normalizes Windows line endings before checking its guard.
