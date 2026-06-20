export type PdfResultRow = {
  testName: string;
  parameter: string;
  value: string;
  unit: string;
  referenceRange: string;
  flag: "N" | "H" | "L";
};

export type PdfResultBlock = {
  testName: string;
  department: string;
  sampleCollectedOn: string;
  completedOn: string;
  reportStatus: string;
  barcodeNo: string;
  sampleType: string;
  reportDate: string;
  interpretation?: string;
  rows: PdfResultRow[];
};

type PdfPatient = {
  patientName: string;
  dobAgeGender: string;
  patientId: string;
  referredBy: string;
  sampleCollected: string;
  reportStatus: string;
  barcodeNo: string;
  sampleType: string;
  reportDate: string;
};

type PdfDocument = Record<string, any>;
type JsPdfConstructor = new (...args: any[]) => PdfDocument;
type AutoTable = (doc: PdfDocument, options: Record<string, any>) => void;

const LOGO_SRC = "/plasmit-sidebar-logo.webp";

async function loadPdfLibraries(): Promise<{ jsPDF: JsPdfConstructor; autoTable: AutoTable }> {
  try {
    const dynamicImport = new Function("specifier", "return import(specifier)") as (specifier: string) => Promise<any>;
    const [jsPdfModule, autoTableModule] = await Promise.all([
      dynamicImport("jspdf"),
      dynamicImport("jspdf-autotable"),
    ]);

    return {
      jsPDF: jsPdfModule.jsPDF,
      autoTable: autoTableModule.default ?? autoTableModule,
    };
  } catch {
    throw new Error("PDF export requires jspdf and jspdf-autotable packages.");
  }
}

function normalizeGroup(parameter: string) {
  const p = parameter.toLowerCase();

  if (["hemoglobin", "rbc", "hematocrit", "pcv", "mcv", "mch", "mchc", "rdw"].some((k) => p.includes(k))) {
    return "RBC Parameters";
  }

  if (["wbc", "tlc", "neutrophil", "lymphocyte", "monocyte", "eosinophil", "basophil"].some((k) => p.includes(k))) {
    return "WBC Parameters";
  }

  if (["platelet", "mpv", "pdw", "pct"].some((k) => p.includes(k))) {
    return "Platelet Parameters";
  }

  return "Other Parameters";
}

function isAbnormal(row: PdfResultRow) {
  return row.flag === "H" || row.flag === "L";
}

function getPatientData(): PdfPatient {
  return {
    patientName: "Meera Joshi",
    dobAgeGender: "42 Years / Female",
    patientId: "UHID-45821",
    referredBy: "Dr. Kavita Rao",
    sampleCollected: "12/05/2021 09:30 AM",
    reportStatus: "Final",
    barcodeNo: "BAR-45821-01",
    sampleType: "Blood",
    reportDate: "14/05/2021",
  };
}

async function loadImageAsPngBase64(src: string): Promise<string | null> {
  try {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = src;

    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("Logo image failed to load"));
    });

    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth || img.width;
    canvas.height = img.naturalHeight || img.height;

    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.drawImage(img, 0, 0);
    return canvas.toDataURL("image/png");
  } catch (error) {
    console.warn("[PDF] logo load failed", error);
    return null;
  }
}

function addHeader(doc: PdfDocument, reportStatus: string, logoBase64?: string | null) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 28;
  const contentWidth = pageWidth - margin * 2;

  doc.setDrawColor(210);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, 18, contentWidth, 52, 4, 4, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(37, 99, 235);
  doc.text("LABORATORY REPORT", margin + 12, 48);

  // doc.setFont("helvetica", "normal");
  // doc.setFontSize(8);
  // doc.setTextColor(100, 116, 139);
  // doc.text(`Status : ${reportStatus}`, margin + 14, 62);

  const logoWidth = 100;
  const logoHeight = 34;
  const logoX = pageWidth - margin - logoWidth - 8;
  const logoY = 27;

  if (logoBase64) {
    doc.addImage(logoBase64, "PNG", logoX, logoY, logoWidth, logoHeight);
  } else {
    doc.setDrawColor(180);
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(logoX, logoY, logoWidth, logoHeight, 3, 3, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(20);
    doc.text("PLASMIT", logoX + 28, logoY + 16);
    doc.text("LOGO", logoX + 35, logoY + 28);
  }

  doc.setDrawColor(220);
  doc.line(margin, 78, pageWidth - margin, 78);

  doc.setTextColor(20);
}

