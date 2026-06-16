/**
 * Ultra-aggressive polyfills for both Web (Browser) and Server (Node.js) environments.
 * Prevents crashes from native-only React Native features like requireNativeComponent.
 */
const applyGlobalPolyfills = () => {
  const isWeb = typeof window !== 'undefined';
  const isNode = !isWeb && typeof process !== 'undefined';

  if (!isWeb && !isNode) return;

  const createBlackHole = (name: string) => {
    const noop = () => null;
    return new Proxy(noop, {
      get: (target, prop) => {
        if (prop === 'get' || prop === 'getEnforcing') return () => ({});
        if (prop === 'addListener' || prop === 'removeListeners') return () => ({ remove: () => {} });
        return createBlackHole(`${name}.${String(prop)}`);
      },
      apply: () => null,
      construct: () => ({})
    });
  };

  const mockNativeComponent = (name: string) => createBlackHole(`NativeComponent(${name})`);

  // 1. Patch the global object
  const root: any = isWeb ? window : global;

  root.requireNativeComponent = root.requireNativeComponent || mockNativeComponent;

  if (!root.TurboModuleRegistry) {
    root.TurboModuleRegistry = {
      get: (name: string) => createBlackHole(`TurboModule(${name})`),
      getEnforcing: (name: string) => createBlackHole(`TurboModule(${name})`),
    };
  }

  if (!root.NativeModules) {
    root.NativeModules = new Proxy({}, {
      get: (target, prop) => createBlackHole(`NativeModule(${String(prop)})`)
    });
  }

  // 2. Mock process.env for the browser
  if (isWeb && typeof root.process === 'undefined') {
    root.process = { env: {} };
  }

  // 3. Patch the actual react-native module if it's already loaded or can be loaded
  try {
    const RN = require('react-native');
    if (RN) {
      RN.requireNativeComponent = RN.requireNativeComponent || mockNativeComponent;
      RN.TurboModuleRegistry = RN.TurboModuleRegistry || root.TurboModuleRegistry;
      RN.NativeModules = RN.NativeModules || root.NativeModules;
      if (typeof RN.verifyUniqueness !== 'function') RN.verifyUniqueness = () => {};
    }
  } catch (e) {
    // If require fails here, it might be because of the environment, which is fine
  }
};

applyGlobalPolyfills();
console.log("[Polyfills] Initialized (Universal)");
