/**
 * search.js — 搜索与缓存管理
 */
(function (global) {
    'use strict';

    var Utils = global.Utils;
    var PoiProcessor = global.PoiProcessor;

    var SEARCH_CACHE_TTL = 2 * 60 * 1000;
    var MAX_CACHE_SIZE = 30;
    var searchCache = new Map();
    var latestSearchToken = 0;

    function getApiKey() {
        return Utils.getConfig('amap.webServiceKey', '');
    }

    function pruneSearchCache() {
        if (searchCache.size <= MAX_CACHE_SIZE) return;
        var orderedEntries = Array.from(searchCache.entries())
            .sort(function (a, b) { return a[1].timestamp - b[1].timestamp; });
        var removeCount = searchCache.size - MAX_CACHE_SIZE;
        for (var i = 0; i < removeCount; i++) {
            searchCache.delete(orderedEntries[i][0]);
        }
    }

    /**
     * 搜索周边地点
     * @param {number} lat
     * @param {number} lng
     * @param {string} searchQuery
     * @param {number} radius - 搜索半径(米)
     * @param {boolean} forceRefresh
     * @param {function} onResult - 回调(places, query)
     */
    function searchNearbyPlaces(lat, lng, searchQuery, radius, forceRefresh, onResult) {
        var normalizedQuery = (searchQuery || '').trim();
        var requestToken = ++latestSearchToken;
        var cacheKey = lat.toFixed(4) + '_' + lng.toFixed(4) + '_' + radius + '_' + normalizedQuery;

        var cacheHit = searchCache.get(cacheKey);
        if (!forceRefresh && cacheHit && (Date.now() - cacheHit.timestamp) < SEARCH_CACHE_TTL) {
            onResult(cacheHit.places, normalizedQuery);
            return;
        }

        var apiKey = getApiKey();
        var categoryTypes = PoiProcessor.AMAP_TYPES_MAPPING[normalizedQuery];
        var fetchPromises = [];

        if (normalizedQuery && !categoryTypes) {
            var aroundUrl = 'https://restapi.amap.com/v3/place/around?key=' + apiKey +
                '&location=' + lng + ',' + lat + '&radius=' + radius +
                '&offset=50&extensions=all&sortrule=weight&keywords=' + encodeURIComponent(searchQuery);
            var textUrl = 'https://restapi.amap.com/v3/place/text?key=' + apiKey +
                '&offset=50&extensions=all&citylimit=false&location=' + lng + ',' + lat +
                '&keywords=' + encodeURIComponent(searchQuery);
            fetchPromises = [
                Utils.fetchJson(aroundUrl),
                Utils.fetchJson(textUrl)
            ];
        } else {
            var requestTypes = categoryTypes ? [categoryTypes] : PoiProcessor.PRESET_TYPES;
            fetchPromises = requestTypes.map(function (types) {
                var url = 'https://restapi.amap.com/v3/place/around?key=' + apiKey +
                    '&location=' + lng + ',' + lat + '&radius=' + radius +
                    '&offset=50&extensions=all&sortrule=weight&types=' + types;
                return Utils.fetchJson(url);
            });
        }

        Promise.all(fetchPromises)
            .then(function (results) {
                if (requestToken !== latestSearchToken) return;

                var allPois = [];
                results.forEach(function (data) {
                    if (data && data.status === '1' && Array.isArray(data.pois)) {
                        allPois = allPois.concat(data.pois);
                    }
                });

                var uniquePoisMap = new Map();
                allPois.forEach(function (poi) {
                    if (poi && poi.id) uniquePoisMap.set(poi.id, poi);
                });
                var uniquePois = Array.from(uniquePoisMap.values());

                if (uniquePois.length === 0) {
                    searchCache.set(cacheKey, { timestamp: Date.now(), places: [] });
                    pruneSearchCache();
                    onResult([], normalizedQuery);
                    return;
                }

                var places = uniquePois
                    .map(function (poi) {
                        return Utils.safeRun('POI处理', function () { return PoiProcessor.processPOIData(poi, lat, lng); });
                    })
                    .filter(function (place) { return place !== null; })
                    .filter(function (place) { return PoiProcessor.ALLOWED_PLACE_TYPES.indexOf(place.type) >= 0; });

                if (searchQuery) {
                    var lowerQuery = searchQuery.toLowerCase();
                    places = places.filter(function (place) {
                        return place.name.toLowerCase().indexOf(lowerQuery) >= 0 ||
                               place.typeDesc.toLowerCase().indexOf(lowerQuery) >= 0 ||
                               place.address.toLowerCase().indexOf(lowerQuery) >= 0;
                    });
                }

                places.sort(function (a, b) {
                    if (searchQuery) {
                        var aStarts = a.name.toLowerCase().indexOf(lowerQuery) === 0 ? 1 : 0;
                        var bStarts = b.name.toLowerCase().indexOf(lowerQuery) === 0 ? 1 : 0;
                        if (aStarts !== bStarts) return bStarts - aStarts;
                    }
                    var aRating = Number.isFinite(a.rating) ? a.rating : 0;
                    var bRating = Number.isFinite(b.rating) ? b.rating : 0;
                    if (aRating !== bRating) return bRating - aRating;
                    return a.distance - b.distance;
                });

                searchCache.set(cacheKey, { timestamp: Date.now(), places: places });
                pruneSearchCache();
                onResult(places, normalizedQuery);
            })
            .catch(function (error) {
                console.error('POI搜索失败:', error);
                onResult(null, normalizedQuery, error);
            });
    }

    function clearCache() {
        searchCache.clear();
    }

    global.Search = {
        searchNearbyPlaces: searchNearbyPlaces,
        clearCache: clearCache
    };
})(window);
