import {
    fetchSite,
    fetchBu,
    fetchCft,
    fetchPayer,
    fetchFeeType,
    fetchProject,
    fetchTotalFee,
    fetchCommonAppInfo,
    postOtherFeeDel,
    fetchFreightInfo,
    postFreightInfoSave,
    fetchSupportSystem,
    fetchModel,
    postSupportSystemSave,
    postSumbmitDraft,
    postSumbmitApplicationSend,
    postSumbmitApplicationUpdate,
    postFeeTotal,
    postFeeTotalTable,
} from '../../api/feeCreateApi.js';
import { user } from '../../user.js';

const userInfo = await user.getInfo();
const currentEmpNo = userInfo.idCard;
const role = userInfo.data?.[0]?.role || '';

const COST_TYPE_MAP = {
    'stop line': 'stop line',
    'line stop': 'stop line',
    'stop-line': 'stop line',
    'line-stop': 'stop line',
    'support system': 'support system',
    'support-system': 'support system',
    rework: 'rework',
    freight: 'freight',
    sorting: 'sorting',
};

/**
 * Chuẩn hóa lại giá trị cost type
 * @param {string} type - loại chi phí
 */
const standardizeCostType = (type) => {
    if (!type) return type;
    const normalize = type.toLowerCase();
    const result = COST_TYPE_MAP[normalize];
    if (!result) console.log('Cost type is not mactch to convert.');
    return result;
};

const urlParams = new URLSearchParams(window.location.search);

const submitNo = decodeURIComponent(urlParams.get('submitNo'));
let chargeId = parseInt(decodeURIComponent(urlParams.get('chargeId'))); // Lưu ID của đơn
let costType = standardizeCostType(decodeURIComponent(urlParams.get('costType'))); // Nếu là tạo đơn thì sẽ lấy từ url xuống (mặc định), nếu là load đơn thì lấy từ API
let submitStatus; // Lưu trạng thái đơn từ API trả về
let DOM = {};
const GLOBAL = {};

const viewCheckBoxConfig = {
    material: {
        index: 0,
        id: 'material-view',
        title: `${i18n.materialFee}`,
        templateUrl: `${SYSTEM_PATH}/assets/files/material.xlsx`,
        columns: {
            en: [
                `No.`,
                `${i18n.materialModel}`,
                `${i18n.materialCode}`,
                `${i18n.materialName}`,
                `${i18n.reworkQty}`,
                `${i18n.reworkAmount}`,
                `${i18n.unit}`,
                `${i18n.scrapQty}`,
                `${i18n.price} (USD)`,
                `${i18n.total} (USD)`,
                `${i18n.remark}`,
                `${i18n.description}`,
            ],
        },
        flag: 'material',
        apiUpload: 'api/waste-material/add-list',
        apiTable: 'api/charge-table/get-list-material',
    },
    dl: {
        index: 1,
        id: 'dl-view',
        title: `${i18n.dlFee}`,
        templateUrl: `${SYSTEM_PATH}/assets/files/dl.xlsx`,
        columns: {
            en: [
                `No.`,
                `${i18n.station}`,
                `${i18n.perTime}`,
                `${i18n.laborShiftLine}`,
                `${i18n.line}`,
                `${i18n.ct}`,
                `${i18n.hour}`,
                `${i18n.price} (USD)`,
                `${i18n.totalLabor}`,
            ],
        },
        flag: 'dl',
        apiUpload: 'api/dl-cost/add-list',
        apiTable: 'api/charge-table/get-list-dl, api/charge-table/get-dl-cost',
    },
    idl: {
        index: 2,
        id: 'idl-view',
        title: `${i18n.idlFee}`,
        templateUrl: `${SYSTEM_PATH}/assets/files/idl.xlsx`,
        columns: {
            en: [
                `No.`,
                `${i18n.idlContent}`,
                `${i18n.day}`,
                `${i18n.idlQty}`,
                `${i18n.hour}`,
                `${i18n.price} (USD)`,
                `${i18n.total} (USD)`,
            ],
        },
        flag: 'idl',
        apiUpload: 'api/idl-cost/add-list',
        apiTable: 'api/charge-table/get-list-idl',
    },
    space: {
        index: 3,
        id: 'space-view',
        title: `${i18n.spaceFee}`,
        templateUrl: `${SYSTEM_PATH}/assets/files/space.xlsx`,
        columns: {
            en: [
                `No.`,
                `${i18n.spaceItem}`,
                `${i18n.reworkQty}`,
                `${i18n.palletQuantity}`,
                `${i18n.spaces}`,
                `${i18n.day}`,
                `${i18n.price} (USD)`,
                `${i18n.total} (USD)`,
                `${i18n.remark}`,
            ],
        },
        flag: 'space',
        apiUpload: 'api/space-cost/add-list',
        apiTable: 'api/charge-table/get-list-space',
    },
    'line-stop': {
        index: 4,
        id: 'line-stop-view',
        title: `${i18n.stoplineFee}`,
        templateUrl: `${SYSTEM_PATH}/assets/files/line-stop.xlsx`,
        columns: {
            en: [
                `No.`,
                `${i18n.stoplineDate}`,
                `${i18n.line}`,
                `${i18n.labor}`,
                `${i18n.description}`,
                `${i18n.price} (USD)`,
                `${i18n.hour}`,
                `${i18n.total} (USD)`,
                `${i18n.remark}`,
            ],
        },
        flag: 'line-stop',
        apiUpload: 'api/stop-line-cost/create',
        apiTable: 'api/charge-table/get-list-stop-line',
    },
    // other: {
    //     index: 5,
    //     id: 'other-view',
    //     title: `${i18n.otherFee}`,
    //     templateUrl: `${SYSTEM_PATH}/assets/files/other-cost.xlsx`,
    //     columns: {
    //         en: [`No.`, `${i18n.feeName}`, `${i18n.total} (USD)`, `${i18n.file}`, `${i18n.action}`],
    //     },
    //     flag: 'other',
    //     apiUpload: 'api/other-cost/create',
    //     apiTable: 'api/other-cost/get-list',
    // },
};

// Thoi dõi trạng thái: đánh dấu xem index nào đã được insert vào view rồi
let insertedIndex = [];
if (costType) {
    insertedIndex = Array(Object.keys(viewCheckBoxConfig).length).fill(false);
    if (costType !== 'rework') {
        insertedIndex.length = 0;
        for (const key in viewCheckBoxConfig) {
            if (key != 'material') {
                insertedIndex.push(false);
            }
        }
    }
}

// Cache dữ liệu khi load các bảng fee khi load trang
const feeTableCache = {};

/**
 * Gắn các event listener cần thiết cho form và các control trên UI.
 */
const loadEvent = () => {
    document.querySelector('select[name="product-name"]').addEventListener('change', function () {
        GLOBAL.projectId = parseInt(this.value);
        getModelName();
    });

    document.querySelectorAll('input[name="fee-type"]').forEach((cbo) => {
        cbo.addEventListener('change', toggleViewCheckbox);
    });

    document.querySelector('select[name="site"]').addEventListener('change', function () {
        GLOBAL.site = this.value;
        GLOBAL.siteId = parseInt(this.options[this.selectedIndex].dataset.id);
        getBu();
    });

    document.querySelector('select[name="bu"]').addEventListener('change', function () {
        GLOBAL.bu = this.value;
        GLOBAL.buId = parseInt(this.options[this.selectedIndex].dataset.id);
        getCft();
    });
};

