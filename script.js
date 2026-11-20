
/* =========================================================
   CAMPUS CONNECT
   Frontend demonstration only - localStorage based
   ========================================================= */

const STORAGE = {
  reports: "cc_demo_reports_v1",
  profile: "cc_demo_profile_v1",
  notifications: "cc_demo_notifications_v1",
  role: "cc_demo_role_v1"
};

const categories = {
  "Physical Accessibility": [
    "Ramp or wheelchair access",
    "Lift or elevator problem",
    "Accessible washroom",
    "Accessible pathway",
    "Other accessibility issue"
  ],
  "Educational and Academic Issues": [
    "Classroom or teaching issue",
    "Laboratory equipment",
    "Library or learning resources",
    "Course or timetable issue",
    "Academic support",
    "Other academic issue"
  ],
  "College Infrastructure and Facilities": [
    "Drinking water",
    "Electricity or lighting",
    "Washroom maintenance",
    "Classroom furniture",
    "Building maintenance",
    "Cleanliness or waste management",
    "Other infrastructure issue"
  ],
  "Bus and Transportation": [
    "Bus delay",
    "Bus route problem",
    "Pickup or drop-off point",
    "Bus condition",
    "Transport staff concern",
    "Other transport issue"
  ],
  "Digital Campus Issues": [
    "College website",
    "Student portal",
    "Wi-Fi or internet",
    "Online attendance",
    "Learning management system",
    "Other digital issue"
  ],
  "Other College-Related Problems": [
    "Student services",
    "Campus safety",
    "Administrative issue",
    "Canteen or food facility",
    "Other concern"
  ]
};

const statusOptions = [
  "Pending",
  "Under Review",
  "Assigned",
  "In Progress",
  "Resolved",
  "Reopened",
  "Rejected"
];

let reports = load(STORAGE.reports, []);
let notifications = load(STORAGE.notifications, []);
let profile = load(STORAGE.profile, {
  name: "",
  email: "",
  department: "",
  studentId: ""
});
let role = load(STORAGE.role, "student");
let activeReportId = null;
let toastTimer = null;

// ---------- STORAGE HELPERS ----------

function load(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch (error) {
    console.error("Storage read error:", error);
    return fallback;
  }
}

function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error("Storage write error:", error);
    showToast("Could not save data. Browser storage may be full.");
    return false;
  }
}

function saveAll() {
  save(STORAGE.reports, reports);
  save(STORAGE.notifications, notifications);
  save(STORAGE.profile, profile);
}

function escapeHTML(value = "") {
  return String(value).replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[character]);
}

function formatDate(date) {
  return new Date(date).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function makeId() {
  return "CC-" + Date.now().toString(36).toUpperCase() +
    "-" + Math.random().toString(36).slice(2, 6).toUpperCase();
}

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 3000);
}

function statusClass(status) {
  return "status-" + status.toLowerCase().replace(/\s+/g, "-");
}

function statusBadge(status) {
  return `<span class="status ${statusClass(status)}">${escapeHTML(status)}</span>`;
}

// ---------- NAVIGATION ----------

function navigate(page) {
  document.querySelectorAll(".page").forEach(section => {
    section.classList.remove("active");
  });

  const target = document.getElementById("page-" + page);
  if (!target) return;

  target.classList.add("active");

  document.querySelectorAll(".nav-links a").forEach(link => {
    link.classList.toggle("active", link.dataset.page === page);
  });

  document.getElementById("navLinks").classList.remove("open");

  if (page === "dashboard") renderDashboard();
  if (page === "track") renderReports();
  if (page === "notifications") renderNotifications();
  if (page === "profile") renderProfile();

  window.scrollTo({ top: 0, behavior: "smooth" });
}

document.addEventListener("click", event => {
  const pageLink = event.target.closest("[data-page]");
  if (pageLink) {
    event.preventDefault();
    navigate(pageLink.dataset.page);
  }
});

document.getElementById("menuToggle").addEventListener("click", () => {
  document.getElementById("navLinks").classList.toggle("open");
});

document.getElementById("notificationButton").addEventListener("click", () => {
  navigate("notifications");
});

// ---------- NOTIFICATIONS ----------

function addNotification(title, message, reportId) {
  notifications.unshift({
    id: "N-" + Date.now(),
    title,
    message,
    reportId,
    read: false,
    createdAt: new Date().toISOString()
  });

  notifications = notifications.slice(0, 100);
  save(STORAGE.notifications, notifications);
  updateNotificationCount();
}

