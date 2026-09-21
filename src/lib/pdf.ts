import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const PAGE_WIDTH_MM = 210;
const PAGE_HEIGHT_MM = 297;
const MARGIN_X_MM = 10;
const MARGIN_TOP_MM = 24;
const MARGIN_BOTTOM_MM = 16;
const CONTENT_WIDTH_MM = PAGE_WIDTH_MM - MARGIN_X_MM * 2;
const CONTENT_HEIGHT_MM = PAGE_HEIGHT_MM - MARGIN_TOP_MM - MARGIN_BOTTOM_MM;

export async function exportElementToPdf({
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
  const element = document.getElementById(elementId);
  if (!element) throw new Error("Elemento do relatório não encontrado");

  // Oculta elementos marcados como não-imprimíveis (botões, filtros) durante a captura
  const hiddenEls = Array.from(element.querySelectorAll<HTMLElement>("[data-pdf-hide]"));
  const previousDisplay = hiddenEls.map((el) => el.style.display);
  hiddenEls.forEach((el) => (el.style.display = "none"));

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: "#ffffff",
    logging: false,
  });

  hiddenEls.forEach((el, i) => (el.style.display = previousDisplay[i]));

  const pxPerMm = canvas.width / CONTENT_WIDTH_MM;
  const contentHeightPx = Math.floor(CONTENT_HEIGHT_MM * pxPerMm);
  const totalPages = Math.max(1, Math.ceil(canvas.height / contentHeightPx));

  const doc = new jsPDF("p", "mm", "a4");

  for (let page = 0; page < totalPages; page++) {
    if (page > 0) doc.addPage();

    const sourceY = page * contentHeightPx;
    const sliceHeightPx = Math.min(contentHeightPx, canvas.height - sourceY);

    const sliceCanvas = document.createElement("canvas");
    sliceCanvas.width = canvas.width;
    sliceCanvas.height = sliceHeightPx;
    const ctx = sliceCanvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(canvas, 0, sourceY, canvas.width, sliceHeightPx, 0, 0, canvas.width, sliceHeightPx);
    }
    const imgData = sliceCanvas.toDataURL("image/jpeg", 0.92);
    const sliceHeightMm = sliceHeightPx / pxPerMm;

    // Cabeçalho
    doc.setFontSize(9);
    doc.setTextColor(120);
    doc.text(agencyName, MARGIN_X_MM, 12);
    doc.setFontSize(9);
    doc.text(reportTitle, PAGE_WIDTH_MM - MARGIN_X_MM, 12, { align: "right" });
    doc.setDrawColor(226, 232, 240);
    doc.line(MARGIN_X_MM, 16, PAGE_WIDTH_MM - MARGIN_X_MM, 16);

    // Conteúdo
    doc.addImage(imgData, "JPEG", MARGIN_X_MM, MARGIN_TOP_MM, CONTENT_WIDTH_MM, sliceHeightMm);

    // Rodapé
    doc.setDrawColor(226, 232, 240);
    doc.line(MARGIN_X_MM, PAGE_HEIGHT_MM - 14, PAGE_WIDTH_MM - MARGIN_X_MM, PAGE_HEIGHT_MM - 14);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(`Relatório de Performance — ${agencyName}`, MARGIN_X_MM, PAGE_HEIGHT_MM - 8);
    doc.text(`Página ${page + 1} de ${totalPages}`, PAGE_WIDTH_MM - MARGIN_X_MM, PAGE_HEIGHT_MM - 8, {
      align: "right",
    });
  }

  doc.save(fileName);
}
