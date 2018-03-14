<template>
  <div>
    <div class="navbar navbar-expand-lg navbar-light bg-light">
      <div class="container">
        <a class="navbar-brand" href="#">PeerTube instances</a>
        <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNavAltMarkup">
          <div class="navbar-nav">
            <router-link class="nav-item nav-link" active-class="active" exact to="/instances">
              Instances <span class="sr-only">(current)</span>
            </router-link>

            <router-link class="nav-item nav-link" active-class="active" exact to="/instances/add">
              Add your instance
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <router-view id="main-container" class="container" />
  </div>
</template>

<style lang="scss">
  @import '../node_modules/bootstrap/scss/bootstrap';

  a {
    outline: 0;
  }

  #main-container {
    margin-top: 20px;
  }
</style>
