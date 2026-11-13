// public/sw.js を登録するスクリプト．React の描画を待たずに登録できるよう，<head> にそのまま埋め込む
// 共有の受け取り先になるには，Service Worker を登録したうえで PWA としてインストールする必要がある
export const SERVICE_WORKER_REGISTRATION_SCRIPT = `if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js'))
}`
