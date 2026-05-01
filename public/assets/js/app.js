        // --- CONFIGURATION ---
        const AGFF_CONFIG = {
            limits: {
                ts_anwelk: 60,
                ts_haupt: 80,
                ts_end: 88,
                water_high: 0.2, // g/m3 efficiency limit
                water_low: -0.1
            },
            guidelines: {
                speed_min: 0.07,
                speed_max: 0.13,
                eff_good: 50,
                eff_warn: 30,
                water_min_main: 0.5
            },
            phases: [
                { id: 1, title: "1. Startphase", color: "blue" },
                { id: 2, title: "2. Haupttrocknung", color: "amber" },
                { id: 3, title: "3. Endtrocknung", color: "lime" },
                { id: 4, title: "4. Lagerung", color: "emerald" }
            ]
        };

        // --- APP STATE ---
        const App = { 
            vals: { t1: 20, h1: 60, t2: 20, h2: 60, t3: 15, h3: 90 },
            sim: { heat: 0, dehum: 0 },
            params: { alt: 600, price: 25, priceHeat: 10 },
            layers: [{ h: 2.0, ts: 60, type: 'loose_m', dens: 80, densManual: false }],
            fan: { mode: 'curve', label: 'Standard', autoScaleStandard: true, flow: 0, pmax: 12.2, kw: 9.5, curve: [{p:2,q:12.7,kw:7.2},{p:3,q:12.1,kw:8.0},{p:4,q:11.6,kw:8.7},{p:5,q:10.8,kw:9.4},{p:6,q:10.1,kw:9.9},{p:7,q:9.4,kw:10.4},{p:8,q:8.7,kw:10.8}] },
            history: { auto: false, records: [] },
            ui: { lang: 'de' },
            lastMetrics: null,
            area: 100, flowSpec: 0.11, stockHeightManual: null, fanDB: [], useMeas: false
        };
        const PHY = {
            sat: t => 6.1078 * Math.exp((17.08 * t) / (234.2 + t)),
            p: a => 1013.25 * Math.pow(1 - 2.25e-5 * a, 5.25),
            dens: (t, p) => (p * 100) / (287.05 * (t + 273.15)),
            abs: (t, rh, p) => (622 * PHY.sat(t) * rh / 100) / (p - PHY.sat(t) * rh / 100),
            rel: (t, x, p) => Math.min(100, (x * p / (622 + x) / PHY.sat(t)) * 100),
            def: (t, rh, p) => (PHY.abs(t, 100, p) - PHY.abs(t, rh, p)) * PHY.dens(t, p)
        };
        const DENS_OPTS = [{id:'loose_l',l:'Leicht',f:1.5,d:60},{id:'loose_m',l:'Mittel',f:2.0,d:80},{id:'loose_h',l:'Fest',f:3.5,d:100},{id:'bales',l:'Ballen',f:6.0,d:130}];
        const FAN_EDITOR_UNITS = {
            pressure: {
                mbar: { label: 'mbar', factor: 1, digits: 1 },
                Pa: { label: 'Pa', factor: 100, digits: 0 },
                mmH2O: { label: 'mm H2O', factor: 10.1972, digits: 1 }
            },
            flow: {
                m3s: { label: 'm³/s', factor: 1, digits: 2 },
                m3h: { label: 'm³/h', factor: 3600, digits: 0 }
            }
        };
        
        let hxChart, fanChart, historyChart, historyClimateChart;
        let filteredFans = [], selectedFanIndex = -1;
        let areaStepTimer, areaStepDelay;
        let flowSpecStepTimer, flowSpecStepDelay;
        let historyAutoKeyLast = '';
        let historySelectedIndex = -1;
        let historyPointSpacing = 30;
        let historyZoomPreset = 'one-to-one';
        const fanEditorUnitState = { pressure: 'mbar', flow: 'm3s' };

        const DEFAULT_APP_STATE = {
            vals: { t1: 20, h1: 60, t2: 20, h2: 60, t3: 15, h3: 90 },
            sim: { heat: 0, dehum: 0 },
            params: { alt: 600, price: 25, priceHeat: 10 },
            layers: [{ h: 2.0, ts: 60, type: 'loose_m', dens: 80, densManual: false }],
            fan: { mode: 'curve', label: 'Standard', autoScaleStandard: true, flow: 0, pmax: 12.2, kw: 9.5, curve: [{p:2,q:12.7,kw:7.2},{p:3,q:12.1,kw:8.0},{p:4,q:11.6,kw:8.7},{p:5,q:10.8,kw:9.4},{p:6,q:10.1,kw:9.9},{p:7,q:9.4,kw:10.4},{p:8,q:8.7,kw:10.8}] }, 
            history: { auto: false, records: [] },
            ui: { lang: 'de' },
            area: 100,
            flowSpec: 0.11,
            stockHeightManual: null,
            useMeas: false
        };

        const I18N_SUPPORTED = ['de', 'fr', 'it', 'en', 'rm'];
        let I18N_LANG = 'de';
        let I18N_DICT = {};

        let knowledgePhaseDetailsCache = null;
        function getKnowledgePhaseDetails() {
            if(knowledgePhaseDetailsCache) return knowledgePhaseDetailsCache;
            const fallback = {
                startphase: '',
                haupttrocknung: '',
                endtrocknung: '',
                lagerung: ''
            };
            const el = document.getElementById('knowledge-phase-details');
            if(!el) {
                knowledgePhaseDetailsCache = fallback;
                return knowledgePhaseDetailsCache;
            }
            try {
                const parsed = JSON.parse(el.textContent || '{}');
                knowledgePhaseDetailsCache = {
                    startphase: parsed.startphase || '',
                    haupttrocknung: parsed.haupttrocknung || '',
                    endtrocknung: parsed.endtrocknung || '',
                    lagerung: parsed.lagerung || ''
                };
            } catch(_) {
                knowledgePhaseDetailsCache = fallback;
            }
            return knowledgePhaseDetailsCache;
        }

        function _normalizeSearchText(text) {
            return String(text || '')
                .toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '');
        }

        function filterKnowledgeArticles(query) {
            const q = _normalizeSearchText(query);
            const articles = document.querySelectorAll('#knowledge-list .knowledge-article');
            let visibleCount = 0;

            articles.forEach(article => {
                const haystack = _normalizeSearchText(article.textContent || '');
                const show = !q || haystack.includes(q);
                article.classList.toggle('hidden', !show);
                if(show) visibleCount += 1;
            });

            const noResults = document.getElementById('knowledge-no-results');
            if(noResults) noResults.classList.toggle('hidden', visibleCount > 0 || !q);
        }

        window.filterKnowledgeArticles = filterKnowledgeArticles;

        function _normalizeLang(lang) {
            const s = String(lang || '').toLowerCase();
            if(!s) return 'de';
            const base = s.split('-')[0];
            return I18N_SUPPORTED.includes(base) ? base : 'de';
        }

        function _detectBrowserLang() {
            const list = Array.isArray(navigator.languages) ? navigator.languages : [];
            const fallback = navigator.language ? [navigator.language] : [];
            const langs = list.length ? list : fallback;
            for(const l of langs) {
                const n = _normalizeLang(l);
                if(I18N_SUPPORTED.includes(n)) return n;
            }
            return 'de';
        }

        function t(key, fallback = '') {
            const val = I18N_DICT?.[key];
            if(typeof val === 'string' && val.length) return val;
            return fallback || key;
        }

        function applyI18n() {
            document.querySelectorAll('[data-i18n]').forEach(el => {
                const k = el.getAttribute('data-i18n');
                if(!k) return;
                el.innerText = t(k, el.innerText);
            });
            document.querySelectorAll('[data-i18n-title]').forEach(el => {
                const k = el.getAttribute('data-i18n-title');
                if(!k) return;
                el.title = t(k, el.title || '');
            });
            const langSel = document.getElementById('inp-language');
            if(langSel) langSel.value = I18N_LANG;
            // sync footer language buttons
            document.querySelectorAll('.footer-lang-btn').forEach(btn => {
                btn.classList.toggle('active', btn.id === `footer-lang-${I18N_LANG}`);
            });
        }

        async function _loadLanguageFile(lang) {
            const url = `assets/i18n/${lang}.json`;
            const res = await fetch(url, { cache: 'no-cache' });
            if(!res.ok) throw new Error(`i18n load failed: ${lang}`);
            return res.json();
        }

        async function setLanguage(lang, persist = true) {
            const normalized = _normalizeLang(lang);
            try {
                I18N_DICT = await _loadLanguageFile(normalized);
                I18N_LANG = normalized;
            } catch(_) {
                if(normalized !== 'de') {
                    I18N_DICT = await _loadLanguageFile('de');
                    I18N_LANG = 'de';
                }
            }
            App.ui.lang = I18N_LANG;
            if(persist) {
                localStorage.setItem('agff_lang', I18N_LANG);
                saveData();
            }
            applyI18n();
            updateHistoryChart();
            updateHistoryClimateChart();
            renderHistoryTable();
            updateHistorySelectionUI();
            initGuidelineLabels();
        }

        window.setLanguage = setLanguage;

        window.onload = async () => {
            lucide.createIcons();
            loadData();
            const langFromStorage = _normalizeLang(localStorage.getItem('agff_lang') || App.ui?.lang || _detectBrowserLang());
            await setLanguage(langFromStorage, false);
            const _fanSearchEl = document.getElementById('fan-search'); if(_fanSearchEl) _fanSearchEl.value = App.fan.label || ''; initCharts(); loadDefaultCSV(); update();
            initGuidelineLabels();
            initHistoryUI();
            guideStep(1);
            document.getElementById('fetch-weather').addEventListener('click', async () => {
                guideStep(3);
                if(!navigator.geolocation) return;
                navigator.geolocation.getCurrentPosition(async pos => {
                    try {
                        const r = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${pos.coords.latitude}&longitude=${pos.coords.longitude}&current=temperature_2m,relative_humidity_2m`);
                        const d = await r.json(); manualInput('t1', d.current.temperature_2m); manualInput('h1', d.current.relative_humidity_2m);
                    } catch(e){}
                });
            });
        };

        // --- ONBOARDING GUIDE ---
        let _guideCurrentStep = 0;
        function _addFinitePulse(el, cls) {
            if (!el) return;
            el.classList.remove(cls);
            void el.offsetWidth; // force reflow to restart animation
            el.classList.add(cls);
            el.addEventListener('animationend', function handler() {
                el.classList.remove(cls);
                el.removeEventListener('animationend', handler);
            });
        }

        function guideStep(step) {
            if (step <= _guideCurrentStep) return;
            _guideCurrentStep = step;
            // clear all finite pulse classes
            const _finCls = ['guide-pulse-f','guide-pulse-btn-f','guide-pulse-block-f'];
            ['area-top-group','h3-group','guide-aussen-block','fetch-weather','guide-zuluft-block'].forEach(id => {
                const el = document.getElementById(id); if (!el) return;
                _finCls.forEach(c => el.classList.remove(c));
            });

            if (step === 1) {
                _addFinitePulse(document.getElementById('area-top-group'), 'guide-pulse-f');
            } else if (step === 2) {
                _addFinitePulse(document.getElementById('guide-aussen-block'), 'guide-pulse-block-f');
                _addFinitePulse(document.getElementById('fetch-weather'), 'guide-pulse-btn-f');
            } else if (step === 3) {
                _addFinitePulse(document.getElementById('guide-zuluft-block'), 'guide-pulse-block-f');
            } else if (step === 4 || step === 5) {
                _addFinitePulse(document.getElementById('h3-group'), 'guide-pulse-f');
            }
        }

        function initGuidelineLabels() {
            const g = AGFF_CONFIG.guidelines;
            const l = AGFF_CONFIG.limits;
            const smi = document.getElementById('speed-min');
            const smi2 = document.getElementById('speed-min-low');
            const sma = document.getElementById('speed-max');
            const sma2 = document.getElementById('speed-max-high');
            const emi = document.getElementById('eff-warn');
            const emi2 = document.getElementById('eff-warn-2');
            const ema = document.getElementById('eff-good');
            const ema2 = document.getElementById('eff-good-2');
            if(smi) smi.innerText = g.speed_min.toFixed(2);
            if(smi2) smi2.innerText = g.speed_min.toFixed(2);
            if(sma) sma.innerText = g.speed_max.toFixed(2);
            if(sma2) sma2.innerText = g.speed_max.toFixed(2);
            if(emi) emi.innerText = g.eff_warn.toFixed(0);
            if(emi2) emi2.innerText = g.eff_warn.toFixed(0);
            if(ema) ema.innerText = g.eff_good.toFixed(0);
            if(ema2) ema2.innerText = g.eff_good.toFixed(0);
        }
        function roundTemp(v) {
            const n = parseFloat(v);
            if(!Number.isFinite(n)) return 0;
            return Math.round(n * 10) / 10;
        }
        function initHistoryUI() {
            if(!App.history || typeof App.history !== 'object') App.history = { auto: false, records: [] };
            if(!Array.isArray(App.history.records)) App.history.records = [];
            if(App.history.records.length && historySelectedIndex < 0) historySelectedIndex = App.history.records.length - 1;
            updateHistoryPresetButtons();
            updateHistoryChart();
            updateHistoryClimateChart();
            renderHistoryTable();
            updateHistorySelectionUI();
        }
        function updateHistorySelectionUI() {
            const recs = App.history?.records || [];
            const box = document.getElementById('history-timeline-box');
            const slider = document.getElementById('history-index-slider');
            const label = document.getElementById('history-selected-label');
            const delBtn = document.getElementById('btn-delete-point');
            if(!recs.length) {
                historySelectedIndex = -1;
                if(box) box.classList.add('hidden');
                if(label) label.innerText = '-';
                if(delBtn) delBtn.classList.add('hidden');
                return;
            }
            if(historySelectedIndex < 0 || historySelectedIndex >= recs.length) historySelectedIndex = recs.length - 1;
            if(box) box.classList.remove('hidden');
            if(delBtn) delBtn.classList.remove('hidden');
            if(slider) {
                slider.min = '0';
                slider.max = String(recs.length - 1);
                slider.value = String(historySelectedIndex);
            }
            if(label) {
                const r = recs[historySelectedIndex];
                const d = r?.time ? new Date(r.time) : null;
                label.innerText = d && !Number.isNaN(d.getTime()) ? d.toLocaleString() : (r?.time || '-');
            }
        }
        function updateHistoryPresetButtons() {
            const fullscreenBtn = document.getElementById('history-preset-fullscreen');
            const oneToOneBtn = document.getElementById('history-preset-1to1');
            const zoomValueEl = document.getElementById('history-zoom-value');
            if(fullscreenBtn) fullscreenBtn.classList.toggle('active', historyZoomPreset === 'fullscreen');
            if(oneToOneBtn) oneToOneBtn.classList.toggle('active', historyZoomPreset === 'one-to-one');
            if(zoomValueEl) {
                const pct = Math.round((historyPointSpacing / 34) * 100);
                zoomValueEl.textContent = historyZoomPreset === 'fullscreen' ? 'Fit' : `${pct} %`;
            }
        }
        function setHistoryPreset(preset) {
            if(preset === 'fullscreen') {
                historyZoomPreset = 'fullscreen';
            } else if(preset === 'one-to-one') {
                historyPointSpacing = 34;
                historyZoomPreset = 'one-to-one';
            } else {
                historyPointSpacing = 30;
                historyZoomPreset = 'custom';
            }
            updateHistoryPresetButtons();
            applyHistoryCanvasLayout(false);
            updateHistoryChart();
            updateHistoryClimateChart();
        }
        function applyHistoryCanvasLayout(autoScroll = false) {
            const count = (App.history?.records || []).length;
            const chartInner = document.getElementById('history-chart-inner');
            const climateInner = document.getElementById('history-climate-inner');
            const chartScroll = document.getElementById('history-chart-scroll');
            const climateScroll = document.getElementById('history-climate-scroll');
            const px = Math.max(16, Math.min(72, historyPointSpacing));
            const chartViewport = chartScroll?.clientWidth || 420;
            const climateViewport = climateScroll?.clientWidth || 420;
            let chartWidth = Math.max(360, count * px + 140);
            let climateWidth = Math.max(360, count * px + 140);
            if(historyZoomPreset === 'fullscreen') {
                chartWidth = Math.max(360, chartViewport - 16);
                climateWidth = Math.max(360, climateViewport - 16);
            }
            if(chartInner) chartInner.style.width = `${chartWidth}px`;
            if(climateInner) climateInner.style.width = `${climateWidth}px`;
            if(historyChart) historyChart.resize();
            if(historyClimateChart) historyClimateChart.resize();
            if(autoScroll) {
                if(chartScroll && chartWidth > chartScroll.clientWidth) chartScroll.scrollLeft = chartScroll.scrollWidth;
                if(climateScroll && climateWidth > climateScroll.clientWidth) climateScroll.scrollLeft = climateScroll.scrollWidth;
            }
        }
        function zoomHistory(delta) {
            historyPointSpacing = Math.max(16, Math.min(72, historyPointSpacing + delta * 4));
            historyZoomPreset = 'custom';
            updateHistoryPresetButtons();
            applyHistoryCanvasLayout(false);
            updateHistoryChart();
            updateHistoryClimateChart();
        }
        function getEffectiveStockHeight() {
            const autoHeight = App.layers.reduce((sum, layer) => sum + (parseFloat(layer.h) || 0), 0);
            return App.stockHeightManual && App.stockHeightManual > 0 ? App.stockHeightManual : autoHeight;
        }
        function buildCurrentHistoryRecord() {
            if(!App.lastMetrics) return null;
            const m = App.lastMetrics;
            return {
                time: new Date().toISOString(),
                futterlager: {
                    area_m2: parseFloat(App.area) || 0,
                    stock_height_m: getEffectiveStockHeight(),
                    layers: App.layers.length
                },
                luefter: {
                    label: App.fan.label || 'Standard',
                    mode: App.fan.mode || 'curve',
                    flow_m3s: m.flow_m3s,
                    pmax_mbar: parseFloat(App.fan.pmax) || 0
                },
                luftqualitaet: {
                    t1_c: roundTemp(App.vals.t1),
                    h1_pct: App.vals.h1,
                    t2_c: roundTemp(App.vals.t2),
                    h2_pct: App.vals.h2,
                    t3_c: roundTemp(App.vals.t3),
                    h3_pct: App.vals.h3
                },
                wasserentzug: {
                    l_h: m.removal_lh,
                    g_m3: m.water_gm3
                },
                druck: {
                    pa: m.pressure_pa,
                    display: m.pressure_display,
                    mode: App.useMeas ? 'messung' : 'berechnet'
                }
            };
        }
        function addHistoryRecord(record, persist = true) {
            if(!record) return;
            App.history.records.push(record);
            if(App.history.records.length > 1500) App.history.records = App.history.records.slice(-1500);
            historySelectedIndex = App.history.records.length - 1;
            updateHistoryChart();
            updateHistoryClimateChart();
            renderHistoryTable();
            updateHistorySelectionUI();
            if(persist) saveData();
        }
        function recordCurrentPoint() {
            addHistoryRecord(buildCurrentHistoryRecord(), true);
        }
        function deleteSelectedHistoryPoint() {
            const recs = App.history?.records || [];
            if (historySelectedIndex < 0 || historySelectedIndex >= recs.length) return;
            const rec = recs[historySelectedIndex];
            const ts = rec?.time ? new Date(rec.time) : null;
            const timeStr = ts && !Number.isNaN(ts.getTime()) ? ts.toLocaleString() : (rec?.time || '?');
            if (!window.confirm(`${t('history.delete_confirm_prefix', 'Datenpunkt vom')} ${timeStr} ${t('history.delete_confirm_suffix', 'wirklich löschen?')}`)) return;
            App.history.records.splice(historySelectedIndex, 1);
            historySelectedIndex = Math.min(historySelectedIndex, App.history.records.length - 1);
            if (historySelectedIndex < 0 && App.history.records.length > 0) historySelectedIndex = 0;
            updateHistoryChart();
            updateHistoryClimateChart();
            renderHistoryTable();
            updateHistorySelectionUI();
            saveData();
        }
        function clearHistoryData() {
            if(!App.history) App.history = { auto: false, records: [] };
            App.history.records = [];
            historySelectedIndex = -1;
            updateHistoryChart();
            updateHistoryClimateChart();
            renderHistoryTable();
            updateHistorySelectionUI();
            saveData();
        }
        function confirmClearHistoryData() {
            const count = (App.history?.records || []).length;
            const msg = count > 0
                ? `${t('history.clear_confirm_all_prefix', 'Wirklich alle')} ${count} ${t('history.clear_confirm_all_suffix', 'aufgezeichneten Datenpunkte löschen?')}`
                : t('history.clear_confirm_empty', 'Es sind keine Datenpunkte vorhanden. Trotzdem Verlauf zurücksetzen?');
            if(window.confirm(msg)) clearHistoryData();
        }
        function historyToCsv(records) {
            const header = [
                'time','area_m2','stock_height_m','layers','fan_label','fan_mode','flow_m3s','pmax_mbar',
                't1_c','h1_pct','t2_c','h2_pct','t3_c','h3_pct','water_l_h','water_g_m3','pressure_pa','pressure_display','pressure_mode'
            ];
            const esc = (v) => {
                const s = String(v ?? '');
                return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
            };
            const lines = records.map(r => [
                r.time,
                r.futterlager?.area_m2,
                r.futterlager?.stock_height_m,
                r.futterlager?.layers,
                r.luefter?.label,
                r.luefter?.mode,
                r.luefter?.flow_m3s,
                r.luefter?.pmax_mbar,
                r.luftqualitaet?.t1_c,
                r.luftqualitaet?.h1_pct,
                r.luftqualitaet?.t2_c,
                r.luftqualitaet?.h2_pct,
                r.luftqualitaet?.t3_c,
                r.luftqualitaet?.h3_pct,
                r.wasserentzug?.l_h,
                r.wasserentzug?.g_m3,
                r.druck?.pa,
                r.druck?.display,
                r.druck?.mode
            ].map(esc).join(','));
            return [header.join(','), ...lines].join('\n');
        }
        function exportHistoryJson() {
            const payload = JSON.stringify(App.history?.records || [], null, 2);
            const blob = new Blob([payload], { type: 'application/json' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = `drywatch-history-${new Date().toISOString().slice(0,19).replace(/[:T]/g,'-')}.json`;
            a.click();
            URL.revokeObjectURL(a.href);
        }
        function exportHistoryCsv() {
            const csv = historyToCsv(App.history?.records || []);
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = `drywatch-history-${new Date().toISOString().slice(0,19).replace(/[:T]/g,'-')}.csv`;
            a.click();
            URL.revokeObjectURL(a.href);
        }
        function triggerHistoryImport() {
            const inp = document.getElementById('history-import-input');
            if(inp) inp.click();
        }
        function parseHistoryCsv(text) {
            const lines = text.split(/\r?\n/).filter(Boolean);
            if(lines.length < 2) return [];
            const splitCsv = (line) => {
                const out = []; let cur = ''; let q = false;
                for(let i=0;i<line.length;i++) {
                    const ch = line[i];
                    if(ch === '"') {
                        if(q && line[i+1] === '"') { cur += '"'; i++; }
                        else q = !q;
                    } else if(ch === ',' && !q) { out.push(cur); cur = ''; }
                    else cur += ch;
                }
                out.push(cur);
                return out;
            };
            const header = splitCsv(lines[0]);
            const idx = (k) => header.indexOf(k);
            return lines.slice(1).map(line => {
                const c = splitCsv(line);
                const num = (k) => {
                    const v = parseFloat(c[idx(k)]);
                    return Number.isFinite(v) ? v : 0;
                };
                const str = (k) => c[idx(k)] || '';
                return {
                    time: str('time') || new Date().toISOString(),
                    futterlager: { area_m2: num('area_m2'), stock_height_m: num('stock_height_m'), layers: num('layers') },
                    luefter: { label: str('fan_label'), mode: str('fan_mode'), flow_m3s: num('flow_m3s'), pmax_mbar: num('pmax_mbar') },
                    luftqualitaet: {
                        t1_c: num('t1_c'), h1_pct: num('h1_pct'), t2_c: num('t2_c'), h2_pct: num('h2_pct'),
                        t3_c: num('t3_c'), h3_pct: num('h3_pct')
                    },
                    wasserentzug: { l_h: num('water_l_h'), g_m3: num('water_g_m3') },
                    druck: { pa: num('pressure_pa'), display: str('pressure_display'), mode: str('pressure_mode') }
                };
            });
        }
        async function handleHistoryImport(event) {
            const file = event?.target?.files?.[0];
            if(!file) return;
            const text = await file.text();
            let records = [];
            if (file.name.toLowerCase().endsWith('.json')) {
                try {
                    const parsed = JSON.parse(text);
                    if(Array.isArray(parsed)) records = parsed;
                } catch(_) { records = []; }
            } else {
                records = parseHistoryCsv(text);
            }
            if(!Array.isArray(records)) records = [];
            App.history.records = records.filter(r => r && typeof r === 'object');
            historySelectedIndex = App.history.records.length ? App.history.records.length - 1 : -1;
            updateHistoryChart();
            updateHistoryClimateChart();
            renderHistoryTable();
            updateHistorySelectionUI();
            saveData();
            if(event?.target) event.target.value = '';
        }
        function applyHistoryRecord(index) {
            const recs = App.history?.records || [];
            const i = parseInt(index, 10);
            if(!Number.isInteger(i) || i < 0 || i >= recs.length) return;
            historySelectedIndex = i;
            const r = recs[i] || {};
            const lq = r.luftqualitaet || {};
            const fl = r.futterlager || {};
            const dr = r.druck || {};

            App.vals.t1 = roundTemp(parseFloat(lq.t1_c) || 0);
            App.vals.h1 = Math.max(0, Math.min(100, parseFloat(lq.h1_pct) || 0));
            App.vals.t2 = roundTemp(parseFloat(lq.t2_c) || 0);
            App.vals.h2 = Math.max(0, Math.min(100, parseFloat(lq.h2_pct) || 0));
            App.vals.t3 = roundTemp(parseFloat(lq.t3_c) || 0);
            App.vals.h3 = Math.max(0, Math.min(100, parseFloat(lq.h3_pct) || 0));

            const area = parseFloat(fl.area_m2);
            if(Number.isFinite(area) && area > 0) App.area = area;
            const stockH = parseFloat(fl.stock_height_m);
            App.stockHeightManual = Number.isFinite(stockH) && stockH > 0 ? stockH : null;

            if((dr.mode || '') === 'messung') {
                App.useMeas = true;
                const pUnit = parseFloat(document.getElementById('p-unit')?.value) || 1;
                const pa = parseFloat(dr.pa) || 0;
                const measured = pa / pUnit;
                const measInput = document.getElementById('inp-meas-p');
                if(measInput) measInput.value = measured.toFixed(1);
            } else {
                App.useMeas = false;
            }

            const setNumInput = (id, value, digits) => {
                const el = document.getElementById(id);
                if(!el) return;
                const n = parseFloat(value);
                if(!Number.isFinite(n)) return;
                el.value = n.toFixed(digits);
            };
            setNumInput('inp-area-top', App.area, 0);
            setNumInput('t1-in', App.vals.t1, 1);
            setNumInput('h1-in', App.vals.h1, 0);
            setNumInput('t2-in', App.vals.t2, 1);
            setNumInput('h2-in', App.vals.h2, 0);
            setNumInput('t3-in', App.vals.t3, 1);
            setNumInput('h3-in', App.vals.h3, 0);

            update();
            updateHistoryChart();
            updateHistoryClimateChart();
            renderHistoryTable();
            updateHistorySelectionUI();
            saveData();
        }
        function syncStickyAxes(chart, scrollId, leftId, rightId) {
            const scrollDiv = document.getElementById(scrollId);
            const lCanvas = document.getElementById(leftId);
            const rCanvas = document.getElementById(rightId);
            const isScrollable = scrollDiv && scrollDiv.scrollWidth > scrollDiv.clientWidth + 2;
            if (!isScrollable) {
                if (lCanvas) lCanvas.style.display = 'none';
                if (rCanvas) rCanvas.style.display = 'none';
                return;
            }
            const src = chart.canvas;
            const ca = chart.chartArea;
            if (!ca || !src.width) return;
            const dpr = window.devicePixelRatio || 1;
            const hPhys = src.height;
            const hCss = hPhys / dpr;
            if (lCanvas) {
                const wCss = Math.ceil(ca.left);
                const wPhys = Math.ceil(wCss * dpr);
                lCanvas.width = wPhys; lCanvas.height = hPhys;
                lCanvas.style.width = wCss + 'px'; lCanvas.style.height = hCss + 'px'; lCanvas.style.display = 'block';
                const ctx = lCanvas.getContext('2d');
                ctx.clearRect(0, 0, wPhys, hPhys);
                ctx.drawImage(src, 0, 0, wPhys, hPhys, 0, 0, wPhys, hPhys);
            }
            if (rCanvas) {
                const rxCss = Math.floor(ca.right);
                const rxPhys = Math.floor(rxCss * dpr);
                const rwPhys = src.width - rxPhys;
                const rwCss = rwPhys / dpr;
                rCanvas.width = rwPhys; rCanvas.height = hPhys;
                rCanvas.style.width = rwCss + 'px'; rCanvas.style.height = hCss + 'px'; rCanvas.style.display = 'block';
                const ctx = rCanvas.getContext('2d');
                ctx.clearRect(0, 0, rwPhys, hPhys);
                ctx.drawImage(src, rxPhys, 0, rwPhys, hPhys, 0, 0, rwPhys, hPhys);
            }
        }
        function updateHistoryChart() {
            if(!historyChart) return;
            const recs = App.history?.records || [];
            if(recs.length && (historySelectedIndex < 0 || historySelectedIndex >= recs.length)) historySelectedIndex = recs.length - 1;
            applyHistoryCanvasLayout(recs.length > 0);
            const labels = recs.map(r => {
                const d = new Date(r.time);
                return Number.isNaN(d.getTime()) ? r.time : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            });
            const water = recs.map(r => parseFloat(r?.wasserentzug?.l_h) || 0);
            const pressure = recs.map(r => parseFloat(r?.druck?.pa) || 0);
            historyChart.data.labels = labels;
            historyChart.data.datasets = [
                {
                    label: t('chart.water_removal', 'Wasserentzug (L/h)'),
                    data: water,
                    borderColor: 'rgba(37,99,235,0.35)',
                    pointBackgroundColor: (ctx) => ctx.dataIndex === historySelectedIndex ? '#1d4ed8' : '#2563eb',
                    pointBorderColor: '#1d4ed8',
                    pointBorderWidth: (ctx) => ctx.dataIndex === historySelectedIndex ? 2 : 1,
                    borderWidth: 1.2,
                    tension: 0.2,
                    pointRadius: (ctx) => ctx.dataIndex === historySelectedIndex ? 5.4 : 3.2,
                    pointHoverRadius: (ctx) => ctx.dataIndex === historySelectedIndex ? 6.2 : 4.5,
                    yAxisID: 'yWater'
                },
                {
                    label: t('chart.pressure', 'Druck (Pa)'),
                    data: pressure,
                    borderColor: 'rgba(245,158,11,0.35)',
                    pointBackgroundColor: (ctx) => ctx.dataIndex === historySelectedIndex ? '#b45309' : '#f59e0b',
                    pointBorderColor: '#d97706',
                    pointBorderWidth: (ctx) => ctx.dataIndex === historySelectedIndex ? 2 : 1,
                    borderWidth: 1.2,
                    tension: 0.2,
                    pointRadius: (ctx) => ctx.dataIndex === historySelectedIndex ? 5.4 : 3.2,
                    pointHoverRadius: (ctx) => ctx.dataIndex === historySelectedIndex ? 6.2 : 4.5,
                    yAxisID: 'yPressure'
                }
            ];
            if(historyChart.options?.scales?.yWater?.title) historyChart.options.scales.yWater.title.text = t('chart.axis.water', 'L/h');
            if(historyChart.options?.scales?.yPressure?.title) historyChart.options.scales.yPressure.title.text = t('chart.axis.pressure', 'Pa');
            historyChart.update('none');
            syncStickyAxes(historyChart, 'history-chart-scroll', 'historyChart-yL', 'historyChart-yR');
            const cnt = document.getElementById('history-count');
            if(cnt) cnt.innerText = `${recs.length} ${t('history.points', 'Punkte')}`;
            updateHistorySelectionUI();
        }
        function updateHistoryClimateChart() {
            if(!historyClimateChart) return;
            const recs = App.history?.records || [];
            if(recs.length && (historySelectedIndex < 0 || historySelectedIndex >= recs.length)) historySelectedIndex = recs.length - 1;
            applyHistoryCanvasLayout(recs.length > 0);
            const labels = recs.map(r => {
                const d = new Date(r.time);
                return Number.isNaN(d.getTime()) ? r.time : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            });
            const t1 = recs.map(r => roundTemp(r?.luftqualitaet?.t1_c));
            const t2 = recs.map(r => roundTemp(r?.luftqualitaet?.t2_c));
            const t3 = recs.map(r => roundTemp(r?.luftqualitaet?.t3_c));
            const h1 = recs.map(r => parseFloat(r?.luftqualitaet?.h1_pct) || 0);
            const h2 = recs.map(r => parseFloat(r?.luftqualitaet?.h2_pct) || 0);
            const h3 = recs.map(r => parseFloat(r?.luftqualitaet?.h3_pct) || 0);
            historyClimateChart.data.labels = labels;
            historyClimateChart.data.datasets = [
                { label: t('chart.outdoor_temp', 'Aussen T (°C)'), data: t1, borderColor: 'rgba(37,99,235,0.4)', pointBackgroundColor: '#2563eb', pointBorderColor: '#1d4ed8', pointBorderWidth: (ctx) => ctx.dataIndex === historySelectedIndex ? 2 : 1, borderWidth: 1.1, tension: 0.18, pointRadius: (ctx) => ctx.dataIndex === historySelectedIndex ? 4.8 : 3, pointHoverRadius: (ctx) => ctx.dataIndex === historySelectedIndex ? 5.8 : 4.2, yAxisID: 'yTemp' },
                { label: t('chart.supply_temp', 'Zuluft T (°C)'), data: t2, borderColor: 'rgba(245,158,11,0.4)', pointBackgroundColor: '#f59e0b', pointBorderColor: '#d97706', pointBorderWidth: (ctx) => ctx.dataIndex === historySelectedIndex ? 2 : 1, borderWidth: 1.1, tension: 0.18, pointRadius: (ctx) => ctx.dataIndex === historySelectedIndex ? 4.8 : 3, pointHoverRadius: (ctx) => ctx.dataIndex === historySelectedIndex ? 5.8 : 4.2, yAxisID: 'yTemp' },
                { label: t('chart.exhaust_temp', 'Abluft T (°C)'), data: t3, borderColor: 'rgba(16,185,129,0.4)', pointBackgroundColor: '#10b981', pointBorderColor: '#059669', pointBorderWidth: (ctx) => ctx.dataIndex === historySelectedIndex ? 2 : 1, borderWidth: 1.1, tension: 0.18, pointRadius: (ctx) => ctx.dataIndex === historySelectedIndex ? 4.8 : 3, pointHoverRadius: (ctx) => ctx.dataIndex === historySelectedIndex ? 5.8 : 4.2, yAxisID: 'yTemp' },
                { label: t('chart.outdoor_rh', 'Aussen rF (%)'), data: h1, borderColor: 'rgba(37,99,235,0.28)', pointBackgroundColor: (ctx) => ctx.dataIndex === historySelectedIndex ? '#1d4ed8' : '#2563eb', pointBorderColor: '#1d4ed8', pointBorderWidth: (ctx) => ctx.dataIndex === historySelectedIndex ? 2 : 1, pointStyle: 'rect', borderDash: [5,4], borderWidth: 1, tension: 0.18, pointRadius: (ctx) => ctx.dataIndex === historySelectedIndex ? 4.8 : 3, pointHoverRadius: (ctx) => ctx.dataIndex === historySelectedIndex ? 5.8 : 4.2, yAxisID: 'yHum' },
                { label: t('chart.supply_rh', 'Zuluft rF (%)'), data: h2, borderColor: 'rgba(245,158,11,0.28)', pointBackgroundColor: (ctx) => ctx.dataIndex === historySelectedIndex ? '#d97706' : '#f59e0b', pointBorderColor: '#d97706', pointBorderWidth: (ctx) => ctx.dataIndex === historySelectedIndex ? 2 : 1, pointStyle: 'rect', borderDash: [5,4], borderWidth: 1, tension: 0.18, pointRadius: (ctx) => ctx.dataIndex === historySelectedIndex ? 4.8 : 3, pointHoverRadius: (ctx) => ctx.dataIndex === historySelectedIndex ? 5.8 : 4.2, yAxisID: 'yHum' },
                { label: t('chart.exhaust_rh', 'Abluft rF (%)'), data: h3, borderColor: 'rgba(16,185,129,0.28)', pointBackgroundColor: (ctx) => ctx.dataIndex === historySelectedIndex ? '#059669' : '#10b981', pointBorderColor: '#059669', pointBorderWidth: (ctx) => ctx.dataIndex === historySelectedIndex ? 2 : 1, pointStyle: 'rect', borderDash: [5,4], borderWidth: 1, tension: 0.18, pointRadius: (ctx) => ctx.dataIndex === historySelectedIndex ? 4.8 : 3, pointHoverRadius: (ctx) => ctx.dataIndex === historySelectedIndex ? 5.8 : 4.2, yAxisID: 'yHum' }
            ];
            if(historyClimateChart.options?.scales?.yTemp?.title) historyClimateChart.options.scales.yTemp.title.text = t('chart.axis.temp', '°C');
            if(historyClimateChart.options?.scales?.yHum?.title) historyClimateChart.options.scales.yHum.title.text = t('chart.axis.rh', '% rF');
            historyClimateChart.update('none');
            syncStickyAxes(historyClimateChart, 'history-climate-scroll', 'historyClimateChart-yL', 'historyClimateChart-yR');
        }
        function renderHistoryTable() {
            const body = document.getElementById('history-table-body');
            if(!body) return;
            const recs = App.history?.records || [];
            const fanChanged = (a, b) => {
                if(!a || !b) return true;
                const al = a.luefter || {}, bl = b.luefter || {};
                return (al.label || '') !== (bl.label || '') || (al.mode || '') !== (bl.mode || '') || Math.abs((parseFloat(al.pmax_mbar)||0) - (parseFloat(bl.pmax_mbar)||0)) > 0.001 || Math.abs((parseFloat(al.flow_m3s)||0) - (parseFloat(bl.flow_m3s)||0)) > 0.001;
            };
            const rows = [];
            for(let i = recs.length - 1; i >= 0; i--) {
                const r = recs[i];
                const prev = i > 0 ? recs[i - 1] : null;
                if(fanChanged(r, prev)) {
                    const fan = r.luefter || {};
                    const fanLine = `${fan.label || '-'} | ${fan.mode || '-'} | ${Number.isFinite(parseFloat(fan.flow_m3s)) ? parseFloat(fan.flow_m3s).toFixed(2) : '-'} m³/s | Pmax ${Number.isFinite(parseFloat(fan.pmax_mbar)) ? parseFloat(fan.pmax_mbar).toFixed(1) : '-'} mbar`;
                    rows.push(`<tr class="bg-amber-50"><td colspan="5" class="font-bold text-amber-800">${t('history.fan_changed', 'Lüfter geändert')}: ${fanLine}</td></tr>`);
                }
                const ts = r.time ? new Date(r.time) : null;
                const timeTxt = ts && !Number.isNaN(ts.getTime()) ? ts.toLocaleString() : (r.time || '-');
                const futterTxt = `${(r.futterlager?.area_m2 ?? 0).toFixed ? r.futterlager.area_m2.toFixed(0) : r.futterlager?.area_m2} m² / ${(r.futterlager?.stock_height_m ?? 0).toFixed ? r.futterlager.stock_height_m.toFixed(1) : r.futterlager?.stock_height_m} m`;
                const airTxt = `${roundTemp(r.luftqualitaet?.t1_c).toFixed(1)}°/${r.luftqualitaet?.h1_pct ?? '-'}% | ${roundTemp(r.luftqualitaet?.t2_c).toFixed(1)}°/${r.luftqualitaet?.h2_pct ?? '-'}% | ${roundTemp(r.luftqualitaet?.t3_c).toFixed(1)}°/${r.luftqualitaet?.h3_pct ?? '-'}%`;
                const waterTxt = `${(r.wasserentzug?.l_h ?? 0).toFixed ? r.wasserentzug.l_h.toFixed(0) : r.wasserentzug?.l_h} L/h (${(r.wasserentzug?.g_m3 ?? 0).toFixed ? r.wasserentzug.g_m3.toFixed(2) : r.wasserentzug?.g_m3} g/m³)`;
                const pressureTxt = `${(r.druck?.pa ?? 0).toFixed ? r.druck.pa.toFixed(0) : r.druck?.pa} Pa`;
                const rowCls = i === historySelectedIndex ? 'history-row-selected' : 'cursor-pointer hover:bg-slate-50';
                rows.push(`<tr class="${rowCls}" onclick="applyHistoryRecord(${i})" title="Diesen Zeitpunkt laden"><td>${timeTxt}</td><td>${futterTxt}</td><td>${airTxt}</td><td>${waterTxt}</td><td>${pressureTxt}</td></tr>`);
            }
            body.innerHTML = rows.join('');
            const cnt = document.getElementById('history-count');
            if(cnt) cnt.innerText = `${recs.length} ${t('history.points', 'Punkte')}`;
        }
        function getLayerDensity(layer) {
            const opt = DENS_OPTS.find(o => o.id === layer.type) || DENS_OPTS[1];
            const densVal = parseFloat(layer.dens);
            return Number.isFinite(densVal) && densVal > 0 ? densVal : opt.d;
        }
        function setManualStockHeight(v) {
            const parsed = parseFloat(v);
            App.stockHeightManual = Number.isFinite(parsed) && parsed > 0 ? parsed : null;
            openLayersModal();
            update();
            saveData();
        }
        function setAreaTop(v) {
            const parsed = parseFloat(v);
            App.area = Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
            guideStep(2);
            update();
            saveData();
        }
        function adjustArea(delta) {
            const base = Math.max(1, parseFloat(App.area) || 1);
            setAreaTop(base + delta);
        }
        function startAreaStep(delta, turboDelta) {
            guideStep(2);
            adjustArea(delta);
            areaStepDelay = setTimeout(() => {
                areaStepTimer = setInterval(() => adjustArea(turboDelta), 300);
            }, 400);
        }
        function stopAreaStep() {
            clearTimeout(areaStepDelay);
            clearInterval(areaStepTimer);
        }
        function setFlowSpec(v) {
            const parsed = parseFloat(v);
            App.flowSpec = Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
            update();
            saveData();
        }
        function adjustFlowSpec(delta) {
            const base = Number.isFinite(parseFloat(App.flowSpec)) ? parseFloat(App.flowSpec) : 0;
            setFlowSpec(Math.max(0, base + delta));
        }
        function startFlowSpecStep(delta, turboDelta) {
            adjustFlowSpec(delta);
            flowSpecStepDelay = setTimeout(() => {
                flowSpecStepTimer = setInterval(() => adjustFlowSpec(turboDelta), 300);
            }, 400);
        }
        function stopFlowSpecStep() {
            clearTimeout(flowSpecStepDelay);
            clearInterval(flowSpecStepTimer);
        }
        function resetAllInputs() {
            // Keep configured storage/fan setup; reset only measured/process values.
            App.vals = { ...DEFAULT_APP_STATE.vals };
            App.sim = { ...DEFAULT_APP_STATE.sim };
            App.useMeas = false;

            ['t1','h1','t2','h2','t3','h3'].forEach((id) => {
                const node = document.getElementById(id + '-in');
                if(node) node.value = App.vals[id].toFixed(id.startsWith('t') ? 1 : 0);
            });

            const adiabatic = document.getElementById('check-adiabatic');
            if(adiabatic) adiabatic.checked = true;

            const simDehum = document.getElementById('sim-dehum');
            const simHeat = document.getElementById('sim-heat');
            const simDehumDisp = document.getElementById('disp-sim-dehum');
            const simHeatDisp = document.getElementById('disp-sim-heat');
            if(simDehum) simDehum.value = '0';
            if(simHeat) simHeat.value = '0';
            if(simDehumDisp) simDehumDisp.innerText = '0 kW';
            if(simHeatDisp) simHeatDisp.innerText = '0 kW';

            const simPanel = document.getElementById('sim-panel');
            if(simPanel) simPanel.classList.add('hidden');
            const simToggleBtn = document.getElementById('sim-toggle-btn');
            if(simToggleBtn) simToggleBtn.classList.remove('sim-btn-active');
            const simEffect = document.getElementById('sim-effect');
            if(simEffect) simEffect.classList.add('hidden');

            const measPressure = document.getElementById('inp-meas-p');
            if(measPressure) measPressure.value = '';
            const pUnit = document.getElementById('p-unit');
            if(pUnit) pUnit.value = '0.01';

            const areaInp = document.getElementById('inp-area');
            if(areaInp) areaInp.value = App.area;
            const areaTop = document.getElementById('inp-area-top');
            if(areaTop) areaTop.value = App.area;
            const flowSpecIn = document.getElementById('flow-spec-in');
            if(flowSpecIn) flowSpecIn.value = (parseFloat(App.flowSpec) || 0).toFixed(2);
            const stockHInp = document.getElementById('inp-stock-h');
            if(stockHInp) stockHInp.value = Number.isFinite(parseFloat(App.stockHeightManual)) ? parseFloat(App.stockHeightManual).toFixed(1) : '';
            const fanSearch = document.getElementById('fan-search');
            if(fanSearch) fanSearch.value = App.fan.label || '';

            update();
            saveData();
        }

        function resetEverything() {
            const c1 = confirm(t('settings.reset_all_confirm_1', 'Reset alles? Alle Einstellungen und Konfigurationen werden gelöscht.'));
            if(!c1) return;
            const c2 = confirm(t('settings.reset_all_confirm_2', 'Letzte Rückfrage: Auch alle aufgezeichneten Daten unwiderruflich löschen?'));
            if(!c2) return;

            const keepLang = I18N_LANG;
            localStorage.removeItem('agff_mob_pro_v10');
            localStorage.setItem('agff_lang', keepLang);
            location.reload();
        }
        window.resetEverything = resetEverything;

        function openDialogById(id) {
            const modal = document.getElementById(id);
            if(!modal) return;
            if(typeof modal.showModal === 'function') {
                if(!modal.open) modal.showModal();
            } else {
                modal.setAttribute('open', '');
            }
        }
        function closeDialogById(id) {
            const modal = document.getElementById(id);
            if(!modal) return;
            if(typeof modal.close === 'function') {
                if(modal.open) modal.close();
            } else {
                modal.removeAttribute('open');
            }
        }
        function setHeucheckTab(tab) {
            const isFan = tab === 'luefter';
            const fanPanel = document.getElementById('panel-heucheck-luefter');
            const lagerPanel = document.getElementById('panel-heucheck-lager');
            const fanTab = document.getElementById('tab-heucheck-luefter');
            const lagerTab = document.getElementById('tab-heucheck-lager');
            if(fanPanel) fanPanel.classList.toggle('hidden', !isFan);
            if(lagerPanel) lagerPanel.classList.toggle('hidden', isFan);
            if(fanTab) fanTab.classList.toggle('active', isFan);
            if(lagerTab) lagerTab.classList.toggle('active', !isFan);
            if(isFan) updateFanChart(); else openLayersModal();
        }
        function openHeucheckModal(tab = 'lager') {
            setHeucheckTab(tab);
            openDialogById('heucheck-modal');
        }
        function closeHeucheckModal() {
            closeDialogById('heucheck-modal');
            update();
            saveData();
        }
        function toggleInfo(id) {
            const infoIds = ['pressure-info', 'eff-info'];
            const target = document.getElementById(id);
            if(!target) return;
            const willOpen = target.classList.contains('hidden');
            infoIds.forEach(infoId => {
                const el = document.getElementById(infoId);
                if(el) el.classList.add('hidden');
            });
            if(willOpen) target.classList.remove('hidden');
        }
        function setAutoHintAccordion(wrapId, summaryId, hintId, summaryLabel, message, severity) {
            const wrap = document.getElementById(wrapId);
            const summary = document.getElementById(summaryId);
            const hint = document.getElementById(hintId);
            if(!wrap || !summary || !hint) return;
            hint.innerText = message;
            summary.innerText = `${summaryLabel}`;
            wrap.classList.remove('bg-red-50','text-red-900','border-red-200','bg-amber-50','text-amber-900','border-amber-200','bg-emerald-50','text-emerald-900','border-emerald-200','bg-slate-50','text-slate-800','border-slate-200');
            if(severity === 'red') {
                wrap.classList.add('bg-red-50','text-red-900','border-red-200');
                wrap.open = true;
            } else if(severity === 'yellow') {
                wrap.classList.add('bg-amber-50','text-amber-900','border-amber-200');
                wrap.open = true;
            } else {
                wrap.classList.add('bg-emerald-50','text-emerald-900','border-emerald-200');
                wrap.open = false;
            }
        }

        function renderMilkCanVisualization(removalLh) {
            const container = document.getElementById('milk-can-vis');
            const note = document.getElementById('milk-can-note');
            if(!container || !note) return;

            const isHumidifying = removalLh < 0;
            const totalLiters = Math.max(0, Math.abs(removalLh));
            const fills = [];
            const fullCans = Math.floor(totalLiters / 40);
            const remainderRatio = (totalLiters % 40) / 40;
            const visibleFullCans = Math.min(fullCans, 6);

            for(let i = 0; i < visibleFullCans; i++) {
                fills.push(1);
            }
            if(remainderRatio > 0.001 && fills.length < 6) {
                fills.push(remainderRatio);
            }

            container.innerHTML = fills.map((fill) => {
                const liters = Math.max(0, Math.min(40, fill * 40));
                const fillPercent = Math.max(10, Math.min(100, fill * 100));
                const title = isHumidifying
                    ? `Rueckbefeuchtung ${liters.toFixed(0)} L/h`
                    : (liters >= 39.5 ? 'volle 40-L-Milchkanne' : `${liters.toFixed(0)} L in 40-L-Milchkanne`);
                const negClass = isHumidifying ? ' milk-can-negative' : '';
                const spill = isHumidifying ? '<span class="milk-can-spill"></span>' : '';
                return `<div class="milk-can${negClass}" title="${title}"><span class="milk-can-handle"></span><span class="milk-can-neck"></span><span class="milk-can-label">40L</span><div class="milk-can-fill" style="height:${fillPercent}%"></div>${spill}</div>`;
            }).join('');

            const displayedLiters = fills.reduce((sum, fill) => sum + (fill * 40), 0);
            const additionalWhole = Math.max(0, Math.floor((Math.max(0, totalLiters - displayedLiters)) / 40));
            if(additionalWhole > 0) {
                container.innerHTML += `<div class="milk-can-plus">+${additionalWhole}</div>`;
            }

            if(totalLiters <= 0) {
                note.textContent = 'Keine 40-L-Milchkanne pro Stunde';
                note.className = 'text-[10px] text-slate-400 font-bold mt-1';
            } else if(isHumidifying) {
                note.textContent = 'Rueckbefeuchtung (40-L-Milchkannen pro Stunde)';
                note.className = 'text-[10px] text-red-600 font-bold mt-1';
            } else {
                note.textContent = '40-L-Milchkannen pro Stunde';
                note.className = 'text-[10px] text-slate-400 font-bold mt-1';
            }
        }

        // --- STEPPER ---
        let stepTimer, stepDelay;
        function startStep(id, d, dTurbo) { updateVal(id, d); stepDelay = setTimeout(() => { stepTimer = setInterval(() => updateVal(id, dTurbo), 400); }, 400); }
        function stopStep() { clearTimeout(stepDelay); clearInterval(stepTimer); }
        function updateVal(id, d) { manualInput(id, App.vals[id]+d); }
        function stepP(d) {
            const el = document.getElementById('inp-meas-p'); let v = parseFloat(el.value) || 0;
            v = Math.max(0, v + d); el.value = v.toFixed(1); setPressureMode(true); update();
        }

        // --- INTERACTION ---
        function toggleDetail(id) {
            const el = document.getElementById('detail-'+id); const card = document.getElementById('card-'+id);
            if(!el || !card) return;
            ['water','status','kittl'].forEach(k => {
                if(k!==id) {
                    const otherDetail = document.getElementById('detail-'+k);
                    const otherCard = document.getElementById('card-'+k);
                    if(otherDetail) otherDetail.classList.remove('open');
                    if(otherCard) {
                        otherCard.classList.remove('active');
                        otherCard.classList.remove('col-span-2');
                    }
                }
            });
            if(el.classList.contains('open')) {
                el.classList.remove('open');
                card.classList.remove('active');
                card.classList.remove('col-span-2');
            } else {
                if(el.parentElement !== card) card.appendChild(el);
                el.classList.add('open');
                card.classList.add('active');
                card.classList.add('col-span-2');
            }
        }
        function toggleFullscreen() { document.getElementById('chart-container').classList.toggle('chart-fs'); setTimeout(() => hxChart.resize(), 50); }
        function manualInput(id, v) {
            let val = parseFloat(v); if(id.includes('h')) val = Math.max(0, Math.min(100, val));
            if(id.includes('t')) val = roundTemp(val);
            App.vals[id] = val; document.getElementById(id+'-in').value = val.toFixed(id.includes('t')?1:0);
            if(id === 't1' || id === 'h1') guideStep(3);
            if(id === 't2' || id === 'h2') guideStep(4);
            if(id === 'h3') guideStep(5);
            if(id.includes('1')) runSim(null,null); if(id.includes('2') || id.includes('h3')) autoStep3(); update();
        }
        function setPressureMode(meas) { App.useMeas = meas; update(); }

        function toggleSimPanel() {
            const panel = document.getElementById('sim-panel');
            const btn = document.getElementById('sim-toggle-btn');
            if (!panel) return;
            if (panel.classList.contains('hidden')) {
                panel.classList.remove('hidden');
                if (btn) btn.classList.add('sim-btn-active');
            } else {
                panel.classList.add('hidden');
                if (btn) btn.classList.remove('sim-btn-active');
                // Werte bleiben erhalten – Simulation weiterhin aktiv im Hintergrund
            }
        }
        function openKnowledgeArticle(fileName) {
            openDialogById('phases-modal');
            setTimeout(() => {
                const slug = fileName.replace('.md','').toLowerCase().replace(/[^a-z0-9]+/g,'-');
                const el = document.getElementById('knowledge-' + slug);
                if (el) { el.open = true; setTimeout(() => el.scrollIntoView({behavior:'smooth',block:'start'}), 50); }
            }, 150);
        }

        // --- CALCULATION ---
        function runSim(val, type) {
            if(type) { App.sim[type]=parseFloat(val); document.getElementById('disp-sim-'+type).innerText=val+" kW"; }
            const p = PHY.p(App.params.alt); const rho = PHY.dens(App.vals.t1, p);
            const m_dot = Math.max(1, App.fan.flow) * rho; const cp = 1.006;
            const dt_heat = App.sim.heat / (m_dot * cp);
            const m_water = (App.sim.dehum * 1.8) / 3600; const heat_cond = m_water * 2450;
            const dt_dehum = (App.sim.dehum + heat_cond) / (m_dot * cp);
            const dx = (m_water / m_dot) * 1000;
            const t2 = App.vals.t1 + dt_heat + dt_dehum;
            const x1 = PHY.abs(App.vals.t1, App.vals.h1, p)/1000; const x2 = Math.max(0.001, x1 - dx/1000);
            const h2 = PHY.rel(t2, x2*1000, p);
            App.vals.t2 = roundTemp(t2); App.vals.h2 = h2;
            document.getElementById('t2-in').value=t2.toFixed(1); document.getElementById('h2-in').value=h2.toFixed(0);
            const simEffectEl = document.getElementById('sim-effect');
            if (simEffectEl) {
                if (App.sim.dehum > 0 || App.sim.heat > 0) {
                    simEffectEl.classList.remove('hidden');
                    const dtSim = dt_heat + dt_dehum;
                    const simDtEl = document.getElementById('sim-dt'); if(simDtEl) simDtEl.innerText = (dtSim>=0?'+':'')+dtSim.toFixed(1)+'°C';
                    const simT2El = document.getElementById('sim-t2h2'); if(simT2El) simT2El.innerText = t2.toFixed(1)+'° / '+h2.toFixed(0)+'%';
                    const extraCost = App.sim.dehum*(App.params.price/100) + App.sim.heat*(App.params.priceHeat/100);
                    const simCostEl = document.getElementById('sim-cost'); if(simCostEl) simCostEl.innerText = '+'+extraCost.toFixed(2)+' CHF/h';
                } else {
                    simEffectEl.classList.add('hidden');
                }
            }
            autoStep3(); update();
        }
        function autoStep3() {
            if(!document.getElementById('check-adiabatic').checked) return;
            const p = PHY.p(App.params.alt); const x2 = PHY.abs(App.vals.t2, App.vals.h2, p)/1000; const ent = 1.006*App.vals.t2 + x2*(2501+1.86*App.vals.t2);
            let t=App.vals.t2; for(let i=0;i<200;i++){ t-=0.1; const xReq = (ent - 1.006*t)/(2501+1.86*t); if(PHY.rel(t, xReq*1000, p) >= App.vals.h3) break; }
            App.vals.t3 = roundTemp(t); document.getElementById('t3-in').value=App.vals.t3.toFixed(1);
        }

        function update() {
            const p = PHY.p(App.params.alt);
            App.area = Math.max(1, parseFloat(App.area) || 1);
            App.flowSpec = Math.max(0, parseFloat(App.flowSpec) || 0);
            const isStandardAutoFan = App.fan.autoScaleStandard === true && (App.fan.label || '') === 'Standard' && App.fan.mode !== 'simple';

            const areaTop = document.getElementById('inp-area-top');
            if(areaTop) areaTop.value = App.area.toFixed(0);

            const areaInp = document.getElementById('inp-area');
            if(areaInp) areaInp.value = App.area;
            
            let stackP = 0;
            App.layers.forEach(l => {
                const opt = DENS_OPTS.find(o=>o.id===l.type) || DENS_OPTS[1];
                let f = opt.f; if(l.ts<60) f*=1.5; else if(l.ts>85) f*=0.8; stackP += l.h * f;
            });
            
            const pUnit = parseFloat(document.getElementById('p-unit').value);
            const unitTxt = document.getElementById('p-unit').options[document.getElementById('p-unit').selectedIndex].text;
            document.querySelectorAll('.unit-label').forEach(el => el.innerText = unitTxt);
            document.getElementById('val-calc-p').innerText = (stackP / pUnit).toFixed(1);

            let effectiveP = stackP;
            const bCalc = document.getElementById('box-calc-p'), bMeas = document.getElementById('box-meas-p');
            if(App.useMeas) {
                const inpVal = parseFloat(document.getElementById('inp-meas-p').value) || 0; effectiveP = inpVal * pUnit;
                bMeas.className = "p-box active rounded-lg relative"; bCalc.className = "p-box inactive rounded-lg";
            } else {
                bCalc.className = "p-box active rounded-lg"; bMeas.className = "p-box inactive rounded-lg relative";
            }
            
            let flow = App.fan.flow, power = 0;
            if(App.fan.curve.length > 0) {
                 const pts = App.fan.curve.sort((a,b)=>a.p-b.p);
                 if(effectiveP >= App.fan.pmax) { flow=0; power=0; }
                 else {
                     let p1=pts[0], p2=pts[pts.length-1];
                     for(let i=0; i<pts.length-1; i++) { if(effectiveP >= pts[i].p && effectiveP <= pts[i+1].p) { p1=pts[i]; p2=pts[i+1]; break; } }
                     if(effectiveP < p1.p) { p2=p1; p1={p:0,q:p1.q,kw:p1.kw}; }
                     const r = (effectiveP - p1.p) / (p2.p - p1.p);
                     flow = p1.q + (p2.q - p1.q) * r; power = p1.kw + (p2.kw - p1.kw) * r;
                 }
                 if(isStandardAutoFan && flow > 0) {
                     const targetFlow = App.area * 0.11;
                     const scaleFactor = targetFlow / flow;
                     flow = targetFlow;
                     power = Math.max(0, power * scaleFactor);
                 }
            } else {
                 if(effectiveP > App.fan.pmax) flow = 0; 
                 // Simple mode: Calc power phys. with eff=0.6
                 power = (flow * effectiveP * 100)/0.6/1000; 
            }
              App.fan.flow = Math.max(0, flow);
              App.flowSpec = App.area > 0 ? App.fan.flow / App.area : 0;
              const flowSpecIn = document.getElementById('flow-spec-in');
              if(flowSpecIn) flowSpecIn.value = App.flowSpec.toFixed(2);
              const flowTotalOut = document.getElementById('flow-total');
              if(flowTotalOut) flowTotalOut.innerText = App.fan.flow.toFixed(1);
            const speed = flow / App.area;
            const rho = PHY.dens(App.vals.t2, p);
            const dx = PHY.abs(App.vals.t3, App.vals.h3, p) - PHY.abs(App.vals.t2, App.vals.h2, p);
            const removalLh = dx * rho * flow * 3.6;
            const wm3 = (dx*rho);

            // LOGIC: TS ESTIMATE
            const rhAb = App.vals.h3; let ts = 88;
            if(rhAb > 95) ts = 55; else if(rhAb > 90) ts = 65; else if(rhAb > 80) ts = 75; else if(rhAb > 70) ts = 82; else if(rhAb > 60) ts = 86;

            // LOGIC: PHASE
            let phaseIdx = 0;
            if(ts < AGFF_CONFIG.limits.ts_anwelk) phaseIdx = 0;
            else if(ts < AGFF_CONFIG.limits.ts_haupt) phaseIdx = 1;
            else if(ts < AGFF_CONFIG.limits.ts_end) phaseIdx = 2;
            else phaseIdx = 3;
            const pObj = AGFF_CONFIG.phases[phaseIdx];
            
            // LOGIC: RECOMMENDATION
            let recText = "Kontrolle"; let recColor = "bg-slate-100";
            if(phaseIdx === 0) {
                 recText = "Dauerbetrieb (24h Pflicht)"; recColor = "bg-blue-50";
            } else if (phaseIdx === 1) { // Haupt
                  if(wm3 < AGFF_CONFIG.guidelines.water_min_main) { recText = `Ineffizient (<${AGFF_CONFIG.guidelines.water_min_main.toFixed(1)}g) / Stop`; recColor = "bg-red-50"; }
                 else { recText = "Dauerbetrieb"; recColor = "bg-amber-50"; }
            } else if (phaseIdx === 2) { // End
                 recText = "Intervallbetrieb"; recColor = "bg-lime-50";
            } else {
                 recText = "Lüftung Aus / Kontrolle"; recColor = "bg-emerald-50";
            }

            // UI
            const elW = document.getElementById('res-water-m3'); elW.innerText = wm3.toFixed(2);
            elW.className = "text-sm font-bold "+(wm3>0.2?"text-blue-700":(wm3<-0.1?"text-red-600":"text-amber-600"));
            const rehumidWarn = document.getElementById('warn-rehumid');
            if(rehumidWarn) {
                if(wm3 < AGFF_CONFIG.limits.water_low) rehumidWarn.classList.remove('hidden');
                else rehumidWarn.classList.add('hidden');
            }
            const waterTotalEl = document.getElementById('res-water-total');
            if(waterTotalEl) {
                waterTotalEl.innerText = removalLh.toFixed(0);
                waterTotalEl.className = `text-3xl font-black ${removalLh < 0 ? 'text-red-700' : 'text-blue-700'}`;
            }
            renderMilkCanVisualization(removalLh);
            
            const totalCost = (power + App.sim.dehum + App.sim.heat/2) * (App.params.price/100);
            document.getElementById('det-elec').innerText = (power+App.sim.dehum).toFixed(1) + " kWh";
            document.getElementById('det-elec-cost').innerText = ((power+App.sim.dehum)*App.params.price/100).toFixed(2) + " CHF";
            document.getElementById('det-heat').innerText = App.sim.heat.toFixed(1) + " kWh";
            document.getElementById('det-oil').innerText = (App.sim.heat/10).toFixed(1) + " L";
            document.getElementById('det-heat-cost').innerText = (App.sim.heat*App.params.priceHeat/100).toFixed(2) + " CHF";
            document.getElementById('det-cpl').innerText = removalLh > 1 ? (totalCost/removalLh).toFixed(2) + " CHF/L" : "-";
            
            document.getElementById('card-phase-title').innerText = pObj.title;
            const card = document.getElementById('card-status');
            if(!card.classList.contains('active')) card.className = "dash-card"; 
            
            document.getElementById('rec-text').innerText = recText;
            const recCard = document.getElementById('card-kittl');
            if(recCard) {
                ['bg-slate-100','bg-blue-50','bg-amber-50','bg-lime-50','bg-emerald-50','bg-red-50'].forEach(c => recCard.classList.remove(c));
                recCard.classList.add(recColor);
            }

            const kittlInfo = document.getElementById('kittl-phase-info');
            if(kittlInfo) {
                kittlInfo.innerHTML = `<div class="text-[10px] uppercase tracking-wide font-bold text-${pObj.color}-600">Aktuelle Empfehlung</div><h4 class="font-bold text-sm text-${pObj.color}-700 mt-1">${pObj.title}</h4><p class="text-sm font-bold mt-1 text-slate-800">${recText}</p>`;
                kittlInfo.className = `rounded-lg border p-3 mb-2 border-${pObj.color}-200 bg-${pObj.color}-50`;
            }
            const kittlDetail = document.getElementById('kittl-phase-detail');
            if(kittlDetail) {
                const mdDetails = getKnowledgePhaseDetails();
                const markdownPhaseDetails = [
                    mdDetails.startphase,
                    mdDetails.haupttrocknung,
                    mdDetails.endtrocknung,
                    mdDetails.lagerung
                ];
                const fallbackPhaseDetails = [
                    '<ul class="list-disc pl-4 space-y-1"><li><strong>Startphase (&lt; 60% TS):</strong> Zwangslüftung im Dauerbetrieb, mindestens 24h ab Einfuhr.</li><li>Bei feuchter oder kalter Zuluft Luftaufbereitung (Heizung/Entfeuchtung) gezielt zuschalten.</li><li>Heustock engmaschig überwachen (Temperatur/Feuchte).</li></ul>',
                    '<ul class="list-disc pl-4 space-y-1"><li><strong>Haupttrocknung (60-80% TS):</strong> Dauerbetrieb zur maximalen Wasserabfuhr.</li><li>Intervallbetrieb erst prüfen, wenn Zuluftbedingungen ungünstig sind und TS fortgeschritten ist.</li><li>Bei sehr tiefem Wasserentzug Betriebspunkt (Luftmenge/Druck/Aufbereitung) nachstellen.</li></ul>',
                    '<ul class="list-disc pl-4 space-y-1"><li><strong>Endtrocknung (80-88% TS):</strong> Intervallbetrieb bevorzugen (z.B. 1h EIN / 3-4h AUS).</li><li>Dauerbetrieb ist in dieser Phase häufig energetisch ungünstig.</li><li>TS-Entwicklung weiter kontrollieren und Intervalle bedarfsgerecht anpassen.</li></ul>',
                    '<ul class="list-disc pl-4 space-y-1"><li><strong>Lagerung (&gt; 88% TS):</strong> Lüftung in der Regel aus, Bestand stabil halten.</li><li>In den ersten Wochen tägliche Temperaturkontrolle durchführen.</li><li>Nur bei Bedarf kurzzeitig nachlüften (z.B. bei Erwärmungstendenz).</li></ul>'
                ];
                kittlDetail.innerHTML = markdownPhaseDetails[phaseIdx] || fallbackPhaseDetails[phaseIdx] || '';
            }

            const currentPhaseInfo = document.getElementById('current-phase-info');
            if(currentPhaseInfo) {
                currentPhaseInfo.innerHTML = `<h4 class="font-bold text-sm text-${pObj.color}-600">${pObj.title}</h4><p class="text-sm font-bold mt-1">${recText}</p>`;
                currentPhaseInfo.className = `pl-4 border-l-4 mb-6 border-${pObj.color}-500`;
            }

            document.getElementById('res-ts').innerText = ts.toFixed(0);
            const bar = document.getElementById('ts-bar');
            bar.className = `h-2 rounded-full transition-all bg-${pObj.color}-500`;
            bar.style.width = Math.max(5, ((ts-30)*1.4)) + "%";

            document.getElementById('det-flow').innerText = flow.toFixed(1) + " m³/s";
            const detFlowSpec = document.getElementById('det-flow-spec');
            if(detFlowSpec) detFlowSpec.innerText = App.flowSpec.toFixed(2) + " m/s";
            const as = document.getElementById('ampel-speed');
            let speedHintMsg = '';
            let speedSeverity = 'green';
            if(speed < AGFF_CONFIG.guidelines.speed_min) {
                as.className="ampel bg-red-500";
                as.title = `Zu geringe Luftgeschwindigkeit (${speed.toFixed(2)} m/s): Durchströmung ungenügend, Trocknung verzögert.`;
                speedHintMsg = as.title;
                speedSeverity = 'red';
            } else if(speed <= AGFF_CONFIG.guidelines.speed_max) {
                as.className="ampel bg-green-500";
                as.title = `Im Zielbereich (${AGFF_CONFIG.guidelines.speed_min.toFixed(2)}–${AGFF_CONFIG.guidelines.speed_max.toFixed(2)} m/s): gute Durchströmung.`;
                speedHintMsg = as.title;
                speedSeverity = 'green';
            } else {
                as.className="ampel bg-yellow-500";
                as.title = `Über Zielbereich (${speed.toFixed(2)} m/s): erhöhten Energiebedarf prüfen.`;
                speedHintMsg = as.title;
                speedSeverity = 'yellow';
            }
            const speedInlineHint = document.getElementById('speed-inline-hint');
            if(speedInlineHint) {
                if(speedSeverity === 'red') {
                    speedInlineHint.className = 'mt-2 rounded border border-red-200 bg-red-50 px-2 py-1 text-[10px] font-bold text-red-800';
                    speedInlineHint.innerText = speedHintMsg;
                } else if(speedSeverity === 'yellow') {
                    speedInlineHint.className = 'mt-2 rounded border border-amber-200 bg-amber-50 px-2 py-1 text-[10px] font-bold text-amber-800';
                    speedInlineHint.innerText = speedHintMsg;
                } else {
                    speedInlineHint.className = 'hidden mt-2 rounded border px-2 py-1 text-[10px] font-bold';
                    speedInlineHint.innerText = '';
                }
            }
            document.getElementById('det-speed').innerText = speed.toFixed(2) + " m/s";

            const ap = document.getElementById('ampel-press');
            let pressHintMsg = '';
            let pressSeverity = 'green';
            if(effectiveP > App.fan.pmax) {
                ap.className="ampel bg-red-500";
                ap.title = `Druckbedarf zu hoch (${(effectiveP/pUnit).toFixed(1)} ${unitTxt}): über Ventilatorgrenze (${(App.fan.pmax/pUnit).toFixed(1)} ${unitTxt}).`;
                pressHintMsg = ap.title;
                pressSeverity = 'red';
            } else {
                ap.className="ampel bg-green-500";
                ap.title = `Druck im zulässigen Bereich des Ventilators.`;
                pressHintMsg = ap.title;
                pressSeverity = 'green';
            }
            setAutoHintAccordion('press-auto-wrap','press-auto-summary','press-auto-hint','Hinweis Druck',pressHintMsg,pressSeverity);
            document.getElementById('det-press').innerText = (effectiveP/pUnit).toFixed(1) + " " + unitTxt;

            document.getElementById('det-power').innerText = power.toFixed(1) + " kW";
            const eff = power>0 ? ((flow*effectiveP*100)/1000/power)*100 : 0;
            const ae = document.getElementById('ampel-eff');
            let effHintMsg = '';
            let effSeverity = 'green';
            if(eff > AGFF_CONFIG.guidelines.eff_good) {
                ae.className="ampel bg-green-500";
                ae.title = `Guter Betriebspunkt (${eff.toFixed(0)}%): Effizienz im Zielbereich.`;
                effHintMsg = ae.title;
                effSeverity = 'green';
            } else if(eff > AGFF_CONFIG.guidelines.eff_warn) {
                ae.className="ampel bg-yellow-500";
                ae.title = `Mittlere Effizienz (${eff.toFixed(0)}%): Luftmenge, Druck und Aufbereitung prüfen.`;
                effHintMsg = ae.title;
                effSeverity = 'yellow';
            } else {
                ae.className="ampel bg-red-500";
                ae.title = `Niedrige Effizienz (${eff.toFixed(0)}%): ungünstiger Betriebspunkt, hohe Verluste.`;
                effHintMsg = ae.title;
                effSeverity = 'red';
            }
            setAutoHintAccordion('eff-auto-wrap','eff-auto-summary','eff-auto-hint','Hinweis Effizienz',effHintMsg,effSeverity);
            document.getElementById('det-eff').innerText = eff.toFixed(0) + "%";

            const pressureDisplayVal = (effectiveP / pUnit).toFixed(1);
            App.lastMetrics = {
                flow_m3s: flow,
                speed_ms: speed,
                pressure_pa: effectiveP * 100,
                pressure_display: `${pressureDisplayVal} ${unitTxt}`,
                removal_lh: removalLh,
                water_gm3: wm3,
                power_kw: power,
                eff_pct: eff
            };
            if(App.history?.auto) {
                const autoKey = [
                    App.area.toFixed(0),
                    App.layers.length,
                    App.vals.t1.toFixed(1), App.vals.h1.toFixed(0),
                    App.vals.t2.toFixed(1), App.vals.h2.toFixed(0),
                    App.vals.t3.toFixed(1), App.vals.h3.toFixed(0),
                    flow.toFixed(2), (effectiveP * 100).toFixed(0), removalLh.toFixed(0)
                ].join('|');
                if(autoKey !== historyAutoKeyLast) {
                    historyAutoKeyLast = autoKey;
                    addHistoryRecord(buildCurrentHistoryRecord(), true);
                }
            }

            if(App.vals.t3 > App.vals.t2 + 0.5) document.getElementById('step3-warn').classList.remove('hidden'); else document.getElementById('step3-warn').classList.add('hidden');
            updateHX(p);
        }

        // --- CHARTS ---
        const hxRhLabelPlugin = {
            id: 'hxRhLabelPlugin',
            afterDatasetsDraw(chart) {
                const {ctx, chartArea} = chart;
                if(!chartArea) return;

                ctx.save();
                ctx.font = '10px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
                ctx.textAlign = 'left';
                ctx.textBaseline = 'middle';

                chart.data.datasets.forEach((dataset, datasetIndex) => {
                    if(!dataset.isRhCurve || !dataset.rhLabel) return;
                    const meta = chart.getDatasetMeta(datasetIndex);
                    if(!meta || !meta.data || !meta.data.length) return;
                    const lastPt = meta.data[meta.data.length - 1];
                    const highRh = dataset.rhLabel >= 70;
                    const pt = highRh && meta.data.length > 1 ? meta.data[meta.data.length - 2] : lastPt;
                    if(!pt) return;

                    const liftByRh = {70: 12, 80: 14, 90: 16, 100: 12};
                    const lift = liftByRh[dataset.rhLabel] || 0;
                    const y = Math.max(chartArea.top + 8, Math.min(chartArea.bottom - 8, pt.y - lift));
                    let x = chartArea.right - 2;
                    let align = 'right';
                    if(highRh) {
                        const rightByRh = {70: 2, 80: 4, 90: 6, 100: 8};
                        const right = rightByRh[dataset.rhLabel] ?? 6;
                        x = Math.min(chartArea.right - right, pt.x + 4);
                        align = 'left';
                    }
                    ctx.textAlign = align;
                    const isFifty = dataset.rhLabel === 50;
                    const isHundred = dataset.rhLabel === 100;
                    ctx.fillStyle = (isFifty || isHundred) ? '#334155' : '#64748b';
                    ctx.font = `${(isFifty || isHundred) ? '700' : '500'} 10px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`;
                    ctx.fillText(`${dataset.rhLabel}%`, x, y);
                });

                ctx.fillStyle = '#94a3b8';
                ctx.font = '500 10px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
                ctx.textAlign = 'right';
                ctx.fillText('rel. Luftfeuchte', chartArea.right - 2, chartArea.top - 10);
                ctx.restore();
            }
        };

        function getFanEditorUnit(type) {
            const key = fanEditorUnitState[type];
            return FAN_EDITOR_UNITS[type][key];
        }
        function toFanEditorUnit(type, value) {
            const unit = getFanEditorUnit(type);
            return (parseFloat(value) || 0) * unit.factor;
        }
        function fromFanEditorUnit(type, value) {
            const unit = getFanEditorUnit(type);
            return (parseFloat(value) || 0) / unit.factor;
        }
        function formatFanEditorValue(type, value) {
            const unit = getFanEditorUnit(type);
            return toFanEditorUnit(type, value).toFixed(unit.digits);
        }
        function syncFanUnitControls() {
            const pressureUnit = getFanEditorUnit('pressure');
            const flowUnit = getFanEditorUnit('flow');
            const pressureSelect = document.getElementById('fan-pressure-unit');
            const flowSelect = document.getElementById('fan-flow-unit');
            const pressureHead = document.getElementById('curve-head-pressure');
            const flowHead = document.getElementById('curve-head-flow');
            const fanFlowLabel = document.getElementById('fan-flow-label');
            const fanPmaxLabel = document.getElementById('fan-pmax-label');
            const fanFlowInput = document.getElementById('inp-fan-flow');
            const fanPmaxInput = document.getElementById('inp-fan-pmax');

            if(pressureSelect) pressureSelect.value = fanEditorUnitState.pressure;
            if(flowSelect) flowSelect.value = fanEditorUnitState.flow;
            if(pressureHead) pressureHead.innerText = pressureUnit.label;
            if(flowHead) flowHead.innerText = flowUnit.label;
            if(fanFlowLabel) fanFlowLabel.innerText = `Menge fix (${flowUnit.label})`;
            if(fanPmaxLabel) fanPmaxLabel.innerText = `P-Max (${pressureUnit.label})`;
            if(fanFlowInput) {
                const usesFixedFlow = App.fan.mode === 'simple' || !App.fan.curve.length;
                if(usesFixedFlow) {
                    fanFlowInput.value = formatFanEditorValue('flow', App.fan.flow);
                    fanFlowInput.placeholder = '';
                } else {
                    fanFlowInput.value = '';
                    fanFlowInput.placeholder = '--';
                }
            }
            if(fanPmaxInput) fanPmaxInput.value = formatFanEditorValue('pressure', App.fan.pmax);
            if(fanChart) {
                fanChart.options.scales.x.title.text = flowUnit.label;
                fanChart.options.scales.y.title.text = pressureUnit.label;
            }

            // Umin/Pmax summary fields removed from UI.
        }
        function setFanEditorUnit(type, value) {
            if(!FAN_EDITOR_UNITS[type] || !FAN_EDITOR_UNITS[type][value]) return;
            fanEditorUnitState[type] = value;
            syncFanUnitControls();
            renderCurveEditor();
            updateFanChart();
        }

        function initCharts() { 
            const hxCtx = document.getElementById('hxChart').getContext('2d'); hxChart = new Chart(hxCtx, { type: 'line', data: {datasets:[]}, plugins:[hxRhLabelPlugin], options: { responsive:true, maintainAspectRatio:false, layout:{padding:{right:2, top:14}}, plugins:{legend:{display:false},tooltip:{enabled:true, callbacks: { label: c => c.parsed.y.toFixed(1) + ' g/m³' }}}, scales:{x:{type:'linear',min:0,max:40,title:{display:true,text:'Temperatur (°C)',color:'#64748b',font:{size:10,weight:'600'},padding:{top:4}},ticks:{color:'#94a3b8',font:{size:9,weight:'500'}}}, y:{min:0,max:40,title:{display:true,text:'Absolute Feuchte (g/m³)',color:'#64748b',font:{size:10,weight:'600'},padding:{bottom:4}},ticks:{color:'#94a3b8',font:{size:9,weight:'500'}}}} } }); 
            const fCtx = document.getElementById('fanChart').getContext('2d'); fanChart = new Chart(fCtx, { type: 'line', data: {datasets:[]}, options: { responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false}}, scales:{x:{type:'linear', title:{display:true,text:'m³/s'}}, y:{beginAtZero:true, title:{display:true,text:'mbar'}}} } });
            const histEl = document.getElementById('historyChart');
            if(histEl) {
                const hCtx = histEl.getContext('2d');
                historyChart = new Chart(hCtx, {
                    type: 'line',
                    data: { labels: [], datasets: [] },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        onClick: (_, elements) => {
                            if(!elements || !elements.length) return;
                            applyHistoryRecord(elements[0].index);
                        },
                        interaction: { mode: 'index', intersect: false },
                        plugins: { legend: { display: true, labels: { boxWidth: 8, font: { size: 10 } } } },
                        scales: {
                            x: { ticks: { autoSkip: true, maxTicksLimit: 12, maxRotation: 0, color: '#94a3b8', font: { size: 9 } } },
                            yWater: {
                                type: 'linear',
                                position: 'left',
                                title: { display: true, text: 'L/h' },
                                ticks: { color: '#2563eb', font: { size: 9 } }
                            },
                            yPressure: {
                                type: 'linear',
                                position: 'right',
                                title: { display: true, text: 'Pa' },
                                grid: { drawOnChartArea: false },
                                ticks: { color: '#f59e0b', font: { size: 9 } }
                            }
                        }
                    }
                });
            }
            const histClimateEl = document.getElementById('historyClimateChart');
            if(histClimateEl) {
                const hcCtx = histClimateEl.getContext('2d');
                historyClimateChart = new Chart(hcCtx, {
                    type: 'line',
                    data: { labels: [], datasets: [] },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        onClick: (_, elements) => {
                            if(!elements || !elements.length) return;
                            applyHistoryRecord(elements[0].index);
                        },
                        interaction: { mode: 'index', intersect: false },
                        plugins: { legend: { display: true, labels: { boxWidth: 8, font: { size: 9 } } } },
                        scales: {
                            x: { ticks: { autoSkip: true, maxTicksLimit: 12, maxRotation: 0, color: '#94a3b8', font: { size: 9 } } },
                            yTemp: {
                                type: 'linear',
                                position: 'left',
                                title: { display: true, text: '°C' },
                                ticks: { color: '#475569', font: { size: 9 } }
                            },
                            yHum: {
                                type: 'linear',
                                position: 'right',
                                min: 0,
                                max: 100,
                                title: { display: true, text: '% rF' },
                                grid: { drawOnChartArea: false },
                                ticks: { color: '#64748b', font: { size: 9 } }
                            }
                        }
                    }
                });
            }
        }
        function updateHX(p) {
            if(!hxChart) return;
            const pts = [ {x:App.vals.t1, y:PHY.abs(App.vals.t1,App.vals.h1,p)*PHY.dens(App.vals.t1,p)}, {x:App.vals.t2, y:PHY.abs(App.vals.t2,App.vals.h2,p)*PHY.dens(App.vals.t2,p)}, {x:App.vals.t3, y:PHY.abs(App.vals.t3,App.vals.h3,p)*PHY.dens(App.vals.t3,p)} ];
            const bg=[]; [10,20,30,40,50,60,70,80,90,100].forEach(rh=>{ const l=[]; for(let t=0;t<=40;t+=10) l.push({x:t, y:PHY.abs(t,rh,p)*PHY.dens(t,p)}); bg.push({data:l, borderColor: rh===50?'#64748b':(rh===100?'#334155':'#cbd5e1'), borderWidth:(rh===50||rh===100)?1.8:1.2, pointRadius:0, tension:0.4, isRhCurve:true, rhLabel:rh}); });
            bg.push({data:pts, borderColor:'#475569', borderWidth:2, pointBackgroundColor:['#3b82f6','#f59e0b','#10b981'], showLine:true});
            hxChart.data.datasets = bg; hxChart.update('none');
        }
        function updateFanChart() {
            if(!fanChart) return;
            syncFanUnitControls();
            const dP = App.fan.curve.map(c=>({x:toFanEditorUnit('flow', c.q), y:toFanEditorUnit('pressure', c.p)}));
            if((parseFloat(App.fan.pmax) || 0) > 0) {
                dP.push({x:0, y:toFanEditorUnit('pressure', App.fan.pmax), isPmax: true});
            }
            dP.sort((a,b)=>a.x-b.x);
            fanChart.data.datasets = [{data:dP, borderColor:'#3b82f6', tension:0.2, pointRadius:2}];
            fanChart.update();
        }

        // --- CSV & FAN MODAL ---
        function loadDefaultCSV() { fetch('607_Heuluefterliste_Bund_FAT.csv').then(r => r.text()).then(t => { parseCSV(t); }).catch(e => { console.log('DB load failed'); }); }
        function parseCSV(text) { App.fanDB = []; const rows = text.split('\n'); for(let i=1; i<rows.length; i++) { const c = rows[i].split(';'); if(c.length<10) continue; const labelCore = `${c[0]} ${c[3]}`.trim(); const model = c[1] ? c[1].trim() : ''; const kw = parseFloat(c[5]); const rpm = parseFloat(c[4]); const featureParts = []; if(model) featureParts.push(`Nr. ${model}`); if(Number.isFinite(kw)) featureParts.push(`${kw.toFixed(1).replace(/\.0$/, '')} kW`); if(Number.isFinite(rpm)) featureParts.push(`${Math.round(rpm)} rpm`); const suffix = featureParts.length ? ` (${featureParts.join(' | ')})` : ''; const f = { label: `${labelCore}${suffix}`, kw: kw, pmax: parseFloat(c[6]), pts: [] }; for(let p=2; p<=8; p++) { let iv=7+(p-2)*2; let ip=8+(p-2)*2; if(c[iv] && c[iv].trim()) f.pts.push({p:p, q:parseFloat(c[iv]), kw:parseFloat(c[ip])}); } App.fanDB.push(f); } }
        
        function openFanModal() {
            openHeucheckModal('luefter');
            syncFanUnitControls();
            updateFanChart();
            setTimeout(()=>document.getElementById('fan-search').focus(),100);
        }
        function closeFanModal() {
            closeHeucheckModal();
        }
        
        function filterFans(txt) {
            const list = document.getElementById('fan-results'); list.innerHTML='';
            if(!txt) { list.classList.add('hidden'); return; }
            filteredFans = App.fanDB.filter(f => f.label.toLowerCase().includes(txt.toLowerCase()));
            if(filteredFans.length > 0) list.classList.remove('hidden'); else list.classList.add('hidden');
            
            filteredFans.forEach((f, i) => {
                const d = document.createElement('div');
                d.className = "fan-item " + (i===selectedFanIndex ? "active" : "");
                d.innerText = f.label;
                d.onclick = () => { document.getElementById('fan-search').value = f.label; applyFanSelection(f); list.classList.add('hidden'); };
                list.appendChild(d);
            });
        }
        function handleFanKey(e) {
            const list = document.getElementById('fan-results');
            if(list.classList.contains('hidden')) return;
            if(e.key === 'ArrowDown') { selectedFanIndex = Math.min(selectedFanIndex+1, filteredFans.length-1); e.preventDefault(); }
            if(e.key === 'ArrowUp') { selectedFanIndex = Math.max(0, selectedFanIndex-1); e.preventDefault(); }
            if(e.key === 'Enter' && selectedFanIndex >= 0) { document.getElementById('fan-search').value = filteredFans[selectedFanIndex].label; applyFanSelection(filteredFans[selectedFanIndex]); list.classList.add('hidden'); e.preventDefault(); }
            renderFanList();
        }
        function renderFanList() {
            const rows = document.getElementById('fan-results').children;
            for(let i=0; i<rows.length; i++) {
                rows[i].className = "fan-item " + (i===selectedFanIndex ? "active" : "");
                if(i===selectedFanIndex) rows[i].scrollIntoView({block:'nearest'});
            }
        }
        function applyFanSelection(f) {
            App.fan.mode = 'curve'; App.fan.label = f.label; App.fan.autoScaleStandard = false; App.fan.kw = f.kw; App.fan.pmax = f.pmax; App.fan.curve = JSON.parse(JSON.stringify(f.pts)); 
            App.fan.flow = 0;
            syncFanUnitControls();
            updateFanChart(); renderCurveEditor();
            update();
            saveData();
        }

        // --- CURVE EDITOR ---
        function toggleCurveEditor() { document.getElementById('fan-curve-editor').classList.toggle('hidden'); }
        function renderCurveEditor() {
            const b = document.getElementById('curve-body'); b.innerHTML = '';
            App.fan.curve.sort((a,b)=>a.p-b.p).forEach((p, i) => {
                b.innerHTML += `<tr>
                    <td><input type="number" class="w-16 border rounded text-center" value="${formatFanEditorValue('pressure', p.p)}" onchange="updCurve(${i},'p',this.value)"></td>
                    <td><input type="number" class="w-16 border rounded text-center" value="${formatFanEditorValue('flow', p.q)}" onchange="updCurve(${i},'q',this.value)"></td>
                    <td><input type="number" class="w-10 border rounded text-center" value="${p.kw}" onchange="updCurve(${i},'kw',this.value)"></td>
                    <td><button class="text-red-500 font-bold px-1" onclick="remCurve(${i})">x</button></td>
                </tr>`;
            });
            if((parseFloat(App.fan.pmax) || 0) > 0) {
                b.innerHTML += `<tr class="bg-slate-100">
                    <td class="font-bold text-slate-700">${formatFanEditorValue('pressure', App.fan.pmax)}</td>
                    <td class="font-bold text-slate-700">${formatFanEditorValue('flow', 0)}</td>
                    <td class="text-slate-400">-</td>
                    <td class="text-slate-400">Pmax</td>
                </tr>`;
            }
        }
        function updCurve(i, k, v) {
            App.fan.autoScaleStandard = false;
            if(k === 'p') App.fan.curve[i][k] = fromFanEditorUnit('pressure', v);
            else if(k === 'q') App.fan.curve[i][k] = fromFanEditorUnit('flow', v);
            else App.fan.curve[i][k] = parseFloat(v);
            updateFanChart();
        }
        function remCurve(i) { App.fan.autoScaleStandard = false; App.fan.curve.splice(i, 1); renderCurveEditor(); updateFanChart(); }
        function addCurvePoint() { App.fan.autoScaleStandard = false; App.fan.curve.push({p:0,q:0,kw:0}); renderCurveEditor(); updateFanChart(); }

        // --- LAYERS  PERSIST ---
        function openLayersModal() {
            const list = document.getElementById('layers-list');
            const vis = document.getElementById('stock-vis');
            const areaInp = document.getElementById('inp-area');
            const stockHInp = document.getElementById('inp-stock-h');
            const densityOut = document.getElementById('stock-density');
            const kgTsOut = document.getElementById('stock-kgts');
            const stockHeightUsed = document.getElementById('stock-height-used');
            const stockHeightMode = document.getElementById('stock-height-mode');
            if(!list || !vis) return;
            if(areaInp) areaInp.value = App.area;
            if(stockHInp) stockHInp.value = App.stockHeightManual ? App.stockHeightManual.toFixed(1) : '';
            list.innerHTML=''; vis.innerHTML='';

            const totalHeightAuto = App.layers.reduce((sum, layer) => sum + (parseFloat(layer.h) || 0), 0);
            const effectiveHeight = App.stockHeightManual && App.stockHeightManual > 0 ? App.stockHeightManual : totalHeightAuto;
            const maxHeight = Math.max(2, Math.ceil(effectiveHeight * 2) / 2);
            let totalMassWetAuto = 0;
            let totalKgTsAuto = 0;

            App.layers.forEach((l,i)=>{
                const opt = DENS_OPTS.find(o=>o.id===l.type) || DENS_OPTS[1];
                const wetDensity = getLayerDensity(l);
                const layerVolume = (parseFloat(App.area) || 0) * (parseFloat(l.h) || 0);
                const layerWetKg = layerVolume * wetDensity;
                const layerKgTs = layerWetKg * ((parseFloat(l.ts) || 0) / 100);
                totalMassWetAuto += layerWetKg;
                totalKgTsAuto += layerKgTs;

                const row = document.createElement('div');
                row.className = "bg-white p-2 rounded shadow-sm border text-sm";
                row.innerHTML = `<div class="flex justify-between mb-1"><span class="font-bold text-slate-400">#${i+1}</span><button onclick="remLayer(${i})" class="text-red-500 font-bold px-2">x</button></div><div class="grid grid-cols-2 gap-2"><div><div class="text-[10px] text-slate-400 mb-0.5">Typ</div><select class="w-full border rounded p-1 text-xs" onchange="updLayer(${i},'type',this.value)">${DENS_OPTS.map(o=>`<option value="${o.id}" ${o.id==l.type?'selected':''}>${o.l}</option>`).join('')}</select></div><div><div class="text-[10px] text-slate-400 mb-0.5">Höhe</div><div class="relative"><input type="number" step="0.1" value="${l.h}" class="w-full border rounded p-1 pr-6" onchange="updLayer(${i},'h',this.value)"><span class="absolute right-2 top-1 text-xs text-slate-400">m</span></div></div><div><div class="text-[10px] text-slate-400 mb-0.5">TS</div><div class="relative"><input type="number" value="${l.ts}" class="w-full border rounded p-1 pr-7" onchange="updLayer(${i},'ts',this.value)"><span class="absolute right-2 top-1 text-xs text-slate-400">%</span></div></div><div><div class="flex items-center justify-between text-[10px] text-slate-400 mb-0.5"><span>Dichte (Richtwert FS, überschreibbar)</span><button onclick="${l.densManual ? `resetLayerDensity(${i})` : ''}" ${l.densManual ? '' : 'disabled'} class="text-blue-500 font-bold ${l.densManual ? '' : 'opacity-40 cursor-not-allowed'}">Reset</button></div><div class="relative"><input type="number" value="${wetDensity.toFixed(0)}" class="w-full border rounded p-1 pr-10" onchange="updLayer(${i},'dens',this.value)"><span class="absolute right-2 top-1 text-xs text-slate-400">kg FS/m³</span></div></div></div>`;
                list.appendChild(row);
            });

            const ruler = document.createElement('div');
            ruler.className = 'w-10 relative border-r border-slate-200 mr-2';
            for(let meter = 0; meter <= maxHeight + 0.001; meter += 0.5) {
                const tick = document.createElement('div');
                const pct = (meter / maxHeight) * 100;
                tick.className = 'absolute right-0 flex items-center gap-1';
                tick.style.bottom = `${pct}%`;
                const isFull = Math.abs(meter % 1) < 0.001;
                tick.innerHTML = `<span class="text-[10px] text-slate-400 w-7 text-right">${isFull ? meter.toFixed(0) : meter.toFixed(1)}</span><span class="h-px ${isFull ? 'w-3' : 'w-2'} bg-slate-400"></span>`;
                ruler.appendChild(tick);
            }

            const stack = document.createElement('div');
            stack.className = 'flex-1 flex flex-col-reverse gap-1 min-h-[180px] border rounded bg-slate-50 p-1';
            App.layers.forEach(l => {
                const wetDensity = getLayerDensity(l);
                const layerHeightPx = Math.max(14, ((parseFloat(l.h) || 0) / Math.max(0.1, effectiveHeight)) * 180);
                const bar = document.createElement('div');
                bar.className = `rounded p-1 text-[10px] leading-tight text-white font-bold ${l.ts<60?'bg-blue-500':(l.ts<80?'bg-amber-500':'bg-emerald-500')}`;
                bar.style.height = `${layerHeightPx}px`;
                bar.innerHTML = `<div>${(parseFloat(l.h)||0).toFixed(1)} m · ${Math.round(l.ts||0)}% TS</div><div class="opacity-90">ca. ${wetDensity.toFixed(0)} kg FS/m³</div>`;
                stack.appendChild(bar);
            });

            const visWrap = document.createElement('div');
            visWrap.className = 'flex items-stretch';
            visWrap.appendChild(ruler);
            visWrap.appendChild(stack);
            vis.appendChild(visWrap);

            const scale = totalHeightAuto > 0 && effectiveHeight > 0 ? (effectiveHeight / totalHeightAuto) : 1;
            const totalMassWet = totalMassWetAuto * scale;
            const totalKgTs = totalKgTsAuto * scale;
            const avgDensity = totalMassWet > 0 && App.area > 0 && effectiveHeight > 0 ? (totalMassWet / (App.area * effectiveHeight)) : 0;
            if(densityOut) densityOut.innerText = avgDensity > 0 ? avgDensity.toFixed(0) : '-';
            if(kgTsOut) kgTsOut.innerText = totalKgTs > 0 ? (totalKgTs / 100).toFixed(1) : '0.0';
            if(stockHeightUsed) stockHeightUsed.innerText = effectiveHeight > 0 ? effectiveHeight.toFixed(1) : '0.0';
            if(stockHeightMode) stockHeightMode.innerText = App.stockHeightManual && App.stockHeightManual > 0 ? '(manuell)' : '(auto aus Schichten)';
        }
        function addLayer(){ App.layers.push({h:1.0, ts:60, type:'loose_m', dens:80, densManual:false}); openLayersModal(); update(); saveData(); }
        function remLayer(i){ App.layers.splice(i,1); openLayersModal(); update(); saveData(); }
        function updLayer(i,k,v){
            if(k === 'type') {
                App.layers[i].type = v;
                if(!App.layers[i].densManual) {
                    const opt = DENS_OPTS.find(o=>o.id===v) || DENS_OPTS[1];
                    App.layers[i].dens = opt.d;
                }
            } else if(k === 'dens') {
                const densVal = parseFloat(v);
                App.layers[i].dens = Number.isFinite(densVal) && densVal > 0 ? densVal : getLayerDensity(App.layers[i]);
                App.layers[i].densManual = true;
            } else {
                App.layers[i][k] = parseFloat(v);
            }
            openLayersModal(); update(); saveData();
        }
        function resetLayerDensity(i) {
            const layer = App.layers[i];
            if(!layer) return;
            const opt = DENS_OPTS.find(o=>o.id===layer.type) || DENS_OPTS[1];
            layer.dens = opt.d;
            layer.densManual = false;
            openLayersModal();
            update();
            saveData();
        }
        function saveFan() {
            const mFlow = fromFanEditorUnit('flow', document.getElementById('inp-fan-flow').value);
            const mPmax = fromFanEditorUnit('pressure', document.getElementById('inp-fan-pmax').value);
            App.fan.autoScaleStandard = false;
            if(mFlow > 0) { App.fan.mode='simple'; App.fan.flow=mFlow; App.fan.curve=[]; }
            if(mPmax > 0) App.fan.pmax = mPmax;
            syncFanUnitControls();
            update();
            saveData();
        }

        function loadData() {
            try {
                const d = JSON.parse(localStorage.getItem('agff_mob_pro_v10'));
                if(d && typeof d === 'object') {
                    if(d.params && typeof d.params === 'object') App.params = {...App.params, ...d.params};
                    if(d.ui && typeof d.ui === 'object') App.ui = {...App.ui, ...d.ui};
                    if(typeof d.area === 'number' && Number.isFinite(d.area)) App.area = d.area;
                    if(typeof d.flowSpec === 'number' && Number.isFinite(d.flowSpec) && d.flowSpec >= 0) {
                        App.flowSpec = d.flowSpec;
                    } else if(d.fan && typeof d.fan === 'object' && typeof d.fan.flow === 'number' && Number.isFinite(d.fan.flow) && App.area > 0) {
                        App.flowSpec = Math.max(0, d.fan.flow / App.area);
                    }
                    if(typeof d.stockHeightManual === 'number' && Number.isFinite(d.stockHeightManual) && d.stockHeightManual > 0) App.stockHeightManual = d.stockHeightManual;
                    if(d.fan && typeof d.fan === 'object') App.fan = {...App.fan, ...d.fan};
                    if(typeof App.fan.autoScaleStandard !== 'boolean') {
                        App.fan.autoScaleStandard = (App.fan.label || 'Standard') === 'Standard' && App.fan.mode !== 'simple';
                    }
                    if(Array.isArray(d.layers) && d.layers.length) App.layers = d.layers;
                    if(d.history && typeof d.history === 'object') {
                        App.history = {
                            auto: !!d.history.auto,
                            records: Array.isArray(d.history.records) ? d.history.records : []
                        };
                    }
                }
            } catch(e) {}

            App.layers = App.layers.map(layer => {
                const opt = DENS_OPTS.find(o=>o.id===layer.type) || DENS_OPTS[1];
                const densVal = parseFloat(layer.dens);
                const hasManual = layer.densManual === true;
                return {
                    ...layer,
                    dens: Number.isFinite(densVal) && densVal > 0 ? densVal : opt.d,
                    densManual: hasManual
                };
            });

            const areaInp = document.getElementById('inp-area');
            if(areaInp) areaInp.value = App.area;

            const altInp = document.getElementById('inp-alt');
            const priceInp = document.getElementById('inp-price');
            const heatInp = document.getElementById('inp-price-heat');
            if(altInp) altInp.value = App.params.alt;
            if(priceInp) priceInp.value = App.params.price;
            if(heatInp) heatInp.value = App.params.priceHeat;
        }
        function saveParams() { App.params.alt = parseFloat(document.getElementById('inp-alt').value); App.params.price = parseFloat(document.getElementById('inp-price').value); App.params.priceHeat = parseFloat(document.getElementById('inp-price-heat').value); update(); saveData(); }
        function saveData() {
            App.ui.lang = I18N_LANG;
            localStorage.setItem('agff_mob_pro_v10', JSON.stringify(App));
        }

        async function evaporationApi(payload) {
            const response = await fetch('api/evaporation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await response.json();
            if(!response.ok) {
                throw new Error(data.message || 'Evaporation API error');
            }
            return data;
        }

        window.DryWatchApi = {
            evaporation: evaporationApi
        };
        window.DryCalcApi = window.DryWatchApi;
