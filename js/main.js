let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
let currentLocation = null;
let map = null;
let marker = null;
let placeSearch = null;
let currentType = 'all';
let currentFilters = {
    radius: 5000,
    distanceFilterKm: 'all',
    sort: 'distance'
};
let allPlaces = [];
let filteredCategoryPlaces = [];
let categoryVisibleCount = 12;
const CATEGORY_PAGE_SIZE = 12;
const SECTION_PAGE_SIZE = 6;
let sectionVisibleCounts = {
    nearby: 6,
    family: 6,
    food: 6,
    popular: 6
};
let latestSearchToken = 0;
const searchCache = new Map();
const SEARCH_CACHE_TTL = 2 * 60 * 1000;
const MAX_CACHE_SIZE = 30;

const AMAP_KEY = '5cc98010473dc9bf7343b87635e58bab';

const typeMapping = {
    '公园': '公园',
    '游乐场': '游乐场',
    '博物馆': '博物馆',
    '动物园': '动物园',
    '露营地': '露营地',
    '美食': '美食',
    '景点': '景点'
};

const amapTypesMapping = {
    '公园': '080101|080100|110105',
    '游乐场': '080300|110302',
    '博物馆': '140100',
    '动物园': '110104|110100',
    '露营地': '080304',
    '美食': '050000|050100|050200|050300|050400|050500',
    '景点': '110000|110200|110206'
};

const allowedPlaceTypes = ['公园', '游乐场', '博物馆', '动物园', '露营地', '景点', '美食'];
const excludePoiKeywords = ['停车场', '厕所', '洗手间', '公交', '大门', '入口', '出口', '售票处', '服务中心', '内部设施', '棋牌', '麻将', '台球', '健身', '瑜伽', '酒吧', '网吧', '足浴', '洗浴'];
const excludeTypeKeywords = ['体育休闲服务', '运动场馆', '休闲场所', '生活服务', '会所'];

const familyTypes = ['公园', '游乐场', '博物馆', '动物园'];

document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        document.getElementById('loadingOverlay').classList.add('hidden');
    }, 1000);

    initCarousel();
    initNavbar();
    initMobileMenu();
    initLocation();
    initCategoryTabs();
    initFilters();
    initSearch();
    initSectionMoreButtons();
    initCategoryMoreButton();
    initSectionLoadMoreButtons();
    initBackToTop();
    initModal();
    initTags();
    initDefaultPlaces();
});

function initCarousel() {
    const slides = document.querySelectorAll('.carousel-slide');
    const dotsContainer = document.getElementById('carouselDots');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    let currentSlide = 0;
    let autoPlayInterval;

    slides.forEach((_, index) => {
        const dot = document.createElement('div');
        dot.className = `carousel-dot ${index === 0 ? 'active' : ''}`;
        dot.addEventListener('click', () => goToSlide(index));
        dotsContainer.appendChild(dot);
    });

    const dots = document.querySelectorAll('.carousel-dot');

    function goToSlide(index) {
        slides[currentSlide].classList.remove('active');
        dots[currentSlide].classList.remove('active');
        currentSlide = index;
        if (currentSlide >= slides.length) currentSlide = 0;
        if (currentSlide < 0) currentSlide = slides.length - 1;
        slides[currentSlide].classList.add('active');
        dots[currentSlide].classList.add('active');
    }

    function nextSlide() {
        goToSlide(currentSlide + 1);
    }

    function prevSlide() {
        goToSlide(currentSlide - 1);
    }

    function startAutoPlay() {
        autoPlayInterval = setInterval(nextSlide, 5000);
    }

    function stopAutoPlay() {
        clearInterval(autoPlayInterval);
    }

    prevBtn.addEventListener('click', () => {
        prevSlide();
        stopAutoPlay();
        startAutoPlay();
    });

    nextBtn.addEventListener('click', () => {
        nextSlide();
        stopAutoPlay();
        startAutoPlay();
    });

    startAutoPlay();
}

function initNavbar() {
    const navbar = document.getElementById('navbar');
    const navLinks = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            
            const targetId = this.getAttribute('href');
            if (targetId.startsWith('#')) {
                e.preventDefault();
                const targetSection = document.querySelector(targetId);
                if (targetSection) {
                    const offsetTop = targetSection.offsetTop - 80;
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
}

function initMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navMenu = document.getElementById('navMenu');

    mobileMenuBtn.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        const icon = mobileMenuBtn.querySelector('i');
        if (navMenu.classList.contains('active')) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-times');
        } else {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
    });

    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            const icon = mobileMenuBtn.querySelector('i');
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        });
    });
}

function initLocation() {
    const getLocationBtn = document.getElementById('getLocationBtn');
    const refreshLocationBtn = document.getElementById('refreshLocationBtn');
    const manualLocationBtn = document.getElementById('manualLocationBtn');
    const manualLocationInput = document.getElementById('manualLocationInput');

    getLocationBtn.addEventListener('click', getCurrentLocation);
    refreshLocationBtn.addEventListener('click', getCurrentLocation);

    manualLocationBtn.addEventListener('click', () => {
        const address = manualLocationInput.value.trim();
        if (address) {
            searchLocationByAddress(address);
        }
    });

    manualLocationInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const address = manualLocationInput.value.trim();
            if (address) {
                searchLocationByAddress(address);
            }
        }
    });

    initRadiusSetting();

    // 默认尝试静默获取一次位置，避免用户面对空状态
    getCurrentLocation(); // 取消注释，打开立刻弹出定位请求
}

function initRadiusSetting() {
    const radiusOptions = document.querySelectorAll('input[name="searchRadius"]');
    const customRadiusInput = document.getElementById('customRadius');
    const applyCustomRadiusBtn = document.getElementById('applyCustomRadius');

    radiusOptions.forEach(option => {
        option.addEventListener('change', (e) => {
            currentFilters.radius = parseInt(e.target.value);
            syncDistanceFilterWithRadius();
            updateRadiusDisplay();
            if (currentLocation) {
                searchNearbyPlaces(currentLocation.lat, currentLocation.lng, '', true);
            }
        });
    });

    applyCustomRadiusBtn.addEventListener('click', () => {
        const customValue = parseInt(customRadiusInput.value);
        if (customValue && customValue >= 500 && customValue <= 100000) {
            currentFilters.radius = customValue;
            radiusOptions.forEach(opt => opt.checked = false);
            syncDistanceFilterWithRadius();
            updateRadiusDisplay();
            if (currentLocation) {
                searchNearbyPlaces(currentLocation.lat, currentLocation.lng, '', true);
            }
        } else {
            alert('请输入500-100000之间的数值');
        }
    });

    customRadiusInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            applyCustomRadiusBtn.click();
        }
    });
}

function updateRadiusDisplay() {
    const radiusText = currentFilters.radius >= 1000
        ? (currentFilters.radius / 1000) + 'km'
        : currentFilters.radius + 'm';
    
    const nearbyDesc = document.getElementById('nearbyDesc');
    if (nearbyDesc) {
        nearbyDesc.textContent = `搜索范围: ${radiusText}`;
    }
}

