"use client";

import * as React from "react";
import { HiChip } from "react-icons/hi";
import { LLMConfiguration } from "./LLMConfiguration";

const Page = () => {
  return (
    <div className="container mx-auto">
      <div className="mb-8 flex items-start gap-3">
        <div className="mt-1">
          <HiChip size={32} className="my-auto" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">LLM Setup</h1>
          <p className="text-sm font-normal mt-1">
            Configure Language Model providers and models for AI-powered features like assistants, chat interfaces, and knowledge search.
          </p>
        </div>
      </div>
      
      <LLMConfiguration />
    </div>
  );
};

export default Page; 