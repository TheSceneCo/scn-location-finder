#!/bin/bash

red=`tput setaf 1`
green=`tput setaf 2`
yellow=`tput setaf 3`
reset=`tput sgr0`

DIR_SOURCE="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
DIR="$(basename $DIR_SOURCE)"

echo >&2 "${yellow}1 --- Check for uncommited code${reset}"
if !(git diff-index --quiet HEAD --); then
    # changes
    echo >&2 "${red} --- Please commit or stash them.${reset}"
    exit 1
fi
echo >&2 "${green} --- All commit${reset}";

echo >&2 "${yellow}2 --- Increase package.json version depending on param ${green}[major|minor|patch]${reset}"
VERSION="$(npm version $1)"
echo >&2 "${VERSION}"

echo >&2 "${yellow}3 --- Add/update git tags${reset}"
echo >&2 "${yellow}4 --- Commit and push changes to package.json${reset}"
git push origin --tags

echo >&2 "${yellow}5 --- Build project dist${reset}"
echo >&2 "${red} --- does not exist${reset}"

echo >&2 "${yellow}6 --- Publish project${reset}"
npm publish

echo >&2 "${yellow}7 --- Build demo${reset}"
ng build --bh /$DIR/$VERSION/demo/ -e prod

echo >&2 "${yellow}8 --- Copy demo to webserver (ssh) - ${green}/var/www/thescene-components/$DIR/$VERSION/demo${reset}"
ssh  kkaabbaa@uxbox.thescene.co "mkdir -p /var/www/thescene-components/$DIR/$VERSION/demo"
rsync -avz -e "ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null" --progress dist/* kkaabbaa@uxbox.thescene.co:/var/www/thescene-components/$DIR/$VERSION/demo
rsync -avz -e "ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null" --progress .htaccess kkaabbaa@uxbox.thescene.co:/var/www/thescene-components/$DIR/$VERSION/demo
#scp  -r dist/* kkaabbaa@uxbox.thescene.co:/var/www/thescene-components/$DIR/$VERSION/demo
#scp  -r .htaccess kkaabbaa@uxbox.thescene.co:/var/www/thescene-components/$DIR/$VERSION/demo

echo >&2 "${yellow}9 --- Generate documentation${reset}"
npm run compodoc

echo >&2 "${yellow}10 --- Copy documentation to webserver (ssh) - ${green}/var/www/thescene-components/$DIR/$VERSION/docs${reset}"
ssh kkaabbaa@uxbox.thescene.co "mkdir -p /var/www/thescene-components/$DIR/$VERSION/docs"
rsync -avz -e "ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null" --progress documentation/* kkaabbaa@uxbox.thescene.co:/var/www/thescene-components/$DIR/$VERSION/docs

