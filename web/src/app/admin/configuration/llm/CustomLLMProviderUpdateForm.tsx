import { LoadingAnimation } from "@/components/Loading";
import Text from "@/components/ui/text";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { AdvancedOptionsToggle } from "@/components/AdvancedOptionsToggle";
import {
  ArrayHelpers,
  ErrorMessage,
  Field,
  FieldArray,
  Form,
  Formik,
} from "formik";
import { FiPlus, FiTrash, FiX } from "react-icons/fi";
import { LLM_PROVIDERS_ADMIN_URL } from "./constants";
import {
  TextFormField,
  TextAreaField,
} from "@/components/admin/connectors/Field";
import { useState } from "react";
import { useSWRConfig } from "swr";
import { FullLLMProvider } from "./interfaces";
import { PopupSpec } from "@/components/admin/connectors/Popup";
import * as Yup from "yup";
import isEqual from "lodash/isEqual";
import { IsPublicGroupSelector } from "@/components/IsPublicGroupSelector";

function customConfigProcessing(customConfigsList: [string, string][]) {
  const customConfig: { [key: string]: string } = {};
  customConfigsList.forEach(([key, value]) => {
    customConfig[key] = value;
  });
  return customConfig;
}

export function CustomLLMProviderUpdateForm({
  onClose,
  existingLlmProvider,
  shouldMarkAsDefault,
  setPopup,
  hideSuccess,
}: {
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
    name: existingLlmProvider?.name ?? "",
    provider: existingLlmProvider?.provider ?? "",
    api_key: existingLlmProvider?.api_key ?? "",
    api_base: existingLlmProvider?.api_base ?? "",
    api_version: existingLlmProvider?.api_version ?? "",
    default_model_name: existingLlmProvider?.default_model_name ?? null,
    fast_default_model_name:
      existingLlmProvider?.fast_default_model_name ?? null,
    model_names: existingLlmProvider?.model_names ?? [],
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
    api_key: Yup.string(),
    api_base: Yup.string(),
    api_version: Yup.string(),
    model_names: Yup.array(Yup.string().required("Model name is required")),
    default_model_name: Yup.string().required("Model name is required"),
    fast_default_model_name: Yup.string().nullable(),
    custom_config_list: Yup.array(),
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

        if (values.model_names.length === 0) {
          const fullErrorMsg = "At least one model name is required";
          if (setPopup) {
            setPopup({
              type: "error",
              message: fullErrorMsg,
            });
          } else {
            alert(fullErrorMsg);
          }
          setSubmitting(false);
          return;
        }

        // test the configuration
        if (!isEqual(values, initialValues)) {
          setIsTesting(true);

          const response = await fetch("/api/admin/llm/test", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              custom_config: customConfigProcessing(values.custom_config_list as [string, string][]),
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
            // For custom llm providers, all model names are displayed
            display_model_names: values.model_names,
            custom_config: customConfigProcessing(values.custom_config_list as [string, string][]),
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

            <TextFormField
              name="provider"
              label="Provider Name"
              subtext="Should be one of the providers listed at https://docs.litellm.ai/docs/providers"
              placeholder="Name of the custom provider"
            />

            <Separator />
            
            <p className="text-sm text-gray-500 mb-4">
              Fill in the following as is needed. Refer to the LiteLLM
              documentation for the model provider name specified above in order
              to determine which fields are required.
            </p>
            
            <TextFormField
              name="api_key"
              label="[Optional] API Key"
              placeholder="API Key"
              type="password"
            />

            {existingLlmProvider?.deployment_name && (
              <TextFormField
                name="deployment_name"
                label="[Optional] Deployment Name"
                placeholder="Deployment Name"
              />
            )}

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

            <TextFormField
              name="default_model_name"
              label="Default Model Name"
              placeholder="Default Model Name"
              required
            />

            <TextFormField
              name="fast_default_model_name"
              label="[Optional] Fast Default Model Name"
              placeholder="Fast Default Model Name"
            />

            {!existingLlmProvider?.deployment_name && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Model Names
                </label>
                <p className="text-sm text-gray-500 mb-2">
                  Add all model names that should be available for this provider.
                </p>
                <FieldArray name="model_names">
                  {({ remove, push }) => (
                    <div>
                      {formikProps.values.model_names.length > 0 &&
                        formikProps.values.model_names.map(
                          (modelName, index) => (
                            <div
                              className="flex items-center mb-2"
                              key={index}
                            >
                              <Field
                                name={`model_names.${index}`}
                                placeholder="Model Name"
                                className="flex-grow p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="ml-2"
                                onClick={() => remove(index)}
                              >
                                <FiX className="h-4 w-4" />
                              </Button>
                            </div>
                          )
                        )}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => push("")}
                      >
                        <FiPlus className="h-4 w-4 mr-2" />
                        Add Model
                      </Button>
                    </div>
                  )}
                </FieldArray>
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                [Optional] Custom Configuration
              </label>
              <p className="text-sm text-gray-500 mb-2">
                Add any additional configuration parameters required by the provider.
              </p>
              <FieldArray name="custom_config_list">
                {({ remove, push }) => (
                  <div>
                    {formikProps.values.custom_config_list.length > 0 &&
                      formikProps.values.custom_config_list.map(
                        (config, index) => (
                          <div
                            className="flex items-center mb-2"
                            key={index}
                          >
                            <Field
                              name={`custom_config_list.${index}.0`}
                              placeholder="Key"
                              className="flex-grow p-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <Field
                              name={`custom_config_list.${index}.1`}
                              placeholder="Value"
                              className="flex-grow p-2 border border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="ml-2"
                              onClick={() => remove(index)}
                            >
                              <FiX className="h-4 w-4" />
                            </Button>
                          </div>
                        )
                      )}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => push(["", ""])}
                    >
                      <FiPlus className="h-4 w-4 mr-2" />
                      Add Config
                    </Button>
                  </div>
                )}
              </FieldArray>
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