<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<style>
    :root {
        --radius: 0.375rem;
    }

    body {
        background: #f8f9fb;
        font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial,
            sans-serif;
    }

    .section {
        background: white;
        padding: 1.5rem 1.75rem;
        border-radius: var(--radius);
        margin-bottom: 1.75rem;
        position: relative;
        box-shadow: 0 1px 6px rgba(0, 0, 0, 0.04);
    }

    .title {
        font-size: 1.125rem;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 1rem;
        color: #1f2d3d;
    }

    .section label {
        font-weight: normal !important;
    }

    .required {
        color: #d63384;
        margin-left: 2px;
        font-size: 0.95em;
    }

    .table-placeholder {
        padding: 0.75rem;
        border: 1px dashed #ced4da;
        border-radius: 0.375rem;
        background: #f1f5fa;
        text-align: center;
        color: #6c757d;
        margin-top: 0.5rem;
        font-size: 15px;
    }

    .fee-checkboxes .form-check {
        margin-right: 1rem;
    }

    .fee-section {
        border: 1px solid #e3e8ef;
        border-radius: 0.375rem;
        padding: 1rem 1rem 0.5rem;
        margin-top: 1.5rem;
        background: #fff;
    }

    .table thead th {
        text-align: center;
        color: #5788db;
    }

    .table tbody td {
        font-size: 15px;
        vertical-align: middle;
        text-align: center;
    }

    @media (min-width: 576px) {
    }

    @media (min-width: 768px) {
    }

    @media (min-width: 992px) {
        .title {
            font-size: 1.025rem;
        }

        .section label {
            font-size: 15px;
        }

        .form-control,
        input::placeholder {
            font-size: 0.9rem;
        }

        .table thead th {
            font-size: 15px;
        }

        .table-placeholder,
        .table tbody td {
            font-size: 14px;
        }
    }

    @media (min-width: 1200px) {
    }

    @media (min-width: 1400px) {
        .title {
            font-size: 1.125rem;
        }

        .section label {
            font-size: 16px;
        }

        .form-control,
        input::placeholder {
            font-size: 1rem;
        }

        input::placeholder {
            font-size: 15px;
        }

        .table thead td {
            font-size: 16px;
        }

        .table-placeholder,
        .table tbody td {
            font-size: 15px;
        }
    }
</style>

