// ═══════════════════════════════
// VARIABLES GLOBALES
// ═══════════════════════════════
const canvas = document.getElementById('juego');
const ctx = canvas.getContext('2d');
const TAM = 20;
const COLS = canvas.width / TAM;
const FILAS = canvas.height / TAM;

let serpiente, direccion, siguiente, comida, puntos, nivel, nombreJugador;
let obstaculos = [];
let loop = null;
let tiempoInicio = null;
let tick = 0;
let particulas = [];
let shakeFrames = 0;
let comidaScale = 1, comidaDir = 1;

// ═══════════════════════════════
// INICIO
// ═══════════════════════════════
function iniciarJuego() {
  const input = document.getElementById('nombre').value.trim();
  if (!input) { alert('Escribe tu nombre'); return; }
  nombreJugador = input;
  document.getElementById('txt-nombre').textContent = nombreJugador;
  document.getElementById('pantalla-inicio').classList.add('oculto');
  document.getElementById('pantalla-juego').classList.remove('oculto');
  document.addEventListener('keydown', cambiarDireccion);
  iniciarNivel(1);
}

function reiniciarJuego() {
  document.getElementById('pantalla-juego').classList.add('oculto');
  document.getElementById('pantalla-inicio').classList.remove('oculto');
  document.getElementById('nombre').value = '';
  clearInterval(loop);
}

function iniciarNivel(n) {
  nivel = n;
  puntos = nivel === 1 ? 0 : puntos;
  serpiente = [{ x: 12, y: 12 }, { x: 11, y: 12 }, { x: 10, y: 12 }];
  direccion = { x: 1, y: 0 };
  siguiente = { x: 1, y: 0 };
  obstaculos = generarObstaculos(nivel);
  tiempoInicio = Date.now();
  tick = 0;
  particulas = [];
  document.getElementById('txt-nivel').textContent = nivel;
  document.getElementById('txt-puntos').textContent = puntos;
  actualizarBarra();

  if (nivel === 2) {
    mostrarTransicion('🌵 ¡NIVEL 2! Esquiva las grietas...', '#e67e22');
  } else {
    document.getElementById('mensaje').textContent = '';
  }

  colocarComida();
  clearInterval(loop);
  const velocidad = nivel === 1 ? 150 : 100;
  loop = setInterval(gameLoop, velocidad);
}

// ═══════════════════════════════
// TRANSICIÓN ANIMADA
// ═══════════════════════════════
function mostrarTransicion(texto, color) {
  const el = document.getElementById('mensaje');
  el.textContent = texto;
  el.style.color = color;
  el.style.transform = 'scale(1.4)';
  el.style.transition = 'transform 0.4s ease';
  setTimeout(() => {
    el.style.transform = 'scale(1)';
  }, 400);
  setTimeout(() => {
    el.textContent = '';
  }, 2000);
}

// ═══════════════════════════════
// BARRA DE PROGRESO
// ═══════════════════════════════
function actualizarBarra() {
  const meta = nivel === 1 ? 100 : 200;
  const base = nivel === 1 ? 0 : 100;
  const pct = Math.min(((puntos - base) / (meta - base)) * 100, 100);
  const barra = document.getElementById('barra-progreso');
  if (barra) barra.style.width = pct + '%';
}

// ═══════════════════════════════
// OBSTÁCULOS
// ═══════════════════════════════
function generarObstaculos(n) {
  if (n === 1) {
    return [
      { x: 5,  y: 5  }, { x: 6,  y: 5  },
      { x: 18, y: 8  }, { x: 18, y: 9  },
      { x: 10, y: 18 }, { x: 11, y: 18 },
      { x: 3,  y: 15 }, { x: 20, y: 20 }
    ];
  } else {
    return [
      { x: 5,  y: 5  }, { x: 6,  y: 5  },
      { x: 18, y: 8  }, { x: 18, y: 9  },
      { x: 10, y: 18 }, { x: 11, y: 18 },
      { x: 3,  y: 15 }, { x: 20, y: 20 },
      { x: 8,  y: 3  }, { x: 15, y: 15 },
      { x: 2,  y: 20 }, { x: 22, y: 12 },
      { x: 13, y: 7  }, { x: 7,  y: 20 }
    ];
  }
}

