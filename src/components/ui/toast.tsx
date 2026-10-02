import * as React from "react";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";
import { cn, focusRing } from "./cn";

export type ToastVariant = "success" | "info" | "error";

const variantIcon = {
  success: CheckCircle2,
  info: Info,
  error: AlertCircle,
} as const;

const variantColor = {
  success: "text-success",
  info: "text-accent-ink",
  error: "text-destructive",
} as const;

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastProps {
  title: string;
  description?: string;
  variant?: ToastVariant;
  action?: ToastAction;
  onClose?: () => void;
  className?: string;
}

export function Toast({
  title,
  description,
  variant = "info",
  action,
  onClose,
  className,
}: ToastProps): React.ReactElement {
  const Icon = variantIcon[variant];
  return (
    <div
      role={variant === "error" ? "alert" : "status"}
      className={cn(
        "anim-fade-in flex w-full items-start gap-3 rounded-card border border-hairline bg-surface px-4 py-3",
        className
      )}
    >
      <Icon aria-hidden="true" className={cn("mt-0.5 size-5 shrink-0", variantColor[variant])} />
      <div className="min-w-0 flex-1">
        <p className="text-[17px] leading-snug">{title}</p>
        {description ? (
          <p className="mt-0.5 text-[15px] italic text-muted">{description}</p>
        ) : null}
        {action ? (
          <button
            type="button"
            onClick={action.onClick}
            className={cn(
              "mt-2 inline-flex min-h-[44px] cursor-pointer items-center text-[16px] text-accent-ink underline underline-offset-4 hover:opacity-80",
              focusRing
            )}
          >
            {action.label}
          </button>
        ) : null}
      </div>
      {onClose ? (
        <button
          type="button"
          aria-label="Dismiss notification"
          onClick={onClose}
          className={cn(
            "-mr-1 -mt-1 inline-flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full text-muted transition-colors duration-200 ease-out hover:text-ink",
            focusRing
          )}
        >
          <X aria-hidden="true" className="size-5" />
        </button>
      ) : null}
    </div>
  );
}

export interface ToastStackProps {
  children: React.ReactNode;
  className?: string;
}

/** Fixed bottom stack; items carry their own live-region roles. */
export function ToastStack({ children, className }: ToastStackProps): React.ReactElement {
  return (
    <div
      aria-hidden={false}
      className={cn(
        "fixed bottom-4 left-1/2 z-[var(--z-toast)] flex w-full max-w-md -translate-x-1/2 flex-col gap-2 px-4",
        className
      )}
    >
      {children}
    </div>
  );
}
