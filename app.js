  /* =========================================================
     DINGEL HAFIZIA MADRASA тАФ PROFESSIONAL ERP
     app.js тАФ PART 1/3

     PART 1:
     тАв Core configuration
     тАв Local data store
     тАв Firebase connection
     тАв Utility functions
     тАв Navigation
     тАв Dashboard
     тАв Student data helpers

     PART 2:
     тАв Admission
     тАв Student Profile
     тАв Fees
     тАв Due Management

     PART 3:
     тАв Income
     тАв Expense
     тАв Daily / Monthly / Yearly Accounts
     тАв Reports
     тАв Settings
     ========================================================= */

  const APP_NAME = "Dingel Hafizia Madrasa";
  const STORAGE_KEY = "dingel_hafizia_professional_erp_v1";

  /* =========================================================
     DEFAULT DATA
     ========================================================= */

  const DEFAULT_DATA = {
    settings: {
      madrasaName: "ржбрж┐ржЩрзНржЧрзЗрж▓ рж╣рж╛ржлрж┐ржЬрж┐ржпрж╝рж╛ ржорж╛ржжрзНрж░рж╛рж╕рж╛",
      englishName: "Dingel Hafizia Madrasa",
      address: "Dingel, West Bengal, India",
      phone: "",
      email: "",
      academicYear: "2026-27",
      currency: "INR",
      openingBalance: 0,
      logo: "logo.png"
    },

    students: [],
    fees: [],
    income: [],
    expenses: [],

    activity: [],

    meta: {
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  };

  let DATA = loadData();

  let currentPage = "dashboard";
  let searchText = "";

  let firebaseDB = null;
  let firebaseAuth = null;
  let firebaseStorage = null;
  let firebaseUser = null;

  /* =========================================================
     PAGE DEFINITIONS
     ========================================================= */

  const PAGES = [
    {
      id: "dashboard",
      title: "Dashboard",
      icon: "ЁЯУК"
    },
    {
      id: "students",
      title: "Student Management",
      icon: "ЁЯСитАНЁЯОУ"
    },
    {
      id: "fees",
      title: "Fees Management",
      icon: "ЁЯТ░"
    },
    {
      id: "due",
      title: "Due Management",
      icon: "ЁЯФ┤"
    },
    {
      id: "income",
      title: "Income",
      icon: "ЁЯУИ"
    },
    {
      id: "expense",
      title: "Expense",
      icon: "ЁЯУЙ"
    },
    {
      id: "accounts",
      title: "Madrasa Accounts",
      icon: "ЁЯзо"
    },
    {
      id: "reports",
      title: "Reports",
      icon: "ЁЯУС"
    },
    {
      id: "settings",
      title: "Madrasa Profile",
      icon: "ЁЯПл"
    }
  ];

  /* =========================================================
     DATA STORAGE
     ========================================================= */

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function loadData() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);

      if (!saved) {
        return clone(DEFAULT_DATA);
      }

      const parsed = JSON.parse(saved);

      return {
        ...clone(DEFAULT_DATA),
        ...parsed,

        settings: {
          ...clone(DEFAULT_DATA.settings),
          ...(parsed.settings || {})
        },

        students: Array.isArray(parsed.students)
          ? parsed.students
          : [],

        fees: Array.isArray(parsed.fees)
          ? parsed.fees
          : [],

        income: Array.isArray(parsed.income)
          ? parsed.income
          : [],

        expenses: Array.isArray(parsed.expenses)
          ? parsed.expenses
          : [],

        activity: Array.isArray(parsed.activity)
          ? parsed.activity
          : []
      };
    } catch (error) {
      console.error("Data loading failed:", error);

      return clone(DEFAULT_DATA);
    }
  }

  function saveLocal() {
    DATA.meta.updatedAt = new Date().toISOString();

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(DATA)
    );
  }

  /* =========================================================
     ID GENERATOR
     ========================================================= */

  function generateId(prefix = "ID") {
    const timestamp = Date.now().toString(36);

    const random = Math.random()
      .toString(36)
      .substring(2, 8);

    return `${prefix}-${timestamp}-${random}`.toUpperCase();
  }

  /* =========================================================
     DATE / TIME HELPERS
     ========================================================= */

  function today() {
    return new Date().toISOString().slice(0, 10);
  }

  function currentMonth() {
    return today().slice(0, 7);
  }

  function currentYear() {
    return today().slice(0, 4);
  }

  function formatDate(value) {
    if (!value) return "тАФ";

    const date = new Date(`${value}T00:00:00`);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  }

  function formatDateTime(value) {
    if (!value) return "тАФ";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  }

  function monthName(monthValue) {
    if (!monthValue) return "";

    const date = new Date(`${monthValue}-01T00:00:00`);

    return date.toLocaleDateString("en-IN", {
      month: "long",
      year: "numeric"
    });
  }

  /* =========================================================
     NUMBER / MONEY HELPERS
     ========================================================= */

  function number(value) {
    const result = Number(value);

    return Number.isFinite(result)
      ? result
      : 0;
  }

  function money(value) {
    const currency =
      DATA.settings.currency || "INR";

    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      maximumFractionDigits: 0
    }).format(number(value));
  }

  /* =========================================================
     SECURITY / HTML ESCAPING
     ========================================================= */

  function escapeHTML(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  /* =========================================================
     DOM HELPERS
     ========================================================= */

  function $(selector, parent = document) {
    return parent.querySelector(selector);
  }

  function $all(selector, parent = document) {
    return Array.from(
      parent.querySelectorAll(selector)
    );
  }

  /* =========================================================
     TOAST
     ========================================================= */

  function toast(message, type = "success") {
    let root = $("#toastRoot");

    if (!root) {
      root = document.createElement("div");
      root.id = "toastRoot";
      document.body.appendChild(root);
    }

    const item = document.createElement("div");

    item.className =
      `toast toast-${type}`;

    item.textContent = message;

    root.appendChild(item);

    setTimeout(() => {
      item.remove();
    }, 3000);
  }

  /* =========================================================
     ACTIVITY LOG
     ========================================================= */

  function addActivity(
    action,
    description,
    reference = ""
  ) {
    DATA.activity.unshift({
      id: generateId("ACT"),
      action,
      description,
      reference,
      date: today(),
      timestamp: new Date().toISOString()
    });

    DATA.activity =
      DATA.activity.slice(0, 500);
  }

  /* =========================================================
     ACTIVE STUDENTS
     ========================================================= */

  function activeStudents() {
    return DATA.students.filter(
      student =>
        student.status !== "inactive" &&
        student.status !== "deleted"
    );
  }

  /* =========================================================
     STUDENT FEE HELPERS
     ========================================================= */

  function studentMonthlyFee(student) {
    if (!student) return 0;

    if (student.type === "orphan") {
      return 0;
    }

    return number(student.monthlyFee);
  }

  function studentPaidForMonth(
    studentId,
    month = currentMonth()
  ) {
    return DATA.fees
      .filter(
        fee =>
          fee.studentId === studentId &&
          fee.month === month
      )
      .reduce(
        (total, fee) =>
          total + number(fee.paid),
        0
      );
  }

  function studentExpectedForMonth(
    student,
    month = currentMonth()
  ) {
    if (!student) return 0;

    return studentMonthlyFee(student);
  }

  function studentDueForMonth(
    student,
    month = currentMonth()
  ) {
    const expected =
      studentExpectedForMonth(
        student,
        month
      );

    const paid =
      studentPaidForMonth(
        student.id,
        month
      );

    return Math.max(
      0,
      expected - paid
    );
  }

  /* =========================================================
     GLOBAL FINANCIAL CALCULATIONS
     ========================================================= */

  function monthlyFeeCollection(
    month = currentMonth()
  ) {
    return DATA.fees
      .filter(fee => fee.month === month)
      .reduce(
        (total, fee) =>
          total + number(fee.paid),
        0
      );
  }

  function monthlyOtherIncome(
    month = currentMonth()
  ) {
    return DATA.income
      .filter(
        income =>
          String(income.date || "")
            .slice(0, 7) === month
      )
      .reduce(
        (total, income) =>
          total + number(income.amount),
        0
      );
  }

  function monthlyExpense(
    month = currentMonth()
  ) {
    return DATA.expenses
      .filter(
        expense =>
          String(expense.date || "")
            .slice(0, 7) === month
      )
      .reduce(
        (total, expense) =>
          total + number(expense.amount),
        0
      );
  }

  function monthlyExpectedFees(
    month = currentMonth()
  ) {
    return activeStudents()
      .reduce(
        (total, student) =>
          total +
          studentExpectedForMonth(
            student,
            month
          ),
        0
      );
  }

  function monthlyTotalIncome(
    month = currentMonth()
  ) {
    return (
      monthlyFeeCollection(month) +
      monthlyOtherIncome(month)
    );
  }

  function monthlyBalance(
    month = currentMonth()
  ) {
    return (
      monthlyTotalIncome(month) -
      monthlyExpense(month)
    );
  }

  function totalOutstandingDue(
    month = currentMonth()
  ) {
    return activeStudents()
      .reduce(
        (total, student) =>
          total +
          studentDueForMonth(
            student,
            month
          ),
        0
      );
  }

  /* =========================================================
     DASHBOARD METRICS
     ========================================================= */

  function dashboardMetrics() {
    const students =
      activeStudents();

    const month =
      currentMonth();

    return {
      totalStudents:
        students.length,

      orphanStudents:
        students.filter(
          student =>
            student.type === "orphan"
        ).length,

      poorStudents:
        students.filter(
          student =>
            student.type === "poor"
        ).length,

      generalStudents:
        students.filter(
          student =>
            student.type === "general"
        ).length,

      expectedFees:
        monthlyExpectedFees(month),

      collectedFees:
        monthlyFeeCollection(month),

      totalDue:
        totalOutstandingDue(month),

      otherIncome:
        monthlyOtherIncome(month),

      totalExpense:
        monthlyExpense(month),

      balance:
        monthlyBalance(month)
    };
  }

  /* =========================================================
     FIREBASE INITIALIZATION
     ========================================================= */

  function initializeFirebase() {
    const config =
      window.FIREBASE_CONFIG || {};

    if (
      !window.firebase ||
      !config.apiKey ||
      String(config.apiKey)
        .startsWith("PASTE_")
    ) {
      setCloudStatus(
        "Local / Offline"
      );

      return;
    }

    try {
      if (!firebase.apps.length) {
        firebase.initializeApp(config);
      }

      firebaseDB =
        firebase.firestore();

      firebaseAuth =
        firebase.auth();

      try {
        firebaseStorage =
          firebase.storage();
      } catch (storageError) {
        console.warn(
          "Firebase Storage unavailable:",
          storageError
        );
      }

      firebaseAuth.onAuthStateChanged(
        async user => {
          firebaseUser = user;

          if (user) {
            setCloudStatus(
              "Firebase synced"
            );

            await downloadCloudData();
          } else {
            setCloudStatus(
              "Local / Offline"
            );
          }
        }
      );
    } catch (error) {
      console.error(
        "Firebase initialization failed:",
        error
      );

      setCloudStatus(
        "Firebase unavailable"
      );
    }
  }

  function setCloudStatus(status) {
    const element =
      $("#cloudState");

    if (element) {
      element.textContent =
        status;
    }
  }

  /* =========================================================
     FIREBASE DOWNLOAD
     ========================================================= */

  async function downloadCloudData() {
    if (
      !firebaseDB ||
      !firebaseUser
    ) {
      return;
    }

    try {
      const snapshot =
        await firebaseDB
          .collection("madrasa")
          .doc("erp")
          .get();

      if (snapshot.exists) {
        const cloudData =
          snapshot.data();

        DATA = {
          ...clone(DEFAULT_DATA),
          ...cloudData,

          settings: {
            ...clone(
              DEFAULT_DATA.settings
            ),
            ...(cloudData.settings || {})
          },

          students:
            Array.isArray(
              cloudData.students
            )
              ? cloudData.students
              : [],

          fees:
            Array.isArray(
              cloudData.fees
            )
              ? cloudData.fees
              : [],

          income:
            Array.isArray(
              cloudData.income
            )
              ? cloudData.income
              : [],

          expenses:
            Array.isArray(
              cloudData.expenses
            )
              ? cloudData.expenses
              : [],

          activity:
            Array.isArray(
              cloudData.activity
            )
              ? cloudData.activity
              : []
        };

        saveLocal();

        render();
      } else {
        await uploadCloudData();
      }
    } catch (error) {
      console.error(
        "Firebase download error:",
        error
      );

      toast(
        "Cloud data load failed. Local data kept.",
        "error"
      );
    }
  }

  /* =========================================================
     FIREBASE UPLOAD
     ========================================================= */

  async function uploadCloudData() {
    saveLocal();

    if (
      !firebaseDB ||
      !firebaseUser
    ) {
      return;
    }

    try {
      await firebaseDB
        .collection("madrasa")
        .doc("erp")
        .set(DATA);

      setCloudStatus(
        "Firebase synced"
      );
    } catch (error) {
      console.error(
        "Firebase upload error:",
        error
      );

      setCloudStatus(
        "Local / Offline"
      );
    }
  }

  /* =========================================================
     SAVE ALL DATA
     ========================================================= */

  async function persistData(
    renderAfter = true
  ) {
    saveLocal();

    if (
      firebaseDB &&
      firebaseUser
    ) {
      await uploadCloudData();
    }

    if (renderAfter) {
      render();
    }
  }

  /* =========================================================
     NAVIGATION
     ========================================================= */

  function renderNavigation() {
    const nav =
      $("#nav");

    if (!nav) return;

    nav.innerHTML =
      PAGES.map(page => `
        <button
          class="navbtn ${
            currentPage === page.id
              ? "active"
              : ""
          }"
          data-page="${page.id}"
          type="button"
        >
          <span>${page.icon}</span>
          <span>${page.title}</span>
        </button>
      `).join("");
  }

  function navigate(page) {
    const exists =
      PAGES.some(
        item => item.id === page
      );

    if (!exists) {
      page = "dashboard";
    }

    currentPage = page;
    searchText = "";

    closeModal();

    render();

    closeMobileSidebar();
  }

  /* =========================================================
     TOP BAR
     ========================================================= */

  function updateTopBar() {
    const page =
      PAGES.find(
        item =>
          item.id === currentPage
      );

    const title =
      $("#pageTitle");

    if (title) {
      title.textContent =
        page?.title ||
        APP_NAME;
    }

    const dateText =
      $("#dateText");

    if (dateText) {
      dateText.textContent =
        new Date()
          .toLocaleDateString(
            "bn-BD",
            {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric"
            }
          );
    }
  }

  /* =========================================================
     DASHBOARD VIEW
     ========================================================= */

  function dashboardView() {
    const metrics =
      dashboardMetrics();

    const recentFees =
      DATA.fees
        .slice()
        .sort(
          (a, b) =>
            String(b.date)
              .localeCompare(
                String(a.date)
              )
        )
        .slice(0, 6);

    const recentIncome =
      DATA.income
        .slice()
        .sort(
          (a, b) =>
            String(b.date)
              .localeCompare(
                String(a.date)
              )
        )
        .slice(0, 4);

    const recentExpense =
      DATA.expenses
        .slice()
        .sort(
          (a, b) =>
            String(b.date)
              .localeCompare(
                String(a.date)
              )
        )
        .slice(0, 4);

    return `
      <div class="page">

        <section class="hero">

          <div>
            <div class="eyebrow">
              PROFESSIONAL MADRASA MANAGEMENT
            </div>

            <h1>
              ржЖрж╕рж╕рж╛рж▓рж╛ржорзБ ржЖрж▓рж╛ржЗржХрзБржо ЁЯСЛ
            </h1>

            <p>
              ${escapeHTML(
                DATA.settings.madrasaName
              )}
              тАФ Student, Fees ржПржмржВ Madrasa Accounts
              ржПржХ ржЬрж╛рзЯржЧрж╛рзЯ ржкрж░рж┐ржЪрж╛рж▓ржирж╛ ржХрж░рзБржиред
            </p>
          </div>

          <button
            class="btn light"
            data-action="new-student"
            type="button"
          >
            я╝Л ржирждрзБржи ржнрж░рзНрждрж┐
          </button>

        </section>

        <section class="stats">

          ${dashboardStat(
            "ЁЯСитАНЁЯОУ",
            "ржорзЛржЯ ржЫрж╛рждрзНрж░",
            metrics.totalStudents
          )}

          ${dashboardStat(
            "ЁЯзТ",
            "ржПрждрж┐ржо",
            metrics.orphanStudents
          )}

          ${dashboardStat(
            "ЁЯТ░",
            "ржПржЗ ржорж╛рж╕рзЗрж░ ржлрж┐",
            money(
              metrics.collectedFees
            )
          )}

          ${dashboardStat(
            "ЁЯФ┤",
            "ржорзЛржЯ ржмржХрзЗржпрж╝рж╛",
            money(
              metrics.totalDue
            ),
            "red"
          )}

          ${dashboardStat(
            "ЁЯУИ",
            "ржЕржирзНржпрж╛ржирзНржп ржЖржпрж╝",
            money(
              metrics.otherIncome
            ),
            "green"
          )}

          ${dashboardStat(
            "ЁЯУЙ",
            "ржПржЗ ржорж╛рж╕рзЗрж░ ржЦрж░ржЪ",
            money(
              metrics.totalExpense
            ),
            "red"
          )}

          ${dashboardStat(
            "ЁЯТ╝",
            "ржорж╛рж╕рж┐ржХ Balance",
            money(
              metrics.balance
            )
          )}

        </section>

        <section class="grid2">

          <div class="card">

            <div class="cardhead">
              <b>
                Quick Actions
              </b>
            </div>

            <div class="quick">

              <button
                type="button"
                data-action="new-student"
              >
                ЁЯСитАНЁЯОУ
                <span>Student Admission</span>
              </button>

              <button
                type="button"
                data-action="collect-fee"
              >
                ЁЯТ░
                <span>Collect Fee</span>
              </button>

              <button
                type="button"
                data-action="new-income"
              >
                ЁЯУИ
                <span>Add Income</span>
              </button>

              <button
                type="button"
                data-action="new-expense"
              >
                ЁЯУЙ
                <span>Add Expense</span>
              </button>

              <button
                type="button"
                data-page-action="accounts"
              >
                ЁЯзо
                <span>Madrasa Accounts</span>
              </button>

              <button
                type="button"
                data-page-action="reports"
              >
                ЁЯУС
                <span>Reports</span>
              </button>

            </div>

          </div>

          <div class="card">

            <div class="cardhead">

              <b>
                This Month
              </b>

              <span class="tag ok">
                ${currentMonth()}
              </span>

            </div>

            <div class="summary">

              <div>
                <span>
                  Expected Fee
                </span>

                <b>
                  ${money(
                    metrics.expectedFees
                  )}
                </b>
              </div>

              <div>
                <span>
                  Collected
                </span>

                <b class="green">
                  ${money(
                    metrics.collectedFees
                  )}
                </b>
              </div>

              <div>
                <span>
                  Due
                </span>

                <b class="red">
                  ${money(
                    metrics.totalDue
                  )}
                </b>
              </div>

              <div>
                <span>
                  Net Balance
                </span>

                <b>
                  ${money(
                    metrics.balance
                  )}
                </b>
              </div>

            </div>

          </div>

        </section>

        <section class="card">

          <div class="cardhead">

            <b>
              Recent Fee Collection
            </b>

            <button
              class="btn ghost"
              type="button"
              data-page-action="fees"
            >
              View All
            </button>

          </div>

          <div class="tablewrap">

            <table>

              <thead>

                <tr>
                  <th>Date</th>
                  <th>Student</th>
                  <th>Month</th>
                  <th>Paid</th>
                  <th>Due</th>
                  <th>Receipt</th>
                </tr>

              </thead>

              <tbody>

                ${
                  recentFees.length
                    ? recentFees
                        .map(
                          fee => `
                            <tr>

                              <td>
                                ${formatDate(
                                  fee.date
                                )}
                              </td>

                              <td>
                                <b>
                                  ${escapeHTML(
                                    fee.studentName ||
                                      "тАФ"
                                  )}
                                </b>

                                <small>
                                  ${escapeHTML(
                                    fee.studentId ||
                                      ""
                                  )}
                                </small>
                              </td>

                              <td>
                                ${escapeHTML(
                                  fee.month ||
                                    "тАФ"
                                )}
                              </td>

                              <td class="green">
                                <b>
                                  ${money(
                                    fee.paid
                                  )}
                                </b>
                              </td>

                              <td class="red">
                                ${money(
                                  fee.due
                                )}
                              </td>

                              <td>
                                ${escapeHTML(
                                  fee.receiptNumber ||
                                    "тАФ"
                                )}
                              </td>

                            </tr>
                          `
                        )
                        .join("")
                    : `
                      <tr>
                        <td colspan="6">
                          ${emptyState(
                            "ржПржЦржиржУ ржХрзЛржирзЛ fee collection ржирзЗржЗ"
                          )}
                        </td>
                      </tr>
                    `
                }

              </tbody>

            </table>

          </div>

        </section>

        <section class="grid2">

          <div class="card">

            <div class="cardhead">
              <b>
                Recent Income
              </b>
            </div>

            ${transactionMiniList(
              recentIncome,
              "income"
            )}

          </div>

          <div class="card">

            <div class="cardhead">
              <b>
                Recent Expense
              </b>
            </div>

            ${transactionMiniList(
              recentExpense,
              "expense"
            )}

          </div>

        </section>

      </div>
    `;
  }

  /* =========================================================
     DASHBOARD STAT CARD
     ========================================================= */

  function dashboardStat(
    icon,
    label,
    value,
    className = ""
  ) {
    return `
      <div class="stat">

        <div class="ico">
          ${icon}
        </div>

        <div>

          <small>
            ${label}
          </small>

          <strong
            class="${className}"
          >
            ${value}
          </strong>

        </div>

      </div>
    `;
  }

  /* =========================================================
     TRANSACTION MINI LIST
     ========================================================= */

  function transactionMiniList(
    items,
    type
  ) {
    if (!items.length) {
      return emptyState(
        "ржХрзЛржирзЛ transaction ржирзЗржЗ"
      );
    }

    return `
      <div class="transaction-list">

        ${items
          .map(
            item => `
              <div class="transaction-item">

                <div>

                  <b>
                    ${escapeHTML(
                      item.category ||
                        item.description ||
                        "Transaction"
                    )}
                  </b>

                  <small>
                    ${formatDate(
                      item.date
                    )}
                  </small>

                </div>

                <strong
                  class="${
                    type === "income"
                      ? "green"
                      : "red"
                  }"
                >
                  ${
                    type === "income"
                      ? "+"
                      : "-"
                  }
                  ${money(
                    item.amount
                  )}
                </strong>

              </div>
            `
          )
          .join("")}

      </div>
    `;
  }

  /* =========================================================
     EMPTY STATE
     ========================================================= */

  function emptyState(
    message
  ) {
    return `
      <div class="empty">
        <div
          style="
            font-size:32px;
            margin-bottom:8px;
          "
        >
          ЁЯУВ
        </div>

        <div>
          ${escapeHTML(
            message
          )}
        </div>
      </div>
    `;
  }

  /* =========================================================
     RENDER SYSTEM
     ========================================================= */

  function render() {
    renderNavigation();

    updateTopBar();

    const view =
      $("#view");

    if (!view) {
      return;
    }

    let html = "";

    switch (currentPage) {

      case "dashboard":
        html =
          dashboardView();
        break;

      /*
       * PART 2 WILL ADD:
       *
       * studentsView()
       * admissionForm()
       * studentProfile()
       * feesView()
       * dueView()
       */

      case "students":
        html =
          comingSoonView(
            "Student Management"
          );
        break;

      case "fees":
        html =
          comingSoonView(
            "Fees Management"
          );
        break;

      case "due":
        html =
          comingSoonView(
            "Due Management"
          );
        break;

      /*
       * PART 3 WILL ADD:
       *
       * Income
       * Expense
       * Accounts
       * Reports
       * Settings
       */

      case "income":
        html =
          comingSoonView(
            "Income Management"
          );
        break;

      case "expense":
        html =
          comingSoonView(
            "Expense Management"
          );
        break;

      case "accounts":
        html =
          comingSoonView(
            "Madrasa Accounts"
          );
        break;

      case "reports":
        html =
          comingSoonView(
            "Reports"
          );
        break;

      case "settings":
        html =
          comingSoonView(
            "Madrasa Profile"
          );
        break;

      default:
        html =
          dashboardView();
    }

    view.innerHTML =
      html;

    bindEvents();
  }

  /* =========================================================
     TEMPORARY VIEW
     ========================================================= */

  function comingSoonView(
    title
  ) {
    return `
      <div class="page">

        <div class="card">

          <div
            style="
              text-align:center;
              padding:70px 20px;
            "
          >

            <div
              style="
                font-size:52px;
                margin-bottom:15px;
              "
            >
              ЁЯЪз
            </div>

            <h2>
              ${escapeHTML(
                title
              )}
            </h2>

            <p
              style="
                color:var(--muted);
              "
            >
              ржПржЗ module-ржПрж░ complete
              professional code Part 2 / Part 3-ржП
              ржпрзБржХрзНржд рж╣ржмрзЗред
            </p>

          </div>

        </div>

      </div>
    `;
  }

  /* =========================================================
     MOBILE SIDEBAR
     ========================================================= */

  function closeMobileSidebar() {
    const sidebar =
      $("#sidebar");

    const overlay =
      $("#overlay");

    sidebar?.classList.remove(
      "open"
    );

    overlay?.classList.remove(
      "show"
    );
  }

  function openMobileSidebar() {
    const sidebar =
      $("#sidebar");

    const overlay =
      $("#overlay");

    sidebar?.classList.add(
      "open"
    );

    overlay?.classList.add(
      "show"
    );
  }

  /* =========================================================
     THEME
     ========================================================= */

  function initializeTheme() {
    const saved =
      localStorage.getItem(
        "dhm_theme"
      ) || "light";

    document.body.classList.toggle(
      "dark",
      saved === "dark"
    );
  }

  function toggleTheme() {
    const isDark =
      document.body.classList.contains(
        "dark"
      );

    document.body.classList.toggle(
      "dark",
      !isDark
    );

    localStorage.setItem(
      "dhm_theme",
      !isDark
        ? "dark"
        : "light"
    );
  }

  /* =========================================================
     MODAL SYSTEM
     ========================================================= */

  function openModal(
    title,
    content,
    size = ""
  ) {
    const root =
      $("#modalRoot");

    if (!root) return;

    root.innerHTML = `
      <div
        class="modal-back"
        data-modal-backdrop
      >

        <div
          class="modal ${size}"
        >

          <div class="modal-head">

            <h3>
              ${escapeHTML(
                title
              )}
            </h3>

            <button
              class="close"
              type="button"
              data-close-modal
            >
              ├Ч
            </button>

          </div>

          ${content}

        </div>

      </div>
    `;

    $("[data-close-modal]")?.addEventListener(
      "click",
      closeModal
    );

    $("[data-modal-backdrop]")?.addEventListener(
      "click",
      event => {
        if (
          event.target.dataset
            .modalBackdrop !==
          undefined
        ) {
          closeModal();
        }
      }
    );
  }

  function closeModal() {
    const root =
      $("#modalRoot");

    if (root) {
      root.innerHTML = "";
    }
  }

  /* =========================================================
     GENERIC CONFIRMATION
     ========================================================= */

  function confirmAction(
    message
  ) {
    return window.confirm(
      message
    );
  }

  /* =========================================================
     EXPORT JSON BACKUP
     ========================================================= */

  function exportBackup() {
    saveLocal();

    const blob =
      new Blob(
        [
          JSON.stringify(
            DATA,
            null,
            2
          )
        ],
        {
          type:
            "application/json"
        }
      );

    const url =
      URL.createObjectURL(
        blob
      );

    const anchor =
      document.createElement(
        "a"
      );

    anchor.href = url;

    anchor.download =
      `dingel-hafizia-backup-${today()}.json`;

    document.body.appendChild(
      anchor
    );

    anchor.click();

    anchor.remove();

    URL.revokeObjectURL(
      url
    );

    toast(
      "Backup downloaded"
    );
  }

  /* =========================================================
     BASIC EVENT BINDING
     ========================================================= */

  function bindEvents() {

    /* Navigation */

    $all(
      "[data-page]"
    ).forEach(button => {

      button.addEventListener(
        "click",
        () => {
          navigate(
            button.dataset.page
          );
        }
      );

    });

    /* Page action */

    $all(
      "[data-page-action]"
    ).forEach(button => {

      button.addEventListener(
        "click",
        () => {
          navigate(
            button.dataset.pageAction
          );
        }
      );

    });

    /* New student */

    $all(
      '[data-action="new-student"]'
    ).forEach(button => {

      button.addEventListener(
        "click",
        () => {
          openAdmissionForm();
        }
      );

    });

    /* Collect fee */

    $all(
      '[data-action="collect-fee"]'
    ).forEach(button => {

      button.addEventListener(
        "click",
        () => {
          openFeeForm();
        }
      );

    });

    /* Income */

    $all(
      '[data-action="new-income"]'
    ).forEach(button => {

      button.addEventListener(
        "click",
        () => {
          openIncomeForm();
        }
      );

    });

    /* Expense */

    $all(
      '[data-action="new-expense"]'
    ).forEach(button => {

      button.addEventListener(
        "click",
        () => {
          openExpenseForm();
        }
      );

    });

    /* Mobile menu */

    $("#menuBtn")?.addEventListener(
      "click",
      openMobileSidebar
    );

    $("#overlay")?.addEventListener(
      "click",
      closeMobileSidebar
    );

    /* Theme */

    $("#themeBtn")?.addEventListener(
      "click",
      toggleTheme
    );

    /* Print */

    $("#printBtn")?.addEventListener(
      "click",
      () => {
        window.print();
      }
    );

    /* Logout */

    $("#logoutBtn")?.addEventListener(
      "click",
      logoutFirebase
    );

  }

  /* =========================================================
     FIREBASE LOGOUT
     ========================================================= */

  async function logoutFirebase() {

    if (!firebaseAuth) {
      toast(
        "Local mode is active"
      );

      return;
    }

    try {

      await firebaseAuth.signOut();

      toast(
        "Logged out successfully"
      );

    } catch (error) {

      console.error(
        "Logout failed:",
        error
      );

      toast(
        "Logout failed",
        "error"
      );

    }

  }

  /* =========================================================
     PART 2 PLACEHOLDER FUNCTIONS
     ========================================================= */

  function openAdmissionForm() {
    toast(
      "Admission module will be added in Part 2"
    );
  }

  function openFeeForm() {
    toast(
      "Fee module will be added in Part 2"
    );
  }

  /* =========================================================
     PART 3 PLACEHOLDER FUNCTIONS
     ========================================================= */

  function openIncomeForm() {
    toast(
      "Income module will be added in Part 3"
    );
  }

  function openExpenseForm() {
    toast(
      "Expense module will be added in Part 3"
    );
  }

  /* =========================================================
     APPLICATION START
     ========================================================= */

  function initializeApp() {

    initializeTheme();

    render();

    initializeFirebase();

    console.log(
      `${APP_NAME} Professional ERP initialized.`
    );

  }

  /* =========================================================
     START
     ========================================================= */

  if (
    document.readyState ===
    "loading"
  ) {

    document.addEventListener(
      "DOMContentLoaded",
      initializeApp
    );

  } else {

    initializeApp();

  }

})();

