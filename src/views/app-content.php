
    <div class="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div class="max-w-3xl mx-auto px-3 py-3 flex justify-between items-center">
            <div class="flex items-center gap-2">
                <div class="bg-blue-600 text-white p-1.5 rounded-lg"><i data-lucide="wind" width="20" height="20"></i></div>
                <div>
                    <h1 class="font-black text-base text-slate-800 leading-tight">DryWatch</h1>
                    <div class="text-[10px] font-bold text-slate-500 leading-tight" data-i18n="app.subtitle">Heutrocknungs-Cockpit</div>
                </div>
            </div>
            <div class="flex gap-2">
                <button onclick="openHeucheckModal('luefter')" class="flex flex-col items-center justify-center w-16 h-10 bg-emerald-50 border border-emerald-100 rounded-lg text-emerald-700 active:bg-emerald-100"><i data-lucide="house" width="18"></i><span class="text-[7px] font-bold leading-none text-center" data-i18n="nav.fodder">Futterlager</span></button>
                <button onclick="openDialogById('phases-modal')" class="flex flex-col items-center justify-center w-16 h-10 bg-blue-50 border border-blue-100 rounded-lg text-blue-700 active:bg-blue-100"><i data-lucide="info" width="14"></i><span class="text-[7px] font-bold leading-none text-center" data-i18n="nav.info">Info&amp;Wissen</span></button>
                <button onclick="openDialogById('params-modal')" class="flex flex-col items-center justify-center w-10 h-10 bg-slate-50 border rounded-lg text-slate-600 active:bg-slate-200"><i data-lucide="settings" width="18"></i></button>
            </div>
        </div>
    </div>

    <div class="max-w-3xl mx-auto p-3 space-y-4">

        <div id="card-flow-total" class="dash-card bg-cyan-50 border-cyan-200 cursor-default">
            <div class="flex justify-between items-start">
                <div class="label-sm text-cyan-800" data-i18n="card.air_volume">Luftmenge</div>
                <i data-lucide="gauge" width="16" class="text-cyan-500"></i>
            </div>
            <div class="mt-2 flex items-center gap-1 overflow-x-auto whitespace-nowrap pb-1">
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
                        <div class="flex items-center gap-1 text-[9px] text-cyan-700 font-bold uppercase tracking-wide"><span data-i18n="input.air_speed">Geschwindigkeit</span><button onclick="openDialogById('speed-guidelines-modal')" class="w-4 h-4 rounded-full bg-white border border-cyan-200 text-cyan-600 flex items-center justify-center"><i data-lucide="info" width="10"></i></button></div>
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

        <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-3 space-y-3">
            <div class="flex justify-between items-start pb-1 border-b border-slate-100">
                <div class="label-sm text-slate-500" data-i18n="card.air_quality">Luftqualität</div>
                <div class="flex items-center gap-2">
                    <button onclick="resetAllInputs()" class="h-7 px-2 rounded-md border border-amber-200 bg-amber-50 text-amber-700 text-[10px] font-bold flex items-center gap-1 active:bg-amber-100" title="Messwerte zurücksetzen">
                        <i data-lucide="rotate-ccw" width="12"></i>
                        <span>Messwerte zurücksetzen</span>
                    </button>
                    <i data-lucide="thermometer" width="16" class="text-slate-400"></i>
                </div>
            </div>
            <div id="guide-aussen-block" class="flex items-center justify-between gap-1">
                <div class="w-16 shrink-0"><div class="text-[9px] text-slate-500 font-bold uppercase tracking-wide" data-i18n="air.outside">Aussen</div><button id="fetch-weather" class="w-full h-10 flex flex-col items-center justify-center text-[9px] font-bold text-blue-600 bg-blue-50 px-1 rounded border border-blue-100"><i data-lucide="cloud-sun" width="14" height="14"></i><span class="leading-none mt-0.5" data-i18n="air.meteo_btn">Meteo</span></button></div>
                <div class="flex items-center bg-slate-50 rounded-lg p-0.5 gap-0.5"><button class="stepper-btn" onmousedown="startStep('t1', -0.1, -1.0)" ontouchstart="startStep('t1', -0.1, -1.0)" onmouseup="stopStep()" ontouchend="stopStep()">-</button><div class="text-center"><input type="number" id="t1-in" class="val-input" value="20" onchange="manualInput('t1', this.value)"><div class="text-[9px] text-slate-400 font-bold">°C</div></div><button class="stepper-btn" onmousedown="startStep('t1', 0.1, 1.0)" ontouchstart="startStep('t1', 0.1, 1.0)" onmouseup="stopStep()" ontouchend="stopStep()">+</button></div>
                <div class="flex items-center bg-slate-50 rounded-lg p-0.5 gap-0.5"><button class="stepper-btn" onmousedown="startStep('h1', -1, -5)" ontouchstart="startStep('h1', -1, -5)" onmouseup="stopStep()" ontouchend="stopStep()">-</button><div class="text-center"><input type="number" id="h1-in" class="val-input" value="60" onchange="manualInput('h1', this.value)"><div class="text-[9px] text-slate-400 font-bold">%</div></div><button class="stepper-btn" onmousedown="startStep('h1', 1, 5)" ontouchstart="startStep('h1', 1, 5)" onmouseup="stopStep()" ontouchend="stopStep()">+</button></div>
            </div>
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
            <div id="guide-zuluft-block" class="flex items-center justify-between gap-1">
                <div class="w-16 shrink-0"><div class="text-[9px] text-amber-600 font-bold uppercase tracking-wide" data-i18n="air.supply">Zuluft</div><button id="sim-toggle-btn" onclick="toggleSimPanel()" class="w-full h-10 flex flex-col items-center justify-center text-[9px] font-bold text-amber-700 bg-amber-50 px-1 rounded border border-amber-100 transition-colors"><i data-lucide="zap" width="14"></i><span class="leading-none mt-0.5" data-i18n="air.sim_btn">Simulation</span></button></div>
                <div class="flex items-center bg-slate-50 rounded-lg p-0.5 gap-0.5"><button class="stepper-btn" onmousedown="startStep('t2', -0.1, -1.0)" ontouchstart="startStep('t2', -0.1, -1.0)" onmouseup="stopStep()" ontouchend="stopStep()">-</button><div class="text-center"><input type="number" id="t2-in" class="val-input" value="20" onchange="manualInput('t2', this.value)"><div class="text-[9px] text-slate-400 font-bold">°C</div></div><button class="stepper-btn" onmousedown="startStep('t2', 0.1, 1.0)" ontouchstart="startStep('t2', 0.1, 1.0)" onmouseup="stopStep()" ontouchend="stopStep()">+</button></div>
                <div class="flex items-center bg-slate-50 rounded-lg p-0.5 gap-0.5"><button class="stepper-btn" onmousedown="startStep('h2', -1, -5)" ontouchstart="startStep('h2', -1, -5)" onmouseup="stopStep()" ontouchend="stopStep()">-</button><div class="text-center"><input type="number" id="h2-in" class="val-input" value="60" onchange="manualInput('h2', this.value)"><div class="text-[9px] text-slate-400 font-bold">%</div></div><button class="stepper-btn" onmousedown="startStep('h2', 1, 5)" ontouchstart="startStep('h2', 1, 5)" onmouseup="stopStep()" ontouchend="stopStep()">+</button></div>
            </div>
            <hr class="border-slate-100">
            <div class="flex items-center justify-between gap-1">
                <div class="w-16 shrink-0"><div class="text-[9px] text-emerald-600 font-bold uppercase tracking-wide" data-i18n="air.exhaust">Abluft</div><label class="flex items-center gap-1"><input type="checkbox" id="check-adiabatic" class="accent-emerald-600" checked onchange="update()"><span class="text-[9px] font-bold text-slate-400">Auto</span><button onclick="openKnowledgeArticle('05-luftaufbereitung.md')" class="w-3.5 h-3.5 rounded-full border border-slate-300 text-slate-500 flex items-center justify-center" title="Erklärung in Info & Wissen"><i data-lucide="info" width="9"></i></button></label></div>
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
            <h4 class="label-sm text-blue-600 mb-2" data-i18n="detail.energy_cost_hour">Energie & Kosten pro Stunde</h4>
            <div class="stat-row"><span class="stat-label" data-i18n="detail.electricity">Strom (Ventilator/Entf.)</span><span class="stat-val" id="det-elec">0 kWh</span></div>
            <div class="stat-row"><span class="stat-label" data-i18n="detail.electricity_cost">Strom Kosten</span><span class="stat-val" id="det-elec-cost">0.00 CHF</span></div>
            <div class="stat-row"><span class="stat-label" data-i18n="detail.heat_input">Wärme Input</span><span class="stat-val" id="det-heat">0 kWh</span></div>
            <div class="stat-row"><span class="stat-label" data-i18n="detail.oil_equiv">Heizöl Äquivalent</span><span class="stat-val" id="det-oil">0.0 L</span></div>
            <div class="stat-row"><span class="stat-label" data-i18n="detail.heat_cost">Wärme Kosten</span><span class="stat-val" id="det-heat-cost">0.00 CHF</span></div>
            <div class="stat-row bg-white rounded px-2 mt-1 border border-blue-100"><span class="stat-label text-blue-800 font-bold" data-i18n="detail.cost_per_liter">Kosten pro Liter Wasserentzug</span><span class="stat-val text-blue-600" id="det-cpl">-</span></div>
        </div>

        <div id="detail-status" class="detail-box" onclick="event.stopPropagation()">
