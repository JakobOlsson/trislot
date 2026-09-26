import type Adw from "gi://Adw";
import type Gio from "gi://Gio";

import { ExtensionPreferences } from "resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js";

import { KeyboardShortcutsPage } from "./preferences/pages/keyboardShortcuts.js";

export default class TriSlotPreferences extends ExtensionPreferences {
    fillPreferencesWindow(window: Adw.PreferencesWindow): Promise<void> {
        const settings: Gio.Settings = this.getSettings();
        window.add(new KeyboardShortcutsPage(settings));
        window.set_default_size(480, 180);
        window.set_size_request(400, 140);
        return Promise.resolve();
    }
}
