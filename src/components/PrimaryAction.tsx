import { useMemo } from "react";
import { ChevronRight, ClipboardList, CheckCircle2, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUser } from "@/context/UserContext";
import { getUserInsights } from "@/lib/userInsights";
import SpeakButton from "./SpeakButton";

interface PrimaryActionProps {
  onAction: () => void;
}

const PrimaryAction = ({ onAction }: PrimaryActionProps) => {
  const { user } = useUser();
  const insights = useMemo(() => getUserInsights(user), [user]);

  let icon = null;
  let label = "";

  switch (insights.nextStepId) {
    case "eligibility":
      label = "Check age";
      icon = <CheckCircle2 className="h-5 w-5 md:h-6 md:w-6 flex-shrink-0" />;
      break;
    case "registration":
      label = "Apply to vote";
      icon = <ClipboardList className="h-5 w-5 md:h-6 md:w-6 flex-shrink-0" />;
      break;
    case "epic":
      label = "Find ID card";
      icon = <ClipboardList className="h-5 w-5 md:h-6 md:w-6 flex-shrink-0" />;
      break;
    case "booth":
    default:
      label = "Find where to vote";
      icon = <Navigation className="h-5 w-5 md:h-6 md:w-6 flex-shrink-0" />;
      break;
  }

  const voiceText = `Your next step is to ${label.toLowerCase()}. Click the big button to start.`;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center gap-2">
        <SpeakButton text={voiceText} />
        <span className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          What to do next
        </span>
      </div>
      <Button
        size="lg"
        variant="hero"
        onClick={onAction}
        className="w-full max-w-sm rounded-2xl py-8 text-xl shadow-[0_0_40px_-10px_hsl(var(--primary))] hover:scale-105 transition-all outline-none ring-offset-background focus-visible:ring-4 focus-visible:ring-ring"
      >
        <span className="flex items-center gap-3">
          {icon}
          {label}
        </span>
        <ChevronRight className="ml-2 h-6 w-6" aria-hidden="true" />
      </Button>
    </div>
  );
};

export default PrimaryAction;