<div class="container-xxl pt-3 pb-3">
    <h3 class="mb-3 fw-bold d-flex flex-wrap align-itemsc-center justify-content-between page-title">
        <div>
            <span><spring:message code="chargeRequest" /></span>
            <span id="page-name-type"></span>
        </div>
        <div class="fs-6 d-flex align-items-center" id="status-note"></div>
    </h3>

    <!-- 1. Thông tin người làm đơn -->
    <div class="section">
        <div class="title">
            <i class="bi bi-person-circle"></i>
            <div><spring:message code="applicantInfo" /></div>
        </div>
        <form id="form-main" class="needs-validation" novalidate autocomplete="off" spellcheck="false">
            <div class="row g-3">
                <div class="col-md-3">
                    <div class="form-floating">
                        <input
                            type="text"
                            class="form-control"
                            id="id-card"
                            name="id-card"
                            placeholder="Mã thẻ"
                            required
                            disabled
                        />
                        <label for="id-card"><spring:message code="idCard" /> <span class="required">*</span></label>
                        <div class="invalid-feedback">This field is required.</div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="form-floating">
                        <input
                            type="text"
                            class="form-control"
                            id="full-name"
                            name="full-name"
                            placeholder="Họ tên"
                            required
                            disabled
                        />
                        <label for="full-name"
                            ><spring:message code="fullName" /> <span class="required">*</span></label
                        >
                        <div class="invalid-feedback">This field is required.</div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="form-floating">
                        <input
                            type="email"
                            class="form-control"
                            id="applicant-email"
                            name="applicant-email"
                            placeholder="example@domain.com"
                            disabled
                        />
                        <label for="applicant-email"
                            ><spring:message code="email" /></label
                        >
                        <div class="invalid-feedback">This field is required.</div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="form-floating">
                        <input
                            type="text"
                            class="form-control"
                            id="applicant-phone-number"
                            name="applicant-phone-number"
                            placeholder="0123456789"
                            disabled
                        />
                        <label for="applicant-phone-number"
                            ><spring:message code="phoneNumber" /></label
                        >
                        <div class="invalid-feedback">This field is required.</div>
                    </div>
                </div>
            </div>
        </form>
    </div>

    <!-- 2. Thông tin phí chung -->
    <div class="section">
        <div class="title">
            <i class="bi bi-tags"></i>
            <div><spring:message code="feeInfo" /></div>
        </div>
        <form
            id="form-fee"
            name="form-fee"
            class="needs-validation"
            novalidate
            autocomplete="off"
            spellcheck="false"
            onsubmit="submitDraft(event)"
        >
            <div class="row g-3">
                <div class="col-md-4">
                    <label class="form-label" for="payer">
                        <spring:message code="paymentType" /> <span class="required">*</span>
                    </label>
                    <select class="form-select" id="payer" name="payer" required>
                        <option value="" selected disabled><spring:message code="selectItem" /></option>
                    </select>
                    <div class="invalid-feedback">This field is required.</div>
                </div>
                <div class="col-md-4" hidden>
                    <label class="form-label" for="cost-type">
                        <spring:message code="costType" /> <span class="required">*</span>
                    </label>
                    <select class="form-select" id="cost-type" name="cost-type" required disabled>
                        <option value="" selected disabled><spring:message code="selectItem" /></option>
                    </select>
                    <div class="invalid-feedback">This field is required.</div>
                </div>
                <div class="col-md-4 product-name-wrapper">
                    <label class="form-label" for="product-name">
                        <spring:message code="productName" /> <span class="required">*</span>
                    </label>
                    <div class="input-group">
                        <span class="input-group-text"><i class="bi bi-box-seam"></i></span>
                        <select class="form-select" id="product-name" name="product-name" required>
                            <option value="" selected disabled><spring:message code="selectItem" /></option>
                        </select>
                        <div class="invalid-feedback">This field is required.</div>
                    </div>
                </div>
                <div class="col-md-4 model-name-wrapper">
                    <label class="form-label" for="model-name">
                        <spring:message code="modelName" /> <span class="required">*</span>
                    </label>
                    <div class="input-group">
                        <span class="input-group-text"><i class="bi bi-tag"></i></span>
                        <select class="form-select" id="model-name" name="model-name" required>
                            <option value="" selected disabled><spring:message code="selectItem" /></option>
                        </select>
                        <div class="invalid-feedback">This field is required.</div>
                    </div>
                </div>
                <div class="col-md-4">
                    <label class="form-label" for="site">
                        <spring:message code="site" /> <span class="required">*</span>
                    </label>
                    <select class="form-control" id="site" name="site" placeholder="Site" required>
                        <option value="" selected disabled><spring:message code="selectItem" /></option>
                    </select>
                    <div class="invalid-feedback">This field is required.</div>
                </div>
                <div class="col-md-4">
                    <label class="form-label" for="bu">
                        <spring:message code="bu" /> <span class="required">*</span>
                    </label>
                    <select class="form-control" id="bu" name="bu" placeholder="Business Unit" required>
                        <option value="" selected disabled><spring:message code="selectItem" /></option>
                    </select>
                    <div class="invalid-feedback">This field is required.</div>
                </div>
                <div class="col-md-4">
                    <label class="form-label" for="cft">
                        <spring:message code="cft" /> <span class="required">*</span>
                    </label>
                    <select class="form-control" id="cft" name="cft" placeholder="CFT code" required>
                        <option value="" selected disabled><spring:message code="selectItem" /></option>
                    </select>
                    <div class="invalid-feedback">This field is required.</div>
                </div>
                <div class="col-md-4 occurrence-date-wrapper">
                    <label class="form-label" for="occurrence-date"
                        ><spring:message code="occurentDate" /> <span class="required">*</span></label
                    >
                    <div class="input-group">
                        <span class="input-group-text"><i class="bi bi-calendar-date"></i></span>
                        <input
                            type="datetime-local"
                            class="form-control"
                            id="occurrence-date"
                            name="occurrence-date"
                            required
                        />
                        <div class="invalid-feedback">This field is required.</div>
                    </div>
                </div>
                <div class="col-12 col-md-8 cost-name-wrapper">
                    <label class="form-label" for="cost-name">
                        <spring:message code="costCalculationSheet" /> <span class="required">*</span>
                    </label>
                    <input type="text" class="form-control" id="cost-name" name="cost-name" required />
                    <div class="invalid-feedback">This field is required.</div>
                </div>
                <div class="col-md-12 remark-wrapper d-none">
                    <label class="form-label" for="remark">
                        <spring:message code="remark" />
                    </label>
                    <textarea class="form-control text-danger" id="remark" name="remark" rows="3"></textarea>
                    <div class="invalid-feedback">This field is required.</div>
                </div>
                <div class="col-12 d-flex justify-content-end">
                    <button type="submit" class="btn btn-sm btn-primary btn-create-draft d-none">
                        <i class="bi bi-save"></i> <spring:message code="save" />
                    </button>
                </div>
            </div>
        </form>
    </div>

    <!-- 3. Thông tin đơn rework -->
    <!-- <div class="section rework d-none">
        <div class="title">
            <i class="bi bi-bounding-box-circles"></i>
            <div><spring:message code="reworkApplicationInfo" /></div>
        </div>
        <form
            id="form-rework"
            name="form-rework"
            class="needs-validation"
            novalidate
            autocomplete="off"
            spellcheck="false"
            onsubmit="postSaveReworkInfo(event)"
        >
            <div class="row g-3 align-items-start">
                <div class="col-md-3">
                    <label class="form-label" for="rework-no">
                        <spring:message code="reworkNo" /> <span class="required">*</span>
                    </label>
                    <input
                        type="text"
                        class="form-control input-focus"
                        id="rework-no"
                        name="rework-no"
                        placeholder="Rework No."
                        required
                    />
                    <div class="invalid-feedback">This field is required.</div>
                </div>
                <div class="col-md-3">
                    <label class="form-label" for="rework-attached-file">
                        <spring:message code="attachedFile" />
                    </label>
                    <input class="form-control" type="file" id="rework-attached-file" name="rework-attached-file" />
                    <div id="attachedName" class="file-info text-truncate"></div>
                </div>
                <div class="col-12 d-flex justify-content-end">
                    <button type="submit" class="btn btn-sm btn-primary btn-save-rework">
                        <i class="bi bi-save"></i> <spring:message code="save" />
                    </button>
                </div>
            </div>
        </form>

        <div id="detailWrapper" class="mt-3">
            <div id="tbl-rework-placeholder" class="table-placeholder d-none">
                No detailed data available. Please fill in all the information and click "Save" to view
            </div>
            <div class="table-responsive d-none" id="tbl-rework-container">
                <table class="table table-bordered align-middle" id="tbl-rework">
                    <thead class="table-light">
                        <tr>
                            <th>No.</th>
                            <th><spring:message code="materialModel" /></th>
                            <th><spring:message code="materialName" /></th>
                            <th><spring:message code="materialCode" /></th>
                            <th><spring:message code="reworkAmount" /></th>
                            <th><spring:message code="unit" /></th>
                            <th><spring:message code="scrapQty" /></th>
                            <th><spring:message code="price" /> (USD)</th>
                            <th><spring:message code="total" /></th>
                            <th><spring:message code="remark" /></th>
                            <th><spring:message code="description" /></th>
                        </tr>
                    </thead>
                    <tbody></tbody>
                </table>
            </div>
        </div>
    </div> -->

    <!-- 4. Thông tin đơn freight -->
    <div class="section freight d-none">
        <div class="title">
            <i class="bi bi-train-freight-front"></i>
            <div><spring:message code="freightApplicationInfo" /></div>
        </div>
        <form
            id="form-freight"
            name="form-freight"
            class="needs-validation"
            novalidate
            autocomplete="off"
            spellcheck="false"
            onsubmit="postSaveFreightInfo(event)"
        >
            <div class="row g-3 align-items-start">
                <div class="col-md-3">
                    <label class="form-label" for="freight-logistic-no">
                        <spring:message code="logisticsNo" /> <span class="required">*</span>
                    </label>
                    <input
                        type="text"
                        class="form-control input-focus"
                        id="freight-logistic-no"
                        name="freight-logistic-no"
                        placeholder="Logistics No."
                        required
                    />
                    <div class="invalid-feedback">This is required.</div>
                </div>
                <div class="col-md-3">
                    <label class="form-label" for="freight-expense-code">
                        <spring:message code="expenseCode" /> <span class="required">*</span>
                    </label>
                    <input
                        type="text"
                        class="form-control input-focus"
                        id="freight-expense-code"
                        name="freight-expense-code"
                        required
                    />
                    <div class="invalid-feedback">This is required.</div>
                </div>
                <div class="col-md-3">
                    <label for="freight-init-bu" class="form-label">
                        <spring:message code="initialBu" /> <span class="required">*</span>
                    </label>
                    <input
                        type="text"
                        class="form-control"
                        id="freight-init-bu"
                        name="freight-init-bu"
                        required
                        placeholder="Please enter here..."
                    />
                </div>
                <div class="col-md-3">
                    <label for="freight-owner" class="form-label">
                        <spring:message code="owner" /> <span class="required">*</span>
                    </label>
                    <input
                        type="text"
                        class="form-control"
                        id="freight-owner"
                        name="freight-owner"
                        required
                        placeholder="Please enter here..."
                    />
                    <div class="invalid-feedback">This is required.</div>
                </div>
                <div class="col-md-3">
                    <label for="freight-cost-bu" class="form-label">
                        <spring:message code="costBu" /> <span class="required">*</span>
                    </label>
                    <input
                        type="text"
                        class="form-control"
                        id="freight-cost-bu"
                        name="freight-cost-bu"
                        required
                        placeholder="Please enter here..."
                    />
                    <div class="invalid-feedback">This is required.</div>
                </div>
                <div class="col-md-3">
                    <label for="freight-cost-owner" class="form-label">
                        <spring:message code="costOwner" /> <span class="required">*</span>
                    </label>
                    <input
                        type="text"
                        class="form-control"
                        id="freight-cost-owner"
                        name="freight-cost-owner"
                        required
                        placeholder="Please enter here..."
                    />
                    <div class="invalid-feedback">This is required.</div>
                </div>
                <div class="col-md-3">
                    <label class="form-label" for="freight-total">
                        <spring:message code="total" /> <span class="required">*</span>
                    </label>
                    <input
                        type="text"
                        class="form-control input-focus only-digit"
                        id="freight-total"
                        name="freight-total"
                        placeholder="Please enter here..."
                        required
                    />
                    <div class="invalid-feedback">This is required.</div>
                </div>
                <div class="col-md-3">
                    <label for="freight-desc" class="form-label">
                        <spring:message code="description" /> <span class="required">*</span>
                    </label>
                    <input
                        type="text"
                        class="form-control"
                        id="freight-desc"
                        name="freight-desc"
                        required
                        placeholder="Please enter here..."
                    />
                    <div class="invalid-feedback">This is required.</div>
                </div>
                <div class="col-md-3">
                    <label class="form-label" for="freight-attached-file">
                        <spring:message code="attachedFile" /> <span class="required">*</span>
                    </label>
                    <input class="form-control" type="file" id="freight-attached-file" name="freight-attached-file" />
                    <div class="invalid-feedback">This is required.</div>
                    <div>
                        <a name="attached-file-link" class="d-inline-block my-2"></a>
                    </div>
                </div>
                <div class="col-12 d-flex justify-content-end">
                    <button type="submit" class="btn btn-sm btn-primary btn-save-freight">
                        <i class="bi bi-save"></i> <spring:message code="save" />
                    </button>
                </div>
            </div>
        </form>
    </div>

    <!-- 5. Các loại phí chi tiết -->
    <div class="section rework line-stop sorting fees-type d-none">
        <div class="title">
            <i class="bi bi-list-check"></i>
            <div><spring:message code="selectFeeType" /></div>
        </div>

        <!-- checkbox chọn phí -->
        <div class="mb-3 fee-checkboxes d-flex flex-wrap">
            <div class="form-check">
                <input
                    class="form-check-input fee-toggle"
                    type="checkbox"
                    value="MATERIAL"
                    name="fee-type"
                    id="material"
                />
                <label class="form-check-label" for="material">Material fee</label>
            </div>
            <div class="form-check">
                <input class="form-check-input fee-toggle" type="checkbox" value="DL" name="fee-type" id="dl" />
                <label class="form-check-label" for="dl"><spring:message code="dlFee" /></label>
            </div>
            <div class="form-check">
                <input class="form-check-input fee-toggle" type="checkbox" value="IDL" name="fee-type" id="idl" />
                <label class="form-check-label" for="idl"><spring:message code="idlFee" /></label>
            </div>
            <div class="form-check">
                <input class="form-check-input fee-toggle" type="checkbox" value="SPACE" name="fee-type" id="space" />
                <label class="form-check-label" for="space"><spring:message code="spaceFee" /></label>
            </div>
            <div class="form-check">
                <input
                    class="form-check-input fee-toggle"
                    type="checkbox"
                    value="LINE-STOP"
                    name="fee-type"
                    id="line-stop"
                />
                <label class="form-check-label" for="line-stop"><spring:message code="stoplineFee" /></label>
            </div>
            <!-- <div class="form-check">
                <input class="form-check-input fee-toggle" type="checkbox" value="OTHER" name="fee-type" id="other" />
                <label class="form-check-label" for="other"><spring:message code="otherFee" /></label>
            </div> -->
        </div>

        <!-- container từng phí -->
        <div id="view-checkbox-container" class="rework line-stop sorting d-none"></div>
    </div>

    <!-- 6. Thông tin đơn hỗ trợ hệ thống -->
    <div class="section support-system d-none">
        <div class="title">
            <i class="bi bi-bounding-box-circles"></i>
            <div>
                <spring:message code="costCalculationSheet" /> (<span class="lowercase"
                    ><spring:message code="supportSystem" /></span
                >)
            </div>
        </div>
        <div class="d-flex align-items-center justify-content-end upload-wrapper">
            <form
                id="form-support"
                name="form-support"
                class="needs-validation d-flex align-items-center"
                novalidate
                autocomplete="off"
                spellcheck="false"
                onsubmit="postSaveSupportInfo(event)"
            >
                <a href="/ie-system/assets/files/support-system.xlsx" download class="me-2 small"
                    ><spring:message code="downloadSample"
                /></a>
                <input
                    type="file"
                    class="form-control form-control-sm d-inline-block"
                    name="file-support"
                    style="width: 250px"
                    accept=".csv,.xlsx,.xlsm,.xls"
                    required
                />
                <button type="submit" class="btn btn-sm btn-primary ms-2 save-fee-btn">
                    <i class="bi bi-save"></i> <spring:message code="save" />
                </button>
            </form>
        </div>

        <div id="detailSupportWrapper" class="mt-3">
            <div id="tbl-support-placeholder" class="table-placeholder d-none">
                No detailed data available. Please fill in all the information and click "Save" to view
            </div>
            <div class="table-responsive d-none" id="tbl-support-container">
                <table class="table table-bordered align-middle" id="tbl-support">
                    <thead class="table-light">
                        <tr>
                            <th>No.</th>
                            <th><spring:message code="bu" /></th>
                            <th><spring:message code="cft" /></th>
                            <th><spring:message code="factory" /></th>
                            <th><spring:message code="expenseCode" /></th>
                            <th><spring:message code="total" /> (VND)</th>
                            <th><spring:message code="total" /> (USD)</th>
                        </tr>
                    </thead>
                    <tbody></tbody>
                </table>
            </div>
        </div>
    </div>

    <!-- 7. Tổng & hành động -->
    <div class="section total d-none">
        <div class="row rework d-none mb-3">
            <div class="col-md-12">
                <div class="fw-semibold pb-2"><spring:message code="summaryTotal" /></div>
                <form
                    id="form-total"
                    name="form-total"
                    class="needs-validation"
                    novalidate
                    autocomplete="off"
                    spellcheck="false"
                    onsubmit="submitFeeTotal(event)"
                >
                    <div class="row mb-3 upload-wrapper">
                        <div class="col-md-3">
                            <label class="form-label" for="file-fee-other">
                                Tệp tin chi phí <span class="required">*</span>
                                <a href="/ie-system/assets/files/danh-sach-chi-phi.xlsx" download class="small"
                                    ><spring:message code="downloadSample"
                                /></a>
                            </label>
                            <input
                                type="file"
                                id="file-fee-total"
                                name="file-fee-total"
                                class="form-control form-control-sm"
                                required
                            />
                        </div>
                        <div class="col-md-3">
                            <label class="form-label" for="file-fee-other">
                                Tệp đính kèm <span class="required">*</span>
                                <a href="#" download class="small text-info d-none" id="charge-file" name="charge-file"
                                    ><spring:message code="download"
                                /></a>
                            </label>
                            <input
                                type="file"
                                id="attached-file"
                                name="attached-file"
                                class="form-control form-control-sm"
                                required
                            />
                        </div>
                        <div class="col-md-3 d-flex align-items-end">
                            <button type="submit" class="btn btn-sm btn-primary">
                                <i class="bi bi-save"></i> <spring:message code="save" />
                            </button>
                        </div>
                    </div>
                    <div class="table-responsive">
                        <table class="table table-sm table-bordered mb-2" id="tbl-total">
                            <thead class="table-light">
                                <tr>
                                    <th>No.</th>
                                    <th><spring:message code="feeName" /></th>
                                    <th><spring:message code="total" /></th>
                                </tr>
                            </thead>
                            <tbody></tbody>
                        </table>
                        <div class="table-placeholder tbl-total-placeholder">
                            No data available. Please select a file and click "Save" to view
                        </div>
                    </div>
                </form>
            </div>
        </div>
        <div class="row">
            <div class="col-md-12 pt-3">
                <div class="summary-card">
                    <!-- <div class="d-flex justify-content-between mb-2">
                        <div class="fw-semibold"><spring:message code="summaryTotal" /></div>
                    </div> -->
                    <div class="row g-3">
                        <div class="col-12 mt-2">
                            <div class="border-top pt-2 fw-semibold">
                                <spring:message code="total" />:
                                <span id="total-fee" class="text-primary total-display">0.00</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="row">
        <div class="col-md-12 d-flex flex-column justify-content-end align-items-end gap-3">
            <div>
                <a type="button" href="/ie-system/charge/fee-table" class="btn btn-secondary btn-back">
                    <i class="bi bi-arrow-left-circle"></i>
                    <spring:message code="back" />
                </a>
                <a type="button" class="btn btn-primary btn-view d-none" value="view">
                    <i class="bi bi-eye"></i>
                    <spring:message code="view" />
                </a>
                <button
                    type="button"
                    class="btn btn-warning btn-return d-none"
                    name="action"
                    value="return"
                    onclick="submitDraft(event, 'return')"
                >
                    <i class="bi bi-pen"></i>
                    <spring:message code="return" />
                </button>
                <button
                    type="button"
                    class="btn btn-warning btn-update d-none"
                    name="action"
                    value="update"
                    onclick="submitApplication(event, 'update')"
                >
                    <i class="bi bi-pen"></i>
                    <spring:message code="update" />
                </button>
                <button
                    type="button"
                    class="btn btn-success btn-submit d-none"
                    name="action"
                    value="create"
                    onclick="submitApplication(event, 'create')"
                >
                    <i class="bi bi-send"></i>
                    <spring:message code="submit" />
                </button>
            </div>
            <!-- <div class="small-note">Ấn “Gửi đơn” để hoàn tất</div> -->
        </div>
    </div>
