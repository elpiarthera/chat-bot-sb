import React, { ReactNode } from "react";

interface CardSectionProps {
  children: ReactNode;
  className?: string;
}

const CardSection: React.FC<CardSectionProps> = ({ children, className = "" }) => {
  return (
    <div className={`bg-card rounded-lg border p-6 shadow-sm ${className}`}>
      {children}
    </div>
  );
};

export default CardSection;