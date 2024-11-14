<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { db } from '../../firebase';
import { ref as dbRef, get } from 'firebase/database';

const props = defineProps<{
  studentId: string;
}>();

interface HealthMetric {
  date: string;
  weight: number;
  height: number;
  bmi: number;
  injuries: {
    type: string;
    date: string;
    status: 'active' | 'recovered';
    notes: string;
  }[];
  assessments: {
    date: string;
    type: string;
    score: number;
    notes: string;
  }[];
}

const loading = ref(true);
const error = ref('');
const healthData = ref<HealthMetric | null>(null);

onMounted(async () => {
  try {
    const healthRef = dbRef(db, `studentHealth/${props.studentId}`);
    const snapshot = await get(healthRef);

    if (snapshot.exists()) {
      healthData.value = snapshot.val();
    }
  } catch (err) {
    console.error('Error loading health data:', err);
    error.value = 'Failed to load health data';
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div>
    <div v-if="loading" class="text-center py-4">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
    </div>

    <div v-else-if="error" class="text-red-500 text-center py-4">
      {{ error }}
    </div>

    <div v-else-if="!healthData" class="text-center py-4 text-gray-500">
      No health data available
    </div>

    <div v-else class="space-y-6">
      <!-- Basic Metrics -->
      <div class="grid grid-cols-3 gap-4">
        <div class="bg-gray-50 rounded-lg p-4">
          <div class="text-sm text-gray-500">Weight</div>
          <div class="mt-1 text-2xl font-semibold">{{ healthData.weight }} kg</div>
        </div>
        <div class="bg-gray-50 rounded-lg p-4">
          <div class="text-sm text-gray-500">Height</div>
          <div class="mt-1 text-2xl font-semibold">{{ healthData.height }} cm</div>
        </div>
        <div class="bg-gray-50 rounded-lg p-4">
          <div class="text-sm text-gray-500">BMI</div>
          <div class="mt-1 text-2xl font-semibold">{{ healthData.bmi.toFixed(1) }}</div>
        </div>
      </div>

      <!-- Injuries -->
      <div>
        <h4 class="text-lg font-medium text-gray-900 mb-4">Injury History</h4>
        <div class="space-y-4">
          <div
            v-for="(injury, index) in healthData.injuries"
            :key="index"
            class="bg-white shadow rounded-lg p-4"
          >
            <div class="flex justify-between items-start">
              <div>
                <h5 class="font-medium text-gray-900">{{ injury.type }}</h5>
                <p class="text-sm text-gray-500">{{ injury.notes }}</p>
                <p class="text-sm text-gray-500">
                  {{ new Date(injury.date).toLocaleDateString() }}
                </p>
              </div>
              <span
                :class="[
                  'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                  injury.status === 'active'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-green-100 text-green-800'
                ]"
              >
                {{ injury.status }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Physical Assessments -->
      <div>
        <h4 class="text-lg font-medium text-gray-900 mb-4">Physical Assessments</h4>
        <div class="space-y-4">
          <div
            v-for="(assessment, index) in healthData.assessments"
            :key="index"
            class="bg-white shadow rounded-lg p-4"
          >
            <div class="flex justify-between items-start">
              <div>
                <h5 class="font-medium text-gray-900">{{ assessment.type }}</h5>
                <p class="text-sm text-gray-500">{{ assessment.notes }}</p>
                <p class="text-sm text-gray-500">
                  {{ new Date(assessment.date).toLocaleDateString() }}
                </p>
              </div>
              <span class="text-lg font-semibold text-indigo-600">
                {{ assessment.score }}/100
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>