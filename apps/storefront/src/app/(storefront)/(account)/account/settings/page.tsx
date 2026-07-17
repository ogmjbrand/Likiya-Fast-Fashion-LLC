import { getCurrentProfile } from "@likiya/auth/server";
import { Separator } from "@likiya/ui";

import { ProfileForm } from "./profile-form";
import { PasswordForm } from "./password-form";

export default async function AccountSettingsPage() {
  const profile = await getCurrentProfile();
  if (!profile) return null;

  return (
    <div className="max-w-md space-y-10">
      <div>
        <h1 className="font-display text-2xl font-black uppercase">Settings</h1>
      </div>

      <div className="space-y-4">
        <h2 className="font-display text-base font-black uppercase tracking-wide">Profile</h2>
        <ProfileForm profile={profile} />
      </div>

      <Separator />

      <div className="space-y-4">
        <h2 className="font-display text-base font-black uppercase tracking-wide">Password</h2>
        <PasswordForm />
      </div>
    </div>
  );
}
