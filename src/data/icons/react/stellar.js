//@flow
import React from "react";

type Props = {
  size: number,
  color: string
};

export default function Stellar({ size, color = "currentColor" }: Props) {
  return (
    <svg viewBox="0 0 16 16" width={size} height={size}>
      <path
        fill={color}
        d="M13.252 2.213L8.65 4.009 6.437 9.68l3.09 1.71 4.268-4.617-.543-4.559zM9.845 13.371l-5.38-2.98L7.43 2.79 14.578 0l.87 7.31-5.603 6.061zm1.78-2.203l.033.348.16-.182-.193-.166zm-2.048.327l3.304-3.77.69 7.184-3.994-3.414zM1 8.213l7.144-2.906-1.976 4.58L1 8.213zm4.605-.168l-.317-.103-.122.28.439-.177zm.963 3.52l-.128 1.39 1.232-.779-1.104-.61zM4.575 16l.641-6.987 5.556 3.073L4.575 16zM13.16 5.448c0 1.06-.893 1.9-1.971 1.9-.693 0-1.34-.351-1.696-.931a1.84 1.84 0 0 1 0-1.937 1.987 1.987 0 0 1 1.696-.93c1.078 0 1.971.838 1.971 1.898zm-2.322-.14a.261.261 0 0 0 0 .281.41.41 0 0 0 .35.18c.228 0 .393-.156.393-.32 0-.166-.165-.32-.392-.32a.41.41 0 0 0-.351.178z"
      />
    </svg>
  );
}
