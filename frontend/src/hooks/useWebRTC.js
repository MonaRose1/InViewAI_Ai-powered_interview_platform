import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace('/api', '')
    : 'http://localhost:5000';

const useWebRTC = (roomId, userId, isInterviewer = false) => {
    const [localStream, setLocalStream] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);
    const [connectionStatus, setConnectionStatus] = useState('disconnected');
    const [isAudioEnabled, setIsAudioEnabled] = useState(true);
    const [isVideoEnabled, setIsVideoEnabled] = useState(true);

    const pcRef = useRef(null);
    const socketRef = useRef(null);
    const [socket, setSocket] = useState(null);

    const localVideoRef = useRef();
    const remoteVideoRef = useRef();
    const localStreamRef = useRef(null);
    const candidatesQueue = useRef([]);

    const servers = {
        iceServers: [
            { urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'] },
        ],
    };

    // --- STEP 1: CREATE THE CONNECTION ---
    const createPeerConnection = () => {
        // If we already have a connection, don't make a new one
        if (pcRef.current) return pcRef.current;

        console.log(`[RTC] 🛠️ Creating PC (${isInterviewer ? 'Initiator' : 'Responder'})`);
        const pc = new RTCPeerConnection(servers);
        pcRef.current = pc;

        // When the browser finds a path to connect, tell the other person
        pc.onicecandidate = ({ candidate }) => {
            if (candidate && socketRef.current) {
                socketRef.current.emit('ice-candidate', { target: roomId, candidate });
            }
        };

        // Track if we are connected, disconnected, or failed
        pc.oniceconnectionstatechange = () => {
            console.log('[RTC] 🌐 ICE State:', pc.iceConnectionState);
            setConnectionStatus(pc.iceConnectionState);
        };

        // When we receive video/audio from the other person, show it on screen
        pc.ontrack = ({ streams }) => {
            console.log('[RTC] 📥 Remote track received');
            const remoteStreamData = streams[0];
            if (remoteStreamData && remoteVideoRef.current) {
                setRemoteStream(remoteStreamData);
                remoteVideoRef.current.srcObject = remoteStreamData;
            }
        };

        // If we have our own camera/mic ready, add them to the connection
        if (localStreamRef.current) {
            console.log('[RTC] 📤 Adding local tracks');
            localStreamRef.current.getTracks().forEach(track => {
                pc.addTrack(track, localStreamRef.current);
            });
        }

        return pc;
    };

    // --- STEP 2: SIGNALING (THE PHONE CALL) ---

    // The interviewer starts the call by sending an "Offer"
    const startCall = async () => {
        if (!isInterviewer) return;
        const pc = createPeerConnection();
        try {
            console.log('[RTC] 📞 Interviewer starting call...');
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            socketRef.current.emit('offer', { target: roomId, sdp: pc.localDescription });
        } catch (err) {
            console.error('[RTC] Offer Error:', err);
        }
    };

    // The candidate receives the offer and sends back an "Answer"
    const handleOffer = async (sdp) => {
        if (isInterviewer) {
            console.warn('[RTC] Interviewer received an offer, ignoring secondary offer');
            return;
        }
        const pc = createPeerConnection();
        try {
            console.log('[RTC] 📥 Candidate handling offer...');
            await pc.setRemoteDescription(new RTCSessionDescription(sdp));

            // If we got connection info before the offer was ready, handle it now
            while (candidatesQueue.current.length > 0) {
                const queuedCandidate = candidatesQueue.current.shift();
                await pc.addIceCandidate(new RTCIceCandidate(queuedCandidate));
            }

            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            socketRef.current.emit('answer', { target: roomId, sdp: pc.localDescription });
        } catch (err) {
            console.error('[RTC] Answer Error:', err);
        }
    };

    // The interviewer receives the answer to finish the handshake
    const handleAnswer = async (sdp) => {
        if (!isInterviewer) return;
        console.log('[RTC] 📥 Interviewer handling answer');
        if (pcRef.current) {
            try {
                await pcRef.current.setRemoteDescription(new RTCSessionDescription(sdp));
                // Handle any connection candidates that arrived early
                while (candidatesQueue.current.length > 0) {
                    const queuedCandidate = candidatesQueue.current.shift();
                    await pcRef.current.addIceCandidate(new RTCIceCandidate(queuedCandidate));
                }
            } catch (err) {
                console.error('[RTC] Answer Handling Error:', err);
            }
        }
    };

    // Handle connection routing info (ICE candidates)
    const handleCandidate = async (candidate) => {
        const pc = pcRef.current;
        if (pc && pc.remoteDescription) {
            try {
                await pc.addIceCandidate(new RTCIceCandidate(candidate));
            } catch (e) {
                console.warn('[RTC] ICE candidate failed', e);
            }
        } else {
            console.log('[RTC] ⏳ Queuing connection info until ready...');
            candidatesQueue.current.push(candidate);
        }
    };

    useEffect(() => {
        if (!roomId) return;

        const s = io(SOCKET_URL);
        socketRef.current = s;
        setSocket(s);

        s.on('connect', () => {
            console.log('[RTC] 🔌 Socket Connected:', s.id);
            s.emit('join-room', roomId, userId);
        });

        s.on('user-connected', () => {
            console.log('[RTC] 👤 Peer joined room');
            if (isInterviewer && localStreamRef.current) {
                startCall();
            }
        });

        s.on('offer', (data) => handleOffer(data.sdp));
        s.on('answer', (data) => handleAnswer(data.sdp));
        s.on('ice-candidate', (data) => handleCandidate(data.candidate));

        // Media Acquisition
        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            .then(stream => {
                console.log('[RTC] 🎥 Local media acquired');
                setLocalStream(stream);
                localStreamRef.current = stream;
                if (localVideoRef.current) localVideoRef.current.srcObject = stream;

                // If I am interviewer and I'm joining a room where candidate might be already waiting
                if (isInterviewer) {
                    // We wait a bit or check if we should start
                    // Simplest: just try to start, if nobody is there, the offer goes nowhere.
                    // When the candidate joins later, 'user-connected' will trigger another startCall.
                    startCall();
                }
            })
            .catch(err => {
                console.error('[RTC] Media Error:', err);
                setConnectionStatus('no-media');
            });

        return () => {
            console.log('[RTC] 🧹 Hook Cleanup');
            s.disconnect();
            if (localStreamRef.current) localStreamRef.current.getTracks().forEach(t => t.stop());
            if (pcRef.current) pcRef.current.close();
            pcRef.current = null;
        };
    }, [roomId, userId, isInterviewer]);

    const toggleAudio = () => {
        const stream = localStreamRef.current;
        if (stream) {
            const enabled = !isAudioEnabled;
            stream.getAudioTracks().forEach(t => {
                t.enabled = enabled;
                console.log(`[RTC] Audio Track ${t.id} enabled: ${enabled}`);
            });
            setIsAudioEnabled(enabled);
        }
    };

    const toggleVideo = () => {
        const stream = localStreamRef.current;
        if (stream) {
            const enabled = !isVideoEnabled;
            stream.getVideoTracks().forEach(t => {
                t.enabled = enabled;
                console.log(`[RTC] Video Track ${t.id} enabled: ${enabled}`);
            });
            setIsVideoEnabled(enabled);
        }
    };

    return {
        localVideoRef,
        remoteVideoRef,
        connectionStatus,
        toggleAudio,
        toggleVideo,
        isAudioEnabled,
        isVideoEnabled,
        socket
    };
};

export default useWebRTC;
