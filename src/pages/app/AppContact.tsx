import { AppShell } from "@/components/AppShell";
import { AuthenticatedInfoPageLayout } from "@/components/AuthenticatedInfoPageLayout";
import { ContactContent } from "@/components/contents/ContactContent";

export default function AppContactPage() {
  return (
    <AppShell pageTitle="Contact Us">
      <AuthenticatedInfoPageLayout>
        <ContactContent />
      </AuthenticatedInfoPageLayout>
    </AppShell>
  );
}
