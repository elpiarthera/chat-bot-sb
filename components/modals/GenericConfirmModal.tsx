import React from "react"
import { Modal } from "@/components/Modal"
import { Button } from "@/components/ui/button"

interface GenericConfirmModalProps {
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  onClose: () => void
}

export const GenericConfirmModal: React.FC<GenericConfirmModalProps> = ({
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onClose
}) => {
  return (
    <Modal onOutsideClick={onClose}>
      <div className="p-6">
        <h2 className="mb-4 text-xl font-semibold">{title}</h2>
        <p className="mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            {cancelText}
          </Button>
          <Button
            variant="default"
            onClick={() => {
              onConfirm()
              onClose()
            }}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
