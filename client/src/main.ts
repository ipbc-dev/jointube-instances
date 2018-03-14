import Vue from 'vue'
import App from './App.vue'
import router from './router'

Vue.config.productionTip = process.env.NODE_ENV === 'production'

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
