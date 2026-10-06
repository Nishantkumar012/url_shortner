import { useRef, useState } from "react";
import { QRCodeCanvas, QRCodeSVG } from "qrcode.react";
import { X, Download, Copy, Palette } from "lucide-react";

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  shortUrl: string;
  destinationUrl: string;
}

export function QRCodeModal({
  isOpen,
  onClose,
  shortUrl,
  destinationUrl,
}: QRCodeModalProps) {
  const [fgColor, setFgColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#FFFFFF");
  const qrCanvasRef = useRef<HTMLDivElement>(null);
  const qrSvgRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const fullShortUrl = `${import.meta.env.VITE_API_URL}/url/${shortUrl}`;

  const handleDownloadPNG = () => {
    const canvas = qrCanvasRef.current?.querySelector("canvas") as HTMLCanvasElement;
    if (canvas) {
      const url = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = url;
      link.download = `qrcode-${shortUrl}.png`;
      link.click();
    }
  };

  const handleDownloadSVG = () => {
    const svg = qrSvgRef.current?.querySelector("svg") as SVGElement;
    if (svg) {
      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(svg);
      const blob = new Blob([svgString], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `qrcode-${shortUrl}.svg`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleCopyImage = async () => {
    const canvas = qrCanvasRef.current?.querySelector("canvas") as HTMLCanvasElement;
    if (canvas) {
      canvas.toBlob(async (blob) => {
        if (blob) {
          try {
            await navigator.clipboard.write([
              new ClipboardItem({ "image/png": blob }),
            ]);
            alert("QR Code copied to clipboard!");
          } catch (err) {
            console.error("Failed to copy image:", err);
          }
        }
      });
    }
  };

  const presetColors = [
    { fg: "#000000", bg: "#FFFFFF", label: "Classic" },
    { fg: "#7C3AED", bg: "#FFFFFF", label: "Purple" },
    { fg: "#0EA5E9", bg: "#FFFFFF", label: "Sky Blue" },
    { fg: "#EC4899", bg: "#FFFFFF", label: "Pink" },
    { fg: "#FFFFFF", bg: "#000000", label: "Inverse" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="glass-panel relative w-full max-w-md max-h-[90vh] rounded-2xl border border-white/10 shadow-2xl flex flex-col">
        {/* Close Button - Fixed */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 rounded-lg p-2 text-on-surface-variant transition-colors hover:bg-white/10 hover:text-on-surface"
        >
          <X size={20} />
        </button>

        {/* Fixed Header Section - QR Code and Short URL */}
        <div className="flex-shrink-0 border-b border-white/5 px-6 pt-6 pb-4">
          {/* Header Text */}
          <h2 className="mb-2 text-headline-md font-bold text-on-surface">
            QR Code
          </h2>
          <p className="mb-6 text-body-sm text-on-surface-variant">
            Share this QR code to redirect to your link
          </p>

          {/* QR Preview - Canvas (hidden for PNG download) */}
          <div ref={qrCanvasRef} className="mb-6 flex justify-center">
            <QRCodeCanvas
              value={fullShortUrl}
              size={256}
              bgColor={bgColor}
              fgColor={fgColor}
              level="H"
              includeMargin={true}
            />
          </div>

          {/* QR Preview - SVG (hidden, for SVG download) */}
          <div ref={qrSvgRef} className="hidden">
            <QRCodeSVG
              value={fullShortUrl}
              size={256}
              bgColor={bgColor}
              fgColor={fgColor}
              level="H"
              includeMargin={true}
            />
          </div>

          {/* Short URL Display */}
          <div className="rounded-lg bg-white/5 p-4">
            <p className="mb-2 text-xs uppercase tracking-wider text-on-surface-variant">
              Short URL
            </p>
            <p className="break-all font-code text-body-sm text-primary">
              {fullShortUrl}
            </p>
          </div>
        </div>

        {/* Scrollable Content Section */}
        <div className="flex-1 overflow-y-auto px-6 py-4" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {/* Hide scrollbar for webkit browsers */}
          <style>{`
            .scrollable-content::-webkit-scrollbar {
              display: none;
            }
          `}</style>

          <div className="scrollable-content h-full">
            {/* Color Customization */}
            <div className="mb-6 space-y-4">
              <div className="flex items-center gap-2">
                <Palette size={18} className="text-on-surface-variant" />
                <h3 className="font-semibold text-on-surface">Customize Colors</h3>
              </div>

              {/* Preset Colors */}
              <div className="flex flex-wrap gap-2">
                {presetColors.map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => {
                      setFgColor(preset.fg);
                      setBgColor(preset.bg);
                    }}
                    className={`rounded-lg px-3 py-2 text-sm transition-all ${
                      fgColor === preset.fg && bgColor === preset.bg
                        ? "bg-primary text-on-primary ring-2 ring-primary/50"
                        : "bg-white/10 text-on-surface-variant hover:bg-white/20"
                    }`}
                    title={preset.label}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              {/* Custom Color Pickers */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                    Foreground (QR dots)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={fgColor}
                      onChange={(e) => setFgColor(e.target.value)}
                      className="h-10 w-10 cursor-pointer rounded-lg border border-white/10"
                    />
                    <input
                      type="text"
                      value={fgColor}
                      onChange={(e) => setFgColor(e.target.value)}
                      className="flex-1 rounded-lg border border-white/10 bg-surface-container-low px-3 py-2 text-xs font-code text-on-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                    Background
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="h-10 w-10 cursor-pointer rounded-lg border border-white/10"
                    />
                    <input
                      type="text"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="flex-1 rounded-lg border border-white/10 bg-surface-container-low px-3 py-2 text-xs font-code text-on-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleDownloadPNG}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 font-label-md font-bold text-on-primary transition-all hover:bg-primary/90 active:scale-95"
              >
                <Download size={18} />
                Download PNG
              </button>

              <button
                onClick={handleDownloadSVG}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary/20 px-4 py-3 font-label-md font-bold text-primary transition-all hover:bg-primary/30 active:scale-95"
              >
                <Download size={18} />
                Download SVG
              </button>

              <button
                onClick={handleCopyImage}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-white/10 px-4 py-3 font-label-md font-bold text-on-surface transition-all hover:bg-white/20 active:scale-95"
              >
                <Copy size={18} />
                Copy Image
              </button>

              <button
                onClick={onClose}
                className="w-full rounded-lg bg-white/5 px-4 py-3 font-label-md font-bold text-on-surface-variant transition-all hover:bg-white/10 active:scale-95"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
