<template>
  <div class="bg-slate-700 text-white p-4 rounded-lg h-80">
    <FullCalendar
      :options="calendarOptions"
      class="custom-calendar"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'

const router = useRouter()

// props 정의
const props = defineProps({
  mealEvents: {
    type: Array,
    default: () => []
  }
})

// 달력 이벤트 (props와 기본 이벤트 합치기)
const calendarEvents = computed(() => {
  // API에서 받은 이벤트가 있으면 사용, 없으면 기본 이벤트
  return props.mealEvents.length > 0 ? props.mealEvents : [
    {
      title: '₩60K',
      date: '2025-08-20',
      backgroundColor: '#10b981',
      borderColor: '#10b981',
      textColor: 'white'
    },
    {
      title: '₩65K',
      date: '2025-08-21',
      backgroundColor: '#10b981',
      borderColor: '#10b981',
      textColor: 'white'
    },
    {
      title: '₩72K',
      date: '2025-08-24',
      backgroundColor: '#10b981',
      borderColor: '#10b981',
      textColor: 'white'
    }
  ]
})

// 달력 설정
const calendarOptions = ref({
  plugins: [dayGridPlugin, interactionPlugin],
  initialView: 'dayGridMonth',
  headerToolbar: {
    left: 'prev,next',
    center: 'title',
    right: ''
  },
  height: 'auto',
  locale: 'ko',

  // 이벤트 데이터 (동적으로 받아옴)
  events: calendarEvents.value,

  // 날짜 클릭 이벤트
  dateClick: (info) => {
    console.log('날짜 클릭:', info.dateStr)
    router.push(`/register/${info.dateStr}`)
  },

  // 이벤트 클릭 (금액 표시 클릭 시)
  eventClick: (info) => {
    console.log('이벤트 클릭:', info.event.startStr)
    // 이벤트 클릭해도 등록 화면으로 이동 (알람창 대신)
    router.push(`/register/${info.event.startStr}`)
  }
})
</script>

<style>
/* FullCalendar 커스텀 스타일 */
.custom-calendar {
  background: transparent;
}

.custom-calendar .fc {
  background: transparent;
  color: white;
}

.custom-calendar .fc-theme-standard th {
  background: #475569;
  border-color: #64748b;
  color: white;
}

.custom-calendar .fc-theme-standard td {
  border-color: #64748b;
  background: #334155;
}

.custom-calendar .fc-daygrid-day-number {
  color: white;
}

.custom-calendar .fc-toolbar {
  color: white;
}

.custom-calendar .fc-toolbar .fc-button {
  background: #475569;
  border-color: #64748b;
  color: white;
}

.custom-calendar .fc-toolbar .fc-button:hover {
  background: #64748b;
}

.custom-calendar .fc-today {
  background-color: #1e40af !important;
}

.custom-calendar .fc-daygrid-day.fc-day-sun .fc-daygrid-day-number {
  color: #ef4444; /* 일요일 빨간색 */
}

.custom-calendar .fc-daygrid-day.fc-day-sat .fc-daygrid-day-number {
  color: #3b82f6; /* 토요일 파란색 */
}
</style>