/**
 * Hàm khởi tạo dữ liệu ban đầu cho ứng dụng.
 *
 * @property {int} chargeId - lấy các thông tin cơ bản của một đơn yêu cầu
 *
 * @returns {Promise<void>} Không trả về giá trị, chỉ cập nhật UI và dữ liệu.
 */
const loadData = async () => {
    loadDOM();

    if (costType) {
        renderPageName(costType);
        handeCostTypeUI(costType);
    }

    await getPayer();
    await getFeeType();
    await getProject();
    await getSite();

    if (chargeId) {
        await getCommonApplicationInfo();
    } else {
        // Hiển thị nút tạo đơn nháp đi
        const btnEle = DOM.btnDraft;
        btnEle && btnEle.classList.remove('d-none');
        fillUserInfo();
    }
};

/**
 * Khởi tạo và gán các phần tử DOM quan trọng vào object `DOM` toàn cục.
 *
 * @returns {void}
 */
const loadDOM = () => {
    DOM = {
        ...DOM,
        selectPayer: document.querySelector('select[name="payer"]'),
        selectCostType: document.querySelector('select[name="cost-type"]'),
        selectProduct: document.querySelector('select[name="product-name"]'),
        selectModel: document.querySelector('select[name="model-name"]'),
        selectSite: document.querySelector('select[name="site"]'),
        selectBu: document.querySelector('select[name="bu"]'),
        selectCft: document.querySelector('select[name="cft"]'),

        totalFee: document.querySelector('#total-fee'),
        productWrapper: document.querySelector('.product-name-wrapper'),
        modelWrapper: document.querySelector('.model-name-wrapper'),
        costWrapper: document.querySelector('.cost-name-wrapper'),
        viewCheckboxContainer: document.querySelector('#view-checkbox-container'),

        inputMaterial: document.querySelector('#material'),

        btnReturn: document.querySelector('.btn-return'),
        btnUpdate: document.querySelector('.btn-update'),
        btnSubmit: document.querySelector('.btn-submit'),
        btnView: document.querySelector('.btn-view'),
        btnDraft: document.querySelector('.btn-create-draft'),

        formMain: document.forms['form-main'],
        formFee: document.forms['form-fee'],
    };
};

/**
 * Lấy thông tin user từ API  điền tự động vào form
 */
const fillUserInfo = () => {
    const form = document.forms['form-main'];
    form['id-card'].value = USER.idCard || '';
    form['full-name'].value = USER.userName || '';
    form['applicant-email'].value = USER.mail || '';
    form['applicant-phone-number'].value = USER.phone || '';
};

/**
 * Hiển thị tiêu đề trang động với từng loại chi phí
 */
const renderPageName = (type) => {
    if (type) {
        const map = {
            rework: `${i18n.rework}/${i18n.lineStop}/${i18n.sorting}`,
            'stop line': i18n.lineStop,
            freight: i18n.freight,
            'support system': i18n.supportSystem,
            sorting: i18n.sorting,
        };
        const text = map[type] || '';
        document.querySelector('#page-name-type').innerHTML = text ? `<span class="text-lowercase">${text}</span>` : '';
    }
};

const handeCostTypeUI = (type) => {
    if (type === 'support system') {
        const productWrapper = DOM.productWrapper;
        const modelWrapper = DOM.modelWrapper;
        const costNameWrapperEle = DOM.costWrapper;
        const formFee = DOM.formFee;

        productWrapper.classList.add('d-none');
        modelWrapper.classList.add('d-none');
        costNameWrapperEle.className = costNameWrapperEle.className.replace(/col-md-8/g, 'col-md-4');
        formFee['product-name'].required = false;
        formFee['model-name'].required = false;
    }
};

/**
 * Lấy danh sách loại hình trả phí
 * @async
 * @returns {Promise<void>}
 */
const getPayer = async () => {
    const select = DOM.selectPayer;
    try {
        loader.load();
        const result = await fetchPayer();
        const data = result.data || [];

        let options = `<option value="" selected disabled>${i18n.selectItem}</option>`;
        data.forEach((item) => {
            options += `<option value="${item.name}" data-id="${item.id}">${item.name}</option>`;
        });

        select.innerHTML = options;
    } catch (error) {
        console.error(error.message);
    } finally {
        loader.unload();
    }
};

/**
 * Lấy danh sách loại chi phí
 * @async
 * @returns {Promise<void>}
 */
const getFeeType = async () => {
    const select = DOM.selectCostType;
    try {
        loader.load();
        const result = await fetchFeeType();
        const data = result.data || [];

        let options = `<option value="" selected disabled>${i18n.selectItem}</option>`;
        data.forEach((item) => {
            const name = item.name.toLowerCase().trim();
            options += `<option value="${name}" data-id="${item.id}">${item.name}</option>`;
        });

        select.innerHTML = options;
        if (costType) {
            select.value = costType;
        }
    } catch (error) {
        console.error(error.message);
    } finally {
        loader.unload();
    }
};

/**
 * Lấy danh sách khách hàng
 * @async
 * @returns {Promise<void>}
 */
const getProject = async () => {
    const select = DOM.selectProduct;
    try {
        loader.load();

        const result = await fetchProject();
        const data = result.data || [];

        let options = `<option value="" selected disabled>${i18n.selectItem}</option>`;
        data.forEach((item) => {
            options += `<option value="${item.id}">${item.name}</option>`;
        });

        select.innerHTML = options;
    } catch (error) {
        console.error(error.message);
    } finally {
        loader.unload();
    }
};

/**
 * Lấy danh sách hàng
 * @async
 * @returns {Promise<void>}
 */
const getModelName = async () => {
    const select = DOM.selectModel;
    try {
        loader.load();
        const result = await fetchModel({ projectId: GLOBAL.projectId });
        const data = result.data || [];

        let options = `<option value="" selected disabled>${i18n.selectItem}</option>`;
        data.forEach((item) => {
            options += `<option value="${item.id}">${item.name}</option>`;
        });

        select.innerHTML = options;
        if (GLOBAL.modelId) {
            select.value = GLOBAL.modelId;
        }
    } catch (error) {
        console.error(error.message);
    } finally {
        loader.unload();
    }
};

/**
 * Lấy danh sách site
 * @async
 * @returns {Promise<void>}
 */
const getSite = async () => {
    const select = DOM.selectSite;
    try {
        loader.load();
        const result = await fetchSite();
        const data = result.data || [];

        let options = `<option value="" selected disabled>${i18n.selectItem}</option>`;
        data.forEach((item) => {
            options += `<option value="${item.name}" data-id="${item.id}">${item.name}</option>`;
        });

        select.innerHTML = options;
        if (GLOBAL.site) {
            select.value = GLOBAL.site;
        }
    } catch (error) {
        console.error(error.message);
    } finally {
        loader.unload();
        GLOBAL.site = select.value;
        GLOBAL.siteId = parseInt(select.options[select.selectedIndex].dataset.id) || '';
    }
};

/**
 * Lấy danh sách BU
 * @async
 * @returns {Promise<void>}
 */
