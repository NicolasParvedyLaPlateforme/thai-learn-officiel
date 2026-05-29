const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../app/data/course.json');
const course = JSON.parse(fs.readFileSync(filePath, 'utf8'));

// Find full word object
function getWordObj(wordId) {
  for (let l of course.lessons) {
    if (l.words) {
      for (let w of l.words) {
        if (w.id === wordId) return w;
      }
    }
  }
  return null;
}

const additions = {
  "lesson-1": [
    { id: "p_thanks_m", th: "ขอบคุณครับ", fr: "merci (homme)", phonetic: "khɔ̀p-khun khráp", components: ["w_khopkhun", "w_krap"] },
    { id: "p_thanks_f", th: "ขอบคุณค่ะ", fr: "merci (femme)", phonetic: "khɔ̀p-khun khâ", components: ["w_khopkhun", "w_kha"] },
    { id: "p_i_am_fine", th: "สบายดี", fr: "je vais bien", phonetic: "sà-baai dii", components: ["w_sabai", "w_dee"] }
  ],
  "lesson-2": [
    { id: "p_what_is_it", th: "อะไร", fr: "quoi ?", phonetic: "à-rai", components: ["w_arai"] }
  ],
  "lesson-3": [
    { id: "p_num_0", th: "ศูนย์", fr: "zéro", phonetic: "sǔun", components: ["w_0"] },
    { id: "p_num_1", th: "หนึ่ง", fr: "un", phonetic: "nùeng", components: ["w_1"] },
    { id: "p_num_2", th: "สอง", fr: "deux", phonetic: "sɔ̌ng", components: ["w_2"] },
    { id: "p_num_3", th: "สาม", fr: "trois", phonetic: "sǎam", components: ["w_3"] },
    { id: "p_num_4", th: "สี่", fr: "quatre", phonetic: "sìi", components: ["w_4"] },
    { id: "p_num_5", th: "ห้า", fr: "cinq", phonetic: "hâa", components: ["w_5"] }
  ],
  "lesson-3-quantities": [
    { id: "p_how_many_chairs_m", th: "มีเก้าอี้กี่ตัวครับ", fr: "combien y a-t-il de chaises ? (homme)", phonetic: "mii kâo-îi kìi dtua khráp", components: ["w_mee", "w_gao_ee", "w_gee", "w_dtua", "w_krap"] },
    { id: "p_how_many_chairs_f", th: "มีเก้าอี้กี่ตัวค่ะ", fr: "combien y a-t-il de chaises ? (femme)", phonetic: "mii kâo-îi kìi dtua khâ", components: ["w_mee", "w_gao_ee", "w_gee", "w_dtua", "w_kha"] },
    { id: "p_four_people", th: "มีสี่คน", fr: "il y a quatre personnes", phonetic: "mii sìi khon", components: ["w_mee", "w_4", "w_khon"] }
  ],
  "lesson-4": [
    { id: "p_want_water", th: "เอาน้ำ", fr: "je veux de l'eau", phonetic: "ao náam", components: ["w_ao", "w_nam"] },
    { id: "p_not_want", th: "ไม่เอา", fr: "je n'en veux pas", phonetic: "mâi ao", components: ["w_mai_neg", "w_ao"] },
    { id: "p_spicy_m", th: "เผ็ดมากครับ", fr: "c'est très épicé (homme)", phonetic: "phèt mâak khráp", components: ["w_phet", "w_mak", "w_krap"] },
    { id: "p_delicious_f", th: "อร่อยมากค่ะ", fr: "très délicieux (femme)", phonetic: "à-rɔ̀i mâak khâ", components: ["w_aroi", "w_mak", "w_kha"] }
  ],
  "lesson-5": [
    { id: "p_sorry_f", th: "ขอโทษค่ะ", fr: "pardon (femme)", phonetic: "kho thot khâ", components: ["w_kho_thot", "w_kha"] },
    { id: "p_please_m", th: "กรุณาครับ", fr: "s'il vous plaît (homme)", phonetic: "kà-rú-naa khráp", components: ["w_ka_ru_na", "w_krap"] },
    { id: "p_please_f", th: "กรุณาค่ะ", fr: "s'il vous plaît (femme)", phonetic: "kà-rú-naa khâ", components: ["w_ka_ru_na", "w_kha"] },
    { id: "p_where_is_it", th: "ที่ไหน", fr: "c'est où ?", phonetic: "thîi nǎi", components: ["w_thi_nai"] }
  ],
  "lesson-6": [
    { id: "p_mom_name", th: "แม่ชื่ออะไร", fr: "comment s'appelle maman ?", phonetic: "mâe chûue à-rai", components: ["w_mae", "w_chue", "w_arai"] },
    { id: "p_where_is_dad", th: "พ่อไปที่ไหน", fr: "où va papa ?", phonetic: "phɔ̂ɔ bpai thîi nǎi", components: ["w_pho", "w_pai", "w_thi_nai"] },
    { id: "p_we_are_good", th: "เราสบายดี", fr: "nous allons bien", phonetic: "rao sà-baai dii", components: ["w_rao", "w_sabai", "w_dee"] }
  ],
  "lesson-7": [
    { id: "p_what_are_you_doing", th: "ทำอะไร", fr: "que fais-tu ?", phonetic: "tham à-rai", components: ["w_tham", "w_arai"] },
    { id: "p_come_here_m", th: "มาครับ", fr: "je viens (homme)", phonetic: "maa khráp", components: ["w_ma", "w_krap"] },
    { id: "p_want_to_go_f", th: "อยากไปค่ะ", fr: "je veux y aller (femme)", phonetic: "yàak bpai khâ", components: ["w_yak", "w_pai", "w_kha"] }
  ],
  "lesson-8": [
    { id: "p_how_much_f", th: "เท่าไหร่ค่ะ", fr: "ça coûte combien ? (femme)", phonetic: "thao rai khâ", components: ["w_thao_rai", "w_kha"] },
    { id: "p_buy_water", th: "ซื้อน้ำ", fr: "acheter de l'eau", phonetic: "súue náam", components: ["w_sue", "w_nam"] },
    { id: "p_cannot_reduce", th: "ลดไม่ได้", fr: "je ne peux pas baisser le prix", phonetic: "lót mâi dâai", components: ["w_lot", "w_mai_neg", "w_dai"] }
  ],
  "lesson-9": [
    { id: "p_happy_m", th: "ดีใจครับ", fr: "je suis heureux (homme)", phonetic: "dii jai khráp", components: ["w_dee_jai", "w_krap"] },
    { id: "p_happy_f", th: "ดีใจค่ะ", fr: "je suis heureuse (femme)", phonetic: "dii jai khâ", components: ["w_dee_jai", "w_kha"] },
    { id: "p_not_like", th: "ไม่ชอบ", fr: "je n'aime pas", phonetic: "mâi chɔ̂ɔp", components: ["w_mai_neg", "w_chop"] },
    { id: "p_i_like_it", th: "ผมชอบ", fr: "j'aime bien (homme)", phonetic: "phǒm chɔ̂ɔp", components: ["w_phom", "w_chop"] },
    { id: "p_i_like_it_f", th: "ฉันชอบ", fr: "j'aime bien (femme)", phonetic: "chǎn chɔ̂ɔp", components: ["w_chan", "w_chop"] }
  ],
  "lesson-11": [
    { id: "p_ride_car", th: "ขับรถ", fr: "conduire une voiture", phonetic: "khàp rót", components: ["w_khi", "w_rot"] },
    { id: "p_train_good", th: "รถไฟดี", fr: "le train est bien", phonetic: "rót fai dii", components: ["w_rot", "w_fai", "w_dee"] },
    { id: "p_where_station", th: "สถานีที่ไหน", fr: "où est la station ?", phonetic: "sà-thǎa-nii thîi nǎi", components: ["w_sathannee", "w_thi_nai"] }
  ],
  "lesson-12": [
    { id: "p_what_time_is_it", th: "เวลาอะไร", fr: "quelle heure est-il ?", phonetic: "wee-laa à-rai", components: ["w_wela", "w_arai"] },
    { id: "p_go_tomorrow", th: "ไปพรุ่งนี้", fr: "aller demain", phonetic: "bpai phrûng níi", components: ["w_pai", "w_phrung", "w_nee"] },
    { id: "p_yesterday_good", th: "เมื่อวานนี้ดี", fr: "hier c'était bien", phonetic: "mûea waan níi dii", components: ["w_muea", "w_wan", "w_nee", "w_dee"] }
  ],
  "lesson-13": [
    { id: "p_go_left", th: "ไปซ้าย", fr: "aller à gauche", phonetic: "bpai sáai", components: ["w_pai", "w_sai"] },
    { id: "p_go_right", th: "ไปขวา", fr: "aller à droite", phonetic: "bpai khwǎa", components: ["w_pai", "w_khwa"] },
    { id: "p_turn_straight", th: "ตรงไปค่ะ", fr: "allez tout droit (femme)", phonetic: "dtrong bpai khâ", components: ["w_trong", "w_pai", "w_kha"] }
  ],
  "lesson-14": [
    { id: "p_yes_f", th: "ใช่ค่ะ", fr: "oui (femme)", phonetic: "châi khâ", components: ["w_chai", "w_kha"] },
    { id: "p_no_m", th: "ไม่ใช่ครับ", fr: "non (homme)", phonetic: "mǎi châi khráp", components: ["w_mai_question", "w_krap"] },
    { id: "p_no_f", th: "ไม่ใช่ค่ะ", fr: "non (femme)", phonetic: "mǎi châi khâ", components: ["w_mai_question", "w_kha"] },
    { id: "p_speak_little", th: "พูดนิดหน่อย", fr: "parler un peu", phonetic: "phûut nít nòi", components: ["w_pood", "w_nit_noi"] }
  ],
  "lesson-15": [
    { id: "p_head_hospital", th: "ปวดหัวไปโรงพยาบาล", fr: "j'ai mal la tête, je vais à l'hôpital", phonetic: "bpùuat hǔua bpai roong phá-yaa-baan", components: ["w_puat", "w_hua", "w_pai", "w_rong_phayaban"] },
    { id: "p_where_hospital", th: "โรงพยาบาลที่ไหน", fr: "où est l'hôpital ?", phonetic: "roong phá-yaa-baan thîi nǎi", components: ["w_rong_phayaban", "w_thi_nai"] },
    { id: "p_stomach_ache_very", th: "ปวดท้องมาก", fr: "j'ai très mal au ventre", phonetic: "bpùuat thɔ́ɔng mâak", components: ["w_puat", "w_thong", "w_mak"] }
  ],
  "lesson-16": [
    { id: "p_hot_not", th: "ไม่ร้อน", fr: "il ne fait pas chaud", phonetic: "mâi rɔ́ɔn", components: ["w_mai_neg", "w_ron"] },
    { id: "p_cold_m", th: "หนาวครับ", fr: "j'ai froid (homme)", phonetic: "nǎao khráp", components: ["w_naow", "w_krap"] },
    { id: "p_big_car", th: "รถใหญ่", fr: "grande voiture", phonetic: "rót yài", components: ["w_rot", "w_yai"] },
    { id: "p_small_house", th: "บ้านเล็ก", fr: "petite maison", phonetic: "bâan lék", components: ["w_baan", "w_lek"] }
  ],
  "lesson-17": [
    { id: "p_what_color", th: "สีอะไร", fr: "quelle couleur ?", phonetic: "sìi à-rai", components: ["w_see_color", "w_arai"] },
    { id: "p_white_shirt", th: "สีขาว", fr: "couleur blanche", phonetic: "sìi khâao", components: ["w_see_color", "w_khao_color"] },
    { id: "p_blue_pen", th: "สีน้ำเงิน", fr: "couleur bleue", phonetic: "sìi náam ngoen", components: ["w_see_color", "w_nam_ngoen"] },
    { id: "p_want_red", th: "อยากได้สีแดง", fr: "je veux le rouge", phonetic: "yàak dâai sìi daeng", components: ["w_yak", "w_dai", "w_see_color", "w_daeng"] }
  ],
  "lesson-18": [
    { id: "p_big_house", th: "บ้านใหญ่", fr: "grande maison", phonetic: "bâan yài", components: ["w_baan", "w_yai"] },
    { id: "p_sleep_room", th: "ห้องนอน", fr: "chambre à coucher", phonetic: "hɔ̂ng nɔɔn", components: ["w_hong", "w_non"] },
    { id: "p_where_sleep", th: "นอนที่ไหน", fr: "tu dors où ?", phonetic: "nɔɔn thîi nǎi", components: ["w_non", "w_thi_nai"] }
  ],
  "lesson-20": [
    { id: "p_pork_delicious", th: "หมูอร่อย", fr: "le porc est délicieux", phonetic: "mǔu à-rɔ̀i", components: ["w_moo", "w_aroi"] },
    { id: "p_want_beef", th: "เอาเนื้อ", fr: "je prends du boeuf", phonetic: "ao núea", components: ["w_ao", "w_nuea"] },
    { id: "p_not_eat_meat", th: "ไม่กินเนื้อ", fr: "je ne mange pas de viande", phonetic: "mâi kin núea", components: ["w_mai_neg", "w_kin", "w_nuea"] },
    { id: "p_fish_water", th: "ปลาในน้ำ", fr: "poisson dans l'eau", phonetic: "bplaa nai náam", components: ["w_pla", "w_nam"] }
  ],
  "lesson-21": [
    { id: "p_want_tea_f", th: "เอาชาค่ะ", fr: "je prends du thé (femme)", phonetic: "ao chaa khâ", components: ["w_ao", "w_cha", "w_kha"] },
    { id: "p_drink_beer", th: "ดื่มเบียร์", fr: "boire de la bière", phonetic: "dùuem bia", components: ["w_duem", "w_bia"] },
    { id: "p_no_beer", th: "ไม่ดื่มเบียร์", fr: "je ne bois pas de bière", phonetic: "mâi dùuem bia", components: ["w_mai_neg", "w_duem", "w_bia"] },
    { id: "p_coffee_water", th: "กาแฟน้ำ", fr: "café et eau", phonetic: "kaa-fae náam", components: ["w_kafae", "w_nam"] }
  ],
  "lesson-22": [
    { id: "p_salty", th: "เค็มมาก", fr: "très salé", phonetic: "khem mâak", components: ["w_khem", "w_mak"] },
    { id: "p_sour", th: "เปรี้ยวมาก", fr: "très acide", phonetic: "bprîiao mâak", components: ["w_priao", "w_mak"] },
    { id: "p_not_sweet", th: "ไม่หวาน", fr: "pas sucré", phonetic: "mâi wǎan", components: ["w_mai_neg", "w_waan"] },
    { id: "p_delicious_sweet", th: "หวานอร่อย", fr: "sucré et délicieux", phonetic: "wǎan à-rɔ̀i", components: ["w_waan", "w_aroi"] }
  ],
  "lesson-23": [
    { id: "p_bill_please_f", th: "เก็บเงินด้วยค่ะ", fr: "l'addition s'il vous plaît (femme)", phonetic: "gèp ngoen duay khâ", components: ["w_gep_ngoen", "w_kha"] },
    { id: "p_full", th: "อิ่มแล้ว", fr: "je suis rassasié", phonetic: "ìm láew", components: ["w_im", "w_laew"] },
    { id: "p_full_m", th: "อิ่มแล้วครับ", fr: "je suis rassasié (homme)", phonetic: "ìm láew khráp", components: ["w_im", "w_laew", "w_krap"] },
    { id: "p_full_f", th: "อิ่มแล้วค่ะ", fr: "je suis rassasiée (femme)", phonetic: "ìm láew khâ", components: ["w_im", "w_laew", "w_kha"] }
  ],
  "lesson-25": [
    { id: "p_listen_me", th: "ฟังผม", fr: "écoutez-moi", phonetic: "fang phǒm", components: ["w_fang", "w_phom"] },
    { id: "p_walk_where", th: "เดินไปที่ไหน", fr: "tu marches où ?", phonetic: "doen bpai thîi nǎi", components: ["w_doen", "w_pai", "w_thi_nai"] },
    { id: "p_look_this", th: "ดูนี่", fr: "regarde ça", phonetic: "duu nîi", components: ["w_doo", "w_nee"] },
    { id: "p_watch_film_f", th: "ดูหนังค่ะ", fr: "je regarde un film (femme)", phonetic: "duu nâng khâ", components: ["w_doo", "w_nang", "w_kha"] }
  ],
  "lesson-26": [
    { id: "p_work_much", th: "ทำงานมาก", fr: "travailler beaucoup", phonetic: "tham-ngaan mâak", components: ["w_tham_ngan", "w_mak"] },
    { id: "p_play_what", th: "เล่นอะไร", fr: "tu joues à quoi ?", phonetic: "lên à-rai", components: ["w_len", "w_arai"] },
    { id: "p_very_good", th: "เก่งมาก", fr: "très doué", phonetic: "gèng mâak", components: ["w_kreng", "w_mak"] },
    { id: "p_not_work", th: "ไม่ทำงาน", fr: "je ne travaille pas", phonetic: "mâi tham-ngaan", components: ["w_mai_neg", "w_tham_ngan"] }
  ],
  "lesson-27": [
    { id: "p_learn_much", th: "เรียนมาก", fr: "apprendre beaucoup", phonetic: "riian mâak", components: ["w_rian", "w_mak"] },
    { id: "p_write_book", th: "เขียนหนังสือ", fr: "écrire un livre", phonetic: "khǐian nǎng-sǔue", components: ["w_khian", "w_nangsue"] },
    { id: "p_read_good", th: "อ่านเก่ง", fr: "lire bien (doué)", phonetic: "àan gèng", components: ["w_aan", "w_kreng"] },
    { id: "p_what_book", th: "หนังสืออะไร", fr: "quel livre ?", phonetic: "nǎng-sǔue à-rai", components: ["w_nangsue", "w_arai"] }
  ],
  "lesson-28": [
    { id: "p_sell_what", th: "ขายอะไร", fr: "tu vends quoi ?", phonetic: "khǎai à-rai", components: ["w_khai", "w_arai"] },
    { id: "p_give_money", th: "ให้เงิน", fr: "donner de l'argent", phonetic: "hâi ngoen", components: ["w_hai", "w_ngoen"] },
    { id: "p_want_sell", th: "อยากขาย", fr: "je veux vendre", phonetic: "yàak khǎai", components: ["w_yak", "w_khai"] },
    { id: "p_no_money", th: "ไม่มีเงิน", fr: "je n'ai pas d'argent", phonetic: "mâi mii ngoen", components: ["w_mai_neg", "w_mee", "w_ngoen"] }
  ],
  "lesson-30": [
    { id: "p_work_morning", th: "ทำงานเช้านี้", fr: "travailler ce matin", phonetic: "tham-ngaan cháao nee", components: ["w_tham_ngan", "w_chao", "w_nee"] },
    { id: "p_eat_evening", th: "กินข้าวเย็น", fr: "manger le soir", phonetic: "kin khâao yen", components: ["w_kin", "w_khao", "w_yen"] },
    { id: "p_sleep_night", th: "นอนคินนี้", fr: "dormir cette nuit", phonetic: "nɔɔn kheun nee", components: ["w_non", "w_khuen", "w_nee"] },
    { id: "p_good_evening", th: "สวัสดีตอนเย็น", fr: "bonsoir", phonetic: "sà-wàt-dii dtoon yen", components: ["w_sawatdee", "w_yen"] }
  ],
  "lesson-31": [
    { id: "p_hot_sun", th: "แดดร้อน", fr: "le soleil est chaud", phonetic: "dàet rɔ́ɔn", components: ["w_daet", "w_ron"] },
    { id: "p_rain_much", th: "ฝนตกมาก", fr: "il pleut beaucoup", phonetic: "fǒn dtòk mâak", components: ["w_fon", "w_tok", "w_mak"] },
    { id: "p_no_rain", th: "ฝนไม่ตก", fr: "il ne pleut pas", phonetic: "fǒn mâi dtòk", components: ["w_fon", "w_mai_neg", "w_tok"] },
    { id: "p_sun_out", th: "มีแดด", fr: "il y a du soleil", phonetic: "mii dàet", components: ["w_mee", "w_daet"] }
  ],
  "lesson-32": [
    { id: "p_wind_strong", th: "ลมมาก", fr: "beaucoup de vent", phonetic: "lom mâak", components: ["w_lom", "w_mak"] },
    { id: "p_cold_wind", th: "ลมหนาว", fr: "vent froid", phonetic: "lom nǎao", components: ["w_lom", "w_naow"] },
    { id: "p_hot_not_cold", th: "ร้อนไม่หนาว", fr: "chaud, pas froid", phonetic: "rɔ́ɔn mâi nǎao", components: ["w_ron", "w_mai_neg", "w_naow"] },
    { id: "p_weather_good", th: "อากาศดี", fr: "il fait beau", phonetic: "aa-gàat dii", components: ["w_dee"] }
  ],
  "lesson-33": [
    { id: "p_what_time_go", th: "ไปกี่โมง", fr: "tu y vas à quelle heure ?", phonetic: "bpai ki moong", components: ["w_pai", "w_ki", "w_mong"] },
    { id: "p_eat_when", th: "กินเมื่อไหร่", fr: "tu manges quand ?", phonetic: "kin mûea-rài", components: ["w_kin", "w_muearai"] },
    { id: "p_five_oclock", th: "ห้าโมง", fr: "cinq heures", phonetic: "hâa moong", components: ["w_5", "w_mong"] },
    { id: "p_arrive_when", th: "มาเมื่อไหร่", fr: "tu arrives quand ?", phonetic: "maa mûea-rài", components: ["w_ma", "w_muearai"] }
  ],
  "lesson-35": [
    { id: "p_go_school", th: "ไปโรงเรียน", fr: "aller à l'école", phonetic: "bpai roong-riian", components: ["w_pai", "w_rong_rian"] },
    { id: "p_school_big", th: "โรงเรียนใหญ่", fr: "grande école", phonetic: "roong-riian yài", components: ["w_rong_rian", "w_yai"] },
    { id: "p_hotel_good", th: "โรงแรมดี", fr: "bon hôtel", phonetic: "roong-raem dii", components: ["w_rong_raem", "w_dee"] },
    { id: "p_which_hotel", th: "โรงแรมอะไร", fr: "quel hôtel ?", phonetic: "roong-raem à-rai", components: ["w_rong_raem", "w_arai"] }
  ],
  "lesson-36": [
    { id: "p_big_market", th: "ตลาดใหญ่", fr: "grand marché", phonetic: "dtà-làat yài", components: ["w_talat", "w_yai"] },
    { id: "p_park_beautiful", th: "สวนสวย", fr: "beau parc", phonetic: "sǔuan sǔuay", components: ["w_suan", "w_suay"] },
    { id: "p_where_street", th: "ถนนที่ไหน", fr: "où est la rue ?", phonetic: "thà-nǒn thîi nǎi", components: ["w_thanon", "w_thi_nai"] },
    { id: "p_go_park", th: "ไปสวน", fr: "aller au parc", phonetic: "bpai sǔuan", components: ["w_pai", "w_suan"] }
  ],
  "lesson-37": [
    { id: "p_take_boat", th: "นั่งเรือ", fr: "prendre un bateau", phonetic: "nâng ruea", components: ["w_nang_v", "w_ruea"] },
    { id: "p_where_bus", th: "รถเมล์ที่ไหน", fr: "où est le bus ?", phonetic: "rót-mee thîi nǎi", components: ["w_rot_me", "w_thi_nai"] },
    { id: "p_sit_here", th: "นั่งที่นี่", fr: "s'asseoir ici", phonetic: "nâng thîi nîi", components: ["w_nang_v", "w_thi_nai"] },
    { id: "p_boat_big", th: "เรือใหญ่", fr: "grand bateau", phonetic: "ruea yài", components: ["w_ruea", "w_yai"] }
  ],
  "lesson-38": [
    { id: "p_fly_airplane", th: "บินไป", fr: "s'envoler", phonetic: "bin bpai", components: ["w_bin", "w_pai"] },
    { id: "p_buy_ticket", th: "ซื้อตั๋ว", fr: "acheter un billet", phonetic: "súue dtǔua", components: ["w_sue", "w_tua"] },
    { id: "p_ticket_expensive", th: "ตั๋วแพง", fr: "le billet est cher", phonetic: "dtǔua phaeng", components: ["w_tua", "w_phaeng"] },
    { id: "p_airplane_big", th: "เครื่องบินใหญ่", fr: "grand avion", phonetic: "khrûeang-bin yài", components: ["w_kruang_bin", "w_yai"] }
  ],
  "lesson-40": [
    { id: "p_sell_pants", th: "ขายกางเกง", fr: "vendre un pantalon", phonetic: "khǎai gaang-geeng", components: ["w_khai", "w_kangkeng"] },
    { id: "p_want_shoes", th: "อยากได้รองเท้า", fr: "je veux des chaussures", phonetic: "yàak dâai rɔɔng-tháao", components: ["w_yak", "w_dai", "w_rong_thao"] },
    { id: "p_shoes_beautiful", th: "รองเท้าสวย", fr: "belles chaussures", phonetic: "rɔɔng-tháao sǔuay", components: ["w_rong_thao", "w_suay"] },
    { id: "p_shirt_big", th: "เสื้อใหญ่", fr: "chemise large", phonetic: "sûea yài", components: ["w_suea", "w_yai"] }
  ],
  "lesson-41": [
    { id: "p_yellow_shirt", th: "เสื้อสีเหลือง", fr: "chemise jaune", phonetic: "sûea sìi lǔeang", components: ["w_suea", "w_see_color", "w_lueang"] },
    { id: "p_pink_shoes", th: "รองเท้าสีชมพู", fr: "chaussures roses", phonetic: "rɔɔng-tháao sìi chom-phuu", components: ["w_rong_thao", "w_see_color", "w_chomphu"] },
    { id: "p_like_green", th: "ชอบสีเขียว", fr: "j'aime le vert", phonetic: "chɔ̂ɔp sìi khǐiao", components: ["w_chop", "w_see_color", "w_khiao"] },
    { id: "p_pant_yellow", th: "กางเกงสีเหลือง", fr: "pantalon jaune", phonetic: "gaang-geeng sìi lǔeang", components: ["w_kangkeng", "w_see_color", "w_lueang"] }
  ],
  "lesson-42": [
    { id: "p_new_shirt", th: "เสื้อใหม่", fr: "nouvelle chemise", phonetic: "sûea mǎi", components: ["w_suea", "w_mai_new"] },
    { id: "p_old_car", th: "รถเก่า", fr: "vieille voiture", phonetic: "rót kâao", components: ["w_rot", "w_kao"] },
    { id: "p_house_beautiful", th: "บ้านสวย", fr: "belle maison", phonetic: "bâan sǔuay", components: ["w_baan", "w_suay"] },
    { id: "p_new_not_old", th: "ใหม่ไม่เก่า", fr: "nouveau, pas vieux", phonetic: "mǎi mâi kâao", components: ["w_mai_new", "w_mai_neg", "w_kao"] }
  ],
  "lesson-43": [
    { id: "p_cheap_shirt", th: "เสื้อถูก", fr: "chemise pas chère", phonetic: "sûea thùuk", components: ["w_suea", "w_thuk"] },
    { id: "p_expensive_shoes", th: "รองเท้าแพง", fr: "chaussures chères", phonetic: "rɔɔng-tháao phaeng", components: ["w_rong_thao", "w_phaeng"] },
    { id: "p_put_shirt", th: "ใส่เสื้อ", fr: "mettre une chemise", phonetic: "sáai sûea", components: ["w_sai", "w_suea"] },
    { id: "p_cheap_food", th: "ข้าวถูก", fr: "riz (nourriture) bon marché", phonetic: "khâao thùuk", components: ["w_khao", "w_thuk"] }
  ],
  "lesson-45": [
    { id: "p_friend_eat", th: "เพื่อนกินข้าว", fr: "l'ami mange", phonetic: "phûean kin khâao", components: ["w_phuean", "w_kin", "w_khao"] },
    { id: "p_child_play", th: "เด็กเล่น", fr: "l'enfant joue", phonetic: "dèk lên", components: ["w_dek", "w_len"] },
    { id: "p_my_child", th: "ลูกผม", fr: "mon enfant", phonetic: "lûuk phǒm", components: ["w_luk", "w_phom"] },
    { id: "p_where_friend", th: "เพื่อนที่ไหน", fr: "où est l'ami ?", phonetic: "phûean thîi nǎi", components: ["w_phuean", "w_thi_nai"] }
  ],
  "lesson-46": [
    { id: "p_hurt_eye", th: "เจ็บตา", fr: "j'ai mal à l'oeil", phonetic: "jèp dtaa", components: ["w_jep", "w_ta"] },
    { id: "p_red_mouth", th: "ปากแดง", fr: "bouche rouge", phonetic: "bpàak daeng", components: ["w_pak", "w_daeng"] },
    { id: "p_big_hand", th: "มือใหญ่", fr: "grande main", phonetic: "muue yài", components: ["w_mue", "w_yai"] },
    { id: "p_wash_hand", th: "ล้างมือ", fr: "laver les mains", phonetic: "láang muue", components: ["w_mue"] }
  ],
  "lesson-47": [
    { id: "p_she_short", th: "เขาเตี้ย", fr: "elle est petite (taille)", phonetic: "khâao dtîia", components: ["w_khao_pron", "w_tia"] },
    { id: "p_fat_cat", th: "เขาอ้วน", fr: "il est gros", phonetic: "khâao ûuan", components: ["w_khao_pron", "w_uan"] },
    { id: "p_tall_friend", th: "เพื่อนสูง", fr: "ami grand", phonetic: "phûean sǔung", components: ["w_phuean", "w_sung"] },
    { id: "p_not_fat", th: "ไม่อ้วน", fr: "pas gros", phonetic: "mâi ûuan", components: ["w_mai_neg", "w_uan"] }
  ],
  "lesson-48": [
    { id: "p_kind_friend", th: "เพื่อนใจดี", fr: "ami gentil", phonetic: "phûean jai dii", components: ["w_phuean", "w_jai_dee"] },
    { id: "p_fun_game", th: "เล่นสนุก", fr: "jouer est amusant", phonetic: "lên sà-nùk", components: ["w_len", "w_sanuk"] },
    { id: "p_student_learn", th: "นักเรียนเรียน", fr: "l'étudiant apprend", phonetic: "nák-riian riian", components: ["w_nak_rian", "w_rian"] },
    { id: "p_not_fun", th: "ไม่สนุก", fr: "pas amusant", phonetic: "mâi sà-nùk", components: ["w_mai_neg", "w_sanuk"] }
  ]
};