function updateNotificationCount() {
  const unread = notifications.filter(item => !item.read).length;
  document.getElementById("notificationCount").textContent =
    unread > 99 ? "99+" : unread;
  document.getElementById("notificationCount").style.display =
    unread ? "grid" : "none";
}

function renderNotificationItem(item) {
  return `
    <div class="notification-item ${item.read ? "" : "unread"}"
         data-notification-id="${escapeHTML(item.id)}">
      <span class="notification-dot"></span>
      <div>
        <strong>${escapeHTML(item.title)}</strong>
        <p>${escapeHTML(item.message)}</p>
        <p>${formatDate(item.createdAt)}</p>
      </div>
    </div>`;
}

function renderNotifications() {
  const container = document.getElementById("notificationsList");

  if (!notifications.length) {
    container.innerHTML = `
      <div class="empty-state">
        <strong>No notifications yet</strong>
        Updates will appear here in this browser demonstration.
      </div>`;
  } else {
    container.innerHTML = notifications.map(renderNotificationItem).join("");
  }

  updateNotificationCount();
  renderDashboardNotifications();
}

function renderDashboardNotifications() {
  const container = document.getElementById("dashboardNotifications");
  const latest = notifications.slice(0, 5);

  container.innerHTML = latest.length
    ? latest.map(renderNotificationItem).join("")
    : `<div class="empty-state">No notifications yet.</div>`;
}

document.getElementById("notificationsList").addEventListener("click", event => {
  const item = event.target.closest("[data-notification-id]");
  if (!item) return;

  const notification = notifications.find(n => n.id === item.dataset.notificationId);
  if (!notification) return;

  notification.read = true;
  save(STORAGE.notifications, notifications);
  updateNotificationCount();

  if (notification.reportId) {
    openReport(notification.reportId);
  } else {
    renderNotifications();
  }
});

document.getElementById("dashboardNotifications").addEventListener("click", event => {
  const item = event.target.closest("[data-notification-id]");
  if (!item) return;

  const notification = notifications.find(n => n.id === item.dataset.notificationId);
  if (!notification) return;

  notification.read = true;
  save(STORAGE.notifications, notifications);
  updateNotificationCount();

  if (notification.reportId) openReport(notification.reportId);
});

document.getElementById("markAllRead").addEventListener("click", () => {
  notifications.forEach(item => item.read = true);
  save(STORAGE.notifications, notifications);
  renderNotifications();
  showToast("All notifications marked as read.");
});

// ---------- CATEGORY AND CONDITIONAL FIELDS ----------

const categorySelect = document.getElementById("category");
const subcategorySelect = document.getElementById("subcategory");
const conditionalFields = document.getElementById("conditionalFields");

categorySelect.addEventListener("change", () => {
  const selected = categorySelect.value;
  const options = categories[selected] || [];

  subcategorySelect.innerHTML = options.length
    ? `<option value="">Select a subcategory</option>` +
      options.map(option =>
        `<option value="${escapeHTML(option)}">${escapeHTML(option)}</option>`
      ).join("")
    : `<option value="">Choose a category first</option>`;

  subcategorySelect.disabled = !options.length;
  renderConditionalFields(selected);
});

subcategorySelect.addEventListener("change", () => {
  renderConditionalFields(categorySelect.value);
});

function renderConditionalFields(category) {
  let heading = "";
  let fields = "";

  if (category === "Educational and Academic Issues") {
    heading = "Academic details";
    fields = `
      <div class="form-grid">
        <label>Department
          <input id="extraDepartment" placeholder="e.g. Computer Science">
        </label>
        <label>Subject / Course
          <input id="extraSubject" placeholder="Enter subject or course name">
        </label>
      </div>
      <label>Academic resource / class details
        <input id="extraAcademic" placeholder="e.g. Lab equipment, classroom or learning resource">
      </label>`;
  }

  if (category === "Bus and Transportation") {
    heading = "Transportation details";
    fields = `
      <div class="form-grid">
        <label>Bus number
          <input id="extraBus" placeholder="e.g. BUS-12">
        </label>
        <label>Route
          <input id="extraRoute" placeholder="Enter bus route">
        </label>
        <label>Pickup / Drop-off point
          <input id="extraPickup" placeholder="Enter location">
        </label>
        <label>Travel date and time
          <input id="extraTravelTime" type="datetime-local">
        </label>
      </div>`;
  }

  if (category === "Digital Campus Issues") {
    heading = "Digital issue details";
    fields = `
      <div class="form-grid">
        <label>Website / Portal
          <input id="extraPortal" placeholder="e.g. Student portal">
        </label>
        <label>Device / Platform
          <input id="extraDevice" placeholder="e.g. Android, Windows, Chrome">
        </label>
      </div>
      <label>Error message
        <input id="extraError" placeholder="Enter the error message, if any">
      </label>`;
  }

  conditionalFields.innerHTML = fields
    ? `<h4>${heading}</h4>${fields}`
    : "";
}

