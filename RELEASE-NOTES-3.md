# Aigo Preview 3

Native version 0.7.4, build 7004999. Same `dev.aigo.preview` bundle identifier and Paseo 0.7.2 protocol base.

- Keep the native phone shell compact through landscape and portrait rotation so the active viewer does not move into a different application tree.
- Ignore gesture mount notifications after their target detector has unmounted.
- Wrap error details and provide copying with pending, success, and failure feedback.

Local regression checks cover the gesture teardown race, stable phone layout selection, and error-copy states. They do not substitute for physical iPhone verification. Test both embedded and fullscreen rotation after installing.

Windows desktop services must run with normal user privileges. Remote desktop input into elevated applications remains unsupported. Native push notifications remain disabled in this preview.

The macOS build passed, and the downloaded IPA independently verified version 0.7.4, build 7004999, the unchanged bundle identifier, both landscape orientations, arm64, and bundled JavaScript. Signing/install and physical iPhone acceptance remain pending. SHA-256: 7d005894f1c34267c3fec56be8d971cfa23dcc431183610125ceffceafa5068d.