const getBu = async () => {
    const select = DOM.selectBu;
    try {
        loader.load();
        const result = await fetchBu({ siteId: GLOBAL.siteId });
        const data = result.data || [];

        let options = `<option value="" selected disabled>${i18n.selectItem}</option>`;
        data.forEach((item) => {
            options += `<option value="${item.name}" data-id="${item.id}">${item.name}</option>`;
        });

        select.innerHTML = options;
        if (GLOBAL.bu) {
            select.value = GLOBAL.bu;
            select.dispatchEvent(new Event('change'), { bubbles: true });
        }
    } catch (error) {
        console.error(error.message);
    } finally {
        loader.unload();
        GLOBAL.bu = select.value;
        GLOBAL.buId = parseInt(select.options[select.selectedIndex].dataset.id) || '';
    }
};

/**
 * Lấy danh sách BU
 * @async
 * @returns {Promise<void>}
 */
const getCft = async () => {
    const select = DOM.selectCft;
    try {
        loader.load();
        const result = await fetchCft({ buId: GLOBAL.buId });
        const data = result.data || [];

        let options = `<option value="" selected disabled>${i18n.selectItem}</option>`;
        data.forEach((item) => {
            options += `<option value="${item.name}" data-id="${item.id}">${item.name}</option>`;
        });

        select.innerHTML = options;
        if (GLOBAL.cft) {
            select.value = GLOBAL.cft;
        }
    } catch (error) {
        console.error(error.message);
    } finally {
        loader.unload();
        GLOBAL.cft = select.value;
    }
};

const toggleViewCheckbox = (e) => {
    const target = e.currentTarget;
    const isChecked = target.checked;
    const checkboxId = target.id;
    const config = viewCheckBoxConfig[checkboxId];
    const viewBox = document.querySelector(`#${checkboxId}-view`);

    if (isChecked) {
        createView(config);
        insertedIndex[config.index] = true;
    } else {
        viewBox?.remove();
        insertedIndex[config.index] = false;
    }
};

// Render template
const buildTemplate = {
    normal: (config) => {
        const { index, id, title, templateUrl, columns, apiUpload, apiTable, flag } = config;
        const ths = (columns?.en || []).map((th) => `<th>${th}</th>`).join('');
        const tbody = feeTableCache[flag] || '';

        return `
            <div class="fee-section view-box" id="${id}" data-index="${index}">
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <div class="fw-semibold">${title}</div>
                    <div class="upload-wrapper">
                        <form id="form-${flag}" name="form-${flag}" class="needs-validation d-flex align-items-center" novalidate autocomplete="off" spellcheck="false" onsubmit="submitFeeForm(event, '${apiUpload}', '${apiTable}', '${id}', '${flag}')">
                            <a href="${templateUrl}" download class="me-2 small">${i18n.downloadSample}</a>
                            <input
                                type="file"
                                class="form-control form-control-sm d-inline-block"
                                style="width: 250px"
                                accept=".csv,.xlsx,.xlsm,.xls"
                                required
                            />
                            <button type="submit" class="btn btn-sm btn-primary ms-2 save-fee-btn"><i class="bi bi-save"></i> ${
                                i18n.save
                            }</button>
                        </form>
                    </div>
                </div>
                <div class="table-responsive">
                    <table class="table table-sm table-bordered mb-2" id="tbl-${flag}">
                        <thead class="table-light">${ths}</thead>
                        <tbody>${tbody}</tbody>
                    </table>
                    <div class="table-placeholder tbl-${flag}-placeholder ${tbody.length > 0 && 'd-none'}">
                        No data available. Please select a file and click "Save" to view
                    </div>
                </div>
            </div>
        `;
    },

    other: (config) => {
        const { index, id, title, templateUrl, columns, apiUpload, apiTable, flag } = config;
        const ths = (columns?.en || []).map((th) => `<th>${th}</th>`).join('');
        const tbody = feeTableCache[flag] || '';

        return `
            <div class="fee-section view-box" id="${id}" data-index="${index}">
                <div class="fw-semibold pb-2">${title}</div>
                <form id="form-${flag}" name="form-${flag}" class="needs-validation" novalidate autocomplete="off" spellcheck="false" onsubmit="submitFeeForm(event, '${apiUpload}', '${apiTable}', '${id}', '${flag}')">
                    <div class="row mb-3 upload-wrapper">
                        <div class="col-md-3">
                            <label class="form-label" for="fee-other">
                                ${i18n.feeName} <span class="required">*</span>
                            </label>
                            <input type="text" id="fee-other" name="fee-other" class="form-control form-control-sm" placeholder="Tên phí" required />
                        </div>
                        <div class="col-md-3">
                            <label class="form-label" for="file-fee-other">
                                ${i18n.file} <span class="required">*</span>
                                <a href="${templateUrl}" download class="small">${i18n.downloadSample}</a>
                            </label>
                            <input type="file" id="file-fee-other" name="file-fee-other" class="form-control form-control-sm" required />
                        </div>
                        <div class="col-md-3 d-flex align-items-end">
                            <button type="submit" class="btn btn-sm btn-primary"><i class="bi bi-save"></i> ${
                                i18n.save
                            }</button>
                        </div>
                    </div>
                    <div class="table-responsive">
                        <table class="table table-sm table-bordered mb-2" id="tbl-${flag}">
                            <thead class="table-light">${ths}</thead>
                            <tbody>${tbody}</tbody>
                        </table>
                        <div class="table-placeholder tbl-${flag}-placeholder ${tbody.length > 0 && 'd-none'}">
                            No data available. Please select a file and click "Save" to view
                        </div>
                    </div>
                </form>
            </div>
        `;
    },
};

// Insert template vào vị trí tương ứng trên DOM
const insertTemplate = (config, template) => {
    const { index, id, flag } = config;
    const tbody = feeTableCache[flag] || '';

    const viewCheckboxContainer = DOM.viewCheckboxContainer;
    const viewBoxEle = document.querySelector(`#${id}`);

    if (viewCheckboxContainer.childElementCount === 0) {
        viewCheckboxContainer.innerHTML = '';
        viewCheckboxContainer?.insertAdjacentHTML('afterbegin', template);
        return;
    }

    const firstIndexInserted = insertedIndex.indexOf(true);
    const lastIndexInserted = insertedIndex.lastIndexOf(true);

    if (index < firstIndexInserted) {
        // Chèn trước phần tử đầu tiên
        document
            .querySelector(`.view-box[data-index="${firstIndexInserted}"]`)
            ?.insertAdjacentHTML('beforebegin', template);
    } else if (index > lastIndexInserted) {
        // Chèn sau phần tử cuối cùng
        document
            .querySelector(`.view-box[data-index="${lastIndexInserted}"]`)
            ?.insertAdjacentHTML('afterend', template);
    } else {
        // Chèn vào giữa
        let nearestInsertedIndex = null;
        for (let j = index - 1; j >= firstIndexInserted; j--) {
            if (insertedIndex[j] === true) {
                nearestInsertedIndex = j;
                break;
            }
        }

        if (nearestInsertedIndex !== null) {
            document
                .querySelector(`.view-box[data-index="${nearestInsertedIndex}"]`)
                ?.insertAdjacentHTML('afterend', template);
        }
    }

    if (id.includes('other')) {
        if (tbody.length <= 0) {
            insertedIndex[config.index] = false;
        }

        viewBoxEle?.remove();
    }
};

// Tạo từng bảng chi phí
const createView = (config) => {
    const template = config.id.includes('other') ? buildTemplate.other(config) : buildTemplate.normal(config);
    insertTemplate(config, template);
};