/* =========================================================
   DINGEL HAFIZIA MADRASA ERP
   app.js тАФ PART 2/3

   MODULES:
   тАв Admission
   тАв Student Management
   тАв Professional Student Profile
   тАв Fees Management
   тАв Due Management
   тАв Receipt
   ========================================================= */


/* =========================================================
   STUDENT MANAGEMENT VIEW
   ========================================================= */

function studentsView() {

  let students = activeStudents();

  if (searchText.trim()) {

    const query =
      searchText
        .trim()
        .toLowerCase();

    students =
      students.filter(student => {

        const text = [
          student.name,
          student.nameEnglish,
          student.studentId,
          student.phone,
          student.className,
          student.father,
          student.mother,
          student.guardian
        ]
          .join(" ")
          .toLowerCase();

        return text.includes(query);

      });

  }

  return `
    <div class="page">

      ${pageHeader(
        "Student Management",
        "Admission, student profile, fees, due and complete records.",
        "я╝Л Add Student",
        "new-student"
      )}

      <div class="toolbar">

        <input
          id="studentSearch"
          value="${escapeHTML(searchText)}"
          placeholder="ЁЯФН Search student, ID, phone, class..."
        >

        <select id="studentClassFilter">

          <option value="">
            All Classes
          </option>

          <option value="HIFZ">
            HIFZ
          </option>

          <option value="MOKTOB">
            MOKTOB
          </option>

          <option value="ADNA ALIF">
            ADNA ALIF
          </option>

          <option value="ADNA BA">
            ADNA BA
          </option>

        </select>

        <select id="studentTypeFilter">

          <option value="">
            All Types
          </option>

          <option value="general">
            General
          </option>

          <option value="orphan">
            Orphan / ржПрждрж┐ржо
          </option>

          <option value="poor">
            Poor
          </option>

        </select>

      </div>

      <div class="mini-grid">

        <div class="mini-box">
          <small>Total Students</small>
          <strong>
            ${activeStudents().length}
          </strong>
        </div>

        <div class="mini-box">
          <small>General</small>
          <strong>
            ${
              activeStudents()
                .filter(
                  x => x.type === "general"
                ).length
            }
          </strong>
        </div>

        <div class="mini-box">
          <small>Orphan / ржПрждрж┐ржо</small>
          <strong>
            ${
              activeStudents()
                .filter(
                  x => x.type === "orphan"
                ).length
            }
          </strong>
        </div>

        <div class="mini-box">
          <small>Poor</small>
          <strong>
            ${
              activeStudents()
                .filter(
                  x => x.type === "poor"
                ).length
            }
          </strong>
        </div>

      </div>

      <div class="card tablewrap">

        <table>

          <thead>

            <tr>

              <th>Student</th>
              <th>ID</th>
              <th>Class</th>
              <th>Type</th>
              <th>Monthly Fee</th>
              <th>Phone</th>
              <th>Current Due</th>
              <th>Action</th>

            </tr>

          </thead>

          <tbody>

            ${
              students.length

                ? students
                    .map(
                      student =>
                        studentRow(
                          student
                        )
                    )
                    .join("")

                : `
                  <tr>

                    <td colspan="8">

                      ${emptyState(
                        "ржХрзЛржирзЛ student ржкрж╛ржУрзЯрж╛ ржпрж╛рзЯржирж┐"
                      )}

                    </td>

                  </tr>
                `
            }

          </tbody>

        </table>

      </div>

    </div>
  `;
}


