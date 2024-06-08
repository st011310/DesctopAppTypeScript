import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";
import * as cors from "cors";

axios.defaults.baseURL = 'http://localhost:8000/'
const app = createApp(App)
app.use(store)
app.use(router, axios)
// const cors = require('cors')
// app.use(cors({origin: true}))
// app.use(function (req, res, next) {
//     res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8888');
//     res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
//     res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
//     res.setHeader('Access-Control-Allow-Credentials', true);
//     next();
// });
app.mount('#app')
