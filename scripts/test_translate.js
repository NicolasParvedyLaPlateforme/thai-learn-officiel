const translate = async (text, targetLang) => {
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=fr&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
  const response = await fetch(url);
  const json = await response.json();
  return json[0].map(item => item[0]).join('');
};

translate("Bonjour tout le monde", "es").then(console.log).catch(console.error);
