"use client"

import { Toaster } from "@/components/ui/sonner"
import { Providers } from "@/components/utility/providers"
import { I18nextProvider } from "react-i18next"
import { createInstance } from "i18next"
import initTranslations from "@/lib/i18n"
import { ReactNode } from "react"

export const ClientProviders = ({
  children,
  locale,
  resources,
  namespaces
}: {
  children: ReactNode
  locale: string
  resources: any
  namespaces: string[]
}) => {
  const i18n = createInstance()
  initTranslations(locale, namespaces, i18n, resources)

  return (
    <Providers attribute="class" defaultTheme="dark">
      <I18nextProvider i18n={i18n}>
        <Toaster richColors position="top-center" duration={3000} />
        <div className="bg-background text-foreground flex h-dvh flex-col items-center overflow-x-auto">
          {children}
        </div>
      </I18nextProvider>
    </Providers>
  )
}
