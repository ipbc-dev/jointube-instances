import Vue from 'vue'
import App from './App.vue'
import router from './router'

const VueGoodTable = require('vue-good-table').default
const FontAwesomeIcon = require('@fortawesome/vue-fontawesome').default

Vue.component('font-awesome-icon', FontAwesomeIcon)
Vue.use(VueGoodTable)

Vue.config.productionTip = process.env.NODE_ENV === 'production'

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')


