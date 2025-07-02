import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"; // Adjust path if necessary
import { Button } from "@/components/ui/button"; // Adjust path if necessary

// Define the props for your ConfirmationModal component
interface ConfirmationModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  icon?: React.ElementType; // For the icon component (e.g., XCircle from lucide-react)
  confirmText: string;
  confirmColor?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link"; // Matches Button variant
  onConfirm: () => void;
  warningMessage?: string;
  cancelText?: string; // Optional: allows customizing the cancel button text
}

export function ConfirmationModal({
  isOpen,
  onOpenChange,
  title,
  description,
  icon: IconComponent, // Renamed to avoid conflict with JSX intrinsic elements
  confirmText,
  confirmColor = "destructive", // Default to destructive for confirmation
  onConfirm,
  warningMessage,
  cancelText = "Cancel",
}: ConfirmationModalProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          {IconComponent && (
            <div className="flex justify-center mb-4">
              <IconComponent className="h-16 w-16 text-red-500" />{" "}
              {/* Example styling for the icon */}
            </div>
          )}
          <AlertDialogTitle className="text-center">{title}</AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            {description}
            {warningMessage && (
              <p className="mt-2 text-sm text-red-600 font-medium">
                {warningMessage}
              </p>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex flex-col sm:flex-row-reverse sm:space-x-2 sm:space-x-reverse">
          <AlertDialogAction asChild>
            <Button
              variant={confirmColor}
              onClick={onConfirm}
              className="w-full sm:w-auto"
            >
              {confirmText}
            </Button>
          </AlertDialogAction>
          <AlertDialogCancel asChild>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="w-full sm:w-auto mt-2 sm:mt-0"
            >
              {cancelText}
            </Button>
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
