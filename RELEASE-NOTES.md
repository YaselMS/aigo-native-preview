First unsigned iPhone preview for testing Aigo's embedded desktop panel in a native Paseo-derived client. This is an experimental build, not an official Paseo release.

Download `Aigo-Preview-unsigned.ipa` and use your existing signing service to sign and install it. The app contains no host pairing or desktop access credentials; pair your host after launch.

Built with Xcode 16.4 from build-kit commit `0d3fe210ea4ef09b228c65b1dd6bd1d59f441678` and upstream `9400a49af670fdb5db4af58e73f8df98588dbea9`. Physical iPhone arm64, iOS 15.1+, bundle ID `dev.aigo.preview`.

Native Release archive, app identity, arm64 executable, bundled JavaScript, and downloaded IPA SHA-256 checks passed. Signing, installation, launch, pairing, and embedded viewer behavior on an actual iPhone remain unverified. Native remote push notifications are disabled in this preview.

SHA-256: `dcaf415bd48a1b579fa79167376a26d9958a4db1e04339e199488d042f7ec73d`

[Successful build](https://github.com/YaselMS/aigo-native-preview/actions/runs/34307725184)

The separate `aigo-native-desktop` host plugin is included in this repository. Its viewer/input path is currently limited to a disposable Windows fixture; this is not a general remote desktop release.
