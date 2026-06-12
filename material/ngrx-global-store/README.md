## NgRx: Reactive Extensions for Angular

Das Framework *Reactive Extensions for Angular (NgRx)* ist eine der populärsten Implementierungen für State Management mit Angular.
Durch die gezielte Ausrichtung auf Angular fügt sich der Code gut in die Strukturen und Lebenszyklen einer Angular-Anwendung ein.
NgRx setzt stark auf die Möglichkeiten der reaktiven Programmierung mit RxJS, ist also an vielen Stellen von Observables und Datenströmen geprägt.
Die große Community und eine Reihe von verwandten Projekten machen NgRx zum wohl bekanntesten Werkzeug für Zustandsverwaltung mit Angular.

Wir wollen in diesem Abschnitt die Struktur und die Bausteine in der Welt von NgRx genauer besprechen.
Außerdem wollen wir im BookMonkey einen Aspekt mithilfe von NgRx umsetzen, um so alle Bausteine auch praktisch zu üben.

### Projekt vorbereiten

Als Grundlage für diesen praktischen Teil verwenden wir das Beispielprojekt BookMonkey in der Version nach dem Kapitel zu Guards, also bevor wir die Anwendung auf Standalone Components umgestellt haben.
Möchten Sie mitentwickeln, so können Sie Ihr bestehendes Book\-Monkey-Projekt verwenden oder neu starten und den Code über GitHub herunterladen:

\begin{clilisting}[caption={BookMonkey als Grundlage für NgRx verwenden},breakatwhitespace=true,belowskip=0pt]
git clone https://ng-buch.de/bm5-16-guards.git book-monkey-ngrx
cd book-monkey-ngrx
npm install
\end{clilisting}

### Store einrichten

Im Projektverzeichnis müssen wir zunächst alle Abhängigkeiten installieren, die wir für die Arbeit mit NgRx benötigen.
NgRx verfügt über eigene Schematics zur Einrichtung in einem bestehenden Angular-Projekt.
Die folgenden Befehle integrieren einen vorbereiteten \mbox{Store} in die bestehende Anwendung:
\begin{clilisting}[style=nocaption, label=lst:ngrx:storeeinrichten]
ng add @ngrx/store --defaults
ng add @ngrx/store-devtools
ng add @ngrx/effects
\end{clilisting}




Später wollen wir einen zusätzlichen Baustein kennenlernen, der im originalen Redux nicht vorgesehen ist und der spezifisch für NgRx ist: Effects auf Basis von `@ngrx/effects`.
Deshalb haben wir das notwendige Paket in diesem Schritt gleich mit eingefügt.
Die Store DevTools sind hilfreich zum Debugging der Anwendung –  wir werden später in \autoref{sec:redux-developer-tools} ab \autopageref{sec:redux-developer-tools} genauer darauf eingehen, um den Lesefluss in diesem Kapitel nicht zu unterbrechen.

### Schematics nutzen

Um nach der Einrichtung die Bausteine von NgRx mithilfe der Angular CLI anzulegen, können wir das Paket `@ngrx/schematics` nutzen.
Es erweitert die Fähigkeiten der Angular CLI, sodass wir unsere Actions, Reducers und Effects bequem mithilfe von `ng generate` anlegen können.
Auch diese Abhängigkeit wird mittels `ng add` installiert.
\begin{clilisting}[style=nocaption]
ng add @ngrx/schematics
\end{clilisting}


\footnote{Schematic Collection festlegen}Die Schematics von NgRx werden durch diesen Aufruf automatisch im Projekt registriert.
\pagebreak
Jeder Aufruf von `ng generate` durchsucht dann auch die Skripte in diesem Paket.
So können wir bequem einen Befehl wie `ng \mbox{generate` \mbox{action}} verwenden, ohne die Zielkollektion explizit angeben zu müssen.
Die Collection wird mit einem Eintrag in der Datei \file{angular.json} festgelegt, den Sie jederzeit wieder löschen oder ändern können, falls Sie die Skripte von NgRx nicht mehr nutzen möchten.

### Grundstruktur

Die ausgeführten Befehle haben bereits alles Nötige eingerichtet, sodass wir sofort mit der Implementierung beginnen können.
Vorher wollen wir jedoch einen Blick auf die Änderungen werfen, die von den Schematics an unserem Projekt vorgenommen wurden.

Neben allen benötigten Abhängigkeiten in der \file{package.json} sind einige neue Imports im `AppModule` hinzugekommen.
Das `StoreModule` bringt den Kern des NgRx-Stores in die Anwendung.
Die verwendete Methode `forRoot()` erwartet zwei Argumente:
Im ersten Objekt können wir angeben, welche Reducers für welchen Teil des State-Objekts verantwortlich sind (eine sogenannte `ActionReducerMap`).\footnote{ActionReducerMap}
Üblicherweise nutzen wir dieses Objekt nicht, um die State-Struktur für unsere Features zu definieren, denn dafür existiert ein anderer, dynamischerer Weg.
Verwenden wir allerdings das Paket `@ngrx/router-store`, so müssen wir das Mapping für den Router hier statisch im `AppModule` konfigurieren.\footnote*{Auf das Paket `@ngrx/router-store` gehen wir zum Ende dieses Kapitels ab \autopageref{sec:redux:routing} noch ein.}
Im zweiten Argument von `forRoot()` können wir ein Konfigurationsobjekt übergeben.\footnote{Konfiguration für den Store}
Da wir diese beiden Aspekte momentan nicht nutzen wollen, sind lediglich zwei leere Objekte als Argumente angegeben.

Außerdem sind zwei weitere Imports für `Effects\-Module` und `Store\-DevTools\-Module` eingetragen worden.
Diese beiden Module binden Effects und die Store DevTools ein, wir wollen uns aber zu diesem Zeitpunkt noch nicht detaillierter damit auseinandersetzen.

\lstinputlisting[caption={Imports für NgRx im `AppModule` \textup{(\file{app.module.ts})}}, label=lst:ngrx:appmoduleimports, language=js,breakatwhitespace=true,belowskip=1em]{\currentBm/src/app/app.module.ts.snippet}

Mit dieser Konfiguration ist der Store zwar schon aktiv, aber wir haben noch nicht festgelegt, wie das zentrale State-Objekt strukturiert sein soll.
Da wir auch mit NgRx modular entwickeln, setzen wir diese Änderungen allerdings nicht direkt im `AppModule` um.
Stattdessen lagern wir alle neuen Bausteine in eigene Dateien aus und nutzen dafür die Angular~CLI.

\begin{kasten}
\caption{NgRx und Standalone Components}Im Zusammenhang mit Standalone Components kann es sein, dass die Anwendung kein `AppModule` besitzt, sondern die `AppComponent` direkt gebootstrappt wird, siehe dazu der Abschnitt ab \autopageref{sec:17standalone:ohnemodule}.
Damit wir in diesem Fall nicht die Module importieren müssen, bietet NgRx verschiedene Funktionen an, um den Store einzurichten: `provideStore()`, `provideEffects()` und `provide\-State()`.
\end{kasten}

### Feature anlegen

Unsere Anwendung ist bereits in Module strukturiert, die einzelne Features der Anwendung kapseln.
Diese Einteilung findet sich auch wieder, wenn es um die Einrichtung des Stores für NgRx geht.
Jedes Feature erhält einen eigenen Satz an Actions, Reducers und Effects, die auch nur für genau dieses Feature und den zugehörigen State zuständig sind.
So verhindert man eine monolithische Struktur, in der verschiedene Zuständigkeiten ungewollt vermischt werden.
Um NgRx für ein existierendes Feature-Modul aufzusetzen, verwenden wir den folgenden Befehl:
\begin{clilisting}[style=nocaption,breakatwhitespace=true]
ng g feature books/store/book --module books/books --api --defaults
\end{clilisting}

Dieser Aufruf legt das Feature `book` im Ordner \dir{src/app/books/store} an.
Wir haben hier bewusst den Unterordner \dir{store} gewählt, um alle Bestandteile von NgRx sauber in einem gemeinsamen Unterordner zu gruppieren.
\footnote{Feature-Name im Singular}Wichtig ist, dass der Feature-Name `book` hier im Singular angegeben wird, denn die CLI wird beim Anlegen automatisch ein Plural-s für einige Bausteine hinzufügen.
Die nötigen Imports und die Verdrahtung in der Anwendung sollen in das zugehörige `Books\-Module` integriert werden, auf das wir mit der Option \mbox{`-{`-module}} verweisen.
Mit der Option `-{`-api} generieren wir außerdem das nötige Grundgerüst, um Daten zu behandeln, die von einer API abgerufen werden.
Wie sich das auswirkt, werden wir gleich noch betrachten.
Die letzte Option \mbox{`-{`-defaults}} setzt weitere notwendige Einstellungen auf die vordefinierten Standardwerte.

Die Dateistruktur in der Anwendung sieht nun wie folgt aus:\nopagebreak
\DDirtree{%
	.1 \dir{src} .
	.2 \dir{app} .
	.3 \dir{books} .
	.4 **\dir{store**} .
	.5 **book.actions.ts** .
	.5 **book.reducers.ts** .
	.5 **book.selectors.ts** .
	.5 **book.effects.ts** .
	.5 \dots .
	.4 books.module.ts .
	.4 \dots .
	.3 app.module.ts .
	.3 \dots .
}

Neben neuen Dateien sind im `BooksModule` weitere Imports hinzugekommen.
Hier wurde ebenfalls das `StoreModule` importiert, allerdings mit der Methode `forFeature()`.
Außerdem wurde eine Effects-Klasse mit dem `EffectsModule` registriert.

\lstinputlisting[caption={NgRx einrichten im BooksModule \textup{(\file{books.module.ts})}}, label=lst:ngrx:booksmodule, language=js,breakatwhitespace=true]{\currentBm/src/app/books/books.module.ts.snippet}

\footnote{State dynamisch erweitern}Dieser Aufruf von `forFeature()` ist essenziell, denn er definiert die Struktur des globalen State-Objekts.
Die Konstante `fromBook.bookFeatureKey` aus der Datei \file{book.reducer.ts} enthält den String `book`.
Damit wird festgelegt, unter welchem Namen die Zustände dieses Features im globalen State-Objekt zu finden sein werden.
Das zentrale State-Objekt wird also durch diesen Aufruf von `forFeature()` automatisch erweitert, und die Reducers aus dem Feature werden in die Anwendung integriert.
Diese dynamische Erweiterung ist nötig, damit ein Feature-Modul auch mithilfe von Lazy Loading asynchron zur Laufzeit nachgeladen werden kann.\footnote{Lazy Loading}
Der Feature-Key `book` verweist auf den Teilbaum im State-Objekt, in den der Feature-State eingebaut wird.

### Struktur des Feature-States definieren

Nun folgt der erste inhaltliche Schritt auf dem Weg zum State Management:
Wir müssen die Struktur des Feature-States für das Feature `book` definieren.
Dazu befindet sich in der Datei \file{books/store/book.reducer.ts} ein Interface mit dem Namen `State`.
Dieser Feature-State ist der erste Zweig des zentralen Objekt-Baums.

\footnote{State-Interface}Im Interface `State` legen wir fest, welche Zustände und Daten wir speichern möchten.
Es soll zunächst nur darum gehen, die Buchliste vom Server abzurufen, im Store zu speichern und schließlich darzustellen.
Wir benötigen also eine Liste von Büchern und integrieren außerdem einen Ladeindikator.

\footnote{Initialzustand}Direkt darunter befindet sich die Variable `initialState`.
Damit das System weiß, welche Zustände direkt nach dem Start herrschen, müssen wir hier einen initialen Zustand definieren.
Für unsere Anwendung ist die Buchliste beim Start leer und der Ladeindikator steht auf `false`:

\lstinputlisting[firstline=8,lastline=16,caption={Feature-State und initialer Zustand \textup{(\file{book.reducer.ts})}}, label=lst:ngrx:featstateinitial, language=js,breakatwhitespace=true]{\currentBm/src/app/books/store/book.reducer.ts}

Damit haben wir die Struktur unseres Feature-States definiert.
Die restlichen Inhalte der Datei ignorieren wir zunächst, darum werden wir uns im übernächsten Schritt kümmern.
Unser *gesamter* State der Anwendung hat jetzt den folgenden Aufbau:

\pagebreakbeforelisting
\lstinputlisting[caption={Aufbau des gesamten State-Objekts}, label=lst:ngrx:statestructure, language=js,breakatwhitespace=true]{\snippets/reduxngrx/ngrx/state-structure.ts}

Der Name `book` wird durch den Feature-Key definiert, den wir an den Aufruf von `forFeature()` übergeben haben.

### Actions: Kommunikation mit dem Store


Alle relevanten Ereignisse in der Anwendung werden durch Actions repräsentiert, die in den Store gesendet werden.
Das umfasst Aktionen, die direkt in der Oberfläche ausgeführt werden, und auch technische Ereignisse wie Antworten von der HTTP-Schnittstelle.

\footnote{Actions beschreiben fachliche Ereignisse.}Dabei beschreiben Actions idealerweise eine abstrakte Sicht auf das Geschehen.
Actions sollten keine technischen Kommandos für das System darstellen, sondern die dahinterliegende Intention beschreiben.
Für unser Beispiel raten wir etwa von der Action `Show Loading Spinner` ab, denn sie beschreibt ein technisches Implementierungsdetail und kein fachliches Ereignis.

Actions bilden die Grundlage für die Kommunikation mit dem \mbox{Store} und können Änderungen am Anwendungszustand auslösen.
Dieses Konzept entspricht den Nachrichten, die wir im einführenden Beispiel an den Service gesendet haben.
Die folgende Auflistung zeigt einige Beispiele für Actions, die in einer Anwendung vorkommen könnten:

\vskip-4mm\begin{tabular}[t]{@{}p{.4\textwidth}p{.4\textwidth}@{}}
  \begin{itemize}
  \item Load Books
  \item Load Books Success
  \item Load Books  Failure
  \item Session Expired
  \item Router Navigation
  \item Window Resize
  \item User Login
  \item User Login Success
  \end{itemize}
  &
  \begin{itemize}
  \item User Login Failure
  \item Add item to cart
  \item Remove item from cart
  \item Create book
  \item Update book
  \item Set language
  \item Increment counter
  \end{itemize}
\end{tabular}

\vskip-2mm\noindent
Technisch ist eine solche Action immer ein Objekt mit einer bestimmten vorgegebenen Struktur.
Verpflichtend ist die Eigenschaft `type`, die den Namen der Nachricht angibt und die Nachricht unverwechselbar macht.
Jeder Type muss eindeutig sein und er darf immer nur einmal vergeben werden!
Zusätzlich können weitere optionale Eigenschaften definiert werden, um Daten in der Action zu transportieren: der sogenannte Payload, der im folgenden Beispiel `data` genannt wird.

\pagebreakbeforelisting
\lstinputlisting[caption={Grundaufbau einer Action}, label=lst:ngrx:actionstructure, language=js,breakatwhitespace=true]{\snippets/reduxngrx/ngrx/action-structure.ts}

\footnote{Action Creator}Um eine starke Typisierung zu ermöglichen und Tippfehler zu vermeiden, notieren wir die Objekte jedoch nicht direkt im Code.
Stattdessen nutzen wir einen sogenannten *Action Creator* –  eine Funktion, die das Objekt mit der richtigen Struktur erzeugt.

