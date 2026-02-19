import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";

type TooltipDirection =
  | "horizontal-left"
  | "horizontal-right"
  | "vertical-up"
  | "vertical-down";

type ModernIconProps = {
  icon: IconDefinition;
  text: string;
  direction?: TooltipDirection;
  distance?: number;
};

export default function ModernIcon({
  icon,
  text,
  direction = "horizontal-right",
  distance = 30,
}: ModernIconProps) {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <div
      className="modern-item"
      onMouseEnter={() => setShowInfo(true)}
      onMouseLeave={() => setShowInfo(false)}
    >
      <FontAwesomeIcon className="modern-icon" icon={icon} />

      <div
        className={`modern-tooltip ${direction} ${showInfo ? "show" : ""}`}
        style={{ "--tooltip-distance": `${distance}px` } as React.CSSProperties}
      >
        {text}
      </div>
    </div>
  );
}