function syncDistanceFilterWithRadius() {
    const distanceFilter = document.getElementById('distanceFilter');
    if (!distanceFilter) return;

    const radiusKm = currentFilters.radius / 1000;
    const exactOptions = ['1', '3', '5', '10', '20'];
    const matched = exactOptions.find(v => parseFloat(v) === radiusKm);
    distanceFilter.value = matched || 'all';
    currentFilters.distanceFilterKm = distanceFilter.value;
}

function getSearchRadius() {
    return currentFilters.radius;
}

function getCurrentLocation() {
    const locationInfo = document.getElementById('locationInfo');
    const getLocationBtn = document.getElementById('getLocationBtn');

    locationInfo.innerHTML = `
        <div class="location-loading">
            <div class="loading-spinner"></div>
            <p>正在获取您的位置...</p>
        </div>
    `;
    getLocationBtn.disabled = true;

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                currentLocation = { lat, lng };
                
                reverseGeocode(lat, lng);
                initMap(lat, lng);
                searchNearbyPlaces(lat, lng);
            },
            (error) => {
                console.error('定位失败:', error);
                showLocationError('定位失败，请检查浏览器定位权限或手动输入地址');
                getLocationBtn.disabled = false;
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    } else {
        showLocationError('您的浏览器不支持定位功能，请手动输入地址');
        getLocationBtn.disabled = false;
    }
}

function showLocationError(message) {
    const locationInfo = document.getElementById('locationInfo');
    locationInfo.innerHTML = `
        <div class="location-placeholder">
            <i class="fas fa-exclamation-circle" style="color: var(--accent-coral);"></i>
            <p>${message}</p>
            <button class="get-location-btn" id="getLocationBtn" onclick="getCurrentLocation()">
                <i class="fas fa-location-crosshairs"></i>
                重新获取位置
            </button>
        </div>
    `;
}

function reverseGeocode(lat, lng) {
    fetch(`https://restapi.amap.com/v3/geocode/regeo?key=${AMAP_KEY}&location=${lng},${lat}&extensions=base`)
        .then(response => response.json())
        .then(data => {
            if (data.status === '1' && data.regeocode) {
                const address = data.regeocode.formatted_address;
                const province = data.regeocode.addressComponent.province;
                const city = data.regeocode.addressComponent.city || province;
                
                updateLocationDisplay(address, city);
            }
        })
        .catch(error => {
            console.error('逆地理编码失败:', error);
            updateLocationDisplay(`经度: ${lng.toFixed(4)}, 纬度: ${lat.toFixed(4)}`, '未知城市');
        });
}

function updateLocationDisplay(address, city) {
    const locationInfo = document.getElementById('locationInfo');
    locationInfo.innerHTML = `
        <div class="location-result">
            <i class="fas fa-location-dot"></i>
            <div class="location-result-text">
                <h4>当前位置</h4>
                <p>${address}</p>
            </div>
        </div>
    `;

    document.getElementById('nearbyDesc').textContent = `为您推荐${city}周边的好去处`;
}

