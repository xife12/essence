#Hintergrund

Diese Anpassung dienen der optimierung und verknüpfung des @payment-systems, @vertragsarten2, @mitgliedschaften und @mitglieder 


##Beitragskonto
Das Beitragskonto ist Teil der Detailseite des Mitgliedes. Es wird automatisch generiert und angepasst. 

Im Header befinden sich wichtige Informationen wie: Saldo (offen oder ausgeglichen- Farbliche unterscheidung), Nächste Fälligkeitsrate, Bereits gezahlte Beiträge (kummuliert alles was seit abschluss einer Mitgliedschaft gezahlt wurde)

###Beitragskonto Funktionen & Abhängigkeiten

Funktionen / Abhängigkeiten
Generierung Beitragskalender / Mitgliedschaft Einstellungen, Sales Tool (noch nicht integriert und definiert), Zahllaufgruppen, Externe Mitgliedschaftintegration (pdf upload)
Vertrags Pausierung / Stillegung Mitgliedschaft -> Verschiebung der Beiträge & Fälligkeiten
Manuelle Stornierung/ Nullt die Fälligkeit
Automatische Stornierung / Nullt die Fälligkeit automatisch bei gewissen Kündigungsgründen, Stillegung
Manuelle Reduktion / Manuelle reduktion des Betrags
Automatische Reduktion / Kündigung, Stillegung

Weitere Abhängigkeiten: Rücklastschriftenerfassung, Zahllaufgenerierung und aktualisierung


###Beitragskonto Darstellung und Abhängigkeiten
Darstellung erfolgt in Tabellenform.
Beitragskonto Darstellung:

Fälligkeit / Typ / Beschreibung / Lastschriftgruppe / Betrag / Ust./ Zahlweise / Offen

Erklärung:

Aufbau / Abhängigkeit
Fälligkeit / Vertragsstart -> Salestool
Typ / Mitgliedschaftseinstellung (Pauschalen, Beitrag, Gebühren (Rücklastschrift Gebühren)), Startpaket
Beschreibung / Mitgliedschafteinstellung (Vertragsnahme + Zeitraum, Pauschalenname, Startpaketname)
Lastschriftgruppe / Zahllaufgruppe
Betrag / Mitgliedschaftseinstellungen, Vertragsstart, Ruhezeiten, Kündigungen
UsT./ %- Aus Mitgliedschaftseinstellungen
Zahlweise / Ausgehend der Auswahl der Zahlweise im Salestool, Mitgliedschaftseinstellungen
Offen / Rücklastschriften, Zahllaufgruppen

Flows: Betrag am Fälligkeitstag offen oder Überfällig -> Lastschriftgruppe generiert XML Datei -> Zuweisung einer Abbuchungsnummer  -> Übgergabe an Bank -> Offener Betrag = 0 Euro -> Erfassung Rücklastschriften -> Wenn Betrag nicht oder nur teilweise eingezogen werden konnte (Abbuchungsnummer als Referenz) -> Offner Betrag ist Differenz Betrag oder gleich gesamte Summe -> Erstellung einer gebühr von X-Euro (Abhängig der Einstellungen im Rücklasstschriften System) 


#Zahllaufgruppen

##Dashboard
Darstellung aller Zahllaufgruppen in Listenformat inkl. Status Aktiv/inaktiv, Fälligkeitsdatum. Button + Neue Zahllaufgruppe erstellen

##Einstellungen
- Zahllaufname
- Berücksichtigte Forderungstypen im Zahllauf (Auswahl als Checkboxen)
    - Startpaket
    - Beiträge 
    - Pauschale
    - Gebühren
- Fälligkeit (datumauswahl)

### Abhängigkeiten
- Mitgliedschaftseinstellungen
- Beitragskalender
- Finanzen (generierung von XML Dateien und neuen Zahlläufen)