<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { db } from '../firebase';
import { ref as dbRef, onValue, remove } from 'firebase/database';
import AddTrainerModal from './AddTrainerModal.vue';
import EditTrainerModal from './EditTrainerModal.vue';
import ConfirmationModal from './common/ConfirmationModal.vue';
import Breadcrumb from './Breadcrumb.vue';
import { PencilSquareIcon, TrashIcon } from '@heroicons/vue/24/outline';

interface Trainer {
  id: string;
  name: string;
  email: string;
  phone: string;
  specialization: string;
  experience: string;
  availability: string[];
  certifications: string;
  createdAt: number;
}

const props = defineProps<{
  branchId: string;
  groupId: string;
  groupName: string;
  branchName: string;
}>();

const emit = defineEmits(['navigateToBranches', 'navigateToGroups']);

const trainers = ref<Trainer[]>([]);
const loading = ref(true);
const error = ref('');
const isAddModalOpen = ref(false);
const isEditModalOpen = ref(false);
const isConfirmModalOpen = ref(false);
const selectedTrainer = ref<Trainer | null>(null);
const trainerToDelete = ref<string | null>(null);

onMounted(() => {
  const trainersRef = dbRef(db, `branches/${props.branchId}/groups/${props.groupId}/trainers`);
  onValue(trainersRef, (snapshot) => {
    loading.value = false;
    if (snapshot.exists()) {
      const data = snapshot.val();
      trainers.value = Object.entries(data).map(([id, trainer]) => ({
        id,
        ...(trainer as Omit<Trainer, 'id'>)
      }));
    } else {
      trainers.value = [];
    }
  }, (err) => {
    loading.value = false;
    error.value = 'Eğitmenler yüklenirken bir hata oluştu';
    console.error(err);
  });
});

const confirmDelete = (id: string) => {
  trainerToDelete.value = id;
  isConfirmModalOpen.value = true;
};

const deleteTrainer = async () => {
  if (!trainerToDelete.value) return;
  
  try {
    await remove(dbRef(db, `branches/${props.branchId}/groups/${props.groupId}/trainers/${trainerToDelete.value}`));
    isConfirmModalOpen.value = false;
    trainerToDelete.value = null;
  } catch (e) {
    console.error('Eğitmen silinirken bir hata oluştu:', e);
  }
};

const openEditModal = (trainer: Trainer) => {
  selectedTrainer.value = trainer;
  isEditModalOpen.value = true;
};

const getBreadcrumbItems = () => {
  return [
    { name: 'Şubeler', onClick: () => emit('navigateToBranches'), current: false },
    { name: props.branchName, onClick: () => emit('navigateToGroups'), current: false },
    { name: props.groupName, current: true }
  ];
};

const getTrainerToDeleteName = () => {
  if (!trainerToDelete.value) return '';
  const trainer = trainers.value.find(t => t.id === trainerToDelete.value);
  return trainer?.name || '';
};
</script>

<template>
  <div class="min-h-screen bg-gray-100">
    <div class="py-10">
      <header>
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumb :items="getBreadcrumbItems()" />
          <div class="flex justify-between items-center">
            <div>
              <h1 class="text-3xl font-bold leading-tight text-gray-900">
                {{ groupName }} - Eğitmenler
              </h1>
              <p class="mt-1 text-sm text-gray-500">Bu gruptaki eğitmenleri yönetin</p>
            </div>
            <button
              @click="isAddModalOpen = true"
              class="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Yeni Eğitmen Ekle
            </button>
          </div>
        </div>
      </header>

      <main>
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div class="px-4 py-8 sm:px-0">
            <div class="bg-white shadow rounded-lg p-6">
              <div v-if="loading" class="text-center py-4">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
              </div>
              
              <div v-else-if="error" class="text-red-500 text-center py-4">
                {{ error }}
              </div>
              
              <div v-else-if="trainers.length === 0" class="text-center py-4 text-gray-500">
                Bu grupta henüz eğitmen bulunmamaktadır
              </div>
              
              <div v-else class="space-y-4">
                <div v-for="trainer in trainers" :key="trainer.id" class="border rounded-lg p-4 hover:bg-gray-50 transition duration-150">
                  <div class="flex justify-between items-start">
                    <div>
                      <h3 class="font-medium text-lg text-gray-900">{{ trainer.name }}</h3>
                      <p class="text-sm text-gray-600">{{ trainer.specialization }}</p>
                      <p class="text-sm text-gray-600">{{ trainer.email }} · {{ trainer.phone }}</p>
                      <div class="mt-2 flex flex-wrap gap-2">
                        <span
                          v-for="day in trainer.availability"
                          :key="day"
                          class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {{ day }}
                        </span>
                      </div>
                    </div>
                    <div class="flex items-center space-x-2">
                      <button
                        @click="openEditModal(trainer)"
                        class="p-2 text-blue-600 hover:text-blue-800 rounded-full hover:bg-blue-50 transition-colors"
                        title="Düzenle"
                      >
                        <PencilSquareIcon class="h-5 w-5" />
                      </button>
                      <button
                        @click="confirmDelete(trainer.id)"
                        class="p-2 text-red-600 hover:text-red-800 rounded-full hover:bg-red-50 transition-colors"
                        title="Sil"
                      >
                        <TrashIcon class="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>

    <AddTrainerModal
      :is-open="isAddModalOpen"
      :branch-id="branchId"
      :group-id="groupId"
      @close="isAddModalOpen = false"
      @trainer-added="isAddModalOpen = false"
    />

    <EditTrainerModal
      v-if="selectedTrainer"
      :is-open="isEditModalOpen"
      :trainer="selectedTrainer"
      :branch-id="branchId"
      :group-id="groupId"
      @close="isEditModalOpen = false"
      @trainer-updated="isEditModalOpen = false"
    />

    <ConfirmationModal
      :is-open="isConfirmModalOpen"
      title="Eğitmeni Sil"
      :message="`${getTrainerToDeleteName()} isimli eğitmeni silmek istediğinizden emin misiniz?`"
      confirm-text="Sil"
      cancel-text="İptal"
      @confirm="deleteTrainer"
      @cancel="isConfirmModalOpen = false"
    />
  </div>
</template>