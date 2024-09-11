#!/bin/sh
set -e
set -u
cd ../
npm run build
if [ -e result/dist ]; then
    newName="newdist"
    oldName="dist"
else 
    newName="dist"
    oldName="newdist"
fi
mv dist result/$newName
cd result
trap "rm -rf $newName || true; rm newhtml || true; exit" INT TERM EXIT
ln -s ./$newName newhtml
mv -fT newhtml html
trap - INT TERM EXIT

trap "rm -rf $oldName; exit" INT TERM EXIT
rm -rf $oldName
trap - INT TERM EXIT