<template>
  <v-app>
    <v-app-bar
      app
      color="primary"
      dark
    >
      <div class="d-flex align-center">
        <v-img
          alt="Vuetify Logo"
          class="shrink mr-2"
          contain
          src="https://jirehpro.co/wp-content/uploads/2021/01/cropped-Logo.png"
          transition="scale-transition"
          width="180"
        />
      </div>
    </v-app-bar>

    <v-main>
      <UserForm/>
    </v-main>
  </v-app>
</template>

<script>
import UserForm from './components/UserForm';
// import Users from './components/Users';

export default {
  components: { UserForm},
  data() {
      return {
      message: 'Form'
      }
  }, 
};
</script>
