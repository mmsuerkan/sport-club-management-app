<script setup lang="ts">
import { ref } from 'vue';
import { useTranslation } from '../composables/useTranslation';
import { db } from '../firebase';
import { ref as dbRef, onValue } from 'firebase/database';
import { 
  HomeIcon, 
  BuildingOfficeIcon, 
  UserGroupIcon, 
  AcademicCapIcon,
  ClipboardDocumentCheckIcon,
  ClockIcon,
  CreditCardIcon,
  ChartBarIcon,
  BellIcon,
  BanknotesIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/vue/24/outline';

const isOpen = ref(true);
const isPaymentExpanded = ref(false);
const isFinanceExpanded = ref(false);
const { t } = useTranslation();

const toggleSidebar = () => {
  isOpen.value = !isOpen.value;
};

const togglePaymentMenu = () => {
  isPaymentExpanded.value = !isPaymentExpanded.value;
};

const toggleFinanceMenu = () => {
  isFinanceExpanded.value = !isFinanceExpanded.value;
};

defineProps<{
  currentPath: string;
}>();

const emit = defineEmits(['navigate']);

const navigation = [
  { name: t('common.dashboard'), icon: HomeIcon, path: 'dashboard' },
  { name: t('common.branches'), icon: BuildingOfficeIcon, path: 'branches' },
  { name: t('common.groups'), icon: UserGroupIcon, path: 'groups' },
  { name: t('common.students'), icon: AcademicCapIcon, path: 'students' },
  { name: 'Eğitmenler', icon: UserGroupIcon, path: 'instructors' },
  { name: t('attendance.takeAttendance'), icon: ClipboardDocumentCheckIcon, path: 'attendance' },
  { name: t('attendance.viewRecords'), icon: ClockIcon, path: 'attendance-records' },
  { 
    name: 'Ödemeler',
    icon: CreditCardIcon,
    path: 'payments',
    subItems: [
      { name: 'Genel Bakış', path: 'payments' },
      { name: 'Ödeme Geçmişi', path: 'payment-history' },
      { name: 'Bekleyen Ödemeler', path: 'due-payments' }
    ]
  },
  {
    name: 'Finans Yönetimi',
    icon: BanknotesIcon,
    path: 'finance',
    subItems: [
      { name: 'Genel Bakış', path: 'finance-overview' },
      { name: 'Gider Yönetimi', path: 'expenses' },
      { name: 'Bütçe Planlama', path: 'budget' },
      { name: 'Finansal Raporlar', path: 'financial-reports' }
    ]
  },
  { name: t('common.development'), icon: ChartBarIcon, path: 'development' },
  { name: 'Bildirim Yönetimi', icon: BellIcon, path: 'notifications' }
];
</script>

<template>
  <div class="h-full">
    <!-- Toggle button for all screen sizes -->
    <div class="fixed top-4 left-4 z-50">
      <button
        @click="toggleSidebar"
        class="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none"
      >
        <span class="sr-only">Toggle sidebar</span>
        <Bars3Icon v-if="!isOpen" class="h-6 w-6" />
        <XMarkIcon v-else class="h-6 w-6" />
      </button>
    </div>

    <!-- Sidebar -->
    <div
      class="fixed inset-y-0 left-0 z-40 w-64 bg-gray-900 transform transition-transform duration-300 ease-in-out overflow-hidden flex flex-col"
      :class="[isOpen ? 'translate-x-0' : '-translate-x-full']"
    >
      <!-- Header -->
      <div class="flex-shrink-0 h-16 bg-gray-800 flex items-center px-4">
        <h1 class="text-xl font-bold text-white">İşlemler</h1>
      </div>

      <!-- Navigation -->
      <div class="flex-1 overflow-y-auto">
        <nav class="px-2 py-4 space-y-1">
          <template v-for="item in navigation" :key="item.path">
            <!-- Main Menu Item -->
            <div v-if="item.subItems" class="space-y-1">
              <button
                @click="item.path === 'payments' ? togglePaymentMenu() : toggleFinanceMenu()"
                :class="[
                  currentPath.includes(item.path)
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                  'group flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium'
                ]"
              >
                <div class="flex items-center">
                  <component
                    :is="item.icon"
                    :class="[
                      currentPath.includes(item.path)
                        ? 'text-white'
                        : 'text-gray-400 group-hover:text-white',
                      'mr-3 h-5 w-5'
                    ]"
                  />
                  {{ item.name }}
                </div>
                <svg
                  class="ml-2 h-5 w-5 transform transition-transform duration-200"
                  :class="[(item.path === 'payments' ? isPaymentExpanded : isFinanceExpanded) ? 'rotate-180' : '']"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
              </button>

              <!-- Sub Menu Items -->
              <div
                v-show="item.path === 'payments' ? isPaymentExpanded : isFinanceExpanded"
                class="space-y-1 pl-11"
              >
                <button
                  v-for="subItem in item.subItems"
                  :key="subItem.path"
                  @click="$emit('navigate', subItem.path)"
                  :class="[
                    currentPath === subItem.path
                      ? 'bg-gray-800 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                    'group flex w-full items-center rounded-md py-2 pl-2 pr-2 text-sm font-medium'
                  ]"
                >
                  {{ subItem.name }}
                </button>
              </div>
            </div>

            <button
              v-else
              @click="$emit('navigate', item.path)"
              :class="[
                currentPath === item.path
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                'group flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium'
              ]"
            >
              <component
                :is="item.icon"
                :class="[
                  currentPath === item.path
                    ? 'text-white'
                    : 'text-gray-400 group-hover:text-white',
                  'mr-3 h-5 w-5'
                ]"
              />
              {{ item.name }}
            </button>
          </template>
        </nav>
      </div>
    </div>

    <!-- Backdrop -->
    <div
      v-if="isOpen"
      class="fixed inset-0 bg-gray-600 bg-opacity-75 z-30 lg:hidden"
      @click="toggleSidebar"
    />
  </div>
</template>

<style scoped>
.overflow-y-auto {
  scrollbar-width: thin;
  scrollbar-color: rgba(156, 163, 175, 0.5) transparent;
}

.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background-color: rgba(156, 163, 175, 0.5);
  border-radius: 3px;
}
</style>