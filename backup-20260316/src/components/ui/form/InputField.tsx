import React from "react";

interface InputFieldProps {
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  disabled?: boolean;
  defaultValue?: string;
  id?: string;
}

export default function InputField({
  type = "text",
  placeholder,
  value,
  onChange,
  className = "",
  disabled = false,
  defaultValue,
  id,
}: InputFieldProps) {
  return (
    <input
      id={id}
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      defaultValue={defaultValue}
      disabled={disabled}
      className={`w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-brand-400 ${className}`}
    />
  );
}
