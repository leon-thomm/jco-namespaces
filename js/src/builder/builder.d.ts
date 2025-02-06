export interface Component {
  name: string,
  binary: Uint8Array,
  path?: string,
}
import type { ComponentHandle } from './interfaces/wasmstudio-default-component-registry.js';
export { ComponentHandle };
export type ComponentInstanceId = number;
export type PortIndex = number;
import { WasmstudioDefaultComponentRegistry } from './interfaces/wasmstudio-default-component-registry.js';
export function instantiate(component: ComponentHandle): ComponentInstanceId;
export function removeInstance(id: ComponentInstanceId): void;
export function connectPorts(source: ComponentInstanceId, output: string, target: ComponentInstanceId, input: string): string;
export function disconnectPorts(source: ComponentInstanceId, output: string, target: ComponentInstanceId, input: string): string;
export function markForExport(id: ComponentInstanceId, port: string): string;
export function unmarkForExport(id: ComponentInstanceId, port: string): string;
export function currentWit(): string;
export function build(name: string): Component;
export function clear(): void;

export const $init: Promise<void>;
