class Pagination {
    constructor({
        mode = 'front', // "front" | "back"
        data = [],
        pageSize = 10,
        totalItems = null,
        fetchData = null,
        renderRow,
        tableId,
        showJumpInput,
        searchInput = null,
        exportBtn = null,
    }) {
        this.mode = mode.toLowerCase().trim();
        this.data = data;
        this.cacheData = [...data];
        this.pageSize = pageSize;
        this.totalItems = totalItems || data.length;
        this.fetchData = fetchData;
        this.renderRow = renderRow;
        this.showJumpInput = showJumpInput;
        this.searchInput = searchInput;
        this.exportBtn = exportBtn;
        this.table = document.getElementById(tableId);

        if (!this.table) throw new Error(`Table with id "${tableId}" not found`);
        this.renderContainer = this.table.querySelector('tbody');
        if (!this.renderContainer) {
            this.renderContainer = document.createElement('tbody');
            this.table.appendChild(this.renderContainer);
        }

        this.currentPage = 1;
        this.totalPages = Math.max(1, Math.ceil(this.totalItems / this.pageSize));

        // Gắn search input nếu có
        if (this.mode === 'front') {
            if (this.searchInput) {
                const inputEl = document.querySelector(this.searchInput);
                if (inputEl) {
                    inputEl.addEventListener(
                        'input',
                        this.debounce((e) => {
                            const keyword = e.target?.value?.toLowerCase();
                            if (keyword) {
                                this.data = this.cacheData.filter((item) => Helper.deepSearch(item, keyword));
                            } else {
                                this.data = [...this.cacheData];
                            }

                            this.totalItems = this.data.length;
                            this.totalPages = Math.max(1, Math.ceil(this.totalItems / this.pageSize));

                            this.loadPage(1);
                        }, 300)
                    );
                }
            }

            if (this.exportBtn) {
                const btnExport = document.querySelector(this.exportBtn);
                if (btnExport) {
                    btnExport.addEventListener('click', () => {
                        this.export();
                    });
                }
            }
        }

        this.loadPage(1);
    }

    async loadPage(page) {
        if (isNaN(page) || page < 1) page = 1;
        if (page > this.totalPages) page = this.totalPages;

        this.currentPage = page;

        let items = [];
        try {
            if (this.mode === 'front') {
                const start = (page - 1) * this.pageSize;
                items = this.data.slice(start, start + this.pageSize);
            } else if (this.mode === 'back' && typeof this.fetchData === 'function') {
                const res = await this.fetchData(Math.max(page - 1, 0), this.pageSize);
                items = res.items || [];
                this.totalItems = res.total || items.length;
                this.totalPages = Math.max(1, Math.ceil(this.totalItems / this.pageSize));
            }
        } catch (err) {
            console.error('Load page error:', err);
        }

        this.renderData(items);
        this.renderPagination();
    }

    renderData(items) {
        if (!this.renderRow) return;
        this.renderContainer.innerHTML = '';

        if (items.length > 0) {
            const frag = document.createDocumentFragment();
            items.forEach((item, idx) => {
                const row = document.createElement('tr');
                item.ordinal = idx + 1 + this.pageSize * (this.currentPage - 1);
                row.innerHTML = this.renderRow(item);
                frag.appendChild(row);
            });
            this.renderContainer.appendChild(frag);
        } else {
            this.renderContainer.innerHTML = `<tr><td colspan="50">No data</td></tr>`;
        }
    }

    renderPagination() {
        const tableWrapper = this.table?.closest('.table-responsive');
        if (tableWrapper?.nextElementSibling?.classList.contains('pagination')) {
            tableWrapper.nextElementSibling.remove();
        }

        if (this.paginationContainer) this.paginationContainer.innerHTML = '';
        this.paginationContainer = document.createElement('div');
        this.paginationContainer.classList.add('pagination');
        this.table.parentNode.insertAdjacentElement('afterend', this.paginationContainer);

        // Nếu không có thì không tạo pagination
        if (this.totalItems <= 0) return;

        const createButton = (label, page, disabled = false, active = false) => {
            const btn = document.createElement('button');
            btn.textContent = label;
            btn.disabled = disabled;
            btn.setAttribute('aria-disabled', disabled);

            if (active) btn.classList.add('active');
            btn.addEventListener('click', () => this.loadPage(page));

            return btn;
        };

        // Prev
        this.paginationContainer.appendChild(createButton('Prev', this.currentPage - 1, this.currentPage === 1));

        // Page numbers
        const maxVisible = 5;
        let start = Math.max(1, this.currentPage - 2);
        let end = Math.min(this.totalPages, start + maxVisible - 1);
        if (end - start < maxVisible - 1) {
            start = Math.max(1, end - maxVisible + 1);
        }

        if (start > 1) {
            this.paginationContainer.appendChild(createButton('1', 1));
            if (start > 2) this.paginationContainer.appendChild(this.createEllipsis());
        }

        for (let i = start; i <= end; i++) {
            this.paginationContainer.appendChild(createButton(i, i, false, i === this.currentPage));
        }

        if (end < this.totalPages) {
            if (end < this.totalPages - 1) {
                this.paginationContainer.appendChild(this.createEllipsis());
            }
            this.paginationContainer.appendChild(createButton(this.totalPages, this.totalPages));
        }

        // Next
        this.paginationContainer.appendChild(createButton('Next', this.currentPage + 1, this.currentPage === this.totalPages));

        // Jump input
        const jump = this.createJumpInput();
        if (jump) this.paginationContainer.appendChild(jump);
    }

