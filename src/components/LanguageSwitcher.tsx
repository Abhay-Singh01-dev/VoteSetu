import { Check, Globe } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useT } from "@/i18n/LanguageProvider";
import { cn } from "@/lib/utils";

interface Props {
  variant?: "default" | "compact";
}

const LanguageSwitcher = ({ variant = "default" }: Props) => {
  const { lang, language, setLang, languages, t } = useT();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size={variant === "compact" ? "sm" : "default"}
          className="gap-2"
          aria-label={t("lang.switcher")}
        >
          <Globe className="h-4 w-4" aria-hidden />
          <span className="font-medium">{language.native}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="max-h-[70vh] w-64 overflow-y-auto"
      >
        <DropdownMenuLabel className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
          <Globe className="h-3.5 w-3.5" aria-hidden />
          {t("lang.switcher")}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {languages.map((l) => {
          const active = l.code === lang;
          return (
            <DropdownMenuItem
              key={l.code}
              onSelect={() => setLang(l.code)}
              className={cn("flex items-center justify-between gap-3 py-2.5", active && "bg-secondary")}
              aria-checked={active}
              role="menuitemradio"
            >
              <div className="flex flex-col">
                <span
                  className="text-sm font-semibold leading-tight"
                  dir={l.dir ?? "ltr"}
                >
                  {l.native}
                </span>
                <span className="text-[11px] text-muted-foreground">{l.name}</span>
              </div>
              {active && <Check className="h-4 w-4 text-primary" aria-hidden />}
            </DropdownMenuItem>
          );
        })}
        <DropdownMenuSeparator />
        <p className="px-2 py-2 text-[11px] leading-snug text-muted-foreground">
          {t("lang.notice")}
        </p>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;
