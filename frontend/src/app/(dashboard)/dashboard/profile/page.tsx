"use client";

import { toast } from "sonner";
import { Save } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useProfileStore } from "@/store/domain/profile-store";
import { getApiErrorMessage } from "@/lib/api/utils";

export default function ProfilePage() {
  const profile = useProfileStore((s) => s.profile);
  const updateProfile = useProfileStore((s) => s.updateProfile);
  const saveProfile = useProfileStore((s) => s.saveProfile);

  const initials = profile.name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Profile"
        description="Your account details for the Vellum LMS admin console."
      />
      <Card className="max-w-xl shadow-none">
        <CardHeader className="flex flex-row items-center gap-3">
          <Avatar size="lg">
            <AvatarFallback>{initials || "AD"}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-base">{profile.name}</CardTitle>
            <p className="text-xs text-muted-foreground">{profile.role}</p>
          </div>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          {(
            [
              ["name", "Full name"],
              ["email", "Email"],
              ["phone", "Phone"],
              ["role", "Role"],
              ["institution", "Institution"],
            ] as const
          ).map(([key, label]) => (
            <div
              key={key}
              className={`space-y-1.5 ${key === "institution" ? "sm:col-span-2" : ""}`}
            >
              <Label className="text-xs">{label}</Label>
              <Input
                value={profile[key]}
                onChange={(e) => updateProfile({ [key]: e.target.value })}
              />
            </div>
          ))}

          <div className="space-y-3 sm:col-span-2">
            <Label className="text-xs">Notification preferences</Label>
            <div className="flex flex-col gap-2">
              {(
                [
                  ["notifyFees", "Fee overdue alerts"],
                  ["notifyStock", "Low stock alerts"],
                  ["notifyAbsences", "Absence notices"],
                ] as const
              ).map(([key, label]) => (
                <label key={key} className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={profile[key]}
                    onCheckedChange={(v) =>
                      updateProfile({ [key]: Boolean(v) })
                    }
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>

          <div className="sm:col-span-2">
            <Button
              size="sm"
              onClick={async () => {
                try {
                  await saveProfile();
                  toast.success("Profile saved");
                } catch (err) {
                  toast.error(getApiErrorMessage(err, "Could not save profile"));
                }
              }}
            >
              <Save /> Save profile
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