/* =========================================================
   STUDENT TABLE ROW
   ========================================================= */

function studentRow(student) {

  const due =
    studentDueForMonth(
      student,
      currentMonth()
    );

  const fee =
    studentMonthlyFee(
      student
    );

  const typeClass =
    student.type === "orphan"
      ? "warn"
      : student.type === "poor"
      ? "ok"
      : "";

  return `
    <tr>

      <td>

        <div class="person">

          <div class="mini">

            ${
              escapeHTML(
                (
                  student.name ||
                  "?"
                ).charAt(0)
              )
            }

          </div>

          <div>

            <b>
              ${escapeHTML(
                student.name
              )}
            </b>

            <small>
              ${
                escapeHTML(
                  student.nameEnglish ||
                  ""
                )
              }
            </small>

          </div>

        </div>

      </td>

      <td>
        <b>
          ${escapeHTML(
            student.studentId ||
            "тАФ"
          )}
        </b>
      </td>

      <td>
        ${escapeHTML(
          student.className ||
          "тАФ"
        )}
      </td>

      <td>

        <span
          class="tag ${typeClass}"
        >
          ${escapeHTML(
            student.type ||
            "general"
          )}
        </span>

      </td>

      <td>
        ${money(fee)}
      </td>

      <td>
        ${escapeHTML(
          student.phone ||
          "тАФ"
        )}
      </td>

      <td>

        <span
          class="${
            due > 0
              ? "red"
              : "green"
          }"
        >
          ${money(due)}
        </span>

      </td>

      <td>

        <div
          style="
            display:flex;
            gap:6px;
            flex-wrap:wrap;
          "
        >

          <button
            class="btn ghost"
            type="button"
            data-view-student="${student.id}"
          >
            View
          </button>

          <button
            class="btn ghost"
            type="button"
            data-edit-student="${student.id}"
          >
            Edit
          </button>

        </div>

      </td>

    </tr>
  `;
}


/* =========================================================
   PAGE HEADER
   ========================================================= */

function pageHeader(
  title,
  description,
  buttonText = "",
  action = ""
) {

  return `
    <div class="head">

      <div>

        <h1>
          ${escapeHTML(title)}
        </h1>

        <p>
          ${escapeHTML(
            description
          )}
        </p>

      </div>

      ${
        buttonText
          ? `
            <button
              class="btn primary"
              type="button"
              data-action="${action}"
            >
              ${escapeHTML(
                buttonText
              )}
            </button>
          `
          : ""
      }

    </div>
  `;
}


/* =========================================================
   ADMISSION FORM
   ========================================================= */

function openAdmissionForm(
  existingStudent = null
) {

  const student =
    existingStudent || {};

  const isEdit =
    Boolean(existingStudent);

  const generatedId =
    student.studentId ||
    generateStudentId();

  const monthlyFee =
    student.monthlyFee ??
    0;

  openModal(
    isEdit
      ? "Edit Student"
      : "New Student Admission",

    `
      <form
        id="admissionForm"
      >

        <div class="card">

          <div class="cardhead">

            <b>
              ЁЯСитАНЁЯОУ Student Information
            </b>

          </div>

          <div class="form-grid three">

            <div class="field">

              <label>
                Student ID / Admission No.
              </label>

              <input
                id="adStudentId"
                value="${escapeHTML(
                  generatedId
                )}"
                required
              >

            </div>

            <div class="field">

              <label>
                Student Name ржмрж╛ржВрж▓рж╛ *
              </label>

              <input
                id="adName"
                value="${escapeHTML(
                  student.name ||
                  ""
                )}"
                required
              >

            </div>

            <div class="field">

              <label>
                English Name
              </label>

              <input
                id="adEnglishName"
                value="${escapeHTML(
                  student.nameEnglish ||
                  ""
                )}"
              >

            </div>

            <div class="field">

              <label>
                Class *
              </label>

              <select
                id="adClass"
                required
              >

                ${optionList(
                  [
                    "HIFZ",
                    "MOKTOB",
                    "ADNA ALIF",
                    "ADNA BA"
                  ],
                  student.className
                )}

              </select>

            </div>

            <div class="field">

              <label>
                Student Type *
              </label>

              <select
                id="adType"
                required
              >

                ${optionList(
                  [
                    "general",
                    "orphan",
                    "poor"
                  ],
                  student.type ||
                    "general"
                )}

              </select>

            </div>

            <div class="field">

              <label>
                Gender
              </label>

              <select id="adGender">

                ${optionList(
                  [
                    "Male",
                    "Female",
                    "Other"
                  ],
                  student.gender
                )}

              </select>

            </div>

            <div class="field">

              <label>
                Date of Birth
              </label>

              <input
                id="adDob"
                type="date"
                value="${escapeHTML(
                  student.dob ||
                  ""
                )}"
              >

            </div>

            <div class="field">

              <label>
                Admission Date
              </label>

              <input
                id="adAdmissionDate"
                type="date"
                value="${escapeHTML(
                  student.admissionDate ||
                  today()
                )}"
              >

            </div>

            <div class="field">

              <label>
                Monthly Fee
              </label>

              <input
                id="adMonthlyFee"
                type="number"
                min="0"
                value="${number(
                  monthlyFee
                )}"
              >

            </div>

          </div>

        </div>


        <div class="card">

          <div class="cardhead">

            <b>
              ЁЯСитАНЁЯСйтАНЁЯСж Guardian Information
            </b>

          </div>

          <div class="form-grid three">

            <div class="field">

              <label>
                Father's Name
              </label>

              <input
                id="adFather"
                value="${escapeHTML(
                  student.father ||
                  ""
                )}"
              >

            </div>

            <div class="field">

              <label>
                Mother's Name
              </label>

              <input
                id="adMother"
                value="${escapeHTML(
                  student.mother ||
                  ""
                )}"
              >

            </div>

            <div class="field">

              <label>
                Guardian Name
              </label>

              <input
                id="adGuardian"
                value="${escapeHTML(
                  student.guardian ||
                  ""
                )}"
              >

            </div>

            <div class="field">

              <label>
                Relation
              </label>

              <input
                id="adRelation"
                value="${escapeHTML(
                  student.relation ||
                  ""
                )}"
              >

            </div>

            <div class="field">

              <label>
                Guardian Phone
              </label>

              <input
                id="adPhone"
                inputmode="tel"
                value="${escapeHTML(
                  student.phone ||
                  ""
                )}"
              >

            </div>

            <div class="field">

              <label>
                Alternative Phone
              </label>

              <input
                id="adAltPhone"
                inputmode="tel"
                value="${escapeHTML(
                  student.alternativePhone ||
                  ""
                )}"
              >

            </div>

          </div>

        </div>


        <div class="card">

          <div class="cardhead">

            <b>
              ЁЯкк Identity Information
            </b>

          </div>

          <div class="form-grid">

            <div class="field">

              <label>
                Student Aadhaar
              </label>

              <input
                id="adAadhaar"
                inputmode="numeric"
                maxlength="12"
                value="${escapeHTML(
                  student.aadhaar ||
                  ""
                )}"
                placeholder="12 digit Aadhaar"
              >

            </div>

            <div class="field">

              <label>
                Guardian Aadhaar
              </label>

              <input
                id="adGuardianAadhaar"
                inputmode="numeric"
                maxlength="12"
                value="${escapeHTML(
                  student.guardianAadhaar ||
                  ""
                )}"
                placeholder="12 digit Aadhaar"
              >

            </div>

          </div>

        </div>


        <div class="card">

          <div class="cardhead">

            <b>
              ЁЯПа Address
            </b>

          </div>

          <div class="form-grid three">

            <div class="field">

              <label>
                Village / Locality
              </label>

              <input
                id="adVillage"
                value="${escapeHTML(
                  student.village ||
                  ""
                )}"
              >

            </div>

            <div class="field">

              <label>
                Post Office
              </label>

              <input
                id="adPost"
                value="${escapeHTML(
                  student.postOffice ||
                  ""
                )}"
              >

            </div>

            <div class="field">

              <label>
                Police Station
              </label>

              <input
                id="adPolice"
                value="${escapeHTML(
                  student.policeStation ||
                  ""
                )}"
              >

            </div>

            <div class="field">

              <label>
                District
              </label>

              <input
                id="adDistrict"
                value="${escapeHTML(
                  student.district ||
                  ""
                )}"
              >

            </div>

            <div class="field">

              <label>
                State
              </label>

              <input
                id="adState"
                value="${escapeHTML(
                  student.state ||
                  "West Bengal"
                )}"
              >

            </div>

            <div class="field">

              <label>
                PIN Code
              </label>

              <input
                id="adPin"
                inputmode="numeric"
                maxlength="6"
                value="${escapeHTML(
                  student.pin ||
                  ""
                )}"
              >

            </div>

            <div class="field full">

              <label>
                Full Address
              </label>

              <textarea
                id="adAddress"
                rows="3"
              >${escapeHTML(
                student.address ||
                ""
              )}</textarea>

            </div>

          </div>

        </div>


        <div class="card">

          <div class="cardhead">

            <b>
              ЁЯУЭ Additional Information
            </b>

          </div>

          <div class="form-grid">

            <div class="field">

              <label>
                Previous Institution
              </label>

              <input
                id="adPreviousInstitution"
                value="${escapeHTML(
                  student.previousInstitution ||
                  ""
                )}"
              >

            </div>

            <div class="field">

              <label>
                Previous Class
              </label>

              <input
                id="adPreviousClass"
                value="${escapeHTML(
                  student.previousClass ||
                  ""
                )}"
              >

            </div>

            <div class="field full">

              <label>
                Notes
              </label>

              <textarea
                id="adNotes"
                rows="3"
              >${escapeHTML(
                student.notes ||
                ""
              )}</textarea>

            </div>

          </div>

        </div>


        <div class="form-actions">

          <button
            type="button"
            class="btn ghost"
            data-close-modal
          >
            Cancel
          </button>

          <button
            type="submit"
            class="btn primary"
          >
            ${
              isEdit
                ? "Update Student"
                : "Save Admission"
            }
          </button>

        </div>

      </form>
    `,
    ""
  );


  $("#admissionForm")
    ?.addEventListener(
      "submit",
      async event => {

        event.preventDefault();

        const data =
          collectAdmissionForm();

        const validation =
          validateAdmission(
            data,
            existingStudent
          );

        if (!validation.valid) {

          toast(
            validation.message,
            "error"
          );

          return;
        }


        if (isEdit) {

          Object.assign(
            existingStudent,
            data
          );

          addActivity(
            "Student Updated",
            `Student ${data.name} profile updated.`,
            existingStudent.id
          );

          toast(
            "Student updated successfully"
          );

        } else {

          const newStudent = {
            id:
              generateId("STU"),

            ...data,

            status:
              "active",

            createdAt:
              new Date().toISOString(),

            updatedAt:
              new Date().toISOString()
          };

          DATA.students.push(
            newStudent
          );

          addActivity(
            "New Admission",
            `New student ${data.name} admitted.`,
            newStudent.id
          );

          toast(
            "Student admitted successfully"
          );
        }

        closeModal();

        await persistData();

      }
    );

}


/* =========================================================
   GENERATE STUDENT ID
   ========================================================= */

function generateStudentId() {

  const count =
    DATA.students.length + 1;

  return (
    "DHM-" +
    new Date()
      .getFullYear() +
    "-" +
    String(count)
      .padStart(4, "0")
  );
}


/* =========================================================
   SELECT OPTION HELPER
   ========================================================= */

function optionList(
  values,
  selected
) {

  return values
    .map(
      value => `
        <option
          value="${escapeHTML(
            value
          )}"
          ${
            String(value) ===
            String(selected)
              ? "selected"
              : ""
          }
        >
          ${escapeHTML(
            value
          )}
        </option>
      `
    )
    .join("");
}


/* =========================================================
   COLLECT ADMISSION FORM
   ========================================================= */

function collectAdmissionForm() {

  return {

    studentId:
      $("#adStudentId")
        ?.value
        .trim(),

    name:
      $("#adName")
        ?.value
        .trim(),

    nameEnglish:
      $("#adEnglishName")
        ?.value
        .trim(),

    className:
      $("#adClass")
        ?.value,

    type:
      $("#adType")
        ?.value,

    gender:
      $("#adGender")
        ?.value,

    dob:
      $("#adDob")
        ?.value,

    admissionDate:
      $("#adAdmissionDate")
        ?.value,

    monthlyFee:
      number(
        $("#adMonthlyFee")
          ?.value
      ),

    father:
      $("#adFather")
        ?.value
        .trim(),

    mother:
      $("#adMother")
        ?.value
        .trim(),

    guardian:
      $("#adGuardian")
        ?.value
        .trim(),

    relation:
      $("#adRelation")
        ?.value
        .trim(),

    phone:
      $("#adPhone")
        ?.value
        .trim(),

    alternativePhone:
      $("#adAltPhone")
        ?.value
        .trim(),

    aadhaar:
      $("#adAadhaar")
        ?.value
        .replace(/\D/g, ""),

    guardianAadhaar:
      $("#adGuardianAadhaar")
        ?.value
        .replace(/\D/g, ""),

    village:
      $("#adVillage")
        ?.value
        .trim(),

    postOffice:
      $("#adPost")
        ?.value
        .trim(),

    policeStation:
      $("#adPolice")
        ?.value
        .trim(),

    district:
      $("#adDistrict")
        ?.value
        .trim(),

    state:
      $("#adState")
        ?.value
        .trim(),

    pin:
      $("#adPin")
        ?.value
        .replace(/\D/g, ""),

    address:
      $("#adAddress")
        ?.value
        .trim(),

    previousInstitution:
      $(
        "#adPreviousInstitution"
      )
        ?.value
        .trim(),

    previousClass:
      $("#adPreviousClass")
        ?.value
        .trim(),

    notes:
      $("#adNotes")
        ?.value
        .trim()

  };
}

/* =========================================================
   ADMISSION VALIDATION
   ========================================================= */

