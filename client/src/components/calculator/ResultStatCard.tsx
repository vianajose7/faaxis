import React from "react";

/**
 * Props:
 *  ─ title – "Total Deal"
 *  ─ value – low‑high number string, e.g. "$3.8M‑$4.5M"
 *  ─ helper – optional sub‑text ("Estimated range based on firm averages")
 */
export const ResultStatCard: React.FC<{
  title: string;
  value: string;
  helper?: string;
}> = ({ title, value, helper }) => {
  // split at first dash so we can show just the upper range on small screens
  const [low, high] = value.split(/-\s*/);

  return (
    <div
      className="
        flex flex-col justify-between
        rounded-2xl bg-white shadow
        px-4 py-4
        min-w-0
        md:basis-1/4                     /* 4‑up row ≥768 px */
        sm:flex-1                        /* flex‑grow cards on mid screens */
      "
    >
      <h4 className="text-lg font-semibold text-gray-700">{title}</h4>

      {/* Completely different approach for different screen sizes */}
      <div className="mt-2 text-center">
        {/* On medium+ screens: Show full range */}
        <div className="hidden sm:block">
          <span className="font-extrabold text-gray-900 text-xl md:text-2xl lg:text-3xl">
            {low}‑{high}
          </span>
        </div>
        
        {/* On small screens: Only show the upper range limit for simplicity */}
        <div className="block sm:hidden">
          <span className="font-extrabold text-gray-900 text-xl">
            Up to {high}
          </span>
        </div>
      </div>

      {helper && (
        <p className="mt-2 text-sm text-gray-500 text-center">{helper}</p>
      )}
    </div>
  );
};