function initMap(lat, lng) {
    const mapContainer = document.getElementById('mapContainer');
    const locationMap = document.getElementById('locationMap');
    
    locationMap.style.display = 'block';

    if (window.AMap) {
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

let poiMarkers = [];

function updateMapMarkers(places) {
    if (!map || !window.AMap) return;
    
    // 清除旧的POI和标点
    poiMarkers.forEach(m => map.remove(m));
    poiMarkers = [];
    
    places.forEach(place => {
        const poiMarker = new AMap.Marker({
            position: [place.lng, place.lat],
            title: place.name
        });
        
        poiMarker.on('click', () => {
            openDetailModal(place);
        });
        
        poiMarker.setMap(map);
        poiMarkers.push(poiMarker);
        
        // 保存marker的引用以供hover联动使用
        place.marker = poiMarker;
    });
    
    // 如果有结果，调整地图视野适应所有标点
    if (poiMarkers.length > 0 && marker) {
        map.setFitView([marker, ...poiMarkers]);
    }
}

function searchLocationByAddress(address) {
    const locationInfo = document.getElementById('locationInfo');
    locationInfo.innerHTML = `
        <div class="location-loading">
            <div class="loading-spinner"></div>
            <p>正在搜索地址...</p>
        </div>
    `;

    fetch(`https://restapi.amap.com/v3/geocode/geo?key=${AMAP_KEY}&address=${encodeURIComponent(address)}`)
        .then(response => response.json())
        .then(data => {
            if (data.status === '1' && data.geocodes && data.geocodes.length > 0) {
                const geocode = data.geocodes[0];
                const location = geocode.location.split(',');
                const lng = parseFloat(location[0]);
                const lat = parseFloat(location[1]);
                
                currentLocation = { lat, lng };
                
                updateLocationDisplay(geocode.formatted_address || address, geocode.city || '');
                initMap(lat, lng);
                searchNearbyPlaces(lat, lng);
            } else {
                showLocationError('未找到该地址，请尝试其他关键词');
            }
        })
        .catch(error => {
            console.error('地址搜索失败:', error);
            showLocationError('地址搜索失败，请稍后重试');
        });
}

function searchNearbyPlaces(lat, lng, searchQuery = '', forceRefresh = false) {
    const nearbyCards = document.getElementById('nearbyCards');
    if (nearbyCards) {
        nearbyCards.innerHTML = `
            <div class="empty-state">
                <div class="loading-spinner" style="width: 40px; height: 40px; border-width: 4px;"></div>
                <p>正在拉取各大平台网红数据...</p>
            </div>
        `;
    }

    const radius = getSearchRadius();
    const normalizedQuery = (searchQuery || '').trim();
    const requestToken = ++latestSearchToken;
    const cacheKey = `${lat.toFixed(4)}_${lng.toFixed(4)}_${radius}_${normalizedQuery}`;
    const cacheHit = searchCache.get(cacheKey);
    if (!forceRefresh && cacheHit && (Date.now() - cacheHit.timestamp) < SEARCH_CACHE_TTL) {
        allPlaces = cacheHit.places;
        resetSectionVisibleCounts();
        rerenderSections();
        applyFilters();
        updateMapMarkers(allPlaces);
        return;
    }

    const categoryTypes = amapTypesMapping[normalizedQuery];
    const presetTypes = [
        '110000|110200',
        '080100|080300',
        '140100',
        '110104|110100',
        '050000|050100|050200|050300|050400|050500'
    ];

    let fetchPromises = [];

    if (normalizedQuery && !categoryTypes) {
        const aroundUrl = `https://restapi.amap.com/v3/place/around?key=${AMAP_KEY}&location=${lng},${lat}&radius=${radius}&offset=50&extensions=all&sortrule=weight&keywords=${encodeURIComponent(searchQuery)}`;
        const textUrl = `https://restapi.amap.com/v3/place/text?key=${AMAP_KEY}&offset=50&extensions=all&citylimit=false&location=${lng},${lat}&keywords=${encodeURIComponent(searchQuery)}`;
        fetchPromises = [
            fetch(aroundUrl).then(res => res.json()).catch(() => ({ status: '0', pois: [] })),
            fetch(textUrl).then(res => res.json()).catch(() => ({ status: '0', pois: [] }))
        ];
    } else {
        const requestTypes = categoryTypes ? [categoryTypes] : presetTypes;
        fetchPromises = requestTypes.map(types => {
            return fetch(`https://restapi.amap.com/v3/place/around?key=${AMAP_KEY}&location=${lng},${lat}&radius=${radius}&offset=50&extensions=all&sortrule=weight&types=${types}`)
                .then(res => res.json())
                .catch(() => ({ status: '0', pois: [] }));
        });
    }

    Promise.all(fetchPromises)
        .then(results => {
            if (requestToken !== latestSearchToken) return;

            let allPois = [];
            results.forEach(data => {
                if (data.status === '1' && Array.isArray(data.pois)) {
                    allPois = allPois.concat(data.pois);
                }
            });

            const uniquePoisMap = new Map();
            allPois.forEach(poi => {
                if (poi && poi.id) {
                    uniquePoisMap.set(poi.id, poi);
                }
            });
            const uniquePois = Array.from(uniquePoisMap.values());

            if (uniquePois.length === 0) {
                allPlaces = [];
                resetSectionVisibleCounts();
                rerenderSections();
                applyFilters();
                updateMapMarkers([]);
                searchCache.set(cacheKey, { timestamp: Date.now(), places: [] });
                pruneSearchCache();
                return;
            }

            let places = uniquePois
                .map(poi => processPOIData(poi, lat, lng))
                .filter(place => place !== null)
                .filter(place => allowedPlaceTypes.includes(place.type));

            if (searchQuery) {
                const normalizedQuery = searchQuery.toLowerCase();
                places = places.filter(place => (
                    place.name.toLowerCase().includes(normalizedQuery) ||
                    place.typeDesc.toLowerCase().includes(normalizedQuery) ||
                    place.address.toLowerCase().includes(normalizedQuery)
                ));
            }

            places.sort((a, b) => {
                if (searchQuery) {
                    const query = searchQuery.toLowerCase();
                    const aStarts = a.name.toLowerCase().startsWith(query) ? 1 : 0;
                    const bStarts = b.name.toLowerCase().startsWith(query) ? 1 : 0;
                    if (aStarts !== bStarts) return bStarts - aStarts;
                }

                const aRating = Number.isFinite(a.rating) ? a.rating : (parseFloat(a.rating) || 0);
                const bRating = Number.isFinite(b.rating) ? b.rating : (parseFloat(b.rating) || 0);
                if (aRating !== bRating) return bRating - aRating;
                return a.distance - b.distance;
            });

            allPlaces = places;
            resetSectionVisibleCounts();
            searchCache.set(cacheKey, { timestamp: Date.now(), places });
            pruneSearchCache();
            rerenderSections();
            applyFilters();
            updateMapMarkers(places);

            if (normalizedQuery && !amapTypesMapping[normalizedQuery]) {
                document.getElementById('category').scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        })
        .catch(error => {
            console.error('POI搜索失败:', error);
            if (nearbyCards) {
                nearbyCards.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-exclamation-circle"></i>
                        <p>搜索失败，请稍后重试</p>
                    </div>
                `;
            }
        });
}

function pruneSearchCache() {
    if (searchCache.size <= MAX_CACHE_SIZE) return;

    const orderedEntries = Array.from(searchCache.entries())
        .sort((a, b) => a[1].timestamp - b[1].timestamp);

    const removeCount = searchCache.size - MAX_CACHE_SIZE;
    for (let i = 0; i < removeCount; i++) {
        searchCache.delete(orderedEntries[i][0]);
    }
}

function processPOIData(poi, userLat, userLng) {
    const poiName = poi.name || '';
    const typeDesc = poi.type || '';
    const typecode = poi.typecode || '';

    if (excludePoiKeywords.some(keyword => poiName.includes(keyword) || typeDesc.includes(keyword))) {
        return null;
    }

    if (excludeTypeKeywords.some(keyword => typeDesc.includes(keyword))) {
        return null;
    }

    if (!poi.location || !poi.location.includes(',')) {
        return null;
    }

    const location = poi.location.split(',');
    const poiLng = parseFloat(location[0]);
    const poiLat = parseFloat(location[1]);

    if (!Number.isFinite(poiLng) || !Number.isFinite(poiLat)) {
        return null;
    }

    const distance = calculateDistance(userLat, userLng, poiLat, poiLng);

    let type = '景点';
    if (typecode.startsWith('110104') || typecode.startsWith('110100') || typeDesc.includes('动物') || typeDesc.includes('水族') || poiName.includes('动物') || poiName.includes('海洋')) {
        type = '动物园';
    } else if (
        typeDesc.includes('游乐') ||
        poiName.includes('游乐') ||
        poiName.includes('乐园') ||
        poiName.includes('主题') ||
        poiName.includes('摩天轮') ||
        poiName.includes('过山车') ||
        typecode.startsWith('110302')
    ) {
        type = '游乐场';
    } else if (typecode.startsWith('1401') || typeDesc.includes('博物馆') || typeDesc.includes('科技馆') || typeDesc.includes('美术馆')) {
        type = '博物馆';
    } else if (typecode.startsWith('080101') || typecode.startsWith('080100') || typecode.startsWith('110105') || typeDesc.includes('公园')) {
        type = '公园';
    } else if (typecode.startsWith('080304') || typeDesc.includes('露营') || typeDesc.includes('营地') || typeDesc.includes('度假') || typeDesc.includes('农家乐')) {
        type = '露营地';
    } else if (typecode.startsWith('05') || typeDesc.includes('餐饮') || typeDesc.includes('美食') || typeDesc.includes('咖啡') || typeDesc.includes('茶馆') || typeDesc.includes('小吃')) {
        type = '美食';
    } else if (typecode.startsWith('1102') || typecode.startsWith('1100') || typeDesc.includes('风景名胜') || typeDesc.includes('景区') || typeDesc.includes('古迹')) {
        type = '景点';
    } else {
        return null;
    }

    const tipsPool = [
        '建议游玩时长：2-3小时，适合周末放松。',
        '这里环境很棒，记得带上相机多拍几张照片哦！',
        '周边配套齐全，吃喝玩乐一条龙，非常便利。',
        '周末人可能比较多，建议错峰出行，体验更佳。',
        '不管是情侣约会还是家庭出游，这里都是个不错的选择。',
        '可以带上一点防蚊液和防晒霜，以备不时之需。',
        '这里是个隐藏的宝藏打卡地，出片率极高！'
    ];

    const fallbackAddress = [poi.pname, poi.cityname, poi.adname].filter(Boolean).join('');
    const ratingValue = parseFloat(poi.biz_ext?.rating);
    const finalRating = Number.isFinite(ratingValue) ? ratingValue : parseFloat((3.5 + Math.random() * 1.5).toFixed(1));
    const distanceText = formatDistance(distance);
    const finalAddress = poi.address || fallbackAddress || '暂无地址信息';
    const durationMeta = getDurationMeta(type);
    const budgetLevel = getBudgetLevel(poi.biz_ext?.cost || '', type);
    const weatherTag = getWeatherTag(type);
    const audienceTags = getAudienceTags(type);
    const bestTime = getBestTime(type);
    const crowdLevel = getCrowdLevel(finalRating, type);
    const parkingTip = getParkingTip(type, distance);
    const themeTags = getThemeTags(type, budgetLevel, weatherTag, audienceTags);
    const highlights = getPlaceHighlights(type, weatherTag, bestTime);
    const intro = buildDetailedIntro({
        name: poiName,
        type,
        typeDesc,
        address: finalAddress,
        distanceText,
        rating: finalRating,
        cost: poi.biz_ext?.cost || ''
    });
    const popularityBase = calculatePopularityBase({
        rating: finalRating,
        distance,
        photoCount: Array.isArray(poi.photos) ? poi.photos.length : 0,
        hasTel: !!(poi.tel && poi.tel.trim()),
        hasCost: !!poi.biz_ext?.cost,
        type
    });

    return {
        id: poi.id,
        name: poi.name,
        type,
        typeDesc,
        address: finalAddress,
        distance,
        distanceText,
        lat: poiLat,
        lng: poiLng,
        tel: poi.tel || '',
        rating: finalRating,
        cost: poi.biz_ext?.cost || '',
        photos: poi.photos?.map(p => p.url) || [],
        image: poi.photos?.[0]?.url || `https://picsum.photos/600/400?random=${encodeURIComponent(poi.id)}`,
        isFamily: familyTypes.includes(type),
        intro,
        popularityBase,
        durationLabel: durationMeta.label,
        durationBucket: durationMeta.bucket,
        budgetLevel,
        weatherTag,
        audienceTags,
        bestTime,
        crowdLevel,
        parkingTip,
        themeTags,
        highlights,
        tip: tipsPool[Math.floor(Math.random() * tipsPool.length)]
    };
}

function calculatePopularityBase({ rating, distance, photoCount, hasTel, hasCost, type }) {
    const normalizedRating = Math.max(0, Math.min(100, (rating / 5) * 55));
    const distanceKm = Math.max(0.05, distance);
    const distanceScore = Math.max(0, 25 - (distanceKm * 2.2));
    const mediaScore = Math.min(10, photoCount * 2.5);
    const infoScore = (hasTel ? 4 : 0) + (hasCost ? 4 : 0);
    const typeScore = ['景点', '游乐场', '动物园', '博物馆'].includes(type) ? 6 : 3;

    return Math.max(0, Math.min(100, normalizedRating + distanceScore + mediaScore + infoScore + typeScore));
}

function getPopularityScore(place) {
    const favoriteBoost = favorites.includes(place.id) ? 8 : 0;
    return Math.max(0, Math.min(100, (place.popularityBase || 0) + favoriteBoost));
}

function getDurationMeta(type) {
    const map = {
        '公园': { label: '1-3小时', bucket: 'halfday' },
        '游乐场': { label: '4-6小时', bucket: 'fullday' },
        '博物馆': { label: '2-3小时', bucket: 'halfday' },
        '动物园': { label: '4-6小时', bucket: 'fullday' },
        '露营地': { label: '半天到1天', bucket: 'fullday' },
        '景点': { label: '2-4小时', bucket: 'halfday' },
        '美食': { label: '1-2小时', bucket: 'short' }
    };
    return map[type] || { label: '2-3小时', bucket: 'halfday' };
}

function getBudgetLevel(cost, type) {
    const parsedCost = parseFloat(cost);
    if (Number.isFinite(parsedCost)) {
        if (parsedCost <= 30) return 'low';
        if (parsedCost <= 100) return 'medium';
        return 'high';
    }

    if (['公园', '景点'].includes(type)) return 'free';
    if (type === '美食') return 'medium';
    return 'low';
}

function getWeatherTag(type) {
    if (['博物馆', '美食'].includes(type)) return 'indoor';
    if (['公园', '露营地', '动物园'].includes(type)) return 'outdoor';
    return 'mixed';
}

function getAudienceTags(type) {
    const tags = ['friends'];
    if (['公园', '游乐场', '博物馆', '动物园'].includes(type)) tags.push('family');
    if (['景点', '公园', '美食', '博物馆'].includes(type)) tags.push('couple');
    if (['景点', '博物馆', '公园', '美食'].includes(type)) tags.push('solo');
    return [...new Set(tags)];
}

function getBestTime(type) {
    const map = {
        '公园': '上午或傍晚',
        '游乐场': '上午开园后',
        '博物馆': '工作日下午',
        '动物园': '上午 9 点-11 点',
        '露营地': '晴天午后',
        '景点': '日落前后',
        '美食': '午餐后或晚餐前'
    };
    return map[type] || '错峰前往';
}

function getCrowdLevel(rating, type) {
    if (rating >= 4.6 || ['游乐场', '动物园'].includes(type)) return '较高';
    if (rating >= 4.1) return '中等';
    return '相对轻松';
}

function getParkingTip(type, distance) {
    if (distance < 1) return '步行或打车更省心';
    if (['露营地', '公园', '动物园'].includes(type)) return '建议自驾，优先看停车场指引';
    if (type === '博物馆') return '建议优先公共交通，周边停车位有限';
    return '可根据实时路况选择自驾或公共交通';
}

function getThemeTags(type, budgetLevel, weatherTag, audienceTags) {
    const tags = [];
    if (budgetLevel === 'free') tags.push('免费优先');
    if (weatherTag === 'indoor') tags.push('雨天友好');
    if (weatherTag === 'outdoor') tags.push('晴天更佳');
    if (audienceTags.includes('family')) tags.push('亲子可玩');
    if (audienceTags.includes('couple')) tags.push('约会友好');
    if (type === '景点') tags.push('拍照出片');
    if (type === '美食') tags.push('适合聚餐');
    return tags.slice(0, 3);
}

function getPlaceHighlights(type, weatherTag, bestTime) {
    const base = {
        '公园': ['适合散步放松', '开阔空间更轻松', `推荐${bestTime}前往`],
        '游乐场': ['互动体验感强', '适合周末半天到一天', `推荐${bestTime}出发`],
        '博物馆': ['内容集中易逛', '适合学习与拍照', weatherTag === 'indoor' ? '雨天也能安心去' : '四季都适合'],
        '动物园': ['遛娃成功率高', '适合周末整天安排', `推荐${bestTime}前往`],
        '露营地': ['适合放空和社交', '适合带装备慢慢玩', '建议关注天气变化'],
        '景点': ['适合打卡拍照', '内容丰富不单调', `推荐${bestTime}体验更佳`],
        '美食': ['适合顺路补给', '可与景点串联', '适合朋友或情侣一起去']
    };
    return base[type] || ['适合顺路安排', '体验轻松', `推荐${bestTime}前往`];
}

function buildDetailedIntro({ name, type, typeDesc, address, distanceText, rating, cost }) {
    const typeDurationMap = {
        '公园': '1-3小时',
        '游乐场': '3-5小时',
        '博物馆': '2-4小时',
        '动物园': '3-6小时',
        '露营地': '半天到1天',
        '景点': '2-4小时',
        '美食': '1-2小时'
    };

    const duration = typeDurationMap[type] || '2-3小时';
    const ratingText = Number.isFinite(rating) ? `${rating.toFixed(1)}分` : '评分稳定';
    const costText = cost ? `人均约${cost}元，` : '';
    const descText = typeDesc && typeDesc !== type ? `类型为${typeDesc}。` : `属于${type}场景。`;

    return `${name}${descText}位于${address}，距离您约${distanceText}。当前口碑${ratingText}，${costText}建议安排${duration}游玩，优先选择非高峰时段体验更佳。`;
}

function buildTopicCollections(places) {
    return [
        {
            id: 'family',
            title: '遛娃榜单',
            desc: '优先看亲子友好、步行压力小、停留时长充足的地点。',
            places: places.filter(p => p.audienceTags?.includes('family') && p.type !== '美食').slice(0, 5),
            action: () => applyScenarioFilters({ audience: 'family' })
        },
        {
            id: 'rainy',
            title: '雨天备选',
            desc: '下雨也能出门，不用临时改行程。',
            places: places.filter(p => p.weatherTag === 'indoor').slice(0, 5),
            action: () => applyScenarioFilters({ weather: 'indoor' })
        },
        {
            id: 'free',
            title: '免费优先',
            desc: '预算友好，适合说走就走的轻出行。',
            places: places.filter(p => p.budgetLevel === 'free' && p.type !== '美食').slice(0, 5),
            action: () => applyScenarioFilters({ budget: 'free' })
        },
        {
            id: 'date',
            title: '情侣约会',
            desc: '优先筛选适合慢逛、拍照和吃饭串联的地点。',
            places: places.filter(p => p.audienceTags?.includes('couple')).slice(0, 5),
            action: () => applyScenarioFilters({ audience: 'couple' })
        },
        {
            id: 'food',
            title: '人气美食',
            desc: '高口碑餐饮，适合当作路线中的补给站。',
            places: places.filter(p => p.type === '美食').slice(0, 5),
            action: () => document.getElementById('food').scrollIntoView({ behavior: 'smooth', block: 'start' })
        },
        {
            id: 'photo',
            title: '拍照出片',
            desc: '优先展示景观感和画面感更好的地点。',
            places: places.filter(p => p.themeTags?.includes('拍照出片')).slice(0, 5),
            action: () => applyScenarioFilters({ audience: 'couple', sort: 'popularity' })
        }
    ].filter(topic => topic.places.length > 0);
}

function buildRoutePlans(places) {
    const attractions = places.filter(p => p.type !== '美食');
    const foods = places.filter(p => p.type === '美食');

    const topFamily = attractions.filter(p => p.isFamily).slice(0, 2);
    const topScenic = attractions.filter(p => ['景点', '公园', '博物馆'].includes(p.type)).slice(0, 2);
    const topRelax = attractions.filter(p => ['公园', '露营地', '景点'].includes(p.type)).slice(0, 2);
    const topFood = foods.slice(0, 1);

    return [
        {
            title: '半天遛娃轻松线',
            subtitle: '适合周末上午/下午安排',
            duration: '约 4-5 小时',
            target: '亲子家庭',
            stops: [...topFamily, ...topFood].filter(Boolean),
            reason: '游玩强度适中，兼顾体验与补给。'
        },
        {
            title: '城市出片约会线',
            subtitle: '景点 + 公园 + 餐饮串联',
            duration: '约 5-6 小时',
            target: '情侣 / 朋友',
            stops: [...topScenic, ...topFood].filter(Boolean),
            reason: '适合拍照、散步和边走边吃。'
        },
        {
            title: '周末放空慢游线',
            subtitle: '公园 / 露营地优先',
            duration: '半天到一天',
            target: '朋友 / 独自',
            stops: [...topRelax, ...topFood].filter(Boolean),
            reason: '节奏慢、切换成本低，适合放松。'
        }
    ].filter(route => route.stops.length >= 2);
}

function calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

function formatDistance(km) {
    if (km < 1) {
        return Math.round(km * 1000) + 'm';
    }
    return km.toFixed(1) + 'km';
}

function renderNearbyPlaces(places) {
    const nearbyCards = document.getElementById('nearbyCards');
    const source = [...places]
        .filter(p => p.type !== '美食')
        .sort((a, b) => b.rating - a.rating || a.distance - b.distance);
    const sorted = source.slice(0, sectionVisibleCounts.nearby);
    
    nearbyCards.innerHTML = '';
    if (sorted.length === 0) {
        nearbyCards.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-search"></i>
                <p>附近暂无推荐景点</p>
                <span>试试扩大搜索范围</span>
            </div>
        `;
        return;
    }
    sorted.forEach(place => {
        nearbyCards.appendChild(createPlaceCard(place));
    });

    updateSectionLoadMoreButton('nearby', source.length);
}

function renderFamilyPlaces(places) {
    const familyCards = document.getElementById('familyCards');
    if (!familyCards) return;
    const familySource = places.filter(p => p.isFamily);
    const familyPlaces = familySource.slice(0, sectionVisibleCounts.family);
    
    familyCards.innerHTML = '';
    if (familyPlaces.length === 0) {
        familyCards.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-child"></i>
                <p>附近暂无亲子景点</p>
            </div>
        `;
        return;
    }
    
    familyPlaces.forEach(place => {
        familyCards.appendChild(createPlaceCard(place));
    });

    updateSectionLoadMoreButton('family', familySource.length);
}

function renderPopularPlaces(places) {
    const popularCards = document.getElementById('popularCards');
    if (!popularCards) return;
    const popularSource = [...places]
        .filter(p => p.type !== '美食')
        .sort((a, b) => getPopularityScore(b) - getPopularityScore(a) || b.rating - a.rating || a.distance - b.distance);
    const popular = popularSource.slice(0, sectionVisibleCounts.popular);
    
    popularCards.innerHTML = '';
    popular.forEach(place => {
        popularCards.appendChild(createPlaceCard(place));
    });

    updateSectionLoadMoreButton('popular', popularSource.length);
}

function renderFoodPlaces(places) {
    const foodCards = document.getElementById('foodCards');
    if (!foodCards) return;

    const foodSource = [...places]
        .filter(p => p.type === '美食')
        .sort((a, b) => getPopularityScore(b) - getPopularityScore(a) || b.rating - a.rating || a.distance - b.distance);
    const foods = foodSource.slice(0, sectionVisibleCounts.food);

    foodCards.innerHTML = '';
    if (foods.length === 0) {
        foodCards.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-utensils"></i>
                <p>附近暂无优质美食推荐</p>
            </div>
        `;
        return;
    }

    foods.forEach(place => {
        foodCards.appendChild(createPlaceCard(place));
    });

    updateSectionLoadMoreButton('food', foodSource.length);
}

function renderCategoryCards(places) {
    const categoryCards = document.getElementById('categoryCards');
    if (!categoryCards) return;
    
    categoryCards.innerHTML = '';
    if (places.length === 0) {
        categoryCards.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-search"></i>
                <p>没有找到符合条件的景点</p>
                <span>试试其他筛选条件吧~</span>
            </div>
        `;
        return;
    }

    places.forEach(place => {
        categoryCards.appendChild(createPlaceCard(place));
    });
}

function initSectionMoreButtons() {
    const buttons = document.querySelectorAll('.section-more-btn');
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            const targetType = button.dataset.type || 'all';
            navigateToCategory(targetType);
        });
    });
}

function initSectionLoadMoreButtons() {
    const buttons = document.querySelectorAll('.section-load-more-btn');
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            const section = button.dataset.section;
            if (!section || !sectionVisibleCounts[section]) return;

            sectionVisibleCounts[section] += SECTION_PAGE_SIZE;
            rerenderSections();
        });
    });
}

