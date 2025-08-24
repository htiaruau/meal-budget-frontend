<template>
  <div class="h-screen bg-gray-100 grid grid-cols-1 lg:grid-cols-4 gap-1">

    <!-- 좌측 메인 영역 (3칸) -->
    <div class="lg:col-span-3 bg-slate-600 p-4">

      <!-- 상단 메뉴 -->
      <div class="grid grid-cols-3 gap-4 mb-4">
        <div
          @click="goToMain"
          class="bg-slate-700 text-white p-6 text-center rounded-lg cursor-pointer hover:bg-slate-800"
        >
          <h3 class="text-lg font-semibold">메인</h3>
        </div>
        <div class="bg-blue-700 text-white p-6 text-center rounded-lg cursor-pointer">
          <h3 class="text-lg font-semibold">등록</h3>
        </div>
        <div class="bg-slate-700 text-white p-6 text-center rounded-lg cursor-pointer hover:bg-slate-800">
          <h3 class="text-lg font-semibold">통계</h3>
        </div>
      </div>

      <!-- 입력화면 -->
      <div class="bg-slate-700 text-white p-6 rounded-lg mb-4">
        <h3 class="text-lg font-semibold mb-4 text-center">입력화면(날짜, 가게명, 사업자등록번호, 금액, 제외인원만 선택)</h3>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- 왼쪽 칼럼 -->
          <div class="space-y-4">
            <!-- 날짜 -->
            <div>
              <label class="block text-sm font-medium mb-2">식사 날짜</label>
              <input
                v-model="formData.mealDate"
                type="date"
                class="w-full p-2 bg-slate-600 border border-slate-500 rounded text-white"
              >
            </div>

            <!-- 가게명 -->
            <div>
              <label class="block text-sm font-medium mb-2">가게명</label>
              <div class="flex space-x-2">
                <select
                  v-model="formData.selectedRestaurantId"
                  @change="onRestaurantSelect"
                  class="flex-1 p-2 bg-slate-600 border border-slate-500 rounded text-white"
                >
                  <option value="">식당 선택</option>
                  <option
                    v-for="restaurant in restaurants"
                    :key="restaurant.id"
                    :value="restaurant.id"
                  >
                    {{ restaurant.name }}
                  </option>
                </select>
                <input
                  v-model="formData.restaurantName"
                  type="text"
                  placeholder="또는 직접 입력"
                  class="flex-1 p-2 bg-slate-600 border border-slate-500 rounded text-white placeholder-slate-400"
                >
              </div>
            </div>

            <!-- 사업자등록번호 -->
            <div>
              <label class="block text-sm font-medium mb-2">사업자등록번호</label>
              <input
                v-model="formData.businessNumber"
                type="text"
                placeholder="000-00-00000"
                class="w-full p-2 bg-slate-600 border border-slate-500 rounded text-white placeholder-slate-400"
              >
            </div>
          </div>

          <!-- 오른쪽 칼럼 -->
          <div class="space-y-4">
            <!-- 총 금액 -->
            <div>
              <label class="block text-sm font-medium mb-2">총 금액</label>
              <input
                v-model="formData.totalAmount"
                type="number"
                placeholder="0"
                class="w-full p-2 bg-slate-600 border border-slate-500 rounded text-white placeholder-slate-400"
              >
            </div>

            <!-- 참여 인원 설정 -->
            <div>
              <label class="block text-sm font-medium mb-2">참여 인원</label>
              <div class="space-y-2">
                <div class="flex items-center space-x-2">
                  <input
                    v-model="isAllParticipants"
                    type="checkbox"
                    class="rounded"
                  >
                  <span>전체 직원 {{ totalEmployees }}명 참여</span>
                </div>

                <div v-if="!isAllParticipants" class="mt-2">
                  <label class="block text-sm font-medium mb-1">참여 인원 수</label>
                  <input
                    v-model="formData.participantCount"
                    type="number"
                    :max="totalEmployees"
                    :min="1"
                    class="w-full p-2 bg-slate-600 border border-slate-500 rounded text-white"
                  >
                </div>

                <div v-if="isAllParticipants && excludedMembers.length > 0" class="mt-2">
                  <label class="block text-sm font-medium mb-1">제외 인원</label>
                  <div class="flex flex-wrap gap-2">
                    <span
                      v-for="member in excludedMembers"
                      :key="member"
                      class="bg-red-600 text-white px-2 py-1 rounded text-sm flex items-center"
                    >
                      {{ member }}
                      <button
                        @click="removeMember(member)"
                        class="ml-2 text-red-300 hover:text-white"
                      >×</button>
                    </span>
                  </div>
                </div>

                <div v-if="isAllParticipants" class="mt-2">
                  <select
                    v-model="selectedMemberToExclude"
                    @change="addExcludedMember"
                    class="w-full p-2 bg-slate-600 border border-slate-500 rounded text-white"
                  >
                    <option value="">제외할 인원 선택</option>
                    <option
                      v-for="member in availableMembers"
                      :key="member"
                      :value="member"
                    >
                      {{ member }}
                    </option>
                  </select>
                </div>
              </div>
            </div>

            <!-- 버튼 -->
            <div class="flex space-x-2 pt-4">
              <button
                @click="testClick"
                class="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded font-medium"
              >
                테스트
              </button>
              <button
                @click="saveMeal"
                :disabled="loading"
                class="flex-1 bg-green-600 hover:bg-green-700 text-white p-2 rounded font-medium disabled:opacity-50"
              >
                {{ loading ? '저장 중...' : '저장' }}
              </button>
              <button
                @click="resetForm"
                class="flex-1 bg-gray-600 hover:bg-gray-700 text-white p-2 rounded font-medium"
              >
                초기화
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 리스트 -->
      <div class="bg-slate-700 text-white p-4 rounded-lg h-40">
        <h3 class="text-lg font-semibold mb-4 text-center">등록된 식사 내역</h3>

        <!-- 테이블 헤더 -->
        <div class="bg-slate-800 p-2 rounded mb-2 text-sm font-medium">
          <div class="grid grid-cols-3 gap-4">
            <div>식사날짜</div>
            <div>가게명</div>
            <div class="text-right">총금액(인원수)</div>
          </div>
        </div>

        <!-- 리스트 내용 -->
        <div class="space-y-1 text-sm overflow-y-auto" style="max-height: 80px;">
          <div
            v-for="meal in mealList"
            :key="meal.id"
            @click="selectMeal(meal)"
            :class="[
              'p-2 rounded cursor-pointer transition-colors',
              selectedMeal?.id === meal.id ? 'bg-blue-600' : 'bg-slate-600 hover:bg-slate-500'
            ]"
          >
            <div class="grid grid-cols-3 gap-4 items-center">
              <div>{{ meal.date }}</div>
              <div>{{ meal.restaurant }}</div>
              <div class="text-right">
                {{ formatAmount(meal.amount) }}({{ meal.participants }}명)
                <button
                  @click.stop="deleteMeal(meal.id)"
                  class="text-red-400 hover:text-red-300 ml-2"
                  title="삭제"
                >×</button>
              </div>
            </div>
          </div>
          <div v-if="mealList.length === 0" class="text-center text-slate-400 py-4 col-span-3">
            등록된 식사가 없습니다.
          </div>
        </div>
      </div>
    </div>

    <!-- 우측 상세 화면 -->
    <div class="bg-blue-600 p-4 flex flex-col gap-4">

      <!-- 시스템 제목 -->
      <div class="bg-blue-700 text-white p-4 text-center rounded-lg">
        <h1 class="text-lg font-bold">직원 점심식대</h1>
        <h2 class="text-sm">관리시스템</h2>
      </div>

      <!-- 상세 정보 -->
      <div v-if="selectedMeal" class="space-y-4 flex-1">
        <!-- 기본 정보 -->
        <div class="bg-blue-700 text-white p-4 rounded-lg">
          <h3 class="font-semibold mb-3 text-center">식사 상세 정보</h3>
          <div class="space-y-2 text-sm">
            <div><strong>날짜:</strong> {{ selectedMeal.date }}</div>
            <div><strong>가게명:</strong> {{ selectedMeal.restaurant }}</div>
            <div><strong>사업자번호:</strong> {{ selectedMeal.businessNumber || '-' }}</div>
            <div><strong>총금액:</strong> {{ formatAmount(selectedMeal.amount) }}</div>
            <div><strong>참여인원:</strong> {{ selectedMeal.participants }}명</div>
          </div>
        </div>

        <!-- 개인별 금액 -->
        <div class="bg-blue-700 text-white p-4 rounded-lg flex-1">
          <div class="flex justify-between items-center mb-3">
            <h3 class="font-semibold">개인별 금액</h3>
            <div class="space-x-2">
              <button
                v-if="!isEditing"
                @click="startEdit"
                class="px-3 py-1 rounded text-xs font-medium bg-yellow-600 hover:bg-yellow-700"
              >
                수정
              </button>
              <template v-else>
                <button
                  @click="saveEdit"
                  class="px-3 py-1 rounded text-xs font-medium bg-green-600 hover:bg-green-700"
                >
                  저장
                </button>
                <button
                  @click="cancelEdit"
                  class="px-3 py-1 rounded text-xs font-medium bg-gray-600 hover:bg-gray-700"
                >
                  취소
                </button>
              </template>
            </div>
          </div>

          <div class="space-y-2 text-sm overflow-y-auto" style="max-height: 300px;">
            <div
              v-for="person in selectedMeal.personalAmounts"
              :key="person.name"
              class="flex justify-between items-center bg-blue-600 p-2 rounded"
            >
              <span class="flex-1">{{ person.name }}</span>
              <div v-if="isEditing" class="flex-1 ml-2">
                <input
                  v-model.number="person.actualAmount"
                  type="number"
                  placeholder="금액 입력"
                  class="w-full p-1 bg-blue-500 border border-blue-400 rounded text-white text-xs"
                  @input="calculateAmounts"
                >
              </div>
              <span v-else class="text-right">
                {{ person.actualAmount ? formatAmount(person.actualAmount) : formatAmount(person.calculatedAmount) }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- 선택된 식사가 없을 때 -->
      <div v-else class="bg-blue-700 text-white p-4 rounded-lg flex-1 flex items-center justify-center">
        <div class="text-center text-blue-200">
          <p>식사 내역을 선택하면</p>
          <p>상세 정보가 표시됩니다</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { userApi, restaurantApi, groupMealApi, mealExpenseApi } from '../services/api'

const router = useRouter()
const route = useRoute()

console.log('RegisterMeal 컴포넌트 로드됨')

// 폼 데이터
const formData = ref({
  mealDate: new Date().toISOString().split('T')[0],
  selectedRestaurantId: '',
  restaurantName: '',
  businessNumber: '',
  totalAmount: '',
  participantCount: 6
})

// 직원 관련 데이터 (API에서 가져올 예정)
const totalEmployees = ref(6)
const allMembers = ref([])
const excludedMembers = ref([])
const selectedMemberToExclude = ref('')
const isAllParticipants = ref(true)

// API 데이터
const restaurants = ref([])
const loading = ref(false)

// 선택된 식사와 편집 상태
const selectedMeal = ref(null)
const isEditing = ref(false)
const originalAmounts = ref(null)

// 식사 내역 리스트 (API에서 가져올 예정)
const mealList = ref([])

// 선택 가능한 멤버
const availableMembers = computed(() => {
  return allMembers.value.filter(member => !excludedMembers.value.includes(member))
})

// 식사 선택
const selectMeal = (meal) => {
  console.log('식사 선택:', meal.restaurant)
  selectedMeal.value = meal
  isEditing.value = false
}

// 수정 시작
const startEdit = () => {
  console.log('수정 시작')
  originalAmounts.value = JSON.parse(JSON.stringify(selectedMeal.value.personalAmounts))
  isEditing.value = true
}

// 수정 저장
const saveEdit = () => {
  console.log('수정 저장')
  calculateAmounts()
  isEditing.value = false
  originalAmounts.value = null
  alert('저장되었습니다!')
}

// 수정 취소
const cancelEdit = () => {
  console.log('수정 취소')
  if (originalAmounts.value) {
    selectedMeal.value.personalAmounts = originalAmounts.value
  }
  isEditing.value = false
  originalAmounts.value = null
}

// 금액 재계산
const calculateAmounts = () => {
  if (!selectedMeal.value) return

  const totalInput = selectedMeal.value.personalAmounts
    .filter(person => person.actualAmount)
    .reduce((sum, person) => sum + person.actualAmount, 0)

  const remaining = selectedMeal.value.amount - totalInput
  const splitCount = selectedMeal.value.personalAmounts
    .filter(person => !person.actualAmount).length

  if (splitCount > 0) {
    const equalAmount = Math.floor(remaining / splitCount)
    selectedMeal.value.personalAmounts.forEach(person => {
      if (!person.actualAmount) {
        person.calculatedAmount = equalAmount
      }
    })
  }
}

// 제외 인원 추가
const addExcludedMember = () => {
  if (selectedMemberToExclude.value && !excludedMembers.value.includes(selectedMemberToExclude.value)) {
    excludedMembers.value.push(selectedMemberToExclude.value)
    selectedMemberToExclude.value = ''
  }
}

// 제외 인원 제거
const removeMember = (member) => {
  const index = excludedMembers.value.indexOf(member)
  if (index > -1) {
    excludedMembers.value.splice(index, 1)
  }
}

// 식사 저장
const saveMeal = () => {
  if (!formData.value.restaurantName || !formData.value.totalAmount) {
    alert('필수 항목을 입력해주세요.')
    return
  }

  const participantCount = isAllParticipants.value
    ? totalEmployees.value - excludedMembers.value.length
    : formData.value.participantCount

  const participants = isAllParticipants.value
    ? allMembers.value.filter(member => !excludedMembers.value.includes(member))
    : allMembers.value.slice(0, participantCount)

  const equalAmount = Math.floor(parseInt(formData.value.totalAmount) / participantCount)

  const newMeal = {
    id: Date.now(),
    date: formData.value.mealDate,
    restaurant: formData.value.restaurantName,
    businessNumber: formData.value.businessNumber,
    amount: parseInt(formData.value.totalAmount),
    participants: participantCount,
    personalAmounts: participants.map(name => ({
      name,
      calculatedAmount: equalAmount,
      actualAmount: null
    }))
  }

  mealList.value.unshift(newMeal)
  alert('저장되었습니다!')
  resetForm()
}

// 폼 초기화
const resetForm = () => {
  formData.value = {
    mealDate: new Date().toISOString().split('T')[0],
    restaurantName: '',
    businessNumber: '',
    totalAmount: '',
    participantCount: 6
  }
  excludedMembers.value = []
  selectedMemberToExclude.value = ''
  isAllParticipants.value = true
}

// 식사 삭제
const deleteMeal = (id) => {
  if (confirm('삭제하시겠습니까?')) {
    const index = mealList.value.findIndex(meal => meal.id === id)
    if (index > -1) {
      mealList.value.splice(index, 1)
    }
  }
}

// 메인으로 이동
const goToMain = () => {
  router.push('/')
}

// 금액 포맷팅
const formatAmount = (amount) => {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW'
  }).format(amount)
}

