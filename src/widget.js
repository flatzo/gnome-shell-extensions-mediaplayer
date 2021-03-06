/* -*- mode: js2; js2-basic-offset: 4; indent-tabs-mode: nil -*- */
/**
    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
**/

const St = imports.gi.St;
const Clutter = imports.gi.Clutter;
const PopupMenu = imports.ui.popupMenu;
const Pango = imports.gi.Pango;
const GLib = imports.gi.GLib;

function TrackBox() {
    this._init.apply(this, arguments);
}

TrackBox.prototype = {
    __proto__: PopupMenu.PopupBaseMenuItem.prototype,

    _init: function(cover) {
        PopupMenu.PopupBaseMenuItem.prototype._init.call(this, {reactive: false});
        this.box = new St.Table();
        this._cover = cover;
        this._infos = new St.Table({style_class: "track-infos"});
        this.addActor(this.box, {span: -1, expand: true});
        this.box.add(this._cover, {row: 0, col: 1, x_expand: false});
        this.box.add(this._infos, {row: 0, col: 2, x_expand: true});
    }
}

function ControlButtons() {
    this._init.apply(this, arguments);
}

ControlButtons.prototype = {
    __proto__: PopupMenu.PopupBaseMenuItem.prototype,

    _init: function() {
        PopupMenu.PopupBaseMenuItem.prototype._init.call(this, {reactive: false});
        this.box = new St.BoxLayout();
        this.addActor(this.box, {span: -1, align: St.Align.MIDDLE});
    },
    addButton: function(button) {
        this.box.add_actor(button);
    }
}

function ControlButton() {
    this._init.apply(this, arguments);
}

ControlButton.prototype = {
    _init: function(icon, callback) {
        this.actor = new St.Bin({style_class: 'button-container'});
        this.icon = new St.Icon({
            style_class: 'button-icon',
            icon_type: St.IconType.SYMBOLIC,
            icon_name: icon,
        });
        this.button = new St.Button({style_class: 'hotplug-resident-eject-button',
                                     child: this.icon});
        this.button.connect('clicked', callback);
        this.actor.add_actor(this.button);
    },
    setIcon: function(icon) {
        this.icon.icon_name = icon;
    },
    hide: function() {
        this.actor.hide();
    },
    show: function() {
        this.actor.show();
    },
}

function SliderItem() {
    this._init.apply(this, arguments);
}

SliderItem.prototype = {
    __proto__: PopupMenu.PopupSliderMenuItem.prototype,

    _init: function(text, icon, value) {
        PopupMenu.PopupSliderMenuItem.prototype._init.call(this, value);
        this.removeActor(this._slider);
        this._holder = new St.Table({style_class: 'slider-item'});
        this._icon = new St.Icon({style_class: 'menu-icon', icon_name: icon});
        this._label = new St.Label({text: text});
        this._holder.add(this._icon, {row: 0, col: 0, x_expand: false})
        this._holder.add(this._label, {row: 0, col: 1, x_expand: false})
        this._holder.add(this._slider, {row: 0, col: 2, x_expand: true})
        this.addActor(this._holder, {span: -1, expand: true});
    },

    setIcon: function(icon) {
        this._icon.icon_name = icon;
    },

    setLabel: function(text) {
        if (this._label.clutter_text)
            this._label.text = text;
    }
}

function TrackTitle() {
    this._init.apply(this, arguments);
}

TrackTitle.prototype = {
    _init: function(prepend, text, style) {
        this.box = new St.Table({style_class: style});
        this._label = new St.Label();
        if (prepend) {
            this._prepend = new St.Label({style_class: 'popup-inactive-menu-item', text: prepend + " "});
            this._prepend.clutter_text.ellipsize = Pango.EllipsizeMode.NONE;
            this.box.add(this._prepend, {row: 0, col: 0, x_fill: true, x_expand: false});
            this.box.add(this._label, {row: 0, col: 1});
        }
        else
            this.box.add(this._label, {row: 0, col: 0});

        this.setText(text);
    },

    setText: function(text) {
        if (this._label.clutter_text) {
            this._label.clutter_text.line_wrap = true;
            this._label.clutter_text.line_wrap_mode = Pango.WrapMode.WORD_CHAR;
            this._label.clutter_text.ellipsize = Pango.EllipsizeMode.NONE;
            this._label.clutter_text.set_text(text.toString());
        }
    }
}

