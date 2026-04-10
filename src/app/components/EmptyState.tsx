import type { ReactNode } from "react";

type EmptyStateTone = "neutral" | "info" | "warning" | "danger" | "success";

interface EmptyStateProps {
  title: string;
  description: string;
  tone?: EmptyStateTone;
  footer?: ReactNode;
}

function joinClassNames(...classNames: Array<string | undefined>): string {
  return classNames.filter(Boolean).join(" ");
}

export default function EmptyState({
  title,
  description,
  tone = "neutral",
  footer,
}: EmptyStateProps) {
  return (
    <div className={joinClassNames("empty-state", `empty-state--${tone}`)}>
      <div className="empty-state__content">
        <p className="empty-state__eyebrow">Estado</p>
        <h3 className="empty-state__title">{title}</h3>
        <p className="empty-state__description">{description}</p>
      </div>

      {footer ? <div className="empty-state__footer">{footer}</div> : null}
    </div>
  );
}
