/**
 * main.js — 应用主入口，协调各模块
 */
(function (global) {
    'use strict';

    var Utils = global.Utils;
    var Search = global.Search;
    var Favorites = global.Favorites;
    var MapModule = global.MapModule;
    var Location = global.Location;
    var Renderer = global.Renderer;

    var CATEGORY_PAGE_SIZE = 12;
    var SECTION_PAGE_SIZE = 6;

    var state = {
        currentType: 'all',
        currentFilters: {
            radius: 5000,
            distanceFilterKm: 'all',
            sort: 'distance'
        },
        allPlaces: [],
        filteredCategoryPlaces: [],
        categoryVisibleCount: CATEGORY_PAGE_SIZE,
        sectionVisibleCounts: { nearby: 6, family: 6, food: 6, popular: 6 }
    };

    function resetSectionVisibleCounts() {
        state.sectionVisibleCounts = { nearby: 6, family: 6, food: 6, popular: 6 };
    }

    function updateRadiusDisplay() {
        var radius = state.currentFilters.radius;
        var radiusText = radius >= 1000 ? (radius / 1000) + 'km' : radius + 'm';
        var nearbyDesc = document.getElementById('nearbyDesc');
        if (nearbyDesc) nearbyDesc.textContent = '搜索范围: ' + radiusText;
    }

    function syncDistanceFilterWithRadius() {
        var distanceFilter = document.getElementById('distanceFilter');
        if (!distanceFilter) return;
        var radiusKm = state.currentFilters.radius / 1000;
        var exactOptions = ['1', '3', '5', '10', '20'];
        var matched = exactOptions.filter(function (v) { return parseFloat(v) === radiusKm; })[0];
        distanceFilter.value = matched || 'all';
        state.currentFilters.distanceFilterKm = distanceFilter.value;
    }

    // ==================== Section Rendering ====================

    function renderNearbyPlaces() {
        var container = document.getElementById('nearbyCards');
        if (!container) return;
        var source = state.allPlaces
            .filter(function (p) { return p.type !== '美食'; })
            .sort(function (a, b) { return (b.rating || 0) - (a.rating || 0) || a.distance - b.distance; });
        var sorted = source.slice(0, state.sectionVisibleCounts.nearby);

        container.innerHTML = '';
        if (sorted.length === 0) {
            Renderer.renderEmpty(container, 'fa-search', '附近暂无推荐景点', '试试扩大搜索范围');
            return;
        }
        Renderer.appendPlaceCards(container, sorted, openDetailModal, handleFavoriteToggle);
        updateSectionLoadMoreButton('nearby', source.length);
    }

    function renderFamilyPlaces() {
        var container = document.getElementById('familyCards');
        if (!container) return;
        var familySource = state.allPlaces.filter(function (p) { return p.isFamily; });
        var familyPlaces = familySource.slice(0, state.sectionVisibleCounts.family);

        container.innerHTML = '';
        if (familyPlaces.length === 0) {
            Renderer.renderEmpty(container, 'fa-child', '附近暂无亲子景点');
            return;
        }
        Renderer.appendPlaceCards(container, familyPlaces, openDetailModal, handleFavoriteToggle);
        updateSectionLoadMoreButton('family', familySource.length);
    }

    function renderPopularPlaces() {
        var container = document.getElementById('popularCards');
        if (!container) return;
        var popularSource = state.allPlaces
            .filter(function (p) { return p.type !== '美食'; })
            .sort(function (a, b) {
                return Renderer.getPopularityScore(b) - Renderer.getPopularityScore(a) ||
                       (b.rating || 0) - (a.rating || 0) || a.distance - b.distance;
            });
        var popular = popularSource.slice(0, state.sectionVisibleCounts.popular);

        container.innerHTML = '';
        Renderer.appendPlaceCards(container, popular, openDetailModal, handleFavoriteToggle);
        updateSectionLoadMoreButton('popular', popularSource.length);
    }

    function renderFoodPlaces() {
        var container = document.getElementById('foodCards');
        if (!container) return;
        var foodSource = state.allPlaces
            .filter(function (p) { return p.type === '美食'; })
            .sort(function (a, b) {
                return Renderer.getPopularityScore(b) - Renderer.getPopularityScore(a) ||
                       (b.rating || 0) - (a.rating || 0) || a.distance - b.distance;
            });
        var foods = foodSource.slice(0, state.sectionVisibleCounts.food);

        container.innerHTML = '';
        if (foods.length === 0) {
            Renderer.renderEmpty(container, 'fa-utensils', '附近暂无优质美食推荐');
            return;
        }
        Renderer.appendPlaceCards(container, foods, openDetailModal, handleFavoriteToggle);
        updateSectionLoadMoreButton('food', foodSource.length);
    }

    function renderCategoryCards() {
        var container = document.getElementById('categoryCards');
        if (!container) return;
        container.innerHTML = '';
        if (state.filteredCategoryPlaces.length === 0) {
            Renderer.renderEmpty(container, 'fa-search', '没有找到符合条件的景点', '试试其他筛选条件吧~');
            return;
        }
        Renderer.appendPlaceCards(container, state.filteredCategoryPlaces.slice(0, state.categoryVisibleCount), openDetailModal, handleFavoriteToggle);
    }

    function renderTopicCards() {
        Renderer.renderTopicCards(state.allPlaces, function (topic) {
            if (topic.action.scrollTo) {
                document.getElementById(topic.action.scrollTo).scrollIntoView({ behavior: 'smooth', block: 'start' });
            } else {
                applyScenarioFilters(topic.action);
            }
        });
    }

    function renderRouteCards() {
        Renderer.renderRouteCards(state.allPlaces, function (stop) {
            openDetailModal(stop);
        });
    }

    function rerenderSections() {
        renderNearbyPlaces();
        renderFamilyPlaces();
        renderPopularPlaces();
        renderFoodPlaces();
        renderTopicCards();
        renderRouteCards();
    }

    function updateSectionLoadMoreButton(section, totalCount) {
        var button = document.getElementById(section + 'LoadMoreBtn');
        if (!button) return;
        var visible = state.sectionVisibleCounts[section] || SECTION_PAGE_SIZE;
        var hasMore = totalCount > visible;
        button.style.display = hasMore ? 'inline-flex' : 'none';
        if (hasMore) button.textContent = '加载更多 (' + Math.min(visible, totalCount) + '/' + totalCount + ')';
    }

    function updateCategoryMoreButton() {
        var moreBtn = document.getElementById('categoryMoreBtn');
        if (!moreBtn) return;
        var hasMore = state.filteredCategoryPlaces.length > state.categoryVisibleCount;
        moreBtn.style.display = hasMore ? 'inline-flex' : 'none';
        if (hasMore) moreBtn.textContent = '查看更多 (' + state.categoryVisibleCount + '/' + state.filteredCategoryPlaces.length + ')';
    }

    // ==================== Favorites ====================

    function handleFavoriteToggle(id, btn) {
        var isFav = Favorites.toggle(id);
        if (btn) {
            btn.classList.toggle('active', isFav);
            var icon = btn.querySelector('i');
            if (icon) {
                icon.classList.toggle('fas', isFav);
                icon.classList.toggle('far', !isFav);
            }
        }
        // 同步其他位置的按钮
        document.querySelectorAll('.card-favorite[data-id="' + id + '"]').forEach(function (cardBtn) {
            cardBtn.classList.toggle('active', isFav);
            var i = cardBtn.querySelector('i');
            if (i) { i.classList.toggle('fas', isFav); i.classList.toggle('far', !isFav); }
        });
        updateFavoritesSection();
        rerenderSections();
        applyFilters();
    }

    function updateFavoritesSection() {
        var favoritesEmpty = document.getElementById('favoritesEmpty');
        var favoritesCards = document.getElementById('favoritesCards');
        if (!favoritesEmpty || !favoritesCards) return;

        if (Favorites.getAll().length === 0) {
            favoritesEmpty.style.display = 'block';
            favoritesCards.style.display = 'none';
            return;
        }
        var favoritePlaces = Favorites.filterPlaces(state.allPlaces);
        if (favoritePlaces.length === 0) {
            favoritesEmpty.style.display = 'block';
            favoritesCards.style.display = 'none';
            return;
        }
        favoritesEmpty.style.display = 'none';
        favoritesCards.style.display = 'grid';
        favoritesCards.innerHTML = '';
        Renderer.appendPlaceCards(favoritesCards, favoritePlaces, openDetailModal, handleFavoriteToggle);
    }

    // ==================== Detail Modal ====================

    function openDetailModal(place) {
        var modal = document.getElementById('detailModal');
        var modalBody = document.getElementById('modalBody');
        if (!modal || !modalBody || !place) return;

        Renderer.renderDetailModal(place, modalBody, function (id, btn) {
            handleFavoriteToggle(id, btn);
        });

        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        var modal = document.getElementById('detailModal');
        if (!modal) return;
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }

    // ==================== Filters ====================

    function applyFilters() {
        var filtered = state.allPlaces.filter(function (p) { return p.type !== '美食'; });
        var audienceValue = (document.getElementById('audienceFilter') || {}).value || 'all';
        var durationValue = (document.getElementById('durationFilter') || {}).value || 'all';
        var weatherValue = (document.getElementById('weatherFilter') || {}).value || 'all';
        var budgetValue = (document.getElementById('budgetFilter') || {}).value || 'all';

        if (state.currentType !== 'all') {
            filtered = filtered.filter(function (p) { return p.type === state.currentType; });
        }
        if (state.currentFilters.distanceFilterKm !== 'all') {
            var maxDistance = parseFloat(state.currentFilters.distanceFilterKm);
            filtered = filtered.filter(function (p) { return p.distance <= maxDistance; });
        }
        if (audienceValue !== 'all') {
            filtered = filtered.filter(function (p) { return p.audienceTags && p.audienceTags.indexOf(audienceValue) >= 0; });
        }
        if (durationValue !== 'all') {
            filtered = filtered.filter(function (p) { return p.durationBucket === durationValue; });
        }
        if (weatherValue !== 'all') {
            filtered = filtered.filter(function (p) { return p.weatherTag === weatherValue; });
        }
        if (budgetValue !== 'all') {
            filtered = filtered.filter(function (p) { return p.budgetLevel === budgetValue; });
        }

        if (state.currentFilters.sort === 'distance') {
            filtered.sort(function (a, b) { return a.distance - b.distance; });
        } else if (state.currentFilters.sort === 'rating') {
            filtered.sort(function (a, b) { return (b.rating || 0) - (a.rating || 0); });
        } else if (state.currentFilters.sort === 'popularity') {
            filtered.sort(function (a, b) {
                return Renderer.getPopularityScore(b) - Renderer.getPopularityScore(a) ||
                       (b.rating || 0) - (a.rating || 0) || a.distance - b.distance;
            });
        }

        state.filteredCategoryPlaces = filtered;
        state.categoryVisibleCount = CATEGORY_PAGE_SIZE;
        renderCategoryCards();
        updateCategoryMoreButton();
    }

    function applyScenarioFilters(opts) {
        opts = opts || {};
        var audienceFilter = document.getElementById('audienceFilter');
        var weatherFilter = document.getElementById('weatherFilter');
        var durationFilter = document.getElementById('durationFilter');
        var budgetFilter = document.getElementById('budgetFilter');
        var sortFilter = document.getElementById('sortFilter');

        if (audienceFilter) audienceFilter.value = opts.audience || 'all';
        if (weatherFilter) weatherFilter.value = opts.weather || 'all';
        if (durationFilter) durationFilter.value = opts.duration || 'all';
        if (budgetFilter) budgetFilter.value = opts.budget || 'all';
        if (sortFilter) sortFilter.value = opts.sort || 'popularity';

        state.currentFilters.sort = opts.sort || 'popularity';
        document.querySelectorAll('.category-tab').forEach(function (t) { t.classList.remove('active'); });
        var allTab = document.querySelector('.category-tab[data-type="all"]');
        if (allTab) allTab.classList.add('active');
        state.currentType = 'all';
        applyFilters();
        document.getElementById('category').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function navigateToCategory(type) {
        if (type === '美食') {
            document.getElementById('food').scrollIntoView({ behavior: 'smooth', block: 'start' });
            return;
        }
        document.querySelectorAll('.category-tab').forEach(function (tab) {
            tab.classList.toggle('active', tab.dataset.type === type);
        });
        state.currentType = type;
        applyFilters();
        document.getElementById('category').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // ==================== Search Flow ====================

    function handleSearchResult(places, query, error) {
        var nearbyCards = document.getElementById('nearbyCards');
        if (error && nearbyCards) {
            Renderer.renderError(nearbyCards, '搜索失败，请稍后重试');
            return;
        }
        state.allPlaces = places || [];
        resetSectionVisibleCounts();
        Utils.safeRun('主内容渲染', rerenderSections);
        Utils.safeRun('分类筛选渲染', applyFilters);
        Utils.safeRun('地图标记渲染', function () {
            MapModule.updateMarkers(state.allPlaces, openDetailModal);
        });
        if (query && !global.PoiProcessor.AMAP_TYPES_MAPPING[query]) {
            var cat = document.getElementById('category');
            if (cat) cat.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    function triggerSearch(lat, lng, query, forceRefresh) {
        var nearbyCards = document.getElementById('nearbyCards');
        if (nearbyCards && !query) {
            nearbyCards.innerHTML =
                '<div class="empty-state">' +
                    '<div class="loading-spinner" style="width: 40px; height: 40px; border-width: 4px;"></div>' +
                    '<p>正在拉取各大平台网红数据...</p>' +
                '</div>';
        }
        Search.searchNearbyPlaces(lat, lng, query, state.currentFilters.radius, forceRefresh, handleSearchResult);
    }

    // ==================== Init Functions ====================

    function initCarousel() {
        var slides = document.querySelectorAll('.carousel-slide');
        var dotsContainer = document.getElementById('carouselDots');
        var prevBtn = document.getElementById('prevBtn');
        var nextBtn = document.getElementById('nextBtn');
        if (!slides.length || !dotsContainer) return;

        var currentSlide = 0;
        var autoPlayInterval;

        slides.forEach(function (_, index) {
            var dot = document.createElement('div');
            dot.className = 'carousel-dot ' + (index === 0 ? 'active' : '');
            dot.addEventListener('click', function () { goToSlide(index); });
            dotsContainer.appendChild(dot);
        });
        var dots = document.querySelectorAll('.carousel-dot');

        function goToSlide(index) {
            slides[currentSlide].classList.remove('active');
            dots[currentSlide].classList.remove('active');
            currentSlide = index;
            if (currentSlide >= slides.length) currentSlide = 0;
            if (currentSlide < 0) currentSlide = slides.length - 1;
            slides[currentSlide].classList.add('active');
            dots[currentSlide].classList.add('active');
        }
        function nextSlide() { goToSlide(currentSlide + 1); }
        function prevSlide() { goToSlide(currentSlide - 1); }
        function startAutoPlay() { autoPlayInterval = setInterval(nextSlide, 5000); }
        function stopAutoPlay() { clearInterval(autoPlayInterval); }

        if (prevBtn) {
            prevBtn.addEventListener('click', function () { prevSlide(); stopAutoPlay(); startAutoPlay(); });
        }
        if (nextBtn) {
            nextBtn.addEventListener('click', function () { nextSlide(); stopAutoPlay(); startAutoPlay(); });
        }
        startAutoPlay();
    }

    function initNavbar() {
        var navbar = document.getElementById('navbar');
        var navLinks = document.querySelectorAll('.nav-link');
        if (!navbar) return;

        window.addEventListener('scroll', function () {
            navbar.classList.toggle('scrolled', window.scrollY > 50);
        });
        navLinks.forEach(function (link) {
            link.addEventListener('click', function (e) {
                navLinks.forEach(function (l) { l.classList.remove('active'); });
                this.classList.add('active');
                var targetId = this.getAttribute('href');
                if (targetId && targetId.charAt(0) === '#') {
                    e.preventDefault();
                    var targetSection = document.querySelector(targetId);
                    if (targetSection) {
                        window.scrollTo({ top: targetSection.offsetTop - 80, behavior: 'smooth' });
                    }
                }
            });
        });
    }

    function initMobileMenu() {
        var mobileMenuBtn = document.getElementById('mobileMenuBtn');
        var navMenu = document.getElementById('navMenu');
        if (!mobileMenuBtn || !navMenu) return;

        mobileMenuBtn.addEventListener('click', function () {
            navMenu.classList.toggle('active');
            var icon = mobileMenuBtn.querySelector('i');
            if (icon) {
                icon.classList.toggle('fa-bars');
                icon.classList.toggle('fa-times');
            }
        });
        document.querySelectorAll('.nav-link').forEach(function (link) {
            link.addEventListener('click', function () {
                navMenu.classList.remove('active');
                var icon = mobileMenuBtn.querySelector('i');
                if (icon) { icon.classList.remove('fa-times'); icon.classList.add('fa-bars'); }
            });
        });
    }

    function initLocation() {
        var getLocationBtn = document.getElementById('getLocationBtn');
        var refreshLocationBtn = document.getElementById('refreshLocationBtn');
        var manualLocationBtn = document.getElementById('manualLocationBtn');
        var manualLocationInput = document.getElementById('manualLocationInput');

        if (getLocationBtn) {
            getLocationBtn.addEventListener('click', function () {
                Location.showLoading();
                if (getLocationBtn) getLocationBtn.disabled = true;
                Location.getCurrentLocation(function (lat, lng) {
                    if (getLocationBtn) getLocationBtn.disabled = false;
                    triggerSearch(lat, lng, '');
                }, function (msg) {
                    if (getLocationBtn) getLocationBtn.disabled = false;
                    Location.showError(msg);
                });
            });
        }
        if (refreshLocationBtn) {
            refreshLocationBtn.addEventListener('click', function () {
                Location.showLoading('正在重新定位...');
                Location.getCurrentLocation(function (lat, lng) {
                    triggerSearch(lat, lng, '', true);
                }, function (msg) {
                    Location.showError(msg);
                });
            });
        }
        if (manualLocationBtn) {
            manualLocationBtn.addEventListener('click', function () {
                var address = manualLocationInput.value.trim();
                if (address) {
                    Location.showLoading('正在搜索地址...');
                    Location.searchByAddress(address, function (lat, lng) {
                        triggerSearch(lat, lng, '');
                    }, function (msg) {
                        Location.showError(msg);
                    });
                }
            });
        }
        if (manualLocationInput) {
            manualLocationInput.addEventListener('keypress', function (e) {
                if (e.key === 'Enter' && manualLocationBtn) manualLocationBtn.click();
            });
        }

        initRadiusSetting();
        // 默认静默获取位置
        Location.getCurrentLocation(function (lat, lng) {
            triggerSearch(lat, lng, '');
        }, function () {
            // 静默失败，不显示错误
        });
    }

    function initRadiusSetting() {
        var radiusOptions = document.querySelectorAll('input[name="searchRadius"]');
        var customRadiusInput = document.getElementById('customRadius');
        var applyCustomRadiusBtn = document.getElementById('applyCustomRadius');

        radiusOptions.forEach(function (option) {
            option.addEventListener('change', function (e) {
                state.currentFilters.radius = parseInt(e.target.value);
                syncDistanceFilterWithRadius();
                updateRadiusDisplay();
                var loc = Location.getCurrent();
                if (loc) triggerSearch(loc.lat, loc.lng, '', true);
            });
        });
        if (applyCustomRadiusBtn) {
            applyCustomRadiusBtn.addEventListener('click', function () {
                var customValue = parseInt(customRadiusInput.value);
                if (customValue && customValue >= 500 && customValue <= 100000) {
                    state.currentFilters.radius = customValue;
                    radiusOptions.forEach(function (opt) { opt.checked = false; });
                    syncDistanceFilterWithRadius();
                    updateRadiusDisplay();
                    var loc = Location.getCurrent();
                    if (loc) triggerSearch(loc.lat, loc.lng, '', true);
                } else {
                    alert('请输入500-100000之间的数值');
                }
            });
        }
        if (customRadiusInput) {
            customRadiusInput.addEventListener('keypress', function (e) {
                if (e.key === 'Enter' && applyCustomRadiusBtn) applyCustomRadiusBtn.click();
            });
        }
    }

    function initCategoryTabs() {
        var tabs = document.querySelectorAll('.category-tab');
        tabs.forEach(function (tab) {
            tab.addEventListener('click', function () {
                tabs.forEach(function (t) { t.classList.remove('active'); });
                tab.classList.add('active');
                state.currentType = tab.dataset.type;
                applyFilters();
            });
        });
    }

    function initFilters() {
        var distanceFilter = document.getElementById('distanceFilter');
        var sortFilter = document.getElementById('sortFilter');
        var audienceFilter = document.getElementById('audienceFilter');
        var durationFilter = document.getElementById('durationFilter');
        var weatherFilter = document.getElementById('weatherFilter');
        var budgetFilter = document.getElementById('budgetFilter');

        if (distanceFilter) {
            distanceFilter.addEventListener('change', function (e) {
                state.currentFilters.distanceFilterKm = e.target.value;
                var loc = Location.getCurrent();
                if (loc) {
                    var selected = e.target.value;
                    state.currentFilters.radius = selected === 'all' ? 50000 : parseFloat(selected) * 1000;
                    updateRadiusDisplay();
                    triggerSearch(loc.lat, loc.lng, '', true);
                } else {
                    applyFilters();
                }
            });
        }
        if (sortFilter) {
            sortFilter.addEventListener('change', function (e) {
                state.currentFilters.sort = e.target.value;
                applyFilters();
            });
        }
        [audienceFilter, durationFilter, weatherFilter, budgetFilter].forEach(function (filter) {
            if (filter) filter.addEventListener('change', applyFilters);
        });
    }

    function initSearch() {
        var searchInput = document.getElementById('searchInput');
        var searchBtn = document.getElementById('searchBtn');
        if (!searchInput || !searchBtn) return;

        function performSearch() {
            var query = searchInput.value.trim();
            if (!query) return;
            var loc = Location.getCurrent();
            if (loc) {
                document.querySelectorAll('.category-tab').forEach(function (t) { t.classList.remove('active'); });
                var allTab = document.querySelector('.category-tab[data-type="all"]');
                if (allTab) allTab.classList.add('active');
                state.currentType = 'all';
                triggerSearch(loc.lat, loc.lng, query);
            } else {
                var filtered = state.allPlaces.filter(function (place) {
                    return place.name.toLowerCase().indexOf(query.toLowerCase()) >= 0 ||
                           place.type.toLowerCase().indexOf(query.toLowerCase()) >= 0 ||
                           place.address.toLowerCase().indexOf(query.toLowerCase()) >= 0;
                });
                if (filtered.length > 0) {
                    state.filteredCategoryPlaces = filtered;
                    state.categoryVisibleCount = CATEGORY_PAGE_SIZE;
                    renderCategoryCards();
                    updateCategoryMoreButton();
                    document.getElementById('category').scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }
        }
        searchBtn.addEventListener('click', performSearch);
        searchInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') performSearch();
        });
    }

    function initBackToTop() {
        var backToTop = document.getElementById('backToTop');
        if (!backToTop) return;
        window.addEventListener('scroll', function () {
            backToTop.classList.toggle('visible', window.scrollY > 500);
        });
        backToTop.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    function initModal() {
        var modal = document.getElementById('detailModal');
        var modalClose = document.getElementById('modalClose');
        if (!modal) return;
        if (modalClose) {
            modalClose.addEventListener('click', closeModal);
        }
        modal.addEventListener('click', function (e) {
            if (e.target === modal) closeModal();
        });
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && modal.classList.contains('active')) closeModal();
        });
    }

    function initTags() {
        var tags = document.querySelectorAll('.tag');
        tags.forEach(function (tag) {
            tag.addEventListener('click', function () {
                var type = tag.dataset.type;
                document.getElementById('category').scrollIntoView({ behavior: 'smooth', block: 'start' });
                document.querySelectorAll('.category-tab').forEach(function (t) { t.classList.remove('active'); });
                var targetTab = document.querySelector('.category-tab[data-type="' + type + '"]');
                if (targetTab) targetTab.classList.add('active');
                state.currentType = type;
                applyFilters();
            });
        });
    }

    function initSectionMoreButtons() {
        document.querySelectorAll('.section-more-btn').forEach(function (button) {
            button.addEventListener('click', function () {
                var targetType = button.dataset.type || 'all';
                navigateToCategory(targetType);
            });
        });
    }

    function initSectionLoadMoreButtons() {
        document.querySelectorAll('.section-load-more-btn').forEach(function (button) {
            button.addEventListener('click', function () {
                var section = button.dataset.section;
                if (!section || !state.sectionVisibleCounts[section]) return;
                state.sectionVisibleCounts[section] += SECTION_PAGE_SIZE;
                rerenderSections();
            });
        });
    }

    function initCategoryMoreButton() {
        var moreBtn = document.getElementById('categoryMoreBtn');
        if (!moreBtn) return;
        moreBtn.addEventListener('click', function () {
            state.categoryVisibleCount += CATEGORY_PAGE_SIZE;
            renderCategoryCards();
            updateCategoryMoreButton();
        });
    }

    function initDefaultPlaces() {
        updateFavoritesSection();
        Renderer.renderTopicCards([], function () {});
        Renderer.renderRouteCards([], function () {});
    }

    // ==================== Bootstrap ====================

    document.addEventListener('DOMContentLoaded', function () {
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

})(window);
