"use client";

import { ReactNode } from "react";
import { X } from "lucide-react";
import {
  ADMIN_MODAL,
  ADMIN_FORM,
  ADMIN_PASSWORD,
  ADMIN_INDICATOR,
} from "@/styles";

interface AdminFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  formType: string;
  editingItem: any;
  formData: any;
  setFormData: (data: any) => void;
  onSubmit: (e: React.FormEvent) => void;
  children: ReactNode;
  accentColor: { from: string; to: string };
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
}

export function AdminFormModal({
  isOpen,
  onClose,
  formType,
  editingItem,
  formData,
  setFormData,
  onSubmit,
  children,
  accentColor,
  showPassword,
  setShowPassword,
}: AdminFormModalProps) {
  if (!isOpen) return null;

  const ac = accentColor;
  const inputCls = ADMIN_FORM.inputBase;

  return (
    <div style={ADMIN_MODAL.overlay}>
      <div style={ADMIN_MODAL.container}>
        <div style={ADMIN_MODAL.header}>
          <div>
            <div style={ADMIN_INDICATOR.dot(`linear-gradient(135deg,${ac.from},${ac.to})`)} />
            <span style={ADMIN_FORM.labelLarge}>
              {editingItem ? `Edit ${formType}` : `New ${formType}`}
            </span>
          </div>
          <button onClick={onClose} style={ADMIN_MODAL.closeBtn}>
            <X size={16} color="#64748b" />
          </button>
        </div>

        <form onSubmit={onSubmit} style={ADMIN_FORM.group}>
          {children}
        </form>
      </div>
    </div>
  );
}

// Helper components/Function
export function FormField({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  required = false,
  isPassword = false,
  showPasswordToggle = false,
  onTogglePassword,
  hint,
  isRelative = false,
  inputCls = ADMIN_FORM.inputBase,
}: {
  label: string;
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  isPassword?: boolean;
  showPasswordToggle?: boolean;
  onTogglePassword?: () => void;
  hint?: string;
  isRelative?: boolean;
  inputCls?: any;
}) {
  return (
    <div style={isRelative ? ADMIN_PASSWORD.container : undefined}>
      <label style={ADMIN_FORM.label}>{label}</label>
      <input
        type={isPassword && !showPasswordToggle ? "password" : type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        style={inputCls}
      />
      {showPasswordToggle && (
        <button
          type="button"
          onClick={onTogglePassword}
          style={ADMIN_PASSWORD.toggleBtn}
        >
          {showPasswordToggle ? "Hide" : "Show"}
        </button>
      )}
      {hint && <p style={ADMIN_PASSWORD.hint}>{hint}</p>}
    </div>
  );
}

export function FormSelect({
  label,
  value,
  onChange,
  options,
  required = false,
  inputCls = ADMIN_FORM.inputBase,
}: {
  label: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: { value: string; label: string }[];
  required?: boolean;
  inputCls?: any;
}) {
  return (
    <div>
      <label style={ADMIN_FORM.label}>{label}</label>
      <select
        value={value}
        onChange={onChange}
        required={required}
        style={{ ...inputCls, cursor: "pointer" }}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function FormTextarea({
  label,
  placeholder,
  value,
  onChange,
  required = false,
  rows = 3,
  inputCls = ADMIN_FORM.inputBase,
}: {
  label: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  required?: boolean;
  rows?: number;
  inputCls?: any;
}) {
  return (
    <div>
      <label style={ADMIN_FORM.label}>{label}</label>
      <textarea
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        rows={rows}
        style={{ ...inputCls, resize: "vertical" }}
      />
    </div>
  );
}

export function FormButtons({
  submitLabel = "Create",
  accentColor,
  onCancel,
  accentFrom,
  accentTo,
}: {
  submitLabel?: string;
  accentColor?: { from: string; to: string };
  onCancel?: () => void;
  accentFrom?: string;
  accentTo?: string;
}) {
  return (
    <div style={ADMIN_MODAL.buttonGroup}>
      <button
        type="submit"
        style={ADMIN_MODAL.submitBtn(accentFrom || accentColor?.from || "#6366f1", accentTo || accentColor?.to || "#8b5cf6")}
      >
        {submitLabel}
      </button>
      <button
        type="button"
        onClick={onCancel}
        style={ADMIN_MODAL.cancelBtn}
      >
        Cancel
      </button>
    </div>
  );
}
