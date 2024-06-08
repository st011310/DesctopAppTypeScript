<template>
  <main>
    <div>
      <SignUp/>
    </div>
  </main>
</template>

<script>
import { RouterLink, RouterView } from 'vue-router'
import SignUp from '../components/SignUp.vue'
export default {
  name: 'SignUpViewView',
  components:{
    SignUp,
  }
}
</script>