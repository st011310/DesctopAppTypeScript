<!--<script setup lang="ts">-->

<!--</script>-->

<template>
  <RouterView />
</template>

<script>
import { RouterLink, RouterView } from 'vue-router'
  export default{
    mounted(){
      this.$store.commit("initializeStore");
      console.log(this.$store.state.isAuthenticated)
    }
  }

</script>

<style lang="scss">
html{
  background: black;
}

#app{
  font-family: CRfont;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  background: black;
  color: white;
}
</style>
