import fs from "fs";

const text = fs.readFileSync("C:/Users/Mohan/.gemini/antigravity/brain/962ee673-b5ae-48a3-82ab-02f579fd6d72/scratch/madanapalle_maps.html", "utf8");

// Search for strings around Golden hair
const matches = text.match(/Golden hair wig studio[^\"]{0,150}/gi) || [];
console.log("Name & Address matches:", [...new Set(matches)]);

// Search for street / road / lodge / pin code
const address = text.match(/[0-9]{2}-[0-9]{1,3}[^\"]{0,100}/g) || [];
console.log("Door number & address:", [...new Set(address)]);

const fullAddresses = text.match(/[^\"]*Madanapalle[^\"]*517[0-9]{3}[^\"]*/gi) || [];
console.log("Full addresses:", [...new Set(fullAddresses)].slice(0, 5));
