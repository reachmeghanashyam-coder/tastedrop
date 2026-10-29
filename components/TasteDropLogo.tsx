import React from "react";

export function TasteDropLogo({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <div className="flex items-center gap-2 whitespace-nowrap">
      <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="32" height="32" rx="7" fill="#111827" />
        <path
          d="M16 6C16 6 9 14.5 9 19C9 22.866 12.134 26 16 26C19.866 26 23 22.866 23 19C23 14.5 16 6 16 6Z"
          fill="#FFFFFF"
        />
        <circle cx="16" cy="19" r="3.5" fill="#059669" />
        <path d="M13 14L19 14" stroke="#111827" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      <span className="font-semibold text-sm tracking-tight text-neutral-900 inline-block whitespace-nowrap">
        Taste<span className="text-emerald-600">Drop</span>
      </span>
    </div>
  );
}
