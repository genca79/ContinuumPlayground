// Playground.js - Physics & Material Engine for GENCA Continuum
// VERSION: v2 Expressive Gesture Engine (compat mode)

const Playground = (function() {
    const Engine = Matter.Engine,
          Runner = Matter.Runner,
          Bodies = Matter.Bodies,
          Composite = Matter.Composite,
          Query = Matter.Query,
          Events = Matter.Events,
          Mouse = Matter.Mouse,
          MouseConstraint = Matter.MouseConstraint,
          Vector = Matter.Vector,
          Body = Matter.Body;

    const DEFAULT_CONFIG = {
        macro: { energy: 0.6, chaos: 0.4, gravity: 0.8, density: 0.5, wind: 0, stream: false },
        advanced: {
            collisionThreshold: 1.2,
            mpeSmoothingMs: 24,
            noteHoldMsMin: 120,
            noteHoldMsMax: 900,
            maxVoices: 24,
            spawnShape: 'auto',
            pitchQuantize: true,
            internalSynthSafe: true,
            timingGridMs: 0,
            swing: 0,
            maxNotesPerSec: 0,
            pitchLanes: 0,
            anchorNotes: false,
            adaptiveMpe: true,
            impactToTimbre: 0.35,
            noteFlash: true,
            trailByDegree: false,
            showRotationLine: false,
            rollingArp: true,
            harmonicRain: true,
            frictionDrone: false,
            rollMinAngularVel: 0.06,
            rollDebounceMs: 90,
            rollVelocityFloor: 0.02,
            droneMaxVoices: 12,
            droneGainMax: 0.12
        },
        interaction: { mode: 'drawFling', pointerTrail: true, autoSpawnIntervalMs: 180 },
        mode: 'physics',
        tubes: {
            tool: 'select',
            material: 'PVC',
            surface: 'corrugated',
            length: 220,
            diameter: 34,
            angleDeg: 0,
            endMode: 'open',
            quantize: true,
            quantizeStrength: 0.7,
            harmonicSpread: true,
            physicalModel: true,
            partialCount: 10,
            physicalMix: 0.65,
            inharmonicity: 0.006,
            coupling: 0.18,
            snapAngleDeg: 0,
            mood: 0.5,
            yExpressivity: 0.6,
            mute: false,
            windPlay: true,
            maxVoices: 6,
            maxCount: 24
        },
        debug: false
    };

    const MATERIALS = {
        BAMBOO: { name: 'Bamboo', physics: { restitution: 0.95, density: 0.0008, friction: 0.01, frictionAir: 0.002 }, audio: { attack: 0.006, release: 0.28 }, visual: { color: '#e6e6a8', shadow: '#ffffcc', glow: 15 } },
        STONE: { name: 'Stone', physics: { restitution: 0.08, density: 0.08, friction: 0.85, frictionAir: 0.015 }, audio: { attack: 0.001, release: 0.04 }, visual: { color: '#8a8a9a', shadow: '#aaccff', glow: 5 } },
        RUBBER: { name: 'Rubber', physics: { restitution: 1.28, density: 0.004, friction: 0.002, frictionAir: 0.001 }, audio: { attack: 0.035, release: 1.2 }, visual: { color: '#ff0055', shadow: '#ffaa00', glow: 20 } },
        CLAY: { name: 'Clay', physics: { restitution: 0.22, density: 0.0035, friction: 0.35, frictionAir: 0.025 }, audio: { attack: 0.03, release: 0.22 }, visual: { color: '#d2691e', shadow: '#ff8844', glow: 10 } },
        GLASS: { name: 'Glass', physics: { restitution: 1.05, density: 0.0022, friction: 0.015, frictionAir: 0.003 }, audio: { attack: 0.0015, release: 0.18 }, visual: { color: '#bde9ff', shadow: '#d9f6ff', glow: 22 } },
        FELT: { name: 'Felt', physics: { restitution: 0.06, density: 0.0016, friction: 0.92, frictionAir: 0.09 }, audio: { attack: 0.045, release: 0.1 }, visual: { color: '#8a3f56', shadow: '#c77895', glow: 8 } },
        STEEL: { name: 'Steel', physics: { restitution: 0.68, density: 0.03, friction: 0.02, frictionAir: 0.004 }, audio: { attack: 0.002, release: 0.95 }, visual: { color: '#9ba7b8', shadow: '#d2d9e6', glow: 14 } },
        WATER: { name: 'Water', physics: { restitution: 0.12, density: 0.0005, friction: 0.001, frictionAir: 0.2 }, audio: { attack: 0.07, release: 1.8 }, visual: { color: '#3aa9ff', shadow: '#6dd3ff', glow: 26 } }
    };

    const TUBE_MATERIALS = {
        PVC: { name: 'PVC', stiffness: 0.7, damping: 0.42, brightness: 0.42, attack: 0.01, release: 0.45, visual: '#9bb3c9' },
        BAMBOO: { name: 'Bamboo', stiffness: 0.55, damping: 0.5, brightness: 0.36, attack: 0.014, release: 0.32, visual: '#d8c48a' },
        ALUMINUM: { name: 'Aluminum', stiffness: 0.9, damping: 0.24, brightness: 0.76, attack: 0.006, release: 0.82, visual: '#c4ccd7' },
        STEEL: { name: 'Steel', stiffness: 1, damping: 0.2, brightness: 0.88, attack: 0.004, release: 1.05, visual: '#a8b5c8' },
        GLASS: { name: 'Glass', stiffness: 0.95, damping: 0.28, brightness: 0.92, attack: 0.004, release: 0.62, visual: '#bfe9ff' },
        WOOD: { name: 'Wood', stiffness: 0.62, damping: 0.48, brightness: 0.3, attack: 0.012, release: 0.36, visual: '#b8895a' }
    };

    const TUBE_SURFACES = {
        smooth: { noise: 0.08, brightnessMul: 0.94, frictionExcite: 0.85 },
        corrugated: { noise: 0.45, brightnessMul: 1.12, frictionExcite: 1.18 }
    };

    const DEGREE_COLORS = [
        '#f6c453', '#f09f4f', '#e86d63', '#d24f8f',
        '#9c5bd9', '#5f7fe8', '#3ea6d6', '#3ac6a8',
        '#62d46b', '#9ad84b', '#cfe34b', '#f0dd4e'
    ];

    let engine, runner, canvas, ctx, mouse, mouseConstraint;
    let isRunning = false;
    let rafId = null;
    let streamTimer = null;

    let config = cloneConfig(DEFAULT_CONFIG);
    let currentMaterial = MATERIALS.BAMBOO;

    const activeVoices = new Map();
    const loopGhosts = [];
    const waterGlideVoices = new Map();
    const activeTubeVoices = new Map();
    const pendingNotesByBody = new Map();
    const noteRate = { times: [] };
    const frictionDrones = new Map();
    const tubeResonators = new Map();
    let frictionNoiseBuffer = null;
    const lastTriggerByBody = new Map();
    const lastNoteOnByChan = new Map();
    const pointerState = new Map();
    const mpeChannelState = new Map();
    const melodicMemory = {
        A: { lastNote: null, lastTs: 0 },
        B: { lastNote: null, lastTs: 0 }
    };

    const stats = {
        activeVoices: 0,
        avgFrameMs: 16.7,
        fpsHint: 60
    };
    const windRuntime = {
        gust: 0,
        phase: 0,
        pulse: 0
    };
    const synthSafeRuntime = {
        winTs: 0,
        noteCount: 0
    };
    const tubes = new Map();
    const customWalls = [];
    let nextTubeId = 1;
    let selectedTubeId = null;
    const tubePointer = {
        pointerId: null,
        tool: null,
        tubeId: null,
        hitZone: null,
        startX: 0,
        startY: 0,
        moved: false,
        hadHit: false,
        tubeStartX: 0,
        tubeStartY: 0,
        tubeStartAngle: 0,
        anchorX: 0,
        anchorY: 0
    };
    const tubeTouchUi = {
        visible: false,
        tubeId: null
    };
    const tubePlayPointers = new Map();

    let frameLastTs = 0;
    let frameEma = 16.7;
    let channelCursor = 2;

    function cloneConfig(source) {
        return JSON.parse(JSON.stringify(source));
    }

    function deepMerge(target, source) {
        if (!source || typeof source !== 'object') return target;
        Object.keys(source).forEach((key) => {
            const src = source[key];
            if (src && typeof src === 'object' && !Array.isArray(src)) {
                target[key] = target[key] && typeof target[key] === 'object' ? target[key] : {};
                deepMerge(target[key], src);
            } else if (src !== undefined) {
                target[key] = src;
            }
        });
        return target;
    }

    function clamp(v, min, max) {
        return Math.max(min, Math.min(max, v));
    }

    function normalizeMode(mode) {
        return mode === 'tubes' ? 'tubes' : 'physics';
    }

    function snapAngle(angle, snapDeg) {
        const step = Number(snapDeg) || 0;
        if (step <= 0) return angle;
        const rad = (step * Math.PI) / 180;
        return Math.round(angle / rad) * rad;
    }

    function quantizeNoteForZoneSoft(note, zone, strength) {
        const s = clamp(Number(strength) || 0, 0, 1);
        if (s <= 0) return clamp(note, 0, 127);
        const snapped = quantizeNoteForZone(note, zone);
        return clamp(note + (snapped - note) * s, 0, 127);
    }

    function getTubeOrderIndex(tube) {
        if (!tube) return 0;
        const ordered = Array.from(tubes.values()).sort((a, b) => (a.createdAt || a.bornAt || 0) - (b.createdAt || b.bornAt || 0));
        const idx = ordered.findIndex((t) => t.id === tube.id);
        return idx < 0 ? 0 : idx;
    }

    function getTubeScaleHarmonicNote(baseNote, zone, orderIdx) {
        const ctx = resolveScaleContext(zone);
        const scale = getScaleNotesInOctave(ctx);
        if (!scale.length) return baseNote;
        let bestIdx = 0;
        let bestDist = Math.abs(scale[0] - baseNote);
        for (let i = 1; i < scale.length; i += 1) {
            const d = Math.abs(scale[i] - baseNote);
            if (d < bestDist) {
                bestDist = d;
                bestIdx = i;
            }
        }
        const pattern = [0, 2, 4, 6, 1, 3, 5];
        const offset = pattern[orderIdx % pattern.length] || 0;
        const idx = ((bestIdx + offset) % scale.length + scale.length) % scale.length;
        return scale[idx];
    }

    function normalizeTubeTool(tool) {
        return ['select', 'place', 'play', 'move', 'rotate', 'cut', 'delete'].includes(tool) ? tool : 'select';
    }

    function clampTubesConfig() {
        config.mode = normalizeMode(config.mode);
        config.tubes = config.tubes && typeof config.tubes === 'object' ? config.tubes : cloneConfig(DEFAULT_CONFIG.tubes);
        config.tubes.tool = normalizeTubeTool(config.tubes.tool);
        config.tubes.material = TUBE_MATERIALS[config.tubes.material] ? config.tubes.material : 'PVC';
        config.tubes.surface = TUBE_SURFACES[config.tubes.surface] ? config.tubes.surface : 'corrugated';
        config.tubes.length = clamp(Number(config.tubes.length) || 220, 80, 900);
        config.tubes.diameter = clamp(Number(config.tubes.diameter) || 34, 12, 100);
        config.tubes.angleDeg = clamp(Number(config.tubes.angleDeg) || 0, -180, 180);
        config.tubes.endMode = config.tubes.endMode === 'closed' ? 'closed' : 'open';
        config.tubes.quantizeStrength = clamp(Number(config.tubes.quantizeStrength) || 0.7, 0, 1);
        config.tubes.harmonicSpread = config.tubes.harmonicSpread !== false;
        config.tubes.physicalModel = config.tubes.physicalModel !== false;
        config.tubes.partialCount = clamp(parseInt(config.tubes.partialCount, 10) || 10, 4, 16);
        config.tubes.physicalMix = clamp(Number(config.tubes.physicalMix) || 0.65, 0, 1);
        config.tubes.inharmonicity = clamp(Number(config.tubes.inharmonicity) || 0.006, 0, 0.03);
        config.tubes.coupling = clamp(Number(config.tubes.coupling) || 0.18, 0, 0.6);
        config.tubes.snapAngleDeg = clamp(Number(config.tubes.snapAngleDeg) || 0, 0, 45);
        config.tubes.mood = clamp(Number(config.tubes.mood) || 0.5, 0, 1);
        config.tubes.yExpressivity = clamp(Number(config.tubes.yExpressivity) || 0.6, 0, 1);
        config.tubes.mute = config.tubes.mute === true;
        config.tubes.windPlay = config.tubes.windPlay !== false;
        config.tubes.maxVoices = clamp(parseInt(config.tubes.maxVoices, 10) || 6, 2, 16);
        config.tubes.maxCount = clamp(parseInt(config.tubes.maxCount, 10) || 24, 4, 64);
    }

    function isTubeMode() {
        return normalizeMode(config.mode) === 'tubes';
    }

    function init() {
        canvas = document.getElementById('playgroundCanvas');
        if (!canvas) return;

        ctx = canvas.getContext('2d');
        canvas.style.touchAction = 'none';

        engine = Engine.create();
        mouse = Mouse.create(canvas);
        mouse.pixelRatio = 1;

        mouseConstraint = MouseConstraint.create(engine, {
            mouse,
            constraint: { stiffness: 0.1, damping: 0.1, render: { visible: false } }
        });

        Composite.add(engine.world, mouseConstraint);
        applyRuntimeConfig();

        Events.on(engine, 'collisionStart', handleCollisions);
        Events.on(engine, 'beforeUpdate', handleModulations);

        runner = Runner.create();

        bindPointerInteractions();
        window.addEventListener('resize', () => {
            if (isRunning) {
                resize();
                spawnEnvironment();
            }
        });
    }

    function getTubeEndpoints(tube) {
        const half = tube.length * 0.5;
        const dx = Math.cos(tube.angle) * half;
        const dy = Math.sin(tube.angle) * half;
        return {
            x1: tube.x - dx,
            y1: tube.y - dy,
            x2: tube.x + dx,
            y2: tube.y + dy
        };
    }

    function pointSegDistance(px, py, x1, y1, x2, y2) {
        const vx = x2 - x1;
        const vy = y2 - y1;
        const wx = px - x1;
        const wy = py - y1;
        const vv = (vx * vx) + (vy * vy);
        if (vv <= 1e-6) return Math.hypot(px - x1, py - y1);
        let t = ((wx * vx) + (wy * vy)) / vv;
        t = clamp(t, 0, 1);
        const cx = x1 + vx * t;
        const cy = y1 + vy * t;
        return Math.hypot(px - cx, py - cy);
    }

    function projectOnTube(tube, p) {
        const ep = getTubeEndpoints(tube);
        const vx = ep.x2 - ep.x1;
        const vy = ep.y2 - ep.y1;
        const vv = (vx * vx) + (vy * vy);
        if (vv <= 1e-6) return { t: 0.5, x: tube.x, y: tube.y };
        let t = (((p.x - ep.x1) * vx) + ((p.y - ep.y1) * vy)) / vv;
        t = clamp(t, 0, 1);
        return { t, x: ep.x1 + vx * t, y: ep.y1 + vy * t };
    }

    function hitTubeAtPoint(p) {
        let best = null;
        let bestD = Infinity;
        tubes.forEach((tube) => {
            const ep = getTubeEndpoints(tube);
            const segD = pointSegDistance(p.x, p.y, ep.x1, ep.y1, ep.x2, ep.y2);
            const dStart = Math.hypot(p.x - ep.x1, p.y - ep.y1);
            const dEnd = Math.hypot(p.x - ep.x2, p.y - ep.y2);
            const d = Math.min(segD, dStart, dEnd);
            const tol = Math.max(Math.max(12, tube.diameter * 0.5), Math.max(18, tube.diameter * 0.62));
            if (d <= tol && d < bestD) {
                best = tube;
                bestD = d;
            }
        });
        return best;
    }

    function getTubeGizmoButtons(tube) {
        if (!tube) return null;
        const thick = clamp(tube.diameter * 0.26, 5, 26);
        const offset = clamp(26 + thick * 1.1, 22, 52);
        const nx = -Math.sin(tube.angle);
        const ny = Math.cos(tube.angle);
        const r = Math.max(14, thick * 0.7);
        return {
            move: { x: tube.x + nx * offset, y: tube.y + ny * offset, r },
            rotate: { x: tube.x - nx * offset, y: tube.y - ny * offset, r }
        };
    }

    function hitTubeGizmoAtPoint(p) {
        if (!tubeTouchUi.visible || !tubeTouchUi.tubeId || tubeTouchUi.tubeId !== selectedTubeId) return null;
        const tube = tubes.get(tubeTouchUi.tubeId);
        if (!tube) return null;
        const gizmo = getTubeGizmoButtons(tube);
        if (!gizmo) return null;
        const dMove = Math.hypot(p.x - gizmo.move.x, p.y - gizmo.move.y);
        if (dMove <= gizmo.move.r + 3) return { tube, action: 'move' };
        const dRotate = Math.hypot(p.x - gizmo.rotate.x, p.y - gizmo.rotate.y);
        if (dRotate <= gizmo.rotate.r + 3) return { tube, action: 'rotate' };
        return null;
    }

    function hideTubeTouchUi() {
        tubeTouchUi.visible = false;
        tubeTouchUi.tubeId = null;
    }

    function showTubeTouchUi(tubeId) {
        if (!tubeId || !tubes.has(tubeId)) {
            hideTubeTouchUi();
            return;
        }
        tubeTouchUi.visible = true;
        tubeTouchUi.tubeId = tubeId;
    }

    function detectTubeHitZone(tube, p) {
        if (!tube) return 'none';
        const ep = getTubeEndpoints(tube);
        const handleTol = Math.max(14, tube.diameter * 0.52);
        const dStart = Math.hypot(p.x - ep.x1, p.y - ep.y1);
        const dEnd = Math.hypot(p.x - ep.x2, p.y - ep.y2);
        if (dStart <= handleTol || dEnd <= handleTol) return dStart <= dEnd ? 'start' : 'end';
        const centerTol = Math.max(16, tube.diameter * 0.6);
        if (Math.hypot(p.x - tube.x, p.y - tube.y) <= centerTol) return 'center';
        return 'body';
    }

    function clearTubePointerState() {
        tubePointer.pointerId = null;
        tubePointer.tool = null;
        tubePointer.tubeId = null;
        tubePointer.hitZone = null;
        tubePointer.moved = false;
        tubePointer.hadHit = false;
    }

    function clearTubePlayPointers() {
        tubePlayPointers.clear();
    }

    function handleTubePlayPointerDown(e) {
        const p = getCanvasPoint(e);
        const now = performance.now();
        const hit = hitTubeAtPoint(p);
        tubePlayPointers.set(e.pointerId, {
            pointerId: e.pointerId,
            x: p.x,
            y: p.y,
            lastHitTubeId: hit?.id || null,
            lastExciteTs: now
        });
        if (hit) {
            exciteTube(hit.id, { type: 'strike', x: p.x, y: p.y, energy: 0.72 });
        }
    }

    function handleTubePlayPointerMove(e) {
        const st = tubePlayPointers.get(e.pointerId);
        if (!st) return;
        const p = getCanvasPoint(e);
        const now = performance.now();
        const dx = p.x - st.x;
        const dy = p.y - st.y;
        const dist = Math.hypot(dx, dy);
        const hit = hitTubeAtPoint(p);
        if (hit) {
            const changedTube = st.lastHitTubeId !== hit.id;
            const minGap = changedTube ? 22 : 36;
            if ((now - st.lastExciteTs) >= minGap || dist > 18) {
                const energy = clamp(0.32 + (dist / 70), 0.24, 1.1);
                const type = dist > 9 ? 'rub' : 'strike';
                exciteTube(hit.id, { type, x: p.x, y: p.y, energy });
                st.lastExciteTs = now;
                st.lastHitTubeId = hit.id;
            }
        }
        st.x = p.x;
        st.y = p.y;
    }

    function handleTubePlayPointerUp(e) {
        tubePlayPointers.delete(e.pointerId);
    }

    function addTube(spec = {}) {
        if (tubes.size >= (config?.tubes?.maxCount || 24)) {
            const oldest = Array.from(tubes.values())
                .filter((t) => t.id !== selectedTubeId)
                .sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0))[0];
            if (oldest) removeTube(oldest.id);
            if (tubes.size >= (config?.tubes?.maxCount || 24)) return null;
        }
        const id = `tube_${nextTubeId++}`;
        const t = {
            id,
            x: clamp(Number(spec.x) || canvas.width * 0.5, 10, canvas.width - 10),
            y: clamp(Number(spec.y) || canvas.height * 0.5, 10, canvas.height - 10),
            angle: Number.isFinite(spec.angle) ? spec.angle : ((Number(spec.angleDeg) || config.tubes.angleDeg) * Math.PI / 180),
            length: clamp(Number(spec.length) || config.tubes.length, 80, 900),
            diameter: clamp(Number(spec.diameter) || config.tubes.diameter, 12, 100),
            material: TUBE_MATERIALS[spec.material] ? spec.material : config.tubes.material,
            surface: TUBE_SURFACES[spec.surface] ? spec.surface : config.tubes.surface,
            endMode: spec.endMode === 'closed' ? 'closed' : config.tubes.endMode,
            quantize: spec.quantize !== undefined ? !!spec.quantize : !!config.tubes.quantize,
            windPlay: spec.windPlay !== undefined ? !!spec.windPlay : !!config.tubes.windPlay,
            gain: clamp(Number(spec.gain) || 1, 0.2, 2),
            createdAt: performance.now(),
            bornAt: performance.now(),
            lastExciteAt: 0,
            windVisual: 0
        };
        tubes.set(id, t);
        selectedTubeId = id;
        return t;
    }

    function removeTube(id) {
        const t = tubes.get(id);
        if (!t) return false;
        stopTubeVoice(id);
        tubes.delete(id);
        if (selectedTubeId === id) {
            selectedTubeId = null;
            hideTubeTouchUi();
        }
        if (tubePointer.tubeId === id) clearTubePointerState();
        return true;
    }

    function clearTubes() {
        hideTubeTouchUi();
        clearTubePointerState();
        Array.from(tubes.keys()).forEach((id) => removeTube(id));
    }

    function updateTube(id, patch = {}) {
        const t = tubes.get(id);
        if (!t) return null;
        if (patch.x !== undefined) t.x = clamp(Number(patch.x) || t.x, 10, canvas.width - 10);
        if (patch.y !== undefined) t.y = clamp(Number(patch.y) || t.y, 10, canvas.height - 10);
        if (patch.angle !== undefined) t.angle = Number(patch.angle) || t.angle;
        if (patch.length !== undefined) t.length = clamp(Number(patch.length) || t.length, 80, 900);
        if (patch.diameter !== undefined) t.diameter = clamp(Number(patch.diameter) || t.diameter, 12, 100);
        if (patch.material !== undefined && TUBE_MATERIALS[patch.material]) t.material = patch.material;
        if (patch.surface !== undefined && TUBE_SURFACES[patch.surface]) t.surface = patch.surface;
        if (patch.endMode !== undefined) t.endMode = patch.endMode === 'closed' ? 'closed' : 'open';
        if (patch.quantize !== undefined) t.quantize = !!patch.quantize;
        if (patch.windPlay !== undefined) t.windPlay = !!patch.windPlay;
        return t;
    }

    function cutTubeAtPoint(tube, p) {
        if (!tube) return false;
        const proj = projectOnTube(tube, p);
        if (proj.t < 0.12 || proj.t > 0.88) return false;
        const ep = getTubeEndpoints(tube);
        const pcut = { x: proj.x, y: proj.y };
        const mid1 = { x: (ep.x1 + pcut.x) * 0.5, y: (ep.y1 + pcut.y) * 0.5 };
        const mid2 = { x: (ep.x2 + pcut.x) * 0.5, y: (ep.y2 + pcut.y) * 0.5 };
        const len1 = Math.max(80, tube.length * proj.t);
        const len2 = Math.max(80, tube.length * (1 - proj.t));
        const base = { material: tube.material, surface: tube.surface, diameter: tube.diameter, endMode: tube.endMode, quantize: tube.quantize, windPlay: tube.windPlay, angle: tube.angle };
        removeTube(tube.id);
        addTube({ ...base, x: mid1.x, y: mid1.y, length: len1 });
        addTube({ ...base, x: mid2.x, y: mid2.y, length: len2 });
        return true;
    }

    function handleTubePointerDown(e) {
        const p = getCanvasPoint(e);
        const tool = normalizeTubeTool(config?.tubes?.tool || 'select');
        const gizmoHit = tool === 'select' ? hitTubeGizmoAtPoint(p) : null;
        const hit = gizmoHit?.tube || hitTubeAtPoint(p);
        const hitZone = detectTubeHitZone(hit, p);
        tubePointer.pointerId = e.pointerId;
        tubePointer.tool = tool;
        tubePointer.tubeId = hit?.id || null;
        tubePointer.hitZone = hitZone;
        tubePointer.startX = p.x;
        tubePointer.startY = p.y;
        tubePointer.moved = false;
        tubePointer.hadHit = !!hit;
        if (hit) {
            selectedTubeId = hit.id;
            tubePointer.tubeStartX = hit.x;
            tubePointer.tubeStartY = hit.y;
            tubePointer.tubeStartAngle = hit.angle;
            tubePointer.anchorX = hit.x;
            tubePointer.anchorY = hit.y;
        } else if (tool === 'select') {
            hideTubeTouchUi();
        }

        if (tool === 'place') {
            if (hit) {
                selectedTubeId = hit.id;
            } else {
                const t = addTube({ x: p.x, y: p.y });
                if (t) exciteTube(t.id, { type: 'strike', x: p.x, y: p.y, energy: 0.35 });
            }
        } else if (tool === 'select') {
            if (gizmoHit && hit) {
                tubePointer.tool = gizmoHit.action;
                showTubeTouchUi(hit.id);
            } else if (hit && (hitZone === 'start' || hitZone === 'end')) {
                const ep = getTubeEndpoints(hit);
                tubePointer.tool = 'resize';
                if (hitZone === 'start') {
                    tubePointer.anchorX = ep.x2;
                    tubePointer.anchorY = ep.y2;
                } else {
                    tubePointer.anchorX = ep.x1;
                    tubePointer.anchorY = ep.y1;
                }
                showTubeTouchUi(hit.id);
            } else if (hit && (hitZone === 'center' || hitZone === 'body')) {
                tubePointer.tool = 'move';
                showTubeTouchUi(hit.id);
            }
        } else if (tool === 'play') {
            if (hit) exciteTube(hit.id, { type: 'strike', x: p.x, y: p.y, energy: 0.7 });
        } else if (tool === 'cut') {
            if (hit) cutTubeAtPoint(hit, p);
            clearTubePointerState();
        } else if (tool === 'delete') {
            if (hit) removeTube(hit.id);
            clearTubePointerState();
        }
    }

    function handleTubePointerMove(e) {
        if (tubePointer.pointerId !== e.pointerId || !tubePointer.tubeId) return;
        const p = getCanvasPoint(e);
        const tube = tubes.get(tubePointer.tubeId);
        if (!tube) return;
        const dragDist = Math.hypot(p.x - tubePointer.startX, p.y - tubePointer.startY);
        if (dragDist > 4) tubePointer.moved = true;
        const tool = tubePointer.tool;
        if (tool === 'move') {
            const dx = p.x - tubePointer.startX;
            const dy = p.y - tubePointer.startY;
            updateTube(tube.id, { x: tubePointer.tubeStartX + dx, y: tubePointer.tubeStartY + dy });
        } else if (tool === 'rotate') {
            let ang = Math.atan2(p.y - tube.y, p.x - tube.x);
            ang = snapAngle(ang, config?.tubes?.snapAngleDeg);
            updateTube(tube.id, { angle: ang });
        } else if (tool === 'resize') {
            // Endpoint editing: opposite endpoint stays anchored; drag endpoint controls both angle and length.
            const dragX = clamp(p.x, 10, canvas.width - 10);
            const dragY = clamp(p.y, 10, canvas.height - 10);
            const fixedX = tubePointer.anchorX;
            const fixedY = tubePointer.anchorY;
            const dirX = tubePointer.hitZone === 'start' ? (fixedX - dragX) : (dragX - fixedX);
            const dirY = tubePointer.hitZone === 'start' ? (fixedY - dragY) : (dragY - fixedY);
            const nextLen = clamp(Math.hypot(dirX, dirY), 80, 900);
            if (nextLen > 1) {
                let nextAngle = Math.atan2(dirY, dirX);
                nextAngle = snapAngle(nextAngle, config?.tubes?.snapAngleDeg);
                const nextX = (fixedX + dragX) * 0.5;
                const nextY = (fixedY + dragY) * 0.5;
                updateTube(tube.id, { x: nextX, y: nextY, angle: nextAngle, length: nextLen });
                // Avoid retriggering: only excite if no active tube voice.
                const tv = activeTubeVoices.get(tube.id);
                if (!tv || tv.kind === 'wind') {
                    exciteTube(tube.id, {
                        type: 'rub',
                        x: p.x,
                        y: p.y,
                        energy: clamp(0.28 + Math.min(0.62, dragDist / 120), 0.24, 1.08)
                    });
                }
            }
        } else if (tool === 'play') {
            exciteTube(tube.id, { type: 'rub', x: p.x, y: p.y, energy: 0.5 + Math.min(0.5, Math.hypot(p.x - tubePointer.startX, p.y - tubePointer.startY) / 140) });
        }
    }

    function handleTubePointerUp(e) {
        if (tubePointer.pointerId !== e.pointerId) return;
        if (tubePointer.tool === 'select' && !tubePointer.hadHit && !tubePointer.moved) {
            const t = addTube({ x: tubePointer.startX, y: tubePointer.startY });
            if (t) exciteTube(t.id, { type: 'strike', x: tubePointer.startX, y: tubePointer.startY, energy: 0.3 });
            hideTubeTouchUi();
        } else if (tubePointer.hadHit && !tubePointer.moved && tubePointer.hitZone === 'center' && tubePointer.tubeId) {
            showTubeTouchUi(tubePointer.tubeId);
        }
        clearTubePointerState();
    }

    function bindPointerInteractions() {
        if (!canvas) return;

        canvas.addEventListener('pointerdown', (e) => {
            if (!isRunning) return;
            if (isTubeMode()) {
                const tool = normalizeTubeTool(config?.tubes?.tool || 'select');
                if (tool === 'play') {
                    handleTubePlayPointerDown(e);
                    canvas.setPointerCapture?.(e.pointerId);
                    return;
                }
                handleTubePointerDown(e);
                canvas.setPointerCapture?.(e.pointerId);
                return;
            }
            const p = getCanvasPoint(e);
            const now = performance.now();
            const wallDrawMode = config?.interaction?.mode === 'drawWalls';
            const hitBodies = Query.point(Composite.allBodies(engine.world), p)
                .filter((b) => !b.isStatic && b.render?.visible !== false);
            const isDraggingExistingBody = hitBodies.length > 0;
            pointerState.set(e.pointerId, {
                lastSpawnTs: now,
                trail: [{ x: p.x, y: p.y, t: now }],
                dragMode: isDraggingExistingBody || wallDrawMode,
                downX: p.x,
                downY: p.y,
                hasMoved: false,
                drawWall: wallDrawMode,
                lastWallPoint: wallDrawMode ? { x: p.x, y: p.y } : null
            });
            canvas.setPointerCapture?.(e.pointerId);
            if (wallDrawMode) return;
        });

        canvas.addEventListener('pointermove', (e) => {
            if (!isRunning) return;
            if (isTubeMode()) {
                const tool = normalizeTubeTool(config?.tubes?.tool || 'select');
                if (tool === 'play') {
                    handleTubePlayPointerMove(e);
                    return;
                }
                handleTubePointerMove(e);
                return;
            }
            const st = pointerState.get(e.pointerId);
            if (!st) return;
            if (mouseConstraint && mouseConstraint.body) st.dragMode = true;
            const p = getCanvasPoint(e);
            const now = performance.now();
            st.trail.push({ x: p.x, y: p.y, t: now });
            if (st.trail.length > 8) st.trail.shift();
            if (!st.hasMoved) {
                const d = Math.hypot(p.x - st.downX, p.y - st.downY);
                if (d > 10) st.hasMoved = true;
            }
            if (st.drawWall) {
                const last = st.lastWallPoint || p;
                const dist = Math.hypot(p.x - last.x, p.y - last.y);
                if (dist >= 10) {
                    addWallSegment(last, p, { thickness: 10 });
                    st.lastWallPoint = { x: p.x, y: p.y };
                }
                return;
            }
            if (st.dragMode) return;

            const dragInterval = clamp(240 - (config.macro.density * 160), 70, 260);
            if (now - st.lastSpawnTs >= dragInterval) {
                const v = velocityFromTrail(st.trail);
                spawnFromPointer({ x: p.x, y: p.y, vx: v.vx, vy: v.vy, sizeBias: 0.1 });
                st.lastSpawnTs = now;
            }
        });

        const onPointerUp = (e) => {
            if (!isRunning) return;
            if (isTubeMode()) {
                const tool = normalizeTubeTool(config?.tubes?.tool || 'select');
                if (tool === 'play') {
                    handleTubePlayPointerUp(e);
                    canvas.releasePointerCapture?.(e.pointerId);
                    return;
                }
                handleTubePointerUp(e);
                canvas.releasePointerCapture?.(e.pointerId);
                return;
            }
            const st = pointerState.get(e.pointerId);
            if (!st) return;
            if (mouseConstraint && mouseConstraint.body) st.dragMode = true;
            const p = getCanvasPoint(e);
            if (st.drawWall) {
                pointerState.delete(e.pointerId);
                canvas.releasePointerCapture?.(e.pointerId);
                return;
            }
            if (!st.dragMode) {
                const v = velocityFromTrail(st.trail);
                const fling = Math.hypot(v.vx, v.vy);
                // Se e' un tap semplice, crea un solo oggetto.
                if (!st.hasMoved) {
                    spawnFromPointer({ x: st.downX, y: st.downY, vx: 0, vy: 0, sizeBias: 0.15 });
                } else if (fling > 80) {
                    const flingBias = clamp(fling / 1200, 0, 1);
                    spawnFromPointer({ x: p.x, y: p.y, vx: v.vx, vy: v.vy, sizeBias: 0.2 + flingBias * 0.6 });
                }
            }
            pointerState.delete(e.pointerId);
            canvas.releasePointerCapture?.(e.pointerId);
        };

        canvas.addEventListener('pointerup', onPointerUp);
        canvas.addEventListener('pointercancel', onPointerUp);
        canvas.addEventListener('pointerleave', onPointerUp);
    }

    function getCanvasPoint(e) {
        const rect = canvas.getBoundingClientRect();
        return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }

    function velocityFromTrail(trail) {
        if (!trail || trail.length < 2) return { vx: 0, vy: 0 };
        const a = trail[Math.max(0, trail.length - 4)];
        const b = trail[trail.length - 1];
        const dt = Math.max(1, b.t - a.t);
        return { vx: ((b.x - a.x) / dt) * 1000, vy: ((b.y - a.y) / dt) * 1000 };
    }

    function start() {
        if (!canvas || isRunning) return;
        canvas.style.display = 'block';
        resize();
        Mouse.setElement(mouse, canvas);
        Runner.run(runner, engine);
        isRunning = true;
        frameLastTs = performance.now();
        renderLoop();
        spawnEnvironment();
        syncStreamTimer();
    }

    function stop() {
        if (!isRunning) return;
        stopStreamTimer();
        canvas.style.display = 'none';
        Runner.stop(runner);
        cancelAnimationFrame(rafId);
        isRunning = false;

        activeVoices.forEach((data) => sendNoteOff(data.note, data.chan));
        activeVoices.clear();
        stopAllWaterGlides();
        stopAllTubeVoices();
        stopAllFrictionDrones(true);
        mpeChannelState.clear();
        lastNoteOnByChan.clear();
        synthSafeRuntime.noteCount = 0;
        windRuntime.gust = 0;
        windRuntime.pulse = 0;
        lastTriggerByBody.clear();
        pointerState.clear();
        clearTubePointerState();
        clearTubePlayPointers();
        hideTubeTouchUi();
        melodicMemory.A.lastNote = null;
        melodicMemory.B.lastNote = null;
    }

    function setStream(enabled) {
        config.macro.stream = !!enabled;
        syncStreamTimer();
    }

    function syncStreamTimer() {
        stopStreamTimer();
        if (!isRunning || !config.macro.stream || isTubeMode()) return;
        const interval = clamp(config.interaction.autoSpawnIntervalMs + (1 - config.macro.density) * 120, 70, 420);
        streamTimer = setInterval(() => {
            const x = Math.random() * canvas.width;
            spawnFromPointer({ x, y: -30, vx: (Math.random() - 0.5) * 140, vy: 40 + Math.random() * 160, sizeBias: config.macro.density });
        }, interval);
    }

    function stopStreamTimer() {
        if (streamTimer) {
            clearInterval(streamTimer);
            streamTimer = null;
        }
    }

    function spawnEnvironment() {
        Composite.clear(engine.world, false, true);
        if (!engine.world.constraints.includes(mouseConstraint.constraint)) {
            Composite.add(engine.world, mouseConstraint);
        }
        const w = canvas.width;
        const h = canvas.height;
        const thick = 220;
        const ground = Bodies.rectangle(w / 2, h + thick / 2, w + 260, thick, { isStatic: true, label: 'env', render: { visible: false } });
        const left = Bodies.rectangle(-thick / 2, h / 2, thick, h * 4, { isStatic: true, label: 'env', render: { visible: false } });
        const right = Bodies.rectangle(w + thick / 2, h / 2, thick, h * 4, { isStatic: true, label: 'env', render: { visible: false } });
        Composite.add(engine.world, [ground, left, right]);
    }

    function clearScene(options = {}) {
        const keepEnvironment = options.keepEnvironment !== false;
        const keepWalls = options.keepWalls === true;
        if (!engine || !engine.world) return;
        if (!keepWalls) clearCustomWalls();
        if (keepEnvironment) {
            Composite.allBodies(engine.world).forEach((body) => {
                if (!body.isStatic) Composite.remove(engine.world, body);
            });
            activeVoices.forEach((data) => sendNoteOff(data.note, data.chan));
            activeVoices.clear();
            stopAllWaterGlides();
            stopAllTubeVoices();
            mpeChannelState.clear();
            lastNoteOnByChan.clear();
            synthSafeRuntime.noteCount = 0;
            pendingNotesByBody.forEach((id) => clearTimeout(id));
            pendingNotesByBody.clear();
            noteRate.times = [];
            stopAllFrictionDrones(true);
            return;
        }
        Composite.clear(engine.world, false, true);
        activeVoices.forEach((data) => sendNoteOff(data.note, data.chan));
        activeVoices.clear();
        stopAllWaterGlides();
        stopAllTubeVoices();
        stopAllFrictionDrones(true);
        mpeChannelState.clear();
        lastNoteOnByChan.clear();
        synthSafeRuntime.noteCount = 0;
        pendingNotesByBody.forEach((id) => clearTimeout(id));
        pendingNotesByBody.clear();
        noteRate.times = [];
        stopAllFrictionDrones(true);
    }

    function applyRuntimeConfig() {
        if (!engine) return;
        engine.world.gravity.y = clamp(config.macro.gravity * 1.6, 0, 2.4);
    }

    function setConfig(configPartial = {}) {
        const prevMode = normalizeMode(config.mode);
        config = deepMerge(cloneConfig(config), configPartial);
        config.macro.wind = clamp(config.macro.wind || 0, -1, 1);
        config.advanced.maxVoices = clamp(config.advanced.maxVoices || 24, 4, 64);
        config.advanced.collisionThreshold = clamp(config.advanced.collisionThreshold || 1.2, 0.3, 3);
        config.advanced.mpeSmoothingMs = clamp(config.advanced.mpeSmoothingMs || 24, 0, 240);
        config.advanced.noteHoldMsMin = clamp(config.advanced.noteHoldMsMin || 120, 40, 2000);
        config.advanced.noteHoldMsMax = clamp(config.advanced.noteHoldMsMax || 900, config.advanced.noteHoldMsMin + 20, 3000);
        config.advanced.pitchQuantize = config.advanced.pitchQuantize !== false;
        config.advanced.internalSynthSafe = config.advanced.internalSynthSafe !== false;
        config.advanced.timingGridMs = clamp(config.advanced.timingGridMs || 0, 0, 2000);
        config.advanced.swing = clamp(config.advanced.swing || 0, 0, 0.6);
        config.advanced.maxNotesPerSec = clamp(config.advanced.maxNotesPerSec || 0, 0, 200);
        config.advanced.pitchLanes = clamp(parseInt(config.advanced.pitchLanes, 10) || 0, 0, 48);
        config.advanced.anchorNotes = config.advanced.anchorNotes === true;
        config.advanced.adaptiveMpe = config.advanced.adaptiveMpe !== false;
        config.advanced.impactToTimbre = clamp(Number(config.advanced.impactToTimbre ?? 0.35) || 0, 0, 1);
        config.advanced.noteFlash = config.advanced.noteFlash !== false;
        config.advanced.trailByDegree = config.advanced.trailByDegree === true;
        config.advanced.showRotationLine = config.advanced.showRotationLine === true;
        config.advanced.rollingArp = config.advanced.rollingArp !== false;
        config.advanced.harmonicRain = config.advanced.harmonicRain !== false;
        config.advanced.frictionDrone = config.advanced.frictionDrone !== false;
        config.advanced.rollMinAngularVel = clamp(Number(config.advanced.rollMinAngularVel ?? 0.06) || 0, 0, 1);
        config.advanced.rollDebounceMs = clamp(Number(config.advanced.rollDebounceMs ?? 90) || 0, 0, 1000);
        config.advanced.rollVelocityFloor = clamp(Number(config.advanced.rollVelocityFloor ?? 0.02) || 0, 0, 1);
        config.advanced.droneMaxVoices = clamp(parseInt(config.advanced.droneMaxVoices, 10) || 12, 0, 32);
        config.advanced.droneGainMax = clamp(Number(config.advanced.droneGainMax ?? 0.12) || 0, 0, 0.5);
        config.advanced.droneLevel = clamp(Number(config.advanced.droneLevel ?? 0.6) || 0, 0, 1);
        config.interaction.autoSpawnIntervalMs = clamp(config.interaction.autoSpawnIntervalMs || 180, 40, 600);
        config.interaction.mode = config.interaction.mode === 'drawWalls' ? 'drawWalls' : 'drawFling';
        clampTubesConfig();
        if (config?.tubes?.mute || config?.tubes?.physicalModel === false) {
            stopAllTubeResonators(true);
        }
        enforceTubeSceneLimits();
        applyRuntimeConfig();
        syncStreamTimer();
        const nextMode = normalizeMode(config.mode);
        if (nextMode !== prevMode) setMode(nextMode);
    }

    function setMode(mode = 'physics') {
        config.mode = normalizeMode(mode);
        pointerState.clear();
        clearTubePointerState();
        clearTubePlayPointers();
        hideTubeTouchUi();
        if (config.mode === 'tubes') {
            clearScene({ keepEnvironment: true });
        } else {
            stopAllTubeVoices();
        }
    }

    function getMode() {
        return normalizeMode(config.mode);
    }

    function setTubesConfig(partial = {}) {
        config.tubes = deepMerge(config.tubes || {}, partial || {});
        clampTubesConfig();
        enforceTubeSceneLimits();
    }

    function getTubesConfig() {
        return cloneConfig(config.tubes || DEFAULT_CONFIG.tubes);
    }

    function isInternalSynthSafeActive() {
        return (config?.advanced?.internalSynthSafe !== false) && !!(window.state?.audio?.enabled);
    }

    function getDynamicBodyLimit() {
        const maxVoices = clamp(config.advanced.maxVoices || 24, 4, 64);
        const density = clamp(config.macro.density || 0.5, 0, 1);
        return Math.round(clamp((maxVoices * 2.3) + (density * 20), 20, 120));
    }

    function releaseVoiceForBodyId(bodyId) {
        const voice = activeVoices.get(bodyId);
        if (!voice) return;
        sendNoteOff(voice.note, voice.chan);
        activeVoices.delete(bodyId);
        if (!isChannelInUse(voice.chan, { activeBodyId: bodyId })) {
            neutralizeChannel(voice.chan);
        }
    }

    function removeBodySafe(body) {
        if (!body || !engine?.world || body.isStatic) return;
        stopWaterGlideForBody(body);
        releaseVoiceForBodyId(body.id);
        Composite.remove(engine.world, body);
        lastTriggerByBody.delete(body.id);
    }

    function trimDynamicBodiesIfNeeded(extraAllowance = 0) {
        if (isTubeMode()) return;
        if (!engine?.world) return;
        const all = Composite.allBodies(engine.world).filter((b) => !b.isStatic);
        const limit = getDynamicBodyLimit() + Math.max(0, extraAllowance);
        if (all.length <= limit) return;

        // Priorita di rimozione: body più vecchi e lontani dalla zona utile.
        const sorted = all.slice().sort((a, b) => {
            const aScore = (a.plugin?.audio?.spawnedAt || 0) + ((a.position?.y || 0) > canvas.height * 0.95 ? 5000 : 0);
            const bScore = (b.plugin?.audio?.spawnedAt || 0) + ((b.position?.y || 0) > canvas.height * 0.95 ? 5000 : 0);
            return aScore - bScore;
        });

        const toRemove = all.length - limit;
        for (let i = 0; i < toRemove; i += 1) {
            removeBodySafe(sorted[i]);
        }
    }

    function getConfig() {
        return cloneConfig(config);
    }

    function resolveScaleContext(preferredZone = null) {
        const st = window.state || {};
        const normalizeZone = (z) => (z === 'B' ? 'B' : 'A');

        // Priorita: zona in edit scala -> activeEditZone -> A
        let zone = preferredZone ? normalizeZone(preferredZone) : 'A';
        if (!preferredZone) {
            if (st.scaleContextZone) zone = normalizeZone(st.scaleContextZone);
            else if (st.activeEditZone) zone = normalizeZone(st.activeEditZone);
        }

        const zoneScale = (st.scaleNotesByZone && st.scaleNotesByZone[zone]) || st.scaleNotes || {};
        const notes = Array.isArray(zoneScale.notes) ? zoneScale.notes : [];
        const root = Number.isFinite(Number(zoneScale.root)) ? Number(zoneScale.root) : 0;

        const zoneCfg = (st.scaleConfigByZone && st.scaleConfigByZone[zone]) || {};
        const currentOctave = clamp(
            Number.isFinite(Number(zoneCfg.currentOctave))
                ? Number(zoneCfg.currentOctave)
                : (Number.isFinite(Number(st.currentOctave)) ? Number(st.currentOctave) : 0),
            -2,
            2
        );

        return { zone, notes, root, currentOctave };
    }

    function getScaleNotesSafe() {
        const notes = window.state?.scaleNotes?.notes;
        if (Array.isArray(notes) && notes.length) return notes.slice();
        return [0, 2, 4, 5, 7, 9, 11];
    }

    function getCurrentOctaveSafe() {
        const oct = window.state?.currentOctave;
        return Number.isFinite(Number(oct)) ? Number(oct) : 0;
    }

    function getQuantizedNote(scaleIndex, baseMidi = 48) {
        const scale = getScaleNotesSafe();
        if (!scale.length) return clamp(baseMidi, 0, 127);
        const idx = ((scaleIndex % scale.length) + scale.length) % scale.length;
        const oct = getCurrentOctaveSafe();
        const note = baseMidi + (oct * 12) + scale[idx];
        return clamp(note, 0, 127);
    }

    function getScaleIndexForNote(note, baseMidi = 48) {
        const scale = getScaleNotesSafe();
        if (!scale.length) return 0;
        const oct = getCurrentOctaveSafe();
        const base = baseMidi + (oct * 12);
        const noteInOct = ((note - base) % 12 + 12) % 12;
        let bestIdx = 0;
        let bestDist = Math.abs(scale[0] - noteInOct);
        for (let i = 1; i < scale.length; i += 1) {
            const d = Math.abs(scale[i] - noteInOct);
            if (d < bestDist) {
                bestDist = d;
                bestIdx = i;
            }
        }
        return bestIdx;
    }

    function getScaleNotesFromContext(ctx) {
        if (ctx && Array.isArray(ctx.notes) && ctx.notes.length) {
            return ctx.notes.slice().sort((a, b) => a - b);
        }
        return [];
    }

    function getScaleNotesInOctave(ctx) {
        const notes = getScaleNotesFromContext(ctx);
        const root = Number.isFinite(Number(ctx?.root)) ? Number(ctx.root) : 0;
        const octave = Number.isFinite(Number(ctx?.currentOctave)) ? Number(ctx.currentOctave) : 0;
        const base = 48 + root + (octave * 12);
        if (!notes.length) {
            return [0, 2, 4, 5, 7, 9, 11].map((n) => base + n);
        }
        const lo = base;
        const hi = base + 12;
        const strict = notes.filter((n) => n >= lo && n < hi);
        if (strict.length) return strict;
        const nearby = notes.filter((n) => Math.abs(n - (base + 6)) <= 12);
        return nearby.length ? nearby : notes;
    }

    function getQuantizedNoteByIndex(scaleIndex, ctx) {
        const scale = getScaleNotesInOctave(ctx);
        if (!scale.length) return 60;
        const idx = ((scaleIndex % scale.length) + scale.length) % scale.length;
        return clamp(scale[idx], 0, 127);
    }

    function getScaleDegreeColor(scaleIndex, scaleLen) {
        const len = Math.max(1, parseInt(scaleLen, 10) || DEGREE_COLORS.length);
        const idx = ((scaleIndex % len) + len) % len;
        return DEGREE_COLORS[idx % DEGREE_COLORS.length];
    }

    function getPitchLaneIndex(body) {
        const lanes = clamp(parseInt(config?.advanced?.pitchLanes, 10) || 0, 0, 48);
        if (!lanes || !body?.position) return null;
        const xNorm = clamp(body.position.x / canvas.width, 0, 1);
        const laneFromLeft = Math.floor(xNorm * lanes);
        return clamp(laneFromLeft, 0, lanes - 1);
    }

    function shouldAnchorNote(data, materialKey) {
        return !!(config?.advanced?.anchorNotes && Number.isFinite(Number(data?.anchorNote)) && data?.anchorMatKey === materialKey);
    }

    function canTriggerNote() {
        const limit = clamp(Number(config?.advanced?.maxNotesPerSec) || 0, 0, 200);
        if (!limit) return true;
        const now = performance.now();
        noteRate.times = noteRate.times.filter((t) => (now - t) < 1000);
        if (noteRate.times.length >= limit) return false;
        noteRate.times.push(now);
        return true;
    }

    function getQuantizeDelayMs() {
        const gridMs = clamp(Number(config?.advanced?.timingGridMs) || 0, 0, 2000);
        if (!gridMs) return 0;
        const now = performance.now();
        let next = Math.ceil(now / gridMs) * gridMs;
        const swing = clamp(Number(config?.advanced?.swing) || 0, 0, 0.6);
        if (swing > 0) {
            const step = Math.floor(next / gridMs);
            if (step % 2 === 1) next += gridMs * 0.5 * swing;
        }
        return Math.max(0, next - now);
    }

    function scheduleNoteOn(note, velocity, chan, options = {}) {
        if (!canTriggerNote()) return false;
        const delay = options.quantize === false ? 0 : getQuantizeDelayMs();
        const body = options.body || null;
        const bodyId = body?.id || null;
        if (bodyId && pendingNotesByBody.has(bodyId)) {
            clearTimeout(pendingNotesByBody.get(bodyId));
            pendingNotesByBody.delete(bodyId);
        }
        const run = () => {
            if (body && (!engine?.world || !Composite.get(engine.world, bodyId, 'body'))) return;
            const ok = sendNoteOn(note, velocity, chan, options);
            if (ok && typeof options.onStart === 'function') options.onStart();
        };
        if (delay <= 1) {
            run();
            return true;
        }
        const id = setTimeout(() => {
            pendingNotesByBody.delete(bodyId);
            run();
        }, delay);
        if (bodyId) pendingNotesByBody.set(bodyId, id);
        return true;
    }

    function resolveBodyTriggerNote(body) {
        const data = body?.plugin?.audio || {};
        const zone = data.zone === 'B' ? 'B' : 'A';
        const ctx = resolveScaleContext(zone);
        const materialKey = materialKeyFromProfile(data.material || currentMaterial);

        if (shouldAnchorNote(data, materialKey)) {
            return clamp(Number(data.anchorNote), 0, 127);
        }

        const laneIndex = getPitchLaneIndex(body);
        if (laneIndex !== null) {
            const note = getQuantizedNoteByIndex(laneIndex, ctx);
            data.scaleIndex = laneIndex;
            data.scaleLen = getScaleNotesInOctave(ctx).length;
            return clamp(note, 0, 127);
        }

        const baseNote = clamp(
            Number.isFinite(Number(data.baseNote))
                ? Number(data.baseNote)
                : (Number.isFinite(Number(data.note)) ? Number(data.note) : 60),
            0,
            127
        );
        const anchorOctave = Number.isFinite(Number(data.spawnOctave))
            ? Number(data.spawnOctave)
            : ctx.currentOctave;
        const octaveShift = (ctx.currentOctave - anchorOctave) * 12;

        let note = baseNote + octaveShift;
        if (config?.advanced?.pitchQuantize !== false) {
            note = quantizeNoteForZone(note, zone);
        }
        return clamp(note, 0, 127);
    }

    function getNoteFromScale(octaveOffset = 0, noteBias = 0) {
        let note = 60;
        const ctx = resolveScaleContext();
        const zone = ctx.zone === 'B' ? 'B' : 'A';
        const allNotes = (ctx.notes || []).slice().sort((a, b) => a - b);
        if (allNotes.length) {
            // Allineamento con la logica della app: baseMIDI = 48 + octave*12 + root.
            const selectedOctBase = 48 + ctx.root + (ctx.currentOctave * 12) + octaveOffset + Math.round(noteBias * 12);
            const selectedOctLo = selectedOctBase;
            const selectedOctHi = selectedOctBase + 11;

            // 1) Vincolo forte: usa l'ottava selezionata.
            const strictOctave = allNotes.filter((n) => n >= selectedOctLo && n <= selectedOctHi);
            // 2) Fallback morbido: massimo una semitono fuori bordo (scalette microtonali).
            const strictOctaveSoft = allNotes.filter((n) => n >= (selectedOctLo - 1) && n <= (selectedOctHi + 1));
            // 3) Fallback finale: zona vicina, ma non oltre +/- 1 ottava.
            const nearby = allNotes.filter((n) => Math.abs(n - (selectedOctBase + 6)) <= 12);
            const candidates = strictOctave.length
                ? strictOctave
                : (strictOctaveSoft.length ? strictOctaveSoft : (nearby.length ? nearby : allNotes));

            const mem = melodicMemory[zone];
            const center = selectedOctBase + 6;
            const tooFarFromCenter = Number.isFinite(mem.lastNote) && Math.abs(mem.lastNote - center) > 12;
            if (tooFarFromCenter) mem.lastNote = null;

            const degreeWeight = (n) => {
                const d = (((n - ctx.root) % 12) + 12) % 12;
                if (d === 0) return 1.45;
                if (d === 7) return 1.25;
                if (d === 4 || d === 3) return 1.2;
                if (d === 5 || d === 9) return 1.05;
                if (d === 2 || d === 10) return 0.9;
                return 0.75;
            };

            const continuityWeight = (n) => {
                if (!Number.isFinite(mem.lastNote)) return 1;
                const d = Math.abs(n - mem.lastNote);
                if (d <= 2) return 1.7;
                if (d <= 4) return 1.35;
                if (d <= 7) return 1.05;
                if (d <= 12) return 0.75;
                return 0.45;
            };

            const centerWeight = (n) => {
                const dist = Math.abs(n - center);
                return 1 / (1 + dist * 0.22);
            };

            let total = 0;
            const weighted = candidates.map((n) => {
                const chaos = clamp(config?.macro?.chaos ?? 0.4, 0, 1);
                const cont = continuityWeight(n) * (1.35 - chaos * 0.45);
                // Trazione tonica periodica: ogni tanto richiama la tonica dell'ottava corrente.
                const tonicPull = ((((n - ctx.root) % 12) + 12) % 12) === 0 ? 1.12 : 1;
                const w = degreeWeight(n) * centerWeight(n) * cont * tonicPull;
                total += w;
                return { n, w };
            });

            if (total > 0) {
                let r = Math.random() * total;
                for (let i = 0; i < weighted.length; i += 1) {
                    r -= weighted[i].w;
                    if (r <= 0) {
                        note = weighted[i].n;
                        break;
                    }
                }
            } else {
                note = candidates[Math.floor(Math.random() * candidates.length)];
            }
            mem.lastNote = note;
            mem.lastTs = performance.now();
        }
        return clamp(note, 0, 127);
    }

    function quantizeNoteForZone(note, zone = 'A') {
        const st = window.state || {};
        const z = zone === 'B' ? 'B' : 'A';
        const zoneScale = (st.scaleNotesByZone && st.scaleNotesByZone[z]) || st.scaleNotes || {};
        const scaleNotes = Array.isArray(zoneScale.notes) ? zoneScale.notes.slice().sort((a, b) => a - b) : [];
        if (!scaleNotes.length) return clamp(note, 0, 127);

        // Tube pitch needs continuous response: do not hard-lock to current octave.
        const pool = scaleNotes;

        let best = pool[0];
        let bestD = Math.abs(pool[0] - note);
        for (let i = 1; i < pool.length; i += 1) {
            const d = Math.abs(pool[i] - note);
            if (d < bestD) {
                bestD = d;
                best = pool[i];
            }
        }
        return clamp(best, 0, 127);
    }

    function getTubeMaterialProfile(key) {
        return TUBE_MATERIALS[key] || TUBE_MATERIALS.PVC;
    }

    function getTubeSurfaceProfile(key) {
        return TUBE_SURFACES[key] || TUBE_SURFACES.corrugated;
    }

    function getTubeYExpress(tube) {
        if (!tube || !canvas) return 0.5;
        const y = Number.isFinite(Number(tube.y)) ? Number(tube.y) : 0;
        return clamp(1 - (y / canvas.height), 0, 1);
    }

    function getTubeYExpressShaped(tube) {
        const raw = getTubeYExpress(tube);
        const strength = clamp(Number(config?.tubes?.yExpressivity) || 0.6, 0, 1);
        const exp = clamp(1.4 - (strength * 0.9), 0.45, 1.6);
        return clamp(Math.pow(raw, exp), 0, 1);
    }

    function tubeFundamentalHz(tube) {
        const pxToM = 0.0024;
        const c = 343;
        const lengthM = Math.max(0.08, tube.length * pxToM);
        const radiusM = Math.max(0.003, (tube.diameter * pxToM) * 0.5);
        // End correction: ~0.6r for each open end.
        const openEnds = tube.endMode === 'closed' ? 1 : 2;
        const lEff = Math.max(0.085, lengthM + (0.6 * radiusM * openEnds));
        const denom = tube.endMode === 'closed' ? (4 * lEff) : (2 * lEff);
        const fBase = c / Math.max(0.02, denom);
        return clamp(fBase, 45, 2400);
    }

    function freqToMidi(freq) {
        return 69 + 12 * Math.log2(freq / 440);
    }

    function noteFloatToHz(noteFloat) {
        return 440 * Math.pow(2, (noteFloat - 69) / 12);
    }

    function tubeHarmonicSpreadSemis(tube) {
        if (!tube || tubes.size <= 1) return 0;
        const ordered = Array.from(tubes.values()).sort((a, b) => (a.createdAt || a.bornAt || 0) - (b.createdAt || b.bornAt || 0));
        const idx = ordered.findIndex((t) => t.id === tube.id);
        if (idx < 0) return 0;
        const crowd = tubeCrowdFactor();
        const pattern = [0, 7, 4, 9, 2, 11, 5, 0];
        const semis = pattern[idx % pattern.length];
        const spreadAmt = clamp(0.35 + crowd * 0.75, 0.35, 1.1);
        return semis * spreadAmt;
    }

    function tubeBaseNote(tube, zone = 'A') {
        let raw = clamp(freqToMidi(tubeFundamentalHz(tube)), 18, 108);
        const spread = tubeHarmonicSpreadSemis(tube);
        raw = raw + (spread * 0.55);
        if (tube.quantize) {
            const strength = clamp(Number(config?.tubes?.quantizeStrength) || 0.7, 0, 1);
            raw = quantizeNoteForZoneSoft(raw, zone, strength);
        }
        if (config?.tubes?.harmonicSpread !== false && tubes.size > 1) {
            const orderIdx = getTubeOrderIndex(tube);
            raw = getTubeScaleHarmonicNote(raw, zone, orderIdx);
        }
        return clamp(raw, 0, 127);
    }

    function tubeCrowdFactor() {
        return clamp((tubes.size - 1) / Math.max(1, (config?.tubes?.maxCount || 24) * 0.7), 0, 1);
    }

    function stopOverLimitTubeVoices(reserveSlots = 0, excludeTubeId = null) {
        const maxV = clamp(config?.tubes?.maxVoices || 6, 2, 16);
        const target = Math.max(0, maxV - Math.max(0, Math.floor(reserveSlots)));
        if (activeTubeVoices.size <= target) return;
        const arr = Array.from(activeTubeVoices.values())
            .filter((v) => !excludeTubeId || v.tubeId !== excludeTubeId)
            .sort((a, b) => a.birth - b.birth);
        const n = activeTubeVoices.size - target;
        for (let i = 0; i < n; i += 1) {
            if (!arr[i]) break;
            stopTubeVoice(arr[i].tubeId);
        }
    }

    function enforceTubeSceneLimits() {
        stopOverLimitTubeVoices();
        const maxCount = clamp(config?.tubes?.maxCount || 24, 4, 64);
        if (tubes.size <= maxCount) return;
        const ordered = Array.from(tubes.values()).sort((a, b) => (a.createdAt || a.bornAt || 0) - (b.createdAt || b.bornAt || 0));
        const n = tubes.size - maxCount;
        for (let i = 0; i < n; i += 1) {
            if (!ordered[i]) break;
            removeTube(ordered[i].id);
        }
    }

    function exciteTube(tubeId, excitation = {}) {
        const tube = tubes.get(tubeId);
        if (!tube) return false;
        if (config?.tubes?.mute) return false;
        const now = performance.now();
        const kind = excitation.type || 'strike';
        const minGap = kind === 'rub' ? 30 : 55;
        if ((now - (tube.lastExciteAt || 0)) < minGap) return false;
        tube.lastExciteAt = now;

        const mat = getTubeMaterialProfile(tube.material);
        const surf = getTubeSurfaceProfile(tube.surface);
        const zone = 'A';
        const noteFloat = tubeBaseNote(tube, zone);
        const note = clamp(Math.round(noteFloat), 0, 127);
        const lenNorm = clamp((tube.length - 80) / 400, 0, 1);
        const diaNorm = clamp((tube.diameter - 12) / 88, 0, 1);
        const crowd = tubeCrowdFactor();
        const energy = clamp(Number(excitation.energy) || 0.55, 0.08, 1.2);
        const chan = pickChannel();
        const mood = clamp(Number(config?.tubes?.mood) || 0.5, 0, 1);
        const yExpress = getTubeYExpressShaped(tube);
        const yGain = clamp(0.25 + yExpress * 0.85, 0.25, 1.1);
        const yBright = clamp(0.6 + yExpress * 0.7, 0.6, 1.4);
        const vel = clamp(Math.round((36 + energy * 74 + mat.brightness * 18 + (1 - lenNorm) * 8 + diaNorm * 6) * (1 - crowd * 0.22) * yGain), 16, 127);
        const holdMs = Math.round(clamp((170 + (1 - mat.damping) * 760) * (0.65 + mood * 0.55) * (0.7 + energy * 0.5) * (0.7 + lenNorm * 0.45) * (1 - crowd * 0.35), 80, 1800));
        let timbre = clamp(Math.round(18 + mat.brightness * 78 + surf.noise * 26 + (tube.diameter * 0.24) + (1 - lenNorm) * 14 + crowd * 8), 0, 127);
        timbre = clamp(Math.round(timbre + (mood - 0.5) * 36), 0, 127);
        timbre = clamp(Math.round(timbre * yBright), 0, 127);
        const press = clamp(Math.round((28 + energy * 72 + surf.frictionExcite * 12 + crowd * 10) * (1 - crowd * 0.15) * (0.35 + yExpress * 0.75)), 0, 127);
        const pbRange = getZonePitchBendRange(zone);
        const angleNorm = Math.sin(tube.angle) * 0.45;
        const microOffset = (noteFloat - note) * (8192 / pbRange);
        const pb = clamp(Math.round(8192 + (angleNorm * (8192 / pbRange)) + microOffset), 0, 16383);

        stopTubeVoice(tubeId);
        stopOverLimitTubeVoices(1, tubeId);
        if (!sendNoteOn(note, vel, chan, { attack: mat.attack, zoneId: zone })) return false;
        sendExpressiveMPE(chan, pb, timbre, press, true);
        if (config?.tubes?.physicalModel) {
            const physEnergy = energy * yGain;
            createTubeResonator(tube, 'strike', { noteFloat, energy: physEnergy, addNoise: false });
            triggerTubeCoupling(tube, physEnergy);
        }

        tube.pulseAt = now;
        tube.pulseAmp = clamp(energy, 0.2, 1.2);
        activeTubeVoices.set(tubeId, {
            tubeId,
            note,
            noteFloat,
            chan,
            kind,
            tube,
            birth: now,
            holdMs,
            smoothed: { pb, timbre, press },
            materialRelease: mat.release
        });
        return true;
    }

    function updateSelectedTube(patch = {}, options = {}) {
        if (!selectedTubeId) return null;
        const t = updateTube(selectedTubeId, patch);
        if (!t) return null;
        if (options.preview) {
            exciteTube(t.id, { type: 'strike', x: t.x, y: t.y, energy: 0.45 });
        }
        return t;
    }

    function chooseShape(shape) {
        const mode = shape || config.advanced.spawnShape || 'auto';
        if (mode !== 'auto') return mode;
        if (currentMaterial.name === 'Bamboo') return 'bar';
        if (currentMaterial.name === 'Stone' || currentMaterial.name === 'Steel' || currentMaterial.name === 'Glass') return 'polygon';
        return 'circle';
    }

    function materialKeyFromProfile(profile) {
        const key = Object.keys(MATERIALS).find((k) => MATERIALS[k] === profile);
        return key || 'BAMBOO';
    }

    function createBody(spec = {}) {
        const x = clamp(spec.x ?? (Math.random() * canvas.width), 6, canvas.width - 6);
        const y = spec.y ?? -50;
        const scaleCtx = resolveScaleContext();
        const note = Number.isFinite(spec.note) ? clamp(Math.round(spec.note), 0, 127) : getNoteFromScale(0, spec.noteBias || 0);
        const materialKey = MATERIALS[spec.materialKey] ? spec.materialKey : materialKeyFromProfile(currentMaterial);
        const material = MATERIALS[materialKey] || currentMaterial;

        const macroEnergy = clamp(config.macro.energy, 0, 1);
        const macroDensity = clamp(config.macro.density, 0, 1);
        const densityScale = 0.65 + macroDensity * 1.2;
        const sizeBias = clamp(spec.sizeBias ?? 0.3, 0, 1.6);

        const rawScale = 1 - ((note - 36) / 80);
        const sizeScale = clamp(rawScale + sizeBias * 0.35, 0.38, 1.5);
        const radius = 18 + (sizeScale * 26) + (macroEnergy * 8);

        const chaos = clamp(config.macro.chaos, 0, 1);
        const opts = {
            ...material.physics,
            density: material.physics.density * densityScale,
            restitution: clamp(material.physics.restitution + ((Math.random() - 0.5) * chaos * 0.25), 0.02, 1.35),
            friction: clamp(material.physics.friction + ((Math.random() - 0.5) * chaos * 0.08), 0.001, 0.9),
            render: { visible: true }
        };

        let body;
        const shape = chooseShape(spec.shape);
        if (shape === 'bar') {
            body = Bodies.rectangle(x, y, radius * 2.9, radius * 0.9, { chamfer: { radius: 8 }, ...opts });
        } else if (shape === 'polygon') {
            const sides = 5 + Math.floor(Math.random() * 3);
            body = Bodies.polygon(x, y, sides, radius * 0.9, opts);
        } else {
            body = Bodies.circle(x, y, radius, opts);
        }

        body.plugin = body.plugin || {};
        body.plugin.audio = {
            note,
            baseNote: note,
            material,
            zone: scaleCtx.zone || 'A',
            spawnOctave: scaleCtx.currentOctave,
            spawnY: y,
            spawnedAt: performance.now(),
            lastCollisionEnergy: 0,
            velSmooth: 0,
            windEnergy: 0,
            windDir: 0,
            shape,
            scaleIndex: getScaleIndexForNote(note),
            scaleLen: getScaleNotesSafe().length,
            lastVertexHitTs: 0,
            lastAngle: 0
        };
        body.plugin.trail = [];

        const vx = spec.vx || ((Math.random() - 0.5) * 120 * (0.6 + config.macro.chaos));
        const vy = spec.vy || (40 + Math.random() * 120);
        const av = ((Math.random() - 0.5) * 0.45) * (0.6 + chaos * 1.6);

        Body.setVelocity(body, { x: vx / 60, y: vy / 60 });
        Body.setAngularVelocity(body, av);

        return body;
    }

    function spawnObject(noteHint) {
        if (!isRunning || isTubeMode()) return;
        trimDynamicBodiesIfNeeded(2);
        const note = Number.isFinite(noteHint) ? noteHint : undefined;
        const body = createBody({
            x: Math.random() * (canvas.width * 0.7) + (canvas.width * 0.15),
            y: -60,
            note,
            sizeBias: 0.35
        });
        Composite.add(engine.world, body);
        startWaterGlide(body);
    }

    function spawnRain() {
        if (!isRunning || isTubeMode()) return;
        const scaleCtx = resolveScaleContext();
        const baseScale = getScaleNotesInOctave(scaleCtx);
        const hasScale = baseScale && baseScale.length;
        const count = 1; // one chord per click for playability
        const totalToSpawn = (config?.advanced?.harmonicRain !== false) ? (Math.random() < 0.3 ? 4 : 3) : count;
        trimDynamicBodiesIfNeeded(totalToSpawn + 2);

        for (let i = 0; i < count; i += 1) {
            if (config?.advanced?.harmonicRain !== false && hasScale) {
                const rootIdx = Math.floor(Math.random() * baseScale.length);
                const isSeventh = Math.random() < 0.3;
                const chordIdx = isSeventh
                    ? [rootIdx, rootIdx + 2, rootIdx + 4, rootIdx + 6]
                    : [rootIdx, rootIdx + 2, rootIdx + 4];
                chordIdx.forEach((idx, k) => {
                    const safeIdx = ((idx % baseScale.length) + baseScale.length) % baseScale.length;
                    const note = clamp(Math.round(baseScale[safeIdx]), 0, 127);
                    const y = -50 - (k * 12);
                    const body = createBody({
                        x: Math.random() * canvas.width,
                        y,
                        note,
                        shape: 'circle',
                        sizeBias: 0.1
                    });
                    body.label = 'rain';
                    if (body.plugin?.audio) {
                        body.plugin.audio.zone = scaleCtx.zone || 'A';
                        body.plugin.audio.spawnOctave = scaleCtx.currentOctave;
                        body.plugin.audio.spawnY = y;
                        body.plugin.audio.spawnedAt = performance.now();
                        body.plugin.audio.scaleIndex = safeIdx;
                        body.plugin.audio.scaleLen = baseScale.length;
                    }
                    Composite.add(engine.world, body);
                    setTimeout(() => { if (isRunning) Composite.remove(engine.world, body); }, 3600);
                });
            } else {
                // Fallback: single random note
                const note = getNoteFromScale(0, (Math.random() - 0.5) * 0.25);
                const drop = Bodies.circle(Math.random() * canvas.width, -50, 3 + config.macro.energy * 3, {
                    restitution: 0.35,
                    friction: 0,
                    density: 0.0018,
                    label: 'rain',
                    render: { visible: true }
                });
                drop.plugin = {
                    audio: {
                        note,
                        baseNote: note,
                        material: currentMaterial,
                        zone: scaleCtx.zone || 'A',
                        spawnOctave: scaleCtx.currentOctave,
                        spawnY: -50,
                        spawnedAt: performance.now(),
                        lastCollisionEnergy: 0,
                        velSmooth: 0
                    },
                    trail: []
                };
                Composite.add(engine.world, drop);
                setTimeout(() => { if (isRunning) Composite.remove(engine.world, drop); }, 3600);
            }
        }
    }

    function spawnFromPointer(spec = {}) {
        if (!isRunning || isTubeMode()) return;
        trimDynamicBodiesIfNeeded(2);
        const body = createBody(spec);
        Composite.add(engine.world, body);
        startWaterGlide(body);
    }

    function sendMidiMessage(status, data1, data2, options = {}) {
        if (!window.state || !window.state.midi) return;
        const midiState = window.state.midi;
        const audioEnabled = !!window.state?.audio?.enabled;
        const forceHardware = options.forceHardware === true;
        // Evita doppio trigger del synth interno: quando audio interno e' ON, bypassa il wrapper.
        const outA = forceHardware
            ? (midiState.hardwareOutput || null)
            : (audioEnabled ? (midiState.hardwareOutput || null) : (midiState.output || midiState.hardwareOutput || null));
        if (outA) {
            try {
                const type = status & 0xF0;
                // Program Change (0xC0) e Channel Pressure (0xD0) hanno 1 solo data byte.
                if (type === 0xC0 || type === 0xD0) outA.send([status, data1]);
                else outA.send([status, data1, data2 ?? 0]);
                return true;
            } catch (_) {
                return false;
            }
        }
        return false;
    }

    function updateInternalSynth(chan, type, value) {
        if (!window.state || !window.state.audio || !window.state.audio.enabled) return;
        if (type === 'pb') {
            window.state.audio.channelPb.set(chan, value);
            if (typeof window.updateChannelPitch === 'function') window.updateChannelPitch(chan);
        } else if (type === 'press') {
            window.state.audio.channelPress.set(chan, value);
            if (typeof window.updateChannelPress === 'function') window.updateChannelPress(chan);
        } else if (type === 'timbre') {
            window.state.audio.channelTimbre.set(chan, value);
            if (typeof window.updateChannelTimbre === 'function') window.updateChannelTimbre(chan);
        }
    }

    function sendNoteOn(note, velocity, chan, options = {}) {
        if (isInternalSynthSafeActive()) {
            const now = performance.now();
            const lastOn = lastNoteOnByChan.get(chan) || 0;
            const totalVoiceLoad = activeVoices.size + activeTubeVoices.size + waterGlideVoices.size;
            const minGapMs = clamp(14 + (totalVoiceLoad * 0.8), 14, 38);
            if ((now - lastOn) < minGapMs) return false;

            if ((now - synthSafeRuntime.winTs) > 16) {
                synthSafeRuntime.winTs = now;
                synthSafeRuntime.noteCount = 0;
            }
            const perFrameBudget = totalVoiceLoad > 16 ? 8 : 12;
            if (synthSafeRuntime.noteCount >= perFrameBudget) return false;
            synthSafeRuntime.noteCount += 1;
            lastNoteOnByChan.set(chan, now);
        }

        const internalActive = !!(window.state?.audio?.enabled && window.noteOnInternal);
        if (internalActive) {
            const attack = Number.isFinite(options.attack) ? options.attack : (currentMaterial.audio.attack || 0.01);
            const zoneId = options.zoneId || 'A';
            Promise.resolve(window.noteOnInternal(note, velocity, chan, attack, { zoneId })).catch(() => {});
        }
        const midiChan = clamp(chan - 1, 0, 15);
        const midiSent = sendMidiMessage(0x90 + midiChan, note, velocity);
        return internalActive || midiSent;
    }

    function sendNoteOff(note, chan) {
        if (window.state?.audio?.enabled && window.noteOffInternal) window.noteOffInternal(note, chan);
        const midiChan = clamp(chan - 1, 0, 15);
        sendMidiMessage(0x80 + midiChan, note, 0);
    }

    function pickChannel() {
        const start = channelCursor;
        for (let i = 0; i < 15; i += 1) {
            const chan = channelCursor;
            channelCursor += 1;
            if (channelCursor > 16) channelCursor = 2;
            if (!isChannelInUse(chan)) return chan;
        }
        // Fallback: se tutti i canali sono occupati, usa round-robin.
        channelCursor = start + 1;
        if (channelCursor > 16) channelCursor = 2;
        return start;
    }

    function isChannelInUse(chan, exclude = {}) {
        let used = false;
        activeVoices.forEach((v, bodyId) => {
            if (used) return;
            if (exclude.activeBodyId && bodyId === exclude.activeBodyId) return;
            if (v?.chan === chan) used = true;
        });
        if (used) return true;
        waterGlideVoices.forEach((g, bodyId) => {
            if (used) return;
            if (exclude.glideBodyId && bodyId === exclude.glideBodyId) return;
            if (g?.chan === chan) used = true;
        });
        if (used) return true;
        activeTubeVoices.forEach((v, tubeId) => {
            if (used) return;
            if (exclude.tubeId && tubeId === exclude.tubeId) return;
            if (v?.chan === chan) used = true;
        });
        return used;
    }

    function neutralizeChannel(chan) {
        // Ripristino espressivo canale per evitare "note fissate" su synth interno/MIDI.
        sendExpressiveMPE(chan, 8192, 64, 0, true);
    }

    function stopWaterGlideForBody(bodyOrId) {
        const bodyId = typeof bodyOrId === 'number' ? bodyOrId : bodyOrId?.id;
        if (!bodyId) return;
        const glide = waterGlideVoices.get(bodyId);
        if (!glide) return;
        sendNoteOff(glide.note, glide.chan);
        waterGlideVoices.delete(bodyId);
        if (!isChannelInUse(glide.chan, { glideBodyId: bodyId })) {
            neutralizeChannel(glide.chan);
        }
    }

    function stopAllWaterGlides() {
        waterGlideVoices.forEach((glide, bodyId) => {
            sendNoteOff(glide.note, glide.chan);
            waterGlideVoices.delete(bodyId);
            neutralizeChannel(glide.chan);
        });
    }

    function stopTubeVoice(tubeId) {
        stopTubeResonatorsForTube(tubeId, true);
        const v = activeTubeVoices.get(tubeId);
        if (!v) return;
        sendNoteOff(v.note, v.chan);
        activeTubeVoices.delete(tubeId);
        if (!isChannelInUse(v.chan, { tubeId })) neutralizeChannel(v.chan);
    }

    function stopAllTubeVoices() {
        stopAllTubeResonators(true);
        activeTubeVoices.forEach((v, tubeId) => {
            sendNoteOff(v.note, v.chan);
            activeTubeVoices.delete(tubeId);
            neutralizeChannel(v.chan);
        });
    }

    function getTubeResonatorKey(tubeId, kind = 'strike') {
        return `${tubeId}:${kind}`;
    }

    function stopTubeResonatorKey(key, immediate = false) {
        const voice = tubeResonators.get(key);
        if (!voice) return;
        const now = voice.ctx.currentTime;
        try {
            voice.master.gain.cancelScheduledValues(now);
            if (immediate) voice.master.gain.setValueAtTime(0, now);
            else voice.master.gain.setTargetAtTime(0, now, 0.08);
            if (Array.isArray(voice.partials)) {
                voice.partials.forEach((p) => {
                    try { p.gain.gain.cancelScheduledValues(now); } catch (_) {}
                    try { p.gain.gain.setTargetAtTime(0, now, 0.08); } catch (_) {}
                    try { p.osc.stop(now + (immediate ? 0.01 : 0.2)); } catch (_) {}
                });
            }
            if (voice.noiseSource) {
                try { voice.noiseGain.gain.setTargetAtTime(0, now, 0.05); } catch (_) {}
                try { voice.noiseSource.stop(now + (immediate ? 0.01 : 0.2)); } catch (_) {}
            }
        } catch (_) {}
        tubeResonators.delete(key);
    }

    function stopTubeResonatorsForTube(tubeId, immediate = false) {
        const prefix = `${tubeId}:`;
        Array.from(tubeResonators.keys()).forEach((key) => {
            if (key.startsWith(prefix)) stopTubeResonatorKey(key, immediate);
        });
    }

    function stopAllTubeResonators(immediate = false) {
        Array.from(tubeResonators.keys()).forEach((key) => stopTubeResonatorKey(key, immediate));
        tubeResonators.clear();
    }

    function getTubeHarmonicIndices(tube, partialCount) {
        const count = Math.max(4, partialCount || 10);
        const harmonics = [];
        if (tube?.endMode === 'closed') {
            for (let i = 0; i < count; i += 1) harmonics.push((i * 2) + 1);
        } else {
            for (let i = 1; i <= count; i += 1) harmonics.push(i);
        }
        return harmonics;
    }

    function createTubeResonator(tube, kind, options = {}) {
        if (!config?.tubes?.physicalModel) return null;
        const audio = window.state?.audio;
        if (!audio?.enabled || !audio.ctx) return null;
        if (!tube) return null;

        const key = getTubeResonatorKey(tube.id, kind);
        stopTubeResonatorKey(key, true);

        const mat = getTubeMaterialProfile(tube.material);
        const surf = getTubeSurfaceProfile(tube.surface);
        const mood = clamp(Number(config?.tubes?.mood) || 0.5, 0, 1);
        const partialCount = clamp(parseInt(config?.tubes?.partialCount, 10) || 10, 4, 16);
        const inharm = clamp(Number(config?.tubes?.inharmonicity) || 0.006, 0, 0.03);
        const physicalMix = clamp(Number(config?.tubes?.physicalMix) || 0.65, 0, 1);
        const baseNoteFloat = Number.isFinite(Number(options.noteFloat)) ? Number(options.noteFloat) : tubeBaseNote(tube, 'A');
        const baseHz = Math.max(20, noteFloatToHz(baseNoteFloat));

        const yExpress = getTubeYExpressShaped(tube);
        const yBright = clamp(0.6 + yExpress * 0.7, 0.6, 1.4);
        const brightness = clamp(mat.brightness * surf.brightnessMul * yBright, 0.2, 2);
        const slope = clamp(1.55 - brightness * 0.7, 0.6, 1.7);
        const B = inharm * (0.25 + mat.stiffness * 0.75);
        const lenNorm = clamp((tube.length - 80) / 400, 0, 1);
        const diaNorm = clamp((tube.diameter - 12) / 88, 0, 1);

        const ctx = audio.ctx;
        const master = ctx.createGain();
        master.gain.value = 1;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.Q.value = clamp(0.6 + brightness * 0.8, 0.5, 2.2);
        const cutoff = clamp(320 + baseHz * (2.4 + brightness * 2.6) + (mood * 2600) + (1 - lenNorm) * 600 + diaNorm * 220, 220, 12000);
        filter.frequency.value = cutoff;

        master.connect(filter);
        if (audio.dryGain) filter.connect(audio.dryGain);
        else filter.connect(ctx.destination);

        const harmonics = getTubeHarmonicIndices(tube, partialCount);
        const partials = [];
        harmonics.forEach((h) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            const stretch = 1 + (B * (h * h) * 0.002);
            osc.type = 'sine';
            osc.frequency.value = Math.max(20, baseHz * h * stretch);
            gain.gain.value = 0;
            osc.connect(gain);
            gain.connect(master);
            osc.start();
            const amp = (1 / Math.pow(h, slope)) * (0.92 - mat.damping * 0.35);
            partials.push({ osc, gain, h, amp });
        });

        let noiseSource = null;
        let noiseGain = null;
        let noiseFilter = null;
        if (options.addNoise) {
            ensureFrictionNoiseBuffer(ctx);
            if (frictionNoiseBuffer) {
                noiseSource = ctx.createBufferSource();
                noiseSource.buffer = frictionNoiseBuffer;
                noiseSource.loop = true;
                noiseGain = ctx.createGain();
                noiseGain.gain.value = 0;
                noiseFilter = ctx.createBiquadFilter();
                noiseFilter.type = 'bandpass';
                noiseFilter.frequency.value = clamp(500 + baseHz * 1.8, 400, 4200);
                noiseFilter.Q.value = clamp(0.7 + surf.noise * 0.9, 0.5, 2.4);
                noiseSource.connect(noiseFilter);
                noiseFilter.connect(noiseGain);
                noiseGain.connect(master);
                noiseSource.start();
            }
        }

        const energy = clamp(Number(options.energy) || 0.5, 0, 1.4);
        const decayScale = clamp(Number(options.decayScale) || 1, 0.35, 2.6);
        const level = clamp(energy * physicalMix * (0.6 + brightness * 0.6), 0, 1);
        const now = ctx.currentTime;
        const attack = Math.max(0.004, mat.attack * 0.9);
        const decayBase = clamp((0.28 + mat.release * 1.15) * (0.75 + mood * 0.6) * decayScale, 0.18, 3.2);

        if (kind !== 'wind') {
            partials.forEach((p) => {
                const decay = decayBase * (1 + p.h * 0.09 + mat.damping * 0.5);
                p.gain.gain.setValueAtTime(0, now);
                p.gain.gain.linearRampToValueAtTime(p.amp * level, now + attack);
                p.gain.gain.setTargetAtTime(0, now + attack, decay);
            });
            const stopAt = now + attack + (decayBase * 4.2);
            partials.forEach((p) => p.osc.stop(stopAt + 0.05));
            if (noiseSource) noiseSource.stop(stopAt + 0.05);
            setTimeout(() => stopTubeResonatorKey(key, true), Math.round((stopAt - now + 0.08) * 1000));
        }

        const voice = {
            key,
            tubeId: tube.id,
            kind,
            ctx,
            master,
            filter,
            partials,
            noiseSource,
            noiseGain,
            noiseFilter,
            baseHz,
            harmonics,
            mat,
            surf,
            mood,
            inharm,
            physicalMix,
            level
        };
        tubeResonators.set(key, voice);
        return voice;
    }

    function updateTubeResonatorPitch(voice, baseHz) {
        if (!voice || !baseHz) return;
        const B = voice.inharm * (0.25 + voice.mat.stiffness * 0.75);
        voice.baseHz = baseHz;
        voice.partials.forEach((p) => {
            const stretch = 1 + (B * (p.h * p.h) * 0.002);
            p.osc.frequency.setTargetAtTime(Math.max(20, baseHz * p.h * stretch), voice.ctx.currentTime, 0.04);
        });
        if (voice.noiseFilter) {
            voice.noiseFilter.frequency.setTargetAtTime(clamp(500 + baseHz * 1.8, 400, 4200), voice.ctx.currentTime, 0.08);
        }
    }

    function updateTubeResonatorWind(tube, params = {}) {
        if (!config?.tubes?.physicalModel) return;
        const strength = clamp(Number(params.strength) || 0, 0, 1.5);
        const noteFloat = Number.isFinite(Number(params.noteFloat)) ? Number(params.noteFloat) : tubeBaseNote(tube, 'A');
        const key = getTubeResonatorKey(tube.id, 'wind');
        let voice = tubeResonators.get(key);
        if (!voice) {
            voice = createTubeResonator(tube, 'wind', { noteFloat, energy: strength, addNoise: true });
            if (!voice) return;
        }

        const baseHz = Math.max(20, noteFloatToHz(noteFloat));
        if (Math.abs(baseHz - voice.baseHz) > 0.01) updateTubeResonatorPitch(voice, baseHz);

        const brightness = clamp(voice.mat.brightness * voice.surf.brightnessMul, 0.2, 1.6);
        const lenNorm = clamp((tube.length - 80) / 400, 0, 1);
        const diaNorm = clamp((tube.diameter - 12) / 88, 0, 1);
        const cutoff = clamp(360 + baseHz * (2.2 + brightness * 2.2) + (voice.mood * 2600) + (1 - lenNorm) * 520 + diaNorm * 220 + strength * 1200, 220, 12000);
        const level = clamp(strength * voice.physicalMix * 0.8, 0, 0.9);
        const now = voice.ctx.currentTime;
        voice.filter.frequency.setTargetAtTime(cutoff, now, 0.08);
        voice.partials.forEach((p) => {
            p.gain.gain.setTargetAtTime(p.amp * level, now, 0.08);
        });
        if (voice.noiseGain) {
            const noiseLevel = level * clamp(0.12 + voice.surf.noise * 0.6, 0.08, 0.85);
            voice.noiseGain.gain.setTargetAtTime(noiseLevel, now, 0.08);
        }
    }

    function triggerTubeCoupling(sourceTube, energy) {
        const coupling = clamp(Number(config?.tubes?.coupling) || 0, 0, 0.6);
        if (coupling <= 0) return;
        const maxDist = 260;
        tubes.forEach((t) => {
            if (t.id === sourceTube.id) return;
            const dx = (t.x || 0) - (sourceTube.x || 0);
            const dy = (t.y || 0) - (sourceTube.y || 0);
            const dist = Math.hypot(dx, dy);
            if (dist > maxDist) return;
            const amt = coupling * (1 - (dist / maxDist));
            if (amt <= 0.02) return;
            const noteFloat = tubeBaseNote(t, 'A');
            createTubeResonator(t, 'sympathy', { noteFloat, energy: energy * (0.45 + amt * 0.6), decayScale: 0.7 });
        });
    }

    function getZonePitchBendRange(zone = 'A') {
        const st = window.state || {};
        const zoneCfg = (st.scaleConfigByZone && st.scaleConfigByZone[zone]) || {};
        return clamp(parseInt(zoneCfg.pbRange, 10) || 48, 1, 96);
    }

    function sendExpressiveMPE(chan, pb, timbre, press, force = false) {
        const now = performance.now();
        const prev = mpeChannelState.get(chan) || { pb: 8192, timbre: 64, press: 0, ts: 0 };
        const dpb = Math.abs(pb - prev.pb);
        const dt = now - prev.ts;
        const dTim = Math.abs(timbre - prev.timbre);
        const dPr = Math.abs(press - prev.press);

        // Throttle robusto: riduce flood MIDI/UI updates senza perdere gestualita'.
        const shouldSend = force || dpb >= 48 || dTim >= 2 || dPr >= 2 || dt >= 70;
        if (!shouldSend) return;

        const midiChan = clamp(chan - 1, 0, 15);
        const pbClamped = clamp(Math.round(pb), 0, 16383);
        const timbreClamped = clamp(Math.round(timbre), 0, 127);
        const pressClamped = clamp(Math.round(press), 0, 127);
        sendMidiMessage(0xE0 + midiChan, pbClamped & 0x7F, (pbClamped >> 7) & 0x7F);
        sendMidiMessage(0xB0 + midiChan, 74, timbreClamped);
        sendMidiMessage(0xD0 + midiChan, pressClamped);
        updateInternalSynth(chan, 'pb', pbClamped);
        updateInternalSynth(chan, 'timbre', timbreClamped);
        updateInternalSynth(chan, 'press', pressClamped);
        mpeChannelState.set(chan, { pb: pbClamped, timbre: timbreClamped, press: pressClamped, ts: now });
    }

    function sendGlideMPE(chan, pb, timbre, press) {
        sendExpressiveMPE(chan, pb, timbre, press, false);
    }

    function startWaterGlide(body) {
        if (!isRunning || !body?.plugin?.audio) return;
        const matName = body.plugin.audio.material?.name;
        if (matName !== 'Water') return;
        if (body.plugin.audio.isWaterGlideSource) return;
        const glideLimit = Math.round(clamp((config.advanced.maxVoices || 24) / 3, 2, 8));
        if (waterGlideVoices.size >= glideLimit) return;

        const note = clamp(Math.round(body.plugin.audio.note ?? 60), 0, 127);
        const chan = pickChannel();
        const zone = body.plugin.audio.zone === 'B' ? 'B' : 'A';
        const spawnY = Number.isFinite(body.plugin.audio.spawnY) ? body.plugin.audio.spawnY : body.position.y;

        const ok = sendNoteOn(note, 52, chan);
        if (!ok) return;
        waterGlideVoices.set(body.id, {
            bodyId: body.id,
            body,
            note,
            chan,
            zone,
            spawnY,
            startedAt: performance.now()
        });
        body.plugin.audio.isWaterGlideSource = true;
    }

    function updateWaterGlideVoice(glide) {
        const body = glide.body;
        if (!body || !body.position || body.plugin?.specialConsumed) {
            stopWaterGlideForBody(glide.bodyId);
            return;
        }

        const span = Math.max(32, canvas.height - glide.spawnY);
        const progress = clamp((body.position.y - glide.spawnY) / span, 0, 1);
        const pbRange = getZonePitchBendRange(glide.zone);

        // Gliss discendente: da +5 semitoni verso -4 semitoni con leggera modulazione acquosa.
        const baseSemis = 5 - (progress * 9);
        const wobble = Math.sin((performance.now() - glide.startedAt) * 0.01) * 0.3;
        const semis = clamp(baseSemis + wobble, -6, 6);
        const pb = 8192 + (semis * (8192 / pbRange));

        const timbre = clamp(34 + (progress * 78), 0, 127);
        const press = clamp(30 + (progress * 42), 0, 127);
        sendGlideMPE(glide.chan, pb, timbre, press);
    }

    function enforceVoiceLimit() {
        const maxVoices = clamp(config.advanced.maxVoices, 4, 64);
        while (activeVoices.size >= maxVoices) {
            const oldest = activeVoices.values().next().value;
            if (!oldest) break;
            sendNoteOff(oldest.note, oldest.chan);
            activeVoices.delete(oldest.bodyId);
            if (!isChannelInUse(oldest.chan, { activeBodyId: oldest.bodyId })) {
                neutralizeChannel(oldest.chan);
            }
        }
    }

    function isEnvironmentBody(body) {
        return !!body && (body.isStatic || body.label === 'env');
    }

    function getDropProfile(body) {
        const spawnY = Number.isFinite(body?.plugin?.audio?.spawnY) ? body.plugin.audio.spawnY : body.position.y;
        const dropPx = Math.max(0, (body.position.y || 0) - spawnY);
        const dropNorm = clamp(dropPx / Math.max(1, canvas.height * 0.9), 0, 1.6);
        return { dropPx, dropNorm };
    }

    function getYExpressivityFromY(y) {
        const yNorm = clamp(y / canvas.height, 0, 1);
        return clamp(1 - yNorm, 0, 1);
    }

    function triggerShatterBurst(baseNote, force = 2, dropNorm = 0, yExpress = 0.5) {
        const offsets = [0, 7, 12, 3, -5, 10];
        const yBoost = 0.7 + (yExpress * 0.9);
        const intensity = clamp(((force * 0.65) + (dropNorm * 2.4)) * yBoost, 0.5, 7);
        const count = Math.max(3, Math.min(9, Math.round(2 + intensity * 1.2)));
        const yVel = Math.pow(clamp(yExpress, 0, 1), 0.85) * 127;
        const velBaseRaw = Math.round((78 + (force * 11) + (dropNorm * 26)) * 0.6 + yVel * 0.4);
        const velBase = clamp(velBaseRaw, 50, 127);
        for (let i = 0; i < count; i += 1) {
            const note = clamp(Math.round(baseNote + offsets[i % offsets.length]), 0, 127);
            const chan = pickChannel();
            const vel = clamp(velBase - (i * 6), 40, 127);
            const holdMs = 70 + (i * 18) + (dropNorm * 40) + Math.round(yExpress * 40);
            scheduleNoteOn(note, vel, chan, {
                quantize: false,
                onStart: () => {
                    setTimeout(() => sendNoteOff(note, chan), holdMs);
                }
            });
        }
    }

    function shatterGlass(body, force = 2, dropNorm = 0) {
        if (!body || !engine || !engine.world) return;
        const x = body.position.x;
        const y = body.position.y;
        const baseVX = body.velocity?.x || 0;
        const baseVY = body.velocity?.y || 0;
        const baseNote = clamp(Math.round(body.plugin?.audio?.note ?? 72), 0, 127);
        const yExpress = getYExpressivityFromY(y);

        triggerShatterBurst(baseNote, force, dropNorm, yExpress);
        Composite.remove(engine.world, body);

        const shardCount = Math.max(5, Math.min(24, Math.round(4 + (force * 2.1) + (dropNorm * 9))));
        for (let i = 0; i < shardCount; i += 1) {
            const r = 3 + Math.random() * (5 + dropNorm * 2.5);
            const shard = Bodies.polygon(
                x + ((Math.random() - 0.5) * 20),
                y + ((Math.random() - 0.5) * 16),
                3,
                r,
                {
                    restitution: 0.88,
                    friction: 0.02,
                    density: 0.0015,
                    frictionAir: 0.01,
                    render: { visible: true }
                }
            );
            shard.plugin = shard.plugin || {};
            shard.plugin.visual = { material: MATERIALS.GLASS };
            shard.plugin.life = { born: performance.now(), ttl: 1300 + (dropNorm * 900) };
            shard.plugin.trail = [];
            Body.setVelocity(shard, {
                x: baseVX + ((Math.random() - 0.5) * (10 + dropNorm * 12)),
                y: Math.max(-15, baseVY - (Math.random() * (7 + dropNorm * 8)))
            });
            Body.setAngularVelocity(shard, (Math.random() - 0.5) * (1.1 + dropNorm * 1.4));
            Composite.add(engine.world, shard);
            setTimeout(() => { if (engine?.world) Composite.remove(engine.world, shard); }, 1400 + (dropNorm * 900));
        }
    }

    function turnWaterIntoRiver(body, force = 1, dropNorm = 0) {
        if (!body || !engine || !engine.world) return;
        stopWaterGlideForBody(body);
        const x = body.position.x;
        const y = clamp(body.position.y, 0, canvas.height - 6);
        const yExpress = getYExpressivityFromY(y);
        const dir = body.velocity?.x === 0 ? (Math.random() > 0.5 ? 1 : -1) : Math.sign(body.velocity.x);
        const baseNote = clamp(Math.round(body.plugin?.audio?.note ?? 60), 0, 127);

        // Piccolo accento d'impatto acquoso.
        const splashCount = Math.max(1, Math.min(4, Math.round(1 + dropNorm * 2.5)));
        for (let s = 0; s < splashCount; s += 1) {
            const ch = pickChannel();
            const yVel = Math.pow(clamp(yExpress, 0, 1), 0.85) * 127;
            const velRaw = ((35 + (force * 10) + (dropNorm * 24) - (s * 8)) * 0.58) + (yVel * 0.42);
            const vel = clamp(Math.round(velRaw), 24, 112);
            const note = clamp(baseNote + (s * 2), 0, 127);
            const holdMs = 120 + (dropNorm * 70) + (s * 25) + Math.round(yExpress * 45);
            scheduleNoteOn(note, vel, ch, {
                quantize: false,
                onStart: () => {
                    setTimeout(() => sendNoteOff(note, ch), holdMs);
                }
            });
        }

        Composite.remove(engine.world, body);
        const drops = Math.max(8, Math.min(36, Math.round(7 + (force * 3.5) + (dropNorm * 16))));
        for (let i = 0; i < drops; i += 1) {
            const drop = Bodies.circle(
                x + ((Math.random() - 0.5) * (28 + dropNorm * 60)),
                y + ((Math.random() - 0.5) * (5 + dropNorm * 8)),
                2 + Math.random() * (2.8 + dropNorm * 2.2),
                {
                    restitution: 0.04,
                    friction: 0.08,
                    density: 0.0003,
                    frictionAir: 0.05,
                    label: 'river',
                    render: { visible: true }
                }
            );
            drop.plugin = drop.plugin || {};
            drop.plugin.visual = { material: MATERIALS.WATER };
            drop.plugin.life = { born: performance.now(), ttl: 1500 + (dropNorm * 1400) };
            drop.plugin.trail = [];
            Body.setVelocity(drop, {
                x: ((0.4 + Math.random() * (1.6 + dropNorm * 2.4)) * dir) + ((Math.random() - 0.5) * (0.6 + dropNorm)),
                y: -0.5 + (Math.random() * (0.8 + dropNorm * 1.8))
            });
            Composite.add(engine.world, drop);
            setTimeout(() => { if (engine?.world) Composite.remove(engine.world, drop); }, 1500 + (dropNorm * 1400));
        }
    }

    function handleMaterialSpecials(body, other, force) {
        const matName = body?.plugin?.audio?.material?.name;
        if (!matName || body?.plugin?.specialConsumed) return false;
        if (!isEnvironmentBody(other)) return false;
        const drop = getDropProfile(body);

        if (matName === 'Water') {
            const nearGround = body.position.y > (canvas.height * 0.68);
            if (nearGround && (force > 0.9 || drop.dropNorm > 0.18)) {
                body.plugin.specialConsumed = true;
                turnWaterIntoRiver(body, force, drop.dropNorm);
                return true;
            }
        }

        if (matName === 'Glass') {
            const fallFast = (body.velocity?.y || 0) > 4.8;
            if ((force > 2.1 || fallFast || drop.dropNorm > 0.26) && body.position.y > (canvas.height * 0.22)) {
                body.plugin.specialConsumed = true;
                shatterGlass(body, force, drop.dropNorm);
                return true;
            }
        }

        return false;
    }

    function handleRollingArp(body, other, force) {
        if (!config?.advanced?.rollingArp) return false;
        if (!body?.plugin?.audio) return false;
        if (!isEnvironmentBody(other)) return false;
        if (body.plugin.audio.shape !== 'polygon') return false;

        const lanesActive = clamp(parseInt(config?.advanced?.pitchLanes, 10) || 0, 0, 48) > 0;
        if (lanesActive) return false;

        const av = body.angularVelocity || 0;
        if (Math.abs(av) < (config.advanced.rollMinAngularVel || 0.06)) return false;
        if ((body.speed || 0) < (config.advanced.rollVelocityFloor || 0.02)) return false;

        const now = performance.now();
        const lastTs = body.plugin.audio.lastVertexHitTs || 0;
        if ((now - lastTs) < (config.advanced.rollDebounceMs || 90)) return false;

        const dir = Math.sign(av);
        if (!dir) return false;

        const zone = body.plugin.audio.zone === 'B' ? 'B' : 'A';
        const ctx = resolveScaleContext(zone);
        const scale = getScaleNotesInOctave(ctx);
        const scaleLen = scale.length || getScaleNotesSafe().length || 1;

        const nextIndex = Number.isFinite(Number(body.plugin.audio.scaleIndex))
            ? Number(body.plugin.audio.scaleIndex) + dir
            : dir;
        const wrappedIndex = ((nextIndex % scaleLen) + scaleLen) % scaleLen;

        body.plugin.audio.scaleIndex = wrappedIndex;
        body.plugin.audio.scaleLen = scaleLen;
        body.plugin.audio.lastVertexHitTs = now;
        body.plugin.audio.lastAngle = body.angle || 0;

        const note = getQuantizedNoteByIndex(wrappedIndex, ctx);
        triggerNote(body, force, { noteOverride: note });
        return true;
    }


    function handleCollisions(event) {
        const threshold = clamp(config.advanced.collisionThreshold, 0.3, 3);
        const safeMode = isInternalSynthSafeActive();
        const pairBudget = safeMode ? 28 : event.pairs.length;
        for (let i = 0; i < event.pairs.length && i < pairBudget; i += 1) {
            const pair = event.pairs[i];
            const bodyA = pair.bodyA;
            const bodyB = pair.bodyB;
            const normalVelocity = Vector.dot(Vector.sub(bodyB.velocity, bodyA.velocity), pair.collision.normal);
            const force = Math.abs(normalVelocity);
            if (force < threshold) continue;
            const consumedA = bodyA.plugin?.audio ? handleMaterialSpecials(bodyA, bodyB, force) : false;
            const consumedB = bodyB.plugin?.audio ? handleMaterialSpecials(bodyB, bodyA, force) : false;
            const rollA = (!consumedA && bodyA.plugin?.audio) ? handleRollingArp(bodyA, bodyB, force) : false;
            const rollB = (!consumedB && bodyB.plugin?.audio) ? handleRollingArp(bodyB, bodyA, force) : false;
            if (!consumedA && bodyA.plugin?.audio && !rollA) triggerNote(bodyA, force);
            if (!consumedB && bodyB.plugin?.audio && !rollB) triggerNote(bodyB, force);
        }
    }

    function getYExpressivity(body) {
        const yNorm = clamp(body.position.y / canvas.height, 0, 1);
        // Top -> 1 (più energia), bottom -> 0 (più morbido)
        return clamp(1 - yNorm, 0, 1);
    }

    function getMaterialWindFactor(body) {
        const mat = body?.plugin?.audio?.material?.name || '';
        if (mat === 'Water') return 2.2;
        if (mat === 'Felt') return 1.35;
        if (mat === 'Rubber') return 1.1;
        if (mat === 'Clay') return 0.9;
        if (mat === 'Glass') return 0.85;
        if (mat === 'Bamboo') return 1;
        if (mat === 'Steel') return 0.38;
        if (mat === 'Stone') return 0.28;
        return 1;
    }

    function applyWindToBodies() {
        const macroWind = clamp(config?.macro?.wind || 0, -1, 1);
        const chaos = clamp(config?.macro?.chaos || 0, 0, 1);
        windRuntime.phase += 0.02 + chaos * 0.02;

        if (Math.abs(macroWind) > 0.02 && Math.random() < (0.018 + chaos * 0.045)) {
            const dir = Math.sign(macroWind) || 1;
            const spread = (Math.random() * 2 - 1) * (0.18 + chaos * 0.55);
            windRuntime.gust = (Math.abs(macroWind) * (0.35 + chaos * 0.85) * dir) + spread;
        }
        windRuntime.gust *= 0.94;

        const ripple = Math.sin(windRuntime.phase) * 0.14 * (0.4 + chaos * 0.8);
        const totalWind = clamp(macroWind + windRuntime.gust + ripple, -1.35, 1.35);
        windRuntime.pulse = Math.abs(totalWind);

        if (!engine?.world) return;
        const bodies = Composite.allBodies(engine.world);
        bodies.forEach((body) => {
            if (body.isStatic || !body.position) return;
            const matFactor = getMaterialWindFactor(body);
            const windStrength = totalWind * matFactor;
            const accel = 0.00033 * windStrength;
            const fx = body.mass * accel;
            Body.applyForce(body, body.position, { x: fx, y: 0 });

            if (Math.abs(windStrength) > 0.06) {
                Body.setAngularVelocity(body, (body.angularVelocity || 0) + ((windStrength * 0.0025) * (0.7 + chaos)));
            }

            if (body.plugin?.audio) {
                body.plugin.audio.windEnergy = clamp(Math.abs(windStrength), 0, 1.4);
                body.plugin.audio.windDir = clamp(windStrength, -1.4, 1.4);
            }
        });
    }

    function updateTubeWindExcitation() {
        if (!tubes.size) return;
        if (config?.tubes?.mute) return;
        const macroWind = clamp(config?.macro?.wind || 0, -1, 1);
        tubes.forEach((tube) => {
            if (!tube.windPlay || !config?.tubes?.windPlay) {
                const tv = activeTubeVoices.get(tube.id);
                if (tv?.kind === 'wind') stopTubeVoice(tube.id);
                return;
            }
            const axisAlign = Math.cos(tube.angle);
            const windAlong = macroWind * axisAlign;
            const chaos = clamp(config?.macro?.chaos || 0, 0, 1);
            const turbulence = Math.abs(macroWind) * (0.08 + chaos * 0.14);
            const strength = clamp(Math.abs(windAlong) + turbulence, 0, 1.5);
            const windOnThreshold = 0.12;
            const tv = activeTubeVoices.get(tube.id);
            if (strength < windOnThreshold) {
                if (tv?.kind === 'wind') stopTubeVoice(tube.id);
                stopTubeResonatorKey(getTubeResonatorKey(tube.id, 'wind'), true);
                return;
            }

            const mat = getTubeMaterialProfile(tube.material);
            const surf = getTubeSurfaceProfile(tube.surface);
            const zone = 'A';
            const noteFloat = tubeBaseNote(tube, zone);
            const note = clamp(Math.round(noteFloat), 0, 127);
            const yExpress = getTubeYExpressShaped(tube);
            const yGain = clamp(0.25 + yExpress * 0.85, 0.25, 1.1);
            const yBright = clamp(0.6 + yExpress * 0.7, 0.6, 1.4);
            if (config?.tubes?.physicalModel) {
                updateTubeResonatorWind(tube, { noteFloat, strength: strength * yGain });
            }
            const crowd = tubeCrowdFactor();
            const lenNorm = clamp((tube.length - 80) / 400, 0, 1);
            const pbRange = getZonePitchBendRange(zone);
            const semis = clamp(windAlong * (1.2 + surf.noise * 0.5), -2.2, 2.2);
            const microOffset = (noteFloat - note) * (8192 / pbRange);
            const pb = clamp(Math.round(8192 + (semis * (8192 / pbRange)) + microOffset), 0, 16383);
            const timbre = clamp(Math.round((30 + mat.brightness * 70 + surf.noise * 30 + strength * 24 + crowd * 6 + (1 - lenNorm) * 8) * yBright), 0, 127);
            const press = clamp(Math.round((18 + strength * 70 + surf.frictionExcite * 8 + crowd * 8) * (1 - crowd * 0.18) * (0.35 + yExpress * 0.75)), 0, 127);
            const vel = clamp(Math.round((18 + strength * 40 + crowd * 4) * (1 - crowd * 0.15) * yGain), 10, 96);

            if (!tv || tv.kind !== 'wind') {
                stopTubeVoice(tube.id);
                stopOverLimitTubeVoices(1, tube.id);
                const ch = pickChannel();
                const ok = sendNoteOn(note, vel, ch, { attack: Math.max(0.003, mat.attack * 0.7), zoneId: zone });
                if (!ok) return;
                activeTubeVoices.set(tube.id, {
                    tubeId: tube.id,
                    note,
                    noteFloat,
                    chan: ch,
                    kind: 'wind',
                    tube,
                    birth: performance.now(),
                    holdMs: 999999,
                    smoothed: { pb, timbre, press },
                    materialRelease: Math.max(0.18, mat.release * 0.7)
                });
                sendExpressiveMPE(ch, pb, timbre, press, true);
            } else {
                if (note !== tv.note) {
                    sendNoteOff(tv.note, tv.chan);
                    const reOn = sendNoteOn(note, vel, tv.chan, { attack: Math.max(0.003, mat.attack * 0.62), zoneId: zone });
                    if (!reOn) {
                        stopTubeVoice(tube.id);
                        return;
                    }
                    tv.note = note;
                    tv.noteFloat = noteFloat;
                    tv.birth = performance.now();
                }
                sendExpressiveMPE(tv.chan, pb, timbre, press, false);
            }
        });
    }

    function ensureFrictionNoiseBuffer(ctx) {
        if (frictionNoiseBuffer || !ctx) return;
        const duration = 2;
        const buffer = ctx.createBuffer(1, ctx.sampleRate * duration, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        let b0 = 0;
        let b1 = 0;
        let b2 = 0;
        let b3 = 0;
        let b4 = 0;
        let b5 = 0;
        let b6 = 0;
        for (let i = 0; i < data.length; i += 1) {
            const white = Math.random() * 2 - 1;
            b0 = 0.99886 * b0 + white * 0.0555179;
            b1 = 0.99332 * b1 + white * 0.0750759;
            b2 = 0.96900 * b2 + white * 0.1538520;
            b3 = 0.86650 * b3 + white * 0.3104856;
            b4 = 0.55000 * b4 + white * 0.5329522;
            b5 = -0.7616 * b5 - white * 0.0168980;
            const pink = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
            b6 = white * 0.115926;
            data[i] = (pink * 0.18);
        }
        frictionNoiseBuffer = buffer;
    }

    function stopFrictionDrone(bodyId, immediate = false) {
        const voice = frictionDrones.get(bodyId);
        if (!voice) return;
        const now = voice.ctx.currentTime;
        try {
            voice.gain.gain.cancelScheduledValues(now);
            if (immediate) {
                voice.gain.gain.setValueAtTime(0, now);
            } else {
                voice.gain.gain.setTargetAtTime(0, now, 0.08);
            }
            if (voice.oscA) voice.oscA.stop(now + (immediate ? 0.01 : 0.2));
            if (voice.oscB) voice.oscB.stop(now + (immediate ? 0.01 : 0.2));
            if (voice.oscC) voice.oscC.stop(now + (immediate ? 0.01 : 0.2));
            if (voice.lfo) voice.lfo.stop(now + (immediate ? 0.01 : 0.2));
            if (voice.source) voice.source.stop(now + (immediate ? 0.01 : 0.2));
        } catch (_) {}
        frictionDrones.delete(bodyId);
    }


    function stopAllFrictionDrones(immediate = false) {
        Array.from(frictionDrones.keys()).forEach((id) => stopFrictionDrone(id, immediate));
        frictionDrones.clear();
    }

    function updateFrictionDrones() {
        if (!config?.advanced?.frictionDrone) {
            stopAllFrictionDrones(true);
            return;
        }
        const audio = window.state?.audio;
        if (!audio?.enabled || !audio?.ctx) {
            stopAllFrictionDrones(true);
            return;
        }

        const maxVoices = clamp(parseInt(config.advanced.droneMaxVoices, 10) || 12, 0, 32);
        if (maxVoices <= 0) {
            stopAllFrictionDrones(true);
            return;
        }
        const threshold = 0.06;
        const bodies = Composite.allBodies(engine.world)
            .filter((b) => !b.isStatic && b.plugin?.audio && b.render?.visible !== false);
        const candidates = [];
        bodies.forEach((b) => {
            const speed = b.speed || 0;
            const spin = Math.abs(b.angularVelocity || 0) * 2.5;
            const energy = speed + spin;
            if (energy >= threshold) candidates.push({ b, energy });
        });
        candidates.sort((a, b) => b.energy - a.energy);
        const selected = new Set(candidates.slice(0, maxVoices).map((c) => c.b.id));

        frictionDrones.forEach((_, id) => {
            if (!selected.has(id)) stopFrictionDrone(id, false);
        });

        candidates.slice(0, maxVoices).forEach(({ b, energy }) => {
            let voice = frictionDrones.get(b.id);
            if (!voice) {
                const oscA = audio.ctx.createOscillator();
                const oscB = audio.ctx.createOscillator();
                const oscC = audio.ctx.createOscillator();
                oscA.type = 'sine';
                oscB.type = 'triangle';
                oscC.type = 'triangle';

                const lfo = audio.ctx.createOscillator();
                const lfoGain = audio.ctx.createGain();
                lfo.type = 'sine';
                lfo.frequency.value = 0.6;
                lfoGain.gain.value = 6;
                lfo.connect(lfoGain);
                lfoGain.connect(oscA.detune);
                lfoGain.connect(oscB.detune);

                const gainA = audio.ctx.createGain();
                const gainB = audio.ctx.createGain();
                const gainC = audio.ctx.createGain();
                gainA.gain.value = 0.6;
                gainB.gain.value = 0.25;
                gainC.gain.value = 0.2;

                const filter = audio.ctx.createBiquadFilter();
                filter.type = 'lowpass';
                filter.Q.value = 0.7;

                const gain = audio.ctx.createGain();
                gain.gain.value = 0;

                oscA.connect(gainA);
                oscB.connect(gainB);
                oscC.connect(gainC);
                gainA.connect(filter);
                gainB.connect(filter);
                gainC.connect(filter);
                filter.connect(gain);
                if (audio.dryGain) gain.connect(audio.dryGain);
                else gain.connect(audio.ctx.destination);

                oscA.start();
                oscB.start();
                oscC.start();
                lfo.start();

                voice = { oscA, oscB, oscC, gainA, gainB, gainC, filter, gain, lfo, lfoGain, ctx: audio.ctx };
                frictionDrones.set(b.id, voice);
            }

            const xNorm = clamp((b.position?.x || 0) / canvas.width, 0, 1);
            const yNorm = clamp((b.position?.y || 0) / canvas.height, 0, 1);
            const yExpress = 1 - yNorm;

            const note = Number.isFinite(Number(b.plugin?.audio?.note)) ? Number(b.plugin.audio.note) : 60;
            const baseHz = 440 * Math.pow(2, (note - 69) / 12);
            const detuneCents = (xNorm - 0.5) * 40; // +/- 20 cents

            const zone = b.plugin?.audio?.zone === 'B' ? 'B' : 'A';
            const ctxScale = resolveScaleContext(zone);
            const scale = getScaleNotesInOctave(ctxScale);
            let thirdHz = baseHz * 1.25; // fallback minor third
            let fifthHz = baseHz * 1.5;
            if (scale.length) {
                let bestIdx = 0;
                let bestDist = Math.abs(scale[0] - note);
                for (let i = 1; i < scale.length; i += 1) {
                    const d = Math.abs(scale[i] - note);
                    if (d < bestDist) {
                        bestDist = d;
                        bestIdx = i;
                    }
                }
                const thirdIdx = (bestIdx + 2) % scale.length;
                const fifthIdx = (bestIdx + 4) % scale.length;
                const thirdMidi = scale[thirdIdx];
                const fifthMidi = scale[fifthIdx];
                thirdHz = 440 * Math.pow(2, (thirdMidi - 69) / 12);
                fifthHz = 440 * Math.pow(2, (fifthMidi - 69) / 12);
            }

            const level = clamp(Number(config.advanced.droneLevel ?? 0.6) || 0, 0, 1);
            const target = clamp(energy * 0.02 * level, 0, clamp(config.advanced.droneGainMax || 0.12, 0, 0.5));
            const mixB = clamp(0.15 + yExpress * 0.7, 0.1, 0.9);
            const mixC = clamp(0.1 + yExpress * 0.55, 0.1, 0.8);
            const cutoff = clamp(240 + (yExpress * 2200) + (energy * 220), 200, 5200);
            const q = clamp(0.6 + (yExpress * 0.9), 0.5, 1.6);
            const vibRate = clamp(0.35 + (xNorm * 2.2), 0.2, 3.2);
            const vibDepth = clamp(4 + (yExpress * 10), 2, 18);

            const now = audio.ctx.currentTime;
            voice.gain.gain.setTargetAtTime(target, now, 0.08);
            voice.gainA.gain.setTargetAtTime(1 - mixB, now, 0.08);
            voice.gainB.gain.setTargetAtTime(mixB, now, 0.08);
            if (voice.gainC) voice.gainC.gain.setTargetAtTime(mixC, now, 0.08);
            voice.filter.frequency.setTargetAtTime(cutoff, now, 0.08);
            voice.filter.Q.setTargetAtTime(q, now, 0.08);
            voice.oscA.frequency.setTargetAtTime(baseHz, now, 0.08);
            voice.oscB.frequency.setTargetAtTime(thirdHz, now, 0.08);
            if (voice.oscC) voice.oscC.frequency.setTargetAtTime(fifthHz, now, 0.08);
            voice.oscA.detune.setTargetAtTime(detuneCents, now, 0.08);
            voice.oscB.detune.setTargetAtTime(-detuneCents, now, 0.08);
            if (voice.oscC) voice.oscC.detune.setTargetAtTime(detuneCents * 0.5, now, 0.08);
            if (voice.lfo) voice.lfo.frequency.setTargetAtTime(vibRate, now, 0.08);
            if (voice.lfoGain) voice.lfoGain.gain.setTargetAtTime(vibDepth, now, 0.08);
        });
    }


    function triggerNote(body, force, options = {}) {
        const now = performance.now();
        const last = lastTriggerByBody.get(body.id) || 0;
        const antiBounceMs = isInternalSynthSafeActive() ? 120 : 85;
        if ((now - last) < antiBounceMs) return;
        lastTriggerByBody.set(body.id, now);

        // Evita voci orfane: se lo stesso body ritriggera, chiude prima la voce precedente.
        if (activeVoices.has(body.id)) {
            releaseVoiceForBodyId(body.id);
        }

        const data = body.plugin.audio;
        data.lastCollisionEnergy = Math.max(data.lastCollisionEnergy || 0, force * 24);

        const yExpress = getYExpressivity(body);
        const impactScaled = force * (0.8 + config.macro.energy * 1.6);
        const impactVel = Math.pow(impactScaled, 1.1) * 6.6;
        // Distribuzione sulla Y: aumenta la dinamica verticale (piu' variabilita').
        const yVel = Math.pow(yExpress, 0.6) * 127;
        const rawVel = Math.floor((impactVel * 0.48) + (yVel * 0.52));
        const vel = clamp(rawVel, 8, 127);

        enforceVoiceLimit();
        const chan = pickChannel();

        const holdMin = config.advanced.noteHoldMsMin;
        const holdMax = config.advanced.noteHoldMsMax;
        const safeHoldScale = isInternalSynthSafeActive() ? 0.82 : 1;
        const holdMs = Math.round(clamp(holdMin + (impactScaled * 55 * safeHoldScale), holdMin, holdMax));

        const noteOverride = Number.isFinite(Number(options.noteOverride)) ? Number(options.noteOverride) : null;
        const liveNoteFloat = noteOverride != null ? clamp(Number(noteOverride), 0, 127) : resolveBodyTriggerNote(body);
        const liveNote = clamp(Math.round(liveNoteFloat), 0, 127);
        data.noteFloat = liveNoteFloat;
        data.note = liveNote;

        if (config?.advanced?.anchorNotes) {
            data.anchorNote = liveNoteFloat;
            data.anchorMatKey = materialKeyFromProfile(data.material || currentMaterial);
        } else {
            data.anchorNote = null;
            data.anchorMatKey = null;
        }

        if (!Number.isFinite(Number(data.scaleIndex)) || !Number.isFinite(Number(data.scaleLen))) {
            const ctx = resolveScaleContext(data.zone === 'B' ? 'B' : 'A');
            const scale = getScaleNotesInOctave(ctx);
            data.scaleLen = scale.length;
            if (scale.length) {
                let bestIdx = 0;
                let bestDist = Math.abs(scale[0] - liveNoteFloat);
                for (let i = 1; i < scale.length; i += 1) {
                    const d = Math.abs(scale[i] - liveNoteFloat);
                    if (d < bestDist) {
                        bestDist = d;
                        bestIdx = i;
                    }
                }
                data.scaleIndex = bestIdx;
            }
        }

        const onStart = () => {
            if (typeof window.onPlaygroundNote === 'function') {
                window.onPlaygroundNote({
                    note: liveNote,
                    velocity: vel,
                    durationMs: holdMs,
                    timeMs: performance.now(),
                    zone: data.zone || 'A',
                    snapshot: (() => {
                        const mat = data.material?.visual || currentMaterial?.visual || { color: '#445', shadow: '#111', glow: 0 };
                        return {
                            x: body.position.x,
                            y: body.position.y,
                            angle: body.angle || 0,
                            circleRadius: body.circleRadius || 0,
                            vertices: body.vertices ? body.vertices.map(v => ({ x: v.x, y: v.y })) : null,
                            color: mat.color,
                            shadow: mat.shadow,
                            glow: mat.glow
                        };
                    })()
                });
            }
            calculateAndSendMPE(body, chan, vel, true);
            if (config?.advanced?.noteFlash !== false) {
                body.render.flash = vel / 127;
                const a = body.plugin?.audio;
                if (a) {
                    a.noteFlashTs = performance.now();
                    if (Number.isFinite(Number(a.scaleIndex))) {
                        a.noteFlashColor = getScaleDegreeColor(a.scaleIndex, a.scaleLen || 0);
                    } else {
                        a.noteFlashColor = '#ffffff';
                    }
                }
            }
            activeVoices.set(body.id, {
                bodyId: body.id,
                note: liveNote,
                chan,
                body,
                birth: performance.now(),
                holdMs,
                smoothed: {
                    pb: 8192,
                    timbre: 64,
                    press: vel
                }
            });
        };

        if (!scheduleNoteOn(liveNote, vel, chan, { body, zoneId: data.zone || 'A', onStart, quantize: options.quantize })) return;

    }

    function smoothingAlpha() {
        const baseMs = clamp(config.advanced.mpeSmoothingMs, 0, 240);
        if (baseMs <= 0) return 1;
        let smoothMs = baseMs;
        if (config?.advanced?.adaptiveMpe !== false) {
            const energy = clamp(config?.macro?.energy ?? 0.6, 0, 1);
            const chaos = clamp(config?.macro?.chaos ?? 0.4, 0, 1);
            const mul = 0.65 + (energy * 0.7) + (chaos * 0.35);
            smoothMs = clamp(baseMs * mul, 0, 320);
        }
        return clamp(16 / smoothMs, 0.03, 1);
    }

    function handleModulations() {
        const now = performance.now();
        const alpha = smoothingAlpha();
        applyWindToBodies();
        updateTubeWindExcitation();
        updateFrictionDrones();
        trimDynamicBodiesIfNeeded(0);

        waterGlideVoices.forEach((glide) => {
            updateWaterGlideVoice(glide);
        });

        activeTubeVoices.forEach((voice, tubeId) => {
            const tube = tubes.get(tubeId);
            if (!tube) {
                stopTubeVoice(tubeId);
                return;
            }
            if (voice.kind !== 'wind' && (now - voice.birth) > voice.holdMs) {
                stopTubeVoice(tubeId);
                return;
            }
            if (voice.kind === 'wind') return;

            const mat = getTubeMaterialProfile(tube.material);
            const surf = getTubeSurfaceProfile(tube.surface);
            const drift = Math.sin(now * 0.004 + tube.length * 0.01) * (0.35 + surf.noise * 0.25);
            const pbRange = getZonePitchBendRange('A');
            const desiredNoteFloat = tubeBaseNote(tube, 'A');
            const prevFloat = Number.isFinite(Number(voice.noteFloat)) ? Number(voice.noteFloat) : desiredNoteFloat;
            const glideAlpha = clamp(0.08 + (alpha * 0.6), 0.06, 0.32);
            const noteFloat = prevFloat + ((desiredNoteFloat - prevFloat) * glideAlpha);
            voice.noteFloat = noteFloat;
            const microOffset = (noteFloat - voice.note) * (8192 / pbRange);
            const pb = clamp(Math.round(8192 + (drift * (8192 / pbRange)) + microOffset), 0, 16383);
            const timbre = clamp(Math.round(20 + mat.brightness * 70 + surf.noise * 25), 0, 127);
            const lifeNorm = clamp((now - voice.birth) / Math.max(1, voice.holdMs), 0, 1);
            const press = clamp(Math.round((1 - lifeNorm) * 70 + 14 + surf.frictionExcite * 6), 0, 127);
            sendExpressiveMPE(voice.chan, pb, timbre, press, false);
        });

        activeVoices.forEach((voice, bodyId) => {
            if (!voice.body || !voice.body.position) {
                sendNoteOff(voice.note, voice.chan);
                activeVoices.delete(bodyId);
                if (!isChannelInUse(voice.chan, { activeBodyId: bodyId })) neutralizeChannel(voice.chan);
                return;
            }

            if ((now - voice.birth) > voice.holdMs) {
                sendNoteOff(voice.note, voice.chan);
                activeVoices.delete(bodyId);
                if (!isChannelInUse(voice.chan, { activeBodyId: bodyId })) neutralizeChannel(voice.chan);
                return;
            }

            calculateAndSendMPE(voice.body, voice.chan, 0, false, voice.smoothed, alpha);

            const e = voice.body.plugin?.audio;
            if (e) e.lastCollisionEnergy = (e.lastCollisionEnergy || 0) * 0.9;
        });

        stats.activeVoices = activeVoices.size + activeTubeVoices.size + waterGlideVoices.size;
    }

    function calculateAndSendMPE(body, chan, impactVel, isInitial, smoothed = null, alpha = 1) {
        const midiChan = clamp(chan - 1, 0, 15);

        const xNorm = clamp(body.position.x / canvas.width, 0, 1);
        const lanesActive = clamp(parseInt(config?.advanced?.pitchLanes, 10) || 0, 0, 48) > 0;
        let pbRaw = lanesActive ? 8192 : Math.floor(xNorm * 16383);

        const yNorm = clamp(body.position.y / canvas.height, 0, 1);
        const yExpress = 1 - yNorm;
        const speed = body.speed || 0;
        const curve = clamp(Math.abs((body.velocity?.x || 0) * 14), 0, 30);
        const windEnergy = clamp(body.plugin?.audio?.windEnergy || 0, 0, 1.5);
        const windDir = clamp(body.plugin?.audio?.windDir || 0, -1.5, 1.5);
        let timbreRaw = clamp(Math.floor((1 - yNorm) * 110 + curve + (windEnergy * 18)), 0, 127);
        if (isInitial) {
            const impactGain = clamp(Number(config?.advanced?.impactToTimbre ?? 0.35) || 0, 0, 1);
            const impactBoost = clamp(impactVel * impactGain * 4.2, 0, 30);
            timbreRaw = clamp(timbreRaw + impactBoost, 0, 127);
        }

        const spinEnergy = Math.abs(body.angularVelocity || 0) * 600;
        const speedEnergy = speed * 52;
        const collisionEnergy = body.plugin?.audio?.lastCollisionEnergy || 0;

        let pressRaw;
        if (isInitial) {
            // Press iniziale: combina impatto + posizione Y, per usare tutto lo spazio verticale.
            const yPress = Math.pow(yExpress, 0.7) * 127;
            pressRaw = clamp(Math.round((impactVel * 0.45) + (yPress * 0.55) + (windEnergy * 10)), 0, 127);
        } else {
            const kinetic = speedEnergy + spinEnergy + (collisionEnergy * 0.35);
            const yPressSustain = Math.pow(yExpress, 0.7) * 110;
            // Sustain: energia cinetica + bias verticale persistente (piu' variabilita' Y).
            pressRaw = clamp(Math.floor((kinetic * 0.55) + (yPressSustain * 0.45) + (windEnergy * 9)), 0, 127);
            if (speed > 0.03 && pressRaw < 8) pressRaw = 8;
        }

        const baseNote = clamp(Math.round(body.plugin?.audio?.note ?? 60), 0, 127);
        const noteFloat = Number.isFinite(Number(body.plugin?.audio?.noteFloat)) ? Number(body.plugin.audio.noteFloat) : baseNote;
        const zone = body.plugin?.audio?.zone === 'B' ? 'B' : 'A';
        const st = window.state || {};
        const zoneCfg = (st.scaleConfigByZone && st.scaleConfigByZone[zone]) || {};
        const pbRange = clamp(parseInt(zoneCfg.pbRange, 10) || 48, 1, 96);
        if (!lanesActive && config.advanced.pitchQuantize !== false) {
            const zoneScale = (st.scaleNotesByZone && st.scaleNotesByZone[zone]) || st.scaleNotes || {};
            const scaleNotes = Array.isArray(zoneScale.notes) ? zoneScale.notes : [];

            // Escursione locale piccola per restare armonico.
            const localRangeSemis = 2;
            const desiredSemis = (xNorm - 0.5) * localRangeSemis * 2;
            const desiredNote = noteFloat + desiredSemis;

            let snappedNote = desiredNote;
            if (scaleNotes.length) {
                let best = scaleNotes[0];
                let bestDist = Math.abs(best - desiredNote);
                for (let i = 1; i < scaleNotes.length; i += 1) {
                    const n = scaleNotes[i];
                    if (Math.abs(n - baseNote) > localRangeSemis + 0.25) continue;
                    const d = Math.abs(n - desiredNote);
                    if (d < bestDist) {
                        bestDist = d;
                        best = n;
                    }
                }
                snappedNote = best;
            }
            const snappedSemis = clamp(snappedNote - baseNote, -localRangeSemis, localRangeSemis);
            pbRaw = clamp(Math.round(8192 + (snappedSemis * (8192 / pbRange))), 0, 16383);
        } else if (!lanesActive) {
            // In free mode, il vento introduce una micro-deriva di pitch (espressiva ma contenuta).
            const microOffset = (noteFloat - baseNote) * (8192 / pbRange);
            pbRaw = clamp(Math.round(pbRaw + microOffset + (windDir * 260)), 0, 16383);
        } else {
            const microOffset = (noteFloat - baseNote) * (8192 / pbRange);
            pbRaw = clamp(Math.round(8192 + microOffset), 0, 16383);
        }

        if (smoothed) {
            smoothed.pb += (pbRaw - smoothed.pb) * alpha;
            smoothed.timbre += (timbreRaw - smoothed.timbre) * alpha;
            smoothed.press += (pressRaw - smoothed.press) * alpha;
        }

        const pb = smoothed ? Math.round(smoothed.pb) : pbRaw;
        const timbre = smoothed ? Math.round(smoothed.timbre) : timbreRaw;
        const press = smoothed ? Math.round(smoothed.press) : pressRaw;

        sendExpressiveMPE(chan, pb, timbre, press, !!isInitial);
    }

    function morph(materialKey) {
        if (!MATERIALS[materialKey]) return;
        currentMaterial = MATERIALS[materialKey];

        if (window.state && window.state.audio && window.state.audio.fx) {
            const t = currentMaterial.audio;
            const fx = window.state.audio.fx;
            fx.attack = t.attack;
            fx.release = t.release;
            if (window.applyFxToUI) window.applyFxToUI();
            if (window.updateFxNodes) window.updateFxNodes();
        }
    }


    function addWallSegment(p1, p2, options = {}) {
        if (!engine?.world) return null;
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const len = Math.hypot(dx, dy);
        if (len < 6) return null;
        const thickness = clamp(Number(options.thickness) || 10, 4, 40);
        const angle = Math.atan2(dy, dx);
        const mx = (p1.x + p2.x) * 0.5;
        const my = (p1.y + p2.y) * 0.5;
        const body = Bodies.rectangle(mx, my, len, thickness, {
            isStatic: true,
            label: 'wall',
            friction: 0.6,
            restitution: 0.45,
            render: { visible: false }
        });
        Body.setAngle(body, angle);
        body.plugin = body.plugin || {};
        body.plugin.wall = { x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y, thickness };
        Composite.add(engine.world, body);
        customWalls.push(body);
        return body;
    }

    function clearCustomWalls() {
        if (!engine?.world || !customWalls.length) return;
        customWalls.forEach((body) => {
            Composite.remove(engine.world, body);
        });
        customWalls.length = 0;
    }

    function drawCustomWalls() {
        if (!customWalls.length) return;
        ctx.save();
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        customWalls.forEach((body) => {
            const w = body.plugin?.wall;
            if (!w) return;
            ctx.strokeStyle = 'rgba(200, 220, 255, 0.45)';
            ctx.lineWidth = Math.max(2, w.thickness || 10);
            ctx.beginPath();
            ctx.moveTo(w.x1, w.y1);
            ctx.lineTo(w.x2, w.y2);
            ctx.stroke();
        });
        ctx.restore();
    }

    function drawTubes() {
        if (!tubes.size) return;
        if (config?.tubes?.mute) return;
        const macroWind = clamp(config?.macro?.wind || 0, -1, 1);
        const now = performance.now();
        tubes.forEach((tube) => {
            const ep = getTubeEndpoints(tube);
            const mat = getTubeMaterialProfile(tube.material);
            const surf = getTubeSurfaceProfile(tube.surface);
            const selected = selectedTubeId === tube.id;
            const thick = clamp(tube.diameter * 0.34, 8, 36);
            const windSigned = macroWind * Math.cos(tube.angle);
            const targetWindVisual = (tube.windPlay && config?.tubes?.windPlay) ? Math.abs(windSigned) : Math.abs(windSigned) * 0.45;
            tube.windVisual = clamp((tube.windVisual || 0) * 0.82 + targetWindVisual * 0.18, 0, 1.4);
            const windVisual = tube.windVisual;
            const noteFloatVis = (activeTubeVoices.get(tube.id)?.noteFloat) || tubeBaseNote(tube, 'A');
            const hue = Math.round((noteFloatVis * 7) % 360);

            const flowGrad = ctx.createLinearGradient(ep.x1, ep.y1, ep.x2, ep.y2);
            const baseShade = `rgba(18,22,30,${(0.3 + surf.noise * 0.1).toFixed(3)})`;
            const glowA = `hsla(${hue}, 80%, 75%, ${(0.22 + windVisual * 0.35).toFixed(3)})`;
            const glowB = `hsla(${hue}, 90%, 68%, ${(0.18 + windVisual * 0.45).toFixed(3)})`;
            if (windSigned >= 0) {
                flowGrad.addColorStop(0, baseShade);
                flowGrad.addColorStop(0.35, glowA);
                flowGrad.addColorStop(0.7, glowB);
                flowGrad.addColorStop(1, mat.visual);
            } else {
                flowGrad.addColorStop(0, mat.visual);
                flowGrad.addColorStop(0.3, glowB);
                flowGrad.addColorStop(0.65, glowA);
                flowGrad.addColorStop(1, baseShade);
            }

            const outer = thick + Math.max(2, thick * 0.2);
            const inner = Math.max(2.2, thick * 0.36);

            ctx.beginPath();
            ctx.moveTo(ep.x1, ep.y1);
            ctx.lineTo(ep.x2, ep.y2);
            ctx.strokeStyle = 'rgba(8,12,18,0.75)';
            ctx.lineWidth = outer;
            ctx.lineCap = 'round';
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(ep.x1, ep.y1);
            ctx.lineTo(ep.x2, ep.y2);
            ctx.strokeStyle = mat.visual;
            ctx.lineWidth = thick;
            ctx.lineCap = 'round';
            ctx.shadowBlur = (selected ? 18 : 10) + windVisual * 20;
            ctx.shadowColor = selected
                ? `rgba(255,255,255,${(0.62 + windVisual * 0.25).toFixed(3)})`
                : `rgba(140,180,220,${(0.28 + windVisual * 0.35).toFixed(3)})`;
            ctx.stroke();
            ctx.shadowBlur = 0;

            ctx.beginPath();
            ctx.moveTo(ep.x1, ep.y1);
            ctx.lineTo(ep.x2, ep.y2);
            ctx.strokeStyle = flowGrad;
            ctx.lineWidth = inner;
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(ep.x1, ep.y1);
            ctx.lineTo(ep.x2, ep.y2);
            ctx.strokeStyle = `rgba(255,255,255,${(0.08 + windVisual * 0.18).toFixed(3)})`;
            ctx.lineWidth = Math.max(1, thick * 0.12);
            ctx.stroke();

            // Hollow core highlight
            ctx.beginPath();
            ctx.moveTo(ep.x1, ep.y1);
            ctx.lineTo(ep.x2, ep.y2);
            ctx.strokeStyle = `rgba(14,18,26,${(0.22 + windVisual * 0.12).toFixed(3)})`;
            ctx.lineWidth = Math.max(1.6, thick * 0.42);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(ep.x1, ep.y1);
            ctx.lineTo(ep.x2, ep.y2);
            ctx.strokeStyle = `rgba(210,235,255,${(0.14 + windVisual * 0.18).toFixed(3)})`;
            ctx.lineWidth = Math.max(1.2, thick * 0.2);
            ctx.stroke();

            if (tube.surface === 'corrugated') {
                const steps = Math.max(8, Math.floor(tube.length / 18));
                const nx = -Math.sin(tube.angle);
                const ny = Math.cos(tube.angle);
                for (let i = 1; i < steps; i += 1) {
                    const t = i / steps;
                    const x = ep.x1 + (ep.x2 - ep.x1) * t;
                    const y = ep.y1 + (ep.y2 - ep.y1) * t;
                    const s = Math.max(2.5, thick * 0.3);
                    ctx.beginPath();
                    ctx.moveTo(x - nx * s, y - ny * s);
                    ctx.lineTo(x + nx * s, y + ny * s);
                    ctx.strokeStyle = `rgba(255,255,255,${(0.18 + windVisual * 0.28).toFixed(3)})`;
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }
            }

            if (windVisual > 0.06) {
                const dots = Math.max(3, Math.min(12, Math.floor(tube.length / 42)));
                const dir = windSigned >= 0 ? 1 : -1;
                const phase = ((now * 0.0014 * dir) % 1 + 1) % 1;
                for (let i = 0; i < dots; i += 1) {
                    const t = (i / dots + phase) % 1;
                    const x = ep.x1 + (ep.x2 - ep.x1) * t;
                    const y = ep.y1 + (ep.y2 - ep.y1) * t;
                    ctx.beginPath();
                    ctx.arc(x, y, Math.max(1.2, thick * 0.12), 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(190,235,255,${(0.14 + windVisual * 0.32).toFixed(3)})`;
                    ctx.fill();
                }
            }


            const pulseAt = tube.pulseAt || 0;
            if (pulseAt > 0) {
                const age = now - pulseAt;
                const ttl = 520;
                if (age < ttl) {
                    const t = age / ttl;
                    const alpha = (1 - t) * 0.5;
                    const radius = (thick * 0.7) + (t * thick * 2.2);
                    const midX = (ep.x1 + ep.x2) * 0.5;
                    const midY = (ep.y1 + ep.y2) * 0.5;
                    ctx.save();
                    ctx.globalAlpha = alpha;
                    ctx.strokeStyle = 'rgba(180, 230, 255, 0.9)';
                    ctx.lineWidth = 1.4;
                    ctx.beginPath();
                    ctx.ellipse(midX, midY, radius * 1.6, radius * 0.8, tube.angle, 0, Math.PI * 2);
                    ctx.stroke();
                    ctx.restore();
                } else {
                    tube.pulseAt = 0;
                }
            }

            const showLabel = selected || (tubeTouchUi.visible && tubeTouchUi.tubeId === tube.id);
            if (showLabel) {
                const noteFloat = (activeTubeVoices.get(tube.id)?.noteFloat) || tubeBaseNote(tube, 'A');
                const midiRounded = Math.round(noteFloat);
                const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
                const name = noteNames[((midiRounded % 12) + 12) % 12] || 'C';
                const cents = Math.round((noteFloat - midiRounded) * 100);
                const label = Math.abs(cents) >= 1 ? `${name}${cents >= 0 ? '+' : ''}${cents}c` : name;
                ctx.save();
                ctx.font = '12px system-ui, sans-serif';
                ctx.fillStyle = 'rgba(235,245,255,0.9)';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'bottom';
                ctx.fillText(label, tube.x, tube.y - (thick * 1.2));
                ctx.restore();
            }
            const capR = Math.max(3.5, thick * 0.58);
            ctx.beginPath();
            ctx.arc(ep.x1, ep.y1, capR, 0, Math.PI * 2);
            ctx.arc(ep.x2, ep.y2, capR, 0, Math.PI * 2);
            ctx.fillStyle = tube.endMode === 'closed' ? 'rgba(255,188,88,0.65)' : 'rgba(170,220,255,0.62)';
            ctx.fill();

            if (selected) {
                const centerR = Math.max(6, thick * 0.58);
                ctx.beginPath();
                ctx.arc(tube.x, tube.y, centerR, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(255,255,255,0.86)';
                ctx.fill();

                const handleR = Math.max(7, thick * 0.52);
                ctx.beginPath();
                ctx.arc(ep.x1, ep.y1, handleR, 0, Math.PI * 2);
                ctx.arc(ep.x2, ep.y2, handleR, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(170, 218, 255, 0.68)';
                ctx.fill();
                ctx.strokeStyle = 'rgba(255,255,255,0.72)';
                ctx.lineWidth = 1.2;
                ctx.stroke();

                if (tubeTouchUi.visible && tubeTouchUi.tubeId === tube.id) {
                    const gizmo = getTubeGizmoButtons(tube);
                    if (gizmo) {
                        ctx.beginPath();
                        ctx.moveTo(tube.x, tube.y);
                        ctx.lineTo(gizmo.move.x, gizmo.move.y);
                        ctx.moveTo(tube.x, tube.y);
                        ctx.lineTo(gizmo.rotate.x, gizmo.rotate.y);
                        ctx.strokeStyle = 'rgba(180, 225, 255, 0.34)';
                        ctx.lineWidth = 1;
                        ctx.stroke();

                        ctx.beginPath();
                        ctx.arc(gizmo.move.x, gizmo.move.y, gizmo.move.r, 0, Math.PI * 2);
                        ctx.fillStyle = 'rgba(22, 40, 56, 0.9)';
                        ctx.fill();
                        ctx.strokeStyle = 'rgba(160, 230, 255, 0.82)';
                        ctx.lineWidth = 1.2;
                        ctx.stroke();
                        ctx.beginPath();
                        ctx.moveTo(gizmo.move.x - 4, gizmo.move.y);
                        ctx.lineTo(gizmo.move.x + 4, gizmo.move.y);
                        ctx.moveTo(gizmo.move.x, gizmo.move.y - 4);
                        ctx.lineTo(gizmo.move.x, gizmo.move.y + 4);
                        ctx.strokeStyle = 'rgba(220,245,255,0.95)';
                        ctx.lineWidth = 1.5;
                        ctx.stroke();

                        ctx.beginPath();
                        ctx.arc(gizmo.rotate.x, gizmo.rotate.y, gizmo.rotate.r, 0, Math.PI * 2);
                        ctx.fillStyle = 'rgba(22, 40, 56, 0.9)';
                        ctx.fill();
                        ctx.strokeStyle = 'rgba(160, 230, 255, 0.82)';
                        ctx.lineWidth = 1.2;
                        ctx.stroke();
                        ctx.beginPath();
                        ctx.arc(gizmo.rotate.x, gizmo.rotate.y, Math.max(4, gizmo.rotate.r * 0.4), Math.PI * 0.15, Math.PI * 1.62);
                        ctx.strokeStyle = 'rgba(220,245,255,0.95)';
                        ctx.lineWidth = 1.4;
                        ctx.stroke();
                        ctx.beginPath();
                        ctx.moveTo(gizmo.rotate.x + 4, gizmo.rotate.y - 4);
                        ctx.lineTo(gizmo.rotate.x + 6, gizmo.rotate.y - 1);
                        ctx.lineTo(gizmo.rotate.x + 2, gizmo.rotate.y - 1);
                        ctx.closePath();
                        ctx.fillStyle = 'rgba(220,245,255,0.95)';
                        ctx.fill();
                    }
                }
            }
        });
    }


    function drawPitchLanesOverlay() {
        if (isTubeMode()) return;
        const lanes = clamp(parseInt(config?.advanced?.pitchLanes, 10) || 0, 0, 48);
        if (!lanes) return;
        const w = canvas.width;
        const h = canvas.height;
        const colW = w / lanes;

        ctx.save();
        ctx.lineWidth = 1;
        ctx.strokeStyle = 'rgba(140, 190, 235, 0.16)';
        ctx.fillStyle = 'rgba(120, 160, 210, 0.045)';
        for (let i = 0; i < lanes; i += 1) {
            const x = i * colW;
            if (i % 2 === 0) {
                ctx.fillRect(x, 0, colW, h);
            }
            if (i > 0) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, h);
                ctx.stroke();
            }
        }

        const ctxScale = resolveScaleContext();
        const scale = getScaleNotesInOctave(ctxScale);
        const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

        ctx.fillStyle = 'rgba(200, 220, 245, 0.7)';
        ctx.font = '10px system-ui, sans-serif';
        ctx.textBaseline = 'top';
        for (let i = 0; i < lanes; i += 1) {
            const x = i * colW + 4;
            const idx = scale.length
                ? ((i % scale.length) + scale.length) % scale.length
                : 0;
            const midiFloat = scale.length ? clamp(scale[idx], 0, 127) : getQuantizedNote(i, 48);
            const midiRounded = Number.isFinite(midiFloat) ? Math.round(midiFloat) : 60;
            const name = noteNames[((midiRounded % 12) + 12) % 12] || '?';
            const cents = Number.isFinite(midiFloat) ? Math.round((midiFloat - midiRounded) * 100) : 0;
            const label = Math.abs(cents) >= 1 ? `${name}${cents >= 0 ? '+' : ''}${cents}c` : name;
            ctx.fillText(label, x, 4);
        }
        ctx.restore();
    }

    function spawnLoopGhost(snapshot, durationMs = 160) {
        if (!snapshot) return;
        const ghost = {
            x: Number(snapshot.x) || 0,
            y: Number(snapshot.y) || 0,
            angle: Number(snapshot.angle) || 0,
            circleRadius: Number(snapshot.circleRadius) || 0,
            vertices: Array.isArray(snapshot.vertices) ? snapshot.vertices.map(v => ({ x: Number(v.x) || 0, y: Number(v.y) || 0 })) : null,
            color: snapshot.color || '#445',
            shadow: snapshot.shadow || '#111',
            glow: Number(snapshot.glow) || 0,
            born: performance.now(),
            ttl: Math.max(60, Number(durationMs) || 160)
        };
        loopGhosts.push(ghost);
    }

    function clearLoopGhosts() {
        loopGhosts.length = 0;
    }

    function drawLoopGhosts(now) {
        if (!loopGhosts.length) return;
        for (let i = loopGhosts.length - 1; i >= 0; i -= 1) {
            const g = loopGhosts[i];
            const age = now - g.born;
            if (age > g.ttl) {
                loopGhosts.splice(i, 1);
                continue;
            }
            const alpha = Math.max(0, 1 - (age / g.ttl));
            ctx.save();
            ctx.globalAlpha = 0.35 * alpha;
            ctx.shadowBlur = g.glow * 0.6;
            ctx.shadowColor = g.shadow;
            ctx.fillStyle = g.color;
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1.4;
            if (g.circleRadius > 0) {
                ctx.beginPath();
                ctx.arc(g.x, g.y, g.circleRadius, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
            } else if (g.vertices && g.vertices.length) {
                ctx.beginPath();
                ctx.moveTo(g.vertices[0].x, g.vertices[0].y);
                for (let j = 1; j < g.vertices.length; j += 1) ctx.lineTo(g.vertices[j].x, g.vertices[j].y);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
            }
            ctx.restore();
        }
    }

    function renderLoop() {
        if (!isRunning) return;

        const now = performance.now();
        const dt = Math.max(0.1, now - frameLastTs);
        frameLastTs = now;
        frameEma = frameEma * 0.9 + dt * 0.1;
        stats.avgFrameMs = frameEma;
        stats.fpsHint = Math.round(1000 / frameEma);

        ctx.fillStyle = 'rgba(11, 12, 16, 0.28)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        drawPitchLanesOverlay();
        drawCustomWalls();
        drawLoopGhosts(now);

        const bodies = Composite.allBodies(engine.world);
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';

        bodies.forEach((body) => {
            if (body.render.visible === false) return;

            let flash = body.render.flash || 0;
            if (flash > 0) body.render.flash -= 0.06;

            const mat = body.plugin?.audio
                ? body.plugin.audio.material.visual
                : (body.plugin?.visual?.material?.visual || { color: '#445', shadow: '#111', glow: 0 });
            const vertices = body.vertices;

            if (config.interaction.pointerTrail && body.plugin?.trail && !body.isStatic) {
                body.plugin.trail.push({ x: body.position.x, y: body.position.y });
                if (body.plugin.trail.length > 10) body.plugin.trail.shift();
                if (body.plugin.trail.length > 1) {
                    ctx.beginPath();
                    ctx.moveTo(body.plugin.trail[0].x, body.plugin.trail[0].y);
                    for (let i = 1; i < body.plugin.trail.length; i += 1) {
                        ctx.lineTo(body.plugin.trail[i].x, body.plugin.trail[i].y);
                    }
                    if (config?.advanced?.trailByDegree && body.plugin?.audio && Number.isFinite(Number(body.plugin.audio.scaleIndex))) {
                        const color = getScaleDegreeColor(body.plugin.audio.scaleIndex, body.plugin.audio.scaleLen || 0);
                        ctx.strokeStyle = color;
                        ctx.globalAlpha = 0.35;
                    } else {
                        ctx.strokeStyle = 'rgba(180,220,255,0.25)';
                    }
                    ctx.lineWidth = 1.5;
                    ctx.stroke();
                    ctx.globalAlpha = 1;
                }
            }

            ctx.beginPath();
            ctx.moveTo(vertices[0].x, vertices[0].y);
            for (let j = 1; j < vertices.length; j += 1) ctx.lineTo(vertices[j].x, vertices[j].y);
            ctx.closePath();

            const glow = mat.glow + (flash * 48);
            ctx.shadowBlur = glow;
            ctx.shadowColor = flash > 0 ? '#fff' : mat.shadow;
            ctx.fillStyle = flash > 0 ? '#fff' : mat.color;
            ctx.strokeStyle = flash > 0 ? mat.shadow : '#fff';
            ctx.lineWidth = 2 + (flash * 1.7);

            if (!body.isStatic) {
                ctx.fill();
                ctx.stroke();
            }

            const flashTs = body.plugin?.audio?.noteFlashTs || 0;
            if (!body.isStatic && flashTs > 0) {
                const age = now - flashTs;
                if (age >= 0 && age <= 200) {
                    const alpha = 1 - (age / 200);
                    const color = body.plugin?.audio?.noteFlashColor || '#ffffff';
                    ctx.save();
                    ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
                    ctx.strokeStyle = color;
                    ctx.lineWidth = 3;
                    ctx.beginPath();
                    if (body.circleRadius) {
                        ctx.arc(body.position.x, body.position.y, body.circleRadius + 2, 0, Math.PI * 2);
                    } else {
                        ctx.moveTo(vertices[0].x, vertices[0].y);
                        for (let j = 1; j < vertices.length; j += 1) ctx.lineTo(vertices[j].x, vertices[j].y);
                        ctx.closePath();
                    }
                    ctx.stroke();
                    ctx.restore();
                }
            }

            if (!body.isStatic && config?.advanced?.showRotationLine) {
                const angle = body.angle || 0;
                const len = body.circleRadius
                    ? body.circleRadius * 0.85
                    : Math.max(8, vertices.reduce((acc, v) => acc + Math.hypot(v.x - body.position.x, v.y - body.position.y), 0) / Math.max(1, vertices.length));
                ctx.beginPath();
                ctx.moveTo(body.position.x, body.position.y);
                ctx.lineTo(body.position.x + Math.cos(angle) * len, body.position.y + Math.sin(angle) * len);
                ctx.strokeStyle = 'rgba(240,250,255,0.65)';
                ctx.lineWidth = 1.2;
                ctx.stroke();
            }
            ctx.shadowBlur = 0;
        });

        drawTubes();

        if (config.debug && mouseConstraint && mouseConstraint.body) {
            const mp = mouse.position;
            const bp = mouseConstraint.body.position;
            ctx.beginPath();
            ctx.moveTo(mp.x, mp.y);
            ctx.lineTo(bp.x, bp.y);
            ctx.strokeStyle = 'rgba(255,255,255,0.45)';
            ctx.lineWidth = 1;
            ctx.stroke();
        }

        const wind = clamp(config?.macro?.wind || 0, -1, 1);
        const windVis = Math.abs(wind) * (0.55 + clamp(windRuntime.pulse, 0, 1));
        if (windVis > 0.06) {
            const dir = Math.sign(wind) || 1;
            const count = Math.round(4 + windVis * 10);
            ctx.strokeStyle = `rgba(190,220,255,${(0.06 + windVis * 0.1).toFixed(3)})`;
            ctx.lineWidth = 1.2;
            for (let i = 0; i < count; i += 1) {
                const y = (i + 0.5) * (canvas.height / count) + Math.sin(frameLastTs * 0.004 + i) * 6;
                const len = 24 + windVis * 38;
                const xStart = dir > 0 ? (8 + (i * 9) % 40) : (canvas.width - 8 - ((i * 9) % 40));
                ctx.beginPath();
                ctx.moveTo(xStart, y);
                ctx.lineTo(xStart + (len * dir), y + Math.sin(frameLastTs * 0.006 + i) * 2.6);
                ctx.stroke();
            }
        }

        rafId = requestAnimationFrame(renderLoop);
    }

    function resize() {
        if (!canvas || !canvas.parentElement) return;
        canvas.width = canvas.parentElement.offsetWidth;
        canvas.height = canvas.parentElement.offsetHeight;
        if (isRunning) spawnEnvironment();
    }

    function getStats() {
        return {
            activeVoices: stats.activeVoices,
            avgFrameMs: Number(stats.avgFrameMs.toFixed(2)),
            fpsHint: stats.fpsHint,
            tubeCount: tubes.size,
            mode: getMode()
        };
    }

    function exportScene() {
        const sceneMode = getMode();
        const materialKey = materialKeyFromProfile(currentMaterial);
        const tubesData = Array.from(tubes.values()).map((t) => ({
            x: t.x,
            y: t.y,
            angle: t.angle,
            length: t.length,
            diameter: t.diameter,
            material: t.material,
            surface: t.surface,
            endMode: t.endMode,
            quantize: !!t.quantize,
            windPlay: !!t.windPlay
        }));
        const allBodies = engine?.world ? Composite.allBodies(engine.world) : [];
        const bodiesData = allBodies
            .filter((b) => !b.isStatic && b.plugin?.audio && b.render?.visible !== false)
            .map((b) => ({
                x: b.position?.x || 0,
                y: b.position?.y || 0,
                vx: (b.velocity?.x || 0) * 60,
                vy: (b.velocity?.y || 0) * 60,
                angle: b.angle || 0,
                av: b.angularVelocity || 0,
                note: Number.isFinite(b.plugin?.audio?.note) ? b.plugin.audio.note : 60,
                shape: b.plugin?.audio?.shape || 'auto',
                materialKey: materialKeyFromProfile(b.plugin?.audio?.material)
            }));
        const wallsData = customWalls.map((b) => ({
            x1: b.plugin?.wall?.x1,
            y1: b.plugin?.wall?.y1,
            x2: b.plugin?.wall?.x2,
            y2: b.plugin?.wall?.y2,
            thickness: b.plugin?.wall?.thickness || 10
        })).filter((w) => Number.isFinite(w.x1) && Number.isFinite(w.y1) && Number.isFinite(w.x2) && Number.isFinite(w.y2));

        return {
            mode: sceneMode,
            materialKey,
            tubes: tubesData,
            bodies: bodiesData,
            walls: wallsData,
            savedAt: Date.now()
        };
    }

    function importScene(scene = {}) {
        if (!scene || typeof scene !== 'object') return false;
        const mode = normalizeMode(scene.mode || config.mode);
        clearCustomWalls();
        if (scene.materialKey && MATERIALS[scene.materialKey]) {
            currentMaterial = MATERIALS[scene.materialKey];
        }
        setMode(mode);
        clearScene({ keepEnvironment: true });
        clearTubes();

        if (Array.isArray(scene.tubes)) {
            scene.tubes.forEach((spec) => {
                addTube({
                    x: Number(spec.x),
                    y: Number(spec.y),
                    angle: Number(spec.angle),
                    length: Number(spec.length),
                    diameter: Number(spec.diameter),
                    material: spec.material,
                    surface: spec.surface,
                    endMode: spec.endMode,
                    quantize: spec.quantize,
                    windPlay: spec.windPlay
                });
            });
        }

        if (Array.isArray(scene.walls)) {
            scene.walls.forEach((w) => {
                if (!w) return;
                const p1 = { x: Number(w.x1), y: Number(w.y1) };
                const p2 = { x: Number(w.x2), y: Number(w.y2) };
                if (!Number.isFinite(p1.x) || !Number.isFinite(p1.y) || !Number.isFinite(p2.x) || !Number.isFinite(p2.y)) return;
                addWallSegment(p1, p2, { thickness: Number(w.thickness) || 10 });
            });
        }
        if (Array.isArray(scene.bodies) && mode !== 'tubes') {
            scene.bodies.forEach((spec) => {
                const body = createBody({
                    x: Number(spec.x),
                    y: Number(spec.y),
                    vx: Number(spec.vx),
                    vy: Number(spec.vy),
                    note: Number(spec.note),
                    shape: spec.shape,
                    materialKey: spec.materialKey
                });
                if (!body) return;
                Body.setAngle(body, Number(spec.angle) || 0);
                Body.setAngularVelocity(body, Number(spec.av) || 0);
                Composite.add(engine.world, body);
                startWaterGlide(body);
            });
        }
        return true;
    }

    return {
        init,
        start,
        stop,
        spawnObject,
        morph,
        spawnRain,
        setConfig,
        getConfig,
        setMode,
        getMode,
        setTubesConfig,
        getTubesConfig,
        addTube,
        updateTube,
        updateSelectedTube,
        removeTube,
        clearTubes,
        exciteTube,
        clearScene,
        clearWalls: clearCustomWalls,
        spawnLoopGhost,
        clearLoopGhosts,
        spawnFromPointer,
        setStream,
        getStats,
        exportScene,
        importScene,
        get isRunning() { return isRunning; }
    };
})();

window.Playground = Playground;
