"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { exportElementToPdf } from "@/lib/pdf";
import { useToast } from "@/components/providers/ToastProvider";

export default function ExportPdfButton({
  elementId,
  fileName,
  agencyName,
  reportTitle,
}: {
  elementId: string;
  fileName: string;
  agencyName: string;
  reportTitle: string;
}) {
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  async function handleExport() {
    setLoading(true);
    try {
      await exportElementToPdf({ elementId, fileName, agencyName, reportTitle });
      showToast("PDF gerado com sucesso!", "success");
    } catch (e) {
      console.error(e);
      showToast("Erro ao gerar o PDF. Tente novamente.", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button className="btn-primary" onClick={handleExport} disabled={loading} data-pdf-hide>
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
      {loading ? "Gerando PDF..." : "Exportar PDF"}
    </button>
  );
}
