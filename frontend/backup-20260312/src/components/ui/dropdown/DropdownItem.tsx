import React from "react";
import { Link } from "react-router-dom";

interface DropdownItemProps {
  children: React.ReactNode;
  onClick?: () => void;
  to?: string;
  tag?: "a" | "button" | "div";
  className?: string;
  onItemClick?: () => void;
}

export const DropdownItem: React.FC<DropdownItemProps> = ({
  children,
  onClick,
  to,
  tag = "div",
  className = "",
  onItemClick,
}) => {
  const handleClick = () => {
    if (onClick) onClick();
    if (onItemClick) onItemClick();
  };

  if (to) {
    return (
      <Link to={to} className={className} onClick={handleClick}>
        {children}
      </Link>
    );
  }

  if (tag === "button") {
    return (
      <button className={className} onClick={handleClick}>
        {children}
      </button>
    );
  }

  return (
    <div className={className} onClick={handleClick}>
      {children}
    </div>
  );
};
