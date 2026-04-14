import { useState } from 'react';
import { ItineraryMap, StopCoordinate } from './ItineraryMap';
import { ItineraryTimeline } from './ItineraryTimeline';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';

interface ItinerarySplitViewProps {
  stops: StopCoordinate[];
  isEditable?: boolean;
  onStopClick?: (stop: StopCoordinate) => void;
  className?: string;
}

export function ItinerarySplitView({ stops, isEditable = false, onStopClick, className }: ItinerarySplitViewProps) {
  const [activeStopId, setActiveStopId] = useState<string | null>(null);

  const handleStopClick = (stop: StopCoordinate) => {
    setActiveStopId(stop.id);
    if (onStopClick) onStopClick(stop);
  };

  return (
    <div className={`w-full h-full flex flex-col md:flex-row border rounded-2xl overflow-hidden shadow-sm bg-background ${className || ''}`}>
      {/* Mobile Handle / CSS Grid fallback. We use shadcn Resizable for Desktop */}
      <div className="hidden md:block w-full h-full">
         <ResizablePanelGroup direction="horizontal">
           <ResizablePanel
             defaultSize={50}
             minSize={30}
             className="relative z-0"
           >
             <ItineraryMap 
               stops={stops} 
               activeStopId={activeStopId} 
             />
           </ResizablePanel>
           
           <ResizableHandle withHandle className="bg-border z-10 shadow-sm" />
           
           <ResizablePanel
             defaultSize={50}
             minSize={30}
             className="z-10 bg-background"
           >
             <ItineraryTimeline 
               stops={stops} 
               activeStopId={activeStopId} 
               onStopClick={handleStopClick}
               isEditable={isEditable}
             />
           </ResizablePanel>
         </ResizablePanelGroup>
      </div>

      {/* Mobile Layout (Stacked) */}
      <div className="flex md:hidden flex-col h-full w-full">
         <div className="h-[40vh] w-full relative z-0 shrink-0">
             <ItineraryMap 
               stops={stops} 
               activeStopId={activeStopId}
               interactive={false} // Disable interaction on small maps so user can scroll page 
             />
             <div className="absolute top-2 left-2 bg-background/80 backdrop-blur text-[10px] px-2 py-1 rounded-md font-medium text-muted-foreground z-[1000] shadow-sm pointer-events-none border">
                Mapa Interativo
             </div>
         </div>
         <div className="h-[60vh] w-full bg-background relative z-10 border-t shadow-[-0_10px_15px_-3px_rgba(0,0,0,0.1)]">
             <ItineraryTimeline 
               stops={stops} 
               activeStopId={activeStopId} 
               onStopClick={handleStopClick}
               isEditable={isEditable}
             />
         </div>
      </div>
    </div>
  );
}
