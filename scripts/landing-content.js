"use strict";

/**
 * The localized copy for the 20 ULMOX landing routes.
 *
 * Stage 1.6W.1 brought the landing pages under one generator and harvested the
 * copy that was already published. That copy described an app that shared
 * video moments and nothing else: three feature cards, a hero and a store call
 * to action. The product now has four named surfaces — Moments, World Live,
 * Global and Connections — and a landing page that names none of them is a
 * page about a different app.
 *
 * WHAT THIS FILE MAY SAY
 *
 * Every product claim below is one the published legal pages already make, and
 * they are the authority, not this file:
 *
 *   - Connections: /terms.html §3 and /safety.html. Eligibility comes from
 *     prior qualifying video encounters, both people approve independently,
 *     the conversation is text only, and Report, Block and End Connection are
 *     always available. There is no user search and no open messaging.
 *   - Global: /terms.html §2, the feed a person may share a moment to.
 *   - Moments and World Live: the product's own surfaces, described here in
 *     the terms the app uses for them.
 *
 * Three rules this file lives by:
 *
 *   1. No page may say Connections is on for everyone. Every localized
 *      Connections section renders `webGradualRollout` from
 *      scripts/translation-content.js — the same hand-localized sentence the
 *      six legal pages carry — so the availability statement on the landing
 *      page and in the Terms are literally the same sentence.
 *   2. No page may promise that sharing a Moment produces a Connection. The
 *      copy says a genuine encounter *can* make one possible, which is what
 *      the Terms say.
 *   3. No statistic, testimonial, user count, rating or review appears here,
 *      in any locale. There is no number in this file that is not a step
 *      number.
 *
 * TERMINOLOGY
 *
 * `World Live`, `Global` and `Connections` are product names and stay in
 * English in every locale, the convention the localized legal pages already
 * use — every locale's `webGradualRollout` names "Connections" untranslated,
 * and the German, Japanese and Arabic Terms do the same. The word for a
 * *moment* is translated, using each locale's own existing landing vocabulary,
 * so the site keeps saying "ögonblick", "an", "Moment", "瞬間" and so on
 * rather than switching language mid-sentence.
 *
 * `ctaHeading`, `ctaBody` and `copyright` are unchanged from the copy that was
 * already published in each locale.
 */

