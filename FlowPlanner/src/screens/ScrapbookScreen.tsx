import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  FlatList,
  Image,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useSettingsStore } from '../store/settingsStore';
import {
  createScrapbookNoteOnGitHub,
  getSavedScrapbookPages,
  saveScrapbookPageMetadata,
  type ScrapbookPage,
  uploadScrapbookImageToGitHub,
} from '../services/scrapbookService';

const SCRAP_COLORS = {
  bg: '#1a0f2e',
  surface: '#2d1b4e',
  surface2: '#3d2460',
  card: 'rgba(45, 27, 78, 0.85)',
  accent: '#f4a7c3',
  accentGlow: 'rgba(244, 167, 195, 0.3)',
  gold: '#c9a84c',
  goldGlow: 'rgba(201, 168, 76, 0.25)',
  text: '#f0e8ff',
  textMuted: '#9b7fa6',
  border: 'rgba(244, 167, 195, 0.2)',
};

const STARS = Array.from({ length: 35 }, (_, i) => ({
  id: i,
  top: Math.random() * 100,
  left: Math.random() * 100,
  size: Math.random() > 0.7 ? 3 : 2,
  delay: Math.random() * 3000,
  duration: 2000 + Math.random() * 2000,
}));

const FABRIC_HTML = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Dancing+Script:wght@400;700&family=DM+Sans:wght@300;400;600&family=Pacifico&family=Cormorant+Garamond:ital,wght@0,300;1,300&display=swap" rel="stylesheet">
<style>
:root {
  --bg:        #06030f;
  --surface:   #0d0820;
  --surface2:  #120b28;
  --surface3:  #1a1035;
  --border:    rgba(244,167,195,0.10);
  --pink:      #f4a7c3;
  --pink-dim:  rgba(244,167,195,0.15);
  --gold:      #c9a84c;
  --muted:     #6b5878;
  --text:      #e8dff5;
}
* { margin:0; padding:0; box-sizing:border-box; -webkit-tap-highlight-color:transparent; }
html, body { width:100%; height:100%; overflow:hidden; background:var(--bg); font-family:'DM Sans',sans-serif; color:var(--text); }

#app {
  display: flex;
  flex-direction: column;
  height: 100vh;
  height: 100dvh;
  overflow: hidden;
}

/* TOP BAR — scrollable */
#topbar {
  flex-shrink: 0;
  height: 44px;
  background: var(--surface2);
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  padding: 0 8px;
  gap: 0;
  overflow-x: auto;
  overflow-y: hidden;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
  white-space: nowrap;
}
#topbar::-webkit-scrollbar { display: none; }

.top-btn {
  flex-shrink: 0;
  padding: 5px 10px;
  border-radius: 10px;
  border: 1px solid var(--border);
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
  gap: 3px;
  margin-right: 5px;
  background: transparent;
  color: var(--muted);
}
.top-btn:hover, .top-btn:active { background: var(--pink-dim); color: var(--pink); border-color: var(--pink); }
.top-btn.danger { color: #ff8fa3; border-color: rgba(255,100,120,0.2); }
.top-btn.danger:hover { background: rgba(255,100,120,0.1); }
.top-btn.gold-btn { background: var(--gold); color: var(--bg); border-color: var(--gold); font-weight:700; }
.top-sep { flex-shrink:0; width:1px; height:20px; background:var(--border); margin: 0 4px; }

/* MIDDLE ROW */
#middle {
  flex: 1;
  display: flex;
  min-height: 0;
  overflow: hidden;
}

/* SIDEBAR — narrow */
#sidebar {
  flex-shrink: 0;
  width: 52px;
  background: var(--surface2);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 6px 0;
  gap: 2px;
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: none;
}
#sidebar::-webkit-scrollbar { display: none; }

.side-btn {
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  border-radius: 10px;
  border: none;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1px;
  background: transparent;
  color: var(--muted);
  font-size: 18px;
  transition: all 0.15s;
}
.side-btn span { font-size: 8px; color: inherit; line-height: 1; }
.side-btn:hover, .side-btn:active { background: var(--pink-dim); color: var(--pink); }
.side-btn.active { background: var(--pink-dim); color: var(--pink); }
.side-sep { width: 32px; height: 1px; background: var(--border); margin: 2px 0; flex-shrink:0; }

/* CANVAS AREA */
#canvas-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg);
  position: relative;
  overflow: hidden;
  min-width: 0;
  min-height: 0;
}
canvas { border-radius: 6px; box-shadow: 0 0 40px rgba(244,167,195,0.08); }

/* BOTTOM BAR */
#bottom-bar {
  flex-shrink: 0;
  height: 60px;
  background: var(--surface2);
  border-top: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 0 16px;
  padding-bottom: env(safe-area-inset-bottom, 0px);
  gap: 10px;
}
.bottom-btn {
  flex: 1;
  max-width: 120px;
  height: 40px;
  border-radius: 20px;
  border: 1px solid var(--border);
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  transition: all 0.15s;
  background: var(--surface3);
  color: var(--text);
}
.bottom-btn:hover, .bottom-btn:active { background: var(--pink-dim); border-color: var(--pink); color: var(--pink); }
.bottom-btn.export-btn { background: var(--gold); color: var(--bg); border-color: var(--gold); }

/* PANELS — overlay on canvas */
.panel {
  position: absolute; top: 0; left: 0; bottom: 0;
  width: 210px;
  background: rgba(9,5,20,0.97);
  border-right: 1px solid var(--border);
  display: none; flex-direction: column;
  z-index: 20; backdrop-filter: blur(20px);
  overflow-y: auto;
}
.panel.open { display: flex; }
.panel-header {
  padding: 12px 14px 8px;
  border-bottom: 1px solid var(--border);
  display: flex; align-items: center; justify-content: space-between;
  position: sticky; top: 0;
  background: rgba(9,5,20,0.98);
  z-index: 1;
}
.panel-title { font-size: 13px; font-weight: 700; color: var(--pink); }
.panel-close { background:none; border:none; color:var(--muted); cursor:pointer; font-size:16px; padding:4px; }
.panel-body { padding: 10px; }

/* CONTEXT MENU */
#ctx-menu {
  display: none; position: absolute; z-index: 100;
  background: rgba(9,5,20,0.98); border: 1px solid var(--border);
  border-radius: 12px; padding: 6px; min-width: 160px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.6);
}
.ctx-item {
  padding: 8px 12px; border-radius: 8px; cursor: pointer;
  font-size: 12px; color: var(--text); display: flex; align-items: center; gap: 8px;
  transition: background 0.1s;
}
.ctx-item:hover { background: var(--pink-dim); color: var(--pink); }
.ctx-sep { height:1px; background:var(--border); margin:4px 0; }
.ctx-danger { color: #ff8fa3 !important; }
.ctx-danger:hover { background: rgba(255,100,120,0.1) !important; }

/* TEXT MODAL */
#text-modal {
  display: none; position: fixed; inset: 0;
  background: rgba(6,3,15,0.9); z-index: 200;
  align-items: center; justify-content: center;
  backdrop-filter: blur(12px);
}
#text-modal.show { display: flex; }
.modal-box {
  background: var(--surface2); border-radius: 18px; padding: 20px;
  width: 90%; max-width: 360px;
  border: 1px solid var(--border);
  box-shadow: 0 20px 60px rgba(0,0,0,0.7);
  max-height: 85vh; overflow-y: auto;
}
.modal-box h3 { color: var(--pink); margin-bottom: 12px; font-size: 15px; }
.modal-box textarea {
  width: 100%; background: rgba(6,3,15,0.6);
  border: 1px solid var(--border); border-radius: 10px;
  padding: 10px; color: var(--text); font-size: 14px; resize: none;
  height: 70px; outline: none;
}
.modal-actions { display:flex; gap:8px; margin-top:12px; justify-content:flex-end; }
.modal-actions button { padding:8px 16px; border-radius:10px; border:none; font-size:13px; font-weight:600; cursor:pointer; }
.btn-cancel { background: var(--surface3); color: var(--muted); }
.btn-confirm { background: var(--pink); color: var(--bg); }