function TitleItem() {
    this._init.apply(this, arguments);
}

TitleItem.prototype = {
    __proto__: PopupMenu.PopupBaseMenuItem.prototype,

    _init: function(text, icon, callback) {
        PopupMenu.PopupBaseMenuItem.prototype._init.call(this);

        this.box = new St.BoxLayout();
        this.addActor(this.box);
        this.label = new St.Label({text: text});
        this.icon = new St.Bin({style_class: "menu-icon", child: icon});
        this.button = new St.Button({style_class: "button-quit"});
        this.button.connect('clicked', callback);
        this.button_icon = new St.Icon({
            icon_type: St.IconType.SYMBOLIC,
            icon_name: 'window-close',
            icon_size: 16
        });
        this.button.set_child(this.button_icon);
        this.box.add_actor(this.icon);
        this.box.add_actor(this.label);
        this.addActor(this.button, {span: -1, expand: true, align: St.Align.END});
        this.hideButton();
    },
    setLabel: function(text) {
        this.label.text = text;
    },
    setIcon: function(icon) {
        this.icon.set_child(icon);
    },
    hideButton: function() {
        this.button.hide();
    },
    showButton: function() {
        this.button.show();
    }
}


function TrackRating() {
    this._init.apply(this, arguments);
}

TrackRating.prototype = {
    _init: function(prepend, value, style, icon_path) {
        this.box = new St.Table({style_class: style});

        this._starImage = new Array();
        this._starTexture = new Array();
        this._starButton = new Array();
        this._star       = new Array();
        for(i=0; i < 5; i++) {
                this._starImage[i]      = new St.Bin({style_class: 'track-rating'});
                this._starTexture[i]         = new Clutter.Texture({filter_quality: 2, filename: icon_path});
                this._star[i] = new St.Button({style_class: 'button-star', x_align: St.Align.START, y_align: St.Align.START});

                this._starImage[i].width = 20;
                this._starImage[i].height = 20;  
                this._starImage[i].set_child(this._starTexture[i])
               
                this._star[i].set_child(this._starImage[i]);
        }

        this.box.add(this._star[0], {row: 0, col: 2});
        this.box.add(this._star[1], {row: 0, col: 3});
        this.box.add(this._star[2], {row: 0, col: 4});
        this.box.add(this._star[3], {row: 0, col: 5});
        this.box.add(this._star[4], {row: 0, col: 6});
    

        this.setValue(value);
    },

    setValue: function(value) {
        this._star[0].show();
        this._star[1].show();
        this._star[2].show();
        this._star[3].show();
        this._star[4].show();
        if (value < 0.2)
                        this._star[0].hide();
        if (value < 0.4)
                        this._star[1].hide();
        if (value < 0.6)
                        this._star[2].hide();
        if (value < 0.8)
                        this._star[3].hide();
        if (value < 1.0)
                        this._star[4].hide();
            }
}

function PlaylistItem() {
    this._init.apply(this, arguments);
}

PlaylistItem.prototype = {
    __proto__: PopupMenu.PopupBaseMenuItem.prototype,

    _init: function (text, obj, icon) {
        PopupMenu.PopupBaseMenuItem.prototype._init.call(this);
        this.obj = obj;
        this.box = new St.BoxLayout();
        this.addActor(this.box);
        this.label = new St.Label({text: text});
        this.icon = new St.Icon({style_class: 'menu-icon', icon_name: 'view-list'});
        this.box.add_actor(this.icon);
        this.box.add_actor(this.label);
    }
};
