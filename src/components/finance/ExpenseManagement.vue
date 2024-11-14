<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { db } from '../../firebase';
import { ref as dbRef, push, set, onValue } from 'firebase/database';
import AddExpenseModal from './AddExpenseModal.vue';
import ExpenseList from './ExpenseList.vue';

interface Expense {
  id: string;
  category: string;
  amount: number;
  description: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
  receipt?: string;
  approvedBy?: string;
  approvedAt?: number;
}

const expenses = ref<Expense[]>([]);
const loading = ref(true);
const error = ref('');
const isAddModalOpen = ref(false);

onMounted(() => {
  const expensesRef = dbRef(db, 'expenses');
  onValue(expensesRef, (snapshot) => {
    loading.value = true;
    try {
      if (snapshot.exists()) {
        const data = snapshot.val();
        expenses.value = Object.entries(data).map(([id, expense]: [string, any]) => ({
          id,
          ...expense
        })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      } else {
        expenses.value = [];
      }
    } catch (err) {
      console.error('Error loading expenses:', err);
      error.value = 'Giderler yüklenirken bir hata oluştu';
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
          <div class="md:flex md:items-center md:justify-between">
            <div class="min-w-0 flex-1">
              <h1 class="text-3xl font-bold leading-tight text-gray-900">
                Gider Yönetimi
              </h1>
              <p class="mt-2 text-sm text-gray-600">
                Kulüp giderlerini takip edin ve yönetin
              </p>
            </div>
            <div class="mt-4 flex md:ml-4 md:mt-0">
              <button
                type="button"
                @click="isAddModalOpen = true"
                class="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Yeni Gider Ekle
              </button>
            </div>
          </div>
        </div>
      </header>

      <main>
        <div class="mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div class="px-4 py-8 sm:px-0">
            <ExpenseList
              :expenses="expenses"
              :loading="loading"
              :error="error"
            />
          </div>
        </div>
      </main>
    </div>

    <AddExpenseModal
      :is-open="isAddModalOpen"
      @close="isAddModalOpen = false"
      @expense-added="isAddModalOpen = false"
    />
  </div>
</template>