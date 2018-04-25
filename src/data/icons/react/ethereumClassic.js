//@flow
import React from "react";

type Props = {
  size: number,
  color: string
};

export default function EthereumClassic({
  size,
  color = "currentColor"
}: Props) {
  return (
    <svg viewBox="0 0 16 16" width={size} height={size}>
      <path
        fill={color}
        d="M11.278 8L7.605 2.758 3.933 8l3.672 5.242L11.278 8zM2 8l5.605-8 5.605 8-5.605 8L2 8zm10.313-.982l.446 1.518-5.154 1.514-5.153-1.514.446-1.518L7.605 8.4l4.708-1.382z"
      />
    </svg>
  );
}