// ═══════════════════════════════
// COMIDA
// ═══════════════════════════════
function colocarComida() {
  let pos;
  do {
    pos = {
      x: Math.floor(Math.random() * COLS),
      y: Math.floor(Math.random() * FILAS)
    };
  } while (
    serpiente.some(s => s.x === pos.x && s.y === pos.y) ||
    obstaculos.some(o => o.x === pos.x && o.y === pos.y)
  );
  comida = pos;
}

// ═══════════════════════════════
// DIRECCIÓN
// ═══════════════════════════════
function cambiarDireccion(e) {
  const teclas = {
    ArrowUp:    { x: 0,  y: -1 },
    ArrowDown:  { x: 0,  y:  1 },
    ArrowLeft:  { x: -1, y:  0 },
    ArrowRight: { x: 1,  y:  0 }
  };
  const nueva = teclas[e.key];
  if (!nueva) return;
  if (nueva.x === -direccion.x && nueva.y === -direccion.y) return;
  siguiente = nueva;
  e.preventDefault();
}

// ═══════════════════════════════
// GAME LOOP
// ═══════════════════════════════
function gameLoop() {
  tick++;
  direccion = siguiente;

  // animación pulsante comida
  comidaScale += 0.04 * comidaDir;
  if (comidaScale > 1.15 || comidaScale < 0.85) comidaDir *= -1;

  const cabeza = {
    x: serpiente[0].x + direccion.x,
    y: serpiente[0].y + direccion.y
  };

  if (cabeza.x < 0 || cabeza.x >= COLS || cabeza.y < 0 || cabeza.y >= FILAS) {
    return gameOver();
  }
  if (serpiente.some(s => s.x === cabeza.x && s.y === cabeza.y)) {
    return gameOver();
  }
  if (obstaculos.some(o => o.x === cabeza.x && o.y === cabeza.y)) {
    return gameOver();
  }

  serpiente.unshift(cabeza);

  if (cabeza.x === comida.x && cabeza.y === comida.y) {
    puntos += nivel === 1 ? 10 : 20;
    document.getElementById('txt-puntos').textContent = puntos;
    actualizarBarra();
    spawnParticulas(cabeza.x * TAM + TAM / 2, cabeza.y * TAM + TAM / 2, '#e74c3c', 8);
    colocarComida();

    if (nivel === 1 && puntos >= 100) {
      clearInterval(loop);
      mostrarTransicion('🎉 ¡Pasaste al Nivel 2!', '#f1c40f');
      setTimeout(() => iniciarNivel(2), 1500);
      return;
    }
    if (nivel === 2 && puntos >= 200) {
      clearInterval(loop);
      return victoria();
    }
  } else {
    serpiente.pop();
  }

  actualizarParticulas();
  dibujar();
}

// ═══════════════════════════════
// PARTÍCULAS
// ═══════════════════════════════
function spawnParticulas(x, y, color, cantidad) {
  for (let i = 0; i < cantidad; i++) {
    particulas.push({
      x, y,
      vx: (Math.random() - 0.5) * 6,
      vy: (Math.random() - 0.5) * 6,
      vida: 1,
      color,
      r: Math.random() * 4 + 2
    });
  }
}

function actualizarParticulas() {
  particulas = particulas.filter(p => p.vida > 0);
  particulas.forEach(p => {
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.2;
    p.vida -= 0.06;
    p.r *= 0.95;
  });
}

function dibujarParticulas() {
  particulas.forEach(p => {
    ctx.save();
    ctx.globalAlpha = p.vida;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });
}

// ═══════════════════════════════
// DIBUJO PRINCIPAL
// ═══════════════════════════════
function dibujar() {
  const offsetX = shakeFrames > 0 ? (Math.random() - 0.5) * 8 : 0;
  const offsetY = shakeFrames > 0 ? (Math.random() - 0.5) * 8 : 0;
  if (shakeFrames > 0) shakeFrames--;

  ctx.save();
  ctx.translate(offsetX, offsetY);

  dibujarFondo();
  dibujarObstaculos();
  dibujarComida();
  dibujarSerpiente();
  dibujarParticulas();

  ctx.restore();
}

