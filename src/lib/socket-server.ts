import { io as ioClient } from 'socket.io-client'

let clientSocket: ReturnType<typeof ioClient> | null = null

function getSyncClient() {
  if (!clientSocket) {
    try {
      // Only connect if SYNC_URL is set (for self-hosted deployments)
      const syncUrl = process.env.SYNC_URL
      if (!syncUrl) {
        console.log('[SYNC-SERVER] SYNC_URL not set, sync disabled (polling mode)')
        return null
      }

      clientSocket = ioClient(syncUrl, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 10000,
      })

      clientSocket.on('connect', () => {
        console.log('[SYNC-SERVER] Server-side sync client connected:', clientSocket?.id)
      })

      clientSocket.on('disconnect', (reason) => {
        console.log('[SYNC-SERVER] Server-side sync client disconnected:', reason)
      })

      clientSocket.on('connect_error', (error) => {
        console.error('[SYNC-SERVER] Connection error:', error.message)
      })
    } catch (error) {
      console.error('[SYNC-SERVER] Failed to initialize sync client:', error)
      return null
    }
  }
  return clientSocket
}

export function emitSync(event: string, data: unknown) {
  try {
    const client = getSyncClient()
    if (!client) {
      // Sync disabled - this is normal on Vercel
      return false
    }

    if (!client.connected) {
      client.emit(`sync:${event}`, data)
      return true
    }

    client.emit(`sync:${event}`, data)
    return true
  } catch (error) {
    console.error('[SYNC-SERVER] Error emitting event:', event, error)
    return false
  }
}

// Pre-warm the connection on module load (only if SYNC_URL is set)
if (process.env.SYNC_URL) {
  getSyncClient()
}
