export const appPlugin = {
  install(app, options) {
    app.config.globalProperties.$ws = new WebSocket(`ws://${"localhost:3000"}`);
  }
}