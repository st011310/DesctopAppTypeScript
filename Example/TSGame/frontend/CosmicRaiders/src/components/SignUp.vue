<template>
  <div class="container">
    <div class="row py-4 d-flex flex-column align-items-center justify-content-center middle-content">
      <div class="col-md-8">
        <h3>Sign Up</h3>
        <hr>
      </div>
      <div class="col-md-8">
        <form @submit.prevent="submitForm">

          <div class="form-group my-2">
            <input type="username" placeholder="Login" name="username" v-model="username">
            <small v-if="errors.username" class="text-danger">{{errors.username}}</small>
          </div>

          <div class="form-group my-2">
            <input type="password" placeholder="Password" name="password" v-model="password">
            <small v-if="errors.password" class="text-danger">{{errors.password}}</small>
          </div>

          <div class="form-group my-2">
            <input type="password" placeholder="Confirm Password" name="password2" v-model="password2">
            <small v-if="errors.password2" class="text-danger">{{errors.password2}}</small>
          </div>

          <div class="form-group my-2 d-grid gap-2">
            <button class="btn btn-primary">Sign Up</button>
          </div>
          <div class="form-group my-2 d-grid gap-2">
            <p>
              Already have an account? <router-link class="text-decoration-none" to="/login">Login!</router-link>
            </p>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
export default {
  name: "SignUp",
  data() {
    return{
      username: "",
      password: "",
      password2: "",
      errors: {
        username: "",
        password: "",
        password2: "",
      }
    }
  },
  methods:{
    isValid(){
      let valid = true;
      if(!this.username){
        this.errors.username = "The field can't be blank";
      }
      if(!this.password){
        this.errors.password = "The field can't be blank";
      }
      if(!this.password2){
        this.errors.password2 = "The field can't be blank";
      }
      if(this.password && this.password2 && (this.password !== this.password2)){
        this.errors.password2 = "Passwords do not match";
      }
      if(this.errors.username || this.errors.password || this.errors.password2){
        valid = false;
      }
      return valid
    },
    submitForm(){
      this.errors.username = "";
      this.errors.password = "";
      this.errors.password2 = "";
      if(this.isValid()){
        const url = '/api/auth/users/';
        // debugger;
        axios.post(url, {username: this.username, password: this.password})
            .then(response =>{
              console.log(response.data)
              // this.$store.commit('setToken', response.data, response.data.user);
              this.$router.push('/login');
              this.username = "";
              this.password = "";
              this.password2 = "";
            })
            .catch(error =>{
              if(error.response.data.username){
                this.errors.username = error.response.data.username.join('');
              }
              else{
                this.errors.username = "";
              }
            })
      }
    }
  }
}
</script>

<style scoped lang="scss">
.middle-content{
  height: 100vh;
}
</style>