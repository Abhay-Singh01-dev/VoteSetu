import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Download, FileDown, ClipboardCheck } from "lucide-react";
import { generateVoterPlanPDF, generateBoothDayPDF } from "@/lib/pdf";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useT } from "@/i18n/LanguageProvider";
import { getLocalizedVoterJourney } from "@/i18n/content";

interface VoterPlanDialogProps {
  trigger?: React.ReactNode;
}

const VoterPlanDialog = ({ trigger }: VoterPlanDialogProps) => {
  const { t, lang } = useT();
  const localizedJourney = useMemo(() => getLocalizedVoterJourney(lang), [lang]);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [constituency, setConstituency] = useState("");
  const [pollingDate, setPollingDate] = useState("");
  const [boothInfo, setBoothInfo] = useState("");
  const [completed, setCompleted] = useState<Set<number>>(new Set());

  const toggle = (id: number) =>
    setCompleted((prev) => {
      const s = new Set(prev);
      if (s.has(id)) {
        s.delete(id);
      } else {
        s.add(id);
      }
      return s;
    });

  const handleDownload = async () => {
    try {
      await generateVoterPlanPDF({
        name,
        constituency,
        pollingDate,
        boothInfo,
        completed: Array.from(completed),
      });
      toast.success(t("plan.success"), {
        description: t("plan.successDesc"),
      });
      setOpen(false);
    } catch (e) {
      console.error(e);
      toast.error(t("plan.error"));
    }
  };

  const boothReady = pollingDate.trim().length > 0 && boothInfo.trim().length > 0;
  const boothDisabledReason = !pollingDate.trim()
    ? t("boothPdf.requireDate")
    : !boothInfo.trim()
      ? t("boothPdf.requireBooth")
      : "";

  const handleBoothDownload = async () => {
    if (!boothReady) return;
    try {
      await generateBoothDayPDF({ name, constituency, pollingDate, boothInfo });
      toast.success(t("boothPdf.success"), { description: t("boothPdf.successDesc") });
    } catch (e) {
      console.error(e);
      toast.error(t("plan.boothError"));
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="hero" size="lg">
            <FileDown />
            {t("plan.cta")}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">{t("plan.title")}</DialogTitle>
          <DialogDescription>{t("plan.description")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="vp-name">{t("plan.field.name")}</Label>
            <Input id="vp-name" value={name} onChange={(e) => setName(e.target.value)} placeholder={t("plan.field.namePh")} maxLength={100} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="vp-const">{t("plan.field.const")}</Label>
            <Input id="vp-const" value={constituency} onChange={(e) => setConstituency(e.target.value)} placeholder={t("plan.field.constPh")} maxLength={120} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label htmlFor="vp-date">{t("plan.field.date")}</Label>
              <Input id="vp-date" type="date" value={pollingDate} onChange={(e) => setPollingDate(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="vp-booth">{t("plan.field.booth")}</Label>
              <Input id="vp-booth" value={boothInfo} onChange={(e) => setBoothInfo(e.target.value)} placeholder={t("plan.field.boothPh")} maxLength={80} />
            </div>
          </div>

          {/* Booth-day quick download */}
          <div
            className={cn(
              "flex flex-col gap-2 rounded-2xl border p-4 transition-smooth sm:flex-row sm:items-center sm:justify-between",
              boothReady ? "border-india-green/40 bg-india-green/5" : "border-border bg-secondary/40",
            )}
          >
            <div className="min-w-0">
              <p className="flex items-center gap-2 text-sm font-semibold">
                <ClipboardCheck className="h-4 w-4 text-india-green" aria-hidden />
                {t("boothPdf.title")}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {boothReady ? t("boothPdf.subtitle") : boothDisabledReason}
              </p>
            </div>
            <Button
              type="button"
              variant={boothReady ? "secondary" : "outline"}
              size="sm"
              onClick={handleBoothDownload}
              disabled={!boothReady}
              aria-disabled={!boothReady}
            >
              <Download className="h-4 w-4" />
              {t("boothPdf.cta")}
            </Button>
          </div>

          <fieldset className="rounded-2xl border border-border bg-secondary/40 p-4">
            <legend className="px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t("plan.tickLegend")}
            </legend>
            <ul className="mt-2 space-y-2" role="list">
              {localizedJourney.map((s) => {
                const id = `vp-step-${s.id}`;
                const done = completed.has(s.id);
                return (
                  <li key={s.id}>
                    <label
                      htmlFor={id}
                      className={cn(
                        "flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 transition-smooth hover:bg-card",
                        done && "bg-card",
                      )}
                    >
                      <input
                        id={id}
                        type="checkbox"
                        className="h-4 w-4 cursor-pointer accent-primary"
                        checked={done}
                        onChange={() => toggle(s.id)}
                      />
                      <span className={cn("text-sm", done && "line-through text-muted-foreground")}>
                        {s.id}. {s.title}
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>
          </fieldset>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>{t("plan.cancel")}</Button>
          <Button variant="hero" onClick={handleDownload}>
            <Download /> {t("plan.download")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default VoterPlanDialog;
