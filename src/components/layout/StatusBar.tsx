import React, { useState } from 'react';
import { AlertTriangle, X, RotateCcw, Check } from 'lucide-react';
import { StatusAlert } from '../../types/aiSurvey';

interface StatusBarProps {
  status: StatusAlert;
  onClearError?: () => void;
  onRevert?: () => void;
  projectName?: string;
}

export const StatusBar: React.FC<StatusBarProps> = ({
  status,
  onClearError,
  onRevert,
  projectName = 'Mining Site',
}) => {
  const [showErrorPopup, setShowErrorPopup] = useState<boolean>(false);
  const [showLogDrawer, setShowLogDrawer] = useState<boolean>(false);

  // Background and border styles depending on status
  const getStyleClasses = () => {
    switch (status.type) {
      case 'error':
        return 'bg-[#7a1818] border-t-2 border-[#f87171] text-white shadow-lg animate-pulse';
      case 'loading':
        return 'bg-[#4a2e0e] border-t-2 border-[#e88724] text-[#ffd699]';
      case 'success':
        return 'bg-[#144d28] border-t-2 border-[#4ade80] text-[#e0ffe8]';
      case 'warning':
        return 'bg-[#48380e] border-t-2 border-[#fbbf24] text-[#fff0b3]';
      default:
        return 'bg-[#292929] border-t border-[#1a1a1a] text-[#a0a0a0]';
    }
  };

  return (
    <>
      <div
        className={`w-full h-[24px] flex items-center justify-between px-2 text-[11px] select-none font-sans flex-shrink-0 transition-colors duration-300 z-30 ${getStyleClasses()}`}
      >
        <div className="flex items-center space-x-2.5 overflow-hidden">
          {/* Status Indicator Icon / Pulse */}
          <div className="flex items-center space-x-1.5 flex-shrink-0">
            {status.type === 'error' && (
              <span className="w-3.5 h-3.5 rounded-full bg-[#f87171] text-black font-black text-[9px] flex items-center justify-center animate-bounce">
                !
              </span>
            )}
            {status.type === 'loading' && (
              <span className="w-3.5 h-3.5 border-2 border-t-transparent border-[#e88724] rounded-full animate-spin"></span>
            )}
            {status.type === 'success' && (
              <span className="w-3.5 h-3.5 rounded-full bg-[#4ade80] text-black font-black flex items-center justify-center">
                <Check className="w-2.5 h-2.5 text-black stroke-[3]" />
              </span>
            )}
            {status.type === 'warning' && (
              <span className="w-3.5 h-3.5 rounded-full bg-[#fbbf24] text-black font-black text-[9px] flex items-center justify-center">
                ▲
              </span>
            )}
            {status.type === 'idle' && (
              <div className="flex items-center space-x-0.5 text-[#666]">
                <span className="w-3 h-3 flex items-center justify-center border border-[#444] rounded-[1px] text-[8px]">
                  ◫
                </span>
                <span className="w-3 h-3 flex items-center justify-center border border-[#444] rounded-[1px] text-[8px]">
                  □
                </span>
              </div>
            )}
          </div>

          {/* Main Status Text */}
          <div className="flex items-center space-x-2 truncate">
            <span
              className={`truncate font-medium tracking-tight ${
                status.type === 'error'
                  ? 'text-white font-bold'
                  : status.type === 'loading'
                  ? 'text-[#ffdd88] font-semibold'
                  : status.type === 'success'
                  ? 'text-[#afffd0] font-semibold'
                  : 'text-[#bbb]'
              }`}
            >
              {status.message}
            </span>

            {/* Error Detail Button to attract attention */}
            {status.type === 'error' && (
              <button
                onClick={() => setShowErrorPopup(true)}
                className="bg-black/60 hover:bg-black text-[#fca5a5] hover:text-white px-2 py-0.5 rounded border border-[#f87171] text-[10px] font-bold underline cursor-pointer flex-shrink-0 animate-pulse flex items-center space-x-1"
              >
                <AlertTriangle className="w-3 h-3 text-[#f87171]" />
                <span>View Error & Solution</span>
              </button>
            )}

            {status.type === 'success' && status.details && (
              <span className="text-[10px] text-[#a7f3d0] opacity-80 truncate hidden md:inline">
                ({status.details})
              </span>
            )}
          </div>
        </div>

        {/* Right Section: Revert Button & Project Branding */}
        <div className="flex items-center space-x-2 flex-shrink-0 text-[10px]">
          {onRevert && (
            <button
              onClick={onRevert}
              title="Revert Project to Default Mining Site Baseline"
              className="px-1.5 py-0.5 bg-[#383838] hover:bg-[#484848] text-[#ddd] hover:text-white rounded-[2px] border border-[#555] flex items-center space-x-1 cursor-pointer transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span className="hidden sm:inline">Revert</span>
            </button>
          )}

          <div className="flex items-center space-x-1.5 text-[#888] pl-1 border-l border-[#444]/40">
            <span className="font-bold text-[#e88724]">{projectName}</span>
            <span>•</span>
            <span className="hidden sm:inline">Surface & Subsurface 3D</span>
            <span>•</span>
            <span>R19.068</span>
          </div>
        </div>
      </div>

      {/* ERROR ATTENTION POPUP MODAL */}
      {showErrorPopup && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-[#2a2a2a] border-2 border-[#f87171] rounded-[3px] shadow-2xl max-w-lg w-full p-4 space-y-3 text-[#ddd] text-[11px] font-sans">
            <div className="flex items-center justify-between pb-2 border-b border-[#444]">
              <div className="flex items-center space-x-2 text-[#f87171] font-bold text-[13px]">
                <AlertTriangle className="w-4 h-4 text-[#f87171]" />
                <span>System Error & Validation Report</span>
              </div>
              <button
                onClick={() => setShowErrorPopup(false)}
                className="text-[#888] hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-[#1f1f1f] p-3 rounded border border-[#3f2020] space-y-2">
              <div className="text-[10px] uppercase font-mono text-[#f87171]">
                Error Code: {status.errorCode || 'ERR_VALIDATION_FAILURE'}
              </div>
              <div className="text-white font-semibold text-[12px] leading-snug">
                {status.message}
              </div>
              {status.details && (
                <div className="text-[#bbb] text-[10.5px] leading-relaxed pt-1 border-t border-[#333]">
                  {status.details}
                </div>
              )}
            </div>

            <div className="bg-[#242424] p-2.5 rounded border border-[#383838] space-y-1">
              <span className="text-[#e88724] font-bold block text-[10.5px]">
                Recommended Resolution:
              </span>
              <ul className="list-disc list-inside space-y-0.5 text-[#aaa] text-[10px]">
                <li>Ensure all sequential images in the AI Survey panel have valid non-zero "Distance from Last Image" tags.</li>
                <li>If using Gemini AI generation, verify that <code>GEMINI_API_KEY</code> is present in the Secrets panel.</li>
                <li>Check browser network console or inspect the server logs for diagnostic output.</li>
              </ul>
            </div>

            <div className="flex justify-end space-x-2 pt-1">
              {onClearError && (
                <button
                  onClick={() => {
                    onClearError();
                    setShowErrorPopup(false);
                  }}
                  className="px-3 py-1 bg-[#444] hover:bg-[#555] text-white rounded-[2px]"
                >
                  Dismiss Error
                </button>
              )}
              <button
                onClick={() => setShowErrorPopup(false)}
                className="px-4 py-1 bg-[#e88724] hover:bg-[#ff9933] text-black font-bold rounded-[2px]"
              >
                Acknowledge & Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
