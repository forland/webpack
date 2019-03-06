<template>
<b-navbar toggleable="md" type="dark" variant="primary" fixed="top">

  <b-navbar-toggle target="nav_collapse"></b-navbar-toggle>

  <b-navbar-brand><router-link to="/" exact>forlands.dk</router-link></b-navbar-brand>

  <b-collapse is-nav id="nav_collapse">

    <b-navbar-nav>

    </b-navbar-nav>

    <!-- Right aligned nav items -->
    <b-navbar-nav class="ml-auto">
      <b-nav-item disabled><router-link to="tables">Kampe</router-link></b-nav-item>
      <b-nav-item disabled><router-link to="play">Play</router-link></b-nav-item>
      <b-nav-item disabled><router-link to="carousel">Carousel</router-link></b-nav-item>
      <b-nav-item><router-link to="GetIp">GetIp</router-link></b-nav-item>
    </b-navbar-nav>

  </b-collapse>
</b-navbar>
</template>

<script>
export default {
  name: 'navbar',
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
    a {
        color: white;
    }
</style>