function addPatientSection(doc: PdfDocument, patient: PdfPatient) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 28;
  const contentWidth = pageWidth - margin * 2;
  const startY = 78;

  doc.setDrawColor(210);
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(margin, startY, contentWidth, 74, 3, 3, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(20);
  doc.text("Patient Information", margin + 10, startY + 14);

  doc.setDrawColor(230);
  doc.line(margin, startY + 20, pageWidth - margin, startY + 20);

  const leftX = margin + 10;
  const rightX = margin + contentWidth / 2 + 10;
  const labelW = 88;

  const left: Array<[string, string]> = [
    ["Patient Name", patient.patientName],
    ["DOB / Age / Gender", patient.dobAgeGender],
    ["Patient ID / UHID", patient.patientId],
    ["Referred By", patient.referredBy],
  ];

  const right: Array<[string, string]> = [
    ["Sample Collected", patient.sampleCollected],
    ["Sample Type", patient.sampleType],
    ["Barcode No", patient.barcodeNo],
    ["Report Date", patient.reportDate],
  ];

  doc.setFontSize(8);

  left.forEach(([label, value], index) => {
    const y = startY + 34 + index * 10;
    doc.setFont("helvetica", "bold");
    doc.setTextColor(50);
    doc.text(`${label}:`, leftX, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(20);
    doc.text(String(value || "-"), leftX + labelW, y);
  });

  right.forEach(([label, value], index) => {
    const y = startY + 34 + index * 10;
    doc.setFont("helvetica", "bold");
    doc.setTextColor(50);
    doc.text(`${label}:`, rightX, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(20);
    doc.text(String(value || "-"), rightX + labelW, y);
  });
}

function addFooter(doc: PdfDocument, pageNumber: number, totalPages: number) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 28;

  doc.setDrawColor(200);
  doc.line(margin, pageHeight - 65, pageWidth - margin, pageHeight - 65);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(20);

  doc.text("Booking Centre : Plasmit Hospital", margin, pageHeight - 52);
  doc.text("Processing Lab : Central Laboratory, Plasmit Hospital", margin, pageHeight - 42);

  doc.setFontSize(6.5);
  doc.text(
    "This report is for clinical interpretation only. Correlate with patient history and clinical findings.",
    margin,
    pageHeight - 30
  );

  doc.setDrawColor(180);
  doc.rect(pageWidth - 165, pageHeight - 60, 40, 40);

  doc.setFontSize(6);
  doc.text("QR Code", pageWidth - 155, pageHeight - 38);

  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.text("Authorized Signatory", pageWidth - 105, pageHeight - 52);

  doc.setFont("helvetica", "normal");
  doc.text("_____________________", pageWidth - 120, pageHeight - 40);
  doc.text("Dr. Kavita Rao", pageWidth - 105, pageHeight - 28);
  doc.text("MD Pathology", pageWidth - 105, pageHeight - 18);
  doc.text("Reg. No: MMC12345", pageWidth - 105, pageHeight - 8);

  doc.setFontSize(7);
  doc.text(`Page ${pageNumber} of ${totalPages}`, pageWidth / 2 - 20, pageHeight - 8);
}

function addPageFrame(doc: PdfDocument, patient: PdfPatient, reportStatus: string, logoBase64?: string | null) {
  addHeader(doc, reportStatus, logoBase64);
  addPatientSection(doc, patient);
}

export async function downloadLaboratoryPdf(blocks: PdfResultBlock[], filename: string) {
  const { jsPDF, autoTable } = await loadPdfLibraries();
  const patient = getPatientData();
  const logoBase64 = await loadImageAsPngBase64(LOGO_SRC);

  console.log("[PDF] blocks data received", blocks);
  console.log("[PDF] patient data", patient);

  if (!blocks?.length) {
    console.warn("[PDF] download prevented: blocks array is empty");
    window.alert("No result data available for PDF download.");
    return;
  }

  const reportBlocks = blocks.filter((block) => block.rows?.length > 0);

  if (!reportBlocks.length) {
    console.warn("[PDF] download prevented: no rows found");
    window.alert("No result data available for PDF download.");
    return;
  }

  const doc = new jsPDF({ unit: "pt", format: "a4" });

  reportBlocks.forEach((block, index) => {
    if (index > 0) doc.addPage();

    addPageFrame(doc, patient, block.reportStatus || "Final", logoBase64);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(20);
    doc.text(block.testName, 28, 172);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.text(`Department: ${block.department || "-"}`, 28, 186);
    doc.text(`Sample Collected: ${block.sampleCollectedOn || "-"}`, 170, 186);
    doc.text(`Sample Type: ${block.sampleType || "-"}`, 330, 186);
    doc.text(`Report Date: ${block.reportDate || "-"}`, 450, 186);

    const grouped = new Map<string, PdfResultRow[]>();

    block.rows.forEach((row) => {
      const group = normalizeGroup(row.parameter);
      grouped.set(group, [...(grouped.get(group) ?? []), row]);
    });

    let startY = 202;

    grouped.forEach((rows, groupName) => {
      autoTable(doc, {
        startY,
        margin: { left: 28, right: 28, bottom: 80 },
        head: [[groupName, "Value", "Unit", "Reference Range", "Flag"]],
        body: rows.map((row) => [
          row.parameter || "-",
          row.value || "-",
          row.unit || "-",
          row.referenceRange || "-",
          row.flag === "H" ? "High" : row.flag === "L" ? "Low" : "Normal",
        ]),
        theme: "grid",
        styles: {
          fontSize: 8,
          cellPadding: 4,
          textColor: 20,
          lineColor: 210,
          lineWidth: 0.3,
          overflow: "linebreak",
          valign: "middle",
        },
        headStyles: {
          fillColor: [235, 238, 242],
          textColor: 20,
          fontStyle: "bold",
          halign: "center",
        },
        bodyStyles: {
          fillColor: [255, 255, 255],
        },
        alternateRowStyles: {
          fillColor: [250, 250, 250],
        },
        columnStyles: {
          0: { cellWidth: 210 },
          1: { cellWidth: 75, halign: "center" },
          2: { cellWidth: 75, halign: "center" },
          3: { cellWidth: 120, halign: "center" },
          4: { cellWidth: 58, halign: "center" },
        },
        didParseCell: (data: any) => {
          if (data.section === "body") {
            const row = rows[data.row.index];

            if (row && isAbnormal(row)) {
              data.cell.styles.fontStyle = "bold";
              data.cell.styles.textColor =
                row.flag === "H" ? [180, 40, 40] : [30, 90, 180];
            }
          }
        },
        didDrawPage: () => {
          const pageNo = doc.getNumberOfPages();
          addHeader(doc, block.reportStatus || "Final", logoBase64);
          addPatientSection(doc, patient);
          addFooter(doc, pageNo, pageNo);
        },
        pageBreak: "auto",
        rowPageBreak: "auto",
      });

      startY = (doc as any).lastAutoTable.finalY + 10;
    });

    const interpretation = block.interpretation?.trim();

    if (interpretation) {
      const pageHeight = doc.internal.pageSize.getHeight();
      let y = Math.max(((doc as any).lastAutoTable?.finalY ?? 202) + 10, 202);

      if (y > pageHeight - 140) {
        doc.addPage();
        addPageFrame(doc, patient, block.reportStatus || "Final", logoBase64);
        y = 172;
      }

      const lines = doc.splitTextToSize(interpretation, 520);
      const boxHeight = Math.min(70, lines.length * 9 + 26);

      doc.setDrawColor(215);
      doc.setFillColor(248, 248, 248);
      doc.roundedRect(28, y, 539, boxHeight, 3, 3, "FD");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(20);
      doc.text("Interpretation", 36, y + 14);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.text(lines.slice(0, 5), 36, y + 28);
    }
  });

  const totalPages = doc.getNumberOfPages();

  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    addFooter(doc, i, totalPages);
  }

  console.log("[PDF] total pages generated", totalPages);

  const blob = doc.output("blob");
  console.log("[PDF] final PDF blob size", blob.size);

  doc.save(filename);
}
