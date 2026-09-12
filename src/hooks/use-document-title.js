import { useEffect } from 'react'
import { APP_NAME } from '@/lib/constants'

export function useDocumentTitle(title) {
  useEffect(() => {
    const previous = document.title
    document.title = title ? `${title} · ${APP_NAME} Admin` : `${APP_NAME} Admin`
    return () => {
      document.title = previous
    }
  }, [title])
}
