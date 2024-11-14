<script setup lang="ts">
import { ref } from 'vue';
import { db } from '../firebase';
import { ref as dbRef, push, set } from 'firebase/database';

const props = defineProps<{
  isOpen: boolean;
  branchId: string;
}>();

const emit = defineEmits(['close', 'groupAdded']);

const name = ref('');
const timeSlot = ref('');
const loading = ref(false);
const error = ref('');

const resetForm = () => {
  name.value = '';
  timeSlot.value = '';
  error.value = '';
};

const closeModal = () => {
  resetForm();
  emit('close');
};

const validateTimeSlot = (value: string): boolean => {
  const pattern = /^([01]?[0-9]|2[0-3])\.[0-5][0-9]-([01]?[0-9]|2[0-3])\.[0-5][0-9]$/;
  if (!pattern.test(value)) {
    return false;
  }

  const [start, end] = value.split('-');
  const [startHour, startMinute] = start.split('.').map(Number);
  const [endHour, endMinute] = end.split('.').map(Number);
  
  const startTime = startHour * 60 + startMinute;
  const endTime = endHour * 60 + endMinute;
  
  return endTime > startTime && (endTime - startTime) === 60;
};

const addGroup = async () => {
  if (!name.value || !timeSlot.value) {
    error.value = 'Please fill in all fields';
    return;
  }

  if (!validateTimeSlot(timeSlot.value)) {
    error.value = 'Please enter a valid 1-hour time slot in format HH.MM-HH.MM';
    return;
  }

  loading.value = true;
  error.value = '';

  try {
    const newGroupRef = push(dbRef(db, `branches/${props.branchId}/groups`));
    await set(newGroupRef, {
      name: name.value,
      timeSlot: timeSlot.value,
      createdAt: Date.now()
    });

    resetForm();
    emit('groupAdded');
    emit('close');
  } catch (e) {
    error.value = 'Failed to add group';
    console.error(e);
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
  
  <div v-if="isOpen" class="fixed inset-0 z-10 overflow-y-auto">
    <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
      <div class="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
        <div class="absolute right-0 top-0 pr-4 pt-4">
          <button
            type="button"
            @click="closeModal"
            class="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            <span class="sr-only">Close</span>
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="sm:flex sm:items-start">
          <div class="mt-3 text-center sm:mt-0 sm:text-left w-full">
            <h3 class="text-xl font-semibold leading-6 text-gray-900">Add New Group</h3>
            <div class="mt-4">
              <form @submit.prevent="addGroup" class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700">Group Name</label>
                  <input
                    v-model="name"
                    type="text"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Time Slot</label>
                  <input
                    v-model="timeSlot"
                    type="text"
                    placeholder="10.00-11.00"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                  <p class="mt-1 text-sm text-gray-500">Format: HH.MM-HH.MM (1 hour duration)</p>
                </div>
                <div class="flex items-center justify-between">
                  <button
                    type="submit"
                    :disabled="loading"
                    class="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
                  >
                    {{ loading ? 'Adding...' : 'Add Group' }}
                  </button>
                  <p v-if="error" class="text-red-500 text-sm">{{ error }}</p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>