function updateSectionLoadMoreButton(section, totalCount) {
    const button = document.getElementById(`${section}LoadMoreBtn`);
    if (!button) return;

    const visible = sectionVisibleCounts[section] || SECTION_PAGE_SIZE;
    const hasMore = totalCount > visible;
    button.style.display = hasMore ? 'inline-flex' : 'none';
    if (hasMore) {
        button.textContent = `加载更多 (${Math.min(visible, totalCount)}/${totalCount})`;
    }
}

function resetSectionVisibleCounts() {
    sectionVisibleCounts = {
        nearby: 6,
        family: 6,
        food: 6,
        popular: 6
    };
}

function rerenderSections() {
    renderNearbyPlaces(allPlaces);
    renderFamilyPlaces(allPlaces);
    renderPopularPlaces(allPlaces);
    renderFoodPlaces(allPlaces);
    renderTopicCards(allPlaces);
    renderRouteCards(allPlaces);
}

function renderTopicCards(places) {
    const topicCards = document.getElementById('topicCards');
    if (!topicCards) return;

    const topics = buildTopicCollections(places);
    topicCards.innerHTML = '';

    if (topics.length === 0) {
        topicCards.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-ranking-star"></i>
                <p>定位后将为你生成专题推荐</p>
            </div>
        `;
        return;
    }

    topics.forEach(topic => {
        const card = document.createElement('div');
        card.className = 'topic-card';
        card.innerHTML = `
            <div class="topic-card-header">
                <h3>${topic.title}</h3>
                <span>${topic.places.length} 个候选</span>
            </div>
            <p>${topic.desc}</p>
            <ul class="topic-list">
                ${topic.places.slice(0, 3).map(place => `<li>${place.name}</li>`).join('')}
            </ul>
            <button class="topic-action-btn">查看专题</button>
        `;
        card.querySelector('.topic-action-btn').addEventListener('click', topic.action);
        topicCards.appendChild(card);
    });
}

function renderRouteCards(places) {
    const routeCards = document.getElementById('routeCards');
    if (!routeCards) return;

    const routes = buildRoutePlans(places);
    routeCards.innerHTML = '';

    if (routes.length === 0) {
        routeCards.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-route"></i>
                <p>定位后将为你生成路线推荐</p>
            </div>
        `;
        return;
    }

    routes.forEach(route => {
        const card = document.createElement('div');
        card.className = 'route-card';
        card.innerHTML = `
            <div class="route-card-header">
                <div>
                    <h3>${route.title}</h3>
                    <p>${route.subtitle}</p>
                </div>
                <span class="route-duration">${route.duration}</span>
            </div>
            <div class="route-meta">适合：${route.target} · ${route.reason}</div>
            <div class="route-stops">
                ${route.stops.map((stop, index) => `<span class="route-stop">${index + 1}. ${stop.name}</span>`).join('')}
            </div>
            <button class="topic-action-btn">查看首站详情</button>
        `;
        card.querySelector('.topic-action-btn').addEventListener('click', () => openDetailModal(route.stops[0]));
        routeCards.appendChild(card);
    });
}