Dafür stellt NgRx die Funktion `createAction()` zur Verfügung.
Als erstes Argument geben wir hier immer den Namen der Action an.
Dieser `type` muss in der gesamten Anwendung eindeutig sein.
Um die Nachvollziehbarkeit zu erhöhen und mögliche Kollisionen zu verhindern, wird üblicherweise die Quelle der Action in eckigen Klammern im Namen notiert.
Damit erzeugen wir eine Art Namespace für den Action-Typ –  es handelt sich dabei aber nur um eine Konvention.

\lstinputlisting[caption={Action ohne Payload}, label=lst:ngrx:actionwithoutpayload, language=js,breakatwhitespace=true]{\snippets/reduxngrx/ngrx/action-withoutpayload.ts}

Diese Action besitzt noch keinen Payload.
Wollen wir weitere Daten in der Action verpacken, können wir die Struktur des Payloads im zweiten Argument von `createAction()` festlegen:

\lstinputlisting[caption={Action mit Payload}, label=lst:ngrx:actionwithpayload, language=js,breakatwhitespace=true]{\snippets/reduxngrx/ngrx/action-withpayload.ts}

Der generische Typparameter der Funktion `props()` gibt an, welche zusätzlichen Eigenschaften die Action enthalten soll.
Wir haben hier den generischen Namen `data` gewählt, Sie können die Payload-Propertys allerdings nach Belieben benennen.
Das erzeugte Action-Objekt hat den folgenden Aufbau:

\lstinputlisting[caption={Struktur der Action}, label=lst:ngrx:actionstructurelbs, language=js,breakatwhitespace=true]{\snippets/reduxngrx/ngrx/action-structure-lbs.ts}

Zur Abfrage einer HTTP-Schnittstelle benötigt man normalerweise drei zusammengehörige Actions, die diesem Muster folgen:
\begin{itemize}
	\item `Load XXX`: Daten anfragen
	\item `Load XXX Success`: Daten sind erfolgreich vom Server eingetroffen.
	\item `Load XXX Failure`: Das Laden der Daten ist fehlgeschlagen.
\end{itemize}

Die Actions werden in einer oder mehreren Dateien gesammelt.
Beim Anlegen des Features mit `ng generate feature` wurde eine solche Datei bereits erstellt:
\file{books/store/book.actions.ts}.
Da wir das Feature mit der Option `-{`-api} angelegt haben, sind in dieser Datei bereits die ersten drei Actions vorbereitet.
Wir können dieses Grundgerüst nutzen und die Signaturen der Actions für unseren Anwendungsfall anpassen.

Die Success-Action erhält als Payload eine Buchliste `Book[]`, die Failure-Action transportiert einen Fehler vom Typ `string`.\footnote*{In der Praxis ist es sinnvoll, hier ein eigenes Fehlerobjekt zu verwenden, das mehr Informationen beinhaltet als nur den Fehlertext.}
Die Ac\-tion `loadBooks` benötigt keine weiteren Daten, denn die Intention wird schon durch den Action-Typ vollständig ausgedrückt.

\lstinputlisting[caption={Actions für das Feature `book` \textup{(\file{book.actions.ts})}}, label=lst:ngrx:bookactions, language=js,breakatwhitespace=true,belowskip=0pt]{\currentBm/src/app/books/store/book.actions.ts}

### Dispatch: Actions in den Store senden


Um mit dem Store zu kommunizieren und Zustandsänderungen anzustoßen, müssen die Actions von den Komponenten in den Store gesendet werden.
Der Store kann dazu als Service in die Komponente injiziert werden.

Der Store verfügt über eine Methode `dispatch()`, mit der wir eine Action in den Store dispatchen können.
Beim Aufruf der `BookList\-Component` soll das Laden der Buchliste angestoßen werden.
Deshalb lösen wir dort gleich im Konstruktor die Action `loadBooks` aus.

Wichtig ist, dass das exportierte `loadBooks` aus der Datei \file{book"".\mbox{actions}"".ts} selbst noch keine Action ist, sondern ein Action Creator, der ein Action-Objekt erzeugen kann.
Dazu muss die Funktion aufgerufen werden.
Hat die Action einen Payload, so wird er als Argument an den Action Creator übergeben:

\lstinputlisting[caption={Action Creator verwenden}, label=lst:ngrx:actioncreatoruse, language=js,breakatwhitespace=true]{\snippets/reduxngrx/ngrx/action-creator-use.ts}

Wir müssen die Funktion `loadBooks` also aufrufen, um ein Action-Objekt zu erhalten, das wir dispatchen können:

\lstinputlisting[caption={Action dispatchen \textup{(\file{book-list"".component.ts})}}, label=lst:ngrx:dispatchloadbooksblc, language=js,breakatwhitespace=true]{\currentBm/src/app/books/book-list/book-list.component.ts.snippet}

\footnote{Redux DevTools}Wenn Sie bereits die Redux DevTools installiert haben, so können Sie nun überprüfen, ob die ausgelöste Action tatsächlich im Store eingetroffen ist.
Wir betrachten die DevTools separat in \autoref{sec:redux-developer-tools} ab \autopageref{sec:redux-developer-tools}.

### Reducers: den State aktualisieren


Nachdem wir die erste Action in den Store dispatcht haben, ist es nun an der Zeit, einen Reducer zu entwickeln, um den State zu verändern.
Ein Reducer im Kontext von Redux ist eine Funktion mit zwei Eingabewerten: der aktuelle Zustand und die neu eintreffende Action.
Die Aufgabe des Reducers ist es, anhand der Action und des Zustands einen neuen Zustand zu berechnen und zurückzugeben:

\pagebreakbeforelisting
\lstinputlisting[caption={Signatur eines Reducers}, label=lst:ngrx:reducersignature, language=js,breakatwhitespace=true]{\snippets/reduxngrx/ngrx/reducer-signature.ts}

Ein Reducer ist dabei immer für einen Teilbaum des States zuständig.
Das Feature `book` besitzt einen eigenen Reducer, der ausschließlich diesen State verarbeitet.
\footnote{State-Slice}Ein solcher Feature-State wird auch *Slice* genannt. Wir verwenden die beiden Begriffe synonym.

In unserem einführenden Beispiel haben wir zur Unterscheidung der Nachrichten ein *switch/case*-Statement verwendet.
Traditionell wird in Redux auch genau dieser Ansatz genutzt.
Der Einsatz von *switch/case* ist jedoch etwas gewöhnungsbedürftig, und auch die Menge an erforderlichem Code ist recht hoch.
Daher stellt NgRx die Funktion `create\-Reducer()` zur Verfügung, um Reducers sehr kompakt und typsicher zu implementieren.
Die grundsätzliche Idee ist jedoch dieselbe:
Der Reducer unterscheidet nach dem Action-Typ und nimmt für verschiedene Actions verschiedene Anpassungen am State vor.
Wir entwickeln also für jede Action eine kleine Reducer-Funktion.

\footnote{Reducers sind Pure Functions.}Die wichtigste Eigenschaft der Reducer-Funktionen ist ihre  Reinheit : Reducers sind Pure Functions.
Dieses Konzept ist von drei wesentlichen Einschränkungen geprägt:
\begin{itemize}
	\item **deterministisch:** Die Funktion liefert für gleiche Eingabewerte stets die gleiche Ausgabe. Es dürfen also keine Werte verarbeitet werden, die nicht zweifelsfrei aus den Eingaben ableitbar sind, z.\,B. Zufallswerte oder die Uhrzeit.
	\item **keine äußeren Zustände:** Es werden nur die Daten verarbeitet, die als Argumente an die Funktion übergeben werden (also hier: State und Action). Es darf nicht auf andere Variablen zugegriffen werden, die außerhalb der Funktion liegen. Eine Ausnahme bilden ausgelagerte Hilfsfunktionen, die allerdings dieselben Anforderungen an eine Pure Function erfüllen müssen.
	\item **keine Seiteneffekte:** Die Funktion darf keine Aktionen ausführen, die einen Effekt außerhalb ihres Gültigkeitsbereichs haben. HTTP-Requests, Logging, Authentifizierung oder Dispatchen von Actions sind also in den Reducers *nicht* erlaubt. Zu Seiteneffekten zählt auch, das State-Objekt direkt zu manipulieren!
\end{itemize}

Die Einhaltung dieser Einschränkungen ist besonders wichtig, um eine hohe Stabilität des Systems sicherzustellen.
Nur wenn wir den strikten Regeln von Redux folgen, kann der Anwendungszustand zuverlässig kontrolliert werden.

Ein Reducer darf deshalb ausschließlich den aktuellen State und die eintreffende Action verarbeiten.
Alle notwendigen Informationen, um den neuen State zu erzeugen, müssen in State oder Action vorliegen.
\footnote{Kopie erzeugen}Außerdem muss der Reducer bei Änderungen stets eine *Kopie* des States zurückgeben, die die gewünschten Änderungen beinhaltet.
Es dürfen niemals Änderungen direkt auf dem Objekt ausgeführt werden.
Diese Eigenschaft der Immutability haben wir bereits in der Einleitung besprochen.
Wir setzen mit NgRx in der Regel nicht auf  echte Unveränderlichkeit, sondern wenden Disziplin an und behandeln die Objekte lediglich als unveränderlich –  auch wenn sie prinzipiell veränderlich sind.
Während der Entwicklung sind außerdem sogenannte *Runtime Checks*\shortlinkFootnote{link-ngrx-runtimechecks} aktiv, die den State auf Unveränderlichkeit und Serialisierbarkeit prüfen.
Jede versehentliche Änderung am State führt dann direkt zu einer Exception.

Um das State-Objekt vor der Verwendung und Änderung zu klonen, können wir den Spread-Operator einsetzen.
Bitte beachten Sie, dass dieses Werkzeug stets nur eine flache Kopie (Shallow Copy) erzeugt.
Wollen wir Änderungen an tiefer verzweigten Teilen des States vornehmen, müssen wir explizit eine tiefe Kopie (Deep Copy) des Objekts erzeugen.\footnote*{Ein verschachteltes Objekt kann mit dem Spread-Operator geklont werden, indem wir jeden Zweig des Objekts einzeln kopieren. Wird das zu komplex, empfehlen wir Ihnen, ein Hilfsmittel zu verwenden wie die native Funktion `structuredClone()`. Wir haben die verschiedenen Möglichkeiten in einem Blogartikel zusammengefasst: \shortlinkInline{link-schule-immutable}.}

\footnote{Reducers für die Anwendung}Wir wollen nun auch für den BookMonkey passende Reducers entwickeln.
Dazu überlegen wir zunächst, welche Zustandsänderungen von den Actions ausgelöst werden:
\begin{itemize}
	\item `loadBooks`: Ladeindikator auf `true` setzen
	\item `loadBooksSuccess`: Buchliste einfügen und Ladeindikator auf `false` setzen
	\item `loadBooksFailure`: Ladeindikator auf `false` setzen
\end{itemize}

Die Implementierung bringen wir in der Datei \file{books/""store/""book"".\mbox{reducers}.ts} unter, in der das Grundgerüst der Reducer-Funktion bereits vorbereitet ist.
Statt *switch/""case* wird hier die Funktion `create\-Reducer()` genutzt.
Für jede Fallunterscheidung existiert ein Block, der in ein~`on()` gekapselt ist.
Als erstes Argument geben wir hier immer die Action an, die behandelt werden soll.
Im zweiten Argument ist die Reducer-Funktion notiert, die schließlich anhand der eingehenden Action den neuen State generiert.
Für die einzelnen Reducer-Funktionen sollten wir den Body in geschweiften Klammern definieren und von dort das State-Objekt direkt returnen.
Außerdem sollte der Rückgabetyp der Funktion immer explizit mit `State` definiert sein.{\tolerance5000\par}

\pagebreakbeforelisting
\lstinputlisting[firstline=18,lastline=36,caption={Reducers für die Anwendung \textup{(\file{book.reducer.ts})}}, label=lst:ngrx:bookreducer, language=js,breakatwhitespace=true,belowskip=0pt]{\currentBm/src/app/books/store/book.reducer.ts}

\definition{reducermeherereactions}{Reducers für mehrere Actions}{
Übrigens wird jeder Reducer immer für jede Action durchlaufen.
Das bedeutet, dass Sie in einem Reducer auch auf mehrere Actions oder sogar auf Actions aus einem anderen Bereich der Anwendung reagieren können.
Dazu können Sie im `on()` mehrere Actions nacheinander als einzelne Argumente angeben.
Es gibt jedoch keine direkte Möglichkeit, in einem Reducer auf einen anderen Slice des States zuzugreifen.\footnotemark}\footnotetext{Um in einem Reducer einen anderen State-Slice zu lesen, müsste zunächst die Art und Weise geändert werden, wie NgRx die verschiedenen Reducers intern zusammenfasst. Die Funktion `combineReducers()` bietet dafür einen Ansatz.}

Haben Sie die Implementierung abgeschlossen, so können Sie die State-Änderung in den Redux DevTools nachvollziehen.
Für die dispatchte Action `loadBooks` ändert sich das `loading`-Flag im State von \mbox{`false`} auf \mbox{`true`}.

Die Action `loadBooksSuccess` wird aktuell niemals ausgelöst; das werden wir im übernächsten Schritt mit einem Effect lösen.
Wir haben trotzdem bereits definiert, was in diesem Fall mit dem State passieren soll.
Dasselbe gilt für `loadBooksFailure`.

Für alle unbekannten Actions liefert der Reducer automatisch den aktuellen State unverändert zurück.
Wenn es also für eine Action keinen passenden Reducer gibt, führt das nicht zu einem Fehler.
Die Bestandteile der Architektur sind so stark entkoppelt, dass sie unabhängig voneinander entwickelt werden können.

### Selektoren: Daten aus dem State lesen

Lassen Sie uns kurz zusammenfassen, wie weit wir bisher gekommen sind:
Wir haben Action Creators definiert und die Action `loadBooks` von der `BookListComponent` aus in den Store dispatcht.
Dort reagiert der Reducer auf die Actions und erzeugt einen neuen State mit der passenden Änderung: Das `loading`-Flag wird auf `true` gesetzt.

Um den Kreislauf des Datenflusses zu schließen, wollen wir die Daten aus dem State nun auslesen und in der Komponente darstellen.
Dazu benötigen wir demnächst etwas Theorie und einen Blick hinter die Kulissen:
Der Kernbestandteil des Stores ist ein `BehaviorSubject` in Kombination mit dem Operator `scan()`.
Alle eingehenden Actions werden reduziert ( aufsummiert), indem die Reducer-Funktionen angewendet werden.
Auf diese Weise wird der jeweils aktuelle Zustand erzeugt und über das Observable ausgegeben.

\footnote{Datenstrom von States}Der Store ist selbst ein Observable, das wir verwenden können, um in den Komponenten auf State-Änderungen zu reagieren.
Der Datenstrom gibt allerdings stets den vollständigen State aus.
Um einzelne Teile daraus zu selektieren, benötigen wir eine Projektion, die sich z.\,B. mit dem Operator `map()` realisieren lässt.
Das folgende Beispiel erstellt ein Observable, das nur das `loading`-Flag liefert:

