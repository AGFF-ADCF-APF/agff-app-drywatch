
    <div id="dw-kopf" class="dw-kopf bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div class="max-w-3xl mx-auto px-3 py-3 flex justify-between items-center">
            <div class="flex items-center gap-2">
                <div class="bg-blue-600 text-white p-1.5 rounded-lg"><i data-lucide="wind" width="20" height="20"></i></div>
                <div>
                    <h1 class="font-black text-base text-slate-800 leading-tight">DryWatch</h1>
                    <div class="text-[10px] font-bold text-slate-500 leading-tight" data-i18n="app.subtitle">Heutrocknungs-Cockpit</div>
                    <div class="mt-1 flex items-center gap-1">
                        <div id="active-storage-title" class="text-[10px] font-black text-slate-700 leading-tight">Futterlager 1</div>
                        <div id="storage-switcher" class="flex items-center gap-1"></div>
                    </div>
                </div>
            </div>
            <div class="dw-kopf-knoepfe flex gap-2">
                <button onclick="openHeucheckModal('lager')" class="flex flex-col items-center justify-center w-16 h-10 bg-emerald-50 border border-emerald-100 rounded-lg text-emerald-700 active:bg-emerald-100"><i data-lucide="house" width="18"></i><span class="text-[7px] font-bold leading-none text-center" data-i18n="nav.fodder">Futterlager</span></button>
                <button onclick="openDialogById('phases-modal')" class="flex flex-col items-center justify-center w-16 h-10 bg-blue-50 border border-blue-100 rounded-lg text-blue-700 active:bg-blue-100"><i data-lucide="badge-info" width="14" height="14"></i><span class="text-[7px] font-bold leading-none text-center" data-i18n="nav.info">Info&amp;Wissen</span></button>
                <button onclick="openSettingsModal()" class="flex flex-col items-center justify-center w-10 h-10 bg-slate-50 border rounded-lg text-slate-600 active:bg-slate-200"><i data-lucide="settings" width="18"></i></button>
            </div>
        </div>
    </div>

    <div class="max-w-3xl mx-auto p-3 space-y-4">

        <div id="card-flow-total" class="dash-card bg-cyan-50 border-cyan-200 cursor-default">
            <div class="flex justify-between items-start">
                <div>
                    <div class="label-sm text-cyan-800" data-i18n="card.air_volume">Luftmenge</div>
                    <div id="fan-model-display" class="hidden mt-1 text-xs font-bold text-cyan-600"></div>
                </div>
                <i data-lucide="gauge" width="16" class="text-cyan-500"></i>
            </div>
            <div class="luftmenge-zeile mt-2 flex items-center gap-1 overflow-x-auto whitespace-nowrap pb-1">
                    <div class="text-center px-1 shrink-0">
                        <div id="flow-total" class="text-3xl font-black text-cyan-700 leading-none">0.0</div>
                        <div class="text-xs text-slate-400 font-bold mt-0.5">m³/s</div>
                    </div>
                    <div class="flex flex-col items-center gap-0.5 bg-cyan-100/40 rounded-xl border border-cyan-100 px-1.5 py-1 shrink-0">
                        <div class="text-[9px] text-slate-600 font-bold uppercase tracking-wide" data-i18n="input.floor_area">Stockfläche</div>
                        <div id="area-top-group" class="flex items-center bg-white rounded-lg p-0.5 gap-0 border border-cyan-100">
                            <button class="stepper-btn compact" onmousedown="startAreaStep(-1,-1)" onmouseup="stopAreaStep()" ontouchend="stopAreaStep()" onmouseleave="stopAreaStep()">-</button>
                            <div class="text-center px-1">
                                <input id="inp-area-top" type="number" min="1" step="1" class="val-input" style="width:44px" onchange="setAreaTop(this.value)">
                                <div class="text-[8px] text-slate-400 font-bold">m²</div>
                            </div>
                            <button class="stepper-btn compact" onmousedown="startAreaStep(1,1)" onmouseup="stopAreaStep()" ontouchend="stopAreaStep()" onmouseleave="stopAreaStep()">+</button>
                        </div>
                    </div>
                    <div class="flex flex-col items-center gap-0.5 bg-cyan-100/40 rounded-xl border border-cyan-100 px-1.5 py-1 shrink-0">
                        <div class="flex items-center gap-1 text-[9px] text-cyan-700 font-bold uppercase tracking-wide"><span data-i18n="input.air_speed">Geschwindigkeit</span><button onclick="openDialogById('speed-guidelines-modal')" class="w-4 h-4 rounded-full bg-white border border-cyan-200 flex items-center justify-center"><i data-lucide="badge-info" width="12" height="12" class="text-blue-400 cursor-pointer"></i></button></div>
                        <div class="flex items-center bg-white rounded-lg p-0.5 gap-0 border border-cyan-100">
                            <button class="stepper-btn compact" onmousedown="startFlowSpecStep(-0.01,-0.01)" onmouseup="stopFlowSpecStep()" ontouchend="stopFlowSpecStep()" onmouseleave="stopFlowSpecStep()">-</button>
                            <div class="text-center px-1">
                                <input type="number" id="flow-spec-in" class="val-input" style="width:44px" step="0.01" min="0" onchange="setFlowSpec(this.value)">
                                <div class="text-[8px] text-slate-400 font-bold">m³/s</div>
                            </div>
                            <button class="stepper-btn compact" onmousedown="startFlowSpecStep(0.01,0.01)" onmouseup="stopFlowSpecStep()" ontouchend="stopFlowSpecStep()" onmouseleave="stopFlowSpecStep()">+</button>
                        </div>
                    </div>
            </div>
            <div id="speed-inline-hint" class="hidden mt-2 rounded border px-2 py-1 text-[10px] font-bold"></div>
        </div>

        <div class="bg-white rounded-2xl shadow border border-slate-300 p-3 space-y-3">
            <div class="flex justify-between items-start pb-1 border-b border-slate-100">
                <div class="label-sm text-slate-500" data-i18n="card.air_quality">Luftqualität</div>
                <div class="flex items-center gap-2">
                    <button onclick="copyAirQualityToClipboard()" class="h-7 px-2 rounded-md border border-slate-200 bg-slate-50 text-slate-600 text-[10px] font-bold flex items-center gap-1 active:bg-slate-100" data-i18n-title="air.copy_title" title="Luftqualitäts-Werte kopieren">
                        <i data-lucide="clipboard-copy" width="12"></i>
                    </button>
                    <button onclick="resetAllInputs()" class="h-7 px-2 rounded-md border border-slate-200 bg-slate-50 text-slate-600 text-[10px] font-bold flex items-center gap-1 active:bg-slate-100" title="Messwerte zurücksetzen">
                        <i data-lucide="rotate-ccw" width="12"></i>
                        <span>Messwerte zurücksetzen</span>
                    </button>
                    <i data-lucide="thermometer" width="16" class="text-slate-400"></i>
                </div>
            </div>
            <div id="guide-aussen-block" class="luft-zeile flex items-center justify-between gap-1">
                <div class="w-16 shrink-0"><div class="text-[9px] text-slate-500 font-bold uppercase tracking-wide" data-i18n="air.outside">Aussen</div><button id="fetch-weather" class="w-full h-10 flex flex-col items-center justify-center text-[9px] font-bold text-blue-600 bg-blue-50 px-1 rounded border border-blue-100"><i data-lucide="cloud-sun" width="14" height="14"></i><span class="leading-none mt-0.5" data-i18n="air.meteo_btn">Meteo</span></button></div>
                <div class="flex items-center bg-slate-50 rounded-lg p-0.5 gap-0.5"><button class="stepper-btn" onmousedown="startStep('t1', -0.1, -1.0)" ontouchstart="startStep('t1', -0.1, -1.0)" onmouseup="stopStep()" ontouchend="stopStep()">-</button><div class="text-center"><input type="number" id="t1-in" class="val-input" value="20" onchange="manualInput('t1', this.value)"><div class="text-[9px] text-slate-400 font-bold">°C</div></div><button class="stepper-btn" onmousedown="startStep('t1', 0.1, 1.0)" ontouchstart="startStep('t1', 0.1, 1.0)" onmouseup="stopStep()" ontouchend="stopStep()">+</button></div>
                <div class="flex items-center bg-slate-50 rounded-lg p-0.5 gap-0.5"><button class="stepper-btn" onmousedown="startStep('h1', -1, -5)" ontouchstart="startStep('h1', -1, -5)" onmouseup="stopStep()" ontouchend="stopStep()">-</button><div class="text-center"><input type="number" id="h1-in" class="val-input" value="60" onchange="manualInput('h1', this.value)"><div class="text-[9px] text-slate-400 font-bold">%</div></div><button class="stepper-btn" onmousedown="startStep('h1', 1, 5)" ontouchstart="startStep('h1', 1, 5)" onmouseup="stopStep()" ontouchend="stopStep()">+</button></div>
            </div>
            <div id="fetch-weather-status" class="hidden mt-1 text-[10px] font-bold text-slate-500"></div>
            <hr class="border-slate-100">
            <div id="sim-panel" class="sim-panel hidden">
                <div class="flex items-center justify-between mb-2">
                    <span class="label-sm text-amber-600" data-i18n="sim.title">Luftaufbereitung</span>
                    <button onclick="openKnowledgeArticle('05-luftaufbereitung.md')" class="flex items-center gap-0.5 text-[9px] font-bold text-blue-500"><i data-lucide="book-open" width="10"></i> <span data-i18n="sim.knowledge_btn">Wissen</span></button>
                </div>
                <div class="flex items-center gap-2 mb-1.5">
                    <span class="text-[10px] font-bold text-blue-600 w-16 shrink-0" data-i18n="sim.dehumidifier">Entfeuchter</span>
                    <input type="range" id="sim-dehum" min="0" max="100" step="1" value="0" class="flex-1 h-1.5 rounded accent-blue-500" oninput="runSim(this.value, 'dehum')">
                    <span id="disp-sim-dehum" class="text-[10px] font-bold text-blue-700 w-10 text-right shrink-0">0 kW</span>
                </div>
                <div class="flex items-center gap-2">
                    <span class="text-[10px] font-bold text-amber-600 w-16 shrink-0" data-i18n="sim.heating">Heizung</span>
                    <input type="range" id="sim-heat" min="0" max="200" step="5" value="0" class="flex-1 h-1.5 rounded accent-amber-500" oninput="runSim(this.value, 'heat')">
                    <span id="disp-sim-heat" class="text-[10px] font-bold text-amber-700 w-10 text-right shrink-0">0 kW</span>
                </div>
                <div id="sim-effect" class="hidden mt-2 grid grid-cols-3 gap-1 text-center">
                    <div class="bg-white border border-amber-100 rounded px-1 py-1">
                        <div class="text-[8px] text-slate-400 font-bold">&Delta;T</div>
                        <div class="text-[11px] font-black text-amber-700" id="sim-dt">+0.0&deg;C</div>
                    </div>
                    <div class="bg-white border border-amber-100 rounded px-1 py-1">
                        <div class="text-[8px] text-slate-400 font-bold" data-i18n="air.supply">Zuluft</div>
                        <div class="text-[11px] font-black text-amber-700" id="sim-t2h2">20&deg;/60%</div>
                    </div>
                    <div class="bg-white border border-red-100 rounded px-1 py-1">
                        <div class="text-[8px] text-slate-400 font-bold" data-i18n="sim.extra_cost">Mehrkosten</div>
                        <div class="text-[11px] font-black text-red-600" id="sim-cost">+0.00 CHF/h</div>
                    </div>
                </div>
            </div>
            <div id="guide-zuluft-block" class="luft-zeile flex items-center justify-between gap-1">
                <div class="w-16 shrink-0"><div class="text-[9px] text-amber-600 font-bold uppercase tracking-wide" data-i18n="air.supply">Zuluft</div><button id="sim-toggle-btn" onclick="toggleSimPanel()" title="Simulation aus" class="w-full h-10 flex flex-col items-center justify-center text-[9px] font-bold text-amber-700 bg-amber-50 px-1 rounded border border-amber-100 transition-colors"><i data-lucide="zap" width="14"></i><span class="leading-none mt-0.5" data-i18n="air.sim_btn">Simulation</span></button></div>
                <div class="flex items-center bg-slate-50 rounded-lg p-0.5 gap-0.5"><button class="stepper-btn" onmousedown="startStep('t2', -0.1, -1.0)" ontouchstart="startStep('t2', -0.1, -1.0)" onmouseup="stopStep()" ontouchend="stopStep()">-</button><div class="text-center"><input type="number" id="t2-in" class="val-input" value="20" onchange="manualInput('t2', this.value)"><div class="text-[9px] text-slate-400 font-bold">°C</div></div><button class="stepper-btn" onmousedown="startStep('t2', 0.1, 1.0)" ontouchstart="startStep('t2', 0.1, 1.0)" onmouseup="stopStep()" ontouchend="stopStep()">+</button></div>
                <div class="flex items-center bg-slate-50 rounded-lg p-0.5 gap-0.5"><button class="stepper-btn" onmousedown="startStep('h2', -1, -5)" ontouchstart="startStep('h2', -1, -5)" onmouseup="stopStep()" ontouchend="stopStep()">-</button><div class="text-center"><input type="number" id="h2-in" class="val-input" value="60" onchange="manualInput('h2', this.value)"><div class="text-[9px] text-slate-400 font-bold">%</div></div><button class="stepper-btn" onmousedown="startStep('h2', 1, 5)" ontouchstart="startStep('h2', 1, 5)" onmouseup="stopStep()" ontouchend="stopStep()">+</button></div>
            </div>
            <hr class="border-slate-100">
            <div class="luft-zeile flex items-center justify-between gap-1">
                <div class="w-16 shrink-0"><div class="text-[9px] text-emerald-600 font-bold uppercase tracking-wide" data-i18n="air.exhaust">Abluft</div><label class="flex items-center gap-1"><input type="checkbox" id="check-adiabatic" class="accent-emerald-600" checked onchange="update()"><span class="text-[9px] font-bold text-slate-400">Auto</span><button onclick="openKnowledgeArticle('05-luftaufbereitung.md')" class="w-4 h-4 rounded-full border border-slate-300 flex items-center justify-center" title="Erklärung in Info & Wissen"><i data-lucide="badge-info" width="12" height="12" class="text-blue-400 cursor-pointer"></i></button></label></div>
                <div class="flex items-center bg-slate-50 rounded-lg p-0.5 gap-0.5"><button class="stepper-btn" onmousedown="startStep('t3', -0.1, -1.0)" ontouchstart="startStep('t3', -0.1, -1.0)" onmouseup="stopStep()" ontouchend="stopStep()">-</button><div class="text-center"><input type="number" id="t3-in" class="val-input" value="15" onchange="manualInput('t3', this.value)"><div class="text-[9px] text-slate-400 font-bold">°C</div></div><button class="stepper-btn" onmousedown="startStep('t3', 0.1, 1.0)" ontouchstart="startStep('t3', 0.1, 1.0)" onmouseup="stopStep()" ontouchend="stopStep()">+</button></div>
                <div id="h3-group" class="flex items-center bg-slate-50 rounded-lg p-0.5 gap-0.5"><button class="stepper-btn" onmousedown="startStep('h3', -1, -5)" ontouchstart="startStep('h3', -1, -5)" onmouseup="stopStep()" ontouchend="stopStep()">-</button><div class="text-center"><input type="number" id="h3-in" class="val-input" value="90" onchange="manualInput('h3', this.value)"><div class="text-[9px] text-slate-400 font-bold">%</div></div><button class="stepper-btn" onmousedown="startStep('h3', 1, 5)" ontouchstart="startStep('h3', 1, 5)" onmouseup="stopStep()" ontouchend="stopStep()">+</button></div>
            </div>
            <div id="step3-warn" class="hidden text-center bg-red-50 text-red-600 text-xs font-bold p-1 rounded" data-i18n="warn.exhaust_above_supply">Achtung: Abluft > Zuluft</div>
        </div>

        <div class="grid grid-cols-2 gap-3">
            
            <div id="card-water" class="dash-card bg-blue-50 border-blue-200" onclick="toggleDetail('water')">
                <div class="flex justify-between items-start">
                    <div class="label-sm text-blue-800" data-i18n="card.water_removal">Wasserentzug</div>
                    <i data-lucide="droplets" width="16" class="text-blue-400"></i>
                </div>
                <div class="flex items-baseline gap-1 mt-1"><span id="res-water-total" class="text-3xl font-black text-blue-700">0</span> <span class="text-xs font-bold text-slate-400">L/h</span></div>
                <div class="mt-2 text-xs font-bold text-slate-500"><span id="res-water-m3">0.0</span> g/m³</div>
                <div class="mt-2">
                    <div id="milk-can-vis" class="milk-can-row"></div>
                </div>
                <div id="warn-rehumid" class="hidden mt-2 text-[10px] font-bold text-red-700 bg-red-50 border border-red-200 rounded px-2 py-1" data-i18n="warn.rehumidification">Achtung Rueckbefeuchtung!</div>
                <div class="absolute bottom-2 right-2 text-[10px] text-blue-300 font-bold" data-i18n="common.details">▼ Details</div>
            </div>

            <div id="card-status" class="dash-card" onclick="toggleDetail('status')">
                <div class="flex justify-between items-start">
                    <div class="label-sm text-slate-500" data-i18n="card.stock_status">Heustock Status</div>
                    <i data-lucide="activity" width="16" class="text-slate-400"></i>
                </div>
                
                <div class="mt-1 mb-1 h-8 flex items-center">
                     <span class="text-lg font-black text-slate-800 leading-tight truncate" id="card-phase-title">---</span>
                </div>
                
                <div class="w-full bg-slate-100 rounded-full h-2 mb-1"><div id="ts-bar" class="bg-emerald-500 h-2 rounded-full transition-all" style="width: 0%"></div></div>
                
                <div class="text-xs font-bold text-emerald-600 text-left">
                    <span id="res-ts">0</span>% TS
                </div>
                <div class="absolute bottom-2 right-2 text-[10px] text-slate-300 font-bold" data-i18n="common.details">▼ Details</div>
            </div>
        </div>

        <div id="detail-water" class="detail-box" onclick="event.stopPropagation()">
            <div class="flex justify-between items-center mb-1.5">
                <span class="label-sm text-slate-500" data-i18n="detail.calc_basis">Berechnungsgrundlagen</span>
                <button onclick="openKnowledgeArticle('06-berechnungsgrundlagen.md')" class="flex items-center gap-0.5 text-[9px] font-bold text-blue-500" data-i18n-title="detail.theory_link_title" title="Formel & Theorie in Info&Wissen öffnen">
                    <i data-lucide="book-open" width="10"></i>
                    <span data-i18n="detail.theory_link">Theorie</span>
                </button>
            </div>
            <div class="grid grid-cols-2 gap-x-3 gap-y-0.5 mb-2">
                <span class="text-[10px] text-slate-500" data-i18n="detail.altitude">Höhe</span>
                <span class="text-[10px] font-bold text-slate-700"><span id="calc-alt">600</span> m ü.M.</span>
                <span class="text-[10px] text-slate-500" data-i18n="detail.air_pressure">Luftdruck p</span>
                <span class="text-[10px] font-bold text-slate-700"><span id="calc-p-hpa">942</span> hPa</span>
                <span class="text-[10px] text-blue-600" data-i18n="detail.x_supply">x Zuluft</span>
                <span class="text-[10px] font-bold text-blue-700"><span id="calc-x2">–</span> g/kg</span>
                <span class="text-[10px] text-emerald-600" data-i18n="detail.x_exhaust">x Abluft</span>
                <span class="text-[10px] font-bold text-emerald-700"><span id="calc-x3">–</span> g/kg</span>
                <span class="text-[10px] text-slate-500" data-i18n="detail.dx">Δx</span>
                <span class="text-[10px] font-bold text-slate-700"><span id="calc-dx">–</span> g/kg</span>
                <span class="text-[10px] text-slate-500" data-i18n="detail.air_density">Luftdichte ρ</span>
                <span class="text-[10px] font-bold text-slate-700"><span id="calc-rho">–</span> kg/m³</span>
            </div>
            <div class="text-[9px] text-slate-400 font-mono select-text mb-3">Δx · ρ · V̇ · 3.6 = L/h</div>
            <h4 class="label-sm text-blue-600 mb-2" data-i18n="detail.energy_cost_hour">Energie & Kosten pro Stunde</h4>
            <div class="stat-row"><span class="stat-label" data-i18n="detail.electricity">Strom (Ventilator/Entf.)</span><span class="stat-val" id="det-elec">0 kWh</span></div>
            <div class="stat-row"><span class="stat-label" data-i18n="detail.electricity_cost">Strom Kosten</span><span class="stat-val" id="det-elec-cost">0.00 CHF</span></div>
            <div class="stat-row"><span class="stat-label" data-i18n="detail.heat_input">Wärme Input</span><span class="stat-val" id="det-heat">0 kWh</span></div>
            <div class="stat-row"><span class="stat-label" data-i18n="detail.oil_equiv">Heizöl Äquivalent</span><span class="stat-val" id="det-oil">0.0 L</span></div>
            <div class="stat-row"><span class="stat-label" data-i18n="detail.heat_cost">Wärme Kosten</span><span class="stat-val" id="det-heat-cost">0.00 CHF</span></div>
            <div class="stat-row bg-white rounded px-2 mt-1 border border-blue-100"><span class="stat-label text-blue-800 font-bold" data-i18n="detail.cost_per_liter">Kosten pro Liter Wasserentzug</span><span class="stat-val text-blue-600" id="det-cpl">-</span></div>
        </div>

        <div id="detail-status" class="detail-box" onclick="event.stopPropagation()">
            <div id="status-pressure-warning" class="hidden mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[11px] leading-tight text-red-700">
                <div class="font-bold">Druck messen oder Angaben zu Ventilator und Futterschichten erfassen.</div>
                <div>Für Drucküberwachung Ventilator und Futterschichten erfassen, daraus kann Druck berechnet werden.</div>
            </div>
            
            <div class="bg-white p-3 rounded-xl border border-slate-200 shadow-sm mb-4">
                <div class="flex justify-between items-center mb-2">
                    <span class="label-sm text-slate-500" data-i18n="detail.pressure">Druck</span>
                    <select id="p-unit" class="text-xs border rounded bg-slate-50 font-bold text-slate-600 px-1 py-0.5" onchange="changePressureUnit(this)">
                        <option value="1">mbar</option>
                        <option value="0.01" selected>Pa</option>
                        <option value="0.9806">cmWS</option>
                    </select>
                </div>
                <div class="grid grid-cols-2 gap-3 h-24">
                    <div id="box-calc-p" class="p-box inactive rounded-lg" onclick="setPressureMode(false)">
                        <div class="text-[9px] text-slate-400 font-bold uppercase" data-i18n="detail.pressure_calc">Druck berechnet</div>
                        <div class="font-bold text-slate-700 text-lg leading-none mt-1"><span id="val-calc-p">0.0</span></div>
                        <div class="text-[9px] text-slate-400 unit-label">mbar</div>
                        <div id="calc-p-hint" class="hidden text-[8px] text-slate-400 leading-tight mt-1 px-2 text-center">Futterlager konfigurieren, um Druck zu berechnen</div>
                        <button id="calc-p-fodder-btn" type="button" onclick="event.stopPropagation(); openHeucheckModal('lager')" class="mt-2 hidden items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1 text-[9px] font-bold text-emerald-700 active:bg-emerald-100">
                            <i data-lucide="house" width="10"></i>
                            <span data-i18n="nav.fodder">Futterlager</span>
                        </button>
                    </div>
                    <div id="box-meas-p" class="p-box inactive rounded-lg relative" onclick="setPressureMode(true)">
                        <div class="text-[9px] text-blue-500 font-bold uppercase flex items-center gap-1"><i data-lucide="gauge" width="10"></i> <span data-i18n="detail.pressure_meas">Messung</span></div>
                        <div class="flex items-center gap-1 mt-1 w-full justify-center">
                            <button class="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center font-bold" onclick="stepP(-0.1)">-</button>
                            <input type="number" id="inp-meas-p" placeholder="-" class="w-16 text-center font-bold text-lg leading-none bg-transparent outline-none text-blue-600" oninput="setPressureMode(true); update()">
                            <button class="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center font-bold" onclick="stepP(0.1)">+</button>
                        </div>
                        <div class="text-[9px] text-slate-400 unit-label">mbar</div>
                    </div>
                </div>
            </div>

            <details id="aero-live-wrap" class="mb-2 rounded border text-[10px] aero-live-locked">
                <summary id="aero-live-summary" class="text-xs font-bold text-slate-700"><span data-i18n="detail.aero_live">Aerodynamik Live</span> <span class="inline-block px-1 py-0.5 rounded text-[8px] font-black uppercase tracking-wide bg-amber-300 text-amber-900" data-i18n="rec.beta_badge">Beta</span></summary>
                <div class="p-2">
                    <div id="aero-live-lock-hint" class="mb-2 rounded border border-amber-200 bg-amber-50 px-2 py-1 text-[10px] font-bold text-amber-700">
                        Aerodynamik wird freigeschaltet, sobald Ventilator und Futterschichten erfasst sind.
                    </div>
                    <div class="stat-row"><span class="stat-label" data-i18n="detail.stock_height_used">Stockhöhe</span><span class="stat-val" id="det-stock-height-live">0.0 m</span></div>
                    <div class="stat-row"><span class="stat-label" data-i18n="detail.stock_resistance_density">Widerstand / Dichte</span><span class="stat-val" id="det-stock-resistance-density">0 Pa / -</span></div>
                    <div class="stat-row"><span class="stat-label" data-i18n="detail.system_surcharge">Systemzuschläge</span><span class="stat-val" id="det-system-surcharge-live">0 Pa</span></div>
                    <div class="stat-row"><span class="stat-label" data-i18n="card.air_volume">Luftmenge</span><span class="stat-val" id="det-flow">0 m³/s</span></div>
                    <div class="stat-row"><span class="stat-label" data-i18n="stat.air_volume_spec">Luftmenge spezifisch</span><span class="stat-val" id="det-flow-spec">0.00 m³/m²/s</span></div>
                    <div class="stat-row"><span class="stat-label flex items-center gap-1"><span data-i18n="input.air_speed">Geschwindigkeit</span> <i data-lucide="badge-info" width="12" height="12" class="text-blue-400 cursor-pointer" onclick="openDialogById('speed-guidelines-modal')"></i></span><span class="stat-val"><span id="ampel-speed" class="ampel bg-gray-300"></span><span id="det-speed">0.00 m/s</span></span></div>
                    <div class="stat-row"><span class="stat-label flex items-center gap-1"><span data-i18n="stat.static_pressure">Statischer Druck</span> <i data-lucide="badge-info" width="12" height="12" class="text-blue-400 cursor-pointer" onclick="toggleInfo('pressure-info')"></i></span><span class="stat-val"><span id="ampel-press" class="ampel bg-gray-300"></span><span id="det-press">0 mbar</span></span></div>
                    <details id="press-auto-wrap" class="mb-2 rounded border text-[10px]"><summary id="press-auto-summary">Hinweis Druck</summary><div id="press-auto-hint" class="p-2"></div></details>
                    <div id="pressure-info" class="hidden bg-slate-50 border rounded p-2 text-[10px] mb-2 text-slate-600">
                        <strong>Richtwerte statischer Druck:</strong><br>
                        Schichtzuschlag je Meter Futterhöhe:<br>
                        Dauerwiese: 160 Pa | Gräser/Kräuter: 120 Pa | Kleereich: 240 Pa<br>
                        Systemzuschläge:<br>
                        Dachabsaugung: 120 Pa | Wärmetauscher: 70 Pa | Entfeuchter: 120 Pa<br>
                        Höhenkorrektur: ab 1000 m ü.M. ca. +10%
                    </div>
                    <div class="stat-row"><span class="stat-label" data-i18n="stat.power_demand">Leistungsbedarf</span><span class="stat-val" id="det-power">0.0 kW</span></div>
                    <div class="stat-row"><span class="stat-label flex items-center gap-1"><span data-i18n="stat.system_eff">System-Effizienz</span> <i data-lucide="badge-info" width="12" height="12" class="text-blue-400 cursor-pointer" onclick="toggleInfo('eff-info')"></i></span><span class="stat-val"><span id="ampel-eff" class="ampel bg-gray-300"></span><span id="det-eff">-</span></span></div>
                    <details id="eff-auto-wrap" class="mb-2 rounded border text-[10px]"><summary id="eff-auto-summary">Hinweis Effizienz</summary><div id="eff-auto-hint" class="p-2"></div></details>
                    <div id="eff-info" class="hidden bg-slate-50 border rounded p-2 text-[10px] mb-2 text-slate-600">
                        <strong>Richtwert System-Effizienz:</strong><br>
                        <span class="text-emerald-600">&gt; <span id="eff-good">50</span>%</span> guter Betriebspunkt | <span class="text-amber-600"><span id="eff-warn">30</span>-<span id="eff-good-2">50</span>%</span> prüfenswert | <span class="text-red-600">&lt; <span id="eff-warn-2">30</span>%</span> ungünstiger Betrieb
                    </div>
                </div>
            </details>
        </div>

        <div id="card-kittl" class="rec-banner bg-slate-100" onclick="toggleDetail('kittl')">
            <div class="flex items-center gap-3">
                <div class="bg-white p-1.5 rounded-full text-blue-500 shadow-sm"><i data-lucide="badge-info" width="18" height="18"></i></div>
                <div>
                    <div class="flex items-center gap-2">
                        <div class="label-sm text-blue-400 mb-0" data-i18n="rec.title">Empfehlung</div>
                        <span class="inline-flex items-center rounded-full border border-amber-300 bg-amber-100 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-amber-800" data-i18n="rec.beta">Beta</span>
                    </div>
                    <div class="font-bold text-sm text-blue-900" id="rec-text">---</div>
                </div>
            </div>
            <div class="text-blue-300"><i data-lucide="chevron-down" width="20"></i></div>
        </div>
        <div id="detail-kittl" class="detail-box" onclick="event.stopPropagation()">
            <div id="kittl-phase-info" class="rounded-lg border p-3 mb-2"></div>
            <div id="kittl-phase-detail" class="text-xs text-slate-700 mb-3 rounded-lg border border-slate-200 bg-slate-50 p-3"></div>
            <button onclick="openDialogById('phases-modal')" class="w-full py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold shadow-sm hover:bg-slate-800" data-i18n="btn.open_knowledge">Info & Wissen öffnen</button>
        </div>

        <div id="chart-container" class="bg-white rounded-2xl shadow-sm border border-slate-200 p-3 relative transition-all">
            <div class="flex justify-between items-center mb-2">
                <div class="label-sm" data-i18n="card.hx_diagram">h-x Diagramm</div>
                <div class="flex items-center gap-2">
                    <button onclick="resetHxZoom()" class="hx-fs-only p-1 bg-slate-100 rounded text-slate-600 hover:bg-slate-200" title="Zoom zurücksetzen">
                        <i data-lucide="rotate-ccw" width="16"></i>
                    </button>
                    <button onclick="toggleFullscreen()" class="p-1 bg-slate-100 rounded text-slate-600 hover:bg-slate-200" title="Vollbild">
                        <i data-lucide="maximize" width="16"></i>
                    </button>
                </div>
            </div>
            <div class="hx-chart-wrap w-full max-w-[28rem] mx-auto aspect-square relative">
                <canvas id="hxChart"></canvas>
            </div>
            <div class="flex gap-4 justify-center mt-2 text-[10px] font-bold text-slate-500">
                <span class="flex items-center gap-1"><div class="w-2 h-2 rounded-full bg-blue-500"></div> <span data-i18n="air.outside">Aussen</span></span>
                <span class="flex items-center gap-1"><div class="w-2 h-2 rounded-full bg-amber-500"></div> <span data-i18n="hx.supply_short">Zu</span></span>
                <span class="flex items-center gap-1"><div class="w-2 h-2 rounded-full bg-emerald-500"></div> <span data-i18n="hx.exhaust_short">Ab</span></span>
            </div>
        </div>

        <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-3 space-y-3">
            <div class="flex items-center justify-between gap-2">
                <div class="min-w-0">
                    <div class="label-sm text-slate-500" data-i18n="history.local_recording">Aufzeichnung lokal (Browser)</div>
                    <div class="mt-1 flex items-center gap-2 min-w-0">
                        <div id="history-active-storage-title" class="text-[10px] font-black text-slate-700 leading-tight truncate">Futterlager 1</div>
                        <div id="history-storage-switcher" class="flex items-center gap-1 shrink-0"></div>
                    </div>
                </div>
                <div class="flex flex-wrap items-center gap-2">
                    <div class="history-zoom-control">
                        <span class="history-zoom-label" data-i18n="history.zoom">Zoomen</span>
                        <button onclick="zoomHistory(-1)" class="history-zoom-btn" title="Zoom out">
                            <i data-lucide="minus" width="14" height="14"></i>
                        </button>
                        <button id="history-zoom-value" onclick="setHistoryPreset('one-to-one')" class="history-zoom-value" title="Zurueck auf 1:1">100 %</button>
                        <button onclick="zoomHistory(1)" class="history-zoom-btn" title="Zoom in">
                            <i data-lucide="plus" width="14" height="14"></i>
                        </button>
                        <span class="history-zoom-divider"></span>
                        <button id="history-preset-1to1" onclick="setHistoryPreset('one-to-one')" class="history-zoom-btn history-zoom-1to1" title="Gut lesbare 1:1 Skalierung">1:1</button>
                        <button id="history-preset-fullscreen" onclick="setHistoryPreset('fullscreen')" class="history-zoom-btn history-zoom-fullscreen" title="Gesamten Datensatz einpassen">
                            <i data-lucide="maximize-2" width="14" height="14"></i>
                        </button>
                    </div>
                    <div id="history-count" class="text-[11px] font-bold text-slate-500">0 Punkte</div>
                </div>
            </div>

            <div class="flex flex-wrap gap-2">
                <button onclick="recordCurrentPoint()" class="px-3 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold" data-i18n="history.capture_point">Punkt erfassen</button>
                <button onclick="openHistoryEditModal()" id="btn-edit-point" class="px-3 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hidden" title="Ausgewählten Punkt im Bearbeitungs-Modal öffnen">Bearbeiten</button>
                <button onclick="deleteSelectedHistoryPoint()" id="btn-delete-point" class="px-3 py-2 bg-slate-200 text-slate-700 rounded-lg text-xs font-bold hidden" data-i18n="history.delete_point">Löschen</button>
                <button onclick="exportHistoryJson()" class="px-3 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold" data-i18n="history.export_json">Export JSON</button>
                <button onclick="exportHistoryCsv()" class="px-3 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold" data-i18n="history.export_csv">Export CSV</button>
                <button onclick="triggerHistoryImport()" class="px-3 py-2 bg-amber-600 text-white rounded-lg text-xs font-bold" data-i18n="history.import">Import</button>
                <button onclick="confirmClearHistoryData()" class="px-3 py-2 bg-red-600 text-white rounded-lg text-xs font-bold" data-i18n="history.clear">Leeren</button>
                <input id="history-import-input" type="file" accept=".json,.csv,text/csv,application/json" class="hidden" onchange="handleHistoryImport(event)">
            </div>

            <div class="bg-slate-50 border rounded-lg p-2 h-44">
                <div id="history-chart-scroll" class="history-scroll h-full">
                    <canvas id="historyChart" class="history-inner"></canvas>
                </div>
            </div>

            <div class="bg-slate-50 border rounded-lg p-2 h-44">
                <div id="history-climate-scroll" class="history-scroll h-full">
                    <canvas id="historyClimateChart" class="history-inner"></canvas>
                </div>
            </div>

            <div id="history-timeline-box" class="history-timeline-box hidden">
                <div class="history-timeline-head">
                    <span class="history-timeline-title" data-i18n="history.timepoint_select">Zeitpunkt-Auswahl</span>
                    <span id="history-selected-label" class="history-timeline-label">-</span>
                </div>
                <input id="history-index-slider" type="range" min="0" max="0" value="0" step="1" class="history-timeline-slider" oninput="applyHistoryRecord(this.value)">
            </div>

            <details class="rounded border border-slate-200 bg-white">
                <summary class="text-xs font-bold text-slate-600" data-i18n="history.data_table">Daten-Tabelle</summary>
                <div class="overflow-auto max-h-64">
                    <table class="info-table">
                        <thead>
                            <tr>
                                <th data-i18n="hist_table.time">Zeit</th>
                                <th data-i18n="nav.fodder">Futterlager</th>
                                <th data-i18n="hist_table.air_quality">Luftqualitaet</th>
                                <th data-i18n="card.water_removal">Wasserentzug</th>
                                <th data-i18n="detail.pressure">Druck</th>
                            </tr>
                        </thead>
                        <tbody id="history-table-body"></tbody>
                    </table>
                </div>
            </details>
        </div>
        
    </div>

    <dialog id="history-edit-modal" class="p-0">
        <div class="p-4 border-b bg-slate-50 flex justify-between items-center sticky top-0 bg-white z-10">
            <h3 class="font-bold">Bearbeiten</h3>
            <button onclick="closeDialogById('history-edit-modal')" class="p-1"><i data-lucide="x" width="20"></i></button>
        </div>
        <div class="p-4 space-y-3">
            <div class="text-xs text-slate-600">
                Ausgewählter Zeitpunkt: <span id="history-edit-selected-label" class="font-bold text-slate-800">-</span>
            </div>
            <div>
                <label for="history-edit-datetime" class="label-sm">Zeit/Datum</label>
                <input id="history-edit-datetime" type="datetime-local" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-bold text-slate-700 bg-white" title="Zeit/Datum für den ausgewählten Punkt bearbeiten">
            </div>
            <div class="grid grid-cols-1 gap-2">
                <button onclick="updateSelectedHistoryPoint()" class="px-3 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold" title="Ausgewählten Punkt mit aktuellen Werten und gewähltem Zeit/Datum speichern">Neue Zeit speichern</button>
                <button onclick="applyCurrentInputsForSelectedTimestamp()" class="px-3 py-2 bg-violet-600 text-white rounded-lg text-xs font-bold" title="Aktuell eingegebene Daten für diesen Zeitpunkt übernehmen">Aktuelle Daten übernehmen</button>
                <button onclick="closeDialogById('history-edit-modal')" class="px-3 py-2 bg-slate-200 text-slate-700 rounded-lg text-xs font-bold">Abbrechen</button>
            </div>
        </div>
    </dialog>

    <dialog id="heucheck-modal" class="p-0 flex flex-col h-[90vh]">
        <div class="p-4 border-b bg-slate-50 flex justify-between items-center shrink-0">
            <div>
                <div class="flex items-center gap-2 mb-0.5">
                    <h3 class="font-bold" data-i18n="nav.fodder">Futterlager</h3>
                    <span class="inline-block px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wide bg-amber-300 text-amber-900 shadow-sm">Beta-Test</span>
                </div>
                <div id="heucheck-storage-title" class="text-[11px] font-bold text-slate-500">Futterlager: Futterlager 1</div>
            </div>
            <button onclick="closeHeucheckModal()" class="px-4 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg shadow" data-i18n="common.done">Fertig</button>
        </div>
        <div class="p-3 border-b bg-white shrink-0">
            <div class="flex gap-2">
                <button id="tab-heucheck-lager" class="check-tab" onclick="setHeucheckTab('lager')">1. Futterlager</button>
                <button id="tab-heucheck-luefter" class="check-tab" onclick="setHeucheckTab('luefter')">2. Lüfter</button>
                <button id="tab-heucheck-kanaele" class="check-tab" onclick="setHeucheckTab('kanaele')">3. Luftkanäle</button>
            </div>
        </div>
        <div class="flex-1 overflow-y-auto bg-slate-50">
            <div id="panel-heucheck-luefter" class="p-4 space-y-4 hidden">
                <div class="relative shrink-0 z-20">
                    <label class="label-sm mb-1" data-i18n="common.search">Suche</label>
                    <input id="fan-search" class="w-full border p-3 rounded-lg font-bold shadow-sm" placeholder="Modell tippen..." oninput="filterFans(this.value)" onkeydown="handleFanKey(event)">
                    <div id="fan-results" class="search-results hidden"></div>
                    <button onclick="resetFanSelection()" class="mt-2 px-3 py-1.5 rounded-md border border-slate-300 bg-white text-[11px] font-bold text-slate-600 hover:bg-slate-50" data-i18n="heucheck.reset_fan">Lüfter zurücksetzen</button>
                </div>

                <details id="fan-suggestions-wrap" class="rounded-lg border border-emerald-200 bg-emerald-50/70 shadow-sm">
                    <summary class="px-3 py-2 text-xs font-bold text-emerald-800" data-i18n="heucheck.suggestions">Lüfter-Vorschläge</summary>
                    <div class="px-3 pb-3">
                        <div id="fan-suggestion-target" class="mb-2 text-[11px] font-bold text-emerald-900">Soll: -</div>
                        <div id="fan-suggestions" class="space-y-2"></div>
                    </div>
                </details>

                <div class="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
                    <div class="label-sm mb-1" data-i18n="heucheck.custom_fan">Eigener Lüfter erfassen</div>
                    <div class="flex gap-2">
                        <input id="inp-custom-fan-name" type="text" class="flex-1 border p-2 rounded font-bold" placeholder="Name eingeben">
                        <button onclick="createCustomFan()" class="px-3 py-2 rounded bg-slate-900 text-white text-xs font-bold" data-i18n="heucheck.custom_fan_create">Übernehmen</button>
                    </div>
                </div>

                <div class="bg-white border rounded-lg p-2 h-40 shrink-0 shadow-sm relative z-0">
                    <canvas id="fanChart"></canvas>
                </div>
                
                <div class="border rounded-lg overflow-hidden shrink-0 bg-white">
                    <button onclick="toggleCurveEditor()" class="w-full p-2 bg-slate-100 border-b text-xs font-bold text-slate-600 flex justify-between items-center">
                        <span data-i18n="heucheck.curve_edit">Kennlinie bearbeiten (Punkte)</span> <i data-lucide="chevron-down" width="14"></i>
                    </button>
                    <div id="fan-curve-editor" class="hidden bg-slate-50 p-2">
                        <div class="mb-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] text-slate-600">
                            <div id="fan-curve-name" class="font-bold text-slate-800">Standard</div>
                            <div id="fan-curve-details" class="mt-0.5">Pmax 12.2 mbar</div>
                        </div>
                        <div class="grid grid-cols-2 gap-2 mb-2">
                            <div>
                                <label class="label-sm" data-i18n="heucheck.pressure_unit">Druckeinheit</label>
                                <select id="fan-pressure-unit" class="w-full border rounded p-2 text-xs font-bold bg-white" onchange="setFanEditorUnit('pressure', this.value)">
                                    <option value="mbar">mbar</option>
                                    <option value="Pa">Pa</option>
                                    <option value="mmH2O">mm H2O</option>
                                </select>
                            </div>
                            <div>
                                <label class="label-sm" data-i18n="card.air_volume">Luftmenge</label>
                                <select id="fan-flow-unit" class="w-full border rounded p-2 text-xs font-bold bg-white" onchange="setFanEditorUnit('flow', this.value)">
                                    <option value="m3s">m³/s</option>
                                    <option value="m3h">m³/h</option>
                                </select>
                            </div>
                        </div>
                        <table class="w-full text-xs text-center mb-2">
                            <thead><tr class="text-slate-400"><th id="curve-head-pressure">mbar</th><th id="curve-head-flow">m³/s</th><th>kW</th><th data-i18n="heucheck.curve_marker">Marke</th><th></th></tr></thead>
                            <tbody id="curve-body"></tbody>
                        </table>
                        <button onclick="addCurvePoint()" class="w-full border border-dashed text-slate-400 text-xs py-1 rounded hover:bg-white" data-i18n="heucheck.add_point">+ Punkt</button>
                    </div>
                </div>
            </div>

            <div id="panel-heucheck-lager" class="p-4 space-y-4">
                <div class="bg-white border rounded-lg p-3 shadow-sm">
                    <div class="grid grid-cols-2 gap-2">
                        <div>
                            <label class="label-sm" data-i18n="heucheck.base_area">Grundfläche (m²)</label>
                            <div class="flex items-center bg-slate-50 rounded-lg p-0.5 gap-0.5 border border-slate-200">
                                <button class="stepper-btn compact" onclick="stepStorageArea(-1)">-</button>
                                <div class="text-center flex-1 px-1">
                                    <input id="inp-area" type="number" min="1" step="1" class="val-input" style="width:56px" onchange="setStorageArea(this.value)">
                                    <div class="text-[8px] text-slate-400 font-bold">m²</div>
                                </div>
                                <button class="stepper-btn compact" onclick="stepStorageArea(1)">+</button>
                            </div>
                        </div>
                        <div>
                            <label class="label-sm" data-i18n="heucheck.stock_height">Stockhöhe maximal (m)</label>
                            <div class="flex items-center bg-slate-50 rounded-lg p-0.5 gap-0.5 border border-slate-200">
                                <button class="stepper-btn compact" onclick="stepManualStockHeight(-0.1)">-</button>
                                <div class="text-center flex-1 px-1">
                                    <input id="inp-stock-h" type="number" min="0.1" step="0.1" class="val-input" style="width:56px" onchange="setManualStockHeight(this.value)">
                                    <div class="text-[8px] text-slate-400 font-bold">m</div>
                                </div>
                                <button class="stepper-btn compact" onclick="stepManualStockHeight(0.1)">+</button>
                            </div>
                        </div>
                    </div>
                    <div class="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                        <div class="label-sm mb-2" data-i18n="heucheck.system_extras">Systemzuschläge</div>
                        <label class="flex items-center gap-2 text-xs font-bold text-slate-700">
                            <input id="inp-roof-exhaust" type="checkbox" class="h-4 w-4 rounded border-slate-300 text-emerald-600" onchange="setSystemExtra('roofExhaust', this.checked)">
                            <span data-i18n="heucheck.roof_exhaust">Unterdach-Absaugung (+120 Pa)</span>
                        </label>
                        <label class="mt-2 flex items-center gap-2 text-xs font-bold text-slate-700">
                            <input id="inp-conditioning-unit" type="checkbox" class="h-4 w-4 rounded border-slate-300 text-emerald-600" onchange="setSystemExtra('conditioningUnit', this.checked)">
                            <span data-i18n="heucheck.conditioning_unit">Wärmetauscher / Luftentfeuchter (+190 Pa)</span>
                        </label>
                    </div>
                </div>

                <div class="bg-white border rounded-lg p-3 shadow-sm">
                    <div class="label-sm mb-2" data-i18n="heucheck.layers">Schichten</div>
                    <button onclick="addLayer()" class="w-full mb-3 py-2 border-2 border-dashed border-slate-300 text-slate-500 font-bold rounded-lg text-xs" data-i18n="heucheck.add_layer">+ Schicht hinzufügen</button>
                    <div id="layers-list" class="space-y-2"></div>
                    <div class="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-2">
                        <label class="label-sm" for="inp-grate-height-cm">Rosthöhe (cm)</label>
                        <input id="inp-grate-height-cm" type="number" min="0" step="1" class="w-full border rounded p-2 font-bold" onchange="setGrateHeightCm(this.value)">
                    </div>
                </div>

                <div class="bg-white border rounded-lg p-3 shadow-sm">
                    <div class="label-sm mb-2" data-i18n="heucheck.visualization">Visualisierung</div>
                    <div id="stock-vis" class="min-h-[180px]"></div>
                    <div class="grid grid-cols-2 gap-2 mt-3 text-xs">
                        <div class="bg-slate-50 border rounded p-2"><span class="text-slate-500" data-i18n="heucheck.density">Dichte (ca., FS)</span><div class="font-bold"><span id="stock-density">-</span> kg FS/m³</div></div>
                        <div class="bg-slate-50 border rounded p-2"><span class="text-slate-500" data-i18n="heucheck.fodder_amount">Futtermenge (geschätzt)</span><div class="font-bold text-emerald-700"><span id="stock-kgts">-</span> dt TS</div></div>
                        <div class="bg-slate-50 border rounded p-2"><span class="text-slate-500">Druck Schichten (berechnet)</span><div class="font-bold text-amber-700"><span id="stock-layer-pressure">-</span></div></div>
                        <div class="bg-slate-50 border rounded p-2"><span class="text-slate-500">Druck Gesamtsystem</span><div class="font-bold text-amber-800"><span id="stock-total-pressure">-</span></div></div>
                    </div>
                    <div class="mt-2 text-[11px] text-slate-500">Heustockhöhe effektiv: <strong><span id="stock-height-used">-</span> m</strong> <span id="stock-height-mode" class="text-slate-400"></span></div>
                    <div class="mt-2 text-[11px] text-slate-500 bg-slate-50 border rounded p-2">
                        Schätzung: <strong>kg TS = Fläche (m²) × Höhe (m) × Dichte_FS (kg FS/m³) × TS/100</strong>
                        <br>Mittelwert Dichte: <strong>kg FS/m³ = Σ(Schichtmasse FS) ÷ Σ(Schichtvolumen)</strong>
                    </div>
                </div>
            </div>

            <div id="panel-heucheck-kanaele" class="p-4 space-y-4 hidden">
                <div class="bg-white border rounded-lg p-3 shadow-sm">
                    <div class="label-sm mb-2">Luftkanäle</div>
                    <div class="mb-2 grid grid-cols-3 gap-2 text-[11px]">
                        <div class="rounded border bg-slate-50 px-2 py-1"><span class="text-slate-500">Luftmenge</span><div id="air-channel-flow-target" class="font-bold text-slate-800">0.00 m³/s</div></div>
                        <div class="rounded border bg-slate-50 px-2 py-1"><span class="text-slate-500">Mindestquerschnitt Sammelkanal</span><div id="air-intake-min" class="font-bold text-blue-700">-</div></div>
                        <div class="rounded border bg-slate-50 px-2 py-1"><span class="text-slate-500">Mindestquerschnitt Druckkanal</span><div id="air-supply-min" class="font-bold text-amber-700">-</div></div>
                    </div>
                    <div class="grid grid-cols-2 gap-2">
                        <div>
                            <label class="label-sm" for="inp-intake-area">Sammelkanal Querschnitt (m²)</label>
                            <input id="inp-intake-area" type="number" min="0" step="0.01" class="w-full border rounded p-2 font-bold" onchange="setAirChannelArea('intake', this.value)">
                            <div id="air-intake-status" class="mt-1 text-[11px] text-slate-500">-</div>
                        </div>
                        <div>
                            <label class="label-sm" for="inp-supply-area">Druckkanal Querschnitt (m²)</label>
                            <input id="inp-supply-area" type="number" min="0" step="0.01" class="w-full border rounded p-2 font-bold" onchange="setAirChannelArea('supply', this.value)">
                            <div id="air-supply-status" class="mt-1 text-[11px] text-slate-500">-</div>
                        </div>
                    </div>
                    <div id="air-channel-guideline" class="mt-2 rounded border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] text-slate-600">Sammelkanal: Richtwert 4 m/s (Bereich 3-5 m/s). Druckkanal: Richtwert 10 m/s (Bereich 8-12 m/s).</div>
                </div>

                <div class="bg-white border border-amber-200 rounded-lg p-3 shadow-sm">
                    <div class="label-sm mb-2 text-amber-700">Dachabsaugung</div>
                    <!-- Infografik Seite A / Seite B -->
                    <div class="mb-3 rounded border border-amber-100 bg-amber-50 p-2">
                        <svg viewBox="0 0 260 110" width="100%" xmlns="http://www.w3.org/2000/svg" class="block" aria-label="Dachabsaugung: Seite A und Seite B">
                            <!-- Gebäude Grundriss -->
                            <rect x="40" y="30" width="180" height="60" fill="#fef9c3" stroke="#92400e" stroke-width="1.5" rx="2"/>
                            <!-- Dachfirst (Mittelachse) -->
                            <line x1="130" y1="30" x2="130" y2="90" stroke="#92400e" stroke-width="1" stroke-dasharray="4 3"/>
                            <!-- Luftpfeil Seite A (links) -->
                            <line x1="15" y1="60" x2="38" y2="60" stroke="#b45309" stroke-width="2" marker-end="url(#arr)"/>
                            <!-- Luftpfeil Seite B (rechts) -->
                            <line x1="245" y1="60" x2="222" y2="60" stroke="#b45309" stroke-width="2" marker-end="url(#arr)"/>
                            <!-- Label Seite A -->
                            <text x="8" y="55" font-size="9" font-weight="bold" fill="#92400e" text-anchor="middle">A</text>
                            <text x="8" y="68" font-size="7" fill="#92400e" text-anchor="middle">Seite</text>
                            <!-- Label Seite B -->
                            <text x="252" y="55" font-size="9" font-weight="bold" fill="#92400e" text-anchor="middle">B</text>
                            <text x="252" y="68" font-size="7" fill="#92400e" text-anchor="middle">Seite</text>
                            <!-- Dachkanal Seite A (schraffiert) -->
                            <rect x="42" y="32" width="85" height="56" fill="url(#hatch)" stroke="#d97706" stroke-width="1" rx="1"/>
                            <!-- Dachkanal Seite B (schraffiert) -->
                            <rect x="133" y="32" width="85" height="56" fill="url(#hatch)" stroke="#d97706" stroke-width="1" rx="1"/>
                            <!-- Masse-Pfeile Seite A -->
                            <line x1="127" y1="100" x2="42" y2="100" stroke="#92400e" stroke-width="1" marker-end="url(#arrs)"/>
                            <text x="84" y="109" font-size="7" fill="#92400e" text-anchor="middle">Länge A</text>
                            <!-- Masse-Pfeile Seite B -->
                            <line x1="133" y1="100" x2="218" y2="100" stroke="#92400e" stroke-width="1" marker-start="url(#arrs)" marker-end="url(#arrs)"/>
                            <text x="175" y="109" font-size="7" fill="#92400e" text-anchor="middle">Länge B</text>
                            <!-- First-Label -->
                            <text x="130" y="23" font-size="7" fill="#78350f" text-anchor="middle">First (Standard-Ansaugung)</text>
                            <!-- Definitionen Pfeile -->
                            <defs>
                                <marker id="arr" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                                    <path d="M0,0 L6,3 L0,6 Z" fill="#b45309"/>
                                </marker>
                                <marker id="arrs" markerWidth="5" markerHeight="5" refX="2.5" refY="2.5" orient="auto">
                                    <path d="M5,0 L0,2.5 L5,5" fill="none" stroke="#92400e" stroke-width="1"/>
                                </marker>
                                <pattern id="hatch" patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(45)">
                                    <line x1="0" y1="0" x2="0" y2="6" stroke="#fbbf24" stroke-width="1.5" opacity="0.5"/>
                                </pattern>
                            </defs>
                        </svg>
                        <div class="text-[9px] text-amber-700 text-center mt-1">Draufsicht: Standard ist Ansaugung am First. Luft wird von Seite A und/oder B durch den Dachkanal gezogen. Gesamtlänge = A + B.</div>
                    </div>
                    <div class="grid grid-cols-2 gap-2">
                        <div>
                            <label class="label-sm" for="inp-roof-open-width-a">Ansaugöffnung Breite Seite A (m)</label>
                            <input id="inp-roof-open-width-a" type="number" min="0" step="0.1" class="w-full border rounded p-2 font-bold" onchange="setRoofChannelField('roofOpenWidthAM', this.value)">
                        </div>
                        <div>
                            <label class="label-sm" for="inp-roof-open-width-b">Ansaugöffnung Breite Seite B (m)</label>
                            <input id="inp-roof-open-width-b" type="number" min="0" step="0.1" class="w-full border rounded p-2 font-bold" onchange="setRoofChannelField('roofOpenWidthBM', this.value)">
                        </div>
                        <div>
                            <label class="label-sm" for="inp-roof-open-length-a">Ansaugöffnung Länge Seite A (m)</label>
                            <input id="inp-roof-open-length-a" type="number" min="0" step="0.1" class="w-full border rounded p-2 font-bold" onchange="setRoofChannelField('roofOpenLengthAM', this.value)">
                        </div>
                        <div>
                            <label class="label-sm" for="inp-roof-open-length-b">Ansaugöffnung Länge Seite B (m)</label>
                            <input id="inp-roof-open-length-b" type="number" min="0" step="0.1" class="w-full border rounded p-2 font-bold" onchange="setRoofChannelField('roofOpenLengthBM', this.value)">
                        </div>
                        <div>
                            <label class="label-sm" for="inp-roof-custom-area">Ansaugfläche manuell (m², optional)</label>
                            <input id="inp-roof-custom-area" type="number" min="0" step="0.01" class="w-full border rounded p-2 font-bold" onchange="setRoofChannelField('roofCustomAreaM2', this.value)">
                        </div>
                        <div>
                            <label class="label-sm" for="inp-roof-height-cm">Kanalhöhe im Dach (cm)</label>
                            <input id="inp-roof-height-cm" type="number" min="0" step="0.1" class="w-full border rounded p-2 font-bold" onchange="setRoofChannelField('roofHeightCm', this.value)">
                        </div>
                    </div>
                        <div class="mt-3 border-t border-amber-100 pt-3">
                            <div class="label-sm mb-2 text-amber-700">Dachausrichtung &amp; Neigung</div>
                            <div class="mb-2">
                                <label class="label-sm" for="inp-roof-material">Dacheindeckung Material</label>
                                <select id="inp-roof-material" class="w-full border rounded p-2 font-bold" onchange="setRoofMaterial(this.value)">
                                    <option value="tile_dark">Ziegel dunkel</option>
                                    <option value="tile_light">Ziegel hell</option>
                                    <option value="metal_dark">Blech dunkel</option>
                                    <option value="metal_light">Blech hell</option>
                                    <option value="photovoltaic">Photovoltaik</option>
                                    <option value="fiber_cement">Faserzement</option>
                                    <option value="green_roof">Begrünt</option>
                                </select>
                            </div>
                            <div class="grid grid-cols-2 gap-2">
                                <!-- Seite A -->
                                <div class="rounded-lg border border-amber-100 bg-amber-50 p-2">
                                    <div class="text-[10px] font-bold text-amber-900 mb-1.5 text-center">Seite A</div>
                                    <div class="label-sm mb-0.5">Azimut: <span id="roof-azimut-a-display" class="font-bold text-amber-900">S (180°)</span></div>
                                    <svg id="roof-compass-a" viewBox="-52 -52 104 104" width="100%" class="block cursor-pointer touch-none select-none" style="max-height:110px">
                                        <circle r="48" fill="#fffbeb" stroke="#d97706" stroke-width="1.2"/>
                                        <line x1="0" y1="-48" x2="0" y2="-41" stroke="#d97706" stroke-width="1"/>
                                        <line x1="48" y1="0" x2="41" y2="0" stroke="#d97706" stroke-width="1"/>
                                        <line x1="0" y1="48" x2="0" y2="41" stroke="#d97706" stroke-width="1"/>
                                        <line x1="-48" y1="0" x2="-41" y2="0" stroke="#d97706" stroke-width="1"/>
                                        <text y="-34" text-anchor="middle" font-size="9" fill="#92400e">N</text>
                                        <text x="37" y="3.5" text-anchor="middle" font-size="9" fill="#92400e">O</text>
                                        <text y="42" text-anchor="middle" font-size="9" font-weight="bold" fill="#b45309">S</text>
                                        <text x="-37" y="3.5" text-anchor="middle" font-size="9" fill="#92400e">W</text>
                                        <line id="roof-needle-a" x1="0" y1="0" x2="0" y2="35" stroke="#b45309" stroke-width="2.5" stroke-linecap="round"/>
                                        <circle id="roof-dot-a" cx="0" cy="35" r="4.5" fill="#b45309"/>
                                        <circle cx="0" cy="0" r="3" fill="#78350f"/>
                                    </svg>
                                    <div class="label-sm mt-1.5 mb-0.5">Neigung: <span id="roof-tilt-a-display" class="font-bold text-amber-900">30°</span></div>
                                    <svg id="roof-tilt-a" viewBox="0 0 80 70" width="100%" class="block cursor-pointer touch-none select-none" style="max-height:68px">
                                        <path d="M 73 63 A 63 63 0 0 0 31.6 3.8" fill="none" stroke="#fde68a" stroke-width="10" stroke-linecap="round"/>
                                        <path id="roof-tilt-arc-a" d="M 73 63 A 63 63 0 0 0 64.6 31.5" fill="none" stroke="#d97706" stroke-width="10" stroke-linecap="round" opacity="0.7"/>
                                        <line x1="8" y1="63" x2="75" y2="63" stroke="#92400e" stroke-width="1.5"/>
                                        <text x="74" y="68" font-size="6.5" fill="#92400e">0°</text>
                                        <text x="28" y="8" font-size="6.5" fill="#92400e">70°</text>
                                        <circle id="roof-tilt-dot-a" cx="64.6" cy="31.5" r="6" fill="#b45309" stroke="white" stroke-width="1.5"/>
                                        <circle cx="10" cy="63" r="2" fill="#92400e"/>
                                    </svg>
                                </div>
                                <!-- Seite B -->
                                <div class="rounded-lg border border-amber-100 bg-amber-50 p-2">
                                    <div class="text-[10px] font-bold text-amber-900 mb-1.5 text-center">Seite B</div>
                                    <div class="label-sm mb-0.5">Azimut: <span id="roof-azimut-b-display" class="font-bold text-amber-900">N (0°)</span></div>
                                    <svg id="roof-compass-b" viewBox="-52 -52 104 104" width="100%" class="block cursor-pointer touch-none select-none" style="max-height:110px">
                                        <circle r="48" fill="#fffbeb" stroke="#d97706" stroke-width="1.2"/>
                                        <line x1="0" y1="-48" x2="0" y2="-41" stroke="#d97706" stroke-width="1"/>
                                        <line x1="48" y1="0" x2="41" y2="0" stroke="#d97706" stroke-width="1"/>
                                        <line x1="0" y1="48" x2="0" y2="41" stroke="#d97706" stroke-width="1"/>
                                        <line x1="-48" y1="0" x2="-41" y2="0" stroke="#d97706" stroke-width="1"/>
                                        <text y="-34" text-anchor="middle" font-size="9" fill="#92400e">N</text>
                                        <text x="37" y="3.5" text-anchor="middle" font-size="9" fill="#92400e">O</text>
                                        <text y="42" text-anchor="middle" font-size="9" font-weight="bold" fill="#b45309">S</text>
                                        <text x="-37" y="3.5" text-anchor="middle" font-size="9" fill="#92400e">W</text>
                                        <line id="roof-needle-b" x1="0" y1="0" x2="0" y2="-35" stroke="#b45309" stroke-width="2.5" stroke-linecap="round"/>
                                        <circle id="roof-dot-b" cx="0" cy="-35" r="4.5" fill="#b45309"/>
                                        <circle cx="0" cy="0" r="3" fill="#78350f"/>
                                    </svg>
                                    <div class="label-sm mt-1.5 mb-0.5">Neigung: <span id="roof-tilt-b-display" class="font-bold text-amber-900">30°</span></div>
                                    <svg id="roof-tilt-b" viewBox="0 0 80 70" width="100%" class="block cursor-pointer touch-none select-none" style="max-height:68px">
                                        <path d="M 73 63 A 63 63 0 0 0 31.6 3.8" fill="none" stroke="#fde68a" stroke-width="10" stroke-linecap="round"/>
                                        <path id="roof-tilt-arc-b" d="M 73 63 A 63 63 0 0 0 64.6 31.5" fill="none" stroke="#d97706" stroke-width="10" stroke-linecap="round" opacity="0.7"/>
                                        <line x1="8" y1="63" x2="75" y2="63" stroke="#92400e" stroke-width="1.5"/>
                                        <text x="74" y="68" font-size="6.5" fill="#92400e">0°</text>
                                        <text x="28" y="8" font-size="6.5" fill="#92400e">70°</text>
                                        <circle id="roof-tilt-dot-b" cx="64.6" cy="31.5" r="6" fill="#b45309" stroke="white" stroke-width="1.5"/>
                                        <circle cx="10" cy="63" r="2" fill="#92400e"/>
                                    </svg>
                                </div>
                            </div>
                        </div>
                    <div class="mt-2 grid grid-cols-2 gap-2 text-[11px]">
                        <div class="rounded border bg-slate-50 px-2 py-1"><span class="text-slate-500">Gesamte Öffnungslänge</span><div id="roof-total-length" class="font-bold text-slate-800">-</div></div>
                        <div class="rounded border bg-slate-50 px-2 py-1"><span class="text-slate-500">Empfohlene Ansaugfläche</span><div id="roof-recommended-area" class="font-bold text-amber-800">-</div></div>
                        <div class="rounded border bg-slate-50 px-2 py-1"><span class="text-slate-500">Kanalhöhe für 4-6 m/s</span><div id="roof-height-range" class="font-bold text-slate-800">-</div></div>
                        <div class="rounded border bg-slate-50 px-2 py-1"><span class="text-slate-500">Aktuelle Dach-Geschwindigkeit</span><div id="roof-current-speed" class="font-bold text-slate-800">-</div></div>
                    </div>
                    <div class="mt-2 rounded border border-amber-100 bg-amber-50 px-2 py-1 text-[11px] text-amber-800">Richtwert Dachabsaugung: Luftgeschwindigkeit 4-6 m/s. Ansaugfläche = Luftmenge / 4 m/s (Richtwert). Kanalhöhe = Ansaugfläche / (Länge A + Länge B).</div>
                    <div class="mt-3 border-t border-amber-100 pt-3">
                        <div class="label-sm mb-2 text-amber-700">Wärmegewinn</div>
                        <div class="grid grid-cols-2 gap-2 text-[11px]">
                            <div class="rounded border bg-slate-50 px-2 py-1"><span class="text-slate-500">Solarfaktor Seite A</span><div id="roof-solar-a" class="font-bold text-slate-400">-</div></div>
                            <div class="rounded border bg-slate-50 px-2 py-1"><span class="text-slate-500">Solarfaktor Seite B</span><div id="roof-solar-b" class="font-bold text-slate-400">-</div></div>
                            <div class="rounded border bg-slate-50 px-2 py-1"><span class="text-slate-500">Materialfaktor</span><div id="roof-material-factor" class="font-bold text-slate-400">-</div></div>
                            <div class="rounded border bg-slate-50 px-2 py-1"><span class="text-slate-500">Kontaktzeit Luft im Dachkanal</span><div id="roof-contact-time" class="font-bold text-slate-400">-</div></div>
                            <div class="rounded border bg-amber-50 px-2 py-1 col-span-2"><span class="text-slate-500">Geschätzter Wärmegewinn</span><div id="roof-heat-gain" class="font-bold text-slate-400">-</div></div>
                        </div>
                        <div class="mt-1 text-[9px] text-slate-400">Wichtig: Ansaugöffnung Breite A/B und Länge A/B definieren den Ansaugpfad. Schätzung: Sommer-Mittagssonne (CH/AT, ~47°N), Ausrichtung/Neigung + Materialabsorption + Kontaktzeit.</div>
                    </div>
                </div>
            </div>
        </div>
    </dialog>

    <dialog id="phases-modal" class="p-0">
        <div class="p-4 border-b bg-slate-50 flex justify-between items-center sticky top-0 bg-white z-10"><h3 class="font-bold" data-i18n="nav.info">Info & Wissen</h3><button onclick="closeDialogById('phases-modal')" class="p-1"><i data-lucide="x" width="20"></i></button></div>
        <div class="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
            <div class="bg-blue-50 border border-blue-200 rounded-xl p-3 text-sm text-slate-700">
                <div class="font-bold text-blue-800 mb-2 flex items-center gap-1.5"><i data-lucide="wifi" width="15"></i> Empfohlene Sensoren für Messung Wasserentzug</div>
                <div class="mb-2 text-xs text-blue-800">
                    Bemerkung: Ecowitt GW3000 (<a href="https://shop.ecowitt.com/de/products/gw3000-gw3010?variant=45110297428130" target="_blank" rel="noopener noreferrer" class="underline">Link</a>)
                </div>
                <ul class="space-y-1.5 text-xs text-slate-700">
                    <li class="flex items-start gap-1.5"><span class="text-blue-500 font-bold mt-0.5">•</span><span><strong>Ecowitt WIFI/Kabel-Gateway GW3000</strong>mit mindestens 3 Sensoren WH31</span></li>
                    <li class="flex items-start gap-1.5"><span class="text-blue-500 font-bold mt-0.5">•</span><span>Andere Funk-Wetterstation mit mindestens 3 Aussensensoren</span></li>
                </ul>
            </div>
            <div class="bg-white border border-slate-200 rounded-xl p-2">
                <input
                    id="knowledge-search"
                    type="search"
                    class="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm font-semibold text-slate-700"
                    placeholder="Volltextsuche in Info & Wissen..."
                    oninput="filterKnowledgeArticles(this.value)">
            </div>
            <?php /* AGFF-Mediathek vorläufig deaktiviert, siehe head.php
            <div data-agm-rahmen hidden>
                <h4 class="label-sm text-slate-400 mb-2">Videos</h4>
                <div data-agff-mediathek data-app="drywatch" data-themen="heu,belueftung,trocknung,anwelken"></div>
            </div>
            */ ?>
            <h4 class="label-sm text-slate-400 mb-2" data-i18n="phases.knowledge_base">Wissensdatenbank</h4>
            <div id="knowledge-list">
                <!-- Inhalte werden aus src/knowledge/*.md geladen. -->
                <?php require __DIR__ . '/partials/knowledge-modal-content.php'; ?>
            </div>
            <div id="knowledge-no-results" class="hidden rounded border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">Keine Treffer für diese Suche.</div>

        </div>
    </dialog>

    <dialog id="speed-guidelines-modal" class="p-0">
        <div class="p-4 border-b bg-slate-50 flex justify-between items-center sticky top-0 bg-white z-10"><h3 class="font-bold" data-i18n="modal.speed_title">Richtwerte Geschwindigkeit</h3><button onclick="closeDialogById('speed-guidelines-modal')" class="p-1"><i data-lucide="x" width="20"></i></button></div>
        <div class="p-4 space-y-3 text-sm text-slate-700 max-h-[70vh] overflow-y-auto">
            <div class="bg-slate-50 border rounded p-3">
                <strong>Richtwert Luftgeschwindigkeit (Heustock):</strong><br>
                Zielbereich: <span id="speed-min">0.07</span> - <span id="speed-max">0.13</span> m/s
            </div>
            <div class="bg-red-50 border border-red-200 rounded p-3 text-red-800">
                <strong>&lt; <span id="speed-min-low">0.07</span> m/s:</strong> ungenügende Durchströmung, Trocknung verzögert
            </div>
            <div class="bg-amber-50 border border-amber-200 rounded p-3 text-amber-800">
                <strong>&gt; <span id="speed-max-high">0.13</span> m/s:</strong> erhöhter Energiebedarf, Nutzen oft begrenzt
            </div>
        </div>
        <div class="p-4 border-t bg-white space-y-2">
            <button onclick="closeDialogById('speed-guidelines-modal'); openDialogById('phases-modal')" class="w-full py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold shadow-sm hover:bg-slate-800" data-i18n="btn.open_knowledge">Info und Wissen öffnen</button>
            <button onclick="closeDialogById('speed-guidelines-modal')" class="w-full py-2.5 bg-slate-800 text-white rounded-xl text-xs font-bold" data-i18n="common.close">Schliessen</button>
        </div>
    </dialog>

    <dialog id="params-modal" class="p-6">
        <h3 class="font-bold text-lg mb-4" data-i18n="settings.title">Parameter</h3>
        <div class="space-y-4">
            <div><label class="label-sm" data-i18n="settings.altitude">Höhe (m.ü.M.)</label><input id="inp-alt" type="number" class="w-full border rounded p-2 font-bold" onchange="saveParams('altitude')"></div>
            <div><label class="label-sm" data-i18n="settings.air_pressure">Luftdruck p (hPa)</label><input id="inp-air-pressure" type="number" step="1" class="w-full border rounded p-2 font-bold" onchange="saveParams('pressure')"></div>
            <div><label class="label-sm" data-i18n="settings.power_price">Strompreis (Rp./kWh)</label><input id="inp-price" type="number" class="w-full border rounded p-2 font-bold" onchange="saveParams()"></div>
            <div><label class="label-sm" data-i18n="settings.heat_price">Wärmepreis (Rp./kWh)</label><input id="inp-price-heat" type="number" class="w-full border rounded p-2 font-bold" onchange="saveParams()"></div>
            <div>
                <label class="label-sm" for="inp-language" data-i18n="settings.language">Sprache</label>
                <select id="inp-language" class="w-full border rounded p-2 font-bold" onchange="setLanguage(this.value)">
                    <option value="de">Deutsch</option>
                    <option value="fr">Français</option>
                    <option value="it">Italiano</option>
                    <option value="en">English</option>
                    <option value="rm">Rumantsch</option>
                </select>
            </div>
            <div class="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div class="label-sm mb-2" data-i18n="settings.fodder_storages">Futterlager</div>
                <div id="storage-settings-list" class="space-y-2"></div>
                <div class="mt-2 text-[11px] text-slate-500" data-i18n="settings.storage_delete_hint">Lager können nur hier gelöscht werden. Zugehörige Aufzeichnungen werden mit entfernt.</div>
            </div>
        </div>
        <div class="mt-6 space-y-2">
            <button onclick="closeDialogById('params-modal')" class="w-full py-3 bg-blue-600 text-white rounded-xl font-bold" data-i18n="common.save">Speichern</button>
            <button onclick="resetEverything()" class="w-full py-2.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-bold" data-i18n="settings.reset_all">Reset alles</button>
        </div>
    </dialog>

    <footer class="max-w-3xl mx-auto px-3 py-6 mt-4 border-t border-slate-200 text-center space-y-3">
        <div class="flex justify-center gap-1 flex-wrap">
            <button onclick="setLanguage('de')" id="footer-lang-de" class="footer-lang-btn">DE</button>
            <button onclick="setLanguage('fr')" id="footer-lang-fr" class="footer-lang-btn">FR</button>
            <button onclick="setLanguage('it')" id="footer-lang-it" class="footer-lang-btn">IT</button>
            <button onclick="setLanguage('en')" id="footer-lang-en" class="footer-lang-btn">EN</button>
            <button onclick="setLanguage('rm')" id="footer-lang-rm" class="footer-lang-btn">RM</button>
        </div>
        <div class="text-[10px] text-slate-400 leading-relaxed">
            &copy; <?= date('Y') ?> AGFF &ndash; Arbeitsgemeinschaft zur Förderung des Futterbaus<br>
            <a href="https://graswachstum.ch/de/legal" target="_blank" rel="noopener noreferrer" class="underline hover:text-slate-600">Impressum &amp; Haftungsausschluss</a>
        </div>
        <div id="usage-calc-counter" class="text-[9px] text-slate-300">Verdunstungs-Berechnungen: 0</div>
    </footer>




