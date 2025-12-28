import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace('/api', '')
    : 'http://localhost:5000';

const useWebRTC = (roomId, userId) => {
    const [localStream, setLocalStream] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);
    const [connectionStatus, setConnectionStatus] = useState('disconnected');
    const [isAudioEnabled, setIsAudioEnabled] = useState(true);
    const [isVideoEnabled, setIsVideoEnabled] = useState(true);

    const [socket, setSocket] = useState(null);
    const socketRef = useRef();
    const peerConnectionRef = useRef();
    const localVideoRef = useRef();
    const remoteVideoRef = useRef();
    const remoteSocketId = useRef(null);
    const localStreamRef = useRef(null); // Fix: Use Ref to access stream inside event handlers

    const servers = {
        iceServers: [
            {
                urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'],
            },
        ],
    };

    useEffect(() => {
        if (!roomId) return;

        console.log('[CAMERA] Initializing WebRTC for room:', roomId);
        console.log('[CAMERA] Connecting to socket server at:', SOCKET_URL);

        const newSocket = io(SOCKET_URL);
        socketRef.current = newSocket;
        setSocket(newSocket);

        newSocket.on('connect', () => {
            console.log('[Socket] Connected to server:', newSocket.id);
        });

        newSocket.on('connect_error', (err) => {
            console.error('[Socket] Connection error:', err);
            setConnectionStatus('error');
        });

        // Get User Media with enhanced error handling
        console.log('[CAMERA] Requesting camera and microphone access...');
        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            .then((stream) => {
                console.log('[CAMERA] ✅ Camera access granted!');
                console.log('[CAMERA] Video tracks:', stream.getVideoTracks());
                console.log('[CAMERA] Audio tracks:', stream.getAudioTracks());

                setLocalStream(stream);
                localStreamRef.current = stream; // Update existing Ref

                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = stream;
                    localVideoRef.current.muted = true; // Always mute local video to prevent echo
                    console.log('[CAMERA] ✅ Local video element updated');
                } else {
                    console.warn('[CAMERA] ⚠️ Local video ref not ready yet, will sync via useEffect');
                }

                socketRef.current.emit('join-room', roomId, userId);
                setConnectionStatus('connected');
            })
            .catch((err) => {
                console.error('[CAMERA] ❌ Error accessing media devices:', err);
                console.error('[CAMERA] Error name:', err.name);
                console.error('[CAMERA] Error message:', err.message);

                // Provide user-friendly error messages
                let errorMessage = 'Unable to access camera/microphone.\n\n';
                let shouldAskToContinue = false;

                if (err.name === 'NotReadableError') {
                    errorMessage += 'Camera/microphone is already in use.\n\n';
                    errorMessage += 'Testing tip: Use different browsers (Chrome + Firefox) or devices.\n\n';
                    errorMessage += 'Continue without video?';
                    shouldAskToContinue = true;
                } else if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                    errorMessage += 'Permission denied. Please allow camera access.\n\n';
                    errorMessage += 'Continue without video?';
                    shouldAskToContinue = true;
                } else if (err.name === 'NotFoundError') {
                    errorMessage += 'No camera or microphone found.\n\n';
                    errorMessage += 'Continue without video?';
                    shouldAskToContinue = true;
                } else {
                    errorMessage += (err.message || 'Unknown error') + '\n\n';
                    errorMessage += 'Continue without video?';
                    shouldAskToContinue = true;
                }

                // Ask user if they want to continue without media
                if (shouldAskToContinue && confirm(errorMessage)) {
                    // Continue interview without video - still join room for questions/chat
                    socketRef.current.emit('join-room', roomId, userId);
                    setConnectionStatus('connected-no-media');
                    console.log('[CAMERA] Interview continuing without camera/microphone');
                } else {
                    setConnectionStatus('error');
                }
            });

        // Socket Events
        socketRef.current.on('user-connected', ({ userId: remoteUser, socketId }) => {
            console.log('[WEBRTC] User connected:', remoteUser, socketId);
            const currentStream = localStreamRef.current;
            console.log('[WEBRTC] Local stream available:', !!currentStream);
            console.log('[WEBRTC] Local video ref ready:', !!localVideoRef.current);
            remoteSocketId.current = socketId;


            // Check if we have a local stream to share
            if (currentStream) {
                console.log('[WEBRTC] Creating offer to:', socketId);
                createOffer(socketId);
            } else {
                console.warn('[WEBRTC] ⚠️ No local stream available yet, cannot create offer');
            }
        });

        socketRef.current.on('offer', handleReceiveOffer);
        socketRef.current.on('answer', handleReceiveAnswer);
        socketRef.current.on('ice-candidate', handleReceiveIceCandidate);

        return () => {
            if (localStreamRef.current) {
                localStreamRef.current.getTracks().forEach(track => track.stop());
            }
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
            if (peerConnectionRef.current) {
                peerConnectionRef.current.close();
            }
        };
    }, [roomId, userId]);

    // Sync localStream to video element when stream or ref changes
    useEffect(() => {
        if (localStream && localVideoRef.current) {
            console.log('[CAMERA] Syncing local stream to video element');
            localVideoRef.current.srcObject = localStream;
            localVideoRef.current.muted = true;
            console.log('[CAMERA] ✅ Local stream synced successfully');
        }
    }, [localStream]);

    // Sync remoteStream to video element when stream or ref changes
    useEffect(() => {
        if (remoteStream && remoteVideoRef.current) {
            console.log('[CAMERA] Syncing remote stream to video element');
            remoteVideoRef.current.srcObject = remoteStream;
            console.log('[CAMERA] ✅ Remote stream synced successfully');
        }
    }, [remoteStream]);

    const createPeerConnection = () => {
        const peerConnection = new RTCPeerConnection(servers);

        peerConnection.onicecandidate = (event) => {
            if (event.candidate && remoteSocketId.current) {
                socketRef.current.emit('ice-candidate', {
                    target: remoteSocketId.current,
                    candidate: event.candidate,
                });
            }
        };

        peerConnection.ontrack = (event) => {
            setRemoteStream(event.streams[0]);
            if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = event.streams[0];
            }
        };

        const currentStream = localStreamRef.current;
        if (currentStream) {
            currentStream.getTracks().forEach((track) => {
                peerConnection.addTrack(track, currentStream);
            });
        }

        peerConnectionRef.current = peerConnection;
        return peerConnection;
    };

    const createOffer = async (targetSocketId) => {
        const peerConnection = createPeerConnection();
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);

        socketRef.current.emit('offer', {
            target: targetSocketId,
            sdp: offer,
            senderSocketId: socketRef.current.id // Send back own ID so receiver knows who sent it
        });
    };

    const handleReceiveOffer = async ({ sdp, senderSocketId }) => {
        remoteSocketId.current = senderSocketId; // Capture sender ID

        const peerConnection = createPeerConnection();
        await peerConnection.setRemoteDescription(new RTCSessionDescription(sdp));

        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);

        socketRef.current.emit('answer', {
            target: senderSocketId,
            sdp: answer,
        });
    };

    const handleReceiveAnswer = async ({ sdp }) => {
        if (peerConnectionRef.current) {
            await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(sdp));
        }
    };

    const handleReceiveIceCandidate = async (candidate) => {
        if (peerConnectionRef.current) {
            try {
                await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
            } catch (e) {
                console.error('Error adding received ice candidate', e);
            }
        }
    };

    const toggleAudio = () => {
        if (localStream) {
            localStream.getAudioTracks().forEach(track => {
                track.enabled = !track.enabled;
            });
            setIsAudioEnabled(!isAudioEnabled);
        }
    };

    const toggleVideo = () => {
        if (localStream) {
            localStream.getVideoTracks().forEach(track => {
                track.enabled = !track.enabled;
            });
            setIsVideoEnabled(!isVideoEnabled);
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
        socketRef,
        socket
    };
};

export default useWebRTC;
