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
        <h1 className="font-heading text-2xl">Settings</h1>
      </div>

      <div className="space-y-4">
        <h2 className="font-heading text-lg">Profile</h2>
        <ProfileForm profile={profile} />
      </div>

      <Separator />

      <div className="space-y-4">
        <h2 className="font-heading text-lg">Password</h2>
        <PasswordForm />
      </div>
    </div>
  );
}
