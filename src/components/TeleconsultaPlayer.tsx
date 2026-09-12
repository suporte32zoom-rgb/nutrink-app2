import React, { useEffect, useRef, useState } from 'react';
import { Video, ShieldCheck, Loader2 } from 'lucide-react';

interface TeleconsultaProps {
  appId?: string;
  roomName?: string;
  jwtToken?: string;
  userName?: string;
  userEmail?: string;
  isModerator?: boolean;
}

const normalizeAppId = (id?: string) => {
  if (!id) return "vpaas-magic-cookie-4f86a9af8ef14d28b178e66905790bac";
  return id.trim().replace(/^["']|["']$/g, '').replace(/^vpaas-cookie-m[áa]gico-/i, 'vpaas-magic-cookie-');
};

export const TeleconsultaPlayer: React.FC<TeleconsultaProps> = ({
  appId = import.meta.env.VITE_JAAS_APP_ID || "vpaas-magic-cookie-4f86a9af8ef14d28b178e66905790bac",
  roomName = "ConsultorioNutriNK",
  jwtToken = import.meta.env.VITE_JAAS_JWT_TOKEN || "",
  userName = "Dr(a). Nutricionista NutrinK",
  userEmail = "clinica@nutrink.com.br",
  isModerator = true
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [resolvedToken, setResolvedToken] = useState<string>(jwtToken);

  const cleanAppId = normalizeAppId(appId);

  // Garantir token oficial válido (busca no backend assinado com a chave RSA se necessário)
  useEffect(() => {
    let isMounted = true;

    const obtainToken = async () => {
      if (jwtToken && jwtToken !== "YOUR_JWT_TOKEN_HERE" && jwtToken !== "seu_jwt_aqui") {
        setResolvedToken(jwtToken);
        return;
      }

      try {
        const response = await fetch('/api/telemedicine/jaas-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            roomName,
            userName,
            userEmail,
            isModerator
          })
        });

        if (response.ok) {
          const data = await response.json();
          if (data?.token && isMounted) {
            setResolvedToken(data.token);
          }
        }
      } catch (err) {
        console.warn('[JaaS Player] Token dinâmico não obtido, usando fallback:', err);
      }
    };

    obtainToken();

    return () => {
      isMounted = false;
    };
  }, [jwtToken, roomName, userName, userEmail, isModerator]);

  useEffect(() => {
    // Função para inicializar o player JaaS
    const initJitsi = () => {
      if (!containerRef.current || !(window as any).JitsiMeetExternalAPI) return;

      // Destrói instância prévia se existir
      if (apiRef.current) {
        try {
          apiRef.current.dispose();
        } catch {
          // ignore
        }
      }

      const domain = '8x8.vc';
      const fullRoomName = `${cleanAppId}/${roomName}`;

      const options = {
        roomName: fullRoomName,
        width: '100%',
        height: '100%',
        parentNode: containerRef.current,
        jwt: resolvedToken || undefined,
        configOverwrite: {
          startWithAudioMuted: false,
          startWithVideoMuted: false,
          disableThirdPartyRequests: true,
          prejoinPageEnabled: false,
          enableWelcomePage: false,
          disableDeepLinking: true
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

      try {
        const api = new (window as any).JitsiMeetExternalAPI(domain, options);
        apiRef.current = api;

        api.addEventListener('videoConferenceJoined', () => {
          setIsLoading(false);
        });

        // Fallback de loading para o caso do evento demorar
        setTimeout(() => {
          setIsLoading(false);
        }, 3000);
      } catch (err) {
        console.error('[JaaS Player Init Error]:', err);
        setIsLoading(false);
      }
    };

    // Garante que o script oficial do 8x8 JaaS está no DOM
    const loadScriptAndInit = () => {
      if ((window as any).JitsiMeetExternalAPI) {
        initJitsi();
        return;
      }

      const scriptId = 'jaas-official-sdk';
      let script = document.getElementById(scriptId) as HTMLScriptElement | null;

      if (!script) {
        script = document.createElement('script');
        script.id = scriptId;
        script.src = `https://8x8.vc/${cleanAppId}/external_api.js`;
        script.async = true;
        script.onload = () => {
          initJitsi();
        };
        script.onerror = () => {
          // Fallback para rota v1 se a específica do tenant falhar
          const fallbackScript = document.createElement('script');
          fallbackScript.src = 'https://8x8.vc/v1/external_api.js';
          fallbackScript.async = true;
          fallbackScript.onload = () => initJitsi();
          document.body.appendChild(fallbackScript);
        };
        document.body.appendChild(script);
      } else {
        script.addEventListener('load', initJitsi);
      }
    };

    loadScriptAndInit();

    // Cleanup ao desmontar a tela de consulta
    return () => {
      if (apiRef.current) {
        try {
          apiRef.current.dispose();
        } catch {
          // ignore
        }
        apiRef.current = null;
      }
    };
  }, [cleanAppId, roomName, resolvedToken]);

  return (
    <div className="relative w-full h-full min-h-[600px] bg-slate-950 overflow-hidden rounded-2xl flex flex-col items-center justify-center">
      {isLoading && (
        <div className="absolute inset-0 z-10 bg-slate-950/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center text-white">
          <div className="w-14 h-14 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center mb-4 animate-pulse">
            <Video className="w-7 h-7 text-purple-400" />
          </div>
          <div className="flex items-center gap-2 mb-2">
            <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
            <span className="text-base font-semibold text-slate-100">Conectando ao Consultório Virtual</span>
          </div>
          <p className="text-xs text-slate-400 max-w-sm flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            JaaS 8x8.vc Oficial • Criptografia de ponta a ponta e chamadas ilimitadas
          </p>
        </div>
      )}

      <div 
        id="jitsi-meet-container" 
        ref={containerRef} 
        className="w-full h-full min-h-[600px]"
      />
    </div>
  );
};

export default TeleconsultaPlayer;

