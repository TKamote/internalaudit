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

  const pageMargin = { top: 15, right: 10, bottom: 15, left: 10 };
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const contentWidth = pageWidth - pageMargin.left - pageMargin.right;
  let currentY = pageMargin.top;

  const addPageNumbers = () => {
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

  // Main Report Title
  doc.setFontSize(12);
  doc.setTextColor(44, 62, 80);
  doc.text(`Audit Report: ${currentCategoryName}`, pageWidth / 2, currentY, {
    align: "center",
  });
  currentY += 5; // Space after title
  doc.setLineWidth(0.5);
  doc.setDrawColor(52, 152, 219); // Theme color for underline
  doc.line(pageMargin.left, currentY, pageWidth - pageMargin.right, currentY);
  currentY += 6; // Space after underline

  const transformItemDataForTable = (
    items: AuditItemData[],
    indentLevel = 0
  ): any[] => {
    let tableRows: any[] = [];
    items.forEach((item) => {
      const indentPrefix = " ".repeat(indentLevel * 2);

      if (item.type === "header") {
        tableRows.push([
          {
            content: `${indentPrefix}${item.serialNumber || ""} ${
              item.description || ""
            }`,
            colSpan: 7, // Span all 7 columns
            styles: {
              fontStyle: "bold",
              fillColor: [240, 240, 240], // Light grey for header
              halign: "left",
              fontSize: 9, // Consistent font size
            },
          },
        ]);
        if (item.subItems && item.subItems.length > 0) {
          tableRows = tableRows.concat(
            transformItemDataForTable(item.subItems, indentLevel + 1)
          );
        }
      } else {
        let conformityDisplay = "";
        if (item.conformity === "conformed") {
          conformityDisplay = "Yes";
        } else if (item.conformity === "not-applicable") {
          conformityDisplay = "N/A";
        }

        let ncStatus = ""; // For "Not Conformed Maj./Min." column
        if (item.conformity === "not-conformed") {
          ncStatus =
            item.riskLevel === "H"
              ? "Major"
              : item.riskLevel === "L" || item.riskLevel === "M"
              ? "Minor"
              : ""; // Should ideally not be empty if not-conformed
        }
        const auditorRemarksDisplay =
          item.conformity === "not-applicable"
            ? ""
            : item.auditorRemarks || "N/A"; // Show N/A if empty and applicable

        tableRows.push([
          `${indentPrefix}${item.serialNumber || ""}`,
          `${indentPrefix}${item.description || ""}`,
          item.riskLevel || "", // Risk Level
          conformityDisplay, // Conformed (Yes/N/A)
          ncStatus, // Not Conformed (Major/Minor)
          auditorRemarksDisplay, // Auditor's Remarks
          "", // Site Team's Remarks (placeholder)
        ]);

        if (item.photoUri && item.conformity !== "not-applicable") {
          photoItemsForAnnex.push({
            ...item, // Spread existing item properties
            originalImageWidth: item.originalImageWidth, // Ensure these are passed
            originalImageHeight: item.originalImageHeight,
          });
        }
      }
    });
    return tableRows;
  };

  let hasRenderedTable = false;

  for (let sectionIndex = 0; sectionIndex < sections.length; sectionIndex++) {
    const section = sections[sectionIndex];
    hasRenderedTable = true; // Mark that at least one table section is being rendered

    // Page break logic before starting a new section table
    if (sectionIndex > 0) {
      // Check if there's enough space for section title and some rows
      if (currentY + 40 > pageHeight - pageMargin.bottom) {
        doc.addPage();
        currentY = pageMargin.top;
      } else {
        currentY += 10; // Space between tables
      }
    }

    const sectionTableBody = [];
    // Add section name as a styled row
    sectionTableBody.push([
      {
        content: `Section: ${section.name}`,
        colSpan: 7, // Span all 7 columns
        styles: {
          fontStyle: "bold",
          fillColor: [224, 224, 224], // Slightly darker grey for section name
          textColor: [51, 51, 51],
          halign: "left",
          fontSize: 9, // Consistent font size
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
          styles: { halign: "center", cellPadding: 2, fontSize: 9 },
        },
      ]);
    }

    // Original column widths that were working well before the incorrect adjustment
    const relativeColWidths = {
      sn: 0.05,
      desc: 0.28,
      risk: 0.07,
      conf: 0.07,
      nc: 0.105, // "Not Conformed Maj./Min."
      auditorRemarks: 0.2125, // Adjusted to make sum 1
      siteRemarks: 0.2125, // Adjusted to make sum 1
    };
    // Sum: 0.05 + 0.28 + 0.07 + 0.07 + 0.105 + 0.2125 + 0.2125 = 1.00

    const sumOfRelativeWidths = Object.values(relativeColWidths).reduce(
      (sum, w) => sum + w,
      0
    );
    const normalizedColWidths = {
      sn: relativeColWidths.sn / sumOfRelativeWidths,
      desc: relativeColWidths.desc / sumOfRelativeWidths,
      risk: relativeColWidths.risk / sumOfRelativeWidths,
      conf: relativeColWidths.conf / sumOfRelativeWidths,
      nc: relativeColWidths.nc / sumOfRelativeWidths,
      auditorRemarks: relativeColWidths.auditorRemarks / sumOfRelativeWidths,
      siteRemarks: relativeColWidths.siteRemarks / sumOfRelativeWidths,
    };

    autoTable(doc, {
      head: [
        [
          "S/N",
          "Description",
          "Risk Level",
          "Conformed",
          "Not Conformed Maj./Min.",
          "Auditor's Remarks",
          "Site Team's Remarks",
        ],
      ],
      body: sectionTableBody,
      startY: currentY,
      theme: "grid",
      styles: {
        fontSize: 9,
        cellPadding: 1.5,
        valign: "top", // Keep content at the top of cells
        overflow: "linebreak", // Allow text to wrap
      },
      headStyles: {
        fillColor: [242, 242, 242], // Light grey for header
        textColor: [51, 51, 51], // Dark grey text
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
    currentY = (doc as any).lastAutoTable.finalY + 10; // Space after table
  }

  // --- Photo Annex ---
  if (photoItemsForAnnex.length > 0) {
    if (hasRenderedTable) {
      doc.addPage();
      currentY = pageMargin.top;
    } else {
      // If no tables, but currentY might have been advanced by the main title,
      // check if we need to "reset" to top for the annex if it's the *only* content block.
      if (
        currentY + 60 > pageHeight - pageMargin.bottom && // Basic space check
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
    currentY += 6; // Space for title text itself
    // MODIFIED (1): Removed decorative line below "Photo Annex" title
    // doc.setLineWidth(0.3);
    // doc.setDrawColor(52, 152, 219);
    // const underlineLength = contentWidth * 0.4;
    // doc.line(
    //   pageWidth / 2 - underlineLength / 2,
    //   currentY,
    //   pageWidth / 2 + underlineLength / 2,
    //   currentY
    // );
    currentY += 3; // Space after title text (was 1.5 after line, now 3 after text directly)
    const annexTitleHeight = currentY - annexTitleStartY;

    const pageNumberAllowance = 10;
    const availableHeightForCards =
      pageHeight -
      pageMargin.top -
      pageMargin.bottom -
      annexTitleHeight -
      pageNumberAllowance;

    const numberOfRowsPerPage = 3;
    // MODIFIED (2): Add vertical gap (5mm) BETWEEN card rows
    const interRowSpacing = 5; // Was 3 or 4, now 5mm
    const totalInterRowSpacing = (numberOfRowsPerPage - 1) * interRowSpacing;

    let baseTargetCardHeight =
      (availableHeightForCards - totalInterRowSpacing) / numberOfRowsPerPage;
    // MODIFIED: Increase targetCardHeight by a further 2%
    const targetCardHeight = baseTargetCardHeight * 0.99807; // Was baseTargetCardHeight * 0.9785

    const newColumnGap = contentWidth * 0.02;
    const targetCardWidth = (contentWidth - newColumnGap) / 2;

    // MODIFIED: Define separate vertical padding for image and text column
    const imageVerticalPadding = 2.5; // Padding for the image area (top and bottom)
    const textColumnVerticalPadding = 6; // Specific 10mm padding for text column (top and bottom)
    const cardHorizontalPadding = 3; // Existing padding for left/right of image/text areas

    const textBlockSpacing = 3; // Space between text blocks (e.g., auditor remarks and site team label)
    const cardTextLineHeight = 3.2;

    for (let i = 0; i < photoItemsForAnnex.length; i += 2) {
      const item1 = photoItemsForAnnex[i];
      const item2 =
        i + 1 < photoItemsForAnnex.length ? photoItemsForAnnex[i + 1] : null;

      if (
        currentY + targetCardHeight >
        pageHeight - pageMargin.bottom - pageNumberAllowance
      ) {
        doc.addPage();
        currentY = pageMargin.top;
        doc.setFontSize(16);
        doc.setTextColor(44, 62, 80);
        doc.text("Photo Annex", pageWidth / 2, currentY, { align: "center" });
        currentY += 6; // Space for title text
        currentY += 3; // Consistent space after title text on new page
      }

      let cardX = pageMargin.left;
      const cardRowY = currentY;

      const currentRowItems: AuditItemData[] = [];
      if (item1) currentRowItems.push(item1);
      if (item2) currentRowItems.push(item2);

      for (const [index, currentItem] of currentRowItems.entries()) {
        if (index === 1) {
          cardX += targetCardWidth + newColumnGap;
        }

        doc.setDrawColor(150, 150, 150);
        doc.rect(cardX, cardRowY, targetCardWidth, targetCardHeight, "S");

        // MODIFIED: Adjust image area for its specific vertical padding
        const imageAreaX = cardX + cardHorizontalPadding;
        const imageAreaY = cardRowY + imageVerticalPadding; // Use image's vertical padding
        const imageAreaWidth =
          targetCardWidth * 0.6 - cardHorizontalPadding * 1.5; // Keep horizontal padding logic
        const imageAreaMaxHeight = targetCardHeight - imageVerticalPadding * 2; // Account for image's top & bottom padding

        if (currentItem.photoUri) {
          const base64Image = await convertImageToBase64(currentItem.photoUri);
          if (base64Image) {
            const originalImgWidth = currentItem.originalImageWidth || 100;
            const originalImgHeight = currentItem.originalImageHeight || 100;

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
                `Error adding image for S/N ${currentItem.serialNumber}:`,
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

        // MODIFIED: Adjust text area for its specific 10mm vertical padding
        let textCurrentY = cardRowY + textColumnVerticalPadding; // Start text after text column's 10mm top padding
        const textDetailsAreaX =
          cardX + targetCardWidth * 0.6 + cardHorizontalPadding / 2;
        const textDetailsWidth =
          targetCardWidth * 0.4 - cardHorizontalPadding * 1.5; // Keep horizontal padding logic

        doc.setFontSize(8);
        doc.setTextColor(51, 51, 51);

        // S/N
        doc.text(
          `S/N: ${currentItem.serialNumber || "N/A"}`,
          textDetailsAreaX,
          textCurrentY,
          { maxWidth: textDetailsWidth }
        );
        textCurrentY += cardTextLineHeight;

        // Status
        const statusText = `Status: ${getConformityStatusForAnnex(
          currentItem.conformity,
          currentItem.riskLevel
        )}`;
        const statusLines = doc.splitTextToSize(statusText, textDetailsWidth);
        doc.text(statusLines, textDetailsAreaX, textCurrentY);
        textCurrentY += statusLines.length * cardTextLineHeight;

        // Auditor's Remarks Label
        doc.text("Auditor's Remarks:", textDetailsAreaX, textCurrentY, {
          maxWidth: textDetailsWidth,
        });
        textCurrentY += cardTextLineHeight;
        const auditorRemarksText = currentItem.auditorRemarks || "N/A";

        // MODIFIED: Anchor Site Team's Remarks to bottom considering text column's 10mm padding
        const siteTeamLabel = "Site Team's Remarks:";
        const siteTeamLabelLines = doc.splitTextToSize(
          siteTeamLabel,
          textDetailsWidth
        );
        const siteTeamLabelHeight =
          siteTeamLabelLines.length * cardTextLineHeight;

        let siteRemarksBoxHeight = 18 * 1.3; // Base height * 1.3 (30% increase)
        const spaceBetweenLabelAndBox = 1.5; // Reduced space

        // Calculate total height of the Site Team Remarks section (label + space + box)
        const siteTeamSectionTotalHeight =
          siteTeamLabelHeight + spaceBetweenLabelAndBox + siteRemarksBoxHeight;

        // Determine Y position for the Site Team Remarks label (from bottom of card content area, using text column's 10mm padding)
        const siteTeamLabelY =
          cardRowY +
          targetCardHeight -
          textColumnVerticalPadding - // Use text column's 10mm bottom padding
          siteTeamSectionTotalHeight;

        // Calculate available space for Auditor's Remarks
        const spaceForAuditorRemarks =
          siteTeamLabelY - textBlockSpacing - textCurrentY;

        // Draw Auditor's Remarks
        const auditorRemarksLines = doc.splitTextToSize(
          auditorRemarksText,
          textDetailsWidth
        );
        let linesDrawn = 0;
        for (const line of auditorRemarksLines) {
          if (
            (linesDrawn + 1) * cardTextLineHeight >
            spaceForAuditorRemarks - 0.5 // Small buffer
          ) {
            break;
          }
          doc.text(
            line,
            textDetailsAreaX,
            textCurrentY + linesDrawn * cardTextLineHeight,
            {
              maxWidth: textDetailsWidth,
            }
          );
          linesDrawn++;
        }

        // Draw Site Team's Remarks Label at its calculated Y position
        doc.text(siteTeamLabelLines, textDetailsAreaX, siteTeamLabelY);

        // Draw Site Team's Remarks Box below the label
        const siteRemarksBoxY =
          siteTeamLabelY + siteTeamLabelHeight + spaceBetweenLabelAndBox;
        doc.setDrawColor(200, 200, 200);
        doc.rect(
          textDetailsAreaX,
          siteRemarksBoxY,
          textDetailsWidth,
          siteRemarksBoxHeight,
          "S"
        );
      }
      currentY += targetCardHeight + interRowSpacing;
    }
  }

  addPageNumbers();
  return doc.output("datauristring");
};
