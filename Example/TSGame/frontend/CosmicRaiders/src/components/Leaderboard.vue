<template>
<!--  <h3 v-if="store.state.isAuthenticated">SAS</h3>-->
  <div class="container">
    <div class="row py-4 d-flex flex-column align-items-center justify-content-center middle-content">
      <div class="col-md-12">
        <h2>Leaderboard</h2>
      </div>
      <div class="col-md-12">
        <table class="table">
          <tbody>
          <tr>
            <td>Player</td>
            <td>Points</td>
          </tr>
          <tr v-for="item in scores" v-bind:key="item.id">
            <td>{{item.user}}</td>
            <td>{{item.score}}</td>
          </tr>
          </tbody>
        </table>
      </div>
      <div class="row">
        <p>
          <router-link class="text-decoration-none" to="/">Back to game</router-link>
        </p>
        <button class="btn btn-danger" @click="logout()">
          Log Out
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
export default {
  name: "Leaderboard",
  data() {
    return {
      scores: [],
    }
  },
  methods:{

    fetchLeaderboardList(){
      axios.defaults.headers['Authorization'] = `Token ${this.$store.state.token}`;
      const url = '/gethigh';
      axios.get(url).then(response =>{
        console.log(response.data);
        this.scores = response.data
      }).catch(error =>{
        console.log(error);
      })
    },
    logout(){
      this.$store.commit("removeToken");
      this.$router.push('/login')
    },
    test(){
      location.reload()
    }
    },
  mounted(){
    this.fetchLeaderboardList();
  }
  }
</script>

<style scoped lang="scss">
.middle-content{
  height: 100vh;
}

</style>