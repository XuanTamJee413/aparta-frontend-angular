import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container">
      <div class="card">
        <header>
          <div class="header-row">
            <div>
              <h1>{{ t.pageTitle }}</h1>
              <p>{{ t.pageSubtitle }}</p>
            </div>
          </div>
        </header>

        <div class="settings-content">
          <!-- Chung -->
          <section class="info-section">
            <div class="section-header">
              <div>
                <h2>{{ t.generalSection }}</h2>
                <p class="section-note">{{ t.generalNote }}</p>
              </div>
            </div>
            <div class="form-grid">
              <div class="form-group">
                <label class="form-label">{{ t.languageLabel }}</label>
                <div class="option-group">
                  <label class="option-card">
                    <input type="radio" name="language" value="vi" [checked]="currentLanguage === 'vi'" (change)="changeLanguage('vi')" />
                    <span class="option-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 3 2" class="flag-svg">
                        <path fill="#DA251D" d="M0 0h3v2H0z"/>
                        <path fill="#FF0" d="M1.5 0.35l0.16 0.5h0.52l-0.42 0.3 0.16 0.5-0.42-0.3-0.42 0.3 0.16-0.5-0.42-0.3h0.52z"/>
                      </svg>
                    </span>
                    <span class="option-label">{{ t.vietnamese }}</span>
                  </label>

                  <label class="option-card">
                    <input type="radio" name="language" value="en" [checked]="currentLanguage === 'en'" (change)="changeLanguage('en')" />
                    <span class="option-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 30" preserveAspectRatio="xMidYMid slice" class="flag-svg">
                        <clipPath id="s"><path d="M0,0 v30 h60 v-30 z"/></clipPath>
                        <clipPath id="t"><path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z"/></clipPath>
                        <g clip-path="url(#s)">
                          <path d="M0,0 v30 h60 v-30 z" fill="#012169"/>
                          <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" stroke-width="6"/>
                          <path d="M0,0 L60,30 M60,0 L0,30" clip-path="url(#t)" stroke="#C8102E" stroke-width="4"/>
                          <path d="M30,0 v30 M0,15 h60" stroke="#fff" stroke-width="10"/>
                          <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" stroke-width="6"/>
                        </g>
                      </svg>
                    </span>
                    <span class="option-label">{{ t.english }}</span>
                  </label>
                </div>
              </div>
              <div class="form-group">
                <label class="form-label" for="dateFormat">{{ t.dateFormatLabel }}</label>
                <select id="dateFormat" class="form-input">
                  <option value="dd/MM/yyyy" selected>dd/MM/yyyy</option>
                  <option value="MM/dd/yyyy">MM/dd/yyyy</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label" for="timeFormat">{{ t.timeFormatLabel }}</label>
                <select id="timeFormat" class="form-input">
                  <option value="24h" selected>{{ t.time24h }}</option>
                  <option value="12h">{{ t.time12h }}</option>
                </select>
              </div>
            </div>
          </section>

          <!-- Giao diện -->
          <section class="info-section">
            <div class="section-header">
              <div>
                <h2>{{ t.interfaceSection }}</h2>
                <p class="section-note">{{ t.interfaceNote }}</p>
              </div>
            </div>
            <div class="form-grid">
              <div class="form-group">
                <label class="form-label">{{ t.themeLabel }}</label>
                <div class="option-group">
                  <label class="option-card">
                    <input type="radio" name="theme" [checked]="currentTheme === 'light'" (change)="applyTheme('light')" />
                    <span class="option-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="5"></circle>
                        <line x1="12" y1="1" x2="12" y2="3"></line>
                        <line x1="12" y1="21" x2="12" y2="23"></line>
                        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                        <line x1="1" y1="12" x2="3" y2="12"></line>
                        <line x1="21" y1="12" x2="23" y2="12"></line>
                        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                      </svg>
                    </span>
                    <span class="option-label">{{ t.lightTheme }}</span>
                  </label>
                  <label class="option-card">
                    <input type="radio" name="theme" [checked]="currentTheme === 'dark'" (change)="applyTheme('dark')" />
                    <span class="option-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                      </svg>
                    </span>
                    <span class="option-label">{{ t.darkTheme }}</span>
                  </label>
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">{{ t.fontSizeLabel }}</label>
                <div class="option-group">
                  <label class="option-card">
                    <input type="radio" name="fontSize" checked />
                    <span class="option-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M4 20h7"></path>
                        <path d="M9 4h7"></path>
                        <path d="M6 20l6-16"></path>
                        <path d="M12 4l6 16"></path>
                      </svg>
                    </span>
                    <span class="option-label">{{ t.fontDefault }}</span>
                  </label>
                  <label class="option-card">
                    <input type="radio" name="fontSize" />
                    <span class="option-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M9 4h7"></path>
                        <path d="M12 4l6 16"></path>
                      </svg>
                    </span>
                    <span class="option-label">{{ t.fontSmall }}</span>
                  </label>
                  <label class="option-card">
                    <input type="radio" name="fontSize" />
                    <span class="option-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M4 20h7"></path>
                        <path d="M6 20l6-16"></path>
                      </svg>
                    </span>
                    <span class="option-label">{{ t.fontLarge }}</span>
                  </label>
                </div>
              </div>
            </div>
          </section>

          <!-- Thông báo -->
          <section class="info-section">
            <div class="section-header">
              <div>
                <h2>{{ t.notificationSection }}</h2>
                <p class="section-note">{{ t.notificationNote }}</p>
              </div>
            </div>
            <div class="form-list">
              <label class="switch-row">
                <span class="switch-label">
                  <span class="label-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M4 4h16v16H4z"></path>
                      <path d="M22 6l-10 7L2 6"></path>
                    </svg>
                  </span>
                  {{ t.emailNotification }}
                </span>
                <span class="switch">
                  <input type="checkbox" checked />
                  <span class="slider"></span>
                </span>
              </label>
              <label class="switch-row">
                <span class="switch-label">
                  <span class="label-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M10 17h4"></path>
                      <path d="M7 13h10"></path>
                      <path d="M5 9h14"></path>
                      <path d="M3 5h18"></path>
                    </svg>
                  </span>
                  {{ t.pushNotification }}
                </span>
                <span class="switch">
                  <input type="checkbox" />
                  <span class="slider"></span>
                </span>
              </label>
              <label class="switch-row">
                <span class="switch-label">
                  <span class="label-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                  </span>
                  {{ t.systemMessage }}
                </span>
                <span class="switch">
                  <input type="checkbox" checked />
                  <span class="slider"></span>
                </span>
              </label>
            </div>
          </section>

        </div>
      </div>
    </div>
  `,
  styles: [
    `
    :host {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    }
    .container {
      background-color: #f9fafb;
      min-height: 100vh;
      padding: 2rem;
    }
    .card {
      max-width: 1280px;
      margin: 0 auto;
      background-color: white;
      border-radius: 0.75rem;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
      padding: 2rem;
    }
    header .header-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
    }
    header h1 {
      font-size: 1.875rem;
      font-weight: bold;
      color: #1f2937;
      margin: 0;
    }
    header p {
      margin-top: 0.5rem;
      font-size: 0.875rem;
      color: #6b7280;
    }
    .settings-content { margin-top: 1.5rem; display: flex; flex-direction: column; gap: 1.25rem; }
    .info-section {
      background-color: white;
      border-radius: 1rem;
      box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
      padding: 1.25rem 1.5rem;
      border: 1px solid #e5e7eb;
    }
    .section-header { margin-bottom: 1rem; padding-bottom: 0.75rem; border-bottom: 1px solid #f3f4f6; }
    .section-header h2 { font-size: 1.25rem; font-weight: 600; color: #1f2937; margin: 0; }
    .section-note { font-size: 0.875rem; color: #6b7280; margin-top: 0.5rem; margin-bottom: 0; }

    .form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1rem; }
    .form-list { display: flex; flex-direction: column; gap: 0.75rem; }
    .form-group { display: flex; flex-direction: column; gap: 0.5rem; }
    .form-label { font-size: 0.875rem; font-weight: 600; color: #374151; }
    .label-with-icon { display: inline-flex; align-items: center; gap: 0.5rem; }
    .label-icon { display: inline-flex; width: 16px; height: 16px; color: #6b7280; }
    .label-icon svg { width: 16px; height: 16px; }
    .form-input { width: 100%; padding: 0.625rem 0.875rem; border: 1px solid #d1d5db; border-radius: 0.5rem; font-size: 0.875rem; background-color: #fff; color: #111827; }
    .form-input:focus { outline: none; border-color: #4f46e5; box-shadow: 0 0 0 1px #4f46e5; }
    .form-check { display: inline-flex; align-items: center; gap: 0.5rem; color: #374151; }
    .select-with-flags { position: relative; display: flex; align-items: center; }
    .flag-icon { width: 20px; height: 14px; border: 1px solid #e5e7eb; border-radius: 2px; margin-right: 8px; }

    .actions-row { display: flex; gap: 0.75rem; flex-wrap: wrap; }
    .form-actions { margin-top: 1rem; display: flex; justify-content: flex-end; }

    .btn-primary {
      background-color: #4f46e5;
      color: white;
      font-weight: 600;
      padding: 0.625rem 1.25rem;
      border-radius: 0.5rem;
      border: none;
      display: inline-flex;
      align-items: center;
      cursor: pointer;
      text-decoration: none;
      transition: background-color 0.2s;
    }
    .btn-primary:hover:not(:disabled) { background-color: #4338ca; }
    .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

    .btn-secondary {
      background-color: #e5e7eb;
      color: #374151;
      font-weight: 600;
      padding: 0.625rem 1.25rem;
      border-radius: 0.5rem;
      border: none;
      display: inline-flex;
      align-items: center;
      cursor: pointer;
      text-decoration: none;
      transition: background-color 0.2s;
    }
    .btn-secondary:hover:not(:disabled) { background-color: #d1d5db; }
    .btn-secondary:disabled { opacity: 0.6; cursor: not-allowed; }

    .btn-danger {
      background-color: #dc2626;
      color: #ffffff;
      font-weight: 600;
      padding: 0.625rem 1.25rem;
      border-radius: 0.5rem;
      border: 1px solid #dc2626;
      display: inline-flex;
      align-items: center;
      cursor: pointer;
      text-decoration: none;
      transition: background-color 0.2s, border-color 0.2s;
    }
    .option-group { display: flex; gap: 0.75rem; flex-wrap: wrap; }
    .option-card { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.5rem 0.75rem; border: 1px solid #e5e7eb; border-radius: 0.5rem; cursor: pointer; }
    .option-card input { margin: 0; }
    .option-icon { display: inline-flex; color: #6b7280; }
    .option-icon svg { width: 18px; height: 18px; }
    /* Ensure flag SVGs render at the same visual size */
    .option-icon .flag-svg { width: 24px; height: 16px; display: block; border: 1px solid #e5e7eb; border-radius: 2px; }
    .option-label { color: #374151; font-weight: 500; }

    /* Custom switches for notifications */
    .switch-row { display: flex; align-items: center; justify-content: space-between; padding: 0.5rem 0; }
    .switch-label { display: inline-flex; align-items: center; gap: 0.5rem; color: #374151; }
    .switch { position: relative; display: inline-block; width: 42px; height: 24px; }
    .switch input { opacity: 0; width: 0; height: 0; }
    .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #e5e7eb; transition: .2s; border-radius: 999px; }
    .slider:before { position: absolute; content: ""; height: 18px; width: 18px; left: 3px; bottom: 3px; background-color: white; transition: .2s; border-radius: 50%; box-shadow: 0 1px 2px rgba(0,0,0,0.15); }
    .switch input:checked + .slider { background-color: #4f46e5; }
    .switch input:checked + .slider:before { transform: translateX(18px); }

    .btn-danger:hover:not(:disabled) { background-color: #b91c1c; border-color: #b91c1c; }
    .btn-danger:disabled { opacity: 0.6; cursor: not-allowed; }

    @media (max-width: 768px) {
      .container { padding: 1rem; }
      .card { padding: 1rem; }
    }
    `
  ]
})
export class SettingsComponent {
  currentTheme: 'light' | 'dark' = 'light';
  currentLanguage: 'vi' | 'en' = 'vi';
  
  // Translation object
  translations = {
    vi: {
      pageTitle: 'Cài đặt hệ thống',
      pageSubtitle: 'Các tùy chọn cơ bản cho ứng dụng',
      generalSection: 'Chung',
      generalNote: 'Ngôn ngữ và định dạng ngày giờ',
      languageLabel: 'Ngôn ngữ',
      vietnamese: 'Tiếng Việt',
      english: 'English',
      dateFormatLabel: 'Định dạng ngày',
      timeFormatLabel: 'Định dạng giờ',
      time24h: '24 giờ',
      time12h: '12 giờ (AM/PM)',
      interfaceSection: 'Giao diện',
      interfaceNote: 'Chủ đề và hiển thị',
      themeLabel: 'Chủ đề',
      lightTheme: 'Sáng',
      darkTheme: 'Tối',
      fontSizeLabel: 'Kích thước chữ',
      fontDefault: 'Mặc định',
      fontSmall: 'Nhỏ',
      fontLarge: 'Lớn',
      notificationSection: 'Thông báo',
      notificationNote: 'Tùy chọn nhận thông báo',
      emailNotification: 'Email khi có cập nhật',
      pushNotification: 'Thông báo đẩy (push)',
      systemMessage: 'Tin nhắn từ hệ thống'
    },
    en: {
      pageTitle: 'System Settings',
      pageSubtitle: 'Basic options for the application',
      generalSection: 'General',
      generalNote: 'Language and date-time format',
      languageLabel: 'Language',
      vietnamese: 'Tiếng Việt',
      english: 'English',
      dateFormatLabel: 'Date Format',
      timeFormatLabel: 'Time Format',
      time24h: '24 hour',
      time12h: '12 hour (AM/PM)',
      interfaceSection: 'Interface',
      interfaceNote: 'Theme and display',
      themeLabel: 'Theme',
      lightTheme: 'Light',
      darkTheme: 'Dark',
      fontSizeLabel: 'Font Size',
      fontDefault: 'Default',
      fontSmall: 'Small',
      fontLarge: 'Large',
      notificationSection: 'Notifications',
      notificationNote: 'Notification preferences',
      emailNotification: 'Email on updates',
      pushNotification: 'Push notifications',
      systemMessage: 'System messages'
    }
  };

  get t() {
    return this.translations[this.currentLanguage];
  }

  ngOnInit() {
    const saved = (localStorage.getItem('appTheme') as 'light' | 'dark') || 'light';
    this.applyTheme(saved);
    const savedLang = (localStorage.getItem('appLanguage') as 'vi' | 'en') || 'vi';
    this.currentLanguage = savedLang;
  }
  
  changeLanguage(lang: 'vi' | 'en') {
    this.currentLanguage = lang;
    localStorage.setItem('appLanguage', lang);
  }

  applyTheme(theme: 'light' | 'dark') {
    this.currentTheme = theme;
    localStorage.setItem('appTheme', theme);
    document.documentElement.setAttribute('data-theme', theme);
    this.ensureGlobalThemeStyles();
  }

  private ensureGlobalThemeStyles() {
    const id = 'app-theme-styles';
    let styleEl = document.getElementById(id) as HTMLStyleElement | null;
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = id;
      document.head.appendChild(styleEl);
    }
    styleEl.textContent = `
      :root[data-theme='dark'] { color-scheme: dark; }
      :root[data-theme='light'] { color-scheme: light; }
      :root[data-theme='dark'] body { background-color: #0f172a !important; color: #e5e7eb; }
      :root[data-theme='light'] body { background-color: #f9fafb; color: #111827; }
      /* Force headings to light color in dark mode */
      :root[data-theme='dark'] .container { background-color: #0f172a !important; }
      :root[data-theme='dark'] h1, :root[data-theme='dark'] h2 { color: #e5e7eb !important; }
      :root[data-theme='dark'] .card { background-color: #111827 !important; color: #e5e7eb; border-color: #1f2937; }
      :root[data-theme='dark'] .settings-content { background-color: transparent !important; }
      :root[data-theme='dark'] .info-section { background-color: #0b1324; border-color: #1f2937; box-shadow: none; }
      :root[data-theme='dark'] .form-input { background-color: #0f172a; color: #e5e7eb; border-color: #334155; }
      :root[data-theme='dark'] .form-input:focus { box-shadow: 0 0 0 1px #6366f1; border-color: #6366f1; }
      /* Text colors in dark mode */
      :root[data-theme='dark'] header h1 { color: #e5e7eb !important; }
      :root[data-theme='dark'] header p { color: #9ca3af; }
      :root[data-theme='dark'] .form-label { color: #e5e7eb; }
      :root[data-theme='dark'] .section-header h2 { color: #e5e7eb !important; }
      :root[data-theme='dark'] .section-note { color: #9ca3af; }
      :root[data-theme='dark'] .option-card { border-color: #334155; }
      :root[data-theme='dark'] .option-icon { color: #9ca3af; }
      :root[data-theme='dark'] .label-icon { color: #9ca3af; }
      :root[data-theme='dark'] .option-label { color: #e5e7eb; }
      :root[data-theme='dark'] .switch-label { color: #e5e7eb; }
      :root[data-theme='dark'] .switch .slider { background-color: #334155; }
      :root[data-theme='dark'] .btn-secondary { background-color: #334155; color: #e5e7eb; }
      :root[data-theme='dark'] .btn-primary { background-color: #4f46e5; color: #fff; }
    `;
  }
}
