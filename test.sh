#!/bin/bash
ALL=$(cat test-list.txt | wc -l);
EVIL=$(cat test-deny.txt | wc -l);
GOODNESS=$(cat test-list.txt | ./index.js -d test-deny.txt -p a -a test-allow-king.txt -a test-allow.txt | wc -l);
SMURFS=$(cat test-list.txt | ./index.js -d test-deny.txt -p a -a test-allow.txt | wc -l);
KING=$(cat test-list.txt | ./index.js -d test-deny.txt -p a -a test-allow-king.txt | wc -l);
if [ ! $GOODNESS == $(($ALL-$EVIL)) ]; then
  exit 1;
fi;
if [ ! $GOODNESS == $(($SMURFS+$KING)) ]; then
  exit 1;
fi;
exit 0;
