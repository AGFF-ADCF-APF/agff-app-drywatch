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
                channel_speed_min: 3.0,
                channel_speed_max: 4.0,
                channel_speed_limit: 5.0,
                intake_speed_ref: 4.0,
                intake_speed_min: 3.0,
                intake_speed_max: 5.0,
                intake_speed_limit: 6.0,
                supply_speed_ref: 10.0,
                supply_speed_min: 8.0,
                supply_speed_max: 12.0,
                supply_speed_limit: 14.0,
                roof_speed_min: 4.0,
                roof_speed_max: 6.0,
                eff_good: 50,
                eff_warn: 30,
                water_min_main: 0.5,
                kittl_grate_table: [
                    { area: 40, grateCm: 41 }, { area: 50, grateCm: 43 }, { area: 60, grateCm: 44 },
                    { area: 70, grateCm: 46 }, { area: 80, grateCm: 47 }, { area: 90, grateCm: 49 },
                    { area: 100, grateCm: 50 }, { area: 110, grateCm: 52 }, { area: 120, grateCm: 53 },
                    { area: 130, grateCm: 55 }, { area: 140, grateCm: 56 }, { area: 150, grateCm: 58 },
                    { area: 160, grateCm: 59 }, { area: 170, grateCm: 61 }, { area: 180, grateCm: 63 },
                    { area: 190, grateCm: 64 }, { area: 200, grateCm: 66 }, { area: 210, grateCm: 67 },
                    { area: 220, grateCm: 69 }, { area: 230, grateCm: 70 }, { area: 240, grateCm: 72 },
                    { area: 250, grateCm: 73 }, { area: 260, grateCm: 75 }, { area: 270, grateCm: 76 },
                    { area: 280, grateCm: 78 }, { area: 290, grateCm: 79 }, { area: 300, grateCm: 81 }
                ]
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
            params: { alt: 600, pressure: 942, price: 25, priceHeat: 10 },
            layers: [{ h: 2.0, ts: 60, type: 'loose_m', dens: 80, densManual: false }],
            fan: { mode: 'curve', label: 'Standard', autoScaleStandard: true, flow: 0, pmax: 12.2, kw: 9.5, curve: [{p:2,q:12.7,kw:7.2},{p:3,q:12.1,kw:8.0},{p:4,q:11.6,kw:8.7},{p:5,q:10.8,kw:9.4},{p:6,q:10.1,kw:9.9},{p:7,q:9.4,kw:10.4},{p:8,q:8.7,kw:10.8}] },
            flags: { fanConfigured: false, storageConfigured: false },
            history: { auto: false, records: [] },
            ui: { lang: 'de' },
            lastMetrics: null,
            area: 100, flowSpec: 0.11, flowSpecTarget: 0.11, stockHeightManual: null, grateHeightCm: 0, grateHeightAuto: true, airChannels: { intakeAreaM2: null, supplyAreaM2: null, roofOpenWidthAM: null, roofOpenWidthBM: null, roofOpenLengthAM: null, roofOpenLengthBM: null, roofLengthAM: null, roofLengthBM: null, roofContactLengthAM: null, roofContactLengthBM: null, roofCustomAreaM2: null, roofHeightCm: null, roofAzimutADeg: 180, roofTiltADeg: 30, roofAzimutBDeg: 0, roofTiltBDeg: 30, roofMaterial: 'tile_dark' }, fanDB: [], useMeas: false, pressureModeAutoApplied: false,
                        systemExtras: { roofExhaust: false, conditioningUnit: false },
                        storages: [{ id: 1, name: '', area: 100, flowSpecTarget: 0.11, stockHeightManual: null, grateHeightCm: 0, grateHeightAuto: true, airChannels: { intakeAreaM2: null, supplyAreaM2: null }, layers: [{ h: 2.0, ts: 60, type: 'loose_m', dens: 80, densManual: false }], systemExtras: { roofExhaust: false, conditioningUnit: false }, storageConfigured: false }],
                        activeStorageId: 1,
                        nextStorageId: 2
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
            const SYSTEM_PRESSURE_SURCHARGES_PA = { roofExhaust: 120, conditioningUnit: 190 };
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
        let areaStepTimer, areaStepDelay;
        let flowSpecStepTimer, flowSpecStepDelay;
        let historyAutoKeyLast = '';
        let historySelectedIndex = -1;
        let historyZoomLevel = 1;
        let historyZoomPreset = 'one-to-one';
        let historyManualWindow = null;
        let simEnabled = false;
        let simMemory = { heat: 0, dehum: 0 };
        let simBaselineAir = null;
        const USAGE_CALC_COUNT_KEY = 'agff_evap_calc_count_v1';
        let usageCalcCount = 0;
        let usageCalcCountedThisLoad = false;
        const fanEditorUnitState = { pressure: 'mbar', flow: 'm3s' };

        function renderUsageCalcCount() {
            const el = document.getElementById('usage-calc-counter');
            if(!el) return;
            el.innerText = `Verdunstungs-Berechnungen: ${usageCalcCount}`;
        }

        function initUsageCalcCount() {
            const parsed = parseInt(localStorage.getItem(USAGE_CALC_COUNT_KEY) || '0', 10);
            usageCalcCount = Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
            usageCalcCountedThisLoad = false;
            renderUsageCalcCount();
        }

        function registerUsageCalc() {
            if(usageCalcCountedThisLoad) return;
            usageCalcCountedThisLoad = true;
            usageCalcCount += 1;
            localStorage.setItem(USAGE_CALC_COUNT_KEY, String(usageCalcCount));
            renderUsageCalcCount();
        }

        function bindUsageCalcTracking() {
            const handler = (event) => {
                const target = event.target;
                if(!(target instanceof HTMLElement)) return;
                const id = target.id || '';
                const isRelevant = /^((t|h)[123]-in|flow-spec-in|sim-(dehum|heat)|check-adiabatic|p-unit|inp-)/.test(id);
                if(isRelevant) registerUsageCalc();
            };
            document.addEventListener('input', handler, true);
            document.addEventListener('change', handler, true);
        }

        const DEFAULT_APP_STATE = {
            vals: { t1: 20, h1: 60, t2: 20, h2: 60, t3: 15, h3: 90 },
            sim: { heat: 0, dehum: 0 },
            params: { alt: 600, pressure: 942, price: 25, priceHeat: 10 },
            layers: [{ h: 2.0, ts: 60, type: 'loose_m', dens: 80, densManual: false }],
            fan: { mode: 'curve', label: 'Standard', autoScaleStandard: true, flow: 0, pmax: 12.2, kw: 9.5, curve: [{p:2,q:12.7,kw:7.2},{p:3,q:12.1,kw:8.0},{p:4,q:11.6,kw:8.7},{p:5,q:10.8,kw:9.4},{p:6,q:10.1,kw:9.9},{p:7,q:9.4,kw:10.4},{p:8,q:8.7,kw:10.8}] }, 
            flags: { fanConfigured: false, storageConfigured: false },
            history: { auto: false, records: [] },
            ui: { lang: 'de' },
            area: 100,
            flowSpec: 0.11,
            flowSpecTarget: 0.11,
            stockHeightManual: null,
            grateHeightCm: 0,
            grateHeightAuto: true,
            airChannels: { intakeAreaM2: null, supplyAreaM2: null, roofOpenWidthAM: null, roofOpenWidthBM: null, roofOpenLengthAM: null, roofOpenLengthBM: null, roofLengthAM: null, roofLengthBM: null, roofContactLengthAM: null, roofContactLengthBM: null, roofCustomAreaM2: null, roofHeightCm: null, roofAzimutADeg: 180, roofTiltADeg: 30, roofAzimutBDeg: 0, roofTiltBDeg: 30, roofMaterial: 'tile_dark' },
            useMeas: false,
            pressureModeAutoApplied: false,
            systemExtras: { roofExhaust: false, conditioningUnit: false },
            storages: [{ id: 1, name: '', area: 100, flowSpecTarget: 0.11, stockHeightManual: null, grateHeightCm: 0, grateHeightAuto: true, airChannels: { intakeAreaM2: null, supplyAreaM2: null }, layers: [{ h: 2.0, ts: 60, type: 'loose_m', dens: 80, densManual: false }], systemExtras: { roofExhaust: false, conditioningUnit: false }, storageConfigured: false }],
            activeStorageId: 1,
            nextStorageId: 2
        };

        const I18N_SUPPORTED = ['de', 'fr', 'it', 'en', 'rm'];
        let I18N_LANG = 'de';
        let I18N_DICT = {};

        function createStorageProfile(id) {
            return {
                id,
                name: '',
                area: DEFAULT_APP_STATE.area,
                flowSpecTarget: DEFAULT_APP_STATE.flowSpecTarget,
                stockHeightManual: DEFAULT_APP_STATE.stockHeightManual,
                grateHeightCm: DEFAULT_APP_STATE.grateHeightCm,
                grateHeightAuto: true,
                airChannels: JSON.parse(JSON.stringify(DEFAULT_APP_STATE.airChannels)),
                layers: JSON.parse(JSON.stringify(DEFAULT_APP_STATE.layers)),
                systemExtras: JSON.parse(JSON.stringify(DEFAULT_APP_STATE.systemExtras)),
                storageConfigured: false
            };
        }
        function getStorageOrderIndex(storageId) {
            return Math.max(0, (App.storages || []).findIndex(storage => String(storage.id) === String(storageId)));
        }
        function getStorageDisplayName(storageId) {
            const storage = (App.storages || []).find(item => String(item.id) === String(storageId));
            const customName = (storage?.name || '').toString().trim();
            if(customName) return customName;
            const index = getStorageOrderIndex(storageId) + 1;
            return `${t('nav.fodder', 'Futterlager')} ${index}`;
        }
        function updateHeucheckStorageHeader() {
            const titleEl = document.getElementById('heucheck-storage-title');
            if(!titleEl) return;
            titleEl.innerText = `${t('nav.fodder', 'Futterlager')}: ${getStorageDisplayName(App.activeStorageId)}`;
        }
        function getActiveStorageProfile() {
            if(!Array.isArray(App.storages) || !App.storages.length) return null;
            const found = App.storages.find(storage => String(storage.id) === String(App.activeStorageId));
            return found || App.storages[0];
        }
        function syncCurrentStateToActiveStorage() {
            const storage = getActiveStorageProfile();
            if(!storage) return;
            storage.area = Math.max(1, parseFloat(App.area) || 1);
            storage.flowSpecTarget = Math.max(0, parseFloat(App.flowSpecTarget) || 0);
            storage.stockHeightManual = Number.isFinite(parseFloat(App.stockHeightManual)) && parseFloat(App.stockHeightManual) > 0 ? parseFloat(App.stockHeightManual) : null;
            storage.grateHeightCm = Math.max(0, parseFloat(App.grateHeightCm) || 0);
            storage.grateHeightAuto = App.grateHeightAuto !== false;
            storage.airChannels = JSON.parse(JSON.stringify(App.airChannels || DEFAULT_APP_STATE.airChannels));
            storage.layers = JSON.parse(JSON.stringify(Array.isArray(App.layers) ? App.layers : []));
            storage.systemExtras = JSON.parse(JSON.stringify(App.systemExtras || DEFAULT_APP_STATE.systemExtras));
            storage.storageConfigured = App.flags?.storageConfigured === true;
        }
        function applyStorageProfileToState(storage) {
            if(!storage) return;
            App.area = Math.max(1, parseFloat(storage.area) || 1);
            App.flowSpecTarget = Math.max(0, parseFloat(storage.flowSpecTarget) || 0);
            App.stockHeightManual = Number.isFinite(parseFloat(storage.stockHeightManual)) && parseFloat(storage.stockHeightManual) > 0 ? parseFloat(storage.stockHeightManual) : null;
            App.grateHeightCm = Math.max(0, parseFloat(storage.grateHeightCm) || 0);
            App.grateHeightAuto = storage.grateHeightAuto !== false;
            App.airChannels = JSON.parse(JSON.stringify(storage.airChannels || DEFAULT_APP_STATE.airChannels));
            App.layers = JSON.parse(JSON.stringify(Array.isArray(storage.layers) && storage.layers.length ? storage.layers : DEFAULT_APP_STATE.layers));
            App.systemExtras = JSON.parse(JSON.stringify(storage.systemExtras || DEFAULT_APP_STATE.systemExtras));
            App.flags.storageConfigured = storage.storageConfigured === true;
            applyAutoGrateHeightByArea();
        }
        function ensureStorageProfiles() {
            if(!Array.isArray(App.storages) || !App.storages.length) {
                const legacyStorage = createStorageProfile(1);
                legacyStorage.area = Math.max(1, parseFloat(App.area) || DEFAULT_APP_STATE.area);
                legacyStorage.flowSpecTarget = Math.max(0, parseFloat(App.flowSpecTarget) || parseFloat(App.flowSpec) || DEFAULT_APP_STATE.flowSpecTarget);
                legacyStorage.stockHeightManual = Number.isFinite(parseFloat(App.stockHeightManual)) && parseFloat(App.stockHeightManual) > 0 ? parseFloat(App.stockHeightManual) : null;
                legacyStorage.grateHeightCm = Math.max(0, parseFloat(App.grateHeightCm) || 0);
                legacyStorage.grateHeightAuto = App.grateHeightAuto !== false && legacyStorage.grateHeightCm <= 0;
                legacyStorage.airChannels = JSON.parse(JSON.stringify(App.airChannels || DEFAULT_APP_STATE.airChannels));
                legacyStorage.layers = JSON.parse(JSON.stringify(Array.isArray(App.layers) && App.layers.length ? App.layers : DEFAULT_APP_STATE.layers));
                legacyStorage.systemExtras = JSON.parse(JSON.stringify(App.systemExtras || DEFAULT_APP_STATE.systemExtras));
                legacyStorage.storageConfigured = App.flags?.storageConfigured === true;
                App.storages = [legacyStorage];
                App.activeStorageId = legacyStorage.id;
                App.nextStorageId = 2;
            }
            if(!Number.isFinite(parseInt(App.nextStorageId, 10))) {
                App.nextStorageId = (App.storages || []).reduce((maxId, storage) => Math.max(maxId, parseInt(storage.id, 10) || 0), 0) + 1;
            }
            App.storages = (App.storages || []).map(storage => ({
                ...storage,
                name: typeof storage?.name === 'string' ? storage.name : ''
            }));
            const active = getActiveStorageProfile();
            if(active) {
                App.activeStorageId = active.id;
                applyStorageProfileToState(active);
            }
        }
        function renderStorageSwitcher() {
            const titleEl = document.getElementById('active-storage-title');
            const historyTitleEl = document.getElementById('history-active-storage-title');
            const switcher = document.getElementById('storage-switcher');
            if(titleEl) titleEl.innerText = getStorageDisplayName(App.activeStorageId);
            if(historyTitleEl) historyTitleEl.innerText = getStorageDisplayName(App.activeStorageId);
            updateHeucheckStorageHeader();
            if(!switcher) return;
            switcher.innerHTML = '';
            (App.storages || []).forEach(storage => {
                const btn = document.createElement('button');
                const active = String(storage.id) === String(App.activeStorageId);
                btn.className = `h-5 min-w-[20px] rounded-md border px-1 text-[10px] font-black ${active ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300 bg-white text-slate-600'}`;
                btn.innerText = String(getStorageOrderIndex(storage.id) + 1);
                btn.onclick = () => activateStorage(storage.id);
                switcher.appendChild(btn);
            });
            const addBtn = document.createElement('button');
            addBtn.className = 'h-5 min-w-[20px] rounded-md border border-emerald-300 bg-emerald-50 px-1 text-[10px] font-black text-emerald-700';
            addBtn.innerText = '+';
            addBtn.title = t('settings.add_storage', 'Futterlager hinzufügen');
            addBtn.onclick = () => addStorageProfile();
            switcher.appendChild(addBtn);
            renderHistoryStorageSwitcher();
        }
        function renderHistoryStorageSwitcher() {
            const switcher = document.getElementById('history-storage-switcher');
            if(!switcher) return;
            switcher.innerHTML = '';
            (App.storages || []).forEach(storage => {
                const btn = document.createElement('button');
                const active = String(storage.id) === String(App.activeStorageId);
                btn.className = `h-5 min-w-[20px] rounded-md border px-1 text-[10px] font-black ${active ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300 bg-white text-slate-600'}`;
                btn.innerText = String(getStorageOrderIndex(storage.id) + 1);
                btn.title = getStorageDisplayName(storage.id);
                btn.onclick = () => activateStorage(storage.id);
                switcher.appendChild(btn);
            });
            const addBtn = document.createElement('button');
            addBtn.className = 'h-5 min-w-[20px] rounded-md border border-emerald-300 bg-emerald-50 px-1 text-[10px] font-black text-emerald-700';
            addBtn.innerText = '+';
            addBtn.title = t('settings.add_storage', 'Futterlager hinzufügen');
            addBtn.onclick = () => addStorageProfile();
            switcher.appendChild(addBtn);
        }
        function renderStorageSettingsList() {
            const list = document.getElementById('storage-settings-list');
            if(!list) return;
            list.innerHTML = '';
            (App.storages || []).forEach(storage => {
                const row = document.createElement('div');
                row.className = 'rounded-lg border border-slate-200 bg-white px-3 py-2';
                const relatedCount = (App.history?.records || []).filter(record => String(record?.futterlager?.storage_id || '') === String(storage.id)).length;
                row.innerHTML = `<div class="flex items-start justify-between gap-3"><div class="min-w-0 flex-1"><div class="text-sm font-bold text-slate-800">${t('nav.fodder', 'Futterlager')} ${getStorageOrderIndex(storage.id) + 1}</div><div class="text-[11px] text-slate-500">${relatedCount} ${t('settings.storage_records', 'Aufzeichnungen')}</div></div></div>`;
                const inputWrap = document.createElement('div');
                inputWrap.className = 'mt-1.5';
                const nameInput = document.createElement('input');
                nameInput.type = 'text';
                nameInput.className = 'w-full rounded-md border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-700';
                nameInput.placeholder = t('settings.storage_name_placeholder', 'Optionaler Name, z.B. Heustock Nord');
                nameInput.value = (storage?.name || '').toString();
                nameInput.oninput = (event) => renameStorageProfile(storage.id, event?.target?.value || '');
                inputWrap.appendChild(nameInput);
                row.appendChild(inputWrap);
                const deleteBtn = document.createElement('button');
                deleteBtn.className = `rounded-lg border px-2 py-1 text-[11px] font-bold ${App.storages.length <= 1 ? 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400' : 'border-red-200 bg-red-50 text-red-700'}`;
                deleteBtn.disabled = App.storages.length <= 1;
                deleteBtn.innerText = t('settings.delete_storage', 'Löschen');
                deleteBtn.onclick = () => confirmDeleteStorage(storage.id);
                const actionRow = row.querySelector('div.flex');
                if(actionRow) actionRow.appendChild(deleteBtn);
                list.appendChild(row);
            });
        }
        function renameStorageProfile(storageId, rawName) {
            const storage = (App.storages || []).find(item => String(item.id) === String(storageId));
            if(!storage) return;
            storage.name = (rawName || '').toString().trim();
            renderStorageSwitcher();
            updateHeucheckStorageHeader();
            saveData();
        }
        function activateStorage(storageId) {
            syncCurrentStateToActiveStorage();
            const target = (App.storages || []).find(storage => String(storage.id) === String(storageId));
            if(!target) return;
            App.activeStorageId = target.id;
            applyStorageProfileToState(target);
            renderStorageSwitcher();
            renderStorageSettingsList();
            update();
            updateHistoryChart();
            updateHistoryClimateChart();
            renderHistoryTable();
            updateHistorySelectionUI();
            saveData();
        }
        function addStorageProfile() {
            syncCurrentStateToActiveStorage();
            if(!Array.isArray(App.storages)) App.storages = [];
            const storage = createStorageProfile(App.nextStorageId || ((App.storages.length || 0) + 1));
            App.nextStorageId = (parseInt(storage.id, 10) || 0) + 1;
            App.storages.push(storage);
            App.activeStorageId = storage.id;
            applyStorageProfileToState(storage);
            renderStorageSwitcher();
            renderStorageSettingsList();
            update();
            updateHistoryChart();
            updateHistoryClimateChart();
            renderHistoryTable();
            updateHistorySelectionUI();
            saveData();
            openHeucheckModal('lager');
        }
        function confirmDeleteStorage(storageId) {
            if(!Array.isArray(App.storages) || App.storages.length <= 1) return;
            const relatedCount = (App.history?.records || []).filter(record => String(record?.futterlager?.storage_id || '') === String(storageId)).length;
            const msg = `${getStorageDisplayName(storageId)}: ${t('settings.delete_storage_confirm', 'Wirklich löschen? Zugehörige Aufzeichnungen werden ebenfalls entfernt.')} (${relatedCount} ${t('settings.storage_records', 'Aufzeichnungen')})`;
            if(!window.confirm(msg)) return;
            App.storages = App.storages.filter(storage => String(storage.id) !== String(storageId));
            if(App.history && Array.isArray(App.history.records)) {
                App.history.records = App.history.records.filter(record => String(record?.futterlager?.storage_id || '') !== String(storageId));
            }
            historySelectedIndex = Math.min(historySelectedIndex, (App.history?.records || []).length - 1);
            const nextStorage = getActiveStorageProfile() || App.storages[0];
            App.activeStorageId = nextStorage.id;
            applyStorageProfileToState(nextStorage);
            renderStorageSwitcher();
            renderStorageSettingsList();
            updateHistoryChart();
            updateHistoryClimateChart();
            renderHistoryTable();
            updateHistorySelectionUI();
            update();
            saveData();
        }
        function openSettingsModal() {
            syncCurrentStateToActiveStorage();
            renderStorageSettingsList();
            openDialogById('params-modal');
        }

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
        function defaultPressureForAltitude(altitude) {
            const safeAltitude = Number.isFinite(parseFloat(altitude)) ? parseFloat(altitude) : 0;
            return Math.round(PHY.p(safeAltitude));
        }
        function getAmbientPressure() {
            const pressure = parseFloat(App.params?.pressure);
            if(Number.isFinite(pressure) && pressure > 0) return pressure;
            return defaultPressureForAltitude(App.params?.alt);
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
            renderStorageSwitcher();
            renderStorageSettingsList();
            updateHistoryChart();
            updateHistoryClimateChart();
            renderHistoryTable();
            updateHistorySelectionUI();
            initGuidelineLabels();
        }

        window.setLanguage = setLanguage;

        const WEATHER_COORDS_KEY = 'agff_weather_coords_v1';

        function getCachedWeatherCoords() {
            try {
                const raw = localStorage.getItem(WEATHER_COORDS_KEY);
                if(!raw) return null;
                const parsed = JSON.parse(raw);
                const lat = parseFloat(parsed?.lat);
                const lon = parseFloat(parsed?.lon);
                if(!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
                return { lat, lon };
            } catch(_) {
                return null;
            }
        }

        function saveCachedWeatherCoords(lat, lon) {
            if(!Number.isFinite(lat) || !Number.isFinite(lon)) return;
            localStorage.setItem(WEATHER_COORDS_KEY, JSON.stringify({ lat, lon, ts: Date.now() }));
        }

        function getCurrentPositionAsync(options) {
            return new Promise((resolve, reject) => {
                if(!navigator.geolocation) {
                    reject(new Error('Geolocation not supported'));
                    return;
                }
                navigator.geolocation.getCurrentPosition(resolve, reject, options);
            });
        }

        async function resolveWeatherCoords() {
            const cached = getCachedWeatherCoords();
            try {
                const pos = await getCurrentPositionAsync({
                    enableHighAccuracy: false,
                    timeout: 4500,
                    maximumAge: 15 * 60 * 1000
                });
                const lat = parseFloat(pos?.coords?.latitude);
                const lon = parseFloat(pos?.coords?.longitude);
                if(!Number.isFinite(lat) || !Number.isFinite(lon)) throw new Error('Invalid coordinates');
                saveCachedWeatherCoords(lat, lon);
                return { lat, lon };
            } catch(err) {
                if(cached) return cached;
                throw err;
            }
        }

        async function fetchWeatherForCoords(lat, lon) {
            const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m`;
            const response = await fetch(url, { cache: 'no-store' });
            if(!response.ok) throw new Error('Weather request failed');
            const payload = await response.json();
            const tNow = parseFloat(payload?.current?.temperature_2m);
            const hNow = parseFloat(payload?.current?.relative_humidity_2m);
            if(!Number.isFinite(tNow) || !Number.isFinite(hNow)) throw new Error('Weather payload invalid');
            return { tNow, hNow };
        }

        function setWeatherFetchStatus(message = '', tone = 'neutral', autoHideMs = 0) {
            const el = document.getElementById('fetch-weather-status');
            if(!el) return;
            if(!message) {
                el.classList.add('hidden');
                el.innerText = '';
                el.classList.remove('text-slate-500', 'text-blue-600', 'text-emerald-600', 'text-red-600', 'text-amber-600');
                return;
            }
            el.innerText = message;
            el.classList.remove('hidden');
            el.classList.remove('text-slate-500', 'text-blue-600', 'text-emerald-600', 'text-red-600', 'text-amber-600');
            if(tone === 'loading') el.classList.add('text-blue-600');
            else if(tone === 'success') el.classList.add('text-emerald-600');
            else if(tone === 'error') el.classList.add('text-red-600');
            else if(tone === 'warn') el.classList.add('text-amber-600');
            else el.classList.add('text-slate-500');
            if(autoHideMs > 0) {
                window.setTimeout(() => {
                    if(el.innerText === message) setWeatherFetchStatus('');
                }, autoHideMs);
            }
        }

        async function handleFetchWeather() {
            guideStep(3);
            const btn = document.getElementById('fetch-weather');
            if(btn?.dataset?.busy === '1') return;
            if(btn) {
                btn.dataset.busy = '1';
                btn.setAttribute('aria-busy', 'true');
                btn.classList.add('opacity-70');
            }
            setWeatherFetchStatus(t('weather.status.locating', 'Standort wird ermittelt ...'), 'loading');
            try {
                const coords = await resolveWeatherCoords();
                setWeatherFetchStatus(t('weather.status.loading', 'Meteodaten werden geladen ...'), 'loading');
                const weather = await fetchWeatherForCoords(coords.lat, coords.lon);
                manualInput('t1', weather.tNow);
                manualInput('h1', weather.hNow);
                setWeatherFetchStatus(t('weather.status.updated', 'Meteodaten aktualisiert'), 'success', 2200);
            } catch(err) {
                console.warn('Weather fetch failed', err);
                const code = parseInt(err?.code, 10);
                if(code === 1) setWeatherFetchStatus(t('weather.status.geo_denied', 'Standortfreigabe abgelehnt'), 'warn', 4000);
                else if(code === 3) setWeatherFetchStatus(t('weather.status.geo_timeout', 'Standort-Timeout, bitte erneut tippen'), 'warn', 4000);
                else setWeatherFetchStatus(t('weather.status.failed', 'Meteodaten konnten nicht geladen werden'), 'error', 4000);
            } finally {
                if(btn) {
                    btn.dataset.busy = '0';
                    btn.setAttribute('aria-busy', 'false');
                    btn.classList.remove('opacity-70');
                }
            }
        }

        window.onload = async () => {
            lucide.createIcons();
            loadData();
            initUsageCalcCount();
            bindUsageCalcTracking();
            simMemory = {
                heat: Number.isFinite(parseFloat(App.sim?.heat)) ? parseFloat(App.sim.heat) : 0,
                dehum: Number.isFinite(parseFloat(App.sim?.dehum)) ? parseFloat(App.sim.dehum) : 0
            };
            simEnabled = false;
            const langFromStorage = _normalizeLang(localStorage.getItem('agff_lang') || App.ui?.lang || _detectBrowserLang());
            await setLanguage(langFromStorage, false);
            renderStorageSwitcher();
            renderFanPickerCurrent(); initCharts(); loadDefaultCSV(); update();
            initGuidelineLabels();
            initHistoryUI();
            applySimToggleUi();
            guideStep(1);
            const fetchWeatherBtn = document.getElementById('fetch-weather');
            if(fetchWeatherBtn) {
                fetchWeatherBtn.addEventListener('click', (event) => {
                    event.preventDefault();
                    handleFetchWeather();
                });
            }
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
        function getHistoryRecordStorageId(record) {
            const raw = record?.futterlager?.storage_id;
            const parsed = parseInt(raw, 10);
            return Number.isFinite(parsed) ? parsed : null;
        }
        function getActiveStorageHistoryEntries() {
            const recs = App.history?.records || [];
            const activeId = String(App.activeStorageId);
            const firstStorageId = String((App.storages || [])[0]?.id ?? App.activeStorageId);
            return recs
                .map((record, index) => ({ record, index }))
                .filter(({ record }) => {
                    const sid = getHistoryRecordStorageId(record);
                    if(sid === null) return activeId === firstStorageId;
                    return String(sid) === activeId;
                });
        }
        function getActiveStorageHistoryRecords() {
            return getActiveStorageHistoryEntries().map(entry => entry.record);
        }
        function normalizeHistorySelectionForActiveStorage() {
            const entries = getActiveStorageHistoryEntries();
            if(!entries.length) {
                historySelectedIndex = -1;
                return { entries, selectedVisibleIndex: -1 };
            }
            let selectedVisibleIndex = entries.findIndex(entry => entry.index === historySelectedIndex);
            if(selectedVisibleIndex < 0) {
                selectedVisibleIndex = entries.length - 1;
                historySelectedIndex = entries[selectedVisibleIndex].index;
            }
            return { entries, selectedVisibleIndex };
        }
        function initHistoryUI() {
            if(!App.history || typeof App.history !== 'object') App.history = { auto: false, records: [] };
            if(!Array.isArray(App.history.records)) App.history.records = [];
            if(App.history.records.length && historySelectedIndex < 0) historySelectedIndex = App.history.records.length - 1;
            renderHistoryStorageSwitcher();
            updateHistoryPresetButtons();
            updateHistoryChart();
            updateHistoryClimateChart();
            renderHistoryTable();
            updateHistorySelectionUI();
        }
        function updateHistorySelectionUI() {
            const { entries, selectedVisibleIndex } = normalizeHistorySelectionForActiveStorage();
            const recs = entries.map(entry => entry.record);
            const box = document.getElementById('history-timeline-box');
            const slider = document.getElementById('history-index-slider');
            const label = document.getElementById('history-selected-label');
            const delBtn = document.getElementById('btn-delete-point');
            const editBtn = document.getElementById('btn-edit-point');
            if(!recs.length) {
                historySelectedIndex = -1;
                if(box) box.classList.add('hidden');
                if(label) label.innerText = '-';
                if(delBtn) delBtn.classList.add('hidden');
                if(editBtn) editBtn.classList.add('hidden');
                closeDialogById('history-edit-modal');
                return;
            }
            if(box) box.classList.remove('hidden');
            if(delBtn) delBtn.classList.remove('hidden');
            if(editBtn) editBtn.classList.remove('hidden');
            if(slider) {
                slider.min = '0';
                slider.max = String(recs.length - 1);
                slider.value = String(selectedVisibleIndex);
            }
            if(label) {
                const r = recs[selectedVisibleIndex];
                const d = r?.time ? new Date(r.time) : null;
                label.innerText = d && !Number.isNaN(d.getTime()) ? d.toLocaleString() : (r?.time || '-');
            }
            setTimeout(centerHistorySelectionInView, 0);
        }
        function toLocalDateTimeInputValue(isoString) {
            const d = new Date(isoString);
            if(Number.isNaN(d.getTime())) return '';
            const pad = (n) => String(n).padStart(2, '0');
            const y = d.getFullYear();
            const m = pad(d.getMonth() + 1);
            const day = pad(d.getDate());
            const h = pad(d.getHours());
            const min = pad(d.getMinutes());
            return `${y}-${m}-${day}T${h}:${min}`;
        }
        function parseSelectedHistoryEditTime(existingIso) {
            const dtInput = document.getElementById('history-edit-datetime');
            const raw = (dtInput?.value || '').trim();
            const parsed = raw ? new Date(raw) : new Date(existingIso || Date.now());
            if(Number.isNaN(parsed.getTime())) return null;
            return parsed;
        }
        function openHistoryEditModal() {
            const recs = App.history?.records || [];
            if(historySelectedIndex < 0 || historySelectedIndex >= recs.length) return;
            const existing = recs[historySelectedIndex] || {};
            const dtInput = document.getElementById('history-edit-datetime');
            const selectedLabel = document.getElementById('history-edit-selected-label');
            if(dtInput) dtInput.value = toLocalDateTimeInputValue(existing.time || new Date().toISOString());
            if(selectedLabel) {
                const ts = existing?.time ? new Date(existing.time) : null;
                selectedLabel.innerText = ts && !Number.isNaN(ts.getTime()) ? ts.toLocaleString() : (existing?.time || '-');
            }
            openDialogById('history-edit-modal');
        }
        function updateSelectedHistoryPoint() {
            const recs = App.history?.records || [];
            if(historySelectedIndex < 0 || historySelectedIndex >= recs.length) return;
            const existing = recs[historySelectedIndex] || {};
            const nextTime = parseSelectedHistoryEditTime(existing.time);
            if(!nextTime || Number.isNaN(nextTime.getTime())) {
                window.alert('Ungültiges Zeit/Datum. Bitte Format YYYY-MM-DDTHH:MM verwenden.');
                return;
            }

            const rebuilt = buildCurrentHistoryRecord();
            const nextRecord = rebuilt && typeof rebuilt === 'object'
                ? rebuilt
                : JSON.parse(JSON.stringify(existing));

            if(!nextRecord.futterlager || typeof nextRecord.futterlager !== 'object') nextRecord.futterlager = {};
            const sid = Number.isFinite(parseInt(existing?.futterlager?.storage_id, 10))
                ? parseInt(existing.futterlager.storage_id, 10)
                : App.activeStorageId;
            nextRecord.futterlager.storage_id = sid;
            nextRecord.futterlager.storage_name = getStorageDisplayName(sid);
            nextRecord.time = nextTime.toISOString();

            App.history.records[historySelectedIndex] = nextRecord;
            updateHistoryChart();
            updateHistoryClimateChart();
            renderHistoryTable();
            updateHistorySelectionUI();
            saveData();
            closeDialogById('history-edit-modal');
        }
        function applyCurrentInputsForSelectedTimestamp() {
            const recs = App.history?.records || [];
            if(historySelectedIndex < 0 || historySelectedIndex >= recs.length) return;
            const existing = recs[historySelectedIndex] || {};

            const rebuilt = buildCurrentHistoryRecord();
            const nextRecord = rebuilt && typeof rebuilt === 'object'
                ? rebuilt
                : JSON.parse(JSON.stringify(existing));

            if(!nextRecord.futterlager || typeof nextRecord.futterlager !== 'object') nextRecord.futterlager = {};
            const sid = Number.isFinite(parseInt(existing?.futterlager?.storage_id, 10))
                ? parseInt(existing.futterlager.storage_id, 10)
                : App.activeStorageId;
            nextRecord.futterlager.storage_id = sid;
            nextRecord.futterlager.storage_name = getStorageDisplayName(sid);
            nextRecord.time = existing.time || new Date().toISOString();

            App.history.records[historySelectedIndex] = nextRecord;
            updateHistoryChart();
            updateHistoryClimateChart();
            renderHistoryTable();
            updateHistorySelectionUI();
            saveData();
            closeDialogById('history-edit-modal');
        }
        function updateHistoryPresetButtons() {
            const fullscreenBtn = document.getElementById('history-preset-fullscreen');
            const oneToOneBtn = document.getElementById('history-preset-1to1');
            const zoomValueEl = document.getElementById('history-zoom-value');
            if(fullscreenBtn) fullscreenBtn.classList.toggle('active', historyZoomPreset === 'fullscreen');
            if(oneToOneBtn) oneToOneBtn.classList.toggle('active', historyZoomPreset === 'one-to-one');
            if(zoomValueEl) {
                const pct = Math.round(historyZoomLevel * 100);
                zoomValueEl.textContent = historyZoomPreset === 'fullscreen' ? 'Fit' : `${pct} %`;
            }
        }
        function getLayerPressureFactor(layer) {
            const opt = DENS_OPTS.find(o => o.id === layer.type) || DENS_OPTS[1];
            const ts = parseFloat(layer.ts);
            if(!Number.isFinite(ts)) return opt.f;
            const clampedTs = Math.max(40, Math.min(92, ts));
            const tsAdjust = 1.58 - (clampedTs - 40) * 0.014;
            return opt.f * Math.max(0.75, Math.min(1.65, tsAdjust));
        }
        function getStorageMetrics() {
            const totalLayerHeight = App.layers.reduce((sum, layer) => sum + (parseFloat(layer.h) || 0), 0);
            const effectiveHeight = totalLayerHeight;
            const maxConfiguredHeight = App.stockHeightManual && App.stockHeightManual > 0
                ? Math.max(App.stockHeightManual, totalLayerHeight)
                : totalLayerHeight;
            let totalMassWetAuto = 0;
            let stackPressureLayersMbar = 0;
            App.layers.forEach(layer => {
                const wetDensity = getLayerDensity(layer);
                const layerVolume = (parseFloat(App.area) || 0) * (parseFloat(layer.h) || 0);
                totalMassWetAuto += layerVolume * wetDensity;
                stackPressureLayersMbar += (parseFloat(layer.h) || 0) * getLayerPressureFactor(layer);
            });
            const pressureScale = totalLayerHeight > 0 && maxConfiguredHeight > 0 ? (maxConfiguredHeight / totalLayerHeight) : 1;
            const stackPressureMbar = stackPressureLayersMbar * pressureScale;
            const totalMassWet = totalMassWetAuto;
            const avgDensity = totalMassWet > 0 && App.area > 0 && effectiveHeight > 0 ? (totalMassWet / (App.area * effectiveHeight)) : 0;
            return {
                totalLayerHeight,
                effectiveHeight,
                maxConfiguredHeight,
                pressureScale,
                stackPressureLayersMbar,
                stackPressureLayersPa: stackPressureLayersMbar * 100,
                stackPressureMbar,
                stackPressurePa: stackPressureMbar * 100,
                avgDensity
            };
        }
        function getPressureBreakdown() {
            const storageMetrics = getStorageMetrics();
            const roofExhaustPa = App.systemExtras?.roofExhaust ? SYSTEM_PRESSURE_SURCHARGES_PA.roofExhaust : 0;
            const conditioningUnitPa = App.systemExtras?.conditioningUnit ? SYSTEM_PRESSURE_SURCHARGES_PA.conditioningUnit : 0;
            const systemPressurePa = roofExhaustPa + conditioningUnitPa;
            const totalPressurePa = storageMetrics.stackPressurePa + systemPressurePa;
            return {
                ...storageMetrics,
                roofExhaustPa,
                conditioningUnitPa,
                systemPressurePa,
                systemPressureMbar: systemPressurePa / 100,
                totalPressurePa,
                totalPressureMbar: totalPressurePa / 100
            };
        }
        function getFanOperatingPoint(fan, pressureMbar) {
            const targetPressure = Math.max(0, parseFloat(pressureMbar) || 0);
            const pmax = parseFloat(fan?.pmax) || 0;
            const points = Array.isArray(fan?.pts)
                ? fan.pts
                : (Array.isArray(fan?.curve) ? fan.curve : []);
            const pts = points.map(pt => ({
                p: parseFloat(pt.p) || 0,
                q: parseFloat(pt.q) || 0,
                kw: parseFloat(pt.kw) || 0
            })).filter(pt => pt.q >= 0).sort((a, b) => a.p - b.p);
            if(!pts.length || (pmax > 0 && targetPressure >= pmax)) return { flow: 0, power: 0, supported: false };

            let p1 = pts[0];
            let p2 = pts[pts.length - 1];
            for(let i = 0; i < pts.length - 1; i++) {
                if(targetPressure >= pts[i].p && targetPressure <= pts[i + 1].p) {
                    p1 = pts[i];
                    p2 = pts[i + 1];
                    break;
                }
            }
            if(targetPressure < p1.p) {
                p2 = p1;
                p1 = { p: 0, q: p1.q, kw: p1.kw };
            }

            const denom = p2.p - p1.p;
            const ratio = Math.abs(denom) < 0.000001 ? 0 : (targetPressure - p1.p) / denom;
            const flow = p1.q + (p2.q - p1.q) * ratio;
            const power = p1.kw + (p2.kw - p1.kw) * ratio;
            return {
                flow: Math.max(0, flow),
                power: Math.max(0, power),
                supported: Math.max(0, flow) > 0
            };
        }
        function fanOptionDetailsMarkup(fan) {
            const pmax = Number.isFinite(parseFloat(fan?.pmax)) ? `${parseFloat(fan.pmax).toFixed(1)} mbar` : '-';
            const reqFlow = Number.isFinite(parseFloat(fan?.operatingPoint?.flow)) ? `${parseFloat(fan.operatingPoint.flow).toFixed(1)} m³/s` : '-';
            const reqPower = Number.isFinite(parseFloat(fan?.operatingPoint?.power)) && parseFloat(fan.operatingPoint.power) > 0 ? `${parseFloat(fan.operatingPoint.power).toFixed(1)} kW` : '-';
            const statusClass = fan?.suitable ? 'text-emerald-700' : 'text-amber-700';
            const statusText = fan?.suitable
                ? t('heucheck.fan_suggestion_fit', 'passt gut')
                : t('heucheck.fan_suggestion_alt', 'prüfen');
            const opFull = fan?.opFull;
            const reqFlowFull = Number.isFinite(parseFloat(opFull?.flow)) ? `${parseFloat(opFull.flow).toFixed(1)} m³/s` : '-';
            return `<div class="font-bold text-slate-800">${fan?.label || '-'}</div>
                <div class="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-slate-500">
                    <span>${t('heucheck.max_pressure', 'Pmax')}: ${pmax}</span>
                    <span>${t('heucheck.suggestion_at_half', 'Halb')}: ${reqFlow}</span>
                    <span>${t('heucheck.suggestion_at_full', 'Voll')}: ${reqFlowFull}</span>
                    <span>${t('stat.power_demand', 'Leistung')}: ${reqPower}</span>
                </div>
                <div class="mt-1 text-[11px] font-bold ${statusClass}">${statusText}</div>`;
        }
        function getFanSuggestions(limit = 5) {
            const area = Math.max(0, parseFloat(App.area) || 0);
            const targetFlow = area * Math.max(0, parseFloat(App.flowSpecTarget) || 0);
            const minFlow = area * AGFF_CONFIG.guidelines.speed_min; // 0.07 m/s × Fläche
            const pressureBreakdown = getPressureBreakdown();
            // Vollbeladung: voller Stapeldruck + Systemzuschläge
            const fullPressureMbar = pressureBreakdown.totalPressureMbar;
            // Halbbeladung: halber Stapeldruck + volle Systemzuschläge (Kittl-Tabelle)
            const halfPressureMbar = (pressureBreakdown.stackPressureMbar / 2) + pressureBreakdown.systemPressureMbar;
            if(targetFlow <= 0 || !Array.isArray(App.fanDB) || !App.fanDB.length) {
                return { targetFlow, minFlow, fullPressureMbar, halfPressureMbar, items: [] };
            }

            const items = App.fanDB.map(fan => {
                const opFull = getFanOperatingPoint(fan, fullPressureMbar);
                const opHalf = getFanOperatingPoint(fan, halfPressureMbar);
                const pmax = parseFloat(fan.pmax) || 0;
                // Primärkriterium: Halbbeladung → Zielvolumenstrom
                const gapHalf = targetFlow > 0 ? Math.abs(opHalf.flow - targetFlow) / targetFlow : Number.POSITIVE_INFINITY;
                const underHalf = opHalf.flow < targetFlow ? 0.35 : 0;
                // Sekundärkriterium: Vollbeladung → Mindestvolumenstrom
                const underFull = opFull.flow < minFlow ? 0.5 : 0;
                const headroomPenalty = pmax > 0 ? Math.max(0, (fullPressureMbar / pmax) - 0.85) : 1;
                const meetsMin = opFull.supported && opFull.flow >= minFlow;
                const meetsTarget = opHalf.supported && opHalf.flow >= targetFlow * 0.85;
                return {
                    ...fan,
                    operatingPoint: opHalf, // für Detailanzeige: Halbbeladungs-Betriebspunkt
                    opFull,
                    score: gapHalf + underHalf + underFull + headroomPenalty,
                    suitable: meetsMin && meetsTarget && pmax >= fullPressureMbar * 1.02
                };
            }).filter(item => item.opFull.supported || item.operatingPoint.supported)
                .sort((a, b) => a.score - b.score)
                .slice(0, limit);

            return { targetFlow, minFlow, fullPressureMbar, halfPressureMbar, items };
        }
        function renderFanSuggestions() {
            const wrap = document.getElementById('fan-suggestions-wrap');
            const targetEl = document.getElementById('fan-suggestion-target');
            const list = document.getElementById('fan-suggestions');
            if(!wrap || !targetEl || !list) return;

            const suggestions = getFanSuggestions(5);
            if(suggestions.targetFlow > 0) {
                targetEl.innerHTML =
                    `<span class="text-slate-500">${t('heucheck.suggestion_target_half', 'Halbbeladung')}:</span> <strong>${suggestions.targetFlow.toFixed(1)} m³/s @ ${suggestions.halfPressureMbar.toFixed(1)} mbar</strong>` +
                    `<br><span class="text-slate-500">${t('heucheck.suggestion_target_full', 'Vollbeladung')}:</span> <strong>≥ ${suggestions.minFlow.toFixed(1)} m³/s @ ${suggestions.fullPressureMbar.toFixed(1)} mbar</strong>`;
            } else {
                targetEl.innerText = t('heucheck.suggestion_missing_target', 'Für Vorschläge bitte Stockfläche und Soll-Luftmenge erfassen.');
            }

            if(!suggestions.items.length) {
                list.innerHTML = `<div class="text-[11px] text-slate-500">${t('heucheck.suggestion_empty', 'Noch keine passenden Lüftervorschläge verfügbar.')}</div>`;
                wrap.classList.remove('hidden');
                return;
            }

            list.innerHTML = '';
            suggestions.items.forEach((fan, index) => {
                const node = document.createElement('div');
                node.className = `fan-item rounded-md border border-slate-200 bg-white ${index === 0 ? 'border-emerald-300 bg-emerald-50/40' : ''}`;
                node.innerHTML = fanOptionDetailsMarkup(fan);
                node.onclick = () => {
                    fanPicker.brand = fan.brand || null;
                    fanPicker.open = false;
                    applyFanSelection(fan);
                };
                list.appendChild(node);
            });
            wrap.classList.remove('hidden');
        }
        function setSystemExtra(key, checked) {
            if(!(key in SYSTEM_PRESSURE_SURCHARGES_PA)) return;
            if(!App.systemExtras || typeof App.systemExtras !== 'object') {
                App.systemExtras = { roofExhaust: false, conditioningUnit: false };
            }
            App.systemExtras[key] = !!checked;
            update();
            saveData();
        }
        function inferConfiguredFan(savedFan) {
            if(!savedFan || typeof savedFan !== 'object') return false;
            const defaultFan = DEFAULT_APP_STATE.fan;
            const savedCurve = Array.isArray(savedFan.curve) ? savedFan.curve : [];
            return (savedFan.label || '') !== (defaultFan.label || '')
                || (savedFan.mode || '') !== (defaultFan.mode || '')
                || Math.abs((parseFloat(savedFan.flow) || 0) - (parseFloat(defaultFan.flow) || 0)) > 0.001
                || Math.abs((parseFloat(savedFan.pmax) || 0) - (parseFloat(defaultFan.pmax) || 0)) > 0.001
                || JSON.stringify(savedCurve) !== JSON.stringify(defaultFan.curve)
                || savedFan.autoScaleStandard === false;
        }
        function inferConfiguredStorage(savedData) {
            if(!savedData || typeof savedData !== 'object') return false;
            const defaultLayers = DEFAULT_APP_STATE.layers;
            const savedLayers = Array.isArray(savedData.layers) ? savedData.layers : [];
            return Math.abs((parseFloat(savedData.area) || 0) - (parseFloat(DEFAULT_APP_STATE.area) || 0)) > 0.001
                || (parseFloat(savedData.stockHeightManual) || 0) > 0
                || JSON.stringify(savedLayers) !== JSON.stringify(defaultLayers);
        }
        function hasPressureCalcPrerequisites() {
            const storageMetrics = getStorageMetrics();
            const hasStockConfig = storageMetrics.effectiveHeight >= 0.2;
            const hasFanConfig = ((Array.isArray(App.fan.curve) && App.fan.curve.length > 0) || (parseFloat(App.fan.pmax) || 0) > 0 || (parseFloat(App.fan.flow) || 0) > 0);
            return App.flags?.storageConfigured === true && App.flags?.fanConfigured === true && hasStockConfig && hasFanConfig;
        }
        function getKittlGrateHeightCm(areaM2) {
            const table = Array.isArray(AGFF_CONFIG.guidelines.kittl_grate_table)
                ? AGFF_CONFIG.guidelines.kittl_grate_table
                : [];
            const area = Math.max(1, parseFloat(areaM2) || 1);
            if(!table.length) return 0;
            if(area <= table[0].area) return table[0].grateCm;
            for(let i = 1; i < table.length; i++) {
                const prev = table[i - 1];
                const next = table[i];
                if(area <= next.area) {
                    const ratio = (area - prev.area) / Math.max(1, next.area - prev.area);
                    return Math.round(prev.grateCm + (next.grateCm - prev.grateCm) * ratio);
                }
            }
            const last = table[table.length - 1];
            const beforeLast = table[Math.max(0, table.length - 2)] || last;
            const slope = (last.grateCm - beforeLast.grateCm) / Math.max(1, last.area - beforeLast.area);
            return Math.round(last.grateCm + Math.max(0, area - last.area) * slope);
        }
        function applyAutoGrateHeightByArea(force = false) {
            if(!force && App.grateHeightAuto === false) return;
            const suggested = getKittlGrateHeightCm(App.area);
            if(suggested <= 0) return;
            App.grateHeightCm = suggested;
            App.grateHeightAuto = true;
        }
        function resetHistoryZoom() {
            historyZoomLevel = 1;
            historyManualWindow = null;
            if(historyChart && typeof historyChart.resetZoom === 'function') historyChart.resetZoom();
            if(historyClimateChart && typeof historyClimateChart.resetZoom === 'function') historyClimateChart.resetZoom();
            updateHistoryPresetButtons();
        }
        function setHistoryPreset(preset) {
            if(preset === 'fullscreen') {
                historyZoomPreset = 'fullscreen';
                resetHistoryZoom();
            } else if(preset === 'one-to-one') {
                historyZoomPreset = 'one-to-one';
                resetHistoryZoom();
            } else {
                historyZoomPreset = 'custom';
            }
            updateHistoryPresetButtons();
            updateHistoryChart();
            updateHistoryClimateChart();
        }
        function applyHistoryCanvasLayout() {
            if(historyChart) historyChart.resize();
            if(historyClimateChart) historyClimateChart.resize();
        }

        function historyTimeMs(record, fallbackIndex = 0) {
            const parsed = record?.time ? new Date(record.time).getTime() : NaN;
            if(Number.isFinite(parsed)) return parsed;
            return fallbackIndex * 60000;
        }

        function historyTimeDomain(records) {
            const times = (records || []).map((r, i) => historyTimeMs(r, i));
            if(!times.length) return { times: [], min: 0, max: 0 };
            return {
                times,
                min: Math.min(...times),
                max: Math.max(...times)
            };
        }

        function updateHistoryCanvasWidths(records) {
            const recs = records || [];
            const mainScroll = document.getElementById('history-chart-scroll');
            const climateScroll = document.getElementById('history-climate-scroll');
            const mainCanvas = document.getElementById('historyChart');
            const climateCanvas = document.getElementById('historyClimateChart');
            if(!mainCanvas || !climateCanvas) return;
            const viewport = Math.max(320, mainScroll?.clientWidth || climateScroll?.clientWidth || 320);
            if(historyZoomPreset === 'fullscreen') {
                mainCanvas.style.width = `${viewport}px`;
                climateCanvas.style.width = `${viewport}px`;
                mainCanvas.style.minWidth = `${viewport}px`;
                climateCanvas.style.minWidth = `${viewport}px`;
                return;
            }
            const domain = historyTimeDomain(recs);
            const spanMin = Math.max(1, (domain.max - domain.min) / 60000);
            const fromCount = recs.length * 26;
            const fromSpan = spanMin * 3.2;
            const targetWidth = Math.round(Math.min(14000, Math.max(viewport, fromCount, fromSpan)));
            mainCanvas.style.width = `${targetWidth}px`;
            climateCanvas.style.width = `${targetWidth}px`;
            mainCanvas.style.minWidth = `${viewport}px`;
            climateCanvas.style.minWidth = `${viewport}px`;
        }

        function centerHistorySelectionInView() {
            if(historyZoomPreset === 'fullscreen') return;
            const recs = App.history?.records || [];
            if(historySelectedIndex < 0 || historySelectedIndex >= recs.length) return;
            const t = historyTimeMs(recs[historySelectedIndex], historySelectedIndex);
            const pairs = [
                { chart: historyChart, scrollId: 'history-chart-scroll' },
                { chart: historyClimateChart, scrollId: 'history-climate-scroll' }
            ];
            pairs.forEach(({ chart, scrollId }) => {
                const scroller = document.getElementById(scrollId);
                const scale = chart?.scales?.x;
                if(!scroller || !scale) return;
                const px = scale.getPixelForValue(t);
                if(!Number.isFinite(px)) return;
                const left = Math.max(0, px - (scroller.clientWidth / 2));
                scroller.scrollLeft = left;
            });
        }

        function applyHistoryWindowToChart(chart, records) {
            if(!chart?.options?.scales?.x) return;
            const recs = records || [];
            const totalCount = recs.length;
            const xScale = chart.options.scales.x;
            if(historyZoomPreset === 'fullscreen' || totalCount <= 1) {
                delete xScale.min;
                delete xScale.max;
                return;
            }
            const domain = historyTimeDomain(recs);
            const totalSpan = Math.max(1000, domain.max - domain.min);
            if(!historyManualWindow || !Number.isFinite(historyManualWindow.min) || !Number.isFinite(historyManualWindow.max)) {
                const visibleSpan = Math.max(1000, totalSpan / Math.max(0.2, historyZoomLevel));
                historyManualWindow = { min: Math.max(domain.min, domain.max - visibleSpan), max: domain.max };
            }
            xScale.min = Math.max(domain.min, Math.min(domain.max, historyManualWindow.min));
            xScale.max = Math.max(domain.min, Math.min(domain.max, historyManualWindow.max));
        }

        function zoomHistory(delta) {
            const factor = delta > 0 ? 1.2 : 0.85;
            historyZoomLevel = Math.max(0.2, Math.min(8, historyZoomLevel * factor));
            historyZoomPreset = 'custom';
            const pluginZoomAvailable = !!(historyChart && typeof historyChart.zoom === 'function' && historyClimateChart && typeof historyClimateChart.zoom === 'function');
            if(pluginZoomAvailable) {
                historyManualWindow = null;
                historyChart.zoom({ x: factor, y: 1 });
                historyClimateChart.zoom({ x: factor, y: 1 });
            } else {
                const recs = App.history?.records || [];
                if(recs.length > 1) {
                    const domain = historyTimeDomain(recs);
                    const fullSpan = Math.max(1000, domain.max - domain.min);
                    const currentMin = Number.isFinite(historyManualWindow?.min) ? historyManualWindow.min : domain.min;
                    const currentMax = Number.isFinite(historyManualWindow?.max) ? historyManualWindow.max : domain.max;
                    const currentSize = Math.max(1000, currentMax - currentMin);
                    const targetSize = Math.max(1000, Math.min(fullSpan, currentSize / factor));
                    const center = (currentMin + currentMax) / 2;
                    let min = center - targetSize / 2;
                    let max = center + targetSize / 2;
                    if(min < domain.min) {
                        max += (domain.min - min);
                        min = domain.min;
                    }
                    if(max > domain.max) {
                        min -= (max - domain.max);
                        max = domain.max;
                    }
                    historyManualWindow = { min, max };
                    updateHistoryChart();
                    updateHistoryClimateChart();
                }
            }
            updateHistoryPresetButtons();
        }
        window.zoomHistory = zoomHistory;
        window.setHistoryPreset = setHistoryPreset;
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
                    storage_id: App.activeStorageId,
                    storage_name: getStorageDisplayName(App.activeStorageId),
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
            const { entries, selectedVisibleIndex } = normalizeHistorySelectionForActiveStorage();
            if(selectedVisibleIndex < 0 || selectedVisibleIndex >= entries.length) return;
            const globalIndex = entries[selectedVisibleIndex].index;
            const rec = entries[selectedVisibleIndex].record;
            const ts = rec?.time ? new Date(rec.time) : null;
            const timeStr = ts && !Number.isNaN(ts.getTime()) ? ts.toLocaleString() : (rec?.time || '?');
            if (!window.confirm(`${t('history.delete_confirm_prefix', 'Datenpunkt vom')} ${timeStr} ${t('history.delete_confirm_suffix', 'wirklich löschen?')}`)) return;
            App.history.records.splice(globalIndex, 1);
            historySelectedIndex = -1;
            updateHistoryChart();
            updateHistoryClimateChart();
            renderHistoryTable();
            updateHistorySelectionUI();
            saveData();
        }
        function clearHistoryData() {
            if(!App.history) App.history = { auto: false, records: [] };
            const activeId = String(App.activeStorageId);
            const firstStorageId = String((App.storages || [])[0]?.id ?? App.activeStorageId);
            App.history.records = (App.history.records || []).filter(record => {
                const sid = getHistoryRecordStorageId(record);
                if(sid === null) return activeId !== firstStorageId;
                return String(sid) !== activeId;
            });
            historySelectedIndex = -1;
            updateHistoryChart();
            updateHistoryClimateChart();
            renderHistoryTable();
            updateHistorySelectionUI();
            saveData();
        }
        function confirmClearHistoryData() {
            const count = getActiveStorageHistoryRecords().length;
            const msg = count > 0
                ? `${t('history.clear_confirm_all_prefix', 'Wirklich alle')} ${count} ${t('history.clear_confirm_all_suffix', 'aufgezeichneten Datenpunkte löschen?')}`
                : t('history.clear_confirm_empty', 'Es sind keine Datenpunkte vorhanden. Trotzdem Verlauf zurücksetzen?');
            if(window.confirm(msg)) clearHistoryData();
        }
        function historyToCsv(records) {
            const header = [
                'time','storage_id','storage_name','area_m2','stock_height_m','layers','fan_label','fan_mode','flow_m3s','pmax_mbar',
                't1_c','h1_pct','t2_c','h2_pct','t3_c','h3_pct','water_l_h','water_g_m3','pressure_pa','pressure_display','pressure_mode'
            ];
            const esc = (v) => {
                const s = String(v ?? '');
                return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
            };
            const lines = records.map(r => [
                r.time,
                r.futterlager?.storage_id,
                r.futterlager?.storage_name,
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
            const payload = JSON.stringify(getActiveStorageHistoryRecords(), null, 2);
            const blob = new Blob([payload], { type: 'application/json' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = `drywatch-history-${new Date().toISOString().slice(0,19).replace(/[:T]/g,'-')}.json`;
            a.click();
            URL.revokeObjectURL(a.href);
        }
        function exportHistoryCsv() {
            const csv = historyToCsv(getActiveStorageHistoryRecords());
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
                const storageIdRaw = parseInt(c[idx('storage_id')], 10);
                const storageId = Number.isFinite(storageIdRaw) ? storageIdRaw : null;
                const num = (k) => {
                    const v = parseFloat(c[idx(k)]);
                    return Number.isFinite(v) ? v : 0;
                };
                const str = (k) => c[idx(k)] || '';
                return {
                    time: str('time') || new Date().toISOString(),
                    futterlager: {
                        storage_id: storageId,
                        storage_name: str('storage_name'),
                        area_m2: num('area_m2'),
                        stock_height_m: num('stock_height_m'),
                        layers: num('layers')
                    },
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
            App.history.records = records
                .filter(r => r && typeof r === 'object')
                .map(r => {
                    const next = { ...r };
                    if(!next.futterlager || typeof next.futterlager !== 'object') next.futterlager = {};
                    if(!Number.isFinite(parseInt(next.futterlager.storage_id, 10))) {
                        next.futterlager.storage_id = App.activeStorageId;
                        next.futterlager.storage_name = getStorageDisplayName(App.activeStorageId);
                    }
                    return next;
                });

            const importedStorageMeta = new Map();
            App.history.records.forEach((record) => {
                const sid = parseInt(record?.futterlager?.storage_id, 10);
                if(!Number.isFinite(sid)) return;
                const name = (record?.futterlager?.storage_name || '').toString().trim();
                if(!importedStorageMeta.has(sid)) importedStorageMeta.set(sid, name);
            });
            if(!Array.isArray(App.storages)) App.storages = [];
            importedStorageMeta.forEach((name, sid) => {
                const exists = App.storages.some(storage => String(storage.id) === String(sid));
                if(exists) {
                    if(name) {
                        const s = App.storages.find(storage => String(storage.id) === String(sid));
                        if(s && !(s.name || '').toString().trim()) s.name = name;
                    }
                    return;
                }
                const profile = createStorageProfile(sid);
                if(name) profile.name = name;
                App.storages.push(profile);
            });
            App.storages.sort((a, b) => (parseInt(a.id, 10) || 0) - (parseInt(b.id, 10) || 0));
            App.nextStorageId = (App.storages || []).reduce((maxId, storage) => Math.max(maxId, parseInt(storage.id, 10) || 0), 0) + 1;

            historySelectedIndex = App.history.records.length ? App.history.records.length - 1 : -1;
            renderStorageSwitcher();
            renderStorageSettingsList();
            updateHistoryChart();
            updateHistoryClimateChart();
            renderHistoryTable();
            updateHistorySelectionUI();
            saveData();
            if(event?.target) event.target.value = '';
        }
        function applyHistoryRecord(index) {
            const entries = getActiveStorageHistoryEntries();
            const recs = entries.map(entry => entry.record);
            const i = parseInt(index, 10);
            if(!Number.isInteger(i) || i < 0 || i >= recs.length) return;
            historySelectedIndex = entries[i].index;
            const r = entries[i].record || {};
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
            setTimeout(centerHistorySelectionInView, 0);
            saveData();
        }
        function updateHistoryChart() {
            if(!historyChart) return;
            const { entries, selectedVisibleIndex } = normalizeHistorySelectionForActiveStorage();
            const recs = entries.map(entry => entry.record);
            updateHistoryCanvasWidths(recs);
            applyHistoryCanvasLayout();
            const water = recs.map((r, i) => ({ x: historyTimeMs(r, i), y: parseFloat(r?.wasserentzug?.l_h) || 0 }));
            const pressure = recs.map((r, i) => ({ x: historyTimeMs(r, i), y: parseFloat(r?.druck?.pa) || 0 }));
            historyChart.data.labels = [];
            historyChart.data.datasets = [
                {
                    label: t('chart.water_removal', 'Wasserentzug (L/h)'),
                    data: water,
                    borderColor: 'rgba(37,99,235,0.35)',
                    pointBackgroundColor: (ctx) => ctx.dataIndex === selectedVisibleIndex ? '#1d4ed8' : '#2563eb',
                    pointBorderColor: '#1d4ed8',
                    pointBorderWidth: (ctx) => ctx.dataIndex === selectedVisibleIndex ? 2 : 1,
                    borderWidth: 1.2,
                    tension: 0.2,
                    pointRadius: (ctx) => ctx.dataIndex === selectedVisibleIndex ? 5.4 : 3.2,
                    pointHoverRadius: (ctx) => ctx.dataIndex === selectedVisibleIndex ? 6.2 : 4.5,
                    yAxisID: 'yWater'
                },
                {
                    label: t('chart.pressure', 'Druck (Pa)'),
                    data: pressure,
                    borderColor: 'rgba(245,158,11,0.35)',
                    pointBackgroundColor: (ctx) => ctx.dataIndex === selectedVisibleIndex ? '#b45309' : '#f59e0b',
                    pointBorderColor: '#d97706',
                    pointBorderWidth: (ctx) => ctx.dataIndex === selectedVisibleIndex ? 2 : 1,
                    borderWidth: 1.2,
                    tension: 0.2,
                    pointRadius: (ctx) => ctx.dataIndex === selectedVisibleIndex ? 5.4 : 3.2,
                    pointHoverRadius: (ctx) => ctx.dataIndex === selectedVisibleIndex ? 6.2 : 4.5,
                    yAxisID: 'yPressure'
                }
            ];
            if(historyChart.options?.scales?.yWater?.title) historyChart.options.scales.yWater.title.text = t('chart.axis.water', 'L/h');
            if(historyChart.options?.scales?.yPressure?.title) historyChart.options.scales.yPressure.title.text = t('chart.axis.pressure', 'Pa');
            applyHistoryWindowToChart(historyChart, recs);
            historyChart.update('none');
            const cnt = document.getElementById('history-count');
            if(cnt) cnt.innerText = `${recs.length} ${t('history.points', 'Punkte')}`;
            updateHistorySelectionUI();
        }
        function updateHistoryClimateChart() {
            if(!historyClimateChart) return;
            const { entries, selectedVisibleIndex } = normalizeHistorySelectionForActiveStorage();
            const recs = entries.map(entry => entry.record);
            updateHistoryCanvasWidths(recs);
            applyHistoryCanvasLayout();
            const t1 = recs.map((r, i) => ({ x: historyTimeMs(r, i), y: roundTemp(r?.luftqualitaet?.t1_c) }));
            const t2 = recs.map((r, i) => ({ x: historyTimeMs(r, i), y: roundTemp(r?.luftqualitaet?.t2_c) }));
            const t3 = recs.map((r, i) => ({ x: historyTimeMs(r, i), y: roundTemp(r?.luftqualitaet?.t3_c) }));
            const h1 = recs.map((r, i) => ({ x: historyTimeMs(r, i), y: parseFloat(r?.luftqualitaet?.h1_pct) || 0 }));
            const h2 = recs.map((r, i) => ({ x: historyTimeMs(r, i), y: parseFloat(r?.luftqualitaet?.h2_pct) || 0 }));
            const h3 = recs.map((r, i) => ({ x: historyTimeMs(r, i), y: parseFloat(r?.luftqualitaet?.h3_pct) || 0 }));
            historyClimateChart.data.labels = [];
            historyClimateChart.data.datasets = [
                { label: t('chart.outdoor_temp', 'Aussen T (°C)'), data: t1, borderColor: 'rgba(37,99,235,0.4)', pointBackgroundColor: '#2563eb', pointBorderColor: '#1d4ed8', pointBorderWidth: (ctx) => ctx.dataIndex === selectedVisibleIndex ? 2 : 1, borderWidth: 1.1, tension: 0.18, pointRadius: (ctx) => ctx.dataIndex === selectedVisibleIndex ? 4.8 : 3, pointHoverRadius: (ctx) => ctx.dataIndex === selectedVisibleIndex ? 5.8 : 4.2, yAxisID: 'yTemp' },
                { label: t('chart.supply_temp', 'Zuluft T (°C)'), data: t2, borderColor: 'rgba(245,158,11,0.4)', pointBackgroundColor: '#f59e0b', pointBorderColor: '#d97706', pointBorderWidth: (ctx) => ctx.dataIndex === selectedVisibleIndex ? 2 : 1, borderWidth: 1.1, tension: 0.18, pointRadius: (ctx) => ctx.dataIndex === selectedVisibleIndex ? 4.8 : 3, pointHoverRadius: (ctx) => ctx.dataIndex === selectedVisibleIndex ? 5.8 : 4.2, yAxisID: 'yTemp' },
                { label: t('chart.exhaust_temp', 'Abluft T (°C)'), data: t3, borderColor: 'rgba(16,185,129,0.4)', pointBackgroundColor: '#10b981', pointBorderColor: '#059669', pointBorderWidth: (ctx) => ctx.dataIndex === selectedVisibleIndex ? 2 : 1, borderWidth: 1.1, tension: 0.18, pointRadius: (ctx) => ctx.dataIndex === selectedVisibleIndex ? 4.8 : 3, pointHoverRadius: (ctx) => ctx.dataIndex === selectedVisibleIndex ? 5.8 : 4.2, yAxisID: 'yTemp' },
                { label: t('chart.outdoor_rh', 'Aussen rF (%)'), data: h1, borderColor: 'rgba(37,99,235,0.28)', pointBackgroundColor: (ctx) => ctx.dataIndex === selectedVisibleIndex ? '#1d4ed8' : '#2563eb', pointBorderColor: '#1d4ed8', pointBorderWidth: (ctx) => ctx.dataIndex === selectedVisibleIndex ? 2 : 1, pointStyle: 'rect', borderDash: [5,4], borderWidth: 1, tension: 0.18, pointRadius: (ctx) => ctx.dataIndex === selectedVisibleIndex ? 4.8 : 3, pointHoverRadius: (ctx) => ctx.dataIndex === selectedVisibleIndex ? 5.8 : 4.2, yAxisID: 'yHum' },
                { label: t('chart.supply_rh', 'Zuluft rF (%)'), data: h2, borderColor: 'rgba(245,158,11,0.28)', pointBackgroundColor: (ctx) => ctx.dataIndex === selectedVisibleIndex ? '#d97706' : '#f59e0b', pointBorderColor: '#d97706', pointBorderWidth: (ctx) => ctx.dataIndex === selectedVisibleIndex ? 2 : 1, pointStyle: 'rect', borderDash: [5,4], borderWidth: 1, tension: 0.18, pointRadius: (ctx) => ctx.dataIndex === selectedVisibleIndex ? 4.8 : 3, pointHoverRadius: (ctx) => ctx.dataIndex === selectedVisibleIndex ? 5.8 : 4.2, yAxisID: 'yHum' },
                { label: t('chart.exhaust_rh', 'Abluft rF (%)'), data: h3, borderColor: 'rgba(16,185,129,0.28)', pointBackgroundColor: (ctx) => ctx.dataIndex === selectedVisibleIndex ? '#059669' : '#10b981', pointBorderColor: '#059669', pointBorderWidth: (ctx) => ctx.dataIndex === selectedVisibleIndex ? 2 : 1, pointStyle: 'rect', borderDash: [5,4], borderWidth: 1, tension: 0.18, pointRadius: (ctx) => ctx.dataIndex === selectedVisibleIndex ? 4.8 : 3, pointHoverRadius: (ctx) => ctx.dataIndex === selectedVisibleIndex ? 5.8 : 4.2, yAxisID: 'yHum' }
            ];
            if(historyClimateChart.options?.scales?.yTemp?.title) historyClimateChart.options.scales.yTemp.title.text = t('chart.axis.temp', '°C');
            if(historyClimateChart.options?.scales?.yHum?.title) historyClimateChart.options.scales.yHum.title.text = t('chart.axis.rh', '% rF');
            applyHistoryWindowToChart(historyClimateChart, recs);
            historyClimateChart.update('none');
        }
        function renderHistoryTable() {
            const body = document.getElementById('history-table-body');
            if(!body) return;
            const { entries } = normalizeHistorySelectionForActiveStorage();
            const recs = entries.map(entry => entry.record);
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
                const globalIndex = entries[i]?.index;
                const rowCls = globalIndex === historySelectedIndex ? 'history-row-selected' : 'cursor-pointer hover:bg-slate-50';
                const rowTooltip = `Zeit/Datum: ${timeTxt}\nDiesen Zeitpunkt laden.\nDanach Punkt bearbeiten klicken (öffnet Bearbeitungs-Modal mit Zeit/Datum und Aktuelle Daten übernehmen).`;
                rows.push(`<tr class="${rowCls}" onclick="applyHistoryRecord(${i})" title="${rowTooltip}"><td>${timeTxt}</td><td>${futterTxt}</td><td>${airTxt}</td><td>${waterTxt}</td><td>${pressureTxt}</td></tr>`);
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
            App.flags.storageConfigured = true;
            openLayersModal();
            update();
            saveData();
        }
        function setGrateHeightCm(v) {
            const parsed = parseFloat(v);
            if(Number.isFinite(parsed) && parsed >= 0) {
                App.grateHeightCm = Math.round(parsed);
                App.grateHeightAuto = false;
            } else {
                App.grateHeightAuto = true;
                applyAutoGrateHeightByArea(true);
            }
            App.flags.storageConfigured = true;
            openLayersModal();
            update();
            saveData();
        }
        function setStorageArea(v) {
            const parsed = parseFloat(v);
            App.area = Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
            App.flags.storageConfigured = true;
            applyAutoGrateHeightByArea();
            openLayersModal();
            update();
            saveData();
        }
        function stepStorageArea(delta) {
            const base = Math.max(1, parseFloat(App.area) || 1);
            setStorageArea(base + delta);
        }
        function stepManualStockHeight(delta) {
            const autoHeight = App.layers.reduce((sum, layer) => sum + (parseFloat(layer.h) || 0), 0);
            const base = Number.isFinite(parseFloat(App.stockHeightManual)) && parseFloat(App.stockHeightManual) > 0
                ? parseFloat(App.stockHeightManual)
                : autoHeight;
            const next = Math.max(0.1, Math.round((base + delta) * 10) / 10);
            setManualStockHeight(next);
        }
        function setAirChannelArea(kind, value) {
            if(!App.airChannels || typeof App.airChannels !== 'object') {
                App.airChannels = { intakeAreaM2: null, supplyAreaM2: null, roofOpenWidthAM: null, roofOpenWidthBM: null, roofOpenLengthAM: null, roofOpenLengthBM: null, roofLengthAM: null, roofLengthBM: null, roofContactLengthAM: null, roofContactLengthBM: null, roofCustomAreaM2: null, roofHeightCm: null, roofAzimutADeg: 180, roofTiltADeg: 30, roofAzimutBDeg: 0, roofTiltBDeg: 30, roofMaterial: 'tile_dark' };
            }
            const parsed = parseFloat(value);
            const safeValue = Number.isFinite(parsed) && parsed > 0 ? parsed : null;
            if(kind === 'intake') App.airChannels.intakeAreaM2 = safeValue;
            if(kind === 'supply') App.airChannels.supplyAreaM2 = safeValue;
            App.flags.storageConfigured = true;
            update();
            saveData();
        }

        function setRoofChannelField(key, value) {
            if(!App.airChannels || typeof App.airChannels !== 'object') {
                App.airChannels = { intakeAreaM2: null, supplyAreaM2: null, roofOpenWidthAM: null, roofOpenWidthBM: null, roofOpenLengthAM: null, roofOpenLengthBM: null, roofLengthAM: null, roofLengthBM: null, roofContactLengthAM: null, roofContactLengthBM: null, roofCustomAreaM2: null, roofHeightCm: null, roofAzimutADeg: 180, roofTiltADeg: 30, roofAzimutBDeg: 0, roofTiltBDeg: 30, roofMaterial: 'tile_dark' };
            }
            const parsed = parseFloat(value);
            App.airChannels[key] = Number.isFinite(parsed) && parsed > 0 ? parsed : null;
            App.flags.storageConfigured = true;
            update();
            saveData();
        }

        let _lastRoofFlow = 0;

        function setRoofAngleField(key, value) {
            if(!App.airChannels || typeof App.airChannels !== 'object') {
                App.airChannels = { intakeAreaM2: null, supplyAreaM2: null, roofOpenWidthAM: null, roofOpenWidthBM: null, roofOpenLengthAM: null, roofOpenLengthBM: null, roofLengthAM: null, roofLengthBM: null, roofContactLengthAM: null, roofContactLengthBM: null, roofCustomAreaM2: null, roofHeightCm: null, roofAzimutADeg: 180, roofTiltADeg: 30, roofAzimutBDeg: 0, roofTiltBDeg: 30, roofMaterial: 'tile_dark' };
            }
            const parsed = parseFloat(value);
            if(!Number.isFinite(parsed)) return;
            const isAzimut = key.indexOf('Azimut') >= 0;
            const normalized = isAzimut
                ? ((Math.round(parsed) % 360) + 360) % 360
                : Math.max(0, Math.min(70, Math.round(parsed)));
            App.airChannels[key] = normalized;
            App.flags.storageConfigured = true;
            renderRoofSolarGain(_lastRoofFlow || 0);
            saveData();
        }

        function setRoofMaterial(value) {
            if(!App.airChannels || typeof App.airChannels !== 'object') {
                App.airChannels = { intakeAreaM2: null, supplyAreaM2: null, roofOpenWidthAM: null, roofOpenWidthBM: null, roofOpenLengthAM: null, roofOpenLengthBM: null, roofLengthAM: null, roofLengthBM: null, roofContactLengthAM: null, roofContactLengthBM: null, roofCustomAreaM2: null, roofHeightCm: null, roofAzimutADeg: 180, roofTiltADeg: 30, roofAzimutBDeg: 0, roofTiltBDeg: 30, roofMaterial: 'tile_dark' };
            }
            const allowed = ['tile_dark', 'tile_light', 'metal_dark', 'metal_light', 'photovoltaic', 'fiber_cement', 'green_roof'];
            App.airChannels.roofMaterial = allowed.includes(value) ? value : 'tile_dark';
            App.flags.storageConfigured = true;
            renderRoofSolarGain(_lastRoofFlow || 0);
            saveData();
        }

        function _roofAbsorption(material) {
            const map = {
                tile_dark: 0.80,
                tile_light: 0.62,
                metal_dark: 0.76,
                metal_light: 0.45,
                photovoltaic: 0.88,
                fiber_cement: 0.67,
                green_roof: 0.58
            };
            return map[material] || 0.70;
        }

        function _roofAzimutLabel(deg) {
            const d = ((parseFloat(deg) || 0) + 360) % 360;
            if(d <= 22 || d > 338) return `N (${Math.round(d)}°)`;
            if(d <= 67)  return `NO (${Math.round(d)}°)`;
            if(d <= 112) return `O (${Math.round(d)}°)`;
            if(d <= 157) return `SO (${Math.round(d)}°)`;
            if(d <= 202) return `S (${Math.round(d)}°)`;
            if(d <= 247) return `SW (${Math.round(d)}°)`;
            if(d <= 292) return `W (${Math.round(d)}°)`;
            return `NW (${Math.round(d)}°)`;
        }

        function _updateCompassNeedle(side, azimutDeg) {
            const R = 35;
            const rad = (azimutDeg || 0) * Math.PI / 180;
            const nx = (R * Math.sin(rad)).toFixed(2);
            const ny = (-R * Math.cos(rad)).toFixed(2);
            const needle = document.getElementById(`roof-needle-${side}`);
            const dot = document.getElementById(`roof-dot-${side}`);
            if(needle) { needle.setAttribute('x2', nx); needle.setAttribute('y2', ny); }
            if(dot) { dot.setAttribute('cx', nx); dot.setAttribute('cy', ny); }
            const disp = document.getElementById(`roof-azimut-${side}-display`);
            if(disp) disp.textContent = _roofAzimutLabel(azimutDeg);
        }

        function _updateTiltHandle(side, tiltDeg) {
            const cx = 10, cy = 63, r = 63;
            const t = Math.max(0, Math.min(70, tiltDeg || 0));
            const rad = t * Math.PI / 180;
            const hx = (cx + r * Math.cos(rad)).toFixed(1);
            const hy = (cy - r * Math.sin(rad)).toFixed(1);
            const dot = document.getElementById(`roof-tilt-dot-${side}`);
            if(dot) { dot.setAttribute('cx', hx); dot.setAttribute('cy', hy); }
            const arc = document.getElementById(`roof-tilt-arc-${side}`);
            if(arc) arc.setAttribute('d', t < 1 ? '' : `M 73 63 A 63 63 0 0 0 ${hx} ${hy}`);
            const disp = document.getElementById(`roof-tilt-${side}-display`);
            if(disp) disp.textContent = `${Math.round(t)}°`;
        }

        function initRoofOrientationWidgets() {
            ['a', 'b'].forEach(side => {
                const azKey = `roofAzimut${side.toUpperCase()}Deg`;
                const tiltKey = `roofTilt${side.toUpperCase()}Deg`;
                const az = Number.isFinite(parseFloat(App.airChannels?.[azKey])) ? parseFloat(App.airChannels[azKey]) : (side === 'a' ? 180 : 0);
                const tilt = Number.isFinite(parseFloat(App.airChannels?.[tiltKey])) ? parseFloat(App.airChannels[tiltKey]) : 30;
                _updateCompassNeedle(side, az);
                _updateTiltHandle(side, tilt);

                const compass = document.getElementById(`roof-compass-${side}`);
                if(compass && !compass._roofInited) {
                    compass._roofInited = true;
                    compass.style.touchAction = 'none';
                    let active = false;
                    function compassAngle(e) {
                        const rect = compass.getBoundingClientRect();
                        const px = e.clientX;
                        const py = e.clientY;
                        const dx = px - (rect.left + rect.width / 2);
                        const dy = py - (rect.top + rect.height / 2);
                        return Math.round(((Math.atan2(dx, -dy) * 180 / Math.PI) + 360) % 360);
                    }
                    function applyCompass(e) {
                        const a = compassAngle(e);
                        setRoofAngleField(azKey, a);
                        _updateCompassNeedle(side, a);
                    }
                    compass.addEventListener('pointerdown', e => {
                        active = true;
                        try { compass.setPointerCapture(e.pointerId); } catch(_) {}
                        applyCompass(e);
                    });
                    compass.addEventListener('pointermove', e => {
                        if(!active) return;
                        applyCompass(e);
                    });
                    compass.addEventListener('pointerup', () => { active = false; });
                    compass.addEventListener('pointercancel', () => { active = false; });
                    compass.addEventListener('click', applyCompass);
                }

                const tiltSvg = document.getElementById(`roof-tilt-${side}`);
                if(tiltSvg && !tiltSvg._roofInited) {
                    tiltSvg._roofInited = true;
                    tiltSvg.style.touchAction = 'none';
                    let active = false;
                    function tiltAngle(e) {
                        const rect = tiltSvg.getBoundingClientRect();
                        const px = e.clientX;
                        const py = e.clientY;
                        const svgX = (px - rect.left) * (80 / rect.width);
                        const svgY = (py - rect.top) * (70 / rect.height);
                        const angle = Math.atan2(-(svgY - 63), svgX - 10) * 180 / Math.PI;
                        return Math.max(0, Math.min(70, Math.round(angle)));
                    }
                    function applyTilt(e) {
                        const t = tiltAngle(e);
                        setRoofAngleField(tiltKey, t);
                        _updateTiltHandle(side, t);
                    }
                    tiltSvg.addEventListener('pointerdown', e => {
                        active = true;
                        try { tiltSvg.setPointerCapture(e.pointerId); } catch(_) {}
                        applyTilt(e);
                    });
                    tiltSvg.addEventListener('pointermove', e => {
                        if(!active) return;
                        applyTilt(e);
                    });
                    tiltSvg.addEventListener('pointerup', () => { active = false; });
                    tiltSvg.addEventListener('pointercancel', () => { active = false; });
                    tiltSvg.addEventListener('click', applyTilt);
                }
            });
        }

        function renderRoofSolarGain(flowM3s) {
            _lastRoofFlow = flowM3s;
            const G0 = 800;
            const Gdiff = 120;
            const material = App.airChannels?.roofMaterial || 'tile_dark';
            const alpha = _roofAbsorption(material);
            const rhocp = 1206;
            const sunElev = 66.5 * Math.PI / 180;
            const area = Math.max(1, parseFloat(App.area) || 100);
            const flow = Math.max(0.001, parseFloat(flowM3s) || 0);
            const lengthA = Number.isFinite(parseFloat(App.airChannels?.roofOpenLengthAM))
                ? parseFloat(App.airChannels.roofOpenLengthAM)
                : (Number.isFinite(parseFloat(App.airChannels?.roofLengthAM)) ? parseFloat(App.airChannels.roofLengthAM) : 0);
            const lengthB = Number.isFinite(parseFloat(App.airChannels?.roofOpenLengthBM))
                ? parseFloat(App.airChannels.roofOpenLengthBM)
                : (Number.isFinite(parseFloat(App.airChannels?.roofLengthBM)) ? parseFloat(App.airChannels.roofLengthBM) : 0);
            const totalLength = Math.max(0, lengthA + lengthB);
            const customArea = Number.isFinite(parseFloat(App.airChannels?.roofCustomAreaM2)) ? parseFloat(App.airChannels.roofCustomAreaM2) : null;
            const heightCm = Number.isFinite(parseFloat(App.airChannels?.roofHeightCm)) ? parseFloat(App.airChannels.roofHeightCm) : null;
            const areaFromHeight = (Number.isFinite(heightCm) && heightCm > 0 && totalLength > 0) ? (heightCm / 100) * totalLength : null;
            const areaByGuideline = flow > 0 ? (flow / AGFF_CONFIG.guidelines.roof_speed_min) : null;
            const usedArea = Number.isFinite(areaFromHeight) && areaFromHeight > 0
                ? areaFromHeight
                : (Number.isFinite(customArea) && customArea > 0 ? customArea : areaByGuideline);
            const roofSpeed = Number.isFinite(usedArea) && usedArea > 0 ? (flow / usedArea) : null;
            const contactTimeSec = (Number.isFinite(roofSpeed) && roofSpeed > 0 && totalLength > 0) ? (totalLength / roofSpeed) : null;
            const tauRefSec = 2.5;
            const contactEffectiveness = Number.isFinite(contactTimeSec)
                ? Math.max(0.08, Math.min(1, 1 - Math.exp(-contactTimeSec / tauRefSec)))
                : 0.55;
            const cosIopt = Math.sin(sunElev) * Math.cos(30 * Math.PI / 180)
                + Math.cos(sunElev) * Math.sin(30 * Math.PI / 180);
            const Gopt = G0 * cosIopt + Gdiff * (1 + Math.cos(30 * Math.PI / 180)) / 2;

            function sideData(side) {
                const azKey = `roofAzimut${side.toUpperCase()}Deg`;
                const tiltKey = `roofTilt${side.toUpperCase()}Deg`;
                const lenKey = side === 'a' ? 'roofOpenLengthAM' : 'roofOpenLengthBM';
                const azDeg = Number.isFinite(parseFloat(App.airChannels?.[azKey])) ? parseFloat(App.airChannels[azKey]) : (side === 'a' ? 180 : 0);
                const tiltDeg = Number.isFinite(parseFloat(App.airChannels?.[tiltKey])) ? parseFloat(App.airChannels[tiltKey]) : 30;
                const fallbackKey = side === 'a' ? 'roofLengthAM' : 'roofLengthBM';
                const lengthM = Number.isFinite(parseFloat(App.airChannels?.[lenKey]))
                    ? parseFloat(App.airChannels[lenKey])
                    : (Number.isFinite(parseFloat(App.airChannels?.[fallbackKey])) ? parseFloat(App.airChannels[fallbackKey]) : null);
                const tiltRad = tiltDeg * Math.PI / 180;
                const azDiffRaw = ((azDeg - 180) + 360) % 360;
                const azDiffRad = (azDiffRaw > 180 ? azDiffRaw - 360 : azDiffRaw) * Math.PI / 180;
                const cosI = Math.sin(sunElev) * Math.cos(tiltRad) + Math.cos(sunElev) * Math.sin(tiltRad) * Math.cos(azDiffRad);
                const Geff = G0 * Math.max(0, cosI) + Gdiff * (1 + Math.cos(tiltRad)) / 2;
                const factor = Math.round((Geff / Math.max(1, Gopt)) * 100);
                let qWatt = null;
                if(lengthM && lengthM > 0) {
                    const spanH = area / (2 * lengthM);
                    const slopeLen = tiltDeg > 1 ? spanH / Math.cos(tiltRad) : spanH;
                    qWatt = Geff * (lengthM * slopeLen) * alpha;
                }
                return { Geff: Math.round(Geff), factor, qWatt };
            }

            const a = sideData('a');
            const b = sideData('b');
            const elA = document.getElementById('roof-solar-a');
            const elB = document.getElementById('roof-solar-b');
            const elG = document.getElementById('roof-heat-gain');
            const elM = document.getElementById('roof-material-factor');
            const elC = document.getElementById('roof-contact-time');
            function fcolor(f) {
                return f >= 80 ? 'text-amber-700 font-bold' : (f >= 50 ? 'text-yellow-700 font-bold' : 'text-slate-500 font-bold');
            }
            if(elA) { elA.className = fcolor(a.factor); elA.textContent = `${a.Geff} W/m² (${a.factor}% von optimal)`; }
            if(elB) { elB.className = fcolor(b.factor); elB.textContent = `${b.Geff} W/m² (${b.factor}% von optimal)`; }
            if(elM) {
                elM.className = 'font-bold text-slate-700';
                elM.textContent = `Absorptionsfaktor ${Math.round(alpha * 100)} %`;
            }
            if(elC) {
                if(Number.isFinite(contactTimeSec)) {
                    elC.className = 'font-bold text-slate-700';
                    elC.textContent = `${contactTimeSec.toFixed(2)} s (η ${(contactEffectiveness * 100).toFixed(0)} %)`;
                } else {
                    elC.className = 'font-bold text-slate-400';
                    elC.textContent = 'Kontaktlänge A/B und Querschnitt erfassen';
                }
            }
            if(elG) {
                if(a.qWatt !== null || b.qWatt !== null) {
                    const totalQRaw = (a.qWatt || 0) + (b.qWatt || 0);
                    const totalQ = totalQRaw * contactEffectiveness;
                    const dT = totalQ / (rhocp * flow);
                    elG.className = `font-bold ${dT > 3 ? 'text-amber-700' : 'text-slate-700'}`;
                    elG.textContent = `+${dT.toFixed(1)} K Vorwärmung (${Math.round(totalQ / 1000)} kW solar @ ${flow.toFixed(1)} m³/s)`;
                } else {
                    elG.className = 'font-bold text-slate-400';
                    elG.textContent = 'Kontaktlänge A/B für Wärmepfad erfassen';
                }
            }
        }
        function getAirChannelSpeedStatus(areaM2, flowM3s, config = {}) {
            const min = Number.isFinite(parseFloat(config.min)) ? parseFloat(config.min) : AGFF_CONFIG.guidelines.channel_speed_min;
            const max = Number.isFinite(parseFloat(config.max)) ? parseFloat(config.max) : AGFF_CONFIG.guidelines.channel_speed_max;
            const limit = Number.isFinite(parseFloat(config.limit)) ? parseFloat(config.limit) : AGFF_CONFIG.guidelines.channel_speed_limit;
            const label = config.label || 'Soll';
            const area = parseFloat(areaM2);
            const flow = Math.max(0, parseFloat(flowM3s) || 0);
            if(!Number.isFinite(area) || area <= 0) {
                return { text: 'Querschnitt erfassen', className: 'text-slate-500', speed: null };
            }
            if(flow <= 0) {
                return { text: 'Luftmenge erforderlich', className: 'text-slate-500', speed: null };
            }
            const speed = flow / area;
            if(speed < min) {
                return { text: `${speed.toFixed(2)} m/s: zu tief (${label} ${min.toFixed(1)}-${max.toFixed(1)})`, className: 'text-red-700 font-bold', speed };
            }
            if(speed <= max) {
                return { text: `${speed.toFixed(2)} m/s: im Sollbereich`, className: 'text-emerald-700 font-bold', speed };
            }
            if(speed <= limit) {
                return { text: `${speed.toFixed(2)} m/s: erhöht (max ${limit.toFixed(1)})`, className: 'text-amber-700 font-bold', speed };
            }
            return { text: `${speed.toFixed(2)} m/s: zu hoch (>${limit.toFixed(1)})`, className: 'text-red-700 font-bold', speed };
        }
        function renderRoofExtraction(flowM3s) {
            const widthAInp = document.getElementById('inp-roof-open-width-a');
            const widthBInp = document.getElementById('inp-roof-open-width-b');
            const lenAInp = document.getElementById('inp-roof-open-length-a');
            const lenBInp = document.getElementById('inp-roof-open-length-b');
            const customAreaInp = document.getElementById('inp-roof-custom-area');
            const heightInp = document.getElementById('inp-roof-height-cm');
            const materialSel = document.getElementById('inp-roof-material');
            const totalLenOut = document.getElementById('roof-total-length');
            const recAreaOut = document.getElementById('roof-recommended-area');
            const rangeOut = document.getElementById('roof-height-range');
            const speedOut = document.getElementById('roof-current-speed');

            const widthA = Number.isFinite(parseFloat(App.airChannels?.roofOpenWidthAM)) ? parseFloat(App.airChannels.roofOpenWidthAM) : null;
            const widthB = Number.isFinite(parseFloat(App.airChannels?.roofOpenWidthBM)) ? parseFloat(App.airChannels.roofOpenWidthBM) : null;
            const lengthA = Number.isFinite(parseFloat(App.airChannels?.roofOpenLengthAM))
                ? parseFloat(App.airChannels.roofOpenLengthAM)
                : (Number.isFinite(parseFloat(App.airChannels?.roofLengthAM)) ? parseFloat(App.airChannels.roofLengthAM) : null);
            const lengthB = Number.isFinite(parseFloat(App.airChannels?.roofOpenLengthBM))
                ? parseFloat(App.airChannels.roofOpenLengthBM)
                : (Number.isFinite(parseFloat(App.airChannels?.roofLengthBM)) ? parseFloat(App.airChannels.roofLengthBM) : null);
            const customArea = Number.isFinite(parseFloat(App.airChannels?.roofCustomAreaM2)) ? parseFloat(App.airChannels.roofCustomAreaM2) : null;
            const heightCm = Number.isFinite(parseFloat(App.airChannels?.roofHeightCm)) ? parseFloat(App.airChannels.roofHeightCm) : null;
            const totalLength = (lengthA || 0) + (lengthB || 0);
            const areaByWidthLength = ((widthA || 0) * (lengthA || 0)) + ((widthB || 0) * (lengthB || 0));
            const flow = Math.max(0, parseFloat(flowM3s) || 0);

            if(widthAInp) widthAInp.value = widthA ? widthA.toFixed(2) : '';
            if(widthBInp) widthBInp.value = widthB ? widthB.toFixed(2) : '';
            if(lenAInp) lenAInp.value = lengthA ? lengthA.toFixed(1) : '';
            if(lenBInp) lenBInp.value = lengthB ? lengthB.toFixed(1) : '';
            if(customAreaInp) customAreaInp.value = customArea ? customArea.toFixed(2) : '';
            if(heightInp) heightInp.value = heightCm ? heightCm.toFixed(1) : '';
            if(materialSel) materialSel.value = App.airChannels?.roofMaterial || 'tile_dark';

            const refArea = flow > 0 ? (flow / AGFF_CONFIG.guidelines.roof_speed_min) : null;
            const areaFromHeight = (Number.isFinite(heightCm) && heightCm > 0 && totalLength > 0) ? ((heightCm / 100) * totalLength) : null;
            const usedArea = Number.isFinite(customArea) && customArea > 0
                ? customArea
                : (Number.isFinite(areaFromHeight) && areaFromHeight > 0
                    ? areaFromHeight
                    : (areaByWidthLength > 0 ? areaByWidthLength : refArea));
            if(totalLenOut) totalLenOut.innerText = totalLength > 0 ? `${totalLength.toFixed(1)} m` : '-';
            if(recAreaOut) recAreaOut.innerText = Number.isFinite(refArea) ? `${refArea.toFixed(2)} m²` : '-';

            if(rangeOut) {
                if(flow > 0 && totalLength > 0) {
                    const hMin = (flow / (AGFF_CONFIG.guidelines.roof_speed_max * totalLength)) * 100;
                    const hMax = (flow / (AGFF_CONFIG.guidelines.roof_speed_min * totalLength)) * 100;
                    rangeOut.innerText = `${hMin.toFixed(1)}-${hMax.toFixed(1)} cm (für 4-6 m/s)`;
                } else {
                    rangeOut.innerText = 'Öffnungslänge und Luftmenge erforderlich';
                }
            }

            if(speedOut) {
                if(flow <= 0) {
                    speedOut.className = 'text-[11px] text-slate-500';
                    speedOut.innerText = 'Luftmenge erforderlich';
                } else if(Number.isFinite(areaFromHeight) && areaFromHeight > 0) {
                    const speed = flow / Math.max(0.0001, areaFromHeight);
                    const status = getAirChannelSpeedStatus(areaFromHeight, flow, {
                        min: AGFF_CONFIG.guidelines.roof_speed_min,
                        max: AGFF_CONFIG.guidelines.roof_speed_max,
                        limit: AGFF_CONFIG.guidelines.roof_speed_max + 1,
                        label: 'Dach'
                    });
                    speedOut.className = `text-[11px] ${status.className}`;
                    speedOut.innerText = `Aktuell ${speed.toFixed(2)} m/s (${areaFromHeight.toFixed(2)} m²)`;
                } else if(areaByWidthLength > 0) {
                    const speed = flow / areaByWidthLength;
                    speedOut.className = 'text-[11px] text-slate-600';
                    speedOut.innerText = `Mit Breite×Länge ${areaByWidthLength.toFixed(2)} m²: ${speed.toFixed(2)} m/s`;
                } else if(Number.isFinite(usedArea) && usedArea > 0) {
                    const speed = flow / usedArea;
                    speedOut.className = 'text-[11px] text-slate-600';
                    speedOut.innerText = `Mit Ansaugfläche ${usedArea.toFixed(2)} m²: ${speed.toFixed(2)} m/s`;
                } else {
                    speedOut.className = 'text-[11px] text-slate-500';
                    speedOut.innerText = 'Ansaugfläche oder Kanalhöhe erfassen';
                }
            }
            renderRoofSolarGain(flow);
        }
        function renderAirChannelStatus(flowM3s) {
            const intakeInp = document.getElementById('inp-intake-area');
            const supplyInp = document.getElementById('inp-supply-area');
            const intakeStatus = document.getElementById('air-intake-status');
            const supplyStatus = document.getElementById('air-supply-status');
            const intakeMin = document.getElementById('air-intake-min');
            const supplyMin = document.getElementById('air-supply-min');
            const flowOut = document.getElementById('air-channel-flow-target');
            const guideline = document.getElementById('air-channel-guideline');
            if(intakeInp) intakeInp.value = Number.isFinite(parseFloat(App.airChannels?.intakeAreaM2)) ? parseFloat(App.airChannels.intakeAreaM2).toFixed(2) : '';
            if(supplyInp) supplyInp.value = Number.isFinite(parseFloat(App.airChannels?.supplyAreaM2)) ? parseFloat(App.airChannels.supplyAreaM2).toFixed(2) : '';
            const flow = Math.max(0, parseFloat(flowM3s) || 0);
            const minIntakeArea = flow > 0 ? flow / AGFF_CONFIG.guidelines.intake_speed_ref : null;
            const minSupplyArea = flow > 0 ? flow / AGFF_CONFIG.guidelines.supply_speed_ref : null;
            const intake = getAirChannelSpeedStatus(App.airChannels?.intakeAreaM2, flow, {
                min: AGFF_CONFIG.guidelines.intake_speed_min,
                max: AGFF_CONFIG.guidelines.intake_speed_max,
                limit: AGFF_CONFIG.guidelines.intake_speed_limit,
                label: 'Sammelkanal'
            });
            const supply = getAirChannelSpeedStatus(App.airChannels?.supplyAreaM2, flow, {
                min: AGFF_CONFIG.guidelines.supply_speed_min,
                max: AGFF_CONFIG.guidelines.supply_speed_max,
                limit: AGFF_CONFIG.guidelines.supply_speed_limit,
                label: 'Druckkanal'
            });
            if(intakeStatus) {
                intakeStatus.className = `mt-1 text-[11px] ${intake.className}`;
                intakeStatus.innerText = intake.text;
            }
            if(supplyStatus) {
                supplyStatus.className = `mt-1 text-[11px] ${supply.className}`;
                supplyStatus.innerText = supply.text;
            }
            if(intakeMin) intakeMin.innerText = Number.isFinite(minIntakeArea) ? `${minIntakeArea.toFixed(2)} m² (bei 4.0 m/s)` : '-';
            if(supplyMin) supplyMin.innerText = Number.isFinite(minSupplyArea) ? `${minSupplyArea.toFixed(2)} m² (bei 10.0 m/s)` : '-';
            if(flowOut) flowOut.innerText = `${flow.toFixed(2)} m³/s`;
            if(guideline) guideline.innerText = 'Sammelkanal: Richtwert 4 m/s (Bereich 3-5 m/s). Druckkanal: Richtwert 10 m/s (Bereich 8-12 m/s).';
            renderRoofExtraction(flow);
        }
        function setAreaTop(v) {
            const parsed = parseFloat(v);
            App.area = Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
            applyAutoGrateHeightByArea();
            guideStep(2);
            // When area changes and fan is configured, the flow spec remains the same,
            // and the flow will be recalculated based on the fan curve via update()
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
            App.flowSpecTarget = Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
            // When flow spec (speed) changes and fan is configured, 
            // the flow will be automatically recalculated based on the fan curve via update()
            update();
            saveData();
        }
        function adjustFlowSpec(delta) {
            const base = Number.isFinite(parseFloat(App.flowSpecTarget)) ? parseFloat(App.flowSpecTarget) : 0;
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
        function copyAirQualityToClipboard() {
            const lines = [
                `${t('air.outside','Aussen')}: ${App.vals.t1.toFixed(1)}\u00b0C, ${App.vals.h1.toFixed(0)}% rF`,
                `${t('air.supply','Zuluft')}: ${App.vals.t2.toFixed(1)}\u00b0C, ${App.vals.h2.toFixed(0)}% rF`,
                `${t('air.exhaust','Abluft')}: ${App.vals.t3.toFixed(1)}\u00b0C, ${App.vals.h3.toFixed(0)}% rF`
            ];
            navigator.clipboard.writeText(lines.join('\n')).then(() => {
                const btn = document.querySelector('[onclick="copyAirQualityToClipboard()"]');
                if(btn) {
                    const icon = btn.querySelector('i');
                    if(icon) { icon.setAttribute('data-lucide','check'); lucide.createIcons({nodes:[icon]}); }
                    btn.classList.add('border-green-300','bg-green-50','text-green-700');
                    setTimeout(() => {
                        if(icon) { icon.setAttribute('data-lucide','clipboard-copy'); lucide.createIcons({nodes:[icon]}); }
                        btn.classList.remove('border-green-300','bg-green-50','text-green-700');
                    }, 1500);
                }
            });
        }
        function resetAllInputs() {
            // Keep configured storage/fan setup; reset only measured/process values.
            App.vals = { ...DEFAULT_APP_STATE.vals };
            App.sim = { ...DEFAULT_APP_STATE.sim };
            simMemory = { ...DEFAULT_APP_STATE.sim };
            simBaselineAir = null;
            simEnabled = false;
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
            if(simToggleBtn) {
                simToggleBtn.classList.remove('sim-btn-active');
                simToggleBtn.title = 'Simulation aus';
            }
            const simEffect = document.getElementById('sim-effect');
            if(simEffect) simEffect.classList.add('hidden');

            const measPressure = document.getElementById('inp-meas-p');
            if(measPressure) measPressure.value = '';
            const pUnit = document.getElementById('p-unit');
            if(pUnit) { pUnit.value = '0.01'; _lastPressureUnitFactor = 0.01; }

            const areaInp = document.getElementById('inp-area');
            if(areaInp) areaInp.value = App.area;
            const areaTop = document.getElementById('inp-area-top');
            if(areaTop) areaTop.value = App.area;
            const flowSpecIn = document.getElementById('flow-spec-in');
            if(flowSpecIn) flowSpecIn.value = (parseFloat(App.flowSpecTarget) || 0).toFixed(2);
            const stockHInp = document.getElementById('inp-stock-h');
            if(stockHInp) stockHInp.value = Number.isFinite(parseFloat(App.stockHeightManual)) ? parseFloat(App.stockHeightManual).toFixed(1) : '';
            const grateInp = document.getElementById('inp-grate-height-cm');
            if(grateInp) grateInp.value = Math.round(Math.max(0, parseFloat(App.grateHeightCm) || 0));
            const intakeInp = document.getElementById('inp-intake-area');
            const supplyInp = document.getElementById('inp-supply-area');
            if(intakeInp) intakeInp.value = Number.isFinite(parseFloat(App.airChannels?.intakeAreaM2)) ? parseFloat(App.airChannels.intakeAreaM2).toFixed(2) : '';
            if(supplyInp) supplyInp.value = Number.isFinite(parseFloat(App.airChannels?.supplyAreaM2)) ? parseFloat(App.airChannels.supplyAreaM2).toFixed(2) : '';
            renderFanPickerCurrent();

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

        function displayFanModel() {
            const fanModelDisplay = document.getElementById('fan-model-display');
            if(!fanModelDisplay) return;
            
            const hasFanConfig = ((Array.isArray(App.fan.curve) && App.fan.curve.length > 0) || (parseFloat(App.fan.pmax) || 0) > 0 || (parseFloat(App.fan.flow) || 0) > 0);
            if(hasFanConfig && App.fan.label) {
                fanModelDisplay.innerText = `Lüfter: ${App.fan.label}`;
                fanModelDisplay.classList.remove('hidden');
            } else {
                fanModelDisplay.classList.add('hidden');
            }
        }

        function calculateFlowFromPressure(targetPressure) {
            // Interpolate flow from fan curve based on target pressure
            if(!Array.isArray(App.fan.curve) || App.fan.curve.length === 0) return null;
            
            const pts = App.fan.curve.sort((a,b) => a.p - b.p);
            if(targetPressure >= App.fan.pmax) return 0;
            
            let p1 = pts[0], p2 = pts[pts.length-1];
            for(let i = 0; i < pts.length - 1; i++) {
                if(targetPressure >= pts[i].p && targetPressure <= pts[i+1].p) {
                    p1 = pts[i];
                    p2 = pts[i+1];
                    break;
                }
            }
            
            if(targetPressure < p1.p) {
                p2 = p1;
                p1 = {p: 0, q: p1.q, kw: p1.kw};
            }
            
            const r = (targetPressure - p1.p) / (p2.p - p1.p);
            return p1.q + (p2.q - p1.q) * r;
        }

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
            const isChannels = tab === 'kanaele';
            if(isFan) App.flags.fanConfigured = true;
            if(!isFan) App.flags.storageConfigured = true;
            const fanPanel = document.getElementById('panel-heucheck-luefter');
            const lagerPanel = document.getElementById('panel-heucheck-lager');
            const channelsPanel = document.getElementById('panel-heucheck-kanaele');
            const fanTab = document.getElementById('tab-heucheck-luefter');
            const lagerTab = document.getElementById('tab-heucheck-lager');
            const channelsTab = document.getElementById('tab-heucheck-kanaele');
            if(fanPanel) fanPanel.classList.toggle('hidden', !isFan);
            if(lagerPanel) lagerPanel.classList.toggle('hidden', isFan || isChannels);
            if(channelsPanel) channelsPanel.classList.toggle('hidden', !isChannels);
            if(fanTab) fanTab.classList.toggle('active', isFan);
            if(lagerTab) lagerTab.classList.toggle('active', !isFan && !isChannels);
            if(channelsTab) channelsTab.classList.toggle('active', isChannels);
            if(isFan) {
                openFanPicker(true);
                updateFanChart();
                update();
                return;
            }
            if(isChannels) {
                const flowM3s = Math.max(0, parseFloat(App.area) || 0) * Math.max(0, parseFloat(App.flowSpecTarget) || 0);
                renderAirChannelStatus(flowM3s);
                setTimeout(initRoofOrientationWidgets, 0);
                update();
                return;
            }
            openLayersModal();
            update();
        }
        function openHeucheckModal(tab = 'lager') {
            setHeucheckTab(tab);
            updateHeucheckStorageHeader();
            openDialogById('heucheck-modal');
            setTimeout(initRoofOrientationWidgets, 50);
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
            wrap.classList.remove('hidden');
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
                wrap.classList.add('hidden');
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
        function setHxFullscreenZoom(enabled) {
            if(!hxChart || !hxChart.options?.plugins?.zoom) return;
            hxChart.options.plugins.zoom.pan.enabled = !!enabled;
            hxChart.options.plugins.zoom.zoom.wheel.enabled = !!enabled;
            hxChart.options.plugins.zoom.zoom.pinch.enabled = !!enabled;
            hxChart.options.plugins.zoom.zoom.drag.enabled = !!enabled;
            if(!enabled && typeof hxChart.resetZoom === 'function') hxChart.resetZoom();
            hxChart.update('none');
        }
        function resetHxZoom() {
            if(!hxChart || typeof hxChart.resetZoom !== 'function') return;
            hxChart.resetZoom();
            hxChart.update('none');
        }
        function toggleFullscreen() {
            const box = document.getElementById('chart-container');
            if(!box) return;
            box.classList.toggle('chart-fs');
            const isFullscreen = box.classList.contains('chart-fs');
            setHxFullscreenZoom(isFullscreen);
            setTimeout(() => {
                if(hxChart) { hxChart.resize(); hxChart.update(); }
            }, 100);
        }
        function manualInput(id, v) {
            registerUsageCalc();
            let val = parseFloat(v); if(id.includes('h')) val = Math.max(0, Math.min(100, val));
            if(id.includes('t')) val = roundTemp(val);
            App.vals[id] = val; document.getElementById(id+'-in').value = val.toFixed(id.includes('t')?1:0);
            if(id === 't1' && !simEnabled) {
                App.vals.t2 = App.vals.t1;
                const t2Input = document.getElementById('t2-in');
                if(t2Input) t2Input.value = App.vals.t2.toFixed(1);
            }
            if(id === 'h1' && !simEnabled) {
                App.vals.h2 = App.vals.h1;
                const h2Input = document.getElementById('h2-in');
                if(h2Input) h2Input.value = App.vals.h2.toFixed(0);
            }
            if(id === 't1' || id === 'h1') guideStep(3);
            if(id === 't2' || id === 'h2') guideStep(4);
            if(id === 'h3') guideStep(5);
            if(id.includes('1') && simEnabled) runSim(null,null); if(id.includes('1') || id.includes('2') || id.includes('h3')) autoStep3(); update();
        }
        let _lastPressureUnitFactor = 0.01; // Pa default (matches initial selected option)
        function changePressureUnit(selectEl) {
            const newFactor = parseFloat(selectEl.value);
            const inp = document.getElementById('inp-meas-p');
            if(inp && inp.value !== '' && _lastPressureUnitFactor > 0 && newFactor > 0) {
                const valInMbar = parseFloat(inp.value) * _lastPressureUnitFactor;
                if(Number.isFinite(valInMbar)) {
                    inp.value = parseFloat((valInMbar / newFactor).toFixed(newFactor === 0.01 ? 0 : 1));
                }
            }
            _lastPressureUnitFactor = newFactor;
            update();
        }
        window.changePressureUnit = changePressureUnit;

        function setPressureMode(meas) {
            if(!meas) {
                if(!hasPressureCalcPrerequisites()) return;
            }
            App.useMeas = meas;
            App.pressureModeAutoApplied = hasPressureCalcPrerequisites();
            update();
        }

        function applySimToggleUi() {
            const panel = document.getElementById('sim-panel');
            const btn = document.getElementById('sim-toggle-btn');
            if(panel) panel.classList.toggle('hidden', !simEnabled);
            if(btn) {
                btn.classList.toggle('sim-btn-active', simEnabled);
                btn.title = simEnabled ? 'Simulation ein' : 'Simulation aus';
            }
            const simEffectEl = document.getElementById('sim-effect');
            if(!simEnabled && simEffectEl) simEffectEl.classList.add('hidden');
        }

        function toggleSimPanel() {
            if(simEnabled) {
                simMemory = {
                    heat: Number.isFinite(parseFloat(App.sim?.heat)) ? parseFloat(App.sim.heat) : 0,
                    dehum: Number.isFinite(parseFloat(App.sim?.dehum)) ? parseFloat(App.sim.dehum) : 0
                };
                if(simBaselineAir) {
                    const restoredT2 = Number.isFinite(parseFloat(simBaselineAir.t2)) ? roundTemp(parseFloat(simBaselineAir.t2)) : App.vals.t2;
                    const restoredH2Raw = Number.isFinite(parseFloat(simBaselineAir.h2)) ? parseFloat(simBaselineAir.h2) : App.vals.h2;
                    const restoredH2 = Math.max(0, Math.min(100, restoredH2Raw));
                    App.vals.t2 = restoredT2;
                    App.vals.h2 = restoredH2;
                    const t2Inp = document.getElementById('t2-in');
                    const h2Inp = document.getElementById('h2-in');
                    if(t2Inp) t2Inp.value = restoredT2.toFixed(1);
                    if(h2Inp) h2Inp.value = restoredH2.toFixed(0);
                    simBaselineAir = null;
                }
                simEnabled = false;
                applySimToggleUi();
                autoStep3();
                update();
                saveData();
                return;
            }

            const t2InputNow = parseFloat(document.getElementById('t2-in')?.value);
            const h2InputNow = parseFloat(document.getElementById('h2-in')?.value);
            simBaselineAir = {
                t2: Number.isFinite(t2InputNow)
                    ? t2InputNow
                    : (Number.isFinite(parseFloat(App.vals?.t2)) ? parseFloat(App.vals.t2) : 20),
                h2: Number.isFinite(h2InputNow)
                    ? h2InputNow
                    : (Number.isFinite(parseFloat(App.vals?.h2)) ? parseFloat(App.vals.h2) : 60)
            };
            simEnabled = true;
            if(!App.sim || typeof App.sim !== 'object') App.sim = { ...DEFAULT_APP_STATE.sim };
            App.sim.heat = Number.isFinite(parseFloat(simMemory.heat)) ? parseFloat(simMemory.heat) : 0;
            App.sim.dehum = Number.isFinite(parseFloat(simMemory.dehum)) ? parseFloat(simMemory.dehum) : 0;
            const simDehum = document.getElementById('sim-dehum');
            const simHeat = document.getElementById('sim-heat');
            const simDehumDisp = document.getElementById('disp-sim-dehum');
            const simHeatDisp = document.getElementById('disp-sim-heat');
            if(simDehum) simDehum.value = String(App.sim.dehum);
            if(simHeat) simHeat.value = String(App.sim.heat);
            if(simDehumDisp) simDehumDisp.innerText = `${App.sim.dehum.toFixed(0)} kW`;
            if(simHeatDisp) simHeatDisp.innerText = `${App.sim.heat.toFixed(0)} kW`;
            applySimToggleUi();
            runSim(null, null);
            saveData();
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
            if(type) {
                const parsed = parseFloat(val);
                App.sim[type] = Number.isFinite(parsed) ? parsed : 0;
                simMemory[type] = App.sim[type];
                const disp = document.getElementById('disp-sim-' + type);
                if(disp) disp.innerText = `${App.sim[type].toFixed(0)} kW`;
            }
            if(!simEnabled) {
                const simEffectEl = document.getElementById('sim-effect');
                if(simEffectEl) simEffectEl.classList.add('hidden');
                update();
                return;
            }
            const p = getAmbientPressure(); const rho = PHY.dens(App.vals.t1, p);
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
            const p = getAmbientPressure(); const x2 = PHY.abs(App.vals.t2, App.vals.h2, p)/1000; const ent = 1.006*App.vals.t2 + x2*(2501+1.86*App.vals.t2);
            let t=App.vals.t2; for(let i=0;i<200;i++){ t-=0.1; const xReq = (ent - 1.006*t)/(2501+1.86*t); if(PHY.rel(t, xReq*1000, p) >= App.vals.h3) break; }
            App.vals.t3 = roundTemp(t); document.getElementById('t3-in').value=App.vals.t3.toFixed(1);
        }

        function update() {
            const p = getAmbientPressure();
            App.area = Math.max(1, parseFloat(App.area) || 1);
            App.flowSpecTarget = Math.max(0, parseFloat(App.flowSpecTarget) || 0);
            applyAutoGrateHeightByArea();
            const isStandardAutoFan = App.fan.autoScaleStandard === true && (App.fan.label || '') === 'Standard' && App.fan.mode !== 'simple';
            const pressureBreakdown = getPressureBreakdown();

            const areaTop = document.getElementById('inp-area-top');
            if(areaTop) areaTop.value = App.area.toFixed(0);

            const areaInp = document.getElementById('inp-area');
            if(areaInp) areaInp.value = App.area;
            
            const hasPressurePrereqs = hasPressureCalcPrerequisites();
            if(hasPressurePrereqs) {
                if(App.pressureModeAutoApplied !== true) {
                    App.useMeas = false;
                    App.pressureModeAutoApplied = true;
                }
            } else {
                App.useMeas = true;
                App.pressureModeAutoApplied = false;
            }
            let stackP = pressureBreakdown.totalPressureMbar;
            
            const pUnit = parseFloat(document.getElementById('p-unit').value);
            const unitTxt = document.getElementById('p-unit').options[document.getElementById('p-unit').selectedIndex].text;
            document.querySelectorAll('.unit-label').forEach(el => el.innerText = unitTxt);
            const calcValEl = document.getElementById('val-calc-p');
            const calcHintEl = document.getElementById('calc-p-hint');
            const statusWarningEl = document.getElementById('status-pressure-warning');
            const calcFodderBtn = document.getElementById('calc-p-fodder-btn');
            if(hasPressurePrereqs) {
                if(calcValEl) calcValEl.innerText = (stackP / pUnit).toFixed(1);
                if(calcHintEl) calcHintEl.classList.add('hidden');
            } else {
                if(calcValEl) calcValEl.innerText = '-';
                if(calcHintEl) calcHintEl.classList.remove('hidden');
            }
            if(statusWarningEl) statusWarningEl.classList.toggle('hidden', hasPressurePrereqs);
            if(calcFodderBtn) {
                calcFodderBtn.classList.toggle('hidden', hasPressurePrereqs);
                calcFodderBtn.classList.toggle('inline-flex', !hasPressurePrereqs);
                calcFodderBtn.classList.toggle('attention-blink', !hasPressurePrereqs);
            }

            let effectiveP = stackP;
            const bCalc = document.getElementById('box-calc-p'), bMeas = document.getElementById('box-meas-p');
            if(!hasPressurePrereqs) {
                App.useMeas = true;
                effectiveP = parseFloat(document.getElementById('inp-meas-p')?.value || 0) * pUnit;
                if(bCalc) bCalc.className = "p-box inactive rounded-lg opacity-50 cursor-not-allowed";
                if(bMeas) bMeas.className = "p-box active rounded-lg relative";
            } else if(App.useMeas) {
                const inpVal = parseFloat(document.getElementById('inp-meas-p').value) || 0; effectiveP = inpVal * pUnit;
                bMeas.className = "p-box active rounded-lg relative"; bCalc.className = "p-box inactive rounded-lg";
            } else {
                bCalc.className = "p-box active rounded-lg"; bMeas.className = "p-box inactive rounded-lg relative";
            }

            const aeroWrap = document.getElementById('aero-live-wrap');
            const aeroLockHint = document.getElementById('aero-live-lock-hint');
            const stockHeightLive = document.getElementById('det-stock-height-live');
            const stockResistanceDensityLive = document.getElementById('det-stock-resistance-density');
            const systemSurchargeLive = document.getElementById('det-system-surcharge-live');
            if(stockHeightLive) stockHeightLive.innerText = `${pressureBreakdown.effectiveHeight > 0 ? pressureBreakdown.effectiveHeight.toFixed(1) : '0.0'} m`;
            if(stockResistanceDensityLive) stockResistanceDensityLive.innerText = `${pressureBreakdown.stackPressureLayersPa.toFixed(0)} Pa / ${pressureBreakdown.avgDensity > 0 ? pressureBreakdown.avgDensity.toFixed(0) + ' kg FS/m³' : '-'}`;
            if(systemSurchargeLive) systemSurchargeLive.innerText = `${pressureBreakdown.systemPressurePa.toFixed(0)} Pa`;
            if(aeroWrap) {
                if(hasPressurePrereqs) {
                    aeroWrap.classList.remove('aero-live-locked');
                    aeroWrap.open = true;
                    if(aeroLockHint) aeroLockHint.classList.add('hidden');
                } else {
                    aeroWrap.classList.add('aero-live-locked');
                    aeroWrap.open = false;
                    if(aeroLockHint) aeroLockHint.classList.remove('hidden');
                }
            }
            renderFanSuggestions();
            
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
                     const targetFlow = App.area * App.flowSpecTarget;
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
              if(flowSpecIn) flowSpecIn.value = App.flowSpecTarget.toFixed(2);
              const flowTotalOut = document.getElementById('flow-total');
              if(flowTotalOut) flowTotalOut.innerText = App.fan.flow.toFixed(1);
            const speed = flow / App.area;
            renderAirChannelStatus(flow);
            const rho = PHY.dens(App.vals.t2, p);
            const dx = PHY.abs(App.vals.t3, App.vals.h3, p) - PHY.abs(App.vals.t2, App.vals.h2, p);
            const removalLh = dx * rho * flow * 3.6;
            const wm3 = (dx*rho);

            // Berechnungsgrundlagen-Anzeige
            const _cAlt = document.getElementById('calc-alt'); if(_cAlt) _cAlt.innerText = (App.params.alt||0).toFixed(0);
            const _cP = document.getElementById('calc-p-hpa'); if(_cP) _cP.innerText = p.toFixed(0);
            const _cX2 = document.getElementById('calc-x2'); if(_cX2) _cX2.innerText = PHY.abs(App.vals.t2, App.vals.h2, p).toFixed(2);
            const _cX3 = document.getElementById('calc-x3'); if(_cX3) _cX3.innerText = PHY.abs(App.vals.t3, App.vals.h3, p).toFixed(2);
            const _cDx = document.getElementById('calc-dx'); if(_cDx) _cDx.innerText = dx.toFixed(2);
            const _cRho = document.getElementById('calc-rho'); if(_cRho) _cRho.innerText = rho.toFixed(3);

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
            
            const simUse = simEnabled ? App.sim : { heat: 0, dehum: 0 };
            const totalCost = (power + simUse.dehum + simUse.heat/2) * (App.params.price/100);
            document.getElementById('det-elec').innerText = (power + simUse.dehum).toFixed(1) + " kWh";
            document.getElementById('det-elec-cost').innerText = ((power + simUse.dehum) * App.params.price/100).toFixed(2) + " CHF";
            document.getElementById('det-heat').innerText = simUse.heat.toFixed(1) + " kWh";
            document.getElementById('det-oil').innerText = (simUse.heat/10).toFixed(1) + " L";
            document.getElementById('det-heat-cost').innerText = (simUse.heat * App.params.priceHeat/100).toFixed(2) + " CHF";
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
            displayFanModel();
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

                const labelsToDraw = [];

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

                    const isFifty = dataset.rhLabel === 50;
                    const isHundred = dataset.rhLabel === 100;
                    labelsToDraw.push({
                        text: `${dataset.rhLabel}%`,
                        x,
                        y,
                        align,
                        color: (isFifty || isHundred) ? '#334155' : '#64748b',
                        fontWeight: (isFifty || isHundred) ? '700' : '500'
                    });
                });

                if(labelsToDraw.length) {
                    const topLimit = chartArea.top + 8;
                    const bottomLimit = chartArea.bottom - 8;
                    const minGap = 11;

                    labelsToDraw.sort((a, b) => a.y - b.y);
                    labelsToDraw[0].y = Math.max(topLimit, labelsToDraw[0].y);
                    for(let i = 1; i < labelsToDraw.length; i++) {
                        labelsToDraw[i].y = Math.max(labelsToDraw[i].y, labelsToDraw[i - 1].y + minGap);
                    }

                    const overflow = labelsToDraw[labelsToDraw.length - 1].y - bottomLimit;
                    if(overflow > 0) {
                        labelsToDraw[labelsToDraw.length - 1].y = bottomLimit;
                        for(let i = labelsToDraw.length - 2; i >= 0; i--) {
                            labelsToDraw[i].y = Math.min(labelsToDraw[i].y, labelsToDraw[i + 1].y - minGap);
                        }
                        if(labelsToDraw[0].y < topLimit) {
                            labelsToDraw[0].y = topLimit;
                            for(let i = 1; i < labelsToDraw.length; i++) {
                                labelsToDraw[i].y = Math.max(labelsToDraw[i].y, labelsToDraw[i - 1].y + minGap);
                            }
                        }
                    }

                    labelsToDraw.forEach(label => {
                        ctx.textAlign = label.align;
                        ctx.fillStyle = label.color;
                        ctx.font = `${label.fontWeight} 10px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`;
                        ctx.fillText(label.text, label.x, label.y);
                    });
                }

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
            const customNameInput = document.getElementById('inp-custom-fan-name');

            if(pressureSelect) pressureSelect.value = fanEditorUnitState.pressure;
            if(flowSelect) flowSelect.value = fanEditorUnitState.flow;
            if(pressureHead) pressureHead.innerText = pressureUnit.label;
            if(flowHead) flowHead.innerText = flowUnit.label;
            if(customNameInput && document.activeElement !== customNameInput) customNameInput.value = App.fan.label || '';
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

        function initChartZoomPlugin() {
            const candidate = window.ChartZoom || window['chartjs-plugin-zoom'] || window.chartjsPluginZoom;
            const zoomPlugin = candidate?.default || candidate;
            if(!window.Chart || !zoomPlugin) return;
            if(window.__agffChartZoomRegistered) return;
            try {
                Chart.register(zoomPlugin);
                window.__agffChartZoomRegistered = true;
            } catch(e) {
                // Fallback uses manual x-window zooming when plugin registration fails.
                window.__agffChartZoomRegistered = false;
            }
        }

        function initCharts() { 
            initChartZoomPlugin();
            const hxCtx = document.getElementById('hxChart').getContext('2d'); hxChart = new Chart(hxCtx, { type: 'line', data: {datasets:[]}, plugins:[hxRhLabelPlugin], options: { responsive:true, maintainAspectRatio:false, layout:{padding:{right:2, top:14}}, plugins:{legend:{display:false},tooltip:{enabled:true, callbacks: { label: c => c.parsed.y.toFixed(1) + ' g/m³' }},zoom:{pan:{enabled:false,mode:'xy'},zoom:{wheel:{enabled:false},pinch:{enabled:false},drag:{enabled:false},mode:'xy'},limits:{x:{min:0,max:40},y:{min:0,max:40}}}}, scales:{x:{type:'linear',min:0,max:40,title:{display:true,text:'Temperatur (°C)',color:'#64748b',font:{size:10,weight:'600'},padding:{top:4}},ticks:{color:'#94a3b8',font:{size:9,weight:'500'}}}, y:{min:0,max:40,title:{display:true,text:'Absolute Feuchte (g/m³)',color:'#64748b',font:{size:10,weight:'600'},padding:{bottom:4}},ticks:{color:'#94a3b8',font:{size:9,weight:'500'}}}} } }); 
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
                        plugins: {
                            legend: { display: true, labels: { boxWidth: 8, font: { size: 10 } } },
                            tooltip: {
                                callbacks: {
                                    title: (items) => {
                                        const x = Number(items?.[0]?.parsed?.x);
                                        const d = new Date(x);
                                        return Number.isNaN(d.getTime())
                                            ? '-'
                                            : d.toLocaleString([], { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
                                    }
                                }
                            },
                            zoom: {
                                pan: { enabled: true, mode: 'x' },
                                zoom: {
                                    wheel: { enabled: true },
                                    pinch: { enabled: true },
                                    mode: 'x'
                                },
                                limits: { x: { min: 'original', max: 'original' } }
                            }
                        },
                        scales: {
                            x: { offset: true, ticks: { autoSkip: true, maxTicksLimit: 12, maxRotation: 0, color: '#94a3b8', font: { size: 9 } } },
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
                historyChart.options.scales.x = {
                    type: 'linear',
                    offset: false,
                    ticks: {
                        autoSkip: true,
                        maxTicksLimit: 12,
                        maxRotation: 0,
                        color: '#94a3b8',
                        font: { size: 9 },
                        callback: (value) => {
                            const d = new Date(Number(value));
                            return Number.isNaN(d.getTime()) ? '' : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                        }
                    }
                };
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
                        plugins: {
                            legend: { display: true, labels: { boxWidth: 8, font: { size: 9 } } },
                            tooltip: {
                                callbacks: {
                                    title: (items) => {
                                        const x = Number(items?.[0]?.parsed?.x);
                                        const d = new Date(x);
                                        return Number.isNaN(d.getTime())
                                            ? '-'
                                            : d.toLocaleString([], { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
                                    }
                                }
                            },
                            zoom: {
                                pan: { enabled: true, mode: 'x' },
                                zoom: {
                                    wheel: { enabled: true },
                                    pinch: { enabled: true },
                                    mode: 'x'
                                },
                                limits: { x: { min: 'original', max: 'original' } }
                            }
                        },
                        scales: {
                            x: { offset: true, ticks: { autoSkip: true, maxTicksLimit: 12, maxRotation: 0, color: '#94a3b8', font: { size: 9 } } },
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
                historyClimateChart.options.scales.x = {
                    type: 'linear',
                    offset: false,
                    ticks: {
                        autoSkip: true,
                        maxTicksLimit: 12,
                        maxRotation: 0,
                        color: '#94a3b8',
                        font: { size: 9 },
                        callback: (value) => {
                            const d = new Date(Number(value));
                            return Number.isNaN(d.getTime()) ? '' : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                        }
                    }
                };
            }
        }
        function updateHX(p) {
            if(!hxChart) return;
            const pts = [ {x:App.vals.t1, y:PHY.abs(App.vals.t1,App.vals.h1,p)*PHY.dens(App.vals.t1,p)}, {x:App.vals.t2, y:PHY.abs(App.vals.t2,App.vals.h2,p)*PHY.dens(App.vals.t2,p)}, {x:App.vals.t3, y:PHY.abs(App.vals.t3,App.vals.h3,p)*PHY.dens(App.vals.t3,p)} ];
            const maxT = Math.max(40, App.vals.t1, App.vals.t2, App.vals.t3) + 5;
            const tMax = Math.ceil(maxT / 5) * 5;
            const maxY = Math.max(40, ...pts.map(pt => pt.y)) + 3;
            const yMax = Math.ceil(maxY / 5) * 5;
            const bg=[]; [10,20,30,40,50,60,70,80,90,100].forEach(rh=>{ const l=[]; for(let t=0;t<=tMax;t+=5) l.push({x:t, y:PHY.abs(t,rh,p)*PHY.dens(t,p)}); bg.push({data:l, borderColor: rh===50?'#64748b':(rh===100?'#334155':'#cbd5e1'), borderWidth:(rh===50||rh===100)?1.8:1.2, pointRadius:0, tension:0.4, isRhCurve:true, rhLabel:rh}); });
            bg.push({data:pts, borderColor:'#475569', borderWidth:2, pointBackgroundColor:['#3b82f6','#f59e0b','#10b981'], showLine:true});
            hxChart.options.scales.x.max = tMax;
            hxChart.options.scales.y.max = yMax;
            if(hxChart.options?.plugins?.zoom?.limits) {
                hxChart.options.plugins.zoom.limits.x.max = tMax;
                hxChart.options.plugins.zoom.limits.y.max = yMax;
            }
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
        function loadDefaultCSV() {
            const csvUrl = `${getDrywatchBasePath()}/607_Heuluefterliste_Bund_FAT.csv`;
            fetch(csvUrl).then(r => r.text()).then(t => { parseCSV(t); renderFanSuggestions(); renderFanPicker(); }).catch(e => { console.log('DB load failed'); });
        }
        function parseCSV(text) {
            App.fanDB = [];
            const rows = text.split(/\r?\n/);
            for(let i = 1; i < rows.length; i++) {
                const c = rows[i].split(';');
                if(c.length < 10) continue;
                const brand = (c[0] || '').trim();
                const name = (c[3] || '').trim();
                const model = (c[1] || '').trim();
                const type = (c[2] || '').trim();
                const kw = parseFloat(c[5]);
                const rpm = parseFloat(c[4]);
                const labelCore = `${brand} ${name}`.trim();
                const featureParts = [];
                if(model) featureParts.push(`Nr. ${model}`);
                if(Number.isFinite(kw)) featureParts.push(`${kw.toFixed(1).replace(/\.0$/, '')} kW`);
                if(Number.isFinite(rpm)) featureParts.push(`${Math.round(rpm)} rpm`);
                const suffix = featureParts.length ? ` (${featureParts.join(' | ')})` : '';
                const f = { label: `${labelCore}${suffix}`, brand, name, model, type, rpm, kw, pmax: parseFloat(c[6]), pts: [] };
                for(let p = 2; p <= 8; p++) {
                    const iv = 7 + (p - 2) * 2;
                    const ip = 8 + (p - 2) * 2;
                    if(c[iv] && c[iv].trim()) f.pts.push({ p: p, q: parseFloat(c[iv]), kw: parseFloat(c[ip]) });
                }
                f.searchText = normalizeFanText(`${brand} ${name} ${model} ${type} ${f.label}`);
                App.fanDB.push(f);
            }
        }
        
        function openFanModal() {
            openHeucheckModal('luefter');
            syncFanUnitControls();
            updateFanChart();
            renderFanSuggestions();
            // Focus only with a mouse/keyboard; on phones the keyboard would cover the brand list.
            if(window.matchMedia && window.matchMedia('(pointer: fine)').matches) {
                setTimeout(()=>document.getElementById('fan-search')?.focus(),100);
            }
        }
        function closeFanModal() {
            closeHeucheckModal();
        }
        
        // --- FAN PICKER ---
        // Combobox: brand list first, then the products of one brand; free text search over brand,
        // product name, model number and performance data (kW, m³/s, m³/h, mbar, Pa, rpm).
        const fanPicker = { open: false, brand: null, query: '', active: -1, items: [] };

        function fanEsc(value) {
            return String(value ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
        }
        function fanNum(value, digits = 1) {
            if(!Number.isFinite(value)) return '';
            if(value !== 0 && Math.abs(value) < 1) digits = Math.max(digits, Math.abs(value) < 0.1 ? 3 : 2);
            return value.toFixed(digits).replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, '');
        }
        function normalizeFanText(value) {
            return String(value ?? '').toLowerCase().replace(/³/g, '3').replace(/,/g, '.')
                .normalize('NFD').replace(/[̀-ͯ]/g, '');
        }
        function getFanBrands() {
            const map = new Map();
            (App.fanDB || []).forEach(f => {
                const key = f.brand || '-';
                if(!map.has(key)) map.set(key, { name: key, count: 0, kwMin: Infinity, kwMax: -Infinity });
                const b = map.get(key);
                b.count++;
                if(Number.isFinite(f.kw)) { b.kwMin = Math.min(b.kwMin, f.kw); b.kwMax = Math.max(b.kwMax, f.kw); }
            });
            return [...map.values()].sort((a, b) => a.name.localeCompare(b.name, 'de'));
        }
        function parseFanQuery(raw) {
            const units = { 'kw': 'kw', 'm3/s': 'flow', 'm3s': 'flow', 'm3': 'flow', 'm3/h': 'flowh', 'm3h': 'flowh',
                'mbar': 'mbar', 'pa': 'pa', 'rpm': 'rpm', 'u/min': 'rpm', 'upm': 'rpm', 'min-1': 'rpm' };
            const numbers = [];
            const rest = normalizeFanText(raw).replace(
                /(^|[^a-z0-9.])(\d+(?:\.\d+)?)\s*(kw|m3\s*\/\s*s|m3s|m3\s*\/\s*h|m3h|m3|mbar|pa|rpm|u\s*\/\s*min|upm|min-1)?(?![a-z0-9])/g,
                (match, lead, num, unit) => {
                    const decimals = (num.split('.')[1] || '').length;
                    let kind = unit ? units[unit.replace(/\s+/g, '')] : 'any';
                    let value = parseFloat(num);
                    let tol = 0.5 * Math.pow(10, -decimals);
                    if(kind === 'flowh') { kind = 'flow'; value /= 3600; tol /= 3600; tol = Math.max(tol, 0.05); }
                    if(kind === 'pa') { kind = 'mbar'; value /= 100; tol = Math.max(tol / 100, 0.05); }
                    numbers.push({ kind, value, tol, text: num });
                    return `${lead} `;
                });
            const words = rest.split(/\s+/).map(w => w.trim()).filter(Boolean);
            return { words, numbers };
        }
        function fanMatchesNumber(f, n) {
            const near = v => Number.isFinite(v) && Math.abs(v - n.value) <= n.tol + 1e-9;
            const flows = (f.pts || []).map(pt => pt.q).filter(Number.isFinite);
            if(n.kind === 'kw') return near(f.kw);
            if(n.kind === 'mbar') return Number.isFinite(f.pmax) && f.pmax >= n.value - n.tol;
            if(n.kind === 'rpm') return Number.isFinite(f.rpm) && Math.abs(f.rpm - n.value) <= Math.max(n.tol, n.value * 0.02);
            if(n.kind === 'flow') {
                if(!flows.length) return false;
                return n.value >= Math.min(...flows) - n.tol && n.value <= Math.max(...flows) + n.tol;
            }
            return f.searchText.includes(n.text) || near(f.kw) || near(f.pmax) || flows.some(near);
        }
        function getFanPickerItems() {
            const db = Array.isArray(App.fanDB) ? App.fanDB : [];
            const query = fanPicker.query.trim();
            const items = [];
            if(!query) {
                if(!fanPicker.brand) {
                    getFanBrands().forEach(b => items.push({ kind: 'brand', brand: b }));
                    return items;
                }
                items.push({ kind: 'back' });
                db.filter(f => f.brand === fanPicker.brand)
                    .sort((a, b) => (a.kw || 0) - (b.kw || 0) || (a.pmax || 0) - (b.pmax || 0))
                    .forEach(f => items.push({ kind: 'fan', fan: f }));
                return items;
            }
            const q = parseFanQuery(query);
            if(!q.numbers.length) {
                getFanBrands()
                    .filter(b => q.words.every(w => normalizeFanText(b.name).includes(w)))
                    .forEach(b => items.push({ kind: 'brand', brand: b }));
            }
            // A flow query ("12 m3/s") lists first the fans closest to that flow at the current pressure demand.
            const flowQuery = q.numbers.find(n => n.kind === 'flow');
            const pressureMbar = flowQuery ? getPressureBreakdown().totalPressureMbar : 0;
            const flowGap = f => {
                const point = getFanOperatingPoint(f, pressureMbar);
                return point.supported ? Math.abs(point.flow - flowQuery.value) : Number.POSITIVE_INFINITY;
            };
            db.filter(f => q.words.every(w => f.searchText.includes(w))
                    && q.numbers.every(n => fanMatchesNumber(f, n)))
                .map(f => ({ f, gap: flowQuery && pressureMbar > 0 ? flowGap(f) : 0 }))
                .sort((a, b) => (a.gap - b.gap) || (q.numbers.length
                    ? (a.f.kw || 0) - (b.f.kw || 0) || a.f.brand.localeCompare(b.f.brand, 'de')
                    : a.f.brand.localeCompare(b.f.brand, 'de') || (a.f.kw || 0) - (b.f.kw || 0)))
                .map(x => x.f)
                .forEach(f => items.push({ kind: 'fan', fan: f }));
            return items;
        }
        function fanPickerOptionMarkup(item, pressureMbar) {
            if(item.kind === 'back') {
                return `<span class="fan-opt-icon" aria-hidden="true">‹</span><span class="fan-opt-main"><span class="fan-opt-title">${fanEsc(t('heucheck.fan_all_brands', 'Alle Marken'))}</span></span>`;
            }
            if(item.kind === 'brand') {
                const b = item.brand;
                const kwRange = Number.isFinite(b.kwMin)
                    ? (b.kwMin === b.kwMax ? `${fanNum(b.kwMin)} kW` : `${fanNum(b.kwMin)}–${fanNum(b.kwMax)} kW`)
                    : '';
                const count = `${b.count} ${b.count === 1 ? t('heucheck.fan_model_one', 'Modell') : t('heucheck.fan_models', 'Modelle')}`;
                return `<span class="fan-opt-main"><span class="fan-opt-title">${fanEsc(b.name)}</span>
                    <span class="fan-opt-data">${fanEsc([count, kwRange].filter(Boolean).join(' · '))}</span></span>
                    <span class="fan-opt-icon" aria-hidden="true">›</span>`;
            }
            const f = item.fan;
            const flows = (f.pts || []).map(pt => pt.q).filter(Number.isFinite);
            const title = [f.name, f.model && f.model !== '0' ? `Nr. ${f.model}` : ''].filter(Boolean).join(' · ');
            const data = [];
            if(Number.isFinite(f.kw)) data.push(`<b>${fanNum(f.kw)} kW</b>`);
            if(flows.length) {
                const qMin = fanNum(Math.min(...flows)), qMax = fanNum(Math.max(...flows));
                data.push(`${qMin === qMax ? qMin : `${qMin}–${qMax}`} m³/s`);
            }
            if(Number.isFinite(f.pmax)) data.push(`${t('heucheck.max_pressure', 'Pmax')} ${fanNum(f.pmax)} mbar`);
            if(Number.isFinite(f.rpm) && f.rpm >= 100) data.push(`${Math.round(f.rpm)} rpm`);
            let op = '';
            if(pressureMbar > 0) {
                const point = getFanOperatingPoint(f, pressureMbar);
                op = point.supported
                    ? `<span class="fan-opt-op">${fanEsc(t('heucheck.fan_at_pressure', 'bei'))} ${fanNum(pressureMbar)} mbar: ${fanNum(point.flow)} m³/s${point.power > 0 ? `, ${fanNum(point.power)} kW` : ''}</span>`
                    : `<span class="fan-opt-op is-warn">${fanEsc(t('heucheck.fan_too_weak', 'schafft'))} ${fanNum(pressureMbar)} mbar ${fanEsc(t('heucheck.fan_too_weak_end', 'nicht'))}</span>`;
            }
            const brandLine = fanPicker.query.trim() ? `<span class="fan-opt-brand">${fanEsc(f.brand)}</span>` : '';
            const selected = App.fan.label === f.label ? '<span class="fan-opt-icon is-check" aria-hidden="true">✓</span>' : '';
            return `<span class="fan-opt-main">${brandLine}<span class="fan-opt-title">${fanEsc(title)}</span>
                <span class="fan-opt-data">${data.join(' · ')}</span>${op}</span>${selected}`;
        }
        function renderFanPickerCurrent() {
            const el = document.getElementById('fan-picker-current');
            if(!el) return;
            el.innerHTML = `<span class="fan-picker-current-label">${fanEsc(t('heucheck.fan_selected', 'Gewählt'))}:</span> <b>${fanEsc(App.fan.label || 'Standard')}</b>`;
        }
        function renderFanPicker() {
            const input = document.getElementById('fan-search');
            const panel = document.getElementById('fan-picker-panel');
            const list = document.getElementById('fan-picker-list');
            const head = document.getElementById('fan-picker-head');
            const toggle = document.getElementById('fan-picker-toggle');
            const clear = document.getElementById('fan-search-clear');
            if(!input || !panel || !list || !head) return;
            renderFanPickerCurrent();
            input.placeholder = t('heucheck.fan_search_placeholder', 'Marke, Modell, kW oder m³/s');
            if(clear) clear.classList.toggle('hidden', !fanPicker.query);
            input.setAttribute('aria-expanded', fanPicker.open ? 'true' : 'false');
            if(toggle) {
                toggle.setAttribute('aria-expanded', fanPicker.open ? 'true' : 'false');
                toggle.title = fanPicker.open ? t('heucheck.fan_list_close', 'Liste schliessen') : t('heucheck.fan_list_open', 'Liste öffnen');
            }
            panel.classList.toggle('hidden', !fanPicker.open);
            if(!fanPicker.open) { input.removeAttribute('aria-activedescendant'); return; }

            fanPicker.items = getFanPickerItems();
            if(fanPicker.active >= fanPicker.items.length) fanPicker.active = fanPicker.items.length - 1;
            const fanCount = fanPicker.items.filter(i => i.kind === 'fan').length;
            const query = fanPicker.query.trim();
            if(!(App.fanDB || []).length) head.innerText = t('heucheck.fan_loading', 'Lüfterliste wird geladen …');
            else if(query) head.innerHTML = `${fanCount} ${fanEsc(t('heucheck.fan_hits', 'Treffer'))}`;
            else if(fanPicker.brand) head.innerHTML = `<b>${fanEsc(fanPicker.brand)}</b> · ${fanCount} ${fanEsc(fanCount === 1 ? t('heucheck.fan_model_one', 'Modell') : t('heucheck.fan_models', 'Modelle'))}`;
            else head.innerText = t('heucheck.fan_choose_brand', 'Marke wählen');

            const pressureMbar = getPressureBreakdown().totalPressureMbar;
            list.innerHTML = '';
            if(!fanPicker.items.length || (query && !fanCount && !fanPicker.items.some(i => i.kind === 'brand'))) {
                const empty = document.createElement('li');
                empty.className = 'fan-opt-empty';
                empty.innerText = t('heucheck.fan_no_hits', 'Kein Lüfter gefunden. Beispiele: «Sumag», «7.5 kW», «12 m3/s».');
                list.appendChild(empty);
            }
            fanPicker.items.forEach((item, i) => {
                const li = document.createElement('li');
                li.id = `fan-opt-${i}`;
                li.setAttribute('role', 'option');
                li.className = `fan-opt fan-opt--${item.kind}` + (i === fanPicker.active ? ' active' : '')
                    + (item.kind === 'fan' && App.fan.label === item.fan.label ? ' selected' : '');
                li.setAttribute('aria-selected', i === fanPicker.active ? 'true' : 'false');
                li.innerHTML = fanPickerOptionMarkup(item, pressureMbar);
                li.addEventListener('mousedown', e => e.preventDefault());
                li.addEventListener('click', () => activateFanPickerItem(i));
                list.appendChild(li);
            });
            if(fanPicker.active >= 0) {
                input.setAttribute('aria-activedescendant', `fan-opt-${fanPicker.active}`);
                document.getElementById(`fan-opt-${fanPicker.active}`)?.scrollIntoView({ block: 'nearest' });
            } else {
                input.removeAttribute('aria-activedescendant');
            }
        }
        function openFanPicker(resetToBrands = false) {
            if(resetToBrands) { fanPicker.brand = null; fanPicker.query = ''; const input = document.getElementById('fan-search'); if(input) input.value = ''; }
            fanPicker.open = true;
            fanPicker.active = -1;
            renderFanPicker();
        }
        function closeFanPicker() {
            fanPicker.open = false;
            fanPicker.active = -1;
            renderFanPicker();
        }
        function toggleFanPicker() {
            if(fanPicker.open) closeFanPicker(); else openFanPicker();
        }
        function setFanPickerBrand(brand) {
            fanPicker.brand = brand;
            fanPicker.query = '';
            const input = document.getElementById('fan-search');
            if(input) input.value = '';
            fanPicker.active = -1;
            renderFanPicker();
            document.getElementById('fan-picker-list')?.scrollTo?.(0, 0);
        }
        function activateFanPickerItem(index, viaKeyboard = false) {
            const item = fanPicker.items[index];
            if(!item) return;
            if(item.kind === 'back') { fanPicker.brand = null; fanPicker.active = viaKeyboard ? 0 : -1; renderFanPicker(); return; }
            if(item.kind === 'brand') { setFanPickerBrand(item.brand.name); if(viaKeyboard && fanPicker.items.length > 1) { fanPicker.active = 1; renderFanPicker(); } return; }
            fanPicker.brand = item.fan.brand;
            fanPicker.query = '';
            const input = document.getElementById('fan-search');
            if(input) input.value = '';
            fanPicker.open = false;
            applyFanSelection(item.fan);
        }
        function filterFans(txt) {
            fanPicker.query = txt || '';
            fanPicker.open = true;
            fanPicker.active = -1;
            renderFanPicker();
            const firstUseful = fanPicker.items.findIndex(i => i.kind !== 'back');
            if(fanPicker.query.trim() && firstUseful >= 0) { fanPicker.active = firstUseful; renderFanPicker(); }
        }
        function clearFanSearch() {
            const input = document.getElementById('fan-search');
            if(input) { input.value = ''; input.focus(); }
            filterFans('');
        }
        function handleFanKey(e) {
            const count = fanPicker.items.length;
            if(e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                e.preventDefault();
                if(!fanPicker.open) { openFanPicker(); }
                if(!fanPicker.items.length) return;
                const step = e.key === 'ArrowDown' ? 1 : -1;
                fanPicker.active = fanPicker.active < 0
                    ? (step > 0 ? 0 : fanPicker.items.length - 1)
                    : Math.max(0, Math.min(fanPicker.items.length - 1, fanPicker.active + step));
                renderFanPicker();
                return;
            }
            if(e.key === 'Enter') {
                if(!fanPicker.open) { e.preventDefault(); openFanPicker(); return; }
                const fans = fanPicker.items.filter(i => i.kind === 'fan');
                const index = fanPicker.active >= 0 ? fanPicker.active
                    : (fans.length === 1 ? fanPicker.items.indexOf(fans[0]) : -1);
                if(index >= 0 && count) { e.preventDefault(); activateFanPickerItem(index, true); }
                return;
            }
            if(e.key === 'Escape') {
                if(!fanPicker.open && !fanPicker.query) return;
                e.preventDefault();
                e.stopPropagation();
                if(fanPicker.query) { clearFanSearch(); return; }
                if(fanPicker.brand) { fanPicker.brand = null; fanPicker.active = -1; renderFanPicker(); return; }
                closeFanPicker();
                return;
            }
            if(e.key === 'Backspace' && !e.target.value && fanPicker.brand) {
                e.preventDefault();
                fanPicker.brand = null;
                fanPicker.active = -1;
                renderFanPicker();
            }
        }
        function applyFanSelection(f) {
            App.fan.mode = 'curve'; App.fan.label = f.label; App.fan.autoScaleStandard = false; App.fan.kw = f.kw; App.fan.pmax = f.pmax; App.fan.curve = JSON.parse(JSON.stringify(f.pts)); 
            App.fan.flow = 0;
            App.fan.custom = false;
            App.flags.fanConfigured = true;
            syncFanUnitControls();
            updateFanChart(); renderCurveEditor();
            renderFanSuggestions();
            renderFanPicker();
            update();
            saveData();
        }
        function createCustomFan() {
            const customNameInput = document.getElementById('inp-custom-fan-name');
            const rawName = (customNameInput?.value || '').trim();
            const customName = rawName || t('heucheck.custom_fan_default', 'Eigener Lüfter');
            App.fan.label = customName;
            App.fan.mode = 'curve';
            App.fan.autoScaleStandard = false;
            App.fan.custom = true;
            if(!Array.isArray(App.fan.curve) || !App.fan.curve.length) {
                App.fan.curve = JSON.parse(JSON.stringify(DEFAULT_APP_STATE.fan.curve));
            }
            if(!Number.isFinite(parseFloat(App.fan.pmax)) || parseFloat(App.fan.pmax) <= 0) {
                App.fan.pmax = DEFAULT_APP_STATE.fan.pmax;
            }
            App.flags.fanConfigured = true;
            syncFanUnitControls();
            updateFanChart();
            renderCurveEditor();
            update();
            renderFanPickerCurrent();
            saveData();
        }
        function resetFanSelection() {
            App.fan = JSON.parse(JSON.stringify(DEFAULT_APP_STATE.fan));
            App.flags.fanConfigured = false;
            const customNameInput = document.getElementById('inp-custom-fan-name');
            if(customNameInput) customNameInput.value = '';
            fanPicker.brand = null;
            fanPicker.query = '';
            const fanSearch = document.getElementById('fan-search');
            if(fanSearch) fanSearch.value = '';
            fanPicker.open = true;
            fanPicker.active = -1;
            renderFanPicker();
            syncFanUnitControls();
            updateFanChart();
            renderCurveEditor();
            renderFanSuggestions();
            update();
            saveData();
        }

        // --- CURVE EDITOR ---
        function toggleCurveEditor() { document.getElementById('fan-curve-editor').classList.toggle('hidden'); }
        function renderCurveEditor() {
            const b = document.getElementById('curve-body'); b.innerHTML = '';
            const nameEl = document.getElementById('fan-curve-name');
            const detailsEl = document.getElementById('fan-curve-details');
            if(nameEl) nameEl.innerText = App.fan.label || t('heucheck.custom_fan_default', 'Eigener Lüfter');
            if(detailsEl) {
                const detailParts = [
                    `${t('heucheck.max_pressure', 'Pmax')} ${formatFanEditorValue('pressure', App.fan.pmax)} ${getFanEditorUnit('pressure').label}`,
                    `${App.fan.curve.length} ${t('heucheck.curve_points', 'Punkte')}`
                ];
                if(Number.isFinite(parseFloat(App.fan.kw)) && parseFloat(App.fan.kw) > 0) detailParts.push(`${parseFloat(App.fan.kw).toFixed(1)} kW`);
                detailsEl.innerText = detailParts.join(' | ');
            }
            App.fan.curve.sort((a,b)=>a.p-b.p).forEach((p, i) => {
                b.innerHTML += `<tr>
                    <td><input type="number" class="w-16 border rounded text-center" value="${formatFanEditorValue('pressure', p.p)}" onchange="updCurve(${i},'p',this.value)"></td>
                    <td><input type="number" class="w-16 border rounded text-center" value="${formatFanEditorValue('flow', p.q)}" onchange="updCurve(${i},'q',this.value)"></td>
                    <td><input type="number" class="w-10 border rounded text-center" value="${p.kw}" onchange="updCurve(${i},'kw',this.value)"></td>
                    <td class="text-[10px] font-bold text-slate-400">-</td>
                    <td><button class="text-red-500 font-bold px-1" onclick="remCurve(${i})">x</button></td>
                </tr>`;
            });
            b.innerHTML += `<tr class="bg-slate-100">
                <td><input type="number" class="w-16 border rounded text-center font-bold" value="${formatFanEditorValue('pressure', App.fan.pmax)}" onchange="updateFanPmax(this.value)"></td>
                <td class="font-bold text-slate-700">${formatFanEditorValue('flow', 0)}</td>
                <td class="text-slate-400">-</td>
                <td class="text-[10px] font-bold text-slate-500">Pmax</td>
                <td class="text-slate-400">-</td>
            </tr>`;
        }
        function updateFanPmax(value) {
            App.fan.autoScaleStandard = false;
            App.flags.fanConfigured = true;
            App.fan.pmax = Math.max(0, fromFanEditorUnit('pressure', value));
            renderCurveEditor();
            updateFanChart();
            update();
            saveData();
        }
        function updCurve(i, k, v) {
            App.fan.autoScaleStandard = false;
            App.flags.fanConfigured = true;
            if(k === 'p') App.fan.curve[i][k] = fromFanEditorUnit('pressure', v);
            else if(k === 'q') App.fan.curve[i][k] = fromFanEditorUnit('flow', v);
            else App.fan.curve[i][k] = parseFloat(v);
            App.fan.custom = App.fan.custom === true || (App.fan.label || '') === t('heucheck.custom_fan_default', 'Eigener Lüfter');
            updateFanChart();
            renderCurveEditor();
            update();
            saveData();
        }
        function remCurve(i) { App.fan.autoScaleStandard = false; App.flags.fanConfigured = true; App.fan.curve.splice(i, 1); renderCurveEditor(); updateFanChart(); update(); saveData(); }
        function addCurvePoint() { App.fan.autoScaleStandard = false; App.flags.fanConfigured = true; App.fan.curve.push({p:0,q:0,kw:0}); renderCurveEditor(); updateFanChart(); update(); saveData(); }

        // --- LAYERS  PERSIST ---
        function openLayersModal() {
            const list = document.getElementById('layers-list');
            const vis = document.getElementById('stock-vis');
            const areaInp = document.getElementById('inp-area');
            const stockHInp = document.getElementById('inp-stock-h');
            const grateInp = document.getElementById('inp-grate-height-cm');
            const densityOut = document.getElementById('stock-density');
            const kgTsOut = document.getElementById('stock-kgts');
            const layerPressureOut = document.getElementById('stock-layer-pressure');
            const totalPressureOut = document.getElementById('stock-total-pressure');
            const stockHeightUsed = document.getElementById('stock-height-used');
            const stockHeightMode = document.getElementById('stock-height-mode');
            if(!list || !vis) return;
            if(areaInp) areaInp.value = App.area;
            if(grateInp) grateInp.value = Math.round(Math.max(0, parseFloat(App.grateHeightCm) || 0));
            list.innerHTML=''; vis.innerHTML='';

            const totalHeightAuto = App.layers.reduce((sum, layer) => sum + (parseFloat(layer.h) || 0), 0);
            const effectiveHeight = totalHeightAuto;
            const maxConfiguredHeight = App.stockHeightManual && App.stockHeightManual > 0
                ? Math.max(App.stockHeightManual, totalHeightAuto)
                : totalHeightAuto;
            if(stockHInp) {
                const stockHeightDisplay = App.stockHeightManual && App.stockHeightManual > 0
                    ? App.stockHeightManual
                    : Math.max(0.1, totalHeightAuto || 0.1);
                stockHInp.value = stockHeightDisplay.toFixed(1);
            }
            const grateHeightM = Math.max(0, (parseFloat(App.grateHeightCm) || 0) / 100);
            const visualHeight = Math.max(2, Math.ceil((effectiveHeight + grateHeightM) * 2) / 2);
            let totalMassWetAuto = 0;
            let totalKgTs = 0;

            for(let layerIndex = App.layers.length - 1; layerIndex >= 0; layerIndex--) {
                const l = App.layers[layerIndex];
                const opt = DENS_OPTS.find(o=>o.id===l.type) || DENS_OPTS[1];
                const wetDensity = getLayerDensity(l);
                const layerVolume = (parseFloat(App.area) || 0) * (parseFloat(l.h) || 0);
                const layerWetKg = layerVolume * wetDensity;
                const layerKgTs = layerWetKg * ((parseFloat(l.ts) || 0) / 100);
                const layerPressurePa = (parseFloat(l.h) || 0) * getLayerPressureFactor(l) * 100;
                totalMassWetAuto += layerWetKg;
                totalKgTs += layerKgTs;

                const row = document.createElement('div');
                row.className = "bg-white p-2 rounded shadow-sm border text-sm";
                row.innerHTML = `<div class="flex justify-between mb-1"><span class="font-bold text-slate-400">#${layerIndex+1}</span><button onclick="remLayer(${layerIndex})" class="text-red-500 font-bold px-2">x</button></div><div class="grid grid-cols-2 gap-2"><div><div class="text-[10px] text-slate-400 mb-0.5">Typ</div><select class="w-full border rounded p-1 text-xs" onchange="updLayer(${layerIndex},'type',this.value)">${DENS_OPTS.map(o=>`<option value="${o.id}" ${o.id==l.type?'selected':''}>${o.l}</option>`).join('')}</select></div><div><div class="text-[10px] text-slate-400 mb-0.5">Höhe</div><div class="relative"><input type="number" step="0.1" value="${l.h}" class="w-full border rounded p-1 pr-6" onchange="updLayer(${layerIndex},'h',this.value)"><span class="absolute right-2 top-1 text-xs text-slate-400">m</span></div></div><div><div class="text-[10px] text-slate-400 mb-0.5">TS</div><div class="relative"><input type="number" value="${l.ts}" class="w-full border rounded p-1 pr-7" onchange="updLayer(${layerIndex},'ts',this.value)"><span class="absolute right-2 top-1 text-xs text-slate-400">%</span></div></div><div><div class="flex items-center justify-between text-[10px] text-slate-400 mb-0.5"><span>Dichte (Richtwert FS, überschreibbar)</span><button onclick="${l.densManual ? `resetLayerDensity(${layerIndex})` : ''}" ${l.densManual ? '' : 'disabled'} class="text-blue-500 font-bold ${l.densManual ? '' : 'opacity-40 cursor-not-allowed'}">Reset</button></div><div class="relative"><input type="number" value="${wetDensity.toFixed(0)}" class="w-full border rounded p-1 pr-10" onchange="updLayer(${layerIndex},'dens',this.value)"><span class="absolute right-2 top-1 text-xs text-slate-400">kg FS/m³</span></div></div></div><div class="mt-1 text-[11px] font-bold text-amber-700">Druck Schicht: ${layerPressurePa.toFixed(0)} Pa</div>`;
                list.appendChild(row);
            }

            const ruler = document.createElement('div');
            ruler.className = 'w-10 relative border-r border-slate-200 mr-2';
            for(let meter = 0; meter <= visualHeight + 0.001; meter += 0.5) {
                const tick = document.createElement('div');
                const pct = (meter / visualHeight) * 100;
                tick.className = 'absolute right-0 flex items-center gap-1';
                tick.style.bottom = `${pct}%`;
                const isFull = Math.abs(meter % 1) < 0.001;
                tick.innerHTML = `<span class="text-[10px] text-slate-400 w-7 text-right">${isFull ? meter.toFixed(0) : meter.toFixed(1)}</span><span class="h-px ${isFull ? 'w-3' : 'w-2'} bg-slate-400"></span>`;
                ruler.appendChild(tick);
            }
            if(grateHeightM > 0) {
                const grateLine = document.createElement('div');
                const gratePct = Math.min(100, Math.max(0, (grateHeightM / visualHeight) * 100));
                grateLine.className = 'absolute left-0 right-0 border-t border-dashed border-slate-500';
                grateLine.style.bottom = `${gratePct}%`;
                ruler.appendChild(grateLine);
            }

            const stack = document.createElement('div');
            stack.className = 'flex-1 flex flex-col-reverse gap-1 min-h-[180px] border rounded bg-slate-50 p-1';
            App.layers.forEach(l => {
                const wetDensity = getLayerDensity(l);
                const layerHeightPx = Math.max(14, ((parseFloat(l.h) || 0) / Math.max(0.1, visualHeight)) * 180);
                const layerPressurePa = (parseFloat(l.h) || 0) * getLayerPressureFactor(l) * 100;
                const bar = document.createElement('div');
                bar.className = `rounded p-1 text-[10px] leading-tight text-white font-bold ${l.ts<60?'bg-blue-500':(l.ts<80?'bg-amber-500':'bg-emerald-500')}`;
                bar.style.height = `${layerHeightPx}px`;
                bar.innerHTML = `<div>${(parseFloat(l.h)||0).toFixed(1)} m · ${Math.round(l.ts||0)}% TS</div><div class="opacity-90">ca. ${wetDensity.toFixed(0)} kg FS/m³</div><div class="opacity-90">Druck: ${layerPressurePa.toFixed(0)} Pa</div>`;
                stack.appendChild(bar);
            });

            const visWrap = document.createElement('div');
            visWrap.className = 'flex items-stretch';
            visWrap.appendChild(ruler);
            visWrap.appendChild(stack);
            vis.appendChild(visWrap);

            const totalMassWet = totalMassWetAuto;
            const pressureScale = totalHeightAuto > 0 && maxConfiguredHeight > 0 ? (maxConfiguredHeight / totalHeightAuto) : 1;
            let stackPressureLayersMbar = 0;
            App.layers.forEach(layer => {
                stackPressureLayersMbar += (parseFloat(layer.h) || 0) * getLayerPressureFactor(layer);
            });
            const stackPressurePa = stackPressureLayersMbar * 100;
            const stackPressureScaledPa = stackPressurePa * pressureScale;
            const systemSurchargePa = (App.systemExtras?.roofExhaust ? SYSTEM_PRESSURE_SURCHARGES_PA.roofExhaust : 0) + (App.systemExtras?.conditioningUnit ? SYSTEM_PRESSURE_SURCHARGES_PA.conditioningUnit : 0);
            const totalSystemPressurePa = stackPressureScaledPa + systemSurchargePa;
            const avgDensity = totalMassWet > 0 && App.area > 0 && effectiveHeight > 0 ? (totalMassWet / (App.area * effectiveHeight)) : 0;
            if(densityOut) densityOut.innerText = avgDensity > 0 ? avgDensity.toFixed(0) : '-';
            if(kgTsOut) kgTsOut.innerText = totalKgTs > 0 ? (totalKgTs / 100).toFixed(1) : '0.0';
            if(layerPressureOut) layerPressureOut.innerText = `${stackPressurePa.toFixed(0)} Pa`;
            if(totalPressureOut) totalPressureOut.innerText = `${totalSystemPressurePa.toFixed(0)} Pa`;
            if(stockHeightUsed) stockHeightUsed.innerText = effectiveHeight > 0 ? effectiveHeight.toFixed(1) : '0.0';
            if(stockHeightMode) {
                stockHeightMode.innerText = App.stockHeightManual && App.stockHeightManual > 0
                    ? `(max ${maxConfiguredHeight.toFixed(1)} m fuer Luefterwahl)`
                    : '(aus Schichten)';
            }
        }
        function addLayer(){ App.flags.storageConfigured = true; App.layers.push({h:1.0, ts:60, type:'loose_m', dens:80, densManual:false}); openLayersModal(); update(); saveData(); }
        function remLayer(i){ App.flags.storageConfigured = true; App.layers.splice(i,1); openLayersModal(); update(); saveData(); }
        function updLayer(i,k,v){
            App.flags.storageConfigured = true;
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
            App.flags.storageConfigured = true;
            openLayersModal();
            update();
            saveData();
        }
        function loadData() {
            try {
                const d = JSON.parse(localStorage.getItem('agff_mob_pro_v10'));
                if(d && typeof d === 'object') {
                    if(d.params && typeof d.params === 'object') App.params = {...App.params, ...d.params};
                    if(d.ui && typeof d.ui === 'object') App.ui = {...App.ui, ...d.ui};
                    if(d.flags && typeof d.flags === 'object') App.flags = {...App.flags, ...d.flags};
                    if(typeof d.area === 'number' && Number.isFinite(d.area)) App.area = d.area;
                    if(typeof d.flowSpecTarget === 'number' && Number.isFinite(d.flowSpecTarget) && d.flowSpecTarget >= 0) {
                        App.flowSpecTarget = d.flowSpecTarget;
                    } else if(typeof d.flowSpec === 'number' && Number.isFinite(d.flowSpec) && d.flowSpec >= 0) {
                        App.flowSpecTarget = d.flowSpec;
                    } else if(d.fan && typeof d.fan === 'object' && typeof d.fan.flow === 'number' && Number.isFinite(d.fan.flow) && App.area > 0) {
                        App.flowSpecTarget = Math.max(0, d.fan.flow / App.area);
                    }
                    if(typeof d.stockHeightManual === 'number' && Number.isFinite(d.stockHeightManual) && d.stockHeightManual > 0) App.stockHeightManual = d.stockHeightManual;
                    if(typeof d.grateHeightCm === 'number' && Number.isFinite(d.grateHeightCm) && d.grateHeightCm >= 0) App.grateHeightCm = d.grateHeightCm;
                    if(typeof d.grateHeightAuto === 'boolean') App.grateHeightAuto = d.grateHeightAuto;
                    else App.grateHeightAuto = !(Number.isFinite(parseFloat(App.grateHeightCm)) && parseFloat(App.grateHeightCm) > 0);
                    if(d.airChannels && typeof d.airChannels === 'object') App.airChannels = { ...App.airChannels, ...d.airChannels };
                    if(d.fan && typeof d.fan === 'object') App.fan = {...App.fan, ...d.fan};
                    if(d.systemExtras && typeof d.systemExtras === 'object') App.systemExtras = {...App.systemExtras, ...d.systemExtras};
                    if(Array.isArray(d.storages) && d.storages.length) {
                        App.storages = d.storages.map((raw, idx) => {
                            const fallbackId = idx + 1;
                            const sid = Number.isFinite(parseInt(raw?.id, 10)) ? parseInt(raw.id, 10) : fallbackId;
                            return {
                                ...createStorageProfile(sid),
                                ...(raw || {}),
                                id: sid,
                                name: typeof raw?.name === 'string' ? raw.name : '',
                                grateHeightAuto: typeof raw?.grateHeightAuto === 'boolean'
                                    ? raw.grateHeightAuto
                                    : !((parseFloat(raw?.grateHeightCm) || 0) > 0),
                                airChannels: { ...JSON.parse(JSON.stringify(DEFAULT_APP_STATE.airChannels)), ...(raw?.airChannels || {}) },
                                layers: Array.isArray(raw?.layers) && raw.layers.length
                                    ? JSON.parse(JSON.stringify(raw.layers))
                                    : JSON.parse(JSON.stringify(DEFAULT_APP_STATE.layers)),
                                systemExtras: { ...JSON.parse(JSON.stringify(DEFAULT_APP_STATE.systemExtras)), ...(raw?.systemExtras || {}) }
                            };
                        });
                    }
                    if(Number.isFinite(parseInt(d.activeStorageId, 10))) App.activeStorageId = parseInt(d.activeStorageId, 10);
                    if(Number.isFinite(parseInt(d.nextStorageId, 10))) App.nextStorageId = parseInt(d.nextStorageId, 10);
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

            ensureStorageProfiles();

            if(App.flags.fanConfigured !== true && App.flags.storageConfigured !== true) {
                App.flags.fanConfigured = inferConfiguredFan(App.fan);
                App.flags.storageConfigured = inferConfiguredStorage({ area: App.area, stockHeightManual: App.stockHeightManual, layers: App.layers });
            }

            applyAutoGrateHeightByArea();

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
            if(!App.airChannels || typeof App.airChannels !== 'object') {
                App.airChannels = { intakeAreaM2: null, supplyAreaM2: null };
            }

            const areaInp = document.getElementById('inp-area');
            if(areaInp) areaInp.value = App.area;
            const flowSpecIn = document.getElementById('flow-spec-in');
            if(flowSpecIn) flowSpecIn.value = (parseFloat(App.flowSpecTarget) || 0).toFixed(2);
            const roofExhaustCheckbox = document.getElementById('inp-roof-exhaust');
            if(roofExhaustCheckbox) roofExhaustCheckbox.checked = !!App.systemExtras?.roofExhaust;
            const conditioningCheckbox = document.getElementById('inp-conditioning-unit');
            if(conditioningCheckbox) conditioningCheckbox.checked = !!App.systemExtras?.conditioningUnit;
            const grateInp = document.getElementById('inp-grate-height-cm');
            if(grateInp) grateInp.value = Math.round(Math.max(0, parseFloat(App.grateHeightCm) || 0));
            const intakeInp = document.getElementById('inp-intake-area');
            const supplyInp = document.getElementById('inp-supply-area');
            if(intakeInp) intakeInp.value = Number.isFinite(parseFloat(App.airChannels?.intakeAreaM2)) ? parseFloat(App.airChannels.intakeAreaM2).toFixed(2) : '';
            if(supplyInp) supplyInp.value = Number.isFinite(parseFloat(App.airChannels?.supplyAreaM2)) ? parseFloat(App.airChannels.supplyAreaM2).toFixed(2) : '';

            const altInp = document.getElementById('inp-alt');
            const pressureInp = document.getElementById('inp-air-pressure');
            const priceInp = document.getElementById('inp-price');
            const heatInp = document.getElementById('inp-price-heat');
            if(!Number.isFinite(parseFloat(App.params.pressure)) || parseFloat(App.params.pressure) <= 0) {
                App.params.pressure = defaultPressureForAltitude(App.params.alt);
            }
            if(altInp) altInp.value = App.params.alt;
            if(pressureInp) pressureInp.value = Math.round(getAmbientPressure());
            if(priceInp) priceInp.value = App.params.price;
            if(heatInp) heatInp.value = App.params.priceHeat;
        }
        function saveParams(source = '') {
            const altInput = document.getElementById('inp-alt');
            const pressureInput = document.getElementById('inp-air-pressure');
            const priceInput = document.getElementById('inp-price');
            const heatPriceInput = document.getElementById('inp-price-heat');
            const alt = parseFloat(altInput?.value);
            App.params.alt = Number.isFinite(alt) ? alt : 0;
            if(source === 'altitude') {
                App.params.pressure = defaultPressureForAltitude(App.params.alt);
                if(pressureInput) pressureInput.value = Math.round(App.params.pressure);
            } else {
                const pressure = parseFloat(pressureInput?.value);
                App.params.pressure = Number.isFinite(pressure) && pressure > 0 ? pressure : defaultPressureForAltitude(App.params.alt);
                if(pressureInput) pressureInput.value = Math.round(App.params.pressure);
            }
            App.params.price = parseFloat(priceInput?.value);
            App.params.priceHeat = parseFloat(heatPriceInput?.value);
            update();
            saveData();
        }
        function saveData() {
            App.ui.lang = I18N_LANG;
            localStorage.setItem('agff_mob_pro_v10', JSON.stringify(App));
        }

        function getDrywatchBasePath() {
            const value = typeof window.DRYWATCH_BASE_PATH === 'string' ? window.DRYWATCH_BASE_PATH : '';
            if (!value) return '';
            return value.endsWith('/') ? value.slice(0, -1) : value;
        }

        async function evaporationApi(payload) {
            const response = await fetch(`${getDrywatchBasePath()}/api/evaporation`, {
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

        // Kopf: auf schmalen Bildschirmen beim Runterscrollen ausblenden, beim Hochscrollen wieder zeigen (CSS .dw-kopf-weg).
        // Eingebettet (iframe, z. B. graswachstum.ch/werkzeuge/drywatch) meldet die App dem Rahmen die Scrollposition, damit er
        // seinen Kopf gleich behandeln kann. Gemeldet wird nur die Zahl, nichts aus den Eingaben.
        (function () {
            const kopf = document.getElementById('dw-kopf');
            const schmal = window.matchMedia('(max-width: 640px)');
            let eingebettet = false;
            try { eingebettet = window.self !== window.top; } catch (e) { eingebettet = true; }
            if (eingebettet) document.documentElement.classList.add('dw-eingebettet');
            let letztes = window.scrollY, geplant = false;
            function pruefen() {
                geplant = false;
                const y = Math.max(0, window.scrollY);
                const d = y - letztes;
                if (kopf) {
                    if (!schmal.matches || y < kopf.offsetHeight) kopf.classList.remove('dw-kopf-weg');
                    else if (d > 6) kopf.classList.add('dw-kopf-weg');
                    else if (d < -6) kopf.classList.remove('dw-kopf-weg');
                }
                if (Math.abs(d) > 6 || y === 0) {
                    if (eingebettet) window.parent.postMessage({ typ: 'werkzeug-scroll', y: Math.round(y) }, '*');
                    letztes = y;
                }
            }
            window.addEventListener('scroll', function () {
                if (!geplant) { geplant = true; requestAnimationFrame(pruefen); }
            }, { passive: true });
            // Fokus mit der Tastatur auf ein Element im Kopf: Kopf zeigen
            if (kopf) kopf.addEventListener('focusin', function () { kopf.classList.remove('dw-kopf-weg'); });
        })();