/* reusable */
.sec-label { font-size: 10px; color: var(--muted); text-transform:uppercase; letter-spacing:1px; margin: 10px 0 5px; }
.color-row { display:flex; gap:5px; flex-wrap:wrap; }
.color-dot { width:24px; height:24px; border-radius:50%; cursor:pointer; border:2px solid transparent; transition:all 0.15s; }
.color-dot:hover, .color-dot.active { border-color:#fff; transform:scale(1.15); }
.slider-row { display:flex; flex-direction:column; gap:3px; margin:6px 0; }
.slider-label { font-size:10px; color:var(--muted); display:flex; justify-content:space-between; }
input[type=range] { width:100%; height:4px; border-radius:2px; background:var(--pink-dim); outline:none; -webkit-appearance:none; }
input[type=range]::-webkit-slider-thumb { -webkit-appearance:none; width:14px; height:14px; border-radius:50%; background:var(--pink); cursor:pointer; }
.font-chip { padding:7px 10px; border-radius:8px; border:1px solid var(--border); background:transparent; color:var(--text); cursor:pointer; text-align:left; font-size:12px; width:100%; margin-bottom:5px; transition:all 0.15s; }
.font-chip:hover, .font-chip.active { background:var(--pink-dim); border-color:var(--pink); color:var(--pink); }
.frames-grid { display:grid; grid-template-columns:1fr 1fr; gap:7px; }
.frame-item { aspect-ratio:1; border-radius:10px; cursor:pointer; border:1px solid var(--border); display:flex; align-items:center; justify-content:center; font-size:26px; background:var(--surface3); transition:all 0.15s; }
.frame-item:hover { border-color:var(--pink); transform:scale(1.05); }
.sticker-grid { display:grid; grid-template-columns:repeat(5,1fr); gap:5px; }
.sticker-item { font-size:22px; text-align:center; padding:5px; border-radius:7px; cursor:pointer; transition:all 0.15s; }
.sticker-item:hover { background:var(--pink-dim); transform:scale(1.2); }
.bg-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:7px; }
.bg-item { aspect-ratio:1; border-radius:8px; cursor:pointer; border:2px solid transparent; transition:all 0.15s; }
.bg-item:hover, .bg-item.active { border-color:var(--pink); }
</style>
</head>
<body>
<div id="app">

  <!-- TOP BAR -->
  <div id="topbar">
    <button class="top-btn" onclick="groupSelected()">🔗 Группа</button>
    <button class="top-btn" onclick="ungroupSelected()">🔓 Разгруп</button>
    <button class="top-btn" onclick="duplicateSelected()">📋 Копия</button>
    <button class="top-btn" onclick="flipH()">↔ Зеркало</button>
    <button class="top-btn" onclick="flipV()">↕ Flip</button>
    <div class="top-sep"></div>
    <button class="top-btn" onclick="bringToFront()">⏫ Топ</button>
    <button class="top-btn" onclick="bringForward()">⬆ Вперёд</button>
    <button class="top-btn" onclick="sendBackward()">⬇ Назад</button>
    <button class="top-btn" onclick="sendToBack()">⏬ Низ</button>
    <div class="top-sep"></div>
    <button class="top-btn danger" onclick="deleteSelected()">🗑 Удалить</button>
    <button class="top-btn danger" onclick="clearCanvas()">🔄 Очистить</button>
    <button class="top-btn gold-btn" onclick="exportPage()">📤 Сохранить</button>
  </div>

  <!-- MIDDLE -->
  <div id="middle">

    <!-- SIDEBAR -->
    <div id="sidebar">
      <button class="side-btn" onclick="openPanel('bg')" id="sb-bg">🎨<span>Фон</span></button>
      <button class="side-btn" onclick="addImageFromFile()">🖼️<span>Фото</span></button>
      <button class="side-btn" onclick="showTextModal()">✍️<span>Текст</span></button>
      <button class="side-btn" onclick="openPanel('stickers')" id="sb-stickers">✨<span>Стикер</span></button>
      <div class="side-sep"></div>
      <button class="side-btn" onclick="openPanel('frames')" id="sb-frames">🖼<span>Рамки</span></button>
      <button class="side-btn" onclick="addShape('rect')">⬜<span>Прямо</span></button>
      <button class="side-btn" onclick="addShape('circle')">⭕<span>Круг</span></button>
      <button class="side-btn" onclick="addShape('line')">╱<span>Линия</span></button>
      <div class="side-sep"></div>
      <button class="side-btn" onclick="openPanel('draw')" id="sb-draw">🖌️<span>Кисть</span></button>
      <div class="side-sep"></div>
      <button class="side-btn" onclick="openPanel('props')" id="sb-props">⚙️<span>Свойства</span></button>
    </div>

    <!-- CANVAS WRAPPER -->
    <div id="canvas-wrapper">
      <canvas id="c"></canvas>

      <!-- PANELS -->

      <!-- BG PANEL -->
    <div class="panel" id="panel-bg">
      <div class="panel-header">
        <span class="panel-title">🎨 Фон</span>
        <button class="panel-close" onclick="closePanel('bg')">✕</button>
      </div>
      <div class="panel-body">
        <div class="sec-label">Цвета</div>
        <div class="bg-grid">
          <div class="bg-item active" style="background:#fff" onclick="setBg('#fff',this)"></div>
          <div class="bg-item" style="background:#fdf6f0" onclick="setBg('#fdf6f0',this)"></div>
          <div class="bg-item" style="background:#f0e8ff" onclick="setBg('#f0e8ff',this)"></div>
          <div class="bg-item" style="background:#fce4ec" onclick="setBg('#fce4ec',this)"></div>
          <div class="bg-item" style="background:#e8f5e9" onclick="setBg('#e8f5e9',this)"></div>
          <div class="bg-item" style="background:#1a0f2e" onclick="setBg('#1a0f2e',this)"></div>
          <div class="bg-item" style="background:#0d0820" onclick="setBg('#0d0820',this)"></div>
          <div class="bg-item" style="background:#1a1a2e" onclick="setBg('#1a1a2e',this)"></div>
          <div class="bg-item" style="background:#2c1810" onclick="setBg('#2c1810',this)"></div>
        </div>
        <div class="sec-label">Градиенты</div>
        <div class="bg-grid">
          <div class="bg-item" style="background:linear-gradient(135deg,#fce4ec,#f3e5f5)" onclick="setBgGradient(['#fce4ec','#f3e5f5'],this)"></div>
          <div class="bg-item" style="background:linear-gradient(135deg,#1a0f2e,#2d1b4e)" onclick="setBgGradient(['#1a0f2e','#2d1b4e'],this)"></div>
          <div class="bg-item" style="background:linear-gradient(135deg,#0d0820,#1a0f2e,#2d1b4e)" onclick="setBgGradient(['#0d0820','#1a0f2e','#2d1b4e'],this)"></div>
          <div class="bg-item" style="background:linear-gradient(135deg,#fff9f0,#ffecd2)" onclick="setBgGradient(['#fff9f0','#ffecd2'],this)"></div>
          <div class="bg-item" style="background:linear-gradient(135deg,#e0f2fe,#f3e5f5)" onclick="setBgGradient(['#e0f2fe','#f3e5f5'],this)"></div>
          <div class="bg-item" style="background:linear-gradient(135deg,#f9fbe7,#fce4ec)" onclick="setBgGradient(['#f9fbe7','#fce4ec'],this)"></div>
        </div>
        <div class="sec-label">Текстуры</div>
        <div class="bg-grid">
          <div class="bg-item" onclick="setBgTexture('kraft',this)" style="background:repeating-linear-gradient(45deg,#c9956c22,#c9956c22 1px,#fdf6f0 1px,#fdf6f0 8px)"></div>
          <div class="bg-item" onclick="setBgTexture('dots',this)" style="background:radial-gradient(circle,#f4a7c333 1px,transparent 1px) 0 0/14px 14px,#fff"></div>
          <div class="bg-item" onclick="setBgTexture('grid',this)" style="background:linear-gradient(rgba(155,127,166,.15) 1px,transparent 1px),linear-gradient(90deg,rgba(155,127,166,.15) 1px,transparent 1px),#f0e8ff; background-size:16px 16px"></div>
          <div class="bg-item" onclick="setBgTexture('lines',this)" style="background:repeating-linear-gradient(0deg,#f4a7c322,#f4a7c322 1px,#fff 1px,#fff 24px)"></div>
          <div class="bg-item" onclick="setBgTexture('stars',this)" style="background:#1a0f2e;background-image:radial-gradient(circle,#f0e8ff 1px,transparent 1px);background-size:20px 20px"></div>
          <div class="bg-item" onclick="setBgTexture('rose',this)" style="background:#fdf0f4;background-image:radial-gradient(circle,#f4a7c333 2px,transparent 2px);background-size:24px 24px"></div>
        </div>
      </div>
    </div>

    <!-- FRAMES PANEL -->
    <div class="panel" id="panel-frames">
      <div class="panel-header">
        <span class="panel-title">🖼 Рамки</span>
        <button class="panel-close" onclick="closePanel('frames')">✕</button>
      </div>
      <div class="panel-body">
        <div class="sec-label">Декоративные рамки</div>
        <div class="frames-grid">
          <div class="frame-item" onclick="addFrame('simple')" title="Простая">▢</div>
          <div class="frame-item" onclick="addFrame('double')" title="Двойная">⬜</div>
          <div class="frame-item" onclick="addFrame('rounded')" title="Скруглённая">▣</div>
          <div class="frame-item" onclick="addFrame('dashed')" title="Пунктир">┅</div>
          <div class="frame-item" onclick="addFrame('shadow')" title="Тень">🟪</div>
          <div class="frame-item" onclick="addFrame('polaroid')" title="Полароид">📷</div>
          <div class="frame-item" onclick="addFrame('vintage')" title="Винтаж">🗃</div>
          <div class="frame-item" onclick="addFrame('floral')" title="Цветочная">🌸</div>
          <div class="frame-item" onclick="addFrame('gold')" title="Золотая">✨</div>
          <div class="frame-item" onclick="addFrame('moon')" title="Лунная">🌙</div>
        </div>
        <div class="sec-label" style="margin-top:14px">Маски для фото</div>
        <div class="frames-grid">
          <div class="frame-item" onclick="applyMask('circle')" title="Круг">⭕</div>
          <div class="frame-item" onclick="applyMask('heart')" title="Сердце">❤️</div>
          <div class="frame-item" onclick="applyMask('hexagon')" title="Шестигран">⬡</div>
          <div class="frame-item" onclick="applyMask('star')" title="Звезда">⭐</div>
        </div>
      </div>
    </div>

    <!-- STICKERS PANEL -->
    <div class="panel" id="panel-stickers">
      <div class="panel-header">
        <span class="panel-title">✨ Стикеры</span>
        <button class="panel-close" onclick="closePanel('stickers')">✕</button>
      </div>
      <div class="panel-body">
        <div class="sec-label">Природа & Магия</div>
        <div class="sticker-grid" id="s1"></div>
        <div class="sec-label" style="margin-top:10px">Дневник & Уют</div>
        <div class="sticker-grid" id="s2"></div>
      </div>
    </div>

    <!-- DRAW PANEL -->
    <div class="panel" id="panel-draw">
      <div class="panel-header">
        <span class="panel-title">🖌️ Кисть</span>
        <button class="panel-close" onclick="closePanel('draw')">✕</button>
      </div>
      <div class="panel-body">
        <button id="draw-toggle" class="top-btn tb-ghost" style="width:100%;justify-content:center;margin-bottom:12px" onclick="toggleDraw()">
          ✏️ Включить рисование
        </button>
        <div class="sec-label">Цвет кисти</div>
        <div class="color-row">
          <div class="color-dot active" style="background:#f4a7c3" onclick="setDrawColor('#f4a7c3',this)"></div>
          <div class="color-dot" style="background:#c9a84c" onclick="setDrawColor('#c9a84c',this)"></div>
          <div class="color-dot" style="background:#9b7fa6" onclick="setDrawColor('#9b7fa6',this)"></div>
          <div class="color-dot" style="background:#f0e8ff" onclick="setDrawColor('#f0e8ff',this)"></div>
          <div class="color-dot" style="background:#2d1b4e" onclick="setDrawColor('#2d1b4e',this)"></div>
          <div class="color-dot" style="background:#ff8fa3" onclick="setDrawColor('#ff8fa3',this)"></div>
          <div class="color-dot" style="background:#6fcf97" onclick="setDrawColor('#6fcf97',this)"></div>
          <div class="color-dot" style="background:#56ccf2" onclick="setDrawColor('#56ccf2',this)"></div>
        </div>
        <div class="slider-row" style="margin-top:12px">
          <div class="slider-label"><span>Размер кисти</span><span id="brush-size-label">4px</span></div>
          <input type="range" min="1" max="30" value="4" id="brush-size" oninput="setBrushSize(this.value)">
        </div>
        <div class="slider-row">
          <div class="slider-label"><span>Прозрачность</span><span id="brush-opacity-label">100%</span></div>
          <input type="range" min="10" max="100" value="100" id="brush-opacity" oninput="setBrushOpacity(this.value)">
        </div>
        <div class="sec-label" style="margin-top:8px">Тип кисти</div>
        <div style="display:flex;gap:6px;flex-wrap:wrap">
          <button class="top-btn tb-active" onclick="setBrushType('pencil',this)">✏️ Карандаш</button>
          <button class="top-btn tb-ghost" onclick="setBrushType('circle',this)">⭕ Маркер</button>
          <button class="top-btn tb-ghost" onclick="setBrushType('spray',this)">💨 Спрей</button>
        </div>
      </div>
    </div>

    <!-- PROPS PANEL -->
    <div class="panel" id="panel-props">
      <div class="panel-header">
        <span class="panel-title">⚙️ Свойства</span>
        <button class="panel-close" onclick="closePanel('props')">✕</button>
      </div>
      <div class="panel-body" id="props-body">
        <div style="color:#9b7fa6;font-size:12px;text-align:center;margin-top:20px">
          Выбери объект на холсте
        </div>
      </div>
    </div>

      <!-- CONTEXT MENU -->
      <div id="ctx-menu">
        <div class="ctx-item" onclick="bringToFront()">⏫ На передний план</div>
        <div class="ctx-item" onclick="sendToBack()">⏬ На задний план</div>
        <div class="ctx-item" onclick="bringForward()">⬆ Вперёд</div>
        <div class="ctx-item" onclick="sendBackward()">⬇ Назад</div>
        <div class="ctx-sep"></div>
        <div class="ctx-item" onclick="duplicateSelected()">📋 Дублировать</div>
        <div class="ctx-item" onclick="flipH()">↔ Зеркало</div>
        <div class="ctx-item" onclick="flipV()">↕ Перевернуть</div>
        <div class="ctx-item" onclick="groupSelected()">🔗 Группировать</div>
        <div class="ctx-sep"></div>
        <div class="ctx-item ctx-danger" onclick="deleteSelected()">🗑 Удалить</div>
      </div>
    </div>
  </div>

  <!-- BOTTOM ACTION BAR -->
  <div id="bottom-bar">
    <button class="bottom-btn" onclick="clearCanvas()">✨ Новая</button>
    <button class="bottom-btn" onclick="showTemplateModal()">🌸 Шаблоны</button>
    <button class="bottom-btn export-btn" onclick="exportPage()">📤 Экспорт</button>
  </div>

