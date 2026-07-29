"use client";

import { useMemo, useState } from "react";
import { Copy, Check, Printer, FileDown, MessageCircle, X } from "lucide-react";
import { generatePreparationText, type PreparationItem } from "@/lib/preparationList";

export function PreparationPanel({
  items,
  onClose,
}: {
  items: PreparationItem[];
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const text = useMemo(() => generatePreparationText(items), [items]);

  async function handleCopy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function handleShareWhatsApp() {
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  }

  function handlePrint() {
    window.print();
  }

  async function handleExportPdf() {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const margin = 48;
    const lineHeight = 18;
    let y = margin;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(22, 122, 71);
    doc.text("À préparer avant 16 h — ReadyMiix Cabana", margin, y);
    y += lineHeight * 1.6;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(30, 30, 30);

    const bodyLines = text.split("\n").slice(2);
    for (const line of bodyLines) {
      if (!line) continue;
      if (y > 780) {
        doc.addPage();
        y = margin;
      }
      doc.text(line, margin, y);
      y += lineHeight;
    }

    doc.save(`preparation-readymiix-cabana-${new Date().toISOString().slice(0, 10)}.pdf`);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 print:static print:block print:bg-transparent sm:items-center sm:p-4">
      <div className="no-print flex max-h-[85vh] w-full max-w-lg flex-col rounded-t-2xl bg-white sm:rounded-2xl">
        <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
          <h2 className="font-bold">Liste de préparation</h2>
          <button onClick={onClose} className="btn btn-icon tap-target btn-secondary">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          <pre className="whitespace-pre-wrap rounded-xl bg-[var(--color-sand-50)] p-4 font-sans text-sm leading-relaxed">
            {text}
          </pre>
        </div>

        <div className="grid grid-cols-2 gap-2 border-t border-[var(--border)] p-4">
          <button onClick={handleShareWhatsApp} className="btn tap-target text-sm text-white" style={{ background: "#25D366" }}>
            <MessageCircle size={16} /> WhatsApp
          </button>
          <button onClick={handleCopy} className="btn btn-secondary tap-target text-sm">
            {copied ? <Check size={16} /> : <Copy size={16} />} {copied ? "Copié" : "Copier"}
          </button>
          <button onClick={handlePrint} className="btn btn-secondary tap-target text-sm">
            <Printer size={16} /> Imprimer
          </button>
          <button onClick={handleExportPdf} className="btn btn-secondary tap-target text-sm">
            <FileDown size={16} /> Export PDF
          </button>
        </div>
      </div>

      <div className="print-only hidden print:block">
        <h1 className="mb-4 text-xl font-bold">À préparer avant 16 h — ReadyMiix Cabana</h1>
        <pre className="whitespace-pre-wrap font-sans text-sm">{text}</pre>
      </div>
    </div>
  );
}
