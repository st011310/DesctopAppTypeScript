<template>
  <div>
    <Game/>
  </div>
</template>

<script>
import { RouterLink, RouterView } from 'vue-router'
import Game from '../components/Game.vue'
export default {
  name: 'GameView',
  components:{
    Game,
  }
}
</script>
