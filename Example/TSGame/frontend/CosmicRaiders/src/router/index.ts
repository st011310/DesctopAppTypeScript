import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import SingUpView from '../views/SignUpView.vue'
import GameView from '../views/GameView.vue'
import LeaderboardView from '../views/LeaderboardView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: LoginView
    },
    {
      path: '/',
      name: 'Game',
      component: GameView
    },
    {
      path: '/signup',
      name: 'signup',
      component: SingUpView
    },
    {
      path: '/leaderboard',
      name: 'leaderboard',
      component: LeaderboardView
    }
  ]
})
const protectedRoutes = [
    'Game', 'leaderboard'
]

router.beforeEach((to, from, next) =>{
  const isProtected = protectedRoutes.includes(to.name);
  if(isProtected && !localStorage.getItem('token')) {
    next({
      path: '/login',
      query: {redirect: to.fullPath}
    })
  }
  else{
    if(!isProtected && localStorage.getItem('token') && (to.name == 'login' || to.name == 'signup')){
      next({
        path: '/'
      })
    }
    else{
      next();
    }
  }
})


export default router
