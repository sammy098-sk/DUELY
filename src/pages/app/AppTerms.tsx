import { AppShell } from "@/components/AppShell";
import { AuthenticatedInfoPageLayout } from "@/components/AuthenticatedInfoPageLayout";
import { TermsContent } from "@/components/contents/TermsContent";

export default function AppTermsPage() {
  return (
    <AppShell pageTitle="Terms of Use">
      <AuthenticatedInfoPageLayout>
        <TermsContent />
      </AuthenticatedInfoPageLayout>
    </AppShell>
  );
}
