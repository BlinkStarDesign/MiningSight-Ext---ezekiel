import React, { useRef, useState } from 'react';
import { Box, Video, Radio, FileText, Folder, ChevronRight, ChevronLeft } from 'lucide-react';

export type UpperTabType = 'Objects' | 'AI Survey' | 'Camera Tours' | 'Takes' | 'Content Browser' | 'Structure';

interface DockLayoutProps {
  leftPalette: React.ReactNode;
  viewport: React.ReactNode;
  timeline: React.ReactNode;
  materialManager: React.ReactNode;
  coordinateManager: React.ReactNode;
  objectManager: React.ReactNode;
  attributeManager: React.ReactNode;
  aiSurveyPanel?: React.ReactNode;
  cameraTourPanel?: React.ReactNode;
  activeUpperTab?: UpperTabType;
  onUpperTabChange?: (tab: UpperTabType) => void;
  surveyImageCount?: number;
  tourKeyframeCount?: number;
}

export const DockLayout: React.FC<DockLayoutProps> = ({
  leftPalette,
  viewport,
  timeline,
  materialManager,
  coordinateManager,
  objectManager,
  attributeManager,
  aiSurveyPanel,
  cameraTourPanel,
  activeUpperTab: controlledUpperTab,
  onUpperTabChange,
  surveyImageCount = 3,
  tourKeyframeCount = 5,
}) => {
  // Proportions:
  const [rightPanelWidthPercent, setRightPanelWidthPercent] = useState<number>(36);
  const [bottomPanelHeightPercent, setBottomPanelHeightPercent] = useState<number>(28);
  const [objectManagerHeightPercent, setObjectManagerHeightPercent] = useState<number>(55);
  const [materialManagerWidthPercent, setMaterialManagerWidthPercent] = useState<number>(45);

  // Sidebar collapse toggle for mobile or wide viewport viewing
  const [isRightCollapsed, setIsRightCollapsed] = useState<boolean>(false);

  // Active right tabs
  const [internalUpperTab, setInternalUpperTab] = useState<UpperTabType>('Objects');
  const activeUpperTab = controlledUpperTab !== undefined ? controlledUpperTab : internalUpperTab;

  const handleUpperTabChange = (tab: UpperTabType) => {
    setInternalUpperTab(tab);
    onUpperTabChange?.(tab);
    if (isRightCollapsed) {
      setIsRightCollapsed(false);
    }
  };

  const [activeLowerTab, setActiveLowerTab] = useState<'Attributes' | 'Layers'>('Attributes');

  const containerRef = useRef<HTMLDivElement>(null);

  // Splitter drag state
  const startDrag = (
    type: 'vertical-right' | 'horizontal-bottom' | 'horizontal-right' | 'vertical-bottom',
    e: React.MouseEvent
  ) => {
    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;
    const initialRightWidth = rightPanelWidthPercent;
    const initialBottomHeight = bottomPanelHeightPercent;
    const initialObjectHeight = objectManagerHeightPercent;
    const initialMatWidth = materialManagerWidthPercent;

    const onMouseMove = (moveEvent: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();

      if (type === 'vertical-right') {
        const deltaX = moveEvent.clientX - startX;
        const deltaPercent = (deltaX / rect.width) * 100;
        const newRight = Math.max(20, Math.min(60, initialRightWidth - deltaPercent));
        setRightPanelWidthPercent(newRight);
      } else if (type === 'horizontal-bottom') {
        const deltaY = moveEvent.clientY - startY;
        const deltaPercent = (deltaY / rect.height) * 100;
        const newBottom = Math.max(15, Math.min(45, initialBottomHeight - deltaPercent));
        setBottomPanelHeightPercent(newBottom);
      } else if (type === 'horizontal-right') {
        const deltaY = moveEvent.clientY - startY;
        const deltaPercent = (deltaY / rect.height) * 100;
        const newObj = Math.max(20, Math.min(80, initialObjectHeight + deltaPercent));
        setObjectManagerHeightPercent(newObj);
      } else if (type === 'vertical-bottom') {
        const deltaX = moveEvent.clientX - startX;
        const deltaPercent = (deltaX / (rect.width * (1 - rightPanelWidthPercent / 100))) * 100;
        const newMat = Math.max(25, Math.min(75, initialMatWidth + deltaPercent));
        setMaterialManagerWidthPercent(newMat);
      }
    };

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const tabs: Array<{ id: UpperTabType; label: string; icon: React.ComponentType<{ className?: string }>; count?: number }> = [
    { id: 'Objects', label: 'Objects', icon: Box },
    { id: 'Camera Tours', label: 'Tours & Keyframes', icon: Video, count: tourKeyframeCount },
    { id: 'AI Survey', label: 'AI Survey', icon: Radio, count: surveyImageCount },
    { id: 'Takes', label: 'Takes', icon: FileText },
    { id: 'Content Browser', label: 'Browser', icon: Folder },
  ];

  const currentRightWidth = isRightCollapsed ? 28 : rightPanelWidthPercent;

  return (
    <div ref={containerRef} className="flex-1 w-full flex overflow-hidden select-none bg-[#292929]">
      {/* 1. Far Left Tool Palette */}
      {leftPalette}

      {/* 2. Central Area: Viewport, Timeline, and Bottom Workspaces */}
      <div
        className="flex flex-col h-full overflow-hidden transition-all duration-150"
        style={{ width: isRightCollapsed ? 'calc(100% - 64px)' : `calc(${100 - currentRightWidth}% - 36px)` }}
      >
        {/* Upper Viewport */}
        <div
          className="w-full relative overflow-hidden"
          style={{ height: `calc(${100 - bottomPanelHeightPercent}% - 64px)` }}
        >
          {viewport}
        </div>

        {/* Timeline Bar (Fixed 64px height) */}
        <div className="w-full h-[64px] flex-shrink-0">
          {timeline}
        </div>

        {/* Resizer Splitter between Viewport/Timeline and Bottom Workspaces */}
        <div
          onMouseDown={(e) => startDrag('horizontal-bottom', e)}
          className="h-[4px] w-full bg-[#202020] hover:bg-[#e88724] cursor-row-resize transition-colors z-20 flex-shrink-0 border-y border-[#181818]"
        />

        {/* Bottom Workspaces: Material Manager and Coordinate Manager */}
        <div
          className="w-full flex overflow-hidden flex-shrink-0"
          style={{ height: `${bottomPanelHeightPercent}%` }}
        >
          {/* Vertical Maxon Cinema 4D Ribbon along bottom left edge */}
          <div className="w-[18px] bg-[#1e1e1e] border-r border-[#151515] flex flex-col items-center justify-center py-2 flex-shrink-0">
            <span
              className="text-[9px] font-bold text-[#888] tracking-widest uppercase transform -rotate-90 whitespace-nowrap"
              style={{ letterSpacing: '0.15em' }}
            >
              <span className="text-[#e88724]">MAXON</span> CINEMA 4D
            </span>
          </div>

          {/* Material Manager */}
          <div
            className="h-full overflow-hidden"
            style={{ width: `${materialManagerWidthPercent}%` }}
          >
            {materialManager}
          </div>

          {/* Vertical Splitter between Materials and Coordinates */}
          <div
            onMouseDown={(e) => startDrag('vertical-bottom', e)}
            className="w-[4px] h-full bg-[#202020] hover:bg-[#e88724] cursor-col-resize transition-colors z-20 flex-shrink-0 border-x border-[#181818]"
          />

          {/* Coordinate Manager */}
          <div
            className="h-full overflow-hidden"
            style={{ width: `calc(${100 - materialManagerWidthPercent}% - 4px)` }}
          >
            {coordinateManager}
          </div>
        </div>
      </div>

      {/* Main Vertical Splitter between Viewport column and Right panel column */}
      <div
        onMouseDown={(e) => !isRightCollapsed && startDrag('vertical-right', e)}
        className={`w-[4px] h-full bg-[#202020] transition-colors z-20 flex-shrink-0 border-x border-[#181818] ${
          isRightCollapsed ? 'cursor-default' : 'hover:bg-[#e88724] cursor-col-resize'
        }`}
      />

      {/* 3. Right Management Column: Object Manager, Camera Tours & Attribute Manager */}
      <div
        className="h-full flex overflow-hidden flex-shrink-0 transition-all duration-150"
        style={{ width: isRightCollapsed ? '28px' : `${currentRightWidth}%` }}
      >
        {!isRightCollapsed ? (
          <div className="flex-1 flex flex-col h-full overflow-hidden min-w-[240px]">
            {/* Top Responsive Tab Bar for Right Panel */}
            <div className="h-7 bg-[#242424] border-b border-[#1b1b1b] flex items-center justify-between px-1.5 flex-shrink-0 overflow-x-auto scrollbar-none">
              <div className="flex items-center space-x-1 min-w-max">
                {tabs.map((tab) => {
                  const isActive = activeUpperTab === tab.id;
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => handleUpperTabChange(tab.id)}
                      className={`px-2 py-1 text-[10.5px] font-medium rounded-[2px] transition-colors flex items-center space-x-1.5 cursor-pointer ${
                        isActive
                          ? 'bg-[#3b516b] text-white font-bold shadow-sm'
                          : 'text-[#aaa] hover:bg-[#333] hover:text-[#eee]'
                      }`}
                      title={`Open ${tab.label}`}
                    >
                      <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{tab.label}</span>
                      {tab.count !== undefined && (
                        <span
                          className={`text-[9px] px-1 rounded-full font-mono ${
                            isActive ? 'bg-[#e88724] text-black font-bold' : 'bg-[#3a3a3a] text-[#888]'
                          }`}
                        >
                          {tab.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Collapse Button */}
              <button
                onClick={() => setIsRightCollapsed(true)}
                title="Collapse Right Sidebar"
                className="w-5 h-5 flex items-center justify-center text-[#888] hover:text-white hover:bg-[#333] rounded-[2px] flex-shrink-0 ml-1 cursor-pointer"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Active Upper Panel */}
            <div
              className="w-full overflow-hidden flex flex-col"
              style={{ height: `${objectManagerHeightPercent}%` }}
            >
              {activeUpperTab === 'AI Survey' && aiSurveyPanel ? (
                aiSurveyPanel
              ) : activeUpperTab === 'Camera Tours' && cameraTourPanel ? (
                cameraTourPanel
              ) : (
                objectManager
              )}
            </div>

            {/* Splitter between Upper Panel and Attribute Manager */}
            <div
              onMouseDown={(e) => startDrag('horizontal-right', e)}
              className="h-[4px] w-full bg-[#202020] hover:bg-[#e88724] cursor-row-resize transition-colors z-20 flex-shrink-0 border-y border-[#181818]"
            />

            {/* Lower Header: Attributes vs Layers */}
            <div className="h-6 bg-[#272727] border-b border-[#202020] flex items-center justify-between px-2 flex-shrink-0">
              <div className="flex items-center space-x-1">
                {(['Attributes', 'Layers'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveLowerTab(tab)}
                    className={`px-2 py-0.5 text-[10px] font-medium rounded-[2px] cursor-pointer transition-colors ${
                      activeLowerTab === tab
                        ? 'bg-[#333] text-[#e88724] font-bold border-b border-[#e88724]'
                        : 'text-[#888] hover:text-[#ccc]'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Attribute Manager (Lower Right) */}
            <div
              className="w-full overflow-hidden flex-1"
            >
              {attributeManager}
            </div>
          </div>
        ) : (
          /* Collapsed Mini Strip */
          <div className="w-full h-full bg-[#202020] flex flex-col items-center py-2 justify-between">
            <button
              onClick={() => setIsRightCollapsed(false)}
              title="Expand Right Sidebar"
              className="w-5 h-5 flex items-center justify-center text-[#e88724] hover:bg-[#333] rounded cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <div className="flex flex-col items-center space-y-4">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleUpperTabChange(tab.id)}
                    title={tab.label}
                    className={`p-1.5 rounded hover:bg-[#333] cursor-pointer ${
                      activeUpperTab === tab.id ? 'text-[#e88724]' : 'text-[#888]'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </button>
                );
              })}
            </div>
            <span className="text-[8px] text-[#666] tracking-tighter">C4D</span>
          </div>
        )}
      </div>
    </div>
  );
};
