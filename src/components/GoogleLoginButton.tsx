import React, { useEffect, useRef, useState } from 'react';
import { GoogleProfile, setupGoogleIdentityServices, initiateGoogleOAuthPopup } from '../services/googleAuth';

interface GoogleLoginButtonProps {
  onSuccess: (profile: GoogleProfile) => void;
  onError?: (error: string) => void;
  text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
  theme?: 'outline' | 'filled_blue' | 'filled_black';
  size?: 'large' | 'medium' | 'small';
  shape?: 'rectangular' | 'pill' | 'circle' | 'square';
  className?: string;
  customLabel?: string;
}

export function GoogleLoginButton({
  onSuccess,
  onError,
  text = 'continue_with',
  theme = 'outline',
  size = 'large',
  shape = 'pill',
  className = '',
  customLabel
}: GoogleLoginButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isGsiLoaded, setIsGsiLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    if (containerRef.current) {
      setupGoogleIdentityServices(
        (profile) => {
          if (isMounted) onSuccess(profile);
        },
        containerRef.current,
        { text, theme, size, shape, width: '100%' }
      ).then((success) => {
        if (isMounted && success) {
          setIsGsiLoaded(true);
        }
      });
    }

    return () => {
      isMounted = false;
    };
  }, [text, theme, size, shape, onSuccess]);

  const handleCustomClick = async () => {
    setIsLoading(true);
    try {
      await initiateGoogleOAuthPopup(
        (profile) => {
          setIsLoading(false);
          onSuccess(profile);
        },
        (err) => {
          setIsLoading(false);
          if (onError && err) onError(err);
        }
      );
    } catch (e: any) {
      setIsLoading(false);
      if (onError) onError(e?.message || 'Falha na autenticação Google');
    }
  };

  return (
    <div className={`relative w-full ${className}`}>
      {/* Native GSI Render Container */}
      <div 
        ref={containerRef} 
        className={`w-full flex justify-center items-center ${isGsiLoaded ? 'block' : 'hidden'}`}
      />

      {/* Fallback & Enhanced Custom Google Button */}
      {(!isGsiLoaded || customLabel) && (
        <button
          type="button"
          onClick={handleCustomClick}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 px-5 py-3.5 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-xl border border-slate-300 shadow-sm hover:shadow transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed text-sm"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-slate-300 border-t-emerald-600 rounded-full animate-spin" />
          ) : (
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
          )}
          <span>
            {isLoading
              ? 'Conectando ao Google...'
              : (customLabel || 'Fazer login com o Google')}
          </span>
        </button>
      )}
    </div>
  );
}