</div>

<!-- TEXT MODAL -->
<div id="text-modal">
  <div class="modal-box">
    <h3>✍️ Добавить текст</h3>
    <textarea id="text-input" placeholder="Напиши что-нибудь красивое..."></textarea>
    <div class="sec-label">Шрифт</div>
    <div class="font-chips">
      <button class="font-chip active" style="font-family:'Playfair Display',serif" onclick="selectFont('Playfair Display',this)">Playfair Display — элегантный</button>
      <button class="font-chip" style="font-family:'Dancing Script',cursive" onclick="selectFont('Dancing Script',this)">Dancing Script — рукописный</button>
      <button class="font-chip" style="font-family:'Pacifico',cursive" onclick="selectFont('Pacifico',this)">Pacifico — игривый</button>
      <button class="font-chip" style="font-family:'Cormorant Garamond',serif" onclick="selectFont('Cormorant Garamond',this)">Cormorant — романтичный</button>
      <button class="font-chip" style="font-family:'DM Sans',sans-serif" onclick="selectFont('DM Sans',this)">DM Sans — чистый</button>
    </div>
    <div class="sec-label" style="margin-top:10px">Цвет текста</div>
    <div class="color-row" id="text-colors">
      <div class="color-dot active" style="background:#2d1b4e;border:2px solid rgba(244,167,195,0.3)" onclick="selectTextColor('#2d1b4e',this)"></div>
      <div class="color-dot" style="background:#f0e8ff;border:2px solid rgba(244,167,195,0.3)" onclick="selectTextColor('#f0e8ff',this)"></div>
      <div class="color-dot" style="background:#f4a7c3" onclick="selectTextColor('#f4a7c3',this)"></div>
      <div class="color-dot" style="background:#c9a84c" onclick="selectTextColor('#c9a84c',this)"></div>
      <div class="color-dot" style="background:#9b7fa6" onclick="selectTextColor('#9b7fa6',this)"></div>
      <div class="color-dot" style="background:#ff8fa3" onclick="selectTextColor('#ff8fa3',this)"></div>
      <div class="color-dot" style="background:#ffffff;border:1px solid #ccc" onclick="selectTextColor('#ffffff',this)"></div>
      <div class="color-dot" style="background:#1a1a2e" onclick="selectTextColor('#1a1a2e',this)"></div>
    </div>
    <div class="modal-actions">
      <button class="btn-cancel" onclick="closeTextModal()">Отмена</button>
      <button class="btn-confirm" onclick="confirmText()">Добавить ✨</button>
    </div>
  </div>
</div>

<script src="https://cdnjs.cloudflare.com/ajax/libs/fabric.js/5.3.1/fabric.min.js"></script>
<script>
let canvas, isDrawing = false;
let selectedFont = 'Playfair Display';
let selectedTextColor = '#2d1b4e';
let activePanel = null;

