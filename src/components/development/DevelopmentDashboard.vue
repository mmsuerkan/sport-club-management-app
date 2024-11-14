<script setup lang="ts">
import { ref } from 'vue';
import { useTranslation } from '../../composables/useTranslation';
import PerformanceOverview from './PerformanceOverview.vue';
import SkillTracker from './SkillTracker.vue';
import AttendanceCalendar from './AttendanceCalendar.vue';
import GoalsTracker from './GoalsTracker.vue';
import HealthMetrics from './HealthMetrics.vue';
import CoachFeedback from './CoachFeedback.vue';
import StudentSelector from './StudentSelector.vue';
import DevelopmentNotifications from './DevelopmentNotifications.vue';

const { t } = useTranslation();

interface Student {
  id: string;
  name: string;
  branchId: string;
  groupId: string;
}

const selectedStudent = ref<Student | null>(null);
const showNotifications = ref(false);

const handleStudentSelect = (student: Student | null) => {
  selectedStudent.value = student;
};

const toggleNotifications = () => {
  showNotifications.value = !showNotifications.value;
};
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <div class="py-8">
      <header>
        <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div class="md:flex md:items-center md:justify-between">
            <div class="min-w-0 flex-1">
              <h1 class="text-3xl font-bold leading-tight text-gray-900 sm:truncate">
                {{ t('development.title') }}
              </h1>
              <p class="mt-2 text-sm text-gray-600">
                {{ t('development.subtitle') }}
              </p>
            </div>
            <div class="mt-4 flex md:ml-4 md:mt-0">
              <button
                type="button"
                @click="toggleNotifications"
                class="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
              >
                <BellIcon class="h-5 w-5 mr-2" />
                Bildirimler
              </button>
            </div>
          </div>
        </div>
      </header>

      <main>
        <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <!-- Student Selector -->
          <div class="max-w-3xl mx-auto mt-6">
            <StudentSelector @select="handleStudentSelect" />
          </div>

          <div class="mt-8">
            <div v-if="showNotifications">
              <DevelopmentNotifications />
            </div>
            <div v-else>
              <!-- Student Development Data -->
              <div v-if="selectedStudent" class="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <!-- Performance Overview -->
                <div class="bg-white overflow-hidden shadow rounded-lg">
                  <div class="p-6">
                    <h2 class="text-lg font-medium text-gray-900 mb-6">
                      {{ t('development.performanceOverview') }}
                    </h2>
                    <PerformanceOverview :student-id="selectedStudent.id" />
                  </div>
                </div>

                <!-- Rest of the components... -->
                <!-- (Previous components remain unchanged) -->
              </div>

              <!-- No Student Selected Message -->
              <div v-else class="text-center">
                <!-- (Previous no-student message remains unchanged) -->
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>