\lstinputlisting[caption={State auswählen mit `map()`}, label=lst:ngrx:selectmap, language=js,breakatwhitespace=true]{\snippets/reduxngrx/ngrx/select-map.ts}

\footnote{Datenfluss optimieren}Obwohl diese Herangehensweise theoretisch funktioniert, bringt sie ein konzeptionelles Problem mit sich:
Der Store gibt bei *jeder* Änderung den gesamten State aus.
Das Observable `loading\$` emittiert also auch dann einen neuen Wert, wenn sich das `loading`-Flag gar nicht geändert hat.
Werden die Anwendung und der State komplexer, führt das dazu, dass bei jeder noch so trivialen State-Änderung alle Observables in den Komponenten feuern und in der Folge die Change Detection von Angular getriggert wird.

Das gilt es zu verhindern!
Wir wollen nur dann einen Wert ausgeben, wenn wirklich eine relevante Änderung an den Daten vorliegt.
Dazu könnten wir den Operator `distinctUntilChanged()` verwenden.
Das Framework NgRx bringt auf seinem `Store` allerdings eine eigene Methode mit, die alle nötigen Funktionalitäten bereits kombiniert: `\mbox{select`()}.

\lstinputlisting[caption={Die Methode `select()` verwenden}, label=lst:ngrx:selectselect, language=js,breakatwhitespace=true]{\snippets/reduxngrx/ngrx/select-select.ts}

Das resultierende Observable gibt das Ergebnis nur aus, wenn der Wert sich tatsächlich verändert hat, wie die \autoref{fig:redux-selectorsgap} zeigt.

\begin{fig}
	{fig:redux-selectorsgap}
	{Selektor mit `store.select()` verwenden}
	{Selektor mit `store.select()` verwenden}
	{10pt}
        \vskip-1pt
	\includegraphics[width=\textwidth]{images/statemanagement/selectors-gap}
\end{fig}

\suppressindent
\footnote{Typisierung}Wenn wir das Beispiel so implementieren, stoßen wir allerdings auf ein weiteres Problem:
Die Struktur des States wird dynamisch verändert, wenn einzelne Feature-Module mithilfe von `forFeature()` einen Teilbaum des States registrieren.
Durch eine statische Typanalyse allein ist es also nicht möglich, die vollständige Struktur des States zu ermitteln: Der TypeScript-Compiler weiß nicht, dass das Property `book` im State existiert.

\footnote{Komplexe Lesezugriffe}Dazu kommt, dass wir an dieser Stelle lediglich einen einfachen Teil des States selektiert haben.
In der Praxis werden aber die Lesezugriffe auf den State komplexer.
Mitunter wollen wir Daten nicht nur einfach auslesen, sondern Projektionen über verschiedene Teile des States ausführen.
Stellen Sie sich vor, Sie besitzen eine Liste von Autoren und Autorinnen und eine Liste von Büchern –  wollen aber nun nur die Bücher ausgeben, die von einer bestimmten Person verfasst wurden.
Dazu ist zusätzliche Logik nötig, die nicht in die Komponenten gehört.
Stattdessen soll diese Logik in separate Funktionen ausgelagert werden, die unabhängig von den Komponenten sind.
Sie können eine solche Funktion mit einer Datenbankabfrage vergleichen: Die Query wird einmal definiert und kann beliebig komplex sein.
Verschiedene Teile der Anwendung können diese Query nutzen und die Daten genau im benötigten Format erhalten.
Die Funktionen zur Abfrage von Daten aus dem Store werden *Selektoren* genannt.

Selektoren werden ebenfalls in eigenen Dateien untergebracht, die unabhängig von den Komponenten sind.
Dazu wurde bereits die Datei \file{books/store/book.selectors.ts} erstellt.
Zur Definition von Selektoren bringt NgRx eigene Hilfsfunktionen mit: `createFeatureSelector()` und `createSelector()`.
Sie sorgen unter anderem dafür, dass die selektierten Daten korrekt typisiert sind, auch wenn der State zur Laufzeit dynamisch erweitert wird.

\footnote{Memoization}In einem solchen Selektor versteckt sich außerdem ein wichtiges Konzept, das sich *Memoization* nennt.
Damit aufwendige Projektionen nicht bei jeder State-Änderung neu ausgeführt werden, speichert jeder Selektor seine zuletzt verarbeiteten Eingabewerte.
Haben sich diese Werte nicht geändert, so wird auch die Projektion nicht neu ausgeführt, sondern das zuletzt berechnete Ergebnis wird erneut ausgegeben.
Das Prinzip der Memoization ist in die Selektoren bereits eingebaut, wenn wir die mitgelieferten Funktionen verwenden.
Damit das allerdings funktioniert, müssen wir Selektoren als Pure Functions definieren: Sie dürfen nur die Werte verarbeiten, die sie als Argumente erhalten, und es dürfen keine Seiteneffekte ausgeführt werden.

\footnote{Feature-Selektor}Ausgehend davon, dass der Store immer den gesamten State liefert, müssen wir zunächst einen bestimmten Feature-State aus dem großen Objekt selektieren.
Dazu nutzen wir die Funktion `create\-Feature\-Selector()`.
Sie erstellt einen Selektor, der ein Feature anhand seines Namens auswählt.
Dabei verwenden wir den Feature-Key, den wir bereits bei `forFeature()` im `BooksModule` genutzt haben.
Damit diese Selektion typsicher funktioniert, müssen wir außerdem das Interface für den Feature-State angeben.
Um den State-Slice für das Feature `book` auszuwählen, benötigen wir also den folgenden Feature-Selektor, der bereits automatisch vorbereitet wurde:{\tolerance1000\par}

\lstinputlisting[firstline=1,lastline=6,caption={Feature-Selektor erstellen \textup{(\file{book"".selectors.ts})}}, label=lst:ngrx:bookfeatselector, language=js,breakatwhitespace=true]{\currentBm/src/app/books/store/book.selectors.ts}

Anschließend können wir weitere Selektoren mithilfe der Funktion `create\-Selector()` bauen.
Diese Funktion erhält als Argumente mehrere andere Selektoren.
Das Kernstück des Selektors ist schließlich die Projektionsfunktion, die im letzten Argument übergeben wird.
Sie erhält die Daten von allen zuvor angegebenen Selektoren als Argumente und liefert den daraus berechneten Wert zurück:{\tolerance1000\par}

\lstinputlisting[caption={Schematischer Aufbau eines Selektors}, label=lst:ngrx:selectorstructure, language=js,breakatwhitespace=true]{\snippets/reduxngrx/ngrx/selector-structure.ts}

Wir können auf diese Weise ein komplexes Gerüst von Selektoren definieren.
Die Selektoren bauen aufeinander auf und kombinieren die Daten aus dem State so, wie sie in den Komponenten benötigt werden.
Jeder einzelne Selektor nutzt die Memoization, um die berechneten Werte zu cachen.
Die Berechnung in der Projektionsfunktion wird nur neu ausgeführt, wenn sich einer der Eingabewerte tatsächlich ändert.
So sind auch komplexe Projektionen in großen Anwendungen ohne Nachteile in der Performance möglich.

Für den BookMonkey wollen wir zwei einfache Selektoren entwickeln, die uns Zugriff auf das `loading`-Flag und auf die Buchliste geben:

\lstinputlisting[firstline=8,lastline=16,caption={Selektoren für die Anwendung \textup{(\file{book.selectors.ts})}}, label=lst:ngrx:bookselectors, language=js,breakatwhitespace=true]{\currentBm/src/app/books/store/book.selectors.ts}

\footnote{Selektoren verwenden}In der `BookListComponent` verwenden wir nun diese beiden Funktionen, um Observables zu erstellen, die uns die benötigten Daten liefern.
Die Methode `store.select()` erhält dazu als Argument einen der eben definierten Selektoren.
Wir legen alle Observables direkt in der Komponentenklasse ab, denn wir wollen die Subscription im Template mit der Async\-Pipe erledigen.
Wenn Sie Ihre Anwendung sauber strukturieren, sollten die Komponenten immer so aussehen und keine zusätzliche Logik für die Datenaufbereitung beinhalten.
Sie müssen also nur selten in der Komponentenklasse direkt auf ein Observable aus dem Store sub\-scriben.

Da wir das Observable `books\$` nun aus dem Store beziehen, benötigen wir den `BookStoreService` nicht mehr.
Wir können das Argument des Konstruktors also entfernen.

\lstinputlisting[caption={Selektoren verwenden \textup{(\file{book-list"".component.ts})}}, label=lst:ngrx:useselectorsblc, language=js,breakatwhitespace=true]{\currentBm/src/app/books/book-list/book-list.component.ts.2.snippet}

Im Template der Komponente nutzen wir die Observables, um die Daten darzustellen.
Das Observable `books\$` wird bereits korrekt verarbeitet.
Für den Ladeindikator können wir ein neues Element erstellen, das wir direkt mit `ngIf` ein- und ausblenden.
Unser globales Stylesheet bietet dafür die passende \acs{CSS}-Klasse `loader` an.

\lstinputlisting[caption={Daten anzeigen \textup{(\file{book-list"".component.html})}}, label=lst:ngrx:blchtml, language=js,breakatwhitespace=true]{\currentBm/src/app/books/book-list/book-list.component.html.snippet}

Wenn Sie die Anwendung nun aufrufen, sehen Sie den Ladeindikator.
Die Komponente ist nun deutlich loser gekoppelt als vorher, denn sie braucht keine eigene spezifische Logik mehr, um den Indikator anzuzeigen oder Bücher zu laden.
Sie bezieht lediglich Daten über Observables aus dem Store und löst Actions aus.

### Effects: Seiteneffekte ausführen

Wir haben nun alle Bausteine von Redux betrachtet und den Weg der Daten von der Action bis zum Selektor verfolgt.
Jeder Baustein hat klare Zuständigkeiten, und es gibt strikte Regeln dazu, welche Aufgaben in welchen Teil der Anwendung gehören.

\footnote{Kommunikation mit der Außenwelt}Was unserer Anwendung allerdings bis hierhin noch fehlt, ist die Kommunikation mit der Außenwelt:
Wird die Action `loadBooks` ausgelöst, so soll die Buchliste per HTTP vom Server geladen werden.
Bei genauer Betrachtung fällt jedoch auf, dass Reducers und Selektoren nicht die richtigen Orte für diese Aufgabe sind: Beide sind durch Pure Functions definiert, die keine Seiteneffekte ausführen dürfen.

Die grundsätzliche Aufgabe lässt sich wie folgt zusammenfassen:
Wir wollen auf die Action `loadBooks` reagieren und einen HTTP-Request auslösen, um die Buchliste vom Server zu laden.
Ist die HTTP-Antwort eingetroffen, so soll die Buchliste mit einer Action `loadBooksSuccess` in den Store gesendet werden.
Schlägt die HTTP-Kommunikation fehl, so soll die Action `loadBooksFailure` ausgelöst werden.

Um diese Aufgabe anzugehen, bietet NgRx ein ausgereiftes Modell zur Ausführung von Seiteneffekten:
Mit `@ngrx/effects` können wir asynchrone Ereignisse und andere Seiteneffekte in der Anwendung koordinieren.
In einem Effect ist  alles\ erlaubt: HTTP-Kommunikation, Logging, Authentifizierung, LocalStorage, Routing, Anzeige von Meldungen usw.
Effects sind kein Bestandteil der eigentlichen Redux-Architektur, sondern agieren außerhalb des Stores.

%\vspace{3\baselineskip}\suppressindent
\footnote{Effect: reaktiver Datenstrom von Actions}Mit Effects kommmen wir in den Genuss des vollen Erlebnisses von reaktiver Programmierung.
Ein Effect ist ein reaktiver Datenstrom, der
\begin{itemize}
	\item auf Actions und andere Ereignisse reagiert,
	\item Seiteneffekte ausführen kann und
	\item neue Actions generiert.
\end{itemize}

Technisch ist ein Effect also immer ein `Observable<Action>`.
Alle so erzeugten Actions werden automatisch in den Store dispatcht –  darum kümmert sich das Framework.
Effects werden in einer eigenen Klasse untergebracht, die wie ein Service aufgebaut ist: Sie trägt den Decorator `@Injectable()` und kann über ihren Konstruktor Abhängigkeiten anfordern.
Damit die Effects funktionieren, muss die Klasse allerdings explizit registriert werden.
Dazu muss jede Effects-Klasse in einem Modul mithilfe des `EffectsModule` eingebunden werden.
Für das `BooksModule` wurde dieser Schritt bereits bei der Einrichtung erledigt:
\begin{widefigtop}
	{fig:redux:flowfull}
	{Datenfluss in NgRx mit Effects}
	\includegraphics[width=\totalwidth]{images/statemanagement/ngrx-flow-full}
\end{widefigtop}

\vspace*{4\baselineskip}
\lstinputlisting[caption={Effect in der Anwendung registrieren \textup{(\file{books.module.ts})}}, label=lst:ngrx:booksmoduleeffects, language=js,breakatwhitespace=true]{\currentBm/src/app/books/books.module.ts.2.snippet}

Die Klasse `BookEffects` befindet sich in der Datei \file{books/""store/""book""\mbox{.effects}.ts}.
Ein Effect wird als ein Property in dieser Klasse definiert.
Der Name des Propertys spielt keine Rolle, sollte aber passend zur Aufgabe benannt werden.
Das Ziel ist es, hier ein Observable zu entwickeln, das Actions ausgibt.
Jeder Effect wird mit der Funktion `create\-Effect()` gekapselt und wird so automatisch in den Lebenszyklus von NgRx integriert.
Ein erster Effect zum Laden von Daten wurde hier bereits automatisch generiert, weil wir beim Anlegen die Einstellung \mbox{`-{`-api}} verwendet haben.
Dieses Grundgerüst wollen wir vervollständigen, um die Buchliste per HTTP zu laden.{\tolerance1000\par}

Zunächst benötigen wir eine Instanz des `BookStoreService`, der die HTTP-Kommunikation kapselt:

\pagebreakbeforelisting
\lstinputlisting[caption={Service in den Effect injizieren \textup{(\file{book.effects.ts})}}, label=lst:ngrx:bookeffectsbss, language=js,breakatwhitespace=true]{\currentBm/src/app/books/store/book.effects.ts.snippet}

\footnote{Datenstrom von Actions}In die Klasse wurde bereits der Service `Actions` injiziert.
Damit erhalten wir ein Observable, das alle Actions liefert, die in der Anwendung auftreten.
Dieser Datenstrom ist meist die Grundlage für unsere Effects.\footnote*{Ein Effect muss nicht auf Actions basieren. Einige Beispiele für solche Effects haben wir in einem Blogartikel zusammengefasst: \shortlinkInline{link-schule-effects}.}

Der Effect `loadBooks\$` soll auf die Action `loadBooks` reagieren, den passenden HTTP-Request auslösen und Actions zurück in den Store leiten (Success und Failure).
Wir zeigen zunächst den vollständigen Code und gehen die Implementierung anschließend Schritt für Schritt durch:

\lstinputlisting[caption={Effect zum Laden der Buchliste \textup{(\file{book.effects.ts})}}, label=lst:ngrx:bookeffectsfull, language=js,breakatwhitespace=true]{\currentBm/src/app/books/store/book.effects.ts}

