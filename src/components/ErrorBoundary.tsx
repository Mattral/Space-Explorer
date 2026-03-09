import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackMessage?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary]', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-screen bg-background flex items-center justify-center">
          <div className="info-panel rounded-xl p-8 max-w-md text-center space-y-4 animate-fade-up">
            <AlertTriangle className="h-8 w-8 text-alert mx-auto" />
            <h2 className="display-heading text-lg text-foreground">
              {this.props.fallbackMessage || 'Rendering Error'}
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              The 3D scene encountered an error. This may be due to WebGL compatibility or resource limits.
            </p>
            <p className="telemetry-label text-alert/70 break-all">
              {this.state.error?.message}
            </p>
            <button
              onClick={this.handleRetry}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-signal/40 bg-signal/10 text-signal hover:bg-signal/20 transition-all duration-200 font-mono text-xs tracking-wider uppercase"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Retry
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
