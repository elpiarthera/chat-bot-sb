import { LoadingAnimation } from "@/components/Loading";
import Text from "@/components/ui/text";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { AdvancedOptionsToggle } from "@/components/AdvancedOptionsToggle";
import {
  Form,
  Formik,
} from "formik";
import { FiTrash } from "react-icons/fi";
import { LLM_PROVIDERS_ADMIN_URL } from "./constants";
import {
  TextFormField,
} from "@/components/admin/connectors/Field";
import { useState } from "react";
import { useSWRConfig } from "swr";
import { FullLLMProvider, WellKnownLLMProviderDescriptor } from "./interfaces";
import { PopupSpec } from "@/components/admin/connectors/Popup";
import * as Yup from "yup";
import isEqual from "lodash/isEqual";
import { IsPublicGroupSelector } from "@/components/IsPublicGroupSelector";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export function LLMProviderUpdateForm({
  llmProviderDescriptor,
  onClose,
  existingLlmProvider,
  shouldMarkAsDefault,
  setPopup,
  hideSuccess,
}: {
  llmProviderDescriptor: WellKnownLLMProviderDescriptor;
  onClose: () => void;
  existingLlmProvider?: FullLLMProvider;
  shouldMarkAsDefault?: boolean;
  setPopup?: (popup: PopupSpec) => void;
  hideSuccess?: boolean;
}) {
  const { mutate } = useSWRConfig();

  const [isTesting, setIsTesting] = useState(false);
  const [testError, setTestError] = useState<string>("");

  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

  // Define the initial values based on the provider's requirements
  const initialValues = {
    name: existingLlmProvider?.name ?? llmProviderDescriptor.display_name,
    provider: existingLlmProvider?.provider ?? llmProviderDescriptor.name,
    api_key: existingLlmProvider?.api_key ?? "",
    api_base: existingLlmProvider?.api_base ?? "",
    api_version: existingLlmProvider?.api_version ?? "",
    default_model_name: existingLlmProvider?.default_model_name ?? llmProviderDescriptor.default_model ?? (llmProviderDescriptor.llm_names && llmProviderDescriptor.llm_names.length > 0 ? llmProviderDescriptor.llm_names[0] : ""),
    fast_default_model_name:
      existingLlmProvider?.fast_default_model_name ?? llmProviderDescriptor.default_fast_model ?? null,
    model_names: existingLlmProvider?.model_names ?? llmProviderDescriptor.llm_names ?? [],
    custom_config_list: existingLlmProvider?.custom_config
      ? Object.entries(existingLlmProvider.custom_config)
      : [],
    is_public: existingLlmProvider?.is_public ?? true,
    groups: existingLlmProvider?.groups ?? [],
    deployment_name: existingLlmProvider?.deployment_name ?? null,
  };

  // Setup validation schema if required
  const validationSchema = Yup.object({
    name: Yup.string().required("Display Name is required"),
    provider: Yup.string().required("Provider Name is required"),
    api_key: Yup.string().required("API Key is required"),
    api_base: Yup.string(),
    api_version: Yup.string(),
    default_model_name: Yup.string().required("Default model is required"),
    fast_default_model_name: Yup.string().nullable(),
    // EE Only
    is_public: Yup.boolean().required(),
    groups: Yup.array().of(Yup.number()),
    deployment_name: Yup.string().nullable(),
  });

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={async (values, { setSubmitting }) => {
        setSubmitting(true);

        // test the configuration
        if (!isEqual(values, initialValues)) {
          setIsTesting(true);

          const response = await fetch("/api/admin/llm/test", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              ...values,
            }),
          });
          setIsTesting(false);

          if (!response.ok) {
            const errorMsg = (await response.json()).detail;
            setTestError(errorMsg);
            return;
          }
        }

        const response = await fetch(LLM_PROVIDERS_ADMIN_URL, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...values,
            // For built-in providers, use the predefined model names
            model_names: llmProviderDescriptor.llm_names,
            display_model_names: values.model_names,
          }),
        });

        if (!response.ok) {
          const errorMsg = (await response.json()).detail;
          const fullErrorMsg = existingLlmProvider
            ? `Failed to update provider: ${errorMsg}`
            : `Failed to enable provider: ${errorMsg}`;
          if (setPopup) {
            setPopup({
              type: "error",
              message: fullErrorMsg,
            });
          } else {
            alert(fullErrorMsg);
          }
          return;
        }

        if (shouldMarkAsDefault) {
          const newLlmProvider = (await response.json()) as FullLLMProvider;
          const setDefaultResponse = await fetch(
            `${LLM_PROVIDERS_ADMIN_URL}/${newLlmProvider.id}/default`,
            {
              method: "POST",
            }
          );
          if (!setDefaultResponse.ok) {
            const errorMsg = (await setDefaultResponse.json()).detail;
            const fullErrorMsg = `Failed to set provider as default: ${errorMsg}`;
            if (setPopup) {
              setPopup({
                type: "error",
                message: fullErrorMsg,
              });
            } else {
              alert(fullErrorMsg);
            }
            return;
          }
        }

        mutate(LLM_PROVIDERS_ADMIN_URL);
        onClose();

        const successMsg = existingLlmProvider
          ? "Provider updated successfully!"
          : "Provider enabled successfully!";
        if (!hideSuccess && setPopup) {
          setPopup({
            type: "success",
            message: successMsg,
          });
        } else {
          alert(successMsg);
        }

        setSubmitting(false);
      }}
    >
      {(formikProps) => {
        return (
          <Form className="gap-y-6 mt-8">
            <TextFormField
              name="name"
              label="Display Name"
              subtext="A name which you can use to identify this provider when selecting it in the UI."
              placeholder="Display Name"
              disabled={existingLlmProvider ? true : false}
            />

            <Separator />

            <TextFormField
              name="api_key"
              label="API Key"
              placeholder="API Key"
              type="password"
            />

            <TextFormField
              name="api_base"
              label="[Optional] API Base"
              placeholder="API Base"
            />

            <TextFormField
              name="api_version"
              label="[Optional] API Version"
              placeholder="API Version"
            />

            <Separator />

            <div className="grid gap-2">
              <Label htmlFor="default_model_name">Default Model</Label>
              <Select
                name="default_model_name"
                value={formikProps.values.default_model_name || ""}
                onValueChange={(value) => formikProps.setFieldValue("default_model_name", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select default model" />
                </SelectTrigger>
                <SelectContent>
                  {llmProviderDescriptor.llm_names && llmProviderDescriptor.llm_names.map((model) => (
                    <SelectItem key={model} value={model}>
                      {model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formikProps.errors.default_model_name && formikProps.touched.default_model_name && (
                <Text className="text-error text-sm mt-1">{formikProps.errors.default_model_name}</Text>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="fast_default_model_name">[Optional] Fast Model</Label>
              <Select
                name="fast_default_model_name"
                value={formikProps.values.fast_default_model_name || ""}
                onValueChange={(value) => formikProps.setFieldValue("fast_default_model_name", value || null)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select fast model (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {llmProviderDescriptor.llm_names && llmProviderDescriptor.llm_names.map((model) => (
                    <SelectItem key={model} value={model}>
                      {model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formikProps.errors.fast_default_model_name && formikProps.touched.fast_default_model_name && (
                <Text className="text-error text-sm mt-1">{formikProps.errors.fast_default_model_name}</Text>
              )}
            </div>

            <Separator />

            <AdvancedOptionsToggle
              showAdvancedOptions={showAdvancedOptions}
              setShowAdvancedOptions={setShowAdvancedOptions}
            />

            {showAdvancedOptions && (
              <IsPublicGroupSelector
                formikProps={formikProps}
                objectName="LLM Provider"
                publicToWhom="all users"
                enforceGroupSelection={true}
              />
            )}

            <div>
              {/* NOTE: this is above the test button to make sure it's visible */}
              {testError && (
                <Text className="text-error mt-2">{testError}</Text>
              )}

              <div className="flex w-full mt-4">
                <Button type="submit" variant="default">
                  {isTesting ? (
                    <LoadingAnimation text="Testing" />
                  ) : existingLlmProvider ? (
                    "Update"
                  ) : (
                    "Enable"
                  )}
                </Button>
                {existingLlmProvider && (
                  <Button
                    type="button"
                    variant="destructive"
                    className="ml-3"
                    onClick={async () => {
                      const response = await fetch(
                        `${LLM_PROVIDERS_ADMIN_URL}/${existingLlmProvider.id}`,
                        {
                          method: "DELETE",
                        }
                      );
                      if (response.ok) {
                        mutate(LLM_PROVIDERS_ADMIN_URL);
                        onClose();
                      }
                    }}
                  >
                    <FiTrash className="mr-2" />
                    Delete
                  </Button>
                )}
              </div>
            </div>
          </Form>
        );
      }}
    </Formik>
  );
}