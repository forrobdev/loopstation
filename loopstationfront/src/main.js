import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { appPlugin } from './plugins/appPlugin.js'

import App from './App.vue'
import router from './router/index.js'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.use(appPlugin)

app.provide("ws", app.config.globalProperties["$ws"])


app.mount('#app')
