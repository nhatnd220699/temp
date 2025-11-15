const Helper = (function () {
    // Search data in multilevel array
    function deepSearch(obj, searchTerm) {
        let stack = [obj];

        while (stack.length > 0) {
            let current = stack.pop();
            for (let key in current) {
                if (Object.prototype.toString.call(current[key]) === '[object Object]') {
                    stack.push(current[key]);
                } else if (Object.prototype.toString.call(current[key]) === '[object Array]') {
                    current[key].forEach((item) => stack.push(item));
                } else {
                    if (current[key] && current[key].toString().toLowerCase().trim().indexOf(searchTerm.toString().toLowerCase().trim()) > -1) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    // Only type number
    function allowOnlyDigits(selector) {
        const inputs = document.querySelectorAll(selector);

        inputs.forEach((input) => {
            input.addEventListener('input', function () {
                this.value = this.value.replace(/[^\d\-\.]+/g, '');
            });
        });
    }

    // Currency formating accourding to the ISO standard
    function formatCurrencyISO({num, decimals = null}) {
        if (num === null || num === undefined || num === '' || isNaN(num)) {
            return num;
        }

        num = Number(num);
        const isInteger = Number.isInteger(num);
        const fractionDigits = isInteger ? 0 : decimals ?? 2;

        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: fractionDigits,
            maximumFractionDigits: fractionDigits,
        }).format(Number(num));
    }

    function getCookie(cname) {
        const name = cname + '=';
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];

            while (c.charAt(0) == ' ') {
                c = c.substring(1);
            }

            if (c.indexOf(name) == 0) {
                return c.substring(name.length, c.length);
            }
        }
        return '';
    }

    const parseNumber = ({num, decimals = 2, fallback = ''}) => {
        if (num === null || num === undefined || num === '') return fallback;
        const n = Number(num);
        if (Number.isNaN(num)) return num;
        return Number.isInteger(n) ? n : parseFloat(n.toFixed(decimals));
    };

    const parseShortNumber = ({num, decimals = 0, fallback = ''}) => {
        // Kiểm tra nếu num không phải là một số hợp lệ
        if (isNaN(num)) return num;

        // Định nghĩa các giá trị tỉ lệ và ký hiệu
        const units = [
            {threshold: 1e9, suffix: 'B'}, // Tỷ
            {threshold: 1e6, suffix: 'M'}, // Triệu
            {threshold: 1e3, suffix: 'K'}, // Nghìn
        ];

        // Duyệt qua các đơn vị (B, M, K)
        for (const {threshold, suffix} of units) {
            if (num >= threshold) {
                const result = num / threshold;
                // Kiểm tra xem kết quả có phải là số nguyên không
                return Number.isInteger(result) ? result.toString() : result.toFixed(decimals) + suffix;
            }
        }

        // Nếu không có đơn vị nào phù hợp, trả về số nguyên
        return num.toString();
    };

    const safeGet = (obj, path, fallback = undefined) => {
        return path.split('.').reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), obj) ?? fallback;
    };

    return {deepSearch, allowOnlyDigits, formatCurrencyISO, getCookie, parseNumber, parseShortNumber, safeGet};
})();


window.ready = function (fn) {
    if (document.readyState !== 'loading') {
        fn();
    } else {
        document.addEventListener('DOMContentLoaded', function () {
            fn();
        });
    }
};