function validateAdmission(
  data,
  existingStudent
) {

  if (!data.studentId) {

    return {
      valid: false,
      message:
        "Student ID is required."
    };

  }

  if (!data.name) {

    return {
      valid: false,
      message:
        "Student name is required."
    };

  }

  if (!data.className) {

    return {
      valid: false,
      message:
        "Please select a class."
    };

  }

  if (
    data.phone &&
    !/^[0-9+\-\s]{8,15}$/.test(
      data.phone
    )
  ) {

    return {
      valid: false,
      message:
        "Please enter a valid phone number."
    };

  }

  if (
    data.aadhaar &&
    data.aadhaar.length !== 12
  ) {

    return {
      valid: false,
      message:
        "Student Aadhaar must contain 12 digits."
    };

  }

  if (
    data.guardianAadhaar &&
    data.guardianAadhaar.length !== 12
  ) {

    return {
      valid: false,
      message:
        "Guardian Aadhaar must contain 12 digits."
    };

  }

  if (
    data.pin &&
    data.pin.length !== 6
  ) {

    return {
      valid: false,
      message:
        "PIN code must contain 6 digits."
    };

  }

  const duplicate =
    DATA.students.find(
      student =>
        student.studentId ===
          data.studentId &&
        student.id !==
          existingStudent?.id
    );

  if (duplicate) {

    return {
      valid: false,
      message:
        "This Student ID already exists."
    };

  }

  return {
    valid: true
  };
}


/* =========================================================
   STUDENT PROFILE
   ========================================================= */

function openStudentProfile(
  student
) {

  if (!student) {

    toast(
      "Student not found.",
      "error"
    );

    return;
  }

  const totalPaid =
    DATA.fees
      .filter(
        fee =>
          fee.studentId ===
          student.id
      )
      .reduce(
        (total, fee) =>
          total +
          number(fee.paid),
        0
      );

  const currentDue =
    studentDueForMonth(
      student,
      currentMonth()
    );

  const history =
    DATA.fees
      .filter(
        fee =>
          fee.studentId ===
          student.id
      )
      .sort(
        (a, b) =>
          String(b.date)
            .localeCompare(
              String(a.date)
            )
      );


  openModal(
    "Student Profile",
    `

      <div class="profile">

        <div class="profile-hero">

          <div
            class="profile-photo"
            style="
              display:grid;
              place-items:center;
              font-size:48px;
            "
          >
            ЁЯСитАНЁЯОУ
          </div>

          <h2>
            ${escapeHTML(
              student.name
            )}
          </h2>

          <p>
            ${escapeHTML(
              student.nameEnglish ||
              ""
            )}
          </p>

          <p>
            ${escapeHTML(
              student.studentId ||
              ""
            )}
          </p>

          <div
            style="
              margin-top:14px;
            "
          >

            <span class="tag ok">
              ${escapeHTML(
                student.className
              )}
            </span>

            <span class="tag">
              ${escapeHTML(
                student.type
              )}
            </span>

          </div>

          <div
            style="
              margin-top:18px;
            "
          >

            <button
              class="btn primary"
              type="button"
              data-profile-edit="${student.id}"
            >
              Edit Student
            </button>

          </div>

          <div
            style="
              margin-top:8px;
            "
          >

            <button
              class="btn ghost"
              type="button"
              data-profile-fee="${student.id}"
            >
              Collect Fee
            </button>

          </div>

        </div>


        <div>

          <div class="mini-grid">

            <div class="mini-box">

              <small>
                Monthly Fee
              </small>

              <strong>
                ${money(
                  studentMonthlyFee(
                    student
                  )
                )}
              </strong>

            </div>

            <div class="mini-box">

              <small>
                Total Paid
              </small>

              <strong
                class="green"
              >
                ${money(
                  totalPaid
                )}
              </strong>

            </div>

            <div class="mini-box">

              <small>
                Current Due
              </small>

              <strong
                class="red"
              >
                ${money(
                  currentDue
                )}
              </strong>

            </div>

            <div class="mini-box">

              <small>
                Status
              </small>

              <strong>
                Active
              </strong>

            </div>

          </div>


          <div class="card">

            <div class="cardhead">

              <b>
                Personal Information
              </b>

            </div>

            <div class="details-grid">

              ${detailItem(
                "Student ID",
                student.studentId
              )}

              ${detailItem(
                "Class",
                student.className
              )}

              ${detailItem(
                "Student Type",
                student.type
              )}

              ${detailItem(
                "Gender",
                student.gender
              )}

              ${detailItem(
                "Date of Birth",
                formatDate(
                  student.dob
                )
              )}

              ${detailItem(
                "Admission Date",
                formatDate(
                  student.admissionDate
                )
              )}

              ${detailItem(
                "Father",
                student.father
              )}

              ${detailItem(
                "Mother",
                student.mother
              )}

              ${detailItem(
                "Guardian",
                student.guardian
              )}

              ${detailItem(
                "Relation",
                student.relation
              )}

              ${detailItem(
                "Phone",
                student.phone
              )}

              ${detailItem(
                "Alternative Phone",
                student.alternativePhone
              )}

            </div>

          </div>


          <div class="card">

            <div class="cardhead">

              <b>
                Address
              </b>

            </div>

            <div class="details-grid">

              ${detailItem(
                "Village",
                student.village
              )}

              ${detailItem(
                "Post Office",
                student.postOffice
              )}

              ${detailItem(
                "Police Station",
                student.policeStation
              )}

              ${detailItem(
                "District",
                student.district
              )}

              ${detailItem(
                "State",
                student.state
              )}

              ${detailItem(
                "PIN",
                student.pin
              )}

              ${detailItem(
                "Full Address",
                student.address
              )}

            </div>

          </div>


          <div class="card">

            <div class="cardhead">

              <b>
                Identity Information
              </b>

            </div>

            <div class="details-grid">

              ${detailItem(
                "Student Aadhaar",
                maskAadhaar(
                  student.aadhaar
                )
              )}

              ${detailItem(
                "Guardian Aadhaar",
                maskAadhaar(
                  student.guardianAadhaar
                )
              )}

            </div>

          </div>


          <div class="card">

            <div class="cardhead">

              <b>
                Fee History
              </b>

            </div>

            <div class="tablewrap">

              <table>

                <thead>

                  <tr>
                    <th>Date</th>
                    <th>Month</th>
                    <th>Expected</th>
                    <th>Paid</th>
                    <th>Due</th>
                    <th>Method</th>
                    <th>Receipt</th>
                  </tr>

                </thead>

                <tbody>

                  ${
                    history.length

                      ? history
                          .map(
                            fee => `
                              <tr>

                                <td>
                                  ${formatDate(
                                    fee.date
                                  )}
                                </td>

                                <td>
                                  ${escapeHTML(
                                    fee.month
                                  )}
                                </td>

                                <td>
                                  ${money(
                                    fee.expected
                                  )}
                                </td>

                                <td
                                  class="green"
                                >
                                  ${money(
                                    fee.paid
                                  )}
                                </td>

                                <td
                                  class="red"
                                >
                                  ${money(
                                    fee.due
                                  )}
                                </td>

                                <td>
                                  ${escapeHTML(
                                    fee.method ||
                                    "Cash"
                                  )}
                                </td>

                                <td>
                                  ${escapeHTML(
                                    fee.receiptNumber ||
                                    "тАФ"
                                  )}
                                </td>

                              </tr>
                            `
                          )
                          .join("")

                      : `
                        <tr>

                          <td colspan="7">

                            ${emptyState(
                              "No fee history"
                            )}

                          </td>

                        </tr>
                      `
                  }

                </tbody>

              </table>

            </div>

          </div>

        </div>

      </div>
    `
  );

}

/* =========================================================
   DETAIL ITEM
   ========================================================= */

function detailItem(
  label,
  value
) {

  return `
    <div class="detail">

      <small>
        ${escapeHTML(
          label
        )}
      </small>

      <b>
        ${escapeHTML(
          value ||
          "тАФ"
        )}
      </b>

    </div>
  `;
}


/* =========================================================
   MASK AADHAAR
   ========================================================= */

function maskAadhaar(
  value
) {

  if (
    !value ||
    String(value).length < 4
  ) {
    return "Not added";
  }

  const clean =
    String(value)
      .replace(/\D/g, "");

  return (
    "тАвтАвтАвтАв тАвтАвтАвтАв " +
    clean.slice(-4)
  );
}


/* =========================================================
   FEES VIEW
   ========================================================= */

function feesView() {

  const records =
    DATA.fees
      .slice()
      .sort(
        (a, b) =>
          String(b.date)
            .localeCompare(
              String(a.date)
            )
      );

  const total =
    records.reduce(
      (sum, fee) =>
        sum + number(fee.paid),
      0
    );

  const monthTotal =
    monthlyFeeCollection(
      currentMonth()
    );

  return `
    <div class="page">

      ${pageHeader(
        "Fees Management",
        "Monthly collection, payment history, due and professional receipts.",
        "я╝Л Collect Fee",
        "collect-fee"
      )}

      <div class="mini-grid">

        <div class="mini-box">

          <small>
            Total Records
          </small>

          <strong>
            ${records.length}
          </strong>

        </div>

        <div class="mini-box">

          <small>
            Total Collection
          </small>

          <strong>
            ${money(total)}
          </strong>

        </div>

        <div class="mini-box">

          <small>
            This Month
          </small>

          <strong
            class="green"
          >
            ${money(
              monthTotal
            )}
          </strong>

        </div>

        <div class="mini-box">

          <small>
            Current Due
          </small>

          <strong
            class="red"
          >
            ${money(
              totalOutstandingDue()
            )}
          </strong>

        </div>

      </div>


      <div class="toolbar">

        <input
          id="feeSearch"
          placeholder="ЁЯФН Search student / receipt / month..."
        >

      </div>


      <div class="card tablewrap">

        <table>

          <thead>

            <tr>

              <th>Date</th>
              <th>Student</th>
              <th>Month</th>
              <th>Expected</th>
              <th>Paid</th>
              <th>Due</th>
              <th>Method</th>
              <th>Receipt</th>

            </tr>

          </thead>

          <tbody>

            ${
              records.length

                ? records
                    .map(
                      fee =>
                        feeRow(
                          fee
                        )
                    )
                    .join("")

                : `
                  <tr>

                    <td colspan="8">

                      ${emptyState(
                        "No fee records"
                      )}

                    </td>

                  </tr>
                `
            }

          </tbody>

        </table>

      </div>

    </div>
  `;
}


/* =========================================================
   FEE TABLE ROW
   ========================================================= */

function feeRow(
  fee
) {

  return `
    <tr>

      <td>
        ${formatDate(
          fee.date
        )}
      </td>

      <td>

        <b>
          ${escapeHTML(
            fee.studentName ||
            "тАФ"
          )}
        </b>

        <small>
          ${escapeHTML(
            fee.studentId ||
            ""
          )}
        </small>

      </td>

      <td>
        ${escapeHTML(
          fee.month ||
          "тАФ"
        )}
      </td>

      <td>
        ${money(
          fee.expected
        )}
      </td>

      <td
        class="green"
      >
        <b>
          ${money(
            fee.paid
          )}
        </b>
      </td>

      <td
        class="red"
      >
        ${money(
          fee.due
        )}
      </td>

      <td>
        ${escapeHTML(
          fee.method ||
          "Cash"
        )}
      </td>

      <td>

        <button
          class="btn ghost"
          type="button"
          data-print-receipt="${fee.id}"
        >
          Print
        </button>

      </td>

    </tr>
  `;
}


/* =========================================================
   FEE FORM
   ========================================================= */

function openFeeForm(
  selectedStudent = null
) {

  const students =
    activeStudents();

  if (!students.length) {

    toast(
      "ржЖржЧрзЗ ржЕржирзНрждржд ржПржХржЬржи student add ржХрж░рзБржиред",
      "error"
    );

    return;
  }

  const firstStudent =
    selectedStudent ||
    students[0];

  openModal(
    "Collect Student Fee",
    `
      <form
        id="feeForm"
      >

        <div class="card">

          <div class="cardhead">

            <b>
              ЁЯТ░ Fee Collection
            </b>

          </div>

          <div class="form-grid">

            <div class="field full">

              <label>
                Student *
              </label>

              <select
                id="feeStudent"
                required
              >

                ${students
                  .map(
                    student => `
                      <option
                        value="${student.id}"
                        ${
                          student.id ===
                          firstStudent.id
                            ? "selected"
                            : ""
                        }
                      >
                        ${escapeHTML(
                          student.name
                        )}
                        тАФ
                        ${escapeHTML(
                          student.studentId
                        )}
                        тАФ
                        ${escapeHTML(
                          student.className
                        )}
                      </option>
                    `
                  )
                  .join("")}

              </select>

            </div>

            <div class="field">

              <label>
                Fee Month *
              </label>

              <input
                id="feeMonth"
                type="month"
                value="${currentMonth()}"
                required
              >

            </div>

            <div class="field">

              <label>
                Monthly Fee
              </label>

              <input
                id="feeExpected"
                type="number"
                readonly
                value="${studentMonthlyFee(
                  firstStudent
                )}"
              >

            </div>

            <div class="field">

              <label>
                Existing Paid
              </label>

              <input
                id="feeExistingPaid"
                type="number"
                readonly
                value="${studentPaidForMonth(
                  firstStudent.id,
                  currentMonth()
                )}"
              >

            </div>

            <div class="field">

              <label>
                Current Due
              </label>

              <input
                id="feeCurrentDue"
                type="number"
                readonly
                value="${studentDueForMonth(
                  firstStudent,
                  currentMonth()
                )}"
              >

            </div>

            <div class="field">

              <label>
                Paid Amount *
              </label>

              <input
                id="feePaid"
                type="number"
                min="0"
                value="${studentDueForMonth(
                  firstStudent,
                  currentMonth()
                )}"
                required
              >

            </div>

            <div class="field">

              <label>
                Payment Method
              </label>

              <select id="feeMethod">

                <option>
                  Cash
                </option>

                <option>
                  UPI
                </option>

                <option>
                  Bank
                </option>

                <option>
                  Other
                </option>

              </select>

            </div>

            <div class="field">

              <label>
                Payment Date
              </label>

              <input
                id="feeDate"
                type="date"
                value="${today()}"
                required
              >

            </div>

            <div class="field">

              <label>
                Reference No.
              </label>

              <input
                id="feeReference"
                placeholder="Optional"
              >

            </div>

            <div class="field full">

              <label>
                Remarks
              </label>

              <textarea
                id="feeRemarks"
                rows="2"
              ></textarea>

            </div>

          </div>

        </div>


        <div class="form-actions">

          <button
            type="button"
            class="btn ghost"
            data-close-modal
          >
            Cancel
          </button>

          <button
            type="submit"
            class="btn primary"
          >
            Save & Generate Receipt
          </button>

        </div>

      </form>
    `
  );


  updateFeeFormValues();

  $("#feeStudent")
    ?.addEventListener(
      "change",
      updateFeeFormValues
    );

  $("#feeMonth")
    ?.addEventListener(
      "change",
      updateFeeFormValues
    );


  $("#feeForm")
    ?.addEventListener(
      "submit",
      async event => {

        event.preventDefault();

        const student =
          DATA.students.find(
            item =>
              item.id ===
              $("#feeStudent")
                .value
          );

        if (!student) {

          toast(
            "Student not found.",
            "error"
          );

          return;
        }

        const feeMonth =
          $("#feeMonth")
            .value;

        const paid =
          number(
            $("#feePaid")
              .value
          );

        const expected =
          studentExpectedForMonth(
            student,
            feeMonth
          );

        const existingPaid =
          studentPaidForMonth(
            student.id,
            feeMonth
          );

        const remaining =
          Math.max(
            0,
            expected -
              existingPaid
          );

        if (paid <= 0) {

          toast(
            "Paid amount must be greater than zero.",
            "error"
          );

          return;
        }

        if (
          paid > remaining &&
          expected > 0
        ) {

          toast(
            `Maximum payable amount is ${money(
              remaining
            )}.`,
            "error"
          );

          return;
        }

        const feeRecord = {

          id:
            generateId("FEE"),

          studentId:
            student.id,

          studentName:
            student.name,

          studentId:
            student.studentId,

          className:
            student.className,

          month:
            feeMonth,

          expected,

          previousPaid:
            existingPaid,

          paid,

          due:
            Math.max(
              0,
              remaining -
                paid
            ),

          date:
            $("#feeDate")
              .value,

          method:
            $("#feeMethod")
              .value,

          reference:
            $("#feeReference")
              .value
              .trim(),

          remarks:
            $("#feeRemarks")
              .value
              .trim(),

          receiptNumber:
            generateReceiptNumber(),

          createdAt:
            new Date().toISOString()

        };

        DATA.fees.push(
          feeRecord
        );

        addActivity(
          "Fee Collection",
          `Fee collected from ${student.name}.`,
          feeRecord.id
        );

        closeModal();

        await persistData();

        toast(
          "Fee saved successfully"
        );

        openReceipt(
          feeRecord
        );

      }
    );

}
/* =========================================================
   UPDATE FEE FORM
   ========================================================= */