const LANDING = Object.freeze({
  en: Object.freeze({
    heroBadge: "Real moments. Real people.",
    lead: "Share a moment.",
    accent: "Discover a world.",
    subtitle:
      "Share one real moment and receive real moments from people living somewhere else entirely.",
    metaDescription:
      "ULMOX is where real moments meet real people. Share a moment, explore World Live, discover Global, and let genuine encounters grow into Connections.",
    appStoreAria: "Download ULMOX on the App Store",
    playStoreAria: "Get ULMOX on Google Play",

    howHeading: "How ULMOX works",
    howBody: "Three simple steps. Nothing to perfect, nothing to perform.",
    howSteps: Object.freeze([
      Object.freeze({
        heading: "Share a moment",
        body: "Record something real from your day and send it out into the world.",
      }),
      Object.freeze({
        heading: "Receive a moment",
        body: "Someone else's moment arrives: a street, a view, an ordinary afternoon.",
      }),
      Object.freeze({
        heading: "Keep exploring",
        body: "Open World Live and Global to see where else the world is right now.",
      }),
    ]),

    worldHeading: "World Live",
    worldBody:
      "Explore real moments shared from different places around the world, on one interactive world.",
    worldBody2:
      "Turn the globe, stop somewhere that catches your eye, and watch the moment that came from it.",

    connectionsHeading: "Real moments can become real connections.",
    connectionsBody: "No swiping. No follower race. Meet through moments first.",
    connectionsSteps: Object.freeze([
      Object.freeze({
        heading: "Share real moments",
        body: "It begins with something you actually lived, not a profile.",
      }),
      Object.freeze({
        heading: "Meet people naturally",
        body: "You come across other people through the moments you exchange.",
      }),
      Object.freeze({
        heading: "A Connection becomes possible",
        body: "Genuine encounters can make a Connection possible between two people.",
      }),
      Object.freeze({
        heading: "Send a request",
        body: "When it is possible, either person can ask for a Connection.",
      }),
      Object.freeze({
        heading: "Both people approve",
        body: "Nothing opens until you have both said yes, each on your own.",
      }),
      Object.freeze({
        heading: "Start talking",
        body: "An active Connection means text messages and each other's profile.",
      }),
    ]),
    connectionsSafety:
      "You keep control the whole way. Report, Block and End Connection are always within reach.",

    globalBody:
      "Discover real moments that people choose to share with the wider ULMOX community.",
    globalBody2: "One place to see what the community is sharing openly, right now.",

    differentHeading: "Why ULMOX is different",
    differences: Object.freeze([
      Object.freeze({
        heading: "Real moments, not polished profiles",
        body: "You share a moment you lived, not a picture of who you would like to be.",
      }),
      Object.freeze({
        heading: "People beyond your circle",
        body: "ULMOX brings you people you were never going to meet through the people you already know.",
      }),
      Object.freeze({
        heading: "No follower race",
        body: "There is no count to chase and no audience to build.",
      }),
      Object.freeze({
        heading: "Connections grow from encounters",
        body: "A conversation starts because something real happened first.",
      }),
      Object.freeze({
        heading: "The world through the people in it",
        body: "Every moment comes from someone who is actually standing there.",
      }),
    ]),

    safetyHeading: "Safety and control",
    safetyBody:
      "Messaging is never open to strangers. A conversation can only begin after the ULMOX encounters it requires and approval from both people, and you can end it at any time.",
    safetyControls: Object.freeze([
      Object.freeze({
        heading: "Report",
        body: "Report a user or a single message. A person reviews it.",
      }),
      Object.freeze({
        heading: "Block",
        body: "Blocking stops contact in both directions.",
      }),
      Object.freeze({
        heading: "End Connection",
        body: "Leaving always works, and it is final for that pair.",
      }),
    ]),

    ctaHeading: "Available now on App Store and Google Play",
    ctaBody:
      "Download ULMOX today from App Store or Google Play and start sharing real video moments.",
    copyright: "© 2026 ULMOX",
  }),

  sv: Object.freeze({
    heroBadge: "Äkta ögonblick. Riktiga människor.",
    lead: "Dela ett ögonblick.",
    accent: "Upptäck en värld.",
    subtitle:
      "Dela ett äkta ögonblick och få äkta ögonblick från människor som lever någon helt annanstans.",
    metaDescription:
      "ULMOX är där äkta ögonblick möter riktiga människor. Dela ett ögonblick, utforska World Live, upptäck Global och låt äkta möten växa till Connections.",
    appStoreAria: "Ladda ner ULMOX på App Store",
    playStoreAria: "Hämta ULMOX på Google Play",

    howHeading: "Så fungerar ULMOX",
    howBody: "Tre enkla steg. Inget att finslipa, inget att spela upp.",
    howSteps: Object.freeze([
      Object.freeze({
        heading: "Dela ett ögonblick",
        body: "Spela in något äkta från din dag och skicka ut det i världen.",
      }),
      Object.freeze({
        heading: "Ta emot ett ögonblick",
        body: "Någon annans ögonblick dyker upp: en gata, en utsikt, en helt vanlig eftermiddag.",
      }),
      Object.freeze({
        heading: "Fortsätt utforska",
        body: "Öppna World Live och Global för att se var världen befinner sig just nu.",
      }),
    ]),

    worldHeading: "World Live",
    worldBody:
      "Utforska äkta ögonblick som delas från olika platser runt om i världen, på en interaktiv jordglob.",
    worldBody2:
      "Vrid på jordgloben, stanna vid en plats som fångar din blick och se ögonblicket som kom därifrån.",

    connectionsHeading: "Äkta ögonblick kan bli riktiga kontakter.",
    connectionsBody: "Inget swipande. Ingen jakt på följare. Ni möts genom ögonblick först.",
    connectionsSteps: Object.freeze([
      Object.freeze({
        heading: "Dela äkta ögonblick",
        body: "Det börjar med något du faktiskt har upplevt, inte med en profil.",
      }),
      Object.freeze({
        heading: "Möt människor naturligt",
        body: "Du stöter på andra genom de ögonblick ni utbyter.",
      }),
      Object.freeze({
        heading: "En Connection blir möjlig",
        body: "Äkta möten kan göra en Connection möjlig mellan två personer.",
      }),
      Object.freeze({
        heading: "Skicka en förfrågan",
        body: "När det är möjligt kan endera personen be om en Connection.",
      }),
      Object.freeze({
        heading: "Båda godkänner",
        body: "Ingenting öppnas förrän ni båda har sagt ja, var och en för sig.",
      }),
      Object.freeze({
        heading: "Börja prata",
        body: "En aktiv Connection betyder textmeddelanden och varandras profiler.",
      }),
    ]),
    connectionsSafety:
      "Du behåller kontrollen hela vägen. Anmäl, Blockera och Avsluta Connection finns alltid nära till hands.",

    globalBody:
      "Upptäck äkta ögonblick som människor väljer att dela med hela ULMOX-gemenskapen.",
    globalBody2: "En plats där du ser vad gemenskapen delar öppet, just nu.",

    differentHeading: "Därför är ULMOX annorlunda",
    differences: Object.freeze([
      Object.freeze({
        heading: "Äkta ögonblick, inte polerade profiler",
        body: "Du delar ett ögonblick du levt, inte en bild av den du vill vara.",
      }),
      Object.freeze({
        heading: "Människor utanför din krets",
        body: "ULMOX visar dig människor du aldrig skulle ha mött genom dem du redan känner.",
      }),
      Object.freeze({
        heading: "Ingen jakt på följare",
        body: "Det finns ingen siffra att jaga och ingen publik att bygga.",
      }),
      Object.freeze({
        heading: "Kontakter växer ur möten",
        body: "Ett samtal börjar för att något äkta hände först.",
      }),
      Object.freeze({
        heading: "Världen genom människorna i den",
        body: "Varje ögonblick kommer från någon som faktiskt står där.",
      }),
    ]),

    safetyHeading: "Säkerhet och kontroll",
    safetyBody:
      "Meddelanden är aldrig öppna för främlingar. Ett samtal kan börja först efter de möten i ULMOX som krävs och ett godkännande från båda personerna, och du kan avsluta det när som helst.",
    safetyControls: Object.freeze([
      Object.freeze({
        heading: "Anmäl",
        body: "Anmäl en användare eller ett enskilt meddelande. En människa granskar det.",
      }),
      Object.freeze({
        heading: "Blockera",
        body: "Blockering stoppar kontakt i båda riktningarna.",
      }),
      Object.freeze({
        heading: "Avsluta Connection",
        body: "Att lämna fungerar alltid, och det är slutgiltigt för det paret.",
      }),
    ]),

    ctaHeading: "Finns nu på App Store och Google Play",
    ctaBody:
      "Ladda ner ULMOX idag från App Store eller Google Play och börja dela äkta videostunder.",
    copyright: "© 2026 ULMOX",
  }),

  tr: Object.freeze({
    heroBadge: "Gerçek anlar. Gerçek insanlar.",
    lead: "Bir an paylaş.",
    accent: "Bir dünya keşfet.",
    subtitle:
      "Gerçek bir an paylaş ve bambaşka bir yerde yaşayan insanlardan gerçek anlar al.",
    metaDescription:
      "ULMOX, gerçek anların gerçek insanlarla buluştuğu yer. Bir an paylaş, World Live’ı keşfet, Global’i gör ve samimi karşılaşmaların Connections’a dönüşmesine izin ver.",
    appStoreAria: "ULMOX’u App Store’dan indir",
    playStoreAria: "ULMOX’u Google Play’den edin",

    howHeading: "ULMOX nasıl çalışır",
    howBody: "Üç basit adım. Cilalanacak bir şey yok, rol yapmaya gerek yok.",
    howSteps: Object.freeze([
      Object.freeze({
        heading: "Bir an paylaş",
        body: "Gününden gerçek bir şey kaydet ve dünyaya gönder.",
      }),
      Object.freeze({
        heading: "Bir an al",
        body: "Bir başkasının anı sana ulaşır: bir sokak, bir manzara, sıradan bir öğleden sonra.",
      }),
      Object.freeze({
        heading: "Keşfetmeye devam et",
        body: "Dünyanın şu anda başka nerede olduğunu görmek için World Live ve Global’i aç.",
      }),
    ]),

    worldHeading: "World Live",
    worldBody:
      "Dünyanın farklı yerlerinden paylaşılan gerçek anları tek bir etkileşimli dünya üzerinde keşfet.",
    worldBody2:
      "Küreyi çevir, gözüne çarpan bir yerde dur ve oradan gelen anı izle.",

    connectionsHeading: "Gerçek anlar gerçek bağlara dönüşebilir.",
    connectionsBody: "Kaydırma yok. Takipçi yarışı yok. Önce anlar üzerinden tanışın.",
    connectionsSteps: Object.freeze([
      Object.freeze({
        heading: "Gerçek anlar paylaş",
        body: "Her şey gerçekten yaşadığın bir şeyle başlar, bir profille değil.",
      }),
      Object.freeze({
        heading: "İnsanlarla doğal şekilde tanış",
        body: "Paylaştığınız anlar üzerinden başkalarıyla karşılaşırsın.",
      }),
      Object.freeze({
        heading: "Bir Connection mümkün hale gelir",
        body: "Samimi karşılaşmalar iki kişi arasında bir Connection’ı mümkün kılabilir.",
      }),
      Object.freeze({
        heading: "İstek gönder",
        body: "Mümkün olduğunda iki kişiden biri Connection isteyebilir.",
      }),
      Object.freeze({
        heading: "İki taraf da onaylar",
        body: "İkiniz de ayrı ayrı evet demeden hiçbir şey açılmaz.",
      }),
      Object.freeze({
        heading: "Konuşmaya başla",
        body: "Etkin bir Connection, metin mesajları ve birbirinizin profili demektir.",
      }),
    ]),
    connectionsSafety:
      "Kontrol baştan sona sende. Bildir, Engelle ve Connection’ı sonlandır her zaman elinin altında.",

    globalBody:
      "İnsanların geniş ULMOX topluluğuyla paylaşmayı seçtiği gerçek anları keşfet.",
    globalBody2: "Topluluğun şu anda açıkça ne paylaştığını görebileceğin tek yer.",

    differentHeading: "ULMOX neden farklı",
    differences: Object.freeze([
      Object.freeze({
        heading: "Cilalı profiller değil, gerçek anlar",
        body: "Olmak istediğin kişinin resmini değil, yaşadığın bir anı paylaşırsın.",
      }),
      Object.freeze({
        heading: "Çevrenin ötesindeki insanlar",
        body: "ULMOX, tanıdıkların üzerinden asla karşılaşmayacağın insanları sana getirir.",
      }),
      Object.freeze({
        heading: "Takipçi yarışı yok",
        body: "Peşinden koşulacak bir sayı ve kurulacak bir izleyici kitlesi yok.",
      }),
      Object.freeze({
        heading: "Bağlar karşılaşmalardan doğar",
        body: "Bir sohbet, önce gerçek bir şey yaşandığı için başlar.",
      }),
      Object.freeze({
        heading: "Dünyayı içinde yaşayanlar üzerinden gör",
        body: "Her an, gerçekten orada duran birinden gelir.",
      }),
    ]),

    safetyHeading: "Güvenlik ve kontrol",
    safetyBody:
      "Mesajlaşma yabancılara asla açık değildir. Bir sohbet ancak ULMOX’un gerektirdiği karşılaşmalardan ve iki kişinin de onayından sonra başlayabilir; dilediğin an sonlandırabilirsin.",
    safetyControls: Object.freeze([
      Object.freeze({
        heading: "Bildir",
        body: "Bir kullanıcıyı ya da tek bir mesajı bildir. Bunu bir insan inceler.",
      }),
      Object.freeze({
        heading: "Engelle",
        body: "Engelleme, iletişimi her iki yönde de durdurur.",
      }),
      Object.freeze({
        heading: "Connection’ı sonlandır",
        body: "Ayrılmak her zaman mümkündür ve o ikili için kalıcıdır.",
      }),
    ]),

    ctaHeading: "Şimdi App Store ve Google Play’de",
    ctaBody:
      "ULMOX’u bugün App Store veya Google Play’den indir ve gerçek video anları paylaşmaya başla.",
    copyright: "© 2026 ULMOX",
  }),

  de: Object.freeze({
    heroBadge: "Echte Momente. Echte Menschen.",
    lead: "Teile einen Moment.",
    accent: "Entdecke eine Welt.",
    subtitle:
      "Teile einen echten Moment und erhalte echte Momente von Menschen, die ganz woanders leben.",
    metaDescription:
      "Bei ULMOX treffen echte Momente auf echte Menschen. Teile einen Moment, erkunde World Live, entdecke Global und lass aus echten Begegnungen Connections wachsen.",
    appStoreAria: "ULMOX im App Store laden",
    playStoreAria: "ULMOX bei Google Play holen",

    howHeading: "So funktioniert ULMOX",
    howBody: "Drei einfache Schritte. Nichts zu perfektionieren, nichts vorzuspielen.",
    howSteps: Object.freeze([
      Object.freeze({
        heading: "Einen Moment teilen",
        body: "Nimm etwas Echtes aus deinem Tag auf und schick es hinaus in die Welt.",
      }),
      Object.freeze({
        heading: "Einen Moment erhalten",
        body: "Der Moment eines anderen kommt an: eine Straße, ein Ausblick, ein ganz gewöhnlicher Nachmittag.",
      }),
      Object.freeze({
        heading: "Weiter entdecken",
        body: "Öffne World Live und Global und sieh, wo die Welt gerade sonst noch ist.",
      }),
    ]),

    worldHeading: "World Live",
    worldBody:
      "Erkunde echte Momente, die von verschiedenen Orten der Welt geteilt werden, auf einer interaktiven Welt.",
    worldBody2:
      "Dreh den Globus, halte dort an, wo dein Blick hängen bleibt, und sieh den Moment, der von dort kam.",

    connectionsHeading: "Aus echten Momenten können echte Verbindungen werden.",
    connectionsBody: "Kein Wischen. Kein Follower-Wettlauf. Erst der Moment, dann der Mensch.",
    connectionsSteps: Object.freeze([
      Object.freeze({
        heading: "Echte Momente teilen",
        body: "Es beginnt mit etwas, das du wirklich erlebt hast, nicht mit einem Profil.",
      }),
      Object.freeze({
        heading: "Menschen ganz natürlich begegnen",
        body: "Du triffst andere über die Momente, die ihr austauscht.",
      }),
      Object.freeze({
        heading: "Eine Connection wird möglich",
        body: "Echte Begegnungen können eine Connection zwischen zwei Menschen möglich machen.",
      }),
      Object.freeze({
        heading: "Eine Anfrage senden",
        body: "Wenn es möglich ist, kann jede der beiden Personen um eine Connection bitten.",
      }),
      Object.freeze({
        heading: "Beide stimmen zu",
        body: "Nichts öffnet sich, bevor ihr beide unabhängig voneinander zugestimmt habt.",
      }),
      Object.freeze({
        heading: "Ins Gespräch kommen",
        body: "Eine aktive Connection bedeutet Textnachrichten und das Profil der anderen Person.",
      }),
    ]),
    connectionsSafety:
      "Du behältst die ganze Zeit die Kontrolle. Melden, Blockieren und Connection beenden sind immer griffbereit.",

    globalBody:
      "Entdecke echte Momente, die Menschen mit der gesamten ULMOX Community teilen möchten.",
    globalBody2: "Ein Ort, an dem du siehst, was die Community gerade offen teilt.",

    differentHeading: "Warum ULMOX anders ist",
    differences: Object.freeze([
      Object.freeze({
        heading: "Echte Momente statt polierter Profile",
        body: "Du teilst einen Moment, den du erlebt hast, kein Bild davon, wer du gern wärst.",
      }),
      Object.freeze({
        heading: "Menschen außerhalb deines Kreises",
        body: "ULMOX bringt dir Menschen, denen du über deine Bekannten nie begegnet wärst.",
      }),
      Object.freeze({
        heading: "Kein Follower-Wettlauf",
        body: "Es gibt keine Zahl zu jagen und kein Publikum aufzubauen.",
      }),
      Object.freeze({
        heading: "Verbindungen wachsen aus Begegnungen",
        body: "Ein Gespräch beginnt, weil zuerst etwas Echtes passiert ist.",
      }),
      Object.freeze({
        heading: "Die Welt durch die Menschen darin",
        body: "Jeder Moment kommt von jemandem, der wirklich dort steht.",
      }),
    ]),

    safetyHeading: "Sicherheit und Kontrolle",
    safetyBody:
      "Nachrichten stehen Fremden nie offen. Ein Gespräch kann erst beginnen, wenn die dafür nötigen Begegnungen in ULMOX stattgefunden haben und beide Personen zugestimmt haben, und du kannst es jederzeit beenden.",
    safetyControls: Object.freeze([
      Object.freeze({
        heading: "Melden",
        body: "Melde eine Person oder eine einzelne Nachricht. Ein Mensch prüft sie.",
      }),
      Object.freeze({
        heading: "Blockieren",
        body: "Blockieren stoppt den Kontakt in beide Richtungen.",
      }),
      Object.freeze({
        heading: "Connection beenden",
        body: "Gehen ist immer möglich, und für dieses Paar ist es endgültig.",
      }),
    ]),

    ctaHeading: "Jetzt im App Store und bei Google Play verfügbar",
    ctaBody:
      "Lade ULMOX heute im App Store oder bei Google Play herunter und teile echte Videomomente.",
    copyright: "© 2026 ULMOX",
  }),

  es: Object.freeze({
    heroBadge: "Momentos reales. Personas reales.",
    lead: "Comparte un momento.",
    accent: "Descubre un mundo.",
    subtitle:
      "Comparte un momento real y recibe momentos reales de personas que viven en un lugar completamente distinto.",
    metaDescription:
      "ULMOX es donde los momentos reales se encuentran con personas reales. Comparte un momento, explora World Live, descubre Global y deja que los encuentros auténticos se conviertan en Connections.",
    appStoreAria: "Descargar ULMOX en el App Store",
    playStoreAria: "Consigue ULMOX en Google Play",

    howHeading: "Cómo funciona ULMOX",
    howBody: "Tres pasos sencillos. Nada que perfeccionar, nada que actuar.",
    howSteps: Object.freeze([
      Object.freeze({
        heading: "Comparte un momento",
        body: "Graba algo real de tu día y envíalo al mundo.",
      }),
      Object.freeze({
        heading: "Recibe un momento",
        body: "Llega el momento de otra persona: una calle, una vista, una tarde cualquiera.",
      }),
      Object.freeze({
        heading: "Sigue explorando",
        body: "Abre World Live y Global para ver dónde más está el mundo ahora mismo.",
      }),
    ]),

    worldHeading: "World Live",
    worldBody:
      "Explora momentos reales compartidos desde distintos lugares del mundo, en un mundo interactivo.",
    worldBody2:
      "Gira el globo, detente donde algo te llame la atención y mira el momento que vino de allí.",

    connectionsHeading: "Los momentos reales pueden convertirse en conexiones reales.",
    connectionsBody: "Sin deslizar. Sin carrera de seguidores. Primero os encontráis en un momento.",
    connectionsSteps: Object.freeze([
      Object.freeze({
        heading: "Comparte momentos reales",
        body: "Empieza con algo que viviste de verdad, no con un perfil.",
      }),
      Object.freeze({
        heading: "Conoce gente con naturalidad",
        body: "Te encuentras con otras personas a través de los momentos que intercambiáis.",
      }),
      Object.freeze({
        heading: "Una Connection se vuelve posible",
        body: "Los encuentros auténticos pueden hacer posible una Connection entre dos personas.",
      }),
      Object.freeze({
        heading: "Envía una solicitud",
        body: "Cuando es posible, cualquiera de las dos personas puede pedir una Connection.",
      }),
      Object.freeze({
        heading: "Ambas personas aprueban",
        body: "No se abre nada hasta que las dos hayáis dicho que sí, cada una por su cuenta.",
      }),
      Object.freeze({
        heading: "Empezad a hablar",
        body: "Una Connection activa significa mensajes de texto y el perfil de la otra persona.",
      }),
    ]),
    connectionsSafety:
      "Mantienes el control en todo momento. Denunciar, Bloquear y Finalizar Connection están siempre a mano.",

    globalBody:
      "Descubre momentos reales que las personas eligen compartir con toda la comunidad de ULMOX.",
    globalBody2: "Un solo lugar para ver qué está compartiendo la comunidad abiertamente ahora.",

    differentHeading: "Por qué ULMOX es diferente",
    differences: Object.freeze([
      Object.freeze({
        heading: "Momentos reales, no perfiles pulidos",
        body: "Compartes un momento que viviste, no una imagen de quien te gustaría ser.",
      }),
      Object.freeze({
        heading: "Personas más allá de tu círculo",
        body: "ULMOX te acerca a personas que nunca ibas a conocer a través de quienes ya conoces.",
      }),
      Object.freeze({
        heading: "Sin carrera de seguidores",
        body: "No hay un número que perseguir ni una audiencia que construir.",
      }),
      Object.freeze({
        heading: "Las conexiones nacen de encuentros",
        body: "Una conversación empieza porque antes ocurrió algo real.",
      }),
      Object.freeze({
        heading: "El mundo a través de quienes lo viven",
        body: "Cada momento viene de alguien que está realmente allí.",
      }),
    ]),

    safetyHeading: "Seguridad y control",
    safetyBody:
      "La mensajería nunca está abierta a desconocidos. Una conversación solo puede empezar tras los encuentros que ULMOX exige y la aprobación de las dos personas, y puedes terminarla cuando quieras.",
    safetyControls: Object.freeze([
      Object.freeze({
        heading: "Denunciar",
        body: "Denuncia a una persona o un mensaje concreto. Lo revisa una persona.",
      }),
      Object.freeze({
        heading: "Bloquear",
        body: "Bloquear detiene el contacto en ambas direcciones.",
      }),
      Object.freeze({
        heading: "Finalizar Connection",
        body: "Salir siempre funciona, y es definitivo para esa pareja.",
      }),
    ]),

    ctaHeading: "Disponible ahora en App Store y Google Play",
    ctaBody:
      "Descarga ULMOX hoy desde App Store o Google Play y empieza a compartir momentos reales en vídeo.",
    copyright: "© 2026 ULMOX",
  }),

  fr: Object.freeze({
    heroBadge: "De vrais moments. De vraies personnes.",
    lead: "Partagez un moment.",
    accent: "Découvrez un monde.",
    subtitle:
      "Partagez un vrai moment et recevez de vrais moments de personnes qui vivent tout ailleurs.",
    metaDescription:
      "ULMOX, c’est là où de vrais moments rencontrent de vraies personnes. Partagez un moment, explorez World Live, découvrez Global et laissez de vraies rencontres devenir des Connections.",
    appStoreAria: "Télécharger ULMOX dans l’App Store",
    playStoreAria: "Obtenir ULMOX sur Google Play",

    howHeading: "Comment fonctionne ULMOX",
    howBody: "Trois étapes simples. Rien à peaufiner, rien à jouer.",
    howSteps: Object.freeze([
      Object.freeze({
        heading: "Partagez un moment",
        body: "Filmez quelque chose de vrai dans votre journée et envoyez-le dans le monde.",
      }),
      Object.freeze({
        heading: "Recevez un moment",
        body: "Le moment de quelqu’un d’autre arrive : une rue, une vue, un après-midi ordinaire.",
      }),
      Object.freeze({
        heading: "Continuez à explorer",
        body: "Ouvrez World Live et Global pour voir où le monde se trouve en ce moment.",
      }),
    ]),

    worldHeading: "World Live",
    worldBody:
      "Explorez de vrais moments partagés depuis différents endroits du monde, sur un monde interactif.",
    worldBody2:
      "Faites tourner le globe, arrêtez-vous là où votre regard s’accroche et regardez le moment qui en vient.",

    connectionsHeading: "De vrais moments peuvent devenir de vraies connexions.",
    connectionsBody: "Pas de swipe. Pas de course aux abonnés. On se rencontre d’abord par un moment.",
    connectionsSteps: Object.freeze([
      Object.freeze({
        heading: "Partagez de vrais moments",
        body: "Tout commence par quelque chose que vous avez vraiment vécu, pas par un profil.",
      }),
      Object.freeze({
        heading: "Rencontrez des gens naturellement",
        body: "Vous croisez d’autres personnes à travers les moments que vous échangez.",
      }),
      Object.freeze({
        heading: "Une Connection devient possible",
        body: "De vraies rencontres peuvent rendre une Connection possible entre deux personnes.",
      }),
      Object.freeze({
        heading: "Envoyez une demande",
        body: "Quand c’est possible, l’une ou l’autre personne peut demander une Connection.",
      }),
      Object.freeze({
        heading: "Les deux personnes acceptent",
        body: "Rien ne s’ouvre tant que vous n’avez pas tous les deux dit oui, chacun de votre côté.",
      }),
      Object.freeze({
        heading: "Commencez à parler",
        body: "Une Connection active, ce sont des messages texte et le profil de l’autre.",
      }),
    ]),
    connectionsSafety:
      "Vous gardez le contrôle du début à la fin. Signaler, Bloquer et Mettre fin à la Connection restent toujours accessibles.",

    globalBody:
      "Découvrez de vrais moments que des personnes choisissent de partager avec toute la communauté ULMOX.",
    globalBody2: "Un seul endroit pour voir ce que la communauté partage ouvertement, maintenant.",

    differentHeading: "Pourquoi ULMOX est différent",
    differences: Object.freeze([
      Object.freeze({
        heading: "De vrais moments, pas des profils lissés",
        body: "Vous partagez un moment vécu, pas l’image de celui que vous aimeriez être.",
      }),
      Object.freeze({
        heading: "Des gens au-delà de votre cercle",
        body: "ULMOX vous amène des personnes que vos connaissances ne vous auraient jamais fait rencontrer.",
      }),
      Object.freeze({
        heading: "Pas de course aux abonnés",
        body: "Il n’y a aucun chiffre à courir après et aucune audience à bâtir.",
      }),
      Object.freeze({
        heading: "Les connexions naissent de rencontres",
        body: "Une conversation commence parce que quelque chose de vrai a eu lieu avant.",
      }),
      Object.freeze({
        heading: "Le monde par ceux qui y vivent",
        body: "Chaque moment vient de quelqu’un qui se trouve vraiment là.",
      }),
    ]),

    safetyHeading: "Sécurité et contrôle",
    safetyBody:
      "La messagerie n’est jamais ouverte aux inconnus. Une conversation ne peut commencer qu’après les rencontres exigées par ULMOX et l’accord des deux personnes, et vous pouvez y mettre fin à tout moment.",
    safetyControls: Object.freeze([
      Object.freeze({
        heading: "Signaler",
        body: "Signalez une personne ou un message précis. Un humain l’examine.",
      }),
      Object.freeze({
        heading: "Bloquer",
        body: "Le blocage arrête le contact dans les deux sens.",
      }),
      Object.freeze({
        heading: "Mettre fin à la Connection",
        body: "Partir fonctionne toujours, et c’est définitif pour ce duo.",
      }),
    ]),

    ctaHeading: "Disponible maintenant sur App Store et Google Play",
    ctaBody:
      "Téléchargez ULMOX dès aujourd’hui depuis App Store ou Google Play et commencez à partager de vrais moments vidéo.",
    copyright: "© 2026 ULMOX",
  }),

  it: Object.freeze({
    heroBadge: "Momenti veri. Persone vere.",
    lead: "Condividi un momento.",
    accent: "Scopri un mondo.",
    subtitle:
      "Condividi un momento vero e ricevi momenti veri da persone che vivono da tutt’altra parte.",
    metaDescription:
      "ULMOX è dove i momenti veri incontrano persone vere. Condividi un momento, esplora World Live, scopri Global e lascia che gli incontri autentici diventino Connections.",
    appStoreAria: "Scarica ULMOX su App Store",
    playStoreAria: "Scarica ULMOX su Google Play",

    howHeading: "Come funziona ULMOX",
    howBody: "Tre passaggi semplici. Niente da perfezionare, niente da recitare.",
    howSteps: Object.freeze([
      Object.freeze({
        heading: "Condividi un momento",
        body: "Registra qualcosa di vero della tua giornata e mandalo nel mondo.",
      }),
      Object.freeze({
        heading: "Ricevi un momento",
        body: "Arriva il momento di qualcun altro: una strada, un panorama, un pomeriggio qualsiasi.",
      }),
      Object.freeze({
        heading: "Continua a esplorare",
        body: "Apri World Live e Global per vedere dove si trova il mondo proprio ora.",
      }),
    ]),

    worldHeading: "World Live",
    worldBody:
      "Esplora momenti veri condivisi da luoghi diversi del mondo, su un mondo interattivo.",
    worldBody2:
      "Ruota il globo, fermati dove ti cattura lo sguardo e guarda il momento arrivato da lì.",

    connectionsHeading: "I momenti veri possono diventare legami veri.",
    connectionsBody: "Niente swipe. Nessuna corsa ai follower. Prima ci si incontra in un momento.",
    connectionsSteps: Object.freeze([
      Object.freeze({
        heading: "Condividi momenti veri",
        body: "Si parte da qualcosa che hai vissuto davvero, non da un profilo.",
      }),
      Object.freeze({
        heading: "Incontra persone in modo naturale",
        body: "Incroci altre persone attraverso i momenti che vi scambiate.",
      }),
      Object.freeze({
        heading: "Una Connection diventa possibile",
        body: "Gli incontri autentici possono rendere possibile una Connection tra due persone.",
      }),
      Object.freeze({
        heading: "Invia una richiesta",
        body: "Quando è possibile, una delle due persone può chiedere una Connection.",
      }),
      Object.freeze({
        heading: "Entrambi approvate",
        body: "Non si apre nulla finché non avete detto sì entrambi, ciascuno per conto proprio.",
      }),
      Object.freeze({
        heading: "Iniziate a parlare",
        body: "Una Connection attiva significa messaggi di testo e il profilo dell’altra persona.",
      }),
    ]),
    connectionsSafety:
      "Il controllo resta tuo dall’inizio alla fine. Segnala, Blocca e Termina Connection sono sempre a portata di mano.",

    globalBody:
      "Scopri momenti veri che le persone scelgono di condividere con tutta la community ULMOX.",
    globalBody2: "Un unico posto per vedere cosa la community sta condividendo apertamente, adesso.",

    differentHeading: "Perché ULMOX è diverso",
    differences: Object.freeze([
      Object.freeze({
        heading: "Momenti veri, non profili levigati",
        body: "Condividi un momento che hai vissuto, non l’immagine di chi vorresti essere.",
      }),
      Object.freeze({
        heading: "Persone oltre la tua cerchia",
        body: "ULMOX ti porta persone che non avresti mai incontrato tramite chi già conosci.",
      }),
      Object.freeze({
        heading: "Nessuna corsa ai follower",
        body: "Non c’è un numero da inseguire né un pubblico da costruire.",
      }),
      Object.freeze({
        heading: "I legami nascono dagli incontri",
        body: "Una conversazione inizia perché prima è successo qualcosa di vero.",
      }),
      Object.freeze({
        heading: "Il mondo attraverso chi lo abita",
        body: "Ogni momento arriva da qualcuno che si trova davvero lì.",
      }),
    ]),

    safetyHeading: "Sicurezza e controllo",
    safetyBody:
      "La messaggistica non è mai aperta agli sconosciuti. Una conversazione può iniziare solo dopo gli incontri che ULMOX richiede e l’approvazione di entrambe le persone, e puoi chiuderla quando vuoi.",
    safetyControls: Object.freeze([
      Object.freeze({
        heading: "Segnala",
        body: "Segnala una persona o un singolo messaggio. A esaminarlo è una persona.",
      }),
      Object.freeze({
        heading: "Blocca",
        body: "Il blocco interrompe il contatto in entrambe le direzioni.",
      }),
      Object.freeze({
        heading: "Termina Connection",
        body: "Andarsene funziona sempre, ed è definitivo per quella coppia.",
      }),
    ]),

    ctaHeading: "Disponibile ora su App Store e Google Play",
    ctaBody:
      "Scarica ULMOX oggi da App Store o Google Play e inizia a condividere veri momenti video.",
    copyright: "© 2026 ULMOX",
  }),

  pt: Object.freeze({
    heroBadge: "Momentos reais. Pessoas reais.",
    lead: "Partilhe um momento.",
    accent: "Descubra um mundo.",
    subtitle:
      "Partilhe um momento real e receba momentos reais de pessoas que vivem num sítio completamente diferente.",
    metaDescription:
      "O ULMOX é onde os momentos reais encontram pessoas reais. Partilhe um momento, explore o World Live, descubra o Global e deixe os encontros genuínos tornarem-se Connections.",
    appStoreAria: "Transferir o ULMOX na App Store",
    playStoreAria: "Obter o ULMOX no Google Play",

    howHeading: "Como funciona o ULMOX",
    howBody: "Três passos simples. Nada para aperfeiçoar, nada para encenar.",
    howSteps: Object.freeze([
      Object.freeze({
        heading: "Partilhe um momento",
        body: "Grave algo real do seu dia e envie-o para o mundo.",
      }),
      Object.freeze({
        heading: "Receba um momento",
        body: "Chega o momento de outra pessoa: uma rua, uma vista, uma tarde comum.",
      }),
      Object.freeze({
        heading: "Continue a explorar",
        body: "Abra o World Live e o Global para ver onde mais está o mundo neste momento.",
      }),
    ]),

    worldHeading: "World Live",
    worldBody:
      "Explore momentos reais partilhados de diferentes lugares do mundo, num mundo interativo.",
    worldBody2:
      "Rode o globo, pare onde algo lhe chamar a atenção e veja o momento que veio de lá.",

    connectionsHeading: "Momentos reais podem tornar-se ligações reais.",
    connectionsBody: "Sem deslizar. Sem corrida a seguidores. Primeiro encontram-se num momento.",
    connectionsSteps: Object.freeze([
      Object.freeze({
        heading: "Partilhe momentos reais",
        body: "Começa com algo que viveu mesmo, não com um perfil.",
      }),
      Object.freeze({
        heading: "Conheça pessoas naturalmente",
        body: "Cruza-se com outras pessoas através dos momentos que trocam.",
      }),
      Object.freeze({
        heading: "Uma Connection torna-se possível",
        body: "Encontros genuínos podem tornar possível uma Connection entre duas pessoas.",
      }),
      Object.freeze({
        heading: "Envie um pedido",
        body: "Quando é possível, qualquer uma das pessoas pode pedir uma Connection.",
      }),
      Object.freeze({
        heading: "Ambas aprovam",
        body: "Nada abre enquanto não disserem ambos que sim, cada um por si.",
      }),
      Object.freeze({
        heading: "Comecem a falar",
        body: "Uma Connection ativa significa mensagens de texto e o perfil da outra pessoa.",
      }),
    ]),
    connectionsSafety:
      "Mantém o controlo do princípio ao fim. Denunciar, Bloquear e Terminar Connection estão sempre à mão.",

    globalBody:
      "Descubra momentos reais que as pessoas escolhem partilhar com toda a comunidade ULMOX.",
    globalBody2: "Um único lugar para ver o que a comunidade está a partilhar abertamente, agora.",

    differentHeading: "Porque é que o ULMOX é diferente",
    differences: Object.freeze([
      Object.freeze({
        heading: "Momentos reais, não perfis polidos",
        body: "Partilha um momento que viveu, não uma imagem de quem gostaria de ser.",
      }),
      Object.freeze({
        heading: "Pessoas para além do seu círculo",
        body: "O ULMOX traz-lhe pessoas que nunca iria conhecer através de quem já conhece.",
      }),
      Object.freeze({
        heading: "Sem corrida a seguidores",
        body: "Não há um número a perseguir nem uma audiência a construir.",
      }),
      Object.freeze({
        heading: "As ligações nascem de encontros",
        body: "Uma conversa começa porque aconteceu algo real primeiro.",
      }),
      Object.freeze({
        heading: "O mundo através de quem o vive",
        body: "Cada momento vem de alguém que está mesmo ali.",
      }),
    ]),

    safetyHeading: "Segurança e controlo",
    safetyBody:
      "As mensagens nunca estão abertas a desconhecidos. Uma conversa só pode começar depois dos encontros que o ULMOX exige e da aprovação das duas pessoas, e pode terminá-la quando quiser.",
    safetyControls: Object.freeze([
      Object.freeze({
        heading: "Denunciar",
        body: "Denuncie uma pessoa ou uma mensagem específica. É uma pessoa que a analisa.",
      }),
      Object.freeze({
        heading: "Bloquear",
        body: "Bloquear para o contacto nos dois sentidos.",
      }),
      Object.freeze({
        heading: "Terminar Connection",
        body: "Sair resulta sempre, e é definitivo para esse par.",
      }),
    ]),

    ctaHeading: "Disponível agora na App Store e no Google Play",
    ctaBody:
      "Transfira ULMOX hoje na App Store ou no Google Play e comece a partilhar momentos reais em vídeo.",
    copyright: "© 2026 ULMOX",
  }),

  nl: Object.freeze({
    heroBadge: "Echte momenten. Echte mensen.",
    lead: "Deel een moment.",
    accent: "Ontdek een wereld.",
    subtitle:
      "Deel één echt moment en ontvang echte momenten van mensen die ergens heel anders wonen.",
    metaDescription:
      "Bij ULMOX ontmoeten echte momenten echte mensen. Deel een moment, verken World Live, ontdek Global en laat echte ontmoetingen uitgroeien tot Connections.",
    appStoreAria: "Download ULMOX in de App Store",
    playStoreAria: "Download ULMOX op Google Play",

    howHeading: "Zo werkt ULMOX",
    howBody: "Drie eenvoudige stappen. Niets te perfectioneren, niets te spelen.",
    howSteps: Object.freeze([
      Object.freeze({
        heading: "Deel een moment",
        body: "Neem iets echts uit je dag op en stuur het de wereld in.",
      }),
      Object.freeze({
        heading: "Ontvang een moment",
        body: "Het moment van iemand anders komt binnen: een straat, een uitzicht, een gewone middag.",
      }),
      Object.freeze({
        heading: "Blijf ontdekken",
        body: "Open World Live en Global om te zien waar de wereld nu nog meer is.",
      }),
    ]),

    worldHeading: "World Live",
    worldBody:
      "Verken echte momenten die vanuit verschillende plekken ter wereld worden gedeeld, op één interactieve wereld.",
    worldBody2:
      "Draai aan de wereldbol, stop waar je blik blijft hangen en bekijk het moment dat daarvandaan kwam.",

    connectionsHeading: "Echte momenten kunnen echte connecties worden.",
    connectionsBody: "Geen swipen. Geen volgersrace. Je ontmoet elkaar eerst in een moment.",
    connectionsSteps: Object.freeze([
      Object.freeze({
        heading: "Deel echte momenten",
        body: "Het begint met iets dat je echt hebt meegemaakt, niet met een profiel.",
      }),
      Object.freeze({
        heading: "Ontmoet mensen op een natuurlijke manier",
        body: "Je komt anderen tegen via de momenten die jullie uitwisselen.",
      }),
      Object.freeze({
        heading: "Een Connection wordt mogelijk",
        body: "Echte ontmoetingen kunnen een Connection tussen twee mensen mogelijk maken.",
      }),
      Object.freeze({
        heading: "Stuur een verzoek",
        body: "Wanneer het mogelijk is, kan ieder van beiden om een Connection vragen.",
      }),
      Object.freeze({
        heading: "Allebei akkoord",
        body: "Er gaat niets open tot jullie allebei ja hebben gezegd, ieder apart.",
      }),
      Object.freeze({
        heading: "Begin te praten",
        body: "Een actieve Connection betekent tekstberichten en elkaars profiel.",
      }),
    ]),
    connectionsSafety:
      "Je houdt de hele weg de controle. Melden, Blokkeren en Connection beëindigen zijn altijd binnen handbereik.",

    globalBody:
      "Ontdek echte momenten die mensen met de hele ULMOX-community willen delen.",
    globalBody2: "Eén plek om te zien wat de community nu open deelt.",

    differentHeading: "Waarom ULMOX anders is",
    differences: Object.freeze([
      Object.freeze({
        heading: "Echte momenten, geen gepolijste profielen",
        body: "Je deelt een moment dat je hebt beleefd, geen plaatje van wie je zou willen zijn.",
      }),
      Object.freeze({
        heading: "Mensen buiten je eigen kring",
        body: "ULMOX brengt je mensen die je via je eigen kennissen nooit zou tegenkomen.",
      }),
      Object.freeze({
        heading: "Geen volgersrace",
        body: "Er is geen getal om achterna te jagen en geen publiek om op te bouwen.",
      }),
      Object.freeze({
        heading: "Connecties groeien uit ontmoetingen",
        body: "Een gesprek begint omdat er eerst iets echts gebeurde.",
      }),
      Object.freeze({
        heading: "De wereld door de mensen erin",
        body: "Elk moment komt van iemand die er echt staat.",
      }),
    ]),

    safetyHeading: "Veiligheid en controle",
    safetyBody:
      "Berichten staan nooit open voor vreemden. Een gesprek kan pas beginnen na de ontmoetingen die ULMOX daarvoor vraagt en goedkeuring van allebei, en je kunt het op elk moment beëindigen.",
    safetyControls: Object.freeze([
      Object.freeze({
        heading: "Melden",
        body: "Meld een persoon of één bericht. Een mens beoordeelt het.",
      }),
      Object.freeze({
        heading: "Blokkeren",
        body: "Blokkeren stopt contact in beide richtingen.",
      }),
      Object.freeze({
        heading: "Connection beëindigen",
        body: "Weggaan werkt altijd, en het is definitief voor dat tweetal.",
      }),
    ]),

    ctaHeading: "Nu beschikbaar in de App Store en op Google Play",
    ctaBody:
      "Download ULMOX vandaag in de App Store of op Google Play en begin met het delen van echte videomomenten.",
    copyright: "© 2026 ULMOX",
  }),

  pl: Object.freeze({
    heroBadge: "Prawdziwe chwile. Prawdziwi ludzie.",
    lead: "Podziel się chwilą.",
    accent: "Odkryj świat.",
    subtitle:
      "Podziel się jedną prawdziwą chwilą i odbieraj prawdziwe chwile od ludzi żyjących zupełnie gdzie indziej.",
    metaDescription:
      "ULMOX to miejsce, w którym prawdziwe chwile spotykają prawdziwych ludzi. Podziel się chwilą, poznaj World Live, odkryj Global i pozwól, by szczere spotkania stały się Connections.",
    appStoreAria: "Pobierz ULMOX z App Store",
    playStoreAria: "Pobierz ULMOX z Google Play",

    howHeading: "Jak działa ULMOX",
    howBody: "Trzy proste kroki. Nic do dopieszczania, nic do odegrania.",
    howSteps: Object.freeze([
      Object.freeze({
        heading: "Podziel się chwilą",
        body: "Nagraj coś prawdziwego ze swojego dnia i wyślij to w świat.",
      }),
      Object.freeze({
        heading: "Odbierz chwilę",
        body: "Przychodzi czyjaś chwila: ulica, widok, zwyczajne popołudnie.",
      }),
      Object.freeze({
        heading: "Odkrywaj dalej",
        body: "Otwórz World Live i Global, by zobaczyć, gdzie jeszcze jest teraz świat.",
      }),
    ]),

    worldHeading: "World Live",
    worldBody:
      "Odkrywaj prawdziwe chwile udostępniane z różnych miejsc na świecie, na jednym interaktywnym globie.",
    worldBody2:
      "Obróć glob, zatrzymaj się tam, gdzie coś przyciągnie twój wzrok, i obejrzyj chwilę, która stamtąd przyszła.",

    connectionsHeading: "Prawdziwe chwile mogą stać się prawdziwymi więziami.",
    connectionsBody: "Bez przesuwania. Bez wyścigu po obserwujących. Najpierw spotykacie się w chwili.",
    connectionsSteps: Object.freeze([
      Object.freeze({
        heading: "Dziel się prawdziwymi chwilami",
        body: "Zaczyna się od czegoś, co naprawdę przeżyłeś, a nie od profilu.",
      }),
      Object.freeze({
        heading: "Poznawaj ludzi naturalnie",
        body: "Spotykasz innych poprzez chwile, którymi się wymieniacie.",
      }),
      Object.freeze({
        heading: "Connection staje się możliwa",
        body: "Szczere spotkania mogą sprawić, że Connection między dwiema osobami stanie się możliwa.",
      }),
      Object.freeze({
        heading: "Wyślij prośbę",
        body: "Kiedy jest to możliwe, każda z dwóch osób może poprosić o Connection.",
      }),
      Object.freeze({
        heading: "Obie osoby akceptują",
        body: "Nic się nie otwiera, dopóki oboje nie powiecie tak, każdy osobno.",
      }),
      Object.freeze({
        heading: "Zacznijcie rozmawiać",
        body: "Aktywna Connection oznacza wiadomości tekstowe i profil drugiej osoby.",
      }),
    ]),
    connectionsSafety:
      "Przez cały czas zachowujesz kontrolę. Zgłoś, Zablokuj i Zakończ Connection są zawsze pod ręką.",

    globalBody:
      "Odkrywaj prawdziwe chwile, którymi ludzie chcą dzielić się z całą społecznością ULMOX.",
    globalBody2: "Jedno miejsce, by zobaczyć, czym społeczność dzieli się otwarcie właśnie teraz.",

    differentHeading: "Dlaczego ULMOX jest inny",
    differences: Object.freeze([
      Object.freeze({
        heading: "Prawdziwe chwile, nie dopieszczone profile",
        body: "Dzielisz się chwilą, którą przeżyłeś, a nie obrazem tego, kim chciałbyś być.",
      }),
      Object.freeze({
        heading: "Ludzie spoza twojego kręgu",
        body: "ULMOX przybliża ci ludzi, których nigdy nie poznałbyś przez swoich znajomych.",
      }),
      Object.freeze({
        heading: "Bez wyścigu po obserwujących",
        body: "Nie ma liczby, którą trzeba gonić, ani publiczności, którą trzeba budować.",
      }),
      Object.freeze({
        heading: "Więzi rosną ze spotkań",
        body: "Rozmowa zaczyna się dlatego, że najpierw wydarzyło się coś prawdziwego.",
      }),
      Object.freeze({
        heading: "Świat oczami tych, którzy w nim żyją",
        body: "Każda chwila pochodzi od kogoś, kto naprawdę tam stoi.",
      }),
    ]),

    safetyHeading: "Bezpieczeństwo i kontrola",
    safetyBody:
      "Wiadomości nigdy nie są otwarte dla obcych. Rozmowa może się zacząć dopiero po wymaganych w ULMOX spotkaniach i akceptacji obu osób, a ty możesz ją zakończyć w dowolnej chwili.",
    safetyControls: Object.freeze([
      Object.freeze({
        heading: "Zgłoś",
        body: "Zgłoś osobę lub pojedynczą wiadomość. Sprawdza to człowiek.",
      }),
      Object.freeze({
        heading: "Zablokuj",
        body: "Blokada zatrzymuje kontakt w obie strony.",
      }),
      Object.freeze({
        heading: "Zakończ Connection",
        body: "Odejście zawsze działa i dla tej pary jest ostateczne.",
      }),
    ]),

    ctaHeading: "Dostępne teraz w App Store i Google Play",
    ctaBody:
      "Pobierz ULMOX już dziś z App Store lub Google Play i zacznij dzielić się prawdziwymi chwilami wideo.",
    copyright: "© 2026 ULMOX",
  }),

  fi: Object.freeze({
    heroBadge: "Aitoja hetkiä. Oikeita ihmisiä.",
    lead: "Jaa hetki.",
    accent: "Löydä maailma.",
    subtitle:
      "Jaa yksi aito hetki ja saa aitoja hetkiä ihmisiltä, jotka elävät aivan toisaalla.",
    metaDescription:
      "ULMOX on paikka, jossa aidot hetket kohtaavat oikeita ihmisiä. Jaa hetki, tutki World Livea, löydä Global ja anna aitojen kohtaamisten kasvaa Connections-yhteyksiksi.",
    appStoreAria: "Lataa ULMOX App Storesta",
    playStoreAria: "Hanki ULMOX Google Playsta",

    howHeading: "Näin ULMOX toimii",
    howBody: "Kolme yksinkertaista askelta. Ei mitään hiottavaa, ei mitään esitettävää.",
    howSteps: Object.freeze([
      Object.freeze({
        heading: "Jaa hetki",
        body: "Tallenna päivästäsi jotain aitoa ja lähetä se maailmalle.",
      }),
      Object.freeze({
        heading: "Vastaanota hetki",
        body: "Jonkun toisen hetki saapuu: katu, maisema, tavallinen iltapäivä.",
      }),
      Object.freeze({
        heading: "Jatka tutkimista",
        body: "Avaa World Live ja Global ja katso, missä maailma juuri nyt on.",
      }),
    ]),

    worldHeading: "World Live",
    worldBody:
      "Tutki aitoja hetkiä, joita jaetaan eri puolilta maailmaa, yhdellä vuorovaikutteisella maailmalla.",
    worldBody2:
      "Käännä maapalloa, pysähdy kohtaan joka kiinnittää huomiosi ja katso sieltä tullut hetki.",

    connectionsHeading: "Aidoista hetkistä voi kasvaa aitoja yhteyksiä.",
    connectionsBody: "Ei pyyhkäisyjä. Ei seuraajakilpaa. Kohtaatte ensin hetken kautta.",
    connectionsSteps: Object.freeze([
      Object.freeze({
        heading: "Jaa aitoja hetkiä",
        body: "Kaikki alkaa jostain, jonka olet oikeasti kokenut, ei profiilista.",
      }),
      Object.freeze({
        heading: "Kohtaa ihmisiä luontevasti",
        body: "Törmäät toisiin niiden hetkien kautta, joita vaihdatte.",
      }),
      Object.freeze({
        heading: "Connection tulee mahdolliseksi",
        body: "Aidot kohtaamiset voivat tehdä Connectionista mahdollisen kahden ihmisen välille.",
      }),
      Object.freeze({
        heading: "Lähetä pyyntö",
        body: "Kun se on mahdollista, kumpi tahansa voi pyytää Connectionia.",
      }),
      Object.freeze({
        heading: "Molemmat hyväksyvät",
        body: "Mikään ei aukea ennen kuin olette kumpikin erikseen sanoneet kyllä.",
      }),
      Object.freeze({
        heading: "Aloittakaa juttelu",
        body: "Aktiivinen Connection tarkoittaa tekstiviestejä ja toisen profiilia.",
      }),
    ]),
    connectionsSafety:
      "Hallinta pysyy sinulla koko ajan. Ilmoita, Estä ja Päätä Connection ovat aina käsillä.",

    globalBody:
      "Löydä aitoja hetkiä, joita ihmiset haluavat jakaa koko ULMOX-yhteisölle.",
    globalBody2: "Yksi paikka nähdä, mitä yhteisö jakaa avoimesti juuri nyt.",

    differentHeading: "Miksi ULMOX on erilainen",
    differences: Object.freeze([
      Object.freeze({
        heading: "Aitoja hetkiä, ei hiottuja profiileja",
        body: "Jaat hetken jonka elit, et kuvaa siitä kuka haluaisit olla.",
      }),
      Object.freeze({
        heading: "Ihmisiä oman piirisi ulkopuolelta",
        body: "ULMOX tuo eteesi ihmisiä, joita et olisi tuttujesi kautta koskaan tavannut.",
      }),
      Object.freeze({
        heading: "Ei seuraajakilpaa",
        body: "Ei ole lukua jota jahdata eikä yleisöä jota rakentaa.",
      }),
      Object.freeze({
        heading: "Yhteydet kasvavat kohtaamisista",
        body: "Keskustelu alkaa siksi, että ensin tapahtui jotain aitoa.",
      }),
      Object.freeze({
        heading: "Maailma siellä elävien kautta",
        body: "Jokainen hetki tulee joltakulta, joka todella seisoo siellä.",
      }),
    ]),

    safetyHeading: "Turvallisuus ja hallinta",
    safetyBody:
      "Viestittely ei ole koskaan avoinna tuntemattomille. Keskustelu voi alkaa vasta ULMOXin edellyttämien kohtaamisten ja molempien hyväksynnän jälkeen, ja voit päättää sen milloin tahansa.",
    safetyControls: Object.freeze([
      Object.freeze({
        heading: "Ilmoita",
        body: "Ilmoita käyttäjästä tai yksittäisestä viestistä. Sen käsittelee ihminen.",
      }),
      Object.freeze({
        heading: "Estä",
        body: "Esto pysäyttää yhteydenpidon molempiin suuntiin.",
      }),
      Object.freeze({
        heading: "Päätä Connection",
        body: "Lähteminen onnistuu aina, ja se on tälle parille lopullista.",
      }),
    ]),

    ctaHeading: "Saatavilla nyt App Storessa ja Google Playssa",
    ctaBody:
      "Lataa ULMOX tänään App Storesta tai Google Playsta ja aloita aitojen videohetkien jakaminen.",
    copyright: "© 2026 ULMOX",
  }),

  ru: Object.freeze({
    heroBadge: "Настоящие моменты. Настоящие люди.",
    lead: "Поделитесь моментом.",
    accent: "Откройте целый мир.",
    subtitle:
      "Поделитесь одним настоящим моментом и получайте настоящие моменты от людей, которые живут совсем в другом месте.",
    metaDescription:
      "ULMOX — место, где настоящие моменты встречают настоящих людей. Поделитесь моментом, исследуйте World Live, откройте Global и позвольте искренним встречам вырасти в Connections.",
    appStoreAria: "Скачать ULMOX в App Store",
    playStoreAria: "Установить ULMOX в Google Play",

    howHeading: "Как работает ULMOX",
    howBody: "Три простых шага. Ничего не нужно отполировать и ничего не нужно играть.",
    howSteps: Object.freeze([
      Object.freeze({
        heading: "Поделитесь моментом",
        body: "Снимите что-то настоящее из своего дня и отправьте это миру.",
      }),
      Object.freeze({
        heading: "Получите момент",
        body: "Приходит чей-то момент: улица, вид из окна, обычный день.",
      }),
      Object.freeze({
        heading: "Продолжайте исследовать",
        body: "Откройте World Live и Global и посмотрите, где ещё сейчас живёт мир.",
      }),
    ]),

    worldHeading: "World Live",
    worldBody:
      "Исследуйте настоящие моменты из разных уголков планеты на одном интерактивном глобусе.",
    worldBody2:
      "Поверните глобус, остановитесь там, где зацепился взгляд, и посмотрите момент, пришедший оттуда.",

    connectionsHeading: "Настоящие моменты могут стать настоящими связями.",
    connectionsBody: "Никаких свайпов. Никакой гонки за подписчиками. Сначала вы встречаетесь в моменте.",
    connectionsSteps: Object.freeze([
      Object.freeze({
        heading: "Делитесь настоящими моментами",
        body: "Всё начинается с того, что вы действительно прожили, а не с анкеты.",
      }),
      Object.freeze({
        heading: "Знакомьтесь естественно",
        body: "Вы встречаете других людей через моменты, которыми обмениваетесь.",
      }),
      Object.freeze({
        heading: "Connection становится возможной",
        body: "Искренние встречи могут сделать Connection между двумя людьми возможной.",
      }),
      Object.freeze({
        heading: "Отправьте запрос",
        body: "Когда это возможно, любой из двоих может попросить о Connection.",
      }),
      Object.freeze({
        heading: "Оба подтверждают",
        body: "Ничего не откроется, пока вы оба не согласитесь, каждый сам за себя.",
      }),
      Object.freeze({
        heading: "Начните разговор",
        body: "Активная Connection — это текстовые сообщения и профиль друг друга.",
      }),
    ]),
    connectionsSafety:
      "Контроль остаётся у вас на каждом шаге. «Пожаловаться», «Заблокировать» и «Завершить Connection» всегда под рукой.",

    globalBody:
      "Открывайте настоящие моменты, которыми люди решили поделиться со всем сообществом ULMOX.",
    globalBody2: "Одно место, где видно, чем сообщество открыто делится прямо сейчас.",

    differentHeading: "Чем ULMOX отличается",
    differences: Object.freeze([
      Object.freeze({
        heading: "Настоящие моменты, а не отполированные анкеты",
        body: "Вы делитесь прожитым моментом, а не картинкой того, кем хотели бы казаться.",
      }),
      Object.freeze({
        heading: "Люди за пределами вашего круга",
        body: "ULMOX приводит к вам людей, которых вы никогда не встретили бы через знакомых.",
      }),
      Object.freeze({
        heading: "Никакой гонки за подписчиками",
        body: "Здесь нет цифры, за которой нужно гнаться, и нет аудитории, которую нужно строить.",
      }),
      Object.freeze({
        heading: "Связи вырастают из встреч",
        body: "Разговор начинается потому, что сначала произошло что-то настоящее.",
      }),
      Object.freeze({
        heading: "Мир глазами тех, кто в нём живёт",
        body: "Каждый момент приходит от того, кто действительно там находится.",
      }),
    ]),

    safetyHeading: "Безопасность и контроль",
    safetyBody:
      "Переписка никогда не открыта для незнакомцев. Разговор может начаться только после необходимых встреч в ULMOX и согласия обоих людей, и вы можете завершить его в любой момент.",
    safetyControls: Object.freeze([
      Object.freeze({
        heading: "Пожаловаться",
        body: "Пожалуйтесь на человека или на отдельное сообщение. Его рассматривает человек.",
      }),
      Object.freeze({
        heading: "Заблокировать",
        body: "Блокировка останавливает общение в обе стороны.",
      }),
      Object.freeze({
        heading: "Завершить Connection",
        body: "Уйти можно всегда, и для этой пары это окончательно.",
      }),
    ]),

    ctaHeading: "Теперь доступно в App Store и Google Play",
    ctaBody:
      "Скачайте ULMOX сегодня в App Store или Google Play и начните делиться настоящими видеомоментами.",
    copyright: "© 2026 ULMOX",
  }),

  ja: Object.freeze({
    heroBadge: "リアルな瞬間を、リアルな人と。",
    lead: "瞬間を共有しよう。",
    accent: "世界を見つけよう。",
    subtitle:
      "リアルな瞬間をひとつ共有すると、まったく別の場所で暮らす人たちのリアルな瞬間が届きます。",
    metaDescription:
      "ULMOXは、リアルな瞬間とリアルな人が出会う場所です。瞬間を共有し、World Liveをめぐり、Globalを見つけ、本物の出会いをConnectionsへ育てましょう。",
    appStoreAria: "App StoreでULMOXをダウンロード",
    playStoreAria: "Google PlayでULMOXを入手",

    howHeading: "ULMOXの使い方",
    howBody: "3つのシンプルなステップ。作り込む必要も、演じる必要もありません。",
    howSteps: Object.freeze([
      Object.freeze({
        heading: "瞬間を共有する",
        body: "その日のリアルな出来事を撮って、世界へ送り出します。",
      }),
      Object.freeze({
        heading: "瞬間を受け取る",
        body: "誰かの瞬間が届きます。通りの風景、窓からの眺め、なんでもない午後。",
      }),
      Object.freeze({
        heading: "さらに見てまわる",
        body: "World LiveとGlobalを開いて、いま世界がどこにあるのかを確かめましょう。",
      }),
    ]),

    worldHeading: "World Live",
    worldBody:
      "世界のさまざまな場所から共有されたリアルな瞬間を、ひとつのインタラクティブな世界の上でめぐれます。",
    worldBody2:
      "地球を回し、気になった場所で止めて、そこから届いた瞬間を見てみましょう。",

    connectionsHeading: "リアルな瞬間は、リアルなつながりになれる。",
    connectionsBody: "スワイプなし。フォロワー競争なし。まず瞬間で出会います。",
    connectionsSteps: Object.freeze([
      Object.freeze({
        heading: "リアルな瞬間を共有する",
        body: "始まりはプロフィールではなく、実際に過ごした出来事です。",
      }),
      Object.freeze({
        heading: "自然に人と出会う",
        body: "やり取りした瞬間を通じて、ほかの人と出会います。",
      }),
      Object.freeze({
        heading: "Connectionが可能になる",
        body: "本物の出会いは、ふたりの間でConnectionを可能にすることがあります。",
      }),
      Object.freeze({
        heading: "リクエストを送る",
        body: "可能になったら、どちらからでもConnectionを申し込めます。",
      }),
      Object.freeze({
        heading: "ふたりとも承認する",
        body: "おたがいがそれぞれ承認するまで、何も開きません。",
      }),
      Object.freeze({
        heading: "会話を始める",
        body: "有効なConnectionでは、テキストメッセージのやり取りと相手のプロフィール閲覧ができます。",
      }),
    ]),
    connectionsSafety:
      "最後まで主導権はあなたにあります。報告、ブロック、Connectionの終了はいつでも使えます。",

    globalBody:
      "人々がULMOXコミュニティ全体に向けて共有することを選んだ、リアルな瞬間を見つけられます。",
    globalBody2: "コミュニティがいま何をオープンに共有しているかが、ひと目でわかる場所です。",

    differentHeading: "ULMOXが違う理由",
    differences: Object.freeze([
      Object.freeze({
        heading: "整えたプロフィールではなく、リアルな瞬間",
        body: "共有するのは、なりたい自分の姿ではなく、実際に過ごした瞬間です。",
      }),
      Object.freeze({
        heading: "身のまわりの外にいる人たち",
        body: "ULMOXは、知り合い経由では出会えなかった人たちを連れてきます。",
      }),
      Object.freeze({
        heading: "フォロワー競争がない",
        body: "追いかける数字も、築くべき観客もありません。",
      }),
      Object.freeze({
        heading: "つながりは出会いから育つ",
        body: "会話が始まるのは、先にリアルな出来事があったからです。",
      }),
      Object.freeze({
        heading: "そこに生きる人を通して見る世界",
        body: "どの瞬間も、実際にその場にいる誰かから届きます。",
      }),
    ]),

    safetyHeading: "安全とコントロール",
    safetyBody:
      "メッセージが見知らぬ相手に開かれることはありません。会話が始まるのは、ULMOXが求める出会いとふたりの承認がそろってからで、いつでも終了できます。",
    safetyControls: Object.freeze([
      Object.freeze({
        heading: "報告する",
        body: "ユーザーまたは個別のメッセージを報告できます。確認するのは人です。",
      }),
      Object.freeze({
        heading: "ブロックする",
        body: "ブロックすると、双方向のやり取りが止まります。",
      }),
      Object.freeze({
        heading: "Connectionを終了する",
        body: "離れることはいつでもでき、そのペアについては元に戻りません。",
      }),
    ]),

    ctaHeading: "App StoreとGoogle Playで配信中",
    ctaBody:
      "ULMOXをApp StoreまたはGoogle Playからダウンロードして、リアルな動画の瞬間を共有しましょう。",
    copyright: "© 2026 ULMOX",
  }),

  ko: Object.freeze({
    heroBadge: "진짜 순간, 진짜 사람.",
    lead: "순간을 공유하세요.",
    accent: "세계를 발견하세요.",
    subtitle:
      "진짜 순간 하나를 공유하면, 전혀 다른 곳에 사는 사람들의 진짜 순간이 도착합니다.",
    metaDescription:
      "ULMOX는 진짜 순간이 진짜 사람을 만나는 곳입니다. 순간을 공유하고, World Live를 둘러보고, Global을 발견하고, 진심 어린 만남이 Connections로 자라게 하세요.",
    appStoreAria: "App Store에서 ULMOX 다운로드",
    playStoreAria: "Google Play에서 ULMOX 받기",

    howHeading: "ULMOX 이용 방법",
    howBody: "간단한 세 단계. 다듬을 것도, 연기할 것도 없습니다.",
    howSteps: Object.freeze([
      Object.freeze({
        heading: "순간을 공유하기",
        body: "하루 중 진짜인 장면을 찍어 세상으로 보내 보세요.",
      }),
      Object.freeze({
        heading: "순간을 받기",
        body: "다른 사람의 순간이 도착합니다. 어떤 거리, 어떤 풍경, 평범한 오후.",
      }),
      Object.freeze({
        heading: "계속 둘러보기",
        body: "World Live와 Global을 열어 지금 세계가 어디에 있는지 확인해 보세요.",
      }),
    ]),

    worldHeading: "World Live",
    worldBody:
      "세계 곳곳에서 공유된 진짜 순간을 하나의 인터랙티브한 세계 위에서 둘러볼 수 있습니다.",
    worldBody2:
      "지구본을 돌리고 눈길이 머문 곳에서 멈춰, 그곳에서 온 순간을 감상해 보세요.",

    connectionsHeading: "진짜 순간은 진짜 인연이 될 수 있습니다.",
    connectionsBody: "스와이프 없음. 팔로워 경쟁 없음. 먼저 순간으로 만납니다.",
    connectionsSteps: Object.freeze([
      Object.freeze({
        heading: "진짜 순간을 공유하기",
        body: "프로필이 아니라, 실제로 겪은 일에서 시작됩니다.",
      }),
      Object.freeze({
        heading: "자연스럽게 사람을 만나기",
        body: "주고받은 순간을 통해 다른 사람을 마주치게 됩니다.",
      }),
      Object.freeze({
        heading: "Connection이 가능해짐",
        body: "진심 어린 만남은 두 사람 사이에 Connection을 가능하게 만들 수 있습니다.",
      }),
      Object.freeze({
        heading: "요청 보내기",
        body: "가능해지면 둘 중 누구든 Connection을 요청할 수 있습니다.",
      }),
      Object.freeze({
        heading: "두 사람 모두 승인",
        body: "두 사람이 각자 동의하기 전까지는 아무것도 열리지 않습니다.",
      }),
      Object.freeze({
        heading: "대화 시작",
        body: "활성화된 Connection에서는 텍스트 메시지를 주고받고 서로의 프로필을 볼 수 있습니다.",
      }),
    ]),
    connectionsSafety:
      "끝까지 주도권은 당신에게 있습니다. 신고, 차단, Connection 종료는 언제든 사용할 수 있습니다.",

    globalBody:
      "사람들이 ULMOX 커뮤니티 전체와 나누기로 선택한 진짜 순간을 발견해 보세요.",
    globalBody2: "커뮤니티가 지금 공개적으로 무엇을 나누고 있는지 한곳에서 볼 수 있습니다.",

    differentHeading: "ULMOX가 다른 이유",
    differences: Object.freeze([
      Object.freeze({
        heading: "다듬은 프로필이 아닌 진짜 순간",
        body: "되고 싶은 모습이 아니라, 실제로 겪은 순간을 공유합니다.",
      }),
      Object.freeze({
        heading: "내 울타리 밖의 사람들",
        body: "ULMOX는 아는 사람을 통해서는 결코 만나지 못했을 사람들을 데려옵니다.",
      }),
      Object.freeze({
        heading: "팔로워 경쟁이 없음",
        body: "쫓아야 할 숫자도, 쌓아야 할 관객도 없습니다.",
      }),
      Object.freeze({
        heading: "인연은 만남에서 자랍니다",
        body: "대화는 먼저 진짜 일이 있었기 때문에 시작됩니다.",
      }),
      Object.freeze({
        heading: "그곳에 사는 사람을 통해 보는 세계",
        body: "모든 순간은 실제로 그 자리에 있는 누군가에게서 옵니다.",
      }),
    ]),

    safetyHeading: "안전과 통제",
    safetyBody:
      "메시지는 결코 낯선 사람에게 열려 있지 않습니다. 대화는 ULMOX가 요구하는 만남과 두 사람의 승인이 있어야 시작될 수 있고, 언제든 끝낼 수 있습니다.",
    safetyControls: Object.freeze([
      Object.freeze({
        heading: "신고",
        body: "사용자나 개별 메시지를 신고하세요. 사람이 검토합니다.",
      }),
      Object.freeze({
        heading: "차단",
        body: "차단하면 양방향으로 연락이 멈춥니다.",
      }),
      Object.freeze({
        heading: "Connection 종료",
        body: "떠나는 것은 언제나 가능하며, 그 두 사람에게는 되돌릴 수 없습니다.",
      }),
    ]),

    ctaHeading: "App Store와 Google Play에서 지금 이용 가능",
    ctaBody:
      "오늘 App Store 또는 Google Play에서 ULMOX를 다운로드하고 진짜 영상 순간을 공유해 보세요.",
    copyright: "© 2026 ULMOX",
  }),

  zh: Object.freeze({
    heroBadge: "真实瞬间，真实的人。",
    lead: "分享一个瞬间。",
    accent: "发现一个世界。",
    subtitle:
      "分享一个真实瞬间，就能收到来自世界另一端的人的真实瞬间。",
    metaDescription:
      "ULMOX 是真实瞬间遇见真实的人的地方。分享瞬间，探索 World Live，发现 Global，让真诚的相遇长成 Connections。",
    appStoreAria: "在 App Store 下载 ULMOX",
    playStoreAria: "在 Google Play 获取 ULMOX",

    howHeading: "ULMOX 怎么用",
    howBody: "三个简单步骤。不用精修，也不用表演。",
    howSteps: Object.freeze([
      Object.freeze({
        heading: "分享一个瞬间",
        body: "把这一天里真实的画面拍下来，送到世界上。",
      }),
      Object.freeze({
        heading: "收到一个瞬间",
        body: "别人的瞬间随之到来：一条街、一片风景、一个平常的午后。",
      }),
      Object.freeze({
        heading: "继续探索",
        body: "打开 World Live 和 Global，看看此刻世界还在哪里。",
      }),
    ]),

    worldHeading: "World Live",
    worldBody:
      "在一个可互动的世界上，探索来自世界各地分享的真实瞬间。",
    worldBody2:
      "转动地球，停在吸引你的地方，看看从那里传来的瞬间。",

    connectionsHeading: "真实的瞬间，可以变成真实的联系。",
    connectionsBody: "没有滑动配对。没有粉丝竞赛。先在瞬间里相遇。",
    connectionsSteps: Object.freeze([
      Object.freeze({
        heading: "分享真实瞬间",
        body: "一切始于你真正经历过的事，而不是一份资料。",
      }),
      Object.freeze({
        heading: "自然地遇见人",
        body: "你会通过彼此交换的瞬间遇见其他人。",
      }),
      Object.freeze({
        heading: "Connection 成为可能",
        body: "真诚的相遇可以让两个人之间的 Connection 成为可能。",
      }),
      Object.freeze({
        heading: "发出请求",
        body: "当条件具备时，任何一方都可以请求建立 Connection。",
      }),
      Object.freeze({
        heading: "双方都同意",
        body: "在你们各自都同意之前，什么都不会开启。",
      }),
      Object.freeze({
        heading: "开始聊天",
        body: "一段有效的 Connection 意味着可以发送文字消息，并查看对方的个人资料。",
      }),
    ]),
    connectionsSafety:
      "主动权始终在你手上。举报、拉黑和结束 Connection 随时都能用。",

    globalBody:
      "发现人们选择与整个 ULMOX 社区分享的真实瞬间。",
    globalBody2: "一个地方，就能看到社区此刻公开分享的内容。",

    differentHeading: "ULMOX 有什么不同",
    differences: Object.freeze([
      Object.freeze({
        heading: "真实瞬间，而不是精修资料",
        body: "你分享的是亲身经历的瞬间，而不是你希望成为的样子。",
      }),
      Object.freeze({
        heading: "圈子以外的人",
        body: "ULMOX 带来的是你靠现有人脉永远遇不到的人。",
      }),
      Object.freeze({
        heading: "没有粉丝竞赛",
        body: "这里没有要追的数字，也没有要经营的观众。",
      }),
      Object.freeze({
        heading: "联系从相遇中生长",
        body: "对话之所以开始，是因为先发生了真实的事。",
      }),
      Object.freeze({
        heading: "透过身处其中的人看世界",
        body: "每一个瞬间都来自真正站在那里的人。",
      }),
    ]),

    safetyHeading: "安全与掌控",
    safetyBody:
      "私信从不向陌生人开放。只有在 ULMOX 所要求的相遇发生、并且双方都同意之后，对话才能开始，而你随时可以结束它。",
    safetyControls: Object.freeze([
      Object.freeze({
        heading: "举报",
        body: "举报某位用户或某一条消息，由人工进行审核。",
      }),
      Object.freeze({
        heading: "拉黑",
        body: "拉黑会双向中断联系。",
      }),
      Object.freeze({
        heading: "结束 Connection",
        body: "随时可以离开，而且对这一对来说是不可恢复的。",
      }),
    ]),

    ctaHeading: "现已登陆 App Store 和 Google Play",
    ctaBody:
      "立即从 App Store 或 Google Play 下载 ULMOX，开始分享真实的视频瞬间。",
    copyright: "© 2026 ULMOX",
  }),

  ar: Object.freeze({
    heroBadge: "لحظات حقيقية. أشخاص حقيقيون.",
    lead: "شارك لحظة.",
    accent: "اكتشف عالمًا.",
    subtitle:
      "شارك لحظة حقيقية واحدة، وستصلك لحظات حقيقية من أشخاص يعيشون في مكان آخر تمامًا.",
    metaDescription:
      "ULMOX هو المكان الذي تلتقي فيه اللحظات الحقيقية بأشخاص حقيقيين. شارك لحظة، واستكشف World Live، واكتشف Global، ودع اللقاءات الصادقة تنمو لتصبح Connections.",
    appStoreAria: "نزّل ULMOX من App Store",
    playStoreAria: "احصل على ULMOX من Google Play",

    howHeading: "كيف يعمل ULMOX",
    howBody: "ثلاث خطوات بسيطة. لا شيء تصقله، ولا دور تؤديه.",
    howSteps: Object.freeze([
      Object.freeze({
        heading: "شارك لحظة",
        body: "صوّر شيئًا حقيقيًا من يومك وأرسله إلى العالم.",
      }),
      Object.freeze({
        heading: "استقبل لحظة",
        body: "تصلك لحظة شخص آخر: شارع، أو منظر، أو بعد ظهيرة عادي.",
      }),
      Object.freeze({
        heading: "واصل الاستكشاف",
        body: "افتح World Live وGlobal لترى أين يكون العالم الآن.",
      }),
    ]),

    worldHeading: "World Live",
    worldBody:
      "استكشف لحظات حقيقية تُشارَك من أماكن مختلفة حول العالم، على عالم تفاعلي واحد.",
    worldBody2:
      "أدر الكرة الأرضية، وتوقّف عند مكان يلفت نظرك، وشاهد اللحظة التي جاءت منه.",

    connectionsHeading: "اللحظات الحقيقية يمكن أن تصبح صلات حقيقية.",
    connectionsBody: "بلا تمرير. بلا سباق متابعين. تلتقيان أولًا عبر لحظة.",
    connectionsSteps: Object.freeze([
      Object.freeze({
        heading: "شارك لحظات حقيقية",
        body: "تبدأ الحكاية بشيء عشته فعلًا، لا بملف تعريف.",
      }),
      Object.freeze({
        heading: "التقِ بالناس بشكل طبيعي",
        body: "تلتقي بآخرين من خلال اللحظات التي تتبادلونها.",
      }),
      Object.freeze({
        heading: "تصبح Connection ممكنة",
        body: "اللقاءات الصادقة قد تجعل Connection ممكنة بين شخصين.",
      }),
      Object.freeze({
        heading: "أرسل طلبًا",
        body: "حين يصبح ذلك ممكنًا، يستطيع أيٌّ من الشخصين طلب Connection.",
      }),
      Object.freeze({
        heading: "يوافق الطرفان",
        body: "لا يُفتح شيء قبل أن يوافق كلاكما، كلٌّ على حدة.",
      }),
      Object.freeze({
        heading: "ابدآ الحديث",
        body: "Connection الفعّالة تعني رسائل نصية والاطلاع على ملف الطرف الآخر.",
      }),
    ]),
    connectionsSafety:
      "تبقى السيطرة بيدك طوال الطريق. الإبلاغ والحظر وإنهاء Connection متاحة دائمًا.",

    globalBody:
      "اكتشف لحظات حقيقية يختار الناس مشاركتها مع مجتمع ULMOX الأوسع.",
    globalBody2: "مكان واحد ترى فيه ما يشاركه المجتمع علنًا في هذه اللحظة.",

    differentHeading: "لماذا يختلف ULMOX",
    differences: Object.freeze([
      Object.freeze({
        heading: "لحظات حقيقية لا ملفات مصقولة",
        body: "تشارك لحظة عشتها، لا صورةً لمن تتمنى أن تكون.",
      }),
      Object.freeze({
        heading: "أشخاص خارج دائرتك",
        body: "يقرّب إليك ULMOX أشخاصًا ما كنت لتلتقي بهم عبر من تعرفهم.",
      }),
      Object.freeze({
        heading: "بلا سباق متابعين",
        body: "لا رقم تلاحقه ولا جمهور عليك بناؤه.",
      }),
      Object.freeze({
        heading: "الصلات تنمو من اللقاءات",
        body: "يبدأ الحديث لأن شيئًا حقيقيًا وقع أولًا.",
      }),
      Object.freeze({
        heading: "العالم بعيون من يعيشون فيه",
        body: "كل لحظة تأتي من شخص يقف هناك فعلًا.",
      }),
    ]),

    safetyHeading: "الأمان والتحكم",
    safetyBody:
      "المراسلة ليست مفتوحة للغرباء أبدًا. لا يبدأ الحديث إلا بعد اللقاءات التي يشترطها ULMOX وموافقة الطرفين، ويمكنك إنهاؤه في أي وقت.",
    safetyControls: Object.freeze([
      Object.freeze({
        heading: "الإبلاغ",
        body: "أبلغ عن مستخدم أو عن رسالة بعينها. يراجعها شخص.",
      }),
      Object.freeze({
        heading: "الحظر",
        body: "الحظر يوقف التواصل في الاتجاهين.",
      }),
      Object.freeze({
        heading: "إنهاء Connection",
        body: "المغادرة متاحة دائمًا، وهي نهائية لهذا الثنائي.",
      }),
    ]),

    ctaHeading: "متوفر الآن على App Store و Google Play",
    ctaBody:
      "نزّل ULMOX اليوم من App Store أو Google Play وابدأ بمشاركة لحظات فيديو حقيقية.",
    copyright: "© 2026 ULMOX",
  }),

  hi: Object.freeze({
    heroBadge: "असली पल। असली लोग।",
    lead: "एक पल साझा करें।",
    accent: "एक दुनिया खोजें।",
    subtitle:
      "एक असली पल साझा करें और बिलकुल दूसरी जगह रहने वाले लोगों से असली पल पाएँ।",
    metaDescription:
      "ULMOX वह जगह है जहाँ असली पल असली लोगों से मिलते हैं। एक पल साझा करें, World Live देखें, Global खोजें, और सच्ची मुलाकातों को Connections में बदलने दें।",
    appStoreAria: "App Store से ULMOX डाउनलोड करें",
    playStoreAria: "Google Play से ULMOX पाएँ",

    howHeading: "ULMOX कैसे काम करता है",
    howBody: "तीन आसान कदम। न कुछ चमकाना है, न कोई किरदार निभाना है।",
    howSteps: Object.freeze([
      Object.freeze({
        heading: "एक पल साझा करें",
        body: "अपने दिन का कोई असली हिस्सा रिकॉर्ड करें और दुनिया के लिए भेज दें।",
      }),
      Object.freeze({
        heading: "एक पल पाएँ",
        body: "किसी और का पल आता है: कोई गली, कोई नज़ारा, कोई आम दोपहर।",
      }),
      Object.freeze({
        heading: "खोजते रहें",
        body: "World Live और Global खोलें और देखें कि दुनिया इस वक़्त और कहाँ है।",
      }),
    ]),

    worldHeading: "World Live",
    worldBody:
      "दुनिया की अलग-अलग जगहों से साझा किए गए असली पलों को एक इंटरैक्टिव दुनिया पर देखें।",
    worldBody2:
      "ग्लोब घुमाएँ, जहाँ नज़र ठहरे वहाँ रुकें, और वहाँ से आया पल देखें।",

    connectionsHeading: "असली पल असली रिश्तों में बदल सकते हैं।",
    connectionsBody: "कोई स्वाइप नहीं। फ़ॉलोअर की होड़ नहीं। पहले पलों के ज़रिए मिलिए।",
    connectionsSteps: Object.freeze([
      Object.freeze({
        heading: "असली पल साझा करें",
        body: "शुरुआत किसी प्रोफ़ाइल से नहीं, आपके जिए हुए किसी पल से होती है।",
      }),
      Object.freeze({
        heading: "स्वाभाविक रूप से लोगों से मिलें",
        body: "आप जो पल आपस में भेजते हैं, उन्हीं के ज़रिए दूसरों से मुलाकात होती है।",
      }),
      Object.freeze({
        heading: "Connection संभव हो जाता है",
        body: "सच्ची मुलाकातें दो लोगों के बीच Connection को संभव बना सकती हैं।",
      }),
      Object.freeze({
        heading: "अनुरोध भेजें",
        body: "जब यह संभव हो, दोनों में से कोई भी Connection का अनुरोध कर सकता है।",
      }),
      Object.freeze({
        heading: "दोनों की मंज़ूरी",
        body: "जब तक आप दोनों अलग-अलग हाँ नहीं कहते, कुछ भी नहीं खुलता।",
      }),
      Object.freeze({
        heading: "बातचीत शुरू करें",
        body: "सक्रिय Connection का मतलब है टेक्स्ट संदेश और एक-दूसरे की प्रोफ़ाइल।",
      }),
    ]),
    connectionsSafety:
      "नियंत्रण पूरे समय आपके पास रहता है। रिपोर्ट, ब्लॉक और Connection समाप्त करें हमेशा मौजूद हैं।",

    globalBody:
      "वे असली पल खोजें जिन्हें लोग पूरे ULMOX समुदाय के साथ साझा करना चुनते हैं।",
    globalBody2: "एक ही जगह, जहाँ दिखे कि समुदाय इस वक़्त खुलकर क्या साझा कर रहा है।",

    differentHeading: "ULMOX अलग क्यों है",
    differences: Object.freeze([
      Object.freeze({
        heading: "चमकाई गई प्रोफ़ाइल नहीं, असली पल",
        body: "आप वह पल साझा करते हैं जो आपने जिया, न कि उसकी तस्वीर जो आप दिखना चाहते हैं।",
      }),
      Object.freeze({
        heading: "अपने दायरे से बाहर के लोग",
        body: "ULMOX ऐसे लोगों तक ले जाता है जिनसे आप अपने जान-पहचान के ज़रिए कभी न मिलते।",
      }),
      Object.freeze({
        heading: "फ़ॉलोअर की होड़ नहीं",
        body: "यहाँ न कोई गिनती पीछा करने को है, न कोई दर्शक-वर्ग बनाने को।",
      }),
      Object.freeze({
        heading: "रिश्ते मुलाकातों से बनते हैं",
        body: "बातचीत इसलिए शुरू होती है क्योंकि पहले कुछ असली हुआ था।",
      }),
      Object.freeze({
        heading: "दुनिया, वहाँ रहने वालों की नज़र से",
        body: "हर पल किसी ऐसे व्यक्ति से आता है जो सचमुच वहाँ मौजूद है।",
      }),
    ]),

    safetyHeading: "सुरक्षा और नियंत्रण",
    safetyBody:
      "संदेश भेजना अजनबियों के लिए कभी खुला नहीं होता। बातचीत तभी शुरू हो सकती है जब ULMOX की ज़रूरी मुलाकातें हो चुकी हों और दोनों ने मंज़ूरी दी हो, और आप इसे कभी भी समाप्त कर सकते हैं।",
    safetyControls: Object.freeze([
      Object.freeze({
        heading: "रिपोर्ट करें",
        body: "किसी उपयोगकर्ता या किसी एक संदेश की रिपोर्ट करें। इसकी समीक्षा एक व्यक्ति करता है।",
      }),
      Object.freeze({
        heading: "ब्लॉक करें",
        body: "ब्लॉक करने से दोनों दिशाओं में संपर्क रुक जाता है।",
      }),
      Object.freeze({
        heading: "Connection समाप्त करें",
        body: "छोड़ना हमेशा संभव है, और उस जोड़ी के लिए यह अंतिम होता है।",
      }),
    ]),

    ctaHeading: "अब App Store और Google Play पर उपलब्ध",
    ctaBody:
      "आज ही App Store या Google Play से ULMOX डाउनलोड करें और असली वीडियो पल साझा करना शुरू करें।",
    copyright: "© 2026 ULMOX",
  }),

  th: Object.freeze({
    heroBadge: "ช่วงเวลาจริง ผู้คนจริง",
    lead: "แชร์สักช่วงเวลา",
    accent: "ค้นพบทั้งโลก",
    subtitle:
      "แชร์ช่วงเวลาจริงหนึ่งช่วง แล้วรับช่วงเวลาจริงจากผู้คนที่ใช้ชีวิตอยู่คนละมุมโลก",
    metaDescription:
      "ULMOX คือที่ที่ช่วงเวลาจริงได้พบกับผู้คนจริง แชร์ช่วงเวลา สำรวจ World Live ค้นพบ Global และปล่อยให้การพบกันจริง ๆ เติบโตเป็น Connections",
    appStoreAria: "ดาวน์โหลด ULMOX บน App Store",
    playStoreAria: "รับ ULMOX บน Google Play",

    howHeading: "ULMOX ทำงานอย่างไร",
    howBody: "สามขั้นตอนง่าย ๆ ไม่ต้องขัดเกลา ไม่ต้องแสดง",
    howSteps: Object.freeze([
      Object.freeze({
        heading: "แชร์ช่วงเวลา",
        body: "บันทึกบางอย่างที่เป็นจริงจากวันของคุณ แล้วส่งออกไปให้โลกได้เห็น",
      }),
      Object.freeze({
        heading: "รับช่วงเวลา",
        body: "ช่วงเวลาของคนอื่นจะมาถึง เป็นถนนสักสาย วิวสักมุม หรือบ่ายวันธรรมดา",
      }),
      Object.freeze({
        heading: "สำรวจต่อไป",
        body: "เปิด World Live และ Global เพื่อดูว่าตอนนี้โลกอยู่ตรงไหนอีกบ้าง",
      }),
    ]),

    worldHeading: "World Live",
    worldBody:
      "สำรวจช่วงเวลาจริงที่ถูกแชร์จากสถานที่ต่าง ๆ ทั่วโลก บนโลกใบเดียวที่โต้ตอบได้",
    worldBody2:
      "หมุนลูกโลก หยุดตรงที่สะดุดตา แล้วชมช่วงเวลาที่มาจากที่นั่น",

    connectionsHeading: "ช่วงเวลาจริงกลายเป็นความสัมพันธ์จริงได้",
    connectionsBody: "ไม่มีการปัด ไม่มีการแข่งสะสมผู้ติดตาม เจอกันผ่านช่วงเวลาก่อน",
    connectionsSteps: Object.freeze([
      Object.freeze({
        heading: "แชร์ช่วงเวลาจริง",
        body: "เริ่มจากสิ่งที่คุณได้ใช้ชีวิตจริง ไม่ใช่จากโปรไฟล์",
      }),
      Object.freeze({
        heading: "พบผู้คนอย่างเป็นธรรมชาติ",
        body: "คุณได้พบคนอื่นผ่านช่วงเวลาที่แลกเปลี่ยนกัน",
      }),
      Object.freeze({
        heading: "Connection เป็นไปได้",
        body: "การพบกันจริง ๆ อาจทำให้ Connection ระหว่างสองคนเป็นไปได้",
      }),
      Object.freeze({
        heading: "ส่งคำขอ",
        body: "เมื่อเป็นไปได้แล้ว ฝ่ายใดฝ่ายหนึ่งสามารถขอ Connection ได้",
      }),
      Object.freeze({
        heading: "ทั้งสองฝ่ายอนุมัติ",
        body: "จะยังไม่มีอะไรเปิดขึ้น จนกว่าทั้งสองฝ่ายจะตอบตกลงแยกกัน",
      }),
      Object.freeze({
        heading: "เริ่มพูดคุย",
        body: "Connection ที่ใช้งานอยู่หมายถึงข้อความตัวอักษรและการดูโปรไฟล์ของกันและกัน",
      }),
    ]),
    connectionsSafety:
      "คุณควบคุมได้ตลอดทาง รายงาน บล็อก และสิ้นสุด Connection อยู่ใกล้มือเสมอ",

    globalBody:
      "ค้นพบช่วงเวลาจริงที่ผู้คนเลือกแบ่งปันกับชุมชน ULMOX ในวงกว้าง",
    globalBody2: "ที่เดียวที่เห็นว่าชุมชนกำลังแบ่งปันอะไรอย่างเปิดเผยในตอนนี้",

    differentHeading: "ทำไม ULMOX จึงต่างออกไป",
    differences: Object.freeze([
      Object.freeze({
        heading: "ช่วงเวลาจริง ไม่ใช่โปรไฟล์ที่ขัดเกลา",
        body: "คุณแบ่งปันช่วงเวลาที่ได้ใช้ชีวิตจริง ไม่ใช่ภาพของคนที่คุณอยากเป็น",
      }),
      Object.freeze({
        heading: "ผู้คนนอกวงของคุณ",
        body: "ULMOX พาคุณไปพบคนที่คงไม่มีวันได้เจอผ่านคนที่คุณรู้จักอยู่แล้ว",
      }),
      Object.freeze({
        heading: "ไม่มีการแข่งสะสมผู้ติดตาม",
        body: "ไม่มีตัวเลขให้ไล่ตาม และไม่มีผู้ชมให้ต้องสร้าง",
      }),
      Object.freeze({
        heading: "ความสัมพันธ์เติบโตจากการพบกัน",
        body: "บทสนทนาเริ่มขึ้นเพราะมีบางอย่างที่จริงเกิดขึ้นก่อน",
      }),
      Object.freeze({
        heading: "มองโลกผ่านคนที่ใช้ชีวิตอยู่ในนั้น",
        body: "ทุกช่วงเวลามาจากใครสักคนที่ยืนอยู่ตรงนั้นจริง ๆ",
      }),
    ]),

    safetyHeading: "ความปลอดภัยและการควบคุม",
    safetyBody:
      "การส่งข้อความไม่เคยเปิดให้คนแปลกหน้า บทสนทนาจะเริ่มได้ก็ต่อเมื่อมีการพบกันตามที่ ULMOX กำหนดและทั้งสองฝ่ายอนุมัติแล้ว และคุณยุติได้ทุกเมื่อ",
    safetyControls: Object.freeze([
      Object.freeze({
        heading: "รายงาน",
        body: "รายงานผู้ใช้หรือข้อความใดข้อความหนึ่ง โดยมีคนเป็นผู้ตรวจสอบ",
      }),
      Object.freeze({
        heading: "บล็อก",
        body: "การบล็อกหยุดการติดต่อทั้งสองทาง",
      }),
      Object.freeze({
        heading: "สิ้นสุด Connection",
        body: "การออกทำได้เสมอ และถือเป็นที่สิ้นสุดสำหรับคู่นั้น",
      }),
    ]),

    ctaHeading: "พร้อมให้ดาวน์โหลดแล้วบน App Store และ Google Play",
    ctaBody:
      "ดาวน์โหลด ULMOX วันนี้จาก App Store หรือ Google Play แล้วเริ่มแชร์ช่วงเวลาวิดีโอจริง",
    copyright: "© 2026 ULMOX",
  }),

  vi: Object.freeze({
    heroBadge: "Khoảnh khắc thật. Con người thật.",
    lead: "Chia sẻ một khoảnh khắc.",
    accent: "Khám phá cả thế giới.",
    subtitle:
      "Chia sẻ một khoảnh khắc thật và nhận lại những khoảnh khắc thật từ những người đang sống ở một nơi hoàn toàn khác.",
    metaDescription:
      "ULMOX là nơi những khoảnh khắc thật gặp những con người thật. Chia sẻ một khoảnh khắc, khám phá World Live, tìm thấy Global và để những cuộc gặp chân thật lớn lên thành Connections.",
    appStoreAria: "Tải ULMOX trên App Store",
    playStoreAria: "Nhận ULMOX trên Google Play",

    howHeading: "ULMOX hoạt động thế nào",
    howBody: "Ba bước đơn giản. Không có gì để trau chuốt, không có gì để diễn.",
    howSteps: Object.freeze([
      Object.freeze({
        heading: "Chia sẻ một khoảnh khắc",
        body: "Quay lại điều gì đó thật trong ngày của bạn và gửi nó ra thế giới.",
      }),
      Object.freeze({
        heading: "Nhận một khoảnh khắc",
        body: "Khoảnh khắc của người khác tìm đến: một con phố, một khung cảnh, một buổi chiều bình thường.",
      }),
      Object.freeze({
        heading: "Tiếp tục khám phá",
        body: "Mở World Live và Global để xem thế giới lúc này còn đang ở đâu.",
      }),
    ]),

    worldHeading: "World Live",
    worldBody:
      "Khám phá những khoảnh khắc thật được chia sẻ từ nhiều nơi trên thế giới, trên một thế giới tương tác.",
    worldBody2:
      "Xoay quả địa cầu, dừng lại ở nơi khiến bạn chú ý và xem khoảnh khắc đến từ đó.",

    connectionsHeading: "Khoảnh khắc thật có thể trở thành mối liên hệ thật.",
    connectionsBody: "Không quẹt. Không đua theo lượt theo dõi. Gặp nhau qua khoảnh khắc trước đã.",
    connectionsSteps: Object.freeze([
      Object.freeze({
        heading: "Chia sẻ những khoảnh khắc thật",
        body: "Mọi thứ bắt đầu từ điều bạn thực sự đã sống, không phải từ một hồ sơ.",
      }),
      Object.freeze({
        heading: "Gặp người khác một cách tự nhiên",
        body: "Bạn gặp những người khác qua chính những khoảnh khắc hai bên trao đổi.",
      }),
      Object.freeze({
        heading: "Một Connection trở nên khả thi",
        body: "Những cuộc gặp chân thật có thể khiến một Connection giữa hai người trở nên khả thi.",
      }),
      Object.freeze({
        heading: "Gửi yêu cầu",
        body: "Khi điều đó khả thi, một trong hai người có thể đề nghị một Connection.",
      }),
      Object.freeze({
        heading: "Cả hai cùng đồng ý",
        body: "Chưa có gì mở ra cho đến khi cả hai đều đồng ý, mỗi người một cách độc lập.",
      }),
      Object.freeze({
        heading: "Bắt đầu trò chuyện",
        body: "Một Connection đang hoạt động nghĩa là tin nhắn văn bản và hồ sơ của nhau.",
      }),
    ]),
    connectionsSafety:
      "Bạn giữ quyền kiểm soát suốt chặng đường. Báo cáo, Chặn và Kết thúc Connection luôn nằm trong tầm tay.",

    globalBody:
      "Khám phá những khoảnh khắc thật mà mọi người chọn chia sẻ với cả cộng đồng ULMOX.",
    globalBody2: "Một nơi để thấy cộng đồng đang công khai chia sẻ điều gì, ngay lúc này.",

    differentHeading: "Vì sao ULMOX khác biệt",
    differences: Object.freeze([
      Object.freeze({
        heading: "Khoảnh khắc thật, không phải hồ sơ được đánh bóng",
        body: "Bạn chia sẻ một khoảnh khắc đã sống, không phải hình ảnh của người bạn muốn trở thành.",
      }),
      Object.freeze({
        heading: "Những người ngoài vòng quen biết",
        body: "ULMOX đưa đến những người mà qua bạn bè sẵn có bạn sẽ chẳng bao giờ gặp.",
      }),
      Object.freeze({
        heading: "Không đua theo lượt theo dõi",
        body: "Không có con số nào để chạy theo và không có khán giả nào để gây dựng.",
      }),
      Object.freeze({
        heading: "Liên hệ lớn lên từ những cuộc gặp",
        body: "Một cuộc trò chuyện bắt đầu vì trước đó đã có điều gì đó thật xảy ra.",
      }),
      Object.freeze({
        heading: "Thế giới qua chính những người sống ở đó",
        body: "Mỗi khoảnh khắc đến từ một người đang thực sự đứng ở đó.",
      }),
    ]),

    safetyHeading: "An toàn và quyền kiểm soát",
    safetyBody:
      "Nhắn tin không bao giờ mở cho người lạ. Một cuộc trò chuyện chỉ có thể bắt đầu sau những cuộc gặp mà ULMOX yêu cầu và sự đồng ý của cả hai người, và bạn có thể kết thúc bất cứ lúc nào.",
    safetyControls: Object.freeze([
      Object.freeze({
        heading: "Báo cáo",
        body: "Báo cáo một người dùng hoặc một tin nhắn cụ thể. Một con người sẽ xem xét.",
      }),
      Object.freeze({
        heading: "Chặn",
        body: "Chặn sẽ dừng liên lạc theo cả hai chiều.",
      }),
      Object.freeze({
        heading: "Kết thúc Connection",
        body: "Rời đi luôn khả dụng, và với cặp đó thì đó là quyết định cuối cùng.",
      }),
    ]),

    ctaHeading: "Hiện đã có trên App Store và Google Play",
    ctaBody:
      "Tải ULMOX hôm nay từ App Store hoặc Google Play và bắt đầu chia sẻ những khoảnh khắc video thật.",
    copyright: "© 2026 ULMOX",
  }),
});

/**
 * The language-neutral entry page at `/`.
 *
 * It redirects to a locale, so nobody reads it for long, but a crawler and a
 * store reviewer both see it before the redirect runs. It carries the English
 * copy and is listed separately from `en` because the two pages differ in more
 * than their text: the root page also carries the language redirect, the
 * in-app-browser help and its own App Store URL.
 */
const CONTENT = Object.freeze({ ...LANDING, root: LANDING.en });

module.exports = { LANDING: CONTENT };
