<!--<script setup lang="ts">-->

<!--</script>-->

<template>
  <main>
    <div>
      <Login/>
    </div>
  </main>
</template>

<script>
import { RouterLink, RouterView } from 'vue-router'
import Login from '../components/Login.vue'
export default {
  name: 'LoginView',
  components:{
    Login,
  }
}
</script>