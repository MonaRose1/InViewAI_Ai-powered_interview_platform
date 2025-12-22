import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = '';

const useWebRTC = (roomId, userId) => {
    const [localStream, setLocalStream] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);
    const [connectionStatus, setConnectionStatus] = useState('disconnected');
    const [isAudioEnabled, setIsAudioEnabled] = useState(true);
    const [isVideoEnabled, setIsVideoEnabled] = useState(true);

    const socketRef = useRef();
    const peerConnectionRef = useRef();
    const localVideoRef = useRef();
    const remoteVideoRef = useRef();
    const remoteSocketId = useRef(null);

    const servers = {
        iceServers: [
            {
                urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'],
            },
        ],
    };

    useEffect(() => {
        if (!roomId) return;

        socketRef.current = io(SOCKET_URL);

        // Get User Media with enhanced error handling
        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            .then((stream) => {
                setLocalStream(stream);
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = stream;
                    localVideoRef.current.muted = true; // Always mute local video to prevent echo
                }

                socketRef.current.emit('join-room', roomId, userId);
                setConnectionStatus('connecting');
            })
            .catch((err) => {
                console.error('Error accessing media devices:', err);

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
                    console.log('Interview continuing without camera/microphone');
                } else {
                    setConnectionStatus('error');
                }
            });

        // Socket Events
        socketRef.current.on('user-connected', ({ userId: remoteUser, socketId }) => {
            console.log('User connected:', remoteUser, socketId);
            remoteSocketId.current = socketId;
            // Use current value of ref to avoid stale closure
            if (localVideoRef.current?.srcObject) {
                createOffer(socketId);
            }
        });

        socketRef.current.on('offer', handleReceiveOffer);
        socketRef.current.on('answer', handleReceiveAnswer);
        socketRef.current.on('ice-candidate', handleReceiveIceCandidate);

        return () => {
            if (localStream) {
                localStream.getTracks().forEach(track => track.stop());
            }
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
            if (peerConnectionRef.current) {
                peerConnectionRef.current.close();
            }
        };
    }, [roomId, userId]);

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

        if (localStream) {
            localStream.getTracks().forEach((track) => {
                peerConnection.addTrack(track, localStream);
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
        setConnectionStatus('connected');
    };

    const handleReceiveAnswer = async ({ sdp }) => {
        if (peerConnectionRef.current) {
            await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(sdp));
            setConnectionStatus('connected');
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
        socketRef // Exposed for other real-time features
    };
};

export default useWebRTC;
