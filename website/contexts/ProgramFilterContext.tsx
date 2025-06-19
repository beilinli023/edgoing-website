"use client"

import React, { createContext, useContext, useState, ReactNode } from 'react'

interface ProgramFilterContextType {
  selectedTypes: string[]
  selectedCountries: string[]
  selectedGrades: string[]
  setSelectedTypes: (types: string[]) => void
  setSelectedCountries: (countries: string[]) => void
  setSelectedGrades: (grades: string[]) => void
  clearFilters: () => void
}

const ProgramFilterContext = createContext<ProgramFilterContextType | undefined>(undefined)

export const useProgramFilter = () => {
  const context = useContext(ProgramFilterContext)
  if (!context) {
    throw new Error('useProgramFilter must be used within a ProgramFilterProvider')
  }
  return context
}

interface ProgramFilterProviderProps {
  children: ReactNode
}

export const ProgramFilterProvider: React.FC<ProgramFilterProviderProps> = ({ children }) => {
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [selectedCountries, setSelectedCountries] = useState<string[]>([])
  const [selectedGrades, setSelectedGrades] = useState<string[]>([])

  const clearFilters = () => {
    setSelectedTypes([])
    setSelectedCountries([])
    setSelectedGrades([])
  }

  return (
    <ProgramFilterContext.Provider
      value={{
        selectedTypes,
        selectedCountries,
        selectedGrades,
        setSelectedTypes,
        setSelectedCountries,
        setSelectedGrades,
        clearFilters,
      }}
    >
      {children}
    </ProgramFilterContext.Provider>
  )
}
