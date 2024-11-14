<script setup lang="ts">
defineProps<{
  status: 'completed' | 'pending' | 'failed';
}>();
</script>

<template>
  <span
    :class="[
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
      {
        'bg-green-100 text-green-800': status === 'completed',
        'bg-yellow-100 text-yellow-800': status === 'pending',
        'bg-red-100 text-red-800': status === 'failed'
      }
    ]"
  >
    {{ status.charAt(0).toUpperCase() + status.slice(1) }}
  </span>
</template>