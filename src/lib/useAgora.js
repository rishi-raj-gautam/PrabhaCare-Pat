import { useState, useRef, useCallback, useEffect } from 'react'
import AgoraRTC from 'agora-rtc-sdk-ng'

// Suppress Agora console noise in dev
AgoraRTC.setLogLevel(3)

/**
 * useAgora — Manages Agora RTC video/audio for a 1-to-1 call.
 */
export default function useAgora() {
  const clientRef = useRef(null)
  const localAudioTrackRef = useRef(null)
  const localVideoTrackRef = useRef(null)

  const [localVideoTrack, setLocalVideoTrack] = useState(null)
  const [remoteUsers, setRemoteUsers] = useState([])
  const [connectionState, setConnectionState] = useState('DISCONNECTED')
  const [isMuted, setIsMuted] = useState(false)
  const [isCameraOff, setIsCameraOff] = useState(false)
  const [error, setError] = useState(null)

  const getClient = useCallback(() => {
    if (!clientRef.current) {
      clientRef.current = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' })

      clientRef.current.on('connection-state-change', (cur) => {
        setConnectionState(cur)
      })

      clientRef.current.on('user-published', async (user, mediaType) => {
        await clientRef.current.subscribe(user, mediaType)
        setRemoteUsers((prev) => {
          const filtered = prev.filter((u) => u.uid !== user.uid)
          return [...filtered, user]
        })
      })

      clientRef.current.on('user-unpublished', (user, mediaType) => {
        setRemoteUsers((prev) => {
          const filtered = prev.filter((u) => u.uid !== user.uid)
          return [...filtered, user]
        })
      })

      clientRef.current.on('user-left', (user) => {
        setRemoteUsers((prev) => prev.filter((u) => u.uid !== user.uid))
      })
    }
    return clientRef.current
  }, [])

  const join = useCallback(async (appId, channel, token, uid) => {
    setError(null)
    try {
      const client = getClient()
      await client.join(appId, channel, token || null, uid || 0)

      const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks(
        { encoderConfig: 'speech_standard' },
        { encoderConfig: '720p_2' }
      )

      localAudioTrackRef.current = audioTrack
      localVideoTrackRef.current = videoTrack
      setLocalVideoTrack(videoTrack)

      await client.publish([audioTrack, videoTrack])
    } catch (err) {
      console.error('[useAgora] join error:', err)
      setError(err?.message || 'Failed to join video call')
      throw err
    }
  }, [getClient])

  const leave = useCallback(async () => {
    try {
      if (localAudioTrackRef.current) {
        localAudioTrackRef.current.stop()
        localAudioTrackRef.current.close()
        localAudioTrackRef.current = null
      }
      if (localVideoTrackRef.current) {
        localVideoTrackRef.current.stop()
        localVideoTrackRef.current.close()
        localVideoTrackRef.current = null
      }
      setLocalVideoTrack(null)
      setRemoteUsers([])
      setIsMuted(false)
      setIsCameraOff(false)

      if (clientRef.current) {
        await clientRef.current.leave()
      }
    } catch (err) {
      console.error('[useAgora] leave error:', err)
    }
  }, [])

  const toggleMic = useCallback(async () => {
    const track = localAudioTrackRef.current
    if (!track) return
    await track.setEnabled(!track.enabled)
    setIsMuted(!track.enabled)
  }, [])

  const toggleCamera = useCallback(async () => {
    const track = localVideoTrackRef.current
    if (!track) return
    await track.setEnabled(!track.enabled)
    setIsCameraOff(!track.enabled)
  }, [])

  useEffect(() => {
    return () => { leave() }
  }, [leave])

  return {
    join,
    leave,
    toggleMic,
    toggleCamera,
    localVideoTrack,
    remoteUsers,
    connectionState,
    isMuted,
    isCameraOff,
    error,
  }
}
