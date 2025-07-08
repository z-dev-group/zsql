<template>
  <div id="app">
    <Login v-if="!isLogined" />
    <Main v-if="isLogined" />
  </div>
</template>

<script>
import Login from "./Login.vue";
import Main from "./Main.vue";
import store from "./store";
export default {
  name: "App",
  computed: {
    isLogined() {
      return store.isLogin;
    }
  },
  components: {
    Login,
    Main
  }
};
</script>

<style>
</style>