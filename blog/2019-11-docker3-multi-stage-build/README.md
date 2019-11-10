---
title: "[Docker Serie 4/4] Multi-Stage Builds oder: Immer die Build-Umgebung dabei haben"
author: Michael Kaaden
mail: blog@kaaden.net
published: 2019-11-30
keywords:
  - Docker
  - Multi-Stage Builds
language: de
thumbnail: TODO.jpg
hidden: true 
---

TODO Intro: In diesem Teil...

Sie finden den Code zum Artikel auf
[GitHub](https://github.com/MichaelKaaden/dockerized-app/tree/master/Part-3-Multi-Stage-Build).

In Teil I dieser Artikelserie haben Sie gelernt, wie Sie Ihre Angular-App in ein Docker-Image verpacken und in einem Container zur Ausführung bringen können.

In Teil II haben wir uns damit beschäftigt, die Konfiguration der Angular-App mit Docker-Mitteln vorgeben zu können.

In diesem letzten Teil der Serie kümmern wir uns darum, die Build-Umgebung deskriptiv in Ihr jeweiliges Projekt einzubinden und somit über die Projektlaufzeit hinweg unter Ihrer Kontrolle zu halten.

---

## Interne und externe Abhängigkeiten

Kennen Sie das? Sie entwickeln ein Projekt nach allen Regeln der Ingenieurskunst durch, übergeben es dem Betrieb oder dem Kunden – und dann fassen Sie es solange nicht mehr an, bis sich jemand bei Ihnen meldet und nach Änderungen verlangt.

Das ist dann der Moment, an dem Sie den Staub vom Projekt pusten und sich vielleicht als erstes fragen, wie Sie das damals gebaut haben.
Beschränken wir uns auf TypeScript- oder JavaScript-Projekte, dann haben Sie vielleicht in der Sektion `scripts` in der `package.json` das entsprechende Kommando hinterlegt.
Vielleicht müssen Sie auch ins `gulpfile.js` schauen.

Haben Sie sich besonnen und den Build angestoßen, stürzt Gulp unerwartet mit einer C++-Exception ab, und Sie fangen an, auf Google nach der Ursache zu suchen.
Sie stellen dann fest, dass es wohl daran liegt, dass Sie derzeit mit Node.js in Version 10 entwickeln, damals aber... Hm, war es Version 8 oder gar noch Version 6?
Und schon laden Sie beide Versionen herunter und probieren herum.
Schnell ist dann die erste Stunde investiert, ohne dass Sie produktiv gewesen wären. Dabei ist Zeit doch Geld...

Was ist schief gelaufen? Sie haben nicht beachtet, dass Sie es in Ihrem Projekt nicht nur mit _internen_ Abhängigkeiten zu tun haben, die Sie fein säuberlich in der `package.json` aufführen, sondern auch mit _externen_ Abhängigkeiten, etwa der eingesetzten Node.js-Version.

## Externe Abhängigkeiten handhaben

Natürlich gibt es Lösungen, um mehrere Versionen von Node.js gleichzeitig auf Ihrem Rechner vorzuhalten und zwischen diesen zu wechseln, etwa mit Tools wie [n](https://github.com/tj/n) oder [nvm](https://github.com/creationix/nvm), aber das ist gar nicht mein Punkt. 
Der Punkt ist, dass Sie _daran denken_ müssen, jeweils auf die richtige Version umzustellen, wenn Sie zwischen Ihren Projekten wechseln.

Auf Ihrem Build-Server, etwa [Jenkins](https://jenkins.io/) oder Gitlab CI, können Sie für jedes Projekt eine individuelle Umgebung vorgeben.
Projekt A baut dann mit Node.js in Version 10, während das ältere Projekt B mit Node.js 6 erstellt wird.
Das ist eine tolle Sache, hilft Ihnen auf Ihrem Entwicklungsrechner aber nicht weiter.
Die Idee ist jedoch die Richtige: Wir müssen die Build-Umgebung für das Projekt festlegen und einhalten, auch auf dem Entwicklungssystem.

## Docker To The Rescue

Warum bauen wir die App nicht einfach von einem Docker-Container aus? Dank des Containers hätten wir feingranulare Kontrolle über die zu verwendende Node.js- und NPM-Version sowie das weitere Tooling, und all das könnten wir mittels eines Dockerfiles in unserem Projekt ablegen und zusammen mit dem Projekt versionieren.

Die Antwort ist ganz einfach: Das würde prima funktionieren, nur leider würde das dabei entstehende Image sehr groß -- schließlich sind alle Tools und das komplette `node_modules`-Verzeichnis Teil des Images, obwohl Sie diese nach dem erfolgreichen Build nicht mehr benötigen.
Alleine das Verzeichnis `node_modules` einer Angular-App ist schon fast 500 MB groß.
Zusammen mit Google Chrome für die Unit Tests und Node.js sind Sie somit bei rund 1 GB pro Image.
Und Sie wissen ja: Uns reicht ein nginx-Image mit der Kopie des Verzeichnisses `dist/<meine app>`, das lediglich rund 100 MB groß wäre.

Damit ist unser Plan klar: Wir bauen die App trotzdem innerhalb eines Containers und erzeugen aus dem Ergebnis ein neues, minimales Image.
Zu unserem Glück ist das ein Problem, das nicht nur uns beschäftigt, sodass Docker eine Lösung für genau diesen
Anwendungsfall bietet: den sog. _Multi-Stage Build_.

## Multi-Stage Builds

Multi-Stage Builds kaskadieren den Build mehrerer Images und kopieren dabei Daten vom Vorgänger in den Nachfolger. 
Lediglich das letzte Image ist dabei das Ergebnis, die Vorgänger spielen keine Rolle mehr (werden aber gecachet, um den nächsten Build zu beschleunigen).
Letzten Endes können Sie sich das wie bei Prozessen und Pipes unter UNIX vorstellen: Die Ausgabe vom Vorgänger landet im Nachfolger.

In unserem Fall muss das erste Image die App bauen, während das zweite die erzeugte App aufnimmt.
Daher muss das erste Image Node.js, NPM, Angular CLI und Google Chrome enthalten.
Das zweite Image ist identisch mit dem, das wir in den bisherigen Teilen der Artikelserie entwickelt haben.
Es bezieht die App aber aus dem ersten Image statt aus dem lokalen Verzeichnis `dist`.

Soviel zum Plan, nun setzen wir das Ganze um.
Als erstes müssen wir unser `.dockerignore` bereinigen, denn nun legen wir sehr
wohl Wert auf alle Dateien und Verzeichnisse, die wir brauchen, um unsere App zu
erstellen. Andererseits benötigen wir jetzt das Verzeichnis `dist` nicht mehr, das zuvor noch essentiell für uns war, denn wir bauen die Anwendung ja nun nicht mehr lokal, sondern im Container.

```
.editorconfig
.git
.gitignore
.idea
README.md
coverage
dist
node_modules
```

Außerdem müssen wir die Datei `src/karma.conf.js` anpassen, damit Google Chrome im Headless Mode in einem Container unter Debian GNU/Linux funktioniert.
Fügen Sie dazu im Abschnitt `config.set({...})` folgendes hinzu:

```
customLaunchers: {
   ChromeHeadlessNoSandbox: {
       base: "ChromeHeadless",
       flags: ["--no-sandbox"],
   },
},
```

Hintergrund ist, dass wir das Sandboxing ausschalten müssen, damit die Tests
ausgeführt werden.
Da Sie selbst den Container unter Kontrolle haben, sollte dieses Risiko akzeptabel sein.

Als nächstes müssen wir unser `Dockerfile` erweitern:

```dockerfile
FROM node:10-alpine as node

RUN npm install -g @angular/cli

# Install the latest Chromium package
RUN echo @edge http://nl.alpinelinux.org/alpine/edge/community >> /etc/apk/repositories \
    && echo @edge http://nl.alpinelinux.org/alpine/edge/main >> /etc/apk/repositories \
    && apk add --no-cache \
    chromium@edge \
    harfbuzz@edge \
    nss@edge \
    && rm -rf /var/cache/*

# Add Chrome as a user
RUN mkdir -p /usr/src/app \
    && adduser -D chrome \
    && chown -R chrome:chrome /usr/src/app

# Run Chrome non-privileged
USER chrome

ENV CHROME_BIN=/usr/bin/chromium-browser \
    CHROME_PATH=/usr/lib/chromium/

# Copy the app into the image
WORKDIR /usr/src/app
COPY . ./

# Install NPM dependencies
RUN yarn

# Make sure the unit tests work, then build the app
RUN ng test --watch=false --browsers=ChromeHeadlessNoSandbox && ng build --prod

# Stage 2
FROM nginx

LABEL maintainer="Ihr Name <you@your.domain>"

COPY nginx/default.conf /etc/nginx/conf.d
COPY --from=node /usr/src/app/dist/dockerized-app /usr/share/nginx/html
```

Eine kurze Erklärung dazu: Dieses Dockerfile basiert auf einem Image mit Node.js 10 und legt darin die Angular CLI und den Chromium-Browser ab.
Anschließend baut es die App, genau so, wie wir es bisher von Hand getan haben – na, nicht ganz, wir lassen nun die Tests laufen, denn das gehört doch sicher auch bei Ihnen dazu, nicht wahr?
Ansonsten kommentieren Sie die Zeile `RUN ng test ...` einfach aus.
Im zweiten Schritt (gekennzeichnet durch den Kommentar "Stage 2") kopiert Docker die fertiggestellte App aus dem ersten Image in das zweite.

Die entscheidenden Stellen sind `FROM node:10-alpine as node`, die die Bezeichnung `node` für das erste Image vorgibt, und `COPY --from=node ...`, die unter Verwendung dieser Bezeichnung aus dem ersten in das zweite Image kopiert.

Jetzt entfernen wir noch den Build der App aus dem Skript `dockerize.sh`, da sich das `Dockerfile` ab jetzt um diesen Schritt kümmert:

```bash
#!/bin/bash
docker build -t dockerized-app .
```

## Das Image bauen

Um das Image mit der App zu bauen, gehen wir genauso vor wie bisher: Wir führen erst `dockerize.sh` aus und dann `redeploy.sh`. Hier ein Beispiellauf:

```console
$ ./dockerize.sh
Sending build context to Docker daemon  375.3kB
Step 1/14 : FROM node:10-alpine as node
 ---> 94f3c8956482
Step 2/14 : RUN npm install -g @angular/cli
 ---> Using cache
 ---> fa482a783256
Step 3/14 : RUN echo @edge http://nl.alpinelinux.org/alpine/edge/community >> /etc/apk/repositories     && echo @edge http://nl.alpinelinux.org/alpine/edge/main >> /etc/apk/repositories     && apk add --no-cache     chromium@edge     harfbuzz@edge     nss@edge     && rm -rf /var/cache/*
 ---> Using cache
 ---> 5564ed996f5f
Step 4/14 : RUN mkdir -p /usr/src/app     && adduser -D chrome     && chown -R chrome:chrome /usr/src/app
 ---> Using cache
 ---> 4386166be7c2
Step 5/14 : USER chrome
 ---> Using cache
 ---> 7cb58fa5c1a2
Step 6/14 : ENV CHROME_BIN=/usr/bin/chromium-browser     CHROME_PATH=/usr/lib/chromium/
 ---> Using cache
 ---> d6ebad5eb164
Step 7/14 : WORKDIR /usr/src/app
 ---> Using cache
 ---> 13013d263739
Step 8/14 : COPY . ./
 ---> dc4a22077f73
Step 9/14 : RUN yarn
 ---> Running in 6437e5fa60d9
yarn install v1.13.0
[1/4] Resolving packages...
[2/4] Fetching packages...
info fsevents@1.2.7: The platform "linux" is incompatible with this module.
info "fsevents@1.2.7" is an optional dependency and failed compatibility check. Excluding it from installation.
[3/4] Linking dependencies...
[4/4] Building fresh packages...
Done in 42.82s.
Removing intermediate container 6437e5fa60d9
 ---> 90e56dd32b15
Step 10/14 : RUN ng test --watch=false --browsers=ChromeHeadlessNoSandbox && ng build --prod
 ---> Running in d1ddaffc16cb
13 03 2019 21:00:50.648:INFO [karma-server]: Karma v4.0.1 server started at http://0.0.0.0:9876/
13 03 2019 21:00:50.650:INFO [launcher]: Launching browsers ChromeHeadlessNoSandbox with concurrency unlimited
13 03 2019 21:00:50.669:INFO [launcher]: Starting browser ChromeHeadless
13 03 2019 21:00:53.547:INFO [HeadlessChrome 72.0.3626 (Linux 0.0.0)]: Connected on socket 3N6EMwCRhxGyDnspAAAA with id 6433480
HeadlessChrome 72.0.3626 (Linux 0.0.0): Executed 7 of 7 SUCCESS (0.236 secs / 0.224 secs)
TOTAL: 7 SUCCESS
TOTAL: 7 SUCCESS

Date: 2019-03-13T21:01:17.137Z
Hash: b37badaa2a2a81628c08
Time: 18579ms
chunk {0} runtime.a5dd35324ddfd942bef1.js (runtime) 1.41 kB [entry] [rendered]
chunk {1} es2015-polyfills.4a4cfea0ce682043f4e9.js (es2015-polyfills) 56.4 kB [initial] [rendered]
chunk {2} main.93dfc87f5d440cbc16ac.js (main) 262 kB [initial] [rendered]
chunk {3} polyfills.9f3702a215d30daac9b6.js (polyfills) 41 kB [initial] [rendered]
chunk {4} styles.3ff695c00d717f2d2a11.css (styles) 0 bytes [initial] [rendered]
Removing intermediate container d1ddaffc16cb
 ---> 2827acaf8241
Step 11/14 : FROM nginx
 ---> 42b4762643dc
Step 12/14 : LABEL maintainer="Michael Kaaden <github@kaaden.net>"
 ---> Using cache
 ---> e90650758b69
Step 13/14 : COPY nginx/default.conf /etc/nginx/conf.d
 ---> Using cache
 ---> 036bfc0c7c36
Step 14/14 : COPY --from=node /usr/src/app/dist/dockerized-app /usr/share/nginx/html
 ---> 990a8e08cc46
Successfully built 990a8e08cc46
Successfully tagged dockerized-app:latest
```

Wenn Sie das Meldungspaar "Successfully built .../Successfully tagged ..." sehen, haben Sie es geschafft: Der Multi-Stage Build hat geklappt.
Führen Sie Ihren Container nun aus:

```console
$ ./redeploy.sh
Removing network dockerized-app_default
WARNING: Network dockerized-app_default not found.
Creating network "dockerized-app_default" with the default driver
Creating dockerized-app_web_1 ... done
```

Der so erzeugte Container sollte nun genauso funktionieren wie der aus dem vorigen Teil dieser Artikelserie.
Die Verbesserung besteht jetzt darin, dass Sie alles, was Sie zum Build benötigen, in Ihrem Projekt beschreiben und das in Ihrer Quellcodeverwaltung mit versionieren können.
Sie haben dadurch keinen Performance-Nachteil, da Docker den ersten Stage cachet – lediglich der zweite Stage muss jedes Mal erstellt werden, wenn Sie etwas an Ihrer App ändern.

## Vergleich

Hier ein Größenvergleich der Images, die wir in jedem der drei Teile der
Artikelserie erstellt haben.

```
| REPOSITORY                | TAG    | IMAGE ID     | CREATED            | SIZE  |
| ------------------------- | ------ | ------------ | ------------------ | ----- |
| dockerized-app-simple     | latest | a90b35651f39 | 18 minutes ago     | 110MB |
| dockerized-app-env        | latest | 709da311ce4b | 17 minutes ago     | 110MB |
| dockerized-app-multistage | latest | 3ecfc4231dd5 | About a minute ago | 110MB |
```

Wie Sie sehen, gibt es keinen spürbaren Unterschied zwischen den Image-Größen.
Das ist natürlich kein Zufall: In den ersten beiden Teilen haben wir die App von Hand gebaut und das Verzeichnis `dist/dockerized-app` in das Image kopiert.
In diesem Teil der Artikelserie haben wir den Build in ein Image im ersten Stage verlagert und von dort aus kopiert.
Es war also zu erwarten, dass sich die Größe des finalen Images nicht ändert.

Spaßeshalber habe ich die Größe des ersten Stage des Multi-Stage Builds gemessen:

```
| REPOSITORY | TAG    | IMAGE ID     | CREATED        | SIZE  |
| ---------- | ------ | ------------ | -------------- | ----- |
| stage1     | latest | 19e76e412adc | 25 seconds ago | 989MB |
```

1 GB ist eine stolze Größe. Das Image existiert allerdings nur auf dem Buildsystem und nicht auf dem Produktivserver.
Würden wir unsere App mit diesem Image betreiben, hätten wir den zehnfachen Speicherbedarf...

## Fazit

Welche Methode sollten Sie also für Ihren Anwendungsfall wählen? Die Entscheidung ist meiner Meinung nach anhand der genannten Kriterien einfach zu treffen: 
Wenn Sie mit den `environment.ts`-Dateien auskommen, bleiben Sie bei der Lösung aus Teil I, um Ihre App in einen Container zu packen.
Möchten Sie die App in mehreren Umgebungen betreiben und deswegen die Konfiguration ändern, landen Sie automatisch bei der Lösung aus Teil II.
Und wenn es Ihnen wichtig ist, Ihre Build-Umgebung im Griff zu haben, verwenden Sie den Multi-Stage Build aus diesem Artikel, die Sie mit jeder der beiden zuvor genannten Methoden kombinieren können.

Wie auch immer Sie sich entscheiden: Sie werden schnell merken, wie angenehm es ist, Ihre App mit Docker zum Laufen zu bringen.

Und falls Sie sich doch einmal dafür entscheiden, einen Build Server wie Jenkins zu installieren und passend einzurichten, beschränkt sich Ihre finale Tätigkeit in jedem Projekt auf ein `git push`, woraufhin der Build Server die neueste Version Ihres Projekts auscheckt, den Multi-Stage Build auslöst und das Ergebnis
auf dem Zielsystem zum Laufen bringt.

Somit können Sie sich in Zukunft auf Ihre Kernkompetenzen beschränken und das tun, was Ihnen Spaß macht. Software entwickeln.
Um den Build und das Deployment kümmern sich Ihre Automatismen, die dank Docker unkompliziert einzurichten sind.
