import { UserService, AuthenticationError } from '../services/user.service'
import { TokenService } from '../services/storage.service'
import router from '../router'

const login = {
  namespaced: true,
  state: {
    authenticating: false,
    isSessionExpires: false,
    authenticationErrorCode: 0,
    authenticationError: '',
    accessToken: TokenService.getToken(),
    user: TokenService.getUserInstance()
  },

  getters: {
    loggedIn: (state) => {
      return state.accessToken ? true : false
    },

    authenticationErrorCode: (state) => {
      return state.authenticationErrorCode
    },

    authenticationError: (state) => {
      return state.authenticationError
    },

    authenticating: (state) => {
      return state.authenticating
    }
  },

  mutations: {
    loginRequest (state) {
      state.authenticating = true;
      state.authenticationError = ''
      state.authenticationErrorCode = 0
    },

    loginSuccess (state, response) {
      state.accessToken = response.access_token
      state.user = response.user
      state.authenticating = false
    },

    loginError (state, {errorCode, errorMessage}) {
      state.authenticating = false
      state.authenticationErrorCode = errorCode
      state.authenticationError = errorMessage
    },

    cancelAuthentication (state) {
      state.authenticating = false
    },

    logoutSuccess (state) {
      state.accessToken = ''
      state.user = ''
    },

    // Error hooks
    unAuthorized (state, res) {
      state.authenticationErrorCode = res.status
      state.authenticationError = res.message
    }
  },

  actions: {
    async login({ commit }, payload) {
      commit('loginRequest')

      try {
        const response = await UserService.login(payload.employee_number, payload.password)
        commit('loginSuccess', response)

        // Redirect the user to the page he first tried to visit or to the home view
        router.push(router.history.current.query.redirect || '/')

        return true
      } 
      catch (e) {
        if (e instanceof AuthenticationError) {
          commit('loginError', {errorCode: e.errorCode, errorMessage: e.message})
        }

        return false
      }
    },

    async logout({ commit }) {
      await UserService.logout()
      commit('logoutSuccess')
      
      router.push('login')
    },

    unAuthorized ({ commit }, message) {
      UserService.logout()
      commit('logoutSuccess')
      commit('unAuthorized', message)
      router.push('/login')
    }
  }
}

export default login
