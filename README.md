# Aigo Preview iPhone build kit

A source-only build kit for the native Paseo-derived Aigo client. Preview 5 uses version 0.7.6, build 7006999. It fixes native notification registration preparation and preserves Preview 4's pending-request improvements. Preview 3's rotation and desktop fixes remain included. The upstream chat protocol remains based on Paseo 0.7.2.

Preview 3 received positive physical-iPhone feedback for most features tested. Preview 4 visibly delivered local notifications on the locked iPhone, but its registration preparation failed before requesting an Apple device token. Preview 5's build and physical-device registration results are pending. See [Preview 5 notes](RELEASE-NOTES-5.md).

## Build and install

Run **Build unsigned Aigo Preview for iPhone** manually in GitHub Actions. It applies `patches/native-viewer.patch` to pinned upstream commit `9400a49af670fdb5db4af58e73f8df98588dbea9`, checks types/lint and focused tests, and packages an unsigned arm64 IPA on a standard public-repository macOS runner. There is no Apple, Expo or signing-service login in the build.

Download the IPA from a verified preview release and sign/install it using your existing signing arrangement. The bundle ID stays `dev.aigo.preview`. Pairing and viewer access are supplied at runtime; no private host URL or credential is bundled.

The `aigo-native-desktop` folder is the host plugin. A separately running Windows viewer/coordinator is required; this repository does not yet package the complete host installer. Fullscreen recreates the WebView and reconnects in viewing mode. Taking control again is explicit. Preview 4 preserves a requested APNs entitlement and adds user-triggered permission/local-notification/device-registration diagnostics. Automatic Expo/Paseo push registration remains disabled, and remote delivery is unverified. See [Preview 4 notes](RELEASE-NOTES-4.md).

## Validation and publication

CI checks app/plugin types, repository lint, focused regressions, preview configuration, and patch application to the pinned upstream source. The native build checks IPA identity, landscape orientations, arm64 executable and bundled JavaScript. Notification diagnostics distinguish local scheduling, APNs registration, and remote delivery. None of these checks substitutes for physical iPhone testing.

Builds and release publication are manually triggered. Only reviewed source in this directory and verified unsigned IPA/manifest assets are public. Never upload the enclosing Aigo directory, runtime/session files, screenshots, chats, pairing material or signing keys. The historical preview-1 publication workflow remains pinned to its original exact artifact.
