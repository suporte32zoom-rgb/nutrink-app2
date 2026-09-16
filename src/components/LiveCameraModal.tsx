import React, { useState, useEffect, useRef } from 'react';
import {
  Camera,
  RefreshCw,
  Check,
  X,
  RotateCw,
  Timer,
  AlertCircle,
  Smartphone,
  VideoOff,
  Maximize2
} from 'lucide-react';

interface LiveCameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (dataUrl: string) => void;
  title?: string;
  subtitle?: string;
}

export const LiveCameraModal: React.FC<LiveCameraModalProps> = ({
  isOpen,
  onClose,
  onCapture,
  title = 'Câmera do Dispositivo',
  subtitle = 'Enquadre o paciente para a avaliação física'
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [availableDevices, setAvailableDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [isCountingDown, setIsCountingDown] = useState<boolean>(false);
  const [countdownSeconds, setCountdownSeconds] = useState<number>(3);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [capturedPreview, setCapturedPreview] = useState<string | null>(null);
  const [rotation, setRotation] = useState<number>(0);
  const [isShutterFlash, setIsShutterFlash] = useState<boolean>(false);

  // Hidden native fallback input
  const fallbackInputRef = useRef<HTMLInputElement>(null);

  // Parar stream ativo
  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  // Iniciar câmera com detecção de dispositivos
  const startCamera = async () => {
    stopStream();
    setPermissionError(null);
    setCapturedPreview(null);
    setRotation(0);

    if (!navigator?.mediaDevices?.getUserMedia) {
      setHasPermission(false);
      setPermissionError('Seu navegador ou ambiente atual não possui suporte direto a WebRTC de câmera. Use a captura nativa do sistema abaixo.');
      return;
    }

    try {
      // Obter lista de câmeras disponíveis
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter((d) => d.kind === 'videoinput');
        setAvailableDevices(videoDevices);
      } catch (e) {
        console.warn('Não foi possível listar dispositivos:', e);
      }

      const constraints: MediaStreamConstraints = {
        audio: false,
        video: selectedDeviceId
          ? { deviceId: { exact: selectedDeviceId } }
          : {
              facingMode: { ideal: facingMode },
              width: { ideal: 1920 },
              height: { ideal: 1080 }
            }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setHasPermission(true);
    } catch (err: any) {
      console.error('Erro ao acessar a câmera:', err);
      setHasPermission(false);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setPermissionError('Permissão da câmera foi negada. Por favor, autorize o acesso à câmera no seu navegador ou clique no botão de captura nativa.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setPermissionError('Nenhuma câmera foi detectada conectada ao seu computador/aparelho.');
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        setPermissionError('A câmera já está sendo usada por outro aplicativo ou aba.');
      } else {
        setPermissionError(err.message || 'Não foi possível inicializar a câmera do aparelho.');
      }
    }
  };

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopStream();
      setCapturedPreview(null);
    }

    return () => {
      stopStream();
    };
  }, [isOpen, facingMode, selectedDeviceId]);

  // Alternar entre câmera frontal e traseira
  const handleToggleFacingMode = () => {
    setSelectedDeviceId('');
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  // Disparar o obturador
  const triggerShutter = () => {
    if (!videoRef.current) return;

    // Efeito visual de flash de obturador
    setIsShutterFlash(true);
    setTimeout(() => setIsShutterFlash(false), 200);

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      // Se for câmera frontal, espelhar horizontalmente para ficar natural
      if (facingMode === 'user' && !selectedDeviceId) {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
      }
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      setCapturedPreview(dataUrl);
      stopStream();
    }
  };

  // Contagem regressiva (timer 3s)
  const handleStartCountdown = () => {
    if (isCountingDown) return;
    setIsCountingDown(true);
    let count = 3;
    setCountdownSeconds(count);

    const interval = setInterval(() => {
      count -= 1;
      if (count > 0) {
        setCountdownSeconds(count);
      } else {
        clearInterval(interval);
        setIsCountingDown(false);
        triggerShutter();
      }
    }, 1000);
  };

  // Rotacionar preview se necessário
  const handleRotateImage = () => {
    if (!capturedPreview) return;
    const newRotation = (rotation + 90) % 360;
    setRotation(newRotation);

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const isPerpendicular = newRotation % 180 !== 0;
      canvas.width = isPerpendicular ? img.height : img.width;
      canvas.height = isPerpendicular ? img.width : img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((newRotation * Math.PI) / 180);
        ctx.drawImage(img, -img.width / 2, -img.height / 2);
        setCapturedPreview(canvas.toDataURL('image/jpeg', 0.9));
        setRotation(0);
      }
    };
    img.src = capturedPreview;
  };

  // Confirmar e usar a foto capturada
  const handleConfirmPhoto = () => {
    if (capturedPreview) {
      onCapture(capturedPreview);
      onClose();
    }
  };

  // Fallback para arquivo ou câmera nativa do SO
  const handleFallbackFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (dataUrl) {
        setCapturedPreview(dataUrl);
        stopStream();
      }
    };
    reader.readAsDataURL(file);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fadeIn" id="live-camera-modal">
      {/* Hidden Fallback Input */}
      <input
        type="file"
        ref={fallbackInputRef}
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFallbackFile(file);
          e.target.value = '';
        }}
      />

      <div className="relative w-full max-w-2xl bg-[#150328] border border-purple-800/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="p-4 bg-gradient-to-r from-purple-950 to-[#1d0637] border-b border-purple-800/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-br from-fuchsia-600 to-purple-700 text-white shadow-md">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm sm:text-base flex items-center gap-2">
                {title}
                {hasPermission === true && !capturedPreview && (
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" title="Câmera ao vivo" />
                )}
              </h3>
              <p className="text-[11px] text-purple-300">
                {capturedPreview ? 'Foto capturada! Revise e confirme abaixo' : subtitle}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-[#250849] hover:bg-[#340b67] text-purple-300 hover:text-white transition-colors"
            title="Fechar câmera"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Camera Viewfinder / Preview Area */}
        <div className="relative flex-1 bg-black min-h-[320px] sm:min-h-[420px] flex items-center justify-center overflow-hidden">
          {/* Flash Shutter Effect */}
          {isShutterFlash && (
            <div className="absolute inset-0 bg-white z-40 animate-fadeOut pointer-events-none" />
          )}

          {/* Captured Preview Screen */}
          {capturedPreview ? (
            <div className="relative w-full h-full flex items-center justify-center bg-black/90">
              <img
                src={capturedPreview}
                alt="Foto Capturada"
                className="max-h-[360px] sm:max-h-[440px] w-auto max-w-full object-contain rounded-lg shadow-2xl"
              />
              <div className="absolute top-3 left-3 bg-[#150328]/80 backdrop-blur-md px-3 py-1 rounded-full border border-emerald-500/50 text-emerald-300 text-xs font-bold flex items-center gap-1.5 shadow-md">
                <Check className="w-3.5 h-3.5" /> Foto Pronta
              </div>
            </div>
          ) : hasPermission === true ? (
            /* Live WebRTC Video */
            <div className="relative w-full h-full flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-contain max-h-[360px] sm:max-h-[440px] ${
                  facingMode === 'user' && !selectedDeviceId ? '-scale-x-100' : ''
                }`}
              />

              {/* Grid Guide Overlay for Posture & Aesthetics alignment */}
              {showGrid && (
                <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 border border-purple-500/20">
                  <div className="border-r border-b border-purple-400/25" />
                  <div className="border-r border-b border-purple-400/25" />
                  <div className="border-b border-purple-400/25" />
                  <div className="border-r border-b border-purple-400/25" />
                  <div className="border-r border-b border-fuchsia-400/40" />
                  <div className="border-b border-purple-400/25" />
                  <div className="border-r border-purple-400/25" />
                  <div className="border-r border-purple-400/25" />
                  <div />
                  {/* Central Alignment Crosshair */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 border border-fuchsia-400/50 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-fuchsia-400 rounded-full" />
                    </div>
                  </div>
                </div>
              )}

              {/* Countdown Display */}
              {isCountingDown && (
                <div className="absolute inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-30">
                  <span className="text-8xl font-black text-fuchsia-300 animate-ping">
                    {countdownSeconds}
                  </span>
                </div>
              )}

              {/* Top Viewfinder Controls */}
              <div className="absolute top-3 right-3 flex items-center gap-2 z-20">
                <button
                  type="button"
                  onClick={() => setShowGrid(!showGrid)}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border backdrop-blur-md transition-colors flex items-center gap-1 shadow-md ${
                    showGrid
                      ? 'bg-fuchsia-950/80 border-fuchsia-500 text-fuchsia-300'
                      : 'bg-black/60 border-purple-800 text-purple-300'
                  }`}
                  title="Ativar/Desativar grade de enquadramento postural"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>Grade</span>
                </button>

                {availableDevices.length > 1 ? (
                  <button
                    type="button"
                    onClick={handleToggleFacingMode}
                    className="px-2.5 py-1.5 rounded-xl text-xs font-bold border bg-black/70 border-purple-700 text-purple-200 hover:text-white backdrop-blur-md flex items-center gap-1 shadow-md"
                    title="Alternar entre câmera frontal e traseira"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>{facingMode === 'environment' ? 'Traseira' : 'Frontal'}</span>
                  </button>
                ) : null}
              </div>
            </div>
          ) : hasPermission === false ? (
            /* Permission Denied or Not Supported Screen */
            <div className="p-6 text-center max-w-md space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-rose-950/80 border border-rose-700/60 text-rose-300 flex items-center justify-center mx-auto">
                <VideoOff className="w-7 h-7" />
              </div>
              <div>
                <h4 className="font-bold text-white text-base">Permissão de Câmera Necessária</h4>
                <p className="text-xs text-purple-300 mt-1.5 leading-relaxed">
                  {permissionError || 'Para tirar fotos diretamente no sistema, autorize o uso da câmera quando solicitado pelo seu navegador.'}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={startCamera}
                  className="w-full sm:w-auto px-4 py-2.5 bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Tentar Novamente</span>
                </button>

                <button
                  type="button"
                  onClick={() => fallbackInputRef.current?.click()}
                  className="w-full sm:w-auto px-4 py-2.5 bg-[#250849] hover:bg-[#340b67] text-fuchsia-200 border border-fuchsia-500/60 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                >
                  <Smartphone className="w-4 h-4" />
                  <span>Câmera Nativa do Celular/PC</span>
                </button>
              </div>
            </div>
          ) : (
            /* Loading Camera */
            <div className="flex flex-col items-center gap-3 text-purple-300">
              <div className="w-10 h-10 border-4 border-fuchsia-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-bold">Solicitando acesso à câmera...</p>
            </div>
          )}
        </div>

        {/* Bottom Actions Bar */}
        <div className="p-4 bg-gradient-to-r from-purple-950 to-[#1d0637] border-t border-purple-800/60 flex items-center justify-between gap-3 flex-wrap">
          {capturedPreview ? (
            /* Review Actions */
            <div className="flex items-center justify-between w-full gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleRotateImage}
                  className="px-3 py-2 rounded-xl bg-[#250849] hover:bg-[#340b67] text-purple-200 border border-purple-700/60 text-xs font-bold flex items-center gap-1.5 transition-colors"
                  title="Girar foto 90 graus"
                >
                  <RotateCw className="w-4 h-4" />
                  <span>Girar 90°</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setCapturedPreview(null);
                    startCamera();
                  }}
                  className="px-3 py-2 rounded-xl bg-[#250849] hover:bg-[#340b67] text-purple-200 border border-purple-700/60 text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Tirar Outra Foto</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-transparent hover:bg-purple-900/40 text-purple-300 text-xs font-bold transition-colors"
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  onClick={handleConfirmPhoto}
                  className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-950/50 flex items-center gap-1.5 transition-all"
                >
                  <Check className="w-4 h-4" />
                  <span>Usar Esta Foto</span>
                </button>
              </div>
            </div>
          ) : (
            /* Live Camera Actions */
            <div className="flex items-center justify-between w-full gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleStartCountdown}
                  disabled={hasPermission !== true || isCountingDown}
                  className="px-3.5 py-2 rounded-xl bg-[#250849] hover:bg-[#340b67] disabled:opacity-50 text-fuchsia-300 border border-purple-700/60 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
                  title="Temporizador de 3 segundos para enquadramento"
                >
                  <Timer className="w-4 h-4" />
                  <span>Timer (3s)</span>
                </button>

                <button
                  type="button"
                  onClick={() => fallbackInputRef.current?.click()}
                  className="px-3 py-2 rounded-xl bg-[#250849] hover:bg-[#340b67] text-purple-300 border border-purple-800/60 text-xs font-bold flex items-center gap-1.5 transition-colors hidden sm:flex"
                  title="Abrir câmera nativa do sistema operacional"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Câmera do SO</span>
                </button>
              </div>

              {/* Big Center Shutter Button */}
              <button
                type="button"
                onClick={triggerShutter}
                disabled={hasPermission !== true || isCountingDown}
                className="px-6 py-3 bg-gradient-to-r from-fuchsia-600 via-purple-600 to-fuchsia-600 hover:scale-105 active:scale-95 disabled:opacity-50 text-white rounded-2xl text-sm font-black shadow-xl shadow-fuchsia-950/60 flex items-center gap-2 transition-all border-2 border-fuchsia-400/60"
                id="btn-live-shutter"
              >
                <div className="w-4 h-4 rounded-full bg-white animate-pulse" />
                <span>CAPTURAR FOTO</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="px-3 py-2 rounded-xl bg-transparent hover:bg-purple-900/40 text-purple-300 text-xs font-bold transition-colors"
              >
                Cancelar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
