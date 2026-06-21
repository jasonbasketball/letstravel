/**
 * map.js — 高德地图封装
 */
(function (global) {
    'use strict';

    var Utils = global.Utils;
    var map = null;
    var marker = null;
    var poiMarkers = [];

    function init(lat, lng) {
        var mapContainer = document.getElementById('mapContainer');
        var locationMap = document.getElementById('locationMap');
        if (!mapContainer || !locationMap) return;

        locationMap.style.display = 'block';

        if (window.AMap) {
            if (map) {
                try { map.destroy(); } catch (e) {}
            }
            map = new AMap.Map('mapContainer', {
                zoom: 14,
                center: [lng, lat]
            });
            marker = new AMap.Marker({
                position: [lng, lat],
                title: '我的位置',
                icon: 'https://webapi.amap.com/theme/v1.3/markers/n/mark_r.png'
            });
            marker.setMap(map);
        }
    }

    function updateMarkers(places, onMarkerClick) {
        if (!map || !window.AMap) return;

        poiMarkers.forEach(function (m) { try { map.remove(m); } catch (e) {} });
        poiMarkers = [];

        places.forEach(function (place) {
            try {
                var poiMarker = new AMap.Marker({
                    position: [place.lng, place.lat],
                    title: place.name
                });
                poiMarker.on('click', function () {
                    if (onMarkerClick) onMarkerClick(place);
                });
                poiMarker.setMap(map);
                poiMarkers.push(poiMarker);
                place.marker = poiMarker;
            } catch (error) {
                console.error('地图标记渲染失败:', place && place.name, error);
            }
        });

        if (poiMarkers.length > 0 && marker) {
            Utils.safeRun('地图视野调整', function () { map.setFitView([marker].concat(poiMarkers)); });
        }
    }

    function clearMarkers() {
        poiMarkers.forEach(function (m) { try { map.remove(m); } catch (e) {} });
        poiMarkers = [];
    }

    function getMap() { return map; }

    global.MapModule = {
        init: init,
        updateMarkers: updateMarkers,
        clearMarkers: clearMarkers,
        getMap: getMap
    };
})(window);
