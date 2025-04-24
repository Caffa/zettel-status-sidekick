import { App, Plugin, PluginSettingTab, Setting, WorkspaceLeaf, ItemView, Notice, TFile } from 'obsidian';
import { getAPI, DataviewApi } from 'obsidian-dataview';

interface ZettelStatusSidekickSettings {
	developedThreshold: number;
	hubFolderPath: string;
	showSubtitles: boolean;
	checkTags: boolean;
	checkZettelId: boolean;
	checkLinkedToIdeas: boolean;
	checkLinkedInHub: boolean;
	customFieldNameLinksList: string;
	zettelIdFieldName: string;
	useProgressBar: boolean;
	showNoteAge: boolean;
	displayAliasAndTags: boolean;
	emojiSeries: string; // either 'egg' or 'seedling'
	autoMoveToMain: boolean;
	mainNoteFolderPath: string;
}

const DEFAULT_SETTINGS: ZettelStatusSidekickSettings = {
	developedThreshold: 1200,
	hubFolderPath: 'Hub',
	showSubtitles: true,
	checkTags: true,
	checkZettelId: true,
	checkLinkedToIdeas: true,
	checkLinkedInHub: true,
	customFieldNameLinksList: 'next, prev, related',
	zettelIdFieldName: 'zettel_id',
	useProgressBar: false,
	showNoteAge: false,
	displayAliasAndTags: false,
	emojiSeries: 'egg',
	autoMoveToMain: false,
	mainNoteFolderPath: 'Main',
};

export default class ZettelStatusSidekick extends Plugin {
	settings: ZettelStatusSidekickSettings;
	dataview: DataviewApi | undefined;

	async onload() {
		await this.loadSettings();

		this.addRibbonIcon('info', 'Note Status', (evt: MouseEvent) => {
			this.openNoteStatusPanel();
		});

		this.addCommand({
			id: 'open-note-status-panel',
			name: 'Open Note Status Panel',
			callback: () => this.openNoteStatusPanel(),
		});

		this.registerEvent(
			this.app.workspace.on('active-leaf-change', () => {
				this.updateNoteStatusPanel();
			})
		);

		this.app.workspace.onLayoutReady(() => {
			this.dataview = getAPI(this.app);
			if (!this.dataview) {
				console.log("Dataview API not available");
				return;
			}
			this.updateNoteStatusPanel();
		});

		this.registerView(
			NoteStatusPanelView.VIEW_TYPE,
			(leaf) => new NoteStatusPanelView(leaf, this)
		);

		this.addSettingTab(new ZettelStatusSidekickSettingTab(this.app, this));
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	async openNoteStatusPanel() {
    const leaves = this.app.workspace.getLeavesOfType(NoteStatusPanelView.VIEW_TYPE);
    if (leaves.length === 0) {
        const rightLeaf = this.app.workspace.getRightLeaf(false);
        if (rightLeaf) {
            await rightLeaf.setViewState({
                type: NoteStatusPanelView.VIEW_TYPE,
            });
        } else {
          new Notice("Could not open right leaf");
        }
    } else {
        this.app.workspace.revealLeaf(leaves[0]);
    }
}

	async updateNoteStatusPanel() {
		const leaves = this.app.workspace.getLeavesOfType(NoteStatusPanelView.VIEW_TYPE);
		if (leaves.length > 0) {
			(leaves[0].view as NoteStatusPanelView).render();
		}
	}
}

class NoteStatusPanelView extends ItemView {
	static VIEW_TYPE = 'note-status-panel';
	plugin: ZettelStatusSidekick;

	constructor(leaf: WorkspaceLeaf, plugin: ZettelStatusSidekick) {
		super(leaf);
		this.plugin = plugin;
	}

	getViewType() {
		return NoteStatusPanelView.VIEW_TYPE;
	}

	getDisplayText() {
		return 'Note Status';
	}

	getIcon() {
		return 'rocket';
	}

	async onOpen() {
		this.render();
	}

