import { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[Uncaught Exception]", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-screen w-screen flex-col items-center justify-center bg-background p-6 text-center select-none">
          <div className="mx-auto max-w-md space-y-5 rounded-2xl border border-border bg-card p-8 shadow-2xl">
            <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
              <AlertTriangle className="size-6" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-foreground">Something went wrong</h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                An unexpected error occurred while loading this page. Our team has been notified.
              </p>
              {this.state.error?.message && (
                <div className="mt-3 rounded-lg border border-destructive/20 bg-destructive/5 p-3 font-mono text-[11px] text-destructive text-left overflow-auto max-h-32">
                  {this.state.error.message}
                </div>
              )}
            </div>

            <Button
              onClick={() => window.location.reload()}
              size="sm"
              className="w-full gap-2 font-bold text-xs"
            >
              <RefreshCw className="size-3.5" />
              <span>Reload Application</span>
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
