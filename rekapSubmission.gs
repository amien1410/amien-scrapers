// ID → Name mapping
const names = {
  6: "Awaludin",
  9: "Muhammad Anshori",
  10: "Zamroni",
  15: "Siska Amelia S.",
  19: "Muhammad Amin",
  21: "Niko Aprilianto",
  22: "Dhea Amanda",
  23: "Yudhistira Abdi Atmanegara",
  25: "Ria Margareta",
  27: "Manesta Edelweis Jingga",
  30: "Randi Ahmad Irwanto",
  34: "Rinda Syatwuri",
  36: "Alfi Hidayat",
  37: "Heri Miswar",
  38: "Alfiannor",
  39: "Adi Jumadi",
  42: "Salman",
  49: "Yunina Karina",
  50: "Ali Harun",
  51: "M. Rijali Riyadi",
  54: "Siti Raudhah",
  55: "M. Mustain",
  56: "Azhari Wahyu Widodo",
  57: "Melda Yanti",
  62: "Rahmat Dwi Purwanto",
  63: "Tony Prastio Aribowo",
  64: "Endik Panjaitan",
  74: "Yudhistira Abdi Atmanegara",
  84: "Mutiara Erwani",
  86: "Kurniawan",
  91: "Widhi Astuti",
  100: "Elisa",
  103: "Khafidzin",
  105: "Muhammad Khairunurrasyid",
  106: "Hilaliyah",
  107: "Khairun Nikmah",
  109: "Mina Warah",
  119: "Maulana",
  120: "Pak Budi Marketing",
  121: "Muhammad Alamsyah",
  122: "Ade Saputra",
  124: "Bayu Ramadhan",
  127: "M. Zainul Wathani",
  136: "Rojihah",
  137: "Aulya Rachmadia Mayta Putri",
  140: "Nisrina Adriyanthi",
  141: "Nur Kholipah",
  145: "Isma Imanda",
  150: "Chika Yaseliva",
  153: "Nurul Azizah",
  155: "Siti Zubaidah",
  157: "Mukhalafatun",
  158: "Ellina Normarisda",
  159: "Nopi Ariani",
  160: "Siti Nurhaliza",
  169: "MUHAMMAD RAMDHANI",
  170: "ANNISA REZMA SARI",
  171: "IRMA DWINA",
  172: "HIDAYATUR RAHMAN",
  173: "RISMAYANDI ANSARI",
  174: "NOREMILIA",
  175: "QUINE ZAHVA NOVENIA",
  176: "DHEA KHAIRIYAH",
  177: "BAYU PAMUNGKAS"
};

// Academic Years
const years = {
  27: "2025/2026 Semester 1",
  28: "2025/2026 Semester 2",
  29: "2026/2027 Semester 1",
  30: "2026/2027 Semester 2",
  31: "2027/2028 Semester 1",
  32: "2027/2028 Semester 2",
  33: "2028/2029 Semester 1",
  34: "2028/2029 Semester 2"
}

function fetchTugasLinks() {
  const sheet = SpreadsheetApp.openById("1zJ46qGeifa3k7Wcqd4c-t2k0Jvfg_qywgAgY9K9IEaY")
                              .getSheetByName("main");

  const endpoint = "https://guru.gibs.sch.id/teachers/get_tugas_links";

  // Fetch API response
  const response = UrlFetchApp.fetch(endpoint, { "muteHttpExceptions": true });
  const json = JSON.parse(response.getContentText());

  // Clear existing data
  sheet.clearContents();

  // Write header row
  const headers = [
    "id_tugas", "nama_guru", "id_tahun", "link",
    "judul", "kelas", "minggu_bulan", "type_tugas", "dibuat_tanggal"
  ];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);

  // Prepare data rows (replace id_guru → name)
  const rows = json.data.map(item => [
    item.id_tugas,
    names[item.id_guru] || "(Unknown)",  // ← mapped name
    years[item.id_tahun] || "(Unknown)",
    item.link,
    item.judul,
    item.kelas,
    item.minggu_bulan,
    item.type_tugas,
    item.dibuat_tanggal
  ]);

  // Write into sheet starting row 2
  sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
}

// function fetchAndUpdateTugasLinks() {
//   const ss = SpreadsheetApp.openById("1zJ46qGeifa3k7Wcqd4c-t2k0Jvfg_qywgAgY9K9IEaY");
//   const mainSheet = ss.getSheetByName("main");
//   const logSheet = ss.getSheetByName("logs");
//   const endpoint = "";

