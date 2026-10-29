// Inteligência Médica — frontend: aulas, sala ao vivo e perguntas ao mestre.
let AULAS = [];
let filtroAtual = "Todos";
let aulaAtual = null;
let falaAtiva = null;

// ---- Fundos da sala: limpos, brancos, medicina + tecnologia juntos ----
const FUNDOS = [
  { id: "clinico", nome: "Branco Clínico", bg: "#ffffff",
    decor: `<svg width="100%" height="100%" preserveAspectRatio="none" viewBox="0 0 800 300"><g stroke="#dbeafe" stroke-width="2" fill="none"><path d="M0 150 H180 L210 110 L240 190 L270 150 H800"/></g><g fill="#eff6ff" stroke="#bfdbfe"><circle cx="700" cy="60" r="26"/><path d="M700 48 v24 M688 60 h24"/></g><g fill="#eff6ff" stroke="#bfdbfe"><circle cx="90" cy="240" r="20"/><path d="M90 230 v20 M80 240 h20"/></g></svg>` },
  { id: "coracao", nome: "Coração Digital", bg: "linear-gradient(180deg,#ffffff,#f0f9ff)",
    decor: `<svg width="100%" height="100%" preserveAspectRatio="none" viewBox="0 0 800 300"><g stroke="#38bdf8" stroke-width="3" fill="none"><path d="M0 150 H150 L185 90 L220 210 L255 130 L285 150 H800"/></g><g fill="none" stroke="#bae6fd" stroke-width="2"><path d="M120 60 q30 -20 60 0 t60 0 M560 230 q30 -20 60 0 t60 0"/></g><circle cx="660" cy="70" r="30" fill="#f0f9ff" stroke="#7dd3fc"/><path d="M645 70 h10 l8 -14 10 24 8 -10 h14" fill="none" stroke="#0284c7" stroke-width="3"/></svg>` },
  { id: "dna", nome: "DNA e Tecnologia", bg: "linear-gradient(180deg,#ffffff,#faf5ff)",
    decor: `<svg width="100%" height="100%" preserveAspectRatio="none" viewBox="0 0 800 300"><g stroke="#c4b5fd" stroke-width="2" fill="none"><path d="M80 40 Q200 150 80 260 M200 40 Q80 150 200 260 M140 70 H140 M140 110 H140" opacity=".8"/><path d="M100 80 H180 M100 140 H180 M100 200 H180" stroke="#ddd6fe"/></g><g fill="#f5f3ff" stroke="#c4b5fd"><rect x="600" y="50" width="90" height="60" rx="12"/><circle cx="615" cy="65" r="4" fill="#8b5cf6"/><circle cx="675" cy="95" r="4" fill="#8b5cf6"/><path d="M615 65 h40 v20 M655 85 h20" stroke="#8b5cf6" fill="none"/></g></svg>` },
  { id: "futuro", nome: "Consultório Futuro", bg: "#ffffff",
    decor: `<svg width="100%" height="100%" preserveAspectRatio="none" viewBox="0 0 800 300"><g stroke="#e2e8f0" stroke-width="1"><path d="M0 75 H800 M0 150 H800 M0 225 H800 M100 0 V300 M250 0 V300 M400 0 V300 M550 0 V300 M700 0 V300"/></g><g fill="#eff6ff" stroke="#93c5fd"><circle cx="100" cy="75" r="10"/><circle cx="400" cy="150" r="10"/><circle cx="700" cy="225" r="10"/></g><g fill="none" stroke="#93c5fd" stroke-width="2"><path d="M100 75 H250 M400 150 H550 M250 75 V150 M550 150 V225"/></g></svg>` },
  { id: "cuidado", nome: "IA que Cuida", bg: "linear-gradient(180deg,#ffffff,#ecfeff)",
    decor: `<svg width="100%" height="100%" preserveAspectRatio="none" viewBox="0 0 800 300"><ellipse cx="150" cy="80" rx="110" ry="50" fill="#cffafe" opacity=".7"/><ellipse cx="650" cy="220" rx="120" ry="55" fill="#ede9fe" opacity=".7"/><g fill="none" stroke="#22d3ee" stroke-width="3"><path d="M400 90 c-20 -25 -60 -25 -60 5 c0 25 30 45 60 70 c30 -25 60 -45 60 -70 c0 -30 -40 -30 -60 -5z"/></g><circle cx="400" cy="95" r="6" fill="#0ea5e9"/></svg>` },
  { id: "ceu", nome: "Céu Médico", bg: "linear-gradient(180deg,#f8fafc,#ffffff)",
    decor: `<svg width="100%" height="100%" preserveAspectRatio="none" viewBox="0 0 800 300"><g fill="#dbeafe"><circle cx="80" cy="60" r="18"/><path d="M80 50 v20 M70 60 h20" fill="#fff"/></g><g fill="#e0f2fe"><circle cx="720" cy="240" r="22"/><path d="M720 228 v24 M708 240 h24" fill="#fff"/></g><g stroke="#bae6fd" stroke-width="2" fill="none"><path d="M200 200 q40 -30 80 0 t80 0"/></g></svg>` },
];
let fundoAtual = localStorage.getItem("im-fundo") || "clinico";
function aplicarFundo(id) {
  fundoAtual = id; localStorage.setItem("im-fundo", id);
  const f = FUNDOS.find((x) => x.id === id) || FUNDOS[0];
  const palco = document.getElementById("palcoSala");
  palco.style.background = f.bg;
  document.getElementById("palcoDecor").innerHTML = f.decor;
  document.querySelectorAll("#fundoPicker button").forEach((b) => b.classList.toggle("ativo", b.dataset.fundo === id));
}
function renderFundos() {
  const el = document.getElementById("fundoPicker");
  el.innerHTML = "";
  FUNDOS.forEach((f) => {
    const b = document.createElement("button");
    b.type = "button"; b.textContent = f.nome; b.dataset.fundo = f.id;
    b.onclick = () => aplicarFundo(f.id);
    el.appendChild(b);
  });
  aplicarFundo(fundoAtual);
}

