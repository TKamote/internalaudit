import * as FileSystem from "expo-file-system";
import {
  AuditSectionData,
  AuditItemData,
  RiskLevel,
  ConformityStatus,
} from "../features/auditPropertyChecklist/screens/AuditChecklistMainScreen";

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

export const generateHtmlForPdf = async (
  currentCategoryName: string,
  sections: AuditSectionData[]
): Promise<string> => {
  const photoItemsForAnnex: AuditItemData[] = [];

  const processItem = async (
    item: AuditItemData,
    indentLevel = 0
  ): Promise<string> => {
    let itemHtml = "";
    const indentStyle = `padding-left: ${indentLevel * 15}px;`;

    if (item.type === "header") {
      itemHtml += `
        <tr class="header-row">
          <td colspan="7" class="header-row-cell" style="${indentStyle}">
            ${item.serialNumber} ${item.description}
          </td>
        </tr>
      `;
      if (item.subItems && item.subItems.length > 0) {
        for (const subItem of item.subItems) {
          itemHtml += await processItem(subItem, indentLevel + 1);
        }
      }
    } else {
      const conformityDisplay = item.conformity === "conformed" ? "✓" : "";
      let ncStatus = "";
      if (item.conformity === "not-conformed") {
        ncStatus =
          item.riskLevel === "H"
            ? "Major"
            : item.riskLevel === "L" || item.riskLevel === "M"
            ? "Minor"
            : "";
      }
      itemHtml += `
        <tr class="data-row">
          <td style="${indentStyle}">${item.serialNumber || ""}</td>
          <td>${item.description || ""}</td>
          <td style="text-align: center;">${item.riskLevel || ""}</td>
          <td style="text-align: center;">${conformityDisplay}</td>
          <td style="text-align: center;">${ncStatus}</td>
          <td>${item.auditorRemarks || ""}</td>
          <td></td> 
        </tr>
      `;
      if (item.photoUri && item.conformity !== "not-applicable") {
        photoItemsForAnnex.push(item);
      }
    }
    return itemHtml;
  };

  // Generate separate tables for each section
  let sectionsHtml = "";
  for (let sectionIndex = 0; sectionIndex < sections.length; sectionIndex++) {
    const section = sections[sectionIndex];
    let sectionRowsHtml = "";

    if (section.items && section.items.length > 0) {
      for (const item of section.items) {
        sectionRowsHtml += await processItem(item, 0);
      }
    } else {
      sectionRowsHtml += `<tr class="no-items-row"><td colspan="7" style="padding: 8px; text-align: center;">No items in this section.</td></tr>`;
    }

    sectionsHtml += `
      <div class="table-container ${sectionIndex > 0 ? 'avoid-break' : ''}">
        <table class="section-table"> 
          <thead>
            <tr>
              <th class="col-sn">S/N</th>
              <th class="col-desc">Description</th>
              <th class="col-risk">Risk Level</th>
              <th class="col-conf">Conformed</th>
              <th class="col-nc">Not Conformed (Major / Minor)</th>
              <th class="col-auditor">Auditor's Remarks</th>
              <th class="col-site">Site Team's Remarks</th>
            </tr>
          </thead>
          <tbody>
            <tr class="section-header">
              <td colspan="7" class="section-header-cell">Section: ${section.name}</td>
            </tr>
            ${sectionRowsHtml}
          </tbody>
        </table>
      </div>
    `;
  }

  let photoAnnexHtml = "";
  if (photoItemsForAnnex.length > 0) {
    photoAnnexHtml += `<div class="photo-annex-container new-page"><h2>Photo Annex</h2>`;
    for (let i = 0; i < photoItemsForAnnex.length; i++) {
      const item = photoItemsForAnnex[i];
      const base64Image = item.photoUri
        ? await convertImageToBase64(item.photoUri)
        : null;
      const conformityText = getConformityStatusForAnnex(
        item.conformity,
        item.riskLevel
      );

      if (i % 2 === 0) {
        photoAnnexHtml += `<div class="photo-card-row avoid-break">`;
      }
      
      const isLastCard = i === photoItemsForAnnex.length - 1;
      const isSingleCardInRow = i % 2 === 0 && isLastCard;
      
      photoAnnexHtml += `
        <div class="photo-card ${isSingleCardInRow ? 'single-card' : ''}">
          <div class="card-photo-column">
            ${
              base64Image
                ? `<img src="${base64Image}" alt="Evidence for ${item.serialNumber}"/>`
                : '<p style="text-align:center; color: #777; padding: 10px;">Photo not available</p>'
            }
          </div>
          <div class="card-details-column">
            <div class="details-top-section">
              <p><strong>S/N:</strong> ${item.serialNumber || "N/A"}</p>
              <p><strong>Status:</strong> ${conformityText}</p>
              <p><strong>Auditor Remarks:</strong></p>
              <p class="remarks-text">${item.auditorRemarks || ""}</p>
            </div>
            <div class="details-bottom-section site-remarks-placeholder-box">
              Site Team's Remarks
            </div>
          </div>
        </div>
      `;
      if (i % 2 === 1 || isLastCard) {
        photoAnnexHtml += `</div>`;
      }
    }
    photoAnnexHtml += `</div>`;
  }

  return `
    <html>
      <head>
        <meta charset="UTF-8">
        <title>Audit Report: ${currentCategoryName}</title>
        <style>
          @page { 
            size: A4 portrait; 
            margin: 20mm 15mm 20mm 15mm; /* top right bottom left margins */
          }
          
          * {
            box-sizing: border-box;
          }
          
          html, body { 
            height: 100vh; 
            width: 100vw;
            margin: 0;
            padding: 0;
          }
          
          body { 
            font-family: Helvetica, Arial, sans-serif; 
            font-size: 9px; 
            line-height: 1.3; 
            -webkit-font-smoothing: antialiased; 
            color: #333; 
            padding: 15mm; /* Explicit body padding for better compatibility */
            min-height: 100vh;
          }
          
          h1 { 
            font-size: 18px; 
            color: #2c3e50; 
            border-bottom: 2px solid #3498db; 
            padding-bottom: 8px; 
            margin-top: 0; 
            margin-bottom: 20px; 
            text-align: center;
          }
          
          /* Split table approach for better page break control */
          .table-container {
            width: 100%;
            margin-bottom: 20px;
          }
          
          .section-table { 
            width: 100%;
            border-collapse: collapse; 
            margin-bottom: 30px; /* Space between sections */
            table-layout: fixed;
            break-inside: avoid;
            -webkit-column-break-inside: avoid;
            page-break-inside: avoid;
          }
          
          /* Force table header on each section */
          .section-table thead {
            display: table-header-group;
          }
          
          .section-table thead tr {
            background-color: #f2f2f2 !important;
          }
          
          .section-table tbody tr {
            break-inside: avoid;
            -webkit-column-break-inside: avoid;
            page-break-inside: avoid;
          }
          
          th, td { 
            border: 1px solid #ccc; 
            padding: 6px 4px; 
            text-align: left; 
            vertical-align: top; 
            word-wrap: break-word; 
            overflow-wrap: break-word;
          }
          
          th { 
            background-color: #f2f2f2 !important; 
            font-weight: bold; 
            font-size: 10px; 
            color: #333 !important;
          }
          
          td { 
            font-size: 9px; 
          }
          
          /* Section header styling */
          .section-header-cell {
            background-color: #e0e0e0 !important; 
            font-weight: bold; 
            padding: 8px; 
            text-align: center; 
            border-top: 2px solid #333 !important;
            font-size: 11px;
          }
          
          .header-row-cell {
            background-color: #f0f0f0 !important; 
            font-weight: bold;
          }
          
          /* Column widths */
          .col-sn { width: 7%; } 
          .col-desc { width: 30%; } 
          .col-risk { width: 8%; }
          .col-conf { width: 8%; } 
          .col-nc { width: 12%; } 
          .col-auditor { width: 20%; }
          .col-site { width: 15%; }
          
          /* Page break helpers */
          .page-break-before {
            break-before: page;
            -webkit-column-break-before: page;
            page-break-before: always;
          }
          
          .avoid-break {
            break-inside: avoid;
            -webkit-column-break-inside: avoid;
            page-break-inside: avoid;
          }

          /* Photo Annex Styles */
          .photo-annex-container { 
            margin-top: 40px;
            width: 100%; 
          }
          
          .photo-annex-container.new-page {
            break-before: page;
            -webkit-column-break-before: page;
            page-break-before: always;
            margin-top: 0; /* Reset margin for new page */
            padding-top: 0;
          }
          
          .photo-annex-container h2 { 
            font-size: 16px; 
            color: #2c3e50; 
            border-bottom: 1px solid #3498db; 
            padding-bottom: 6px; 
            margin-top: 0;
            margin-bottom: 25px; 
            text-align: center;
          }
          
          .photo-card-row { 
            display: flex; 
            flex-direction: row; 
            justify-content: space-between;
            margin-bottom: 20px; 
            width: 100%;
            min-height: 250px;
          }
          
          .photo-card-row.avoid-break {
            break-inside: avoid;
            -webkit-column-break-inside: avoid;
            page-break-inside: avoid;
          }
          
          .photo-card {
            box-sizing: border-box; 
            width: 48%;
            border: 1px solid #b0b0b0; 
            display: flex; 
            flex-direction: row;
            min-height: 250px;
            max-height: 250px;
            background-color: #fdfdfd;
          }
          
          .photo-card.single-card {
            width: 100%;
          }
          
          .card-photo-column {
            box-sizing: border-box; 
            width: 55%;
            padding: 6px;
            display: flex; 
            align-items: center; 
            justify-content: center;
            border-right: 1px solid #e0e0e0; 
          }
          
          .card-photo-column img {
            max-width: 100%; 
            max-height: 230px;
            height: auto; 
            display: block; 
            margin: 0;
            padding: 0;
            object-fit: contain;
          }
          
          .card-details-column { 
            box-sizing: border-box; 
            width: 45%;
            padding: 8px; 
            display: flex; 
            flex-direction: column;
            justify-content: space-between; 
          }
          
          .details-top-section p {
            margin: 0 0 5px 0; 
            font-size: 8px;
            line-height: 1.2;
          }
          
          .details-top-section p.remarks-text {
             white-space: pre-wrap; 
             word-wrap: break-word;
             max-height: 90px;
             overflow-y: hidden; 
             margin-bottom: 10px; 
             font-size: 7px;
             line-height: 1.1;
          }
          
          .details-bottom-section.site-remarks-placeholder-box { 
            box-sizing: border-box; 
            border: 1px solid #999;
            width: 100%; 
            height: 85px; 
            padding: 6px; 
            font-size: 8px; 
            color: #555; 
            font-weight: bold;
            display: flex; 
            align-items: flex-start; 
            justify-content: flex-start; 
            text-align: left;
            margin-top: auto; 
          }
          
          /* Print-specific adjustments */
          @media print {
            body {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            
            .section-table {
              margin-bottom: 25mm; /* Ensure space between sections in print */
            }
            
            .photo-card-row {
              margin-bottom: 15mm;
            }
          }
        </style>
      </head>
      <body>
        <h1>Audit Report: ${currentCategoryName}</h1>
        ${sectionsHtml}
        ${photoAnnexHtml}
      </body>
    </html>
  `;
};