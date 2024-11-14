<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { db } from '../../firebase';
import { ref as dbRef, get } from 'firebase/database';

const props = defineProps<{
  studentId: string;
}>();

interface Goal {
  id: string;
  title: string;
  description: string;
  targetDate: string;
  status: 'achieved' | 'in-progress' | 'upcoming';
  progress: number;
}

const loading = ref(true);
const error = ref('');
const goals = ref<Goal[]>([]);

onMounted(async () => {
  try {
    const goalsRef = dbRef(db, `studentGoals/${props.studentId}`);
    const snapshot = await get(goalsRef);

    if (snapshot.exists()) {
      goals.value = Object.entries(snapshot.val()).map(([id, goal]) => ({
        id,
        ...(goal as Omit<Goal, 'id'>)
      }));
    }
  } catch (err) {
    console.error('Error loading goals:', err);
    error.value = 'Failed to load goals';
  } finally {
    loading.value = false;
  }
});

const getStatusColor = (status: Goal['status']) => {
  switch (status) {
    case 'achieved':
      return 'bg-green-100 text-green-800';
    case 'in-progress':
      return 'bg-yellow-100 text-yellow-800';
    case 'upcoming':
      return 'bg-gray-100 text-gray-800';
  }
};
</script>

<template>
  <div>
    <div v-if="loading" class="text-center py-4">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
    </div>

    <div v-else-if="error" class="text-red-500 text-center py-4">
      {{ error }}
    </div>

    <div v-else-if="goals.length === 0" class="text-center py-4 text-gray-500">
      No goals set
    </div>

    <div v-else class="space-y-4">
      <div
        v-for="goal in goals"
        :key="goal.id"
        class="bg-white shadow rounded-lg p-4"
      >
        <div class="flex justify-between items-start mb-2">
          <div>
            <h4 class="text-lg font-medium text-gray-900">{{ goal.title }}</h4>
            <p class="text-sm text-gray-500">{{ goal.description }}</p>
          </div>
          <span
            :class="[
              'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
              getStatusColor(goal.status)
            ]"
          >
            {{ goal.status.replace('-', ' ') }}
          </span>
        </div>

        <div class="mt-4">
          <div class="flex justify-between text-sm text-gray-500 mb-1">
            <span>Progress</span>
            <span>{{ goal.progress }}%</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div
              class="bg-indigo-600 h-2 rounded-full"
              :style="{ width: `${goal.progress}%` }"
            />
          </div>
        </div>

        <div class="mt-2 text-sm text-gray-500">
          Target Date: {{ new Date(goal.targetDate).toLocaleDateString() }}
        </div>
      </div>
    </div>
  </div>
</template>