<button onclick="openHeucheckModal('luefter')" class="w-full mb-3 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-sm" data-i18n="nav.fodder">Futterlager</button>
            
            <div class="bg-white p-3 rounded-xl border border-slate-200 shadow-sm mb-4">
                <div class="flex justify-between items-center mb-2">
                    <span class="label-sm text-slate-500" data-i18n="detail.pressure">Druck</span>
                    <select id="p-unit" class="text-xs border rounded bg-slate-50 font-bold text-slate-600 px-1 py-0.5" onchange="update()">
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

            <h4 class="label-sm text-slate-600 mb-2" data-i18n="detail.aero_live">Aerodynamik Live</h4>
            <div class="stat-row"><span class="stat-label" data-i18n="card.air_volume">Luftmenge</span><span class="stat-val" id="det-flow">0 m³/s</span></div>
            <div class="stat-row"><span class="stat-label" data-i18n="stat.air_volume_spec">Luftmenge spezifisch</span><span class="stat-val" id="det-flow-spec">0.00 m³/m²/s</span></div>
            <div class="stat-row"><span class="stat-label flex items-center gap-1"><span data-i18n="input.air_speed">Geschwindigkeit</span> <i data-lucide="info" width="12" class="text-blue-400 cursor-pointer" onclick="openDialogById('speed-guidelines-modal')"></i></span><span class="stat-val"><span id="ampel-speed" class="ampel bg-gray-300"></span><span id="det-speed">0.00 m/s</span></span></div>
            <div class="stat-row"><span class="stat-label flex items-center gap-1"><span data-i18n="stat.static_pressure">Statischer Druck</span> <i data-lucide="info" width="12" class="text-blue-400 cursor-pointer" onclick="toggleInfo('pressure-info')"></i></span><span class="stat-val"><span id="ampel-press" class="ampel bg-gray-300"></span><span id="det-press">0 mbar</span></span></div>
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
            <div class="stat-row"><span class="stat-label flex items-center gap-1"><span data-i18n="stat.system_eff">System-Effizienz</span> <i data-lucide="info" width="12" class="text-blue-400 cursor-pointer" onclick="toggleInfo('eff-info')"></i></span><span class="stat-val"><span id="ampel-eff" class="ampel bg-gray-300"></span><span id="det-eff">-</span></span></div>
            <details id="eff-auto-wrap" class="mb-2 rounded border text-[10px]"><summary id="eff-auto-summary">Hinweis Effizienz</summary><div id="eff-auto-hint" class="p-2"></div></details>
            <div id="eff-info" class="hidden bg-slate-50 border rounded p-2 text-[10px] mb-2 text-slate-600">
                <strong>Richtwert System-Effizienz:</strong><br>
                <span class="text-emerald-600">&gt; <span id="eff-good">50</span>%</span> guter Betriebspunkt | <span class="text-amber-600"><span id="eff-warn">30</span>-<span id="eff-good-2">50</span>%</span> prüfenswert | <span class="text-red-600">&lt; <span id="eff-warn-2">30</span>%</span> ungünstiger Betrieb
            </div>
        </div>

        <div id="card-kittl" class="rec-banner bg-slate-100" onclick="toggleDetail('kittl')">
            <div class="flex items-center gap-3">
                <div class="bg-white p-1.5 rounded-full text-blue-500 shadow-sm"><i data-lucide="info" width="18"></i></div>
                <div>
                    <div class="label-sm text-blue-400" data-i18n="rec.title">Empfehlung</div>
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
                <button onclick="toggleFullscreen()" class="p-1 bg-slate-100 rounded text-slate-600 hover:bg-slate-200"><i data-lucide="maximize" width="16"></i></button>
            </div>
            <div class="w-full max-w-[28rem] mx-auto aspect-square relative">
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
                <div class="label-sm text-slate-500" data-i18n="history.local_recording">Aufzeichnung lokal (Browser)</div>
                <div class="flex items-center gap-2">
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
                <button onclick="deleteSelectedHistoryPoint()" id="btn-delete-point" class="px-3 py-2 bg-slate-200 text-slate-700 rounded-lg text-xs font-bold hidden" data-i18n="history.delete_point">Punkt löschen</button>
                <button onclick="exportHistoryJson()" class="px-3 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold" data-i18n="history.export_json">Export JSON</button>
                <button onclick="exportHistoryCsv()" class="px-3 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold" data-i18n="history.export_csv">Export CSV</button>
                <button onclick="triggerHistoryImport()" class="px-3 py-2 bg-amber-600 text-white rounded-lg text-xs font-bold" data-i18n="history.import">Import</button>
                <button onclick="confirmClearHistoryData()" class="px-3 py-2 bg-red-600 text-white rounded-lg text-xs font-bold" data-i18n="history.clear">Leeren</button>
                <input id="history-import-input" type="file" accept=".json,.csv,text/csv,application/json" class="hidden" onchange="handleHistoryImport(event)">
            </div>

            <div class="relative">
                <canvas id="historyChart-yL" style="position:absolute;left:8px;top:8px;pointer-events:none;z-index:3;background:#f8fafc;display:none;"></canvas>
                <canvas id="historyChart-yR" style="position:absolute;right:8px;top:8px;pointer-events:none;z-index:3;background:#f8fafc;display:none;"></canvas>
                <div id="history-chart-scroll" class="history-scroll bg-slate-50 border rounded-lg p-2 h-44">
                    <div id="history-chart-inner" class="history-inner">
                        <canvas id="historyChart"></canvas>
                    </div>
                </div>
            </div>

            <div class="relative">
                <canvas id="historyClimateChart-yL" style="position:absolute;left:8px;top:8px;pointer-events:none;z-index:3;background:#f8fafc;display:none;"></canvas>
                <canvas id="historyClimateChart-yR" style="position:absolute;right:8px;top:8px;pointer-events:none;z-index:3;background:#f8fafc;display:none;"></canvas>
                <div id="history-climate-scroll" class="history-scroll bg-slate-50 border rounded-lg p-2 h-44">
                    <div id="history-climate-inner" class="history-inner">
                        <canvas id="historyClimateChart"></canvas>
                    </div>
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

    <dialog id="heucheck-modal" class="p-0 flex flex-col h-[90vh]">
        <div class="p-4 border-b bg-slate-50 flex justify-between items-center shrink-0">
            <h3 class="font-bold" data-i18n="nav.fodder">Futterlager</h3>
            <button onclick="closeHeucheckModal()" class="px-4 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg shadow" data-i18n="common.done">Fertig</button>
        </div>
        <div class="p-3 border-b bg-white shrink-0">
            <div class="flex gap-2">
                <button id="tab-heucheck-luefter" class="check-tab" onclick="setHeucheckTab('luefter')" data-i18n="heucheck.fan_tab">Luefter</button>
                <button id="tab-heucheck-lager" class="check-tab" onclick="setHeucheckTab('lager')" data-i18n="nav.fodder">Futterlager</button>
            </div>
        </div>
        <div class="flex-1 overflow-y-auto bg-slate-50">
            <div id="panel-heucheck-luefter" class="p-4 space-y-4">
                <div class="relative shrink-0 z-20">
                    <label class="label-sm mb-1" data-i18n="common.search">Suche</label>
                    <input id="fan-search" class="w-full border p-3 rounded-lg font-bold shadow-sm" placeholder="Modell tippen..." oninput="filterFans(this.value)" onkeydown="handleFanKey(event)">
                    <div id="fan-results" class="search-results hidden"></div>
                </div>

                <div class="grid grid-cols-2 gap-3 shrink-0">
                    <div><label id="fan-flow-label" class="label-sm">Menge fix (m³/s)</label><input type="number" id="inp-fan-flow" class="w-full border p-2 rounded font-bold" onchange="saveFan()"></div>
                    <div><label id="fan-pmax-label" class="label-sm">P-Max (mbar)</label><input type="number" id="inp-fan-pmax" class="w-full border p-2 rounded font-bold" onchange="saveFan()"></div>
                </div>

                <div class="bg-white border rounded-lg p-2 h-40 shrink-0 shadow-sm relative z-0">
                    <canvas id="fanChart"></canvas>
                </div>
                
                <div class="border rounded-lg overflow-hidden shrink-0 bg-white">
                    <button onclick="toggleCurveEditor()" class="w-full p-2 bg-slate-100 border-b text-xs font-bold text-slate-600 flex justify-between items-center">
                        <span data-i18n="heucheck.curve_edit">Kennlinie bearbeiten (Punkte)</span> <i data-lucide="chevron-down" width="14"></i>
                    </button>
                    <div id="fan-curve-editor" class="hidden bg-slate-50 p-2">
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
                            <thead><tr class="text-slate-400"><th id="curve-head-pressure">mbar</th><th id="curve-head-flow">m³/s</th><th>kW</th><th></th></tr></thead>
                            <tbody id="curve-body"></tbody>
                        </table>
                        <button onclick="addCurvePoint()" class="w-full border border-dashed text-slate-400 text-xs py-1 rounded hover:bg-white" data-i18n="heucheck.add_point">+ Punkt</button>
                    </div>
                </div>
            </div>

            <div id="panel-heucheck-lager" class="p-4 space-y-4 hidden">
                <div class="bg-white border rounded-lg p-3 shadow-sm">
                    <label class="label-sm" data-i18n="heucheck.base_area">Grundfläche (m²)</label>
                    <input id="inp-area" type="number" min="1" class="w-full border p-2 rounded font-bold" onchange="App.area=Math.max(1, parseFloat(this.value)||1); update(); saveData();">
                    <label class="label-sm mt-3" data-i18n="heucheck.stock_height">Stockhöhe manuell (m, optional)</label>
                    <input id="inp-stock-h" type="number" min="0" step="0.1" class="w-full border p-2 rounded font-bold" placeholder="Automatisch aus Schichten" onchange="setManualStockHeight(this.value)">
                </div>

                <div class="bg-white border rounded-lg p-3 shadow-sm">
                    <div class="label-sm mb-2" data-i18n="heucheck.layers">Schichten</div>
                    <div id="layers-list" class="space-y-2"></div>
                    <button onclick="addLayer()" class="w-full mt-3 py-2 border-2 border-dashed border-slate-300 text-slate-500 font-bold rounded-lg text-xs" data-i18n="heucheck.add_layer">+ Schicht hinzufügen</button>
                </div>

                <div class="bg-white border rounded-lg p-3 shadow-sm">
                    <div class="label-sm mb-2" data-i18n="heucheck.visualization">Visualisierung</div>
                    <div id="stock-vis" class="min-h-[180px]"></div>
                    <div class="grid grid-cols-2 gap-2 mt-3 text-xs">
                        <div class="bg-slate-50 border rounded p-2"><span class="text-slate-500" data-i18n="heucheck.density">Dichte (ca., FS)</span><div class="font-bold"><span id="stock-density">-</span> kg FS/m³</div></div>
                        <div class="bg-slate-50 border rounded p-2"><span class="text-slate-500" data-i18n="heucheck.fodder_amount">Futtermenge (geschätzt)</span><div class="font-bold text-emerald-700"><span id="stock-kgts">-</span> dt TS</div></div>
                    </div>
                    <div class="mt-2 text-[11px] text-slate-500">Stockhöhe Berechnung: <strong><span id="stock-height-used">-</span> m</strong> <span id="stock-height-mode" class="text-slate-400"></span></div>
                    <div class="mt-2 text-[11px] text-slate-500 bg-slate-50 border rounded p-2">
                        Schätzung: <strong>kg TS = Fläche (m²) × Höhe (m) × Dichte_FS (kg FS/m³) × TS/100</strong>
                        <br>Mittelwert Dichte: <strong>kg FS/m³ = Σ(Schichtmasse FS) ÷ Σ(Schichtvolumen)</strong>
                    </div>
                </div>
            </div>
        </div>
    </dialog>

    <dialog id="phases-modal" class="p-0">
        <div class="p-4 border-b bg-slate-50 flex justify-between items-center sticky top-0 bg-white z-10"><h3 class="font-bold" data-i18n="nav.info">Info & Wissen</h3><button onclick="closeDialogById('phases-modal')" class="p-1"><i data-lucide="x" width="20"></i></button></div>
        <div class="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
            <div class="bg-blue-50 border border-blue-200 rounded-xl p-3 text-sm text-slate-700">
                <div class="font-bold text-blue-800 mb-2 flex items-center gap-1.5"><i data-lucide="wifi" width="15"></i> Empfohlene Wetterstation</div>
                <p class="text-xs text-slate-600 mb-2">Für die Anzeige auf Mobiltelefon/Internet:</p>
                <ul class="space-y-1.5 text-xs text-slate-700">
                    <li class="flex items-start gap-1.5"><span class="text-blue-500 font-bold mt-0.5">•</span><span><strong>Ecowitt WIFI/Kabel-Gateway GW3000</strong><br>mit mindestens 3 Sensoren WH31</span></li>
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
                <strong>&lt; <span id="speed-min-low">0.07</span> m/s:</strong> ungenuegende Durchstroemung, Trocknung verzoegert
            </div>
            <div class="bg-amber-50 border border-amber-200 rounded p-3 text-amber-800">
                <strong>&gt; <span id="speed-max-high">0.13</span> m/s:</strong> erhoehter Energiebedarf, Nutzen oft begrenzt
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
            <div><label class="label-sm" data-i18n="settings.altitude">Höhe (m.ü.M.)</label><input id="inp-alt" type="number" class="w-full border rounded p-2 font-bold" onchange="saveParams()"></div>
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
    </footer>




