import * as React from "react";
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";
import { cn } from "@/lib/utils";

/**
 * 🚫 LEI PÉTREA: BARRAS DE SCROLL DEVEM SER INVISÍVEIS.
 * Este componente foi modificado para suprimir a renderização de barras visuais.
 */
const ScrollArea = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root>
>(({ className, children, ...props }, ref) => (
  <ScrollAreaPrimitive.Root 
    ref={ref} 
    className={cn("relative overflow-hidden no-scrollbar", className)} 
    {...props}
  >
    <ScrollAreaPrimitive.Viewport className="h-full w-full rounded-[inherit] no-scrollbar">
      {children}
    </ScrollAreaPrimitive.Viewport>
    {/* ScrollBar removida para cumprir a lei pétrea de design do projeto */}
    <ScrollAreaPrimitive.Corner />
  </ScrollAreaPrimitive.Root>
));
ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName;

const ScrollBar = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>
>(() => null); // Retorna null para garantir que nenhuma barra seja renderizada se chamada individualmente

export { ScrollArea, ScrollBar };
