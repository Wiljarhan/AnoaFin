/* Halaman My Finance */
(function (A) {
  'use strict';
  A.pages = A.pages || {};

  // status UI lokal (tidak disimpan)
  var form = { type: 'expense', category: 'Makanan' };
  var editingBudget = false;
  var focusName = false;

  function categoryOptions(type, selected) {
    var list = type === 'income' ? A.data.INCOME_CATS : A.data.EXPENSE_CATS;
    return list.map(function (c) {
      return '<option value="' + c + '"' + (c === selected ? ' selected' : '') + '>' + c + '</option>';
    }).join('');
  }

  function budgetRows(s) {
    return A.calc.categories(s).map(function (c) {
      var cls = c.level === 'over' ? 'danger' : (c.level === 'warn' ? 'warn' : '');
      var right = editingBudget
        ? '<input class="input budget-input" type="number" min="0" step="1000" inputmode="numeric" data-budget="' + c.name + '" value="' + c.limit + '" aria-label="Batas ' + c.name + '">'
        : A.rp(c.spent) + ' / ' + A.rp(c.limit);
      var note = c.level === 'over' ? c.pct + '% digunakan · melebihi batas' : c.pct + '% digunakan';
      return '<div class="budget-row">' +
        '<div class="top"><b>' + c.name + '</b><span>' + right + '</span></div>' +
        '<div class="bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + Math.min(c.pct, 100) + '" aria-label="' + c.name + '"><i class="' + cls + '" style="width:' + Math.min(c.pct, 100) + '%"></i></div>' +
        '<div class="pc ' + cls + '">' + note + '</div></div>';
    }).join('');
  }

  A.pages.finance = {
    render: function (s) {
      var c = A.calc;
      var txs = s.transactions.slice().sort(function (a, b) { return b.ts - a.ts; });
      var history = txs.length ? txs.map(function (t) {
        return '<li><div><div class="name">' + A.esc(t.name) + '</div><div class="cat">' + A.esc(t.category) + '</div></div>' +
          '<div class="row-end"><div class="amt' + (t.type === 'income' ? ' pos' : '') + '">' + A.signed(t.type, t.amount) + '</div>' +
          '<button class="icon-btn" type="button" data-del="' + t.id + '" aria-label="Hapus transaksi ' + A.esc(t.name) + '" title="Hapus">×</button></div></li>';
      }).join('') : '<li><p class="empty">Belum ada transaksi. Tambahkan transaksi pertama Anda di atas.</p></li>';

      var budgetActions = editingBudget
        ? '<div class="edit-actions"><button class="btn btn-dark btn-sm" type="button" id="budget-save">Simpan batas</button>' +
          '<button class="btn btn-soft btn-sm" type="button" id="budget-cancel">Batal</button></div><p class="error" id="budget-error" role="alert"></p>'
        : '';

      return '' +
        '<div class="page-head"><div><p class="eyebrow">Personal Money Management</p><h1 class="page-title">My Finance</h1></div>' +
        '<span class="pill">' + A.esc(s.period) + '</span></div>' +

        '<div class="grid-3">' +
          '<div class="stat"><div class="label">Available Balance</div><div class="value" data-testid="balance">' + A.rp(c.balance(s)) + '</div><div class="sub">Saldo simulasi</div></div>' +
          '<div class="stat"><div class="label">Total Income</div><div class="value" data-testid="income">' + A.rp(c.income(s)) + '</div><div class="sub">Pemasukan bulan ini</div></div>' +
          '<div class="stat"><div class="label">Total Expenses</div><div class="value" data-testid="expenses">' + A.rp(c.expenses(s)) + '</div><div class="sub">Pengeluaran bulan ini</div></div>' +
        '</div>' +

        '<h2 class="section">Add Transaction</h2>' +
        '<form class="card" id="tx-form" novalidate>' +
          '<div class="field-row">' +
            '<div class="field"><label for="tx-type">Transaction type</label><select class="input" id="tx-type">' +
              '<option value="expense"' + (form.type === 'expense' ? ' selected' : '') + '>Pengeluaran</option>' +
              '<option value="income"' + (form.type === 'income' ? ' selected' : '') + '>Pemasukan</option></select></div>' +
            '<div class="field"><label for="tx-cat">Category</label><select class="input" id="tx-cat">' + categoryOptions(form.type, form.category) + '</select></div>' +
          '</div>' +
          '<div class="field"><label for="tx-name">Transaction name</label><input class="input" id="tx-name" type="text" maxlength="60" placeholder="Contoh: Makan siang" autocomplete="off"></div>' +
          '<div class="field"><label for="tx-amount">Amount (Rp)</label><input class="input" id="tx-amount" type="number" min="1" step="1" inputmode="numeric" placeholder="Contoh: 25000"></div>' +
          '<p class="error" id="tx-error" role="alert"></p>' +
          '<button class="btn btn-dark" type="submit">+ Save Transaction</button>' +
        '</form>' +

        '<div class="section-row" id="budget"><h2 class="section">Monthly Budget Allocation</h2>' +
          (editingBudget ? '' : '<button class="link-btn" type="button" id="budget-edit">Ubah batas</button>') + '</div>' +
        '<div class="card">' + budgetRows(s) +
          '<div class="total-row"><span>Total budget</span><span data-testid="budget-total">' + A.rp(c.budgetTotal(s)) + '</span></div>' +
          budgetActions +
        '</div>' +

        '<h2 class="section">Transaction History</h2>' +
        '<div class="card"><ul class="list" id="tx-list">' + history + '</ul></div>';
    },

    bind: function (root) {
      var typeEl = root.querySelector('#tx-type');
      var catEl = root.querySelector('#tx-cat');
      var nameEl = root.querySelector('#tx-name');
      var amountEl = root.querySelector('#tx-amount');
      var errEl = root.querySelector('#tx-error');

      typeEl.addEventListener('change', function () {
        form.type = typeEl.value;
        form.category = form.type === 'income' ? A.data.INCOME_CATS[0] : A.data.EXPENSE_CATS[0];
        catEl.innerHTML = categoryOptions(form.type, form.category);
      });
      catEl.addEventListener('change', function () { form.category = catEl.value; });

      root.querySelector('#tx-form').addEventListener('submit', function (e) {
        e.preventDefault();
        nameEl.classList.remove('invalid');
        amountEl.classList.remove('invalid');
        focusName = true; // store memicu render ulang secara sinkron; fokus dikembalikan ke kolom nama
        var res = A.actions.addTransaction({ type: form.type, category: form.category, name: nameEl.value, amount: amountEl.value });
        if (!res.ok) {
          focusName = false;
          errEl.textContent = res.msg;
          (res.field === 'name' ? nameEl : amountEl).classList.add('invalid');
          (res.field === 'name' ? nameEl : amountEl).focus();
          return;
        }
        A.toast('Transaksi tersimpan');
      });

      root.querySelectorAll('[data-del]').forEach(function (b) {
        b.addEventListener('click', function () {
          A.actions.deleteTransaction(b.getAttribute('data-del'));
          A.toast('Transaksi dihapus');
        });
      });

      var edit = root.querySelector('#budget-edit');
      if (edit) edit.addEventListener('click', function () { editingBudget = true; A.rerender(); });

      var cancel = root.querySelector('#budget-cancel');
      if (cancel) cancel.addEventListener('click', function () { editingBudget = false; A.rerender(); });

      var save = root.querySelector('#budget-save');
      if (save) save.addEventListener('click', function () {
        var vals = {};
        root.querySelectorAll('[data-budget]').forEach(function (i) { vals[i.getAttribute('data-budget')] = i.value; });
        var res = A.actions.setBudgets(vals);
        if (!res.ok) { root.querySelector('#budget-error').textContent = res.msg; return; }
        editingBudget = false;
        A.rerender();
        A.toast('Batas anggaran diperbarui');
      });

      if (focusName) { focusName = false; nameEl.focus(); }
    },

    leave: function () { editingBudget = false; }
  };
})(window.ANOA);
