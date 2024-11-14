<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { auth } from '../../firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'vue-router';
import { 
  BellIcon, 
  UserCircleIcon,
  QuestionMarkCircleIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/vue/24/outline';

const props = defineProps<{
  notifications: number;
  showNotifications: boolean;
}>();

const emit = defineEmits(['toggleNotifications']);

const router = useRouter();
const showUserMenu = ref(false);
const currentUser = ref(auth.currentUser);

onMounted(() => {
  auth.onAuthStateChanged((user) => {
    currentUser.value = user;
  });
});

const logout = async () => {
  try {
    await signOut(auth);
    router.push('/login');
  } catch (err) {
    console.error('Logout error:', err);
  }
};

const openHelp = () => {
  router.push('/help');
};
</script>

<template>
  <div class="fixed top-0 left-0 right-0 h-16 bg-white shadow-sm z-40">
    <div class="h-full px-4 flex items-center justify-between">
      <!-- Left side -->
      <div class="flex items-center">
        <img 
          src="https://upload.wikimedia.org/wikipedia/en/thumb/7/74/Anadolu_Efes_SK_logo.svg/300px-Anadolu_Efes_SK_logo.svg.png" 
          alt="Anadolu Efes Logo" 
          class="w-12 h-12 object-contain mr-4"
        />
        <h1 class="text-xl font-bold text-gray-900">Sport Club</h1>
      </div>

      <!-- Right side -->
      <div class="flex items-center space-x-4">
        <!-- Help -->
        <button 
          @click="openHelp"
          class="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
          title="Yardım"
        >
          <QuestionMarkCircleIcon class="w-6 h-6" />
        </button>

        <!-- Notifications -->
        <div class="relative">
          <button 
            @click="$emit('toggleNotifications')"
            class="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100 relative"
          >
            <BellIcon class="w-6 h-6" />
            <span 
              v-if="notifications" 
              class="absolute top-1 right-1 inline-flex items-center justify-center w-4 h-4 text-xs font-bold text-white bg-red-500 rounded-full"
            >
              {{ notifications }}
            </span>
          </button>
        </div>

        <!-- User Menu -->
        <div class="relative">
          <button 
            @click="showUserMenu = !showUserMenu"
            class="flex items-center space-x-2 p-2 text-gray-700 hover:text-gray-900 rounded-full hover:bg-gray-100"
          >
            <UserCircleIcon class="w-6 h-6" />
            <span class="text-sm font-medium">{{ currentUser?.displayName }}</span>
          </button>

          <!-- Dropdown Menu -->
          <div 
            v-if="showUserMenu"
            class="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5"
          >
            <div class="py-1">
              <button
                @click="logout"
                class="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <ArrowRightOnRectangleIcon class="w-5 h-5 mr-2" />
                Çıkış yap
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>