function updateFeeFormValues() {

  const studentId =
    $("#feeStudent")
      ?.value;

  const feeMonth =
    $("#feeMonth")
      ?.value ||
    currentMonth();

  if (!studentId) {
    return;
  }

  const student =
    DATA.students.find(
      item =>
        item.id ===
        studentId
    );

  if (!student) {
    return;
  }

  const expected =
    studentExpectedForMonth(
      student,
      feeMonth
    );

  const existingPaid =
    studentPaidForMonth(
      student.id,
      feeMonth
    );

  const due =
    Math.max(
      0,
      expected -
        existingPaid
    );

  if ($("#feeExpected")) {

    $("#feeExpected")
      .value =
      expected;

  }

  if ($("#feeExistingPaid")) {

    $("#feeExistingPaid")
      .value =
      existingPaid;

  }

  if ($("#feeCurrentDue")) {

    $("#feeCurrentDue")
      .value =
      due;

  }

  if ($("#feePaid")) {

    $("#feePaid")
      .value =
      due;

  }

}


/* =========================================================
   RECEIPT NUMBER
   ========================================================= */

function generateReceiptNumber() {

  const year =
    new Date()
      .getFullYear();

  const count =
    DATA.fees.length + 1;

  return (
    `DHM-${year}-` +
    String(count)
      .padStart(6, "0")
  );

}


/* =========================================================
   PROFESSIONAL RECEIPT
   ========================================================= */

function openReceipt(
  fee
) {

  if (!fee) {

    toast(
      "Receipt not found.",
      "error"
    );

    return;
  }

  openModal(
    "Fee Receipt",

    `
      <div
        id="receiptPrintArea"
        style="
          max-width:720px;
          margin:auto;
          background:#fff;
          color:#17212b;
          padding:28px;
          border:1px solid #e3e8eb;
          border-radius:16px;
        "
      >

        <div
          style="
            text-align:center;
            border-bottom:2px solid #0b6b61;
            padding-bottom:18px;
            margin-bottom:18px;
          "
        >

          <img
            src="${escapeHTML(
              DATA.settings.logo ||
              "logo.png"
            )}"
            alt="Madrasa Logo"
            style="
              width:75px;
              height:75px;
              object-fit:contain;
            "
          >

          <h2
            style="
              margin:8px 0 3px;
            "
          >
            ${escapeHTML(
              DATA.settings.madrasaName
            )}
          </h2>

          <div>
            ${escapeHTML(
              DATA.settings.englishName
            )}
          </div>

          <div>
            ${escapeHTML(
              DATA.settings.address
            )}
          </div>

          ${
            DATA.settings.phone
              ? `
                <div>
                  ${escapeHTML(
                    DATA.settings.phone
                  )}
                </div>
              `
              : ""
          }

          <h3
            style="
              margin:16px 0 0;
              letter-spacing:.08em;
            "
          >
            FEE RECEIPT
          </h3>

        </div>


        <div class="details-grid">

          ${detailItem(
            "Receipt No.",
            fee.receiptNumber
          )}

          ${detailItem(
            "Payment Date",
            formatDate(
              fee.date
            )
          )}

          ${detailItem(
            "Student",
            fee.studentName
          )}

          ${detailItem(
            "Student ID",
            fee.studentId
          )}

          ${detailItem(
            "Class",
            fee.className
          )}

          ${detailItem(
            "Fee Month",
            monthName(
              fee.month
            )
          )}

          ${detailItem(
            "Payment Method",
            fee.method
          )}

          ${detailItem(
            "Reference",
            fee.reference ||
              "тАФ"
          )}

          ${detailItem(
            "Expected Fee",
            money(
              fee.expected
            )
          )}

          ${detailItem(
            "Paid Amount",
            money(
              fee.paid
            )
          )}

          ${detailItem(
            "Remaining Due",
            money(
              fee.due
            )
          )}

        </div>


        <div
          style="
            margin-top:25px;
            padding:18px;
            background:#f4f8f7;
            border-radius:12px;
            text-align:center;
          "
        >

          <strong
            style="
              font-size:22px;
              color:#0b6b61;
            "
          >
            Paid:
            ${money(
              fee.paid
            )}
          </strong>

        </div>


        ${
          fee.remarks
            ? `
              <div
                style="
                  margin-top:18px;
                "
              >

                <b>
                  Remarks:
                </b>

                <div>
                  ${escapeHTML(
                    fee.remarks
                  )}
                </div>

              </div>
            `
            : ""
        }


        <div
          style="
            display:flex;
            justify-content:space-between;
            margin-top:55px;
            gap:40px;
          "
        >

          <div>
            ______________________
            <br>
            <small>
              Guardian Signature
            </small>
          </div>

          <div>
            ______________________
            <br>
            <small>
              Authorized Signature
            </small>
          </div>

        </div>

      </div>


      <div class="form-actions">

        <button
          class="btn primary"
          type="button"
          data-print-receipt-now
        >
          ЁЯЦи Print Receipt
        </button>

      </div>
    `
  );


  $(
    "[data-print-receipt-now]"
  )?.addEventListener(
    "click",
    () => {

      printElement(
        "receiptPrintArea"
      );

    }
  );

}


/* =========================================================
   PRINT ELEMENT
   ========================================================= */

function printElement(
  elementId
) {

  const element =
    document.getElementById(
      elementId
    );

  if (!element) {
    return;
  }

  const printWindow =
    window.open(
      "",
      "_blank",
      "width=900,height=700"
    );

  if (!printWindow) {

    toast(
      "Please allow pop-ups to print.",
      "error"
    );

    return;
  }

  printWindow.document.write(`
    <!doctype html>

    <html>

      <head>

        <title>
          Dingel Hafizia Madrasa
        </title>

        <style>

          * {
            box-sizing:border-box;
          }

          body {
            margin:0;
            padding:30px;
            font-family:
              Arial,
              sans-serif;
            color:#17212b;
          }

          table {
            width:100%;
            border-collapse:collapse;
          }

          @media print {

            body {
              padding:0;
            }

          }

        </style>

      </head>

      <body>

        ${element.outerHTML}

      </body>

    </html>
  `);

  printWindow.document.close();

  printWindow.focus();

  setTimeout(
    () => {

      printWindow.print();

      printWindow.close();

    },
    400
  );

}


/* =========================================================
   DUE MANAGEMENT VIEW
   ========================================================= */

function dueView() {

  const dueStudents =
    activeStudents()
      .map(
        student => ({
          student,
          due:
            studentDueForMonth(
              student,
              currentMonth()
            ),
          paid:
            studentPaidForMonth(
              student.id,
              currentMonth()
            ),
          expected:
            studentExpectedForMonth(
              student,
              currentMonth()
            )
        })
      )
      .filter(
        item =>
          item.due > 0
      );


  const totalDue =
    dueStudents.reduce(
      (sum, item) =>
        sum + item.due,
      0
    );


  return `
    <div class="page">

      ${pageHeader(
        "Due Management",
        "Current-month student-wise outstanding fee management.",
        "я╝Л Collect Due",
        "collect-fee"
      )}

      <div class="mini-grid">

        <div class="mini-box">

          <small>
            Due Students
          </small>

          <strong>
            ${dueStudents.length}
          </strong>

        </div>

        <div class="mini-box">

          <small>
            Total Due
          </small>

          <strong class="red">
            ${money(totalDue)}
          </strong>

        </div>

        <div class="mini-box">

          <small>
            Month
          </small>

          <strong>
            ${currentMonth()}
          </strong>

        </div>

        <div class="mini-box">

          <small>
            Free / Orphan
          </small>

          <strong>
            ${
              activeStudents()
                .filter(
                  student =>
                    student.type ===
                    "orphan"
                )
                .length
            }
          </strong>

        </div>

      </div>


      <div class="card tablewrap">

        <table>

          <thead>

            <tr>

              <th>Student</th>
              <th>ID</th>
              <th>Class</th>
              <th>Expected</th>
              <th>Paid</th>
              <th>Due</th>
              <th>Action</th>

            </tr>

          </thead>

          <tbody>

            ${
              dueStudents.length

                ? dueStudents
                    .map(
                      item => `
                        <tr>

                          <td>

                            <div
                              class="person"
                            >

                              <div
                                class="mini"
                              >
                                ${escapeHTML(
                                  (
                                    item
                                      .student
                                      .name ||
                                    "?"
                                  ).charAt(0)
                                )}
                              </div>

                              <div>

                                <b>
                                  ${escapeHTML(
                                    item
                                      .student
                                      .name
                                  )}
                                </b>

                                <small>
                                  ${escapeHTML(
                                    item
                                      .student
                                      .phone ||
                                    ""
                                  )}
                                </small>

                              </div>

                            </div>

                          </td>

                          <td>
                            ${escapeHTML(
                              item
                                .student
                                .studentId
                            )}
                          </td>

                          <td>
                            ${escapeHTML(
                              item
                                .student
                                .className
                            )}
                          </td>

                          <td>
                            ${money(
                              item.expected
                            )}
                          </td>

                          <td
                            class="green"
                          >
                            ${money(
                              item.paid
                            )}
                          </td>

                          <td
                            class="red"
                          >
                            <b>
                              ${money(
                                item.due
                              )}
                            </b>
                          </td>

                          <td>

                            <button
                              class="btn primary"
                              type="button"
                              data-due-collect="${
                                item
                                  .student
                                  .id
                              }"
                            >
                              Collect
                            </button>

                          </td>

                        </tr>
                      `
                    )
                    .join("")

                : `
                  <tr>

                    <td colspan="7">

                      ${emptyState(
                        "ржПржЗ ржорж╛рж╕рзЗ ржХрзЛржирзЛ due ржирзЗржЗ ЁЯОЙ"
                      )}

                    </td>

                  </tr>
                `
            }

          </tbody>

        </table>

      </div>

    </div>
  `;
}

/* =========================================================
   STUDENT SEARCH / FILTER
   ========================================================= */

function applyStudentFilters() {

  const search =
    $("#studentSearch")
      ?.value
      .trim()
      .toLowerCase() ||
    "";

  const classFilter =
    $("#studentClassFilter")
      ?.value ||
    "";

  const typeFilter =
    $("#studentTypeFilter")
      ?.value ||
    "";


  searchText =
    search;


  let students =
    activeStudents();


  if (search) {

    students =
      students.filter(
        student => {

          const text =
            [
              student.name,
              student.nameEnglish,
              student.studentId,
              student.phone,
              student.className,
              student.father,
              student.mother,
              student.guardian
            ]
              .join(" ")
              .toLowerCase();

          return text.includes(
            search
          );

        }
      );

  }


  if (classFilter) {

    students =
      students.filter(
        student =>
          student.className ===
          classFilter
      );

  }


  if (typeFilter) {

    students =
      students.filter(
        student =>
          student.type ===
          typeFilter
      );

  }


  const tbody =
    $(".tablewrap tbody");

  if (
    !tbody ||
    currentPage !==
      "students"
  ) {

    return;

  }


  tbody.innerHTML =
    students.length

      ? students
          .map(
            student =>
              studentRow(
                student
              )
          )
          .join("")

      : `
        <tr>

          <td colspan="8">

            ${emptyState(
              "ржХрзЛржирзЛ student ржкрж╛ржУрзЯрж╛ ржпрж╛рзЯржирж┐"
            )}

          </td>

        </tr>
      `;


  bindStudentActionEvents();

}


/* =========================================================
   STUDENT ACTION EVENTS
   ========================================================= */

function bindStudentActionEvents() {

  $all(
    "[data-view-student]"
  ).forEach(button => {

    button.onclick =
      () => {

        const student =
          DATA.students.find(
            item =>
              item.id ===
              button
                .dataset
                .viewStudent
          );

        openStudentProfile(
          student
        );

      };

  });


  $all(
    "[data-edit-student]"
  ).forEach(button => {

    button.onclick =
      () => {

        const student =
          DATA.students.find(
            item =>
              item.id ===
              button
                .dataset
                .editStudent
          );

        if (student) {

          openAdmissionForm(
            student
          );

        }

      };

  });


  $all(
    "[data-profile-edit]"
  ).forEach(button => {

    button.onclick =
      () => {

        const student =
          DATA.students.find(
            item =>
              item.id ===
              button
                .dataset
                .profileEdit
          );

        if (student) {

          closeModal();

          openAdmissionForm(
            student
          );

        }

      };

  });


  $all(
    "[data-profile-fee]"
  ).forEach(button => {

    button.onclick =
      () => {

        const student =
          DATA.students.find(
            item =>
              item.id ===
              button
                .dataset
                .profileFee
          );

        if (student) {

          closeModal();

          openFeeForm(
            student
          );

        }

      };

  });


  $all(
    "[data-due-collect]"
  ).forEach(button => {

    button.onclick =
      () => {

        const student =
          DATA.students.find(
            item =>
              item.id ===
              button
                .dataset
                .dueCollect
          );

        if (student) {

          openFeeForm(
            student
          );

        }

      };

  });


  $all(
    "[data-print-receipt]"
  ).forEach(button => {

    button.onclick =
      () => {

        const fee =
          DATA.fees.find(
            item =>
              item.id ===
              button
                .dataset
                .printReceipt
          );

        if (fee) {

          openReceipt(
            fee
          );

        }

      };

  });

}


/* =========================================================
   UPDATE RENDER FUNCTION
   ========================================================= */

const originalRender =
  render;


/*
 * Part 2 extends the main render
 * system with Student / Fee / Due views.
 */

render = function () {

  renderNavigation();

  updateTopBar();

  const view =
    $("#view");

  if (!view) {
    return;
  }


  let html = "";


  switch (
    currentPage
  ) {

    case "dashboard":

      html =
        dashboardView();

      break;


    case "students":

      html =
        studentsView();

      break;


    case "fees":

      html =
        feesView();

      break;


    case "due":

      html =
        dueView();

      break;


    case "income":

      html =
        comingSoonView(
          "Income Management"
        );

      break;


    case "expense":

      html =
        comingSoonView(
          "Expense Management"
        );

      break;


    case "accounts":

      html =
        comingSoonView(
          "Madrasa Accounts"
        );

      break;


    case "reports":

      html =
        comingSoonView(
          "Reports"
        );

      break;


    case "settings":

      html =
        comingSoonView(
          "Madrasa Profile"
        );

      break;


    default:

      html =
        dashboardView();

  }


  view.innerHTML =
    html;


  bindEvents();


  bindStudentActionEvents();


  $("#studentSearch")
    ?.addEventListener(
      "input",
      applyStudentFilters
    );


  $("#studentClassFilter")
    ?.addEventListener(
      "change",
      applyStudentFilters
    );


  $("#studentTypeFilter")
    ?.addEventListener(
      "change",
      applyStudentFilters
    );


  $("#feeSearch")
    ?.addEventListener(
      "input",
      event => {

        const value =
          event.target.value
            .trim()
            .toLowerCase();

        $all(
          ".tablewrap tbody tr"
        ).forEach(row => {

          row.style.display =
            row.textContent
              .toLowerCase()
              .includes(value)
                ? ""
                : "none";

        });

      }
    );

};
/* =========================================================
   DINGEL HAFIZIA MADRASA ERP
   app.js тАФ PART 3/3

   MODULES:
   тАв Income Management
   тАв Expense Management
   тАв Daily Accounts
   тАв Monthly Accounts
   тАв Yearly Accounts
   тАв Financial Summary
   тАв Reports
   тАв Madrasa Profile / Settings
   тАв CSV Export
   тАв Backup / Restore
   ========================================================= */


/* =========================================================
   INCOME CATEGORIES
   ========================================================= */

const INCOME_CATEGORIES = [
  "Donation",
  "Grant",
  "Admission Fee",
  "Zakat / Sadaqah",
  "Other"
];


/* =========================================================
   EXPENSE CATEGORIES
   ========================================================= */

const EXPENSE_CATEGORIES = [
  "Food",
  "Salary",
  "Electricity / Gas",
  "Water",
  "Medical",
  "Education Supplies",
  "Rent",
  "Repair",
  "Transport",
  "Other"
];