// ═══ INIT ═══
window.onload = () => {
  const wrapper = document.getElementById('canvas-wrapper');

  function initCanvas() {
    const w = wrapper.clientWidth || window.innerWidth - 52;
    const h = wrapper.clientHeight || window.innerHeight - 44 - 60;
    const size = Math.max(Math.min(w - 16, h - 16), 280);

    if (canvas) {
      canvas.setWidth(size);
      canvas.setHeight(size);
      canvas.renderAll();
      return;
    }

    canvas = new fabric.Canvas('c', {
      width: size,
      height: size,
      backgroundColor: '#ffffff',
      preserveObjectStacking: true,
    });
  }

  initCanvas();

  const ro = new ResizeObserver(() => initCanvas());
  ro.observe(wrapper);

  // Stars
  for (let i = 0; i < 30; i++) {
    const s = document.createElement('div');
    s.className = 'star';
    s.style.cssText = \`width:\${Math.random()>0.7?3:2}px;height:\${Math.random()>0.7?3:2}px;top:\${Math.random()*100}%;left:\${Math.random()*100}%;opacity:\${0.1+Math.random()*0.3}\`;
    document.getElementById('canvas-wrapper').appendChild(s);
  }

  // Context menu
  canvas.on('mouse:down', e => {
    document.getElementById('ctx-menu').style.display = 'none';
  });
  
  canvas.wrapperEl.addEventListener('contextmenu', e => {
    e.preventDefault();
    if (canvas.getActiveObject()) {
      const m = document.getElementById('ctx-menu');
      m.style.display = 'block';
      m.style.left = (e.offsetX + 10) + 'px';
      m.style.top = (e.offsetY + 10) + 'px';
    }
  });

  // Props panel update
  canvas.on('selection:created', updatePropsPanel);
  canvas.on('selection:updated', updatePropsPanel);
  canvas.on('selection:cleared', () => {
    document.getElementById('props-body').innerHTML = '<div style="color:#9b7fa6;font-size:12px;text-align:center;margin-top:20px">Выбери объект на холсте</div>';
  });
};

// ═══ PANELS ═══
function openPanel(name) {
  if (activePanel === name) { closePanel(name); return; }
  if (activePanel) {
    document.getElementById('panel-' + activePanel).classList.remove('open');
    document.getElementById('sb-' + activePanel)?.classList.remove('active');
  }
  document.getElementById('panel-' + name).classList.add('open');
  document.getElementById('sb-' + name)?.classList.add('active');
  activePanel = name;
}
function closePanel(name) {
  document.getElementById('panel-' + name).classList.remove('open');
  document.getElementById('sb-' + name)?.classList.remove('active');
  activePanel = null;
}

// ═══ BACKGROUND ═══
function setBg(color, el) {
  canvas.setBackgroundColor(color, canvas.renderAll.bind(canvas));
  document.querySelectorAll('.bg-item').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
}
function setBgGradient(colors, el) {
  const stops = colors.map((c,i) => ({ offset: i/(colors.length-1), color: c }));
  canvas.setBackgroundColor(new fabric.Gradient({
    type:'linear', gradientUnits:'pixels',
    coords:{ x1:0,y1:0,x2:canvas.width,y2:canvas.height },
    colorStops: stops
  }), canvas.renderAll.bind(canvas));
  document.querySelectorAll('.bg-item').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
}
function setBgTexture(type, el) {
  const svgs = {
    dots: \`<svg xmlns='http://www.w3.org/2000/svg' width='14' height='14'><circle cx='7' cy='7' r='1.5' fill='#f4a7c3' opacity='0.4'/></svg>\`,
    grid: \`<svg xmlns='http://www.w3.org/2000/svg' width='20' height='20'><path d='M20 0H0v20' fill='none' stroke='#9b7fa666' stroke-width='0.5'/></svg>\`,
    lines: \`<svg xmlns='http://www.w3.org/2000/svg' width='1' height='24'><line x1='0' y1='0' x2='0' y2='24' stroke='#f4a7c322' stroke-width='1'/></svg>\`,
    stars: \`<svg xmlns='http://www.w3.org/2000/svg' width='20' height='20'><circle cx='10' cy='10' r='1' fill='#f0e8ff' opacity='0.5'/></svg>\`,
    rose: \`<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24'><circle cx='12' cy='12' r='2' fill='#f4a7c3' opacity='0.3'/></svg>\`,
    kraft: \`<svg xmlns='http://www.w3.org/2000/svg' width='8' height='8'><line x1='0' y1='0' x2='8' y2='8' stroke='#c9956c' stroke-width='0.5' opacity='0.3'/></svg>\`,
  };
  const bgs = { dots:'#fff', grid:'#f0e8ff', lines:'#fff', stars:'#1a0f2e', rose:'#fdf0f4', kraft:'#fdf6f0' };
  const url = 'data:image/svg+xml,' + encodeURIComponent(svgs[type]);
  fabric.util.loadImage(url, img => {
    const pat = new fabric.Pattern({ source: img, repeat: 'repeat' });
    canvas.setBackgroundColor(bgs[type], () => {
      canvas.setBackgroundColor(pat, canvas.renderAll.bind(canvas));
    });
  });
  document.querySelectorAll('.bg-item').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
}

// ═══ TEXT ═══
function showTextModal() {
  document.getElementById('text-modal').classList.add('show');
  setTimeout(() => document.getElementById('text-input').focus(), 100);
}
function closeTextModal() {
  document.getElementById('text-modal').classList.remove('show');
  document.getElementById('text-input').value = '';
}
function selectFont(f, el) {
  selectedFont = f;
  document.querySelectorAll('.font-chip').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
}
function selectTextColor(c, el) {
  selectedTextColor = c;
  document.querySelectorAll('#text-colors .color-dot').forEach(d => d.classList.remove('active'));
  el.classList.add('active');
}
function confirmText() {
  const val = document.getElementById('text-input').value.trim();
  if (!val) return;
  const t = new fabric.IText(val, {
    left: canvas.width/2 - 80, top: canvas.height/2 - 20,
    fontFamily: selectedFont, fontSize: 28,
    fill: selectedTextColor, editable: true,
  });
  canvas.add(t); canvas.setActiveObject(t); canvas.renderAll();
  closeTextModal();
}

// ═══ IMAGES ═══
function addImageFromFile() {
  const input = document.createElement('input');
  input.type = 'file'; input.accept = 'image/*';
  input.onchange = e => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = f => {
      fabric.Image.fromURL(f.target.result, img => {
        const scale = Math.min((canvas.width*0.55)/img.width, (canvas.height*0.55)/img.height);
        img.scale(scale);
        img.set({ left: 40 + Math.random()*60, top: 40 + Math.random()*60 });
        canvas.add(img); canvas.setActiveObject(img); canvas.renderAll();
      });
    };
    reader.readAsDataURL(file);
  };
  input.click();
}

// ═══ FRAMES ═══
function addFrame(type) {
  const w = 200, h = 200;
  const cx = canvas.width/2, cy = canvas.height/2;
  let obj;
  const frameStyles = {
    simple: { stroke:'#9b7fa6', strokeWidth:3, fill:'transparent', rx:0 },
    double: { stroke:'#f4a7c3', strokeWidth:2, fill:'transparent', rx:0, _double: true },
    rounded: { stroke:'#f4a7c3', strokeWidth:3, fill:'transparent', rx:20 },
    dashed: { stroke:'#c9a84c', strokeWidth:2, fill:'transparent', strokeDashArray:[8,5] },
    shadow: { stroke:'#9b7fa6', strokeWidth:2, fill:'transparent',
              shadow: new fabric.Shadow({ color:'rgba(155,127,166,0.6)', blur:15, offsetX:6, offsetY:6 }) },
    polaroid: { stroke:'#ddd', strokeWidth:1, fill:'#fffef0', rx:2 },
    vintage: { stroke:'#c9a84c', strokeWidth:3, fill:'transparent', strokeDashArray:[4,2,1,2] },
    gold: { stroke:'#c9a84c', strokeWidth:3, fill:'transparent',
            shadow: new fabric.Shadow({ color:'rgba(201,168,76,0.5)', blur:12 }) },
    moon: { stroke:'#f0e8ff', strokeWidth:2, fill:'rgba(244,167,195,0.05)', rx:8,
            shadow: new fabric.Shadow({ color:'rgba(244,167,195,0.4)', blur:16 }) },
    floral: { stroke:'#f4a7c3', strokeWidth:2, fill:'rgba(244,167,195,0.03)', rx:12 },
  };
  const s = frameStyles[type] || frameStyles.simple;
  if (type === 'polaroid') {
    const group = new fabric.Group([
      new fabric.Rect({ width:w, height:h+40, fill:'#fffef0', stroke:'#ddd', strokeWidth:1, rx:2, originX:'center', originY:'center' }),
      new fabric.Rect({ width:w-20, height:h-20, fill:'rgba(200,200,200,0.1)', stroke:'#eee', strokeWidth:1, top:-25, originX:'center', originY:'center' }),
    ], { left:cx-w/2, top:cy-h/2 });
    canvas.add(group); canvas.setActiveObject(group); canvas.renderAll();
    return;
  }
  obj = new fabric.Rect({ left:cx-w/2, top:cy-h/2, width:w, height:h, ...s });
  if (s._double) {
    const inner = new fabric.Rect({ left:cx-w/2+8, top:cy-h/2+8, width:w-16, height:h-16, stroke:'#f4a7c3', strokeWidth:1, fill:'transparent' });
    canvas.add(inner);
  }
  canvas.add(obj); canvas.setActiveObject(obj); canvas.renderAll();
  closePanel('frames');
}

function applyMask(shape) {
  const obj = canvas.getActiveObject();
  if (!obj || obj.type !== 'image') {
    alert('Сначала выбери картинку на холсте'); return;
  }
  let clip;
  const w = obj.getScaledWidth(), h = obj.getScaledHeight();
  if (shape === 'circle') {
    clip = new fabric.Circle({ radius: Math.min(w,h)/2, originX:'center', originY:'center' });
  } else if (shape === 'hexagon') {
    const r = Math.min(w,h)/2;
    const pts = Array.from({length:6},(_,i) => ({
      x: r*Math.cos(Math.PI/180*(60*i-30)),
      y: r*Math.sin(Math.PI/180*(60*i-30))
    }));
    clip = new fabric.Polygon(pts, { originX:'center', originY:'center' });
  } else {
    clip = new fabric.Circle({ radius: Math.min(w,h)/2, originX:'center', originY:'center' });
  }
  obj.clipPath = clip;
  canvas.renderAll();
  closePanel('frames');
}

// ═══ SHAPES ═══
function addShape(type) {
  const cx = canvas.width/2, cy = canvas.height/2;
  const colors = ['rgba(244,167,195,0.25)','rgba(201,168,76,0.2)','rgba(155,127,166,0.2)'];
  const stroke = ['#f4a7c3','#c9a84c','#9b7fa6'][Math.floor(Math.random()*3)];
  const fill = colors[Math.floor(Math.random()*colors.length)];
  let obj;
  if (type === 'rect') {
    obj = new fabric.Rect({ left:cx-60, top:cy-60, width:120, height:120, fill, stroke, strokeWidth:2, rx:8 });
  } else if (type === 'circle') {
    obj = new fabric.Circle({ left:cx-50, top:cy-50, radius:50, fill, stroke, strokeWidth:2 });
  } else if (type === 'line') {
    obj = new fabric.Line([cx-80, cy, cx+80, cy], { stroke, strokeWidth:3, strokeLineCap:'round' });
  }
  if (obj) { canvas.add(obj); canvas.setActiveObject(obj); canvas.renderAll(); }
}

// ═══ STICKERS ═══
function initStickers() {
  const emojis1 = ['🌸','🌺','🌻','🌹','🌷','🌼','🌿','🍀','🌱','🍃','🌙','⭐','✨','💫','🌟','🔮','💜','🪄','🕯️','🌌','🦋','🌈','☁️','❄️','🍂','🍁','🌊','🔥','💧','🌬'];
  const emojis2 = ['💌','📌','🗝️','📖','✒️','📝','🎀','🎁','🎶','🎵','🍓','🍰','🧁','☕','🫖','🕰️','🪞','🪴','🧸','🪆','🫶','💕','🩷','🤍','💛','🩵','🩶','🤎','🖤','💚'];
  const fill = (id, emojis) => {
    const g = document.getElementById(id);
    if (!g) return;
    g.innerHTML = '';
    emojis.forEach(e => {
      const d = document.createElement('div');
      d.className = 'sticker-item';
      d.textContent = e;
      d.addEventListener('click', () => addSticker(e));
      g.appendChild(d);
    });
  };
  fill('s1', emojis1);
  fill('s2', emojis2);
}
window.addEventListener('load', initStickers);

function addSticker(emoji) {
  const t = new fabric.Text(emoji, {
    left: canvas.width/2 - 24, top: canvas.height/2 - 24,
    fontSize: 48,
  });
  canvas.add(t); canvas.setActiveObject(t); canvas.renderAll();
}

// ═══ DRAW ═══
function toggleDraw() {
  isDrawing = !isDrawing;
  canvas.isDrawingMode = isDrawing;
  const btn = document.getElementById('draw-toggle');
  btn.className = isDrawing ? 'top-btn tb-active' : 'top-btn tb-ghost';
  btn.textContent = isDrawing ? '🛑 Остановить' : '✏️ Включить рисование';
  document.getElementById('sb-draw').classList.toggle('active', isDrawing);
}
function setDrawColor(c, el) {
  if (canvas.freeDrawingBrush) canvas.freeDrawingBrush.color = c;
  document.querySelectorAll('#panel-draw .color-dot').forEach(d => d.classList.remove('active'));
  el.classList.add('active');
}
function setBrushSize(v) {
  if (canvas.freeDrawingBrush) canvas.freeDrawingBrush.width = +v;
  document.getElementById('brush-size-label').textContent = v + 'px';
}
function setBrushOpacity(v) {
  if (canvas.freeDrawingBrush) canvas.freeDrawingBrush.opacity = v/100;
  document.getElementById('brush-opacity-label').textContent = v + '%';
}
function setBrushType(type, el) {
  document.querySelectorAll('#panel-draw .top-btn').forEach(b => b.className = 'top-btn tb-ghost');
  el.className = 'top-btn tb-active';
  if (type === 'pencil') canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
  else if (type === 'circle') canvas.freeDrawingBrush = new fabric.CircleBrush(canvas);
  else if (type === 'spray') canvas.freeDrawingBrush = new fabric.SprayBrush(canvas);
  canvas.freeDrawingBrush.color = '#f4a7c3';
  canvas.freeDrawingBrush.width = +document.getElementById('brush-size').value;
}

// ═══ LAYERING ═══
function bringToFront() { const o=canvas.getActiveObject(); if(o){ canvas.bringToFront(o); canvas.renderAll(); } }
function sendToBack()   { const o=canvas.getActiveObject(); if(o){ canvas.sendToBack(o); canvas.renderAll(); } }
function bringForward() { const o=canvas.getActiveObject(); if(o){ canvas.bringForward(o); canvas.renderAll(); } }
function sendBackward() { const o=canvas.getActiveObject(); if(o){ canvas.sendBackwards(o); canvas.renderAll(); } }
function flipH() { const o=canvas.getActiveObject(); if(o){ o.set('flipX',!o.flipX); canvas.renderAll(); } }
function flipV() { const o=canvas.getActiveObject(); if(o){ o.set('flipY',!o.flipY); canvas.renderAll(); } }
function duplicateSelected() {
  const o = canvas.getActiveObject(); if(!o) return;
  o.clone(clone => {
    clone.set({ left:o.left+20, top:o.top+20 });
    canvas.add(clone); canvas.setActiveObject(clone); canvas.renderAll();
  });
}
function groupSelected() {
  if(!canvas.getActiveObject()) return;
  if(canvas.getActiveObject().type !== 'activeSelection') return;
  canvas.getActiveObject().toGroup();
  canvas.renderAll();
}
function ungroupSelected() {
  const o = canvas.getActiveObject();
  if(o && o.type === 'group') { o.toActiveSelection(); canvas.renderAll(); }
}

// ═══ DELETE / CLEAR ═══
function deleteSelected() {
  const o = canvas.getActiveObject();
  if (o) { canvas.remove(o); canvas.discardActiveObject(); canvas.renderAll(); }
}
function clearCanvas() {
  if (confirm('Очистить весь холст?')) {
    canvas.clear();
    canvas.setBackgroundColor('#ffffff', canvas.renderAll.bind(canvas));
  }
}

// ═══ PROPS PANEL ═══
function updatePropsPanel() {
  const o = canvas.getActiveObject();
  if (!o) return;
  const body = document.getElementById('props-body');
  const isImg = o.type === 'image';
  const isText = o.type === 'i-text' || o.type === 'text';
  body.innerHTML = \`
    <div class="sec-label">Прозрачность</div>
    <div class="slider-row">
      <div class="slider-label"><span></span><span id="op-label">\${Math.round(o.opacity*100)}%</span></div>
      <input type="range" min="0" max="100" value="\${Math.round(o.opacity*100)}" 
        oninput="setObjOpacity(this.value)">
    </div>
    \${isImg ? \`
    <div class="sec-label" style="margin-top:8px">Яркость / Насыщенность</div>
    <div class="slider-row">
      <div class="slider-label"><span>Яркость</span><span id="bright-label">0</span></div>
      <input type="range" min="-100" max="100" value="0" oninput="setFilter('brightness',this.value)">
    </div>
    <div class="slider-row">
      <div class="slider-label"><span>Насыщенность</span><span id="sat-label">0</span></div>
      <input type="range" min="-100" max="100" value="0" oninput="setFilter('saturation',this.value)">
    </div>
    <div class="sec-label" style="margin-top:8px">Фильтры</div>
    <div style="display:flex;gap:6px;flex-wrap:wrap">
      <button class="top-btn tb-ghost" onclick="applyFilter('grayscale')">⬛ Ч/Б</button>
      <button class="top-btn tb-ghost" onclick="applyFilter('sepia')">🟤 Сепия</button>
      <button class="top-btn tb-ghost" onclick="applyFilter('invert')">🔄 Инверт</button>
      <button class="top-btn tb-ghost" onclick="applyFilter('blur')">💨 Blur</button>
      <button class="top-btn tb-ghost" onclick="applyFilter('none')">✕ Убрать</button>
    </div>
    \` : ''}
    \${isText ? \`
    <div class="sec-label" style="margin-top:8px">Размер шрифта</div>
    <div class="slider-row">
      <input type="range" min="8" max="120" value="\${o.fontSize||28}" 
        oninput="setFontSize(this.value)">
    </div>
    \` : ''}
    <div class="sec-label" style="margin-top:8px">Тень</div>
    <div style="display:flex;gap:6px;flex-wrap:wrap">
      <button class="top-btn tb-ghost" onclick="addShadow('pink')">🩷 Розовая</button>
      <button class="top-btn tb-ghost" onclick="addShadow('gold')">✨ Золотая</button>
      <button class="top-btn tb-ghost" onclick="addShadow('dark')">🖤 Тёмная</button>
      <button class="top-btn tb-ghost" onclick="addShadow('none')">✕ Убрать</button>
    </div>
  \`;
}

function setObjOpacity(v) {
  const o = canvas.getActiveObject();
  if (o) { o.set('opacity', v/100); canvas.renderAll(); }
  document.getElementById('op-label').textContent = v + '%';
}
function setFontSize(v) {
  const o = canvas.getActiveObject();
  if (o) { o.set('fontSize', +v); canvas.renderAll(); }
}
function setFilter(type, v) {
  const o = canvas.getActiveObject();
  if (!o || o.type !== 'image') return;
  const val = v/100;
  const idx = o.filters.findIndex(f => f[type] !== undefined);
  if (type === 'brightness') {
    const f = new fabric.Image.filters.Brightness({ brightness: val });
    if (idx >= 0) o.filters[idx] = f; else o.filters.push(f);
    document.getElementById('bright-label').textContent = v;
  } else if (type === 'saturation') {
    const f = new fabric.Image.filters.Saturation({ saturation: val });
    if (idx >= 0) o.filters[idx] = f; else o.filters.push(f);
    document.getElementById('sat-label').textContent = v;
  }
  o.applyFilters(); canvas.renderAll();
}
function applyFilter(type) {
  const o = canvas.getActiveObject();
  if (!o || o.type !== 'image') return;
  o.filters = [];
  if (type === 'grayscale') o.filters.push(new fabric.Image.filters.Grayscale());
  else if (type === 'sepia') o.filters.push(new fabric.Image.filters.Sepia());
  else if (type === 'invert') o.filters.push(new fabric.Image.filters.Invert());
  else if (type === 'blur') o.filters.push(new fabric.Image.filters.Blur({ blur: 0.1 }));
  o.applyFilters(); canvas.renderAll();
}
function addShadow(type) {
  const o = canvas.getActiveObject(); if (!o) return;
  const shadows = {
    pink: new fabric.Shadow({ color:'rgba(244,167,195,0.7)', blur:20, offsetX:4, offsetY:4 }),
    gold: new fabric.Shadow({ color:'rgba(201,168,76,0.6)', blur:16, offsetX:3, offsetY:3 }),
    dark: new fabric.Shadow({ color:'rgba(0,0,0,0.5)', blur:12, offsetX:5, offsetY:5 }),
    none: null,
  };
  o.set('shadow', shadows[type]);
  canvas.renderAll();
}

// ═══ EXPORT ═══
function exportPage() {
  const dataUrl = canvas.toDataURL({ format:'png', multiplier:2 });
  const base64 = dataUrl.split(',')[1];
  const filename = 'scrapbook_' + Date.now() + '.png';
  const msg = JSON.stringify({ type:'EXPORT_PNG', base64, filename });
  if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(msg);
  else window.parent.postMessage({ type:'EXPORT_PNG', base64, filename }, '*');
}

function showTemplateModal() {
  let modal = document.getElementById('template-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'template-modal';
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(13,8,32,0.92);z-index:300;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(12px);';
    const templates = [
      { key:'spring', name:'🌸 Весенний' },
      { key:'night',  name:'🌙 Ночной' },
      { key:'mystic', name:'💜 Мистика' },
      { key:'diary',  name:'📔 Дневник' },
      { key:'collage',name:'🎨 Коллаж' },
      { key:'clean',  name:'✨ Чистый' },
    ];
    const grid = templates.map(t =>
      \`<div onclick="applyTemplate('\${t.key}')" style="padding:14px;border-radius:12px;cursor:pointer;text-align:center;background:rgba(45,27,78,0.4);border:1px solid rgba(244,167,195,0.15);font-size:13px;color:#f0e8ff;font-weight:600;transition:all 0.2s" onmouseover="this.style.borderColor='#f4a7c3';this.style.background='rgba(244,167,195,0.1)'" onmouseout="this.style.borderColor='rgba(244,167,195,0.15)';this.style.background='rgba(45,27,78,0.4)'">\${t.name}</div>\`
    ).join('');
    modal.innerHTML = \`<div style="background:#1e1040;border-radius:20px;padding:24px;width:90%;max-width:420px;border:1px solid rgba(244,167,195,0.25);box-shadow:0 20px 60px rgba(0,0,0,0.6)"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px"><h3 style="color:#f4a7c3;font-size:16px">🌸 Шаблоны</h3><button onclick="document.getElementById('template-modal').remove()" style="background:none;border:none;color:#9b7fa6;font-size:18px;cursor:pointer">✕</button></div><div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">\${grid}</div></div>\`;
    document.body.appendChild(modal);
  } else {
    modal.style.display = 'flex';
  }
}

function applyTemplate(type) {
  canvas.clear();
  const templates = {
    spring: () => {
      canvas.setBackgroundColor('#fdf6f0', canvas.renderAll.bind(canvas));
      ['🌸','🌷','✨'].forEach((e,i) => {
        const t = new fabric.Text(e, { left: 40+i*80, top: canvas.height-80, fontSize:40 });
        canvas.add(t);
      });
      canvas.add(new fabric.IText('Spring Diary 🌸', { left:80, top:60, fontFamily:'Dancing Script', fontSize:36, fill:'#f4a7c3' }));
    },
    night: () => {
      canvas.setBackgroundColor('#1a0f2e', canvas.renderAll.bind(canvas));
      ['🌙','⭐','💫'].forEach((e,i) => {
        const t = new fabric.Text(e, { left: 40+i*80, top: canvas.height-80, fontSize:40 });
        canvas.add(t);
      });
      canvas.add(new fabric.IText('✨ Ночные мысли', { left:60, top:50, fontFamily:'Playfair Display', fontSize:30, fill:'#f0e8ff' }));
    },
    mystic: () => {
      canvas.setBackgroundColor('#2d1b4e', canvas.renderAll.bind(canvas));
      ['🔮','🕯️','💜'].forEach((e,i) => {
        const t = new fabric.Text(e, { left: 40+i*80, top: canvas.height-80, fontSize:40 });
        canvas.add(t);
      });
      canvas.add(new fabric.IText('Book of Magic 🪄', { left:50, top:40, fontFamily:'Cormorant Garamond', fontSize:32, fill:'#c9a84c' }));
    },
    diary: () => {
      canvas.setBackgroundColor('#fff9f0', canvas.renderAll.bind(canvas));
      canvas.add(new fabric.Line([40, 80, canvas.width-40, 80], { stroke:'#f4a7c355', strokeWidth:1 }));
      canvas.add(new fabric.IText('Мой дневник 📖', { left:60, top:30, fontFamily:'Playfair Display', fontSize:28, fill:'#c9a84c' }));
    },
    collage: () => {
      const grad = new fabric.Gradient({ type:'linear', gradientUnits:'pixels', coords:{x1:0,y1:0,x2:canvas.width,y2:canvas.height}, colorStops:[{offset:0,color:'#fce4ec'},{offset:1,color:'#f3e5f5'}] });
      canvas.setBackgroundColor(grad, canvas.renderAll.bind(canvas));
      ['🎀','💕','🌸'].forEach((e,i) => {
        const t = new fabric.Text(e, { left: 40+i*80, top: canvas.height-80, fontSize:40 });
        canvas.add(t);
      });
    },
    clean: () => {
      canvas.setBackgroundColor('#ffffff', canvas.renderAll.bind(canvas));
      canvas.add(new fabric.Rect({ left:20, top:20, width:canvas.width-40, height:canvas.height-40, fill:'transparent', stroke:'rgba(244,167,195,0.4)', strokeWidth:2, rx:12 }));
    },
  };
  if (templates[type]) templates[type]();
  canvas.renderAll();
  const m = document.getElementById('template-modal');
  if (m) m.remove();
}

window.addEventListener('message', e => {
  if (e.data && e.data.action === 'EXPORT') exportPage();
  if (e.data && e.data.action === 'LOAD_TEMPLATE') showTemplateModal();
});

document.addEventListener('click', e => {
  const m = document.getElementById('ctx-menu');
  if (m && !m.contains(e.target)) m.style.display = 'none';
});
</script>
</body>
</html>
`;

type WebViewExportMessage = {
  type: 'EXPORT_PNG';
  base64: string;
  filename: string;
};
type WebViewErrorMessage = { type: 'ERROR'; message: string };
type WebViewMessage = WebViewExportMessage | WebViewErrorMessage;

type ScrapEditorProps = {
  htmlContent: string;
  onMessage: (event: { nativeEvent: { data: string } }) => void;
  webViewRef: React.RefObject<any>;
};

const ScrapEditor = ({ htmlContent, onMessage, webViewRef }: ScrapEditorProps) => {
  if (Platform.OS === 'web') {
    React.useEffect(() => {
      const handler = (event: MessageEvent) => {
        if (event.data && event.data.type) {
          onMessage({ nativeEvent: { data: JSON.stringify(event.data) } });
        }
      };
      window.addEventListener('message', handler);
      return () => window.removeEventListener('message', handler);
    }, [onMessage]);

    return (
      <iframe
        ref={webViewRef}
        srcDoc={htmlContent}
        style={{ flex: 1, border: 'none', width: '100%', height: '100%' }}
        allow="camera; microphone"
      />
    );
  }

  const { WebView } = require('react-native-webview');
  return (
    <View style={{ flex: 1, backgroundColor: '#0d0820', marginBottom: 0 }}>
      <WebView
        ref={webViewRef}
        source={{ html: htmlContent }}
        style={{ flex: 1 }}
        scrollEnabled={false}
        overScrollMode="never"
        keyboardDisplayRequiresUserAction={false}
        androidLayerType="hardware"
        onMessage={onMessage}
      />
    </View>
  );
};

export default function ScrapbookScreen(): React.JSX.Element {
  const KNOWLEDGE_FOLDERS = ['Java_Backend', 'Spring', 'Algorithms', 'English', 'Other'];
  const [isSaving, setIsSaving] = useState(false);
  const [savedPages, setSavedPages] = useState<ScrapbookPage[]>([]);
  const [showGallery, setShowGallery] = useState(false);
  const [showSaveMeta, setShowSaveMeta] = useState(false);
  const [pendingExport, setPendingExport] = useState<WebViewExportMessage | null>(null);
  const [pageTitle, setPageTitle] = useState('');
  const [pageTags, setPageTags] = useState('');
  const [linkedTopic, setLinkedTopic] = useState('');
  const [knowledgeFolder, setKnowledgeFolder] = useState('Other');
  const [gallerySearch, setGallerySearch] = useState('');

  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const webViewRef = useRef<any>(null);
  const starAnims = useRef(STARS.map(() => new Animated.Value(0.2))).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const { token, owner, repo, branch } = useSettingsStore.getState();

  useEffect(() => {
    void (async () => {
      const pages = await getSavedScrapbookPages();
      setSavedPages(pages);
    })();
  }, []);

  useEffect(() => {
    starAnims.forEach((anim, i) => {
      const pulse = () => {
        Animated.sequence([
          Animated.timing(anim, {
            toValue: 1,
            duration: STARS[i].duration,
            delay: STARS[i].delay,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0.2,
            duration: STARS[i].duration,
            useNativeDriver: true,
          }),
        ]).start(pulse);
      };
      pulse();
    });
  }, [starAnims]);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.05, duration: 1500, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
      ])
    ).start();
  }, [pulseAnim]);

  const handleWebViewMessage = async (event: { nativeEvent: { data: string } }): Promise<void> => {
    try {
      const data = JSON.parse(event.nativeEvent.data) as WebViewMessage;
      if (data.type === 'EXPORT_PNG') {
        setPendingExport(data);
        if (!pageTitle.trim()) setPageTitle(data.filename.replace(/\.png$/i, ''));
        setShowSaveMeta(true);
      }
      if (data.type === 'ERROR') Alert.alert('Ошибка экспорта', data.message);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      Alert.alert('Ошибка', message);
    }
  };

  const postWebAction = (action: 'EXPORT' | 'NEW' | 'TEMPLATES'): void => {
    webViewRef.current?.contentWindow?.postMessage({ action }, '*');
  };

  const handleSave = (): void => {
    if (Platform.OS !== 'web') {
      try { const H = require('expo-haptics'); H.impactAsync(H.ImpactFeedbackStyle.Medium).catch(() => {}); } catch (_) {}
    }
    if (Platform.OS === 'web') {
      webViewRef.current?.contentWindow?.postMessage({ action: 'EXPORT' }, '*');
    } else {
      webViewRef.current?.injectJavaScript('exportPage(); true;');
    }
  };

  const handleNewPage = (): void => {
    if (Platform.OS === 'web') {
      postWebAction('NEW');
    } else {
      webViewRef.current?.injectJavaScript('newPage(); true;');
    }
  };

  const handleOpenTemplates = (): void => {
    if (Platform.OS === 'web') {
      webViewRef.current?.contentWindow?.postMessage({ action: 'LOAD_TEMPLATE' }, '*');
    } else {
      webViewRef.current?.injectJavaScript('showTemplateModal(); true;');
    }
  };

  const handleConfirmSave = async (): Promise<void> => {
    if (!pendingExport) return;
    setIsSaving(true);
    try {
      const imageResult = await uploadScrapbookImageToGitHub(
        pendingExport.base64,
        pendingExport.filename
      );
      const parsedTags = pageTags.split(',').map((tag) => tag.trim()).filter(Boolean);
      const noteResult = await createScrapbookNoteOnGitHub(
        pendingExport.filename,
        imageResult.path,
        imageResult.imageUrl,
        pageTitle,
        parsedTags,
        linkedTopic,
        knowledgeFolder
      );

      const newPage: ScrapbookPage = {
        id: Date.now(),
        filename: pendingExport.filename,
        githubPath: imageResult.path,
        notePath: noteResult.notePath,
        imageUrl: imageResult.imageUrl,
        title: pageTitle.trim() || pendingExport.filename.replace(/\.png$/i, ''),
        tags: parsedTags,
        linkedTopic: linkedTopic.trim(),
        knowledgeFolder,
        createdAt: new Date().toISOString(),
      };
      const updatedPages = await saveScrapbookPageMetadata(newPage);
      setSavedPages(updatedPages);
      setPendingExport(null);
      setShowSaveMeta(false);
      setPageTitle('');
      setPageTags('');
      setLinkedTopic('');
      setKnowledgeFolder('Other');
      if (Platform.OS !== 'web') {
        try { const H = require('expo-haptics'); H.notificationAsync(H.NotificationFeedbackType.Success).catch(() => {}); } catch (_) {}
      }
      Alert.alert('✅ Сохранено!', 'Скрап и заметка сохранены в GitHub');
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      Alert.alert('❌ Ошибка', message);
    } finally {
      setIsSaving(false);
    }
  };

  const saveButtonText = isSaving ? 'Сохранение...' : '💾 Сохранить';
  const isConfigReady = Boolean(token && owner && repo && branch);
  const filteredPages = savedPages.slice().reverse().filter((item) => {
    const q = gallerySearch.trim().toLowerCase();
    if (!q) return true;
    const haystack = `${item.filename} ${item.title || ''} ${(item.tags || []).join(' ')} ${item.linkedTopic || ''}`.toLowerCase();
    return haystack.includes(q);
  });
  const galleryData = filteredPages.length ? [...filteredPages, { id: -1 } as ScrapbookPage] : [];

  return (
    <LinearGradient
      colors={['#0d0820', '#1a0f2e', '#2d1b4e', '#1a0f2e']}
      locations={[0, 0.3, 0.6, 1]}
      style={styles.container}
    >
      <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
        {STARS.map((star, i) => (
          <Animated.View
            key={star.id}
            style={{
              position: 'absolute',
              width: star.size,
              height: star.size,
              borderRadius: star.size,
              backgroundColor: '#f0e8ff',
              top: `${star.top}%`,
              left: `${star.left}%`,
              opacity: starAnims[i],
            }}
          />
        ))}
      </View>

      <View
        style={[
          styles.header,
          Platform.OS === 'web' ? ({ backdropFilter: 'blur(20px)' } as never) : null,
        ]}
      >
        <View style={styles.titleGlow} />
        <View>
          <Text style={styles.kicker}>✨ Мой дневник</Text>
          <Text style={styles.title}>🌙 Скрапбук</Text>
        </View>
        <View style={styles.headerActions}>
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <TouchableOpacity
              onPress={handleSave}
              style={styles.saveButton}
              disabled={isSaving || !isConfigReady}
            >
              <Text style={styles.saveButtonText}>{saveButtonText}</Text>
            </TouchableOpacity>
          </Animated.View>
          <TouchableOpacity style={styles.galleryButton} onPress={() => setShowGallery(true)}>
            <Text style={styles.galleryButtonText}>🌸 Страницы</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.editorFrame}>
        <ScrapEditor
          htmlContent={FABRIC_HTML}
          onMessage={handleWebViewMessage}
          webViewRef={webViewRef}
        />
      </View>

      <View style={styles.bottomToolbar}>
        <TouchableOpacity style={styles.toolbarGhostBtn} onPress={handleNewPage}>
          <Text style={styles.toolbarGhostText}>✨ Новая</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.toolbarSoftBtn} onPress={handleOpenTemplates}>
          <Text style={styles.toolbarSoftText}>🌸 Шаблоны</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.toolbarGoldBtn} onPress={handleSave} disabled={!isConfigReady || isSaving}>
          <Text style={styles.toolbarGoldText}>📤 Экспорт</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={showGallery} animationType="slide" onRequestClose={() => setShowGallery(false)}>
        <View style={styles.galleryContainer}>
          <View style={styles.galleryHeader}>
            <View>
              <Text style={styles.galleryTitle}>🌸 Мои страницы</Text>
              <Text style={styles.gallerySubtitle}>Все сохранённые работы</Text>
            </View>
            <TouchableOpacity onPress={() => setShowGallery(false)}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
          <TextInput
            value={gallerySearch}
            onChangeText={setGallerySearch}
            placeholder="Поиск: тема, тег, файл..."
            placeholderTextColor={SCRAP_COLORS.textMuted}
            style={styles.searchInput}
          />
          <FlatList
            data={galleryData}
            keyExtractor={(item, index) => `${item.id}-${index}`}
            numColumns={2}
            columnWrapperStyle={styles.galleryRow}
            contentContainerStyle={styles.galleryList}
            renderItem={({ item }) =>
              item.id === -1 ? (
                <TouchableOpacity
                  style={[styles.galleryCard, styles.addCard]}
                  onPress={() => {
                    setShowGallery(false);
                    handleNewPage();
                  }}
                >
                  <Text style={styles.addCardPlus}>+</Text>
                  <Text style={styles.addCardText}>Новая страница</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={styles.galleryCard} onPress={() => setShowGallery(false)}>
                  {item.imageUrl || item.githubPath ? (
                    <Image
                      source={{
                        uri:
                          item.imageUrl ||
                          `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${item.githubPath}`,
                      }}
                      style={styles.galleryThumb}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={styles.galleryThumbPlaceholder}>
                      <Text style={styles.placeholderEmoji}>🌸</Text>
                    </View>
                  )}
                  <View style={styles.galleryCardBody}>
                    <Text style={styles.pageTitle} numberOfLines={1}>
                      {item.filename}
                    </Text>
                    <Text style={styles.pageDate}>
                      {new Date(item.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                </TouchableOpacity>
              )
            }
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Text style={styles.emptyEmoji}>🌙</Text>
                <Text
                  style={{
                    fontSize: 22,
                    fontWeight: '700',
                    color: '#f0e8ff',
                    fontFamily: Platform.OS === 'web' ? 'Georgia, serif' : 'serif',
                    marginTop: 20,
                    textAlign: 'center',
                  }}
                >
                  Твой дневник пуст
                </Text>
                <Text style={{ fontSize: 14, color: '#9b7fa6', marginTop: 8, textAlign: 'center' }}>
                  Создай первую волшебную страницу ✨
                </Text>
                <TouchableOpacity
                  style={styles.emptyActionButton}
                  onPress={() => {
                    setShowGallery(false);
                    handleNewPage();
                  }}
                >
                  <Text style={styles.emptyActionButtonText}>✨ Создать</Text>
                </TouchableOpacity>
              </View>
            }
          />
        </View>
      </Modal>

      <Modal
        visible={showSaveMeta}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSaveMeta(false)}
      >
        <View style={styles.saveOverlay}>
          <View style={styles.saveCard}>
            <Text style={styles.saveTitle}>💾 Сохранить скрап</Text>
            <Text style={styles.inputLabel}>Название</Text>
            <TextInput
              value={pageTitle}
              onChangeText={setPageTitle}
              placeholder="Название страницы"
              placeholderTextColor={SCRAP_COLORS.textMuted}
              style={styles.input}
            />
            <Text style={styles.inputLabel}>Теги</Text>
            <TextInput
              value={pageTags}
              onChangeText={setPageTags}
              placeholder="Теги через запятую: java, spring"
              placeholderTextColor={SCRAP_COLORS.textMuted}
              style={styles.input}
            />
            <Text style={styles.inputLabel}>Связь с Knowledge</Text>
            <TextInput
              value={linkedTopic}
              onChangeText={setLinkedTopic}
              placeholder="Связать с темой Knowledge (например: HashMap)"
              placeholderTextColor={SCRAP_COLORS.textMuted}
              style={styles.input}
            />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.folderRow}>
              {KNOWLEDGE_FOLDERS.map((folder) => (
                <TouchableOpacity
                  key={folder}
                  style={[styles.folderChip, knowledgeFolder === folder && styles.folderChipActive]}
                  onPress={() => setKnowledgeFolder(folder)}
                >
                  <Text
                    style={[styles.folderChipText, knowledgeFolder === folder && styles.folderChipTextActive]}
                  >
                    {folder}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <View style={styles.saveActions}>
              <TouchableOpacity style={styles.galleryButton} onPress={() => setShowSaveMeta(false)}>
                <Text style={styles.galleryButtonText}>Отмена</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={() => void handleConfirmSave()} disabled={isSaving}>
                <Text style={styles.saveButtonText}>{isSaving ? 'Сохранение...' : 'Сохранить'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    height: 72,
    backgroundColor: 'rgba(45, 27, 78, 0.7)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(244, 167, 195, 0.15)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  titleGlow: {
    position: 'absolute',
    left: 10,
    top: 0,
    bottom: 0,
    width: 200,
    backgroundColor: 'rgba(244, 167, 195, 0.04)',
    borderRadius: 100,
  },
  kicker: { fontSize: 10, color: SCRAP_COLORS.textMuted, letterSpacing: 2, textTransform: 'uppercase' },
  title: { fontSize: 20, fontWeight: '700', color: SCRAP_COLORS.text, fontFamily: 'serif' },
  headerActions: { flexDirection: 'row', alignItems: 'center' },
  saveButton: {
    backgroundColor: SCRAP_COLORS.accent,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    shadowColor: SCRAP_COLORS.accentGlow,
    shadowRadius: 12,
    shadowOpacity: 1,
    elevation: 8,
  },
  saveButtonText: { color: '#1a0f2e', fontWeight: '700', fontSize: 13 },
  galleryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: SCRAP_COLORS.gold,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginLeft: 8,
  },
  galleryButtonText: { color: SCRAP_COLORS.gold, fontSize: 13 },
  editorFrame: {
    flex: 1,
    margin: 12,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(244, 167, 195, 0.25)',
    shadowColor: '#f4a7c3',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  bottomToolbar: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 14,
    paddingHorizontal: 20,
    backgroundColor: SCRAP_COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: SCRAP_COLORS.border,
  },
  toolbarGhostBtn: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: SCRAP_COLORS.border,
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  toolbarGhostText: { color: SCRAP_COLORS.text, fontSize: 13 },
  toolbarSoftBtn: {
    backgroundColor: SCRAP_COLORS.surface2,
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  toolbarSoftText: { color: SCRAP_COLORS.accent, fontSize: 13 },
  toolbarGoldBtn: {
    backgroundColor: SCRAP_COLORS.gold,
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 10,
    shadowColor: SCRAP_COLORS.goldGlow,
    shadowRadius: 10,
    shadowOpacity: 1,
    elevation: 6,
  },
  toolbarGoldText: { color: '#1a0f2e', fontWeight: '700', fontSize: 13 },
  galleryContainer: { flex: 1, backgroundColor: SCRAP_COLORS.bg },
  galleryHeader: {
    backgroundColor: SCRAP_COLORS.surface,
    paddingHorizontal: 20,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  galleryTitle: { color: SCRAP_COLORS.text, fontFamily: 'serif', fontWeight: '700', fontSize: 20 },
  gallerySubtitle: { color: SCRAP_COLORS.textMuted, fontSize: 12 },
  closeButtonText: { color: SCRAP_COLORS.textMuted, fontSize: 22 },
  searchInput: {
    margin: 16,
    marginBottom: 0,
    backgroundColor: SCRAP_COLORS.surface2,
    borderWidth: 1,
    borderColor: SCRAP_COLORS.border,
    borderRadius: 12,
    color: SCRAP_COLORS.text,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 13,
  },
  galleryList: { padding: 16, paddingBottom: 24 },
  galleryRow: { gap: 12 },
  galleryCard: {
    flex: 1,
    maxWidth: '48%',
    backgroundColor: 'rgba(45, 27, 78, 0.6)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(244, 167, 195, 0.2)',
    overflow: 'hidden',
    shadowColor: '#c9a84c',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  galleryThumb: { width: '100%', height: 120 },
  galleryThumbPlaceholder: {
    width: '100%',
    height: 120,
    backgroundColor: SCRAP_COLORS.surface2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderEmoji: { fontSize: 32 },
  galleryCardBody: { padding: 12 },
  pageTitle: { color: SCRAP_COLORS.accent, fontSize: 12, fontWeight: '600' },
  pageDate: { color: SCRAP_COLORS.textMuted, fontSize: 11, marginTop: 2 },
  addCard: { borderStyle: 'dashed', minHeight: 176, alignItems: 'center', justifyContent: 'center' },
  addCardPlus: { fontSize: 28, color: SCRAP_COLORS.accentGlow, lineHeight: 30 },
  addCardText: { fontSize: 12, color: SCRAP_COLORS.textMuted, marginTop: 8 },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyEmoji: { fontSize: 72 },
  emptyActionButton: {
    marginTop: 18,
    backgroundColor: SCRAP_COLORS.accent,
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  emptyActionButtonText: { color: '#1a0f2e', fontWeight: '700' },
  saveOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    padding: 20,
  },
  saveCard: {
    backgroundColor: SCRAP_COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: SCRAP_COLORS.border,
    padding: 20,
  },
  saveTitle: { color: SCRAP_COLORS.text, fontFamily: 'serif', fontWeight: '700', fontSize: 20, marginBottom: 12 },
  inputLabel: { color: SCRAP_COLORS.textMuted, fontSize: 11, fontWeight: '600', marginBottom: 6, marginTop: 2 },
  input: {
    backgroundColor: SCRAP_COLORS.surface2,
    borderWidth: 1,
    borderColor: SCRAP_COLORS.border,
    borderRadius: 12,
    color: SCRAP_COLORS.text,
    fontSize: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
  },
  folderRow: { gap: 8, marginBottom: 8 },
  folderChip: {
    backgroundColor: SCRAP_COLORS.surface2,
    borderWidth: 1,
    borderColor: SCRAP_COLORS.border,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  folderChipActive: { backgroundColor: SCRAP_COLORS.accentGlow, borderColor: SCRAP_COLORS.accent },
  folderChipText: { color: SCRAP_COLORS.textMuted, fontSize: 11 },
  folderChipTextActive: { color: SCRAP_COLORS.accent, fontWeight: '700' },
  saveActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 8 },
});