Der Datenfluss beginnt beim Strom aller Actions aus der gesamten Anwendung: `this.actions\$`.
\footnote{Actions filtern}Wir interessieren uns hier allerdings nur für Actions mit dem bestimmten Typ `loadBooks`.
Um den Datenstrom zu filtern, eignet sich der Operator `filter()`.
Das führt allerdings zu sehr technischem Code, erschwert die korrekte Typisierung und sagt wenig über die tatsächliche Semantik aus.
NgRx bringt deshalb einen eigenen Operator mit, mit dem wir den Datenstrom nach dem Action-Typ filtern können: `ofType()`.
Als Argument übergeben wir hier einen Action Creator.
Anschließend liegt ein Datenstrom vor, der nur \mbox{Actions} vom Typ `loadBooks` ausgibt.

\footnote{Flattening-Operator auswählen}Für jede dieser Actions wollen wir nun einen HTTP-Request ausführen und die Ergebnisse verarbeiten.
Damit betreten wir erneut das Terrain der Higher-Order Observables.
Wir müssen uns sorgfältig für einen der vier Flattening-Operatoren entscheiden.
Unsere Wahl fällt hier auf `switchMap()`: Wird die Buchliste noch geladen und während\-dessen erneut angefragt, soll nur die zuletzt gesendete Anfrage be\-arbei\-tet werden.
Verwenden Sie bitte nicht immer `switchMap()` in Ihren Effects, sondern wägen Sie sorgfältig ab, welcher Flattening-Operator am besten zu Ihrem jeweiligen Problem passt.

\footnote{HTTP-Request}Mithilfe von `switchMap()` lösen wir den HTTP-Request aus, indem wir den `BookStoreService` mit der Methode `getAll()` einsetzen, die ein Observable zurückgibt.
Unser Effect ist nun ein Observable, das ein Array von Büchern liefert.
Damit die Buchliste im Store verarbeitet werden kann, müssen wir sie in eine Action verpacken.
Wir nutzen dazu den Operator `map()` und wandeln damit die Buchliste um in eine Action `loadBooksSuccess`, die die Liste enthält.

\footnote{Fehlerbehandlung}Ähnlich gehen wir für den Fehlerfall vor: Hier nutzen wir den Operator `catchError()`, um einen Fehler in der Ausführung abzufangen.
Wir werfen den Fehler allerdings an der Stelle nicht weiter, sondern kapseln ihn in eine Action `loadBooksFailure`, die wir als reguläres Element des Datenstroms weitergeben.
Dabei verwenden wir das Property `message` auf dem Fehlerobjekt, um die Meldung auszulesen.

Auf diese Weise erzeugen wir einen Datenstrom, der nacheinander verschiedene Actions ausgeben kann.
Die Funktion `createEffect()` sorgt dafür, dass dieser Datenstrom automatisch abonniert wird.
Die resultierenden Actions werden in den Store dispatcht und durchlaufen dort die Reducers.
In einem Effect sollten wir also niemals selbst die Methode `store.dispatch()` aufrufen.

Bei der Fehlerbehandlung ist es wichtig, den Fehler so dicht wie möglich dort abzufangen, wo er entsteht.
Wir setzen `catchError()` deshalb nicht im Hauptdatenstrom ein, sondern hängen `map()` und `catch\-Error()` direkt an den Serviceaufruf an.
Das `switchMap()` verarbeitet also ein Observable, das in jedem Fall eine Action liefert –  so wird der Hauptdatenstrom nicht durch Fehler gefährdet.
Wird ein Effect durch einen Fehler im Hauptdatenstrom gestört, so wird das zugrunde liegende Observable beendet, und die Anwendung kann nicht mehr auf eine weitere Nachricht durch den beendeten Effect reagieren.

Probieren Sie die Anwendung nun aus und beobachten Sie auch die Actions in den Redux DevTools!
Nachdem die Buchliste geladen wurde, wird `loadBooksSuccess` dispatcht, und der Reducer fügt die Buchliste in den State ein.
Die Selektoren in der Komponente reagieren darauf, und die Bücher werden dargestellt.

\footnote{Loop of Death}Bitte beachten Sie, dass Sie mit einem ungünstig programmierten Effect schnell eine Endlosschleife erzeugen können, die den Browser  zum Glühen\ bringt, wenn parallel `ng serve` läuft und die Anwendung sofort aktualisiert.
Der folgende Effect empfängt alle Actions und leitet sie direkt in den Store zurück –  es entsteht eine Endlosschleife:

\lstinputlisting[caption={\mbox{Effect mit Endlosschleife}}, label=lst:ngrx:effectloopofdeath, language=js,breakatwhitespace=true]{\snippets/reduxngrx/ngrx/effect-loopofdeath.ts}

