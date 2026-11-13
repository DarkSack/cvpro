// Hooks y componentes juntos a propósito: Fast Refresh recarga el archivo entero.
/* eslint-disable react-refresh/only-export-components */
import { useCallback, useId, useRef, useState, type ReactNode } from "react";
import { AlertCircle, Loader2, Plus, Wand2, X } from "lucide-react";

// ══════════════════════════════════════════════════════════════════
// Campos
// ══════════════════════════════════════════════════════════════════

export interface ControlProps {
  id: string;
  "aria-invalid"?: true;
  "aria-describedby"?: string;
}

/** Etiqueta + control + error, ligados por id para los lectores de pantalla. */
export function Field({
  label,
  error,
  hint,
  action,
  className = "",
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  action?: ReactNode;
  className?: string;
  children: (p: ControlProps) => ReactNode;
}) {
  const id = useId();
  const describedBy = [error && `${id}-e`, hint && `${id}-h`].filter(Boolean).join(" ");
  return (
    <div className={className}>
      <div className="mb-1.5 flex min-h-6 items-end justify-between gap-3">
        <label htmlFor={id} className="text-sm font-medium text-ink">
          {label}
        </label>
        {action}
      </div>
      {children({
        id,
        "aria-invalid": error ? true : undefined,
        "aria-describedby": describedBy || undefined,
      })}
      {hint && (
        <p id={`${id}-h`} className="mt-1.5 text-sm text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-e`} className="mt-1.5 flex items-start gap-1.5 text-sm text-accent-ink">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          {error}
        </p>
      )}
    </div>
  );
}

/** El caso común: una línea de texto. */
export function TextField({
  label,
  value,
  onChange,
  error,
  hint,
  type = "text",
  placeholder,
  autoComplete,
  className,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  hint?: string;
  type?: "text" | "email" | "tel" | "url" | "month";
  placeholder?: string;
  autoComplete?: string;
  className?: string;
}) {
  return (
    <Field label={label} error={error} hint={hint} className={className}>
      {(p) => (
        <input
          {...p}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className="field"
        />
      )}
    </Field>
  );
}

// ══════════════════════════════════════════════════════════════════
// Botones
// ══════════════════════════════════════════════════════════════════

export function ImproveButton({ onClick, busy }: { onClick: () => void; busy: boolean }) {
  return (
    <button type="button" onClick={onClick} disabled={busy} className="bracket bracket-quiet -mr-3 !min-h-9 !px-3">
      {busy ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
      ) : (
        <Wand2 className="h-3.5 w-3.5" aria-hidden />
      )}
      {busy ? "Mejorando…" : "Mejorar con IA"}
    </button>
  );
}

export function AddButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button type="button" onClick={onClick} className="bracket w-full border-dashed sm:w-auto">
      <Plus className="h-4 w-4" aria-hidden />
      {label}
    </button>
  );
}

/** Un puesto, estudio, idioma…: grupo con su título y su botón de quitar. */
export function Entry({
  title,
  onRemove,
  children,
}: {
  title: string;
  onRemove?: () => void;
  children: ReactNode;
}) {
  return (
    <fieldset className="border-t border-line-strong pt-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <legend className="meta float-left !text-ink">{title}</legend>
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="bracket bracket-quiet -mr-3 !min-h-9 !px-3"
            aria-label={`Quitar ${title.toLowerCase()}`}
          >
            <X className="h-3.5 w-3.5" aria-hidden />
            Quitar
          </button>
        )}
      </div>
      <div className="clear-both space-y-4">{children}</div>
    </fieldset>
  );
}

// ══════════════════════════════════════════════════════════════════
// Aviso (toast) y confirmación
// ══════════════════════════════════════════════════════════════════

export type Notice = { text: string; tone: "ok" | "error" } | null;

/** Un aviso a la vez; se anuncia a los lectores de pantalla y se va solo. */
export function useNotice() {
  const [notice, setNotice] = useState<Notice>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const notify = useCallback((text: string, tone: "ok" | "error" = "ok") => {
    clearTimeout(timer.current);
    setNotice({ text, tone });
    timer.current = setTimeout(() => setNotice(null), tone === "error" ? 7000 : 3500);
  }, []);
  const view = (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-4 bottom-24 z-50 flex justify-center lg:bottom-6 print:hidden"
    >
      {notice && (
        <p
          className={`pointer-events-auto flex max-w-md items-start gap-2 border bg-raised px-4 py-3 text-sm shadow-[0_12px_32px_-12px_rgb(0_0_0/0.6)] ${
            notice.tone === "error" ? "border-accent text-ink" : "border-line-strong text-ink"
          }`}
        >
          {notice.tone === "error" && (
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-accent-ink" aria-hidden />
          )}
          {notice.text}
          <button
            type="button"
            onClick={() => setNotice(null)}
            className="-my-1 -mr-2 ml-1 p-1 text-muted hover:text-ink"
            aria-label="Cerrar aviso"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </p>
      )}
    </div>
  );
  return { notify, view };
}

interface ConfirmOptions {
  title: string;
  text: string;
  confirm: string;
}

/** Diálogo nativo: atrapa el foco, Esc cancela y devuelve el foco al cerrar. */
export function useConfirm() {
  const ref = useRef<HTMLDialogElement>(null);
  const [opts, setOpts] = useState<ConfirmOptions | null>(null);
  const resolver = useRef<(ok: boolean) => void>(undefined);

  const confirm = useCallback((o: ConfirmOptions) => {
    setOpts(o);
    requestAnimationFrame(() => {
      if (!ref.current) return;
      ref.current.returnValue = "";
      ref.current.showModal();
    });
    return new Promise<boolean>((resolve) => (resolver.current = resolve));
  }, []);

  const view = (
    <dialog
      ref={ref}
      aria-labelledby="confirm-title"
      aria-describedby="confirm-text"
      onClose={() => resolver.current?.(ref.current?.returnValue === "ok")}
      className="w-[min(28rem,calc(100vw-2rem))] border border-line-strong bg-raised p-0 text-ink shadow-[0_24px_64px_-16px_rgb(0_0_0/0.7)]"
    >
      <form method="dialog" className="p-6">
        <h2 id="confirm-title" className="display text-3xl">
          {opts?.title}
        </h2>
        <p id="confirm-text" className="mt-3 text-muted">
          {opts?.text}
        </p>
        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <button value="cancel" className="bracket" autoFocus>
            Cancelar
          </button>
          <button value="ok" className="bracket bracket-solid">
            {opts?.confirm}
          </button>
        </div>
      </form>
    </dialog>
  );
  return { confirm, view };
}
