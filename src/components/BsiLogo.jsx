import React from "react";

export default function BsiLogo({ className = "h-12 w-auto" }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 240 50"
      className={className}
      preserveAspectRatio="xMinYMid meet"
    >
      {/* BSI Text */}
      <text
        x="0"
        y="40"
        fontFamily="'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif"
        fontWeight="900"
        fontSize="44"
        fill="#00a0a0"
        letterSpacing="-1"
      >
        BSI
      </text>

      {/* Goldenrod Accent Star above 'I' */}
      <path
        d="M 68 8 L 71 14 L 77 15 L 72.5 19.5 L 74 25.5 L 68 22 L 62 25.5 L 63.5 19.5 L 59 15 L 65 14 Z"
        fill="#f0b43c"
      />

      {/* BANK SYARIAH INDONESIA Text */}
      <text
        x="88"
        y="23"
        fontFamily="'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
        fontWeight="700"
        fontSize="12"
        fill="#00a0a0"
        letterSpacing="0.4"
      >
        BANK SYARIAH
      </text>
      <text
        x="88"
        y="39"
        fontFamily="'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
        fontWeight="700"
        fontSize="12"
        fill="#00a0a0"
        letterSpacing="0.4"
      >
        INDONESIA
      </text>
    </svg>
  );
}
