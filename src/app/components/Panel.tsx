import type { ReactNode } from "react";

interface PanelProps {
  eyebrow?: string;
  title: string;
  description?: string;
  aside?: ReactNode;
  footer?: ReactNode;
  className?: string;
  bodyClassName?: string;
  children: ReactNode;
}

function joinClassNames(...classNames: Array<string | undefined>): string {
  return classNames.filter(Boolean).join(" ");
}

export default function Panel({
  eyebrow,
  title,
  description,
  aside,
  footer,
  className,
  bodyClassName,
  children,
}: PanelProps) {
  return (
    <section className={joinClassNames("panel", className)}>
      <header className="panel__header">
        <div>
          {eyebrow ? <p className="panel__eyebrow">{eyebrow}</p> : null}
          <div className="panel__title-row">
            <h2 className="panel__title">{title}</h2>
            {aside ? <div className="panel__aside">{aside}</div> : null}
          </div>
          {description ? <p className="panel__description">{description}</p> : null}
        </div>
      </header>

      <div className={joinClassNames("panel__body", bodyClassName)}>{children}</div>

      {footer ? <footer className="panel__footer">{footer}</footer> : null}
    </section>
  );
}
