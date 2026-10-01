# 🗝️ Evadarea Magică

Joc de tip **escape room pentru copii de clasele I–IV**, în limba română.
**100 de camere** împărțite în 10 lumi + o cameră generată aleatoriu, cu
ghicitori, calcule matematice, întrebări practice, coduri secrete și multe
altele.

Totul este HTML, CSS și JavaScript simplu — **fără biblioteci, fără build,
fără server**. Merge dintr-un dublu-click pe `index.html` și se publică
direct pe GitHub Pages.

---

## 🎮 Cum se joacă

1. Copilul intră cu utilizatorul și parola primite de la profesor, apoi își
   scrie numele și alege clasa (I–II, a III-a sau a IV-a).
   Nivelul schimbă automat dificultatea calculelor și a întrebărilor.
2. Alege o lume din bara de sus, apoi o cameră (se poate juca în orice ordine).
3. În fiecare cameră sunt ascunse **4 obiecte cu probe**. Nu sunt marcate în
   niciun fel — copilul le caută singur, atingând obiectele din scenă.
   Butonul **🔍** le arată trei secunde, dacă se blochează (și tot el apare
   singur, discret, după un minut fără progres).
4. Fiecare probă rezolvată dă **o cifră** din codul lacătului.
5. La fiecare **4 cifre** adunate, apasă pe ușă și **învârte rolele
   lacătului** până apare codul.
6. Ușa se deschide după ultimul lacăt → **evadare!** 🎉

### Cât de lungă e o cameră

Din ecranul de start (sau din butonul de pe hartă) alegi câte probe are
fiecare cameră. Aceleași camere, doar mai multe lucruri de rezolvat:

| Opțiune | Probe | Lacăte | Obiecte în scenă |
|---------|-------|--------|------------------|
| 🐇 Scurtă | 4 | 1 | cele 4 obiecte mari |
| 🦊 Medie | 8 | 2 | + 4 obiecte de recuzită pe podea |
| 🐢 Lungă | 12 | 3 | + 8 obiecte de recuzită pe podea |

Lacătul are mereu 4 role. Într-o cameră lungă îl deschizi de mai multe ori,
pe rând, iar bara de jos arată la al câtelea lacăt ești.
6. La final: stele (1–3, în funcție de timp și de indiciile folosite),
   o curiozitate despre tema camerei și, când sunt gata toate camerele,
   o **diplomă printabilă** cu numele copilului.

Progresul (camere rezolvate, stele, cel mai bun timp) se salvează automat în
browser, pe dispozitivul respectiv.

---

## 🏰 Cele 10 lumi (100 de camere)

| # | Lume | Camere |
|---|------|--------|
| 1 | 🗝️ Lumea Clasică | Piramida Faraonului, Castelul Cavalerilor, Nava Spațială, Jungla Pierdută, Laboratorul Savantului, Corabia Piraților, Peștera de Gheață, Biblioteca Fermecată, Fabrica de Bomboane, Orașul Roboților |
| 2 | 🏙️ Orașul Nostru | Bucătăria Bunicii, Garajul, Brutăria, Stația de Pompieri, Gara, Supermarketul, Sala de Clasă, Cabinetul Doctorului, Oficiul Poștal, Parcul de Joacă |
| 3 | 🌿 Natura Sălbatică | Ferma, Cabana din Pădure, Stupina, Peștera Liliecilor, Vulcanul, Insula Pustie, Lacul cu Nuferi, Refugiul de pe Munte, Oaza din Deșert, Coliba din Deltă |
| 4 | 🛠️ Ateliere și Meserii | Fierăria, Olăria, Croitorul, Pictorul, Tipografia, Moara de Vânt, Tâmplarul, Frizeria, Cofetăria, Florăria |
| 5 | 🌍 În Jurul Lumii | Japonia, Maroc, Veneția, Londra, India, Vestul Sălbatic, Savana, Alpii, China, Mexic |
| 6 | 🧚 Tărâmul Poveștilor | Casa Vrăjitoarei, Turnul Prințesei, Bârlogul Balaurului, Coliba Piticilor, Palatul de Zăpadă, Atelierul Spiridușilor, Pădurea Fermecată, Moara Zmeului, Peștera lui Ali Baba, Corabia Zburătoare |
| 7 | 🔬 Știință și Tehnologie | Observatorul, Centrala Electrică, Stația Meteo, Sala Serverelor, Muzeul Dinozaurilor, Fabrica de Mașini, Planetariul, Atelierul de Drone, Mina de Cristale, Sera |
| 8 | 🏆 Sport și Joacă | Vestiarul, Sala de Sport, Patinoarul, Bazinul, Sala de Jocuri, Tabăra de Vară, Parcul de Distracții, Karting, Bowling, Sala de Karate |
| 9 | 🏛️ Lumi Străvechi | Cetatea Dacică, Villa Romană, Corabia Vikingilor, Castelul Samurailor, Templul Grecesc, Peștera Preistorică, Bazarul Otoman, Scriptoriul Mănăstirii, Farul Vechi, Templul Maya |
| 10 | 🕵️ Mister și Aventură | Casa Bântuită, Catacombele, Avionul Prăbușit, Baza Secretă, Mlaștina, Epava Scufundată, Hotelul Părăsit, Tunelul Metroului, Muzeul de Ceară, Biroul Detectivului |

