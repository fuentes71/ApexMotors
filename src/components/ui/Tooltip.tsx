import { ReactNode } from "react";

interface TooltipProps {
  content: string | ReactNode;
  children: ReactNode;
  position?: "top" | "bottom" | "left" | "right";
}

export function Tooltip({ content, children, position = "top" }: TooltipProps) {
  const positions = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  return (
    <div className="relative group/tooltip flex min-w-0">
      {children}
      <div 
        className={`absolute ${positions[position]} opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all duration-200 z-50 pointer-events-none`}
      >
        <div className="bg-white text-stone-800 text-sm font-semibold px-3 py-2 rounded-xl shadow-xl shadow-black/5 border border-stone-100 whitespace-nowrap flex items-center justify-center">
          {content}
        </div>
      </div>
    </div>
  );
}
