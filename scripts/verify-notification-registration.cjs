// Execute the installed SDK implementation, with only its native/network dependencies replaced.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
assert.ok(process.argv[2], 'Pass the patched Paseo checkout.');
const repo = path.resolve(process.argv[2]);
assert.equal(require(path.join(repo, 'node_modules/expo-notifications/package.json')).version, '0.32.16');
const ts = require(path.join(repo, 'node_modules/typescript'));
const fixture = repo;
const tick = () => new Promise(resolve => setImmediate(resolve));

function transpile(file, dependencies, restoreOriginal = false) {
  let source = fs.readFileSync(file, 'utf8');
  if (restoreOriginal) {
    const expression = 'JSON.stringify({ isEnabled: enabled })';
    assert.equal(source.split(expression).length - 1, 1);
    assert.ok(!source.includes('enabled ? ' + expression));
    source = source.replace(expression, 'enabled ? ' + expression + ' : null');
  }
  const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const exports = {};
  vm.runInNewContext(js, { exports, require(name) {
    if (!(name in dependencies)) throw new Error('Unexpected dependency: ' + name);
    return dependencies[name];
  }, AbortController, console, setTimeout, clearTimeout, Error }, { filename: file });
  return exports;
}

function load(base, suffix, initial = null, restoreOriginal = false) {
  const state = { stored: initial, listeners: [], updates: [], fetches: 0, fail: false };
  const native = {
    async getRegistrationInfoAsync() { return state.stored; },
    async setRegistrationInfoAsync(value) {
      if (typeof value !== 'string') throw new Error('Native String bridge rejected null');
      if (state.fail) throw new Error('Native storage unavailable');
      state.stored = value;
    },
  };
  const api = transpile(path.join(base, 'node_modules/expo-notifications', suffix), {
    'abort-controller/polyfill': {},
    'expo-modules-core': { UnavailabilityError: Error },
    './ServerRegistrationModule': { default: native },
    './TokenEmitter': { addPushTokenListener(fn) { state.listeners.push(fn); } },
    './getDevicePushTokenAsync': { default: async () => { state.fetches++; return { type: 'ios', data: 'synthetic-token' }; } },
    './utils/updateDevicePushTokenAsync': { updateDevicePushTokenAsync: async (signal, token) => {
      state.updates.push({ signal, token });
      if (state.blockUpdates) await new Promise(resolve => signal.addEventListener('abort', resolve, { once: true }));
    } },
  }, restoreOriginal);
  return { api, state };
}

async function diagnostic(api) {
  let calls = 0;
  const implementation = transpile(path.join(repo, 'packages/app/src/push-notifications/preview-diagnostic.ts'), {});
  const result = await implementation.runNotificationDiagnostic({
    api: {
      requestPermissionsAsync: async () => ({ granted: true }),
      scheduleNotificationAsync: async () => 'synthetic-local-id',
      setAutoServerRegistrationEnabledAsync: api.setAutoServerRegistrationEnabledAsync,
      getDevicePushTokenAsync: async () => { calls++; return { type: 'ios', data: 'synthetic-token' }; },
    }, notification: {}, signal: new AbortController().signal, onPhase() {},
  });
  return { result, calls };
}

(async () => {
  const checks = [];
  for (const suffix of ['src/DevicePushTokenAutoRegistration.fx.ts', 'build/DevicePushTokenAutoRegistration.fx.js']) {
    const original = load(repo, suffix, null, true);
    await tick();
    const failed = await diagnostic(original.api);
    assert.equal(failed.result.registration.status, 'error');
    assert.match(failed.result.registration.message, /String bridge/);
    assert.equal(failed.calls, 0);
    checks.push(suffix + ': original diagnostic reproduces failure before APNs');

    const fixed = load(fixture, suffix);
    await tick();
    const success = await diagnostic(fixed.api);
    assert.equal(success.result.registration.status, 'success');
    assert.equal(success.calls, 1);
    assert.equal(fixed.state.stored, '{"isEnabled":false}');
    await fixed.state.listeners[0]({ type: 'ios', data: 'later-token' });
    assert.equal(fixed.state.updates.length, 0);
    assert.equal(fixed.state.fetches, 0);
    checks.push(suffix + ': fixed diagnostic reaches native registration; token event does not upload');

    const restarted = load(fixture, suffix, fixed.state.stored);
    await tick();
    assert.equal(restarted.state.updates.length, 0);
    assert.equal(restarted.state.fetches, 0);
    checks.push(suffix + ': disabled state persists across startup');

    await fixed.api.setAutoServerRegistrationEnabledAsync(true);
    assert.equal(fixed.state.stored, '{"isEnabled":true}');
    fixed.state.blockUpdates = true;
    const pendingUpdate = fixed.state.listeners[0]({ type: 'ios', data: 'enabled-token' });
    await tick();
    assert.equal(fixed.state.updates.length, 1);
    assert.equal(fixed.state.updates[0].signal.aborted, false);
    await fixed.api.setAutoServerRegistrationEnabledAsync(false);
    assert.equal(fixed.state.updates[0].signal.aborted, true);
    await pendingUpdate;
    checks.push(suffix + ': enabled behavior preserved; disabling cancels pending update via abort signal');

    fixed.state.fail = true;
    const storageFailed = await diagnostic(fixed.api);
    assert.equal(storageFailed.result.registration.status, 'error');
    assert.match(storageFailed.result.registration.message, /Native storage unavailable/);
    assert.equal(storageFailed.calls, 0);
    checks.push(suffix + ': native storage errors remain fail-closed');
  }
  const swift = fs.readFileSync(path.join(repo, 'node_modules/expo-notifications/ios/EXNotifications/ServerRegistration/ServerRegistrationModule.swift'), 'utf8');
  assert.match(swift, /AsyncFunction\("setRegistrationInfoAsync"\)\s*\{\s*\(registrationInfo: String\)/);
  const installer = fs.readFileSync(path.join(fixture, 'scripts/postinstall-patches.mjs'), 'utf8');
  assert.ok(installer.includes('patchPrefix: "expo-notifications+"'));
  const { parsePatchFile } = require(path.join(repo, 'node_modules/patch-package/dist/patch/parse.js'));
  const parsed = parsePatchFile(fs.readFileSync(path.join(repo, 'patches/expo-notifications+0.32.16.patch'), 'utf8'));
  assert.equal(parsed.length, 2);
  checks.push('patch-package accepts both SDK file patches; postinstall includes the new dependency');
  const report = { status: 'passed', checks, limitations: 'Native bridge and APNs calls are test doubles. No real APNs registration or remote delivery is claimed. Existing asynchronous enabled-startup race is outside this narrow correction.' };
  console.log(JSON.stringify(report, null, 2));
})().catch(error => { console.error(error); process.exitCode = 1; });
