<script setup lang="ts">
defineProps<{
  loading: boolean;
  error: string;
  saveSuccess: boolean;
}>();

const emit = defineEmits(['save']);
</script>

<template>
  <div class="mt-6 flex items-center justify-end space-x-4">
    <p v-if="error" class="text-red-500">{{ error }}</p>
    <p v-if="saveSuccess" class="text-green-500">Attendance saved successfully!</p>
    <button
      @click="$emit('save')"
      :disabled="loading"
      class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
    >
      {{ loading ? 'Saving...' : 'Save Attendance' }}
    </button>
  </div>
</template>