Cele 10 camere din Lumea Clasică sunt desenate manual (`js/scenes.js`).
Celelalte 90 sunt construite de un **generator de scene** (`js/scenegen.js`)
din „rețete”: perete, podea, iluminat, stil de ușă, paletă de culori și 4
obiecte alese dintr-o bibliotecă de peste 70 de obiecte desenate parametric.
Fiecare cameră are cuvintele ei pentru anagrame/coduri și curiozitățile ei
(`js/worlds.js`).

Diploma se primește cu toate cele 100 de camere rezolvate; titlul de pe ea
crește la 10, 30, 60 și 100 de camere, iar cele 10 stele de pe diplomă sunt
lumile terminate complet.

### 🎲 Camera Misterioasă

Modul aleatoriu **nu refolosește niciodată** una dintre cele 10 camere de mai
sus. Are cinci locuri numai ale lui, care nu apar nicăieri altundeva în joc:

| Loc | Temă |
|-----|------|
| 🌀 Camera Portalului | portal, cristale, rune |
| ⏳ Atelierul Ceasornicarului | ceasuri, pendul, rotițe |
| 🐙 Submarinul Abisal | sonar, hublou, adâncuri |
| 🚂 Vagonul de Noapte | tren, peisaj nocturn, frână |
| 🎪 Circul Magic | arenă, trapez, tun de circ |

La fiecare joc se alege unul dintre ele și un set nou de probe.

### Codurile de cameră (util la școală)

Fiecare cameră misterioasă are un **cod de 5 caractere** (ex. `KM4T9`).
Cine introduce același cod primește **exact aceeași cameră**, cu exact
aceleași probe — perfect pentru o clasă întreagă care lucrează pe echipe.

- pe hartă: butonul **„🔑 Joacă un cod de cameră”**
- sau direct printr-un link: `.../index.html#cod=KM4T9`

---

## 🧩 Tipurile de probe

Toate probele se generează din nou la fiecare joc, deci aceeași cameră
nu se joacă niciodată identic:

- **Calcule** — adunări, scăderi, înmulțiri, împărțiri, ordinea operațiilor
- **Ghicitori** clasice românești
- **Cultură generală practică** — siguranță pe stradă și acasă, sănătate, bani,
  internet, reciclare (nu istorie, date sau definiții)
- **Șiruri de numere** — găsește regula și continuă
- **Numărare vizuală** — câte forme sunt în imagine
- **Ceasul** — citirea orei pe cadran analogic
- **Geometrie** — figuri, laturi, perimetru, arie
- **Probleme cu bani** — cumpărături și rest
- **Găsește intrusul** — gândire logică
- **Anagrame** tematice
- **Mesaje cifrate** — simboluri sau A=1, B=2, C=3…
- **Ordonare** de numere, crescător sau descrescător
- **Potriviri** — perechi (țară–capitală, animal–pui etc.)
- **Proverbe** — completează cuvântul lipsă

