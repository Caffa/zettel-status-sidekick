
# Zettel Status Sidekick
A plugin for Obsidian to visualize and track the development status of your notes, especially useful for Zettelkasten practitioners.

## Description
Tired of losing track of which notes are fully fleshed out and which are still just fleeting ideas? Zettel Status Sidekick is here to help! This Obsidian plugin provides a handy side panel that displays the current status of your active note based on a series of customizable checks. It's designed to be a visual aid in your note-taking workflow, particularly if you're using the Zettelkasten method.
The plugin checks various criteria you define, such as note length, presence of tags, links to other notes, and more, to give you a quick overview of how "complete" a note is. You can configure these checks to match your personal note development process and easily see at a glance which notes need more work and which are ready to be considered more permanent pieces of your knowledge system.

## Features
	- 📝 Note Status Panel: Adds a dedicated side panel that dynamically displays the status of your currently active note. Open it via a ribbon icon or command.
	- ✅ Customizable Status Checks: Define what constitutes a "developed" note by enabling or disabling various checks:
	- 📏 Developed: Checks if a note exceeds a configurable character threshold.
	- ✍️ Titled: Verifies that the note's filename contains letters, suggesting a meaningful title.
	- 🆔 Zettel ID: Confirms the presence of a unique identifier in the note's metadata.
	- #️⃣ Tagged: Checks if the note is tagged with any relevant keywords.
	- 🔗 Linked to Ideas: Ensures the note is connected to other idea notes via configurable custom fields (e.g., next, prev, related).
	- ** hubs Linked in Hub:** Verifies that the note is linked to at least one note within a designated "hub" folder, promoting connection to broader knowledge structures.
	- 📊 Visual Progress Indicators: Get an immediate sense of note completeness with:
	- 🥚 Emoji Progress: Displays a progress emoji (egg/chicken series or seedling series) that evolves as your note meets more criteria.
	- 👩‍💻 Percentage or Progress Bar: Choose between a percentage display or a static progress bar to visualize the note's completion status.
	- ⚙️ Comprehensive Settings: Tailor the plugin to your specific needs with a wide range of settings:
	- 📏 Developed Threshold: Adjust the character count to define a "developed" note.
	- ** 🏬 Hub Folder Path:** Specify the folder to be considered your "hub" for the "Linked in Hub" check.
	- ** 🏷️ Metadata Field Names:** Customize the field names used for Zettel ID and "Linked to Ideas" checks.
	- ** 🎚️ Toggleable Checks:** Enable or disable individual status checks to match your workflow.
	- ** 📊 Display Options:** Choose between percentage or progress bar, select your preferred emoji series, and toggle subtitles, note age, and alias/tag display.
	- ** 📁 Auto-Move to Main Folder:** Automatically move notes to a designated "main note folder" when all status checks are met, streamlining your Zettelkasten workflow.
	- 🕒 Note Age Display: Optionally display the age of the note in days within the status panel.
	- 🏷️ Alias and Tag Visibility: Choose to display a list of note aliases and clickable tags directly in the status panel for quick navigation.
	- 📂 Auto Note Organization: Automatically move "completed" notes to a designated folder, helping you keep your vault organized.
## Settings
You can customize Zettel Status Sidekick to perfectly match your workflow in the Obsidian settings tab under "Zettel Status Sidekick". Here's a quick overview of the available settings:
	- General Settings:
    - Developed Threshold: Set the character count to define a developed note.
    - Hub Folder Path: Specify the path to your hub folder.
    - Show Subtitles: Toggle descriptive subtitles for each status check.
    - Show Note Age: Toggle display of note age in the panel.
    - Display Alias and Tags: Toggle display of aliases and tags below the checks.
	- Display Settings:
    - Use Static Progress Bar: Switch between percentage display and a progress bar.
    - Emoji Series: Choose between "Egg/Chicken" or "Seedling" emoji series.
	- Main Note Settings:
    - Auto-move Completed Notes: Enable automatic moving of completed notes.
    - Main Note Folder Path: Specify the destination folder for automatically moved notes.
	- Checks to Enable:
    - Check for Tags: Toggle the tag check.
    - Check for Zettel ID: Toggle the Zettel ID check.
    - Check for Linked to Ideas: Toggle the "Linked to Ideas" check.
    - Check for Linked in Hub: Toggle the "Linked in Hub" check.
	- Custom Field Names:
    - Field Names for Link Check: Customize the comma-separated list of fields for "Linked to Ideas" check.
    - Zettel ID Field Name: Define the metadata field name for the Zettel ID.
## How to Use
	1.	Installation: Install the "Zettel Status Sidekick" plugin from the Obsidian community plugins browser.
	2.	Enable Plugin: Enable the plugin in your Obsidian settings under "Community plugins".
	3.	Open Status Panel:
    - Click the "Note Status" ribbon icon in the left sidebar.
    - Alternatively, use the command "Open Note Status Panel" (accessible via the command palette Ctrl+P or Cmd+P).
	4.	Configure Settings: Navigate to "Settings" -> "Zettel Status Sidekick" to customize the plugin to your preferences.
	5.	Observe Note Status: As you work on your notes, the "Note Status" panel will automatically update to reflect the status of your active note based on your configured checks.
Installation
From within Obsidian
	1.	Open Settings > Community plugins
	2.	Click "Browse"
	3.	Search for "Zettel Status Sidekick"
	4.	Click "Install"
	5.	Once installed, go back to "Community plugins" and enable "Zettel Status Sidekick"
Manually
	1.	Download the latest Release from the Releases section of the GitHub repository.
	2.	Extract the plugin folder zettel-status-sidekick to your Obsidian vault's plugins folder: <your_vault>/.obsidian/plugins/.
	- Note: On some machines the .obsidian folder may be hidden. On macOS you should be able to press Cmd+Shift+. to show the folder in Finder.
	3.	Reload Obsidian.
	4.	If prompted to safe mode, you can disable safe mode and enable the plugin.
	5.	Go to Settings > Community plugins and enable "Zettel Status Sidekick".

Enjoy tracking your Zettelkasten Notes with Zettel Status Sidekick!
