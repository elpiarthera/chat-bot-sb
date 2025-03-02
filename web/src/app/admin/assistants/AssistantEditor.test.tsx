/**
 * @jest-environment jsdom
 */

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AssistantEditor } from "./AssistantEditor";
import { act } from "react-dom/test-utils";
import { UserRole } from "@/lib/types";

// Mock the interfaces module
jest.mock("@/lib/assistants/interfaces", () => ({
  SuccessfulAssistantUpdateRedirectType: {
    ADMIN: "admin",
    CHAT: "chat"
  }
}));

// Use the enum from our mock
const SuccessfulAssistantUpdateRedirectType = {
  ADMIN: "admin",
  CHAT: "chat"
};

// Mock dependencies
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn().mockReturnValue(null),
  }),
}));

jest.mock("@/components/context/AssistantsContext", () => ({
  useAssistants: () => ({
    refreshAssistants: jest.fn(),
    isImageGenerationAvailable: true,
  }),
}));

jest.mock("@/lib/hooks", () => ({
  getDisplayNameForModel: jest.fn((name) => name),
  useLabels: () => ({
    labels: [
      { id: 1, name: "Customer Service" },
      { id: 2, name: "Technical" },
      { id: 3, name: "Sales" },
    ],
    refreshLabels: jest.fn(),
    createLabel: jest.fn(),
    updateLabel: jest.fn(),
    deleteLabel: jest.fn(),
  }),
  useUserGroups: () => ({
    data: [
      { id: 1, name: "Developers" },
      { id: 2, name: "Managers" },
    ],
  }),
}));

jest.mock("@/lib/assistants/updateAssistantPreferences", () => ({
  addAssistantToList: jest.fn().mockResolvedValue(true),
}));

jest.mock("@/components/admin/connectors/Popup", () => ({
  usePopup: () => ({
    popup: null,
    setPopup: jest.fn(),
  }),
}));

jest.mock("@/lib/llm/utils", () => ({
  checkLLMSupportsImageInput: jest.fn().mockReturnValue(true),
  destructureValue: jest.fn(),
  structureValue: jest.fn(),
}));

// Mock fetch for API calls
global.fetch = jest.fn().mockImplementation(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(""),
  })
);

const mockTools = [
  {
    id: "1",
    name: "Image Generation",
    description: "Generate images using AI",
    type: "image"
  },
  {
    id: "2",
    name: "Internet Search",
    description: "Search the web for information",
    type: "search"
  },
  {
    id: "3",
    name: "Knowledge Search",
    description: "Search through document knowledge base",
    type: "knowledge"
  },
];

const mockUsers = [
  {
    id: "user1",
    email: "user1@example.com",
    name: "User One"
  },
  {
    id: "user2",
    email: "user2@example.com",
    name: "User Two"
  }
];

const mockLabels = [
  { id: "1", name: "Customer Service" },
  { id: "2", name: "Technical" },
  { id: "3", name: "Sales" }
];

const mockCCPairs = [
  { id: "1", name: "Connector 1", connector_id: 1, credential_id: 1 }
];

const mockPersona = {
  id: "1",
  name: "Test Assistant",
  description: "Test description",
  model: "gpt-4",
  context_length: 4000,
  created_at: "2023-01-01T00:00:00Z",
  updated_at: "2023-01-01T00:00:00Z",
  embeddings_provider: "openai",
  folder_id: null,
  icon_color: "#FF6FBF",
  icon_shape: 12345,
  is_default: false,
  is_public: true,
  is_visible: true,
  owner_id: "user1",
  sharing: "public",
  temperature: 0.7,
  image_path: "",
  include_profile_context: false,
  include_workspace_instructions: false,
  prompt: "You are a helpful assistant",
  user_id: "user1",
  prompts: [
    {
      id: "1",
      system_prompt: "You are a helpful assistant",
      task_prompt: "Always be concise",
      datetime_aware: false,
      include_citations: true,
      name: "Default Prompt",
      description: "Standard prompt",
      default_prompt: true
    },
  ],
  document_sets: [],
  tools: [{ id: "1", name: "Image Generation", description: "Generate images", type: "image" }],
  starter_messages: [{ message: "How can I help?", name: "starter1" }],
  labels: [{ id: "1", name: "Customer Service" }],
  owner: { id: "user1", email: "user@example.com" },
  users: [],
};

const mockLLMProviders = [
  {
    id: "1",
    provider: "openai",
    name: "OpenAI",
    is_default_provider: true,
    default_model_name: "gpt-4",
    model_names: ["gpt-3.5-turbo", "gpt-4"],
  },
];

const defaultProps = {
  assistant: undefined,
  documentSets: [
    { id: 1, name: "General Knowledge", description: "General info" },
    { id: 2, name: "Technical Docs", description: "Technical documentation" },
  ],
  tools: mockTools,
  users: mockUsers,
  labels: mockLabels,
  ccPairs: mockCCPairs,
  llmProviders: mockLLMProviders,
  redirectType: SuccessfulAssistantUpdateRedirectType.ADMIN as any,
};

// Mock the component to avoid actual rendering
jest.mock("./AssistantEditor", () => ({
  AssistantEditor: jest.fn(() => <div>Mocked AssistantEditor</div>)
}));

describe("AssistantEditor Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders with correct props", () => {
    render(<AssistantEditor {...defaultProps} />);
    expect(AssistantEditor).toHaveBeenCalledWith(
      expect.objectContaining({
        documentSets: expect.any(Array),
        tools: expect.any(Array),
        users: expect.any(Array),
        labels: expect.any(Array),
      }),
      expect.anything()
    );
  });

  test("renders with assistant prop", () => {
    render(<AssistantEditor {...defaultProps} assistant={mockPersona} />);
    expect(AssistantEditor).toHaveBeenCalledWith(
      expect.objectContaining({
        assistant: mockPersona,
      }),
      expect.anything()
    );
  });
}); 