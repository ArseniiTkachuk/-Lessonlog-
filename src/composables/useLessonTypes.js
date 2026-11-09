import { ref, watch } from 'vue'

const STORAGE_KEY = 'lessonlog_types'
const DEFAULT_DURATION = 1 // година

/** Додає тривалість типам, збереженим до цього оновлення. */
function normalize(list) {
  return list.map((t) => ({
    ...t,
    price: Number(t.price) || 0,
    duration: Number(t.duration) > 0 ? Number(t.duration) : DEFAULT_DURATION,
  }))
}

function loadTypes() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return normalize(JSON.parse(raw))
  } catch (e) {
    console.error('Не вдалося прочитати типи уроків зі сховища', e)
  }
  return [
    { id: 'individual', name: 'Індивідуальний', price: 0, duration: 1 },
    { id: 'group', name: 'Груповий', price: 0, duration: 1 },
  ]
}

const types = ref(loadTypes())

// Тип, який підставляється у форму нового уроку
const DEFAULT_KEY = 'lessonlog_default_type'
const defaultTypeId = ref(localStorage.getItem(DEFAULT_KEY) || 'group')

watch(defaultTypeId, (value) => {
  localStorage.setItem(DEFAULT_KEY, value)
})

watch(
    types,
    (value) => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
    },
    { deep: true }
)

function addType(name, price = 0, duration = DEFAULT_DURATION) {
  const id = `type_${Date.now()}`
  types.value.push({ id, name, price: Number(price) || 0, duration: Number(duration) || DEFAULT_DURATION })
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

function setDefaultType(id) {
  defaultTypeId.value = id
}

/** Тип за замовчуванням; якщо його видалено — перший зі списку. */
function getDefaultType() {
  return types.value.find((t) => t.id === defaultTypeId.value) ?? types.value[0]
}

/** Імпорт: повністю замінює типи. */
function replaceTypes(list) {
  types.value = normalize(list)
}

/** Імпорт: додає типи, яких ще немає (за id). */
function mergeTypes(list) {
  const existing = new Set(types.value.map((t) => t.id))
  types.value.push(...normalize(list).filter((t) => !existing.has(t.id)))
}

export function useLessonTypes() {
  return {
    types,
    defaultTypeId,
    addType,
    updateType,
    removeType,
    getTypeById,
    setDefaultType,
    getDefaultType,
    replaceTypes,
    mergeTypes,
  }
}