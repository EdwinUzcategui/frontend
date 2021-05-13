import Vue from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify'
import Vuelidate from 'vuelidate'

import VueSweetalert2 from 'vue-sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import * as VueGoogleMaps from "vue2-google-maps";
import GooglePlacesAutocompletePlugin from 'vue-better-google-places-autocomplete'

Vue.use(VueSweetalert2);

Vue.use(Vuelidate)

Vue.use(VueGoogleMaps, {
  load: {
    key: "AIzaSyDZzlFar2iUfuNjPVwHB2TO56XDgWhIcG8",
    libraries: 'places',
  },
});

Vue.use(GooglePlacesAutocompletePlugin)


Vue.config.productionTip = false

new Vue({
  vuetify,
  render: h => h(App)
}).$mount('#app')
