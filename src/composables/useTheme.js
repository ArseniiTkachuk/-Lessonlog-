import { ref, watch } from 'vue'

const KEY = 'lessonlog_theme'
const ALLOWED = ['auto', 'light', 'dark']

function load() {
    try {
        const v = localStorage.getItem(KEY)
        if (ALLOWED.includes(v)) return v
    } catch (e) {
        console.error(e)
    }
    return 'auto'
}

const theme = ref(load())

function apply(value) {
    const root = document.documentElement
    // auto = без атрибута, тема визначається налаштуванням системи
    if (value === 'light' || value === 'dark') root.dataset.theme = value
    else delete root.dataset.theme
}

apply(theme.value)

watch(theme, (value) => {
    apply(value)
    try {
        localStorage.setItem(KEY, value)
    } catch (e) {
        console.error(e)
    }
})

export function useTheme() {
    return { theme }
}