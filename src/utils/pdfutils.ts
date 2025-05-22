import * as FileSystem from 'expo-file-system';
// Adjust this path to be correct relative to src/utils/
import { AuditSectionData, AuditItemData } from '../features/auditPropertyChecklist/screens/AuditChecklistMainScreen';


export const convertImageToBase64 = async (uri: string): Promise<string | null> => {
  try {
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    let imageType = 'jpeg'; // Default
    if (uri.endsWith('.png')) {
      imageType = 'png';
    } else if (uri.endsWith('.jpg') || uri.endsWith('.jpeg')) {
      imageType = 'jpeg';
    }
    // Add more image types if needed
    return `data:image/${imageType};base64,${base64}`;
  } catch (error) {
    console.error("Error converting image to base64:", error);
    return null;
  }
};

export const generateHtmlForPdf = async (
  currentCategoryName: string,
  sections: AuditSectionData[]
): Promise<string> => {
  let itemsHtml = "";

  const processItemToHtml = async (item: AuditItemData, indentLevel = 0): Promise<void> => {
    const indentStyle = `margin-left: ${indentLevel * 20}px;`; // Indentation for HTML
    
    if (item.type === 'header') {
      itemsHtml += `<div style="${indentStyle}"><h3>${item.serialNumber} ${item.description}</h3></div>`;
      if (item.subItems && item.subItems.length > 0) {
        for (const subItem of item.subItems) {
          await processItemToHtml(subItem, indentLevel + 1);
        }
      }
    } else { // type === 'item'
      let photoHtml = "";
      if (item.photoUri) {
        const base64Image = await convertImageToBase64(item.photoUri);
        if (base64Image) {
          photoHtml = `<div style="margin-top: 5px;"><img src="${base64Image}" style="max-width: 250px; max-height: 250px; border: 1px solid #ccc;" alt="Evidence"/></div>`;
        } else {
          photoHtml = `<p style="color: red; ${indentStyle}">Error loading photo for ${item.serialNumber}</p>`;
        }
      }

      itemsHtml += `
        <div style="${indentStyle} border-bottom: 1px solid #eee; padding-bottom: 10px; margin-bottom: 10px;">
          <p><strong>${item.serialNumber} ${item.description}</strong></p>
          <p>Conformity: ${item.conformity || 'Not Set'}</p>
          <p>Remarks: ${item.auditorRemarks || 'N/A'}</p>
          ${photoHtml}
        </div>
      `;
    }
  };

  for (const section of sections) {
    itemsHtml += `<h2>Section: ${section.name}</h2>`;
    if (section.items && section.items.length > 0) {
      for (const item of section.items) {
        await processItemToHtml(item, 0); // Start top-level items with indent 0
      }
    } else {
      itemsHtml += `<p>No items in this section.</p>`;
    }
  }

  return `
    <html>
      <head>
        <meta charset="UTF-8">
        <title>Audit Report: ${currentCategoryName}</title>
        <style>
          body { font-family: Helvetica, Arial, sans-serif; font-size: 10px; line-height: 1.4; }
          h1 { font-size: 20px; color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 8px; margin-bottom: 20px; }
          h2 { font-size: 16px; color: #34495e; margin-top: 25px; border-bottom: 1px solid #bdc3c7; padding-bottom: 6px; margin-bottom: 15px;}
          h3 { font-size: 13px; color: #7f8c8d; margin-top: 15px; margin-bottom: 5px; font-weight: bold; }
          p { margin: 4px 0; }
          strong { font-weight: bold; }
          img { display: block; margin-top: 8px; border-radius: 4px; }
          div > div { /* Basic styling for nested items */ padding-left: 10px; }
        </style>
      </head>
      <body>
        <h1>Audit Report: ${currentCategoryName}</h1>
        ${itemsHtml}
      </body>
    </html>
  `;
};