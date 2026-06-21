/**
 * utils.js — 通用工具函数
 */
(function (global) {
    'use strict';

    function escapeHtml(str) {
        if (str === null || str === undefined) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function safeRun(label, task) {
        try {
            return task();
        } catch (error) {
            console.error(label + '执行失败:', error);
            return null;
        }
    }

    function calculateDistance(lat1, lng1, lat2, lng2) {
        var R = 6371;
        var dLat = (lat2 - lat1) * Math.PI / 180;
        var dLng = (lng2 - lng1) * Math.PI / 180;
        var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLng / 2) * Math.sin(dLng / 2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    function formatDistance(km) {
        if (km < 1) {
            return Math.round(km * 1000) + 'm';
        }
        return km.toFixed(1) + 'km';
    }

    /**
     * 带超时的 fetch 封装
     */
    function fetchWithTimeout(url, options) {
        options = options || {};
        var timeout = options.timeout || 10000;
        delete options.timeout;

        return new Promise(function (resolve, reject) {
            var controller = null;
            if (typeof AbortController !== 'undefined') {
                controller = new AbortController();
                options.signal = controller.signal;
            }

            var timer = setTimeout(function () {
                if (controller) controller.abort();
                reject(new Error('请求超时 (' + timeout + 'ms)'));
            }, timeout);

            fetch(url, options)
                .then(function (res) {
                    clearTimeout(timer);
                    resolve(res);
                })
                .catch(function (err) {
                    clearTimeout(timer);
                    reject(err);
                });
        });
    }

    /**
     * JSON 请求封装（带超时 + 统一错误处理）
     */
    function fetchJson(url, timeout) {
        return fetchWithTimeout(url, { timeout: timeout || 10000 })
            .then(function (res) { return res.json(); })
            .catch(function () { return { status: '0', error: true }; });
    }

    /**
     * 获取配置值（带默认值）
     */
    function getConfig(path, fallback) {
        var parts = path.split('.');
        var val = global.AppConfig;
        for (var i = 0; i < parts.length; i++) {
            if (val === null || val === undefined) return fallback;
            val = val[parts[i]];
        }
        return val === undefined ? fallback : val;
    }

    global.Utils = {
        escapeHtml: escapeHtml,
        safeRun: safeRun,
        calculateDistance: calculateDistance,
        formatDistance: formatDistance,
        fetchWithTimeout: fetchWithTimeout,
        fetchJson: fetchJson,
        getConfig: getConfig
    };
})(window);
