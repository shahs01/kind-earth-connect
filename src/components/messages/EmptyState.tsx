
import React from "react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

const EmptyState = ({
  icon,
  title,
  description,
  actionLabel,
  onAction
}: EmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center h-64 p-6 text-center">
      <div className="text-gray-300 mb-4">{icon}</div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 mb-4">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} variant="outline">{actionLabel}</Button>
      )}
    </div>
  );
};

export default EmptyState;