// API 데이터 로드
const loadUsers = async () => {
  try {
    loading.value = true
    const response = await userApi.getAll()
    allMembers.value = response.data.map(user => user.name)
    totalEmployees.value = allMembers.value.length
    console.log('사용자 데이터 로드:', allMembers.value)
  } catch (error) {
    console.error('사용자 데이터 로드 실패:', error)
    // 실패 시 기본값 사용
    allMembers.value = ['김철수', '박영희', '이민수', '정수진', '최민호', '홍길동']
    totalEmployees.value = 6
  } finally {
    loading.value = false
  }
}

const loadRestaurants = async () => {
  try {
    const response = await restaurantApi.getAll()
    restaurants.value = response.data
    console.log('식당 데이터 로드:', restaurants.value)
  } catch (error) {
    console.error('식당 데이터 로드 실패:', error)
  }
}

const loadGroupMeals = async () => {
  try {
    const response = await groupMealApi.getAll()
    // 백엔드 데이터를 프론트엔드 형식으로 변환
    mealList.value = response.data.map(meal => ({
      id: meal.id,
      date: meal.mealDate,
      restaurant: meal.restaurantName || '식당명 없음',
      businessNumber: meal.businessNumber || '',
      amount: meal.totalAmount,
      participants: meal.participantCount || 0,
      personalAmounts: [] // 나중에 개인 비용 데이터와 연결
    }))
    console.log('단체식사 데이터 로드:', mealList.value)
  } catch (error) {
    console.error('단체식사 데이터 로드 실패:', error)
  }
}

// 컴포넌트 마운트 시 실행
onMounted(async () => {
  // API 데이터 로드
  await Promise.all([
    loadUsers(),
    loadRestaurants(),
    loadGroupMeals()
  ])

  // URL에서 날짜 파라미터 확인
  const dateParam = route.params.date
  if (dateParam) {
    console.log('날짜 파라미터:', dateParam)
    formData.value.mealDate = dateParam

    // 해당 날짜의 식사 내역 찾아서 자동 선택
    const mealForDate = mealList.value.find(meal => meal.date === dateParam)
    if (mealForDate) {
      console.log('해당 날짜 식사 찾음:', mealForDate)
      selectedMeal.value = mealForDate
    } else {
      console.log('해당 날짜 식사 없음, 새 등록 준비')
      selectedMeal.value = null
    }
  }
})
</script>
