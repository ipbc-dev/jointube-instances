<template>
  <div>
    <header>
      <b-navbar toggleable="lg" variant="light">
        <div class="container">
        <b-navbar-brand to="/">
          <span v-html="title" v-once></span>
        </b-navbar-brand>

        <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>

        <b-collapse id="nav-collapse" is-nav>
          <b-navbar-nav class="ml-auto">

            <b-nav-item to="/instances" exact>
              Instances
            </b-nav-item>

            <b-nav-item to="/instances/add" exact>
              Add your instance
            </b-nav-item>

            <b-nav-item to="/instances/stats" exact>
              Stats
            </b-nav-item>

            <b-nav-item href="https://contact.framasoft.org" target="_blank">
              Report an instance
            </b-nav-item>
          </b-navbar-nav>
        </b-collapse>
        </div>
      </b-navbar>
    </header>

    <router-view id="main-container" class="container"/>
  </div>
</template>

<script>
import { BCollapse, BNavbar, BNavbarNav, BNavbarBrand, BNavItem, BNavbarToggle } from 'bootstrap-vue'

export default {
  components: {
    BCollapse,
    BNavbar,
    BNavbarBrand,
    BNavItem,
    BNavbarNav,
    BNavbarToggle
  },

  data () {
    return {
      title: process.env.VUE_APP_TITLE
    }
  }
}
</script>

<style lang="scss">
  @import '../node_modules/bootstrap/scss/bootstrap';

  a {
    outline: 0;

    &.router-link-active {
      font-weight: 600;
    }
  }

  #main-container {
    margin-top: 20px;
  }
</style>
