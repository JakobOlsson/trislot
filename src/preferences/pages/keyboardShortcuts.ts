import GObject from "gi://GObject";
import type Gio from "gi://Gio";
import Gtk from "gi://Gtk";
import Adw from "gi://Adw";

import { createAcceleratorInput } from "../inputs/accelerator.js";

const SHORTCUTS = [
    { id: "cycle-thirds", description: "Cycle through 1/3-width slots" },
    { id: "cycle-two-thirds", description: "Cycle through 2/3-width slots" },
    { id: "cycle-halves", description: "Center window at 3/5 width" },
];

export const KeyboardShortcutsPage = GObject.registerClass(
    class KeyboardShortcutsPage extends Adw.PreferencesPage {
        constructor(settings: Gio.Settings) {
            super({
                title: "Keyboard Shortcuts",
                icon_name: "input-keyboard-symbolic",
                name: "KeyboardShortcuts",
            });

            const grid = new Gtk.Grid({
                halign: Gtk.Align.CENTER,
                margin_start: 12,
                margin_end: 12,
                margin_top: 12,
                margin_bottom: 12,
                column_spacing: 12,
                row_spacing: 12,
                visible: true,
            });
            const treeViews: Gtk.TreeView[] = [];

            SHORTCUTS.forEach((shortcut, row) => {
                const label = new Gtk.Label({
                    halign: Gtk.Align.END,
                    label: shortcut.description,
                    visible: true,
                });
                grid.attach(label, 0, row, 1, 1);
                grid.attach(createAcceleratorInput(settings, shortcut.id, treeViews), 1, row, 1, 1);
            });

            const group = new Adw.PreferencesGroup();
            group.add(grid);
            this.add(group);
        }
    },
);
