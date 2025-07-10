<template>
  <div id="app">
    <Login v-if="!isLogined" />
    <Main v-if="isLogined" />
  </div>
</template>

<script setup>
import { computed } from 'vue';
import Login from "./Login.vue";
import Main from "./Main.vue";
import store from "./store";

const isLogined = computed(() => store.isLogin);
</script>

<style>
</style>