function applyScenarioFilters({ audience = 'all', weather = 'all', duration = 'all', budget = 'all', sort = 'popularity' }) {
    const audienceFilter = document.getElementById('audienceFilter');
    const weatherFilter = document.getElementById('weatherFilter');
    const durationFilter = document.getElementById('durationFilter');
    const budgetFilter = document.getElementById('budgetFilter');
    const sortFilter = document.getElementById('sortFilter');

    if (audienceFilter) audienceFilter.value = audience;
    if (weatherFilter) weatherFilter.value = weather;
    if (durationFilter) durationFilter.value = duration;
    if (budgetFilter) budgetFilter.value = budget;
    if (sortFilter) sortFilter.value = sort;

    currentFilters.sort = sort;
    document.querySelectorAll('.category-tab').forEach(t => t.classList.remove('active'));
    const allTab = document.querySelector('.category-tab[data-type="all"]');
    if (allTab) allTab.classList.add('active');
    currentType = 'all';
    applyFilters();
    document.getElementById('category').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function navigateToCategory(type) {
    if (type === '美食') {
        document.getElementById('food').scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
    }

    document.querySelectorAll('.category-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.type === type);
    });
    currentType = type;
    applyFilters();
    document.getElementById('category').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function initCategoryMoreButton() {
    const moreBtn = document.getElementById('categoryMoreBtn');
    if (!moreBtn) return;

    moreBtn.addEventListener('click', () => {
        categoryVisibleCount += CATEGORY_PAGE_SIZE;
        renderCategoryCards(filteredCategoryPlaces.slice(0, categoryVisibleCount));
        updateCategoryMoreButton();
    });
}

function updateCategoryMoreButton() {
    const moreBtn = document.getElementById('categoryMoreBtn');
    if (!moreBtn) return;

    const hasMore = filteredCategoryPlaces.length > categoryVisibleCount;
    moreBtn.style.display = hasMore ? 'inline-flex' : 'none';
    if (hasMore) {
        moreBtn.textContent = `查看更多 (${categoryVisibleCount}/${filteredCategoryPlaces.length})`;
    }
}

function createPlaceCard(place) {
    const isFavorite = favorites.includes(place.id);
    const card = document.createElement('div');
    card.className = 'place-card';
    card.innerHTML = `
        <div class="card-image">
            <img src="${place.image}" alt="${place.name}" loading="lazy" onerror="this.src='https://picsum.photos/600/400?random=${encodeURIComponent(place.id)}'">
            <div class="card-tags">
                <span class="card-tag">${place.type}</span>
                ${place.distance < 1 ? '<span class="card-tag free">步行可达</span>' : ''}
            </div>
            <button class="card-favorite ${isFavorite ? 'active' : ''}" data-id="${place.id}">
                <i class="${isFavorite ? 'fas' : 'far'} fa-heart"></i>
            </button>
        </div>
        <div class="card-content">
            <h3 class="card-title">${place.name}</h3>
            <p class="card-highlight">${place.typeDesc || place.type}</p>
            <div class="card-meta">
                <span class="meta-item distance-badge">
                    <i class="fas fa-location-arrow"></i>
                    ${place.distanceText}
                </span>
                <span class="meta-item">
                    <i class="fas fa-star"></i>
                    ${place.rating}
                </span>
                <span class="meta-item">
                    <i class="fas fa-fire"></i>
                    热度 ${Math.round(getPopularityScore(place))}
                </span>
            </div>
        </div>
    `;

    card.addEventListener('click', (e) => {
        if (!e.target.closest('.card-favorite')) {
            openDetailModal(place);
        }
    });

    card.addEventListener('mouseenter', () => {
        if (place.marker) {
            place.marker.setAnimation('AMAP_ANIMATION_BOUNCE');
        }
    });

    card.addEventListener('mouseleave', () => {
        if (place.marker) {
            place.marker.setAnimation('AMAP_ANIMATION_NONE');
        }
    });

    const favoriteBtn = card.querySelector('.card-favorite');
    favoriteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleFavorite(place.id, favoriteBtn);
    });

    return card;
}