let previousWords = [];

course.lessons.forEach(lesson => {
  if (lesson.isReview) return;
  
  // collect current lesson words
  let currentWords = lesson.words ? lesson.words.map(w => w.id) : [];
  let availableWords = [...previousWords, ...currentWords];
  
  if (additions[lesson.id]) {
    lesson.phrases.push(...additions[lesson.id]);
  }
  
  // Deduplicate
  const seen = new Set();
  lesson.phrases = lesson.phrases.filter(p => {
    if (seen.has(p.id)) return false;
    seen.add(p.id);
    return true;
  });
  
  // Ensure 5 phrases minimum
  if (lesson.phrases.length < 5) {
    let countNeeded = 5 - lesson.phrases.length;
    for (let i = 0; i < countNeeded; i++) {
        let w1Id = availableWords[Math.floor(Math.random() * availableWords.length)];
        let w2Id = availableWords[Math.floor(Math.random() * availableWords.length)];
        
        let w1 = getWordObj(w1Id);
        let w2 = getWordObj(w2Id);
        
        if (w1 && w2) {
            lesson.phrases.push({
                "id": `p_auto_${lesson.id}_${i}`,
                "th": `${w1.th}${w2.th}`,
                "fr": `[Pratique] ${w1.th} + ${w2.th}`,
                "phonetic": `${w1.phonetic} ${w2.phonetic}`,
                "components": [w1.id, w2.id]
            });
        }
    }
  }
  
  previousWords = [...previousWords, ...currentWords];
});

fs.writeFileSync(filePath, JSON.stringify(course, null, 2), 'utf8');
console.log('Course JSON enriched with new phrases!');
