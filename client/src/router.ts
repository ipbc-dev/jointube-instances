import Vue from 'vue'
import Router from 'vue-router'

import InstanceList from '@/components/InstanceList.vue'
import InstanceAdd from '@/components/InstanceAdd.vue'
import InstanceStats from '@/components/InstanceStats.vue'
Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      redirect: '/instances'
    },
    {
      path: '/instances',
      name: 'PeerTube instances',
      component: InstanceList
    },
    {
      path: '/instances/add',
      name: 'Add your instance',
      component: InstanceAdd
    },
    {
      path: '/instances/stats',
      name: 'Fediverse stats',
      component: InstanceStats
    }
  ]
})
