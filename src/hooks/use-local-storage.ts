import { useState, useEffect } from 'react'

export function useLocalStorage<T>(key: string, initialValue: T) {
  // 状態の初期化
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue
    }

    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  })

  // 値の更新と保存
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)

      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error)
    }
  }

  return [storedValue, setValue] as const
}

// 複数のキーを一度に扱うバージョン
export function useLocalStorageMulti<T extends Record<string, any>>(
  keys: { [K in keyof T]: string },
  initialValues: T
) {
  const [values, setValues] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValues
    }

    const loadedValues = { ...initialValues }
    Object.entries(keys).forEach(([key, storageKey]) => {
      try {
        const item = window.localStorage.getItem(storageKey)
        if (item) {
          loadedValues[key as keyof T] = JSON.parse(item)
        }
      } catch (error) {
        console.warn(`Error reading localStorage key "${storageKey}":`, error)
      }
    })
    return loadedValues
  })

  const setValueForKey = <K extends keyof T>(key: K, value: T[K]) => {
    try {
      const newValues = { ...values, [key]: value }
      setValues(newValues)

      if (typeof window !== 'undefined') {
        window.localStorage.setItem(keys[key], JSON.stringify(value))
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${keys[key]}":`, error)
    }
  }

  return [values, setValueForKey] as const
}