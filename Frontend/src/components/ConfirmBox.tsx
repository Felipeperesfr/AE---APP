import { useEffect } from "react";
import ReactDOM from "react-dom";

type ConfirmModalProps = {
  open: boolean;
  title?: string;
  message?: string;
  onResolve: (value: boolean) => void;
};

export default function ConfirmBox({
  open,
  title = "Are you sure?",
  message = "This action cannot be undone.",
  onResolve,
}: ConfirmModalProps) {

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onResolve(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onResolve]);

  if (!open) return null;

  return ReactDOM.createPortal(
    <div className="confirm-overlay" onClick={() => onResolve(false)}>
      <div className="confirm-box" onClick={(e) => e.stopPropagation()}>
        <h3>{title}</h3>
        <p>{message}</p>

        <div className="confirm-buttons">
          <button onClick={() => onResolve(true)}>Confirm</button>
          <button onClick={() => onResolve(false)}>Cancel</button>
        </div>
      </div>
    </div>,
    document.body
  );
}
