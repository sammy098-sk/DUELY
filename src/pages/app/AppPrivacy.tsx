import { AppShell } from "@/components/AppShell";
import { AuthenticatedInfoPageLayout } from "@/components/AuthenticatedInfoPageLayout";
import { PrivacyContent } from "@/components/contents/PrivacyContent";

export default function AppPrivacyPage() {
  return (
    <AppShell pageTitle="Privacy Policy">
      <AuthenticatedInfoPageLayout>
        <PrivacyContent />
      </AuthenticatedInfoPageLayout>
    </AppShell>
  );
}