/**
 * Lấy tổng chi phí từ API theo `chargeId` hiện tại và hiển thị lên UI.
 *
 * @returns {Promise<void>} Không trả về, chỉ cập nhật UI.
 *
 * @throws {Error} Nếu API `fetchTotalFee` gặp lỗi, lỗi sẽ được log ra console.
 */
const getTotalFee = async () => {
    try {
        loader.load();
        const result = await fetchTotalFee({ chargeTrackingId: chargeId });
        const data = result?.result;

        if (data) {
            DOM.totalFee.textContent = new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
            }).format(data);
        }
    } catch (error) {
        console.error(error.message);
    } finally {
        loader.unload();
        getFeeTotalInfo();
    }
};

/**
 * Lấy thông tin chung của application (hồ sơ/đơn chi phí) từ API,
 * sau đó cập nhật toàn bộ state của UI và biến toàn cục.
 *
 * Flow:
 * 1. Tạo params dựa trên `chargeId` và `submitNo`.
 * 2. Gọi API `fetchCommonAppInfo`.
 * 3. Nếu có dữ liệu:
 *    - Gọi `updateGlobals(data)` để cập nhật biến GLOBAL.
 *    - Gọi `fillForms(data)` để điền form chính và form phí.
 *    - Gọi `handleCheckboxConfig(costType)` để cấu hình checkbox theo cost type.
 *    - Gọi `renderPageName(costType)` để hiển thị tên trang.
 *    - Gọi `handeCostTypeUI(costType)` để render UI cho cost type.
 * 4. Trong khối `finally`:
 *    - Gọi `handleSubmitStatus(submitStatus, GLOBAL.submitId)`.
 *    - Gọi `handleCostTypeFlowUI(costType)` (chạy các bước async tuỳ cost type).
 *    - Gọi `getTotalFee()` để tính tổng phí.
 *
 * @returns {Promise<void>} Không trả về, chỉ cập nhật UI và biến toàn cục.
 *
 * @throws {Error} Nếu API `fetchCommonAppInfo` bị lỗi, sẽ log ra console.error.
 */
const getCommonApplicationInfo = async () => {
    const params = {};
    if (chargeId) params.chargeTrackingId = chargeId;
    if (submitNo && submitNo != 'null' && submitNo != 'undefined') {
        params.submitNo = submitNo;
    }

    try {
        loader.load();
        const result = await fetchCommonAppInfo(params);
        const data = result.result || {};

        if (Object.keys(data).length <= 0) return;

        updateGlobals(data);
        fillForms(data);
        handleCheckboxConfig(costType);
        renderPageName(costType);
        handeCostTypeUI(costType);
    } catch (error) {
        console.error(error.message);
    } finally {
        loader.unload();
        handleSubmitStatus(submitStatus);
        await handleCostTypeFlowUI(costType);
        getTotalFee();
        handleUIByPermission();
    }
};

/**
 * Cập nhật các biến toàn cục từ dữ liệu API trả về.
 *
 * - `chargeId`, `costType`, `submitStatus` sẽ được lưu ra biến global trong scope hiện tại.
 * - Các trường `submitId`, `projectId`, `modelId`, `site`, `bu`, `cft` sẽ được gán vào object `global`.
 *
 * @param {object} data - Dữ liệu đầu vào từ API.
 * @returns {void} Hàm không trả về giá trị, chỉ gán vào biến toàn cục.
 */
const updateGlobals = (data) => {
    chargeId = parseInt(data.chargeTrackingId);
    costType = standardizeCostType(data.type);
    submitStatus = data.status;

    GLOBAL.applicant = data.cardId;
    GLOBAL.submitId = data.submitId;
    GLOBAL.projectId = data.productId;
    GLOBAL.modelId = data.modelId;
    GLOBAL.site = data.site;
    GLOBAL.bu = data.bu;
    GLOBAL.cft = data.cft;
};

/**
 * Điền dữ liệu vào các form chính (`form-main`) và form phí (`form-fee`)
 * dựa trên dữ liệu từ API trả về.
 *
 * - `form-main` sẽ được gán các thông tin cá nhân của người nộp.
 * - `form-fee` sẽ được gán các thông tin liên quan đến phí, dự án, site, loại chi phí, ...
 * - Nếu có `productId` hoặc `site`, hàm sẽ phát sự kiện `change` để
 *   trigger các xử lý liên quan trong hệ thống (như load model hoặc site info).
 *
 * @param {Object} data - Dữ liệu đầu vào từ API.

 * @returns {void}
 */
const fillForms = (data) => {
    const formMain = document.forms['form-main'];
    const formFee = document.forms['form-fee'];
    const totalEle = document.querySelector('.total');
    const chargeFile = document.querySelector('#charge-file');

    formMain['id-card'].value = data.cardId || '';
    formMain['full-name'].value = data.fullName || '';
    formMain['applicant-email'].value = data.email || '';
    formMain['applicant-phone-number'].value = data.phone || '';

    formFee['site'].value = data.site || '';
    formFee['product-name'].value = data.productId;
    formFee['cost-name'].value = data.cost_name || '';
    formFee['occurrence-date'].value = moment(new Date(data.costDate)).format('YYYY-MM-DDTHH:mm:ss');
    formFee['payer'].value = data.payer || '';
    formFee['cost-type'].value = standardizeCostType(data.type) || '';
    formFee['remark'].value = data.remark;

    if (data.chargeFile) {
        chargeFile.href = data.chargeFile;
        chargeFile.classList.remove('d-none');
    }

    totalEle && totalEle.classList.remove('d-none');

    if (data.productId) {
        formFee['product-name'].dispatchEvent(new Event('change'), { bubbles: true });
    }
    if (data.site) {
        formFee['site'].dispatchEvent(new Event('change'), { bubbles: true });
    }
};

/**
 * Cập nhật cấu hình checkbox dựa trên loại chi phí (costType).
 *
 * @param {string} costType - Loại chi phí.
 *
 * @returns {void}
 */
const handleCheckboxConfig = (costType) => {
    // Xóa cấu hình của `Material` ra khỏi `viewCheckboxConfig` và loại bỏ khỏi DOM.
    if (costType !== 'rework') {
        DOM.inputMaterial.closest('.form-check').remove();
        delete viewCheckBoxConfig['material'];
    }
    // Reset lại chỉ số (index) cho từng checkbox trong `viewCheckboxConfig`.
    let count = 0;
    for (const k in viewCheckBoxConfig) {
        viewCheckBoxConfig[k].index = count;
        count++;
    }
    // Khởi tạo lại `insertedIndex` tương ứng với số lượng checkbox.
    insertedIndex = Array(Object.keys(viewCheckBoxConfig).length).fill(false);
};

/**
 * Xử lý hiển thị và trạng thái của các hành động dựa trên trạng thái của đơn.
 *
 * @param {string} status - Trạng thái hiện tại của đơn.
 * @param {id} submitId - ID của đơn submit, dùng để gắn vào link "View".
 *
 * @returns {void}
 */