function toggleFavorite(id, btn) {
    const index = favorites.indexOf(id);
    if (index > -1) {
        favorites.splice(index, 1);
        btn.classList.remove('active');
        btn.querySelector('i').classList.remove('fas');
        btn.querySelector('i').classList.add('far');
    } else {
        favorites.push(id);
        btn.classList.add('active');
        btn.querySelector('i').classList.remove('far');
        btn.querySelector('i').classList.add('fas');
    }
    localStorage.setItem('favorites', JSON.stringify(favorites));
    updateFavoritesSection();
    rerenderSections();
    applyFilters();
}

function initCategoryTabs() {
    const tabs = document.querySelectorAll('.category-tab');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentType = tab.dataset.type;
            applyFilters();
        });
    });
}

function initFilters() {
    const distanceFilter = document.getElementById('distanceFilter');
    const sortFilter = document.getElementById('sortFilter');
    const audienceFilter = document.getElementById('audienceFilter');
    const durationFilter = document.getElementById('durationFilter');
    const weatherFilter = document.getElementById('weatherFilter');
    const budgetFilter = document.getElementById('budgetFilter');

    distanceFilter.addEventListener('change', (e) => {
        currentFilters.distanceFilterKm = e.target.value;

        if (currentLocation) {
            const selected = e.target.value;
            currentFilters.radius = selected === 'all' ? 50000 : parseFloat(selected) * 1000;
            updateRadiusDisplay();
            searchNearbyPlaces(currentLocation.lat, currentLocation.lng, '', true);
        } else {
            applyFilters();
        }
    });

    sortFilter.addEventListener('change', (e) => {
        currentFilters.sort = e.target.value;
        applyFilters();
    });

    [audienceFilter, durationFilter, weatherFilter, budgetFilter].forEach(filter => {
        filter.addEventListener('change', applyFilters);
    });
}

