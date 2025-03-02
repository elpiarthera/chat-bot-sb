import React, { createContext, useContext, useState, ReactNode } from "react";

interface EmbeddingFormContextType {
  formStep: number;
  nextFormStep: () => void;
  prevFormStep: () => void;
  resetForm: () => void;
}

const EmbeddingFormContext = createContext<EmbeddingFormContextType | undefined>(undefined);

export const useEmbeddingFormContext = () => {
  const context = useContext(EmbeddingFormContext);
  if (!context) {
    throw new Error("useEmbeddingFormContext must be used within an EmbeddingFormProvider");
  }
  return context;
};

interface EmbeddingFormProviderProps {
  children: ReactNode;
}

export const EmbeddingFormProvider: React.FC<EmbeddingFormProviderProps> = ({ children }) => {
  const [formStep, setFormStep] = useState(0);

  const nextFormStep = () => {
    setFormStep((prev) => prev + 1);
  };

  const prevFormStep = () => {
    setFormStep((prev) => (prev > 0 ? prev - 1 : prev));
  };

  const resetForm = () => {
    setFormStep(0);
  };

  return (
    <EmbeddingFormContext.Provider value={{ formStep, nextFormStep, prevFormStep, resetForm }}>
      {children}
    </EmbeddingFormContext.Provider>
  );
}; 