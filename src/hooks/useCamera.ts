import { useState, useCallback } from 'react';

interface UseCameraOptions {
  onCapture?: (file: File) => void;
  onError?: (error: Error) => void;
}

/**
 * Hook for camera access on mobile devices
 */
export function useCamera(options: UseCameraOptions = {}) {
  const [isSupported, setIsSupported] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);

  const checkSupport = useCallback(() => {
    const supported = 
      'mediaDevices' in navigator &&
      'getUserMedia' in navigator.mediaDevices;
    setIsSupported(supported);
    return supported;
  }, []);

  const capturePhoto = useCallback(async () => {
    if (!checkSupport()) {
      options.onError?.(new Error('Camera not supported'));
      return;
    }

    setIsCapturing(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }, // Use back camera on mobile
      });

      // Create video element
      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();

      // Wait for video to be ready
      await new Promise((resolve) => {
        video.onloadedmetadata = () => {
          video.play();
          resolve(null);
        };
      });

      // Create canvas and capture frame
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(video, 0, 0);

      // Stop video stream
      stream.getTracks().forEach(track => track.stop());

      // Convert to blob
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], `photo-${Date.now()}.jpg`, {
            type: 'image/jpeg',
          });
          options.onCapture?.(file);
        }
        setIsCapturing(false);
      }, 'image/jpeg', 0.9);
    } catch (error) {
      setIsCapturing(false);
      options.onError?.(error as Error);
    }
  }, [checkSupport, options]);

  return {
    isSupported,
    isCapturing,
    capturePhoto,
    checkSupport,
  };
}
