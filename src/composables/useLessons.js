import { ref, watch } from 'vue'

const STORAGE_KEY = 'lessonlog_lessons'

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

function loadLessons() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch (e) {
    console.error('Не вдалося прочитати уроки зі сховища', e)
  }
  return []
}

const lessons = ref(loadLessons())

watch(
  lessons,
  (value) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
  },
  { deep: true }
)

function addLesson({ date, typeId, hours, note }) {
  lessons.value.unshift({
    id: `lesson_${Date.now()}`,
    date: date || todayISO(),
    typeId,
    hours: Number(hours) || 0,
    note: note || '',
  })
}

function removeLesson(id) {
  lessons.value = lessons.value.filter((l) => l.id !== id)
}

function updateLesson(id, changes) {
  const lesson = lessons.value.find((l) => l.id === id)
  if (lesson) Object.assign(lesson, changes)
}

/** Повертає уроки, відсортовані від найновішого до найстарішого. */
function sortedLessons() {
  return [...lessons.value].sort((a, b) => (a.date < b.date ? 1 : -1))
}

export function useLessons() {
  return { lessons, addLesson, removeLesson, updateLesson, sortedLessons, todayISO }
}
