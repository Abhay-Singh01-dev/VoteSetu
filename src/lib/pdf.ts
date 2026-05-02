import type { jsPDF as JsPDFConstructor } from "jspdf";
import { voterJourney } from "@/data/electionData";

type PlanInput = {
  name: string;
  constituency: string;
  pollingDate: string;
  boothInfo: string;
  completed: number[]; // step ids
};

const SAFFRON: [number, number, number] = [232, 110, 31];
const GREEN: [number, number, number] = [29, 137, 81];
const NAVY: [number, number, number] = [25, 50, 110];
const TEXT: [number, number, number] = [30, 35, 50];
const MUTED: [number, number, number] = [110, 120, 135];
const LIGHT: [number, number, number] = [240, 244, 250];

type PdfDocument = InstanceType<typeof JsPDFConstructor>;

export async function generateVoterPlanPDF(input: PlanInput) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 48;
  let y = 0;

  // ---- Header band (tricolour) ----
  doc.setFillColor(...SAFFRON);
  doc.rect(0, 0, pageW, 14, "F");
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 14, pageW, 14, "F");
  doc.setFillColor(...GREEN);
  doc.rect(0, 28, pageW, 14, "F");

  // Navy chakra dot
  doc.setFillColor(...NAVY);
  doc.circle(pageW / 2, 21, 5, "F");

  y = 70;

  // ---- Title ----
  doc.setTextColor(...TEXT);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.text("My Voter Plan", margin, y);

  y += 8;
  doc.setDrawColor(...SAFFRON);
  doc.setLineWidth(2);
  doc.line(margin, y, margin + 60, y);

  y += 22;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(...MUTED);
  doc.text(
    "Your personal checklist for casting your vote in the upcoming Indian election.",
    margin,
    y,
  );

  // ---- Personal info card ----
  y += 24;
  doc.setFillColor(...LIGHT);
  doc.roundedRect(margin, y, pageW - margin * 2, 110, 8, 8, "F");

  const labelCol = margin + 18;
  const valueCol = margin + 150;

  const rows: [string, string][] = [
    ["Voter name", input.name || "—"],
    ["Constituency", input.constituency || "—"],
    ["Polling date", input.pollingDate || "—"],
    ["Booth / Part No.", input.boothInfo || "—"],
  ];

  let infoY = y + 24;
  rows.forEach(([k, v]) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...NAVY);
    doc.text(k.toUpperCase(), labelCol, infoY);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(...TEXT);
    const lines = doc.splitTextToSize(v, pageW - valueCol - margin - 18);
    doc.text(lines, valueCol, infoY);
    infoY += 22;
  });

  y += 110 + 28;

  // ---- Voter Journey checklist ----
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.setTextColor(...TEXT);
  doc.text("Your 6-step voter journey", margin, y);
  y += 18;

  voterJourney.forEach((step) => {
    const done = input.completed.includes(step.id);
    const blockX = margin;
    const blockW = pageW - margin * 2;

    // checkbox
    const boxSize = 14;
    doc.setDrawColor(...(done ? GREEN : NAVY));
    doc.setLineWidth(1.2);
    doc.roundedRect(blockX, y - 2, boxSize, boxSize, 3, 3, done ? "FD" : "S");
    if (done) {
      doc.setFillColor(...GREEN);
      doc.roundedRect(blockX, y - 2, boxSize, boxSize, 3, 3, "F");
      doc.setDrawColor(255, 255, 255);
      doc.setLineWidth(1.6);
      doc.line(blockX + 3, y + 5, blockX + 6, y + 8);
      doc.line(blockX + 6, y + 8, blockX + 11, y + 2);
    }

    // Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11.5);
    doc.setTextColor(...TEXT);
    doc.text(`${step.id}. ${step.title}`, blockX + boxSize + 10, y + 9);

    // Description
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...MUTED);
    const desc = doc.splitTextToSize(step.description, blockW - boxSize - 14);
    doc.text(desc, blockX + boxSize + 10, y + 24);
    y += 24 + desc.length * 12 + 8;

    if (y > pageH - 140) {
      addFooter(doc, pageW, pageH, margin);
      doc.addPage();
      y = margin + 20;
    }
  });

  // ---- Polling-day essentials ----
  if (y > pageH - 230) {
    addFooter(doc, pageW, pageH, margin);
    doc.addPage();
    y = margin + 20;
  }

  y += 10;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.setTextColor(...TEXT);
  doc.text("Polling-day essentials", margin, y);
  y += 18;

  doc.setFillColor(...LIGHT);
  doc.roundedRect(margin, y, pageW - margin * 2, 130, 8, 8, "F");

  const essentials = [
    "EPIC (Voter ID) — or one of 12 ECI-approved alternative IDs",
    "Reach the polling booth before 6 PM (you can vote if already in queue)",
    "Verify your VVPAT slip for the full 7 seconds",
    "No phones or photos inside the polling booth",
    "Ensure indelible ink mark — it's your proof of voting",
  ];

  let eY = y + 22;
  essentials.forEach((line) => {
    doc.setFillColor(...SAFFRON);
    doc.circle(margin + 18, eY - 3, 2.4, "F");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10.5);
    doc.setTextColor(...TEXT);
    const wrapped = doc.splitTextToSize(line, pageW - margin * 2 - 40);
    doc.text(wrapped, margin + 28, eY);
    eY += 18 + (wrapped.length - 1) * 12;
  });

  // ---- Footer on last page ----
  addFooter(doc, pageW, pageH, margin);

  doc.save("My-Voter-Plan.pdf");
}

