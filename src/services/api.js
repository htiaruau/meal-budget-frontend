import axios from 'axios'

// API 베이스 URL
const BASE_URL = 'http://localhost:8080/api'

// Axios 인스턴스 생성
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 요청 인터셉터 (로깅용)
api.interceptors.request.use(
  (config) => {
    console.log('API 요청:', config.method?.toUpperCase(), config.url)
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 응답 인터셉터 (에러 처리)
api.interceptors.response.use(
  (response) => {
    console.log('API 응답:', response.status, response.data)
    return response
  },
  (error) => {
    console.error('API 에러:', error.response?.status, error.message)
    return Promise.reject(error)
  }
)

// ==================== 사용자 API ====================
export const userApi = {
  // 전체 사용자 조회
  getAll: () => api.get('/users'),

  // 사용자 생성
  create: (userData) => api.post('/users', userData),

  // 사용자 수정
  update: (id, userData) => api.put(`/users/${id}`, userData),

  // 사용자 삭제
  delete: (id) => api.delete(`/users/${id}`)
}

// ==================== 식당 API ====================
export const restaurantApi = {
  // 전체 식당 조회
  getAll: () => api.get('/restaurants'),

  // 식당 생성
  create: (restaurantData) => api.post('/restaurants', restaurantData),

  // 식당 수정
  update: (id, restaurantData) => api.put(`/restaurants/${id}`, restaurantData),

  // 식당 삭제
  delete: (id) => api.delete(`/restaurants/${id}`)
}

// ==================== 단체식사 API ====================
export const groupMealApi = {
  // 전체 단체식사 조회
  getAll: () => api.get('/group-meals'),

  // 특정 월의 단체식사 조회
  getByMonth: (year, month) => api.get(`/group-meals?year=${year}&month=${month}`),

  // 단체식사 생성
  create: (mealData) => api.post('/group-meals', mealData),

  // 단체식사 수정
  update: (id, mealData) => api.put(`/group-meals/${id}`, mealData),

  // 단체식사 삭제
  delete: (id) => api.delete(`/group-meals/${id}`)
}

// ==================== 개인 비용 API ====================
export const mealExpenseApi = {
  // 특정 단체식사의 개인 비용 조회
  getByGroupMeal: (groupMealId) => api.get(`/meal-expenses/group/${groupMealId}`),

  // 개인 비용 생성
  create: (expenseData) => api.post('/meal-expenses', expenseData),

  // 개인 비용 수정
  update: (id, expenseData) => api.put(`/meal-expenses/${id}`, expenseData),

  // 개인 비용 삭제
  delete: (id) => api.delete(`/meal-expenses/${id}`)
}

// ==================== 통합 API ====================
export const mealApi = {
  // 월별 식사 내역 (단체식사 + 개인 비용)
  getMonthlyMeals: async (year, month) => {
    try {
      const groupMealsResponse = await groupMealApi.getByMonth(year, month)
      const groupMeals = groupMealsResponse.data

      // 각 단체식사에 대한 개인 비용 데이터 가져오기
      const mealsWithExpenses = await Promise.all(
        groupMeals.map(async (groupMeal) => {
          try {
            const expensesResponse = await mealExpenseApi.getByGroupMeal(groupMeal.id)
            return {
              ...groupMeal,
              personalAmounts: expensesResponse.data
            }
          } catch (error) {
            console.warn(`그룹 식사 ${groupMeal.id}의 개인 비용 조회 실패:`, error)
            return {
              ...groupMeal,
              personalAmounts: []
            }
          }
        })
      )

      return mealsWithExpenses
    } catch (error) {
      console.error('월별 식사 내역 조회 실패:', error)
      throw error
    }
  },

  // 식사 등록 (단체식사 + 개인 비용)
  createMeal: async (mealData) => {
    try {
      // 1. 단체식사 생성
      const groupMealResponse = await groupMealApi.create({
        mealDate: mealData.mealDate,
        restaurantId: mealData.restaurantId,
        totalAmount: mealData.totalAmount,
        adminId: mealData.adminId
      })

      const groupMeal = groupMealResponse.data

      // 2. 각 참여자의 개인 비용 생성
      if (mealData.participants && mealData.participants.length > 0) {
        await Promise.all(
          mealData.participants.map(participant =>
            mealExpenseApi.create({
              groupMealId: groupMeal.id,
              userId: participant.userId,
              calculatedAmount: participant.calculatedAmount,
              actualAmount: participant.actualAmount || null
            })
          )
        )
      }

      return groupMeal
    } catch (error) {
      console.error('식사 등록 실패:', error)
      throw error
    }
  }
}

export default api
