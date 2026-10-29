import React from "react";

export function TasteDropLogo({ className = "w-7 h-7" }: { className?: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="32" height="32" rx="8" fill="#09090B" />
        <path
          d="M16 6C16 6 9 14.5 9 19C9 22.866 12.134 26 16 26C19.866 26 23 22.866 23 19C23 14.5 16 6 16 6Z"
          fill="#FAFAFA"
          fillOpacity="0.9"
        />
        <circle cx="16" cy="19" r="3.5" fill="#10B981" />
        <path d="M13 14L19 14" stroke="#09090B" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      <span className="font-semibold text-lg tracking-tight text-neutral-900 flex items-center">
        Taste<span className="text-emeraldVibe">Drop</span>
      </span>
    </div>
  );
}