const handleSubmitStatus = (status) => {
    // if (role !== 'IE') return;
    const btnUpdate = DOM.btnUpdate;
    const btnSubmit = DOM.btnSubmit;
    const btnView = DOM.btnView;
    const btnReturn = DOM.btnReturn;
    const btnDraft = DOM.btnDraft;
    const selectPayer = DOM.selectPayer;

    switch (status) {
        case 'RETURNED':
            btnUpdate.classList.remove('d-none');
            break;
        case 'IE_RETURNED':
            if (GLOBAL.applicant === currentEmpNo) {
                btnDraft.classList.remove('d-none');
            }

            document.querySelector('.support-system');
            document.querySelector('.fees-type').remove();
            document.querySelector('.total').remove();
            document.querySelector('.freight').remove();
            document.querySelector('#status-note').innerHTML =
                '<span class="text-warning fw-normal">Đơn đã bị trả về từ bộ phận IE</span>';

            if (role == 'IE' && costType == 'support system') {
                document.querySelector('.support-system')?.remove();
            }

            break;
        case 'DRAFT':
            if (role === 'IE') {
                btnSubmit.classList.remove('d-none');
                btnReturn.classList.remove('d-none');
                selectPayer.removeAttribute('disabled');

                document.forms['form-fee'].querySelectorAll('*:not(#remark)').forEach((ele) => (ele.disabled = true));
            } else {
                if (GLOBAL.applicant !== currentEmpNo && costType == 'freight') {
                    document.forms['form-freight']
                        .querySelectorAll('input, select, textarea')
                        .forEach((ele) => (ele.disabled = true));
                    document.querySelector('.btn-save-freight').remove();
                } else if (GLOBAL.applicant !== currentEmpNo && costType == 'support system') {
                    document.forms['form-support'].remove();
                    document.querySelector('.btn-save-freight').remove();
                }
            }
            break;
        case 'WAITING':
        case 'CANCELED':
        case 'REJECTED':
        case 'FINISH':
            btnView.href = `https://fiisw-cns.myfiinet.com/fii-esign-system/detail/don_xin_xac_nhan_bang_tinh_phi_IE?submitId=${GLOBAL.submitId}`;
            btnView.classList.remove('d-none');
            break;
    }

    handeRemarkUIByStatus(status);
};

/**
 * Handle remark by application status
 */
const handeRemarkUIByStatus = (status) => {
    const remarkWrapper = document.querySelector('.remark-wrapper');
    if (['DRAFT', 'IE_RETURNED'].includes(status)) {
        remarkWrapper.classList.remove('d-none');
    }
};

/**
 * Hiển thị giao diện (UI) và xử lý logic bổ dựa trên loại chi phí.
 *
 * @param {string} costType - Loại chi phí.
 *
 * @returns {Promise<void>}
 *
 * @throws {Error} Nếu `costType` không khớp với bất kỳ case nào trong switch.
 */
const handleCostTypeFlowUI = async (costType) => {
    switch (costType) {
        case 'rework':
            document.querySelectorAll('.rework').forEach((ele) => {
                ele.classList.remove('d-none');
            });
            break;
        case 'stop line':
        case 'sorting':
            document.querySelectorAll('.line-stop').forEach((ele) => {
                ele.classList.remove('d-none');
            });
            break;
        case 'freight':
            document.querySelectorAll('.freight').forEach((ele) => {
                ele.classList.remove('d-none');
            });
            getFreightInfo();
            break;
        case 'support system':
            document.querySelectorAll('.support-system').forEach((ele) => {
                ele.classList.remove('d-none');
            });
            getSupportSystemInfo();
            break;
        default:
            throw new Error('Cost type is not mactch');
    }

    if (['rework', 'stop line', 'sorting'].includes(costType)) {
        await processFeeTablesSequentially();
    }
};

/**
 * Xử lý tuần tự các bảng (fee tables) dựa trên cấu hình `viewCheckboxConfig`.
 *
 * - Nếu `cboKey` không được truyền, hàm sẽ duyệt tất cả key trong `viewCheckBoxConfig`.
 * - Nếu `cboKey` được truyền, chỉ xử lý bảng phí ứng với key đó.
 * - Gọi API `getFeeTable` để lấy dữ liệu bảng phí.
 * - Nếu có dữ liệu, cache tbody vào `feeTableCache`, đánh dấu checkbox tương ứng,
 *   và gắn attribute `data-defer-trigger="true"`.
 * - Sau khi xử lý xong, gọi `triggerDeferredCheckboxes` để kích hoạt event `change`
 *   cho các checkbox đã đánh dấu.
 *
 * @async
 * @param {string|null} [cboKey=null] - Tên key trong `viewCheckboxConfig` để xử lý, nếu `null` xử lý tất cả.
 *
 * @returns {Promise<void>}
 */
const processFeeTablesSequentially = async (cboKey = null) => {
    let listKey = [];
    if (!cboKey) {
        listKey = Object.keys(viewCheckBoxConfig);
    } else {
        listKey.push(cboKey);
    }

    for (const key of listKey) {
        const { apiTable, flag } = viewCheckBoxConfig[key];
        const { hasData, rows } = await getFeeTable({ apiTable, flag });

        if (hasData) {
            // Lưu tạm tbody vào cache
            feeTableCache[key] = rows;

            // Đánh dấu checkbox
            const checkbox = document.querySelector(`#${flag}`);
            checkbox.checked = true;
            checkbox.dataset.deferTrigger = 'true';
        }
    }
    triggerDeferredCheckboxes(cboKey);
};

/**
 * Kích hoạt các checkbox đã được đánh dấu bằng attribute `data-defer-trigger`.
 *
 * - Nếu `cboKey` không được truyền, tìm tất cả checkbox có `data-defer-trigger="true"`.
 * - Nếu `cboKey` được truyền, chỉ tìm checkbox theo `id` khớp với `cboKey`.
 * - Sau đó xóa attribute `data-defer-trigger` và phát event `change` để dựng lại view,
 *   sử dụng dữ liệu đã cache trong `feeTableCache`.
 *
 * @async
 * @param {string|null} [cboKey=null] - ID của checkbox cần kích hoạt. Nếu `null`, kích hoạt tất cả checkbox được đánh dấu.
 *
 * @returns {Promise<void>} - Hàm bất đồng bộ, không trả về giá trị.
 */
const triggerDeferredCheckboxes = async (cboKey = null) => {
    let checkboxes;
    if (!cboKey) {
        checkboxes = document.querySelectorAll('input[type="checkbox"][data-defer-trigger="true"]');
    } else {
        checkboxes = [...document.querySelectorAll(`input[type="checkbox"][id="${cboKey}"]`)];
    }

    for (const checkbox of checkboxes) {
        checkbox?.removeAttribute('data-defer-trigger');

        // Gọi toggle để dựng view (bây giờ đã có tbody trong feeTableCache)
        checkbox?.dispatchEvent(new Event('change'));
    }
};

