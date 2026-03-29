import React from "react";

interface BadgeProps {
  children: React.ReactNode;
  color?: "success" | "warning" | "error" | "info";
  size?: "sm" | "md" | "lg";
}

export default function Badge({ children, color = "info", size = "md" }: BadgeProps) {
  const colorClasses = {
    success: "bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-500",
    warning: "bg-warning-50 text-warning-600 dark:bg-warning-500/15 dark:text-warning-500",
    error: "bg-error-50 text-error-600 dark:bg-error-500/15 dark:text-error-500",
    info: "bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-500",
  };

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-sm",
    lg: "px-3 py-1.5 text-base",
  };

  return (
    <span className={`inline-flex items-center font-medium rounded-full ${colorClasses[color]} ${sizeClasses[size]}`}>
      {children}
    </span>
  );
}
