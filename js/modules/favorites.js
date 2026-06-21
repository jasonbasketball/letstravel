/**
 * favorites.js — 收藏管理
 */
(function (global) {
    'use strict';

    var STORAGE_KEY = 'favorites';
    var favorites = [];

    try {
        favorites = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch (e) {
        favorites = [];
    }

    function save() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
        } catch (e) {
            console.error('收藏保存失败:', e);
        }
    }

    function includes(id) {
        return favorites.indexOf(id) >= 0;
    }

    function toggle(id) {
        var index = favorites.indexOf(id);
        if (index > -1) {
            favorites.splice(index, 1);
        } else {
            favorites.push(id);
        }
        save();
        return favorites.indexOf(id) >= 0;
    }

    function getAll() {
        return favorites.slice();
    }

    function filterPlaces(places) {
        return places.filter(function (p) { return includes(p.id); });
    }

    global.Favorites = {
        includes: includes,
        toggle: toggle,
        getAll: getAll,
        filterPlaces: filterPlaces
    };
})(window);
