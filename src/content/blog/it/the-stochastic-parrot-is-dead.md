---
title: Il pappagallo stocastico è morto (e a ucciderlo è stata la sua stessa mappa)
excerpt: Per anni li abbiamo liquidati come "pappagalli stocastici". Poi abbiamo guardato dentro la scatola nera. Ecco cosa abbiamo trovato.
publishDate: 2026-06-26
tags:
  - ai
  - artificial-intelligence
  - llm
  - ai-reasoning
image: /assets/blog/the-stochastic-parrot-is-dead/8fd8a1516b21.png
lang: it
notionId: 38ba9c08-e476-808f-8a3c-f6b5991cb2ac
---

C'è una frase che per anni ha funzionato come un'arma definitiva contro l'entusiasmo per i modelli linguistici. La trovi nei thread su X, nelle slide dei convegni, nelle conversazioni a cena con l'amico ingegnere che vuole tenerti coi piedi per terra: "sono solo pappagalli stocastici". Punto. Fine della discussione.


L'espressione non è uno slogan da bar. Nasce in un articolo accademico preciso, _On the Dangers of Stochastic Parrots_, firmato nel 2021 da Emily Bender, Timnit Gebru, Angelina McMillan-Major e Margaret Mitchell. La tesi, ridotta all'osso, era questa: un modello linguistico cuce insieme sequenze di forme linguistiche che ha visto nei suoi dati, secondo informazioni probabilistiche su come quelle forme si combinano, ma senza alcun riferimento al significato. Fluente, sì. Comprensivo, no. Un pappagallo molto sofisticato che ripete suoni senza sapere cosa vogliono dire.


Per qualche tempo è stata una descrizione onesta. Il problema è che la ricerca degli ultimi due anni l'ha resa difficile da sostenere. E il modo migliore che ho trovato per raccontare perché è un'immagine che ho incontrato leggendo un capitolo di Nello Cristianini intitolato _Il catalogo universale_: l'idea che, mentre imparavano a indovinare la parola successiva, questi modelli si siano costruiti dentro qualcosa che assomiglia a una mappa del mondo.


## Una prima crepa: le mappe nascoste


Partiamo da un risultato che a me ha fatto un certo effetto. Nel 2024, due ricercatori del MIT, Wes Gurnee e Max Tegmark, pubblicano un articolo dal titolo asciutto: _Language Models Represent Space and Time_. Vanno a frugare dentro Llama-2, uno dei modelli open di quel periodo, e si chiedono una cosa semplice: questo sistema, addestrato solo su testo, ha un'idea di dove si trovano le cose nel mondo?


La risposta è sì, e in un modo più ordinato del previsto. Da qualche parte negli strati interni della rete ci sono gruppi di neuroni le cui attivazioni corrispondono alle coordinate geografiche di un luogo. Dai al modello "Statua della Libertà" o "Central Park" e, leggendo solo quei segnali interni, riesci a ricostruire la posizione sulla mappa. Non una mappa perfetta, ma riconoscibile: alcune direzioni codificano il nord-sud, altre l'est-ovest. Lo stesso vale per il tempo, con date e personaggi storici disposti lungo qualcosa che somiglia a una linea cronologica.


Qui il punto non è la geografia in sé. Il punto è che nessuno ha messo a mano quelle coordinate. Sono emerse da sole, durante l'addestramento, come effetto collaterale del compito di predire parole. Per un sistema che dovrebbe limitarsi a contare correlazioni superficiali tra simboli, è un comportamento curioso. Assomiglia molto di più a quello che faresti tu se cercassi di organizzare le informazioni per usarle meglio: invece di memorizzare ogni fatto isolato, costruisci un sistema di coordinate dove i fatti stanno al loro posto.


## Il catalogo


La crepa diventa una voragine quando entra in scena Anthropic, l'azienda che sviluppa Claude. Nel maggio 2024 il loro team di interpretabilità, guidato da Chris Olah, pubblica uno studio dal titolo che è già un programma: _Scaling Monosemanticity_ (in versione divulgativa, _Mapping the Mind of a Large Language Model_). È, a quanto risulta, la prima volta che qualcuno guarda dentro un modello di produzione di quelle dimensioni e ne esce con qualcosa di leggibile.


Il metodo parte da un'intuizione che vale la pena spiegare, perché è controintuitiva. Si chiama "principio della sovrapposizione". L'idea è che se vuoi che una rete conosca molti più concetti di quanti neuroni possiede, sei costretto a rappresentarli non con neuroni singoli ma con combinazioni di neuroni che si accendono insieme. Anthropic chiama queste combinazioni _features_; Cristianini, nel suo capitolo, preferisce chiamarle "idee", in parte perché _feature_ in italiano suona male, in parte come omaggio al primo articolo mai scritto sulle reti neurali, quello di McCulloch e Pitts del 1943, che già nel titolo parlava di "idee immanenti all'attività nervosa". L'analogia che si usa spesso è chimica: i neuroni sono gli atomi, i gruppi di neuroni sono le molecole. Un livello di descrizione nuovo, dove il significato non sta nella singola unità ma nell'insieme.


