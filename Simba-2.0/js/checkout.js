/* ============================================================
   Simba 2.0 — Simulated checkout (Path A, client-side only)
   Drives the existing checkout.html DOM. No backend required:
   reads the cart from localStorage, simulates a MoMo deposit
   payment, persists a simulated order, and shows confirmation.
   Real payment/integration is intentionally NOT performed here
   (see roadmap: backend track wires this to the API + MoMo).
   ============================================================ */
(function () {
  "use strict";

  // ---- config ----------------------------------------------------------
  var DEPOSIT_RATE = 0.30;            // 30% deposit now, balance on delivery
  var CART_KEY = "simba_cart";
  var ORDERS_KEY = "simba_orders";

  var BRANCHES = [
    { id: "nyabugogo", name: "Simba Nyabugogo", area: "Nyabugogo, Kigali" },
    { id: "kisimenti", name: "Simba Kisimenti", area: "Remera, Kigali" },
    { id: "town",      name: "Simba Town",      area: "CBD, Kigali" }
  ];

  var SLOTS = [
    { id: "t1", label: "Today",    time: "14:00 – 16:00", avail: true },
    { id: "t2", label: "Today",    time: "16:00 – 18:00", avail: true },
    { id: "t3", label: "Tomorrow", time: "09:00 – 11:00", avail: true },
    { id: "t4", label: "Tomorrow", time: "11:00 – 13:00", avail: false }
  ];

  // ---- state -----------------------------------------------------------
  var cart = [];
  var selectedBranch = null;
  var selectedSlot = null;
  var pin = "";
  var paying = false;

  // ---- helpers ---------------------------------------------------------
  function $(id) { return document.getElementById(id); }
  function fmt(n) { return Math.round(n).toLocaleString("en-US") + " RWF"; }
  function readCart() {
    try { return JSON.parse(localStorage.getItem(CART_KEY) || "[]") || []; }
    catch (e) { return []; }
  }
  function subtotal() { return cart.reduce(function (s, i) { return s + (i.price || 0) * (i.qty || 0); }, 0); }
  function genRef() {
    var n = Math.floor(100000 + Math.random() * 900000);
    return "SB-" + n;
  }
  function validPhone(v) {
    // Rwandan mobile: 07XXXXXXXX, +2507XXXXXXXX, 2507XXXXXXXX
    return /^(\+?250|0)7\d{8}$/.test((v || "").replace(/\s+/g, ""));
  }

  // ---- render: order summary ------------------------------------------
  function renderSummary() {
    var wrap = $("summary-items");
    if (!wrap) return;
    if (!cart.length) {
      wrap.innerHTML = '<p style="color:#888;font-size:14px;">Your cart is empty. ' +
        '<a href="shop.html" style="color:var(--orange);font-weight:600;">Start shopping →</a></p>';
    } else {
      wrap.innerHTML = cart.map(function (i) {
        var img = i.image
          ? '<img src="' + i.image + '" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:10px;" ' +
            'onerror="this.style.display=\'none\'"/>'
          : "🛒";
        return '<div class="sum-item" style="display:flex;gap:10px;align-items:center;margin-bottom:10px;">' +
          '<div class="sum-img">' + img +
          '<span class="sum-qty">' + (i.qty || 0) + '</span></div>' +
          '<div style="flex:1;min-width:0;">' +
          '<div style="font-size:13px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">' +
          (i.name || "Item") + '</div>' +
          '<div style="font-size:12px;color:#888;">' + fmt(i.price || 0) + ' × ' + (i.qty || 0) + '</div>' +
          '</div>' +
          '<div style="font-size:13px;font-weight:700;">' + fmt((i.price || 0) * (i.qty || 0)) + '</div>' +
          '</div>';
      }).join("");
    }

    var sub = subtotal();
    var deposit = Math.round(sub * DEPOSIT_RATE);
    var balance = sub - deposit;
    if ($("sum-subtotal")) $("sum-subtotal").textContent = fmt(sub);
    if ($("sum-total")) $("sum-total").textContent = fmt(sub);
    if ($("sum-deposit")) $("sum-deposit").textContent = fmt(deposit);
    if ($("sum-balance")) $("sum-balance").textContent = fmt(balance);
    if ($("deposit-note")) {
      $("deposit-note").textContent =
        "Pay a " + Math.round(DEPOSIT_RATE * 100) + "% deposit (" + fmt(deposit) +
        ") now via Mobile Money. Pay the balance (" + fmt(balance) + ") on delivery.";
    }
  }

  // ---- render: branches & slots ---------------------------------------
  function renderBranches() {
    var grid = $("branch-grid");
    if (!grid) return;
    grid.innerHTML = BRANCHES.map(function (b) {
      return '<div class="branch-option" data-id="' + b.id + '">' +
        '<div style="font-weight:700;font-size:14px;">' + b.name + '</div>' +
        '<div style="font-size:12px;color:#888;">' + b.area + '</div>' +
        '<div class="branch-badge">✓ Open now</div>' +
        '<div class="branch-check">✓</div>' +
        '</div>';
    }).join("");
    Array.prototype.forEach.call(grid.querySelectorAll(".branch-option"), function (el) {
      el.addEventListener("click", function () {
        Array.prototype.forEach.call(grid.querySelectorAll(".branch-option"),
          function (x) { x.classList.remove("selected"); });
        el.classList.add("selected");
        selectedBranch = el.getAttribute("data-id");
      });
    });
    // default-select first
    var first = grid.querySelector(".branch-option");
    if (first) { first.classList.add("selected"); selectedBranch = BRANCHES[0].id; }
  }

  function renderSlots() {
    var grid = $("slot-grid");
    if (!grid) return;
    grid.innerHTML = SLOTS.map(function (s) {
      return '<div class="slot-btn' + (s.avail ? "" : " unavail") + '" data-id="' + s.id + '"' +
        (s.avail ? "" : ' aria-disabled="true"') + '>' +
        '<div style="font-size:12px;font-weight:700;">' + s.label + '</div>' +
        '<div style="font-size:12px;color:#888;">' + s.time + '</div>' +
        (s.avail ? "" : '<div style="font-size:10px;color:#c0392b;">Full</div>') +
        '</div>';
    }).join("");
    Array.prototype.forEach.call(grid.querySelectorAll(".slot-btn"), function (el) {
      if (el.classList.contains("unavail")) return;
      el.addEventListener("click", function () {
        Array.prototype.forEach.call(grid.querySelectorAll(".slot-btn"),
          function (x) { x.classList.remove("selected"); });
        el.classList.add("selected");
        selectedSlot = el.getAttribute("data-id");
      });
    });
    var firstAvail = grid.querySelector(".slot-btn:not(.unavail)");
    if (firstAvail) {
      firstAvail.classList.add("selected");
      selectedSlot = firstAvail.getAttribute("data-id");
    }
  }

  // ---- progress steps --------------------------------------------------
  function setStep(step) {
    // step: 2 = details, 3 = payment, 4 = done
    function cls(el, c) { if (el) el.className = "prog-step " + c; }
    cls($("prog1"), "done");
    cls($("prog2"), step > 2 ? "done" : "active");
    cls($("prog3"), step > 3 ? "done" : (step === 3 ? "active" : "inactive"));
    cls($("prog4"), step === 4 ? "active" : "inactive");
    if ($("sep2")) $("sep2").style.background = step > 2 ? "var(--orange)" : "";
    if ($("sep3")) $("sep3").style.background = step > 3 ? "var(--orange)" : "";
  }

  // ---- numpad / PIN ----------------------------------------------------
  function renderNumpad() {
    var pad = $("numpad");
    if (!pad) return;
    var keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "⌫", "0"];
    pad.innerHTML = keys.map(function (k) {
      return '<button type="button" class="num-btn" data-k="' + k + '">' + k + "</button>";
    }).join("");
    Array.prototype.forEach.call(pad.querySelectorAll(".num-btn"), function (btn) {
      btn.addEventListener("click", function () { pressKey(btn.getAttribute("data-k")); });
    });
  }

  function pressKey(k) {
    if (paying) return;
    if (k === "⌫") pin = pin.slice(0, -1);
    else if (pin.length < 5 && /[0-9]/.test(k)) pin += k;
    renderPin();
    if (pin.length === 5) setTimeout(simulatePayment, 250);
  }

  function renderPin() {
    for (var i = 0; i < 5; i++) {
      var d = $("pd" + i);
      if (!d) continue;
      d.textContent = i < pin.length ? "•" : "";
      d.className = "pin-digit" + (i < pin.length ? " filled" : (i === pin.length ? " active" : ""));
    }
  }

  // ---- step transition: details -> payment ----------------------------
  window.goToPayment = function () {
    if (!cart.length) { alert("Your cart is empty."); return; }
    var name = ($("inp-name") && $("inp-name").value || "").trim();
    var phone = ($("inp-phone") && $("inp-phone").value || "").trim();
    var ok = true;

    if (!name) { showErr("err-name", "inp-name", true); ok = false; }
    else showErr("err-name", "inp-name", false);

    if (!validPhone(phone)) { showErr("err-phone", "inp-phone", true); ok = false; }
    else showErr("err-phone", "inp-phone", false);

    if (!selectedBranch) { alert("Please choose a pickup branch."); ok = false; }
    if (!selectedSlot) { alert("Please choose a delivery time slot."); ok = false; }
    if (!ok) return;

    var deposit = Math.round(subtotal() * DEPOSIT_RATE);
    if ($("momo-phone-display")) $("momo-phone-display").textContent = phone;
    if ($("momo-amount-display")) $("momo-amount-display").textContent = fmt(deposit);

    show("card-branch", false); show("card-slot", false); show("card-info", false);
    show("momo-panel", true);
    setStep(3);
    pin = ""; renderPin();
    var panel = $("momo-panel");
    if (panel && panel.scrollIntoView) panel.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  function showErr(errId, inpId, on) {
    var e = $(errId), i = $(inpId);
    if (e) e.style.display = on ? "block" : "none";
    if (i) i.classList.toggle("error", !!on);
  }

  // ---- simulated MoMo payment -----------------------------------------
  function simulatePayment() {
    if (paying) return;
    paying = true;
    var wrap = $("momo-prog-wrap"), bar = $("momo-prog-bar"), status = $("momo-status");
    if (wrap) wrap.style.display = "block";
    var stages = [
      [10, "Sending payment request to your phone…"],
      [45, "Waiting for you to approve on MoMo…"],
      [80, "Confirming payment…"],
      [100, "Payment approved ✓"]
    ];
    var idx = 0;
    function tick() {
      if (idx >= stages.length) { finishOrder(); return; }
      var s = stages[idx++];
      if (bar) bar.style.width = s[0] + "%";
      if (status) status.textContent = s[1];
      setTimeout(tick, 700);
    }
    tick();
  }

  // ---- persist order + confirmation -----------------------------------
  function finishOrder() {
    var sub = subtotal();
    var deposit = Math.round(sub * DEPOSIT_RATE);
    var ref = genRef();
    var branch = BRANCHES.filter(function (b) { return b.id === selectedBranch; })[0] || {};
    var slot = SLOTS.filter(function (s) { return s.id === selectedSlot; })[0] || {};

    var order = {
      ref: ref,
      date: new Date().toISOString(),
      items: cart,
      subtotal: sub,
      total: sub,
      deposit: deposit,
      balance: sub - deposit,
      branch: branch.name || "",
      slot: (slot.label || "") + " " + (slot.time || ""),
      customer: {
        name: ($("inp-name") && $("inp-name").value || "").trim(),
        phone: ($("inp-phone") && $("inp-phone").value || "").trim(),
        notes: ($("inp-notes") && $("inp-notes").value || "").trim()
      },
      payment: { method: "momo", status: "deposit_paid", simulated: true },
      status: "confirmed"
    };

    try {
      var all = JSON.parse(localStorage.getItem(ORDERS_KEY) || "[]");
      all.unshift(order);
      localStorage.setItem(ORDERS_KEY, JSON.stringify(all));
    } catch (e) { /* ignore persistence errors */ }

    // clear cart
    try {
      localStorage.removeItem(CART_KEY);
      localStorage.setItem("simba_cart_count", "0");
    } catch (e) { /* ignore */ }

    // show confirmation
    show("momo-panel", false);
    show("success-screen", true);
    setStep(4);
    if ($("order-ref")) $("order-ref").textContent = ref;
    if ($("success-msg")) {
      $("success-msg").textContent =
        "Thank you, " + (order.customer.name || "customer") + "! Your deposit of " +
        fmt(deposit) + " was received. Pick up at " + (order.branch || "your branch") +
        " (" + order.slot + "). Balance due on delivery: " + fmt(order.balance) + ".";
    }
    var actions = document.querySelector(".success-actions");
    if (actions) {
      actions.innerHTML =
        '<a href="orders.html" class="btn-orange" style="text-decoration:none;display:inline-block;">View my orders</a> ' +
        '<a href="shop.html" class="btn-ghost" style="text-decoration:none;display:inline-block;">Continue shopping</a>';
    }
    var screen = $("success-screen");
    if (screen && screen.scrollIntoView) screen.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  // ---- visibility helper ----------------------------------------------
  function show(id, on) {
    var el = $(id);
    if (el) el.style.display = on ? "" : "none";
  }

  // ---- init ------------------------------------------------------------
  function init() {
    cart = readCart();
    renderSummary();
    renderBranches();
    renderSlots();
    renderNumpad();
    renderPin();
    show("momo-panel", false);
    show("success-screen", false);
    setStep(2);
    if (!cart.length && $("btn-pay")) {
      $("btn-pay").setAttribute("disabled", "disabled");
      $("btn-pay").style.opacity = "0.5";
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