function getConditionalData() {
  const ids = [
    "extraDepartment", "extraSubject", "extraAcademic",
    "extraBus", "extraRoute", "extraPickup", "extraTravelTime",
    "extraPortal", "extraDevice", "extraError"
  ];

  const data = {};

  ids.forEach(id => {
    const element = document.getElementById(id);
    if (element && element.value.trim()) {
      data[id] = element.value.trim();
    }
  });

  return data;
}

// ---------- REPORT SUBMISSION ----------

document.getElementById("reportForm").addEventListener("submit", async event => {
  event.preventDefault();

  const fileInput = document.getElementById("attachment");
  const file = fileInput.files[0];

  if (file) {
    const validTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!validTypes.includes(file.type)) {
      showToast("Please select a JPG, PNG or WEBP image.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      showToast("Image must be smaller than 2 MB.");
      return;
    }
  }

  const submitButton = event.target.querySelector('button[type="submit"]');
  submitButton.disabled = true;
  submitButton.textContent = "Submitting...";

  try {
    let imageData = "";

    if (file) {
      imageData = await readImage(file);
    }

    const report = {
      id: makeId(),
      title: document.getElementById("subcategory").value,
      category: categorySelect.value,
      subcategory: subcategorySelect.value,
      location: document.getElementById("location").value.trim(),
      exactLocation: document.getElementById("exactLocation").value.trim(),
      description: document.getElementById("description").value.trim(),
      urgency: document.getElementById("urgency").value,
      extra: getConditionalData(),
      image: imageData,
      status: "Pending",
      assignedTo: "",
      resolutionNotes: "",
      rejectionReason: "",
      submittedBy: profile.name || "Demo Student",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      history: [{
        status: "Pending",
        note: "Report submitted in frontend demonstration.",
        date: new Date().toISOString()
      }]
    };

    reports.unshift(report);

    if (!save(STORAGE.reports, reports)) {
      reports.shift();
      return;
    }

    addNotification(
      "Report submitted",
      `Your report ${report.id} has been created.`,
      report.id
    );

    event.target.reset();
    subcategorySelect.disabled = true;
    subcategorySelect.innerHTML = `<option value="">Choose a category first</option>`;
    conditionalFields.innerHTML = "";

    showToast("Report submitted! ID: " + report.id);
    openReport(report.id);

  } catch (error) {
    console.error(error);
    showToast("Unable to submit report. Please try again.");
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Submit Report →";
  }
});

function readImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ---------- REPORT LIST AND FILTERS ----------

document.getElementById("reportSearch").addEventListener("input", renderReports);
document.getElementById("statusFilter").addEventListener("change", renderReports);
document.getElementById("categoryFilter").addEventListener("change", renderReports);

function renderReports() {
  const search = document.getElementById("reportSearch").value.toLowerCase().trim();
  const status = document.getElementById("statusFilter").value;
  const category = document.getElementById("categoryFilter").value;

  const filtered = reports.filter(report => {
    const searchable = [
      report.id, report.title, report.location, report.category,
      report.description, report.subcategory
    ].join(" ").toLowerCase();

    return searchable.includes(search) &&
      (!status || report.status === status) &&
      (!category || report.category === category);
  });

  const container = document.getElementById("reportsList");

  if (!filtered.length) {
    container.innerHTML = `
      <div class="empty-state">
        <strong>No reports found</strong>
        Try changing your search or filters, or submit a new report.
      </div>`;
    return;
  }

  container.innerHTML = filtered.map(report => `
    <article class="report-card">
      <div>
        <div class="report-meta">
          <strong>${escapeHTML(report.id)}</strong>
          ${statusBadge(report.status)}
          <span>${escapeHTML(report.urgency)} urgency</span>
        </div>
        <h3>${escapeHTML(report.title)}</h3>
        <p>${escapeHTML(report.category)} · ${escapeHTML(report.location)}</p>
        <p>${formatDate(report.createdAt)}</p>
      </div>
      <button class="btn btn-primary" data-open-report="${escapeHTML(report.id)}">View Details →</button>
    </article>
  `).join("");
}

