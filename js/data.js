/* =====================================================================
   data.js — băncile de conținut: ghicitori, cultură generală,
   cuvinte tematice, curiozități.
   lv = nivelul potrivit: 1 (clasa I–II), 2 (clasa a III-a), 3 (clasa a IV-a)
   q = întrebarea, a = răspunsul corect, w = variante greșite
   ===================================================================== */
(function (global) {
  'use strict';

  var GHICITORI = [
    /* ---------------------------- nivel 1 ---------------------------- */
    { lv: 1, q: 'Am ace, dar nu cos niciodată. Ce sunt?', a: 'Bradul', w: ['Ariciul', 'Croitorul', 'Ceasul'] },
    { lv: 1, q: 'Are dinți, dar nu mușcă pe nimeni. Ce este?', a: 'Pieptenele', w: ['Lupul', 'Fierăstrăul', 'Furculița'] },
    { lv: 1, q: 'Sunt galben, rotund și încălzesc tot Pământul. Cine sunt?', a: 'Soarele', w: ['Luna', 'Balonul', 'Lămâia'] },
    { lv: 1, q: 'Am mustăți, dar nu mă bărbieresc, și torc, dar nu am lână. Cine sunt?', a: 'Pisica', w: ['Câinele', 'Bunicul', 'Șoarecele'] },
    { lv: 1, q: 'Am coarne, dar nu împung, și dau lapte în fiecare zi. Cine sunt?', a: 'Vaca', w: ['Capra', 'Cerbul', 'Melcul'] },
    { lv: 1, q: 'Sunt mic, sunt harnic și adun mierea din flori. Cine sunt?', a: 'Albina', w: ['Furnica', 'Fluturele', 'Păianjenul'] },
    { lv: 1, q: 'Am buzunar pe burtă și sar tot timpul. Cine sunt?', a: 'Cangurul', w: ['Iepurele', 'Broasca', 'Veverița'] },
    { lv: 1, q: 'Sunt mare, cenușiu și am trompă lungă. Cine sunt?', a: 'Elefantul', w: ['Hipopotamul', 'Rinocerul', 'Ursul'] },
    { lv: 1, q: 'Îmi car casa în spate și merg foarte încet. Cine sunt?', a: 'Melcul', w: ['Furnica', 'Crabul', 'Șarpele'] },
    { lv: 1, q: 'Am gâtul lung și mănânc frunze din vârful copacilor. Cine sunt?', a: 'Girafa', w: ['Zebra', 'Cămila', 'Struțul'] },
    { lv: 1, q: 'Sunt regele animalelor, am coamă bogată și rag puternic. Cine sunt?', a: 'Leul', w: ['Tigrul', 'Lupul', 'Ursul'] },
    { lv: 1, q: 'Am picioare, dar nu merg niciodată, și stau în bucătărie. Ce sunt?', a: 'Masa', w: ['Scaunul', 'Bunicul', 'Broasca'] },
    { lv: 1, q: 'Zbor fără aripi și plâng fără ochi. Ce sunt?', a: 'Norul', w: ['Vântul', 'Zmeul', 'Fulgul'] },
    { lv: 1, q: 'Cad mereu din cer, dar nu mă lovesc niciodată. Ce sunt?', a: 'Ploaia', w: ['Frunza', 'Piatra', 'Mingea'] },
    { lv: 1, q: 'Sunt alb, rece și mă topesc la soare. Ce sunt?', a: 'Zăpada', w: ['Norul', 'Nisipul', 'Zahărul'] },
    { lv: 1, q: 'Am pălărie, dar n-am cap; am picior, dar n-am gheată. Ce sunt?', a: 'Ciuperca', w: ['Copacul', 'Umbrela', 'Sperietoarea'] },
    { lv: 1, q: 'Te urmez peste tot ziua, dar dispar la întuneric. Ce sunt?', a: 'Umbra', w: ['Ecoul', 'Câinele', 'Vântul'] },
    { lv: 1, q: 'Am aripi și zbor, dar nu sunt pasăre și n-am pene. Ce sunt?', a: 'Avionul', w: ['Vulturul', 'Balonul', 'Norul'] },
    /* ---------------------------- nivel 2 ---------------------------- */
    { lv: 2, q: 'Am față și limbi, dar nu am corp și nu vorbesc. Ce sunt?', a: 'Ceasul', w: ['Oglinda', 'Cartea', 'Păpușa'] },
    { lv: 2, q: 'Am file, dar nu sunt copac; am cotor, dar nu sunt măr. Ce sunt?', a: 'Cartea', w: ['Frunza', 'Ziarul', 'Cutia'] },
    { lv: 2, q: 'Mă ud tot timpul, dar treaba mea este să te usuc. Ce sunt?', a: 'Prosopul', w: ['Buretele', 'Norul', 'Săpunul'] },
    { lv: 2, q: 'Cu cât iei mai mult din ea, cu atât devine mai mare. Ce este?', a: 'Groapa', w: ['Prăjitura', 'Cutia', 'Grămada'] },
    { lv: 2, q: 'Am clape albe și negre și cânt frumos, dar nu am gură. Ce sunt?', a: 'Pianul', w: ['Chitara', 'Toba', 'Radioul'] },
    { lv: 2, q: 'Am gât, dar nu am cap, și ții apă în mine. Ce sunt?', a: 'Sticla', w: ['Cana', 'Gâsca', 'Fântâna'] },
    { lv: 2, q: 'Alerg mereu printre maluri, dar nu obosesc niciodată. Ce sunt?', a: 'Râul', w: ['Vântul', 'Trenul', 'Ceasul'] },
    { lv: 2, q: 'Am cap și coadă, dar nu am corp, și stau în buzunar. Ce sunt?', a: 'Moneda', w: ['Cheia', 'Șarpele', 'Nasturele'] },
    { lv: 2, q: 'Am mii de ace pe spate, dar nu cos nimic. Cine sunt?', a: 'Ariciul', w: ['Bradul', 'Cactusul', 'Peștele'] },
    { lv: 2, q: 'Sunt plin de găuri, dar tot pot să țin apa. Ce sunt?', a: 'Buretele', w: ['Sita', 'Plasa', 'Vasul'] },
    { lv: 2, q: 'Călătoresc prin toată lumea, dar stau mereu într-un colț. Ce sunt?', a: 'Timbrul', w: ['Harta', 'Vaporul', 'Ceasul'] },
    { lv: 2, q: 'Trec prin geam fără să îl sparg. Ce sunt?', a: 'Lumina', w: ['Vântul', 'Piatra', 'Ploaia'] },
    { lv: 2, q: 'Vorbesc toate limbile din lume, dar n-am învățat niciuna. Cine sunt?', a: 'Ecoul', w: ['Papagalul', 'Profesorul', 'Radioul'] },
    { lv: 2, q: 'Am miez, dar nu sunt pâine; am coajă tare, dar nu sunt copac. Ce sunt?', a: 'Nuca', w: ['Oul', 'Mărul', 'Cartoful'] },
    { lv: 2, q: 'Merg pe apă cu pânze umflate de vânt, dar nu sunt pește. Ce sunt?', a: 'Corabia', w: ['Delfinul', 'Pescărușul', 'Podul'] },
    { lv: 2, q: 'Sunt neagră când sunt curată și albă când sunt scrisă. Ce sunt?', a: 'Tabla', w: ['Foaia', 'Creta', 'Umbra'] },
    { lv: 2, q: 'Am ochi, dar nu văd nimic, și stau ascuns în pământ. Ce sunt?', a: 'Cartoful', w: ['Morcovul', 'Cârtița', 'Acul'] },
    { lv: 2, q: 'Am o singură talpă, dar nu am picior, și te apăr de ploaie. Ce sunt?', a: 'Umbrela', w: ['Cizma', 'Acoperișul', 'Pălăria'] },
    /* ---------------------------- nivel 3 ---------------------------- */
    { lv: 3, q: 'Urc mereu, an după an, dar nu cobor niciodată. Ce sunt?', a: 'Vârsta', w: ['Muntele', 'Fumul', 'Scara'] },
    { lv: 3, q: 'Este al tău, dar alții îl folosesc mai des decât tine. Ce este?', a: 'Numele', w: ['Ceasul', 'Umbra', 'Pixul'] },
    { lv: 3, q: 'Mă spargi de fiecare dată când mă rostești. Ce sunt?', a: 'Tăcerea', w: ['Oul', 'Promisiunea', 'Sticla'] },
    { lv: 3, q: 'Sunt mai ușoară decât o pană, dar nici cel mai puternic om nu mă poate ține mult. Ce sunt?', a: 'Respirația', w: ['Umbra', 'Frunza', 'Bula de săpun'] },
    { lv: 3, q: 'Cu cât sunt mai uscat, cu atât pot să absorb mai mult. Ce sunt?', a: 'Prosopul', w: ['Nisipul', 'Lemnul', 'Praful'] },
    { lv: 3, q: 'Am orașe, dar nicio casă; am munți, dar niciun copac; am apă, dar niciun pește. Ce sunt?', a: 'Harta', w: ['Tabloul', 'Vitrina', 'Vitraliul'] },
    { lv: 3, q: 'Sunt mereu în fața ta, dar nu mă poți vedea niciodată. Ce sunt?', a: 'Viitorul', w: ['Nasul', 'Aerul', 'Oglinda'] },
    { lv: 3, q: 'Am o cheie, dar nu deschid nicio ușă; stau la începutul portativului. Ce sunt?', a: 'Cheia sol', w: ['Cheia franceză', 'Lacătul', 'Cheia de la casă'] },
    { lv: 3, q: 'Vin în fiecare seară fără să fiu chemată și plec dimineața fără să spun la revedere. Ce sunt?', a: 'Noaptea', w: ['Somnul', 'Luna', 'Vântul'] },
    { lv: 3, q: 'Sunt mai iute decât orice, ocolesc Pământul de șapte ori într-o secundă. Ce sunt?', a: 'Lumina', w: ['Sunetul', 'Vântul', 'Racheta'] },
    { lv: 3, q: 'Mă poți prinde, dar nu mă poți arunca niciodată. Ce sunt?', a: 'Răceala', w: ['Mingea', 'Umbra', 'Pasărea'] },
    { lv: 3, q: 'Am mereu douăsprezece frați, dar niciodată nu ne întâlnim toți în aceeași zi. Ce suntem?', a: 'Lunile anului', w: ['Zilele săptămânii', 'Orele', 'Anotimpurile'] }
  ];

  var CULTURA = [
    /* întrebări practice, din viața de zi cu zi: siguranță, sănătate,
       stradă, bani, casă, internet — nu istorie, date sau definiții */
    /* ---------------------------- nivel 1 ---------------------------- */
    { lv: 1, q: 'La ce număr suni dacă e o urgență: foc, accident sau cineva rănit?', a: '112', w: ['911', '100', '123'] },
    { lv: 1, q: 'Ce culoare a semaforului pentru pietoni îți spune că poți traversa?', a: 'Verde', w: ['Roșu', 'Galben', 'Albastru'] },
    { lv: 1, q: 'Pe unde traversăm strada în siguranță?', a: 'Pe la trecerea de pietoni (zebră)', w: ['Pe unde vrem, dacă alergăm', 'Printre mașinile oprite', 'Pe la colț, fără să ne uităm'] },
    { lv: 1, q: 'În ce direcție te uiți înainte să traversezi strada?', a: 'Stânga, dreapta, apoi iar stânga', w: ['Doar în sus', 'Doar în spate', 'Nicăieri, dacă merg repede'] },
    { lv: 1, q: 'Ce facem întotdeauna înainte de masă?', a: 'Ne spălăm pe mâini', w: ['Ne culcăm puțin', 'Ne spălăm pe picioare', 'Ne schimbăm de haine'] },
    { lv: 1, q: 'De câte ori pe zi trebuie să ne spălăm pe dinți?', a: 'De 2 ori: dimineața și seara', w: ['O dată pe săptămână', 'Doar duminica', 'Numai când mâncăm dulciuri'] },
    { lv: 1, q: 'Ce purtăm pe cap când mergem cu bicicleta sau trotineta?', a: 'Cască', w: ['Șapcă', 'Coroană', 'Nimic'] },
    { lv: 1, q: 'Ce facem cu ambalajul de la bomboană când suntem în parc?', a: 'Îl aruncăm la coșul de gunoi', w: ['Îl aruncăm pe jos', 'Îl ascundem în iarbă', 'Îl dăm unui porumbel'] },
    { lv: 1, q: 'Ce e cel mai bine să bem când e foarte cald afară și ni se face sete?', a: 'Apă', w: ['Suc acidulat', 'Lapte cu ciocolată', 'Nimic, trece'] },
    { lv: 1, q: 'Ce e bine să faci cu un măr înainte să îl mănânci?', a: 'Să îl speli', w: ['Să îl lași la soare o zi', 'Să îl arunci în sus', 'Să îl ștergi de haine'] },
    { lv: 1, q: 'Ce faci dacă ai o tăietură mică la deget?', a: 'O spăl cu apă și pun un plasture', w: ['O ascund în buzunar', 'O acopăr cu pământ', 'Nu fac nimic, dispare'] },
    { lv: 1, q: 'Ce spui când cineva îți dă ceva sau te ajută?', a: '„Mulțumesc!”', w: ['„La revedere!”', '„Noroc!”', 'Nimic, nu e nevoie'] },
    { lv: 1, q: 'Ce faci dacă vezi foc sau fum în casă?', a: 'Ies repede afară și chem un adult', w: ['Mă ascund sub pat', 'Deschid toate ferestrele și aștept', 'Mă uit cum arde'] },
    { lv: 1, q: 'Un necunoscut te cheamă în mașina lui și îți promite bomboane. Ce faci?', a: 'Nu mă duc și spun imediat unui adult cunoscut', w: ['Mă urc, dacă are bomboane bune', 'Mă duc, dacă spune că mă știe', 'Îl urmez o bucată de drum'] },
    { lv: 1, q: 'Te-ai pierdut într-un magazin mare. Pe cine cauți ca să te ajute?', a: 'Un angajat al magazinului sau un polițist', w: ['Pe cineva care iese din magazin', 'Pe nimeni, ies singur în stradă', 'Un copil mai mare'] },
    { lv: 1, q: 'Ce e bine să mâncăm ca să avem oase și dinți puternici?', a: 'Lapte, iaurt, brânză', w: ['Bomboane', 'Chipsuri', 'Suc'] },
    { lv: 1, q: 'Cam cât trebuie să doarmă un copil de vârsta ta, într-o noapte?', a: 'În jur de 10 ore', w: ['2 ore', '5 ore', '20 de ore'] },
    { lv: 1, q: 'Ce faci cu robinetul cât te speli pe dinți?', a: 'Îl închid, ca să nu curgă apa degeaba', w: ['Îl las deschis la maxim', 'Beau din el', 'Mă joc cu apa'] },
    { lv: 1, q: 'Ce culoare obții dacă amesteci galben cu albastru?', a: 'Verde', w: ['Portocaliu', 'Mov', 'Maro'] },
    { lv: 1, q: 'Ce iei cu tine când ieși din casă și afară plouă?', a: 'Umbrela sau haina de ploaie', w: ['Ochelarii de soare', 'Sania', 'Costumul de baie'] },
    { lv: 1, q: 'Care e gustarea cea mai sănătoasă dintre acestea?', a: 'Un fruct', w: ['Chipsuri', 'Bomboane', 'Suc acidulat'] },
    { lv: 1, q: 'Ce faci dacă un coleg cade și se lovește rău?', a: 'Chem imediat un adult', w: ['Îl ridic repede și îl scutur', 'Râd, pentru că e amuzant', 'Mă prefac că nu am văzut'] },
    /* ---------------------------- nivel 2 ---------------------------- */
    { lv: 2, q: 'Ce nu ai voie să dai NICIODATĂ unui necunoscut de pe internet?', a: 'Adresa de acasă și parola', w: ['Culoarea preferată', 'Numele desenului animat preferat', 'Ce ai mâncat la prânz'] },
    { lv: 2, q: 'Ce e bine să știi pe de rost, în caz că te rătăcești?', a: 'Numărul de telefon al părinților și adresa de acasă', w: ['Prețul pâinii', 'Numele vecinului de la etajul 5', 'Numărul de la loto'] },
    { lv: 2, q: 'Ai găsit un portofel pe stradă. Ce faci?', a: 'Îl duc unui adult sau la poliție', w: ['Îl păstrez, e norocul meu', 'Iau banii și îl arunc', 'Îl ascund ca să îl găsesc mai târziu'] },
    { lv: 2, q: 'Termometrul arată 38,5°C. Ce înseamnă?', a: 'Copilul are febră', w: ['E sănătos tun', 'Îi e frig', 'E prea înalt'] },
    { lv: 2, q: 'Care e temperatura normală a corpului omenesc?', a: 'Aproximativ 37°C', w: ['20°C', '50°C', '100°C'] },
    { lv: 2, q: 'Ai mâinile ude și vrei să pui un aparat în priză. Ce faci mai întâi?', a: 'Le usuc bine', w: ['Le ud și mai mult', 'Nimic, e în regulă', 'Le pun în apă caldă'] },
    { lv: 2, q: 'Pe un drum fără trotuar, pe ce parte merge pietonul?', a: 'Pe partea stângă, cu fața la mașini', w: ['Pe partea dreaptă, cu spatele la mașini', 'Pe mijlocul drumului', 'Nu contează'] },
    { lv: 2, q: 'Ce se întâmplă cu apa de pe drum când afară sunt 0°C sau mai puțin?', a: 'Îngheață și se face polei', w: ['Fierbe', 'Se evaporă', 'Devine sărată'] },
    { lv: 2, q: 'Cât timp trebuie să te speli pe mâini cu săpun?', a: 'Cel puțin 20 de secunde', w: ['2 secunde', '10 minute', 'O oră'] },
    { lv: 2, q: 'Simți miros de gaz în bucătărie. Ce faci?', a: 'Deschid geamul, nu aprind nimic și chem un adult', w: ['Aprind aragazul, să văd dacă merge', 'Aprind lumina', 'Mă culc'] },
    { lv: 2, q: 'Ce faci cu bateriile uzate?', a: 'Le duc la un punct de colectare special', w: ['Le arunc la gunoiul obișnuit', 'Le arunc în toaletă', 'Le pun pe foc'] },
    { lv: 2, q: 'În ce coș de gunoi aruncăm sticlele de plastic?', a: 'În cel galben (plastic și metal)', w: ['În cel verde (sticlă)', 'În cel albastru (hârtie)', 'În oricare'] },
    { lv: 2, q: 'Te-a înțepat o albină. Ce faci?', a: 'Scot acul și pun ceva rece pe loc', w: ['Strâng locul cât pot', 'Pun sare', 'Alerg după albină'] },
    { lv: 2, q: 'Cum ne protejăm de soare vara?', a: 'Cremă de protecție, pălărie și multă apă', w: ['Stăm la soare la prânz cât mai mult', 'Purtăm haine negre și groase', 'Nu bem apă, ca să nu transpirăm'] },
    { lv: 2, q: 'Cum afli dacă un ou este proaspăt?', a: 'Îl pun în apă: dacă stă pe fund, e proaspăt', w: ['Îl arunc în sus', 'Îl las la soare', 'Nu se poate afla'] },
    { lv: 2, q: 'Ce înseamnă „data expirării” de pe un iaurt?', a: 'Ziua până la care e sigur să îl mănânci', w: ['Ziua în care a fost făcut', 'Prețul produsului', 'Câte bucăți sunt în cutie'] },
    { lv: 2, q: 'Ce e bine să faci cu telefonul înainte de culcare?', a: 'Îl las deoparte, nu îl folosesc în pat', w: ['Mă uit la el până adorm', 'Îl țin sub pernă', 'Îl pun pe pernă, lângă ureche'] },
    { lv: 2, q: 'Ce instrument folosim ca să măsurăm temperatura?', a: 'Termometrul', w: ['Cântarul', 'Rigla', 'Ceasul'] },
    { lv: 2, q: 'Câte minute are o oră?', a: '60', w: ['30', '100', '24'] },
    { lv: 2, q: 'Câte luni are un an?', a: '12', w: ['10', '7', '52'] },
    { lv: 2, q: 'Ce faci dacă un prieten este necăjit sau bătut de alți copii?', a: 'Spun unui adult de încredere', w: ['Mă alătur celorlalți', 'Mă prefac că nu văd', 'Filmez și postez'] },
    { lv: 2, q: 'Un câine necunoscut vine spre tine și mârâie. Ce faci?', a: 'Stau nemișcat, nu fug și nu îl privesc în ochi', w: ['Fug cât pot de repede', 'Îl mângâi pe cap', 'Țip la el'] },
    { lv: 2, q: 'Care este cel mai lung fluviu care trece prin România?', a: 'Dunărea', w: ['Oltul', 'Mureșul', 'Prutul'] },
    { lv: 2, q: 'Cum se numesc munții care traversează România?', a: 'Carpații', w: ['Alpii', 'Balcanii', 'Pirineii'] },
    { lv: 2, q: 'La ce mare are ieșire România?', a: 'Marea Neagră', w: ['Marea Roșie', 'Marea Mediterană', 'Marea Baltică'] },
    /* ---------------------------- nivel 3 ---------------------------- */
    { lv: 3, q: 'Ce trebuie să spui neapărat când suni la 112?', a: 'Ce s-a întâmplat și adresa unde ești', w: ['Vârsta bunicii', 'Ce ai mâncat la prânz', 'Culoarea mașinii preferate'] },
    { lv: 3, q: 'Cineva leșină lângă tine. Ce faci?', a: 'Chem un adult și sun la 112', w: ['Îi torn apă pe față', 'Îl las să se odihnească', 'Îl ridic în picioare'] },
    { lv: 3, q: 'La un magazin scrie „reducere 50%”. Cât plătești pentru o jucărie de 40 de lei?', a: '20 de lei', w: ['40 de lei', '10 lei', '50 de lei'] },
    { lv: 3, q: 'La piață scrie „3 lei/kg”. Ce înseamnă?', a: 'Plătești 3 lei pentru fiecare kilogram', w: ['Plătești 3 lei pentru tot ce iei', 'Plătești 3 lei pentru 3 kg', 'Primești 3 lei înapoi'] },
    { lv: 3, q: 'Ce înseamnă să economisești bani?', a: 'Pui deoparte o parte din bani, pentru mai târziu', w: ['Cheltui tot ce ai', 'Împrumuți de la alții', 'Ascunzi banii altora'] },
    { lv: 3, q: 'Cum arată o parolă bună?', a: 'Lungă, cu litere, cifre și semne, știută doar de tine', w: ['Numele tău', '1234', 'Numele animalului de companie'] },
    { lv: 3, q: 'Cineva de pe internet îți cere o poză și adresa ta. Ce faci?', a: 'Nu trimit nimic și spun părinților', w: ['Trimit poza, dar nu adresa', 'Trimit tot, dacă pare de treabă', 'Trimit doar numărul de telefon'] },
    { lv: 3, q: 'Primești un mesaj de la „bancă” în care ți se cere parola. Ce faci?', a: 'Nu răspund — banca nu cere niciodată parola', w: ['Trimit parola imediat', 'Trimit doar jumătate din parolă', 'Sun la numărul din mesaj'] },
    { lv: 3, q: 'Ai citit o știre incredibilă pe internet. Ce faci înainte să o crezi?', a: 'Verific în mai multe surse de încredere', w: ['O dau mai departe imediat', 'O cred, dacă are multe like-uri', 'O cred, dacă are poze'] },
    { lv: 3, q: 'Cablul unui aparat e rupt și se văd firele. Ce faci?', a: 'Nu îl ating și anunț un adult', w: ['Îl lipesc cu scotch', 'Îl bag în priză cu grijă', 'Îl ating, să văd dacă merge'] },
    { lv: 3, q: 'E incendiu în bloc. Pe unde ieși?', a: 'Pe scări, niciodată cu liftul', w: ['Cu liftul, e mai rapid', 'Pe geam', 'Aștept în cameră'] },
    { lv: 3, q: 'Te-a prins furtuna cu fulgere pe câmp. Unde te adăpostești?', a: 'Într-o clădire sau mașină, nu sub copac', w: ['Sub cel mai înalt copac', 'Lângă un gard de metal', 'În mijlocul câmpului, cu umbrela deschisă'] },
    { lv: 3, q: 'Apa dintr-un râu de munte pare foarte limpede. O poți bea?', a: 'Nu, apa din râu se bea doar fiartă sau filtrată', w: ['Da, dacă e limpede', 'Da, dacă e rece', 'Da, dacă nu miroase'] },
    { lv: 3, q: 'Cum iei corect un medicament?', a: 'Doar dat de un adult, în doza spusă de medic', w: ['Cât vreau, dacă are gust bun', 'Îl împart cu colegii', 'Câte unul în fiecare zi, pentru orice'] },
    { lv: 3, q: 'De la ce oră seara începe „liniștea” în bloc, când nu mai facem gălăgie?', a: '22:00', w: ['18:00', '12:00', '06:00'] },
    { lv: 3, q: 'Ce înseamnă semnul cu trei săgeți în cerc de pe un ambalaj?', a: 'Că ambalajul se poate recicla', w: ['Că produsul e scump', 'Că e periculos', 'Că trebuie aruncat pe jos'] },
    { lv: 3, q: 'O rețetă spune „150 g de făină”. Cu ce măsori?', a: 'Cu cântarul de bucătărie', w: ['Cu rigla', 'Cu termometrul', 'Cu ceasul'] },
    { lv: 3, q: 'La ce temperatură fierbe apa din oală?', a: '100°C', w: ['0°C', '50°C', '212°C'] },
    { lv: 3, q: 'Cum se numește actul cu care dovedești cine ești, primit la 14 ani?', a: 'Cartea de identitate (buletinul)', w: ['Carnetul de note', 'Permisul de conducere', 'Cardul bancar'] },
    { lv: 3, q: 'E verde la semafor, dar vine o ambulanță cu sirena pornită. Ce faci?', a: 'Aștept să treacă, apoi traversez', w: ['Traversez, că e verde', 'Alerg în fața ei', 'Traversez încet, ca să mă vadă'] },
    { lv: 3, q: 'Cât timp e bine să stai la soare vara între orele 11 și 16?', a: 'Cât mai puțin — atunci soarele arde cel mai tare', w: ['Toată ziua', 'Cât vrei, dacă bei apă', 'Cât vrei, dacă porți haine negre'] },
    { lv: 3, q: 'Ai lăsat mâncarea gătită pe masă toată noaptea, vara. Ce faci cu ea?', a: 'O arunc, se poate strica', w: ['O mănânc, arată bine', 'O pun în frigider acum și e ok', 'O încălzesc și e bună'] },
    { lv: 3, q: 'Care planetă este cunoscută drept „Planeta Roșie”?', a: 'Marte', w: ['Venus', 'Jupiter', 'Saturn'] },
    { lv: 3, q: 'Care este cel mai mare animal de pe Pământ?', a: 'Balena albastră', w: ['Elefantul african', 'Rechinul alb', 'Girafa'] }
  ];

  /* cuvinte tematice pentru anagrame — grupate pe tema camerei */
  var CUVINTE = {
    piramida:  [['SFINX', 'Statuie uriașă cu cap de om și corp de leu'], ['MUMIE', 'Faraon învelit în bandaje'], ['NISIP', 'Acoperă tot deșertul'], ['PAPIRUS', 'Hârtia egiptenilor'], ['FARAON', 'Regele Egiptului antic'], ['CAMILA', 'Animalul deșertului, cu cocoașe']],
    castel:    [['CAVALER', 'Luptă cu sabie și scut'], ['COROANA', 'O poartă regele pe cap'], ['SCUT', 'Te apără de lovituri'], ['TURN', 'Partea cea mai înaltă a castelului'], ['DRAGON', 'Balaur care scuipă foc'], ['SABIE', 'Arma cavalerului']],
    spatiu:    [['RACHETA', 'Zboară spre stele'], ['PLANETA', 'Se învârte în jurul Soarelui'], ['STEA', 'Strălucește noaptea pe cer'], ['COMETA', 'Are coadă lungă de gheață'], ['ASTRONAUT', 'Omul care merge în spațiu'], ['ORBITA', 'Drumul unei planete']],
    jungla:    [['MAIMUTA', 'Se leagănă din liană în liană'], ['LIANA', 'Frânghia naturală din junglă'], ['TUCAN', 'Pasăre cu cioc uriaș și colorat'], ['TIGRU', 'Felină cu dungi portocalii'], ['PAPAGAL', 'Pasărea care vorbește'], ['BROASCA', 'Sare și orăcăie']],
    laborator: [['EPRUBETA', 'Tub de sticlă pentru experimente'], ['MAGNET', 'Atrage fierul'], ['ATOM', 'Cea mai mică parte a materiei'], ['MICROSCOP', 'Face lucrurile mici să pară mari'], ['ROBOT', 'Mașinărie care ascultă comenzi'], ['CRISTAL', 'Piatră transparentă și strălucitoare']],
    pirati:    [['COMOARA', 'Cufăr plin cu aur'], ['HARTA', 'Îți arată unde e comoara'], ['ANCORA', 'Ține corabia pe loc'], ['BUSOLA', 'Arată mereu nordul'], ['PAPAGAL', 'Stă pe umărul piratului'], ['CATARG', 'Susține pânzele corabiei']],
    gheata:    [['PINGUIN', 'Pasăre care înoată, dar nu zboară'], ['IGLU', 'Casă din blocuri de gheață'], ['URS', 'Alb și uriaș, la Polul Nord'], ['FULG', 'Cade din cer iarna'], ['GHETAR', 'Munte imens de gheață'], ['SANIE', 'Alunecă pe zăpadă']],
    biblioteca:[['CARTE', 'Are file și povești'], ['POVESTE', 'O citești seara'], ['CERNEALA', 'Lichidul din stilou'], ['ALFABET', 'Toate literele la un loc'], ['PANA', 'Se scria cu ea demult'], ['ZANA', 'Personaj magic din povești']],
    bomboane:  [['CIOCOLATA', 'Dulce și maronie'], ['ACADEA', 'Bomboană pe băț'], ['ZAHAR', 'Face totul dulce'], ['TURTA', 'Se face din miere și scorțișoară'], ['BEZEA', 'Ușoară ca un norișor'], ['GLAZURA', 'Îmbracă prăjitura']],
    roboti:    [['ROBOT', 'Mașinărie inteligentă'], ['ANTENA', 'Primește semnale'], ['BATERIE', 'Dă energie'], ['CIRCUIT', 'Drumul curentului electric'], ['MOTOR', 'Pune lucrurile în mișcare'], ['LASER', 'Rază de lumină foarte puternică']],
    ceasornicar: [['ARC', 'Piesa strânsă care ține ceasul în mișcare'], ['PENDUL', 'Se leagănă stânga-dreapta, fără oprire'], ['CADRAN', 'Fața ceasului, cu cifrele pe ea'], ['ROTITA', 'Are dinți mărunți și învârte ceasul'], ['MINUTAR', 'Acul cel lung al ceasului'], ['CLOPOT', 'Sună la ora fixă']],
    submarin:  [['PERISCOP', 'Prin el vezi ce e deasupra apei'], ['CORAL', 'Crește colorat pe fundul mării'], ['SONAR', 'Găsește lucruri folosind sunete'], ['MEDUZA', 'Transparentă, moale și plutitoare'], ['ANCORA', 'Ține vasul pe loc'], ['ELICE', 'Se învârte și împinge vaporul']],
    tren:      [['VAGON', 'Partea în care stau călătorii'], ['SINA', 'Pe ea merge trenul'], ['BILET', 'Îl arăți conductorului'], ['PERON', 'Locul unde aștepți trenul'], ['FLUIER', 'Sună înainte de plecare'], ['FELINAR', 'Luminează noaptea, pe peron']],
    circ:      [['CLOVN', 'Are nas roșu și te face să râzi'], ['TRAPEZ', 'Se leagănă sus, sub cort'], ['CORT', 'Casa uriașă de pânză a circului'], ['MASCA', 'O pui pe față ca să nu te recunoască'], ['MINGE', 'Se rostogolește și sare'], ['PANGLICA', 'Lungă, colorată și se unduiește']],
    mister:    [['ENIGMA', 'Mister greu de dezlegat'], ['PORTAL', 'Poartă către altă lume'], ['CHEIE', 'Deschide orice lacăt'], ['MAGIE', 'Face lucruri imposibile'], ['SECRET', 'Nu îl spui nimănui'], ['CRISTAL', 'Sferă în care se vede viitorul']]
  };

  /* proverbe și zicători — se completează cuvântul lipsă */
  var PROVERBE = [
    { lv: 2, q: 'Cine se scoală de dimineață, departe ___.', a: 'ajunge', w: ['doarme', 'aleargă', 'cântă'] },
    { lv: 2, q: 'Ai carte, ai ___.', a: 'parte', w: ['soare', 'noroc', 'grijă'] },
    { lv: 2, q: 'Buturuga mică răstoarnă ___ mare.', a: 'carul', w: ['casa', 'muntele', 'pomul'] },
    { lv: 2, q: 'Prietenul la ___ se cunoaște.', a: 'nevoie', w: ['joacă', 'școală', 'masă'] },
    { lv: 3, q: 'Nu lăsa pe mâine ce poți face ___.', a: 'azi', w: ['poimâine', 'niciodată', 'la anul'] },
    { lv: 3, q: 'Apa trece, ___ rămân.', a: 'pietrele', w: ['peștii', 'norii', 'frunzele'] },
    { lv: 3, q: 'Cine sapă groapa altuia cade singur ___.', a: 'în ea', w: ['pe spate', 'la pământ', 'în apă'] },
    { lv: 3, q: 'Vorba dulce mult ___.', a: 'aduce', w: ['doare', 'costă', 'ține'] },
    { lv: 3, q: 'Lupul își schimbă părul, dar ___ ba.', a: 'năravul', w: ['dinții', 'coada', 'drumul'] },
    { lv: 2, q: 'Unde-i unul nu-i putere, unde-s ___ puterea crește.', a: 'doi', w: ['trei', 'mulți', 'toți'] }
  ];

  /* curiozități afișate la finalul fiecărei camere */
  var CURIOZITATI = {
    piramida:  ['Piramida lui Keops a fost cea mai înaltă construcție din lume timp de peste 3800 de ani!', 'Egiptenii scriau cu peste 700 de semne diferite, numite hieroglife.', 'Pisicile erau animale sacre în Egiptul antic.'],
    castel:    ['Scările din turnurile castelelor urcau în spirală spre dreapta, ca apărătorii să lupte mai ușor.', 'O armură de cavaler putea cântări cât 3 pepeni mari: aproape 30 de kilograme.', 'Șanțul cu apă din jurul castelului se numea „șanț de apărare”.'],
    spatiu:    ['În spațiu nu există sunet, pentru că nu există aer prin care să călătorească.', 'O zi pe planeta Venus durează mai mult decât un an pe Venus!', 'Urmele lăsate de astronauți pe Lună vor rămâne acolo milioane de ani.'],
    jungla:    ['Pădurea amazoniană produce o mare parte din oxigenul planetei.', 'Un tucan își folosește ciocul uriaș ca să se răcorească, nu doar ca să mănânce.', 'Unele broaște din junglă sunt atât de colorate ca să avertizeze că sunt periculoase.'],
    laborator: ['Apa este singura substanță de pe Pământ care există natural în toate cele trei stări.', 'Un fulger este de cinci ori mai fierbinte decât suprafața Soarelui.', 'Mierea nu se strică niciodată: s-a găsit miere veche de 3000 de ani, încă bună!'],
    pirati:    ['Piratele adevărate purtau uneori o bandă pe ochi ca să vadă mai bine sub punte, la întuneric.', 'Busola a fost inventată în China acum aproape 1000 de ani.', 'Cele mai multe hărți ale comorilor din povești sunt inventate — piratii își cheltuiau repede aurul.'],
    gheata:    ['Un fulg de zăpadă are întotdeauna 6 brațe, iar fiecare fulg este unic.', 'Urșii polari au pielea neagră sub blana albă, ca să absoarbă mai bine căldura.', 'Gheața plutește pentru că, atunci când îngheață, apa se dilată și devine mai ușoară.'],
    biblioteca:['Cea mai mare bibliotecă din lume are peste 170 de milioane de documente.', 'Prima carte tipărită cu litere mobile a apărut acum peste 550 de ani.', 'Mirosul de carte veche vine de la hârtia care se descompune încet și miroase a vanilie.'],
    bomboane:  ['Ciocolata se face din boabe de cacao, care cresc direct pe trunchiul copacului.', 'Prima acadea pe băț a fost inventată ca să nu se murdărească mâinile copiilor.', 'Este nevoie de aproape 400 de boabe de cacao pentru o singură ciocolată mare.'],
    roboti:    ['Cuvântul „robot” vine dintr-o piesă de teatru scrisă în anul 1920.', 'Unii roboți din fabrici pot repeta aceeași mișcare de milioane de ori fără să greșească.', 'Roverele trimise pe Marte sunt roboți conduși de pe Pământ, cu întârziere de câteva minute.'],
    ceasornicar: ['Cel mai vechi ceas mecanic care încă merge are peste 600 de ani.', 'Un ceas cu pendul bate de 86.400 de ori într-o singură zi.', 'Rotițele dintr-un ceas de mână pot fi mai subțiri decât un fir de păr.'],
    submarin:  ['Cel mai adânc loc din ocean este mai adânc decât înălțimea celui mai înalt munte.', 'Caracatița are trei inimi și sânge albastru.', 'Submarinele se scufundă umplând cu apă niște rezervoare speciale.'],
    tren:      ['Primul tren cu aburi mergea mai încet decât un om care aleargă.', 'Cel mai lung drum cu trenul din lume ține aproape o săptămână.', 'Roțile trenului nu au cauciucuri: sunt din oțel și alunecă pe șine.'],
    circ:      ['Cuvântul „circ” înseamnă „cerc” în latină, după forma arenei.', 'Clovnii își pictează fața altfel unul de altul, ca o semnătură.', 'Un jongler bun poate ține în aer șapte mingi în același timp.'],
    mister:    ['Creierul tău rezolvă enigme chiar și când dormi — de aceea uneori te trezești cu soluția!', 'Cuvântul „enigmă” vine din greaca veche și înseamnă „vorbă ascunsă”.', 'Cel mai bun mod de a rezolva o problemă grea este să o împarți în bucăți mici.']
  };

  /* ---------- selectoare: aleg întrebări potrivite nivelului ---------- */
  function byLevel(bank, level, rnd, used) {
    var exact = [], near = [];
    for (var i = 0; i < bank.length; i++) {
      var it = bank[i];
      var key = it.q;
      if (used && used[key]) continue;
      if (it.lv === level) exact.push(it);
      else if (Math.abs(it.lv - level) === 1) near.push(it);
    }
    var pool = exact.length ? exact : (near.length ? near : bank);
    var pick = pool[Math.floor(rnd() * pool.length)];
    if (used && pick) used[pick.q] = true;
    return pick;
  }

  global.DATA = {
    GHICITORI: GHICITORI,
    CULTURA: CULTURA,
    CUVINTE: CUVINTE,
    PROVERBE: PROVERBE,
    CURIOZITATI: CURIOZITATI,
    byLevel: byLevel
  };
})(window);
