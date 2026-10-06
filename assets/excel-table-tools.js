/*
 * Read-only, dependency-free table controls for locally published Excel HTML.
 * The source document is never written; this script only changes the live DOM.
 */
(function () {
  'use strict';

  function text(cell) { return (cell.textContent || '').replace(/\s+/g, ' ').trim(); }
  function parseValue(value) {
    var number = value.replace(/,/g, '').replace(/^\((.*)\)$/, '-$1');
    if (/^-?\d+(?:\.\d+)?$/.test(number)) return { kind: 'number', value: Number(number) };
    var date = /^(\d{4})\/(\d{1,2})\/(\d{1,2})$/.exec(value);
    if (date) return { kind: 'date', value: new Date(+date[1], +date[2] - 1, +date[3]).getTime() };
    return { kind: 'text', value: value.toLocaleLowerCase() };
  }
  function findLargestTable() {
    var tables = Array.prototype.slice.call(document.querySelectorAll('table'));
    return tables.reduce(function (winner, table) {
      var score = table.rows.length * Math.max(1, table.rows[0] ? table.rows[0].cells.length : 0);
      var best = winner ? winner.rows.length * Math.max(1, winner.rows[0] ? winner.rows[0].cells.length : 0) : -1;
      return score > best ? table : winner;
    }, null);
  }
  function normaliseRows(table) {
    var rows = [], width = 0;
    Array.prototype.forEach.call(table.rows, function (row) {
      var values = [], column = 0;
      Array.prototype.forEach.call(row.cells, function (cell) {
        while (values[column] !== undefined) column += 1;
        var span = Math.max(1, cell.colSpan || 1);
        values[column] = { value: text(cell), className: cell.className, style: cell.getAttribute('style') || '', align: cell.getAttribute('align') || '' };
        for (var i = 1; i < span; i += 1) values[column + i] = { value: '', className: '', style: '', align: '' };
        column += span;
      });
      width = Math.max(width, values.length);
      rows.push(values);
    });
    rows.forEach(function (row) { while (row.length < width) row.push({ value: '', className: '', style: '', align: '' }); });
    return rows;
  }
  function enhance() {
    var source = document.getElementById('report-table') || findLargestTable();
    if (!source || source.dataset.ettEnhanced === 'true' || source.rows.length < 2) return;
    source.dataset.ettEnhanced = 'true';
    source.id = 'report-table';
    var data = normaliseRows(source), headers = data.shift(), sort = { column: -1, direction: 1 }, filters = [], selected = null;
    var shell = document.createElement('section'); shell.className = 'ett-shell';
    var toolbar = document.createElement('div'); toolbar.className = 'ett-toolbar';
    var search = document.createElement('input'); search.type = 'search'; search.placeholder = 'Search all columns'; search.setAttribute('aria-label', 'Search all columns');
    var clear = document.createElement('button'); clear.type = 'button'; clear.textContent = 'Clear filters';
    var count = document.createElement('span'); count.className = 'ett-count';
    var columns = document.createElement('div'); columns.className = 'ett-columns';
    var columnsButton = document.createElement('button'); columnsButton.type = 'button'; columnsButton.textContent = 'Columns';
    var columnsMenu = document.createElement('div'); columnsMenu.className = 'ett-columns-menu';
    columns.appendChild(columnsButton); columns.appendChild(columnsMenu);
    toolbar.appendChild(search); toolbar.appendChild(clear); toolbar.appendChild(columns); toolbar.appendChild(count);
    var wrap = document.createElement('div'); wrap.className = 'ett-table-wrap';
    var table = document.createElement('table'); table.className = 'ett-table';
    var colgroup = document.createElement('colgroup');
    headers.forEach(function () { colgroup.appendChild(document.createElement('col')); });
    table.appendChild(colgroup);
    var head = document.createElement('thead'), headRow = document.createElement('tr');
    headers.forEach(function (cell, index) {
      var th = document.createElement('th');
      var heading = document.createElement('div'); heading.className = 'ett-heading';
      var button = document.createElement('button'); button.type = 'button'; button.className = 'ett-sort'; button.textContent = cell.value || ('Column ' + (index + 1)); button.dataset.column = index;
      var filter = document.createElement('input'); filter.type = 'search'; filter.className = 'ett-filter'; filter.placeholder = 'Filter'; filter.dataset.column = index;
      var resizer = document.createElement('span'); resizer.className = 'ett-resizer'; resizer.dataset.column = index;
      heading.appendChild(button); th.appendChild(heading); th.appendChild(filter); th.appendChild(resizer); headRow.appendChild(th); filters[index] = filter;
      var label = document.createElement('label'), check = document.createElement('input'); check.type = 'checkbox'; check.checked = true; check.dataset.column = index;
      label.appendChild(check); label.appendChild(document.createTextNode(' ' + (cell.value || ('Column ' + (index + 1))))); columnsMenu.appendChild(label);
    });
    head.appendChild(headRow); table.appendChild(head);
    var body = document.createElement('tbody'); table.appendChild(body); wrap.appendChild(table); shell.appendChild(toolbar); shell.appendChild(wrap);
    source.parentNode.replaceChild(shell, source);

    function isVisible(row) {
      var all = text(row).toLocaleLowerCase();
      if (search.value && all.indexOf(search.value.toLocaleLowerCase()) === -1) return false;
      return filters.every(function (filter, index) { return !filter.value || (row[index] && row[index].value.toLocaleLowerCase().indexOf(filter.value.toLocaleLowerCase()) !== -1); });
    }
    function visibleRows() { return data.filter(isVisible); }
    function render() {
      var rows = visibleRows();
      if (sort.column >= 0) rows.sort(function (a, b) {
        var av = parseValue(a[sort.column].value), bv = parseValue(b[sort.column].value);
        var result = av.kind === bv.kind ? (av.value > bv.value ? 1 : av.value < bv.value ? -1 : 0) : a[sort.column].value.localeCompare(b[sort.column].value);
        return result * sort.direction;
      });
      body.textContent = '';
      rows.forEach(function (row, rowIndex) {
        var tr = document.createElement('tr'); tr.dataset.row = rowIndex;
        row.forEach(function (cell, colIndex) {
          var td = document.createElement('td'); td.textContent = cell.value; td.dataset.column = colIndex;
          if (cell.className) td.className = cell.className;
          if (cell.style) td.setAttribute('style', cell.style);
          if (cell.align) td.setAttribute('align', cell.align);
          tr.appendChild(td);
        });
        body.appendChild(tr);
      });
      count.textContent = rows.length + ' of ' + data.length + ' rows';
      Array.prototype.forEach.call(headRow.querySelectorAll('.ett-sort'), function (button) {
        var col = +button.dataset.column;
        button.textContent = (headers[col].value || ('Column ' + (col + 1))) + (sort.column === col ? (sort.direction > 0 ? ' ▲' : ' ▼') : '');
      });
      selected = null;
    }
    function selectTo(cell) {
      if (!selected) return;
      var startRow = +selected.dataset.row, startCol = +selected.dataset.column, endRow = +cell.parentNode.dataset.row, endCol = +cell.dataset.column;
      Array.prototype.forEach.call(body.querySelectorAll('td'), function (td) {
        var r = +td.parentNode.dataset.row, c = +td.dataset.column;
        td.classList.toggle('ett-selected', r >= Math.min(startRow, endRow) && r <= Math.max(startRow, endRow) && c >= Math.min(startCol, endCol) && c <= Math.max(startCol, endCol));
      });
    }
    search.addEventListener('input', render); filters.forEach(function (filter) { filter.addEventListener('input', render); });
    clear.addEventListener('click', function () { search.value = ''; filters.forEach(function (filter) { filter.value = ''; }); render(); });
    columnsButton.addEventListener('click', function () { columnsMenu.classList.toggle('is-open'); });
    columnsMenu.addEventListener('change', function (event) {
      var column = +event.target.dataset.column, hidden = !event.target.checked;
      colgroup.children[column].classList.toggle('ett-hidden', hidden);
      headRow.children[column].classList.toggle('ett-hidden', hidden);
      Array.prototype.forEach.call(table.querySelectorAll('[data-column="' + column + '"]'), function (element) { element.classList.toggle('ett-hidden', hidden); });
    });
    headRow.addEventListener('click', function (event) { if (!event.target.classList.contains('ett-sort')) return; var col = +event.target.dataset.column; sort.direction = sort.column === col ? -sort.direction : 1; sort.column = col; render(); });
    body.addEventListener('pointerdown', function (event) { if (event.target.tagName !== 'TD') return; selected = event.target; selectTo(event.target); body.setPointerCapture(event.pointerId); });
    body.addEventListener('pointermove', function (event) { if (!selected) return; var element = document.elementFromPoint(event.clientX, event.clientY); if (element && element.tagName === 'TD') selectTo(element); });
    body.addEventListener('pointerup', function () { selected = null; });
    document.addEventListener('copy', function (event) {
      var cells = Array.prototype.slice.call(body.querySelectorAll('.ett-selected'));
      if (!cells.length) return;
      var byRow = {};
      cells.forEach(function (cell) { var row = cell.parentNode.dataset.row; (byRow[row] || (byRow[row] = [])).push(cell); });
      var output = Object.keys(byRow).sort(function (a, b) { return +a - +b; }).map(function (row) { return byRow[row].sort(function (a, b) { return +a.dataset.column - +b.dataset.column; }).map(text).join('\t'); }).join('\n');
      event.clipboardData.setData('text/plain', output); event.preventDefault();
    });
    Array.prototype.forEach.call(headRow.querySelectorAll('.ett-resizer'), function (resizer) {
      resizer.addEventListener('pointerdown', function (event) {
        event.preventDefault(); var col = +resizer.dataset.column, startX = event.clientX, initial = headRow.children[col].getBoundingClientRect().width;
        function move(moveEvent) { colgroup.children[col].style.width = Math.max(72, initial + moveEvent.clientX - startX) + 'px'; }
        function up() { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); }
        window.addEventListener('pointermove', move); window.addEventListener('pointerup', up);
      });
    });
    render();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', enhance); else enhance();
}());
