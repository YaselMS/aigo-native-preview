# Aigo Preview iPhone build kit

A source-only build kit for the native Paseo-derived Aigo client. This Preview 3 candidate uses version 0.7.4, build 7004999. It keeps phone navigation compact across rotation, fixes a gesture listener teardown race, and makes error details readable and copyable. The upstream chat protocol remains based on Paseo 0.7.2.

The first two previews were signed and installed on an iPhone. Preview 2 demonstrated embedded and fullscreen desktop viewing, but rotation in either direction crashed in both presentations. This candidate addresses that report. No Preview 3 IPA has been built or published yet; physical acceptance remains pending.

## Build and install

Run **Build unsigned Aigo Preview for iPhone** manually in GitHub Actions. It applies `patches/native-viewer.patch` to pinned upstream commit `9400a49af670fdb5db4af58e73f8df98588dbea9`, checks types/lint and focused tests, and packages an unsigned arm64 IPA on a standard public-repository macOS runner. There is no Apple, Expo or signing-service login in the build.

Download the IPA from a verified preview release and sign/install it using your existing signing arrangement. The bundle ID stays `dev.aigo.preview`. Pairing and viewer access are supplied at runtime; no private host URL or credential is bundled.

The `aigo-native-desktop` folder is the host plugin. A separately running Windows viewer/coordinator is required; this repository does not yet package the complete host installer. Fullscreen recreates the WebView and reconnects in viewing mode. Taking control again is explicit. Native push remains disabled for this independent preview bundle.

## Validation and publication

Local candidate checks cover the gesture teardown regression, phone/tablet/web viewport decisions, stable phone-shell mounting through rotation, error-copy pending/success/failure states, preview configuration, and patch application to the pinned upstream source. The existing app type/lint and native lifecycle checks remain in CI, alongside the new regressions. The app/plugin type checks, repository lint, and 39 focused app tests pass locally. Native compilation and physical iPhone acceptance remain pending until the build and device checks complete. The native build independently checks IPA identity, landscape orientations, arm64 executable and bundled JavaScript. None of these checks substitutes for physical iPhone testing.

Builds and release publication are manually triggered. Only reviewed source in this directory and verified unsigned IPA/manifest assets are public. Never upload the enclosing Aigo directory, runtime/session files, screenshots, chats, pairing material or signing keys. The historical preview-1 publication workflow remains pinned to its original exact artifact.