### Mecanisme, nu doar întrebări

Patru dintre probe nu se rezolvă tastând un răspuns, ci umblând efectiv cu
mâna la un mecanism (merg la fel cu mouse-ul și cu degetul pe ecran):

- **🔐 Seiful cu cifru** — discul se rotește cu săgețile sau trăgând direct de
  el, stânga-dreapta, și trebuie oprit pe numerele cerute, în ordine.
- **🎚️ Panoul cu manete** — trei manete pe care le tragi în sus și în jos până
  arată rezultatul calculului scris sub fiecare.
- **⚖️ Balanța** — pui și iei greutăți de pe taler, iar brațul balanței se
  înclină în timp real până când cele două părți sunt egale.
- **🔒 Lacătul final** — patru role de cifru pe care le învârți (săgeți, tragere
  cu degetul sau săgețile de la tastatură).

---

## 🚀 Publicare pe GitHub Pages

1. Creează un repository nou pe GitHub (poate fi public).
2. Încarcă **tot conținutul acestui folder** (fișierul `index.html` trebuie
   să fie în rădăcina repository-ului, nu într-un subfolder).
3. În repository: **Settings → Pages**.
4. La *Source* alege **Deploy from a branch**, iar la *Branch* alege
   `main` și folderul `/ (root)`. Apasă **Save**.
5. După 1–2 minute, jocul este live la adresa:
   `https://<numele-tău>.github.io/<numele-repo>/`

Din linia de comandă:

```bash
git init
git add .
git commit -m "Evadarea Magica - joc escape room pentru copii"
git branch -M main
git remote add origin https://github.com/UTILIZATOR/NUME-REPO.git
git push -u origin main
```

Fișierul `.nojekyll` din folder îi spune GitHub Pages să servească fișierele
așa cum sunt, fără procesare suplimentară.

---

## 💻 Rulare locală

Cel mai simplu: **dublu-click pe `index.html`**. Jocul merge direct din
fișier, fără server.

Dacă vrei totuși un server local (util în timpul dezvoltării):

```bash
python -m http.server 8123
```

apoi deschide `http://localhost:8123`.

---

## 📁 Structura fișierelor

```
index.html          structura paginii și cele 5 ecrane
.nojekyll           pentru GitHub Pages
css/
  styles.css        tot designul, animațiile și varianta pentru telefon
js/
  utils.js          funcții ajutătoare, confetti, salvarea progresului
  audio.js          sunetele și muzica (sintetizate, fără fișiere audio)
  data.js           ghicitorile, întrebările, proverbele, curiozitățile
  puzzles.js        generatoarele celor 14 tipuri de probe
  scenes.js         cele 15 ilustrații SVG desenate manual (lumea 1 + camera misterioasă)
  scenegen.js       generatorul de scene pentru lumile 2–10 (obiecte, uși, pereți)
  worlds.js         cele 90 de camere din lumile 2–10 (rețete, cuvinte, curiozități)
  rooms.js          lista completă a camerelor, lumile și camera aleatorie
  game.js           motorul jocului (ecrane, lacăt, stele, diplomă)
  auth.js           formularul de login, verificarea conturilor și sesiunea
  main.js           pornirea jocului
tests/
  auth.browser.cjs  verificarea loginului și a progresului separat pe cont
.claude/
  launch.json       doar pentru dezvoltare locală (ignorat de GitHub Pages)
```

---

## ✏️ Cum adaugi conținut

**O ghicitoare nouă** — în `js/data.js`, în lista `GHICITORI`:

```js
{ lv: 2, q: 'Întrebarea ta?', a: 'Răspunsul', w: ['Greșit 1', 'Greșit 2', 'Greșit 3'] },
```

`lv` este nivelul: `1` = clasa I–II, `2` = clasa a III-a, `3` = clasa a IV-a.
La fel se adaugă în `CULTURA` (cultură generală) și `PROVERBE`.

