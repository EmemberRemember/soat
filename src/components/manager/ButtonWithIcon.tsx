import React from "react";

interface ButtonWithIconProps {
  iconSrc: string;
  label: string;
  onClick?: () => void;
  className?: string;
}

export default function ButtonWithIcon({
  iconSrc,
  label,
  onClick,
  className,
}: ButtonWithIconProps) {
  return (
    <button
      onClick={onClick}
      className={
        "w-4/5 bg-flesh-400 text-background flex items-center my-6 rounded-md hover:shadow-md transition-all duration-200" +
        className
      }
    >
      <div className="w-1/3 py-8 flex justify-center bg-white border-gray-300 border-2 border-r-0 rounded-s-md">
        <img src={iconSrc} alt={label} />
      </div>
      <span className="w-2/3 justify-center">{label}</span>
    </button>
  );
}
