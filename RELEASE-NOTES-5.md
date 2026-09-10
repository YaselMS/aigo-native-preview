# Aigo Preview 5

Version 0.7.6 · build 7006999 · bundle dev.aigo.preview.

Preview 4 delivered local notifications on the user's locked iPhone. Its device-token diagnostic stopped before Apple registration because expo-notifications passed null to an iOS function requiring a string.

This preview fixes that library mismatch while keeping automatic Expo/Paseo token uploads disabled. CI checks the actual SDK source and built JavaScript against a native bridge test double. Apple device registration and remote notification delivery still require physical-device verification.

Sign and install this unsigned IPA using the same settings as Preview 4: Push Notifications on, Custom Identifier blank, Install as duplicate off, Match Provisioning Identifier off. Install over the current Aigo Preview.

Confirm About shows 0.7.6 / Aigo Preview 5. Open Settings → Notifications → Run notification test. After it finishes, use Copy diagnostic report and send the report. Do not share the separate full device-token details publicly. No need to repeat lock-screen delivery testing unless it changes.

Existing desktop, landscape and pending-request changes remain included. This is an experimental preview, not a complete remote notification service. Signing is performed by the user's chosen service; this build contains no signing credentials or push provider credentials.
