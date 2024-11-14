<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { auth } from './firebase';

const router = useRouter();

onMounted(() => {
  auth.onAuthStateChanged((user) => {
    if (!user && router.currentRoute.value.meta.requiresAuth) {
      router.push('/login');
    }
  });
});
</script>

<template>
  <router-view></router-view>
</template>