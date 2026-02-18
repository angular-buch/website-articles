# Claude Code Terminal SVG – Styleguide

Anleitung zum Erstellen von SVGs, die Claude Code Terminal-Output nachbilden.

## Grundgerüst

```xml
<?xml version="1.0" encoding="utf-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="100%" viewBox="0 0 {W} {H}" fill="none">
  <rect width="{W}" height="{H}" rx="8" fill="#173449"/>
  <!-- Content here -->
</svg>
```

- `width="100%"` → skaliert mit Container
- `viewBox` bestimmt das interne Koordinatensystem
- `rx="8"` → abgerundete Ecken

## Optionaler Fensterrahmen (macOS-Style)

Nur bei eigenständigen Illustrationen (z. B. workflow-chat.svg), nicht bei Screenshot-Nachbildungen.

```xml
<!-- Title bar -->
<path d="M0 8C0 3.58 3.58 0 8 0h{W-8}c4.42 0 8 3.58 8 8v28H0V8z" fill="#1F4460"/>
<!-- Traffic lights -->
<circle cx="20" cy="18" r="5.5" fill="#F38BA8"/>
<circle cx="38" cy="18" r="5.5" fill="#F9E2AF"/>
<circle cx="56" cy="18" r="5.5" fill="#A6E3A1"/>
```

Content beginnt dann bei y ≈ 52 statt y ≈ 14.

## Farbpalette

| Element | Farbe | Hex |
|---------|-------|-----|
| **Hintergrund** | Dunkles Blau | `#173449` |
| **Title bar** (optional) | Etwas heller | `#1F4460` |
| **Normaler Text** | Helles Grau-Blau | `#CDD6F4` |
| **Gedämpfter Text** | Mittleres Grau | `#9399B2` |
| **Sehr gedämpft** | Dunkleres Grau | `#6C7086` |
| **Dunkelster Text** | Kaum sichtbar | `#585B70` |
| **User-Prompt `>`** | Pfirsich/Orange | `#F5A97F` |
| **Tool-Name (Read/Write)** | Grün | `#A6E3A1` |
| **Dateipfade** | Helles Grau-Blau | `#BAC2DE` |
| **Diff: Added (+)** | Grün (Text) | `#A6E3A1` |
| **Diff: Added BG** | Grün transparent | `#A6E3A1` @ 8% opacity |
| **Diff: Removed (-)** | Rot (Text) | `#F38BA8` |
| **Diff: Removed BG** | Rot transparent | `#F38BA8` @ 12% opacity |
| **Diff: Highlight (changed part)** | Gelb-Grün BG | `#A6E3A1` @ 25% opacity |
| **Diff: Highlight removed** | Rot BG | `#F38BA8` @ 25% opacity |
| **Zeilennummern** | Gedämpft | `#6C7086` |
| **Gelbe Warnung/Heading** | Gelb | `#F9E2AF` |
| **Orange Rahmen** | Orange-Gelb | `#F5A97F` |
| **Blauer Link (underline)** | Blau | `#89B4FA` |
| **Traffic Light: Rot** | | `#F38BA8` |
| **Traffic Light: Gelb** | | `#F9E2AF` |
| **Traffic Light: Grün** | | `#A6E3A1` |

## Font

```
font-family="'SF Mono', Menlo, Consolas, 'Courier New', monospace"
```

Größen:
- **Normaler Text**: `font-size="13"`
- **Code im Diff**: `font-size="12"` (etwas kleiner, damit lange Zeilen passen)
- **Statusbar**: `font-size="12"`
- **Kleine Hinweise**: `font-size="11"`

## Zeilenhöhe

- Standard: **18px** zwischen Textzeilen
- In Diffs: **17px** (kompakter)
- Gruppen-Abstand: **28–32px** zwischen logischen Blöcken

## Gemeinsame Elemente

### Claude-Text-Bullet (●)

Für Claude's Textausgabe (weiß):
```xml
<circle cx="26" cy="{baseline-4}" r="4" fill="#CDD6F4"/>
<text x="36" y="{baseline}" ...>#CDD6F4 text</text>
```

### Tool-Bullet (●)