document.getElementById("reportsList").addEventListener("click", event => {
  const button = event.target.closest("[data-open-report]");
  if (button) openReport(button.dataset.openReport);
});

// ---------- REPORT DETAILS AND WORKFLOW ----------

function openReport(id) {
  const report = reports.find(item => item.id === id);
  if (!report) {
    showToast("Report not found.");
    return;
  }

  activeReportId = id;

  // Mark associated notifications as read.
  notifications.forEach(item => {
    if (item.reportId === id) item.read = true;
  });
  save(STORAGE.notifications, notifications);
  updateNotificationCount();

  const extraDetails = Object.entries(report.extra || {})
    .map(([key, value]) => `
      <p><strong>${escapeHTML(key.replace("extra", ""))}:</strong>
      ${escapeHTML(value)}</p>`)
    .join("");

  const history = (report.history || []).map(item => `
    <div class="history-item">
      <strong>${escapeHTML(item.status)}</strong>
      <p>${escapeHTML(item.note || "")}</p>
      <p>${formatDate(item.date)}</p>
    </div>
  `).join("");

  let actions = "";

  if (role === "student" && report.status === "Resolved") {
    actions = `
      <button class="btn btn-primary" data-action="confirm">Confirm Resolution</button>
      <button class="btn btn-danger" data-action="reopen">Reopen Report</button>`;
  }

  if (role === "faculty" || role === "admin") {
    actions = `
      <div class="admin-controls">
        <h3>Update report (demonstration)</h3>
        <div class="form-grid">
          <label>Update status
            <select id="detailStatus">
              ${statusOptions.map(status =>
                `<option ${status === report.status ? "selected" : ""}>${status}</option>`
              ).join("")}
            </select>
          </label>
          <label>Assign to department / person
            <input id="detailAssignee" value="${escapeHTML(report.assignedTo)}"
              placeholder="Enter department or faculty name">
          </label>
        </div>
        <label>Update / resolution notes
          <textarea id="detailNotes" rows="3"
            placeholder="Write an update or resolution details..."></textarea>
        </label>
        <label id="rejectionField" style="display:none">Reason for rejection
          <input id="detailRejection" placeholder="Explain why the report is rejected">
        </label>
        <button class="btn btn-primary" data-action="update">Save Update</button>
      </div>`;
  }

  document.getElementById("reportDetails").innerHTML = `
    <article class="detail-card">
      <div class="report-meta">
        <strong>${escapeHTML(report.id)}</strong>
        ${statusBadge(report.status)}
        <span>${escapeHTML(report.urgency)} urgency</span>
      </div>
      <h2>${escapeHTML(report.title)}</h2>
      <p class="muted">${escapeHTML(report.category)} · Submitted ${formatDate(report.createdAt)}</p>

      <div class="detail-grid">
        <div><small>Location</small><strong>${escapeHTML(report.location)}</strong></div>
        <div><small>Exact location</small><strong>${escapeHTML(report.exactLocation || "Not provided")}</strong></div>
        <div><small>Assigned to</small><strong>${escapeHTML(report.assignedTo || "Not assigned")}</strong></div>
      </div>

      <h3>Problem description</h3>
      <p class="detail-description">${escapeHTML(report.description)}</p>
      ${extraDetails}
      ${report.image ? `<h3>Attached image</h3><img class="detail-image" src="${report.image}" alt="Report attachment">` : ""}

      ${report.resolutionNotes ? `<h3>Latest update / resolution notes</h3><p>${escapeHTML(report.resolutionNotes)}</p>` : ""}
      ${report.rejectionReason ? `<h3>Rejection reason</h3><p>${escapeHTML(report.rejectionReason)}</p>` : ""}

      <h3>Report history</h3>
      ${history || "<p>No history available.</p>"}
      <div class="detail-actions">${actions}</div>
    </article>`;

  navigate("details");

  const detailStatus = document.getElementById("detailStatus");
  if (detailStatus) {
    detailStatus.addEventListener("change", () => {
      document.getElementById("rejectionField").style.display =
        detailStatus.value === "Rejected" ? "block" : "none";
    });
  }
}

