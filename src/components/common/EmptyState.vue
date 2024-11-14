<script setup lang="ts">
defineProps<{
  message: string;
}>();
</script>

<template>
  <div class="text-center py-4 text-gray-500">
    {{ message }}
  </div>
</template>