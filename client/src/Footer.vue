<template>
  <footer>
    <div class="container">
      <span v-html="footer" v-once></span> ·
      <a target="_blank" href="https://framagit.org/framasoft/peertube/instances-peertube">
        Hack this website!
      </a>
    </div>
  </footer>
</template>

<script>
module.exports = {
  data() {
    return {
      footer: process.env.VUE_APP_FOOTER
    }
  }
}
</script>

<style scoped>
  footer {
    width: 100%;
    height: 30px;
    line-height: 30px;
    background-color: #f5f5f5;
    margin-top: 20px;

    font-size: 0.7em;
    text-align: center;
  }
  p {
    color: lightgreen;
    text-align: center;
  }
</style>
