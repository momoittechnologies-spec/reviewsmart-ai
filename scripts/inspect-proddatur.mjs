import fs from "fs";

const text = fs.readFileSync("C:/Users/Mohan/.gemini/antigravity/brain/962ee673-b5ae-48a3-82ab-02f579fd6d72/scratch/proddatur_maps.html", "utf8");

// Search for strings around Golden hair
const matches = text.match(/Golden Hair[^\"]{0,150}/gi) || [];
console.log("Name & Address matches:", [...new Set(matches)]);

// Search for street / road / colony / pin code
const address = text.match(/[^\"]*Haji Syed Hussain[^\"]*/g) || [];
console.log("Haji Syed Hussain matches:", [...new Set(address)]);

const fullAddresses = text.match(/[^\"]*Proddatur[^\"]*516[0-9]{3}[^\"]*/gi) || [];
console.log("Full addresses:", [...new Set(fullAddresses)].slice(0, 5));
