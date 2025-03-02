import { LoadingAnimation } from "../../../../components/Loading";
import { AdvancedOptionsToggle } from "../../../../components/AdvancedOptionsToggle";
import Text from "../../../../components/ui/text";
import { Separator } from "../../../../components/ui/separator";
import { Button } from "../../../../components/ui/button";
import { Form, Formik } from "formik";
import {
  TextFormField,
} from "../../../../components/admin/connectors/Field";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSlackBot } from "./lib";
import { PopupSpec } from "../../../../components/admin/connectors/Popup";
import * as Yup from "yup";
import { IsPublicGroupSelector } from "../../../../components/IsPublicGroupSelector";

export function SlackBotCreationForm({
  onClose,
  setPopup,
  hideAdvanced,
  hideSuccess,
}: {
  onClose: () => void;
  setPopup?: (popup: PopupSpec) => void;
  hideAdvanced?: boolean;
  hideSuccess?: boolean;
}) {
  const router = useRouter();
  const [isTesting, setIsTesting] = useState(false);
  const [testError, setTestError] = useState<string>("");
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

  // Define the initial values
  const initialValues = {
    name: "",
    enabled: true,
    bot_token: "",
    app_token: "",
    is_public: true,
    groups: [],
  };

  // Setup validation schema
  const validationSchema = Yup.object({
    name: Yup.string().required("Bot Name is required"),
    bot_token: Yup.string().required("Bot Token is required"),
    app_token: Yup.string().required("App Token is required"),
    is_public: Yup.boolean().required(),
    groups: Yup.array().of(Yup.number()),
  });

  return (
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={async (values, { setSubmitting }) => {
          setSubmitting(true);

          // Test the tokens with Slack API
          setIsTesting(true);
          try {
            const testResponse = await fetch("/api/admin/slack/test", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                bot_token: values.bot_token,
                app_token: values.app_token,
              }),
            });
            
            if (!testResponse.ok) {
              const errorMsg = (await testResponse.json()).detail;
              setTestError(errorMsg);
              setIsTesting(false);
              setSubmitting(false);
              return;
            }
          } catch (error) {
            setTestError("Failed to test connection to Slack: " + (error instanceof Error ? error.message : "Unknown error"));
            setIsTesting(false);
            setSubmitting(false);
            return;
          }
          
          setIsTesting(false);

          // Create the Slack bot
          try {
            const response = await createSlackBot({
              name: values.name,
              enabled: values.enabled,
              bot_token: values.bot_token,
              app_token: values.app_token,
            });

            if (!response.ok) {
              const errorMsg = (await response.json()).detail;
              const fullErrorMsg = `Failed to create Slack bot: ${errorMsg}`;
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

            const newBot = await response.json();

            // Handle groups
            if (showAdvancedOptions) {
              // Update groups through a separate API call
              const groupsResponse = await fetch(`/api/manage/admin/slack-app/bots/${newBot.id}/groups`, {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  is_public: values.is_public,
                  groups: values.groups,
                }),
              });

              if (!groupsResponse.ok) {
                const errorMsg = (await groupsResponse.json()).detail;
                if (setPopup) {
                  setPopup({
                    type: "info",
                    message: `Bot created but failed to update access settings: ${errorMsg}`,
                  });
                }
              }
            }
            
            // Success message
            if (!hideSuccess && setPopup) {
              setPopup({
                type: "success",
                message: "Slack bot created successfully!",
              });
            }

            onClose();
            
            // Navigate to the bot's edit page
            router.push(`/admin/bots/${newBot.id}`);
          } catch (error) {
            if (setPopup) {
              setPopup({
                type: "error",
                message: `Error creating Slack bot: ${error instanceof Error ? error.message : "Unknown error"}`,
              });
            }
          }

          setSubmitting(false);
        }}
      >
        {(formikProps) => (
          <Form className="gap-y-4 items-stretch mt-6">
            <TextFormField
              name="name"
              label="Bot Name"
              subtext="A descriptive name for this Slack bot."
              placeholder="My Slack Bot"
            />

            <TextFormField
              name="bot_token"
              label="Bot Token"
              subtext="The bot token from your Slack app (starts with xoxb-)"
              placeholder="xoxb-your-token"
              type="password"
            />

            <TextFormField
              name="app_token"
              label="App Token"
              subtext="The app-level token from your Slack app (starts with xapp-)"
              placeholder="xapp-your-token"
              type="password"
            />

            {!hideAdvanced && (
              <>
                <Separator />
                
                <AdvancedOptionsToggle
                  showAdvancedOptions={showAdvancedOptions}
                  setShowAdvancedOptions={setShowAdvancedOptions}
                />
                
                {showAdvancedOptions && (
                  <IsPublicGroupSelector
                    formikProps={formikProps}
                    objectName="Slack Bot"
                    publicToWhom="all users"
                    enforceGroupSelection={true}
                  />
                )}
              </>
            )}

            <div>
              {/* Error message display */}
              {testError && <Text className="text-error mt-2">{testError}</Text>}
              <div className="flex w-full mt-4">
                <Button type="submit" variant="default">
                  {isTesting ? (
                    <LoadingAnimation text="Testing" />
                  ) : (
                    "Create Bot"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  className="ml-3"
                  onClick={onClose}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Form>
        )}
      </Formik>
  );
}