// Submit file mẫu ở mỗi loại phí và hiển thị lên giao diện: 5 loại phí (Material, DL, IDL, Không gian, Dừng chuyền, Khác)
const submitFeeForm = async (e, apiUpload, apiTable, id, flag) => {
    e.preventDefault();
    e.stopPropagation();

    if (['WAITING', 'FINISH', 'CANCELED'].includes(submitStatus)) {
        alert('The application is currently in a non-editable state. Please try again later.');
        return;
    }

    if (!e.target.checkValidity()) {
        e.target.classList.add('was-validated');
        return;
    }

    const files = document.querySelector(`#${id} input[type="file"]`)?.files;

    try {
        loader.load();

        const flagConfig = {
            material: { chargeKey: 'chargeId', fileKey: 'materialFile' },
            dl: { chargeKey: 'chargeTrackingId', fileKey: 'dlFile' },
            idl: { chargeKey: 'chargeTrackingId', fileKey: 'idlFile' },
            'line-stop': { chargeKey: 'costApplyId', fileKey: 'stopLineFile' },
            space: { chargeKey: 'chargeTrackingId', fileKey: 'spaceCostFile' },
            other: { chargeKey: 'costApplyId', fileKey: 'otherCostFile' },
        };

        const config = flagConfig[flag];
        if (!config) throw new Error(`Unsupported flag: ${flag}`);

        const form = new FormData();
        form.append(config.chargeKey, chargeId);
        form.append(config.fileKey, files[0]);

        if (flag === 'other') {
            form.append('costName', document.querySelector('#fee-other').value.trim());
        }

        const response = await fetch(`/ie-system/${apiUpload}`, {
            method: 'POST',
            body: form,
        });
        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message);
        }

        if (result.code == 'SUCCESS') {
            e.target.reset();
            e.target.classList.remove('was-validated');

            getTotalFee();
            getFeeTable({ apiTable, flag, action: 'upload' });
        } else {
            alert(result.message);
        }
    } catch (error) {
        console.log(error.message);
        alert(error.message);
    } finally {
        loader.unload();
    }
};

// Map render các loại bảng
const renderFeeTables = {
    dl: (data, extra) => {
        let html = data
            .map((item, index) => {
                const perTime = item.perTime ? item.perTime.toFixed(2) : '';
                const ct = item.perTime ? item.ct.toFixed(2) : '';
                return `
                    <tr>
                        <td>${index + 1}</td>
                        <td class="text-start">${item.station || ''}</td>
                        <td>${perTime}</td>
                        <td>${item.laborsShiftLine || ''}</td>
                        <td>${item.lines || ''}</td>
                        <td>${ct}</td>
                        <td>${item.workHours || ''}</td>
                        <td>${item.price || ''}</td>
                        <td>${item.totalLabor || ''}</td>
                    </tr>
                `;
            })
            .join('');

        if (extra) {
            html += `
                <tr>
                    <td colspan="8" class="text-end pe-4">Total</td>
                    <td colspan="1" class="fm-medium" style="background-color: rgb(255 255 0)">${
                        extra.laborTotal || ''
                    }</td>
                </tr>
                    <tr>
                    <td colspan="8" class="text-end pe-4">DL cost (USD)</td>
                    <td colspan="1" class="fm-medium" style="background-color: rgb(255 255 0)">${
                        extra.dlCost || ''
                    }</td>
                </tr>
                    <tr>
                    <td colspan="8" class="text-end pe-4">${extra.outputType}</td>
                    <td colspan="1" class="fm-medium" style="background-color: rgb(255 255 0)">${
                        extra.output || ''
                    }</td>
                </tr>
                <tr>
                    <td colspan="8" class="text-end pe-4">WIP Quantity (pcs)</td>
                    <td colspan="1" class="fm-medium" style="background-color: rgb(255 255 0)">${
                        extra.wipQty || ''
                    }</td>
                </tr>
                <tr>
                    <td colspan="8" class="text-end pe-4">Rate</td>
                    <td colspan="1" class="fm-medium" style="background-color: rgb(255 255 0)">${extra.rate || ''}</td>
                </tr>
                <tr>
                    <td colspan="8" class="text-end pe-4">Time (${extra.unit})</td>
                    <td colspan="1" class="fm-medium" style="background-color: rgb(255 255 0)">${extra.time || ''}</td>
                </tr>
                <tr>
                    <td colspan="8" class="text-end pe-4">Labor cost (USD)</td>
                    <td colspan="1" class="fm-medium" style="background-color: rgb(255 255 0)">${
                        extra.laborCost || ''
                    }</td>
                </tr>
            `;
        }
        return html;
    },
    material: (data) =>
        data
            .map(
                (item, index) =>
                    `
                        <tr>
                            <td>${index + 1}</td>
                            <td>${item.materialModal || ''}</td>
                            <td>${item.materialName || ''}</td>
                            <td>${item.materialCode || ''}</td>
                            <td>${item.reworkQty || ''}</td>
                            <td>${item.usageAmount || ''}</td>
                            <td>${item.unit || ''}</td>
                            <td>${item.scrapQty || ''}</td>
                            <td>${item.price || ''}</td>
                            <td>${item.total || ''}</td>
                            <td>${item.remark || ''}</td>
                            <td>${item.description || ''}</td>
                        </tr>
                    `
            )
            .join(''),
    idl: (data) =>
        data
            .map(
                (item, index) =>
                    `
                        <tr>
                            <td>${index + 1}</td>
                            <td class="text-start">${item.laborOfContent || ''}</td>
                            <td>${item.workDay || ''}</td>
                            <td>${item.laborQty || ''}</td>
                            <td>${item.workHours || ''}</td>
                            <td>${item.price}</td>
                            <td>${item.total || ''}</td>
                        </tr>
                    `
            )
            .join(''),
    space: (data) =>
        data
            .map(
                (item, index) =>
                    `
                        <tr>
                            <td>${index + 1}</td>
                            <td class="text-start">${item.spaceItem || ''}</td>
                            <td>${item.reworkQty || ''}</td>
                            <td>${item.palletQty || ''}</td>
                            <td>${item.spaceQty || ''}</td>
                            <td>${item.usageDays}</td>
                            <td>${item.price || ''}</td>
                            <td>${item.totalCost || ''}</td>
                            <td>${item.remark || ''}</td>
                        </tr>
                    `
            )
            .join(''),
    'line-stop': (data) =>
        data
            .map(
                (item, index) =>
                    `
                    <tr>
                        <td>${index + 1}</td>
                        <td>${item.stopLineDate || ''}</td>
                        <td>${item.lines || ''}</td>
                        <td>${item.laborShiftLine || ''}</td>
                        <td>${item.description || ''}</td>
                        <td>${item.price}</td>
                        <td>${item.workHours || ''}</td>
                        <td>${item.total || ''}</td>
                        <td>${item.remark || ''}</td>
                    </tr>
                `
            )
            .join(''),
    other: (data) =>
        data
            .map(
                (item, index) => `
                    <tr>
                        <td>${index + 1}</td>
                        <td>${item.otherFee || ''}</td>
                        <td>${item.total || ''}</td>
                        <td>
                            <a href="${item.otherFile}" target="_blank" class="text-decoration-none">
                                <i class="bi bi-cloud-arrow-down"></i> <span>${i18n.details}</span>
                            </a>
                        </td>
                        <td style="width:10%">
                            <i class="bi bi-trash3-fill text-danger" onclick="postOtherFeeDelete(${item.id})"></i>
                        </td>
                    </tr>
                `
            )
            .join(''),
};

/**
 * Fetch fee table data from one or more APIs and render/update HTML tables.
 *
 * @async
 * @function getFeeTable
 * @param {Object} params - Function parameters.
 * @param {string} params.apiTable - Comma-separated API endpoints to fetch.
 * @param {string} params.flag - A key used to select the corresponding table renderer and DOM elements.
 * @param {string|null} [params.action=null] - Action type. If `"upload"`, update the DOM directly; otherwise return the data.
 *
 * @returns {Promise<{hasData: boolean, rows: string}>}
 */