/* =========================================================
   INCOME VIEW
   ========================================================= */

function incomeView() {

  const records =
    DATA.income
      .slice()
      .sort(
        (a, b) =>
          String(b.date)
            .localeCompare(
              String(a.date)
            )
      );

  const total =
    records.reduce(
      (sum, item) =>
        sum + number(item.amount),
      0
    );

  const thisMonth =
    monthlyOtherIncome(
      currentMonth()
    );

  const thisYear =
    yearlyOtherIncome(
      currentYear()
    );

  return `
    <div class="page">

      ${pageHeader(
        "Income Management",
        "Manage donations, grants, admission fees and other madrasa income.",
        "я╝Л Add Income",
        "new-income"
      )}

      <div class="mini-grid">

        <div class="mini-box">
          <small>Total Income Records</small>
          <strong>${records.length}</strong>
        </div>

        <div class="mini-box">
          <small>Total Income</small>
          <strong class="green">
            ${money(total)}
          </strong>
        </div>

        <div class="mini-box">
          <small>This Month</small>
          <strong class="green">
            ${money(thisMonth)}
          </strong>
        </div>

        <div class="mini-box">
          <small>This Year</small>
          <strong class="green">
            ${money(thisYear)}
          </strong>
        </div>

      </div>


      <div class="card tablewrap">

        <table>

          <thead>

            <tr>
              <th>Date</th>
              <th>Category</th>
              <th>Description</th>
              <th>Method</th>
              <th>Reference</th>
              <th>Amount</th>
              <th>Action</th>
            </tr>

          </thead>

          <tbody>

            ${
              records.length

                ? records
                    .map(
                      item => incomeRow(item)
                    )
                    .join("")

                : `
                  <tr>
                    <td colspan="7">
                      ${emptyState(
                        "ржПржЦржиржУ ржХрзЛржирзЛ income record ржирзЗржЗ"
                      )}
                    </td>
                  </tr>
                `
            }

          </tbody>

        </table>

      </div>

    </div>
  `;
}


/* =========================================================
   INCOME ROW
   ========================================================= */

function incomeRow(item) {

  return `
    <tr>

      <td>
        ${formatDate(item.date)}
      </td>

      <td>
        <span class="tag ok">
          ${escapeHTML(
            item.category || "Other"
          )}
        </span>
      </td>

      <td>
        ${escapeHTML(
          item.description || "тАФ"
        )}
      </td>

      <td>
        ${escapeHTML(
          item.method || "Cash"
        )}
      </td>

      <td>
        ${escapeHTML(
          item.reference || "тАФ"
        )}
      </td>

      <td class="green">
        <b>
          +${money(item.amount)}
        </b>
      </td>

      <td>

        <button
          class="btn ghost"
          type="button"
          data-delete-income="${item.id}"
        >
          Delete
        </button>

      </td>

    </tr>
  `;
}


/* =========================================================
   ADD INCOME
   ========================================================= */

function openIncomeForm() {

  openModal(
    "Add Madrasa Income",

    `
      <form id="incomeForm">

        <div class="card">

          <div class="cardhead">
            <b>ЁЯУИ Income Entry</b>
          </div>

          <div class="form-grid three">

            <div class="field">

              <label>
                Date *
              </label>

              <input
                id="incomeDate"
                type="date"
                value="${today()}"
                required
              >

            </div>

            <div class="field">

              <label>
                Category *
              </label>

              <select
                id="incomeCategory"
                required
              >

                ${INCOME_CATEGORIES
                  .map(
                    item => `
                      <option value="${escapeHTML(
                        item
                      )}">
                        ${escapeHTML(
                          item
                        )}
                      </option>
                    `
                  )
                  .join("")}

              </select>

            </div>

            <div class="field">

              <label>
                Amount *
              </label>

              <input
                id="incomeAmount"
                type="number"
                min="0"
                step="0.01"
                required
              >

            </div>

            <div class="field">

              <label>
                Payment Method
              </label>

              <select id="incomeMethod">

                <option>Cash</option>
                <option>UPI</option>
                <option>Bank</option>
                <option>Other</option>

              </select>

            </div>

            <div class="field">

              <label>
                Reference No.
              </label>

              <input
                id="incomeReference"
                placeholder="Optional"
              >

            </div>

            <div class="field full">

              <label>
                Description
              </label>

              <textarea
                id="incomeDescription"
                rows="3"
                placeholder="Income details..."
              ></textarea>

            </div>

          </div>

        </div>

        <div class="form-actions">

          <button
            type="button"
            class="btn ghost"
            data-close-modal
          >
            Cancel
          </button>

          <button
            type="submit"
            class="btn primary"
          >
            Save Income
          </button>

        </div>

      </form>
    `
  );


  $("#incomeForm")
    ?.addEventListener(
      "submit",
      async event => {

        event.preventDefault();

        const amount =
          number(
            $("#incomeAmount").value
          );

        if (amount <= 0) {

          toast(
            "Amount must be greater than zero.",
            "error"
          );

          return;
        }

        const record = {

          id:
            generateId("INC"),

          date:
            $("#incomeDate").value,

          category:
            $("#incomeCategory").value,

          amount,

          method:
            $("#incomeMethod").value,

          reference:
            $("#incomeReference")
              .value
              .trim(),

          description:
            $("#incomeDescription")
              .value
              .trim(),

          createdAt:
            new Date().toISOString()

        };

        DATA.income.push(record);

        addActivity(
          "Income Added",
          `Income added: ${money(amount)}.`,
          record.id
        );

        closeModal();

        await persistData();

        toast(
          "Income added successfully."
        );

      }
    );
}


/* =========================================================
   DELETE INCOME
   ========================================================= */

async function deleteIncome(id) {

  const record =
    DATA.income.find(
      item => item.id === id
    );

  if (!record) {
    return;
  }

  if (
    !confirmAction(
      `Delete income of ${money(
        record.amount
      )}?`
    )
  ) {
    return;
  }

  DATA.income =
    DATA.income.filter(
      item => item.id !== id
    );

  addActivity(
    "Income Deleted",
    `Income deleted: ${money(
      record.amount
    )}.`,
    id
  );

  await persistData();

  toast(
    "Income deleted."
  );
}


/* =========================================================
   EXPENSE VIEW
   ========================================================= */

function expenseView() {

  const records =
    DATA.expenses
      .slice()
      .sort(
        (a, b) =>
          String(b.date)
            .localeCompare(
              String(a.date)
            )
      );

  const total =
    records.reduce(
      (sum, item) =>
        sum + number(item.amount),
      0
    );

  const thisMonth =
    monthlyExpense(
      currentMonth()
    );

  const thisYear =
    yearlyExpense(
      currentYear()
    );

  return `
    <div class="page">

      ${pageHeader(
        "Expense Management",
        "Professional daily and monthly madrasa expense tracking.",
        "я╝Л Add Expense",
        "new-expense"
      )}

      <div class="mini-grid">

        <div class="mini-box">
          <small>Total Expense Records</small>
          <strong>${records.length}</strong>
        </div>

        <div class="mini-box">
          <small>Total Expense</small>
          <strong class="red">
            ${money(total)}
          </strong>
        </div>

        <div class="mini-box">
          <small>This Month</small>
          <strong class="red">
            ${money(thisMonth)}
          </strong>
        </div>

        <div class="mini-box">
          <small>This Year</small>
          <strong class="red">
            ${money(thisYear)}
          </strong>
        </div>

      </div>


      <div class="card tablewrap">

        <table>

          <thead>

            <tr>
              <th>Date</th>
              <th>Category</th>
              <th>Description</th>
              <th>Method</th>
              <th>Reference</th>
              <th>Amount</th>
              <th>Action</th>
            </tr>

          </thead>

          <tbody>

            ${
              records.length

                ? records
                    .map(
                      item => expenseRow(item)
                    )
                    .join("")

                : `
                  <tr>
                    <td colspan="7">
                      ${emptyState(
                        "ржПржЦржиржУ ржХрзЛржирзЛ expense record ржирзЗржЗ"
                      )}
                    </td>
                  </tr>
                `
            }

          </tbody>

        </table>

      </div>

    </div>
  `;
}


/* =========================================================
   EXPENSE ROW
   ========================================================= */

function expenseRow(item) {

  return `
    <tr>

      <td>
        ${formatDate(item.date)}
      </td>

      <td>
        <span class="tag warn">
          ${escapeHTML(
            item.category || "Other"
          )}
        </span>
      </td>

      <td>
        ${escapeHTML(
          item.description || "тАФ"
        )}
      </td>

      <td>
        ${escapeHTML(
          item.method || "Cash"
        )}
      </td>

      <td>
        ${escapeHTML(
          item.reference || "тАФ"
        )}
      </td>

      <td class="red">
        <b>
          -${money(item.amount)}
        </b>
      </td>

      <td>

        <button
          class="btn ghost"
          type="button"
          data-delete-expense="${item.id}"
        >
          Delete
        </button>

      </td>

    </tr>
  `;
}


/* =========================================================
   ADD EXPENSE
   ========================================================= */

function openExpenseForm() {

  openModal(
    "Add Madrasa Expense",

    `
      <form id="expenseForm">

        <div class="card">

          <div class="cardhead">
            <b>ЁЯУЙ Expense Entry</b>
          </div>

          <div class="form-grid three">

            <div class="field">

              <label>
                Date *
              </label>

              <input
                id="expenseDate"
                type="date"
                value="${today()}"
                required
              >

            </div>

            <div class="field">

              <label>
                Category *
              </label>

              <select
                id="expenseCategory"
                required
              >

                ${EXPENSE_CATEGORIES
                  .map(
                    item => `
                      <option value="${escapeHTML(
                        item
                      )}">
                        ${escapeHTML(
                          item
                        )}
                      </option>
                    `
                  )
                  .join("")}

              </select>

            </div>

            <div class="field">

              <label>
                Amount *
              </label>

              <input
                id="expenseAmount"
                type="number"
                min="0"
                step="0.01"
                required
              >

            </div>

            <div class="field">

              <label>
                Payment Method
              </label>

              <select id="expenseMethod">

                <option>Cash</option>
                <option>UPI</option>
                <option>Bank</option>
                <option>Other</option>

              </select>

            </div>

            <div class="field">

              <label>
                Reference / Bill No.
              </label>

              <input
                id="expenseReference"
                placeholder="Optional"
              >

            </div>

            <div class="field full">

              <label>
                Description
              </label>

              <textarea
                id="expenseDescription"
                rows="3"
                placeholder="Expense details..."
              ></textarea>

            </div>

          </div>

        </div>

        <div class="form-actions">

          <button
            type="button"
            class="btn ghost"
            data-close-modal
          >
            Cancel
          </button>

          <button
            type="submit"
            class="btn primary"
          >
            Save Expense
          </button>

        </div>

      </form>
    `
  );


  $("#expenseForm")
    ?.addEventListener(
      "submit",
      async event => {

        event.preventDefault();

        const amount =
          number(
            $("#expenseAmount").value
          );

        if (amount <= 0) {

          toast(
            "Amount must be greater than zero.",
            "error"
          );

          return;
        }

        const record = {

          id:
            generateId("EXP"),

          date:
            $("#expenseDate").value,

          category:
            $("#expenseCategory").value,

          amount,

          method:
            $("#expenseMethod").value,

          reference:
            $("#expenseReference")
              .value
              .trim(),

          description:
            $("#expenseDescription")
              .value
              .trim(),

          createdAt:
            new Date().toISOString()

        };

        DATA.expenses.push(
          record
        );

        addActivity(
          "Expense Added",
          `Expense added: ${money(amount)}.`,
          record.id
        );

        closeModal();

        await persistData();

        toast(
          "Expense added successfully."
        );

      }
    );
}


/* =========================================================
   DELETE EXPENSE
   ========================================================= */

async function deleteExpense(id) {

  const record =
    DATA.expenses.find(
      item => item.id === id
    );

  if (!record) {
    return;
  }

  if (
    !confirmAction(
      `Delete expense of ${money(
        record.amount
      )}?`
    )
  ) {
    return;
  }

  DATA.expenses =
    DATA.expenses.filter(
      item => item.id !== id
    );

  addActivity(
    "Expense Deleted",
    `Expense deleted: ${money(
      record.amount
    )}.`,
    id
  );

  await persistData();

  toast(
    "Expense deleted."
  );
}


/* =========================================================
   YEARLY CALCULATIONS
   ========================================================= */

function yearlyFeeCollection(
  year = currentYear()
) {

  return DATA.fees
    .filter(
      fee =>
        String(fee.month)
          .startsWith(
            String(year)
          )
    )
    .reduce(
      (sum, fee) =>
        sum + number(fee.paid),
      0
    );
}


function yearlyOtherIncome(
  year = currentYear()
) {

  return DATA.income
    .filter(
      item =>
        String(item.date)
          .startsWith(
            String(year)
          )
    )
    .reduce(
      (sum, item) =>
        sum + number(item.amount),
      0
    );
}


function yearlyExpense(
  year = currentYear()
) {

  return DATA.expenses
    .filter(
      item =>
        String(item.date)
          .startsWith(
            String(year)
          )
    )
    .reduce(
      (sum, item) =>
        sum + number(item.amount),
      0
    );
}


function yearlyTotalIncome(
  year = currentYear()
) {

  return (
    yearlyFeeCollection(year) +
    yearlyOtherIncome(year)
  );
}


function yearlyBalance(
  year = currentYear()
) {

  return (
    yearlyTotalIncome(year) -
    yearlyExpense(year)
  );
}


/* =========================================================
   ACCOUNTS VIEW
   ========================================================= */

function accountsView() {

  const month =
    currentMonth();

  const year =
    currentYear();

  const monthlyFee =
    monthlyFeeCollection(
      month
    );

  const monthlyOther =
    monthlyOtherIncome(
      month
    );

  const monthlyInc =
    monthlyTotalIncome(
      month
    );

  const monthlyExp =
    monthlyExpense(
      month
    );

  const monthlyBal =
    monthlyBalance(
      month
    );

  const yearlyFee =
    yearlyFeeCollection(
      year
    );

  const yearlyOther =
    yearlyOtherIncome(
      year
    );

  const yearlyInc =
    yearlyTotalIncome(
      year
    );

  const yearlyExp =
    yearlyExpense(
      year
    );

  const yearlyBal =
    yearlyBalance(
      year
    );

  const dailyFee =
    DATA.fees
      .filter(
        item =>
          item.date === today()
      )
      .reduce(
        (sum, item) =>
          sum + number(item.paid),
        0
      );

  const dailyOther =
    DATA.income
      .filter(
        item =>
          item.date === today()
      )
      .reduce(
        (sum, item) =>
          sum + number(item.amount),
        0
      );

  const dailyExpense =
    DATA.expenses
      .filter(
        item =>
          item.date === today()
      )
      .reduce(
       (sum, item) =>
          sum + number(item.amount),
        0
      );

  const dailyIncome =
    dailyFee +
    dailyOther;

  const dailyBalance =
    dailyIncome -
    dailyExpense;


  return `
    <div class="page">

      ${pageHeader(
        "Madrasa Accounts",
        "Daily, monthly and yearly income-expense accounting dashboard."
      )}


      <section class="hero">

        <div>

          <div class="eyebrow">
            FINANCIAL CONTROL
          </div>

          <h1>
            Madrasa рж╣рж┐рж╕рж╛ржм
          </h1>

          <p>
            Fee + Other Income тИТ Expense =
            Actual Balance
          </p>

        </div>

      </section>


      <h2 class="section-title">
        ЁЯУЕ Daily Accounts
      </h2>

      <div class="stats">

        ${dashboardStat(
          "ЁЯТ░",
          "Today's Fee",
          money(dailyFee)
        )}

        ${dashboardStat(
          "ЁЯУИ",
          "Today's Other Income",
          money(dailyOther)
        )}

        ${dashboardStat(
          "ЁЯУЙ",
          "Today's Expense",
          money(dailyExpense),
          "red"
        )}

        ${dashboardStat(
          "ЁЯТ╝",
          "Today's Balance",
          money(dailyBalance)
        )}

      </div>


      <h2 class="section-title">
        ЁЯУЖ Monthly Accounts
      </h2>

      <div class="stats">

        ${dashboardStat(
          "ЁЯТ░",
          "Monthly Fee",
          money(monthlyFee)
        )}

        ${dashboardStat(
          "ЁЯУИ",
          "Monthly Other Income",
          money(monthlyOther)
        )}

        ${dashboardStat(
          "ЁЯУК",
          "Total Monthly Income",
          money(monthlyInc)
        )}

        ${dashboardStat(
          "ЁЯУЙ",
          "Monthly Expense",
          money(monthlyExp),
          "red"
        )}

        ${dashboardStat(
          "ЁЯТ╝",
          "Monthly Balance",
          money(monthlyBal)
        )}

      </div>


      <h2 class="section-title">
        ЁЯЧУ Yearly Accounts
      </h2>

      <div class="stats">

        ${dashboardStat(
          "ЁЯТ░",
          "Yearly Fee",
          money(yearlyFee)
        )}

        ${dashboardStat(
          "ЁЯУИ",
          "Yearly Other Income",
          money(yearlyOther)
        )}

        ${dashboardStat(
          "ЁЯУК",
          "Total Yearly Income",
          money(yearlyInc)
        )}

        ${dashboardStat(
          "ЁЯУЙ",
          "Yearly Expense",
          money(yearlyExp),
          "red"
        )}

        ${dashboardStat(
          "ЁЯТ╝",
          "Yearly Balance",
          money(yearlyBal)
        )}

      </div>


      <section class="grid2">

        <div class="card">

          <div class="cardhead">

            <b>
              Monthly Financial Summary
            </b>

            <span class="tag ok">
              ${month}
            </span>

          </div>

          ${financialBreakdown(
            monthlyFee,
            monthlyOther,
            monthlyExp,
            monthlyBal
          )}

        </div>


        <div class="card">

          <div class="cardhead">

            <b>
              Yearly Financial Summary
            </b>

            <span class="tag ok">
              ${year}
            </span>

          </div>

          ${financialBreakdown(
            yearlyFee,
            yearlyOther,
            yearlyExp,
            yearlyBal
          )}

        </div>

      </section>


      <section class="card">

        <div class="cardhead">

          <b>
            Expense Category Summary
          </b>

        </div>

        ${expenseCategorySummary()}

      </section>

    </div>
  `;
}
/* =========================================================
   FINANCIAL BREAKDOWN
   ========================================================= */

