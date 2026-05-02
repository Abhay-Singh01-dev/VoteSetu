/**
 * UserProfileDialog — profile setup in a modal dialog.
 * 
 * Lets the user set age, registration, and EPIC status.
 * Can be triggered manually or opened automatically.
 */

import { useState, useEffect } from "react";
import { useUser } from "@/context/UserContext";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, RotateCcw, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface UserProfileDialogProps {
  trigger?: React.ReactNode;
  autoOpen?: boolean;
}

const UserProfileDialog = ({ trigger, autoOpen = false }: UserProfileDialogProps) => {
  const { user, setUser, resetUser } = useUser();
  const [open, setOpen] = useState(false);
  
  // Local form state
  const [ageInput, setAgeInput] = useState(
    user.age !== undefined ? String(user.age) : ""
  );

  const hasAnyState =
    user.isRegistered !== undefined ||
    user.hasEpic !== undefined ||
    user.age !== undefined;

  // Auto-open logic: if autoOpen is true and user hasn't set anything yet
  useEffect(() => {
    if (autoOpen && !hasAnyState) {
      // Check session storage to only auto-open once per session
      const hasAutoOpened = sessionStorage.getItem("votesetu.profile_auto_opened");
      if (!hasAutoOpened) {
        setOpen(true);
        sessionStorage.setItem("votesetu.profile_auto_opened", "true");
      }
    }
  }, [autoOpen, hasAnyState]);

  const handleSave = () => {
    const parsed = parseInt(ageInput, 10);
    setUser({
      age: !isNaN(parsed) && parsed > 0 ? parsed : undefined,
    });
    setOpen(false);
  };

  const clearProfile = () => {
    resetUser();
    setAgeInput("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="icon" className="rounded-full">
            <User className="h-5 w-5" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Set up your voter profile
          </DialogTitle>
          <DialogDescription>
            Help us personalise your journey. All answers stay in your browser only.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-6 py-4">
          {/* Age Group */}
          <div className="grid gap-2">
            <Label htmlFor="diag-age" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Your Age
            </Label>
            <Input
              id="diag-age"
              type="number"
              min={1}
              max={120}
              value={ageInput}
              onChange={(e) => setAgeInput(e.target.value)}
              placeholder="e.g. 24"
              className="col-span-3"
            />
          </div>

          {/* Registration Check */}
          <div className="grid gap-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Registered as a voter?
            </Label>
            <div className="flex gap-2">
              {[true, false].map((val) => (
                <Button
                  key={String(val)}
                  type="button"
                  variant={user.isRegistered === val ? "hero" : "outline"}
                  className="flex-1"
                  onClick={() => setUser({ isRegistered: val })}
                >
                  {val ? "Yes" : "No"}
                </Button>
              ))}
            </div>
          </div>

          {/* EPIC Check */}
          <div className="grid gap-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Have EPIC / Voter ID?
            </Label>
            <div className="flex gap-2">
              {[true, false].map((val) => (
                <Button
                  key={String(val)}
                  type="button"
                  variant={user.hasEpic === val ? "hero" : "outline"}
                  className="flex-1"
                  onClick={() => setUser({ hasEpic: val })}
                >
                  {val ? "Yes" : "No"}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-row justify-between sm:justify-between items-center sm:gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={clearProfile}
            className="text-muted-foreground hover:text-destructive"
          >
            <RotateCcw className="h-3.5 w-3.5 mr-2" />
            Reset
          </Button>
          <Button type="button" onClick={handleSave} className="bg-gradient-hero">
            <Check className="h-4 w-4 mr-2" />
            Apply Personalisation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UserProfileDialog;
