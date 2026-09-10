

export const appPlugin = {
  install(app, options) {
    app.config.globalProperties.$ws = new WebSocket(import.meta.env.VITE_API_KEY);
  }
}