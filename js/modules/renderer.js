/**
 * renderer.js — DOM 渲染（所有 innerHTML 拼接均经 escapeHtml 转义）
 */
(function (global) {
    'use strict';

    var Utils = global.Utils;
    var Favorites = global.Favorites;

    function getPopularityScore(place) {
        var favoriteBoost = Favorites.includes(place.id) ? 8 : 0;
        return Math.max(0, Math.min(100, (place.popularityBase || 0) + favoriteBoost));
    }

    function createPlaceCard(place, onCardClick, onFavoriteClick) {
        var esc = Utils.escapeHtml;
        var isFavorite = Favorites.includes(place.id);
        var card = document.createElement('div');
        card.className = 'place-card';
        card.innerHTML =
            '<div class="card-image">' +
                '<img src="' + esc(place.image) + '" alt="' + esc(place.name) + '" loading="lazy" onerror="this.src=\'https://picsum.photos/600/400?random=' + encodeURIComponent(place.id) + '\'">' +
                '<div class="card-tags">' +
                    '<span class="card-tag">' + esc(place.type) + '</span>' +
                    (place.distance < 1 ? '<span class="card-tag free">步行可达</span>' : '') +
                '</div>' +
                '<button class="card-favorite ' + (isFavorite ? 'active' : '') + '" data-id="' + esc(place.id) + '">' +
                    '<i class="' + (isFavorite ? 'fas' : 'far') + ' fa-heart"></i>' +
                '</button>' +
            '</div>' +
            '<div class="card-content">' +
                '<h3 class="card-title">' + esc(place.name) + '</h3>' +
                '<p class="card-highlight">' + esc(place.typeDesc || place.type) + '</p>' +
                '<div class="card-meta">' +
                    '<span class="meta-item distance-badge">' +
                        '<i class="fas fa-location-arrow"></i>' + esc(place.distanceText) +
                    '</span>' +
                    '<span class="meta-item"><i class="fas fa-star"></i>' + esc(place.rating || '暂无') + '</span>' +
                    '<span class="meta-item"><i class="fas fa-fire"></i>热度 ' + Math.round(getPopularityScore(place)) + '</span>' +
                '</div>' +
            '</div>';

        card.addEventListener('click', function (e) {
            if (!e.target.closest('.card-favorite')) {
                if (onCardClick) onCardClick(place);
            }
        });

        card.addEventListener('mouseenter', function () {
            if (place.marker) { try { place.marker.setAnimation('AMAP_ANIMATION_BOUNCE'); } catch (e) {} }
        });
        card.addEventListener('mouseleave', function () {
            if (place.marker) { try { place.marker.setAnimation('AMAP_ANIMATION_NONE'); } catch (e) {} }
        });

        var favoriteBtn = card.querySelector('.card-favorite');
        favoriteBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            if (onFavoriteClick) onFavoriteClick(place.id, favoriteBtn);
        });

        return card;
    }

    function appendPlaceCards(container, places, onCardClick, onFavoriteClick) {
        if (!container) return;
        var frag = document.createDocumentFragment();
        places.forEach(function (place) {
            Utils.safeRun('卡片渲染', function () {
                frag.appendChild(createPlaceCard(place, onCardClick, onFavoriteClick));
            });
        });
        container.appendChild(frag);
    }

    function renderEmpty(container, icon, message, hint) {
        if (!container) return;
        container.innerHTML =
            '<div class="empty-state">' +
                '<i class="fas ' + (icon || 'fa-search') + '"></i>' +
                '<p>' + Utils.escapeHtml(message) + '</p>' +
                (hint ? '<span>' + Utils.escapeHtml(hint) + '</span>' : '') +
            '</div>';
    }

    function renderError(container, message) {
        if (!container) return;
        container.innerHTML =
            '<div class="empty-state">' +
                '<i class="fas fa-exclamation-circle"></i>' +
                '<p>' + Utils.escapeHtml(message) + '</p>' +
            '</div>';
    }

    function renderDetailModal(place, modalBody, onFavoriteClick) {
        var esc = Utils.escapeHtml;
        var isFavorite = Favorites.includes(place.id);
        var navigationUrl = 'https://uri.amap.com/navigation?to=' + place.lng + ',' + place.lat + ',' + encodeURIComponent(place.name) + '&mode=car&coordinate=gaode&callnative=1';

        var galleryHtml = '';
        if (place.photos && place.photos.length > 0) {
            galleryHtml = place.photos.slice(0, 5).map(function (img) {
                return '<img src="' + esc(img) + '" alt="' + esc(place.name) + '" onerror="this.style.display=\'none\'">';
            }).join('');
        } else {
            galleryHtml = '<img src="' + esc(place.image) + '" alt="' + esc(place.name) + '">';
        }

        var audienceLabels = (place.audienceTags || []).map(function (tag) {
            var map = { family: '亲子家庭', couple: '情侣约会', friends: '朋友同游', solo: '独自放空' };
            return '<span class="detail-chip">' + esc(map[tag] || tag) + '</span>';
        }).join('');

        modalBody.innerHTML =
            '<div class="detail-gallery">' + galleryHtml + '</div>' +
            '<div class="detail-content">' +
                '<div class="detail-header">' +
                    '<h2 class="detail-title">' + esc(place.name) + '</h2>' +
                    '<div class="detail-tags">' +
                        '<span class="detail-tag">' + esc(place.type) + '</span>' +
                        (place.isFamily ? '<span class="detail-tag" style="background: var(--primary-pink);">亲子友好</span>' : '') +
                        (place.themeTags || []).map(function (tag) {
                            return '<span class="detail-tag detail-tag-soft">' + esc(tag) + '</span>';
                        }).join('') +
                    '</div>' +
                '</div>' +
                '<div class="detail-info">' +
                    '<div class="info-item"><i class="fas fa-map-marker-alt"></i><span>' + esc(place.address) + '</span></div>' +
                    '<div class="info-item"><i class="fas fa-route"></i><span>距离 ' + esc(place.distanceText) + '</span></div>' +
                    '<div class="info-item"><i class="fas fa-star"></i><span>' + esc(place.rating || '暂无') + ' 分</span></div>' +
                    '<div class="info-item"><i class="fas fa-fire"></i><span>热度 ' + Math.round(getPopularityScore(place)) + '</span></div>' +
                    '<div class="info-item"><i class="fas fa-clock"></i><span>' + esc(place.durationLabel) + '</span></div>' +
                    (place.tel ? '<div class="info-item"><i class="fas fa-phone"></i><span>' + esc(place.tel) + '</span></div>' : '') +
                    (place.cost ? '<div class="info-item"><i class="fas fa-yen-sign"></i><span>人均 ' + esc(place.cost) + ' 元</span></div>' : '') +
                '</div>' +
                '<div class="detail-fact-grid">' +
                    '<div class="detail-fact-card"><strong>最佳时段</strong><span>' + esc(place.bestTime) + '</span></div>' +
                    '<div class="detail-fact-card"><strong>天气建议</strong><span>' + esc(place.weatherTag === 'indoor' ? '雨天友好' : place.weatherTag === 'outdoor' ? '晴天更佳' : '四季皆宜') + '</span></div>' +
                    '<div class="detail-fact-card"><strong>拥挤程度</strong><span>' + esc(place.crowdLevel) + '</span></div>' +
                    '<div class="detail-fact-card"><strong>停车建议</strong><span>' + esc(place.parkingTip) + '</span></div>' +
                '</div>' +
                '<div class="detail-section">' +
                    '<h3><i class="fas fa-users"></i> 适合谁去</h3>' +
                    '<div class="detail-chip-row">' + audienceLabels + '</div>' +
                '</div>' +
                '<div class="detail-section">' +
                    '<h3><i class="fas fa-info-circle"></i> 景点介绍</h3>' +
                    '<p>' + (place.intro || esc(place.typeDesc) || esc('这是一个' + place.type + '，位于' + place.address + '，距离您约' + place.distanceText + '。')) + '</p>' +
                    '<div style="margin-top: 15px; padding: 15px; background: rgba(52, 152, 219, 0.05); border-left: 4px solid var(--primary-blue); border-radius: 4px;">' +
                        '<strong>游玩小贴士：</strong>' +
                        '<p style="margin-top: 5px; color: var(--text-secondary);">' + esc(place.tip || '周末人可能比较多，建议提前规划好行程，体验更佳哦！') + '</p>' +
                    '</div>' +
                '</div>' +
                '<div class="detail-section">' +
                    '<h3><i class="fas fa-sparkles"></i> 推荐亮点</h3>' +
                    '<ul class="detail-highlight-list">' +
                        (place.highlights || []).map(function (item) { return '<li>' + esc(item) + '</li>'; }).join('') +
                    '</ul>' +
                '</div>' +
                '<div class="detail-actions">' +
                    '<button class="action-btn favorite ' + (isFavorite ? 'active' : '') + '" data-id="' + esc(place.id) + '">' +
                        '<i class="' + (isFavorite ? 'fas' : 'far') + ' fa-heart"></i>' + (isFavorite ? '已收藏' : '收藏') +
                    '</button>' +
                    '<a href="' + navigationUrl + '" target="_blank" class="action-btn navi-btn">' +
                        '<i class="fas fa-directions"></i>一键导航' +
                    '</a>' +
                    '<button class="action-btn share" data-share-name="' + esc(place.name) + '" data-share-address="' + esc(place.address) + '">' +
                        '<i class="fas fa-share-alt"></i>分享' +
                    '</button>' +
                '</div>' +
            '</div>';

        var favoriteBtn = modalBody.querySelector('.action-btn.favorite');
        if (favoriteBtn) {
            favoriteBtn.addEventListener('click', function () {
                if (onFavoriteClick) onFavoriteClick(place.id, favoriteBtn);
            });
        }

        var shareBtn = modalBody.querySelector('.action-btn.share');
        if (shareBtn) {
            shareBtn.addEventListener('click', function () {
                var name = shareBtn.getAttribute('data-share-name');
                var address = shareBtn.getAttribute('data-share-address');
                sharePlace(name, address);
            });
        }
    }

    function sharePlace(name, address) {
        var shareText = '【' + name + '】' + address + ' - 发现于遛趣星球';
        if (navigator.share) {
            navigator.share({ title: name, text: shareText, url: window.location.href });
        } else {
            navigator.clipboard.writeText(shareText).then(function () {
                alert('分享信息已复制到剪贴板！');
            });
        }
    }

    function renderTopicCards(places, topicActionHandler) {
        var topicCards = document.getElementById('topicCards');
        if (!topicCards) return;

        var topics = buildTopicCollections(places);
        topicCards.innerHTML = '';

        if (topics.length === 0) {
            renderEmpty(topicCards, 'fa-ranking-star', '定位后将为你生成专题推荐');
            return;
        }

        var esc = Utils.escapeHtml;
        topics.forEach(function (topic) {
            var card = document.createElement('div');
            card.className = 'topic-card';
            card.innerHTML =
                '<div class="topic-card-header">' +
                    '<h3>' + esc(topic.title) + '</h3>' +
                    '<span>' + topic.places.length + ' 个候选</span>' +
                '</div>' +
                '<p>' + esc(topic.desc) + '</p>' +
                '<ul class="topic-list">' +
                    topic.places.slice(0, 3).map(function (place) { return '<li>' + esc(place.name) + '</li>'; }).join('') +
                '</ul>' +
                '<button class="topic-action-btn">查看专题</button>';
            card.querySelector('.topic-action-btn').addEventListener('click', function () {
                if (topicActionHandler) topicActionHandler(topic);
            });
            topicCards.appendChild(card);
        });
    }

    function buildTopicCollections(places) {
        return [
            { id: 'family', title: '遛娃榜单', desc: '优先看亲子友好、步行压力小、停留时长充足的地点。',
              places: places.filter(function (p) { return p.audienceTags && p.audienceTags.indexOf('family') >= 0 && p.type !== '美食'; }).slice(0, 5),
              action: { audience: 'family' } },
            { id: 'rainy', title: '雨天备选', desc: '下雨也能出门，不用临时改行程。',
              places: places.filter(function (p) { return p.weatherTag === 'indoor'; }).slice(0, 5),
              action: { weather: 'indoor' } },
            { id: 'free', title: '免费优先', desc: '预算友好，适合说走就走的轻出行。',
              places: places.filter(function (p) { return p.budgetLevel === 'free' && p.type !== '美食'; }).slice(0, 5),
              action: { budget: 'free' } },
            { id: 'date', title: '情侣约会', desc: '优先筛选适合慢逛、拍照和吃饭串联的地点。',
              places: places.filter(function (p) { return p.audienceTags && p.audienceTags.indexOf('couple') >= 0; }).slice(0, 5),
              action: { audience: 'couple' } },
            { id: 'food', title: '人气美食', desc: '高口碑餐饮，适合当作路线中的补给站。',
              places: places.filter(function (p) { return p.type === '美食'; }).slice(0, 5),
              action: { scrollTo: 'food' } },
            { id: 'photo', title: '拍照出片', desc: '优先展示景观感和画面感更好的地点。',
              places: places.filter(function (p) { return p.themeTags && p.themeTags.indexOf('拍照出片') >= 0; }).slice(0, 5),
              action: { audience: 'couple', sort: 'popularity' } }
        ].filter(function (topic) { return topic.places.length > 0; });
    }

    function renderRouteCards(places, onRouteStopClick) {
        var routeCards = document.getElementById('routeCards');
        if (!routeCards) return;

        var routes = buildRoutePlans(places);
        routeCards.innerHTML = '';

        if (routes.length === 0) {
            renderEmpty(routeCards, 'fa-route', '定位后将为你生成路线推荐');
            return;
        }

        var esc = Utils.escapeHtml;
        routes.forEach(function (route) {
            var card = document.createElement('div');
            card.className = 'route-card';
            card.innerHTML =
                '<div class="route-card-header">' +
                    '<div><h3>' + esc(route.title) + '</h3><p>' + esc(route.subtitle) + '</p></div>' +
                    '<span class="route-duration">' + esc(route.duration) + '</span>' +
                '</div>' +
                '<div class="route-meta">适合：' + esc(route.target) + ' · ' + esc(route.reason) + '</div>' +
                '<div class="route-stops">' +
                    route.stops.map(function (stop, index) {
                        return '<span class="route-stop">' + (index + 1) + '. ' + esc(stop.name) + '</span>';
                    }).join('') +
                '</div>' +
                '<button class="topic-action-btn">查看首站详情</button>';
            card.querySelector('.topic-action-btn').addEventListener('click', function () {
                if (onRouteStopClick) onRouteStopClick(route.stops[0]);
            });
            routeCards.appendChild(card);
        });
    }

    function buildRoutePlans(places) {
        var attractions = places.filter(function (p) { return p.type !== '美食'; });
        var foods = places.filter(function (p) { return p.type === '美食'; });

        var topFamily = attractions.filter(function (p) { return p.isFamily; }).slice(0, 2);
        var topScenic = attractions.filter(function (p) { return ['景点', '公园', '博物馆'].indexOf(p.type) >= 0; }).slice(0, 2);
        var topRelax = attractions.filter(function (p) { return ['公园', '露营地', '景点'].indexOf(p.type) >= 0; }).slice(0, 2);
        var topFood = foods.slice(0, 1);

        return [
            { title: '半天遛娃轻松线', subtitle: '适合周末上午/下午安排', duration: '约 4-5 小时', target: '亲子家庭',
              stops: topFamily.concat(topFood).filter(Boolean), reason: '游玩强度适中，兼顾体验与补给。' },
            { title: '城市出片约会线', subtitle: '景点 + 公园 + 餐饮串联', duration: '约 5-6 小时', target: '情侣 / 朋友',
              stops: topScenic.concat(topFood).filter(Boolean), reason: '适合拍照、散步和边走边吃。' },
            { title: '周末放空慢游线', subtitle: '公园 / 露营地优先', duration: '半天到一天', target: '朋友 / 独自',
              stops: topRelax.concat(topFood).filter(Boolean), reason: '节奏慢、切换成本低，适合放松。' }
        ].filter(function (route) { return route.stops.length >= 2; });
    }

    global.Renderer = {
        createPlaceCard: createPlaceCard,
        appendPlaceCards: appendPlaceCards,
        renderEmpty: renderEmpty,
        renderError: renderError,
        renderDetailModal: renderDetailModal,
        renderTopicCards: renderTopicCards,
        renderRouteCards: renderRouteCards,
        getPopularityScore: getPopularityScore,
        buildTopicCollections: buildTopicCollections,
        buildRoutePlans: buildRoutePlans
    };
})(window);
