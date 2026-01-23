import React from "react";

export default function ArrowUpIcon({ className = "", ...props }) {
  return (
    <svg
      className={className}
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <circle cx="16" cy="16" r="16" fill="url(#paint0_linear)" />
      <path
        d="M16 22V10M16 10l-5 5M16 10l5 5"
        stroke="#23272f"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <defs>
        <linearGradient id="paint0_linear" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#7ec6ef" />
          <stop offset="1" stopColor="#6bb6e6" />
        </linearGradient>
      </defs>
    </svg>
  );
}
