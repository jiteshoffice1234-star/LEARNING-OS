import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  /** Changing this key resets the boundary (App passes the current page id). */
  resetKey?: string;
  onNavigate?: (page: string) => void;
}

interface State {
  error: Error | null;
}

/**
 * Page-level safety net: a render error in one page shows a recover card
 * instead of a blank white screen. The rest of the app (sidebar, data) stays
 * intact, and the user can go home or reload without losing localStorage.
 */
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[learning-os] Page crashed:', error, info.componentStack);
  }

  componentDidUpdate(prev: Props) {
    if (prev.resetKey !== this.props.resetKey && this.state.error) {
      this.setState({ error: null });
    }
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div className="flex items-center justify-center min-h-[70vh] p-6" role="alert">
        <div className="glass-card w-full max-w-md rounded-xl p-6 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-danger/15">
            <AlertTriangle className="h-6 w-6 text-danger" />
          </div>
          <h2 className="text-lg font-semibold text-text">This page hit a snag</h2>
          <p className="mt-2 text-sm text-muted">
            Your saved data is safe. Reload the page, or go back to the dashboard and try again.
          </p>
          <div className="mt-5 flex gap-2">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-elevated px-4 py-2.5 text-sm font-medium text-text transition-colors hover:bg-elevated/80"
            >
              <RotateCcw className="h-4 w-4" /> Reload
            </button>
            <button
              type="button"
              onClick={() => {
                this.setState({ error: null });
                this.props.onNavigate?.('dashboard');
              }}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary/90"
            >
              <Home className="h-4 w-4" /> Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }
}
