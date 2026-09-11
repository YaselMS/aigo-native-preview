// Reproduce the native gesture subscription race with actual React commit ordering.
// Native view lookup is replaced by a throwing sentinel; this does not simulate iOS.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const { createRequire } = require('node:module');
const root = path.resolve(process.argv[2] || 'paseo');
const req = createRequire(path.join(root, 'package.json'));
const ts = req('typescript');
const React = req('react');
const { JSDOM } = req('jsdom');
const dom = new JSDOM('<!doctype html><div id="root"></div>');
global.window = dom.window;
global.document = dom.window.document;
global.navigator = dom.window.navigator;
global.IS_REACT_ACT_ENVIRONMENT = true;
const { createRoot } = req('react-dom/client');
const base = path.join(root, 'node_modules/react-native-gesture-handler/src');
const hookFile = path.join(base, 'handlers/gestures/GestureDetector/useMountReactions.ts');
const fixed = fs.readFileSync(hookFile, 'utf8').replace(/\r\n/g, '\n');
const guard = '      // Layout teardown precedes passive subscription cleanup.\n      if (!state.isMounted) return;\n';
assert.ok(fixed.includes(guard), 'Installed gesture dependency is missing the reviewed guard');
const original = fixed.replace(guard, '');
function load(source, deps) {
  const output = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const exports = {};
  vm.runInNewContext(output, { exports, require: (name) => {
    if (!(name in deps)) throw new Error('Unexpected dependency: ' + name);
    return deps[name];
  }});
  return exports;
}
async function scenario(source) {
  const { MountRegistry } = load(fs.readFileSync(path.join(base, 'mountRegistry.ts'), 'utf8'), {});
  const { useMountReactions } = load(source, {
    react: React,
    '../../../mountRegistry': { MountRegistry },
    '../../utils': { transformIntoHandlerTags: (refs) => refs },
  });
  let staleCalls = 0;
  let liveCalls = 0;
  function Detector() {
    const state = React.useRef({ isMounted: false, attachedGestures: [{ config: { simultaneousWith: [42] } }] }).current;
    const update = React.useCallback(() => {
      if (!state.isMounted) {
        staleCalls++;
        throw new Error('Unable to find node on an unmounted component');
      }
      liveCalls++;
    }, [state]);
    React.useLayoutEffect(() => {
      state.isMounted = true;
      MountRegistry.gestureWillMount({ handlerTag: 42 });
      return () => { state.isMounted = false; };
    }, [state]);
    useMountReactions(update, state);
    return React.createElement('div');
  }
  const element = document.createElement('div');
  document.body.appendChild(element);
  const renderer = createRoot(element);
  let error = null;
  try {
    await React.act(() => renderer.render(React.createElement(Detector, { key: 'portrait' })));
    MountRegistry.gestureWillMount({ handlerTag: 99 });
    assert.equal(liveCalls, 0, 'unrelated gesture must not trigger update');
    MountRegistry.gestureWillMount({ handlerTag: 42 });
    assert.equal(liveCalls, 1, 'live relation must still update');
    for (const key of ['landscape', 'portrait', 'landscape-again', 'portrait-again']) {
      await React.act(() => renderer.render(React.createElement(Detector, { key })));
    }
    MountRegistry.gestureWillMount({ handlerTag: 42 });
    assert.equal(liveCalls, 2, 'replacement relation must still update exactly once');
  } catch (caught) { error = caught; }
  finally {
    await React.act(() => renderer.unmount());
    MountRegistry.gestureWillMount({ handlerTag: 42 });
    element.remove();
  }
  return { staleCalls, liveCalls, error: error?.message ?? null };
}
(async () => {
  const before = await scenario(original);
  assert.equal(before.staleCalls, 1);
  assert.match(before.error, /Unable to find node on an unmounted component/);
  const after = await scenario(fixed);
  assert.deepEqual(after, { staleCalls: 0, liveCalls: 2, error: null });
  console.log(JSON.stringify({ before, after }, null, 2));
})().catch(error => { console.error(error); process.exitCode = 1; });
