<script setup>
import PhaserGame from 'nuxtjs-phaser/phaserGame.vue'
import { getGame } from '@/game'
import $store from '@/store/index'

const game = () => getGame()
</script>

<template>
  <div class="game">
    <div style="font-family:CRfont; position:absolute; left:-1000px; visibility:hidden;">.</div>
    <PhaserGame :createGame="game" v-if="game" />
  </div>
  <div class="col-auto">
    <p>
      <router-link class="text-decoration-none" @click="test()" to="/leaderboard">Leaderboards</router-link>
    </p>
<!--    <button class="btn btn-dark" @click="killGame()">TEST(game.destroy(true, false))</button>-->
    <button class="btn btn-danger" @click="logout()">
      Log Out
    </button>
  </div>
</template>

<script>
import axios from "axios";
export default{
  name: 'NewRecord',
  data(){
    return{
      newHigh:{
        user: this.$store.state.user,
        score: 0
      }
    }
  },
  methods:{
    addNew(){
      axios.defaults.headers['Authorization'] = `Token ${this.$store.state.token}`;
      const url = '/create-hi-score';
      axios.post(url, this.newHigh).then(response =>{
        console.log(response.data);
        this.newHigh = {user: this.$store.state.user, score: 0};
      }).catch(error =>{
        console.log(error);
      })
    },
    logout(){
      this.$store.commit("removeToken")
      this.$router.push('/login')
    },
    test(){
    }
    // killGame(){
    //   game.destroy()
    // }
  }
}
</script>
<style scoped>
.game img {
  position: absolute;
  width: 50rem;
}

.buttons {
  display: inline;
  position: absolute;
  left: 28rem;
  top: 7rem;
  z-index: 1;
}

button {
  background-color: #fff;
  border: none;
  color: black;
  padding: 0.5rem;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 12px;
  border-radius: 8px;
  font-weight: 500;
}

button:hover {
  background-color: tomato;
  font-weight: 500;
}
</style>
