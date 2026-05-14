import { getSeverityConfig } from "../utils/severity";
import React from "react";

export default function SeverityBadge({ severity }) {
  const config = getSeverityConfig(severity);

  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${config.className}`}>
      {config.label}
    </span>
  );
}
