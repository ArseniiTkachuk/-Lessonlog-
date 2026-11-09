import { createApp } from 'vue'
import App from './App.vue'
import './style.css'
import './composables/useTheme.js' // застосувати тему до першого рендеру

createApp(App).mount('#app')