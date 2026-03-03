let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
let currentLocation = null;
let map = null;
let marker = null;
let placeSearch = null;
let currentType = 'all';
let currentFilters = {
    distance: 'all',
    sort: 'distance'
};
let allPlaces = [];

const AMAP_KEY = '5cc98010473dc9bf7343b87635e58bab';

const typeMapping = {
    '公园': '公园',
    '游乐场': '游乐场',
    '博物馆': '博物馆',
    '动物园': '动物园',
    '露营地': '露营地',
    '咖啡馆': '咖啡馆',
    '餐厅': '餐厅',
    '景点': '景点'
};

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
            title: '我的位置'
        });
        marker.setMap(map);
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

function searchNearbyPlaces(lat, lng, type = '') {
    const nearbyCards = document.getElementById('nearbyCards');
    nearbyCards.innerHTML = `
        <div class="empty-state">
            <div class="loading-spinner" style="width: 40px; height: 40px; border-width: 4px;"></div>
            <p>正在搜索周边景点...</p>
        </div>
    `;

    const keywords = type || '景点|公园|游乐场|博物馆|动物园|露营地|咖啡馆|餐厅';
    const types = ['050100', '050200', '050300', '110100', '110200', '060100', '060200', '060300'];
    
    fetch(`https://restapi.amap.com/v3/place/around?key=${AMAP_KEY}&location=${lng},${lat}&keywords=${encodeURIComponent(keywords)}&radius=10000&offset=20&extensions=all`)
        .then(response => response.json())
        .then(data => {
            if (data.status === '1' && data.pois && data.pois.length > 0) {
                const places = data.pois.map(poi => processPOIData(poi, lat, lng));
                allPlaces = places;
                renderNearbyPlaces(places);
                renderFamilyPlaces(places);
                renderCategoryCards(places);
                renderPopularPlaces(places);
            } else {
                nearbyCards.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-search"></i>
                        <p>附近暂无推荐景点</p>
                        <span>试试扩大搜索范围或更换分类</span>
                    </div>
                `;
            }
        })
        .catch(error => {
            console.error('POI搜索失败:', error);
            nearbyCards.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-exclamation-circle"></i>
                    <p>搜索失败，请稍后重试</p>
                </div>
            `;
        });
}

function processPOIData(poi, userLat, userLng) {
    const location = poi.location.split(',');
    const poiLng = parseFloat(location[0]);
    const poiLat = parseFloat(location[1]);
    
    const distance = calculateDistance(userLat, userLng, poiLat, poiLng);
    
    let type = '景点';
    const typeDesc = poi.type || '';
    if (typeDesc.includes('公园')) type = '公园';
    else if (typeDesc.includes('游乐') || typeDesc.includes('游乐园')) type = '游乐场';
    else if (typeDesc.includes('博物馆') || typeDesc.includes('展览馆')) type = '博物馆';
    else if (typeDesc.includes('动物园') || typeDesc.includes('植物园')) type = '动物园';
    else if (typeDesc.includes('露营') || typeDesc.includes('度假村')) type = '露营地';
    else if (typeDesc.includes('咖啡') || typeDesc.includes('茶馆')) type = '咖啡馆';
    else if (typeDesc.includes('餐厅') || typeDesc.includes('美食')) type = '餐厅';

    return {
        id: poi.id,
        name: poi.name,
        type: type,
        typeDesc: typeDesc,
        address: poi.address || poi.pname + poi.cityname + poi.adname,
        distance: distance,
        distanceText: formatDistance(distance),
        lat: poiLat,
        lng: poiLng,
        tel: poi.tel || '',
        rating: poi.biz_ext?.rating ? parseFloat(poi.biz_ext.rating) : (3.5 + Math.random() * 1.5).toFixed(1),
        cost: poi.biz_ext?.cost || '',
        photos: poi.photos?.map(p => p.url) || [],
        image: poi.photos?.[0]?.url || `https://source.unsplash.com/600x400/?${type},nature&sig=${poi.id}`,
        isFamily: familyTypes.includes(type)
    };
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
    const sorted = [...places].sort((a, b) => a.distance - b.distance).slice(0, 6);
    
    nearbyCards.innerHTML = '';
    sorted.forEach(place => {
        nearbyCards.appendChild(createPlaceCard(place));
    });
}

function renderFamilyPlaces(places) {
    const familyCards = document.getElementById('familyCards');
    const familyPlaces = places.filter(p => p.isFamily).slice(0, 6);
    
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
}

function renderPopularPlaces(places) {
    const popularCards = document.getElementById('popularCards');
    const popular = [...places].sort((a, b) => b.rating - a.rating).slice(0, 6);
    
    popularCards.innerHTML = '';
    popular.forEach(place => {
        popularCards.appendChild(createPlaceCard(place));
    });
}

function createPlaceCard(place) {
    const isFavorite = favorites.includes(place.id);
    const card = document.createElement('div');
    card.className = 'place-card';
    card.innerHTML = `
        <div class="card-image">
            <img src="${place.image}" alt="${place.name}" loading="lazy" onerror="this.src='https://source.unsplash.com/600x400/?nature,landscape'">
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
            </div>
        </div>
    `;

    card.addEventListener('click', (e) => {
        if (!e.target.closest('.card-favorite')) {
            openDetailModal(place);
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

    distanceFilter.addEventListener('change', (e) => {
        currentFilters.distance = e.target.value;
        applyFilters();
    });

    sortFilter.addEventListener('change', (e) => {
        currentFilters.sort = e.target.value;
        applyFilters();
    });
}

function applyFilters() {
    let filtered = [...allPlaces];

    if (currentType !== 'all') {
        filtered = filtered.filter(p => p.type === currentType);
    }

    if (currentFilters.distance !== 'all') {
        const maxDistance = parseFloat(currentFilters.distance);
        filtered = filtered.filter(p => p.distance <= maxDistance);
    }

    if (currentFilters.sort === 'distance') {
        filtered.sort((a, b) => a.distance - b.distance);
    } else if (currentFilters.sort === 'rating') {
        filtered.sort((a, b) => b.rating - a.rating);
    }

    renderCategoryCards(filtered);
}

function renderCategoryCards(places) {
    const categoryCards = document.getElementById('categoryCards');
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

function initSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');

    function performSearch() {
        const query = searchInput.value.trim();
        if (!query) return;

        if (currentLocation) {
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

            <div class="detail-section">
                <h3><i class="fas fa-info-circle"></i> 景点介绍</h3>
                <p>${place.typeDesc || '这是一个' + place.type + '，位于' + place.address + '，距离您约' + place.distanceText + '。'}</p>
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
                currentType = type;
            }
            
            if (currentLocation) {
                searchNearbyPlaces(currentLocation.lat, currentLocation.lng, typeMapping[type] || type);
            } else {
                applyFilters();
            }
        });
    });
}

function initDefaultPlaces() {
    updateFavoritesSection();
}