// ── Fondo con dunas ──────────────────────────────────────────────────────────
function dibujarFondo() {
  // gradiente de arena
  const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  if (nivel === 1) {
    grad.addColorStop(0, '#f0d080');
    grad.addColorStop(1, '#d4a843');
  } else {
    grad.addColorStop(0, '#c8956a');
    grad.addColorStop(1, '#a06030');
  }
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // dunas animadas
  ctx.save();
  ctx.globalAlpha = 0.12;
  ctx.fillStyle = nivel === 1 ? '#8B6914' : '#5a2e00';
  for (let d = 0; d < 3; d++) {
    ctx.beginPath();
    const offset = (tick * 0.3 + d * 60) % canvas.width;
    ctx.moveTo(-offset, canvas.height);
    for (let x = 0; x <= canvas.width + 40; x += 40) {
      ctx.quadraticCurveTo(
        x - 20 - offset, canvas.height - 30 - d * 20,
        x - offset, canvas.height - 10 - d * 15
      );
    }
    ctx.lineTo(canvas.width, canvas.height);
    ctx.fill();
  }
  ctx.restore();

  // grid sutil
  ctx.strokeStyle = 'rgba(0,0,0,0.04)';
  ctx.lineWidth = 0.5;
  for (let i = 0; i < COLS; i++) {
    for (let j = 0; j < FILAS; j++) {
      ctx.strokeRect(i * TAM, j * TAM, TAM, TAM);
    }
  }
}