Wir können übrigens einen Effect so konfigurieren, dass er die ausgegebenen Elemente des Datenstroms nicht als Actions dispatcht.
Das ist immer dann nützlich, wenn ein Effect lediglich Seiten\-effekte ausführt, aber keine weiteren Aktionen zur Folge hat.
Denken Sie z.\,B. daran, dass wir nach dem erfolgreichen Anlegen eines Buchs zur Detailseite navigieren möchten –  nach diesem Schritt sollen keine weiteren Actions getriggert werden.
Dazu können wir im zweiten Argument von `create\-Effect()` die Einstellung `\{ dispatch: false \`} setzen.

\lstinputlisting[caption={Dispatchen von Actions deaktivieren}, label=lst:ngrx:effectdispatchfalse, language=js,breakatwhitespace=true]{\snippets/reduxngrx/ngrx/effect-dispatchfalse.ts}

\noindent
Ein Tipp aus der Praxis: Nutzen Sie diese Einstellung während der Entwicklung, um einen *Loop of Death* zu verhindern.
Sie können einen komplexen Effect dann in Ruhe debuggen, ohne dass die Actions in den Store geleitet werden.
Erst wenn die Implementierung fertig ist, aktivieren Sie den Effect, indem Sie das `\{ dispatch: false \`} wieder entfernen.

\subsubsection*{Achtung: Proprietäres Verhalten von TypeScript}

Bei allen gezeigten Effects haben wir die Syntax mit dem alten proprietären Verhalten von TypeScript (`useDefineForClassFields: false`) verwendet.
Zum Zeitpunkt der Fertigstellung dieses Buchs wurde diese Schreibweise in der offiziellen Dokumentation, in der Demo-Anwen\-dung und in den Schematics von NgRx empfohlen.
Wir haben uns daher dazu entschlossen, möglichst wenig von den offiziellen Quellen abzuweichen, auch wenn es womöglich bei geänderten Standardeinstellungen zu Fehlern kommen kann.
In \autoref{sub:ww:useDefineForClassFields} ab \autopageref{sub:ww:useDefineForClassFields} haben wir beschrieben, unter welchen Umständen dieser Fehler entsteht.

Sollten die Beispiele in Zukunft nicht mehr lauffähig sein, so können Sie den Code leicht umstellen.
Das folgende Listing zeigt eine Variante, bei der wir die Klasse `Actions` und den `BookStoreService` mithilfe der Funktion `inject()` anfordern.

\lstinputlisting[caption={Effect zum Laden der Buchliste mit `inject()` \textup{(\file{book.effects.ts})}}, label=lst:ngrx:bookeffectsfull-inject, language=js,breakatwhitespace=true]{\currentBm/src/app/books/store/book.effects.inject.snippet}

### Geschafft!

Sobald der Effect aktiv ist, wird unsere Anwendung die Bücher über HTTP laden und die Liste mittels `loadBooksSuccess` an den Reducer übergeben.
Dieser wird einen neuen Zustand mit den geladenen Büchern berechnen.
Abschließend wird mithilfe eines Selektors die Oberfläche aktualisiert, und die neuen Bücher werden angezeigt.

Und damit haben Sie die Rundreise durch alle Bausteine von Redux und NgRx geschafft.
Mithilfe eines zentralen Stores haben wir die Zustände der Anwendung zentralisiert und so die Buchliste vom Server abgerufen.
Die Komponenten beinhalten mit dieser Architektur nur noch wenig Logik –  alles Nötige passiert im Store.

Vielleicht haben Sie nun das Gefühl, dass wir für eine kleine Aufgabe unnötig viel Code erzeugt haben.
Betrachtet man das vorliegende Beispiel isoliert, so ist diese Empfindung richtig: Für kleine Anwendungen ist der Einsatz von Redux und NgRx nicht zwingend sinnvoll.
Steigt allerdings die Komplexität des Projekts, so kann ein zentrales State Management mit klaren Regeln und einer durchdachten Architektur eine sinnvolle Investition sein.
Prüfen Sie also für ein Projekt sorgfältig, ob sich der Einsatz von Redux wirklich lohnt.


## Debugging mit den Redux DevTools



Wir möchten Ihnen zum Abschluss des Praxisteils ein wichtiges Hilfsmittel zeigen, das beim Debugging von Anwendungen mit NgRx hilfreich ist: die *Redux DevTools*.

Ein besonderer Vorteil der Redux-Architektur ist das sogenannte *Time Travel Debugging*.
Da stets durch eintreffende Actions ein neuer State im Store erzeugt wird, ist es möglich, die Historie der Ereignisse und Zustände nachzuvollziehen.
Die Redux DevTools unterstützen uns dabei mit einer grafischen Oberfläche, über die wir alle Actions und Zustandsänderungen kontrollieren und debuggen können.

### Die DevTools installieren
Die Redux DevTools sind eine Erweiterung für Google Chrome.
\footnote{Erweiterung für Google~Chrome}Um sie zu verwenden, besuchen wir den Webstore und installieren die Extension im Browser.\shortlinkFootnote{link-redux-devtools}
\begin{widefig}
	{fig:dev-tools:redux}
	{Redux DevTools installieren}
	% {Die Redux DevTools installieren}
	% {10pt}
	\includegraphics[width=\totalwidth]{images/statemanagement/webstore-devtools.png}
\end{widefig}

### Die DevTools in der Anwendung registrieren

Um Informationen aus unserem Store mit dem Entwicklungswerkzeug zu teilen, müssen wir in der Anwendung die passende Schnittstelle schaffen.
Dazu bringt NgRx das Modul `@ngrx/store-devtools` mit, das diese Schnittstelle zur Kommunikation implementiert.

Der einfachste Weg zur Einrichtung ist es, das Modul mithilfe von `ng~add` in das Projekt einzufügen.
Als wir im Praxisteil auf \autopageref{lst:ngrx:storeeinrichten} die Pakete für NgRx installiert haben, haben wir diesen Schritt bereits erledigt.

\begin{clilisting}[caption={NgRx DevTools installieren}]
ng add @ngrx/store-devtools
\end{clilisting}

Damit werden die benötigten Abhängigkeiten installiert, und das zugehörige `StoreDevtoolsModule` wird in das `AppModule` der Anwendung eingebunden.

### Die DevTools nutzen

Die *Redux DevTools* integrieren sich in die Chrome DevTools, und wir finden nach der Installation hier einen neuen Reiter *Redux*.

\begin{widefig}
	{fig:dev-tools:redux:actions}
	{Actions in den DevTools anzeigen}
	\includegraphics[width=\totalwidth]{images/statemanagement/developer-tool-action.png}
\end{widefig}

\footnote{Historie aller Actions}In der \autoref{fig:dev-tools:redux:actions} sind fünf Actions in der Historie auf der linken Seite zu sehen.
Die ersten drei Einträge mit dem Präfix `@ngrx` stammen vom System und werden automatisch bei der Initialisierung dispatcht.
Danach folgen zwei Aktionen, die wir selbst in der Anwendung ausgelöst haben.
Anhand dieser Liste kann genau nachvollzogen werden, was bisher geschehen ist:
Es wurde die Aufforderung zum Abrufen der Buchliste in den Store geschickt, und die Liste kam schließlich vom Server zurück.

\suppressindent
Wählen wir eine Action aus, werden auf der rechten Seite die Änderungen zum vorhergehenden Zustand visualisiert.
Nachdem die Buchliste geladen wurde, wurde das `loading`-Flag von `true` auf `false` geändert und die Buchliste wurde in das Property `books` eingefügt.
Mit den Reitern *Action* und *State* können wir das Action-Objekt und den State betrachten, wie er nach der Verarbeitung dieser Action aussah.

\footnote{Time Travel Debugging}Mit der Historie der Actions können wir außerdem das Time \mbox{Travel} Debugging durchführen.
Dazu besitzt jeder Eintrag in der Liste zwei Buttons: *Jump* und *Skip*.
Damit können wir einzelne Actions überspringen oder den Zustand zu einem bestimmten Zeitpunkt rekonstruieren.
Die Anwendung reagiert live auf die Zustandsänderungen, sodass wir das Ergebnis direkt im Browser betrachten können.
Am unteren Rand befindet sich außerdem ein Slider, mit dem wir schrittweise durch die Zustände der Anwendung navigieren können.

In \autoref{fig:dev-tools:skip-acktion} wurde die Action `[Book] Load Books Success` mit der Schaltfläche *Skip* übersprungen.
Nun ist links in der Anwendung der Ladeindikator zu sehen.
\begin{widefig}
	{fig:dev-tools:skip-acktion}
	{Time Travel Debugging}
	\includegraphics[width=\totalwidth]{images/statemanagement/developer-tool-skip-action.png}
\end{widefig}

\suppressindent
\footnote{States exportieren}Weitere interessante Features verstecken sich hinter den Buttons am unteren Rand:
Damit können wir unter anderem alle Actions und Zustände als JSON-Datei exportieren und später wieder importieren.
Ein solcher Export kann z.\,B. an ein anderes Teammitglied übermittelt werden, das damit den gleichen Anwendungsstatus erzeugen kann wie wir.

\vspace{\baselineskip}\noindent
Mit diesem Debugging-Werkzeug haben wir also an einem Ort einen zentralen Überblick über alle Ereignisse der Anwendung.
Wir können den Zustand des Systems überwachen und so auch Fehler bei der Entwicklung einfacher aufspüren.


## Redux und NgRx: Wie geht's weiter?

Wir haben in diesem Kapitel die Grundlagen der Redux-Architektur und des Frameworks NgRx kennengelernt.
Tatsächlich geht die Reise aber noch viel weiter!
Wir möchten Ihnen in diesem Abschnitt einen Ausblick geben, welche Tools und Konzepte Ihnen dabei noch begegnen werden.


### Actions gruppieren mit `createActionGroup()`


Wir haben die Funktion `createAction()` kennengelernt, um einzelne Actions zu erstellen.
Zum Laden der Buchliste haben wir auf diese Weise drei einzelne Actions definiert, siehe \autoref{lst:ngrx:bookactions} auf \autopageref{lst:ngrx:bookactions}.
Dafür war viel repetitiver Code notwendig: Wir mussten den Variablennamen definieren, das Präfix `[Book]` setzen und den Type der Action als String angeben.

Um die Erzeugung der Actions zu vereinfachen, wurde mit NgRx~13.2 die Funktion `createActionGroup()` eingeführt.
Damit können wir eine Gruppe von Actions mit einem gemeinsamen Präfix anlegen.
Die drei Actions aus dem vorherigen Beispiel lassen sich also wie folgt definieren:{\tolerance2000\par}

\lstinputlisting[caption={Actions als Gruppe definieren \textup{(\file{book.actions.ts})}}, label=lst:ngrx:bookactionsgroup, language=js,breakatwhitespace=true,belowskip=0pt]{\snippets/reduxngrx/ngrx/action-group.ts}

Die Besonderheit an diesem Ansatz ist, dass wir die Variablennamen nicht mehr von Hand notieren müssen.
Wir können die Actions als z.\,B. `BookActions.loadBooks()` verwenden –  der Name des Propertys wird automatisch aus dem Action Type ermittelt.
Auf diese Weise sparen wir uns viel Tipparbeit.

Bitte beachten Sie: Um die Actions zu verwenden, müssen wir nun immer das gesamte Objekt `BookActions` importieren, nicht die einzelnen Actions.
In den Komponenten, Reducers und Effects sind also auch Anpassungen nötig, um diesen Ansatz zu nutzen.


### Routing




Der Anwendungszustand setzt sich nicht nur aus geladenen Daten und Einstellungen zusammen –  die aktuell geladene Route und ihre Parameter gehören ebenfalls in den State.
Beachtet man dies nicht, so sieht man gegebenenfalls zum richtigen State die falsche Komponente auf der Oberfläche.
Deshalb sollten Informationen zum Routing auch im NgRx-Store abgelegt werden.
Den passenden Adapter zwischen Router und Store erhalten wir mit dem Modul `@ngrx/router-store`:
\begin{clilisting}[caption={Router-Store installieren}]
ng add @ngrx/router-store
\end{clilisting}

Das Modul verfügt über eigene Actions und Reducers und kommuniziert direkt mit dem Router.
Dadurch werden alle Aktivitäten des Routers mit Actions abgebildet.
Es werden unter anderem die folgenden Actions ausgelöst:

\begin{itemize}
	\item `routerRequestAction`
	\item `routerNavigationAction`
	\item `routerNavigatedAction`
\end{itemize}

Die passenden Reducers fügen anschließend die Routeninformationen in den State ein, sodass wir z.\,B. die Routenparameter in den Komponenten, Reducers und Effects auslesen können.

### Entity Management



Verwalten wir Entitäten in unserem State (z.\,B. Bücher), so müssen wir in den Reducers für jede Entität wiederkehrende Routinen implementieren:
Wir müssen eine Liste in den State schreiben und die Liste pflegen, indem wir Objekte einfügen, aktualisieren oder löschen.
Bei der Suche nach einem bestimmten Objekt müssen wir stets durch die Liste laufen und dabei z.\,B. `Array.find()` verwenden.

Diese wiederkehrenden Aufgaben sind für fast alle Entitäten notwendig und verleiten zu redundantem Code.
Um diese Zugriffe auf den State zu vereinfachen, existiert das Paket `@ngrx/entity`:
\begin{clilisting}[caption={Entity-Verwaltung installieren}]
ng add @ngrx/entity
\end{clilisting}

Anstatt die Entitäten selbst im State zu deklarieren, können wir die vorgegebene Struktur des Entity-Adapters nutzen.
Jedes State-Interface, in dem Entitäten verwaltet werden, muss dazu das Interface `Entity\-State` erweitern:

\lstinputlisting[caption={`EntityState` implementieren}, label=lst:ngrx:entitystate, language=js,breakatwhitespace=true]{\snippets/reduxngrx/entity/state.ts}

Der `EntityState` gibt eine Datenstruktur vor, in der die Entitäten in einem Objekt abgelegt werden; als Schlüssel werden die IDs der Entitäten verwendet.
Ein Objekt vereinfacht die Suche nach einer Entität mit einer bestimmten~ID.
Die geordnete Reihenfolge einer Liste geht allerdings bei einem Objekt verloren.
Deshalb werden zusätzlich die~IDs in einem Array im State abgelegt, um daraus die Reihenfolge jederzeit ablesen zu können.

Durch den `EntityState` wird die folgende Struktur vorgegeben.
Der Typ `Dictionary` stammt von NgRx und beschreibt das Objekt, in dem die Entitäten gespeichert sind.

\lstinputlisting[caption={Struktur des `EntityState`}, label=lst:ngrx:entitystatestructure, language=js,breakatwhitespace=true]{\snippets/reduxngrx/entity/state-structure.ts}

Damit wir die Daten in dieser Struktur nicht eigenhändig pflegen müssen, stellt das Modul einen Adapter zur Verfügung, den wir zusätzlich initialisieren müssen.
\footnote{Primärschlüssel festlegen}Der Adapter nutzt automatisch das Property~`id` als Primärschlüssel der Entität.
Ist die ID allerdings in einem anderen Property enthalten, z.\,B. bei einem Buch die ISBN, so müssen wir eine Funktion `selectId` angeben, die die richtige ID auswählt.

\lstinputlisting[caption={`EntityAdapter` erzeugen}, label=lst:ngrx:entitycreateadapter, language=js,breakatwhitespace=true]{\snippets/reduxngrx/entity/create-adapter.ts}

Mithilfe des Adapters können wir zunächst den initialen Zustand erzeugen.
Beinhaltet unser State noch weitere Eigenschaften, so geben wir als Argument ein Objekt an:

\lstinputlisting[caption={Initialzustand erzeugen}, label=lst:ngrx:entitygetinitialstate, language=js,breakatwhitespace=true]{\snippets/reduxngrx/entity/get-initialstate.ts}

Die Mächtigkeit von `@ngrx/entity` entfaltet sich schließlich, wenn es um die Implementierung der Reducers geht.
Dazu stellt der Adapter eine Reihe von Methoden zur Verfügung, mit denen wir die Kollektion von Entitäten im State verwalten können:
\begin{flushleft}
  \tabcolsep4pt
  \vskip-4mm
  \begin{longtable}{@{}lp{89mm}@{}}
    `addOne` & eine Entität hinzufügen \\
    `addMany` & mehrere Entitäten hinzufügen \\
    `setAll` & Kollektion vollständig ersetzen \\
    `setOne` & eine Entität hinzufügen oder ersetzen \\
    `setMany` & mehrere Entitäten hinzufügen oder ersetzen \\
    `removeOne` & eine Entität aus der Kollektion entfernen \\
    `removeMany` & mehrere Entitäten aus der Kollektion entfernen\newline (nach ID oder Prädikatsfunktion) \\
    `removeAll` & Kollektion leeren \\
    `updateOne` & eine Entität aktualisieren \\
    `updateMany` & mehrere Entitäten aktualisieren \\
    `upsertOne` & eine Entität hinzufügen oder aktualisieren\newline (mit partiellen Änderungen) \\
    `upsertMany` & mehrere Entitäten hinzufügen oder aktualisieren \\
    `map` & Kollektion aktualisieren mithilfe einer Projektionsfunktion
  \end{longtable}
\vskip-9mm
\end{flushleft}

Alle Funktionen erhalten den aktuellen State und die zu verarbeitenden Werte als Argument und erzeugen einen neuen State.
Wir können den so erzeugten State also direkt aus dem Reducer zurückgeben oder verwenden, um einen komplexeren State mit weiteren Änderungen zu erzeugen:

\lstinputlisting[caption={Reducer mit Adapter-Funktionen}, label=lst:ngrx:entityreducer, language=js,breakatwhitespace=true]{\snippets/reduxngrx/entity/reducer.ts}

Der EntityAdapter stellt außerdem eine Reihe von Selektoren zur Verfügung, die wir nutzen können, um die Kollektion auszulesen.
Die Selektoren werden mithilfe von `adapter.getSelectors()` erzeugt, müssen dann allerdings noch in einzelne Selektoren verpackt werden, die den jeweiligen Feature-State als Grundlage nutzen:

\lstinputlisting[caption={Selektoren mit `getSelectors()`}, label=lst:ngrx:entityselectors, language=js,breakatwhitespace=true]{\snippets/reduxngrx/entity/selectors.ts}

Auf diese Weise können wir die Verwaltung von Entitäten im State sehr effizient durchführen.

### Testing


Alle auf Grundlage von NgRx entwickelten Bausteine sollten auch getestet werden.
Dafür möchten wir Ihnen in diesem Abschnitt einige Hinweise geben.
Grundsätzlich werden bei der Initialisierung mit den Schematics von NgRx bereits Grundgerüste für die Unit-Tests angelegt –  Sie können also direkt loslegen.

\subsubsection*{Actions}
Die Action Creators beinhalten keine spezifische Logik, die getestet werden muss.
In manchen Blogartikeln wird vorgeschlagen, die korrekte Zusammensetzung der Objekte zu prüfen, damit eine Action stets den richtigen `type` besitzt.
Wir sind der Meinung, dass solche trivialen Tests keinen Mehrwert liefern und deshalb nicht notwendig sind.

\subsubsection*{Reducers}


Ein Reducer ist eine Pure Function, liefert also für die gleiche Eingabe immer die gleiche klar vorhersehbare Ausgabe.
Diese Eigenschaft kommt uns beim Testing zugute, denn wir können Reducers isoliert testen, ohne dass Angular dafür benötigt wird.
Dazu rufen wir die Reducer-Funktion mit einem Startzustand und einer Action auf und prüfen den erzeugten neuen Zustand.

\lstinputlisting[caption={Reducer testen \textup{(\file{book.reducer.spec.ts})}}, label=lst:ngrx:testingreducer, language=js,breakatwhitespace=true,belowskip=0pt]{\currentBm/src/app/books/store/book.reducer.spec.ts}

\subsubsection*{Selektoren}
Zum Testen von Selektoren gibt es verschiedene Herangehensweisen.
Auch wenn ein Selektor mithilfe von `createSelector()` erstellt wurde, so ist er weiterhin nur eine Funktion, die den State als Argument erhält und Berechnungen über die Daten ausführt.
Wir können also auch Selektoren isoliert testen, ohne dass wir einen Store oder das Angular-Framework benötigen.
Dazu erstellen wir im Test ein State-Objekt, das alle benötigten Daten enthält.
Wir wenden den Selektor darauf an und prüfen das Ergebnis.
Wichtig ist, dass wir in diesem Stub stets die Struktur des Root-States abbilden, denn der ist ja auch der Ausgangspunkt eines jeden Selektors.

Die Hilfsfunktion `book()` haben wir selbst definiert. Sie generiert einfache Buch-Objekte mit Beispieldaten, sodass wir schnell Testdaten erzeugen können.

\pagebreakbeforelisting
\lstinputlisting[caption={Einfache Selektoren testen \textup{(\file{book.selectors.spec.ts})}}, label=lst:ngrx:testingselector, language=js,breakatwhitespace=true]{\currentBm/src/app/books/store/book.selectors.spec.ts}

Bei komplexeren Selektoren, die mehrere andere Selektoren als Grundlage verwenden, liegt die kritische Logik in der Projektionsfunktion, die im letzten Argument von `createSelector()` angegeben wird.
Es ist deshalb in den meisten Fällen ausreichend, nur diese Projektion zu testen.
Zugriff auf die Funktion erhalten wir mit `selector.projector`:

\lstinputlisting[caption={Projektionsfunktion testen \textup{(\file{book.selectors.spec.ts})}}, label=lst:ngrx:testingselectorprojector, language=js,breakatwhitespace=true,firstline=4,lastline=12,belowskip=0pt]{\currentBm/src/app/books/store/book.selectors.1.spec.ts}

\subsubsection*{Effects}

Effects sind nur schwierig isoliert zu testen, denn sie greifen auf verschiedene Abhängigkeiten aus der Anwendung zu.
Dazu ist nicht nur das Modul `@ngrx/effects` nötig, sondern auch alle verwendeten HTTP-Services.
Außerdem muss das Observable `actions\$: Actions` mit einem Strom von Actions versorgt werden, und wir wollen keinen vollständigen Store aufsetzen.

\footnote{`provideMockActions()`}NgRx bietet dafür die Funktion `provideMockActions()`, die einen gemockten Strom von Actions bereitstellt.
Tests für Effects müssen mithilfe von `TestBed` definiert werden, sodass wir die Dependency Injection von Angular nutzen können.
Alle verwendeten Services müssen selbstverständlich auch durch Mocks oder Stubs ersetzt werden, damit keine echten HTTP-Requests ausgeführt werden.

\pagebreakbeforelisting
\lstinputlisting[caption={Grundgerüst zum Testen von Effects \textup{(\file{book.effects.spec.ts})}}, label=lst:ngrx:testingeffect, language=js,breakatwhitespace=true]{\currentBm/src/app/books/store/book.effects.spec.ts.1.snippet}

Für die konkreten Tests müssen wir ein Observable von Actions bereitstellen und das ausgegebene Observable sowie ggf. die ausgeführten Seiteneffekte prüfen.
Das \autoref{lst:ngrx:testingeffectFull} zeigt einen vollständigen Testaufbau.
Hier stellen wir sicher, dass der Effect die gewünschte Action ausgibt und die Daten wie gewünscht über den `BookStoreService` bezieht.%blank line down

\lstinputlisting[caption={Vollständiger Test für einen Effect \textup{(\file{book.effects.spec.ts})}}, label=lst:ngrx:testingeffectFull, language=js,breakatwhitespace=true]{\currentBm/src/app/books/store/book.effects.spec.ts.2.snippet}

\footnote{Marble Testing}Der Aufbau lässt sich vereinfachen, wenn wir nur die Datenströme miteinander vergleichen.
Dazu eignet sich das Konzept des *Marble Testing*:
Anstatt ein Observable wie üblich zu erzeugen und dann darauf zu subscriben, notieren wir den geplanten Datenstrom als Marble-Diagramm direkt im Test und definieren damit die Eingabe und die erwartete Ausgabe.
Die technische Grundlage dafür bietet das Paket \mbox{`jasmine-marbles`}.\shortlinkFootnote{link-jasmine-marbles}
Das Projekt stellt auch den Matcher `toBeObserv\-able()` zur Verfügung, mit dem wir in der Expectation direkt gegen das erzeugte Observable prüfen können:

\lstinputlisting[caption={Effects testen mit Marbles \textup{(\file{book.effects.spec.ts})}}, label=lst:ngrx:testingmarble, language=js,breakatwhitespace=true,belowskip=0pt]{\currentBm/src/app/books/store/book.effects.marble.spec.ts.snippet}

\subsubsection*{Store}

Komponenten und Effects greifen häufig auf den Store zu.
Unter anderem werden Actions in den Store gesendet (dispatcht), und der aktuelle Zustand wird mithilfe von Selektoren ermittelt.
Wenn man für solche Komponenten oder Effects einen Unit-Test definieren will, benötigt man einen Ersatz für den echten Store.
\footnote{`provideMockStore()`}NgRx bietet uns hierfür die Funktion `provideMockStore()` an:
Wir können damit einen gemockten Store registrieren, der einen von uns definierten Zustand besitzt.
Dieser Zustand bleibt so lange unverändert, bis wir mittels `store.setState()` einen anderen Zustand setzen.
Als Beispiel wollen wir den bekannten Effect zum Laden der Bücher so erweitern, dass er nur dann Bücher lädt, wenn die Buchliste im State noch leer ist.
Hat das Array bereits Einträge, soll nichts passieren.

Es ist für dieses Szenario notwendig, dass wir den bestehenden State im Effect berücksichtigen.
Dies können wir mit dem Operator `concat\-Latest\-From()` aus dem Paket `@ngrx/effects` realisieren:
Wir übergeben ein anderes Observable als Argument, und der Operator reichert den Hauptdatenstrom mit dem jeweils letzten Element aus diesem Observ\-able an.
Das bedeutet also, dass uns in den Effects neben dem Payload aus den Actions auch zusätzlich Daten aus dem Store zur Verfügung stehen.
Wir verwenden hier direkt unseren Selektor `selectAllBooks`, um die aktuelle Buchliste aus dem Store zu erhalten.
Anhand der Buchliste können wir dann mit dem Operator `filter()` entscheiden, ob die Bücher neu heruntergeladen werden sollen oder nicht.

\pagebreakbeforelisting
\lstinputlisting[caption={Effect zum Laden der Buchliste mit Filter \textup{(\file{book.effects.spec.ts})}}, label=lst:ngrx:testingeffectwithFilter, language=js,breakatwhitespace=true]{\currentBm/src/app/books/store/book.effects.alternative.ts.snippet}

Für diesen Effect sollten wir sicherstellen, dass bei einem leeren Array auch tatsächlich die Action `loadBooksSuccess` gefeuert wird –  und dass dies bei einem gefüllten Array eben gerade nicht passiert.
Mittels `provide\-MockStore()` stellen wir vor jeder Spezifikation zunächst den  vorgetäuschten\ Store bereit.
Für die zweite Spezifikation ändern wir den State anschließend noch einmal mittels `store.setState()` ab:%blank line down

\lstinputlisting[caption={Effects testen mit dem `MockStore` \textup{(\file{book.effects.spec.ts})}}, label=lst:ngrx:testingMockStore1, language=js,breakatwhitespace=true]{\currentBm/src/app/books/store/book.effects.alternative.spec.ts.snippet}

Ebenso können wir mit dem `MockStore` die Rückgabewerte von Selektoren überschreiben.
Unser letztes Beispiel zum Thema zeigt, wie wir sicherstellen können, dass die `BookListComponent` tatsächlich den Text * Loading~...* anzeigt, wenn im State das Loading-Flag entsprechend gesetzt ist (siehe \autoref{lst:ngrx:useselectorsblc} und \autoref{lst:ngrx:blchtml} ab \autopageref{lst:ngrx:useselectorsblc}).
Es ist dabei nicht notwendig, den State im `MockStore` zu setzen, da wir auf diesen nicht direkt zugreifen.
Die Komponente bezieht ihre Daten über die beiden Selektoren `select\-All\-Books` und `select\-Books\-Loading`, die wir entsprechend "ausmocken":

\lstinputlisting[caption={Selektoren mocken mit dem `MockStore` \textup{(\file{\mbox{book-list}"".component.spec.ts})}}, label=lst:ngrx:ngrx:testingMockStore2, language=js,breakatwhitespace=true]{\currentBm/src/app/books/book-list/book-list.component.spec.ts.snippet}

Wie Sie sehen, stellt NgRx einige Hilfen und Konzepte bereit, um die einzelnen Bausteine effektiv zu testen.
Vor allem die Funktionen `provide\-Mock\-Actions()` und `provide\-Mock\-Store()` erleichtern uns das Testing für komplexe Szenarien in NgRx.

### Hilfsmittel für Komponenten: `@ngrx/component`



Das Paket `@ngrx/component` stellt eine Sammlung von nützlichen Helfern zur Verfügung, um mit reaktiven Datenströmen in Komponenten zu arbeiten.
Die Werkzeuge sind dabei nicht auf den Einsatz mit NgRx beschränkt, sondern können auch unabhängig davon eingesetzt werden.
Das Paket beinhaltet zwei elementare Bausteine: die Let-Direktive und die PushPipe.

\footnote{AsyncPipe}Üblicherweise verwenden wir die AsyncPipe von Angular, um Observables direkt im Template einer Komponente aufzulösen.
Das ist der Weg, den wir vor allem beim Einsatz von NgRx wählen, denn die Daten kommen bereits vollständig aufbereitet durch Observables in die Komponente.
Die AsyncPipe kann in jedem Template-Ausdruck eingesetzt werden, also in der Interpolation, in Property Bindings und in Direktiven.
Gemeinsam mit `ngIf` und der `as`-Syntax können wir das Ergebnis eines Observables so in einem DOM-Container verfügbar machen.

\lstinputlisting[caption={AsyncPipe verwenden}, label=lst:ngrx:compasncpipe, language=js,breakatwhitespace=true]{\snippets/reduxngrx/ngrxcomponent/asyncpipe.html}

So praktisch die AsyncPipe allerdings auch ist –  sie birgt einige praktische Probleme.

\subsubsection*{ngrxLet: Observables auflösen mit falsy Werten}


Die oben beschriebene Kombination von AsyncPipe und `ngIf` ist hilfreich, um die Daten aus dem Observable `numbers\$` im Template verfügbar zu machen.
Liefert das Observable allerdings einen *falsy* Wert –  also `false`, `0`, `null`, `undefined`, `NaN` oder einen leeren String – , so wird der jeweilige Container durch `ngIf` gar nicht angezeigt.

Um dieses Problem zu umgehen, kann die Direktive `ngrxLet` eingesetzt werden.
Sie löst ein Observable im Template auf und stellt die empfangenen Daten in einer lokalen Variable zur Verfügung.
Im Gegensatz zu `ngIf` bleibt das DOM-Element dabei stets sichtbar und wird nicht ausgeblendet.
Liefert `numbers\$` also eine `0`, so wird der Container im folgenden Beispiel trotzdem angezeigt.
Darüber hinaus erhält man mit `ngrxLet` bei Bedarf auch Zugriff auf mögliche Error- und Complete-Ereignisse des Observables.

\lstinputlisting[caption={Direktive `ngrxLet` verwenden}, label=lst:ngrx:completdirective, language=js,breakatwhitespace=true,belowskip=0pt]{\snippets/reduxngrx/ngrxcomponent/letdirective.html}

\subsubsection*{PushPipe: Observables auflösen ohne Zone.js}


Die AsyncPipe von Angular hat den Vorteil, dass sie automatisch die betroffene Komponente als *dirty* markiert, sobald ein neuer Wert im Observable ausgegeben wird.
Daraufhin wird diese Komponente beim nächsten Durchlauf der Change Detection geprüft, sodass die View aktualisiert wird.
Durch diesen Mechanismus ist es möglich, in allen Komponenten die Strategie `OnPush` für die Change Detection zu aktivieren.
Die AsyncPipe ist allerdings stets abhängig von der Bibliothek Zone.js, die für bestimmte Ereignisse in der Anwendung automatisch die Change Detection triggert.

Im Abschnitt zur Change Detection ab \autopageref{sub:cd:zoneless} beschreiben wir einen Weg, um Angular ohne Zone.js zu verwenden.
Entwickelt man die Anwendung durchweg mit den Prinzipien der Reaktiven Programmierung, so kann es sinnvoll sein, auf die automatische Change Detection zu verzichten.
Hier setzt die Pipe `ngrxPush` von NgRx an, die als Alternative zur AsyncPipe genutzt werden kann.
\footnote{Zoneless Angular}Der elementare Unterschied: Die PushPipe triggert die Change Detection direkt, anstatt die Komponente nur für den nächsten Durchlauf als *dirty* zu markieren.
Die PushPipe ist damit unabhängig von Zone.js und kann in einer *zoneless* Umgebung eingesetzt werden.
Das kann sich positiv auf die Performance der Anwendung auswirken.

Übrigens ermittelt die PushPipe automatisch, ob Zone.js in der Anwendung aktiviert ist, und kann dadurch auch das Verhalten der Async\-Pipe annehmen.
Auch die zuvor beschriebene Direktive `ngrxLet` baut auf derselben Grundlage auf und kann ohne Zone.js eingesetzt werden.

\pagebreakbeforelisting
\lstinputlisting[caption={Pipe `ngrxPush` verwenden}, label=lst:ngrx:comppushpipe, language=js,breakatwhitespace=true,belowskip=0pt]{\snippets/reduxngrx/ngrxcomponent/pushpipe.html}

### Facades: Zustandsverwaltung abstrahieren

Um den Anwendungszustand mit NgRx zu verwalten, kommunizieren die Komponenten mit dem zentralen Store: Sie senden Actions in das System und lesen Daten mithilfe von Observables aus.
Dafür müssen wir die Klasse `Store` als direkte Abhängigkeit in den Komponenten verwenden.
Außerdem müssen wir die Actions und Selektoren importieren.

Damit sind die Komponenten stets abhängig von den Bausteinen des Frameworks NgRx.
Das erschwert insbesondere das Testing und die Wiederverwendbarkeit.
Außerdem müssen wir uns für das State Management auf eine spezifische Lösung festlegen.
Jeglicher State wird global im Store abgelegt, und ein Mischbetrieb mit anderen Ansätzen führt potenziell zu unsauberem Code in der Komponente.

\footnote{Facade: Schnittstelle für die Komponenten}Um diese Unschönheiten zu lösen, können wir eine *Facade* verwenden:
Dafür erstellen wir einen Service, der eine Schnittstelle zwischen der Komponente und dem Store bildet.
Die Komponente kommuniziert über Methoden und Propertys mit der Facade.
Das Framework NgRx bleibt dabei verborgen, und wir halten die Komponente frei von frameworkspezifischem Code.

\begin{fig}
	{fig:redux-facade}
	{NgRx Flow mit Facade}
	{NgRx Flow mit Facade}
	{10pt}
	\includegraphics[width=\textwidth]{images/statemanagement/facade}
\end{fig}

\suppressindent
Zur Implementierung nutzen wir einen einfachen Service, der mit dem Store kommuniziert.
Als öffentliche Schnittstelle werden gut lesbare Methoden und Propertys angeboten.

\pagebreakbeforelisting
\lstinputlisting[caption={Beispiel für eine Facade}, label=lst:ngrx:facade, language=js,breakatwhitespace=true]{\snippets/reduxngrx/ngrx/books.facade.ts}

In der Komponente nutzen wir die Facade, um die Daten aus den Propertys zu lesen und Aktionen mithilfe der angebotenen Methoden auszulösen.

\lstinputlisting[caption={Facade in der Komponente verwenden}, label=lst:ngrx:facadeusage, language=js,breakatwhitespace=true]{\snippets/reduxngrx/ngrx/facade-usage.ts}

Im Unit-Test können wir einen solchen Service leicht durch einen Stub ersetzen.
Die Propertys und Methoden können dabei in einem einfachen Objekt nachgebildet werden, ohne die Schnittstelle des Stores ausmocken zu müssen.
Im Kapitel zum Testing haben wir ab \autopageref{sec:testing:replacestub} auf diese Weise einen Stub für den `BookStoreService` bereitgestellt.

\lstinputlisting[caption={Unit-Testing: Stub für die Facade}, label=lst:ngrx:facadestub, language=js,breakatwhitespace=true]{\snippets/reduxngrx/ngrx/facade-stub.ts}

Ein weiterer großer Vorteil dieser Idee liegt darin, dass wir die Implementierung für das State Management jederzeit austauschen oder variieren können.
So ist es zum Beispiel möglich, bestimmte Teile des States rein lokal in der Facade zu verarbeiten und gar nicht an den zentralen NgRx Store zu übermitteln.
Einen Ansatz für die Verwaltung von lokalem State bietet das Projekt `@ngrx/component-store`, das wir am Ende dieses Kapitels kurz vorstellen.


\footnote{Manueller Provider}Für eine Facade empfehlen wir übrigens, keinen Tree-Shakable Provider zu verwenden.
Stattdessen tragen wir die Facade unter `providers` in dem Modul ein, das auch den Feature-State bereitstellt.
Auf diese Weise ist garantiert, dass der Feature-State korrekt registriert ist, wenn wir die Facade verwenden.


\section*{Fazit}

Mithilfe von Redux und NgRx können wir die Zustandsverwaltung in der Anwendung zentralisieren.
Redux setzt auf ein unveränderliches Zustandsobjekt, das mithilfe von Pure Functions im Store verwaltet wird.
Alle Ereignisse der Anwendung werden durch Actions signalisiert, die Änderungen am Zustand auslösen können.
Dabei erzeugen die Reducers einen neuen Zustand, der über ein Observable an alle Interessierten ausgegeben wird.
Jeder Baustein von NgRx hat eine klar definierte Aufgabe, was eine konsistente Struktur in das Projekt bringt.
Die Teile der Architektur sind stark entkoppelt, sodass sie unabhängig voneinander entwickelt und gewartet werden können.

Mit Redux lassen sich komplexe Strukturen in Projekten harmonisieren.
Das bedeutet allerdings nicht, dass Redux für jede Anwendung die passende Architektur ist.
Bewerten Sie deshalb für ein Projekt zunächst, ob sich der Einsatz von Redux wirklich lohnt.
Die Thematik ist nicht trivial –  um eine solche zentrale Zustandsverwaltung sicher und effektiv einzusetzen, braucht es Zeit und Übung.
Die offizielle Dokumentation von NgRx\shortlinkFootnote{link-ngrxio} ist ein guter Ausgangspunkt, um alle Funktionen und Konzepte weiter zu studieren.

Zusätzlich haben wir das Beispiel aus diesem Kapitel auf GitHub zur Verfügung gestellt, sodass Sie den Code vollständig nachvollziehen können.

\qrdemo{bm5-ngrx}


\input{chapter/redux/componentstore}

%%% Local Variables:
%%% TeX-PDF-mode: t
%%% mode: latex
%%% TeX-master: "../../angularBuch"
%%% End:


================================================
File: /tex/chapter/tipps/prettier.tex
================================================
\chapter[Powertipp: Codeformatierung mit Prettier]{Powertipp:\newline Codeformatierung mit Prettier}



Wir haben bei der Projekteinrichtung ab \autopageref{sec:eslint} bereits das Projekt ESLint kennengelernt und eingerichtet.
ESLint führt eine syntaktische und semantische Prüfung des Codes durch, die sich nach dem Styleguide sowie gängigen Best Practices für JavaScript und TypeScript richtet.

\footnote{Einheitliche Formatierung mit Prettier}ESLint kümmert sich allerdings nicht um die reine Formatierung des Codes: Wie werden Klammern gesetzt? Wie werden Blöcke eingerückt? Werden optionale Klammern bei Arrow Functions gesetzt? Für solche Fragen müssen wir im Entwicklungsteam einen Konsens finden und die Formatierung idealerweise automatisieren.
Im Web-Umfeld hat sich in den letzten Jahren das Projekt Prettier\shortlinkFootnote{link-prettier} durchgesetzt, um Quellcode automatisch und einheitlich zu formatieren.

Prettier ist auf die reine Formatierung spezialisiert, während ESLint vor allem inhaltliche Prüfungen durchführt.
Trotzdem ist auch ESLint in der Lage, bestimmte Formatierungsregeln zu prüfen und zu korrigieren.
Damit beide Tools nicht gegeneinander arbeiten, sondern miteinander und unabhängig von der Reihenfolge der Ausführung immer zum gleichen Ergebnis führen, müssen wir bei der Installation und Konfiguration von Prettier einige Punkte beachten.
Die folgenden Schritte setzen voraus, dass ESLint bereits im Projekt eingerichtet ist.

\footnote{Installation}Zunächst müssen wir Prettier mit den zugehörigen Plug-ins im Projekt installieren:

\begin{clilisting}[style=nocaption]
npm install prettier prettier-eslint eslint-config-prettier eslint-plugin-prettier --save-dev
\end{clilisting}

\footnote{ESLint mit Prettier konfigurieren}Wir müssen als Nächstes einige Änderungen an der Datei \file{.\mbox{eslintrc}"".json} vornehmen.
Sie sind für ein harmonisches Zusammenspiel von Prettier und ESLint notwendig.
Details und Hintergründe dazu finden Sie in der Dokumentation zum Paket `angular-eslint`.\shortlinkFootnote{link-angular-eslint-prettier}

\pagebreakbeforelisting
\lstinputlisting[caption={ESLint-Konfiguration anpassen \textup{(\file{.eslintrc.json})}},label=lst:prettier:eslintrc]{\snippets/prettier/eslintrc.snippet.json}

Im Anschluss ist Prettier einsatzbereit und arbeitet Hand in Hand mit ESLint.
Wir können das Tool nun über die Kommandozeile aufrufen.
Damit der Befehl mit allen Argumenten nicht immer wieder per Hand eingegeben werden muss, empfehlen wir, ein NPM-Skript in der Datei \file{package.json} zu hinterlegen:

\pagebreakbeforelisting
\lstinputlisting[caption={NPM-Skript `format` \textup{(\file{package.json})}},label=lst:prettier:npmformat]{\snippets/prettier/package.snippet.json}

Im Anschluss können wir Prettier wie folgt ausführen:

\begin{clilisting}[style=nocaption]
npm run format
\end{clilisting}

Um die Formatierung direkt im Editor Visual Studio Code durchzuführen, können wir die offizielle Extension für Prettier installieren: `esbenp.prettier-vscode`.
Diesen Namen können Sie in der Suche im Extension Browser von Visual Studio Code eingeben.

Außerdem empfehlen wir, die folgenden Einstellungen in der Datei \file{.vscode/settings.json} im Projekt zu setzen:

\lstinputlisting[caption={Automatische Formatierung durch Visual Studio Code \textup{(\file{.vscode/settings.json})}},label=lst:prettier:vscsettings]{\snippets/prettier/settings.json}

Nun wird der Quellcode bei jedem Speichern der Datei mit Prettier formatiert.
Das ist während der Entwicklung besonders praktisch, weil Leerzeichen, Klammern und Einrückungen beim Tippen zunächst vernachlässigt werden können. Beim Speichern sorgt Prettier automatisch für die korrekte Formatierung.

\footnote{Prettier konfigurieren}Das Verhalten von Prettier kann konfiguriert werden, um den individuellen Stil des Teams zu berücksichtigen.
Dazu legen wir im Hauptverzeichnis des Projekts eine Datei mit dem Namen \file{.prettierrc} an.
Alle verfügbaren Optionen sind in der offiziellen Dokumentation zu finden.\shortlinkFootnote{link-prettier-config}

%%% Local Variables:
%%% TeX-PDF-mode: t
%%% mode: latex
%%% TeX-master: "../../angularBuch"
%%% End:


================================================
File: /tex/chapter/eap.tex
================================================
\section*{EAP -- Early Access Programm}
Lieber \{\{ Leser \}\}, \\
\\
wir freuen uns sehr, dass du uns bei der Verbesserung unseres Buchs unterstützen möchtest.
Mit unserem Buch möchten wir der Community einen soliden Start mit Angular anbieten.
Wir legen großen Wert auf Verständlichkeit und Praxisnähe -- daher freuen wir uns über jedes Feedback von dir.\\
\\
Dies ist die Vorabversion der **dritten Auflage** des Buchs.
Wir haben viele Aktualisierungen vorgenommen und teilweise auch ganze Kapitel neu aufgerollt oder strukturiert.
Viele Inhalte befinden sich noch in Arbeit oder werden von uns überdacht.
Dieses Buch wird -- wie Angular -- stetig korrigiert, verbessert und erweitert, bis es seine endgültige Form erhalten hat.

Die **Deadline** für die Abgabe beim Verlag ist der **12. Juni 2020**.
Bis dahin müssen wir alle Korrekturen eingepflegt haben.
Das Buch erscheint dann voraussichtlich im September im Buchhandel.

### Einreichen von Feedback
Bei Ideen, Anregungen und oder Korrekturen sende bitte eine *E-Mail* an:

\begin{center}
	**\author{\href{mailto:trello@angular-buch.com**{trello@angular-buch.com}}}.
\end{center}

Am besten ist es, wenn Du Kommentare direkt in das PDF schreibst.
Du kannst aber gerne auch ein separates Textdokument anlegen und jeweils auf die Abschnittsnummer und die Seitenzahl verweisen.

\begin{center}
	Viel Spaß beim Lesen und vielen Dank für deine Unterstützung!
\end{center}

### Bekannte Probleme

\begin{itemize}
\item Die Nummerierung der Fußnoten ist teilweise fehlerhaft.
\item Es gibt zu große Abstände zu Überschriften, unschöne Seitenumbrüche oder leere Seiten.
\item Die automatische Silbentrennung erzeugt falsche Worttrennungen.
\item Tabellen und Abbildungen finden sich teilweise an unerwarteten Stellen wieder.
\end{itemize}

Fehler in der Ausrichtung und im Satz sind momentan gar nicht interessant -- es geht zunächst um den Inhalt!



%%% Local Variables: 
%%% TeX-PDF-mode: t
%%% mode: latex
%%% TeX-master: "../angularBuch"
%%% End: 




================================================
File: /tex/chapter/vorwort/raetsel.tex
================================================
\makeatletter
\@openrightfalse
\makeatother
\chapter*{Rätselzeit} % bitte nicht ins TOC

\vspace{-2cm}
\includegraphics[width=\textwidth]{images/raetsel.pdf}

\begin{flushleft}
	\begin{tabular}{@{}rp{98mm}@{}}
		**1** & Lifecycle-Methode, die bei Initialisierung der Komponente ausgeführt wird \\
		**2** & Teil der Template-Syntax, wird in runden Klammern notiert\\
		**3** & Programmiersprache von Angular\\
		**4** & Direktive zur Verlinkung zwischen Routen\\
		**5** & Sprachelement, mit dem z.\,B. eine Klasse als Komponente oder Injectable markiert wird, wird mit `@` notiert\\
		**6** & Baustein von Angular, um das Verhalten eines DOM-Elements zu ändern, besitzt aber kein eigenes Template\\
		**7** & Baustein von Reactive Forms, verwaltet mehrere Controls mit einer festen Reihenfolge\\
		**8** & Baustein aus RxJS, mit dem Multicasting realisiert werden kann, ist ein Hot Observable\\
		**9** & Konzept, um Bestandteile einer Anwendung zur Laufzeit nachzuladen, sobald sie benötigt werden\\
		**10** & Helfer im Template, um ein Datum zu formatieren\\
	\end{tabular}
\end{flushleft}

\suppressindent
Alle Begriffe müssen ohne Leerzeichen angegeben werden.\\**Viel Spaß beim Knobeln!**


%%% Local Variables:
%%% TeX-PDF-mode: t
%%% mode: latex
%%% TeX-master: "../../angularBuch"
%%% End:


================================================
File: /tex/chapter/vorwort/changelog-archiv.tex
================================================

\section*{Aktualisierungen in der zweiten Auflage}

### Neue Kapitel

Folgende Kapitel und Abschnitte sind in der **zweiten Auflage** neu hinzugekommen:
\begin{itemize}
	\item \changelogallref{ch:09interceptors}
	\item \changelogallref{sec:universal}
	\item \changelogallref{P_ww} \begin{itemize}
		\item \changelogallref{sec:cli:schematics}
		\item \changelogallref{sec:ww:containerpresentational}
		\item \changelogallref{sec:ww:ngfortrackby}
		\item \changelogallref{sec:ww:third-party}
		\item \changelogallref{sub:ww:update}
	\end{itemize}
\end{itemize}


### Vollständig neu geschriebene Kapitel

Einige bereits in der ersten Auflage existierende Kapitel wurden für die **zweite Auflage** vollständig neu aufgerollt:

\paragraph*{\changelogallref{sec:schnellstart}}
Der Schnellstart basierte in der ersten Auflage auf einer lokalen Lösung mit SystemJS und Paketen aus einem CDN. Der neue Schnellstart setzt auf die Online-Plattform StackBlitz zum schnellen Prototyping von Webanwendungen.

\paragraph*{\changelogallref{ch:08rxjs}} Das Prinzip der reaktiven Programmierung und das Framework RxJS haben in den letzten Jahren weiter an Bedeutung gewonnen. Das alte Kapitel zu RxJS lieferte nur einen kurzen Überblick, ohne auf Details einzugehen. Mit dieser Neufassung finden Sie jetzt eine ausführliche Einführung in die Prinzipien von reaktiver Programmierung und Observables, und es werden alle wichtigen Konzepte anhand von Beispielen erklärt. Im Gegensatz zur ersten Auflage verwenden wir die neuen *Pipeable Operators*.

\paragraph*{\changelogallref{subsection:formularverarbeitung}} In der ersten Auflage haben wir sowohl *Template-Driven Forms* als auch *Reactive Forms* gleichbedeutend vorgestellt. Wir empfehlen mittlerweile nicht mehr den Einsatz von Template-Driven Forms. Daher stellen wir zwar beide Ansätze weiterhin vor, legen aber im Kapitel zur Formularverarbeitung einen stärkeren Fokus auf Reactive Forms. Das Praxisbeispiel wurde neu entworfen, um eine saubere Trennung der Zuständigkeiten der Komponenten zu ermöglichen. Die Erläuterungen im Grundlagenteil wurden neu formuliert, um besser für die Anforderungen aus der Praxis geeignet zu sein.

\paragraph*{\changelogallref{sec:redux}} In den letzten zwei Jahren hat sich unserer Ansicht nach das Framework *NgRx* gegen weitere Frameworks wie *angular-redux* klar durchgesetzt. Während die erste Auflage in diesem Kapitel noch auf angular-redux setzte, arbeitet das Kapitel der zweiten Auflage durchgehend mit den *\foreignlanguage{english*Reactive Extensions for Angular (NgRx)}. Wir erarbeiten in der Einführung schrittweise ein Modell für zentrales State Management, um die Architektur von Redux zu erläutern, ohne eine konkrete Bibliothek zu nutzen.

### Stark überarbeitete und erweiterte Kapitel

\paragraph*{\changelogallref{chapter:typescript}} Das Grundlagenkapitel zu TypeScript wurde neu strukturiert und behandelt zusätzlich auch neuere Features von ECMAScript/TypeScript, z.\,B. Destrukturierung, Spread-Operator und Rest-Syntax.{\tolerance2000\par}

\paragraph*{\changelogallref{ch:07http}} Das HTTP-Kapitel setzt durchgehend auf den `HttpClient`, der mit Angular 4.3 eingeführt wurde.
Dabei wird der Blick auch auf die erweiterten Features des Clients geworfen. Themen, die spezifisch für RxJS sind, wurden aus diesem Kapitel herausgelöst und werden nun im RxJS-Kapitel behandelt.

\paragraph*{\changelogallref{sec:routing:resolver}} Resolver sind aus unserer Sicht nicht die beste Wahl, um reguläre Daten über HTTP nachzuladen. Der Iterationsschritt zu Resolvern wurde deshalb aus dem Beispielprojekt entfernt, und das Thema wird in dieser Auflage nur noch in der Theorie behandelt.

\paragraph*{\changelogallref{ch:i18n}} Die Möglichkeiten zur Konfiguration des Builds wurden mit Angular~6.0 stark vorangebracht.
Viele zuvor notwendige Kommando\-zeilen\-para\-meter sind nun nicht mehr notwendig, die Konfigurationsdatei \mbox{\file{angular.json}} löst diese ab. Dadurch konnten wir das Kapitel zur Internationalisierung (i18n) kürzen und verständlicher gestalten. Im Gegensatz zur ersten Auflage zeigen wir nicht mehr, wie man eine Anwendung im JIT-Modus internationalisiert, der hauptsächlich für die Entwicklung vorgesehen ist, aber nicht für produktive Anwendungen.{\tolerance5000\par}

\paragraph*{\changelogallref{sec:testing}} Das Kapitel zum Testen von Angular-Anwendungen wurde stark erweitert. Neben den reinen Werkzeugen wird der Fokus besonders auf Philosophien, Patterns und Herangehensweisen gelegt. Zusätzlich werden die mitgelieferten Tools zum Testen von HTTP und Routing betrachtet.

\paragraph*{\changelogallref{ww:change-detection}} Das Kapitel zur Change Detection wurde für besseres Verständnis neu strukturiert. Insbesondere wird auf Debugging und Strategien zur Optimierung eingegangen.


================================================
File: /tex/chapter/vorwort/ueber.tex
================================================
% {\parindent0pt
% \thispagestyle{empty}%
% \vspace*{90mm}%
% \hspace*{49mm}%
% \parbox{10em}{\centering{\itshape It's just \glq Angular\grq.}\par\nobreak\vskip1ex\relax Igor Minar}\par
% }

\Chapter*{Vorwort}
\ngcite{Angular is one of the most adopted frameworks on the planet.}{Brad Green}{ehem. Angular Engineering Director}

\noindent
Angular ist eines der populärsten Frameworks für die Entwicklung von Single-Page-Appli\-ka\-ti\-onen.
Das Framework wird weltweit von großen Unternehmen eingesetzt, um modulare, skalierbare und gut wart\-bare Applikationen zu entwickeln.
Mit Angular in Version~2.0.0 setzte Google im Jahr 2016 einen Meilenstein in der Welt der modernen Web\-entwick\-lung:
Das Framework nutzt die Programmiersprache TypeScript, bietet ein ausgereiftes Tooling und ermöglicht die komponentenbasierte Entwicklung von Single-Page-Anwendungen für den Browser und für Mobilgeräte.

In kurzer Zeit haben sich rund um Angular ein umfangreiches Ökosystem und eine vielfältige Community gebildet.
\footnote{React und Vue.js}Angular gilt neben \mbox{React.js} und \mbox{Vue.js} als eines der weltweit beliebtesten Web\-frame\-works.
Sie haben also die richtige Entscheidung getroffen, als Sie Angular für die Entwicklung Ihrer Projekte ins Auge gefasst haben.

Der Einstieg in Angular ist umfangreich, aber die Konzepte sind durchdacht und konsequent.
\footnote{Opinionated Framework}Häufig verwendet man im Zusammenhang mit Angular das Attribut *opinionated*, das wir im Deutschen mit dem Begriff *meinungsstark* ausdrücken können:
Angular ist ein meinungsstarkes Framework, das viele klare Richtlinien zu Architektur, Codestruktur und Best Practices definiert.
Das kann zu Anfang umfangreich erscheinen, sorgt aber dafür, dass in der gesamten Community einheitliche Konventionen herrschen, Standardlösungen existieren und bestehende Bibliotheken vorausgewählt wurden.

\footnote{Beispielanwendung}Sie werden in diesem Buch lernen, wie Sie mit Angular komponentenbasierte Single-Page-Applikationen erstellen.
Dazu entwickeln wir mit Ihnen gemeinsam eine Anwendung, anhand derer wir Ihnen die Konzepte und Features von Angular beibringen.
Wir führen Sie Schritt für Schritt durch das Framework –  vom Pro\-jekt\-setup über Komponenten, Routing, Formulare und HTTP bis hin zum Testing und Deployment der Anwendung.
Auf dem Weg stellen wir Ihnen eine Reihe von Tools, Tipps und Best Practices vor, die wir in mehr als sechs Jahren Praxisalltag mit Angular sammeln konnten.
Die umfangreichen Theorie\-teile eignen sich auch später als Nachschlagewerk im Entwicklungs\-alltag.

Nach dem Lesen dieses Praxisbuchs sind Sie in der Lage,
\begin{itemize}
	\item das Zusammenspiel der Funktionen von Angular sowie das Konzept hinter dem Framework zu verstehen,
	\item modulare, strukturierte und wartbare Webanwendungen mithilfe von Angular zu entwickeln sowie
	\item durch die Entwicklung von Tests qualitativ hochwertige Anwendungen zu erstellen.
\end{itemize}

Die Entwicklung mit Angular macht vor allem eines: *Spaß!*
Diesen Enthusiasmus für das Framework und für Webtechnologien möchten wir Ihnen in diesem Buch vermitteln –  wir nehmen Sie mit auf die Reise in die Welt der modernen Webentwicklung!

\section*{Versionen und Namenskonvention: Angular~vs.~AngularJS}


In diesem Buch dreht sich alles um das Framework Angular.
Die Geschichte dieses Projekts reicht zurück bis ins Jahr 2009 zur Vorgängerversion *AngularJS*.
Bis auf den ähnlichen Namen und einige Konzepte haben die beiden Frameworks aber nichts miteinander zu tun:
Angular ab Version~2 ist eine vollständige Neuentwicklung und ist nicht mit dem alten AngularJS kompatibel.

\footnote{It's just "`Angular"'.}Die offizielle Bezeichnung für das Framework ist *Angular*, ohne Angabe der Programmiersprache und ohne eine spezifische Versionsnummer.
Angular erschien im September 2016 in der Version~2.0.0 und hat viele neue Konzepte und Ideen in die Community gebracht.
Um Verwechslungen auszuschließen, gilt also die folgende Konvention:
\begin{itemize}
	\item **Angular** –  das Angular-Framework ab **Version~2 und höher** (dieses Buch ist durchgängig auf dem Stand von Angular~15)
	\item **AngularJS** –  das Angular-Framework in der **Version~1.x.x**
\end{itemize}

AngularJS wird seit Januar 2022 offiziell nicht mehr weiterentwickelt und sollte nicht mehr verwendet werden.\shortlinkFootnote{link-version-support-status}
Sie haben also die richtige Entscheidung getroffen, Angular ab Version~2.0.0 einzusetzen.

\footnote{Semantic Versioning}Die Versionsnummer~*x.y.z* basiert auf *Semantic Versioning*.\shortlinkFootnote{link-0}
Der Re\-lease-Zyklus von Angular ist kontinuierlich geplant:
Im Rhythmus von ungefähr sechs Monaten erscheint eine neue Major-Version~*x*.
Die Minor-Versionen *y* werden monatlich herausgegeben, nachdem eine Major-Version erschienen ist.
Jede Major-Version wird planmäßig für 1,5~Jahre unterstützt und weiterentwickelt (Long-Term Support).
\begingroup\renewcommand*{\thefigure}{\arabic{figure}}
\makeatletter\def\DP@pageref{1}\makeatother

\begin{widefig}
	{fig:angular-timeline}
	{Zeitleiste der Entwicklung von Angular}
	\epsfig{width=\totalwidth, file=images/vorwort/timeline-angular}
\end{widefig}
\endgroup

\vspace{-2\baselineskip}
\section*{Umgang mit Aktualisierungen}

Das Release einer neuen Major-Version von Angular bedeutet keineswegs, dass alle Ideen verworfen werden und Ihre Software nach einem Update nicht mehr funktioniert.
Auch wenn Sie eine neuere Angular-Version verwenden, behalten die in diesem Buch beschriebenen Konzepte ihre Gültigkeit.
Die Grundideen von Angular sind seit Version~2.0.0 konsistent und auf Beständigkeit über einen langen Zeitraum ausgelegt.
Alle Updates zwischen den Major-Versionen waren in der Vergangenheit problemlos möglich, ohne dass Breaking Changes die gesamte Anwendung unbenutzbar machen.
Gibt es doch gravierende Änderungen, so werden stets ausführliche Informationen und Tools zur Migration angeboten.

Auf der Website zu diesem Buch finden Sie die Codebeispiele für das Beispielprojekt und viele weiterführende Informationen.
Unter anderem veröffentlichen wir dort zu jeder Major-Version einen Artikel mit den wichtigsten Neuerungen in Angular.
Wir empfehlen Ihnen aus diesem Grund, unbedingt einen Blick auf die Begleitwebsite zu werfen, bevor Sie beginnen, sich mit den Inhalten des Buchs zu beschäftigen:

\qrlink[Die Begleitwebsite zum~Buch]{https://angular-buch.com}

\section*{An wen richtet sich das Buch?}

\footnote{Erfahrung in Softwareentwicklung}Dieses Buch richtet sich an Menschen, die bereits grundlegende Kenntnisse in der Softwareentwicklung mitbringen.
Vorwissen zu JavaScript und HTML ist von Vorteil –  es ist aber keine Voraussetzung, um mit diesem Buch Angular zu lernen.
Wenn Sie jedoch bereits mit der Webentwicklung vertraut sind, werden Sie mit diesem Buch schnell starten können.
Falls Sie gar keine Erfahrung in HTML und JavaScript mitbringen, empfehlen wir Ihnen, zunächst die grundlegenden Kenntnisse in diesen Bereichen zu festigen.

\footnote{TypeScript}Für die Entwicklung mit Angular nutzen wir die populäre Programmiersprache TypeScript.
Doch keine Angst: TypeScript ist eine Erweiterung von JavaScript, und die Konzepte sind sehr eingängig und schnell gelernt.
Wenn Sie bereits eine stark typisierte Sprache wie Java oder C\# kennen, wird Ihnen der Einstieg in TypeScript nicht schwerfallen.

Sie benötigen \footnote{Keine Angular-""Vorkenntnisse nötig!}*keinerlei* Vorkenntnisse im Umgang mit Angular bzw. AngularJS.
Ebenso müssen Sie sich nicht vorab mit benötigten Tools und Hilfsmitteln für die Entwicklung von Angular-Applikationen vertraut machen.
Das nötige Wissen darüber wird Ihnen in diesem Buch vermittelt.

\footnote{Kein klassisches Nachschlagewerk}Wir erschließen uns die Welt von Angular praxisorientiert anhand eines Beispielprojekts.
Jedes Thema wird zunächst ausführlich in der Theorie behandelt, sodass Sie die Grundlagen auch losgelöst vom Beispielprojekt nachlesen können.
Wir wollen einen soliden Einstieg in Angular bieten, Best Practices zeigen und Schwerpunkte bei speziellen fortgeschrittenen Themen setzen.
Die meisten Aufgaben aus dem Entwicklungsalltag werden Sie mit den vielen praktischen Beispielen souverän meistern können.

Wir hoffen, dass dieses Buch Ihre tägliche Begleitung bei der Arbeit mit Angular wird.
\footnote{Offizielle Angular-""Dokumentation}Für Details zu den einzelnen Framework-Funktionen empfehlen wir immer auch einen Blick in die offizielle Dokumentation.\shortlinkFootnote{link-1}



\section*{Wie ist dieses Buch zu lesen?}

\footnote{Einführung, Tools und Schnellstart}Im ersten Teil des Buchs lernen Sie die verwendeten Tools und die benötigten Werkzeuge kennen.
Im Schnellstart tauchen wir sofort in Angular ein und nehmen Sie mit zu einem einfachen Einstieg in das Framework und den Grundaufbau einer Anwendung.

\footnote{Einführung in TypeScript}Der zweite Teil vermittelt Ihnen einen Einstieg in TypeScript.
Sie werden hier mit den Grundlagen dieser typisierten Skriptsprache vertraut gemacht.
Wenn Sie bereits Erfahrung im Umgang mit TypeScript haben, können Sie diesen Teil auch überspringen und bei Bedarf später einzelne Themen nachlesen.

\footnote{Beispielanwendung}Der dritte Teil ist der Hauptteil des Buchs:
Hier werden wir mit Ihnen zusammen eine Beispielanwendung entwickeln.
Die Konzepte und Technologien von Angular wollen wir dabei direkt am Beispiel vermitteln.
\footnote{17~Praxiskapitel}Wir haben das Projekt in 17~einzelne Kapitel eingeteilt.
In jedem Teil setzen wir gemeinsam mit Ihnen neue Anforderungen und technische Aspekte im Beispielprojekt um.

\begin{itemize}\raggedright
	\item \nameref{ch:01comp} {\small (ab~S.~\pageref{ch:01comp})}
	\item \nameref{ch:02prop} {\small (ab~S.~\pageref{ch:02prop})}
	\item \nameref{ch:03eb} {\small (ab~S.~\pageref{ch:03eb})}
	\item \nameref{ch:04modules} {\small (ab~S.~\pageref{ch:04modules})}
	\item \nameref{ch:05di} {\small (ab~S.~\pageref{ch:05di})}
	\item \nameref{ch:06routing} {\small (ab~S.~\pageref{ch:06routing})}
	\item \nameref{ch:07http} {\small (ab~S.~\pageref{ch:07http})}
	\item \nameref{ch:08rxjs} {\small (ab~S.~\pageref{ch:08rxjs})}
	\item \nameref{ch:09interceptors} {\small (ab~S.~\pageref{ch:09interceptors})}
	\item \nameref{ch:10tdf} {\small (ab~S.~\pageref{ch:10tdf})}
	\item \nameref{ch:11rf} {\small (ab~S.~\pageref{ch:11rf})}
	\item \nameref{ch:12val} {\small (ab~S.~\pageref{ch:12val})}
	\item \nameref{ch:13pipes} {\small (ab~S.~\pageref{ch:13pipes})}
	\item \nameref{ch:14directives} {\small (ab~S.~\pageref{ch:14directives})}
	\item \nameref{ch:15lazy} {\small (ab~S.~\pageref{ch:15lazy})}
	\item \nameref{ch:16guards} {\small (ab~S.~\pageref{ch:16guards})}
	\item \nameref{ch:17standalone} {\small (ab~S.~\pageref{ch:17standalone})}
\end{itemize}

Jedes dieser Kapitel besteht immer aus einem umfangreichen Theorieteil und der praktischen Implementierung im Beispielprojekt.
Neben fachlichen Themen führen wir Refactorings durch, die die Architektur oder den Codestil der Anwendung verbessern.
\footnote{Powertipps}In mehreren *Powertipps* zwischen den Kapiteln zeigen wir außerdem hilfreiche Werkzeuge, die uns bei der Entwicklung zur Seite stehen.

\footnote{Projektübergreifende Themen}Nachdem alle Praxiskapitel erfolgreich absolviert wurden, widmen wir uns einer Auswahl von projektübergreifenden Themen:
Im Kapitel zu *Softwaretests* erfahren Sie, wie Sie Ihre Angular-Anwendung automatisiert testen und so die Softwarequalität sichern können.
Dieses Kapitel kann sowohl nach der Entwicklung des Beispielprojekts als auch parallel dazu bestritten werden.
Außerdem widmen wir uns ausführlich der *Barrierefreiheit*: In diesem Kapitel stellen wir Grundlagen und konkrete Maßnahmen vor, um die Anwendung für möglichst viele Menschen zugänglich zu machen.
Zum Schluss werfen wir einen differenzierten Blick auf die *Lokalisierung* und *Internationalisierung*, um die Anwendung für den mehrsprachigen Betrieb vorzubereiten.


\footnote{Deployment}Im fünften Teil des Buchs dreht sich alles um das Deployment einer Angular-Anwendung.
Dabei betrachten wir die Hintergründe und Konfiguration des Build-Prozesses und erläutern die Bereitstellung mithilfe von Docker.

\footnote{Fortgeschrittene Themen: NgRx, SSR und~PWA}Im sechsten Teil möchten wir Ihnen einige Ansätze näherbringen, die über eine Standardanwendung hinausgehen.
Hier stellen wir zunächst das *Redux*-Pattern und das populäre Framework *NgRx* vor, mit dem wir den Anwendungszustand zentral und gut wartbar verwalten können.
Mit *Server-Side Rendering (SSR)* machen Sie Ihre Anwendung fit für Suchmaschinen und verbessern zusätzlich die wahrgenommene Geschwindigkeit beim initialen Start.
Außerdem werfen wir einen ausführlichen Blick auf *Progressive Web Apps (PWA)*, um eine Webanwendung elegant auf Mobilgeräten zu nutzen.
%Schließlich betrachten wir fortgeschrittene Aspekte der Angular CLI: Monorepos und Schematics.

\footnote{Wissenswertes}Im letzten Teil  Wissenswertes\ finden Sie weitere Informationen zu wissenswerten und begleitenden Themen.
Hier haben wir weiterführende Inhalte zusammengetragen, auf die wir im Beispielprojekt nicht ausführlich eingehen.


\section*{Selbst tippen statt Copy \& Paste}

Der gesamte Code für das Beispielprojekt steht auf der Plattform GitHub zur Verfügung.
Wir wissen genau, wie groß die Versuchung ist, größere Teile des Codes von dort zu kopieren und so die Tipparbeit zu sparen.
\footnote{Abtippen heißt Lernen und Verstehen.}Aber: Kopieren und Einfügen ist nicht dasselbe wie *Lernen* und *Verstehen*.
Wenn Sie die Codebeispiele selbst *tippen*, werden Sie besser verstehen, wie Angular funktioniert, und werden die Software später erfolgreich in der Praxis einsetzen können.
Jeder einzelne Quelltext, den Sie abtippen, trainiert Ihre Hände, Ihr Gehirn und Ihre Sinne.
Wir möchten Sie deshalb ermutigen: Betrügen Sie sich nicht selbst. Der bereitgestellte Quelltext im Repository sollte lediglich der Überprüfung dienen.
Wir wissen, wie schwer das ist, aber vertrauen Sie uns: Es zahlt sich aus, denn Übung macht den Meister!

\section*{Angular.Schule: Workshops und Beratung}

Wir, die Autoren dieses Buchs, arbeiten seit Langem als Berater und Trainer für Angular.
Wir haben die Erfahrung gemacht, dass man Angular in kleinen Gruppen am effektivsten lernen kann.
In einem Workshop kann auf individuelle Fragen und Probleme direkt eingegangen werden –  und es macht auch am meisten Spaß!

Schauen Sie auf *\url{https://angular.schule*} vorbei.
Dort bieten wir Ihnen Angular-Schulungen in den Räumen Ihres Unternehmens, in offenen Gruppen oder als Online-Kurs an.
Das Angular-Buch verwenden wir dabei in unseren Kursen zur Nacharbeit.
Wir freuen uns auf Ihren Besuch!

