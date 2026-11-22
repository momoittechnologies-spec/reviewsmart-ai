import fs from "fs";

const text = fs.readFileSync("C:/Users/Mohan/.gemini/antigravity/brain/962ee673-b5ae-48a3-82ab-02f579fd6d72/scratch/roshan_maps.html", "utf8");

const matches = text.match(/[^\"]*13\/403[^\"]*/g) || [];
console.log("13/403 matches:", [...new Set(matches)]);

const full = text.match(/[^\"]*Ganagapeta[^\"]*516001[^\"]*/g) || [];
console.log("Full address matches:", [...new Set(full)].slice(0, 5));

const phones = text.match(/[6-9]\d{9}/g) || [];
console.log("Phones in HTML:", [...new Set(phones)]);
