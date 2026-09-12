import { useState } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Toaster } from 'sonner'
import { ThemeProvider, useTheme } from '@/components/theme/theme-provider'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AuthProvider } from '@/features/auth/auth-provider'
import { useIsMobile } from '@/hooks/use-media-query'
import { createQueryClient } from '@/lib/query-client'

function AppToaster() {
  const { resolvedTheme } = useTheme()
  const isMobile = useIsMobile()
  return (
    <Toaster
      theme={resolvedTheme}
      position={isMobile ? 'top-center' : 'bottom-right'}
      closeButton
      richColors
      toastOptions={{ className: 'font-sans', duration: 4000 }}
    />
  )
}

export function Providers({ children }) {
  const [queryClient] = useState(createQueryClient)
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider delayDuration={300}>
          <AuthProvider>
            {children}
            <AppToaster />
          </AuthProvider>
        </TooltipProvider>
        {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />}
      </ThemeProvider>
    </QueryClientProvider>
  )
}
