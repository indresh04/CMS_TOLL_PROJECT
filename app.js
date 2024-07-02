const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();
const port = 3000;

app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());  // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({ extended: true }));  // to support URL-encoded bodies

app.get('/', (req, res) => {
  try {
    const content = JSON.parse(fs.readFileSync('content.json', 'utf8'));
    res.render('index', { content });
  } catch (error) {
    console.error("Error reading or parsing content.json:", error);
    res.status(500).send("Internal Server Error");
  }
});

const priceData = {
  HighSecurityColourSticker: 350,
  HighSecurityElectricVehicle: 400,
  HighSecurityTractorTrailer: 450,
  OnlyColourSticker: 150,
  HeavyVehicle: 500,
  FourWheeler: 250,
  TwoWheeler: 200
};

app.get('/api/price', (req, res) => {
  const plateType = req.query.plate;

  if (priceData.hasOwnProperty(plateType)) {
    res.json({
      item: plateType,
      price: priceData[plateType],
      quantity: 1,
      unitPrice: 20,
      qr_code : 'https://www.researchgate.net/profile/Hafiza-Abas/publication/288303807/figure/fig1/AS:311239419940864@1451216668048/An-example-of-QR-code.png',
    });
  } else {
    res.status(404).json({ error: 'Invalid plate type' });
  }
});

// app.get('/api/price/', (req, res) => {
//   const plate = req.query.plate;
//   const mobileNumber = req.query.mobileNumber;
//   console.log(`Received request for plate: ${plate} and mobileNumber: ${mobileNumber}`);

//   fs.readFile('pricedata.json', 'utf8', (err, jsonData) => {
//     if (err) {
//       console.error("Error reading data file:", err);
//       return res.status(500).json({ error: 'Internal server error' });
//     }

//     try {
//       const data = JSON.parse(jsonData);
//       data.item = plate;
//       res.json(data);
//     } catch (parseErr) {
//       console.error("Error parsing JSON data:", parseErr);
//       res.status(500).json({ error: 'Internal server error' });
//     }
//   });
// });




app.get('/admin', (req, res) => {
  try {
    const content = JSON.parse(fs.readFileSync('content.json', 'utf8'));
    console.log("content", content);
    if (Object.keys(content).length < 1) {
      console.log("empty content, sending default content");
      const default_content = JSON.parse(fs.readFileSync('contentbkp.json', 'utf8'));
      res.render('admin', { content: default_content });
    } else {
      res.render('admin', { content });
    }
  } catch (error) {
    console.error("Error reading or parsing content.json:", error);
    try {
      const default_content = JSON.parse(fs.readFileSync('contentbkp.json', 'utf8'));
      res.render('admin', { content: default_content });
    } catch (backupError) {
      console.error("Error reading or parsing contentbkp.json:", backupError);
      res.status(500).send("Internal Server Error");
    }
  }
});

app.post('/admin/update', (req, res) => {
  console.log("Update data received by admin", req.body);
  try {
    // Ensure the incoming data is valid JSON
    if (typeof req.body !== 'object') {
      throw new Error('Invalid JSON data');
    }
    fs.writeFileSync('content.json', JSON.stringify(req.body, null, 2), 'utf8');
    res.redirect('/admin');
  } catch (error) {
    console.error("Error processing update:", error);
    res.status(400).send("Invalid data or internal server error");
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
