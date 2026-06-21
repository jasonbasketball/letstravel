(function () {
    var DEFAULT_CONFIG = {
        amap: {
            jsApiKey: 'ca68b8dda260b65a74db213b45f95e23',
            webServiceKey: '5cc98010473dc9bf7343b87635e58bab',
            securityJsCode: '31663f8fc2e406fdd1de258b777e4db8'
        }
    };

    window.AppConfig = DEFAULT_CONFIG;

    fetch('js/config.json?t=' + Date.now())
        .then(function (res) { return res.json(); })
        .then(function (data) {
            if (data && data.amap) {
                window.AppConfig = data;
                if (data.amap.securityJsCode && window._AMapSecurityConfig) {
                    window._AMapSecurityConfig.securityJsCode = data.amap.securityJsCode;
                }
            }
        })
        .catch(function () {
            // 使用默认配置（config.json 被 gitignore 或 fetch 失败时）
        });
})();
