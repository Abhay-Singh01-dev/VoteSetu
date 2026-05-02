/**
 * UserProfileSetup — lightweight onboarding panel.
 *
 * Lets the user set age, registration, and EPIC status so the system
 * can personalise guidance immediately. Permanently dismissable.
 * Renders inside the page — not a modal — to avoid blocking content.
 */

import { useState } from "react";
import { useUser } from "@/context/UserContext";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { User, ChevronDown, ChevronUp, RotateCcw } from "lucide-react";

const UserProfileSetup = () => {
  const { user, setUser, resetUser } = useUser();
  const [expanded, setExpanded] = useState(false);

  // Local form state
  const [ageInput, setAgeInput] = useState(
    user.age !== undefined ? String(user.age) : "",
  );

  const hasAnyState =
    user.isRegistered !== undefined ||
    user.hasEpic !== undefined ||
    user.age !== undefined;

  const handleSave = () => {
    const parsed = parseInt(ageInput, 10);
    setUser({
      age: !isNaN(parsed) && parsed > 0 ? parsed : undefined,
    });
    setExpanded(false);
  };

  return (
    <div
      className={cn(
        "border-b border-border/60 bg-card/80 backdrop-blur-sm transition-all duration-300",
        expanded ? "shadow-soft" : "",
      )}
    >
      <div className="container">
        <button
          onClick={() => setExpanded((v) => !v)}
          className="flex w-full items-center justify-between gap-3 py-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          aria-expanded={expanded}
          aria-controls="user-profile-panel"
        >
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-primary" aria-hidden />
            <span className="font-medium text-foreground">
              {hasAnyState ? "Your profile is set" : "Set up your voter profile"}
            </span>
            {hasAnyState && (
              <span className="rounded-full bg-india-green/10 px-2 py-0.5 text-xs font-semibold text-india-green">
                Personalised
              </span>
            )}
          </div>
          {expanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" aria-hidden />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" aria-hidden />
          )}
        </button>

        {expanded && (
          <div
            id="user-profile-panel"
            className="animate-fade-in-up pb-5"
          >
            <p className="mb-4 text-sm text-muted-foreground">
              Help us personalise your journey. All answers stay in your browser only.
            </p>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {/* Age */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="profile-age" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Your age
                </label>
                <input
                  id="profile-age"
                  type="number"
                  min={1}
                  max={120}
                  value={ageInput}
                  onChange={(e) => setAgeInput(e.target.value)}
                  placeholder="e.g. 24"
                  className="rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              {/* Registered */}
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Registered as voter?
                </span>
                <div className="flex gap-2">
                  {[true, false].map((val) => (
                    <button
                      key={String(val)}
                      onClick={() => setUser({ isRegistered: val })}
                      className={cn(
                        "flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-smooth",
                        user.isRegistered === val
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-background text-muted-foreground hover:border-primary/50",
                      )}
                    >
                      {val ? "Yes" : "No"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Has EPIC */}
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Have EPIC / Voter ID?
                </span>
                <div className="flex gap-2">
                  {[true, false].map((val) => (
                    <button
                      key={String(val)}
                      onClick={() => setUser({ hasEpic: val })}
                      className={cn(
                        "flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-smooth",
                        user.hasEpic === val
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-background text-muted-foreground hover:border-primary/50",
                      )}
                    >
                      {val ? "Yes" : "No"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Save / Reset */}
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Actions
                </span>
                <div className="flex gap-2">
                  <Button size="sm" variant="hero" className="flex-1" onClick={handleSave}>
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      resetUser();
                      setAgeInput("");
                      setExpanded(false);
                    }}
                    aria-label="Reset voter profile"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfileSetup;
