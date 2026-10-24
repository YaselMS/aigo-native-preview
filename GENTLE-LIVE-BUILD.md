# Gentle live client test build

This branch applies `patches/gentle-live-client.patch` after the existing native
viewer patch. It carries only the client code and focused tests from integration
commit `5b37809c16fe284070dc1e632c04d44d0921214a`, relative to reconstructed
baseline `7b8e73b06b3f95463209b532e3e67fa77c97416b`. The original upstream pin,
licenses, viewer patch and signing arrangement remain the same.

Dispatch `ios-preview.yml` explicitly on this branch. It uses the standard public
repository `macos-15` runner with read-only repository permissions. Its only
upload is the unsigned device IPA and build manifest, retained for one day. It
does not create a release, deploy an app, use signing credentials or call a model.

The artifact is `aigo-gentle-live-unsigned-iphone`. Check the manifest's integration
source and patch hash before signing. Native display version remains 0.7.8/build
7008999; distinguish this build by its artifact and manifest, not that version.

This is a client test build, not a complete host installer. It requires the
matching development PC host and an explicitly preloaded live-session bridge.
This patch does not enable or qualify production named-pipe access. No session,
pairing credentials, host address, model trace or local runtime data is bundled.
Physical iPhone chat, desktop control and locked-phone alerts require separate
acceptance tests; a successful archive does not establish those capabilities.
