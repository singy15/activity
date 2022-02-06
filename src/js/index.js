const Vue = require('vue');
import './activity.js';

const app = Vue.createApp({
  components: {
    "activity": activity
  },
  methods: {
  },
  mounted() {
  }
}).mount('#app');

