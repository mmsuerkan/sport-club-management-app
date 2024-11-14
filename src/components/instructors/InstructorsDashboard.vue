<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { db } from '../../firebase';
import { ref as dbRef, onValue } from 'firebase/database';

interface Instructor {
  id: string;
  name: string;
  email: string;
  phone: string;
  specialization: string;
  experience: string;
  availability: string[];
  certifications: string;
  branchId: string;
  branchName: string;
  groupId: string;
  groupName: string;
}

const instructors = ref<Instructor[]>([]);
const loading = ref(true);
const error = ref('');

onMounted(() => {
  const branchesRef = dbRef(db, 'branches');
  onValue(branchesRef, (snapshot) => {
    loading.value = true;
    try {
      if (snapshot.exists()) {
        const branches = snapshot.val();
        const allInstructors: Instructor[] = [];
        
        Object.entries(branches).forEach(([branchId, branchData]: [string, any]) => {
          if (branchData.groups) {
            Object.entries(branchData.groups).forEach(([groupId, groupData]: [string, any]) => {
              if (groupData.trainers) {
                Object.entries(groupData.trainers).forEach(([trainerId, trainer]: [string, any]) => {
                  allInstructors.push({
                    id: trainerId,
                    branchId,
                    branchName: branchData.name,
                    groupId,
                    groupName: groupData.name,
                    ...(trainer as Omit<Instructor, 'id' | 'branchId' | 'branchName' | 'groupId' | 'groupName'>)
                  });
                });
              }
            });
          }
        });
        
        instructors.value = allInstructors.sort((a, b) => a.name.localeCompare(b.name));
      } else {
        instructors.value = [];
      }
    } catch (err) {
      console.error('Error loading instructors:', err);
      error.value = 'Eğitmenler yüklenirken bir hata oluştu';
    } finally {
      loading.value = false;
    }
  });
});
</script>

<template>
  <div class="min-h-screen bg-gray-100">
    <div class="py-10">
      <header>
        <div class="mx-auto px-4 sm:px-6 lg:px-8">
          <h1 class="text-3xl font-bold leading-tight text-gray-900">
            Eğitmenler
          </h1>
          <p class="mt-1 text-sm text-gray-500">Tüm eğitmenleri görüntüle ve yönet</p>
        </div>
      </header>

      <main>
        <div class="mx-auto sm:px-6 lg:px-8">
          <div class="px-4 py-8 sm:px-0">
            <div class="bg-white shadow rounded-lg p-6">
              <div v-if="loading" class="text-center py-4">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
              </div>
              
              <div v-else-if="error" class="text-red-500 text-center py-4">
                {{ error }}
              </div>
              
              <div v-else-if="instructors.length === 0" class="text-center py-4 text-gray-500">
                Eğitmen bulunamadı
              </div>
              
              <div v-else class="space-y-4">
                <div v-for="instructor in instructors" :key="instructor.id" class="border rounded-lg p-4 hover:bg-gray-50">
                  <div class="flex justify-between items-start">
                    <div>
                      <h3 class="font-medium text-lg text-gray-900">{{ instructor.name }}</h3>
                      <p class="text-sm text-gray-600">{{ instructor.specialization }}</p>
                      <p class="text-sm text-gray-600">{{ instructor.branchName }} · {{ instructor.groupName }}</p>
                      <div class="mt-2 flex flex-wrap gap-2">
                        <span
                          v-for="day in instructor.availability"
                          :key="day"
                          class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {{ day }}
                        </span>
                      </div>
                    </div>
                    <div class="text-sm text-gray-500">
                      <p>{{ instructor.email }}</p>
                      <p>{{ instructor.phone }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>