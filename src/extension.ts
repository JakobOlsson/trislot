import GLib from "gi://GLib";
import type Gio from "gi://Gio";
import Meta from "gi://Meta";
import Shell from "gi://Shell";
import * as Main from "resource:///org/gnome/shell/ui/main.js";
import { Extension } from "resource:///org/gnome/shell/extensions/extension.js";

import { Area } from "./common/area.js";
import {
    getActiveWindow,
    getWorkAreaForMonitor,
    isEntireWorkAreaHeight,
    isEntireWorkAreaWidth,
} from "./extension/utils.js";

type CyclePositions = { thirds: number; twoThirds: number };

export default class TriSlotExtension extends Extension {
    _settings?: Gio.Settings;
    _sourceIds: number[] = [];
    _positions = new WeakMap<Meta.Window, CyclePositions>();

    enable(): void {
        this._settings = this.getSettings();
        this.bindKey("cycle-thirds", () => this.cycleWindow("thirds"));
        this.bindKey("cycle-two-thirds", () => this.cycleWindow("twoThirds"));
        this.bindKey("cycle-halves", () => this.centerWindowThreeFifths());
    }

    disable(): void {
        this.removeSources();
        this.unbindKey("cycle-thirds");
        this.unbindKey("cycle-two-thirds");
        this.unbindKey("cycle-halves");
        this._positions = new WeakMap();
        this._settings = undefined;
    }

    bindKey(key: string, callback: () => void): void {
        Main.wm.addKeybinding(
            key,
            this._settings!,
            Meta.KeyBindingFlags.IGNORE_AUTOREPEAT,
            Shell.ActionMode.NORMAL,
            callback,
        );
    }

    unbindKey(key: string): void {
        Main.wm.removeKeybinding(key);
    }

    cycleWindow(mode: keyof CyclePositions): void {
        const window = getActiveWindow();
        if (!window) {
            return;
        }

        const workArea = getWorkAreaForMonitor(window.get_monitor());
        const positions = this._positions.get(window) ?? { thirds: -1, twoThirds: -1 };
        const cycleLength = mode === "thirds" ? 4 : 2;
        const cyclePosition = (positions[mode] + 1) % cycleLength;
        const slot = mode === "thirds" ? [0, 1, 2, 1][cyclePosition] : cyclePosition;
        positions[mode] = cyclePosition;
        this._positions.set(window, positions);

        let left: number;
        let right: number;
        if (mode === "thirds") {
            left = Math.floor((workArea.width * slot) / 3);
            right = Math.floor((workArea.width * (slot + 1)) / 3);
        } else if (mode === "twoThirds" && slot === 0) {
            left = 0;
            right = Math.floor((workArea.width * 2) / 3);
        } else {
            left = Math.floor(workArea.width / 3);
            right = workArea.width;
        }

        this.moveWindow(window, new Area(workArea.x + left, workArea.y, right - left, workArea.height));
    }

    centerWindowThreeFifths(): void {
        const window = getActiveWindow();
        if (!window) {
            return;
        }

        const workArea = getWorkAreaForMonitor(window.get_monitor());
        const width = Math.floor((workArea.width * 3) / 5);
        const left = Math.floor((workArea.width - width) / 2);
        this.moveWindow(window, new Area(workArea.x + left, workArea.y, width, workArea.height));
    }

    moveWindow(window: Meta.Window, area: Area): void {
        if ((window as any).get_maximize_flags) {
            if (window.get_maximize_flags()) {
                window.set_unmaximize_flags(Meta.MaximizeFlags.BOTH);
            }

            window.move_resize_frame(true, area.x, area.y, area.width, area.height);

            if (isEntireWorkAreaWidth(area)) {
                window.set_maximize_flags(Meta.MaximizeFlags.HORIZONTAL);
            } else {
                window.set_unmaximize_flags(Meta.MaximizeFlags.HORIZONTAL);
            }

            if (isEntireWorkAreaHeight(area)) {
                window.set_maximize_flags(Meta.MaximizeFlags.VERTICAL);
            } else {
                window.set_unmaximize_flags(Meta.MaximizeFlags.VERTICAL);
            }
        } else {
            const legacyWindow: {
                get_maximized(): boolean;
                maximize(directions: Meta.MaximizeFlags): void;
                unmaximize(directions: Meta.MaximizeFlags): void;
                move_resize_frame(
                    user_op: boolean,
                    root_x_nw: number,
                    root_y_nw: number,
                    width: number,
                    height: number,
                ): void;
            } = window as any;

            if (legacyWindow.get_maximized()) {
                legacyWindow.unmaximize(Meta.MaximizeFlags.BOTH);
            }

            legacyWindow.move_resize_frame(true, area.x, area.y, area.width, area.height);

            if (isEntireWorkAreaWidth(area)) {
                legacyWindow.maximize(Meta.MaximizeFlags.HORIZONTAL);
            } else {
                legacyWindow.unmaximize(Meta.MaximizeFlags.HORIZONTAL);
            }

            if (isEntireWorkAreaHeight(area)) {
                legacyWindow.maximize(Meta.MaximizeFlags.VERTICAL);
            } else {
                legacyWindow.unmaximize(Meta.MaximizeFlags.VERTICAL);
            }
        }

        let attempts = 1;
        const sourceId = GLib.timeout_add(GLib.PRIORITY_DEFAULT, 20, () => {
            const windowArea = Area.fromRectangle(window.get_frame_rect());
            if (attempts >= 5) {
                this.removeSource(sourceId);
                return GLib.SOURCE_REMOVE;
            }

            if (!windowArea.isEqual(area)) {
                if (attempts % 2 === 1) {
                    window.move_frame(true, area.x, area.y);
                } else {
                    window.move_resize_frame(true, area.x, area.y, area.width, area.height);
                }
            }

            attempts += 1;
            return GLib.SOURCE_CONTINUE;
        });
        this._sourceIds.push(sourceId);
    }

    removeSource(sourceId: number): void {
        this._sourceIds = this._sourceIds.filter((id) => id !== sourceId);
    }

    removeSources(): void {
        this._sourceIds.forEach((sourceId) => GLib.Source.remove(sourceId));
        this._sourceIds = [];
    }
}
