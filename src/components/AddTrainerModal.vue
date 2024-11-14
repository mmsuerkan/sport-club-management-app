<script setup lang="ts">
import { ref } from 'vue';
import { db } from '../firebase';
import { ref as dbRef, push, set } from 'firebase/database';

const props = defineProps<{
  isOpen: boolean;
  branchId: string;
  groupId: string;
}>();

const emit = defineEmits(['close', 'trainerAdded']);

const name = ref('');
const email = ref('');
const phone = ref('');
const specialization = ref('');
const experience = ref('');
const availability = ref<string[]>([]);
const certifications = ref('');
const loading = ref(false);
const error = ref('');

const availabilityOptions = [
  'Pazartesi',
  'Salı',
  'Çarşamba',
  'Perşembe',
  'Cuma',
  'Cumartesi',
  'Pazar'
];

const resetForm = () => {
  name.value = '';
  email.value = '';
  phone.value = '';
  specialization.value = '';
  experience.value = '';
  availability.value = [];
  certifications.value = '';
  error.value = '';
};

const closeModal = () => {
  resetForm();
  emit('close');
};

const validateForm = (): boolean => {
  if (!name.value.trim()) {
    error.value = 'İsim alanı zorunludur';
    return false;
  }
  if (!email.value.trim()) {
    error.value = 'E-posta alanı zorunludur';
    return false;
  }
  if (!phone.value.trim()) {
    error.value = 'Telefon alanı zorunludur';
    return false;
  }
  if (!specialization.value.trim()) {
    error.value = 'Uzmanlık alanı zorunludur';
    return false;
  }
  return true;
};

const addTrainer = async () => {
  if (!validateForm()) return;

  loading.value = true;
  error.value = '';

  try {
    const newTrainerRef = push(dbRef(db, `branches/${props.branchId}/groups/${props.groupId}/trainers`));
    await set(newTrainerRef, {
      name: name.value,
      email: email.value,
      phone: phone.value,
      specialization: specialization.value,
      experience: experience.value,
      availability: availability.value,
      certifications: certifications.value,
      createdAt: Date.now()
    });

    resetForm();
    emit('trainerAdded');
    emit('close');
  } catch (e) {
    console.error('Eğitmen eklenirken bir hata oluştu:', e);
    error.value = 'Eğitmen eklenirken bir hata oluştu';
  } finally {
    loading.value = false;
  }
};

const toggleAvailability = (day: string) => {
  const index = availability.value.indexOf(day);
  if (index === -1) {
    availability.value.push(day);
  } else {
    availability.value.splice(index, 1);
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
            <span class="sr-only">Kapat</span>
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="sm:flex sm:items-start">
          <div class="mt-3 text-center sm:mt-0 sm:text-left w-full">
            <h3 class="text-xl font-semibold leading-6 text-gray-900">Yeni Eğitmen Ekle</h3>
            <div class="mt-4">
              <form @submit.prevent="addTrainer" class="space-y-4">
                <!-- İsim -->
                <div>
                  <label class="block text-sm font-medium text-gray-700">İsim Soyisim</label>
                  <input
                    v-model="name"
                    type="text"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                </div>

                <!-- E-posta -->
                <div>
                  <label class="block text-sm font-medium text-gray-700">E-posta</label>
                  <input
                    v-model="email"
                    type="email"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                </div>

                <!-- Telefon -->
                <div>
                  <label class="block text-sm font-medium text-gray-700">Telefon</label>
                  <input
                    v-model="phone"
                    type="tel"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                </div>

                <!-- Uzmanlık Alanı -->
                <div>
                  <label class="block text-sm font-medium text-gray-700">Uzmanlık Alanı</label>
                  <input
                    v-model="specialization"
                    type="text"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                    placeholder="Örn: Basketbol, Fitness, Yüzme"
                  />
                </div>

                <!-- Deneyim -->
                <div>
                  <label class="block text-sm font-medium text-gray-700">Deneyim (Yıl)</label>
                  <input
                    v-model="experience"
                    type="number"
                    min="0"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>

                <!-- Müsaitlik Durumu -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Müsait Günler</label>
                  <div class="flex flex-wrap gap-2">
                    <button
                      v-for="day in availabilityOptions"
                      :key="day"
                      type="button"
                      @click="toggleAvailability(day)"
                      :class="[
                        'px-3 py-1 rounded-full text-sm font-medium',
                        availability.includes(day)
                          ? 'bg-indigo-100 text-indigo-800'
                          : 'bg-gray-100 text-gray-800'
                      ]"
                    >
                      {{ day }}
                    </button>
                  </div>
                </div>

                <!-- Sertifikalar -->
                <div>
                  <label class="block text-sm font-medium text-gray-700">Sertifikalar</label>
                  <textarea
                    v-model="certifications"
                    rows="3"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    placeholder="Sahip olduğu sertifikalar ve belgeler"
                  ></textarea>
                </div>

                <!-- Error Message -->
                <div v-if="error" class="text-red-500 text-sm mt-2">
                  {{ error }}
                </div>

                <!-- Submit Button -->
                <div class="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    :disabled="loading"
                    class="inline-flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                  >
                    {{ loading ? 'Ekleniyor...' : 'Eğitmen Ekle' }}
                  </button>
                  <button
                    type="button"
                    @click="closeModal"
                    class="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm"
                  >
                    İptal
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>