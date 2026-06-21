/**
 * location.js — 定位与地址搜索
 */
(function (global) {
    'use strict';

    var Utils = global.Utils;
    var MapModule = global.MapModule;
    var Search = global.Search;

    var currentLocation = null;

    function getApiKey() {
        return Utils.getConfig('amap.webServiceKey', '');
    }

    function getCurrentLocation(onSuccess, onError) {
        if (!navigator.geolocation) {
            if (onError) onError('您的浏览器不支持定位功能，请手动输入地址');
            return;
        }

        navigator.geolocation.getCurrentPosition(
            function (position) {
                var lat = position.coords.latitude;
                var lng = position.coords.longitude;
                currentLocation = { lat: lat, lng: lng };
                reverseGeocode(lat, lng);
                MapModule.init(lat, lng);
                if (onSuccess) onSuccess(lat, lng);
            },
            function (error) {
                console.error('定位失败:', error);
                var msg = '定位失败，请检查浏览器定位权限或手动输入地址';
                if (error.code === 1) msg = '定位权限被拒绝，请允许定位权限或手动输入地址';
                else if (error.code === 3) msg = '定位超时，请重试或手动输入地址';
                if (onError) onError(msg);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    }

    function reverseGeocode(lat, lng) {
        var apiKey = getApiKey();
        var url = 'https://restapi.amap.com/v3/geocode/regeo?key=' + apiKey + '&location=' + lng + ',' + lat + '&extensions=base';
        Utils.fetchJson(url)
            .then(function (data) {
                if (data.status === '1' && data.regeocode) {
                    var address = data.regeocode.formatted_address;
                    var province = data.regeocode.addressComponent.province;
                    var city = data.regeocode.addressComponent.city || province;
                    updateDisplay(address, city);
                }
            })
            .catch(function () {
                updateDisplay('经度: ' + lng.toFixed(4) + ', 纬度: ' + lat.toFixed(4), '未知城市');
            });
    }

    function searchByAddress(address, onSuccess, onError) {
        var apiKey = getApiKey();
        var url = 'https://restapi.amap.com/v3/geocode/geo?key=' + apiKey + '&address=' + encodeURIComponent(address);
        Utils.fetchJson(url)
            .then(function (data) {
                if (data.status === '1' && data.geocodes && data.geocodes.length > 0) {
                    var geocode = data.geocodes[0];
                    var location = geocode.location.split(',');
                    var lng = parseFloat(location[0]);
                    var lat = parseFloat(location[1]);
                    currentLocation = { lat: lat, lng: lng };
                    updateDisplay(geocode.formatted_address || address, geocode.city || '');
                    MapModule.init(lat, lng);
                    if (onSuccess) onSuccess(lat, lng);
                } else {
                    if (onError) onError('未找到该地址，请尝试其他关键词');
                }
            })
            .catch(function () {
                if (onError) onError('地址搜索失败，请稍后重试');
            });
    }

    function updateDisplay(address, city) {
        var locationInfo = document.getElementById('locationInfo');
        if (locationInfo) {
            locationInfo.innerHTML =
                '<div class="location-result">' +
                    '<i class="fas fa-location-dot"></i>' +
                    '<div class="location-result-text">' +
                        '<h4>当前位置</h4>' +
                        '<p>' + Utils.escapeHtml(address) + '</p>' +
                    '</div>' +
                '</div>';
        }
        var nearbyDesc = document.getElementById('nearbyDesc');
        if (nearbyDesc) {
            nearbyDesc.textContent = '为您推荐' + city + '周边的好去处';
        }
    }

    function showError(message) {
        var locationInfo = document.getElementById('locationInfo');
        if (!locationInfo) return;
        locationInfo.innerHTML =
            '<div class="location-placeholder">' +
                '<i class="fas fa-exclamation-circle" style="color: var(--accent-coral);"></i>' +
                '<p>' + Utils.escapeHtml(message) + '</p>' +
                '<button class="get-location-btn" id="getLocationBtnRetry">' +
                    '<i class="fas fa-location-crosshairs"></i>' +
                    '重新获取位置' +
                '</button>' +
            '</div>';
        var retryBtn = document.getElementById('getLocationBtnRetry');
        if (retryBtn) {
            retryBtn.addEventListener('click', function () {
                getCurrentLocation();
            });
        }
    }

    function showLoading(message) {
        var locationInfo = document.getElementById('locationInfo');
        if (!locationInfo) return;
        locationInfo.innerHTML =
            '<div class="location-loading">' +
                '<div class="loading-spinner"></div>' +
                '<p>' + Utils.escapeHtml(message || '正在获取您的位置...') + '</p>' +
            '</div>';
    }

    function getCurrent() { return currentLocation; }
    function clearCurrent() { currentLocation = null; }

    global.Location = {
        getCurrentLocation: getCurrentLocation,
        searchByAddress: searchByAddress,
        updateDisplay: updateDisplay,
        showError: showError,
        showLoading: showLoading,
        getCurrent: getCurrent,
        clearCurrent: clearCurrent
    };
})(window);
