const fs = require('fs');
const path = require('path');

// Chemins des fichiers d'entrée et de sortie
const inputPath = path.join(__dirname, 'src', 'data', 'course.json');
const outputPath = path.join(__dirname, 'thai_vocabulary.json');

try {
    // 1. Lire le fichier source course.json
    console.log('Lecture du fichier course.json...');
    const rawData = fs.readFileSync(inputPath, 'utf8');
    const courseData = JSON.parse(rawData);

    // 2. Extraire les données souhaitées
    const extractedData = courseData.lessons.map(lesson => {

        // Extraire la clé "th" des mots (sécurité: vérifier si le tableau existe)
        const wordsTh = lesson.words ? lesson.words.map(word => word.th) : [];

        // Extraire la clé "th" des phrases (sécurité: vérifier si le tableau existe)
        const phrasesTh = lesson.phrases ? lesson.phrases.map(phrase => phrase.th) : [];

        // Retourner un objet structuré pour la leçon en cours
        return {
            titre_fr: lesson.title,
            vocabulaire_thai: [...wordsTh, ...phrasesTh]
        };
    });

    // 3. Écrire les données extraites dans le nouveau fichier JSON
    fs.writeFileSync(outputPath, JSON.stringify(extractedData, null, 2), 'utf8');

    console.log(`✅ Succès ! Les données ont été extraites dans : ${outputPath}`);

} catch (error) {
    if (error.code === 'ENOENT') {
        console.error(`❌ Erreur : Le fichier introuvable. Vérifie le chemin : ${inputPath}`);
    } else {
        console.error('❌ Une erreur est survenue lors du traitement :', error);
    }
}