function financialBreakdown(
  fee,
  other,
  expense,
  balance
) {

  const income =
    fee + other;

  return `
    <div class="summary">

      <div>
        <span>
          Student Fees
        </span>

        <b>
          ${money(fee)}
        </b>
      </div>

      <div>
        <span>
          Other Income
        </span>

        <b class="green">
          ${money(other)}
        </b>
      </div>

      <div>
        <span>
          Total Income
        </span>

        <b>
          ${money(income)}
        </b>
      </div>

      <div>
        <span>
          Total Expense
        </span>

        <b class="red">
          ${money(expense)}
        </b>
      </div>

      <div>
        <span>
          Net Balance
        </span>

        <b>
          ${money(balance)}
        </b>
      </div>

    </div>
  `;
}


/* =========================================================
   EXPENSE CATEGORY SUMMARY
   ========================================================= */

function expenseCategorySummary() {

  const totals = {};

  EXPENSE_CATEGORIES
    .forEach(
      category => {
        totals[category] = 0;
      }
    );


  DATA.expenses.forEach(
    expense => {

      const category =
        expense.category ||
        "Other";

      if (
        totals[category] ===
        undefined
      ) {
        totals[category] = 0;
      }

      totals[category] +=
        number(
          expense.amount
        );

    }
  );


  const rows =
    Object.entries(
      totals
    )
    .filter(
      ([, amount]) =>
        amount > 0
    )
    .sort(
      (a, b) =>
        b[1] - a[1]
    );


  if (!rows.length) {

    return emptyState(
      "No expense data available"
    );

  }


  return `
    <div class="summary">

      ${rows
        .map(
          ([category, amount]) => `
            <div>

              <span>
                ${escapeHTML(
                  category
                )}
              </span>

              <b class="red">
                ${money(amount)}
              </b>

            </div>
          `
        )
        .join("")}

    </div>
  `;
}


/* =========================================================
   REPORTS VIEW
   ========================================================= */

function reportsView() {

  const metrics =
    dashboardMetrics();

  return `
    <div class="page">

      ${pageHeader(
        "Reports",
        "Student, fees, due and financial reports."
      )}


      <section class="grid2">

        <div class="card">

          <div class="cardhead">
            <b>Student Reports</b>
          </div>

          <div class="quick">

            <button
              type="button"
              data-export-students
            >
              ЁЯСитАНЁЯОУ
              <span>
                Export Student CSV
              </span>
            </button>

            <button
              type="button"
              data-print-students
            >
              ЁЯЦи
              <span>
                Print Student Report
              </span>
            </button>

          </div>

        </div>


        <div class="card">

          <div class="cardhead">
            <b>Financial Reports</b>
          </div>

          <div class="quick">

            <button
              type="button"
              data-export-fees
            >
              ЁЯТ░
              <span>
                Export Fee CSV
              </span>
            </button>

            <button
              type="button"
              data-export-income
            >
              ЁЯУИ
              <span>
                Export Income CSV
              </span>
            </button>

            <button
              type="button"
              data-export-expenses
            >
              ЁЯУЙ
              <span>
                Export Expense CSV
              </span>
            </button>

            <button
              type="button"
              data-print-financial
            >
              ЁЯЦи
              <span>
                Print Financial Report
              </span>
            </button>

          </div>

        </div>

      </section>


      <section class="card">

        <div class="cardhead">

          <b>
            Current Month Summary
          </b>

          <span class="tag ok">
            ${currentMonth()}
          </span>

        </div>

        <div class="stats">

          ${dashboardStat(
            "ЁЯСитАНЁЯОУ",
            "Students",
            metrics.totalStudents
          )}

          ${dashboardStat(
            "ЁЯТ░",
            "Fee Collection",
            money(
              metrics.collectedFees
            )
          )}

          ${dashboardStat(
            "ЁЯФ┤",
            "Due",
            money(
              metrics.totalDue
            ),
            "red"
          )}

          ${dashboardStat(
            "ЁЯУИ",
            "Other Income",
            money(
              metrics.otherIncome
            )
          )}

          ${dashboardStat(
            "ЁЯУЙ",
            "Expense",
            money(
              metrics.totalExpense
            ),
            "red"
          )}

          ${dashboardStat(
            "ЁЯТ╝",
            "Balance",
            money(
              metrics.balance
            )
          )}

        </div>

      </section>


      <section class="card">

        <div class="cardhead">
          <b>
            Backup & Data Management
          </b>
        </div>

        <div class="quick">

          <button
            type="button"
            data-backup
          >
            ЁЯТ╛
            <span>
              Download Full Backup
            </span>
          </button>

          <button
            type="button"
            data-restore
          >
            тЩ╗я╕П
            <span>
              Restore Backup
            </span>
          </button>

        </div>

        <input
          id="restoreFile"
          type="file"
          accept=".json"
          hidden
        >

      </section>

    </div>
  `;
}
/* =========================================================
   CSV HELPERS
   ========================================================= */

function csvEscape(value) {

  const text =
    String(value ?? "");

  return (
    '"' +
    text
      .replace(
        /"/g,
        '""'
      ) +
    '"'
  );
}


function downloadCSV(
  filename,
  headers,
  rows
) {

  const content = [
    headers,
    ...rows
  ]
    .map(
      row =>
        row
          .map(
            cell =>
              csvEscape(cell)
          )
          .join(",")
    )
    .join("\r\n");


  const blob =
    new Blob(
      ["\uFEFF" + content],
      {
        type:
          "text/csv;charset=utf-8;"
      }
    );


  const url =
    URL.createObjectURL(
      blob
    );


  const link =
    document.createElement(
      "a"
    );

  link.href = url;

  link.download =
    filename;

  document.body.appendChild(
    link
  );

  link.click();

  link.remove();

  URL.revokeObjectURL(
    url
  );

  toast(
    "CSV downloaded."
  );
}


/* =========================================================
   EXPORT STUDENTS
   ========================================================= */

function exportStudentsCSV() {

  const headers = [
    "Student ID",
    "Name",
    "English Name",
    "Class",
    "Type",
    "Gender",
    "DOB",
    "Admission Date",
    "Father",
    "Mother",
    "Guardian",
    "Phone",
    "Monthly Fee",
    "Village",
    "Post Office",
    "Police Station",
    "District",
    "State",
    "PIN",
    "Address",
    "Status"
  ];


  const rows =
    activeStudents()
      .map(
        student => [

          student.studentId,
          student.name,
          student.nameEnglish,
          student.className,
          student.type,
          student.gender,
          student.dob,
          student.admissionDate,
          student.father,
          student.mother,
          student.guardian,
          student.phone,
          student.monthlyFee,
          student.village,
          student.postOffice,
          student.policeStation,
          student.district,
          student.state,
          student.pin,
          student.address,
          student.status

        ]
      );


  downloadCSV(
    `dingel-hafizia-students-${today()}.csv`,
    headers,
    rows
  );
}


/* =========================================================
   EXPORT FEES
   ========================================================= */

function exportFeesCSV() {

  const headers = [
    "Date",
    "Receipt",
    "Student ID",
    "Student Name",
    "Class",
    "Month",
    "Expected",
    "Paid",
    "Due",
    "Method",
    "Reference"
  ];


  const rows =
    DATA.fees.map(
      fee => [

        fee.date,
        fee.receiptNumber,
        fee.studentId,
        fee.studentName,
        fee.className,
        fee.month,
        fee.expected,
        fee.paid,
        fee.due,
        fee.method,
        fee.reference

      ]
    );


  downloadCSV(
    `dingel-hafizia-fees-${today()}.csv`,
    headers,
    rows
  );
}


/* =========================================================
   EXPORT INCOME
   ========================================================= */

function exportIncomeCSV() {

  const headers = [
    "Date",
    "Category",
    "Description",
    "Amount",
    "Method",
    "Reference"
  ];


  const rows =
    DATA.income.map(
      item => [

        item.date,
        item.category,
        item.description,
        item.amount,
        item.method,
        item.reference

      ]
    );


  downloadCSV(
    `dingel-hafizia-income-${today()}.csv`,
    headers,
    rows
  );
}


/* =========================================================
   EXPORT EXPENSE
   ========================================================= */

function exportExpensesCSV() {

  const headers = [
    "Date",
    "Category",
    "Description",
    "Amount",
    "Method",
    "Reference"
  ];


  const rows =
    DATA.expenses.map(
      item => [

        item.date,
        item.category,
        item.description,
        item.amount,
        item.method,
        item.reference

      ]
    );


  downloadCSV(
    `dingel-hafizia-expenses-${today()}.csv`,
    headers,
    rows
  );
}


/* =========================================================
   PRINT STUDENT REPORT
   ========================================================= */

function printStudentsReport() {

  const students =
    activeStudents();


  const html = `

    <div
      style="
        font-family:Arial,sans-serif;
        padding:25px;
      "
    >

      <div
        style="
          text-align:center;
          margin-bottom:25px;
        "
      >

        <img
          src="${escapeHTML(
            DATA.settings.logo ||
            "logo.png"
          )}"
          style="
            width:70px;
            height:70px;
            object-fit:contain;
          "
        >

        <h2>
          ${escapeHTML(
            DATA.settings.madrasaName
          )}
        </h2>

        <h3>
          Student Report
        </h3>

        <p>
          Generated:
          ${formatDate(today())}
        </p>

      </div>


      <table
        border="1"
        cellspacing="0"
        cellpadding="7"
        style="
          width:100%;
          border-collapse:collapse;
        "
      >

        <thead>

          <tr>

            <th>SL</th>
            <th>ID</th>
            <th>Name</th>
            <th>Class</th>
            <th>Type</th>
            <th>Phone</th>
            <th>Monthly Fee</th>

          </tr>

        </thead>

        <tbody>

          ${
            students
              .map(
                (student, index) => `
                  <tr>

                    <td>
                      ${index + 1}
                    </td>

                    <td>
                      ${escapeHTML(
                        student.studentId
                      )}
                    </td>

                    <td>
                      ${escapeHTML(
                        student.name
                      )}
                    </td>

                    <td>
                      ${escapeHTML(
                        student.className
                      )}
                    </td>

                    <td>
                      ${escapeHTML(
                        student.type
                      )}
                    </td>

                    <td>
                      ${escapeHTML(
                        student.phone
                      )}
                    </td>

                    <td>
                      ${money(
                        studentMonthlyFee(
                          student
                        )
                      )}
                    </td>

                  </tr>
                `
              )
              .join("")
          }

        </tbody>

      </table>

    </div>

  `;


  printHTML(
    "Student Report",
    html
  );
}

/* =========================================================
   PRINT FINANCIAL REPORT
   ========================================================= */

function printFinancialReport() {

  const month =
    currentMonth();

  const year =
    currentYear();


  const monthlyFee =
    monthlyFeeCollection(
      month
    );

  const monthlyOther =
    monthlyOtherIncome(
      month
    );

  const monthlyExpenseValue =
    monthlyExpense(
      month
    );

  const monthlyIncome =
    monthlyFee +
    monthlyOther;

  const monthlyBalanceValue =
    monthlyIncome -
    monthlyExpenseValue;


  const yearlyFee =
    yearlyFeeCollection(
      year
    );

  const yearlyOther =
    yearlyOtherIncome(
      year
    );

  const yearlyExpenseValue =
    yearlyExpense(
      year
    );

  const yearlyIncome =
    yearlyFee +
    yearlyOther;

  const yearlyBalanceValue =
    yearlyIncome -
    yearlyExpenseValue;


  const html = `

    <div
      style="
        font-family:Arial,sans-serif;
        padding:25px;
      "
    >

      <div
        style="
          text-align:center;
          margin-bottom:25px;
        "
      >

        <img
          src="${escapeHTML(
            DATA.settings.logo ||
            "logo.png"
          )}"
          style="
            width:70px;
            height:70px;
            object-fit:contain;
          "
        >

        <h2>
          ${escapeHTML(
            DATA.settings.madrasaName
          )}
        </h2>

        <h3>
          Financial Report
        </h3>

        <p>
          Generated:
          ${formatDate(today())}
        </p>

      </div>


      <h3>
        Monthly Accounts тАФ ${month}
      </h3>

      <table
        border="1"
        cellspacing="0"
        cellpadding="9"
        style="
          width:100%;
          border-collapse:collapse;
        "
      >

        <tr>
          <th>Student Fees</th>
          <td>${money(monthlyFee)}</td>
        </tr>

        <tr>
          <th>Other Income</th>
          <td>${money(monthlyOther)}</td>
        </tr>

        <tr>
          <th>Total Income</th>
          <td>${money(monthlyIncome)}</td>
        </tr>

        <tr>
          <th>Total Expense</th>
          <td>${money(monthlyExpenseValue)}</td>
        </tr>

        <tr>
          <th>Net Balance</th>
          <td>${money(monthlyBalanceValue)}</td>
        </tr>

      </table>


      <br>


      <h3>
        Yearly Accounts тАФ ${year}
      </h3>

      <table
        border="1"
        cellspacing="0"
        cellpadding="9"
        style="
          width:100%;
          border-collapse:collapse;
        "
      >

        <tr>
          <th>Student Fees</th>
          <td>${money(yearlyFee)}</td>
        </tr>

        <tr>
          <th>Other Income</th>
          <td>${money(yearlyOther)}</td>
        </tr>

        <tr>
          <th>Total Income</th>
          <td>${money(yearlyIncome)}</td>
        </tr>

        <tr>
          <th>Total Expense</th>
          <td>${money(yearlyExpenseValue)}</td>
        </tr>

        <tr>
          <th>Net Balance</th>
          <td>${money(yearlyBalanceValue)}</td>
        </tr>

      </table>

    </div>

  `;


  printHTML(
    "Financial Report",
    html
  );
}


/* =========================================================
   GENERIC PRINT HTML
   ========================================================= */

function printHTML(
  title,
  html
) {

  const printWindow =
    window.open(
      "",
      "_blank",
      "width=1000,height=750"
    );

  if (!printWindow) {

    toast(
      "Please allow pop-ups to print.",
      "error"
    );

    return;
  }


  printWindow.document.write(`

    <!doctype html>

    <html>

      <head>

        <meta charset="UTF-8">

        <title>
          ${escapeHTML(title)}
        </title>

        <style>

          * {
            box-sizing:border-box;
          }

          body {
            margin:0;
            color:#17212b;
            background:#fff;
          }

          @media print {

            body {
              padding:0;
            }

          }

        </style>

      </head>

      <body>

        ${html}

      </body>

    </html>

  `);


  printWindow.document.close();

  printWindow.focus();


  setTimeout(
    () => {

      printWindow.print();

      printWindow.close();

    },
    400
  );
}


