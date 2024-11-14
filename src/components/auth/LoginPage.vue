<script setup lang="ts">
import { ref } from 'vue';
import { auth } from '../../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'vue-router';

const email = ref('');
const password = ref('');
const loading = ref(false);
const error = ref('');
const router = useRouter();

const login = async () => {
  if (!email.value || !password.value) {
    error.value = 'Lütfen tüm alanları doldurun';
    return;
  }

  loading.value = true;
  error.value = '';

  try {
    await signInWithEmailAndPassword(auth, email.value, password.value);
    router.push('/');
  } catch (err: any) {
    console.error('Login error:', err);
    error.value = err.code === 'auth/invalid-credential' 
      ? 'Geçersiz e-posta veya şifre'
      : 'Giriş yapılırken bir hata oluştu';
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <img 
        src="https://upload.wikimedia.org/wikipedia/en/thumb/7/74/Anadolu_Efes_SK_logo.svg/300px-Anadolu_Efes_SK_logo.svg.png" 
        alt="Sport Club Logo" 
        class="mx-auto h-20 w-auto"
      />
      <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
        Hesabınıza giriş yapın
      </h2>
      <p class="mt-2 text-center text-sm text-gray-600">
        Veya
        <router-link 
          to="/register" 
          class="font-medium text-indigo-600 hover:text-indigo-500"
        >
          yeni hesap oluşturun
        </router-link>
      </p>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <form @submit.prevent="login" class="space-y-6">
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700">
              E-posta adresi
            </label>
            <div class="mt-1">
              <input
                v-model="email"
                id="email"
                name="email"
                type="email"
                autocomplete="email"
                required
                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-gray-700">
              Şifre
            </label>
            <div class="mt-1">
              <input
                v-model="password"
                id="password"
                name="password"
                type="password"
                autocomplete="current-password"
                required
                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
          </div>

          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label for="remember-me" class="ml-2 block text-sm text-gray-900">
                Beni hatırla
              </label>
            </div>

            <div class="text-sm">
              <router-link 
                to="/forgot-password" 
                class="font-medium text-indigo-600 hover:text-indigo-500"
              >
                Şifremi unuttum
              </router-link>
            </div>
          </div>

          <div>
            <button
              type="submit"
              :disabled="loading"
              class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {{ loading ? 'Giriş yapılıyor...' : 'Giriş yap' }}
            </button>
          </div>

          <div v-if="error" class="mt-4">
            <p class="text-sm text-red-600">{{ error }}</p>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>