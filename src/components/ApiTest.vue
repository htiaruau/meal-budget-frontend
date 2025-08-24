<template>
  <div class="p-8 bg-gray-100 min-h-screen">
    <h1 class="text-2xl font-bold mb-6">API 연결 테스트</h1>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">

      <!-- 사용자 테스트 -->
      <div class="bg-white p-6 rounded-lg shadow">
        <h2 class="text-lg font-semibold mb-4">👥 사용자 API</h2>
        <button
          @click="testUserApi"
          :disabled="loading"
          class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          사용자 목록 가져오기
        </button>
        <div v-if="users.length > 0" class="mt-4">
          <h3 class="font-medium mb-2">결과:</h3>
          <pre class="bg-gray-100 p-2 rounded text-xs overflow-auto">{{ JSON.stringify(users, null, 2) }}</pre>
        </div>
      </div>

      <!-- 식당 테스트 -->
      <div class="bg-white p-6 rounded-lg shadow">
        <h2 class="text-lg font-semibold mb-4">🍽️ 식당 API</h2>
        <button
          @click="testRestaurantApi"
          :disabled="loading"
          class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
        >
          식당 목록 가져오기
        </button>
        <div v-if="restaurants.length > 0" class="mt-4">
          <h3 class="font-medium mb-2">결과:</h3>
          <pre class="bg-gray-100 p-2 rounded text-xs overflow-auto">{{ JSON.stringify(restaurants, null, 2) }}</pre>
        </div>
      </div>

      <!-- 단체식사 테스트 -->
      <div class="bg-white p-6 rounded-lg shadow">
        <h2 class="text-lg font-semibold mb-4">🍱 단체식사 API</h2>
        <button
          @click="testGroupMealApi"
          :disabled="loading"
          class="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 disabled:opacity-50"
        >
          8월 식사 내역 가져오기
        </button>
        <div v-if="groupMeals.length > 0" class="mt-4">
          <h3 class="font-medium mb-2">결과:</h3>
          <pre class="bg-gray-100 p-2 rounded text-xs overflow-auto">{{ JSON.stringify(groupMeals, null, 2) }}</pre>
        </div>
      </div>

      <!-- 통합 테스트 -->
      <div class="bg-white p-6 rounded-lg shadow">
        <h2 class="text-lg font-semibold mb-4">🔗 통합 API</h2>
        <button
          @click="testIntegratedApi"
          :disabled="loading"
          class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:opacity-50"
        >
          월별 전체 데이터
        </button>
        <div v-if="integratedData.length > 0" class="mt-4">
          <h3 class="font-medium mb-2">결과:</h3>
          <pre class="bg-gray-100 p-2 rounded text-xs overflow-auto">{{ JSON.stringify(integratedData, null, 2) }}</pre>
        </div>
      </div>

    </div>

    <!-- 에러 메시지 -->
    <div v-if="error" class="mt-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
      <h3 class="font-bold">에러 발생:</h3>
      <p>{{ error }}</p>
    </div>

    <!-- 로딩 상태 -->
    <div v-if="loading" class="mt-6 text-center">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      <p class="mt-2">API 호출 중...</p>
    </div>

    <!-- 뒤로가기 -->
    <div class="mt-8">
      <button
        @click="$router.push('/')"
        class="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600"
      >
        메인으로 돌아가기
      </button>
    </div>

  </div>
</template>

<script setup>
import { ref } from 'vue'
import { userApi, restaurantApi, groupMealApi, mealApi } from '../services/api'

// 상태 변수들
const loading = ref(false)
const error = ref('')
const users = ref([])
const restaurants = ref([])
const groupMeals = ref([])
const integratedData = ref([])

// 에러 처리 헬퍼
const handleApiCall = async (apiCall, successCallback) => {
  loading.value = true
  error.value = ''

  try {
    const response = await apiCall()
    successCallback(response.data)
  } catch (err) {
    error.value = err.response?.data?.message || err.message || '알 수 없는 오류가 발생했습니다'
    console.error('API 호출 실패:', err)
  } finally {
    loading.value = false
  }
}

// 사용자 API 테스트
const testUserApi = () => {
  handleApiCall(
    () => userApi.getAll(),
    (data) => {
      users.value = data
      console.log('사용자 데이터:', data)
    }
  )
}

// 식당 API 테스트
const testRestaurantApi = () => {
  handleApiCall(
    () => restaurantApi.getAll(),
    (data) => {
      restaurants.value = data
      console.log('식당 데이터:', data)
    }
  )
}

// 단체식사 API 테스트
const testGroupMealApi = () => {
  handleApiCall(
    () => groupMealApi.getByMonth(2025, 8),
    (data) => {
      groupMeals.value = data
      console.log('단체식사 데이터:', data)
    }
  )
}

// 통합 API 테스트
const testIntegratedApi = () => {
  handleApiCall(
    () => mealApi.getMonthlyMeals(2025, 8),
    (data) => {
      integratedData.value = data
      console.log('통합 데이터:', data)
    }
  )
}
</script>
