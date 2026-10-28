# 📄 Distinta Stampa Unione

Una soluzione open source basata su **Google Apps Script** per automatizzare la generazione di ordini di produzione in formato PDF a partire da un foglio **Google Sheets**, con l'integrazione di modelli **Google Docs** e codici 2D **DataMatrix**.

---

## 🖼️ Anteprima del Progetto

Ecco come appaiono il foglio di calcolo operativo e il documento PDF finale generato:

### 1. Google Sheets (Gestione Dati)
![Google Sheets](./screenshot-fogli.png)

### 2. Risultato Finale (PDF con DataMatrix)
![PDF Generato](./screenshot-esempio.png)

---

## 🚀 Caratteristiche Principali

* 📊 **Integrazione Google Workspace**: Generazione automatica di documenti PDF a partire da dati inseriti in Google Sheets.
* 🏷️ **Codici DataMatrix 2D**: Generazione e inserimento dinamico dei codici DataMatrix nel documento tramite la libreria [BWIP-JS](https://github.com/metafloor/bwip-js).
* 📑 **Gestione Modelli**: Utilizzo di file Google Docs come template grafici e strutturali.
* 📂 **Workflow e Destinazione Automatici**: Creazione automatica della sottocartella `reports` nella directory del progetto per il salvataggio ordinato di tutti i documenti PDF generati.

---

## 👁️ Esempio di Risultato (PDF)

Vuoi scaricare e visualizzare direttamente il documento finale? 
* 📥 **[Scarica l'Esempio di PDF Generato](./esempio-ordine.pdf)**

---

## 📂 Modelli e File di Esempio

Per testare e utilizzare il progetto, abbiamo messo a disposizione i file di esempio (Foglio di calcolo e Modello Google Docs) protetti in sola lettura. 

👉 **[Accedi alla Cartella dei Modelli di Esempio su Google Drive](https://drive.google.com/drive/folders/1TjsqBlEYKjHKwB-pydBG4JT9kQFHzxI4?usp=sharing)**

> **Come utilizzarli:**
> 1. Apri ciascun file presente nella cartella condivisa.
> 2. Seleziona dal menu **File > Crea una copia** per salvarne una versione modificabile all'interno del tuo Google Drive personale.

---

## 🛠️ Guida all'Installazione

1. **Copia i Modelli**: Salva una copia del Foglio Google e del Modello Google Doc nel tuo Google Drive (vedi link sopra).
2. **Apri Apps Script**: Nel tuo Foglio Google copiato, vai nel menu in alto e seleziona **Estensioni > Apps Script**.
3. **Incolla il Codice**: Cancella il codice predefinito nell'editor e incolla il contenuto del file [`stampa-unione.gs`](./stampa-unione.gs) presente in questo repository.
4. **Esecuzione Automatica**: Lo script rileverà automaticamente la cartella contenitrice e il modello Google Doc.
5. **Autorizzazione dello Script**: 
   * Al primo avvio o alla prima esecuzione di una funzione, Google richiederà di **concedere le autorizzazioni** per permettere allo script di interagire con i tuoi Fogli, Documenti e Drive.
   * Clicca su **"Autorizza accesso"**, seleziona il tuo account Google, fai clic su **"Avanzate"** e infine su **"Vai a [Nome del tuo progetto] (non sicuro)"** poiché lo script è stato creato da te. Completa accettando i permessi richiesti.
6. **Generazione Report**: Esegui lo script per generare gli ordini. Se la sottocartella **`reports`** non esiste ancora nella directory principale, lo script la creerà automaticamente e vi salverà i file PDF finali.

---

## 📋 Prerequisiti della Struttura Fogli
Per fare in modo che lo script legga correttamente i dati, assicurati che il Google Foglio di esempio mantenga la struttura delle intestazioni di colonna previste dal codice (es. riferimenti articolo, quantità, codici per il DataMatrix).

---

## 📌 Struttura della Stringa DataMatrix e Separatori `(12)` e `(34)`

Durante il processo di stampa unione, la stringa inviata per la generazione del codice 2D DataMatrix viene formattata combinando i valori delle colonne secondo la seguente sintassi:

```text
[Codice_Articolo](12)[Programma](34)[Codice_Ordine]
```

### Significato dei Separatori:
* **`(12)` (Separatore Articolo / Programma)**: Agisce da delimitatore di campo per separare nettamente il codice articolo dal programma di produzione durante la lettura.
* **`(34)` (Separatore Programma / Ordine)**: Identificatore e delimitatore di campo che separa il codice programma dall'identificativo unico dell'ordine di produzione.

L'adozione di questi identificatori all'interno della stringa DataMatrix permette ai lettori di codici 2D e ai sistemi software aziendali (MES/ERP) di parsare istantaneamente e con precisione i singoli campi durante la scansione industriale.

---

## ❓ FAQ & Troubleshooting

* **Dove vengono salvati i file PDF una volta generati?**  
  I PDF vengono depositati direttamente all'interno della sottocartella **`reports`**. Se non è presente, lo script provvederà a crearla automaticamente nella medesima cartella dove risiede il tuo Google Sheet.
* **Lo script dà un errore di autorizzazione durante l'esecuzione?** 
  Assicurati di aver completato tutti i passaggi di sblocco ("Avanzate" > "Vai a..."). Se modifichi i permessi richiesti nel codice, potrebbe essere necessario rieseguire l'autorizzazione.
* **Il codice DataMatrix non viene visualizzato correttamente nel PDF?** 
  Verifica che la stringa passata alla funzione di generazione del codice DataMatrix sia valida e che la libreria BWIP-JS venga richiamata correttamente nel progetto Apps Script.

---

## 📜 Crediti e Dipendenze

* Per la generazione dei codici DataMatrix viene utilizzata l'ottima libreria open source **[BWIP-JS](https://github.com/metafloor/bwip-js)** (Bar Code Writer in Pure JavaScript).

---

## 📄 Licenza

Questo progetto è rilasciato sotto licenza [MIT](LICENSE) - libero per uso personale e commerciale.