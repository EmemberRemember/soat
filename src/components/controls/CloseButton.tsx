"use client";

import { Button } from "@/components/controls/Button";

export function CloseButtonClient({ className }: { className?: string }) {
  return (
    <Button size="small" className={className} onClick={() => window.close()}>
      닫기
    </Button>
  );
}
