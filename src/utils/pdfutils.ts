import * as FileSystem from "expo-file-system";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable"; // Correct import for jspdf-autotable
import {
  AuditSectionData,
  AuditItemData,
  RiskLevel,
  ConformityStatus,
} from "../features/auditPropertyChecklist/screens/AuditChecklistMainScreen";

// convertImageToBase64 function remains the same
export const convertImageToBase64 = async (
  uri: string
): Promise<string | null> => {
  try {
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    let imageType = "jpeg"; // Default
    if (uri.endsWith(".png")) {
      imageType = "png";
    } else if (uri.endsWith(".jpg") || uri.endsWith(".jpeg")) {
      imageType = "jpeg";
    }
    return `data:image/${imageType};base64,${base64}`;
  } catch (error) {
    console.error("Error converting image to base64:", error);
    return null;
  }
};

// getConformityStatusForAnnex function remains the same
const getConformityStatusForAnnex = (
  conformity: ConformityStatus | undefined,
  riskLevel: RiskLevel | undefined
): string => {
  if (conformity === "conformed") return "Conformed";
  if (conformity === "not-conformed") {
    if (riskLevel === "H") return "Not Conformed - Major";
    if (riskLevel === "L" || riskLevel === "M") return "Not Conformed - Minor";
    return "Not Conformed";
  }
  return conformity || "N/A";
};

