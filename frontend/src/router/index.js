import Vue from 'vue'
import VueRouter from 'vue-router'
import { TokenService } from '../services/storage.service'
import { checkAuthParams } from './middlewares/auth-middleware'

const Main     = () => import(/* webpackChunkName: "main" */ '../layouts/Main')
const Login    = () => import(/* webpackChunkName: "login" */ '../views/auth/Login')
const Register = () => import(/* webpackChunkName: "register" */ '../views/auth/Register')

const Home = () => import(/* webpackChunkName: "home" */ '../views/Home')
const RequestForms = () => import(/* webpackChunkName: "request" */ '../views/RequestForms')

Vue.use(VueRouter)

const router = new VueRouter({
  mode: 'history',
  base: process.env.VUE_APP_NAME,
  routes: [
    { path: '*', redirect: '/home' },
    { path: '/', redirect: '/home'},
    { 
      path: '/', 
      component: Main,
      meta: { 
        requiresAuth: true 
      },
      children: [
        { path: 'home', component: Home },
        { path: 'your-requests', component: RequestForms }
      ]
    },
    { 
      path: '/login',
      component: Login,
      meta: { 
        forVisitors: true 
      }
    },
    {
      path: '/register',
      component: Register,
      meta: {
        forVisitors: true
      }
    }
  ]
})

router.beforeEach((to, from, next) => {
  const forVisitors = to.matched.some(record => record.meta.forVisitors)
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const isLoggedIn = !!TokenService.getToken()

  if(requiresAuth) {
    if (!isLoggedIn) {
      next('/login')
    }
    else {
      next()
    }
  } 
  else if (forVisitors) {
    if (!isLoggedIn) {
      checkAuthParams(to.query, next)
    }
    else {
      next()
    }
  }
  else next()
})

export default router