document.getElementById("reportDetails").addEventListener("click", event => {
  const button = event.target.closest("[data-action]");
  if (!button || !activeReportId) return;

  const report = reports.find(item => item.id === activeReportId);
  if (!report) return;

  const action = button.dataset.action;

  if (action === "confirm") {
    if (!confirm("Confirm that this problem has been resolved?")) return;

    updateReport(report, "Resolved", "Student confirmed the resolution.");
    report.studentConfirmed = true;
    save(STORAGE.reports, reports);
    showToast("Resolution confirmed.");
    openReport(report.id);
  }

  if (action === "reopen") {
    const reason = prompt("Why are you reopening this report?");
    if (!reason || !reason.trim()) return;

    report.studentConfirmed = false;
    updateReport(report, "Reopened", "Student reopened the report: " + reason.trim());
    addNotification("Report reopened", `${report.id} has been reopened.`, report.id);
    showToast("Report reopened.");
    openReport(report.id);
  }

  if (action === "update") {
    const newStatus = document.getElementById("detailStatus").value;
    const assignee = document.getElementById("detailAssignee").value.trim();
    const notes = document.getElementById("detailNotes").value.trim();
    const rejection = document.getElementById("detailRejection")?.value.trim() || "";

    if (newStatus === "Rejected" && !rejection) {
      showToast("Please provide a reason for rejection.");
      return;
    }

    report.assignedTo = assignee;

    if (newStatus === "Assigned" && !assignee) {
      showToast("Please enter an assignee before assigning.");
      return;
    }

    report.resolutionNotes = notes || report.resolutionNotes;
    report.rejectionReason = newStatus === "Rejected" ? rejection : "";

    const note = notes || (
      newStatus === "Rejected"
        ? "Report rejected: " + rejection
        : "Report updated by " + role + "."
    );

    updateReport(report, newStatus, note);
    addNotification(
      "Report updated",
      `${report.id} status changed to ${newStatus}.`,
      report.id
    );

    showToast("Report updated successfully.");
    openReport(report.id);
  }
});

function updateReport(report, newStatus, note) {
  report.status = newStatus;
  report.updatedAt = new Date().toISOString();
  report.history = report.history || [];
  report.history.unshift({
    status: newStatus,
    note,
    date: new Date().toISOString()
  });

  save(STORAGE.reports, reports);
  renderDashboard();
}

// ---------- DASHBOARD ----------

document.getElementById("demoRole").addEventListener("change", event => {
  role = event.target.value;
  save(STORAGE.role, role);
  showToast("Switched to " + role + " demonstration view.");
  renderDashboard();

  if (document.getElementById("page-details").classList.contains("active") && activeReportId) {
    openReport(activeReportId);
  }
});

function renderDashboard() {
  document.getElementById("demoRole").value = role;

  const titles = {
    student: ["Student Dashboard", "Your campus reports at a glance.", "Recent Reports"],
    faculty: ["Faculty Dashboard", "Review and update reports assigned in this demo.", "Reports for Faculty Review"],
    admin: ["Administrator Dashboard", "Monitor reports and manage demonstration workflow.", "All Campus Reports"]
  };

  document.getElementById("dashboardTitle").textContent = titles[role][0];
  document.getElementById("dashboardDescription").textContent = titles[role][1];
  document.getElementById("dashboardListTitle").textContent = titles[role][2];

  // This is a shared browser demonstration, not a real role-based data boundary.
  const total = reports.length;
  const pending = reports.filter(r => ["Pending", "Under Review"].includes(r.status)).length;
  const progress = reports.filter(r => ["Assigned", "In Progress", "Reopened"].includes(r.status)).length;
  const resolved = reports.filter(r => r.status === "Resolved").length;

  const stats = [
    ["Total Reports", total, "📋"],
    ["Pending / Review", pending, "⏳"],
    ["In Progress", progress, "⚙️"],
    ["Resolved", resolved, "✓"]
  ];

  document.getElementById("statsGrid").innerHTML = stats.map(([label, value, icon]) => `
    <div class="stat-card"><span class="stat-icon">${icon}</span>
      <p>${label}</p><strong>${value}</strong>
    </div>`).join("");

  const visibleReports = role === "faculty"
    ? reports.filter(r => r.assignedTo)
    : reports;

  document.getElementById("dashboardReports").innerHTML = visibleReports.length
    ? visibleReports.slice(0, 6).map(report => `
      <div class="mini-report">
        <h4>${escapeHTML(report.title)}</h4>
        <p>${escapeHTML(report.id)} · ${escapeHTML(report.location)}</p>
        ${statusBadge(report.status)}
        <button class="text-button" data-dashboard-open="${escapeHTML(report.id)}">Open report →</button>
      </div>`).join("")
    : `<div class="empty-state">No reports available yet.</div>`;

  renderDashboardNotifications();
  renderRoleTools();
}

