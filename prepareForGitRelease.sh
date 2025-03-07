# minor version bump 
npm version patch

# create the current_release directory if it does not exist
mkdir -p zettel-status-sidekick

# make a copy of the main.js, manifest.json, and styles.css files in another folder
cp main.js zettel-status-sidekick
cp manifest.json zettel-status-sidekick
cp styles.css zettel-status-sidekick

# compress the current_release folder into a zip file
# zip -r release.zip current_release
zip -vr zettel-status-sidekick.zip zettel-status-sidekick -x "*.DS_Store"

mv zettel-status-sidekick.zip release.zip

# remove the current_release folder
# rm -rf zettel-status-sidekick