// ---- Navegação ----
function irPara(secao) { location.hash = secao; }
window.irPara = irPara;
function mostrar() {
  const hash = (location.hash || "#inicio").replace("#", "");
  let secao = "inicio";
  if (hash === "aulas" || hash === "sala" || hash === "perguntas") secao = hash;
  else if (hash.startsWith("aula-")) { secao = "aula"; mostrarAula(Number(hash.replace("aula-", ""))); }
  document.querySelectorAll(".secao").forEach((s) => s.classList.remove("ativa"));
  const alvo = document.getElementById("secao-" + secao);
  if (alvo) alvo.classList.add("ativa");
  document.querySelectorAll("nav.top button").forEach((b) => b.classList.toggle("ativo", b.dataset.nav === secao || (secao === "aula" && b.dataset.nav === "aulas")));
  window.scrollTo(0, 0);
}
window.addEventListener("hashchange", mostrar);

// ---- Aulas ----
function concluidas() { try { return JSON.parse(localStorage.getItem("im-concluidas") || "[]"); } catch { return []; } }
function salvarConcluidas(lista) { localStorage.setItem("im-concluidas", JSON.stringify(lista)); }
function renderAulas() {
  const lista = AULAS.filter((a) => filtroAtual === "Todos" || a.nivel === filtroAtual);
  const feitas = concluidas();
  document.getElementById("progressoTexto").textContent = `${feitas.length} de ${AULAS.length} aulas concluídas`;
  const el = document.getElementById("listaAulas");
  el.innerHTML = "";
  lista.forEach((a) => {
    const d = document.createElement("div");
    d.className = "card aula" + (feitas.includes(a.id) ? " concluida" : "");
    d.innerHTML = `<span class="nivel">${a.nivel} · ${a.numero}</span><h3>${a.titulo}</h3><p>${a.objetivo}</p><p class="muted">${a.duracao}${feitas.includes(a.id) ? " · Concluída" : ""}</p>`;
    d.onclick = () => irPara("aula-" + a.id);
    el.appendChild(d);
  });
}
function mostrarAula(id) {
  const a = AULAS.find((x) => x.id === id);
  if (!a) return;
  aulaAtual = a;
  const feitas = concluidas();
  document.getElementById("detalheAula").innerHTML = `
    <span class="pill">${a.nivel} · ${a.numero}</span>
    <h2>${a.titulo}</h2>
    <p><strong>Objetivo:</strong> ${a.objetivo}</p>
    <p>${a.resumo}</p>
    <h3>O que você vai aprender</h3><ul>${a.topicos.map((t) => `<li>${t}</li>`).join("")}</ul>
    <h3>Exemplo prático</h3><p>${a.exemplo}</p>
    <h3>Exercício</h3><p>${a.exercicio}</p>
    <p class="aviso"><strong>Lembrete:</strong> a IA apoia, o médico decide. Nada desta aula substitui julgamento clínico, diretriz atual ou a revisão do médico.</p>
    <div class="linha">
      <button class="btn" id="btnOuvirAula">Ouvir aula em áudio</button>
      <button class="btn sec" id="btnConcluirAula">${feitas.includes(a.id) ? "Aula concluída" : "Marcar como concluída"}</button>
    </div>`;
  document.getElementById("btnOuvirAula").onclick = () => {
    if (falaAtiva) { speechSynthesis.cancel(); falaAtiva = null; document.getElementById("btnOuvirAula").textContent = "Ouvir aula em áudio"; return; }
    const texto = `${a.titulo}. ${a.objetivo} ${a.resumo} ${a.topicos.join(". ")} Exemplo: ${a.exemplo} Exercício: ${a.exercicio}`;
    const u = new SpeechSynthesisUtterance(texto);
    u.lang = "pt-BR"; u.rate = 1;
    u.onend = () => { falaAtiva = null; const b = document.getElementById("btnOuvirAula"); if (b) b.textContent = "Ouvir aula em áudio"; };
    falaAtiva = u; speechSynthesis.speak(u);
    document.getElementById("btnOuvirAula").textContent = "Parar áudio";
  };
  document.getElementById("btnConcluirAula").onclick = () => {
    const lista = concluidas();
    if (!lista.includes(a.id)) lista.push(a.id);
    salvarConcluidas(lista); renderAulas(); mostrarAula(a.id);
  };
}
document.querySelectorAll("[data-filtro]").forEach((b) => b.onclick = () => { filtroAtual = b.dataset.filtro; renderAulas(); });