Usando una tecnica chiamata sparse autoencoder, i ricercatori hanno estratto milioni di queste idee dallo strato centrale di Claude 3 Sonnet. E hanno scoperto due cose che ribaltano la storia del pappagallo.


La prima: tante idee corrispondono a concetti precisi e a volte sorprendentemente astratti. C'è il celebre gruppo di neuroni che rappresenta il Golden Gate Bridge (quando i ricercatori lo hanno forzato al massimo, Claude ha iniziato a sostenere di _essere_ il ponte). Ma ci sono anche idee per Parigi, per il litio, per l'immunologia, e poi cose molto meno concrete: l'adulazione, la segretezza, il conflitto interiore, persino la differenza tra un bug accidentale in un programma e una backdoor messa lì apposta.


La seconda, e per me la più importante: la stessa idea si attiva indipendentemente da come la incontri. Il gruppo di neuroni di Parigi si accende se discuti del governo francese in inglese, se leggi del Louvre in un documento in tedesco, se ti mostrano una foto della Torre Eiffel. Quei neuroni non rispondono alla forma dello stimolo. Rispondono al suo significato. Che è esattamente la cosa che, secondo l'accusa del 2021, ai modelli linguistici doveva mancare.


Anthropic ha pubblicato un inventario di milioni di queste rappresentazioni, di cui finora ne è stata studiata a mano solo una piccola parte. OpenAI ha fatto un lavoro analogo su GPT-4 e ne ha trovate sedici milioni, ammettendo che per mappare davvero tutto bisognerebbe arrivare a miliardi o trilioni di idee. Cristianini lo chiama, con una bella immagine, un "catalogo universale": qualcosa che questi sistemi hanno assemblato leggendo milioni di pagine, e che assomiglia a uno di quegli atlanti antichi, sbagliati nelle proporzioni, con interi continenti mancanti, eppure già attraversati dall'ambizione di cartografare il mondo.


## Una lista di luoghi non è una mappa


Qui però bisogna stare attenti, perché si potrebbe obiettare: avere un magazzino ben organizzato di concetti non vuol dire saperli usare. Un dizionario non pensa. È un'obiezione giusta, ed è anche il punto dove la ricerca più recente colpisce più duro.


Nel marzo 2025 Anthropic pubblica un secondo lavoro, _On the Biology of a Large Language Model_, in cui non si limita a elencare le idee ma traccia i circuiti, cioè il modo in cui queste idee si attivano e si inibiscono a vicenda per arrivare a una conclusione. È qui che il pappagallo perde definitivamente le penne. Tre esempi, perché valgono più di mille argomenti astratti.


Il primo è la poesia, ed è il mio preferito perché i ricercatori partivano dall'ipotesi opposta. Volevano dimostrare che il modello _non_ pianifica. Prendi un distico in cui la seconda riga deve rimare e avere senso. L'aspettativa era che Claude scrivesse parola per parola e si preoccupasse della rima solo all'ultimo momento. Invece no. Prima ancora di cominciare la seconda riga, il modello "pensa" alla parola con cui vuole chiuderla (per esempio _rabbit_) e poi costruisce la frase per arrivarci. La prova che sia davvero così è elegante: se i ricercatori cancellano dall'interno il concetto di _rabbit_, il modello ripiega su un'altra rima sensata (_habit_); se gli iniettano il concetto di "verde", scrive una riga diversa che finisce con _green_. Un pappagallo che ripete suoni non ha un piano. Questo ce l'ha, e per giunta lo sa adattare al volo.


Il secondo è il ragionamento a più passi. Chiedi a Claude la capitale dello stato in cui si trova Dallas. Un sistema che "regurgita" risposte memorizzate sputerebbe direttamente "Austin". Claude invece, all'interno, attiva prima l'idea "Dallas si trova in Texas" e poi, collegata, l'idea "la capitale del Texas è Austin". Sta combinando due fatti indipendenti. E la dimostrazione, di nuovo, è chirurgica: se durante il calcolo i ricercatori sostituiscono il concetto "Texas" con "California", la risposta cambia in "Sacramento". C'è una catena causale, non un riflesso.


Il terzo è l'aritmetica mentale. Claude non è una calcolatrice e non ha imparato l'algoritmo che ci insegnano a scuola. Eppure somma. Come? Usa due strade in parallelo: una stima approssimativa del risultato e un calcolo preciso dell'ultima cifra, che poi si combinano. La cosa più curiosa è che se gli chiedi _come_ ha fatto, ti descrive il vecchio metodo con il riporto, quello che ha visto spiegare nei testi. La spiegazione che dà di sé è falsa: dentro succede un'altra cosa. Il che è interessante per due ragioni opposte. Da un lato conferma che non sta recitando a memoria, perché la strategia interna è genuinamente sua. Dall'altro ci ricorda che questi sistemi non hanno un accesso affidabile ai propri meccanismi, il che dovrebbe raffreddare gli entusiasmi più facili.


