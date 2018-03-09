import Vue from 'vue'
import Router from 'vue-router'

import InstanceList from '@/components/InstanceList.vue'
Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/instances',
      name: 'PeerTube instances',
      component: InstanceList
    },

    {
      path: '/instances/add',
      name: 'Add your instance',
      component: InstanceList
    }
  ]
})
