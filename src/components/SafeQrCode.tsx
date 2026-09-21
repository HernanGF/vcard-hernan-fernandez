import { Component, ReactNode, ErrorInfo } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Globe, AlertCircle } from 'lucide-react';

interface SafeQrCodeProps {
  value: string;
  size?: number;
  fgColor?: string;
  bgColor?: string;
  className?: string;
}

interface State {
  hasError: boolean;
}

export class SafeQrCode extends Component<SafeQrCodeProps, State> {
  constructor(props: SafeQrCodeProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('SafeQrCode render error caught:', error, errorInfo);
  }

  componentDidUpdate(prevProps: SafeQrCodeProps) {
    if (prevProps.value !== this.props.value && this.state.hasError) {
      this.setState({ hasError: false });
    }
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div 
          className="flex flex-col items-center justify-center p-4 bg-neutral-900 rounded-2xl border border-amber-500/40 text-center"
          style={{ width: this.props.size || 220, height: this.props.size || 220 }}
        >
          <AlertCircle className="w-8 h-8 text-amber-400 mb-2" />
          <span className="text-xs text-stone-200 font-semibold mb-2">Código QR</span>
          <a
            href={this.props.value}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-lg bg-amber-500 text-neutral-950 text-[11px] font-bold flex items-center gap-1"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Abrir Enlace Web</span>
          </a>
        </div>
      );
    }

    return (
      <QRCodeSVG
        value={this.props.value || 'https://guatequemanduca.com'}
        size={this.props.size || 220}
        level="M"
        fgColor={this.props.fgColor || '#000000'}
        bgColor={this.props.bgColor || '#ffffff'}
        includeMargin={false}
        className={this.props.className}
      />
    );
  }
}