Für Read/Write/Update-Operationen (grün):
```xml
<circle cx="26" cy="{baseline-4}" r="4" fill="#A6E3A1"/>
<text x="36" y="{baseline}" ...>
  <tspan fill="#A6E3A1">Read </tspan>
  <tspan fill="#BAC2DE">path/to/file.ts</tspan>
</text>
```

### User-Prompt

```xml
<text x="20" y="{baseline}" ...>
  <tspan fill="#F5A97F">&gt; </tspan>
  <tspan fill="#CDD6F4">User-Text hier</tspan>
</text>
```

### Diff-Zeile (Added)

```xml
<rect x="36" y="{top}" width="664" height="17" fill="#A6E3A1" fill-opacity="0.08"/>
<text y="{baseline}" ...>
  <tspan x="42" fill="#6C7086">{linenum} </tspan>
  <tspan fill="#A6E3A1">+code here</tspan>
</text>
```

### Diff-Zeile (Removed)

```xml
<rect x="36" y="{top}" width="664" height="17" fill="#F38BA8" fill-opacity="0.12"/>
<text y="{baseline}" ...>
  <tspan x="42" fill="#6C7086">{linenum} </tspan>
  <tspan fill="#F38BA8">-code here</tspan>
</text>
```

### Diff: Highlight (geänderte Stelle innerhalb einer Zeile)

Zusätzlich zum Zeilen-Hintergrund ein kleines Rechteck über dem geänderten Teil:
```xml
<rect x="{start}" y="{top}" width="{w}" height="17" fill="#A6E3A1" fill-opacity="0.25"/>
```

### Permission Dialog

```xml
<text x="20" y="{y}" ... fill="#CDD6F4">Do you want to make this edit to {file}?</text>
<text y="{y+18}" ...>
  <tspan x="20" fill="#F5A97F">❯ </tspan><tspan fill="#CDD6F4">1. Yes</tspan>
</text>
<text x="34" y="{y+36}" ... fill="#6C7086">2. Yes, allow all edits in {dir}/ during this session</text>
<text x="34" y="{y+54}" ... fill="#6C7086">3. Type here to tell Claude what to do differently</text>
<text x="20" y="{y+82}" ... fill="#585B70">Esc to cancel</text>
```

### Separator-Linie

Orange/rot (unter Tool-Headings):
```xml
<line x1="20" y1="{y}" x2="700" y2="{y}" stroke="#F5A97F" stroke-width="1.5"/>
```

Gepunktet (um Diff-Bereiche):
```xml
<rect x="20" y="{y}" width="680" height="{h}" rx="4"
      fill="none" stroke="#6C7086" stroke-width="1" stroke-dasharray="4 3"/>
```

### Statusleiste

```xml
<!-- Trennlinie -->
<line x1="0" y1="{y}" x2="{W}" y2="{y}" stroke="#313244" stroke-width="1"/>

<!-- Prompt-Zeile -->
<text x="20" y="{y-12}" ... fill="#CDD6F4">&gt;</text>
<rect x="30" y="{y-22}" width="8" height="16" fill="#CDD6F4"/> <!-- Cursor -->

<!-- Statusleiste -->
<text x="30" y="{y+20}" ... fill="#9399B2">[Sonnet]</text>
```

### Progress Bar (Kontext-Auslastung)

```xml
<!-- Track -->
<rect x="{x}" y="{top}" width="160" height="10" rx="5" fill="#45475A"/>
<!-- Fill -->
<rect x="{x}" y="{top}" width="{fill_width}" height="10" rx="5" fill="#9399B2"/>
<!-- Label -->
<text x="{x+170}" y="{baseline}" ... fill="#9399B2">42%</text>
```

## Tipps

1. **`&gt;` statt `>`** in XML/SVG für das Prompt-Zeichen
2. **`&lt;` statt `<`** in Code-Zeilen (z. B. `<h1>` → `&lt;h1&gt;`)
3. **`fill-opacity`** statt `rgba()` für breitere Browser-Kompatibilität
4. **Monospace-Zeichenbreite**: ca. 7.8px bei font-size 13, ca. 7.2px bei font-size 12
5. **Emojis** können in SVG-Text direkt verwendet werden: 💰 ⏱ 🦄
6. **Lange Zeilen**: font-size auf 12 oder 11 reduzieren, damit sie in 720px passen
7. **Testen**: SVG im Browser öffnen und mit dem Original-Screenshot vergleichen
