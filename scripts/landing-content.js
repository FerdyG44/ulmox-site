"use strict";

/**
 * Stage 1.6W.1 — the localized copy for the 20 ULMOX landing routes.
 *
 * Every string here was lifted verbatim from the landing page that already
 * carried it, so bringing those pages under one generator retranslated
 * nothing. `root` is the language-neutral entry page at /, which redirects to
 * a locale; it carries English copy and is listed separately from `en` because
 * the two pages differ in more than their text.
 *
 * Nothing in this file may grow a claim the app does not support. The three
 * feature cards, the hero and the store call to action are the copy that was
 * already published; new marketing claims about Connections, translation,
 * Premium, user numbers, safety outcomes or store availability do not belong
 * here.
 */

const LANDING = Object.freeze({
  root: Object.freeze({
    lead: "Share real",
    accent: "video moments.",
    subtitle: "Share real video moments with people around the world. Capture authentic experiences, receive unexpected moments, and discover stories through the ULMOX global community.",
    cardText: "One real moment",
    features: Object.freeze([
      Object.freeze({ heading: "Real videos", body: "No fake moments. Capture what feels real." }),
      Object.freeze({ heading: "Daily moments", body: "Limited daily sharing system." }),
      Object.freeze({ heading: "Global feed", body: "Publish moments globally." }),
    ]),
    ctaHeading: "Available now on App Store and Google Play",
    ctaBody: "Download ULMOX today from App Store or Google Play and start sharing real video moments.",
    copyright: "© 2026 ULMOX",
  }),
  en: Object.freeze({
    lead: "Share real",
    accent: "video moments.",
    subtitle: "Share real video moments with people around the world. Capture authentic experiences, receive unexpected moments, and discover stories from the ULMOX global community.",
    cardText: "One real moment",
    features: Object.freeze([
      Object.freeze({ heading: "Real videos", body: "No staged moments. Capture what feels real." }),
      Object.freeze({ heading: "Daily moments", body: "A limited daily sharing system." }),
      Object.freeze({ heading: "Global feed", body: "Share selected moments with the world." }),
    ]),
    ctaHeading: "Available now on App Store and Google Play",
    ctaBody: "Download ULMOX today from App Store or Google Play and start sharing real video moments.",
    copyright: "© 2026 ULMOX",
  }),
  sv: Object.freeze({
    lead: "Dela äkta",
    accent: "videostunder.",
    subtitle: "Dela äkta videostunder med människor över hela världen. Fånga autentiska upplevelser, ta emot oväntade ögonblick och upptäck berättelser i ULMOX globala gemenskap.",
    cardText: "Ett äkta ögonblick",
    features: Object.freeze([
      Object.freeze({ heading: "Äkta videor", body: "Inga iscensatta ögonblick. Fånga det som känns äkta." }),
      Object.freeze({ heading: "Dagliga ögonblick", body: "Ett begränsat system för daglig delning." }),
      Object.freeze({ heading: "Globalt flöde", body: "Dela utvalda ögonblick med världen." }),
    ]),
    ctaHeading: "Finns nu på App Store och Google Play",
    ctaBody: "Ladda ner ULMOX idag från App Store eller Google Play och börja dela äkta videostunder.",
    copyright: "© 2026 ULMOX",
  }),
  tr: Object.freeze({
    lead: "Gerçek",
    accent: "video anları paylaş.",
    subtitle: "Dünyanın dört bir yanındaki insanlarla gerçek video anları paylaş. Samimi deneyimleri yakala, beklenmedik anlar al ve ULMOX küresel topluluğundaki hikayeleri keşfet.",
    cardText: "Gerçek bir an",
    features: Object.freeze([
      Object.freeze({ heading: "Gerçek videolar", body: "Kurgulanmış anlar yok. Gerçek hissettiren anı yakala." }),
      Object.freeze({ heading: "Günlük anlar", body: "Sınırlı günlük paylaşım sistemi." }),
      Object.freeze({ heading: "Küresel akış", body: "Seçtiğin anları dünyayla paylaş." }),
    ]),
    ctaHeading: "Şimdi App Store ve Google Play’de",
    ctaBody: "ULMOX’u bugün App Store veya Google Play’den indir ve gerçek video anları paylaşmaya başla.",
    copyright: "© 2026 ULMOX",
  }),
  de: Object.freeze({
    lead: "Teile echte",
    accent: "Videomomente.",
    subtitle: "Teile echte Videomomente mit Menschen auf der ganzen Welt. Halte authentische Erlebnisse fest, erhalte unerwartete Momente und entdecke Geschichten aus der globalen ULMOX Community.",
    cardText: "Ein echter Moment",
    features: Object.freeze([
      Object.freeze({ heading: "Echte Videos", body: "Keine inszenierten Momente. Halte fest, was sich echt anfühlt." }),
      Object.freeze({ heading: "Tägliche Momente", body: "Ein begrenztes System zum täglichen Teilen." }),
      Object.freeze({ heading: "Globaler Feed", body: "Teile ausgewählte Momente mit der Welt." }),
    ]),
    ctaHeading: "Jetzt im App Store und bei Google Play verfügbar",
    ctaBody: "Lade ULMOX heute im App Store oder bei Google Play herunter und teile echte Videomomente.",
    copyright: "© 2026 ULMOX",
  }),
  es: Object.freeze({
    lead: "Comparte momentos",
    accent: "reales en vídeo.",
    subtitle: "Comparte momentos reales en vídeo con personas de todo el mundo. Captura experiencias auténticas, recibe momentos inesperados y descubre historias de la comunidad global de ULMOX.",
    cardText: "Un momento real",
    features: Object.freeze([
      Object.freeze({ heading: "Vídeos reales", body: "Sin momentos preparados. Captura lo que se siente real." }),
      Object.freeze({ heading: "Momentos diarios", body: "Un sistema limitado para compartir cada día." }),
      Object.freeze({ heading: "Feed global", body: "Comparte momentos seleccionados con el mundo." }),
    ]),
    ctaHeading: "Disponible ahora en App Store y Google Play",
    ctaBody: "Descarga ULMOX hoy desde App Store o Google Play y empieza a compartir momentos reales en vídeo.",
    copyright: "© 2026 ULMOX",
  }),
  fr: Object.freeze({
    lead: "Partager de vrais",
    accent: "moments vidéo.",
    subtitle: "Partagez de vrais moments vidéo avec des personnes du monde entier. Capturez des expériences authentiques, recevez des moments inattendus et découvrez des histoires de la communauté mondiale ULMOX.",
    cardText: "Un vrai moment",
    features: Object.freeze([
      Object.freeze({ heading: "Vidéos réelles", body: "Pas de moments mis en scène. Capturez ce qui semble vrai." }),
      Object.freeze({ heading: "Moments quotidiens", body: "Un système limité de partage quotidien." }),
      Object.freeze({ heading: "Fil mondial", body: "Partagez des moments choisis avec le monde." }),
    ]),
    ctaHeading: "Disponible maintenant sur App Store et Google Play",
    ctaBody: "Téléchargez ULMOX dès aujourd’hui depuis App Store ou Google Play et commencez à partager de vrais moments vidéo.",
    copyright: "© 2026 ULMOX",
  }),
  it: Object.freeze({
    lead: "Condividi veri",
    accent: "momenti video.",
    subtitle: "Condividi veri momenti video con persone in tutto il mondo. Cattura esperienze autentiche, ricevi momenti inattesi e scopri storie dalla community globale di ULMOX.",
    cardText: "Un momento reale",
    features: Object.freeze([
      Object.freeze({ heading: "Video reali", body: "Nessun momento costruito. Cattura ciò che sembra vero." }),
      Object.freeze({ heading: "Momenti quotidiani", body: "Un sistema limitato di condivisione quotidiana." }),
      Object.freeze({ heading: "Feed globale", body: "Condividi momenti selezionati con il mondo." }),
    ]),
    ctaHeading: "Disponibile ora su App Store e Google Play",
    ctaBody: "Scarica ULMOX oggi da App Store o Google Play e inizia a condividere veri momenti video.",
    copyright: "© 2026 ULMOX",
  }),
  pt: Object.freeze({
    lead: "Partilhe momentos",
    accent: "reais em vídeo.",
    subtitle: "Partilhe momentos reais em vídeo com pessoas de todo o mundo. Capture experiências autênticas, receba momentos inesperados e descubra histórias da comunidade global ULMOX.",
    cardText: "Um momento real",
    features: Object.freeze([
      Object.freeze({ heading: "Vídeos reais", body: "Sem momentos encenados. Capture o que parece real." }),
      Object.freeze({ heading: "Momentos diários", body: "Um sistema limitado de partilha diária." }),
      Object.freeze({ heading: "Feed global", body: "Partilhe momentos selecionados com o mundo." }),
    ]),
    ctaHeading: "Disponível agora na App Store e no Google Play",
    ctaBody: "Transfira ULMOX hoje na App Store ou no Google Play e comece a partilhar momentos reais em vídeo.",
    copyright: "© 2026 ULMOX",
  }),
  nl: Object.freeze({
    lead: "Deel echte",
    accent: "videomomenten.",
    subtitle: "Deel echte videomomenten met mensen over de hele wereld. Leg authentieke ervaringen vast, ontvang onverwachte momenten en ontdek verhalen uit de wereldwijde ULMOX-community.",
    cardText: "Eén echt moment",
    features: Object.freeze([
      Object.freeze({ heading: "Echte video’s", body: "Geen geënsceneerde momenten. Leg vast wat echt voelt." }),
      Object.freeze({ heading: "Dagelijkse momenten", body: "Een beperkt systeem voor dagelijks delen." }),
      Object.freeze({ heading: "Wereldwijde feed", body: "Deel geselecteerde momenten met de wereld." }),
    ]),
    ctaHeading: "Nu beschikbaar in de App Store en op Google Play",
    ctaBody: "Download ULMOX vandaag in de App Store of op Google Play en begin met het delen van echte videomomenten.",
    copyright: "© 2026 ULMOX",
  }),
  pl: Object.freeze({
    lead: "Dziel się prawdziwymi",
    accent: "chwilami wideo.",
    subtitle: "Dziel się prawdziwymi chwilami wideo z ludźmi na całym świecie. Utrwalaj autentyczne doświadczenia, otrzymuj niespodziewane momenty i odkrywaj historie globalnej społeczności ULMOX.",
    cardText: "Jedna prawdziwa chwila",
    features: Object.freeze([
      Object.freeze({ heading: "Prawdziwe filmy", body: "Bez reżyserowanych momentów. Uchwyć to, co naprawdę czuć." }),
      Object.freeze({ heading: "Codzienne chwile", body: "Ograniczony system codziennego udostępniania." }),
      Object.freeze({ heading: "Globalny kanał", body: "Udostępniaj wybrane chwile światu." }),
    ]),
    ctaHeading: "Dostępne teraz w App Store i Google Play",
    ctaBody: "Pobierz ULMOX już dziś z App Store lub Google Play i zacznij dzielić się prawdziwymi chwilami wideo.",
    copyright: "© 2026 ULMOX",
  }),
  fi: Object.freeze({
    lead: "Jaa aitoja",
    accent: "videohetkiä.",
    subtitle: "Jaa aitoja videohetkiä ihmisten kanssa ympäri maailmaa. Tallenna autenttisia kokemuksia, vastaanota odottamattomia hetkiä ja löydä tarinoita ULMOXin globaalista yhteisöstä.",
    cardText: "Yksi aito hetki",
    features: Object.freeze([
      Object.freeze({ heading: "Aidot videot", body: "Ei lavastettuja hetkiä. Tallenna se, mikä tuntuu aidolta." }),
      Object.freeze({ heading: "Päivittäiset hetket", body: "Rajoitettu päivittäisen jakamisen järjestelmä." }),
      Object.freeze({ heading: "Globaali syöte", body: "Jaa valitut hetket maailmalle." }),
    ]),
    ctaHeading: "Saatavilla nyt App Storessa ja Google Playssa",
    ctaBody: "Lataa ULMOX tänään App Storesta tai Google Playsta ja aloita aitojen videohetkien jakaminen.",
    copyright: "© 2026 ULMOX",
  }),
  ru: Object.freeze({
    lead: "Делитесь настоящими",
    accent: "видеомоментами.",
    subtitle: "Делитесь настоящими видеомоментами с людьми по всему миру. Сохраняйте подлинные впечатления, получайте неожиданные моменты и открывайте истории глобального сообщества ULMOX.",
    cardText: "Один настоящий момент",
    features: Object.freeze([
      Object.freeze({ heading: "Настоящие видео", body: "Без постановочных моментов. Снимайте то, что кажется настоящим." }),
      Object.freeze({ heading: "Ежедневные моменты", body: "Ограниченная система ежедневного обмена." }),
      Object.freeze({ heading: "Глобальная лента", body: "Делитесь выбранными моментами со всем миром." }),
    ]),
    ctaHeading: "Теперь доступно в App Store и Google Play",
    ctaBody: "Скачайте ULMOX сегодня в App Store или Google Play и начните делиться настоящими видеомоментами.",
    copyright: "© 2026 ULMOX",
  }),
  ja: Object.freeze({
    lead: "リアルな",
    accent: "動画の瞬間を共有。",
    subtitle: "世界中の人たちとリアルな動画の瞬間を共有しましょう。 本物の体験を残し、思いがけない瞬間を受け取り、 ULMOXのグローバルコミュニティで物語を見つけられます。",
    cardText: "ひとつのリアルな瞬間",
    features: Object.freeze([
      Object.freeze({ heading: "リアルな動画", body: "作られた瞬間ではなく、本当に感じた瞬間を残しましょう。" }),
      Object.freeze({ heading: "毎日の瞬間", body: "1日の共有を大切にする限定的な仕組み。" }),
      Object.freeze({ heading: "グローバルフィード", body: "選んだ瞬間を世界と共有しましょう。" }),
    ]),
    ctaHeading: "App StoreとGoogle Playで配信中",
    ctaBody: "ULMOXをApp StoreまたはGoogle Playからダウンロードして、リアルな動画の瞬間を共有しましょう。",
    copyright: "© 2026 ULMOX",
  }),
  ko: Object.freeze({
    lead: "진짜",
    accent: "영상 순간을 공유하세요.",
    subtitle: "전 세계 사람들과 진짜 영상 순간을 공유하세요. 진정한 경험을 담고, 예상치 못한 순간을 받고, ULMOX 글로벌 커뮤니티의 이야기를 발견하세요.",
    cardText: "하나의 진짜 순간",
    features: Object.freeze([
      Object.freeze({ heading: "진짜 영상", body: "연출된 순간이 아닙니다. 진짜처럼 느껴지는 순간을 담으세요." }),
      Object.freeze({ heading: "매일의 순간", body: "제한된 일일 공유 시스템." }),
      Object.freeze({ heading: "글로벌 피드", body: "선택한 순간을 전 세계와 공유하세요." }),
    ]),
    ctaHeading: "App Store와 Google Play에서 지금 이용 가능",
    ctaBody: "오늘 App Store 또는 Google Play에서 ULMOX를 다운로드하고 진짜 영상 순간을 공유해 보세요.",
    copyright: "© 2026 ULMOX",
  }),
  zh: Object.freeze({
    lead: "分享真实的",
    accent: "视频瞬间。",
    subtitle: "与世界各地的人分享真实的视频瞬间。 捕捉真实体验，接收意想不到的时刻， 在 ULMOX 全球社区中发现故事。",
    cardText: "一个真实瞬间",
    features: Object.freeze([
      Object.freeze({ heading: "真实视频", body: "没有刻意摆拍。捕捉真正有感觉的瞬间。" }),
      Object.freeze({ heading: "每日瞬间", body: "有限制的每日分享机制。" }),
      Object.freeze({ heading: "全球动态", body: "将精选瞬间分享给世界。" }),
    ]),
    ctaHeading: "现已登陆 App Store 和 Google Play",
    ctaBody: "立即从 App Store 或 Google Play 下载 ULMOX，开始分享真实的视频瞬间。",
    copyright: "© 2026 ULMOX",
  }),
  ar: Object.freeze({
    lead: "شارك",
    accent: "لحظات فيديو حقيقية.",
    subtitle: "شارك لحظات فيديو حقيقية مع أشخاص من حول العالم. التقط تجارب أصيلة، واستقبل لحظات غير متوقعة، واكتشف قصصًا من مجتمع ULMOX العالمي.",
    cardText: "لحظة حقيقية واحدة",
    features: Object.freeze([
      Object.freeze({ heading: "فيديوهات حقيقية", body: "لا لحظات مصطنعة. التقط ما يبدو حقيقيًا." }),
      Object.freeze({ heading: "لحظات يومية", body: "نظام محدود للمشاركة اليومية." }),
      Object.freeze({ heading: "موجز عالمي", body: "شارك اللحظات المختارة مع العالم." }),
    ]),
    ctaHeading: "متوفر الآن على App Store و Google Play",
    ctaBody: "نزّل ULMOX اليوم من App Store أو Google Play وابدأ بمشاركة لحظات فيديو حقيقية.",
    copyright: "© 2026 ULMOX",
  }),
  hi: Object.freeze({
    lead: "असली",
    accent: "वीडियो पल साझा करें।",
    subtitle: "दुनिया भर के लोगों के साथ असली वीडियो पल साझा करें। वास्तविक अनुभव कैप्चर करें, अनपेक्षित पल प्राप्त करें, और ULMOX वैश्विक समुदाय की कहानियां खोजें।",
    cardText: "एक असली पल",
    features: Object.freeze([
      Object.freeze({ heading: "असली वीडियो", body: "बनावटी पल नहीं। जो सच लगे, उसे कैप्चर करें।" }),
      Object.freeze({ heading: "दैनिक पल", body: "दैनिक साझा करने की सीमित प्रणाली।" }),
      Object.freeze({ heading: "वैश्विक फ़ीड", body: "चुने हुए पलों को दुनिया के साथ साझा करें।" }),
    ]),
    ctaHeading: "अब App Store और Google Play पर उपलब्ध",
    ctaBody: "आज ही App Store या Google Play से ULMOX डाउनलोड करें और असली वीडियो पल साझा करना शुरू करें।",
    copyright: "© 2026 ULMOX",
  }),
  th: Object.freeze({
    lead: "แชร์",
    accent: "ช่วงเวลาวิดีโอจริง",
    subtitle: "แชร์ช่วงเวลาวิดีโอจริงกับผู้คนทั่วโลก บันทึกประสบการณ์ที่แท้จริง รับช่วงเวลาที่ไม่คาดคิด และค้นพบเรื่องราวจากชุมชน ULMOX ทั่วโลก",
    cardText: "หนึ่งช่วงเวลาจริง",
    features: Object.freeze([
      Object.freeze({ heading: "วิดีโอจริง", body: "ไม่ใช่ช่วงเวลาที่จัดฉาก บันทึกสิ่งที่รู้สึกจริง" }),
      Object.freeze({ heading: "ช่วงเวลารายวัน", body: "ระบบแชร์รายวันที่มีขอบเขตจำกัด" }),
      Object.freeze({ heading: "ฟีดทั่วโลก", body: "แชร์ช่วงเวลาที่เลือกกับผู้คนทั่วโลก" }),
    ]),
    ctaHeading: "พร้อมให้ดาวน์โหลดแล้วบน App Store และ Google Play",
    ctaBody: "ดาวน์โหลด ULMOX วันนี้จาก App Store หรือ Google Play แล้วเริ่มแชร์ช่วงเวลาวิดีโอจริง",
    copyright: "© 2026 ULMOX",
  }),
  vi: Object.freeze({
    lead: "Chia sẻ những",
    accent: "khoảnh khắc video thật.",
    subtitle: "Chia sẻ những khoảnh khắc video thật với mọi người trên khắp thế giới. Ghi lại trải nghiệm chân thực, nhận những khoảnh khắc bất ngờ và khám phá câu chuyện từ cộng đồng ULMOX toàn cầu.",
    cardText: "Một khoảnh khắc thật",
    features: Object.freeze([
      Object.freeze({ heading: "Video chân thực", body: "Không dàn dựng. Hãy ghi lại điều thật sự có cảm xúc." }),
      Object.freeze({ heading: "Khoảnh khắc hằng ngày", body: "Hệ thống chia sẻ hằng ngày có giới hạn." }),
      Object.freeze({ heading: "Bảng tin toàn cầu", body: "Chia sẻ những khoảnh khắc đã chọn với thế giới." }),
    ]),
    ctaHeading: "Hiện đã có trên App Store và Google Play",
    ctaBody: "Tải ULMOX hôm nay từ App Store hoặc Google Play và bắt đầu chia sẻ những khoảnh khắc video thật.",
    copyright: "© 2026 ULMOX",
  }),
});

module.exports = { LANDING };
