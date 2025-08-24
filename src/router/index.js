import { createRouter, createWebHistory } from 'vue-router'
import MainDashboard from '../components/MainDashboard.vue'
import RegisterMeal from '../components/RegisterMeal.vue'

const routes = [
  {
    path: '/',
    name: 'Main',
    component: MainDashboard
  },
  {
    path: '/register',
    name: 'Register',
    component: RegisterMeal
  },
  {
    path: '/register/:date?',
    name: 'RegisterWithDate',
    component: RegisterMeal,
    props: true
  }
  // Statistics는 나중에 파일 만든 후 추가
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
