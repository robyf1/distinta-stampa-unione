/**
 * 1. Funzione principale di Stampa Unione (Ora è la prima in cima al file e alla lista)
 */
function creaOrdiniProduzione() {
  Logger.log("=== INIZIO ESECUZIONE STAMPA UNIONE ===");
  
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getActiveSheet();
  var data = sheet.getDataRange().getValues();

  if (data.length < 2) {
    SpreadsheetApp.getUi().alert("Errore: Il foglio attivo non contiene dati sufficienti.");
    return;
  }

  // Recupera la cartella contenitrice del file corrente
  var ssFile = DriveApp.getFileById(ss.getId());
  var parents = ssFile.getParents();
  if (!parents.hasNext()) {
    SpreadsheetApp.getUi().alert("Errore: Impossibile individuare la cartella del file.");
    return;
  }
  var parentFolder = parents.next();

  // Gestione sottocartella "reports"
  var reportsFolder;
  var subFolders = parentFolder.getFoldersByName("reports");
  if (subFolders.hasNext()) {
    reportsFolder = subFolders.next();
  } else {
    reportsFolder = parentFolder.createFolder("reports");
  }

  // Cerca il Modello Google Doc nella stessa cartella
  var files = parentFolder.getFiles();
  var templateFile = null;
  while (files.hasNext()) {
    var f = files.next();
    if (f.getMimeType() === MimeType.GOOGLE_DOCS && f.getId() !== ss.getId()) {
      templateFile = f;
      break;
    }
  }

  if (!templateFile) {
    SpreadsheetApp.getUi().alert("Errore: Nessun modello Google Doc trovato nella cartella.");
    return;
  }

  // Individua la riga delle intestazioni
  var headers = [];
  var startRow = 1;
  for (var r = 0; r < Math.min(data.length, 10); r++) {
    var rowText = data[r].join(" ").toLowerCase();
    if (rowText.indexOf("codice_articolo") !== -1 || rowText.indexOf("codice_ordine") !== -1 || rowText.indexOf("programma") !== -1) {
      headers = data[r];
      startRow = r + 1;
      break;
    }
  }

  if (headers.length === 0) {
    headers = data[0];
    startRow = 1;
  }

  var idxArticolo = headers.indexOf("Codice_Articolo");
  var idxProgramma = headers.indexOf("Programma");
  var idxOrdine = headers.indexOf("Codice_Ordine");

  if (idxArticolo === -1) idxArticolo = 0;
  if (idxProgramma === -1) idxProgramma = 1;
  if (idxOrdine === -1) idxOrdine = 2;

  var righeProcessate = 0;
  var erroriBarcode = [];

  // Ciclo di elaborazione dati
  for (var i = startRow; i < data.length; i++) {
    var row = data[i];
    if (!row.join("").trim()) continue;

    var articolo = (row[idxArticolo] !== undefined && row[idxArticolo] !== null) ? row[idxArticolo].toString() : "";
    var programma = (row[idxProgramma] !== undefined && row[idxProgramma] !== null) ? row[idxProgramma].toString() : "";
    var ordine = (row[idxOrdine] !== undefined && row[idxOrdine] !== null) ? row[idxOrdine].toString() : ("Ordine_" + i);

    if (!ordine) continue;

    var barcodeString = articolo + "(12)" + programma + "(34)" + ordine;

    // Crea copia temporanea del Modello Google Doc
    var newDocFile = templateFile.makeCopy("Temp_" + ordine, parentFolder);
    var newDoc = DocumentApp.openById(newDocFile.getId());
    var body = newDoc.getBody();

    // Sostituzione dei tag nei documenti
    for (var j = 0; j < headers.length; j++) {
      var key = headers[j];
      if (!key) continue;
      var rawValue = row[j];
      var value = "";
      if (rawValue instanceof Date) {
        value = Utilities.formatDate(rawValue, Session.getScriptTimeZone(), "dd/MM/yyyy");
      } else if (rawValue !== null && rawValue !== undefined) {
        value = rawValue.toString();
      }
      body.replaceText("«" + key + "»", value);
      body.replaceText("{{" + key + "}}", value);
    }

    body.replaceText("«Codice_Barre»", barcodeString);
    body.replaceText("{{Codice_Barre}}", barcodeString);

    // Inserisci DataMatrix
    var risultato = inserisciBarcodeImmagine(body, barcodeString);
    if (!risultato.ok && risultato.presente) {
      erroriBarcode.push(ordine + " → " + risultato.messaggio);
    }

    newDoc.saveAndClose();

    // Genera PDF e salva nella cartella reports
    var pdfBlob = newDocFile.getAs('application/pdf');
    reportsFolder.createFile(pdfBlob).setName("Ordine_Produzione_" + ordine + ".pdf");
    newDocFile.setTrashed(true);

    righeProcessate++;
  }

  // Messaggio finale
  var msg = "Stampa unione completata con successo!\n\nRighe elaborate: " + righeProcessate + "\nI file PDF sono stati salvati nella sottocartella 'reports'.";
  if (erroriBarcode.length > 0) {
    msg += "\n\n⚠️ Avvisi Barcode:\n- " + erroriBarcode.join("\n- ");
  }
  SpreadsheetApp.getUi().alert(msg);
}

/**
 * 2. Menu personalizzato (Ora posizionato sotto)
 */
function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('Stampa Unione')
    .addItem('Genera Ordini di Produzione (PDF)', 'creaOrdiniProduzione')
    .addToUi();
}

/**
 * 3. Genera e inserisce l'immagine del codice DataMatrix via API BWIP-JS
 */
function inserisciBarcodeImmagine(body, barcodeString) {
  var tag = "«Codice_Barre_Image»";
  var plainText = body.getText();
  
  if (plainText.indexOf("Codice_Barre_Image") === -1 && plainText.indexOf("{{Codice_Barre_Image}}") === -1) {
    return { ok: false, presente: false, messaggio: "placeholder assente" };
  }

  var found = body.findText("«Codice_Barre_Image»") || body.findText("{{Codice_Barre_Image}}");
  if (!found) return { ok: false, presente: true, messaggio: "tag non trovato" };

  try {
    var url = "https://bwipjs-api.metafloor.com/?bcid=datamatrix&text=" + encodeURIComponent(barcodeString) + "&scale=6";
    var resp = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
    if (resp.getResponseCode() !== 200) {
      return { ok: false, presente: true, messaggio: "API HTTP " + resp.getResponseCode() };
    }
    
    var imgBlob = resp.getBlob();
    var el = found.getElement();
    var container = el.getParent();
    while (container && container.getType() !== DocumentApp.ElementType.PARAGRAPH) {
      container = container.getParent();
    }

    var idx = container.asParagraph().getChildIndex(el);
    var inlineImg = container.asParagraph().insertInlineImage(idx, imgBlob);
    inlineImg.setWidth(90);
    inlineImg.setHeight(90);
    
    body.replaceText("«Codice_Barre_Image»", "");
    body.replaceText("{{Codice_Barre_Image}}", "");
    return { ok: true, presente: true, messaggio: "" };
  } catch (e) {
    return { ok: false, presente: true, messaggio: e.message };
  }
}