**Cuvinte noi pentru anagrame și coduri** — în `CUVINTE`, la tema camerei:

```js
piramida: [ ['SFINX', 'Statuie uriașă cu cap de om'], ... ]
```

Folosește litere mari, fără diacritice.

**O cameră nouă** — în `js/worlds.js`, în lista `rooms` a unei lumi, cu
ajutorul funcțiilor `r(...)` (camera) și `sc(...)` (scena). Alegi peretele,
podeaua, lumina, ușa, culorile și 4 obiecte din `OBJ` (în `js/scenegen.js`),
plus 6 cuvinte și 3 curiozități. Scena se desenează singură.

**Ce probe apar într-o cameră** — câmpul `pool` al camerei (în `js/rooms.js`
pentru lumea 1, în `js/worlds.js` pentru celelalte). La fiecare joc se aleg
4 tipuri din acea listă.

**Cât de repede trebuie terminată camera pentru 3 stele** — câmpul `target`
(în secunde), tot în `js/rooms.js`.

---

## ♿ Detalii tehnice

- Funcționează pe telefon, tabletă și calculator (interfață adaptivă).
- Obiectele din cameră sunt accesibile și de la tastatură (Tab + Enter);
  în probe: cifrele scriu în tastatura numerică, `A`–`D` aleg variantele,
  `Enter` verifică, `Esc` închide.
- Sunetul e generat cu Web Audio API — nu există fișiere audio de descărcat.
- Se respectă `prefers-reduced-motion` (animațiile se opresc).
- Singura resursă externă sunt fonturile Google (Fredoka + Nunito);
  fără internet, jocul folosește fonturile de sistem și merge la fel.

## 🔑 Acces cu cont

Jocul afișează formularul de login înainte de pornire, inclusiv pentru linkurile
cu cod de cameră. Sunt configurate cele 20 de conturi user01–user20, cu
parolele distribuite separat de administrator. Numele contului este normalizat
la litere mici; parola este sensibilă la litere mari/mici și nu este ajustată.

Sesiunea se păstrează în sessionStorage, rezistă la reîncărcare și expiră după
8 ore. Butonul **Deconectare** închide sesiunea și oprește jocul. Dacă stocarea
sesiunii este blocată, accesul durează doar până la reîncărcarea paginii.
Progresul se salvează local, separat pe cont, pe acest browser și dispozitiv;
nu se sincronizează între dispozitive. Progresul vechi, fără cont, rămâne
neatins și nu este atribuit automat niciunui utilizator.

**Limită de securitate:** acesta este un login în browser pentru un site static
GitHub Pages, nu autentificare sau autorizare pe server. Codul, datele jocului
și verificatorii parolelor sunt publici, iar bariera poate fi ocolită din
instrumentele browserului. Hash-urile PBKDF2-SHA-256 (210.000 de iterații, salt
individual) evită parolele în clar în repository, dar nu fac private fișierele
și nu împiedică ghicirea offline, în special pentru parole atât de scurte.
Pentru conținut privat este necesar un backend cu sesiuni și verificări pe server.

Verificarea parolelor folosește Web Crypto: recomandat HTTPS (GitHub Pages)
sau un server local pe http://localhost:8123. Deschiderea prin file://
depinde de suportul Web Crypto al browserului.
### Verificarea loginului

Testul automat necesită Node.js, pachetul `playwright` și Microsoft Edge.
Instalează dependența de test cu `npm install --no-save --package-lock=false playwright`.
Setează variabila de mediu `LOGIN_TEST_PASSWORDS` la un șir JSON cu cele 20 de
parole, în ordinea user01–user20, apoi rulează `node tests/auth.browser.cjs`.
Nu salva parolele în fișiere urmărite de Git. Pentru Google Chrome, setează
`TEST_BROWSER_CHANNEL=chrome`; implicit testul folosește `msedge`.

Testul pornește propriul server local și verifică toate conturile, credențialele
greșite, linkurile cu cod de cameră, refreshul, deconectarea, progresul separat,
sesiunile expirate sau invalide, afișarea pe telefon și stocarea blocată.
