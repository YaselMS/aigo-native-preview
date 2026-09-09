Aigo Preview 2 adds landscape rotation and a fullscreen embedded desktop. About displays **v0.7.3 · Aigo Preview 2**, build **7003999**. This is an experimental Paseo-derived client, not an official Paseo release.

Sign and install the unsigned IPA using your existing signing arrangement. The bundle ID remains `dev.aigo.preview`. No host pairing or viewer credentials are included in the app.

Fullscreen preserves the camera position through the viewer's fullscreen control. Changing presentation recreates the embedded viewer and reconnects in viewing mode; taking control again is explicit. Native Done remains available if the web viewer fails. Native push notifications remain disabled.

The build checks types, lint, 31 focused navigation/bridge/lifecycle cases, preview identity, landscape orientation declarations, and the native arm64 archive. Publication verifies the exact source commit and independently checked IPA hash. Physical iPhone signing/install, rotation, fullscreen layout and the updated end-to-end workflow still require device acceptance.

The host needs the separately configured Aigo viewer/coordinator. This source package is not yet a bundled Windows installer. Host-side Viewer r3 supplies compact controls, pinch/pan, keyboard tools and explicit human control; those updates are served by the host rather than embedded in the IPA.