const getFeeTable = async ({ apiTable, flag, action = null }) => {
    const urls = apiTable.split(',').map((u) => u.trim());

    // Fetch tất cả API song song
    const responses = await Promise.all(urls.map((url) => fetch(`/ie-system/${url}?chargeTrackingId=${chargeId}`)));

    const results = await Promise.all(responses.map((r) => r.json()));

    // Kiểm tra lỗi API
    responses.forEach((res, i) => {
        if (!res.ok) throw new Error(results[i].message || 'Get fee table failed');
    });

    const data = results[0]?.data || [];
    const extra = results[1]?.result || null;

    try {
        loader.load();

        let html = '';
        if (data && data.length > 0) {
            const render = renderFeeTables[flag];
            html = render ? render(data, extra) : '';
        }

        if (!html) {
            html = `<tr><td colspan="50">No data to display</td></tr>`;
        }

        if (action == 'upload') {
            alert(results[0]?.message);
            document.querySelector(`#tbl-${flag} tbody`).innerHTML = html;
            document.querySelector(`.tbl-${flag}-placeholder`).classList.add('d-none');
        } else {
            return {
                hasData: !!data.length,
                rows: html,
            };
        }
    } catch (error) {
        console.error(error);
    } finally {
        loader.unload();
    }

    if (action == null) {
        return {
            hasData: false,
            rows: '',
        };
    }
};

// Xóa phí khác
const postOtherFeeDelete = async (id) => {
    if (['WAITING', 'FINISH', 'CANCELED'].includes(submitStatus)) {
        alert('The application is currently in a non-editable state. Please try again later.');
        return;
    }

    const confirm = window.confirm('Do you delete this fee?');
    if (!confirm) return;

    try {
        loader.load();
        const result = await postOtherFeeDel({ otherId: id });

        if (result.code == 'SUCCESS') {
            alert(result.message);
        } else {
            alert(result.message);
        }
    } catch (error) {
        alert(error.message);
    } finally {
        loader.unload();
        await processFeeTablesSequentially('other');
        getTotalFee();
    }
};

/*
    Freight
*/
// Lấy thông tin freight
const getFreightInfo = async () => {
    const form = document.forms['form-freight'];
    try {
        loader.load();
        const result = await fetchFreightInfo({ chargeTrackingId: chargeId });
        const data = result.result || {};

        if (data && Object.keys(data).length > 0) {
            let attachedFileName = '';
            if (data.freightUrl) {
                attachedFileName = data.freightUrl.split('/').at(-1);
            }

            form['freight-logistic-no'].value = data.logisticNo || '';
            form['freight-expense-code'].value = data.expenseCode || '';
            form['freight-total'].value = data.total || '';
            form['freight-init-bu'].value = data.initialBu || '';
            form['freight-desc'].value = data.description || '';
            form['freight-cost-bu'].value = data.costBu || '';
            form['freight-cost-owner'].value = data.costOwner || '';
            form['freight-owner'].value = data.initialOwner || '';

            document.querySelector('[name="attached-file-link"]').href = data.freightUrl || '';
            document.querySelector('[name="attached-file-link"]').textContent = attachedFileName || '';
        }
    } catch (error) {
        console.error(error.message);
    } finally {
        loader.unload();
    }
};

// Lưu thông tin freight
const postSaveFreightInfo = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (['WAITING', 'FINISH', 'CANCELED'].includes(submitStatus)) {
        alert('The application is currently in a non-editable state. Please try again later.');
        return;
    }

    if (!e.target.checkValidity()) {
        e.target.classList.add('was-validated');
        return;
    }

    const form = document.forms['form-freight'];
    const logisticNo = form['freight-logistic-no'].value;
    const expenseCode = form['freight-expense-code'].value;
    const total = form['freight-total'].value;
    const initBu = form['freight-init-bu'].value;
    const description = form['freight-desc'].value;
    const costBu = form['freight-cost-bu'].value;
    const costOwner = form['freight-cost-owner'].value;
    const owner = form['freight-owner'].value;
    const attachedFile = form['freight-attached-file'].files;

    try {
        loader.load();

        const formData = new FormData();
        formData.append('description', description);
        formData.append('logisticNo', logisticNo);
        formData.append('expenseCode', expenseCode);
        formData.append('total', total);
        formData.append('initialBu', initBu);
        formData.append('initialOwner', owner);
        formData.append('costBu', costBu);
        formData.append('costOwner', costOwner);
        formData.append('costApplyId', chargeId);
        formData.append('freightFile', attachedFile[0]);

        const result = await postFreightInfoSave(formData);

        if (result.code == 'SUCCESS') {
            e.target.classList.remove('was-validated');
            alert(result.message);
        } else {
            alert(result.message);
        }
    } catch (error) {
        alert(error.message);
    } finally {
        loader.unload();

        getTotalFee();
        getFreightInfo();
    }
};

/**
 * Lấy ra thông tin bảng tổng chi phí
 */
const getFeeTotalInfo = async () => {
    try {
        loader.load();
        const result = await postFeeTotalTable({ chargeId: chargeId });
        const data = result.data || [];

        let html = '';
        if (data && data.length > 0) {
            data.forEach((item, index) => {
                html += `
                    <tr>
                        <td>${index + 1}</td>
                        <td class="text-start">${item.costName}</td>
                        <td>${item.total}</td>
                    </tr>
                `;
            });

            document.querySelector('#tbl-total tbody').innerHTML = html;
            document.querySelector('.tbl-total-placeholder').classList.add('d-none');
        }
    } catch (error) {
        console.error(error.message);
    } finally {
        loader.unload();
    }
};

/**
 * Lưu thông tin tổng chi phí
 *
 * @param {event} e
 * @returns
 */
const submitFeeTotal = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (['WAITING', 'FINISH', 'CANCELED'].includes(submitStatus)) {
        alert('The application is currently in a non-editable state. Please try again later.');
        return;
    }

    if (!e.target.checkValidity()) {
        e.target.classList.add('was-validated');
        return;
    }

    const form = document.forms['form-total'];
    const fileFee = form['file-fee-total'].files;
    const attachedFile = form['attached-file'].files;

    try {
        loader.load();

        const formData = new FormData();
        formData.append('chargeId', chargeId);
        formData.append('costFile', fileFee[0]);
        formData.append('chargeFile', attachedFile[0]);

        const result = await postFeeTotal(formData);

        if (result.code == 'SUCCESS') {
            e.target.classList.remove('was-validated');
            alert(result.message);
        } else {
            alert(result.message);
        }
    } catch (error) {
        alert(error.message);
    } finally {
        loader.unload();
        getCommonApplicationInfo();
    }
};

