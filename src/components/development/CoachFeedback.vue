<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { db } from '../../firebase';
import { ref as dbRef, get } from 'firebase/database';

const props = defineProps<{
  studentId: string;
}>();

interface Feedback {
  id: string;
  date: string;
  coach: string;
  notes: string;
  strengths: string[];
  improvements: string[];
  rating: number;
}

const loading = ref(true);
const error = ref('');
const feedback = ref<Feedback[]>([]);

onMounted(async () => {
  try {
    const feedbackRef = dbRef(db, `studentFeedback/${props.studentId}`);
    const snapshot = await get(feedbackRef);

    if (snapshot.exists()) {
      feedback.value = Object.entries(snapshot.val()).map(([id, data]) => ({
        id,
        ...(data as Omit<Feedback, 'id'>)
      })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }
  } catch (err) {
    console.error('Error loading feedback:', err);
    error.value = 'Failed to load feedback';
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

    <div v-else-if="feedback.length === 0" class="text-center py-4 text-gray-500">
      No feedback available
    </div>

    <div v-else class="space-y-6">
      <div
        v-for="item in feedback"
        :key="item.id"
        class="bg-white shadow rounded-lg p-6"
      >
        <div class="flex justify-between items-start mb-4">
          <div>
            <h4 class="font-medium text-gray-900">Coach {{ item.coach }}</h4>
            <p class="text-sm text-gray-500">
              {{ new Date(item.date).toLocaleDateString() }}
            </p>
          </div>
          <div class="flex items-center">
            <span class="text-sm text-gray-500 mr-2">Rating:</span>
            <div class="flex items-center">
              <template v-for="n in 5" :key="n">
                <svg
                  :class="[
                    'w-5 h-5',
                    n <= item.rating ? 'text-yellow-400' : 'text-gray-300'
                  ]"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </template>
            </div>
          </div>
        </div>

        <div class="prose prose-sm max-w-none text-gray-500 mb-4">
          {{ item.notes }}
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <h5 class="text-sm font-medium text-gray-900 mb-2">Strengths</h5>
            <ul class="space-y-1">
              <li
                v-for="(strength, index) in item.strengths"
                :key="index"
                class="text-sm text-gray-500 flex items-center"
              >
                <svg class="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                {{ strength }}
              </li>
            </ul>
          </div>
          <div>
            <h5 class="text-sm font-medium text-gray-900 mb-2">Areas for Improvement</h5>
            <ul class="space-y-1">
              <li
                v-for="(improvement, index) in item.improvements"
                :key="index"
                class="text-sm text-gray-500 flex items-center"
              >
                <svg class="w-4 h-4 text-yellow-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                {{ improvement }}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>