import { ref, watch } from 'vue'

const STORAGE_KEY = 'lessonlog_types'

function loadTypes() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch (e) {
    console.error('Не вдалося прочитати типи уроків зі сховища', e)
  }
  // Типи за замовчуванням для першого запуску
  return [
    { id: 'individual', name: 'Індивідуальний', price: 0 },
    { id: 'group', name: 'Груповий', price: 0 },
  ]
}

const types = ref(loadTypes())

watch(
  types,
  (value) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
  },
  { deep: true }
)

function addType(name, price = 0) {
  const id = `type_${Date.now()}`
  types.value.push({ id, name, price: Number(price) || 0 })
  return id
}

function updateType(id, changes) {
  const type = types.value.find((t) => t.id === id)
  if (type) Object.assign(type, changes)
}

function removeType(id) {
  types.value = types.value.filter((t) => t.id !== id)
}

function getTypeById(id) {
  return types.value.find((t) => t.id === id)
}

export function useLessonTypes() {
  return { types, addType, updateType, removeType, getTypeById }
}