    createEllipsis() {
        const span = document.createElement('span');
        span.textContent = '...';
        span.classList.add('ellipsis');
        return span;
    }

    createJumpInput() {
        if (!this.showJumpInput) return null;
        const wrapper = document.createElement('div');
        wrapper.style.display = 'inline-block';

        const input = document.createElement('input');
        input.id = 'ip-jump';
        input.type = 'number';
        input.min = 1;
        input.max = this.totalPages;
        input.value = this.currentPage;
        input.style.border = '1px solid #c1dbf2';
        input.style.fontSize = '0.9rem';
        input.style.height = '30px';
        input.style.lineHeight = '30px';
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const target = parseInt(input.value);
                if (!isNaN(target)) this.loadPage(target);
            }
        });

        const btnGo = document.createElement('button');
        btnGo.textContent = 'Go';
        btnGo.style.height = '100%';
        btnGo.addEventListener('click', () => {
            const target = parseInt(input.value);
            if (!isNaN(target)) this.loadPage(target);
        });
        wrapper.appendChild(input);
        wrapper.appendChild(btnGo);
        return wrapper;
    }

    debounce(fn, delay) {
        let timer;
        return (...args) => {
            clearTimeout(timer);
            timer = setTimeout(() => fn.apply(this, args), delay);
        };
    }

    export() {
        if (!this.renderRow) return;

        // Lấy toàn bộ dữ liệu sau khi search (this.data đã được filter sẵn)
        const allItems = this.data.map((item, idx) => {
            return {
                ...item,
                ordinal: idx + 1,
            };
        });

        // Tạo tbody HTML
        let rowsHTML = allItems
            .map((item) => {
                const tr = document.createElement('tr');
                tr.innerHTML = this.renderRow(item);
                return tr.outerHTML;
            })
            .join('');

        const htmlTable = `
            <table>
                <thead>${this.table.querySelector('thead')?.innerHTML || ''}</thead>
                <tbody>${rowsHTML}</tbody>
            </table>
        `;

        const style = `
            <style>
                table { border-collapse: collapse; }
                th, td { border: 1px solid #000; padding: 5px; }
            </style>
        `;

        const fullHTML = `
        <html>
            <head>
                <meta charset="UTF-8">
                ${style}
            </head>
            <body>${htmlTable}</body>
        </html>
    `;

        const blob = new Blob([fullHTML], {type: 'application/vnd.ms-excel'});
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `${this.table.id}_data.xls`;
        a.click();
        URL.revokeObjectURL(a.href);
    }
}

// Triển khai phân trang back
const renderTable2 = () => {
    const cb = (item) => {
        return `
            <tr onclick>
                <td>${item.ordinal}</td>
                <td>${convertCftName(item.cft)}</td>
                <td>${item.project || ''}</td>
                <td>${item.model || ''}</td>
                <td>${item.workOrder || ''}</td>
                <td>${item.component || ''}</td>
                <td>${Helper.formatCurrencyISO({num: item.requestQty})}</td>
                <td>${Helper.formatCurrencyISO({num: item.issueQty})}</td>
                <td>${Helper.formatCurrencyISO({num: item.lossQty})}</td>
                <!-- <td>${item.mvAvgPrice || ''}</td> -->
                <td>${Helper.parseNumber({num: item.lossRate * 100})}</td>
            </tr>
        `;
    };

    new Pagination({
        mode: 'back',
        pageSize: 10,
        fetchData: getTable2,
        renderRow: cb,
        tableId: 'table-2',
    });
};

// --- DEMO FRONT ---
const data = Array.from({length: 73}, (_, i) => ({
    id: i + 1,
    name: 'Item ' + (i + 1),
}));
new Pagination({
    mode: 'front',
    data,
    pageSize: 5,
    renderRow: (item) => `<td>${item.id}</td><td>${item.name}</td>`,
    tableId: 'myTable1',
    searchInput: '#searchBox',
    showJumpInput: true,
});
