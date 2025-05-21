
import React from "react";
import { cn } from "@/lib/utils";
import { Globe, Phone, Mail, MapPin } from "lucide-react";

interface BadgeProps {
  variant?: "default" | "secondary" | "outline";
  className?: string;
  children: React.ReactNode;
}

export const Badge = ({ 
  variant = "default", 
  className, 
  children 
}: BadgeProps) => {
  return (
    <span 
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold", 
        variant === "default" ? "bg-thryvance-green-light text-thryvance-green-dark" : 
        variant === "secondary" ? "bg-thryvance-blue-light text-thryvance-blue-dark" : 
        "border border-thryvance-neutral text-thryvance-neutral-dark",
        className
      )}
    >
      {children}
    </span>
  );
};

export { Globe, Phone, Mail, MapPin };
