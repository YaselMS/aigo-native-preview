# Aigo Preview iPhone build kit

This folder is a standalone source-only build repository layout. It prepares an unsigned native Paseo client with Aigo's embedded desktop viewer. It has not been compiled with Xcode or installed on an iPhone yet.

## Before using it

The included client patch is `patches/native-viewer.patch`. It targets Paseo commit `9400a49af670fdb5db4af58e73f8df98588dbea9`. The workflow fails if the patch is missing or does not apply. The separate `aigo-native-desktop` folder contains the conversation panel plugin to install on the isolated test host after the new client is available.

The patch must implement `AIGO_PREVIEW_BUILD=1` with name `Aigo Preview`, slug and URL scheme `aigo-preview`, iOS bundle identifier `dev.aigo.preview`, and `extra.aigoNativePreview: true`. It must omit the upstream Expo owner, EAS project, Google service file, and `expo-notifications` config plugin. Native push registration must return without registering when `extra.aigoNativePreview` is true.

Publish only this reviewed build-kit folder to a dedicated public repository when authorized. Do not upload the enclosing Aigo directory: it contains local application state. No Apple account, certificate, signing secret, pairing token, viewer URL, or service credential belongs in this repository.

## Build and install

1. Run **Build unsigned Aigo Preview for iPhone** manually from GitHub Actions. Nothing runs on push or pull request.
2. The standard `macos-15` runner checks out pinned upstream source, applies the patch, builds dependencies, checks client types/lint, generates the Xcode project, and creates a Release `iphoneos` archive without signing.
3. Download `aigo-preview-unsigned-iphone` within one day. Extract the ZIP to obtain `Aigo-Preview-unsigned.ipa` and its SHA-256/build manifest.
4. Upload the IPA to the user's existing Signulous account and use its own signing/install flow on the registered iPhone. Credentials remain with the user; the build does not use Signulous or Apple credentials.
5. Open **Aigo Preview**, pair the test host, and test the existing chat and embedded desktop panel. An unsigned IPA or successful build does not establish signing, installation, runtime compatibility, or usability.

No Expo account or EAS service is used. Public repositories using standard GitHub-hosted runners have free build execution; private repositories and larger runners have different billing rules. This workflow uses a standard runner and retains only the IPA and manifest for one day. [GitHub runner documentation](https://docs.github.com/en/actions/reference/runners/github-hosted-runners)

The preview deliberately has no native remote push registration. A signing service's capability claims alone do not configure Aigo's APNs provider or prove notifications. Notification support needs a separate verified setup; the successful stock Paseo notification tests do not transfer to this independent bundle ID.

## Validation boundary

Windows checks completed: pinned dependency installation, workspace dependency builds, app/SDK TypeScript checks, repository lint, 15 viewer navigation cases, three plugin behavior tests, preview identity validation, build-script syntax, patch application against the pinned source, and an iOS Hermes JavaScript export (36.9 MB). These do not execute native iPhone code. The first Mac runner build must establish CocoaPods, native compilation, and IPA packaging. The first iPhone test must establish signed installation, launch, pairing, chat, embedded viewer input, and releasing control when leaving the viewer or backgrounding the app.

The workflow uses no automatic release or store submission. It does not start the Windows viewer or put a viewer address in the app bundle.
