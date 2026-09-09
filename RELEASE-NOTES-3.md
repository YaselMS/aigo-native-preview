# Aigo Preview 3

Candidate native version 0.7.4, build 7004999. Same `dev.aigo.preview` bundle identifier and Paseo 0.7.2 protocol base.

- Keep the native phone shell compact through landscape and portrait rotation so the active viewer does not move into a different application tree.
- Ignore gesture mount notifications after their target detector has unmounted.
- Wrap error details and provide copying with pending, success, and failure feedback.

Local regression checks cover the gesture teardown race, stable phone layout selection, and error-copy states. They do not substitute for physical iPhone verification. Test both embedded and fullscreen rotation after installing.

Windows desktop services must run with normal user privileges. Remote desktop input into elevated applications remains unsupported. Native push notifications remain disabled in this preview.

This file accompanies a staged candidate. No Preview 3 IPA has been built or verified yet. Publication must use a separately reviewed successful build and independently verified artifact hash.