// Lấy thông tin của đơn hỗ trợ
const getSupportSystemInfo = async () => {
    try {
        loader.load();
        const result = await fetchSupportSystem({ chargeTrackingId: chargeId });
        const data = result.data || [];

        let html = '';
        if (result.code == 'SUCCESS') {
            if (data && data.length > 0) {
                data.forEach((item, index) => {
                    html += `
                        <tr>
                            <td>${index + 1}</td>
                            <td class="text-left text-nowrap">${item.customerBu || ''}</td>
                            <td class="text-left text-nowrap">${item.detailBu || ''}</td>
                            <td>${item.factory || ''}</td>
                            <td>${item.feeCode || ''}</td>
                            <td class="text-right">${Helper.formatCurrencyISO(item.totalVND?.toFixed(2)) || ''}</td>
                            <td class="text-right">${Helper.formatCurrencyISO(item.totalUSD?.toFixed(2)) || ''}</td>
                        </tr>
                    `;
                });

                document.querySelector('#tbl-support tbody').innerHTML = html;
                document.querySelector('#tbl-support-container').classList.remove('d-none');
                document.querySelector('#tbl-support-placeholder').classList.add('d-none');
            }
        }

        if (!html) {
            document.querySelector('#tbl-support tbody').innerHTML = '';
            document.querySelector('#tbl-support-container').classList.add('d-none');
            document.querySelector('#tbl-support-placeholder').classList.remove('d-none');
        }
    } catch (error) {
        console.error(error.message);
    } finally {
        loader.unload();
    }
};

// Lưu thông tin đơn hỗ trợ
const postSaveSupportInfo = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (['WAITING', 'FINISH', 'CANCELED'].includes(submitStatus)) {
        alert('The application is currently in a non-editable state. Please try again later.');
        return;
    }

    if (!e.target.checkValidity()) {
        e.target.classList.add('was-validated');
        return;
    }

    const form = document.forms['form-support'];
    const files = form['file-support'].files;

    try {
        loader.load();

        const formData = new FormData();
        formData.append('uploadedFile', files[0]);
        formData.append('chargeTrackingId', chargeId);

        const result = await postSupportSystemSave(formData);

        if (result.code == 'SUCCESS') {
            e.target.reset();
            e.target.classList.remove('was-validated');
            alert(result.message);
        } else {
            alert(result.message);
        }
    } catch (error) {
        alert(error.message);
    } finally {
        loader.unload();

        getTotalFee();
        getSupportSystemInfo();
    }
};

/**
 * Tạo đơn nháp (draft)
 * @async
 */
const submitDraft = async (e, action = null) => {
    e.preventDefault();
    e.stopPropagation();

    const formMain = DOM.formMain;
    const formFee = DOM.formFee;

    const remark = formFee['remark'].value;

    let isNotFinish = false;
    if (!formMain.checkValidity()) {
        isNotFinish = true;
        formMain.classList.add('was-validated');
    }

    if (!formFee.checkValidity()) {
        !isNotFinish && (isNotFinish = true);
        formFee.classList.add('was-validated');
    }

    if (isNotFinish) return;

    const params = {
        projectId: parseInt(formFee['product-name'].value),
        modelId: parseInt(formFee['model-name'].value),
        costDate: moment(new Date(formFee['occurrence-date'].value)).format('YYYY/MM/DD HH:mm:ss'),
        costName: formFee['cost-name'].value,
        typeId: parseInt(formFee['cost-type'].options[formFee['cost-type'].selectedIndex].dataset.id),
        payerId: parseInt(formFee['payer'].options[formFee['payer'].selectedIndex].dataset.id),
        site: formFee['site'].value,
        bu: formFee['bu'].value,
        cft: formFee['cft'].value,
        status: !action ? 1 : 0,
        createBy: window.USER.id,
        remark: remark,
    };

    if (submitStatus == 'IE_RETURNED' || action) {
        params.id = chargeId;
    }

    try {
        loader.load();
        const result = await postSumbmitDraft(params);
        const data = result.result || {};

        if (result.code === 'SUCCESS' && Object.keys(data).length > 0) {
            formMain.reset();
            formMain.classList.remove('was-validated');

            formFee.reset();
            formFee.classList.remove('was-validated');

            window.location.href = `${SYSTEM_PATH}/charge/fee-create?chargeId=${data.id}`;
        }
        alert(result.message);
    } catch (error) {
        console.error(error.message);
        alert(error.message);
    } finally {
        loader.unload();
    }
};

// Lưu thông tin submit
const submitApplication = async (e, action) => {
    e.preventDefault();
    e.stopPropagation();

    if (!e.target.checkValidity()) {
        e.target.classList.add('was-validated');
        alert('Please fill out all the required fields');
        return;
    }

    const formMain = DOM.formMain;
    const formFee = DOM.formFee;

    const params = {
        costApplyId: chargeId,
        site: formFee['site'].value,
        bu: formFee['bu'].value,
        cft: formFee['cft'].value,
        costName: formFee['cost-name'].value,
        costDate: moment(formFee['occurrence-date'].value).format('YYYY/MM/DD HH:mm:ss'),
        mail: formMain['applicant-email'].value.trim(),
        phone: formMain['applicant-phone-number'].value,
    };

    if (costType !== 'support system') {
        params.projectId = parseInt(formFee['product-name'].value);
        params.modelId = parseInt(formFee['model-name'].value);
    }

    const confirm = window.confirm('Do you want to submit?');
    if (!confirm) return;

    try {
        loader.load();
        let result;
        if (action === 'create') {
            result = await postSumbmitApplicationSend(params);
        } else if (action == 'update') {
            result = await postSumbmitApplicationUpdate(params);
        }
        const data = result.result || {};

        if (result.code == 'SUCCESS') {
            e.target.classList.remove('was-validated');
            alert(result.message);
            if (data.id) {
                window.location.href = `https://fiisw-cns.myfiinet.com/fii-esign-system/detail/don_xin_xac_nhan_bang_tinh_phi_IE?submitId=${data.id}`;
            }
        } else {
            alert(result.message);
        }
    } catch (error) {
        alert(error.message);
    } finally {
        loader.unload();
    }
};

/**
 * Xử lý giao diện theo quyền của người dùng.
 *
 * Nếu người dùng không có role là "IE" thì toàn bộ các phần tử
 * trong form (input, select, textarea) sẽ bị vô hiệu hóa (disabled).
 *
 * @returns {void} - Hàm không trả về giá trị nào.
 */
const handleUIByPermission = () => {
    if (!role || role.toUpperCase() !== 'IE') {
        document.querySelectorAll('.upload-wrapper').forEach((el) => el.remove());

        if (submitStatus !== 'IE_RETURNED') {
            if (costType == 'rework') {
                document.querySelectorAll('input, select, textarea').forEach((el) => (el.disabled = true));
            } else if (costType == 'freight') {
                document.forms['form-main']
                    .querySelectorAll('input, select, textarea')
                    .forEach((el) => (el.disabled = true));
                // document.forms['form-fee']
                //     .querySelectorAll('input, select, textarea')
                //     .forEach((el) => (el.disabled = true));
            }
        } else {
            document.querySelectorAll('.fee-checkboxes input[type="checkbox"]').forEach((el) => (el.disabled = true));
        }
    }

    if (['WAITING', 'FINISH', 'CANCELED'].includes(submitStatus)) {
        document.querySelectorAll('.upload-wrapper').forEach((ele) => ele.remove());
        document.querySelector('.btn-save-freight').remove();
    }
};

window.postOtherFeeDelete = postOtherFeeDelete;
window.postSaveFreightInfo = postSaveFreightInfo;
window.postSaveSupportInfo = postSaveSupportInfo;
window.submitDraft = submitDraft;
window.submitFeeForm = submitFeeForm;
window.postOtherFeeDelete = postOtherFeeDelete;
window.submitApplication = submitApplication;
window.submitFeeTotal = submitFeeTotal;

ready(function () {
    loadEvent();
    loadData();
});