function applyFilters() {
    let filtered = allPlaces.filter(p => p.type !== '美食');
    const audienceValue = document.getElementById('audienceFilter')?.value || 'all';
    const durationValue = document.getElementById('durationFilter')?.value || 'all';
    const weatherValue = document.getElementById('weatherFilter')?.value || 'all';
    const budgetValue = document.getElementById('budgetFilter')?.value || 'all';

    if (currentType !== 'all') {
        filtered = filtered.filter(p => p.type === currentType);
    }

    if (currentFilters.distanceFilterKm !== 'all') {
        const maxDistance = parseFloat(currentFilters.distanceFilterKm);
        filtered = filtered.filter(p => p.distance <= maxDistance);
    }

    if (audienceValue !== 'all') {
        filtered = filtered.filter(p => p.audienceTags?.includes(audienceValue));
    }

    if (durationValue !== 'all') {
        filtered = filtered.filter(p => p.durationBucket === durationValue);
    }

    if (weatherValue !== 'all') {
        filtered = filtered.filter(p => p.weatherTag === weatherValue);
    }

    if (budgetValue !== 'all') {
        filtered = filtered.filter(p => p.budgetLevel === budgetValue);
    }

    if (currentFilters.sort === 'distance') {
        filtered.sort((a, b) => a.distance - b.distance);
    } else if (currentFilters.sort === 'rating') {
        filtered.sort((a, b) => b.rating - a.rating);
    } else if (currentFilters.sort === 'popularity') {
        filtered.sort((a, b) => getPopularityScore(b) - getPopularityScore(a) || b.rating - a.rating || a.distance - b.distance);
    }

    filteredCategoryPlaces = filtered;
    categoryVisibleCount = CATEGORY_PAGE_SIZE;
    renderCategoryCards(filteredCategoryPlaces.slice(0, categoryVisibleCount));
    updateCategoryMoreButton();
}

function initSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');

    function performSearch() {
        const query = searchInput.value.trim();
        if (!query) return;

        if (currentLocation) {
            // 重置分类tab，防止刚搜出来的结果被当前激活的tab过滤掉
            document.querySelectorAll('.category-tab').forEach(t => t.classList.remove('active'));
            const allTab = document.querySelector('.category-tab[data-type="all"]');
            if (allTab) allTab.classList.add('active');
            currentType = 'all';

            searchNearbyPlaces(currentLocation.lat, currentLocation.lng, query);
        } else {
            const filtered = allPlaces.filter(place => 
                place.name.toLowerCase().includes(query.toLowerCase()) ||
                place.type.toLowerCase().includes(query.toLowerCase()) ||
                place.address.toLowerCase().includes(query.toLowerCase())
            );
            
            if (filtered.length > 0) {
                renderCategoryCards(filtered);
                document.getElementById('category').scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    }

    searchBtn.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
}

function initBackToTop() {
    const backToTop = document.getElementById('backToTop');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 500) {
            backToTop.classList.add('visible');
        } else {
            backToTop.classList.remove('visible');
        }
    });

    backToTop.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

