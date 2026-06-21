/**
 * poi-processor.js — POI 数据处理与分类
 */
(function (global) {
    'use strict';

    var Utils = global.Utils;

    var EXCLUDE_POI_KEYWORDS = ['停车场', '厕所', '洗手间', '公交', '大门', '入口', '出口', '售票处', '服务中心', '内部设施', '棋牌', '麻将', '台球', '健身', '瑜伽', '酒吧', '网吧', '足浴', '洗浴'];
    var EXCLUDE_TYPE_KEYWORDS = ['运动场馆', '生活服务', '会所', '酒吧', '网吧', '棋牌室', '洗浴推拿', '足疗保健', 'KTV'];

    var FAMILY_TYPES = ['公园', '游乐场', '博物馆', '动物园'];
    var ALLOWED_PLACE_TYPES = ['公园', '游乐场', '博物馆', '动物园', '露营地', '景点', '美食'];

    var AMAP_TYPES_MAPPING = {
        '公园': '110101|110102|110103',
        '游乐场': '080501|080505|110000',
        '博物馆': '140100',
        '动物园': '110104|110202|110000',
        '露营地': '080504|080500',
        '美食': '050000|050100|050200|050300|050400|050500',
        '景点': '110000|110200|110202|110201'
    };

    var PRESET_TYPES = [
        '110000|110100|110200',
        '080500|080501|080504|080505',
        '140100',
        '110104|110202',
        '050000|050100|050200|050300|050400|050500'
    ];

    var TIPS_POOL = [
        '建议游玩时长：2-3小时，适合周末放松。',
        '这里环境很棒，记得带上相机多拍几张照片哦！',
        '周边配套齐全，吃喝玩乐一条龙，非常便利。',
        '周末人可能比较多，建议错峰出行，体验更佳。',
        '不管是情侣约会还是家庭出游，这里都是个不错的选择。',
        '可以带上一点防蚊液和防晒霜，以备不时之需。',
        '这里是个隐藏的宝藏打卡地，出片率极高！'
    ];

    function classifyType(typecode, poiName, typeDesc) {
        if (
            typecode.indexOf('110104') === 0 ||
            poiName.indexOf('动物园') >= 0 || poiName.indexOf('野生动物') >= 0 ||
            poiName.indexOf('海洋公园') >= 0 || poiName.indexOf('海洋馆') >= 0 || poiName.indexOf('水族馆') >= 0 ||
            typeDesc.indexOf('动物园') >= 0 || typeDesc.indexOf('水族') >= 0 || typeDesc.indexOf('海洋馆') >= 0
        ) return '动物园';

        if (
            typecode.indexOf('080501') === 0 || typecode.indexOf('080505') === 0 ||
            typeDesc.indexOf('游乐') >= 0 || typeDesc.indexOf('主题乐园') >= 0 || typeDesc.indexOf('水上乐园') >= 0 ||
            poiName.indexOf('游乐') >= 0 || poiName.indexOf('乐园') >= 0 || poiName.indexOf('主题') >= 0 ||
            poiName.indexOf('摩天轮') >= 0 || poiName.indexOf('过山车') >= 0 || poiName.indexOf('水世界') >= 0
        ) return '游乐场';

        if (typecode.indexOf('1401') === 0 || typeDesc.indexOf('博物馆') >= 0 || typeDesc.indexOf('科技馆') >= 0 || typeDesc.indexOf('美术馆') >= 0)
            return '博物馆';

        if (
            typecode.indexOf('110101') === 0 || typecode.indexOf('110102') === 0 || typecode.indexOf('110103') === 0 ||
            typeDesc.indexOf('公园') >= 0 || typeDesc.indexOf('植物园') >= 0 || typeDesc.indexOf('森林公园') >= 0 || typeDesc.indexOf('湿地') >= 0
        ) return '公园';

        if (
            typecode.indexOf('080504') === 0 ||
            (typecode.indexOf('080500') === 0 && (poiName.indexOf('营地') >= 0 || poiName.indexOf('露营') >= 0 || typeDesc.indexOf('露营') >= 0)) ||
            typeDesc.indexOf('露营') >= 0 || typeDesc.indexOf('营地') >= 0 ||
            poiName.indexOf('营地') >= 0 || poiName.indexOf('露营') >= 0
        ) return '露营地';

        if (typecode.indexOf('05') === 0 || typeDesc.indexOf('餐饮') >= 0 || typeDesc.indexOf('美食') >= 0 || typeDesc.indexOf('咖啡') >= 0 || typeDesc.indexOf('茶馆') >= 0 || typeDesc.indexOf('小吃') >= 0)
            return '美食';

        if (
            typecode.indexOf('1102') === 0 || typecode.indexOf('1100') === 0 ||
            typeDesc.indexOf('风景名胜') >= 0 || typeDesc.indexOf('景区') >= 0 ||
            typeDesc.indexOf('古迹') >= 0 || typeDesc.indexOf('旅游景点') >= 0 || typeDesc.indexOf('度假区') >= 0
        ) return '景点';

        return null;
    }

    function getDurationMeta(type) {
        var map = {
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
        var parsedCost = parseFloat(cost);
        if (Number.isFinite(parsedCost)) {
            if (parsedCost <= 30) return 'low';
            if (parsedCost <= 100) return 'medium';
            return 'high';
        }
        if (type === '公园' || type === '景点') return 'free';
        if (type === '美食') return 'medium';
        return 'low';
    }

    function getWeatherTag(type) {
        if (type === '博物馆' || type === '美食') return 'indoor';
        if (type === '公园' || type === '露营地' || type === '动物园') return 'outdoor';
        return 'mixed';
    }

    function getAudienceTags(type) {
        var tags = ['friends'];
        if (['公园', '游乐场', '博物馆', '动物园'].indexOf(type) >= 0) tags.push('family');
        if (['景点', '公园', '美食', '博物馆'].indexOf(type) >= 0) tags.push('couple');
        if (['景点', '博物馆', '公园', '美食'].indexOf(type) >= 0) tags.push('solo');
        return tags.filter(function (v, i, a) { return a.indexOf(v) === i; });
    }

    function getBestTime(type) {
        var map = {
            '公园': '上午或傍晚', '游乐场': '上午开园后', '博物馆': '工作日下午',
            '动物园': '上午 9 点-11 点', '露营地': '晴天午后', '景点': '日落前后', '美食': '午餐后或晚餐前'
        };
        return map[type] || '错峰前往';
    }

    function getCrowdLevel(rating, type) {
        if (rating >= 4.6 || type === '游乐场' || type === '动物园') return '较高';
        if (rating >= 4.1) return '中等';
        return '相对轻松';
    }

    function getParkingTip(type, distance) {
        if (distance < 1) return '步行或打车更省心';
        if (type === '露营地' || type === '公园' || type === '动物园') return '建议自驾，优先看停车场指引';
        if (type === '博物馆') return '建议优先公共交通，周边停车位有限';
        return '可根据实时路况选择自驾或公共交通';
    }

    function getThemeTags(type, budgetLevel, weatherTag, audienceTags) {
        var tags = [];
        if (budgetLevel === 'free') tags.push('免费优先');
        if (weatherTag === 'indoor') tags.push('雨天友好');
        if (weatherTag === 'outdoor') tags.push('晴天更佳');
        if (audienceTags.indexOf('family') >= 0) tags.push('亲子可玩');
        if (audienceTags.indexOf('couple') >= 0) tags.push('约会友好');
        if (type === '景点') tags.push('拍照出片');
        if (type === '美食') tags.push('适合聚餐');
        return tags.slice(0, 3);
    }

    function getPlaceHighlights(type, weatherTag, bestTime) {
        var base = {
            '公园': ['适合散步放松', '开阔空间更轻松', '推荐' + bestTime + '前往'],
            '游乐场': ['互动体验感强', '适合周末半天到一天', '推荐' + bestTime + '出发'],
            '博物馆': ['内容集中易逛', '适合学习与拍照', weatherTag === 'indoor' ? '雨天也能安心去' : '四季都适合'],
            '动物园': ['遛娃成功率高', '适合周末整天安排', '推荐' + bestTime + '前往'],
            '露营地': ['适合放空和社交', '适合带装备慢慢玩', '建议关注天气变化'],
            '景点': ['适合打卡拍照', '内容丰富不单调', '推荐' + bestTime + '体验更佳'],
            '美食': ['适合顺路补给', '可与景点串联', '适合朋友或情侣一起去']
        };
        return base[type] || ['适合顺路安排', '体验轻松', '推荐' + bestTime + '前往'];
    }

    function buildDetailedIntro(opts) {
        var typeDurationMap = {
            '公园': '1-3小时', '游乐场': '3-5小时', '博物馆': '2-4小时',
            '动物园': '3-6小时', '露营地': '半天到1天', '景点': '2-4小时', '美食': '1-2小时'
        };
        var duration = typeDurationMap[opts.type] || '2-3小时';
        var ratingText = Number.isFinite(opts.rating) ? opts.rating.toFixed(1) + '分' : '评分稳定';
        var costText = opts.cost ? '人均约' + opts.cost + '元，' : '';
        var descText = opts.typeDesc && opts.typeDesc !== opts.type ? '类型为' + opts.typeDesc + '。' : '属于' + opts.type + '场景。';
        return Utils.escapeHtml(opts.name) + descText + '位于' + Utils.escapeHtml(opts.address) + '，距离您约' + Utils.escapeHtml(opts.distanceText) + '。当前口碑' + ratingText + '，' + costText + '建议安排' + duration + '游玩，优先选择非高峰时段体验更佳。';
    }

    function calculatePopularityBase(opts) {
        var normalizedRating = Math.max(0, Math.min(100, (opts.rating / 5) * 55));
        var distanceKm = Math.max(0.05, opts.distance);
        var distanceScore = Math.max(0, 25 - (distanceKm * 2.2));
        var mediaScore = Math.min(10, opts.photoCount * 2.5);
        var infoScore = (opts.hasTel ? 4 : 0) + (opts.hasCost ? 4 : 0);
        var typeScore = (opts.type === '景点' || opts.type === '游乐场' || opts.type === '动物园' || opts.type === '博物馆') ? 6 : 3;
        return Math.max(0, Math.min(100, normalizedRating + distanceScore + mediaScore + infoScore + typeScore));
    }

    function processPOIData(poi, userLat, userLng) {
        var poiName = poi.name || '';
        var typeDesc = poi.type || '';
        var typecode = poi.typecode || '';

        var i;
        for (i = 0; i < EXCLUDE_POI_KEYWORDS.length; i++) {
            if (poiName.indexOf(EXCLUDE_POI_KEYWORDS[i]) >= 0 || typeDesc.indexOf(EXCLUDE_POI_KEYWORDS[i]) >= 0) return null;
        }
        for (i = 0; i < EXCLUDE_TYPE_KEYWORDS.length; i++) {
            if (typeDesc.indexOf(EXCLUDE_TYPE_KEYWORDS[i]) >= 0) return null;
        }

        if (!poi.location || poi.location.indexOf(',') < 0) return null;

        var location = poi.location.split(',');
        var poiLng = parseFloat(location[0]);
        var poiLat = parseFloat(location[1]);
        if (!Number.isFinite(poiLng) || !Number.isFinite(poiLat)) return null;

        var distance = Utils.calculateDistance(userLat, userLng, poiLat, poiLng);
        var type = classifyType(typecode, poiName, typeDesc);
        if (!type) return null;

        var fallbackAddress = [poi.pname, poi.cityname, poi.adname].filter(Boolean).join('');
        var ratingValue = parseFloat(poi.biz_ext && poi.biz_ext.rating);
        var finalRating = Number.isFinite(ratingValue) ? ratingValue : 0;
        var distanceText = Utils.formatDistance(distance);
        var finalAddress = poi.address || fallbackAddress || '暂无地址信息';
        var durationMeta = getDurationMeta(type);
        var budgetLevel = getBudgetLevel((poi.biz_ext && poi.biz_ext.cost) || '', type);
        var weatherTag = getWeatherTag(type);
        var audienceTags = getAudienceTags(type);
        var bestTime = getBestTime(type);
        var crowdLevel = getCrowdLevel(finalRating, type);
        var parkingTip = getParkingTip(type, distance);
        var themeTags = getThemeTags(type, budgetLevel, weatherTag, audienceTags);
        var highlights = getPlaceHighlights(type, weatherTag, bestTime);
        var intro = buildDetailedIntro({
            name: poiName, type: type, typeDesc: typeDesc,
            address: finalAddress, distanceText: distanceText,
            rating: finalRating, cost: (poi.biz_ext && poi.biz_ext.cost) || ''
        });
        var popularityBase = calculatePopularityBase({
            rating: finalRating, distance: distance,
            photoCount: Array.isArray(poi.photos) ? poi.photos.length : 0,
            hasTel: !!(poi.tel && poi.tel.trim()),
            hasCost: !!(poi.biz_ext && poi.biz_ext.cost),
            type: type
        });

        return {
            id: poi.id,
            name: poiName,
            type: type,
            typeDesc: typeDesc,
            address: finalAddress,
            distance: distance,
            distanceText: distanceText,
            lat: poiLat, lng: poiLng,
            tel: poi.tel || '',
            rating: finalRating,
            cost: (poi.biz_ext && poi.biz_ext.cost) || '',
            photos: (poi.photos && poi.photos.map(function (p) { return p.url; })) || [],
            image: (poi.photos && poi.photos[0] && poi.photos[0].url) || ('https://picsum.photos/600/400?random=' + encodeURIComponent(poi.id)),
            isFamily: FAMILY_TYPES.indexOf(type) >= 0,
            intro: intro,
            popularityBase: popularityBase,
            durationLabel: durationMeta.label,
            durationBucket: durationMeta.bucket,
            budgetLevel: budgetLevel,
            weatherTag: weatherTag,
            audienceTags: audienceTags,
            bestTime: bestTime,
            crowdLevel: crowdLevel,
            parkingTip: parkingTip,
            themeTags: themeTags,
            highlights: highlights,
            tip: TIPS_POOL[Math.floor(Math.random() * TIPS_POOL.length)]
        };
    }

    global.PoiProcessor = {
        processPOIData: processPOIData,
        classifyType: classifyType,
        AMAP_TYPES_MAPPING: AMAP_TYPES_MAPPING,
        PRESET_TYPES: PRESET_TYPES,
        ALLOWED_PLACE_TYPES: ALLOWED_PLACE_TYPES,
        FAMILY_TYPES: FAMILY_TYPES
    };
})(window);
