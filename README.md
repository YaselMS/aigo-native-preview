# Aigo Preview iPhone build kit

A source-only build kit for the native Paseo-derived Aigo client. Preview 2 adds landscape rotation, a fullscreen embedded desktop, and a distinct About label: version 0.7.3, build 7003999. The upstream chat protocol remains based on Paseo 0.7.2.

The first preview was signed, installed and tested on an iPhone. Chat, embedded viewing, fixture input, pinch/pan and release on background/navigation worked. Preview 2 still needs its own native build and device acceptance.

## Build and install

Run **Build unsigned Aigo Preview for iPhone** manually in GitHub Actions. It applies `patches/native-viewer.patch` to pinned upstream commit `9400a49af670fdb5db4af58e73f8df98588dbea9`, checks types/lint and focused tests, and packages an unsigned arm64 IPA on a standard public-repository macOS runner. There is no Apple, Expo or signing-service login in the build.

Download the IPA from a verified preview release and sign/install it using your existing signing arrangement. The bundle ID stays `dev.aigo.preview`. Pairing and viewer access are supplied at runtime; no private host URL or credential is bundled.

The `aigo-native-desktop` folder is the host plugin. A separately running Windows viewer/coordinator is required; this repository does not yet package the complete host installer. Fullscreen recreates the WebView and reconnects in viewing mode. Taking control again is explicit. Native push remains disabled for this independent preview bundle.

## Validation and publication

Preview 2 source checks include app/plugin types, focused lint, 25 navigation/bridge cases, six native lifecycle tests, Expo identity/orientation checks and patch application against the pinned upstream source. The native build separately checks the resulting IPA identity, landscape orientations, arm64 executable and bundled JavaScript. Those checks do not substitute for signing/install and physical iPhone testing.

Builds and release publication are manually triggered. Only reviewed source in this directory and verified unsigned IPA/manifest assets are public. Never upload the enclosing Aigo directory, runtime/session files, screenshots, chats, pairing material or signing keys. The historical preview-1 publication workflow remains pinned to its original exact artifact.
