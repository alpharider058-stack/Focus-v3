export function requireNativeModule(name?: string) {
  return null;
}

export function requireOptionalNativeModule(name?: string) {
  return null;
}

export function requireNativeViewManager(name?: string) {
  return null;
}

export function registerWebModule(module: any) {
  return module;
}

export async function reloadAppAsync() {}

export function installOnUIRuntime() {}

export enum PermissionStatus {
  GRANTED = 'granted',
  UNDETERMINED = 'undetermined',
  DENIED = 'denied',
}

export function createPermissionHook() {
  return () => [{ status: PermissionStatus.GRANTED }, () => Promise.resolve({ status: PermissionStatus.GRANTED })];
}

export class EventEmitter {
  addListener() {
    return { remove: () => {} };
  }
  removeListener() {}
  emit() {}
}

export class NativeModule {}
export class SharedObject {}
export class SharedRef {}

export class CodedError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

export class UnavailabilityError extends CodedError {
  constructor(moduleName: string, propertyName: string) {
    super('ERR_UNAVAILABLE', `The method or property ${moduleName}.${propertyName} is not available on web`);
  }
}

export class LegacyEventEmitter extends EventEmitter {}

export const NativeModulesProxy = {};

export const Platform = {
  OS: 'web',
  select: (obj: any) => obj.web || obj.default,
};

export const uuid = {
  v4: () => Math.random().toString(36).substring(2, 9),
};

export function useReleasingSharedObject<T>(object: T): T {
  return object;
}

export function useReleasingSharedObjectWithLifecycle<T>(creator: () => T): T {
  return creator();
}

export default {
  requireNativeModule,
  requireOptionalNativeModule,
  requireNativeViewManager,
  registerWebModule,
  reloadAppAsync,
  installOnUIRuntime,
  EventEmitter,
  NativeModule,
  SharedObject,
  SharedRef,
  CodedError,
  UnavailabilityError,
  LegacyEventEmitter,
  NativeModulesProxy,
  Platform,
  uuid,
  useReleasingSharedObject,
  useReleasingSharedObjectWithLifecycle,
};
