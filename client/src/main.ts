import Vue from 'vue'
import App from './App.vue'
import Footer from './Footer.vue'
import router from './router'

const VueGoodTable = require('vue-good-table').default
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

import 'vue-good-table/dist/vue-good-table.css'

Vue.component('font-awesome-icon', FontAwesomeIcon)
Vue.use(VueGoodTable)

Vue.config.productionTip = process.env.NODE_ENV === 'production'

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')

new Vue({
  router,
  render: h => h(Footer)
}).$mount('#footer')

