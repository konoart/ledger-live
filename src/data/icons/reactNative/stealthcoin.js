//@flow
import React from "react";
import Svg, { Path } from "react-native-svg";

type Props = {
  size: number,
  color: string
};

export default function Stealthcoin({ size, color }: Props) {
  return (
    <Svg viewBox="0 0 16 16" width={size} height={size}>
      <Path
        fill={color}
        d="M3.874 8L2.06 4.493a.25.25 0 0 1 .082-.322L7.893.293a.25.25 0 0 1 .286.005l5.742 3.873c.105.07.14.21.082.322L12.19 8l1.813 3.507a.25.25 0 0 1-.082.322l-5.749 3.878a.249.249 0 0 1-.293-.009l-5.736-3.869a.25.25 0 0 1-.082-.322L3.874 8zm-.057-3.23l.863 1.67 1.788-3.458L3.817 4.77zm5.78-1.788l1.787 3.458.863-1.67-2.65-1.788zM5.487 8l2.545 4.924L10.578 8 8.032 3.075 5.487 8zm4.11 5.018l2.65-1.788-.863-1.67-1.788 3.458zm-3.129 0L4.681 9.56l-.864 1.67 2.651 1.788z"
      />
    </Svg>
  );
}
