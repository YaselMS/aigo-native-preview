# AiGo Preview 6

Verified GitHub Actions build run `38196334220`, build-kit commit `291399adcf564e136d7caba8f9ddeafce1ba7255`, IPA SHA-256 `6d28eb22f70ee1e5e44d1365cf4bb543d0ff4981571446aef49936256f77611f`.

Version 0.7.7 · build 7007999 · bundle dev.aigo.preview.

Subagents waiting for a question or permission response now show that they need attention and are excluded from Archive finished. Provider subagent history failures show a retry path while preserving already loaded history.

The desktop, rotation, request-response and notification diagnostic fixes from earlier previews remain included. Version-one remote alerts use the separately configured ntfy app and Windows host. This build does not add native AiGo remote push.

Sign and install over the existing AiGo Preview using the same signing settings. Leave the custom identifier blank and duplicate installation off. Do not delete the existing app first. Confirm About shows 0.7.7 / AiGo Preview 6. Reopen the existing host and conversation; no new pairing should be needed when installed as an update.

Client regression tests and unsigned native artifact checks do not replace physical-device acceptance. The fresh-project test remains deferred. The next phone check is limited to opening existing subagent history and confirming navigation still works.
