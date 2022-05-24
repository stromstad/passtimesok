# Passtime søk
En liten node utillity som lister ut hvilken dag neste passbestillingstime er ledig på alle norske politistasjoner.

Bruk:
node main.js

Options:

-i --includeEmpty : inkluderer også kontorer som ikke har noen ledige timer i resultatet


-b --branches <kommaseparert liste av søkeord> : lister kun ut kontorer som treffer på et av søkeordene


-p --poll : Spør igjen og igjen og igjen


-t --top : Vis bare den første ledige (fungerer ikke med -i)


-d --date : Set et terskeldato. Hvis en time blir funnet før denne datoen så åpnes Firefox med riktig kontor valgt

F.eks:
```
node main.js -b gronland,lillestrom,hamar,drammen -i
Drammen politistasjon: ingen
Grønland politistasjon: 2022-05-20
Politiets publikumssenter - Lillestrøm: 2022-07-27
Hamar politistasjon: 2022-10-13
```