function addFooter(doc: PdfDocument, pageW: number, pageH: number, margin: number) {
  const y = pageH - 40;
  doc.setDrawColor(...SAFFRON);
  doc.setLineWidth(0.6);
  doc.line(margin, y - 10, pageW - margin, y - 10);

  doc.setFont("helvetica", "italic");
  doc.setFontSize(8.5);
  doc.setTextColor(...MUTED);
  doc.text(
    "VoteSetu · Educational guide. Official source: eci.gov.in · voters.eci.gov.in",
    margin,
    y,
  );
  doc.text(
    `Generated ${new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}`,
    pageW - margin,
    y,
    { align: "right" },
  );
}

// =====================================================================
// Booth Day Checklist — single A4 page, designed to fit on one page.
// =====================================================================

type BoothInput = {
  name?: string;
  constituency?: string;
  pollingDate: string; // ISO yyyy-mm-dd or human string
  boothInfo: string;
};

export async function generateBoothDayPDF(input: BoothInput) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 40;

  // Tricolour band
  doc.setFillColor(...SAFFRON);
  doc.rect(0, 0, pageW, 10, "F");
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 10, pageW, 10, "F");
  doc.setFillColor(...GREEN);
  doc.rect(0, 20, pageW, 10, "F");
  doc.setFillColor(...NAVY);
  doc.circle(pageW / 2, 15, 4, "F");

  let y = 56;

  // Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(...TEXT);
  doc.text("Booth Day Checklist", margin, y);

  y += 6;
  doc.setDrawColor(...SAFFRON);
  doc.setLineWidth(2);
  doc.line(margin, y, margin + 60, y);

  y += 18;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10.5);
  doc.setTextColor(...MUTED);
  doc.text("A focused, one-page guide for the day you cast your vote.", margin, y);

  // Compact info strip
  y += 18;
  doc.setFillColor(...LIGHT);
  doc.roundedRect(margin, y, pageW - margin * 2, 56, 6, 6, "F");

  const friendlyDate = formatPollingDate(input.pollingDate);
  const stripCols: [string, string][] = [
    ["VOTER", input.name || "—"],
    ["CONSTITUENCY", input.constituency || "—"],
    ["POLLING DATE", friendlyDate],
    ["BOOTH / PART", input.boothInfo || "—"],
  ];
  const colW = (pageW - margin * 2) / stripCols.length;
  stripCols.forEach(([k, v], i) => {
    const x = margin + colW * i + 12;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...NAVY);
    doc.text(k, x, y + 18);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10.5);
    doc.setTextColor(...TEXT);
    const lines = doc.splitTextToSize(v, colW - 20);
    doc.text(lines.slice(0, 2), x, y + 34);
  });
  y += 56 + 18;

  // Two-column body: Before leaving / At the booth
  const colGap = 16;
  const bodyW = (pageW - margin * 2 - colGap) / 2;

  const beforeItems = [
    "Carry your EPIC (Voter ID) — or any 1 of 12 alternate IDs",
    "Confirm name + Part No. on the Electoral Roll",
    "Note polling hours: typically 7 AM – 6 PM",
    "Check polling booth address & route in advance",
    "Wear comfortable clothes, carry water in summer",
    "Leave phone in vehicle / outside — photos inside are illegal",
  ];

  const atBoothItems = [
    "Join the queue — voters in queue at 6 PM can still vote",
    "Show ID to the First Polling Officer for roll verification",
    "Get your left index finger inked (indelible ink)",
    "Sign the Form 17A register; collect your slip",
    "Press the EVM button next to your candidate's symbol",
    "Watch the VVPAT slip for the full 7 seconds — verify name & symbol",
    "Leave promptly; do not loiter inside the booth",
  ];

  const drawColumn = (
    x: number,
    title: string,
    items: string[],
    accent: [number, number, number],
  ) => {
    let ly = y;
    doc.setFillColor(...accent);
    doc.rect(x, ly, 4, 16, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(...TEXT);
    doc.text(title, x + 12, ly + 12);
    ly += 26;

    items.forEach((item) => {
      // checkbox
      doc.setDrawColor(...NAVY);
      doc.setLineWidth(0.9);
      doc.roundedRect(x, ly - 8, 10, 10, 2, 2, "S");

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(...TEXT);
      const wrapped = doc.splitTextToSize(item, bodyW - 20);
      doc.text(wrapped, x + 16, ly);
      ly += wrapped.length * 12 + 6;
    });
    return ly;
  };

  const leftEnd = drawColumn(margin, "Before you leave", beforeItems, SAFFRON);
  const rightEnd = drawColumn(margin + bodyW + colGap, "At the booth", atBoothItems, GREEN);
  y = Math.max(leftEnd, rightEnd) + 14;

  // Reminder strip
  doc.setFillColor(...NAVY);
  doc.roundedRect(margin, y, pageW - margin * 2, 50, 6, 6, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.text("Voter helpline · 1950", margin + 16, y + 20);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.text(
    "Report MCC violations on the cVIGIL app · Find your booth at voters.eci.gov.in",
    margin + 16,
    y + 36,
  );

  // Footer
  addFooter(doc, pageW, pageH, margin);

  doc.save("Booth-Day-Checklist.pdf");
}

function formatPollingDate(raw: string): string {
  if (!raw) return "—";
  // Accept ISO date or pass-through
  const d = new Date(raw);
  if (!isNaN(d.getTime())) {
    return d.toLocaleDateString("en-IN", {
      weekday: "short",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }
  return raw;
}
