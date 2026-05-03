import { BookMarked, ExternalLink } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useT } from "@/i18n/LanguageProvider";
import { cn } from "@/lib/utils";
import type { Source } from "@/data/electionData";

interface SourceListProps {
  sources?: Source[];
  label?: string;
  className?: string;
  hideLabel?: boolean;
  citationFor?: string;
}

const SourceList = ({ sources, label, className, hideLabel, citationFor }: SourceListProps) => {
  const { t } = useT();
  if (!sources?.length) return null;
  const labelText = label ?? t("sources.label");

  return (
    <div className={cn("mt-3 flex flex-wrap items-center gap-1.5", className)}>
      {!hideLabel && (
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          <BookMarked className="h-3 w-3" aria-hidden />
          {labelText}
        </span>
      )}
      {sources.map((source, index) => {
        const description =
          source.description ??
          `Official reference page used to verify this citation for ${citationFor ?? source.label}.`;
        const exactCitation = `${source.label} - ${source.href}`;

        return (
          <Tooltip key={`${source.href}-${source.label}-${index}`} delayDuration={150}>
            <TooltipTrigger asChild>
              <a
                href={source.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex max-w-full items-center gap-1 truncate rounded-full border border-border bg-background px-2 py-0.5 text-[11px] font-medium text-accent transition-smooth hover:border-accent/50 hover:bg-accent/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label={`${labelText}: ${source.label} (opens in a new tab)`}
              >
                <span className="truncate">{source.label}</span>
                <ExternalLink className="h-2.5 w-2.5 shrink-0" aria-hidden />
              </a>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-[18rem] space-y-1.5 p-3 text-left">
              <p className="text-xs font-semibold text-foreground">{source.label}</p>
              <p className="text-[11px] leading-relaxed text-muted-foreground">{description}</p>
              <div className="rounded-md bg-secondary/70 p-2">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {t("sources.citationUsed")}
                </p>
                <p className="mt-0.5 break-words text-[10px] text-foreground">{exactCitation}</p>
              </div>
              <p className="break-all font-mono text-[10px] text-accent">{source.href}</p>
              <p className="text-[10px] text-muted-foreground">{t("sources.openHint")}</p>
            </TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  );
};

export default SourceList;
