import { useCallback, useEffect, useRef, useState } from 'react'

async function writeClipboard(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text)
    return
  }
  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.setAttribute('readonly', '')
  textarea.style.position = 'fixed'
  textarea.style.opacity = '0'
  document.body.appendChild(textarea)
  textarea.select()
  document.execCommand('copy')
  textarea.remove()
}

export function useCopyToClipboard(resetAfterMs = 1500) {
  const [copied, setCopied] = useState(false)
  const timeoutRef = useRef(null)

  useEffect(() => () => clearTimeout(timeoutRef.current), [])

  const copy = useCallback(
    async (text) => {
      try {
        await writeClipboard(String(text))
        setCopied(true)
        clearTimeout(timeoutRef.current)
        timeoutRef.current = setTimeout(() => setCopied(false), resetAfterMs)
        return true
      } catch {
        setCopied(false)
        return false
      }
    },
    [resetAfterMs]
  )

  return { copied, copy }
}
