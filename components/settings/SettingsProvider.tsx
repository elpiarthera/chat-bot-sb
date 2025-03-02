import React, { createContext, useEffect, useState, ReactNode } from "react"
import { errorHandlingFetcher } from "../../lib/fetcher"
import useSWR from "swr"

interface Settings {
  needs_reindexing: boolean
  [key: string]: any
}

interface SettingsContextType {
  settings: Settings
  isLoading: boolean
  error: any
  refreshSettings: () => void
}

export const SettingsContext = createContext<SettingsContextType | null>(null)

interface SettingsProviderProps {
  children: ReactNode
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({
  children
}) => {
  const {
    data: settings,
    isLoading,
    error,
    mutate
  } = useSWR<Settings>(
    "/api/settings",
    errorHandlingFetcher,
    { refreshInterval: 60000 } // Refresh every minute
  )

  const refreshSettings = () => {
    mutate()
  }

  const defaultSettings: Settings = {
    needs_reindexing: false
  }

  return (
    <SettingsContext.Provider
      value={{
        settings: settings || defaultSettings,
        isLoading,
        error,
        refreshSettings
      }}
    >
      {children}
    </SettingsContext.Provider>
  )
}
