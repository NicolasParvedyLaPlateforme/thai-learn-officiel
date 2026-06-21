const { Project } = require("ts-morph");
const path = require("path");

const project = new Project({
    tsConfigFilePath: "tsconfig.json",
});

const wrongBaseDir = "app/components/app/components";
const sourceFiles = project.getSourceFiles(`${wrongBaseDir}/**/*.tsx`);

console.log(`Found ${sourceFiles.length} files to move back.`);

let movedCount = 0;
for (const sourceFile of sourceFiles) {
    const dirName = sourceFile.getDirectory().getBaseName();
    const newDirAbsolutePath = path.resolve(__dirname, '..', 'app', 'components', dirName);
    
    sourceFile.moveToDirectory(newDirAbsolutePath);
    movedCount++;
    console.log(`Moved ${sourceFile.getBaseName()} to ${dirName}`);
}

console.log(`Saving ${movedCount} files...`);
project.saveSync();
console.log("Done.");
