"use client"

import { useState, useEffect } from "react"
import { Form, Formik, FieldArray } from "formik"
import * as Yup from "yup"
import {
  createDocumentSet,
  updateDocumentSet,
  DocumentSetCreationRequest
} from "./lib"
import { DocumentSet } from "./hooks"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useRouter } from "next/navigation"
import { ConnectorPair } from "@/app/admin/connectors/hooks"
import { User } from "@/app/admin/users/hooks"
import { Group } from "@/app/admin/groups/hooks"

// Mock useUser hook if it doesn't exist
const useUser = () => {
  return {
    user: null
  }
}

interface PopupSpec {
  message: string
  type: "success" | "error" | "info"
}

interface DocumentSetCreationFormProps {
  connectorPairs: ConnectorPair[]
  users: User[]
  groups: Group[]
  onClose: () => void
  setPopup: (popupSpec: PopupSpec | null) => void
  existingDocumentSet?: DocumentSet
}

export const DocumentSetCreationForm = ({
  connectorPairs,
  users,
  groups,
  onClose,
  setPopup,
  existingDocumentSet
}: DocumentSetCreationFormProps) => {
  const router = useRouter()
  const isUpdate = existingDocumentSet !== undefined
  const [localCcPairs, setLocalCcPairs] = useState(connectorPairs)
  const { user } = useUser()

  return (
    <div>
      <Formik
        initialValues={{
          name: existingDocumentSet?.name ?? "",
          description: existingDocumentSet?.description ?? "",
          cc_pair_ids:
            existingDocumentSet?.cc_pair_descriptors.map(
              ccPairDescriptor => ccPairDescriptor.id
            ) ?? [],
          is_public: existingDocumentSet?.is_public ?? true,
          users: existingDocumentSet?.users ?? [],
          groups: existingDocumentSet?.groups ?? []
        }}
        validationSchema={Yup.object().shape({
          name: Yup.string().required("Please enter a name for the set"),
          description: Yup.string().optional(),
          cc_pair_ids: Yup.array()
            .of(Yup.string().required())
            .required("Please select at least one connector")
        })}
        onSubmit={async (values, formikHelpers) => {
          formikHelpers.setSubmitting(true)
          // If the document set is public, then we don't want to send any groups
          const processedValues = {
            ...values,
            // Convert string IDs to numbers for the API
            cc_pair_ids: values.cc_pair_ids.map(id => parseInt(id, 10)),
            // Handle groups separately based on public status
            groups: values.is_public
              ? []
              : values.groups.map(id => parseInt(id, 10))
          }

          let response
          if (isUpdate && existingDocumentSet) {
            response = await updateDocumentSet({
              id: existingDocumentSet.id,
              description: processedValues.description,
              cc_pair_ids: processedValues.cc_pair_ids,
              is_public: processedValues.is_public,
              users: processedValues.users,
              groups: processedValues.groups
            })
          } else {
            response = await createDocumentSet({
              name: processedValues.name,
              description: processedValues.description,
              cc_pair_ids: processedValues.cc_pair_ids,
              is_public: processedValues.is_public,
              users: processedValues.users,
              groups: processedValues.groups
            })
          }
          formikHelpers.setSubmitting(false)
          if (response.ok) {
            setPopup({
              message: isUpdate
                ? "Successfully updated document set!"
                : "Successfully created document set!",
              type: "success"
            })
            onClose()
          } else {
            const errorMsg = await response.text()
            setPopup({
              message: isUpdate
                ? `Error updating document set - ${errorMsg}`
                : `Error creating document set - ${errorMsg}`,
              type: "error"
            })
          }
        }}
      >
        {props => {
          return (
            <Form>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={props.values.name}
                    onChange={props.handleChange}
                    onBlur={props.handleBlur}
                    placeholder="A name for the document set"
                    disabled={isUpdate}
                    className={isUpdate ? "bg-muted" : ""}
                  />
                  {props.touched.name && props.errors.name && (
                    <div className="text-sm text-destructive">
                      {props.errors.name}
                    </div>
                  )}
                  {isUpdate && (
                    <p className="text-sm text-muted-foreground">
                      Document set names cannot be changed after creation
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={props.values.description}
                    onChange={props.handleChange}
                    onBlur={props.handleBlur}
                    placeholder="Describe what the document set represents"
                    rows={3}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is_public"
                    checked={props.values.is_public}
                    onCheckedChange={checked => {
                      props.setFieldValue("is_public", checked === true)
                    }}
                  />
                  <Label htmlFor="is_public">
                    Make this document set public
                  </Label>
                </div>

                <Separator />

                <FieldArray
                  name="cc_pair_ids"
                  render={arrayHelpers => {
                    // Filter visible cc pairs based on access type and groups
                    const visibleCcPairs = localCcPairs.filter(
                      ccPair =>
                        ccPair.access_type === "public" ||
                        (ccPair.groups.length > 0 &&
                          props.values.groups.every(group =>
                            ccPair.groups.includes(group)
                          ))
                    )

                    // Deselect filtered out cc pairs
                    const visibleCcPairIds = visibleCcPairs.map(
                      ccPair => ccPair.cc_pair_id
                    )
                    props.values.cc_pair_ids = props.values.cc_pair_ids.filter(
                      id => visibleCcPairIds.includes(id)
                    )

                    return (
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Connectors</h3>
                        <p className="text-sm text-muted-foreground">
                          All documents indexed by these selected connectors
                          will be a part of this document set.
                        </p>

                        <div className="flex gap-2 flex-wrap">
                          {visibleCcPairs.map(ccPair => {
                            const ind = props.values.cc_pair_ids.indexOf(
                              ccPair.cc_pair_id
                            )
                            const isSelected = ind !== -1
                            return (
                              <div
                                key={`${ccPair.connector.id}-${ccPair.credential.id}`}
                                className={`
                                  px-3 
                                  py-1
                                  rounded-lg 
                                  border
                                  border-border 
                                  w-fit 
                                  flex 
                                  cursor-pointer 
                                  ${isSelected ? "bg-background-200" : "hover:bg-accent-background-hovered"}
                                `}
                                onClick={() => {
                                  if (isSelected) {
                                    arrayHelpers.remove(ind)
                                  } else {
                                    arrayHelpers.push(ccPair.cc_pair_id)
                                  }
                                }}
                              >
                                <div className="my-auto">{ccPair.name}</div>
                              </div>
                            )
                          })}
                        </div>

                        {props.touched.cc_pair_ids &&
                          props.errors.cc_pair_ids && (
                            <div className="text-sm text-destructive">
                              {props.errors.cc_pair_ids}
                            </div>
                          )}
                      </div>
                    )
                  }}
                />

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={props.isSubmitting}>
                    {isUpdate ? "Update" : "Create"}
                  </Button>
                </div>
              </div>
            </Form>
          )
        }}
      </Formik>
    </div>
  )
}
