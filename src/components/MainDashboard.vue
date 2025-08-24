<template>
  <div class="h-screen bg-gray-100 grid grid-cols-1 lg:grid-cols-4 gap-1">

    <!-- 좌측 메인 영역 (3칸) -->
    <div class="lg:col-span-3 bg-slate-600 p-4">

      <!-- 상단 메뉴 -->
      <div class="grid grid-cols-3 gap-4 mb-4">
        <div class="bg-blue-700 text-white p-6 text-center rounded-lg cursor-pointer">
          <h3 class="text-lg font-semibold">메인</h3>
        </div>
        <div
          @click="goToRegister"
          class="bg-slate-700 text-white p-6 text-center rounded-lg cursor-pointer hover:bg-slate-800"
        >
          <h3 class="text-lg font-semibold">등록</h3>
        </div>
        <div class="bg-slate-700 text-white p-6 text-center rounded-lg cursor-pointer hover:bg-slate-800">
          <h3 class="text-lg font-semibold">통계</h3>
        </div>
      </div>

      <!-- 달력 영역 -->
      <Calendar :meal-events="calendarEvents" />
    </div>

    <!-- 우측 사이드바 (1칸) -->
    <div class="bg-blue-600 p-4 flex flex-col gap-4">

      <!-- 시스템 제목 -->
      <div class="bg-blue-700 text-white p-4 text-center rounded-lg">
        <h1 class="text-lg font-bold">직원 점심식대</h1>
        <h2 class="text-sm">관리시스템</h2>
      </div>

      <!-- 로딩 상태 -->
      <div v-if="loading" class="bg-blue-700 text-white p-4 rounded-lg text-center">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
        <p>데이터 로딩 중...</p>
      </div>

      <!-- 금액 정보 -->
      <div v-else class="space-y-2">
        <div class="bg-blue-700 text-white p-3 text-center rounded">
          <div class="text-sm text-blue-200">월 예산</div>
          <div class="text-lg font-bold">{{ formatAmount(monthlyBudget) }}</div>
        </div>

        <div class="bg-blue-700 text-white p-3 text-center rounded">
          <div class="text-sm text-blue-200">사용금액</div>
          <div class="text-lg font-bold">{{ formatAmount(totalUsed) }}</div>
        </div>

        <div class="bg-blue-700 text-white p-3 text-center rounded">
          <div class="text-sm text-blue-200">남은금액</div>
          <div class="text-lg font-bold">{{ formatAmount(remainingBudget) }}</div>
        </div>
      </div>

      <!-- 참가인원 정보 -->
      <div class="bg-blue-700 text-white p-4 rounded-lg flex-1">
        <h3 class="text-center font-semibold mb-4">이번 달 통계</h3>

        <div v-if="loading" class="text-center text-blue-200 py-4">
          로딩 중...
        </div>

        <div v-else class="space-y-3 text-sm">
          <div class="flex justify-between">
            <span>총 식사 횟수:</span>
            <span class="font-bold">{{ monthlyStats.totalMeals }}회</span>
          </div>
          <div class="flex justify-between">
            <span>평균 참여 인원:</span>
            <span class="font-bold">{{ monthlyStats.avgParticipants }}명</span>
          </div>
          <div class="flex justify-between">
            <span>1회 평균 금액:</span>
            <span class="font-bold">{{ formatAmount(monthlyStats.avgAmount) }}</span>
          </div>
          <div class="flex justify-between">
            <span>인당 평균 비용:</span>
            <span class="font-bold">{{ formatAmount(monthlyStats.avgPerPerson) }}</span>
          </div>

          <div v-if="monthlyStats.totalMeals === 0" class="text-center text-blue-200 py-4">
            이번 달 식사 기록이 없습니다
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { userApi, groupMealApi } from '../services/api'
import Calendar from './FullCalendar.vue'

const router = useRouter()

// 상태 변수들
const loading = ref(true)
const monthlyMeals = ref([])
const users = ref([])
const calendarEvents = ref([])

// 예산 설정 (개인당 10만원)
const individualBudget = 100000
const monthlyBudget = computed(() => users.value.length * individualBudget)

// 사용 금액 계산
const totalUsed = computed(() => {
  return monthlyMeals.value.reduce((sum, meal) => sum + meal.totalAmount, 0)
})

// 남은 금액 계산
const remainingBudget = computed(() => monthlyBudget.value - totalUsed.value)

// 월별 통계 계산
const monthlyStats = computed(() => {
  const totalMeals = monthlyMeals.value.length

  if (totalMeals === 0) {
    return {
      totalMeals: 0,
      avgParticipants: 0,
      avgAmount: 0,
      avgPerPerson: 0
    }
  }

  const totalParticipants = monthlyMeals.value.reduce((sum, meal) => sum + (meal.participantCount || 0), 0)
  const totalAmount = totalUsed.value

  const avgParticipants = Math.round(totalParticipants / totalMeals * 10) / 10
  const avgAmount = Math.round(totalAmount / totalMeals)
  const avgPerPerson = avgParticipants > 0 ? Math.round(avgAmount / avgParticipants) : 0

  return {
    totalMeals,
    avgParticipants,
    avgAmount,
    avgPerPerson
  }
})

// 사용자 데이터 로드
const loadUsers = async () => {
  try {
    const response = await userApi.getAll()
    users.value = response.data
    console.log('사용자 데이터 로드:', users.value.length, '명')
  } catch (error) {
    console.error('사용자 데이터 로드 실패:', error)
    // 기본값 설정
    users.value = Array(6).fill().map((_, i) => ({ id: i + 1, name: `사용자${i + 1}` }))
  }
}

// 이번 달 식사 데이터 로드
const loadMonthlyMeals = async () => {
  try {
    const currentDate = new Date()
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth() + 1

    const response = await groupMealApi.getByMonth(year, month)
    monthlyMeals.value = response.data

    // 달력 이벤트 데이터 생성
    calendarEvents.value = monthlyMeals.value.map(meal => ({
      title: formatAmountForCalendar(meal.totalAmount),
      date: meal.mealDate,
      backgroundColor: '#10b981',
      borderColor: '#10b981',
      textColor: 'white'
    }))

    console.log('이번 달 식사 데이터 로드:', monthlyMeals.value.length, '건')
    console.log('달력 이벤트:', calendarEvents.value)
  } catch (error) {
    console.error('이번 달 식사 데이터 로드 실패:', error)
    // 빈 배열로 초기화
    monthlyMeals.value = []
    calendarEvents.value = []
  }
}

// 컴포넌트 마운트 시 데이터 로드
onMounted(async () => {
  loading.value = true

  try {
    await Promise.all([
      loadUsers(),
      loadMonthlyMeals()
    ])
  } catch (error) {
    console.error('데이터 로드 중 오류:', error)
  } finally {
    loading.value = false
  }
})

// 등록 화면으로 이동
const goToRegister = () => {
  router.push('/register')
}

// 금액 포맷팅
const formatAmount = (amount) => {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW'
  }).format(amount)
}

// 달력용 금액 포맷팅 (간단하게)
const formatAmountForCalendar = (amount) => {
  if (amount >= 1000) {
    return `₩${Math.round(amount / 1000)}K`
  }
  return `₩${amount}`
}
</script>
