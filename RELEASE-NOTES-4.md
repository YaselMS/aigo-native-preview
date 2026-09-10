# Aigo Preview 4 — native notification experiment

Version **0.7.5**, build **7005999**. Same bundle ID `dev.aigo.preview` and `aigo-preview` scheme.

This preview adds an iPhone notification diagnostic under Settings → Notifications. It requests notification permission, schedules a local Aigo test, and attempts registration with Apple's push service. Results are copyable; the normal report masks the device token. The build preserves the requested APNs receiver entitlement for the external signer.

A local alert or successful device registration does **not** prove remote agent notifications work. Automatic Expo/Paseo push registration remains disabled; no provider credential, EAS project, host address, or device token is bundled. Signing determines the final entitlement and provisioning identity.

Existing permission and question cards now check current host state before sending, avoid duplicate submissions within the app process, and offer a status check when the response outcome is uncertain. Preview 3 rotation and desktop fixes remain included.

Sign and install with the existing arrangement. For this experiment enable **Push notifications**, preserve the app identity, and leave duplicate/custom-identifier options off. Keep the installed app until the update is ready. Physical-device notification and APNs results remain pending; this release is an experiment, not a claim of working background remote delivery.
