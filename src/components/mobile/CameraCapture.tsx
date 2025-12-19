import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, X, Check } from 'lucide-react';
import { useCamera } from '@/hooks/useCamera';
import { useLanguage } from '@/contexts/LanguageContext';

interface CameraCaptureProps {
  onCapture: (file: File) => void;
  onCancel?: () => void;
}

/**
 * Mobile camera capture component
 */
export const CameraCapture = ({ onCapture, onCancel }: CameraCaptureProps) => {
  const { t } = useLanguage();
  const [preview, setPreview] = useState<string | null>(null);
  const [capturedFile, setCapturedFile] = useState<File | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx?.drawImage(video, 0, 0);

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `photo-${Date.now()}.jpg`, {
          type: 'image/jpeg',
        });
        setCapturedFile(file);
        setPreview(URL.createObjectURL(blob));
        stopCamera();
      }
    }, 'image/jpeg', 0.9);
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const handleConfirm = () => {
    if (capturedFile) {
      onCapture(capturedFile);
    }
  };

  const handleCancel = () => {
    stopCamera();
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    setPreview(null);
    setCapturedFile(null);
    onCancel?.();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {preview ? (
        // Preview mode
        <div className="flex-1 flex flex-col">
          <img
            src={preview}
            alt="Preview"
            className="flex-1 object-contain"
          />
          <div className="flex gap-4 p-4 bg-background">
            <Button
              onClick={handleCancel}
              variant="outline"
              className="flex-1"
            >
              <X className="mr-2 h-4 w-4" />
              {t('Cancelar', 'Cancel')}
            </Button>
            <Button
              onClick={handleConfirm}
              className="flex-1"
            >
              <Check className="mr-2 h-4 w-4" />
              {t('Usar Foto', 'Use Photo')}
            </Button>
          </div>
        </div>
      ) : (
        // Camera mode
        <div className="flex-1 flex flex-col">
          <video
            ref={videoRef}
            className="flex-1 object-cover"
            autoPlay
            playsInline
            muted
          />
          <div className="flex gap-4 p-4 bg-background">
            <Button
              onClick={handleCancel}
              variant="outline"
              className="flex-1"
            >
              <X className="mr-2 h-4 w-4" />
              {t('Cancelar', 'Cancel')}
            </Button>
            <Button
              onClick={capturePhoto}
              className="flex-1"
            >
              <Camera className="mr-2 h-4 w-4" />
              {t('Capturar', 'Capture')}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
