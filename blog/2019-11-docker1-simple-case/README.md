---
title: "[Docker Serie 2/4] Angular-App über Docker bereitstellen"
author: Michael Kaaden
mail: blog@kaaden.net
published: 2019-11-30
keywords:
  - Docker
  - nginx
  - Build
  - docker-compose
language: de
thumbnail: TODO.jpg
hidden: true 
---

Sie finden den Code zum Artikel auf
[GitHub](https://github.com/MichaelKaaden/dockerized-app/tree/master/Part-1-Simple-Case).

Es ist ganz einfach, eine Angular-App zu "dockerisieren". Sie brauchen keinerlei
Code in Ihrer App zu ändern, um sie in einem Docker-Container zu betreiben. Sie
müssen lediglich die Dateien hinzufügen, die ich Ihnen in diesem Artikel
vorstelle.

## Konfiguration des Web-Servers

Als Web-Server werden wir [nginx](http://nginx.org/) verwenden. Keine Sorge,
wenn Sie diesen noch nie selbst benutzt, geschweige denn konfiguriert haben.
Erstellen Sie im Wurzelverzeichnis Ihrer App ein Verzeichnis namens `nginx` und
legen Sie darin eine Datei namens `default.conf` mit folgendem Inhalt an:

```nginx
server {
  listen 80;
  server_name localhost;

  location / {
    root /usr/share/nginx/html;
    index index.html;

    try_files $uri $uri/ /index.html;
  }
}
```

Im Wesentlichen besagt diese Konfiguration, dass der Web-Server _im Container_
auf Port 80 lauschen wird, die App im Verzeichnis `/usr/share/nginx/html`
abgelegt ist und jeder URL auf `/index` umgebogen ist. Im Betrieb können Sie den
Container auf jedem beliebigen Port Ihres Rechners betreiben. Dieser Port wird
dann an den Container-Port 80 weitergeleitet.

## Das Dockerfile

Als nächstes erstellen Sie ebenfalls im Wurzelverzeichnis Ihrer App eine Datei
namens `Dockerfile`. Docker verwendet diese Datei, um ein Image mit Ihrer App zu
erstellen.

```dockerfile
FROM nginx
LABEL maintainer="Ihr Name <you@your.domain>"
COPY nginx/default.conf /etc/nginx/conf.d
COPY dist/dockerized-app /usr/share/nginx/html
```

Diese Datei verwendet das jeweils neueste `nginx`-Image als Basis, setzt darin
Ihren Namen als den des Zuständigen, kopiert die Konfigurationsdatei und
schließlich Ihre Angular-App in das Image.

Falls Sie diese Anleitung mit Ihrer eigenen App nachvollziehen, setzen Sie für
`dist/dockerized-app` bitte das entsprechende Verzeichnis Ihrer App ein.

Damit könnten wir das Docker-Image nun bereits bauen.

Um den nötigen Zeitaufwand zum Bau zu verringern, sollten Sie eine
`.dockerignore`-Datei folgenden Inhalts erstellen, um zu verhindern, dass dabei
jedes Mal unnötige Dateien und Verzeichnisse an den Docker-Daemon übertragen
werden:

```
.dockerignore
.editorconfig
.git
.gitignore
.idea
README.md
angular.json
coverage
e2e
node_modules
package.json
package-lock.json
src
tsconfig.json
tslint.json
yarn.lock
```

## Das Build-Skript

Das Docker-Image mit Ihrer App können Sie nun erstellen, indem Sie folgende
Beschwörungsformeln in der angegebenen Reihenfolge murmeln: `yarn install` (oder
`npm install`, wenn Sie Ihre Pakete stattdessen mit `npm` verwalten), `ng build
--prod` und schließlich `docker build -t dockerized-app .` (bitte vergessen Sie
den Punkt am Ende nicht!). Auch hier sollten Sie das `dockerized-app` durch den
Namen Ihrer App ersetzen, denn unter diesem Namen legt Docker das Image auf
Ihrem Rechner ab.

Ich bin ein großer Fan davon, all die Schritte zu automatisieren, die ich
ständig wiederholen muss. Deshalb habe ich diese Schritte in einem
`dockerize.sh`-Skript zusammengefasst:

```bash
#!/bin/bash
yarn install
ng build --prod
docker build -t dockerized-app .
```

Sollten Sie statt auf macOS oder Linux auf Windows unterwegs sein, müssen Sie
stattdessen ein Batch-File oder ein PowerShell-Skript mit entsprechender Syntax
verwenden.

Am besten ist es, wenn Sie das Skript gleich ausprobieren. Bei mir sieht das so
aus:

```console
$ ./dockerize.sh
yarn install v1.13.0
[1/4] 🔍  Resolving packages...
success Already up-to-date.
✨  Done in 0.41s.

Date: 2019-03-09T14:56:24.367Z
Hash: e6105fbbd24ce43b0f57
Time: 10178ms
chunk {0} runtime.a5dd35324ddfd942bef1.js (runtime) 1.41 kB [entry] [rendered]
chunk {1} es2015-polyfills.358ed1827c991dd2afb0.js (es2015-polyfills) 56.4 kB [initial] [rendered]
chunk {2} main.e87fb3df99e6b4b142c4.js (main) 239 kB [initial] [rendered]
chunk {3} polyfills.407a467dedb63cfdd103.js (polyfills) 41 kB [initial] [rendered]
chunk {4} styles.3ff695c00d717f2d2a11.css (styles) 0 bytes [initial] [rendered]

Sending build context to Docker daemon  393.7kB
Step 1/4 : FROM nginx
 ---> 42b4762643dc
Step 2/4 : LABEL maintainer="Michael Kaaden <github@kaaden.net>"
 ---> Using cache
 ---> ebd7affcf553
Step 3/4 : COPY nginx/default.conf /etc/nginx/conf.d
 ---> Using cache
 ---> 65b24d481385
Step 4/4 : COPY dist/dockerized-app /usr/share/nginx/html
 ---> Using cache
 ---> a6f5cd965884
Successfully built a6f5cd965884
Successfully tagged dockerized-app:latest
```

Damit sollte auf Ihrer Docker-Instanz ein Image namens `dockerized-app`
vorliegen. Sie können das mittels `docker images` ganz leicht überprüfen:

```console
$ docker images
REPOSITORY      TAG     IMAGE ID       CREATED         SIZE
dockerized-app  latest  419869cfab04   10 seconds ago  110MB
```

## Den Container starten

Um nun einen Container auf Basis des eben erzeugten Image zu starten (zur
Erinnerung: Container zu Image verhält sich wie Instanz zu Klasse), verwenden
Sie `docker run -p 8093:80 -d --name web dockerized-app` (bzw. den Namen Ihrer
App statt `dockerized-app`). Das stellt einen Container namens "web" auf Ihrem
Rechner auf Port 8093 bereit. Ihr Browser sollte Ihre App also unter
`http://localhost:8093/` anzeigen, falls sie den Container auf Ihrer Workstation
gestartet haben. Ansonsten verwenden Sie bitte den passenden Rechnernamen statt
`localhost`.

Um den Container wieder zu stoppen, geben Sie `docker stop web` ein.

Auch das können wir über ein Skript automatisieren. Gerade für komplexere
Szenarien mit mehreren Containern hat Docker
[docker-compose](https://docs.docker.com/compose/) entwickelt. Für unseren
vereinfachten Anwendungsfall mit nur einem Service sieht die zu obigem Aufruf
über die Kommandozeile identische Konfigurationsdatei `docker-compose.yml`
folgendermaßen aus:

```yaml
version: "3"

services:
    web:
        image: dockerized-app
        ports:
            - "8093:80"
```

Um Ihren Container zu starten, verwenden Sie nun einfach `docker-compose up -d`.
Vergessen Sie bitte nicht das `-d`, da Ihr Container sonst im Vordergrund läuft
und Sie ihre Shell solange nicht mehr nutzen können, bis Sie ihn wieder beendet
haben. Das erreichen Sie mit `docker-compose down`.

Jedes Mal, wenn Sie Ihre App ändern, müssen Sie ein neues Image bauen. Das geht
schnell, da alle Images aus Schichten (engl. _layers_) bestehen, die Docker
zwischenspeichert, und Ihre Änderung nur die letzte Schicht (die mit dem
`COPY dist/dockerized-app /usr/share/nginx/html`) betrifft. Um dieses neueste
Image zur Ausführung zu bringen, müssen Sie den alten Container erst beenden und
den neuen starten. Auch hier bietet sich ein Skript an. Ich nenne es
`redeploy.sh`:

```bash
#! /bin/bash
docker-compose down --remove-orphans
docker-compose up -d
```

Damit haben Sie alles Nötige zur Hand, um Ihre App sinnvoll in einem
Docker-Container zu betreiben.

Im nächsten Artikel zeige ich Ihnen, wie Sie Ihre App von Docker aus
konfigurieren können. Das ist dann wichtig, wenn Sie beispielsweise gegen ein
Backend programmieren und den URL zum Backend über Docker vorgeben möchten.
