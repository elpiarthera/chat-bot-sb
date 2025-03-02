import { LoadingAnimation } from "../../../../components/Loading";
import { AdvancedOptionsToggle } from "../../../../components/AdvancedOptionsToggle";
import Text from "../../../../components/ui/text";
import { Separator } from "../../../../components/ui/separator";
import { Button } from "../../../../components/ui/button";
import { Form, Formik } from "formik";
import { FiTrash } from "react-icons/fi";
import {
  TextFormField,
  SelectorFormField,
  MultiSelectField,
} from "../../../../components/admin/connectors/Field";
import { useState } from "react";
import { useSWRConfig } from "swr";
import { SlackBot } from "../../../../lib/types";
import { updateSlackBot, deleteSlackBot } from "../new/lib";
import { PopupSpec } from "../../../../components/admin/connectors/Popup";
import * as Yup from "yup";
import { IsPublicGroupSelector } from "../../../../components/IsPublicGroupSelector";

export function SlackBotUpdateForm({
  slackBot,
  onClose,
  setPopup,
  hideAdvanced,
  hideSuccess,
}: {
  slackBot: SlackBot;
  onClose: () => void;
  setPopup?: (popup: PopupSpec) => void;
  hideAdvanced?: boolean;
  hideSuccess?: boolean;
}) {
  const { mutate } = useSWRConfig();

  const [isTesting, setIsTesting] = useState(false);
  const [testError, setTestError] = useState<string>("");
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

  // Define the initial values based on the existing bot
  const initialValues = {
    name: slackBot.name || "",
    enabled: slackBot.enabled || false,
    bot_token: slackBot.bot_token || "",
    app_token: slackBot.app_token || "",
    is_public: slackBot.is_public ?? true,
    groups: slackBot.groups || [],
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

        // test the configuration
        if (values.bot_token !== initialValues.bot_token || values.app_token !== initialValues.app_token) {
          setIsTesting(true);

          // Test the tokens with Slack API
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
        }

        // Update the Slack bot
        try {
          const response = await updateSlackBot(slackBot.id, {
            name: values.name,
            enabled: values.enabled,
            bot_token: values.bot_token,
            app_token: values.app_token,
          });

          if (!response.ok) {
            const errorMsg = (await response.json()).detail;
            const fullErrorMsg = `Failed to update Slack bot: ${errorMsg}`;
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

          // Handle groups
          if (showAdvancedOptions) {
            // Update groups through a separate API call if needed
            const groupsResponse = await fetch(`/api/manage/admin/slack-app/bots/${slackBot.id}/groups`, {
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
                  message: `Bot updated but failed to update access settings: ${errorMsg}`,
                });
              }
            }
          }

          // Refresh data
          mutate(`/api/manage/admin/slack-app/bots/${slackBot.id}`);
          mutate("/api/manage/admin/slack-app/bots");
          
          // Success message
          if (!hideSuccess && setPopup) {
            setPopup({
              type: "success",
              message: "Slack bot updated successfully!",
            });
          }

          onClose();
        } catch (error) {
          if (setPopup) {
            setPopup({
              type: "error",
              message: `Error updating Slack bot: ${error instanceof Error ? error.message : "Unknown error"}`,
            });
          }
        }

        setSubmitting(false);
      }}
    >
      {(formikProps) => (
        <Form className="gap-y-4 items-stretch mt-6">
          {!hideAdvanced && (
            <TextFormField
              name="name"
              label="Bot Name"
              subtext="A descriptive name for this Slack bot."
              placeholder="My Slack Bot"
            />
          )}

          <TextFormField
            small={hideAdvanced}
            name="bot_token"
            label="Bot Token"
            subtext="The bot token from your Slack app (starts with xoxb-)"
            placeholder="xoxb-your-token"
            type="password"
          />

          <TextFormField
            small={hideAdvanced}
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
                  "Update"
                )}
              </Button>
              <Button
                type="button"
                variant="destructive"
                className="ml-3"
                onClick={async () => {
                  if (window.confirm(`Are you sure you want to delete the Slack bot "${slackBot.name}"?`)) {
                    const response = await deleteSlackBot(slackBot.id);
                    
                    if (!response.ok) {
                      const errorMsg = (await response.json()).detail;
                      if (setPopup) {
                        setPopup({
                          type: "error",
                          message: `Failed to delete Slack bot: ${errorMsg}`,
                        });
                      } else {
                        alert(`Failed to delete Slack bot: ${errorMsg}`);
                      }
                      return;
                    }
                    
                    // Refresh data
                    mutate("/api/manage/admin/slack-app/bots");
                    
                    // Success message
                    if (setPopup) {
                      setPopup({
                        type: "success",
                        message: `Slack bot "${slackBot.name}" deleted successfully!`,
                      });
                    }
                    
                    onClose();
                  }
                }}
              >
                <FiTrash className="mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </Form>
      )}
    </Formik>
  );
}