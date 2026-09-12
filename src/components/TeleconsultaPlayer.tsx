import React, { useEffect, useRef } from 'react';

interface TeleconsultaProps {
  appId?: string;
  roomName?: string;
  jwtToken?: string;
}

export const TeleconsultaPlayer: React.FC<TeleconsultaProps> = ({
  appId = import.meta.env.VITE_JAAS_APP_ID || "c1_app_id_here",
  roomName = "ConsultorioNutriNK",
  jwtToken = import.meta.env.VITE_JAAS_JWT_TOKEN || "YOUR_JWT_TOKEN_HERE"
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<any>(null);

  useEffect(() => {
    // Função para inicializar o player JaaS
    const initJitsi = () => {
      if (!containerRef.current || !(window as any).JitsiMeetExternalAPI) return;

      // Destrói instância prévia se existir
      if (apiRef.current) {
        apiRef.current.dispose();
      }

      const domain = '8x8.vc';
      const fullRoomName = `${appId}/${roomName}`;

      const options = {
        roomName: fullRoomName,
        width: '100%',
        height: '100%',
        parentNode: containerRef.current,
        jwt: jwtToken,
        configOverwrite: {
          startWithAudioMuted: false,
          startWithVideoMuted: false,
          disableThirdPartyRequests: true,
          prejoinPageEnabled: false
        },
        interfaceConfigOverwrite: {
          SHOW_JITSI_WATERMARK: false,
          SHOW_WATERMARK_FOR_GUESTS: false,
          SHOW_BRAND_WATERMARK: false,
          TOOLBAR_BUTTONS: [
            'microphone', 'camera', 'desktop', 'fullscreen',
            'fittoscreen', 'hangup', 'chat', 'raisehand', 'tileview'
          ]
        }
      };

      apiRef.current = new (window as any).JitsiMeetExternalAPI(domain, options);
    };

    // Verifica se o script já foi carregado ou aguarda o evento
    if ((window as any).JitsiMeetExternalAPI) {
      initJitsi();
    } else {
      const script = document.querySelector('script[src="https://8x8.vc/v1/external_api.js"]');
      if (script) {
        script.addEventListener('load', initJitsi);
      }
    }

    // Cleanup ao desmontar a tela de consulta
    return () => {
      if (apiRef.current) {
        apiRef.current.dispose();
        apiRef.current = null;
      }
    };
  }, [appId, roomName, jwtToken]);

  return (
    <div 
      id="jitsi-meet-container" 
      ref={containerRef} 
      style={{ width: '100%', height: '100vh', minHeight: '600px', backgroundColor: '#000' }} 
    />
  );
};

export default TeleconsultaPlayer;
