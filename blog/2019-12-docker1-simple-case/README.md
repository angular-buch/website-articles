---
title: "[Docker Serie 2/4] Angular-App über Docker bereitstellen"
author: Michael Kaaden
mail: blog@kaaden.net
bio: "Michael Kaaden ist als Software-Architekt und Manager für ein mittelständisches Unternehmen in Nürnberg tätig. Dort ist er für die technische Seite einer Cloud-Produktline verantwortlich. In dieser Eigenschaft kümmert er sich trotz seiner grundsätzlichen Affinität zu Angular nicht nur um Frontends, sondern neben der Gesamtarchitektur unter anderem auch um APIs, Backends, Datenbanken sowie Software-Entwicklungs- und Build-Prozesse. Wenn er in seiner Freizeit nicht gerade mit seiner Familie unterwegs ist, Full-Stack Developer spielt oder seine Nase in neue Technologien steckt, versucht er, seinen Laufstil zu verbessern und endlich den für ihn perfekten Fotoapparat zu finden."
published: 2019-12-09
keywords:
  - Docker
  - nginx
  - Build
  - docker-compose
language: de
thumbnail: header1.jpg
hidden: true 
---

**First Steps:
Wie Sie Ihre Angular-App in ein Docker-Image packen und als Container zur Ausführung bringen.
Vergessen Sie Ihre Sorgen über den korrekten Build und das richtige Deployment!
Dies ist der 2. Teil unserer vierteiligen Artikelserie zu Angular und Docker.**

Inhaltsverzeichnis:

- [Konfiguration des Webservers](/blog/2019-12-docker1-simple-case#konfiguration-des-webservers)
- [Das Dockerfile](/blog/2019-12-docker1-simple-case#das-dockerfile)
- [Das Build-Skript](/blog/2019-12-docker1-simple-case#das-build-skript)
- [Den Container starten](/blog/2019-12-docker1-simple-case#den-container-starten)
- [Ausblick](/blog/2019-12-docker1-simple-case#ausblick)

> Sie finden den Code zum Artikel auf
[GitHub](https://github.com/MichaelKaaden/dockerized-app/tree/master/Part-1-Simple-Case).

Es ist ganz einfach, eine Angular-App zu "dockerisieren". Sie brauchen keinerlei Code in Ihrer App zu ändern, um sie in einem Docker-Container zu betreiben.
Sie müssen lediglich die Dateien hinzufügen, die ich Ihnen in diesem Artikel vorstelle.

## Konfiguration des Webservers

Als Webserver werden wir [nginx](http://nginx.org/) verwenden.
Keine Sorge, wenn Sie diesen noch nie selbst benutzt, geschweige denn konfiguriert haben.
Erstellen Sie im Wurzelverzeichnis Ihrer App ein Verzeichnis namens `nginx` und legen Sie darin eine Datei namens `default.conf` mit folgendem Inhalt an:

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

Im Wesentlichen besagt diese Konfiguration, dass der Webserver _im Container_
auf Port 80 lauschen wird, die App im Verzeichnis `/usr/share/nginx/html` abgelegt ist und jeder URL auf `/index.html` "umgebogen" wird.
Im Betrieb können Sie den Container auf jedem beliebigen Port Ihres Rechners betreiben.
Dieser Port wird dann an den Container-Port 80 weitergeleitet und landet damit auf dem Webserver im Container.

## Das Dockerfile

Als nächstes erstellen Sie ebenfalls im Wurzelverzeichnis Ihrer App eine Datei
namens `Dockerfile`.
Docker verwendet diese Datei, um ein Image mit Ihrer App zu erstellen.

```dockerfile
FROM nginx
LABEL maintainer="Ihr Name <you@your.domain>"
COPY nginx/default.conf /etc/nginx/conf.d
COPY dist/dockerized-app /usr/share/nginx/html
```

Diese Datei verwendet das jeweils neueste `nginx`-Image als Basis, setzt darin Ihren Namen als den des Zuständigen, kopiert die Konfigurationsdatei und schließlich Ihre (bereits gebaute) Angular-App in das Image.
Falls Sie diese Anleitung mit Ihrer eigenen App nachvollziehen, setzen Sie für `dist/dockerized-app` bitte das entsprechende Verzeichnis Ihrer App ein.

Damit könnten wir das Docker-Image nun bereits bauen.
Um den nötigen Zeitaufwand zum Bau zu verringern, sollten Sie eine Datei `.dockerignore` folgenden Inhalts erstellen, um zu verhindern, dass dabei jedes Mal unnötige Dateien und Verzeichnisse vom Docker-Daemon verarbeitet werden:

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

Das Docker-Image mit Ihrer App können Sie nun erstellen, indem Sie folgende Beschwörungsformeln in der angegebenen Reihenfolge murmeln: `npm install` (oder `yarn install`, wenn Sie Ihre Pakete stattdessen mit `yarn` verwalten), `ng build --prod` und schließlich `docker build -t dockerized-app .` (bitte vergessen Sie den Punkt am Ende nicht!).
Auch hier sollten Sie das `dockerized-app` durch den Namen Ihrer App ersetzen, denn unter diesem Namen legt Docker das Image auf Ihrem Rechner ab.

Ich bin ein großer Fan davon, all die Schritte zu automatisieren, die ich ständig wiederholen muss. Deshalb habe ich diese Schritte in einem Skript `dockerize.sh` zusammengefasst:

```bash
#!/bin/bash
yarn install
ng build --prod
docker build -t dockerized-app .
```

Sollten Sie statt auf macOS oder Linux auf Windows unterwegs sein, müssen Sie stattdessen ein Batch-File oder ein PowerShell-Skript mit entsprechender Syntax verwenden.

Am besten ist es, wenn Sie das Skript gleich ausprobieren. Bei mir sieht das so aus:

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

Damit sollte auf Ihrer Docker-Instanz ein Image namens `dockerized-app` vorliegen.
Sie können das mit dem Befehl `docker images` überprüfen:

```console
$ docker images
REPOSITORY      TAG     IMAGE ID       CREATED         SIZE
dockerized-app  latest  419869cfab04   10 seconds ago  110MB
```

## Den Container starten

Wir wollen nun einen Container auf Basis des eben erzeugten Images starten.
Zur Erinnerung: Container zu Image verhält sich wie Instanz zu Klasse in der objektorientierten Programmierung.
Verwenden Sie den Befehl `docker run -p 8093:80 -d --name web dockerized-app`, um einen Container zu erstellen.
Er stellt einen Container namens `web` auf Ihrem Rechner auf Port 8093 bereit.
Ihr Browser sollte Ihre App also unter `http://localhost:8093/` anzeigen, falls sie den Container auf Ihrer Workstation gestartet haben.
Ansonsten verwenden Sie natürich den passenden Rechnernamen statt `localhost`.

Um den Container wieder zu stoppen, geben Sie `docker stop web` ein.
Alle laufenden Container können Sie jederzeit mit dem Befehl `docker ps` anzeigen.

Auch das Erstellen eines Containers können wir über ein Skript automatisieren.
Gerade für komplexere Szenarien mit mehreren Containern hat Docker das Tool [docker-compose](https://docs.docker.com/compose/) entwickelt.
Für unseren vereinfachten Anwendungsfall mit nur einem Service sieht die zu obigem Aufruf
über die Kommandozeile identische Konfigurationsdatei `docker-compose.yml` folgendermaßen aus:

```yaml
version: "3"

services:
    web:
        image: dockerized-app
        ports:
            - "8093:80"
```

Um Ihren Container zu starten, verwenden Sie nun einfach den Befehl `docker-compose up -d`.
Vergessen Sie bitte nicht das `-d`, da Ihr Container sonst im Vordergrund läuft und Sie Ihre Shell solange nicht mehr nutzen können, bis der Container beendet ist.
Das erreichen Sie übrigens mit `docker-compose down`.

Jedes Mal, wenn Sie Ihre App ändern, müssen Sie ein neues Image bauen.
Das geht schnell, da alle Images aus Schichten (engl. _layers_) bestehen, die von Docker zwischengespeichert werden.
Unsere Änderung betrifft allerdings nur die letzte Schicht (die mit dem
`COPY dist/dockerized-app /usr/share/nginx/html`), sodass auch nur diese Schicht neu gebaut wird.
Um dieses neueste Image zur Ausführung zu bringen, müssen Sie den alten Container erst beenden und den neuen starten.
Auch hier bietet sich ein Skript an, ich nenne es `redeploy.sh`:

```bash
#! /bin/bash
docker-compose down --remove-orphans
docker-compose up -d
```

Damit haben Sie alles Nötige zur Hand, um Ihre App sinnvoll in einem Docker-Container zu betreiben.

## Ausblick 

Die Artikelserie besteht aus den folgenden Teilen:

1. [Angular-Apps und Docker: Einleitung](https://angular-buch.com/blog/2019-12-docker0-intro)
2. [Angular-App über Docker bereitstellen](https://angular-buch.com/blog/2019-12-docker1-simple-case) **(der aktuelle Artikel)**
3. [Build Once, Run Anywhere oder: Konfiguration über Docker verwalten](https://angular-buch.com/blog/2019-12-docker2-build-once-run-anywhere)
4. [Multi-Stage Builds oder: Immer die Build-Umgebung dabei haben](https://angular-buch.com/blog/2019-12-docker3-multi-stage-build)

Im nächsten Artikel zeige ich Ihnen, wie Sie Ihre App von Docker aus konfigurieren können.
Das ist dann wichtig, wenn Sie beispielsweise gegen ein Backend programmieren und den URL zum Backend über Docker vorgeben möchten.

<br>
<hr>

<small>**Titelbild:** Bild von [Guillaume Bolduc](https://unsplash.com/@guibolduc) auf [Unsplash](https://unsplash.com), bearbeitet</small>