</div>

<script>
    i18n = {
        ...i18n,
        selectItem: '<spring:message code="selectItem" />',
        downloadSample: '<spring:message code="downloadSample" />',
        save: '<spring:message code="save" />',
        remark: '<spring:message code="remark" />',
        rework: '<spring:message code="rework" />',
        lineStop: '<spring:message code="lineStop" />',
        sorting: '<spring:message code="sorting" />',
        freight: '<spring:message code="freight" />',
        supportSystem: '<spring:message code="supportSystem" />',
        total: '<spring:message code="total" />',
        file: '<spring:message code="file" />',
        action: '<spring:message code="action" />',
        details: '<spring:message code="details" />',

        materialFee: 'Material fee',
        materialModel: '<spring:message code="materialModel" />',
        materialName: '<spring:message code="materialName" />',
        materialCode: '<spring:message code="materialCode" />',
        reworkAmount: '<spring:message code="reworkAmount" />',
        unit: '<spring:message code="unit" />',
        scrapQty: '<spring:message code="scrapQty" />',
        price: '<spring:message code="price" />',
        description: '<spring:message code="description" />',

        dlFee: '<spring:message code="dlFee" />',
        station: '<spring:message code="station" />',
        perTime: '<spring:message code="perTime" />',
        laborShiftLine: '<spring:message code="laborShiftLine" />',
        line: '<spring:message code="line" />',
        ct: '<spring:message code="ct" />',
        hour: '<spring:message code="hour" />',
        day: '<spring:message code="day" />',
        price: '<spring:message code="price" />',
        totalLabor: '<spring:message code="totalLabor" />',

        idlFee: '<spring:message code="idlFee" />',
        idlContent: '<spring:message code="idlContent" />',
        idlQty: '<spring:message code="idlQty" />',
        hour: '<spring:message code="hour" />',
        idlFee: '<spring:message code="idlFee" />',

        spaceFee: '<spring:message code="spaceFee" />',
        spaceItem: '<spring:message code="spaceItem" />',
        itemQty: '<spring:message code="itemQty" />',
        itemUnit: '<spring:message code="itemUnit" />',
        spaces: '<spring:message code="spaces" />',

        stoplineFee: '<spring:message code="stoplineFee" />',
        stoplineDate: '<spring:message code="stoplineDate" />',
        line: '<spring:message code="line" />',
        labor: '<spring:message code="labor" />',
        loanedLabor: '<spring:message code="loanedLabor" />',

        otherFee: '<spring:message code="otherFee" />',
        feeName: '<spring:message code="feeName" />',

        sorting: '<spring:message code="sorting" />',
        reworkQty: '<spring:message code="reworkQty" />',
        palletQuantity: '<spring:message code="palletQuantity" />',
    };
</script>
<script type="module" src="/ie-system/js/modules/charge/fee-create.js"></script>
