import React, { useRef, useEffect, useState } from 'react';

interface CameraViewProps {
    onCapture: (base64: string, mimeType: string) => void;
    onBack: () => void;
    facingMode?: 'user' | 'environment';
}

const CameraView: React.FC<CameraViewProps> = ({ onCapture, onBack, facingMode = 'user' }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let activeStream: MediaStream | null = null;
        const startCamera = async () => {
            try {
                const constraints = {
                    video: { facingMode }
                };
                activeStream = await navigator.mediaDevices.getUserMedia(constraints);
                setStream(activeStream);
                if (videoRef.current) {
                    videoRef.current.srcObject = activeStream;
                }
            } catch (err) {
                console.error("Camera access denied:", err);
                setError("Could not access the camera. Please check permissions in your browser settings.");
            }
        };
        startCamera();

        return () => {
            if (activeStream) {
                activeStream.getTracks().forEach(track => track.stop());
            }
        };
    }, [facingMode]);

    const handleCapture = () => {
        if (videoRef.current && canvasRef.current && stream) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            const context = canvas.getContext('2d');
            if (context) {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                
                if (facingMode === 'user') {
                    // Flip the image horizontally for a mirror effect for selfies
                    context.translate(video.videoWidth, 0);
                    context.scale(-1, 1);
                }
                
                context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
                
                const mimeType = 'image/jpeg';
                const dataUrl = canvas.toDataURL(mimeType, 0.9);
                const base64String = dataUrl.split(',')[1];
                onCapture(base64String, mimeType);

                stream.getTracks().forEach(track => track.stop());
            }
        }
    };

    return (
        <div className="fixed inset-0 bg-black z-50 flex justify-center items-center">
            <div className="w-full h-full relative">
                <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    className="w-full h-full object-cover" 
                    style={facingMode === 'user' ? { transform: 'scaleX(-1)' } : {}}
                />
                <canvas ref={canvasRef} className="hidden" />
                {error && (
                    <div className="absolute inset-0 bg-black/80 flex flex-col justify-center items-center text-white p-4 text-center">
                        <p className="mb-4">{error}</p>
                        <button onClick={onBack} className="bg-gray-200 text-gray-700 font-bold py-2 px-6 rounded-lg hover:bg-gray-300 transition-colors">Go Back</button>
                    </div>
                )}
                {!error && stream && (
                    <>
                        <button onClick={onBack} className="absolute top-6 right-6 text-white bg-black/30 rounded-full p-3 hover:bg-black/50 transition-colors z-10" aria-label="Close camera">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/60 to-transparent flex justify-center items-center">
                            <button onClick={handleCapture} className="w-20 h-20 bg-white rounded-full border-4 border-white/50 shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-white" aria-label="Capture photo"></button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default CameraView;
