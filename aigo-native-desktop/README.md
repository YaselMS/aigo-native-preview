# Aigo native desktop test plugin

Prepared for the modified Paseo client in `../paseo`. It is not installed on the running test host.

From the desktop-assistance conversation, open Command Center and choose **Open live desktop**. The panel has **Connect desktop**, **Disconnect**, and **Back to chat**. Connect obtains the private viewer address over the existing paired Paseo connection, then mounts the host-owned `DesktopView`. The stock client shows an unsupported-client message. No external browser fallback is offered.

## Host setup

The plugin subprocess requires two absolute paths in its inherited environment:

- `AIGO_DESKTOP_SESSION_FILE`: the existing desktop-assistance `runtime/session.json`.
- `AIGO_LIVE_URL_FILE`: live-desktop `runtime/phone-url.txt` created by `start-phone-test.ps1`.

Set both before starting the isolated desktop-assistance Paseo host; installing a plugin does not change an existing daemon's environment. Do not restart the main host on port 6767. Use only the existing test host and preserve its pairing/state.

The viewer and temporary HTTPS tunnel must be running. Files alone do not prove that the viewer is reachable. The native view reports loading failures without displaying the private URL. This prototype accepts only a root URL on a `trycloudflare.com` subdomain with a 64-character lowercase hex fragment. Start a new viewer to rotate an expired address, then disconnect and connect again in the panel.

Do not publish either runtime file or paste the URL into logs. The address grants viewer access. The plugin checks both the configured conversation and workspace before returning it, but this is a single-session capability link, not a new per-device authorization system. Existing viewer ownership and lease checks govern input.

## Local checks

Build the modified Paseo SDK first. Install this package's development dependencies, or use the checkout's installed `node_modules` through a local junction for this evaluation. Paseo supplies plugin runtime modules when installed.

Run `npm run typecheck` and `npm test`. Tests use temporary files with synthetic IDs and URLs; they never read the active desktop session. Before an iPhone build is accepted, verify the actual app opens this panel from its bound conversation, shows live frames, allows fixture input, returns to the same chat, and drops desktop control when hidden or backgrounded. These native checks have not yet run.