// ── Obstáculos orgánicos ──────────────────────────────────────────────────────
function dibujarObstaculos() {
  obstaculos.forEach(o => {
    const px = o.x * TAM;
    const py = o.y * TAM;

    if (nivel === 1) {
      // arbusto de algarrobo
      ctx.fillStyle = '#3d6b2e';
      ctx.beginPath();
      ctx.ellipse(px + TAM / 2, py + TAM * 0.65, TAM * 0.45, TAM * 0.38, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#5a9e3f';
      ctx.beginPath();
      ctx.ellipse(px + TAM * 0.35, py + TAM * 0.45, TAM * 0.32, TAM * 0.28, -0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(px + TAM * 0.65, py + TAM * 0.42, TAM * 0.32, TAM * 0.28, 0.3, 0, Math.PI * 2);
      ctx.fill();
      // tronco
      ctx.fillStyle = '#6b4226';
      ctx.fillRect(px + TAM * 0.42, py + TAM * 0.7, TAM * 0.16, TAM * 0.3);
    } else {
      // grieta del terreno
      ctx.strokeStyle = '#3a1a00';
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(px + 4, py + 4);
      ctx.lineTo(px + TAM * 0.5, py + TAM * 0.6);
      ctx.lineTo(px + TAM - 4, py + TAM - 4);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(px + TAM * 0.5, py + TAM * 0.6);
      ctx.lineTo(px + 6, py + TAM - 5);
      ctx.stroke();
      ctx.lineWidth = 1;
      ctx.strokeStyle = '#7a3a10';
      ctx.beginPath();
      ctx.moveTo(px + 8, py + 6);
      ctx.lineTo(px + TAM * 0.45, py + TAM * 0.55);
      ctx.stroke();
    }
  });
}

// ── Comida pulsante ───────────────────────────────────────────────────────────
function dibujarComida() {
  const cx = comida.x * TAM + TAM / 2;
  const cy = comida.y * TAM + TAM / 2;
  const r = (TAM / 2 - 2) * comidaScale;

  // halo brillante
  const halo = ctx.createRadialGradient(cx, cy, r * 0.3, cx, cy, r * 1.6);
  halo.addColorStop(0, 'rgba(231,76,60,0.4)');
  halo.addColorStop(1, 'rgba(231,76,60,0)');
  ctx.fillStyle = halo;
  ctx.beginPath();
  ctx.arc(cx, cy, r * 1.6, 0, Math.PI * 2);
  ctx.fill();

  // cuerpo zapote
  const grad = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, r * 0.1, cx, cy, r);
  grad.addColorStop(0, '#ff6b5b');
  grad.addColorStop(0.6, '#c0392b');
  grad.addColorStop(1, '#7b0e00');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();

  // brillo
  ctx.fillStyle = 'rgba(255,255,255,0.45)';
  ctx.beginPath();
  ctx.ellipse(cx - r * 0.25, cy - r * 0.3, r * 0.28, r * 0.18, -0.5, 0, Math.PI * 2);
  ctx.fill();

  // hojita
  ctx.fillStyle = '#27ae60';
  ctx.beginPath();
  ctx.ellipse(cx + r * 0.2, cy - r * 0.95, r * 0.25, r * 0.12, 0.8, 0, Math.PI * 2);
  ctx.fill();
}

// ── Serpiente con escamas ─────────────────────────────────────────────────────
function dibujarSerpiente() {
  // sombra del cuerpo
  ctx.save();
  ctx.globalAlpha = 0.15;
  serpiente.forEach(seg => {
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.ellipse(
      seg.x * TAM + TAM / 2 + 2,
      seg.y * TAM + TAM / 2 + 3,
      TAM * 0.42, TAM * 0.35, 0, 0, Math.PI * 2
    );
    ctx.fill();
  });
  ctx.restore();

  serpiente.forEach((seg, i) => {
    const px = seg.x * TAM;
    const py = seg.y * TAM;
    const cx = px + TAM / 2;
    const cy = py + TAM / 2;
    const r = TAM * 0.44;

    if (i === 0) {
      // cabeza
      const headGrad = ctx.createRadialGradient(cx - 2, cy - 2, 1, cx, cy, r * 1.1);
      headGrad.addColorStop(0, '#3aab3a');
      headGrad.addColorStop(1, '#1a5c1a');
      ctx.fillStyle = headGrad;
      ctx.beginPath();
      ctx.ellipse(cx, cy, r * 1.1, r, 0, 0, Math.PI * 2);
      ctx.fill();

      // ojos según dirección
      const ox = direccion.x, oy = direccion.y;
      const ex = cx + ox * r * 0.4;
      const ey = cy + oy * r * 0.4;
      const perp = { x: -oy, y: ox };

      [1, -1].forEach(side => {
        const eyeX = ex + perp.x * r * 0.38;
        const eyeY = ey + perp.y * r * 0.38;
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(eyeX, eyeY, 3.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#111';
        ctx.beginPath();
        ctx.arc(eyeX + ox * 0.8, eyeY + oy * 0.8, 1.8, 0, Math.PI * 2);
        ctx.fill();
        perp.x *= -1; perp.y *= -1;
      });

      // lengua animada
      if (tick % 8 < 4) {
        ctx.strokeStyle = '#e74c3c';
        ctx.lineWidth = 1.5;
        ctx.lineCap = 'round';
        ctx.beginPath();
        const lx = cx + ox * r * 1.1;
        const ly = cy + oy * r * 1.1;
        ctx.moveTo(lx, ly);
        ctx.lineTo(lx + ox * 5, ly + oy * 5);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(lx + ox * 5, ly + oy * 5);
        ctx.lineTo(lx + ox * 5 + oy * 3, ly + oy * 5 - ox * 3);
        ctx.moveTo(lx + ox * 5, ly + oy * 5);
        ctx.lineTo(lx + ox * 5 - oy * 3, ly + oy * 5 + ox * 3);
        ctx.stroke();
      }

    } else {
      // cuerpo con escamas
      const t = i / serpiente.length;
      const verde = Math.floor(180 - t * 60);
      const bodyGrad = ctx.createRadialGradient(cx - 1, cy - 1, 1, cx, cy, r);
      bodyGrad.addColorStop(0, `rgb(80,${verde + 40},80)`);
      bodyGrad.addColorStop(1, `rgb(30,${verde},30)`);
      ctx.fillStyle = bodyGrad;
      ctx.beginPath();
      ctx.ellipse(cx, cy, r, r * 0.88, 0, 0, Math.PI * 2);
      ctx.fill();

      // escama
      if (i % 2 === 0) {
        ctx.strokeStyle = 'rgba(0,0,0,0.15)';
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.arc(cx, cy, r * 0.55, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
  });
}

// ═══════════════════════════════
// GAME OVER
// ═══════════════════════════════
function gameOver() {
  clearInterval(loop);
  shakeFrames = 12;

  // spawn partículas rojas
  spawnParticulas(
    serpiente[0].x * TAM + TAM / 2,
    serpiente[0].y * TAM + TAM / 2,
    '#e74c3c', 20
  );

  let frame = 0;
  function animarGameOver() {
    actualizarParticulas();
    dibujar();

    frame++;
    const alpha = Math.min(frame / 20, 0.78);

    ctx.fillStyle = `rgba(80,0,0,${alpha})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (frame < 20) {
      requestAnimationFrame(animarGameOver);
      return;
    }

    // panel
    ctx.fillStyle = 'rgba(20,0,0,0.9)';
    roundRect(ctx, canvas.width/2 - 160, canvas.height/2 - 80, 320, 160, 16);
    ctx.fill();
    ctx.strokeStyle = '#c0392b';
    ctx.lineWidth = 2;
    roundRect(ctx, canvas.width/2 - 160, canvas.height/2 - 80, 320, 160, 16);
    ctx.stroke();

    ctx.fillStyle = 'white';
    ctx.font = 'bold 26px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('💀 ¡Atrapada!', canvas.width / 2, canvas.height / 2 - 30);
    ctx.font = '18px Arial';
    ctx.fillStyle = '#ffaaaa';
    ctx.fillText(`Puntos: ${puntos}`, canvas.width / 2, canvas.height / 2 + 5);

    // botón reintentar
    mostrarBotonReintentar();
  }
  animarGameOver();
}

// ═══════════════════════════════
// VICTORIA
// ═══════════════════════════════
function victoria() {
  clearInterval(loop);
  const tiempoTotal = Math.floor((Date.now() - tiempoInicio) / 1000);

  // confetti
  for (let i = 0; i < 60; i++) {
    particulas.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height * 0.5,
      vx: (Math.random() - 0.5) * 5,
      vy: Math.random() * 3 + 1,
      vida: 1,
      color: ['#f1c40f','#e74c3c','#2ecc71','#3498db','#9b59b6'][Math.floor(Math.random()*5)],
      r: Math.random() * 5 + 3
    });
  }

  let frame = 0;
  function animarVictoria() {
    actualizarParticulas();
    dibujar();
    frame++;
    const alpha = Math.min(frame / 25, 0.82);

    ctx.fillStyle = `rgba(0,60,0,${alpha})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    dibujarParticulas();

    if (frame < 25) {
      requestAnimationFrame(animarVictoria);
      return;
    }

    // panel victoria
    ctx.fillStyle = 'rgba(0,30,0,0.92)';
    roundRect(ctx, canvas.width/2 - 170, canvas.height/2 - 90, 340, 180, 16);
    ctx.fill();
    ctx.strokeStyle = '#f1c40f';
    ctx.lineWidth = 2.5;
    roundRect(ctx, canvas.width/2 - 170, canvas.height/2 - 90, 340, 180, 16);
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.fillStyle = '#f1c40f';
    ctx.font = 'bold 28px Arial';
    ctx.fillText('🏆 ¡La Macanche Escapó!', canvas.width / 2, canvas.height / 2 - 38);
    ctx.fillStyle = 'white';
    ctx.font = '18px Arial';
    ctx.fillText(`Puntos: ${puntos}  |  Tiempo: ${tiempoTotal}s`, canvas.width / 2, canvas.height / 2 - 5);
    ctx.fillStyle = '#aaffaa';
    ctx.font = '15px Arial';
    ctx.fillText('Guardando récord...', canvas.width / 2, canvas.height / 2 + 25);

    mostrarBotonReintentar('victoria');
    guardarRecord(tiempoTotal);
  }
  animarVictoria();
}

// ═══════════════════════════════
// BOTÓN REINTENTAR (HTML overlay)
// ═══════════════════════════════
function mostrarBotonReintentar(tipo = 'gameover') {
  let btn = document.getElementById('btn-reintentar');
  if (!btn) {
    btn = document.createElement('button');
    btn.id = 'btn-reintentar';
    document.getElementById('pantalla-juego').appendChild(btn);
  }
  btn.textContent = tipo === 'victoria' ? '🔄 Jugar de nuevo' : '🔄 Reintentar';
  btn.style.cssText = `
    display:block; margin: 12px auto 0;
    padding: 10px 28px; font-size: 1rem; font-weight: bold;
    background: ${tipo === 'victoria' ? '#f1c40f' : '#c0392b'};
    color: ${tipo === 'victoria' ? '#1a1a1a' : 'white'};
    border: none; border-radius: 8px; cursor: pointer;
    animation: popIn 0.3s ease;
  `;
  btn.onclick = () => {
    btn.remove();
    reiniciarJuego();
  };
}

// ═══════════════════════════════
// HELPERS
// ═══════════════════════════════
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

// ═══════════════════════════════
// FETCH → PHP
// ═══════════════════════════════
function guardarRecord(tiempo) {
  const datos = JSON.stringify({
    nombre_jugador: nombreJugador,
    puntaje_total: puntos,
    tiempo_segundos: tiempo,
    nivel_alcanzado: 2
  });

  fetch('https://isakna.infinityfreeapp.com/backend/guardar_record.php', {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: datos
  })
  .then(r => r.json())
  .then(data => {
    const el = document.getElementById('txt-record');
    if (el) el.textContent = data.mensaje || '¡Récord guardado!';
  })
  .catch(() => {
    const el = document.getElementById('txt-record');
    if (el) el.textContent = '(Sin conexión al servidor)';
  });
}