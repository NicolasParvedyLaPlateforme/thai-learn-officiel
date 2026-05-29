const fs = require('fs');

const dataFile = './app/data/course.json';
const course = JSON.parse(fs.readFileSync(dataFile, 'utf8'));

// Filter out to keep only lesson-1 to lesson-19 (Unit 1 and 2)
course.lessons = course.lessons.filter(l => {
  const num = parseInt(l.id.replace('lesson-', ''));
  return num < 20;
});

const cBilan = (id, title, desc) => ({
  id: `lesson-${id}`,
  title,
  description: desc,
  isReview: true,
  words: [],
  phrases: []
});

const newLessons = [
  // --- UNIT 3 ---
  {
    id: "lesson-20", title: "Au Menu : Viandes", description: "Poulet, porc, poisson",
    words: [
      {id:"w_kai", th:"ไก่", fr:"poulet", phonetic:"kai"},
      {id:"w_moo", th:"หมู", fr:"porc", phonetic:"moo"},
      {id:"w_pla", th:"ปลา", fr:"poisson", phonetic:"pla"},
      {id:"w_nuea", th:"เนื้อ", fr:"viande / boeuf", phonetic:"nuea"}
    ],
    phrases: [
      {id:"p_eat_chicken", th:"กินไก่", fr:"manger du poulet", phonetic:"kin kai", components:["w_kin", "w_kai"]},
      {id:"p_want_fish", th:"อยากกินปลา", fr:"je veux manger du poisson", phonetic:"yak kin pla", components:["w_yak", "w_kin", "w_pla"]}
    ]
  },
  {
    id: "lesson-21", title: "Boissons et Soif", description: "Café, thé, boire",
    words: [
      {id:"w_kafae", th:"กาแฟ", fr:"café", phonetic:"ka-fae"},
      {id:"w_cha", th:"ชา", fr:"thé", phonetic:"cha"},
      {id:"w_bia", th:"เบียร์", fr:"bière", phonetic:"bia"},
      {id:"w_duem", th:"ดื่ม", fr:"boire", phonetic:"duem"}
    ],
    phrases: [
      {id:"p_drink_water", th:"ดื่มน้ำ", fr:"boire de l'eau", phonetic:"duem nam", components:["w_duem", "w_nam"]},
      {id:"p_want_coffee_m", th:"เอากาแฟครับ", fr:"je prends un café (homme)", phonetic:"ao ka-fae krap", components:["w_ao", "w_kafae", "w_krap"]}
    ]
  },
  {
    id: "lesson-22", title: "Saveurs", description: "Sucré, salé, épicé",
    words: [
      {id:"w_waan", th:"หวาน", fr:"sucré", phonetic:"waan"},
      {id:"w_khem", th:"เค็ม", fr:"salé", phonetic:"khem"},
      {id:"w_priao", th:"เปรี้ยว", fr:"aigre / acide", phonetic:"priao"}
    ],
    phrases: [
      {id:"p_very_sweet", th:"หวานมาก", fr:"très sucré", phonetic:"waan mak", components:["w_waan", "w_mak"]},
      {id:"p_not_spicy", th:"ไม่เผ็ด", fr:"pas épicé", phonetic:"mai phet", components:["w_mai_neg", "w_phet"]}
    ]
  },
  {
    id: "lesson-23", title: "Le Service", description: "Faim, addition",
    words: [
      {id:"w_gep_ngoen", th:"เก็บเงิน", fr:"l'addition", phonetic:"gep ngoen"},
      {id:"w_hiw", th:"หิว", fr:"avoir faim", phonetic:"hiw"},
      {id:"w_im", th:"อิ่ม", fr:"rassasié / plein", phonetic:"im"}
    ],
    phrases: [
      {id:"p_bill_please", th:"เก็บเงินด้วยครับ", fr:"l'addition s'il vous plaît", phonetic:"gep ngoen duay krap", components:["w_gep_ngoen", "w_krap"]},
      {id:"p_very_hungry", th:"หิวมาก", fr:"j'ai très faim", phonetic:"hiw mak", components:["w_hiw", "w_mak"]}
    ]
  },
  cBilan(24, "Bilan Unité 3", "Test sur la nourriture"),

  // --- UNIT 4 ---
  {
    id: "lesson-25", title: "Verbes d'action 1", description: "Regarder, écouter, marcher",
    words: [
      {id:"w_doo", th:"ดู", fr:"regarder", phonetic:"doo"},
      {id:"w_fang", th:"ฟัง", fr:"écouter", phonetic:"fang"},
      {id:"w_doen", th:"เดิน", fr:"marcher", phonetic:"doen"},
      {id:"w_nang", th:"หนัง", fr:"film", phonetic:"nang"}
    ],
    phrases: [
      {id:"p_watch_film", th:"ดูหนัง", fr:"regarder un film", phonetic:"doo nang", components:["w_doo", "w_nang"]}
    ]
  },
  {
    id: "lesson-26", title: "Verbes d'action 2", description: "Travailler, dormir, jouer",
    words: [
      {id:"w_tham_ngan", th:"ทำงาน", fr:"travailler", phonetic:"tham-ngan"},
      {id:"w_len", th:"เล่น", fr:"jouer", phonetic:"len"},
      {id:"w_kreng", th:"เก่ง", fr:"doué / bien", phonetic:"keng"}
    ],
    phrases: [
      {id:"p_play_well", th:"เล่นเก่ง", fr:"bien jouer", phonetic:"len keng", components:["w_len", "w_kreng"]},
      {id:"p_go_work", th:"ไปทำงาน", fr:"aller travailler", phonetic:"pai tham-ngan", components:["w_pai", "w_tham_ngan"]}
    ]
  },
  {
    id: "lesson-27", title: "Apprentissage", description: "Apprendre, lire, écrire",
    words: [
      {id:"w_rian", th:"เรียน", fr:"apprendre", phonetic:"rian"},
      {id:"w_aan", th:"อ่าน", fr:"lire", phonetic:"aan"},
      {id:"w_khian", th:"เขียน", fr:"écrire", phonetic:"khian"},
      {id:"w_nangsue", th:"หนังสือ", fr:"livre", phonetic:"nang-sue"}
    ],
    phrases: [
      {id:"p_read_book", th:"อ่านหนังสือ", fr:"lire un livre", phonetic:"aan nang-sue", components:["w_aan", "w_nangsue"]},
      {id:"p_learn_thai", th:"เรียนภาษาไทย", fr:"apprendre le thaï", phonetic:"rian pha-sa thai", components:["w_rian"]} // Assuming 'pha-sa thai' can be treated as a block or simplified. Let's add language word.
    ]
  },
  {
    id: "lesson-28", title: "Commerce", description: "Vendre, donner, argent",
    words: [
      {id:"w_khai", th:"ขาย", fr:"vendre", phonetic:"khai"},
      {id:"w_hai", th:"ให้", fr:"donner", phonetic:"hai"},
      {id:"w_ngoen", th:"เงิน", fr:"argent", phonetic:"ngoen"}
    ],
    phrases: [
      {id:"p_have_money", th:"มีเงินไหม", fr:"as-tu de l'argent ?", phonetic:"mee ngoen mai", components:["w_mee", "w_ngoen", "w_mai"]}
    ]
  },
  cBilan(29, "Bilan Unité 4", "Test sur les actions"),

  // --- UNIT 5 ---
  {
    id: "lesson-30", title: "Moments du jour", description: "Matin, Soir, Nuit",
    words: [
      {id:"w_chao", th:"เช้า", fr:"matin", phonetic:"chao"},
      {id:"w_yen", th:"เย็น", fr:"soir", phonetic:"yen"},
      {id:"w_khuen", th:"คืน", fr:"nuit", phonetic:"khuen"}
    ],
    phrases: [
      {id:"p_this_morning", th:"เช้านี้", fr:"ce matin", phonetic:"chao nee", components:["w_chao", "w_nee"]}
    ]
  },
  {
    id: "lesson-31", title: "Météo de base", description: "Pluie, Soleil",
    words: [
      {id:"w_fon", th:"ฝน", fr:"pluie", phonetic:"fon"},
      {id:"w_tok", th:"ตก", fr:"tomber", phonetic:"tok"},
      {id:"w_daet", th:"แดด", fr:"soleil (rayons)", phonetic:"daet"}
    ],
    phrases: [
      {id:"p_rain_falls", th:"ฝนตก", fr:"il pleut", phonetic:"fon tok", components:["w_fon", "w_tok"]}
    ]
  },
  {
    id: "lesson-32", title: "Températures", description: "Chaud, froid, air",
    words: [
      {id:"w_lom", th:"ลม", fr:"vent", phonetic:"lom"},
      {id:"w_ron", th:"ร้อน", fr:"chaud", phonetic:"ron"},
      {id:"w_naow", th:"หนาว", fr:"froid", phonetic:"naow"}
    ],
    phrases: [
      {id:"p_very_cold", th:"หนาวมาก", fr:"il fait très froid", phonetic:"naow mak", components:["w_naow", "w_mak"]}
    ]
  },
  {
    id: "lesson-33", title: "Questions de temps", description: "Quand ?",
    words: [
      {id:"w_muearai", th:"เมื่อไหร่", fr:"quand ?", phonetic:"muea-rai"},
      {id:"w_ki", th:"กี่", fr:"combien de", phonetic:"ki"},
      {id:"w_mong", th:"โมง", fr:"heure", phonetic:"mong"}
    ],
    phrases: [
      {id:"p_what_time", th:"กี่โมง", fr:"quelle heure ?", phonetic:"ki mong", components:["w_ki", "w_mong"]},
      {id:"p_go_when", th:"ไปเมื่อไหร่", fr:"tu y vas quand ?", phonetic:"pai muea-rai", components:["w_pai", "w_muearai"]}
    ]
  },
  cBilan(34, "Bilan Unité 5", "Test Temps et Météo"),

  // --- UNIT 6 ---
  {
    id: "lesson-35", title: "Lieux 1", description: "Hôtel, école",
    words: [
      {id:"w_rong_raem", th:"โรงแรม", fr:"hôtel", phonetic:"rong-raem"},
      {id:"w_rong_rian", th:"โรงเรียน", fr:"école", phonetic:"rong-rian"}
    ],
    phrases: [
      {id:"p_where_hotel", th:"โรงแรมอยู่ที่ไหน", fr:"où est l'hôtel ?", phonetic:"rong-raem yu thi nai", components:["w_rong_raem", "w_thi_nai"]}
    ]
  },
  {
    id: "lesson-36", title: "Lieux 2", description: "Marché, rue",
    words: [
      {id:"w_talat", th:"ตลาด", fr:"marché", phonetic:"ta-lat"},
      {id:"w_thanon", th:"ถนน", fr:"rue", phonetic:"tha-non"},
      {id:"w_suan", th:"สวน", fr:"parc", phonetic:"suan"}
    ],
    phrases: [
      {id:"p_go_market", th:"ไปตลาด", fr:"aller au marché", phonetic:"pai ta-lat", components:["w_pai", "w_talat"]}
    ]
  },
  {
    id: "lesson-37", title: "Transports en commun", description: "Bus, bateau",
    words: [
      {id:"w_rot_me", th:"รถเมล์", fr:"bus", phonetic:"rot-me"},
      {id:"w_ruea", th:"เรือ", fr:"bateau", phonetic:"ruea"},
      {id:"w_nang_v", th:"นั่ง", fr:"s'asseoir / prendre (bus)", phonetic:"nang"}
    ],
    phrases: [
      {id:"p_take_bus", th:"นั่งรถเมล์", fr:"prendre le bus", phonetic:"nang rot-me", components:["w_nang_v", "w_rot_me"]}
    ]
  },
  {
    id: "lesson-38", title: "Aviation", description: "Avion, voler",
    words: [
      {id:"w_kruang_bin", th:"เครื่องบิน", fr:"avion", phonetic:"kruang-bin"},
      {id:"w_bin", th:"บิน", fr:"voler", phonetic:"bin"},
      {id:"w_tua", th:"ตั๋ว", fr:"billet / ticket", phonetic:"tua"}
    ],
    phrases: [
      {id:"p_plane_ticket", th:"ตั๋วเครื่องบิน", fr:"billet d'avion", phonetic:"tua kruang-bin", components:["w_tua", "w_kruang_bin"]}
    ]
  },
  cBilan(39, "Bilan Unité 6", "Test Lieux et Trajets"),

  // --- UNIT 7 ---
  {
    id: "lesson-40", title: "Vêtements", description: "Chemise, pantalon",
    words: [
      {id:"w_suea", th:"เสื้อ", fr:"chemise / haut", phonetic:"suea"},
      {id:"w_kangkeng", th:"กางเกง", fr:"pantalon", phonetic:"kang-keng"},
      {id:"w_rong_thao", th:"รองเท้า", fr:"chaussures", phonetic:"rong-thao"}
    ],
    phrases: [
      {id:"p_buy_shirt", th:"ซื้อเสื้อ", fr:"acheter une chemise", phonetic:"sue suea", components:["w_sue", "w_suea"]}
    ]
  },
  {
    id: "lesson-41", title: "Couleurs secondaires", description: "Vert, jaune, rose",
    words: [
      {id:"w_khiao", th:"เขียว", fr:"vert", phonetic:"khiao"},
      {id:"w_lueang", th:"เหลือง", fr:"jaune", phonetic:"lueang"},
      {id:"w_chomphu", th:"ชมพู", fr:"rose", phonetic:"chom-phu"}
    ],
    phrases: [
      {id:"p_green_shirt", th:"เสื้อสีเขียว", fr:"chemise verte", phonetic:"suea see khiao", components:["w_suea", "w_see_color", "w_khiao"]}
    ]
  },
  {
    id: "lesson-42", title: "Description Objets", description: "Nouveau, vieux",
    words: [
      {id:"w_mai_new", th:"ใหม่", fr:"nouveau", phonetic:"mai"},
      {id:"w_kao", th:"เก่า", fr:"vieux", phonetic:"kao"},
      {id:"w_suay", th:"สวย", fr:"beau / joli", phonetic:"suay"}
    ],
    phrases: [
      {id:"p_very_beautiful", th:"สวยมาก", fr:"très beau", phonetic:"suay mak", components:["w_suay", "w_mak"]}
    ]
  },
  {
    id: "lesson-43", title: "Prix et Argent", description: "Bon marché, cher",
    words: [
      {id:"w_thuk", th:"ถูก", fr:"bon marché / correct", phonetic:"thuk"},
      {id:"w_phaeng", th:"แพง", fr:"cher", phonetic:"phaeng"},
      {id:"w_sai", th:"ใส่", fr:"mettre / porter", phonetic:"sai"}
    ],
    phrases: [
      {id:"p_not_expensive", th:"ไม่แพง", fr:"ce n'est pas cher", phonetic:"mai phaeng", components:["w_mai_neg", "w_phaeng"]}
    ]
  },
  cBilan(44, "Bilan Unité 7", "Test Achats et Apparences"),

  // --- UNIT 8 ---
  {
    id: "lesson-45", title: "Famille proche", description: "Enfants, frères",
    words: [
      {id:"w_luk", th:"ลูก", fr:"enfant (son enfant)", phonetic:"luk"},
      {id:"w_dek", th:"เด็ก", fr:"enfant (général)", phonetic:"dek"},
      {id:"w_phuean", th:"เพื่อน", fr:"ami", phonetic:"phuean"}
    ],
    phrases: [
      {id:"p_my_friend", th:"เพื่อนผม", fr:"mon ami", phonetic:"phuean phom", components:["w_phuean", "w_phom"]}
    ]
  },
  {
    id: "lesson-46", title: "Le corps", description: "Oeil, bouche, main",
    words: [
      {id:"w_ta", th:"ตา", fr:"oeil", phonetic:"ta"},
      {id:"w_pak", th:"ปาก", fr:"bouche", phonetic:"pak"},
      {id:"w_mue", th:"มือ", fr:"main", phonetic:"mue"}
    ],
    phrases: [
      {id:"p_hurt_hand", th:"เจ็บมือ", fr:"j'ai mal à la main", phonetic:"jep mue", components:["w_jep", "w_mue"]}
    ]
  },
  {
    id: "lesson-47", title: "Apparence physique", description: "Grand, petit, gros",
    words: [
      {id:"w_sung", th:"สูง", fr:"grand (taille)", phonetic:"sung"},
      {id:"w_tia", th:"เตี้ย", fr:"petit (taille)", phonetic:"tia"},
      {id:"w_uan", th:"อ้วน", fr:"gros", phonetic:"uan"} // No offense, purely educational :)
    ],
    phrases: [
      {id:"p_he_is_tall", th:"เขาสูง", fr:"il est grand", phonetic:"khao sung", components:["w_khao_pron", "w_sung"]}
    ]
  },
  {
    id: "lesson-48", title: "Caractère", description: "Gentil, amusant",
    words: [
      {id:"w_jai_dee", th:"ใจดี", fr:"gentil", phonetic:"jai dee"},
      {id:"w_sanuk", th:"สนุก", fr:"amusant", phonetic:"sa-nuk"},
      {id:"w_nak_rian", th:"นักเรียน", fr:"étudiant", phonetic:"nak-rian"}
    ],
    phrases: [
      {id:"p_good_student", th:"นักเรียนเก่ง", fr:"bon étudiant", phonetic:"nak-rian keng", components:["w_nak_rian", "w_kreng"]}
    ]
  },
  cBilan(49, "Bilan Unité 8", "Test Famille et Corps"),

  // --- UNIT 9 ---
  {
    id: "lesson-50", title: "À l'hôpital", description: "Malade, médecine",
    words: [
      {id:"w_puay", th:"ป่วย", fr:"malade", phonetic:"puay"},
      {id:"w_mo", th:"หมอ", fr:"médecin", phonetic:"mo"},
      {id:"w_ya", th:"ยา", fr:"médicament", phonetic:"ya"}
    ],
    phrases: [
      {id:"p_eat_medicine", th:"กินยา", fr:"prendre des médicaments", phonetic:"kin ya", components:["w_kin", "w_ya"]}
    ]
  },
  {
    id: "lesson-51", title: "Symptômes", description: "Fièvre, fatigué",
    words: [
      {id:"w_khai", th:"ไข้", fr:"fièvre", phonetic:"khai"},
      {id:"w_ay", th:"ไอ", fr:"tousser", phonetic:"ay"},
      {id:"w_nueay", th:"เหนื่อย", fr:"fatigué", phonetic:"nueay"}
    ],
    phrases: [
      {id:"p_have_fever", th:"มีไข้", fr:"j'ai de la fièvre", phonetic:"mee khai", components:["w_mee", "w_khai"]}
    ]
  },
  {
    id: "lesson-52", title: "Sentiments", description: "Triste, peur, fâché",
    words: [
      {id:"w_sia_jai", th:"เสียใจ", fr:"triste / désolé", phonetic:"sia-jai"},
      {id:"w_klua", th:"กลัว", fr:"avoir peur", phonetic:"klua"},
      {id:"w_krot", th:"โกรธ", fr:"fâché", phonetic:"krot"}
    ],
    phrases: [
      {id:"p_not_afraid", th:"ไม่กลัว", fr:"je n'ai pas peur", phonetic:"mai klua", components:["w_mai_neg", "w_klua"]}
    ]
  },
  {
    id: "lesson-53", title: "Réactions cognitives", description: "Penser, savoir",
    words: [
      {id:"w_khit", th:"คิด", fr:"penser", phonetic:"khit"},
      {id:"w_ru", th:"รู้", fr:"savoir / connaitre", phonetic:"ru"},
      {id:"w_jing", th:"จริง", fr:"vrai / vraiment", phonetic:"jing"}
    ],
    phrases: [
      {id:"p_i_dont_know", th:"ไม่รู้", fr:"je ne sais pas", phonetic:"mai ru", components:["w_mai_neg", "w_ru"]}
    ]
  },
  cBilan(54, "Bilan Unité 9", "Test Sentiments et Santé"),

  // --- UNIT 10 ---
  {
    id: "lesson-55", title: "Fréquence 1", description: "Toujours, souvent",
    words: [
      {id:"w_samoe", th:"เสมอ", fr:"toujours", phonetic:"sa-moe"},
      {id:"w_boi", th:"บ่อย", fr:"souvent", phonetic:"boi"}
    ],
    phrases: [
      {id:"p_come_often", th:"มาบ่อย", fr:"venir souvent", phonetic:"ma boi", components:["w_ma", "w_boi"]}
    ]
  },
  {
    id: "lesson-56", title: "Fréquence 2", description: "Jamais, parfois",
    words: [
      {id:"w_mai_khoei", th:"ไม่เคย", fr:"jamais", phonetic:"mai-khoei"},
      {id:"w_bang_thi", th:"บางที", fr:"parfois", phonetic:"bang-thi"}
    ],
    phrases: [
      {id:"p_never_eat", th:"ไม่เคยกิน", fr:"jamais mangé", phonetic:"mai-khoei kin", components:["w_mai_khoei", "w_kin"]}
    ]
  },
  {
    id: "lesson-57", title: "Mots d'interrogation", description: "Pourquoi, qui",
    words: [
      {id:"w_thammai", th:"ทำไม", fr:"pourquoi ?", phonetic:"tham-mai"},
      {id:"w_khrai", th:"ใคร", fr:"qui ?", phonetic:"khrai"}
    ],
    phrases: [
      {id:"p_who_is_this", th:"ใคร", fr:"qui est-ce ?", phonetic:"khrai", components:["w_khrai"]}
    ]
  },
  {
    id: "lesson-58", title: "Utile et nuances", description: "Peut-être, avec",
    words: [
      {id:"w_at_ja", th:"อาจจะ", fr:"peut-être", phonetic:"at-ja"},
      {id:"w_kap", th:"กับ", fr:"avec / et", phonetic:"kap"}
    ],
    phrases: [
      {id:"p_go_with_friend", th:"ไปกับเพื่อน", fr:"aller avec un ami", phonetic:"pai kap phuean", components:["w_pai", "w_kap", "w_phuean"]}
    ]
  },
  cBilan(59, "Le Grand Bilan A1", "Test final du Niveau A1 (Toutes Unités)")
];

course.lessons.push(...newLessons);

fs.writeFileSync(dataFile, JSON.stringify(course, null, 2), 'utf8');
console.log("Successfully appended 40 new lessons! Total lessons: ", course.lessons.length);