// NEW PDF GENERATION FUNCTION USING jsPDF
export const generatePdfWithJsPDF = async (
  currentCategoryName: string,
  sections: AuditSectionData[]
): Promise<string> => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const photoItemsForAnnex: AuditItemData[] = [];

  // MODIFIED: Symmetrical 10mm page margins
  const pageMargin = { top: 15, right: 10, bottom: 15, left: 10 };
  const pageWidth = doc.internal.pageSize.getWidth(); // Typically 210mm for A4
  const pageHeight = doc.internal.pageSize.getHeight(); // Typically 297mm for A4
  const contentWidth = pageWidth - pageMargin.left - pageMargin.right; // 210 - 3 - 20 = 187mm
  let currentY = pageMargin.top;

  const addPageNumbers = () => {
    // ... (addPageNumbers function remains the same) ...
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(100);
      doc.text(
        `Page ${i} of ${pageCount}`,
        pageWidth / 2,
        pageHeight - pageMargin.bottom / 2 - 2,
        { align: "center" }
      );
    }
  };

  // --- Main Title ---
  doc.setFontSize(12);
  doc.setTextColor(44, 62, 80);
  doc.text(
    `Audit Report: ${currentCategoryName}`,
    pageWidth / 2, // Centered
    currentY,
    { align: "center" }
  );
  currentY += 5; // MODIFIED: Further reduced space after title
  doc.setLineWidth(0.5);
  doc.setDrawColor(52, 152, 219);
  doc.line(pageMargin.left, currentY, pageWidth - pageMargin.right, currentY);
  currentY += 6; // MODIFIED: Further reduced space after border

  // --- Process Sections and Items for Tables ---
  const transformItemDataForTable = (
    items: AuditItemData[],
    indentLevel = 0
  ): any[] => {
    let tableRows: any[] = [];
    items.forEach((item) => {
      const indentPrefix = " ".repeat(indentLevel * 2); // Simple text indent

      if (item.type === "header") {
        // Add header row (could be styled differently in autoTable)
        tableRows.push([
          {
            content: `${indentPrefix}${item.serialNumber || ""} ${
              item.description || ""
            }`,
            colSpan: 7, // Span across all columns
            styles: {
              fontStyle: "bold",
              fillColor: [240, 240, 240], // Light grey #f0f0f0
              halign: "left",
              fontSize: 9, // MODIFIED: Ensure sub-header items are also font size 9
            },
          },
        ]);
        if (item.subItems && item.subItems.length > 0) {
          tableRows = tableRows.concat(
            transformItemDataForTable(item.subItems, indentLevel + 1)
          );
        }
      } else {
        // MODIFIED: Display "N/A" for not-applicable, "Yes" for conformed
        let conformityDisplay = "";
        if (item.conformity === "conformed") {
          conformityDisplay = "Yes";
        } else if (item.conformity === "not-applicable") {
          conformityDisplay = "N/A";
        }

        let ncStatus = "";
        if (item.conformity === "not-conformed") {
          ncStatus =
            item.riskLevel === "H"
              ? "Major" // Entries remain full words
              : item.riskLevel === "L" || item.riskLevel === "M"
              ? "Minor" // Entries remain full words
              : "";
        }
        // MODIFIED: Add "N/A" to auditorRemarks if empty
        const auditorRemarksDisplay =
          item.conformity === "not-applicable"
            ? ""
            : item.auditorRemarks || "N/A";

        tableRows.push([
          `${indentPrefix}${item.serialNumber || ""}`,
          `${indentPrefix}${item.description || ""}`, // Apply indent to description too if desired
          item.riskLevel || "",
          conformityDisplay,
          ncStatus,
          auditorRemarksDisplay, // Use display version
          "", // Site Team's Remarks placeholder
        ]);

        // MODIFIED: Only add to photo annex if NOT "not-applicable"
        if (item.photoUri && item.conformity !== "not-applicable") {
          photoItemsForAnnex.push(item);
        }
      }
    });
    return tableRows;
  };

  let hasRenderedTable = false; // Flag to track if any table was rendered

  for (let sectionIndex = 0; sectionIndex < sections.length; sectionIndex++) {
    const section = sections[sectionIndex];
    hasRenderedTable = true; // A section table is about to be rendered

    if (sectionIndex > 0) {
      // Check if we need a new page before starting a new section table
      // This is a rough check; autoTable handles its own page breaks too.
      // We might need to add a more robust check or let autoTable handle it primarily.
      if (currentY + 40 > pageHeight - pageMargin.bottom) {
        // Estimate space needed for section header + some rows
        doc.addPage();
        currentY = pageMargin.top;
      } else {
        currentY += 10; // Add some space before the next section if on same page
      }
    }

    // Section Name Header within the table structure (or as separate text)
    // For jsPDF-AutoTable, it's often cleaner to add it as a row in the table
    // or as text just before the table.

    const sectionTableBody = [];

    // Section Header Row
    sectionTableBody.push([
      {
        content: `Section: ${section.name}`,
        colSpan: 7,
        styles: {
          fontStyle: "bold",
          fillColor: [224, 224, 224], // #e0e0e0
          textColor: [51, 51, 51], // #333
          halign: "left", // MODIFIED: Ensure section name is left-aligned
          fontSize: 9, // MODIFIED: Section name font size to 9
          cellPadding: 2,
        },
      },
    ]);

    if (section.items && section.items.length > 0) {
      sectionTableBody.push(...transformItemDataForTable(section.items));
    } else {
      sectionTableBody.push([
        {
          content: "No items in this section.",
          colSpan: 7,
          styles: { halign: "center", cellPadding: 2, fontSize: 9 }, // MODIFIED: Ensure font size 9
        },
      ]);
    }

    // User's desired relative column widths
    const relativeColWidths = {
      sn: 0.05,
      desc: 0.28,
      risk: 0.07,
      conf: 0.07,
      nc: 0.105,
      auditorRemarks: 0.18,
      siteRemarks: 0.18,
    };

    // Normalize these widths to sum to 1.0 so they use the full contentWidth
    const sumOfRelativeWidths = Object.values(relativeColWidths).reduce(
      (sum, w) => sum + w,
      0
    ); // Should be 0.935

    const normalizedColWidths = {
      sn: relativeColWidths.sn / sumOfRelativeWidths,
      desc: relativeColWidths.desc / sumOfRelativeWidths,
      risk: relativeColWidths.risk / sumOfRelativeWidths,
      conf: relativeColWidths.conf / sumOfRelativeWidths,
      nc: relativeColWidths.nc / sumOfRelativeWidths,
      auditorRemarks: relativeColWidths.auditorRemarks / sumOfRelativeWidths,
      siteRemarks: relativeColWidths.siteRemarks / sumOfRelativeWidths,
    };
    // Now, sum of normalizedColWidths will be 1.0

    autoTable(doc, {
      head: [
        [
          "S/N",
          "Description",
          "Risk Level",
          "Conformed",
          "Not Conformed Maj./Min.", // MODIFIED: Header text
          "Auditor's Remarks",
          "Site Team's Remarks",
        ],
      ],
      body: sectionTableBody,
      startY: currentY,
      theme: "grid",
      // tableWidth: 'auto', // This would make the table span contentWidth by default
      styles: {
        fontSize: 9,
        cellPadding: 1.5,
        valign: "top",
        overflow: "linebreak",
      },
      headStyles: {
        fillColor: [242, 242, 242],
        textColor: [51, 51, 51],
        fontStyle: "bold",
        fontSize: 9,
        halign: "center",
      },
      columnStyles: {
        0: { cellWidth: contentWidth * normalizedColWidths.sn, halign: "left" },
        1: { cellWidth: contentWidth * normalizedColWidths.desc },
        2: {
          cellWidth: contentWidth * normalizedColWidths.risk,
          halign: "center",
        },
        3: {
          cellWidth: contentWidth * normalizedColWidths.conf,
          halign: "center",
        },
        4: {
          cellWidth: contentWidth * normalizedColWidths.nc,
          halign: "center",
        },
        5: { cellWidth: contentWidth * normalizedColWidths.auditorRemarks },
        6: { cellWidth: contentWidth * normalizedColWidths.siteRemarks },
      },
      margin: { left: pageMargin.left, right: pageMargin.right }, // Explicitly pass page margins
    });
    currentY = (doc as any).lastAutoTable.finalY + 10;
  }

  // --- Photo Annex ---
  if (photoItemsForAnnex.length > 0) {
    if (hasRenderedTable) {
      doc.addPage();
      currentY = pageMargin.top;
    } else {
      if (
        currentY + 60 > pageHeight - pageMargin.bottom &&
        currentY > pageMargin.top
      ) {
        doc.addPage();
        currentY = pageMargin.top;
      }
    }

    const annexTitleStartY = currentY;
    doc.setFontSize(16);
    doc.setTextColor(44, 62, 80);
    doc.text("Photo Annex", pageWidth / 2, currentY, { align: "center" });
    currentY += 6;
    doc.setLineWidth(0.3);
    doc.setDrawColor(52, 152, 219);
    const underlineLength = contentWidth * 0.4; // Shorter underline
    doc.line(
      pageWidth / 2 - underlineLength / 2, // Centered underline
      currentY,
      pageWidth / 2 + underlineLength / 2,
      currentY
    );
    currentY += 10;
    const annexTitleHeight = currentY - annexTitleStartY; // Actual height taken by title section

    // Calculate dimensions for a 2x2 grid of cards per page
    const pageNumberAllowance = 10; // Approximate space for page number at bottom
    const availableHeightForCards =
      pageHeight -
      pageMargin.top -
      pageMargin.bottom -
      annexTitleHeight -
      pageNumberAllowance;

    const interRowSpacing = 4; // Space between the two rows of cards
    const targetCardHeight = (availableHeightForCards - interRowSpacing) / 2;

    const newColumnGap = contentWidth * 0.02; // Narrower column gap (2% of contentWidth)
    const targetCardWidth = (contentWidth - newColumnGap) / 2;

    // Define padding and spacing within the card
    const cardInternalPadding = 3;
    const textBlockSpacing = 5; // Space between "Auditor Remarks" block and "Site Team Remarks" box

    for (let i = 0; i < photoItemsForAnnex.length; i += 2) {
      const item1 = photoItemsForAnnex[i]; // This will always be a valid AuditItemData if loop condition is met
      const item2 =
        i + 1 < photoItemsForAnnex.length ? photoItemsForAnnex[i + 1] : null;

      if (
        currentY + targetCardHeight >
        pageHeight - pageMargin.bottom - pageNumberAllowance
      ) {
        doc.addPage();
        currentY = pageMargin.top;
        // ... (redraw annex title on new page) ...
        doc.setFontSize(16);
        doc.setTextColor(44, 62, 80);
        doc.text("Photo Annex", pageWidth / 2, currentY, { align: "center" });
        currentY += 6;
        doc.setLineWidth(0.3);
        doc.setDrawColor(52, 152, 219);
        doc.line(
          pageWidth / 2 - underlineLength / 2,
          currentY,
          pageWidth / 2 + underlineLength / 2,
          currentY
        );
        currentY += 10;
      }

      let cardX = pageMargin.left;
      const cardRowY = currentY;

      // Create an array of items for the current row, filtering out nulls
      const currentRowItems: AuditItemData[] = [];
      if (item1) currentRowItems.push(item1);
      if (item2) currentRowItems.push(item2);

      for (const [index, currentItem] of currentRowItems.entries()) {
        // Renamed 'item' to 'currentItem' for clarity
        // currentItem here is guaranteed to be AuditItemData, not null.
        if (index === 1) {
          cardX += targetCardWidth + newColumnGap;
        }

        doc.setDrawColor(150, 150, 150);
        doc.rect(cardX, cardRowY, targetCardWidth, targetCardHeight, "S");

        const imageAreaX = cardX + cardInternalPadding;
        const imageAreaY = cardRowY + cardInternalPadding;
        const imageAreaWidth =
          targetCardWidth * 0.6 - cardInternalPadding * 1.5;
        const imageAreaMaxHeight = targetCardHeight - cardInternalPadding * 2;

        if (currentItem.photoUri) {
          // Check currentItem
          const base64Image = await convertImageToBase64(currentItem.photoUri);
          if (base64Image) {
            // Access properties on currentItem, provide fallbacks if original dimensions might be undefined
            const originalImgWidth = currentItem.originalImageWidth || 100; // Fallback
            const originalImgHeight = currentItem.originalImageHeight || 100; // Fallback

            const scale = Math.min(
              imageAreaWidth / originalImgWidth,
              imageAreaMaxHeight / originalImgHeight
            );
            const scaledImgWidth = originalImgWidth * scale;
            const scaledImgHeight = originalImgHeight * scale;

            const imgDrawX = imageAreaX + (imageAreaWidth - scaledImgWidth) / 2;
            const imgDrawY =
              imageAreaY + (imageAreaMaxHeight - scaledImgHeight) / 2;

            try {
              doc.addImage(
                base64Image,
                "JPEG",
                imgDrawX,
                imgDrawY,
                scaledImgWidth,
                scaledImgHeight,
                undefined,
                "FAST"
              );
            } catch (e) {
              console.error(
                `Error adding image for S/N ${currentItem.serialNumber}:`, // Use currentItem
                e
              );
              doc.setFontSize(7);
              doc.setTextColor(128, 0, 0);
              doc.text(
                "Error loading image",
                imageAreaX + 2,
                imageAreaY + imageAreaMaxHeight / 2,
                { maxWidth: imageAreaWidth - 4 }
              );
            }
          } else {
            doc.setFontSize(7);
            doc.setTextColor(100);
            doc.text(
              "Photo not available",
              imageAreaX + imageAreaWidth / 2,
              imageAreaY + imageAreaMaxHeight / 2,
              { align: "center", maxWidth: imageAreaWidth - 4 }
            );
          }
        } else {
          doc.setFontSize(7);
          doc.setTextColor(100);
          doc.text(
            "No photo provided",
            imageAreaX + imageAreaWidth / 2,
            imageAreaY + imageAreaMaxHeight / 2,
            { align: "center", maxWidth: imageAreaWidth - 4 }
          );
        }

        let textCurrentY = cardRowY + cardInternalPadding;
        const textDetailsAreaX =
          cardX + targetCardWidth * 0.6 + cardInternalPadding / 2;
        const textDetailsWidth =
          targetCardWidth * 0.4 - cardInternalPadding * 1.5;

        doc.setFontSize(8);
        doc.setTextColor(51, 51, 51);

        // Use currentItem for all text details
        doc.text(
          `S/N: ${currentItem.serialNumber || "N/A"}`,
          textDetailsAreaX,
          textCurrentY,
          { maxWidth: textDetailsWidth }
        );
        textCurrentY += 4;

        doc.text(
          `Status: ${getConformityStatusForAnnex(
            currentItem.conformity,
            currentItem.riskLevel
          )}`,
          textDetailsAreaX,
          textCurrentY,
          { maxWidth: textDetailsWidth }
        );
        textCurrentY += 4;

        doc.text("Auditor's Remarks:", textDetailsAreaX, textCurrentY, {
          maxWidth: textDetailsWidth,
        });
        textCurrentY += 4;
        const auditorRemarks = doc.splitTextToSize(
          currentItem.auditorRemarks || "N/A",
          textDetailsWidth
        );

        const siteRemarksBoxHeight = 20;
        const spaceForAuditorRemarks =
          cardRowY +
          targetCardHeight -
          cardInternalPadding -
          textCurrentY -
          siteRemarksBoxHeight -
          textBlockSpacing;

        let linesDrawn = 0;
        for (const line of auditorRemarks) {
          const lineHeight = 3.5;
          if ((linesDrawn + 1) * lineHeight > spaceForAuditorRemarks - 2) {
            break;
          }
          doc.text(
            line,
            textDetailsAreaX,
            textCurrentY + linesDrawn * lineHeight,
            {
              maxWidth: textDetailsWidth,
            }
          );
          linesDrawn++;
        }
        textCurrentY += linesDrawn * 3.5 + textBlockSpacing;

        const siteRemarksBoxY =
          cardRowY +
          targetCardHeight -
          cardInternalPadding -
          siteRemarksBoxHeight;
        doc.setDrawColor(200, 200, 200);
        doc.rect(
          textDetailsAreaX,
          siteRemarksBoxY,
          textDetailsWidth,
          siteRemarksBoxHeight,
          "S"
        );
        doc.text(
          "Site Team's Remarks:",
          textDetailsAreaX + cardInternalPadding / 2,
          siteRemarksBoxY + 5,
          { maxWidth: textDetailsWidth - cardInternalPadding }
        );
      } // End of for...of loop for items in a row

      currentY += targetCardHeight + interRowSpacing; // Move Y to the start of the next row of cards
    }
  }

  addPageNumbers();
  return doc.output("datauristring");
};
