import type { Ref } from 'vue'

/** Retourne une copie d'une ref dont la valeur n'est mise à jour qu'après `delay` ms sans changement */
export function useDebouncedRef<T>(source: Ref<T>, delay = 300): Ref<T> {
  const debounced = ref(source.value) as Ref<T>
  let timer: ReturnType<typeof setTimeout> | undefined
  watch(source, (value) => {
    clearTimeout(timer)
    timer = setTimeout(() => { debounced.value = value }, delay)
  })
  onScopeDispose(() => clearTimeout(timer))
  return debounced
}
