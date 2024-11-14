<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { db } from '../../firebase';
import { ref as dbRef, get } from 'firebase/database';

const props = defineProps<{
  studentId: string;
}>();

interface Skill {
  name: string;
  currentLevel: number;
  previousLevel: number;
  maxLevel: number;
}

const loading = ref(true);
const error = ref('');
const skills = ref<Skill[]>([]);

onMounted(async () => {
  try {
    const skillsRef = dbRef(db, `studentSkills/${props.studentId}`);
    const snapshot = await get(skillsRef);

    if (snapshot.exists()) {
      skills.value = snapshot.val();
    }
  } catch (err) {
    console.error('Error loading skills data:', err);
    error.value = 'Failed to load skills data';
  } finally {
    loading.value = false;
  }
});

const calculateProgress = (current: number, max: number) => {
  return (current / max) * 100;
};

const calculateImprovement = (current: number, previous: number) => {
  return ((current - previous) / previous) * 100;
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

    <div v-else-if="skills.length === 0" class="text-center py-4 text-gray-500">
      No skills data available
    </div>

    <div v-else class="space-y-6">
      <div v-for="skill in skills" :key="skill.name" class="bg-gray-50 rounded-lg p-4">
        <div class="flex justify-between items-center mb-2">
          <h3 class="font-medium text-gray-900">{{ skill.name }}</h3>
          <span class="text-sm text-gray-500">
            Level {{ skill.currentLevel }}/{{ skill.maxLevel }}
          </span>
        </div>

        <!-- Current Progress Bar -->
        <div class="relative pt-1">
          <div class="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
            <div
              :style="{ width: `${calculateProgress(skill.currentLevel, skill.maxLevel)}%` }"
              class="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-500"
            ></div>
          </div>
        </div>

        <!-- Improvement Indicator -->
        <div class="flex items-center text-sm">
          <span
            :class="[
              'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
              calculateImprovement(skill.currentLevel, skill.previousLevel) > 0
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-800'
            ]"
          >
            {{ calculateImprovement(skill.currentLevel, skill.previousLevel).toFixed(1) }}% improvement
          </span>
        </div>
      </div>
    </div>
  </div>
</template>