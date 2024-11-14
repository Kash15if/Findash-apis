const express = require('express');
const multer = require('multer');
const xlsx = require('xlsx');
const cors = require('cors');

const app = express();
const PORT = 8000;

app.use(cors());

// Multer setup for file upload
const upload = multer({ storage: multer.memoryStorage() });

// Route to handle file upload and process the Excel file
app.post('/upload', upload.single('file'), (req, res) => {
  const fileBuffer = req.file.buffer;
  const workbook = xlsx.read(fileBuffer, { type: 'buffer' });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = xlsx.utils.sheet_to_json(sheet);

  // Calculate aggregated data
  let perDayBalance = {};
  let perMonthCredit = {};
  let perMonthDebit = {};
  let totalCredit = 0;
  let totalDebit = 0;

  data.forEach(row => {
    const date = new Date(row.Date);
    const day = row.Date;
    const month = date.toISOString().slice(0, 7); // YYYY-MM format

    const debit = row['Debit'] || 0;
    const credit = row['Credit'] || 0;
    
    perDayBalance[day] = (perDayBalance[day] || 0) + credit - debit;
    perMonthCredit[month] = (perMonthCredit[month] || 0) + credit;
    perMonthDebit[month] = (perMonthDebit[month] || 0) + debit;

    totalCredit += credit;
    totalDebit += debit;
  });

  res.json({
    perDayBalance,
    perMonthCredit,
    perMonthDebit,
    totalCredit,
    totalDebit,
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
