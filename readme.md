# Passtime søk
En liten node utillity som lister ut hvilken dag neste passbestillingstime er ledig på alle norske politistasjoner.

Bruk:
node main.js

Options:
-i --includeEmpty : inkluderer også kontorer som ikke har noen ledige timer i resultatet


-b --branches <kommaseparert liste av søkeord> : lister kun ut kontorer som treffer på et av søkeordene

F.eks:
```node main.js -b gronland,lillestrom,hamar -i
Politiets publikumssenter - Lillestrøm: 2022-07-27
Hamar politistasjon: 2022-10-13
Grønland politistasjon: 2022-11-07
```