C'è un quarto risultato che chiude il cerchio con le mappe di prima. Quando chiedi a Claude "il contrario di piccolo" in lingue diverse, si attivano gli stessi nuclei di neuroni per i concetti di "piccolezza" e di "opposto", che insieme accendono il concetto di "grandezza", il quale solo alla fine viene tradotto nella lingua della domanda. È come se sotto le lingue ci fosse uno spazio condiviso, una specie di "lingua del pensiero", in cui il significato esiste prima di diventare parole. Non un pappagallo francese e uno cinese che lavorano in parallelo, ma un nucleo concettuale unico.


## Perché tutto questo potrebbe non essere un caso


A questo punto sorge una domanda quasi filosofica. Se modelli diversi, addestrati da aziende diverse con architetture diverse, costruiscono mappe interne simili, cosa stanno mappando esattamente?


Un gruppo di ricercatori, sempre con Tegmark tra gli autori, ha proposto una risposta affascinante che hanno battezzato "ipotesi della rappresentazione platonica". L'osservazione di partenza è che, man mano che i modelli diventano più grandi e più bravi, le loro rappresentazioni interne tendono a convergere, e questo accade perfino tra modelli che lavorano su modalità diverse, testo e immagini. La spiegazione che propongono è che tutti questi sistemi stiano catturando, ciascuno per la sua strada, la stessa struttura sottostante: la realtà, più o meno com'è fatta. Da qui il nome platonico, in omaggio all'idea che esista una forma ideale delle cose che i diversi modelli approssimano. È una congettura, va detto, con i suoi controesempi e i suoi limiti. Ma se anche fosse parzialmente vera, ci direbbe che quelle mappe non sono arredamento casuale: sono tentativi di rappresentare il mondo.


## Quello che il pappagallo aveva capito


Sarebbe disonesto chiudere in trionfo, perché l'immagine del pappagallo non era stupida e qualcosa l'aveva colto.


Le mappe interne sono incomplete e distorte. Anthropic stessa ammette che nel suo autoencoder più grande mancano la maggior parte dei quartieri di Londra; non tutti gli elementi della tavola periodica e non tutti i paesi del mondo hanno una loro idea dedicata. Decifrare queste rappresentazioni si fa ancora a mano, è lento e costoso, e per ora abbiamo letto solo la punta dell'iceberg. Soprattutto, questi modelli sbagliano in modi che tradiscono la loro natura: lo stesso studio sui circuiti mostra che le allucinazioni nascono quando il meccanismo che dovrebbe dire "non lo so" viene zittito per errore, e che a volte Claude costruisce un ragionamento plausibile all'indietro, partendo dalla risposta che vuole dare. Non è comprensione nel senso pieno e incarnato che intendiamo per gli esseri umani.


Ma "non è comprensione umana" è una tesi diversa, e molto più ragionevole, di "è un pappagallo che ripete suoni a caso". L'esistenza di milioni di rappresentazioni distinte, di piani che precedono la scrittura, di catene di inferenza che si possono interrompere e deviare a comando, chiude la questione nella sua forma originale. Sotto le risposte non ci sono solo relazioni statistiche superficiali. C'è una struttura.


Cristianini, nel suo capitolo, apre con uno slogan che fisici e biologi conoscono da sempre, _More Is Different_, coniato da Philip Anderson nel 1972: cambiando la scala di un sistema se ne cambia la natura. Certe proprietà esistono solo quando il tutto è abbastanza grande e complesso, e non si riducono al comportamento delle singole parti. AlphaZero aveva venti milioni di parametri; Claude ne ha circa quattrocento miliardi. Da qualche parte, lungo quella scalata vertiginosa, è successo qualcosa che il vocabolario del "pappagallo" non sa più descrivere.


Forse il modo più onesto di dirlo è questo: non sappiamo ancora bene cosa siano questi sistemi. Sappiamo però, ormai con prove alla mano, cosa non sono. E il pappagallo, per quanto ci sia stato utile per qualche anno a non perdere la testa, possiamo lasciarlo andare.


---


### Per approfondire

- E. M. Bender, T. Gebru, A. McMillan-Major, M. Mitchell, _On the Dangers of Stochastic Parrots: Can Language Models Be Too Big?_, FAccT 2021.
- W. Gurnee, M. Tegmark, _Language Models Represent Space and Time_, ICLR 2024.
- Anthropic, _Mapping the Mind of a Large Language Model_ e il paper _Scaling Monosemanticity: Extracting Interpretable Features from Claude 3 Sonnet_, 2024.
- Anthropic, _Tracing the Thoughts of a Large Language Model_ e _On the Biology of a Large Language Model_, 2025.
- M. Huh, B. Cheung, T. Wang, P. Isola, _The Platonic Representation Hypothesis_, ICML 2024.
- Spunto e cornice narrativa: Nello Cristianini, capitolo _Il catalogo universale_.
