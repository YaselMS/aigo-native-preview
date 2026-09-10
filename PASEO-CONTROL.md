# Temporary Paseo notification control

This is a personal source build of the original [Paseo](https://github.com/getpaseo/paseo) at commit `9400a49af670fdb5db4af58e73f8df98588dbea9`, version 0.7.2/build 7002999. No Aigo patch is applied. It retains Paseo's identity (`sh.paseo`), appearance and normal Expo push registration. It is not an official Paseo binary or an Aigo update.

Paseo is distributed under its [Apache-2.0 license](https://github.com/getpaseo/paseo/blob/9400a49af670fdb5db4af58e73f8df98588dbea9/LICENSE), also included in the packaged app resources. The app source is unchanged; the unsigned archive is assembled by this repository's separate control build scripts.

The experiment tests whether this app, re-signed through the existing Signulous arrangement, can receive a real remote alert through its original notification provider. A successful build, installation or token registration does not establish remote delivery. A delivered alert would establish this control only; Aigo still needs authorized sending for its own identity.

## Before installing

The same bundle identifier may replace or conflict with an existing Paseo installation. If Paseo is already installed, pause before installing this build and decide how to preserve that installation and its pairing state. Do not delete either existing app as a troubleshooting step. Aigo Preview uses a different runtime identifier and is not the intended installation target.

## Sign and connect

1. Upload `Paseo-Control-unsigned.ipa` to Signulous.
2. Enable **push notifications**. Leave Custom Identifier blank. Leave Install as duplicate app, Match provisioning identifier, Exclude provisioning profile and the other optional modifications off.
3. Install and open **Paseo**. Allow notifications when prompted. If no prompt appears, check iPhone Settings > Notifications > Paseo.
4. Pair it with the existing computer using a current pairing link. Its normal code registers a token with Expo and the paired Paseo host. This is the intended control-app flow; Aigo's diagnostic token must not be entered into another service.
5. Report that it is paired before starting the remote test. The test should target this installation, then check for a banner while the phone is locked. Do not force-quit the app during the first test.

Record a unique test label, sender ticket/receipt when available, and whether that exact label appeared under Paseo on the phone. Do not publish device tokens, pairing links, signed installation URLs or signing material.

No remote notification has been sent as part of building this archive. No signing key or provisioning profile is included. The unsigned archive must be signed before it can run on an iPhone.

The initially suggested [APNS-Demo](https://github.com/iRayanKhan/APNS-Demo) was checked on September 10, 2026. Its released binary points to an endpoint returning HTTP 501 for POST; the README's alternative host does not resolve. This control avoids asking the user to install that currently unusable demo.