	async render() {
		const container = this.containerEl.children[1];
		container.empty();
		container.addClass('zettelSidekick-note-status-panel');

		const activeFile = this.plugin.app.workspace.getActiveFile();
		if (!activeFile) {
			container.createEl('p', { text: 'No active file.' });
			return;
		}

		if (!this.plugin.dataview) {
			container.createEl('p', { text: 'Dataview API not ready.' });
			return;
		}

		const result = await this.plugin.dataview?.page(activeFile.path);
		if (!result) {
			container.createEl('p', { text: 'No Dataview data found for this note.' });
			return;
		}

		const developed = result.file.size >= this.plugin.settings.developedThreshold;
		const written = /[a-zA-Z]/.test(result.file.name);
		const idField = this.plugin.settings.zettelIdFieldName;
		const alphaId = result[idField] !== undefined && String(result[idField]).trim() !== '';
		const tagged = this.plugin.settings.checkTags && result.file.tags && result.file.tags.length > 0;

		let linkedToIdeas = false;

		if (this.plugin.settings.checkLinkedToIdeas) {
			const customFieldNameLinksList = this.plugin.settings.customFieldNameLinksList?.trim();

			if (customFieldNameLinksList) {
				// If customFieldNameLinksList is provided, check only specified fields
				const linkFields = customFieldNameLinksList.split(',').map(field => field.trim());
				for (const field of linkFields) {
					if (result?.[field]?.length > 0) {
						linkedToIdeas = true;
						break;
					}
				}
			} else {
				// If customFieldNameLinksList is empty or just spaces, count all outgoing links
				let linkCount = 0;
				for (const key in result) {
					if (result[key]?.length > 0) {
						linkCount += result[key].length;
					}
				}
				linkedToIdeas = linkCount > 1;
			}
		}

		// const linkedInHub = this.plugin.settings.checkLinkedInHub && result.file.inlinks?.some((link) =>
		// 	link.file.folder?.includes(this.plugin.settings.hubFolderPath)
		// );

		const linkedInHub = this.plugin.settings.checkLinkedInHub && result.file.inlinks?.some((link: TFile) =>
			link.path.includes(this.plugin.settings.hubFolderPath)
		);

		// Build the enabled checks list based on individual settings.
		const enabledChecks: { label: string; value: boolean }[] = [];
		enabledChecks.push({ label: 'Developed', value: developed });
		enabledChecks.push({ label: 'Titled', value: written });
		if (this.plugin.settings.checkZettelId) {
			enabledChecks.push({ label: 'Zettel id-ed', value: alphaId });
		}
		if (this.plugin.settings.checkTags) {
			enabledChecks.push({ label: 'Tagged', value: tagged });
		}
		if (this.plugin.settings.checkLinkedToIdeas) {
			enabledChecks.push({ label: 'Linked to ideas', value: linkedToIdeas });
		}
		if (this.plugin.settings.checkLinkedInHub) {
			enabledChecks.push({ label: 'Linked in hub', value: linkedInHub });
		}

		const enabledChecksCount = enabledChecks.length;
		const metChecksCount = enabledChecks.filter(c => c.value).length;
		const percentage = enabledChecksCount > 0 ? Math.round((metChecksCount / enabledChecksCount) * 100) : 100;
		const allMet = metChecksCount === enabledChecksCount && enabledChecksCount > 0;

		// Determine emoji based on progress and the chosen series.
		let emoji = '';
        if (this.plugin.settings.emojiSeries === 'egg') {
            if (percentage < 25) emoji = '🥚';
            else if (percentage < 50) emoji = '🐣';
            else if (percentage < 75) emoji = '🐥';
            else emoji = '🍗';
        } else if (this.plugin.settings.emojiSeries === 'seedling') {
            if (percentage < 33) emoji = '🌱';
            else if (percentage < 66) emoji = '🍀';
            else emoji = '🌲';
        }

		// Render header with progress info and emoji.
		if (allMet) {
			container.createEl('h1', { text: `Main note ${emoji}` });
		} else {
			if (this.plugin.settings.useProgressBar) {
				const progressPercent = enabledChecksCount > 0 ? metChecksCount / enabledChecksCount : 1;
				const progressBar = container.createEl('progress');
				progressBar.value = progressPercent;
				progressBar.max = 1;
				container.createEl('h2', { text: `Note in progress ${emoji}` });
			} else {
				container.createEl('h2', { text: `Note in progress (${percentage}%) ${emoji}` });
			}
		}

		// If the note passes all checks and auto-move is enabled, move the file.
		if (allMet && this.plugin.settings.autoMoveToMain) {
			const mainFolder = this.plugin.settings.mainNoteFolderPath;
			// Check if note is not already in the destination folder.
			if (!activeFile.path.startsWith(mainFolder + "/")) {
				const newPath = `${mainFolder}/${activeFile.name}`;
				try {
					await this.plugin.app.vault.rename(activeFile, newPath);
                    new Notice(`Moved note "${activeFile.name.replace('.md', '')}" to ${mainFolder}`);
				} catch (error) {
					new Notice(`Error moving note: ${error}`);
				}
			}
		}

		const table = container.createEl('table', { cls: 'zettelSidekick-status-table' });
		const tbody = table.createEl('tbody');

		const descriptors: { [key: string]: string } = {
			'Zettel id-ed': 'Assigned a unique numeric ID, placing it in train of thought',
			'Developed': 'Elaborated on the fleeting note',
			'Tagged': 'Categorized with relevant tags',
			'Linked to ideas': 'Connected to other related notes',
			'Titled': 'Has a meaningful name, the statement of the note',
			'Linked in hub': 'Connected to a central hub of knowledge'
		};

		const addRow = (label: string, value: boolean) => {
			const row = tbody.createEl('tr');
			const tdLabel = row.createEl('td');
			tdLabel.createEl('div', { text: label });
			if (this.plugin.settings.showSubtitles && descriptors[label]) {
				const small = tdLabel.createEl('small', { text: descriptors[label] });
			}
			const tdStatus = row.createEl('td');
			const statusIcon = tdStatus.createEl('span', { cls: value ? 'zettelSidekick-status-icon success' : 'zettelSidekick-status-icon failure' });
			statusIcon.innerText = value ? '✅' : '❌';
			if (label === 'Developed' && !value) {
				const percentage = (result.file.size / this.plugin.settings.developedThreshold * 100).toFixed(0);
				const percentageEl = statusIcon.createEl('span', { text: ` (${percentage}%)`, cls: 'zettelSidekick-percentage-text' });
				percentageEl.style.fontSize = '0.8em';
				percentageEl.style.marginLeft = '5px';
			}
		};

		enabledChecks.forEach(check => {
			addRow(check.label, check.value);
		});

		if (this.plugin.settings.displayAliasAndTags) {
			// Display aliases with a preceding label
			if (result.file.aliases && result.file.aliases.length > 0) {
				const aliasesContainer = container.createEl('div', { cls: 'zettelSidekick-aliases-container' });
				aliasesContainer.createEl('p', { text: 'Aliases' });
				const aliasList = aliasesContainer.createEl('ul');
				result.file.aliases.forEach((alias: string) => {
					aliasList.createEl('li', { text: alias });
				});
			}

			// Display tags
			if (result.file.tags && result.file.tags.length > 0) {
				const tagsContainer = container.createEl('div', { cls: 'zettelSidekick-tags-container' });
				tagsContainer.createEl('p', { text: 'Tags' });
				const tagsList = tagsContainer.createEl('div', { cls: 'zettelSidekick-tags-list' });
				result.file.tags.forEach((tag: string) => {
					const tagText = tag.substring(1);
					const tagEl = tagsList.createEl('div', { text: tagText, cls: 'zettelSidekick-tag' });
					tagEl.onclick = () => {
						this.plugin.app.workspace.openLinkText(`#${tagText}`, activeFile.path, false);
					};
				});
			}
		}

		if (this.plugin.settings.showNoteAge && activeFile.stat) {
			const createdDate = window.moment(activeFile.stat.ctime);
			const daysOld = window.moment().diff(createdDate, 'days');
			container.createEl('p', { text: `Note is ${daysOld} days old (created ${createdDate.format('YYYY-MM-DD')})` });
		}
	}
}

class ZettelStatusSidekickSettingTab extends PluginSettingTab {
	plugin: ZettelStatusSidekick;

