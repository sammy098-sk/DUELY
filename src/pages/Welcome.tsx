import { AppShell } from "@/components/AppShell";
import { DuelyHero } from "@/components/DuelyHero";

export default function WelcomePage() {
  return (
    <AppShell pageTitle="Welcome">
      <DuelyHero context="welcome" />
    </AppShell>
  );
}
