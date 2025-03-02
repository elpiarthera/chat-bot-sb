import { Toaster } from "@/components/ui/sonner"
import { GlobalState } from "@/components/utility/global-state"
import { Providers } from "@/components/utility/providers"
import { I18nextProvider } from "react-i18next"
import { createInstance } from "i18next"
import initTranslations from "@/lib/i18n"
import { Database } from "@/supabase/types"
import { createServerClient } from "@supabase/ssr"
import { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import { cookies } from "next/headers"
import { ReactNode } from "react"
import "../globals.css"
import Script from "next/script"
import dynamic from "next/dynamic"
import { ClientProviders } from "@/components/utility/client-providers"

// Add a simple client-side only debug component
const DebugInitializer = dynamic(
  () =>
    Promise.resolve(() => {
      // This code will only run on the client
      console.log("🔍 DebugInitializer: Application starting up")

      // Add a global error handler
      if (typeof window !== "undefined") {
        window.onerror = function (message, source, lineno, colno, error) {
          console.error("🚨 Global error caught:", {
            message,
            source,
            lineno,
            colno
          })
          if (error) {
            console.error("Error details:", error)
          }
          return false
        }

        // Also handle unhandled promise rejections
        window.addEventListener("unhandledrejection", function (event) {
          console.error("🚨 Unhandled Promise Rejection:", event.reason)
        })

        console.log("🔍 Global error handlers installed")

        // This is a diagnostic step - force clear any localStorage that might be causing issues
        try {
          console.log("Checking localStorage...")
          const keys = Object.keys(localStorage)
          console.log(`Found ${keys.length} localStorage items:`, keys)
        } catch (e) {
          console.error("Error accessing localStorage:", e)
        }
      }

      return null
    }),
  { ssr: false }
)

const inter = Inter({ subsets: ["latin"] })
const APP_NAME = "My AI team"
const APP_DEFAULT_TITLE = "My AI team"
const APP_TITLE_TEMPLATE = "%s - My AI team"
const APP_DESCRIPTION = "Chabot UI PWA!"

interface RootLayoutProps {
  children: ReactNode
  params: {
    locale: string
  }
}

export const metadata: Metadata = {
  applicationName: APP_NAME,
  title: {
    default: APP_DEFAULT_TITLE,
    template: APP_TITLE_TEMPLATE
  },
  description: APP_DESCRIPTION,
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black",
    title: APP_DEFAULT_TITLE
    // startUpImage: [],
  },
  formatDetection: {
    telephone: false
  },
  openGraph: {
    type: "website",
    siteName: APP_NAME,
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE
    },
    description: APP_DESCRIPTION
  },
  twitter: {
    card: "summary",
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE
    },
    description: APP_DESCRIPTION
  }
}

export const viewport: Viewport = {
  themeColor: "#000000"
}

const i18nNamespaces = ["translation"]

export default async function RootLayout({
  children,
  params: { locale }
}: RootLayoutProps) {
  const cookieStore = cookies()
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        }
      }
    }
  )
  const session = (await supabase.auth.getSession()).data.session

  const { t, resources } = await initTranslations(locale, i18nNamespaces)

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script src="/sw-cleanup.js" strategy="beforeInteractive" />

        {/* Add minimal inline script that will help with debugging */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
            console.log("🔍 Inline script executed");
            window.APP_DEBUG = {
              startTime: Date.now(),
              errors: []
            };
            
            // Try to unregister service workers directly
            if ('serviceWorker' in navigator) {
              navigator.serviceWorker.getRegistrations().then(function(registrations) {
                for(let registration of registrations) {
                  registration.unregister();
                }
              });
            }
          `
          }}
        />
      </head>
      <body className={inter.className}>
        <DebugInitializer />
        <ClientProviders
          locale={locale}
          resources={resources}
          namespaces={i18nNamespaces}
        >
          {session ? <GlobalState>{children}</GlobalState> : children}
        </ClientProviders>
      </body>
    </html>
  )
}
