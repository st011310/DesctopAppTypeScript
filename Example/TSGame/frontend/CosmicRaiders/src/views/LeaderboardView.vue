<template>
  <div>
    <Leaderboard/>
  </div>
</template>

<script>
import { RouterLink, RouterView } from 'vue-router'
import Leaderboard from '../components/Leaderboard.vue'
export default {
  name: 'LeaderboardView',
  components:{
    Leaderboard,
  }
}
</script>
