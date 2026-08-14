import { AppShell } from "@/components/AppShell";
import { AuthenticatedInfoPageLayout } from "@/components/AuthenticatedInfoPageLayout";
import { AboutContent } from "@/components/contents/AboutContent";

export default function AppAboutPage() {
  return (
    <AppShell pageTitle="About Duely">
      <AuthenticatedInfoPageLayout>
        <AboutContent />
      </AuthenticatedInfoPageLayout>
    </AppShell>
  );
}