document.getElementById("dashboardReports").addEventListener("click", event => {
  const button = event.target.closest("[data-dashboard-open]");
  if (button) openReport(button.dataset.dashboardOpen);
});

function renderRoleTools() {
  const container = document.getElementById("roleTools");

  if (role === "student") {
    container.innerHTML = `
      <h3>Student actions</h3>
      <p>Submit a new concern or review the current status of your reports.</p>
      <button class="btn btn-primary" data-page="report">Create New Report</button>
      <button class="btn btn-secondary" data-page="track">Track Reports</button>`;
  }

  if (role === "faculty") {
    container.innerHTML = `
      <h3>Faculty workspace</h3>
      <p>In this demonstration, reports with an assigned person or department appear in your faculty list.</p>
      <p>Open a report to update its status and add progress or resolution notes.</p>
      <button class="btn btn-primary" data-page="track">Review Reports</button>`;
  }

  if (role === "admin") {
    container.innerHTML = `
      <h3>Administrator workspace</h3>
      <p>Open a report to assign it, change its status, and record a rejection reason when required.</p>
      <button class="btn btn-primary" data-page="track">Manage Reports</button>
      <button class="btn btn-secondary" id="exportReports">Export Report Data (CSV)</button>
      <button class="btn btn-danger" id="clearDemoData">Clear Demo Data</button>`;
  }
}

document.getElementById("roleTools").addEventListener("click", event => {
  if (event.target.id === "exportReports") exportCSV();

  if (event.target.id === "clearDemoData") {
    if (!confirm("Delete all reports and notifications stored by this demonstration in this browser?")) return;

    reports = [];
    notifications = [];
    saveAll();
    renderDashboard();
    updateNotificationCount();
    showToast("Demonstration data cleared.");
  }
});

// ---------- CSV EXPORT ----------

function exportCSV() {
  if (!reports.length) {
    showToast("There are no reports to export.");
    return;
  }

  const columns = [
    "id", "title", "category", "subcategory", "location",
    "exactLocation", "description", "urgency", "status",
    "assignedTo", "createdAt", "updatedAt"
  ];

  const csvCell = value =>
    '"' + String(value ?? "").replace(/"/g, '""') + '"';

  const csv = [
    columns.join(","),
    ...reports.map(report =>
      columns.map(column => csvCell(report[column])).join(",")
    )
  ].join("\n");

  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "campus-connect-demo-reports.csv";
  link.click();

  URL.revokeObjectURL(url);
  showToast("CSV export downloaded.");
}

// ---------- PROFILE ----------

function renderProfile() {
  document.getElementById("profileName").value = profile.name || "";
  document.getElementById("profileEmail").value = profile.email || "";
  document.getElementById("profileDepartment").value = profile.department || "";
  document.getElementById("profileId").value = profile.studentId || "";

  document.getElementById("profileAvatar").textContent =
    (profile.name || "S").trim().charAt(0).toUpperCase();
}

document.getElementById("profileForm").addEventListener("submit", event => {
  event.preventDefault();

  profile = {
    name: document.getElementById("profileName").value.trim(),
    email: document.getElementById("profileEmail").value.trim(),
    department: document.getElementById("profileDepartment").value.trim(),
    studentId: document.getElementById("profileId").value.trim()
  };

  if (!save(STORAGE.profile, profile)) return;

  renderProfile();
  showToast("Profile saved in this browser.");
});

// ---------- INITIALIZATION ----------

function initialize() {
  document.getElementById("demoRole").value = role;
  renderProfile();
  updateNotificationCount();
  renderDashboard();
  renderReports();
}

initialize();
