const placesData = [
    {
        id: 1,
        name: "星湖湿地公园",
        category: "亲子遛娃",
        tags: ["亲子友好", "免费", "网红打卡"],
        image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&h=400&fit=crop",
        images: [
            "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop",
            "https://images.unsplash.com/photo-1518173946687-a4c036bc3c95?w=800&h=600&fit=crop",
            "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800&h=600&fit=crop"
        ],
        highlight: "城市绿肺，亲子骑行圣地，周末遛娃首选",
        distance: 5.2,
        price: 0,
        priceText: "免费",
        rating: 4.8,
        address: "市中心星湖路88号",
        openTime: "06:00-22:00",
        phone: "0571-88888888",
        description: "星湖湿地公园是城市中难得的生态绿洲，拥有完善的骑行道和步行道。公园内设有儿童游乐区、观鸟台、科普教育基地等设施，是周末亲子出游的理想选择。春天赏花、夏天戏水、秋天观叶、冬天看鸟，四季皆宜。",
        tips: [
            "建议游玩时长：2-3小时",
            "必带物品：防晒霜、驱蚊水、野餐垫",
            "避坑提醒：周末人较多，建议早上去"
        ],
        familyInfo: {
            suitableAge: "全年龄段",
            hasFacilities: true,
            facilities: "儿童游乐区、母婴室、亲子洗手间",
            isFree: true,
            parking: "大型停车场，周末建议早到"
        },
        reviews: [
            { name: "小萌妈妈", avatar: "萌", date: "2024-01-15", text: "带孩子来过很多次了，环境很好，设施完善，关键是免费！强烈推荐给带娃家庭~" },
            { name: "阳光爸爸", avatar: "阳", date: "2024-01-10", text: "周末骑行的好地方，孩子玩得很开心，下次还来！" }
        ],
        nearby: [
            { name: "星湖咖啡", type: "美食" },
            { name: "儿童绘本馆", type: "亲子" }
        ],
        isYouth: true,
        isFamily: true,
        isPopular: true
    },
    {
        id: 2,
        name: "云端艺术馆",
        category: "拍照打卡",
        tags: ["网红打卡", "小众宝藏"],
        image: "https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=600&h=400&fit=crop",
        images: [
            "https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=800&h=600&fit=crop",
            "https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=800&h=600&fit=crop",
            "https://images.unsplash.com/photo-1541367777708-7905fe3296c0?w=800&h=600&fit=crop"
        ],
        highlight: "ins风拍照圣地，每个角落都是大片",
        distance: 3.8,
        price: 68,
        priceText: "人均68元",
        rating: 4.7,
        address: "创意园区A座5楼",
        openTime: "10:00-20:00",
        phone: "0571-66666666",
        description: "云端艺术馆是年轻人必打卡的网红地标，馆内设有多个主题展区，从极简风到复古风应有尽有。每个展区都经过精心设计，随手一拍就是大片。周末约上闺蜜，来这里拍一组美美的照片吧！",
        tips: [
            "建议游玩时长：2小时",
            "必带物品：相机、好看的衣服",
            "避坑提醒：周末人多，建议工作日去"
        ],
        reviews: [
            { name: "摄影小白", avatar: "摄", date: "2024-01-18", text: "真的太好拍了！每个角落都出片，下次还要来~" },
            { name: "文艺青年", avatar: "文", date: "2024-01-12", text: "环境很棒，适合拍照，但人有点多" }
        ],
        nearby: [
            { name: "网红咖啡店", type: "美食" },
            { name: "手作工坊", type: "休闲" }
        ],
        isYouth: true,
        isFamily: false,
        isPopular: true
    },
    {
        id: 3,
        name: "森林露营基地",
        category: "户外露营",
        tags: ["露营", "小众宝藏", "宠物友好"],
        image: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600&h=400&fit=crop",
        images: [
            "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&h=600&fit=crop",
            "https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=800&h=600&fit=crop",
            "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&h=600&fit=crop"
        ],
        highlight: "逃离城市喧嚣，感受星空下的浪漫",
        distance: 25,
        price: 198,
        priceText: "人均198元",
        rating: 4.9,
        address: "近郊森林路188号",
        openTime: "全天开放",
        phone: "0571-99999999",
        description: "森林露营基地位于城市近郊，被原始森林环绕，是周末逃离城市喧嚣的绝佳选择。基地提供帐篷租赁、烧烤设备、篝火晚会等服务，让你轻松享受露营乐趣。晚上可以看星星、听虫鸣，感受大自然的魅力。",
        tips: [
            "建议游玩时长：1-2天",
            "必带物品：驱蚊水、保暖衣物、手电筒",
            "避坑提醒：提前预约，周末很抢手"
        ],
        reviews: [
            { name: "户外达人", avatar: "户", date: "2024-01-20", text: "环境超棒！晚上看星星太美了，强烈推荐！" },
            { name: "露营新手", avatar: "露", date: "2024-01-16", text: "第一次露营体验很好，设施齐全，适合新手" }
        ],
        nearby: [
            { name: "农家乐", type: "美食" },
            { name: "徒步路线", type: "户外" }
        ],
        isYouth: true,
        isFamily: true,
        isPopular: true
    },
    {
        id: 4,
        name: "童趣乐园",
        category: "亲子遛娃",
        tags: ["亲子友好", "网红打卡"],
        image: "https://images.unsplash.com/photo-1565793298595-6a879b1d9492?w=600&h=400&fit=crop",
        images: [
            "https://images.unsplash.com/photo-1565793298595-6a879b1d9492?w=800&h=600&fit=crop",
            "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800&h=600&fit=crop",
            "https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&h=600&fit=crop"
        ],
        highlight: "室内游乐天堂，雨天遛娃也不怕",
        distance: 8.5,
        price: 128,
        priceText: "人均128元",
        rating: 4.6,
        address: "万达广场3楼",
        openTime: "10:00-21:00",
        phone: "0571-77777777",
        description: "童趣乐园是市内最大的室内儿童乐园，拥有海洋球池、滑梯、蹦床、积木区等丰富的游乐设施。室内恒温环境，不受天气影响，是带娃家庭的最佳选择。还有专门的幼儿区，适合不同年龄段的孩子。",
        tips: [
            "建议游玩时长：3-4小时",
            "必带物品：防滑袜、水杯、换洗衣物",
            "避坑提醒：周末人多，建议网上提前购票"
        ],
        familyInfo: {
            suitableAge: "1-12岁",
            hasFacilities: true,
            facilities: "母婴室、儿童洗手间、休息区",
            isFree: false,
            parking: "商场地下停车场，前2小时免费"
        },
        reviews: [
            { name: "快乐妈妈", avatar: "快", date: "2024-01-19", text: "孩子玩了一整天都不想走，设施很新，干净卫生！" },
            { name: "奶爸一枚", avatar: "奶", date: "2024-01-14", text: "性价比不错，比外面的小游乐场好玩多了" }
        ],
        nearby: [
            { name: "亲子餐厅", type: "美食" },
            { name: "儿童理发", type: "服务" }
        ],
        isYouth: false,
        isFamily: true,
        isPopular: true
    },
    {
        id: 5,
        name: "慢生活咖啡馆",
        category: "休闲放松",
        tags: ["网红打卡", "小众宝藏"],
        image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600&h=400&fit=crop",
        images: [
            "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&h=600&fit=crop",
            "https://images.unsplash.com/photo-1453614512568-c4024d13c247?w=800&h=600&fit=crop",
            "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&h=600&fit=crop"
        ],
        highlight: "藏在老街里的宝藏咖啡店，治愈你的疲惫",
        distance: 2.3,
        price: 45,
        priceText: "人均45元",
        rating: 4.8,
        address: "老街巷子12号",
        openTime: "09:00-22:00",
        phone: "0571-55555555",
        description: "慢生活咖啡馆藏在一个不起眼的老街巷子里，推开木门，仿佛进入了另一个世界。复古的装修风格、悠扬的音乐、香浓的咖啡，让你瞬间忘记城市的喧嚣。这里还有一只超可爱的店猫，喜欢撸猫的朋友不要错过！",
        tips: [
            "建议游玩时长：1-2小时",
            "必带物品：一本书、好心情",
            "避坑提醒：下午人较多，建议上午去"
        ],
        reviews: [
            { name: "咖啡控", avatar: "咖", date: "2024-01-17", text: "咖啡很好喝，环境超赞，适合发呆看书！" },
            { name: "猫奴一枚", avatar: "猫", date: "2024-01-13", text: "店里的猫太可爱了，为了猫也要来！" }
        ],
        nearby: [
            { name: "独立书店", type: "休闲" },
            { name: "手作甜品店", type: "美食" }
        ],
        isYouth: true,
        isFamily: false,
        isPopular: false
    },
    {
        id: 6,
        name: "农场体验园",
        category: "亲子遛娃",
        tags: ["亲子友好", "小众宝藏"],
        image: "https://images.unsplash.com/photo-1500076656116-558758c991c1?w=600&h=400&fit=crop",
        images: [
            "https://images.unsplash.com/photo-1500076656116-558758c991c1?w=800&h=600&fit=crop",
            "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&h=600&fit=crop",
            "https://images.unsplash.com/photo-1592878904946-b3cd8ae243d0?w=800&h=600&fit=crop"
        ],
        highlight: "带孩子体验农耕乐趣，认识大自然",
        distance: 15,
        price: 88,
        priceText: "人均88元",
        rating: 4.7,
        address: "郊区农场路66号",
        openTime: "08:00-18:00",
        phone: "0571-44444444",
        description: "农场体验园是一个集农业科普、亲子互动、休闲采摘于一体的综合性农场。孩子们可以在这里喂小动物、采摘水果蔬菜、体验农耕活动，在玩乐中学习知识，感受大自然的魅力。",
        tips: [
            "建议游玩时长：半天",
            "必带物品：防晒帽、运动鞋、换洗衣物",
            "避坑提醒：穿耐脏的衣服，孩子会玩得很嗨"
        ],
        familyInfo: {
            suitableAge: "3-12岁",
            hasFacilities: true,
            facilities: "母婴室、休息区、餐厅",
            isFree: false,
            parking: "免费停车场"
        },
        reviews: [
            { name: "自然妈妈", avatar: "自", date: "2024-01-21", text: "孩子第一次看到蔬菜是怎么长的，学到了很多！" },
            { name: "田园控", avatar: "田", date: "2024-01-11", text: "采摘的水果很新鲜，比超市买的好吃多了" }
        ],
        nearby: [
            { name: "农家菜馆", type: "美食" },
            { name: "钓鱼塘", type: "休闲" }
        ],
        isYouth: false,
        isFamily: true,
        isPopular: false
    },
    {
        id: 7,
        name: "网红夜市",
        category: "美食探店",
        tags: ["网红打卡", "免费"],
        image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&h=400&fit=crop",
        images: [
            "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=600&fit=crop",
            "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=600&fit=crop",
            "https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=800&h=600&fit=crop"
        ],
        highlight: "吃货天堂，百种小吃让你吃到撑",
        distance: 4.2,
        price: 50,
        priceText: "人均50元",
        rating: 4.5,
        address: "步行街夜市区",
        openTime: "18:00-02:00",
        phone: "-",
        description: "网红夜市是本地最火的美食聚集地，汇集了全国各地的小吃美食。从烧烤、炸串到甜品、饮品，应有尽有。夜晚灯火通明，人声鼎沸，是年轻人夜生活的首选之地。",
        tips: [
            "建议游玩时长：2小时",
            "必带物品：现金、纸巾",
            "避坑提醒：周末人超级多，建议早点去"
        ],
        reviews: [
            { name: "吃货达人", avatar: "吃", date: "2024-01-22", text: "太好吃了！每种都想尝尝，下次还来！" },
            { name: "夜猫子", avatar: "夜", date: "2024-01-09", text: "氛围很好，适合和朋友一起来逛吃逛吃" }
        ],
        nearby: [
            { name: "奶茶一条街", type: "美食" },
            { name: "电影院", type: "休闲" }
        ],
        isYouth: true,
        isFamily: false,
        isPopular: true
    },
    {
        id: 8,
        name: "湖畔骑行道",
        category: "休闲放松",
        tags: ["免费", "网红打卡", "宠物友好"],
        image: "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=600&h=400&fit=crop",
        images: [
            "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=800&h=600&fit=crop",
            "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800&h=600&fit=crop",
            "https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?w=800&h=600&fit=crop"
        ],
        highlight: "最美环湖骑行路线，日落时分绝美",
        distance: 6.8,
        price: 0,
        priceText: "免费",
        rating: 4.9,
        address: "湖滨公园入口",
        openTime: "全天开放",
        phone: "-",
        description: "湖畔骑行道全长15公里，沿途风景如画。清晨可以看日出，傍晚可以看夕阳，是骑行爱好者的天堂。沿途设有多个休息点和观景台，可以随时停下来欣赏美景。",
        tips: [
            "建议游玩时长：2-3小时",
            "必带物品：自行车、水、防晒霜",
            "避坑提醒：傍晚人最多，建议错峰出行"
        ],
        reviews: [
            { name: "骑行侠", avatar: "骑", date: "2024-01-23", text: "风景太美了！日落的时候骑行简直绝了！" },
            { name: "运动达人", avatar: "运", date: "2024-01-08", text: "周末骑行的好地方，空气清新，推荐！" }
        ],
        nearby: [
            { name: "湖畔茶室", type: "美食" },
            { name: "游船码头", type: "休闲" }
        ],
        isYouth: true,
        isFamily: true,
        isPopular: false
    },
    {
        id: 9,
        name: "科技探索馆",
        category: "亲子遛娃",
        tags: ["亲子友好", "网红打卡"],
        image: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=600&h=400&fit=crop",
        images: [
            "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&h=600&fit=crop",
            "https://images.unsplash.com/photo-1565008447742-97f6f38c985c?w=800&h=600&fit=crop",
            "https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=800&h=600&fit=crop"
        ],
        highlight: "寓教于乐，让孩子爱上科学",
        distance: 10.5,
        price: 80,
        priceText: "人均80元",
        rating: 4.8,
        address: "科技园区创新大道",
        openTime: "09:00-17:00（周一闭馆）",
        phone: "0571-33333333",
        description: "科技探索馆是市内最大的科普教育基地，拥有数百个互动展品。孩子们可以通过动手操作，了解物理、化学、生物等科学原理。还有4D影院、科学实验室等特色项目，让孩子在玩乐中学习。",
        tips: [
            "建议游玩时长：半天",
            "必带物品：水杯、午餐（馆内有餐厅）",
            "避坑提醒：周末人多，建议工作日去"
        ],
        familyInfo: {
            suitableAge: "4-14岁",
            hasFacilities: true,
            facilities: "母婴室、餐厅、休息区",
            isFree: false,
            parking: "地下停车场，凭门票免费"
        },
        reviews: [
            { name: "科学妈妈", avatar: "科", date: "2024-01-24", text: "孩子玩了一整天，学到了很多科学知识！" },
            { name: "好奇爸爸", avatar: "奇", date: "2024-01-07", text: "互动展品很棒，大人小孩都能玩得很开心" }
        ],
        nearby: [
            { name: "科技餐厅", type: "美食" },
            { name: "图书馆", type: "休闲" }
        ],
        isYouth: false,
        isFamily: true,
        isPopular: true
    },
    {
        id: 10,
        name: "复古照相馆",
        category: "拍照打卡",
        tags: ["网红打卡", "小众宝藏"],
        image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&h=400&fit=crop",
        images: [
            "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&h=600&fit=crop",
            "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&h=600&fit=crop",
            "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=800&h=600&fit=crop"
        ],
        highlight: "穿越时光，拍一组复古大片",
        distance: 3.5,
        price: 158,
        priceText: "人均158元",
        rating: 4.6,
        address: "老城区文化街28号",
        openTime: "10:00-20:00",
        phone: "0571-22222222",
        description: "复古照相馆保留了上世纪的装修风格，提供各种复古服装和道具。在这里，你可以拍出充满怀旧气息的照片，仿佛穿越回了那个年代。适合闺蜜约会、情侣拍照、家庭合影。",
        tips: [
            "建议游玩时长：1-2小时",
            "必带物品：好看的妆容",
            "避坑提醒：需要提前预约"
        ],
        reviews: [
            { name: "复古控", avatar: "复", date: "2024-01-25", text: "照片太有感觉了！下次还要来拍其他风格！" },
            { name: "文艺少女", avatar: "文", date: "2024-01-06", text: "服装和道具都很用心，出片效果超赞！" }
        ],
        nearby: [
            { name: "老街小吃", type: "美食" },
            { name: "古董店", type: "休闲" }
        ],
        isYouth: true,
        isFamily: false,
        isPopular: false
    },
    {
        id: 11,
        name: "温泉度假村",
        category: "休闲放松",
        tags: ["网红打卡"],
        image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600&h=400&fit=crop",
        images: [
            "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&h=600&fit=crop",
            "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&h=600&fit=crop",
            "https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=800&h=600&fit=crop"
        ],
        highlight: "泡汤放松，洗去一身疲惫",
        distance: 30,
        price: 268,
        priceText: "人均268元",
        rating: 4.7,
        address: "温泉小镇度假路1号",
        openTime: "10:00-23:00",
        phone: "0571-11111111",
        description: "温泉度假村拥有多个室内外温泉池，水质清澈，富含多种矿物质。在这里泡个温泉，欣赏山间美景，让身心得到彻底放松。还有SPA、按摩等配套服务，是周末度假的理想选择。",
        tips: [
            "建议游玩时长：半天",
            "必带物品：泳衣、拖鞋、毛巾",
            "避坑提醒：周末人多，建议提前预约"
        ],
        reviews: [
            { name: "养生达人", avatar: "养", date: "2024-01-26", text: "温泉很舒服，环境也很棒，下次还来！" },
            { name: "放松一族", avatar: "放", date: "2024-01-05", text: "周末泡个温泉，一周的疲惫都没了" }
        ],
        nearby: [
            { name: "农家菜", type: "美食" },
            { name: "山间步道", type: "休闲" }
        ],
        isYouth: true,
        isFamily: false,
        isPopular: false
    },
    {
        id: 12,
        name: "动物园",
        category: "亲子遛娃",
        tags: ["亲子友好", "网红打卡"],
        image: "https://images.unsplash.com/photo-1534567153574-2b12153a87f0?w=600&h=400&fit=crop",
        images: [
            "https://images.unsplash.com/photo-1534567153574-2b12153a87f0?w=800&h=600&fit=crop",
            "https://images.unsplash.com/photo-1474511320723-9a56873571b7?w=800&h=600&fit=crop",
            "https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?w=800&h=600&fit=crop"
        ],
        highlight: "近距离接触萌宠，孩子的快乐天堂",
        distance: 12,
        price: 120,
        priceText: "人均120元",
        rating: 4.5,
        address: "动物园路100号",
        openTime: "08:30-17:30",
        phone: "0571-12345678",
        description: "动物园汇集了来自世界各地的珍稀动物，有大熊猫、长颈鹿、斑马、企鹅等明星动物。园内还有动物表演、喂食体验等互动项目，让孩子们在欢乐中了解动物、热爱自然。",
        tips: [
            "建议游玩时长：1天",
            "必带物品：防晒霜、水、零食",
            "避坑提醒：穿舒适的鞋子，要走很多路"
        ],
        familyInfo: {
            suitableAge: "全年龄段",
            hasFacilities: true,
            facilities: "母婴室、餐厅、小火车",
            isFree: false,
            parking: "大型停车场"
        },
        reviews: [
            { name: "动物控", avatar: "动", date: "2024-01-27", text: "孩子看到大熊猫开心坏了，玩了一整天！" },
            { name: "周末妈妈", avatar: "周", date: "2024-01-04", text: "设施很完善，适合带娃来玩一整天" }
        ],
        nearby: [
            { name: "主题餐厅", type: "美食" },
            { name: "儿童乐园", type: "亲子" }
        ],
        isYouth: false,
        isFamily: true,
        isPopular: true
    }
];

const packagesData = [
    {
        id: 1,
        title: "星湖公园+亲子餐厅套餐",
        description: "公园游玩+儿童套餐，省心又划算",
        image: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=300&h=200&fit=crop",
        price: "168元/家庭",
        places: ["星湖湿地公园", "童趣亲子餐厅"]
    },
    {
        id: 2,
        title: "农场体验+农家乐套餐",
        description: "采摘体验+地道农家菜，周末好选择",
        image: "https://images.unsplash.com/photo-1500076656116-558758c991c1?w=300&h=200&fit=crop",
        price: "258元/家庭",
        places: ["农场体验园", "农家乐"]
    },
    {
        id: 3,
        title: "科技馆+主题餐厅套餐",
        description: "科普学习+营养午餐，寓教于乐",
        image: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=300&h=200&fit=crop",
        price: "198元/家庭",
        places: ["科技探索馆", "科技主题餐厅"]
    }
];
