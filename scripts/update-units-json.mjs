import fs from 'fs';

const filePath = 'c:\\xampp\\htdocs\\thai-learn-officiel\\app\\data\\units.json';
const units = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

units.forEach(unit => {
  if (unit.titleEs === undefined) unit.titleEs = "";
  if (unit.titleDe === undefined) unit.titleDe = "";
  if (unit.titleIt === undefined) unit.titleIt = "";
  if (unit.descriptionEs === undefined) unit.descriptionEs = "";
  if (unit.descriptionDe === undefined) unit.descriptionDe = "";
  if (unit.descriptionIt === undefined) unit.descriptionIt = "";
});

fs.writeFileSync(filePath, JSON.stringify(units, null, 2), 'utf-8');
console.log('units.json updated successfully!');
