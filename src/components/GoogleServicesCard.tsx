import { Bot, Cloud, Radio, ShieldCheck } from "lucide-react";
import { useGoogleServiceStatus } from "@/hooks/useGoogleServiceStatus";
import { cn } from "@/lib/utils";

const GoogleServicesCard = () => {
  const { data, isLoading, isError } = useGoogleServiceStatus();

  const items = [
    {
      id: "rest",
      label: "Gemini chat",
      ready: Boolean(data?.restConfigured),
      icon: Bot,
      detail: data?.chatModel ?? "Pending",
    },
    {
      id: "live",
      label: "Gemini Live",
      ready: Boolean(data?.liveConfigured),
      icon: Radio,
      detail: data?.liveModel ?? "Pending",
    },
    {
      id: "deploy",
      label: "Google Cloud",
      ready: true,
      icon: Cloud,
      detail: data?.deploymentTargets.join(" / ") ?? "Cloud Run / Cloud Build",
    },
  ];

  return (
    <section
      className="container pt-6"
      aria-labelledby="google-services-heading"
      data-testid="google-services-card"
    >
      <div className="rounded-3xl border border-border bg-card/90 p-6 shadow-soft backdrop-blur">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
              Google services
            </div>
            <h2 id="google-services-heading" className="mt-3 font-display text-2xl font-bold">
              Production-backed assistant stack
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              VoteSetu runs in local demo mode and upgrades to Google Gemini plus Google Cloud
              when deployment secrets are configured.
            </p>
          </div>
          <div
            className={cn(
              "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider",
              isError
                ? "bg-destructive/10 text-destructive"
                : data?.restConfigured
                  ? "bg-india-green/10 text-india-green"
                  : "bg-amber-500/10 text-amber-700",
            )}
          >
            {isLoading
              ? "Checking services"
              : data?.restConfigured
                ? "Google Gemini connected"
                : isError
                  ? "Status unavailable"
                  : "Demo mode with Google-ready backend"}
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className={cn(
                  "rounded-2xl border p-4 transition-smooth",
                  item.ready
                    ? "border-primary/20 bg-primary/5"
                    : "border-border bg-secondary/40",
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-xl",
                      item.ready
                        ? "bg-primary/15 text-primary"
                        : "bg-secondary text-muted-foreground",
                    )}
                  >
                    <Icon className="h-5 w-5" aria-hidden />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.detail}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 text-xs text-muted-foreground">
          Deployment notes and Google surface mapping:{" "}
          <a
            href={data?.docsPath ?? "/docs/GOOGLE_CLOUD.md"}
            className="font-medium text-accent underline-offset-4 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Google integration guide
          </a>
        </div>
      </div>
    </section>
  );
};

export default GoogleServicesCard;