// ---- Sala ao vivo ----
let ws = null, meuPeerId = null, localStream = null, cameraTrackOriginal = null;
let salaToken = sessionStorage.getItem("im-sala-token") || "";
function atualizarBloqueio() { document.body.classList.toggle("sala-bloqueada", !salaToken); }
async function loginSala() {
  const login = document.getElementById("loginSala").value.trim();
  const senha = document.getElementById("senhaSala").value;
  const st = document.getElementById("statusLoginSala");
  st.textContent = "Verificando acesso...";
  try {
    const r = await fetch("/api/sala/entrar", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ login, senha }) });
    const j = await r.json();
    if (!j.ok || !j.token) { st.textContent = j.erro || "Login ou senha incorretos."; st.className = "erro"; return; }
    salaToken = j.token; sessionStorage.setItem("im-sala-token", salaToken);
    atualizarBloqueio();
    st.textContent = "Acesso liberado. Agora digite seu nome e entre na sala.";
    st.className = "ok";
  } catch { st.textContent = "Não consegui verificar o acesso. Tente de novo."; st.className = "erro"; }
}
let pcs = new Map(), salaAtiva = false, micLigado = true, camLigada = true, compartilhando = false, telaStream = null;
let chatVistos = new Set(), pollTimer = null;
const gridVideos = () => document.querySelector("#palcoSala .video-grid");
function setStatus(t) { document.getElementById("statusSala").textContent = t; }
function addChat(m) {
  if (!m || chatVistos.has(m.id) && m.id !== 0) return;
  if (m.id) chatVistos.add(m.id);
  const el = document.getElementById("chatMsgs");
  const d = document.createElement("div");
  d.className = "msg" + (m.sistema ? " sistema" : "");
  const b = document.createElement("b"); b.textContent = m.nome;
  const s = document.createElement("span"); s.textContent = m.texto;
  const sm = document.createElement("small"); sm.textContent = m.em ? new Date(m.em).toLocaleString("pt-BR") : "";
  d.append(b, s, sm);
  el.appendChild(d); el.scrollTop = el.scrollHeight;
}
function atualizarOnline(nomes) {
  document.getElementById("listaOnline").textContent = nomes && nomes.length ? nomes.join(", ") : "ninguém online ainda";
}
function addVideoRemoto(peerId, nome, stream) {
  let box = document.getElementById("video-" + peerId);
  if (!box) {
    box = document.createElement("div"); box.className = "video-box"; box.id = "video-" + peerId;
    box.innerHTML = `<video autoplay playsinline></video><p></p>`;
    gridVideos().appendChild(box);
  }
  box.querySelector("video").srcObject = stream;
  box.querySelector("p").textContent = nome || "Aluno na sala";
}
function removerVideoRemoto(peerId) { const b = document.getElementById("video-" + peerId); if (b) b.remove(); }
function wsEnviar(obj) { if (ws && ws.readyState === 1) ws.send(JSON.stringify(obj)); }
function criarPC(peerId, iniciador) {
  if (pcs.has(peerId)) return pcs.get(peerId);
  const pc = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });
  if (localStream) localStream.getTracks().forEach((t) => pc.addTrack(t, localStream));
  pc.onicecandidate = (e) => { if (e.candidate) wsEnviar({ type: "signal", to: peerId, data: { candidate: e.candidate } }); };
  pc.ontrack = (e) => { const nome = document.getElementById("video-" + peerId)?.querySelector("p")?.textContent || "Aluno na sala"; addVideoRemoto(peerId, nome, e.streams[0]); };
  pc.onnegotiationneeded = async () => {
    if (!iniciador || pc.signalingState !== "stable") return;
    try { const offer = await pc.createOffer(); await pc.setLocalDescription(offer); wsEnviar({ type: "signal", to: peerId, data: { offer } }); } catch {}
  };
  pcs.set(peerId, pc);
  return pc;
}
async function tratarSinal(from, data) {
  try {
    if (data.offer) {
      const pc = criarPC(from, false);
      await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
      const answer = await pc.createAnswer(); await pc.setLocalDescription(answer);
      wsEnviar({ type: "signal", to: from, data: { answer } });
    } else if (data.answer) {
      const pc = pcs.get(from); if (pc) await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
    } else if (data.candidate) {
      const pc = pcs.get(from); if (pc) await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
    }
  } catch (e) { console.warn("Sinal WebRTC falhou", e); }
}
function conectarWS(nome, papel) {
  if (ws && ws.readyState === 1) { wsEnviar({ type: "join", nome, papel }); return; }
  const proto = location.protocol === "https:" ? "wss:" : "ws:";
  ws = new WebSocket(proto + "//" + location.host + "/ws");
  ws.onopen = () => wsEnviar({ type: "join", nome, papel, token: salaToken });
  ws.onmessage = (ev) => {
    let msg; try { msg = JSON.parse(ev.data); } catch { return; }
    if (msg.type === "erro") { salaToken = ""; sessionStorage.removeItem("im-sala-token"); atualizarBloqueio(); setStatus(msg.mensagem || "Acesso negado."); return; }
    if (msg.type === "welcome") {
      meuPeerId = msg.peerId;
      (msg.historico || []).forEach(addChat);
      const nomes = [nome].concat((msg.peers || []).map((p) => p.nome));
      atualizarOnline(nomes);
      (msg.peers || []).forEach((p) => { addVideoRemoto(p.peerId, p.nome, null); criarPC(p.peerId, true); });
    } else if (msg.type === "peer-joined") {
      addVideoRemoto(msg.peerId, msg.nome, null);
      const cur = document.getElementById("listaOnline").textContent;
      atualizarOnline(cur === "ninguém online ainda" ? [msg.nome] : cur.split(", ").concat([msg.nome]));
    } else if (msg.type === "peer-left") {
      removerVideoRemoto(msg.peerId); pcs.get(msg.peerId)?.close(); pcs.delete(msg.peerId);
    } else if (msg.type === "signal") { tratarSinal(msg.from, msg.data); }
    else if (msg.type === "chat") { addChat(msg.mensagem); }
  };
  ws.onclose = () => setStatus("Conexão da sala caiu. O bate-papo continua por atualização automática, se você já entrou.");
}
function iniciarPoll() {
  if (pollTimer) return;
  pollTimer = setInterval(async () => {
    if (!salaAtiva) return;
    try {
      const r = await fetch("/api/sala?token=" + encodeURIComponent(salaToken)); const j = await r.json();
      (j.mensagens || []).forEach(addChat);
      if (j.sala) atualizarOnline(j.sala.online);
    } catch {}
  }, 4000);
}
async function entrarSala(comVideo) {
  if (!salaToken) { alert("Entre primeiro com o login e a senha da sala."); atualizarBloqueio(); return; }
  const nome = document.getElementById("nomeSala").value.trim() || "Aluno";
  const papel = document.getElementById("papelSala").value;
  salaAtiva = true;
  document.getElementById("rotuloLocal").textContent = nome + (papel === "professor" ? " — Professor / Mestre" : " — Aluno");
  if (comVideo) {
    try {
      localStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      cameraTrackOriginal = localStream.getVideoTracks()[0] || null;
      document.getElementById("videoLocal").srcObject = localStream;
      setStatus("Você entrou com câmera e microfone. Aguarde os colegas — o vídeo deles aparece aqui.");
    } catch {
      localStream = null;
      setStatus("Não consegui abrir câmera ou microfone neste navegador. Você entrou só no bate-papo — libere a câmera e entre de novo para aparecer em vídeo.");
    }
  } else {
    setStatus("Você entrou só no bate-papo. Para aparecer em vídeo, saia e entre com câmera e microfone.");
  }
  conectarWS(nome, papel);
  iniciarPoll();
}
document.getElementById("btnLoginSala").onclick = loginSala;
document.getElementById("senhaSala").addEventListener("keydown", (e) => { if (e.key === "Enter") loginSala(); });
document.getElementById("btnEntrarVideo").onclick = () => entrarSala(true);
document.getElementById("btnEntrarChat").onclick = () => entrarSala(false);
document.getElementById("btnSairSala").onclick = () => {
  salaAtiva = false;
  pcs.forEach((pc) => pc.close()); pcs.clear();
  document.querySelectorAll("#palcoSala .video-box:not(:first-child)").forEach((b) => b.remove());
  if (localStream) localStream.getTracks().forEach((t) => t.stop());
  localStream = null;
  if (ws) ws.close(); ws = null;
  document.getElementById("videoLocal").srcObject = null;
  document.getElementById("rotuloLocal").textContent = "Você — ainda fora da sala";
  setStatus("Você saiu da sala.");
};
document.getElementById("btnMic").onclick = (e) => {
  micLigado = !micLigado;
  if (localStream) localStream.getAudioTracks().forEach((t) => (t.enabled = micLigado));
  e.target.textContent = "Microfone: " + (micLigado ? "ligado" : "desligado");
};
document.getElementById("btnCam").onclick = (e) => {
  camLigada = !camLigada;
  if (localStream) localStream.getVideoTracks().forEach((t) => (t.enabled = camLigada));
  e.target.textContent = "Câmera: " + (camLigada ? "ligada" : "desligada");
};
document.getElementById("btnTela").onclick = async (e) => {
  if (!localStream) { alert("Entre com câmera primeiro para compartilhar a tela."); return; }
  if (!compartilhando) {
    try {
      telaStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      const telaTrack = telaStream.getVideoTracks()[0];
      pcs.forEach((pc) => { const s = pc.getSenders().find((x) => x.track && x.track.kind === "video"); if (s) s.replaceTrack(telaTrack); });
      document.getElementById("videoLocal").srcObject = telaStream;
      compartilhando = true; e.target.textContent = "Parar de compartilhar tela";
      telaTrack.onended = () => document.getElementById("btnTela").click();
    } catch { setStatus("Compartilhamento de tela cancelado."); }
  } else {
    if (telaStream) telaStream.getTracks().forEach((t) => t.stop());
    pcs.forEach((pc) => { const s = pc.getSenders().find((x) => x.track && x.track.kind === "video"); if (s && cameraTrackOriginal) s.replaceTrack(cameraTrackOriginal); });
    document.getElementById("videoLocal").srcObject = localStream;
    compartilhando = false; e.target.textContent = "Compartilhar tela";
  }
};
document.getElementById("btnMao").onclick = () => { if (salaAtiva) wsEnviar({ type: "mao" }); else alert("Entre na sala primeiro."); };
async function enviarChat() {
  const texto = document.getElementById("chatTexto").value.trim();
  if (!texto) return;
  const nome = document.getElementById("nomeSala").value.trim() || "Aluno";
  document.getElementById("chatTexto").value = "";
  if (ws && ws.readyState === 1) { wsEnviar({ type: "chat", texto }); return; }
  try { const r = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ nome, texto, token: salaToken }) }); const j = await r.json(); if (j.mensagem) addChat(j.mensagem); } catch {}
}
document.getElementById("btnEnviarChat").onclick = enviarChat;
document.getElementById("chatTexto").addEventListener("keydown", (e) => { if (e.key === "Enter") enviarChat(); });

