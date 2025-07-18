declare module '@tauri-apps/api/tauri' {
  export function invoke<T = any>(command: string, args?: Record<string, unknown>): Promise<T>;
} 