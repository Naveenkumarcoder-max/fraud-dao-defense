
:root {
  --bg: #f7f6fc;
  --surface: #ffffff;
  --text: #24213b;
  --muted: #918da5;
  --purple: #7957f5;
  --purple-dark: #6040dd;
  --line: #eeecf5;
  --green: #169b70;
  --red: #ec527c;
  --orange: #ed9842;
  --font: "DM Sans", sans-serif;
  --display: "Space Grotesk", sans-serif;
}

* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body {
  margin: 0;
  background: var(--bg);
  color: var(--text);
  font-family: var(--font);
  font-size: 13px;
}
button, input, select { font: inherit; }
button { cursor: pointer; }
button:focus-visible, a:focus-visible, input:focus-visible, select:focus-visible {
  outline: 3px solid #b6a5ff;
  outline-offset: 3px;
}
button:disabled { opacity: .6; cursor: not-allowed; }
a { color: inherit; text-decoration: none; }
[hidden] { display: none !important; }

.app-shell { min-height: 100vh; }
.sidebar {
  position: fixed;
  inset: 0 auto 0 0;
  width: 244px;
  display: flex;
  flex-direction: column;
  padding: 25px 17px 12px;
  background: #fff;
  border-right: 1px solid #eeebf6;
  z-index: 10;
}
.brand {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 0 7px;
  font: 700 23px var(--display);
  letter-spacing: -1.1px;
}
.brand-icon {
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  border-radius: 11px;
  color: white;
  background: linear-gradient(140deg,#a88bff,#7050f2);
  font-size: 24px;
  box-shadow: 0 5px 14px #8c72f548;
}
.brand-light { color: var(--purple); font-weight: 500; }

.workspace {
  margin: 31px 0 28px;
  padding: 11px;
  display: flex;
  align-items: center;
  gap: 10px;
  border: 1px solid var(--line);
  border-radius: 13px;
}
.workspace-avatar, .profile-avatar, .top-avatar {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  font-weight: 700;
}
.workspace-avatar {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  color: #6c4ce3;
  background: #eee9ff;
}
.workspace strong, .profile-info strong { display: block; font-size: 11px; }
.workspace small, .profile-info small { display: block; margin-top: 4px; font-size: 10px; color: var(--muted); }
.workspace-dots, .profile-menu { margin-left: auto; color: #a8a2ba; letter-spacing: 2px; }

.nav-label {
  padding: 0 10px;
  margin-bottom: 11px;
  font-size: 9px;
  letter-spacing: 1.35px;
  color: #aaa5bc;
  font-weight: 700;
}
.tools-label { margin-top: 29px; }
.navigation { display: grid; gap: 5px; }
.nav-link {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 43px;
  padding: 0 12px;
  border-radius: 10px;
  color: #77728d;
  font-weight: 600;
  transition: background .2s, color .2s, transform .2s;
}
.nav-link > span { width: 18px; text-align: center; font-size: 19px; }
.nav-link:hover { background: #f5f2ff; color: var(--purple); transform: translateX(2px); }
.nav-link.active { background: linear-gradient(110deg,#f0eaff,#f7f3ff); color: #704ee9; }
.nav-count {
  margin-left: auto;
  padding: 4px 7px;
  border-radius: 7px;
  background: #eee9ff;
  color: #7957ef;
  font-size: 10px;
}
.alert-count { background: #ffebf0; color: #e64d78; }

.sidebar-bottom { margin-top: auto; }
.pro-card {
  position: relative;
  overflow: hidden;
  padding: 16px 13px;
  border-radius: 14px;
  color: white;
  background: linear-gradient(145deg,#9271fa,#6542e0);
}
.pro-card::after {
  content: "";
  position: absolute;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  border: 20px solid #ffffff13;
  right: -45px;
  top: -45px;
}
.pro-spark { font-size: 22px; margin-bottom: 10px; }
.pro-card strong { font: 600 13px var(--display); }
.pro-card p { color: #e8dfff; font-size: 10px; line-height: 1.6; }
.pro-tag { display: inline-block; margin-top: 7px; font-size: 8px; font-weight: 700; letter-spacing: .8px; }
.profile { display: flex; align-items: center; gap: 9px; padding: 17px 3px 5px; }
.profile-avatar, .top-avatar { width: 34px; height: 34px; border-radius: 50%; background: linear-gradient(135deg,#ffbfca,#f2a4cb); color: #773f70; }
.profile-info { min-width: 0; }
.profile-menu { font-size: 12px; }

.main-content { margin-left: 244px; min-height: 100vh; }
.topbar {
  height: 69px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 35px;
  background: #ffffffc9;
  border-bottom: 1px solid #eeebf5;
}
.breadcrumbs { display: flex; align-items: center; gap: 10px; color: #aaa5bb; font-size: 11px; }
.breadcrumbs strong { color: #39334f; }
.crumb-slash { color: #d5d0e1; }
.topbar-actions { display: flex; align-items: center; gap: 18px; }
.system-status { display: flex; align-items: center; gap: 7px; color: #6e6981; font-size: 10px; }
.system-status i, .insight-pill i, .eyebrow-dot { width: 7px; height: 7px; border-radius: 50%; background: #35c995; box-shadow: 0 0 0 3px #35c99520; }
.icon-button { position: relative; border: 0; background: transparent; color: #79738d; font-size: 20px; }
.notification-dot { position: absolute; right: 1px; top: 1px; width: 6px; height: 6px; border-radius: 50%; background: #f05c87; border: 1px solid white; }
.top-avatar { width: 32px; height: 32px; font-size: 10px; }

.page-content { max-width: 1600px; padding: 31px 35px 17px; margin: 0 auto; }
.welcome-row { display: flex; align-items: center; justify-content: space-between; gap: 20px; }
.eyebrow { display: flex; align-items: center; gap: 8px; font-size: 9px; font-weight: 700; letter-spacing: 1.25px; color: #8370c6; }
.eyebrow-dot { background: #9478fa; box-shadow: 0 0 0 3px #9478fa1c; }
h1, h2, h3, p { margin-top: 0; }
h1 { font: 700 clamp(24px,2.4vw,31px) var(--display); letter-spacing: -1.25px; margin: 12px 0 7px; }
.wave { color: #f2a14c; font-size: 24px; }
.subtitle { color: #89849d; margin: 0; font-size: 12px; }
.header-buttons { display: flex; gap: 9px; }
.btn { display: inline-flex; justify-content: center; align-items: center; gap: 8px; border-radius: 9px; padding: 11px 14px; font-size: 11px; font-weight: 700; transition: transform .2s, box-shadow .2s; }
.btn:hover { transform: translateY(-2px); }
.btn-white { color: #6e6883; border: 1px solid #e8e4f0; background: white; }
.btn-primary { color: white; border: 1px solid transparent; background: linear-gradient(110deg,#9171fa,#704de9); box-shadow: 0 5px 14px #7957f52c; }
.btn-primary:hover { box-shadow: 0 8px 20px #7957f54a; }

.insight-banner {
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  gap: 13px;
  margin-top: 26px;
  padding: 16px 18px;
  border: 1px solid #e6ddff;
  border-radius: 13px;
  background: linear-gradient(100deg,#f0eaff 0%,#f8f4ff 54%,#fff1f7 100%);
}
.insight-icon { display: grid; place-items: center; flex-shrink: 0; width: 40px; height: 40px; border-radius: 12px; color: white; font-size: 23px; background: linear-gradient(140deg,#aa8dff,#7654ef); box-shadow: 0 5px 13px #8d6bf52c; }
.insight-copy { position: relative; z-index: 1; }
.insight-copy strong { font: 600 13px var(--display); }
.insight-copy p { margin: 5px 0 0; color: #85809a; font-size: 11px; }
.insight-pill { display: flex; align-items: center; gap: 7px; white-space: nowrap; margin-left: auto; position: relative; z-index: 1; padding: 7px 10px; border-radius: 8px; color: #3b9b79; background: #ffffffba; font-size: 8px; font-weight: 700; letter-spacing: .5px; }
.insight-pill i { width: 6px; height: 6px; }
.banner-decoration { position: absolute; right: 8%; top: -34px; font-size: 115px; color: #b69aff15; }

.section-heading { display: flex; align-items: center; justify-content: space-between; margin: 29px 0 15px; gap: 15px; }
.section-heading h2 { margin: 0 0 5px; font: 700 17px var(--display); letter-spacing: -.5px; }
.section-heading p, .panel-heading p { margin: 0; color: #9993a9; font-size: 10px; }
.date-filter { border: 1px solid #e8e4f0; border-radius: 8px; padding: 10px 12px; color: #77718d; background: white; font-size: 10px; }

.stats-grid { display: grid; grid-template-columns: repeat(4,minmax(0,1fr)); gap: 14px; }
.stat-card { position: relative; overflow: hidden; min-width: 0; padding: 17px 15px 16px; border-radius: 13px; border: 1px solid transparent; transition: transform .2s, box-shadow .2s; }
.stat-card:hover { transform: translateY(-3px); box-shadow: 0 10px 24px #3020500c; }
.stat-purple { background: linear-gradient(135deg,#f0ebff,#f9f6ff); border-color: #e8ddff; }
.stat-pink { background: linear-gradient(135deg,#fff0f5,#fff8fa); border-color: #ffe2ec; }
.stat-orange { background: linear-gradient(135deg,#fff3e6,#fffbf5); border-color: #ffe8d2; }
.stat-green { background: linear-gradient(135deg,#e8faf3,#f5fffa); border-color: #d6f5e8; }
.stat-top { position: relative; z-index: 1; display: flex; align-items: center; gap: 9px; }
.stat-icon { display: grid; place-items: center; width: 31px; height: 31px; border-radius: 10px; font-size: 18px; background: #fff9; color: var(--purple); }
.stat-pink .stat-icon { color: #ed6492; }
.stat-orange .stat-icon { color: #e99b47; }
.stat-green .stat-icon { color: #1ba67a; }
.stat-label { color: #827c96; font-size: 8px; font-weight: 700; letter-spacing: .7px; }
.stat-more { margin-left: auto; color: #a9a1bf; }
.stat-value { position: relative; z-index: 1; margin-top: 16px; font: 700 clamp(23px,2.3vw,31px) var(--display); letter-spacing: -1.2px; white-space: nowrap; }
.stat-bottom { position: relative; z-index: 1; display: flex; flex-wrap: wrap; align-items: center; gap: 6px; margin-top: 9px; font-size: 9px; color: #9791a8; }
.trend { display: inline-block; padding: 4px 6px; border-radius: 5px; font-size: 9px; font-weight: 700; white-space: nowrap; }
.trend-green { color: #189d72; background: #dff8ed; }
.trend-red { color: #d84d78; background: #ffe4ed; }
.stat-decoration { position: absolute; right: 10px; bottom: -17px; font-size: 77px; opacity: .07; font-weight: 700; }
.decoration-purple { color: #7552ee; }
.decoration-pink { color: #f15c8b; }
.decoration-orange { color: #ed8c2f; }
.decoration-green { color: #16a878; }

.dashboard-grid { display: grid; grid-template-columns: minmax(0,1.65fr) minmax(260px,1fr); gap: 15px; margin-top: 17px; }
.panel { min-width: 0; background: var(--surface); border: 1px solid #eeebf5; border-radius: 13px; box-shadow: 0 3px 10px #29204004; }
.chart-panel, .risk-panel, .transactions-panel, .alerts-panel { padding: 20px; }
.panel-heading { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; }
.panel-heading h3 { margin: 0 0 6px; font: 700 13px var(--display); letter-spacing: -.25px; }
.chart-legend { display: flex; flex-wrap: wrap; gap: 11px; color: #88829a; font-size: 9px; }
.chart-legend span { display: flex; align-items: center; gap: 5px; white-space: nowrap; }
.chart-legend i { width: 7px; height: 7px; border-radius: 50%; }
.legend-purple { background: #8968f5; }
.legend-pink { background: #f28cae; }
.chart-summary { display: flex; align-items: center; gap: 9px; margin-top: 20px; }
.chart-summary strong { font: 700 23px var(--display); }
.chart-summary small { color: #9c96aa; font-size: 9px; }
.chart-container { position: relative; height: 205px; margin-top: 12px; }
#activity-chart { width: 100%; height: 100%; display: block; }
.chart-foot { display: flex; justify-content: space-between; gap: 10px; padding-top: 13px; border-top: 1px solid #f1eef6; color: #a19aaf; font-size: 9px; }

.more-btn { border: 0; background: transparent; color: #a9a3b9; letter-spacing: 2px; }
.donut-wrap { display: grid; place-items: center; padding: 23px 0 20px; }
.donut-chart { position: relative; display: grid; place-items: center; width: 160px; height: 160px; border-radius: 50%; background: conic-gradient(#8b69f5 0% 72%,#ffbc83 72% 91%,#f279a1 91% 100%); }
.donut-chart::after { content: ""; position: absolute; inset: 15px; background: white; border-radius: 50%; }
.donut-center { position: relative; z-index: 1; display: grid; gap: 4px; text-align: center; }
.donut-center strong { font: 700 25px var(--display); letter-spacing: -1px; }
.donut-center span { color: #a09aad; font-size: 8px; letter-spacing: 1.4px; }
.risk-legend { display: grid; gap: 14px; }
.risk-legend > div { display: flex; align-items: center; gap: 9px; color: #858096; font-size: 10px; }
.risk-legend i { width: 9px; height: 9px; border-radius: 3px; }
.risk-legend strong { margin-left: auto; color: #3c3651; font-size: 11px; }
.risk-low { background: #8b69f5; }
.risk-medium { background: #ffbc83; }
.risk-high { background: #f279a1; }

.lower-grid { display: grid; grid-template-columns: minmax(0,1.65fr) minmax(260px,1fr); gap: 15px; margin-top: 16px; }
.text-link { border: 0; padding: 4px 0; background: transparent; color: #7858ec; font-size: 10px; font-weight: 700; white-space: nowrap; }
.table-scroll { overflow-x: auto; margin-top: 18px; }
table { width: 100%; border-collapse: collapse; text-align: left; white-space: nowrap; }
thead th { padding: 11px 9px; color: #aaa3b8; background: #faf9fd; font-size: 8px; font-weight: 700; letter-spacing: .65px; }
thead th:first-child { border-radius: 7px 0 0 7px; }
thead th:last-child { border-radius: 0 7px 7px 0; }
tbody td { padding: 13px 9px; border-bottom: 1px solid #f3f0f7; font-size: 10px; }
tbody tr:last-child td { border-bottom: 0; }
.txn-id { color: #4d4667; font-weight: 700; }
.txn-date { display: block; margin-top: 4px; color: #aaa3b7; font-size: 9px; }
.amount { font-weight: 700; }
.risk-score { display: inline-flex; align-items: center; gap: 5px; font-weight: 700; }
.risk-score i { width: 6px; height: 6px; border-radius: 50%; }
.score-low { color: #179c70; }
.score-low i { background: #20bd8c; }
.score-medium { color: #d78b2c; }
.score-medium i { background: #f1ad48; }
.score-high { color: #e44d79; }
.score-high i { background: #f16c94; }
.status-pill { display: inline-block; border-radius: 5px; padding: 5px 7px; font-size: 9px; font-weight: 700; }
.status-approved { background: #e4f9ef; color: #159c70; }
.status-review { background: #fff3df; color: #c4862d; }
.status-blocked { background: #ffe8ef; color: #dc4c78; }
.row-action { border: 0; background: transparent; color: #a39cb3; font-weight: 700; }
.table-footer { display: flex; align-items: center; justify-content: space-between; gap: 10px; border-top: 1px solid #f0edf5; padding-top: 13px; margin-top: 5px; color: #a19aaf; font-size: 9px; }

.alert-number { display: inline-grid; place-items: center; vertical-align: middle; margin-left: 4px; width: 19px; height: 19px; border-radius: 6px; background: #ffe6ee; color: #e3517d; font: 700 9px var(--font); }
.alerts-list { margin-top: 14px; }
.alert-item { display: flex; align-items: flex-start; gap: 10px; padding: 13px 0; border-bottom: 1px solid #f1eef6; }
.alert-icon { display: grid; place-items: center; flex-shrink: 0; width: 34px; height: 34px; border-radius: 10px; font-size: 16px; }
.alert-icon.pink { color: #e85883; background: #ffedf2; }
.alert-icon.orange { color: #e7953b; background: #fff1df; }
.alert-icon.purple { color: #8361ef; background: #f0ebff; }
.alert-copy { flex: 1; min-width: 0; }
.alert-copy strong { display: block; font-size: 10px; line-height: 1.5; }
.alert-copy p { margin: 4px 0; color: #9690a7; font-size: 9px; line-height: 1.5; }
.alert-time { color: #aaa3b8; font-size: 8px; white-space: nowrap; }
.all-alerts-btn { display: flex; justify-content: space-between; align-items: center; width: 100%; margin-top: 13px; padding: 10px 12px; border: 1px solid #ece6ff; border-radius: 8px; background: #f8f5ff; color: #7856e9; font-size: 10px; font-weight: 700; }

.footer { display: flex; justify-content: space-between; gap: 12px; margin-top: 24px; padding: 15px 0 4px; border-top: 1px solid #eae7f1; color: #8275b4; font: 600 10px var(--display); }
.footer-muted { color: #aaa4b7; font-weight: 400; }
.footer > span:last-child { color: #aaa4b7; font: 700 8px var(--font); letter-spacing: .6px; }

.secondary-page { min-height: calc(100vh - 69px); }
.secondary-panel { margin-top: 25px; padding: 22px; }
.secondary-panel h3 { font: 700 15px var(--display); }
.secondary-panel p { color: #8d879e; line-height: 1.7; }
.secondary-table { margin-top: 20px; }
.secondary-table td, .secondary-table th { padding: 13px 12px; }
.secondary-intro { display: flex; align-items: center; gap: 13px; padding: 17px; margin-bottom: 20px; background: #f4f0ff; border-radius: 11px; }
.secondary-intro .big-icon { font-size: 28px; color: var(--purple); }
.secondary-intro strong { font: 600 13px var(--display); }
.secondary-intro p { margin: 5px 0 0; font-size: 11px; }

.modal-backdrop { position: fixed; inset: 0; z-index: 30; display: grid; place-items: center; overflow-y: auto; padding: 20px; background: #211b3d77; backdrop-filter: blur(5px); }
.analysis-modal { width: min(100%,560px); padding: 27px; border-radius: 18px; background: white; box-shadow: 0 25px 90px #20173b3b; animation: modal-in .2s ease-out; }
@keyframes modal-in { from { opacity: 0; transform: translateY(10px) scale(.99); } to { opacity: 1; transform: translateY(0) scale(1); } }
.modal-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; margin-bottom: 22px; }
.modal-header h2 { margin: 9px 0 6px; font: 700 24px var(--display); letter-spacing: -.8px; }
.modal-header p { color: #928ca3; font-size: 11px; margin-bottom: 0; line-height: 1.6; }
.modal-close { width: 32px; height: 32px; border: 1px solid #eeeaf5; border-radius: 9px; background: white; color: #837b96; font-size: 23px; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.form-grid label { display: grid; gap: 8px; color: #55506b; font-size: 10px; font-weight: 700; }
.form-grid input, .form-grid select { width: 100%; min-width: 0; padding: 12px 11px; border: 1px solid #e9e5f1; border-radius: 9px; background: #fdfcff; color: #353049; outline-color: #a38bff; }
.form-note { margin: 18px 0; padding: 11px; border-radius: 8px; color: #8a78ba; background: #f6f2ff; font-size: 10px; line-height: 1.6; }
.submit-analysis { width: 100%; padding: 13px; }
.analysis-result { margin-top: 18px; padding: 16px; border-radius: 12px; background: #f5f1ff; }
.result-heading { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.result-heading strong { font: 700 16px var(--display); }
.result-score { font: 700 29px var(--display); }
.result-reasons { padding-left: 18px; color: #746d88; font-size: 11px; line-height: 1.9; }
.result-disclaimer { margin: 10px 0 0; color: #938ca5; font-size: 10px; line-height: 1.6; }

.toast { position: fixed; z-index: 50; right: 24px; bottom: 24px; max-width: min(380px,calc(100vw - 32px)); padding: 13px 17px; border: 1px solid #e8e0ff; border-radius: 11px; color: #4c3b83; background: white; box-shadow: 0 12px 35px #29204018; font-size: 11px; opacity: 0; transform: translateY(10px); pointer-events: none; transition: opacity .2s, transform .2s; }
.toast.show { opacity: 1; transform: translateY(0); }

@media (min-width: 1600px) {
  .page-content { padding-left: 42px; padding-right: 42px; }
}
@media (max-width: 1250px) {
  .sidebar { width: 215px; }
  .main-content { margin-left: 215px; }
  .page-content { padding-left: 24px; padding-right: 24px; }
  .topbar { padding: 0 24px; }
  .stats-grid { grid-template-columns: repeat(2,minmax(0,1fr)); }
  .stat-value { font-size: 28px; }
  .dashboard-grid, .lower-grid { grid-template-columns: minmax(0,1.4fr) minmax(230px,1fr); }
  .stat-label { font-size: 8px; }
}
@media (max-width: 900px) {
  .sidebar { width: 68px; padding: 19px 8px 10px; align-items: center; }
  .brand { padding: 0; }
  .brand > span:last-child, .workspace > div:not(.workspace-avatar), .workspace-dots, .nav-label, .nav-link:not(.active) .nav-count, .nav-link { font-size: 0; }
  .brand > span:last-child, .workspace > div:not(.workspace-avatar), .workspace-dots, .sidebar-bottom { display: none; }
  .workspace { padding: 5px; border: 0; margin: 27px 0 20px; }
  .workspace-avatar { width: 37px; height: 37px; }
  .navigation { width: 100%; }
  .nav-link { justify-content: center; padding: 0; height: 43px; }
  .nav-link > span { font-size: 20px; }
  .nav-count { display: none; }
  .tools-label { margin-top: 20px; }
  .main-content { margin-left: 68px; }
  .dashboard-grid, .lower-grid { grid-template-columns: minmax(0,1fr); }
  .risk-panel { display: grid; grid-template-columns: 1fr 1fr; align-items: center; }
  .risk-panel .panel-heading { grid-column: 1/-1; }
  .donut-wrap { padding: 20px 0; }
  .risk-legend { padding-left: 15px; }
}
@media (max-width: 580px) {
  .topbar { height: 57px; padding: 0 13px; }
  .system-status { display: none; }
  .topbar-actions { gap: 12px; }
  .page-content { padding: 23px 12px 14px; }
  .welcome-row { align-items: flex-start; flex-direction: column; }
  h1 { font-size: 25px; }
  .header-buttons { width: 100%; }
  .header-buttons .btn { flex: 1; padding: 11px 7px; font-size: 10px; }
  .insight-banner { align-items: flex-start; padding: 13px; gap: 10px; }
  .insight-icon { width: 33px; height: 33px; }
  .insight-copy strong { font-size: 11px; }
  .insight-copy p { font-size: 10px; line-height: 1.6; }
  .insight-pill { display: none; }
  .section-heading { align-items: flex-start; }
  .section-heading h2 { font-size: 15px; }
  .date-filter { padding: 9px 7px; font-size: 9px; }
  .stats-grid { gap: 9px; }
  .stat-card { padding: 12px 10px; }
  .stat-top { gap: 6px; }
  .stat-icon { width: 27px; height: 27px; font-size: 15px; }
  .stat-label { font-size: 7px; letter-spacing: .2px; }
  .stat-value { font-size: 24px; margin-top: 13px; }
  .stat-bottom { font-size: 8px; gap: 4px; }
  .trend { font-size: 8px; }
  .chart-panel, .risk-panel, .transactions-panel, .alerts-panel { padding: 14px 11px; }
  .panel-heading h3 { font-size: 12px; }
  .chart-legend { gap: 7px; font-size: 8px; }
  .chart-container { height: 175px; }
  .chart-foot { font-size: 8px; }
  .risk-panel { grid-template-columns: 1fr; }
  .risk-panel .panel-heading { grid-column: auto; }
  .donut-chart { width: 140px; height: 140px; }
  .donut-center strong { font-size: 23px; }
  .risk-legend { padding: 0 8px; }
  .footer { font-size: 9px; flex-wrap: wrap; }
  .footer > span:last-child { font-size: 7px; }
  .form-grid { grid-template-columns: 1fr; gap: 13px; }
  .analysis-modal { padding: 20px 16px; }
  .modal-header h2 { font-size: 21px; }
  .secondary-panel { padding: 14px 10px; }
}
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { scroll-behavior: auto !important; animation-duration: .01ms !important; transition-duration: .01ms !important; }
}