// ---- Link da sala ----
function linkSala() { return location.origin + "/#sala"; }
async function copiarLink() {
  try { await navigator.clipboard.writeText(linkSala()); alert("Link da sala copiado. Envie para o aluno."); }
  catch { prompt("Copie o link da sala:", linkSala()); }
}
document.getElementById("btnCopiarLink").onclick = copiarLink;
document.getElementById("btnCopiarLinkSala").onclick = copiarLink;
document.getElementById("btnAbrirSala").onclick = () => window.open(linkSala(), "_blank");
document.getElementById("linkSalaTexto").textContent = "Link da sala: " + linkSala();
document.getElementById("linkSalaTexto2").textContent = "Link da sala: " + linkSala();

// ---- Perguntas ao mestre ----
async function carregarPerguntas() {
  try {
    const r = await fetch("/api/perguntas"); const j = await r.json();
    const el = document.getElementById("listaPerguntas"); el.innerHTML = "";
    (j.perguntas || []).forEach((p) => {
      const d = document.createElement("div"); d.className = "card";
      const titulo = document.createElement("p"); const bn = document.createElement("b"); bn.textContent = p.nome; titulo.append(bn, document.createTextNode(" perguntou:"));
      const corpo = document.createElement("p"); corpo.textContent = p.pergunta;
      d.append(titulo, corpo);
      if (p.resposta) {
        const rEl = document.createElement("p"); rEl.innerHTML = "<strong>Resposta do mestre:</strong> "; rEl.appendChild(document.createTextNode(p.resposta)); d.appendChild(rEl);
      } else {
        d.innerHTML += `<textarea rows="2" placeholder="Resposta do mestre..." id="resp-${p.id}"></textarea><button class="btn sec" type="button">Responder como mestre</button>`;
        d.querySelector("button").onclick = async () => {
          const texto = document.getElementById("resp-" + p.id).value.trim();
          if (!texto) return;
          await fetch(`/api/perguntas/${p.id}/resposta`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ resposta: texto }) });
          carregarPerguntas();
        };
      }
      el.appendChild(d);
    });
  } catch {}
}
document.getElementById("formPergunta").addEventListener("submit", async (e) => {
  e.preventDefault();
  const nome = document.getElementById("pergNome").value.trim() || "Médico aluno";
  const pergunta = document.getElementById("pergTexto").value.trim();
  const r = await fetch("/api/perguntas", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ nome, pergunta }) });
  const j = await r.json();
  document.getElementById("resultadoPergunta").textContent = j.ok ? "Pergunta enviada. O mestre responde aqui mesmo, nesta página." : (j.erro || "Não consegui enviar.");
  document.getElementById("pergTexto").value = "";
  carregarPerguntas();
});

// ---- Início ----
(async () => {
  atualizarBloqueio();
  renderFundos();
  try { const r = await fetch("/api/aulas"); const j = await r.json(); AULAS = j.aulas || []; } catch {}
  renderAulas();
  carregarPerguntas();
  mostrar();
})();
