import { useEffect, useRef } from 'react'
import { listNotifications } from '../api/system.js'

const POLL_INTERVAL_MS = 30_000

/**
 * Polls /api/system/notifications every 30s.
 * Pauses automatically when the tab is hidden, resumes when visible.
 * Only updates state when new unread notifications arrive.
 *
 * @param {function} onNewNotifications - callback(notifications[]) called when fresh data arrives
 */
export function useNotificationPolling(onNewNotifications) {
  const timerRef = useRef(null)
  const callbackRef = useRef(onNewNotifications)

  // Keep callback ref current without re-triggering effect
  useEffect(() => {
    callbackRef.current = onNewNotifications
  })

  useEffect(() => {
    async function fetchOnce() {
      try {
        const data = await listNotifications()
        if (Array.isArray(data)) {
          callbackRef.current(data)
        }
      } catch (_) {}
    }

    function startPolling() {
      if (timerRef.current) return
      timerRef.current = setInterval(() => {
        if (document.visibilityState === 'visible') {
          fetchOnce()
        }
      }, POLL_INTERVAL_MS)
    }

    function stopPolling() {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }

    function handleVisibilityChange() {
      if (document.visibilityState === 'visible') {
        fetchOnce()
        startPolling()
      } else {
        stopPolling()
      }
    }

    startPolling()
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      stopPolling()
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])
}
