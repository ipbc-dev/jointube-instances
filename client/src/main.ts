import Vue from 'vue'
import App from './App.vue'
import router from './router'
const VueGoodTable = require('vue-good-table').default

Vue.use(VueGoodTable)

Vue.config.productionTip = process.env.NODE_ENV === 'production'

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')


