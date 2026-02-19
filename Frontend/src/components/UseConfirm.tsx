import { useState } from "react";

export function useConfirm() {
  const [open, setOpen] = useState<boolean>(false);
  const [resolver, setResolver] =
    useState<((value: boolean) => void) | null>(null);

  const confirm = () =>
    new Promise<boolean>((resolve) => {
      setResolver(() => resolve);
      setOpen(true);
    });

  const handleResolve = (value: boolean) => {
    resolver?.(value);
    setResolver(null);
    setOpen(false);
  };

  return { open, confirm, handleResolve };
}
