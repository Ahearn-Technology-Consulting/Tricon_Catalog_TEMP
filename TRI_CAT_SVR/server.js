const express = require("express");
const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3030;

app.use(cors());
app.use("/images", express.static(path.join(__dirname, "ORS_report/SyndicationAllCSVImages"))); // Serve images

let catalog = [];
let imageMap = {};

// ✅ First, Load Product Catalog CSV
fs.createReadStream("ORS_report/ORS_Core-Content.csv")
  .pipe(csv())
  .on("data", (row) => {
    if (!row["Sku"]) return; // Skip rows without an SKU

    const itemNumber = row["Sku"].trim(); // Assuming 'Sku' is the unique identifier

    catalog.push({
      sku: itemNumber,
      unspsc: row["UNSPSC"] || "",
      upc: row["UPC"] || "",
      mfgPartNumber: row["MfgPartNumber"] || "",
      category: row["Category"] ? row["Category"].split("|").map((c) => c.trim()) : [],
      descriptions: row["Descriptions"] ? row["Descriptions"].split(",").map((d) => d.trim()) : [],
      features: row["Features"] ? row["Features"].split("|").map((f) => f.trim()) : [],
      manufacturer: row["Manufacturer"] || "",
      brand: row["Brand"] || "",
      webUOM: row["WebUOM"] || "",
      hazmat: row["Hazmat"] || "",
      countryOfOrigin: row["CountryOfOrigin"] || "",
      standardPack: row["StandardPack"] || "",
      image: null, // Placeholder, will be updated when images are mapped
    });
  })
  .on("end", () => {
    console.log("✅ Product catalog CSV successfully loaded!");

    // ✅ Now, Load Image Mapping CSV
    fs.createReadStream("ORS_report/SyndicationAllCSVImages/publish315231_502278.csv")
      .pipe(csv())
      .on("data", (row) => {
        const itemNumber = row["Item Number"] ? row["Item Number"].trim() : null;
        const rawImagePath = row["Main_Large_Image_1"] ? row["Main_Large_Image_1"].trim() : null;
        if (itemNumber && rawImagePath) {
          // Fix backslashes to forward slashes for web paths
          const correctedPath = rawImagePath.replace(/\\/g, "/");
          imageMap[itemNumber] = `/images/${correctedPath}`;
        }
      })
      .on("end", () => {
        console.log("✅ Image mapping file loaded!");

        // ✅ Now, Assign Images to Catalog Items
        catalog = catalog.map((product) => ({
          ...product,
          image: imageMap[product.sku] || null, // Match images based on SKU and Item Number
        }));

        console.log("✅ Image paths successfully assigned to products!");
      });
  });

// API endpoint to fetch catalog data
app.get("/api/catalog", (req, res) => {
  res.json(catalog);
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
