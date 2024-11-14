<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { db } from '../../firebase';
import { ref as dbRef, onValue } from 'firebase/database';
import AddBudgetModal from './AddBudgetModal.vue';

interface Budget {
  id: string;
  category: string;
  allocated: number;
  spent: number;
  remaining: number;
  period: string;
  startDate: string;
  endDate: string;
  createdAt: number;
}

const budgets = ref<Budget[]>([]);
const loading = ref(true);
const error = ref('');
const isAddModalOpen = ref(false);

onMounted(() => {
  const budgetsRef = dbRef(db, 'budgets');
  onValue(budgetsRef, (snapshot) => {
    loading.value = true;
    try {
      if (snapshot.exists()) {
        const data = snapshot.val();
        budgets.value = Object.entries(data).map(([id, budget]: [string, any]) => ({
          id,
          ...budget
        })).sort((a, b) => b.createdAt - a.createdAt);
      } else {
        budgets.value = [];
      }
    } catch (err) {
      console.error('Error loading budgets:', err);
      error.value = 'Bütçeler yüklenirken bir hata oluştu';
    } finally {
      loading.value = false;
    }
  });
});

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY'
  }).format(amount);
};

const calculateProgress = (spent: number, allocated: number) => {
  return (spent / allocated) * 100;
};
</script>

<template>
  <div class="min-h-screen bg-gray-100">
    <div class="py-10">
      <header>
        <div class="mx-auto px-4 sm:px-6 lg:px-8">
          <div class="md:flex md:items-center md:justify-between">
            <div class="min-w-0 flex-1">
              <h1 class="text-3xl font-bold leading-tight text-gray-900">
                Bütçe Planlama
              </h1>
              <p class="mt-2 text-sm text-gray-600">
                Kategori bazlı bütçe planlaması ve takibi
              </p>
            </div>
            <div class="mt-4 flex md:ml-4 md:mt-0">
              <button
                type="button"
                @click="isAddModalOpen = true"
                class="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Yeni Bütçe Ekle
              </button>
            </div>
          </div>
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
              
              <div v-else-if="budgets.length === 0" class="text-center py-4 text-gray-500">
                Henüz bütçe kaydı bulunmamaktadır
              </div>
              
              <div v-else class="space-y-6">
                <div v-for="budget in budgets" :key="budget.id" class="bg-white border rounded-lg p-6">
                  <div class="flex justify-between items-start mb-4">
                    <div>
                      <h3 class="text-lg font-medium text-gray-900">{{ budget.category }}</h3>
                      <p class="text-sm text-gray-500">{{ budget.period }}</p>
                      <p class="text-xs text-gray-400">
                        {{ new Date(budget.startDate).toLocaleDateString('tr-TR') }} - 
                        {{ new Date(budget.endDate).toLocaleDateString('tr-TR') }}
                      </p>
                    </div>
                    <div class="text-right">
                      <p class="text-sm text-gray-600">
                        Ayrılan: {{ formatCurrency(budget.allocated) }}
                      </p>
                      <p class="text-sm text-gray-600">
                        Harcanan: {{ formatCurrency(budget.spent) }}
                      </p>
                      <p class="text-sm font-medium" :class="budget.remaining >= 0 ? 'text-green-600' : 'text-red-600'">
                        Kalan: {{ formatCurrency(budget.remaining) }}
                      </p>
                    </div>
                  </div>

                  <!-- Progress Bar -->
                  <div class="mt-4">
                    <div class="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Kullanım</span>
                      <span>{{ Math.round(calculateProgress(budget.spent, budget.allocated)) }}%</span>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        class="h-2.5 rounded-full"
                        :class="[
                          calculateProgress(budget.spent, budget.allocated) > 100
                            ? 'bg-red-600'
                            : calculateProgress(budget.spent, budget.allocated) > 80
                              ? 'bg-yellow-600'
                              : 'bg-green-600'
                        ]"
                        :style="{ width: `${Math.min(calculateProgress(budget.spent, budget.allocated), 100)}%` }"
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>

    <AddBudgetModal
      :is-open="isAddModalOpen"
      @close="isAddModalOpen = false"
      @budget-added="isAddModalOpen = false"
    />
  </div>
</template>