	constructor(app: App, plugin: ZettelStatusSidekick) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		new Setting(containerEl)
			.setName('Developed threshold')
			.setDesc('The threshold (in characters) to consider a note as developed.')
			.addText(text =>
				text
					.setPlaceholder('Enter threshold')
					.setValue(this.plugin.settings.developedThreshold.toString())
					.onChange(async (value) => {
						this.plugin.settings.developedThreshold = parseInt(value);
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName('Hub folder path')
			.setDesc('The folder path to consider for "Linked in hub" check.')
			.addText(text =>
				text
					.setPlaceholder('Enter folder path')
					.setValue(this.plugin.settings.hubFolderPath)
					.onChange(async (value) => {
						this.plugin.settings.hubFolderPath = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName('Show subtitles')
			.setDesc('Display descriptive subtitles for each status in the panel.')
			.addToggle(toggle =>
				toggle
					.setValue(this.plugin.settings.showSubtitles)
					.onChange(async (value) => {
						this.plugin.settings.showSubtitles = value;
						await this.plugin.saveSettings();
						this.plugin.updateNoteStatusPanel();
					})
			);

		new Setting(containerEl)
			.setName('Show note age')
			.setDesc('Display how many days old the note is in the panel.')
			.addToggle(toggle =>
				toggle
					.setValue(this.plugin.settings.showNoteAge)
					.onChange(async (value) => {
						this.plugin.settings.showNoteAge = value;
						await this.plugin.saveSettings();
						this.plugin.updateNoteStatusPanel();
					})
			);

		new Setting(containerEl)
			.setName('Display alias and tags')
			.setDesc('Display note alias and tags below the checks in the panel.')
			.addToggle(toggle =>
				toggle
					.setValue(this.plugin.settings.displayAliasAndTags)
					.onChange(async (value) => {
						this.plugin.settings.displayAliasAndTags = value;
						await this.plugin.saveSettings();
						this.plugin.updateNoteStatusPanel();
					})
			);

		new Setting(containerEl).setName('Display').setHeading();

		new Setting(containerEl)
			.setName('Use static progress bar')
			.setDesc('Show progress as a static progress bar instead of percentage.')
			.addToggle(toggle =>
				toggle
					.setValue(this.plugin.settings.useProgressBar)
					.onChange(async (value) => {
						this.plugin.settings.useProgressBar = value;
						await this.plugin.saveSettings();
						this.plugin.updateNoteStatusPanel();
					})
			);

		new Setting(containerEl)
			.setName('Emoji series')
			.setDesc('Select which emoji series to use for progress status.')
			.addDropdown(dropdown => dropdown
				.addOption('egg', 'Egg/Chicken')
				.addOption('seedling', 'Seedling')
				.setValue(this.plugin.settings.emojiSeries)
				.onChange(async (value: string) => {
					this.plugin.settings.emojiSeries = value;
					await this.plugin.saveSettings();
					this.plugin.updateNoteStatusPanel();
				})
			);

		// New settings for auto-moving notes when complete.
		containerEl.createEl('h3', { text: 'Main note' });
		new Setting(containerEl)
			.setName('Auto-move completed notes')
			.setDesc('Automatically move note to the main note folder when all checks are complete.')
			.addToggle(toggle =>
				toggle
					.setValue(this.plugin.settings.autoMoveToMain)
					.onChange(async (value) => {
						this.plugin.settings.autoMoveToMain = value;
						await this.plugin.saveSettings();
						this.plugin.updateNoteStatusPanel();
					})
			);
		new Setting(containerEl)
			.setName('Main note folder path')
			.setDesc('Folder path to move completed notes into.')
			.addText(text =>
				text
					.setPlaceholder('Enter folder path (e.g. Main)')
					.setValue(this.plugin.settings.mainNoteFolderPath)
					.onChange(async (value) => {
						this.plugin.settings.mainNoteFolderPath = value;
						await this.plugin.saveSettings();
						this.plugin.updateNoteStatusPanel();
					})
			);

		new Setting(containerEl).setName('Checks to enable').setHeading();

		new Setting(containerEl)
			.setName('Check for tags')
			.setDesc('Enable the check for tags in the note.')
			.addToggle(toggle =>
				toggle
					.setValue(this.plugin.settings.checkTags)
					.onChange(async (value) => {
						this.plugin.settings.checkTags = value;
						await this.plugin.saveSettings();
						this.plugin.updateNoteStatusPanel();
					})
			);
		new Setting(containerEl)
			.setName('Check for zettel ID')
			.setDesc('Enable the check for Zettel ID in the note metadata.')
			.addToggle(toggle =>
				toggle
					.setValue(this.plugin.settings.checkZettelId)
					.onChange(async (value) => {
						this.plugin.settings.checkZettelId = value;
						await this.plugin.saveSettings();
						this.plugin.updateNoteStatusPanel();
					})
			);
		new Setting(containerEl)
			.setName('Check for linked to ideas')
			.setDesc('Enable the check for outgoing links (via custom fields) from the note.')
			.addToggle(toggle =>
				toggle
					.setValue(this.plugin.settings.checkLinkedToIdeas)
					.onChange(async (value) => {
						this.plugin.settings.checkLinkedToIdeas = value;
						await this.plugin.saveSettings();
						this.plugin.updateNoteStatusPanel();
					})
			);
		new Setting(containerEl)
			.setName('Check for linked in hub')
			.setDesc('Enable the check for links that reference a hub folder.')
			.addToggle(toggle =>
				toggle
					.setValue(this.plugin.settings.checkLinkedInHub)
					.onChange(async (value) => {
						this.plugin.settings.checkLinkedInHub = value;
						await this.plugin.saveSettings();
						this.plugin.updateNoteStatusPanel();
					})
			);

		new Setting(containerEl).setName('Custom Field Names').setHeading();

		new Setting(containerEl)
			.setName('Field Names for Link Check')
			.setDesc('Comma-separated list of custom field names to check for links. (Default: next, prev, related).  If empty, will check for all links.')
			.addText(text =>
				text
					.setPlaceholder('e.g., next, prev, related, see also')
					.setValue(this.plugin.settings.customFieldNameLinksList)
					.onChange(async (value) => {
						this.plugin.settings.customFieldNameLinksList = value;
						await this.plugin.saveSettings();
						this.plugin.updateNoteStatusPanel();
					})
			);
		new Setting(containerEl)
			.setName('Zettel ID Field Name')
			.setDesc('Name of the metadata field to use for the Zettel ID (e.g., "zettel_id" or "id").')
			.addText(text =>
				text
					.setPlaceholder('zettel_id')
					.setValue(this.plugin.settings.zettelIdFieldName)
					.onChange(async (value) => {
						this.plugin.settings.zettelIdFieldName = value;
						await this.plugin.saveSettings();
						this.plugin.updateNoteStatusPanel();
					})
			);
	}
}

