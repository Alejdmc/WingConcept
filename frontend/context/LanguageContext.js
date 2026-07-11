'use client'
import { createContext, useContext, useState, useEffect } from 'react'

const LanguageContext = createContext()

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('en')
  const [isLoaded, setIsLoaded] = useState(false)

  // Load language from localStorage on mount
  useEffect(() => {
    const savedLang = localStorage.getItem('language') || 'en'
    setLanguage(savedLang)
    setIsLoaded(true)
  }, [])

  const changeLanguage = (lang) => {
    setLanguage(lang)
    localStorage.setItem('language', lang)
  }

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, isLoaded }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider')
  }
  return context
}