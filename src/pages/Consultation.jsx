import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import useAgora from '../lib/useAgora';
import useAgoraChat from '../lib/useAgoraChat';

/* ─── Remote video player ──────────────────────────────────────── */
function RemoteVideoPlayer({ user }) {
  const ref = useRef(null);
  useEffect(() => {
    if (user.videoTrack && ref.current) user.videoTrack.play(ref.current);
    return () => { user.videoTrack?.stop(); };
  }, [user.videoTrack]);

  useEffect(() => {
    if (user.audioTrack) user.audioTrack.play();
    return () => { user.audioTrack?.stop(); };
  }, [user.audioTrack]);

  return <div ref={ref} className="cp-agora-remote" />;
}

/* ─── Local video player ───────────────────────────────────────── */
function LocalVideoPlayer({ track }) {
  const ref = useRef(null);
  useEffect(() => {
    if (track && ref.current) track.play(ref.current);
    return () => { track?.stop(); };
  }, [track]);
  return <div ref={ref} className="cp-agora-local" />;
}

export default function Consultation() {
  const navigate = useNavigate();
  const { appointmentId } = useParams();
  const { profile, appointments, doctors, fetchAPI } = useApp();

  const agora = useAgora();
  const chat = useAgoraChat();

  const [joining, setJoining] = useState(false);
  const [inCall, setInCall] = useState(false);
  const [ended, setEnded] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef(null);

  // Scroll chat to bottom on new message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat.messages]);

  // Find the appointment and its doctor
  const appointment = useMemo(() => {
    if (!appointmentId) return null;
    return appointments.find((a) => (a._id || a.id) === appointmentId) || null;
  }, [appointmentId, appointments]);

  const doctor = useMemo(() => {
    if (!appointment) return null;
    return doctors.find((d) => (d._id || d.id) === appointment.doctorId) || null;
  }, [appointment, doctors]);

  /* ─── Join the call ────────────────────────────── */
  const handleJoinCall = useCallback(async () => {
    if (!appointmentId) return;
    setJoining(true);
    try {
      const { appId } = await fetchAPI('/agora/config');

      const uid = Math.abs(hashCode(profile?._id || profile?.id || 'patient')) % 100000;

      // Fetch tokens
      const [{ token: rtcToken }, { token: rtmToken }] = await Promise.all([
        fetchAPI(`/agora/token?channelName=${appointmentId}&uid=${uid}`),
        fetchAPI(`/agora/rtm-token?uid=pat_${uid}`)
      ]);

      // Channel name matches the doctor side
      await agora.join(appId, appointmentId, rtcToken, uid);

      // Join RTM chat
      const chatUid = `pat_${uid}`;
      await chat.login(appId, chatUid, rtmToken, profile?.name || 'Patient');
      await chat.joinChannel(`chat_${appointmentId}`);

      setInCall(true);
    } catch (err) {
      console.error('Failed to join call:', err);
    } finally {
      setJoining(false);
    }
  }, [appointmentId, fetchAPI, profile, agora, chat]);

  /* ─── Leave / End call ─────────────────────────── */
  const handleEndCall = useCallback(async () => {
    await agora.leave();
    await chat.logout();
    setInCall(false);
    setEnded(true);
  }, [agora, chat]);

  /* ─── Send chat message ────────────────────────── */
  const handleSendChat = useCallback((e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    chat.sendMessage(chatInput);
    setChatInput('');
  }, [chatInput, chat]);

  // ─── ENDED SCREEN ─────────────────────────────────
  if (ended) {
    return (
      <div className="cp-page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '70vh', textAlign: 'center' }}>
        <div className="animate-fade-in-up">
          <div style={{
            width: 80, height: 80, borderRadius: '50%', background: 'var(--tertiary-fixed)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px',
          }}>
            <span className="material-symbols-outlined filled" style={{ fontSize: 40, color: 'var(--tertiary)' }}>check_circle</span>
          </div>
          <h1 className="cp-title cp-mb-2">Consultation Complete</h1>
          <p className="cp-subtitle cp-mb-4">Your prescription has been automatically added to your health records.</p>
          <div className="cp-flex cp-items-center cp-gap-3 cp-justify-center cp-mb-8">
            <span className="cp-tag cp-tag--success cp-tag--lg">
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>description</span>
              Prescription Added
            </span>
          </div>
          <div className="cp-flex cp-gap-4 cp-justify-center">
            <button className="cp-btn cp-btn--primary" onClick={() => navigate('/records')}>
              View Records
            </button>
            <button className="cp-btn cp-btn--secondary" onClick={() => navigate('/')}>
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── NO APPOINTMENT ID — show a prompt ────────────
  if (!appointmentId) {
    return (
      <div className="cp-page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '70vh', textAlign: 'center' }}>
        <div className="animate-fade-in-up">
          <div style={{ fontSize: 64, marginBottom: 16 }}>📹</div>
          <h1 className="cp-title cp-mb-2">Video Consultation</h1>
          <p className="cp-subtitle cp-mb-4">Select a video appointment from your dashboard to join a consultation.</p>
          <button className="cp-btn cp-btn--primary" onClick={() => navigate('/')}>
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // ─── MAIN CONSULTATION VIEW ───────────────────────
  return (
    <div className="cp-page">
      <div className="cp-section-header animate-fade-in-up">
        <h1 className="cp-title">Video Consultation</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {inCall && <span className="cp-agora-live-dot" />}
          <span className="cp-tag cp-tag--success cp-tag--lg">
            {inCall ? 'Live' : 'Ready'}
          </span>
        </div>
      </div>

      <div className="cp-grid cp-grid--12" style={{ marginTop: 20 }}>
        {/* ─── Video Area ───────────────────────── */}
        <div className="cp-col-8">
          <div className="cp-agora-video-stage animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            {/* Remote video (main) */}
            {agora.remoteUsers.length > 0 ? (
              agora.remoteUsers.map((user) => (
                <RemoteVideoPlayer key={user.uid} user={user} />
              ))
            ) : (
              <div className="cp-agora-waiting">
                {inCall ? (
                  <>
                    <div className="cp-agora-waiting-spinner" />
                    <div className="cp-agora-waiting-text">Waiting for doctor to join…</div>
                  </>
                ) : (
                  <>
                    <div style={{ fontSize: 48 }}>📹</div>
                    <div className="cp-agora-waiting-text">
                      {doctor ? `Join call with Dr. ${doctor.name}` : 'Ready to connect'}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Local video PiP */}
            {agora.localVideoTrack && (
              <div className="cp-agora-pip">
                <LocalVideoPlayer track={agora.localVideoTrack} />
                <div className="cp-agora-pip-label">You</div>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="cp-agora-controls animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            {!inCall ? (
              <button
                className="cp-agora-ctrl cp-agora-ctrl--join"
                onClick={handleJoinCall}
                disabled={joining}
              >
                {joining ? 'Connecting…' : '📞 Join Call'}
              </button>
            ) : (
              <>
                <button
                  className={`cp-video-ctrl-btn cp-video-ctrl-btn--default ${agora.isMuted ? 'cp-agora-ctrl--active' : ''}`}
                  onClick={agora.toggleMic}
                  title={agora.isMuted ? 'Unmute' : 'Mute'}
                >
                  <span className="material-symbols-outlined">{agora.isMuted ? 'mic_off' : 'mic'}</span>
                </button>
                <button
                  className={`cp-video-ctrl-btn cp-video-ctrl-btn--default ${agora.isCameraOff ? 'cp-agora-ctrl--active' : ''}`}
                  onClick={agora.toggleCamera}
                  title={agora.isCameraOff ? 'Turn on camera' : 'Turn off camera'}
                >
                  <span className="material-symbols-outlined">{agora.isCameraOff ? 'videocam_off' : 'videocam'}</span>
                </button>
                <button
                  className="cp-video-ctrl-btn cp-video-ctrl-btn--danger"
                  onClick={handleEndCall}
                  title="End Call"
                >
                  <span className="material-symbols-outlined">call_end</span>
                </button>
              </>
            )}
          </div>

          {/* Error */}
          {agora.error && (
            <div className="cp-card" style={{ background: 'var(--error-container)', marginTop: 12, padding: 12 }}>
              <span style={{ color: 'var(--error)', fontWeight: 700, fontSize: 14 }}>{agora.error}</span>
            </div>
          )}
        </div>

        {/* ─── Chat Sidebar ─────────────────────── */}
        <aside className="cp-col-4">
          <div className="cp-card animate-fade-in-up cp-agora-chat-card" style={{ animationDelay: '0.15s' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 className="cp-section-title">Chat</h3>
              {chat.isConnected && (
                <span className="cp-tag cp-tag--success" style={{ fontSize: 10 }}>Connected</span>
              )}
            </div>

            <div className="cp-agora-chat-messages">
              {chat.messages.length === 0 && (
                <div className="cp-muted" style={{ textAlign: 'center', padding: '24px 0' }}>
                  {inCall ? 'No messages yet' : 'Join the call to chat'}
                </div>
              )}
              {chat.messages.map((msg, i) => (
                <div
                  key={i}
                  className={`cp-agora-chat-msg ${msg.from === 'me' ? 'cp-agora-chat-msg--mine' : ''} ${msg.from === 'system' ? 'cp-agora-chat-msg--system' : ''}`}
                >
                  {msg.from !== 'me' && msg.from !== 'system' && (
                    <div className="cp-agora-chat-sender">{msg.displayName}</div>
                  )}
                  <div className="cp-agora-chat-text">{msg.text}</div>
                  <span className="cp-agora-chat-time">{msg.time}</span>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            {inCall && (
              <form onSubmit={handleSendChat} className="cp-flex cp-gap-2" style={{ marginTop: 12 }}>
                <input
                  className="cp-input"
                  placeholder="Type a message..."
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  style={{ borderRadius: 'var(--radius-full)', flex: 1 }}
                />
                <button className="cp-btn cp-btn--primary" type="submit" style={{ borderRadius: 'var(--radius-full)', padding: '10px 16px' }}>
                  <span className="material-symbols-outlined">send</span>
                </button>
              </form>
            )}
          </div>

          {/* Doctor info */}
          {doctor && (
            <div className="cp-card animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <h3 className="cp-section-title cp-mb-2">Your Doctor</h3>
              <div className="cp-flex cp-items-center cp-gap-3">
                <div style={{
                  width: 48, height: 48, borderRadius: '50%', background: 'var(--primary-container)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800,
                  color: 'var(--on-primary)', flexShrink: 0, overflow: 'hidden'
                }}>
                  {doctor.avatarUrl
                    ? <img src={doctor.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : doctor.name?.charAt(0)}
                </div>
                <div>
                  <div style={{ fontWeight: 800, color: 'var(--text-h)' }}>Dr. {doctor.name}</div>
                  <div className="cp-muted cp-small">{doctor.specialty || 'General'}</div>
                </div>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return hash;
}
