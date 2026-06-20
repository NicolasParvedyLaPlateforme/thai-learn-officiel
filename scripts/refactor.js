const { Project } = require("ts-morph");
const fs = require("fs");
const path = require("path");

const project = new Project({
    tsConfigFilePath: "tsconfig.json",
});

const componentsDir = "app/components";

const moves = {
  // layout
  'BottomNav.tsx': 'layout',
  'DesktopSidebarLeft.tsx': 'layout',
  'DesktopSidebarRight.tsx': 'layout',
  'MobileHeaderMenu.tsx': 'layout',
  'GlobalModals.tsx': 'layout',

  // widgets
  'ConversationObjectiveWidget.tsx': 'widgets',
  'DailyQuestsWidget.tsx': 'widgets',
  'LeaderboardWidget.tsx': 'widgets',

  // modals
  'CommunityModal.tsx': 'modals',
  'GoldConversionModal.tsx': 'modals',
  'LanguageSelectorModal.tsx': 'modals',
  'ReviewConfigModal.tsx': 'modals',
  'SpeakingConfigModal.tsx': 'modals',
  'ToneAnalyzerModal.tsx': 'modals',
  'WritingConfigModal.tsx': 'modals',

  // providers
  'AuthProvider.tsx': 'providers',
  'MotionProvider.tsx': 'providers',
  'ErrorBoundary.tsx': 'providers',
  'SyncProgress.tsx': 'providers',

  // ui
  'IconImage.tsx': 'ui',
  'LoadingScreen.tsx': 'ui',
  'PWAInstallButton.tsx': 'ui',

  // learn
  'LearnClientPage.tsx': 'learn',
  'LessonPathMap.tsx': 'learn',
  'DesktopLessonLevelsView.tsx': 'learn',
  'NextUnitCard.tsx': 'learn',
  'PairMatch.tsx': 'learn',
  'Hints.tsx': 'learn',
  'ColoredPhonetic.tsx': 'learn',

  // speak
  'SpeakClientPage.tsx': 'speak',
  'SpeakingExercise.tsx': 'speak',

  // alphabet
  'AlphabetCard.tsx': 'alphabet',

  // landing
  'LandingPageClient.tsx': 'landing'
};

// Create directories first just to be sure
const newDirs = [...new Set(Object.values(moves))];
for (const dir of newDirs) {
  const dirPath = path.join(__dirname, '..', componentsDir, dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

let movedCount = 0;

for (const [file, dir] of Object.entries(moves)) {
    const sourcePath = `${componentsDir}/${file}`;
    const sourceFile = project.getSourceFile(sourcePath);
    
    if (sourceFile) {
        // Move to the new directory
        const newPath = `${componentsDir}/${dir}/${file}`;
        sourceFile.moveToDirectory(`${componentsDir}/${dir}`);
        console.log(`Moved ${file} to ${dir}/`);
        movedCount++;
    } else {
        console.log(`Could not find ${sourcePath} in project`);
    }
}

console.log(`Saving ${movedCount} moved files and updating imports...`);
project.saveSync();
console.log("Done.");
