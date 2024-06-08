import {createStore} from 'vuex'
import axios from "axios";
// import Vue from 'vue'

// Vue.use(Vuex)
import Vuex from 'vuex'

export default createStore({
    state: {
        token: "",
        user: "",
        isAuthenticated: false
    },
    getters:{
    },
    mutations: {
        initializeStore(state) {
            if(localStorage.getItem('token')){
                state.token = localStorage.getItem('token');
                state.user = localStorage.getItem('user');
                state.isAuthenticated = true;
            }
            else{
                state.isAuthenticated = false;
            }
        },
        setToken(state, data){
            console.log("Set Up!", data)
            state.token = data.token;
            state.user = data.user;
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', data.user);
            state.isAuthenticated = true;
        },
        removeToken(state){
            state.token = "";
            state.user = "";
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }
    },
    actions: {
    },
    modules: {
    }
})