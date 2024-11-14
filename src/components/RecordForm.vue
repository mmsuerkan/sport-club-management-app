<script setup lang="ts">
import { ref } from 'vue';
import { db } from '../firebase';
import { ref as dbRef, push, set } from 'firebase/database';

const name = ref('');
const email = ref('');
const loading = ref(false);
const error = ref('');

const emit = defineEmits(['recordAdded']);

const addRecord = async () => {
  if (!name.value || !email.value) {
    error.value = 'Please fill in all fields';
    return;
  }

  loading.value = true;
  error.value = '';

  try {
    const newRecordRef = push(dbRef(db, 'records'));
    await set(newRecordRef, {
      name: name.value,
      email: email.value,
      createdAt: Date.now()
    });

    name.value = '';
    email.value = '';
    emit('recordAdded');
  } catch (e) {
    error.value = 'Failed to add record';
    console.error(e);
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="bg-white shadow rounded-lg p-6">
    <h2 class="text-xl font-semibold mb-4">Add New Record</h2>
    <form @submit.prevent="addRecord" class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700">Name</label>
        <input
          v-model="name"
          type="text"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          required
        />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700">Email</label>
        <input
          v-model="email"
          type="email"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          required
        />
      </div>
      <div class="flex items-center justify-between">
        <button
          type="submit"
          :disabled="loading"
          class="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {{ loading ? 'Adding...' : 'Add Record' }}
        </button>
        <p v-if="error" class="text-red-500 text-sm">{{ error }}</p>
      </div>
    </form>
  </div>
</template>