import React from "react";

export interface LoaderProps {
  text?: string;
}

export const ThreeDotsLoader: React.FC<LoaderProps> = ({ text }) => {
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="flex justify-center items-center space-x-2">
        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "0s" }} />
        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }} />
      </div>
      {text && <div className="mt-2 text-sm text-gray-500">{text}</div>}
    </div>
  );
};

export const FullPageLoader: React.FC<LoaderProps> = ({ text }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white/80 dark:bg-black/80 z-50">
      <ThreeDotsLoader text={text} />
    </div>
  );
};

// Add the LoadingAnimation component that's being imported in other files
export const LoadingAnimation: React.FC<LoaderProps> = ({ text }) => {
  return (
    <div className="flex justify-center items-center py-8">
      <ThreeDotsLoader text={text || "Loading..."} />
    </div>
  );
}; 