//   // Log helper
//   function log(message) {
//     if (logSheet) {
//       logSheet.appendRow([new Date(), message]);
//     } else {
//       console.log(message);
//     }
//   }

//   log("--- PROCESS STARTED ---");

//   // Fetch API data
//   let response;
//   try {
//     response = UrlFetchApp.fetch(endpoint, { muteHttpExceptions: true });
//   } catch (e) {
//     log("ERROR fetching data: " + e);
//     return;
//   }

//   const json = JSON.parse(response.getContentText());

//   if (!json.status || !json.data) {
//     log("ERROR: Invalid API response");
//     return;
//   }

//   log("API fetched successfully. Records received: " + json.data.length);

//   // --- FIX FOR THE ERROR ---
//   // Read existing main sheet data safely
//   const lastRow = mainSheet.getLastRow();
//   let existingIDs = new Set();

//   if (lastRow > 1) {
//     // Only attempt to get range if there are rows below the header (Row 1)
//     const existing = mainSheet.getRange(2, 1, lastRow - 1, 1).getValues();
//     existingIDs = new Set(existing.flat().filter(v => v !== ""));
//   } else {
//     log("Sheet is empty or has headers only. Proceeding with all API data.");
//   }
//   // -------------------------

//   // Prepare and insert new records
//   let newRows = [];

//   json.data.forEach(item => {
//     const id = item.id_tugas;

//     // Check if ID already exists to avoid duplicates
//     if (!existingIDs.has(id)) {
//       newRows.push([
//         item.id_tugas,
//         names[item.id_guru] || "(Unknown)",  // Using your global 'names' object
//         years[item.id_tahun] || "(Unknown)", // Using your global 'years' object
//         item.link,
//         item.judul,
//         item.kelas,
//         item.minggu_bulan,
//         item.type_tugas,
//         item.dibuat_tanggal
//       ]);
//     }
//   });

//   // Only update the sheet if there is actually new data to add
//   if (newRows.length > 0) {
//     const startRow = mainSheet.getLastRow() + 1;
//     mainSheet.getRange(startRow, 1, newRows.length, newRows[0].length).setValues(newRows);
//     log(`Added ${newRows.length} new records.`);
//   } else {
//     log("No new records found.");
//   }

//   log("--- PROCESS FINISHED ---");
// }

function fetchAndUpdateTugasLinks() {
  const ss = SpreadsheetApp.openById("1zJ46qGeifa3k7Wcqd4c-t2k0Jvfg_qywgAgY9K9IEaY");
  const mainSheet = ss.getSheetByName("main");
  const logSheet = ss.getSheetByName("logs");
  const endpoint = "";

  // Log helper - Fixed the #ERROR! formula issue
  function log(message) {
    if (logSheet) {
      logSheet.appendRow([new Date(), "'" + message]); 
    }
  }

  Logger.log("--- PROCESS STARTED ---");

  // Fetch API data
  let response;
  try {
    response = UrlFetchApp.fetch(endpoint, { muteHttpExceptions: true });
  } catch (e) {
    log("ERROR fetching data: " + e);
    return;
  }

  const json = JSON.parse(response.getContentText());
  if (!json.status || !json.data) {
    log("ERROR: Invalid API response");
    return;
  }

  Logger.log("API fetched. Records received: " + json.data.length);

  // --- IMPROVED DUPLICATE CHECK ---
  const lastRow = mainSheet.getLastRow();
  let existingIDs = new Set();

  if (lastRow > 1) {
    // Read Column A (ID column)
    const existingValues = mainSheet.getRange(2, 1, lastRow - 1, 1).getValues();
    
    // Convert every ID found in the sheet to a String to ensure match
    existingIDs = new Set(existingValues.flat().map(id => String(id).trim()));
  }

  let newRows = [];

  json.data.forEach(item => {
    // Convert API ID to String for strict comparison
    const apiId = String(item.id_tugas).trim();

    if (!existingIDs.has(apiId)) {
      newRows.push([
        item.id_tugas,
        names[item.id_guru] || "(Unknown)",
        years[item.id_tahun] || "(Unknown)",
        item.link,
        item.judul,
        item.kelas,
        item.minggu_bulan,
        item.type_tugas,
        item.dibuat_tanggal
      ]);
    }
  });

  // Final insertion
  if (newRows.length > 0) {
    const startRow = mainSheet.getLastRow() + 1;
    mainSheet.getRange(startRow, 1, newRows.length, newRows[0].length).setValues(newRows);
    log(`${newRows.length} new records`);
  } else {
    log("No new records");
  }

  Logger.log("--- PROCESS FINISHED ---");
}