/* =========================================================
   MADRASA PROFILE / SETTINGS
   ========================================================= */

function settingsView() {

  const settings =
    DATA.settings;


  return `
    <div class="page">

      ${pageHeader(
        "Madrasa Profile",
        "Manage madrasa name, address, contact and system information."
      )}


      <div class="grid2">

        <div class="card">

          <div class="cardhead">

            <b>
              ЁЯПл Madrasa Information
            </b>

          </div>

          <form id="settingsForm">

            <div class="form-grid">

              <div class="field">

                <label>
                  Madrasa Name ржмрж╛ржВрж▓рж╛
                </label>

                <input
                  id="setMadrasaName"
                  value="${escapeHTML(
                    settings.madrasaName
                  )}"
                  required
                >

              </div>

              <div class="field">

                <label>
                  Madrasa Name English
                </label>

                <input
                  id="setEnglishName"
                  value="${escapeHTML(
                    settings.englishName
                  )}"
                >

              </div>

              <div class="field full">

                <label>
                  Address
                </label>

                <textarea
                  id="setAddress"
                  rows="3"
                >${escapeHTML(
                  settings.address
                )}</textarea>

              </div>

              <div class="field">

                <label>
                  Phone
                </label>

                <input
                  id="setPhone"
                  inputmode="tel"
                  value="${escapeHTML(
                    settings.phone
                  )}"
                >

              </div>

              <div class="field">

                <label>
                  Email
                </label>

                <input
                  id="setEmail"
                  type="email"
                  value="${escapeHTML(
                    settings.email
                  )}"
                >

              </div>

              <div class="field">

                <label>
                  Academic Year
                </label>

                <input
                  id="setAcademicYear"
                  value="${escapeHTML(
                    settings.academicYear
                  )}"
                >

              </div>

              <div class="field">

                <label>
                  Currency
                </label>

                <select id="setCurrency">

                  <option
                    value="INR"
                    ${
                      settings.currency ===
                      "INR"
                        ? "selected"
                        : ""
                    }
                  >
                    INR тАФ тВ╣
                  </option>

                  <option
                    value="BDT"
                    ${
                      settings.currency ===
                      "BDT"
                        ? "selected"
                        : ""
                    }
                  >
                    BDT тАФ рз│
                  </option>

                </select>

              </div>

              <div class="field">

                <label>
                  Opening Balance
                </label>

                <input
                  id="setOpeningBalance"
                  type="number"
                  min="0"
                  value="${number(
                    settings.openingBalance
                  )}"
                >

              </div>

              <div class="field full">

                <label>
                  Logo File
                </label>

                <input
                  id="setLogo"
                  type="text"
                  value="${escapeHTML(
                    settings.logo ||
                    "logo.png"
                  )}"
                  placeholder="logo.png"
                >

              </div>

            </div>


            <div class="form-actions">

              <button
                type="submit"
                class="btn primary"
              >
                Save Madrasa Profile
              </button>

            </div>

          </form>

        </div>


        <div class="card">

          <div class="cardhead">

            <b>
              Logo Preview
            </b>

          </div>

          <div
            style="
              text-align:center;
              padding:35px 10px;
            "
          >

            <img
              src="${escapeHTML(
                settings.logo ||
                "logo.png"
              )}"
              alt="Madrasa Logo"
              style="
                width:160px;
                height:160px;
                object-fit:contain;
              "
            >

            <h3>
              ${escapeHTML(
                settings.madrasaName
              )}
            </h3>

            <p>
              ${escapeHTML(
                settings.englishName
              )}
            </p>

          </div>

        </div>

      </div>


      <div class="card">

        <div class="cardhead">

          <b>
            ЁЯФР Security Notice
          </b>

        </div>

        <p>
          Current front-end password is only a
          compatibility login. For real Aadhaar,
          photo and document records, use Firebase
          Authentication with restrictive Firestore
          and Storage Rules.
        </p>

      </div>


      <div class="card">

        <div class="cardhead">

          <b>
            ЁЯТ╛ Data Management
          </b>

        </div>

        <div class="quick">

          <button
            type="button"
            data-backup
          >
            Download Backup
          </button>

          <button
            type="button"
            data-restore
          >
            Restore Backup
          </button>

        </div>

        <input
          id="restoreFile"
          type="file"
          accept=".json"
          hidden
        >

      </div>

    </div>
  `;
}


/* =========================================================
   SAVE SETTINGS
   ========================================================= */

async function saveSettings() {

  DATA.settings = {

    ...DATA.settings,

    madrasaName:
      $("#setMadrasaName")
        .value
        .trim(),

    englishName:
      $("#setEnglishName")
        .value
        .trim(),

    address:
      $("#setAddress")
        .value
        .trim(),

    phone:
      $("#setPhone")
        .value
        .trim(),

    email:
      $("#setEmail")
        .value
        .trim(),

    academicYear:
      $("#setAcademicYear")
        .value
        .trim(),

    currency:
      $("#setCurrency")
        .value,

    openingBalance:
      number(
        $("#setOpeningBalance")
          .value
      ),

    logo:
      $("#setLogo")
        .value
        .trim() ||
      "logo.png"

  };


  addActivity(
    "Profile Updated",
    "Madrasa profile/settings updated."
  );


  await persistData();

  toast(
    "Madrasa profile saved."
  );
}
/* =========================================================
   RESTORE BACKUP
   ========================================================= */

function restoreBackup() {

  const input =
    $("#restoreFile");

  if (!input) {
    return;
  }

  input.value = "";

  input.click();

  input.onchange =
    async () => {

      const file =
        input.files?.[0];

      if (!file) {
        return;
      }

      try {

        const text =
          await file.text();

        const imported =
          JSON.parse(text);


        if (
          !imported ||
          typeof imported !==
            "object"
        ) {

          throw new Error(
            "Invalid backup"
          );

        }


        if (
          !Array.isArray(
            imported.students
          ) ||
          !Array.isArray(
            imported.fees
          ) ||
          !Array.isArray(
            imported.income
          ) ||
          !Array.isArray(
            imported.expenses
          )
        ) {

          throw new Error(
            "Backup structure is invalid"
          );

        }


        if (
          !confirmAction(
            "Restore this backup? Current local data will be replaced."
          )
        ) {

          return;

        }


        DATA = {

          ...clone(
            DEFAULT_DATA
          ),

          ...imported,

          settings: {
            ...clone(
              DEFAULT_DATA.settings
            ),
            ...(imported.settings || {})
          }

        };


        addActivity(
          "Backup Restored",
          "Full ERP backup restored."
        );


        await persistData();

        toast(
          "Backup restored successfully."
        );


      } catch (error) {

        console.error(
          "Restore error:",
          error
        );

        toast(
          "Invalid or damaged backup file.",
          "error"
        );

      }

    };
}


/* =========================================================
   FINAL RENDER OVERRIDE
   ========================================================= */

render = function () {

  renderNavigation();

  updateTopBar();

  const view =
    $("#view");

  if (!view) {
    return;
  }


  let html = "";


  switch (
    currentPage
  ) {

    case "dashboard":

      html =
        dashboardView();

      break;


    case "students":

      html =
        studentsView();

      break;


    case "fees":

      html =
        feesView();

      break;


    case "due":

      html =
        dueView();

      break;


    case "income":

      html =
        incomeView();

      break;


    case "expense":

      html =
        expenseView();

      break;


    case "accounts":

      html =
        accountsView();

      break;


    case "reports":

      html =
        reportsView();

      break;


    case "settings":

      html =
        settingsView();

      break;


    default:

      html =
        dashboardView();

  }


  view.innerHTML =
    html;


  bindEvents();

  bindStudentActionEvents();


  /* Student filters */

  $("#studentSearch")
    ?.addEventListener(
      "input",
      applyStudentFilters
    );

  $("#studentClassFilter")
    ?.addEventListener(
      "change",
      applyStudentFilters
    );

  $("#studentTypeFilter")
    ?.addEventListener(
      "change",
      applyStudentFilters
    );


  /* Fee search */

  $("#feeSearch")
    ?.addEventListener(
      "input",
      event => {

        const value =
          event.target.value
            .trim()
            .toLowerCase();


        $all(
          ".tablewrap tbody tr"
        ).forEach(row => {

          row.style.display =
            row.textContent
              .toLowerCase()
              .includes(value)
                ? ""
                : "none";

        });

      }
    );


  /* Delete income */

  $all(
    "[data-delete-income]"
  ).forEach(button => {

    button.addEventListener(
      "click",
      () => {

        deleteIncome(
          button
            .dataset
            .deleteIncome
        );

      }
    );

  });


  /* Delete expense */

  $all(
    "[data-delete-expense]"
  ).forEach(button => {
  button.addEventListener(
      "click",
      () => {

        deleteExpense(
          button
            .dataset
            .deleteExpense
        );

      }
    );

  });


  /* Save settings */

  $("#settingsForm")
    ?.addEventListener(
      "submit",
      event => {

        event.preventDefault();

        saveSettings();

      }
    );


  /* Export buttons */

  $all(
    "[data-export-students]"
  ).forEach(button => {

    button.addEventListener(
      "click",
      exportStudentsCSV
    );

  });


  $all(
    "[data-export-fees]"
  ).forEach(button => {

    button.addEventListener(
      "click",
      exportFeesCSV
    );

  });


  $all(
    "[data-export-income]"
  ).forEach(button => {

    button.addEventListener(
      "click",
      exportIncomeCSV
    );

  });


  $all(
    "[data-export-expenses]"
  ).forEach(button => {

    button.addEventListener(
      "click",
      exportExpensesCSV
    );

  });


  /* Print buttons */

  $all(
    "[data-print-students]"
  ).forEach(button => {

    button.addEventListener(
      "click",
      printStudentsReport
    );

  });


  $all(
    "[data-print-financial]"
  ).forEach(button => {

    button.addEventListener(
      "click",
      printFinancialReport
    );

  });


  /* Backup */

  $all(
    "[data-backup]"
  ).forEach(button => {

    button.addEventListener(
      "click",
      exportBackup
    );

  });


  /* Restore */

  $all(
    "[data-restore]"
  ).forEach(button => {

    button.addEventListener(
      "click",
      restoreBackup
    );

  });

};


/* =========================================================
   FINAL APPLICATION FEATURES
   ========================================================= */


/*
 * Update activity timestamp whenever data changes.
 */

function getActivityLog() {

  return DATA.activity
    .slice()
    .sort(
      (a, b) =>
        String(b.timestamp)
          .localeCompare(
            String(a.timestamp)
          )
    );

}


/* =========================================================
   MONTHLY ACCOUNT DATA
   ========================================================= */

function getMonthlyAccount(
  month
) {

  const fee =
    monthlyFeeCollection(
      month
    );

  const other =
    monthlyOtherIncome(
      month
    );

  const expense =
    monthlyExpense(
      month
    );

  const income =
    fee + other;

  return {

    month,

    fee,

    other,

    income,

    expense,

    balance:
      income - expense

  };

}


/* =========================================================
   YEARLY ACCOUNT DATA
   ========================================================= */

function getYearlyAccount(
  year
) {

  const fee =
    yearlyFeeCollection(
      year
    );

  const other =
    yearlyOtherIncome(
      year
    );

  const expense =
    yearlyExpense(
      year
    );

  const income =
    fee + other;

  return {

    year,

    fee,

    other,

    income,

    expense,

    balance:
      income - expense

  };

}


/* =========================================================
   MONTHLY REPORT TABLE
   ========================================================= */

function monthlyReportRows(
  year = currentYear()
) {

  const rows = [];


  for (
    let month = 1;
    month <= 12;
    month++
  ) {

    const value =
      `${year}-${String(
        month
      ).padStart(2, "0")}`;


    rows.push(
      getMonthlyAccount(
        value
      )
    );

  }


  return rows;
}


/* =========================================================
   YEARLY REPORT TABLE
   ========================================================= */

function yearlyReportRows(
  startYear,
  endYear
) {

  const rows = [];


  const start =
    number(startYear);

  const end =
    number(endYear);


  for (
    let year = start;button.addEventListener(
      "click",
      () => {

        deleteExpense(
          button
            .dataset
            .deleteExpense
        );

      }
    );

  });


  /* Save settings */

  $("#settingsForm")
    ?.addEventListener(
      "submit",
      event => {

        event.preventDefault();

        saveSettings();

      }
    );


  /* Export buttons */

  $all(
    "[data-export-students]"
  ).forEach(button => {

    button.addEventListener(
      "click",
      exportStudentsCSV
    );

  });


  $all(
    "[data-export-fees]"
  ).forEach(button => {

    button.addEventListener(
      "click",
      exportFeesCSV
    );

  });


  $all(
    "[data-export-income]"
  ).forEach(button => {

    button.addEventListener(
      "click",
      exportIncomeCSV
    );

  });


  $all(
    "[data-export-expenses]"
  ).forEach(button => {

    button.addEventListener(
      "click",
      exportExpensesCSV
    );

  });


  /* Print buttons */

  $all(
    "[data-print-students]"
  ).forEach(button => {

    button.addEventListener(
      "click",
      printStudentsReport
    );

  });


  $all(
    "[data-print-financial]"
  ).forEach(button => {

    button.addEventListener(
      "click",
      printFinancialReport
    );

  });


  /* Backup */

  $all(
    "[data-backup]"
  ).forEach(button => {

    button.addEventListener(
      "click",
      exportBackup
    );

  });


  /* Restore */

  $all(
    "[data-restore]"
  ).forEach(button => {

    button.addEventListener(
      "click",
      restoreBackup
    );

  });

};


/* =========================================================
   FINAL APPLICATION FEATURES
   ========================================================= */


/*
 * Update activity timestamp whenever data changes.
 */

function getActivityLog() {

  return DATA.activity
    .slice()
    .sort(
      (a, b) =>
        String(b.timestamp)
          .localeCompare(
            String(a.timestamp)
          )
    );

}


/* =========================================================
   MONTHLY ACCOUNT DATA
   ========================================================= */

function getMonthlyAccount(
  month
) {

  const fee =
    monthlyFeeCollection(
      month
    );

  const other =
    monthlyOtherIncome(
      month
    );

  const expense =
    monthlyExpense(
      month
    );

  const income =
    fee + other;

  return {

    month,

    fee,

    other,

    income,

    expense,

    balance:
      income - expense

  };

}


/* =========================================================
   YEARLY ACCOUNT DATA
   ========================================================= */

function getYearlyAccount(
  year
) {

  const fee =
    yearlyFeeCollection(
      year
    );

  const other =
    yearlyOtherIncome(
      year
    );

  const expense =
    yearlyExpense(
      year
    );

  const income =
    fee + other;

  return {

    year,

    fee,

    other,

    income,

    expense,

    balance:
      income - expense

  };

}


/* =========================================================
   MONTHLY REPORT TABLE
   ========================================================= */

function monthlyReportRows(
  year = currentYear()
) {

  const rows = [];


  for (
    let month = 1;
    month <= 12;
    month++
  ) {

    const value =
      `${year}-${String(
        month
      ).padStart(2, "0")}`;


    rows.push(
      getMonthlyAccount(
        value
      )
    );

  }


  return rows;
}


/* =========================================================
   YEARLY REPORT TABLE
   ========================================================= */

function yearlyReportRows(
  startYear,
  endYear
) {

  const rows = [];


  const start =
    number(startYear);

  const end =
    number(endYear);


  for (
    let year = start;
    year <= end;
    year++
  ) {

    rows.push(
      getYearlyAccount(
        String(year)
      )
    );

  }


  return rows;
}


/* =========================================================
   APPLICATION READY LOG
   ========================================================= */

console.log(
  "Dingel Hafizia Madrasa ERP — Part 3 loaded."
);
    year <= end;
    year++
  ) {

    rows.push(
      getYearlyAccount(
        String(year)
      )
    );

  }


  return rows;
}


/* =========================================================
   APPLICATION READY LOG
   ========================================================= */

console.log(
  "Dingel Hafizia Madrasa ERP тАФ Part 3 loaded."
);