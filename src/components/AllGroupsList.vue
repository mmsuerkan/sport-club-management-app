<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { db } from '../firebase';
import { ref as dbRef, onValue } from 'firebase/database';
import { UserGroupIcon, AcademicCapIcon } from '@heroicons/vue/24/outline';

interface Group {
  id: string;
  name: string;
  branchId: string;
  branchName: string;
  trainers?: Record<string, any>;
  students?: Record<string, any>;
}

const groups = ref<Group[]>([]);
const loading = ref(true);
const error = ref('');

onMounted(() => {
  const branchesRef = dbRef(db, 'branches');
  onValue(branchesRef, (snapshot) => {
    loading.value = true;
    try {
      if (snapshot.exists()) {
        const branches = snapshot.val();
        const allGroups: Group[] = [];
        
        Object.entries(branches).forEach(([branchId, branchData]: [string, any]) => {
          if (branchData.groups) {
            Object.entries(branchData.groups).forEach(([groupId, group]: [string, any]) => {
              allGroups.push({
                id: groupId,
                name: group.name,
                branchId,
                branchName: branchData.name,
                trainers: group.trainers || {},
                students: group.students || {}
              });
            });
          }
        });
        
        groups.value = allGroups.sort((a, b) => a.name.localeCompare(b.name));
      } else {
        groups.value = [];
      }
    } catch (err) {
      console.error('Error loading groups:', err);
      error.value = 'Gruplar yüklenirken bir hata oluştu';
    } finally {
      loading.value = false;
    }
  });
});

const getTrainerCount = (group: Group): number => {
  return group.trainers ? Object.keys(group.trainers).length : 0;
};

const getStudentCount = (group: Group): number => {
  return group.students ? Object.keys(group.students).length : 0;
};
</script>

<template>
  <div class="min-h-screen bg-gray-100">
    <div class="py-10">
      <header>
        <div class="mx-auto px-4 sm:px-6 lg:px-8">
          <h1 class="text-3xl font-bold leading-tight text-gray-900">
            Tüm Gruplar
          </h1>
          <p class="mt-1 text-sm text-gray-500">Şubelerdeki tüm grupları görüntüle</p>
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
              
              <div v-else-if="groups.length === 0" class="text-center py-4 text-gray-500">
                Grup bulunamadı
              </div>
              
              <div v-else class="space-y-4">
                <div v-for="group in groups" :key="group.id" class="border rounded-lg p-4 hover:bg-gray-50">
                  <div class="flex justify-between items-center">
                    <div>
                      <h3 class="font-medium text-lg text-gray-900">{{ group.name }}</h3>
                      <p class="text-sm text-gray-600">Şube: {{ group.branchName }}</p>
                    </div>
                    <div class="flex items-center space-x-6">
                      <div class="flex items-center text-gray-600">
                        <UserGroupIcon class="h-5 w-5 mr-2" />
                        <span class="text-sm">{{ getTrainerCount(group) }} Eğitmen</span>
                      </div>
                      <div class="flex items-center text-gray-600">
                        <AcademicCapIcon class="h-5 w-5 mr-2" />
                        <span class="text-sm">{{ getStudentCount(group) }} Öğrenci</span>
                      </div>
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