function initModal() {
    const modal = document.getElementById('detailModal');
    const modalClose = document.getElementById('modalClose');

    modalClose.addEventListener('click', () => {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
}

function openDetailModal(place) {
    const modal = document.getElementById('detailModal');
    const modalBody = document.getElementById('modalBody');
    const isFavorite = favorites.includes(place.id);

    const navigationUrl = `https://uri.amap.com/navigation?to=${place.lng},${place.lat},${encodeURIComponent(place.name)}&mode=car&coordinate=gaode&callnative=1`;

    modalBody.innerHTML = `
        <div class="detail-gallery">
            ${place.photos && place.photos.length > 0 
                ? place.photos.slice(0, 5).map(img => `<img src="${img}" alt="${place.name}" onerror="this.style.display='none'">`).join('')
                : `<img src="${place.image}" alt="${place.name}">`
            }
        </div>
        <div class="detail-content">
            <div class="detail-header">
                <h2 class="detail-title">${place.name}</h2>
                <div class="detail-tags">
                    <span class="detail-tag">${place.type}</span>
                    ${place.isFamily ? '<span class="detail-tag" style="background: var(--primary-pink);">亲子友好</span>' : ''}
                    ${(place.themeTags || []).map(tag => `<span class="detail-tag detail-tag-soft">${tag}</span>`).join('')}
                </div>
            </div>
            
            <div class="detail-info">
                <div class="info-item">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>${place.address}</span>
                </div>
                <div class="info-item">
                    <i class="fas fa-route"></i>
                    <span>距离 ${place.distanceText}</span>
                </div>
                <div class="info-item">
                    <i class="fas fa-star"></i>
                    <span>${place.rating} 分</span>
                </div>
                <div class="info-item">
                    <i class="fas fa-fire"></i>
                    <span>热度 ${Math.round(getPopularityScore(place))}</span>
                </div>
                <div class="info-item">
                    <i class="fas fa-clock"></i>
                    <span>${place.durationLabel}</span>
                </div>
                ${place.tel ? `
                <div class="info-item">
                    <i class="fas fa-phone"></i>
                    <span>${place.tel}</span>
                </div>
                ` : ''}
                ${place.cost ? `
                <div class="info-item">
                    <i class="fas fa-yen-sign"></i>
                    <span>人均 ${place.cost} 元</span>
                </div>
                ` : ''}
            </div>

            <div class="detail-fact-grid">
                <div class="detail-fact-card">
                    <strong>最佳时段</strong>
                    <span>${place.bestTime}</span>
                </div>
                <div class="detail-fact-card">
                    <strong>天气建议</strong>
                    <span>${place.weatherTag === 'indoor' ? '雨天友好' : place.weatherTag === 'outdoor' ? '晴天更佳' : '四季皆宜'}</span>
                </div>
                <div class="detail-fact-card">
                    <strong>拥挤程度</strong>
                    <span>${place.crowdLevel}</span>
                </div>
                <div class="detail-fact-card">
                    <strong>停车建议</strong>
                    <span>${place.parkingTip}</span>
                </div>
            </div>

            <div class="detail-section">
                <h3><i class="fas fa-users"></i> 适合谁去</h3>
                <div class="detail-chip-row">
                    ${(place.audienceTags || []).map(tag => `<span class="detail-chip">${tag === 'family' ? '亲子家庭' : tag === 'couple' ? '情侣约会' : tag === 'friends' ? '朋友同游' : '独自放空'}</span>`).join('')}
                </div>
            </div>

            <div class="detail-section">
                <h3><i class="fas fa-info-circle"></i> 景点介绍</h3>
                <p>
                        ${place.intro || place.typeDesc || '这是一个' + place.type + '，位于' + place.address + '，距离您约' + place.distanceText + '。'}
                </p>
                <div style="margin-top: 15px; padding: 15px; background: rgba(52, 152, 219, 0.05); border-left: 4px solid var(--primary-blue); border-radius: 4px;">
                    <strong>💡 游玩小贴士：</strong>
                    <p style="margin-top: 5px; color: var(--text-secondary);">${place.tip || '周末人可能比较多，建议提前规划好行程，体验更佳哦！'}</p>
                </div>
            </div>

            <div class="detail-section">
                <h3><i class="fas fa-sparkles"></i> 推荐亮点</h3>
                <ul class="detail-highlight-list">
                    ${(place.highlights || []).map(item => `<li>${item}</li>`).join('')}
                </ul>
            </div>

            <div class="detail-actions">
                <button class="action-btn favorite ${isFavorite ? 'active' : ''}" data-id="${place.id}">
                    <i class="${isFavorite ? 'fas' : 'far'} fa-heart"></i>
                    ${isFavorite ? '已收藏' : '收藏'}
                </button>
                <a href="${navigationUrl}" target="_blank" class="action-btn navi-btn">
                    <i class="fas fa-directions"></i>
                    一键导航
                </a>
                <button class="action-btn share" onclick="sharePlace('${place.name}', '${place.address}')">
                    <i class="fas fa-share-alt"></i>
                    分享
                </button>
            </div>
        </div>
    `;

    const favoriteBtn = modalBody.querySelector('.action-btn.favorite');
    favoriteBtn.addEventListener('click', () => {
        toggleFavorite(place.id, favoriteBtn);
        const cardFavoriteBtns = document.querySelectorAll(`.card-favorite[data-id="${place.id}"]`);
        cardFavoriteBtns.forEach(btn => {
            if (favorites.includes(place.id)) {
                btn.classList.add('active');
                btn.querySelector('i').classList.remove('far');
                btn.querySelector('i').classList.add('fas');
            } else {
                btn.classList.remove('active');
                btn.querySelector('i').classList.remove('fas');
                btn.querySelector('i').classList.add('far');
            }
        });
    });

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function sharePlace(name, address) {
    const shareText = `【${name}】${address} - 发现于遛趣星球`;
    if (navigator.share) {
        navigator.share({
            title: name,
            text: shareText,
            url: window.location.href
        });
    } else {
        navigator.clipboard.writeText(shareText).then(() => {
            alert('分享信息已复制到剪贴板！');
        });
    }
}

function updateFavoritesSection() {
    const favoritesEmpty = document.getElementById('favoritesEmpty');
    const favoritesCards = document.getElementById('favoritesCards');

    if (favorites.length === 0) {
        favoritesEmpty.style.display = 'block';
        favoritesCards.style.display = 'none';
    } else {
        favoritesEmpty.style.display = 'none';
        favoritesCards.style.display = 'grid';
        favoritesCards.innerHTML = '';
        
        const favoritePlaces = allPlaces.filter(p => favorites.includes(p.id));
        if (favoritePlaces.length === 0) {
            favoritesEmpty.style.display = 'block';
            favoritesCards.style.display = 'none';
            return;
        }
        
        favoritePlaces.forEach(place => {
            favoritesCards.appendChild(createPlaceCard(place));
        });
    }
}

function initTags() {
    const tags = document.querySelectorAll('.tag');

    tags.forEach(tag => {
        tag.addEventListener('click', () => {
            const type = tag.dataset.type;
            
            document.getElementById('category').scrollIntoView({ behavior: 'smooth', block: 'start' });
            
            document.querySelectorAll('.category-tab').forEach(t => t.classList.remove('active'));
            const targetTab = document.querySelector(`.category-tab[data-type="${type}"]`);
            if (targetTab) {
                targetTab.classList.add('active');
            }
            
            currentType = type;
            applyFilters();
        });
    });
}

function initDefaultPlaces() {
    updateFavoritesSection();
    renderTopicCards([]);
    renderRouteCards([]);
}
