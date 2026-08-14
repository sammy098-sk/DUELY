import { useState } from "react";
import { toast } from "sonner";
import { Check, Send } from "lucide-react";
import { PublicPageLayout } from "@/components/PublicPageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error("Please fill out all fields before sending.");
      return;
    }

    setSubmitted(true);
    toast.success("Thanks — your message has been received.");
    setName("");
    setEmail("");
    setMessage("");
  }

  return (
    <PublicPageLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-serif text-foreground">
            Contact us
          </h1>
          <p className="mt-2 text-sm sm:text-base text-muted-foreground font-sans">
            Questions, feedback, or something broken? We'd love to hear from you.
          </p>
        </div>

        {submitted ? (
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-left space-y-2">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
              <Check className="size-5" />
              <span>Thanks — your message has been received.</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              We appreciate you reaching out. Our team will review your feedback and get back to you promptly.
            </p>
            <div className="pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSubmitted(false)}
                className="text-xs font-semibold"
              >
                Send another message
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-paper space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-xs font-bold label-caps">
                Name
              </Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                className="h-10 text-xs font-medium"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-bold label-caps">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="h-10 text-xs font-medium"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message" className="text-xs font-bold label-caps">
                Message
              </Label>
              <Textarea
                id="message"
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="How can we help?"
                className="text-xs leading-relaxed resize-none"
              />
            </div>

            <Button
              type="submit"
              className="w-full h-11 rounded-xl font-bold text-xs gap-2 bg-foreground text-background hover:bg-foreground/90 transition-all cursor-pointer"
            >
              <Send className="size-3.5 fill-current" />
              <span>Send message</span>
            </Button>
          </form>
        )}
      </div>
    </PublicPageLayout>
  );
}
