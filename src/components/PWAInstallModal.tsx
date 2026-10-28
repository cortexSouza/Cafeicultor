import React, { useState, useEffect } from 'react';
import { Download, Smartphone, Share, PlusSquare, Check } from 'lucide-react';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({ isOpen, onClose }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // Detect iOS
    const ua = window.navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(ua));

    // Detect standalone
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    setInstalled(isStandalone);

    const handlePrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handlePrompt);
    window.addEventListener('appinstalled', () => setInstalled(true));

    return () => {
      window.removeEventListener('beforeinstallprompt', handlePrompt);
    };
  }, []);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setInstalled(true);
        setDeferredPrompt(null);
        onClose();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-white dark:bg-stone-900 rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold text-xl shadow">
              ☕
            </div>
            <div>
              <h3 className="text-lg font-bold text-stone-900 dark:text-white">
                Instalar no Celular
              </h3>
              <p className="text-xs text-stone-500">
                Acesse mesmo sem internet no cafezal
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 font-bold"
          >
            ✕
          </button>
        </div>

        {installed ? (
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl text-center space-y-2">
            <Check className="w-8 h-8 text-emerald-600 mx-auto" />
            <p className="text-xs font-bold text-emerald-900 dark:text-emerald-300">
              O aplicativo já está instalado no seu dispositivo!
            </p>
          </div>
        ) : isIOS ? (
          <div className="space-y-3 text-xs text-stone-700 dark:text-stone-300">
            <p className="font-semibold text-stone-900 dark:text-white">
              Para instalar no iPhone ou iPad (Safari):
            </p>
            <ol className="space-y-2 list-decimal list-inside bg-stone-50 dark:bg-stone-800/60 p-3.5 rounded-xl border border-stone-200 dark:border-stone-700">
              <li className="flex items-start gap-2">
                <Share className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <span>Toque no botão <strong>Compartilhar</strong> na barra do Safari.</span>
              </li>
              <li className="flex items-start gap-2">
                <PlusSquare className="w-4 h-4 text-stone-700 dark:text-stone-300 shrink-0 mt-0.5" />
                <span>Role para baixo e selecione <strong>Adicionar à Tela de Início</strong>.</span>
              </li>
              <li>
                <span>Toque em <strong>Adicionar</strong> no canto superior direito.</span>
              </li>
            </ol>
          </div>
        ) : (
          <div className="space-y-3 text-xs text-stone-600 dark:text-stone-300">
            <p>
              Instale o App do Cafeicultor na tela inicial do seu Android ou computador para visualização rápida com 1 toque, alertas e funcionamento offline.
            </p>

            {deferredPrompt ? (
              <button
                onClick={handleInstallClick}
                className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow transition"
              >
                <Download className="w-4 h-4" />
                Instalar Agora
              </button>
            ) : (
              <div className="p-3 bg-stone-50 dark:bg-stone-800 rounded-xl text-stone-500 text-[11px] leading-relaxed">
                Abra o menu do seu navegador (três pontinhos) e toque em <strong>"Instalar aplicativo"</strong> ou <strong>"Adicionar à tela inicial"</strong>.
              </div>
            )}
          </div>
        )}

        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="w-full py-2 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 rounded-xl text-xs font-semibold"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
