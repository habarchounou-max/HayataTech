/**
 * PRINTLAB PRO DIVINE - JavaScript Ultime
 * Auteur: Bichara Abakar Hangata 23B472FS
 * Encadreur: Ingénieur Samuel Kotva
 * Version: 3.0 Pro Divine
 * 
 * Fonctions principales:
 * 1. calculerPrix() - Calcule le prix total d'impression
 * 2. afficherFacture() - Génère la facture détaillée
 * 3. detecterPages() - Détecte automatiquement le nombre de pages
 */

'use strict';

// =============================================
// CONSTANTES ET CONFIGURATION
// =============================================
const CONFIG = {
    appName: 'PrintLab Pro Divine',
    version: '3.0',
    author: 'Bichara Abakar Hangata',
    matricule: '23B472FS',
    encadreur: 'Ing. Samuel Kotva',
    
    prix: {
        couleur: 250,
        nb: 100
    },
    
    formatMajoration: {
        a4: 1,
        a3: 1.5,
        letter: 1.1,
        legal: 1.15
    },
    
    grammageMajoration: {
        80: 1,
        100: 1.2,
        120: 1.4,
        160: 1.7
    },
    
    reliure: {
        none: 0,
        spiral: 500,
        thermal: 800,
        hardcover: 1500
    },
    
    delai: {
        standard: 1,
        express: 1.3,
        urgent: 1.6
    },
    
    remiseSeuil: {
        5000: 5,
        10000: 10,
        25000: 15,
        50000: 20
    },
    
    codesPromo: {
        'ETUDIANT10': 10,
        'PRINT20': 20,
        'DIVINE25': 25,
        'SAMUEL15': 15,
        'BICHARA5': 5
    },
    
    maxFileSize: 50 * 1024 * 1024, // 50 Mo
    tva: 0  // Pas de TVA par défaut
};

// =============================================
// ÉTAT DE L'APPLICATION
// =============================================
let appState = {
    files: [],
    currentFileIndex: 0,
    selectedType: 'couleur',
    pages: 1,
    copies: 1,
    paperSize: 'a4',
    orientation: 'portrait',
    rectoVerso: false,
    binding: 'none',
    paperWeight: 80,
    deadline: 'standard',
    discountPercent: 0,
    discountCode: '',
    history: [],
    filter: 'all'
};

// =============================================
// 1ère FONCTION: Calcul du prix total
// =============================================
function calculerPrix(options) {
    const {
        type = 'couleur',
        pages = 1,
        copies = 1,
        paperSize = 'a4',
        paperWeight = 80,
        binding = 'none',
        deadline = 'standard',
        discountPercent = 0
    } = options;
    
    // Prix de base par page
    const prixBase = type === 'couleur' ? CONFIG.prix.couleur : CONFIG.prix.nb;
    
    // Calcul du nombre de pages effectives (recto-verso réduit de moitié)
    const pagesEffectives = options.rectoVerso ? Math.ceil(pages / 2) : pages;
    
    // Sous-total impression
    const sousTotalImpression = prixBase * pagesEffectives * copies;
    
    // Majoration format
    const majorationFormat = sousTotalImpression * (CONFIG.formatMajoration[paperSize] - 1);
    
    // Majoration grammage
    const majorationGrammage = sousTotalImpression * (CONFIG.grammageMajoration[paperWeight] - 1);
    
    // Reliure
    const prixReliure = CONFIG.reliure[binding] * copies;
    
    // Sous-total avant délai
    let sousTotal = sousTotalImpression + majorationFormat + majorationGrammage + prixReliure;
    
    // Majoration délai
    const majorationDelai = sousTotal * (CONFIG.delai[deadline] - 1);
    sousTotal += majorationDelai;
    
    // Remise
    const remise = sousTotal * (discountPercent / 100);
    const total = sousTotal - remise;
    
    return {
        prixBase,
        pagesEffectives,
        copies,
        sousTotalImpression: Math.round(sousTotalImpression),
        majorationFormat: Math.round(majorationFormat),
        majorationGrammage: Math.round(majorationGrammage),
        prixReliure: Math.round(prixReliure),
        majorationDelai: Math.round(majorationDelai),
        sousTotal: Math.round(sousTotal),
        remise: Math.round(remise),
        remisePercent: discountPercent,
        total: Math.round(total),
        type,
        typeLabel: type === 'couleur' ? 'Couleur' : 'Noir & Blanc',
        pages,
        paperSize,
        paperWeight,
        binding,
        deadline
    };
}

// =============================================
// 2ème FONCTION: Génération de facture
// =============================================
function afficherFacture(resultat, fichier) {
    const invoicePro = document.getElementById('invoicePro');
    const invoiceDate = document.getElementById('invoiceDate');
    const invoiceNumber = document.getElementById('invoiceNumber');
    const invoiceItems = document.getElementById('invoiceItems');
    const subtotal = document.getElementById('subtotal');
    const discountRow = document.getElementById('discountRow');
    const discount = document.getElementById('discount');
    const taxRow = document.getElementById('taxRow');
    const tax = document.getElementById('tax');
    const totalAmount = document.getElementById('totalAmount');
    
    // Date et numéro facture
    const now = new Date();
    invoiceDate.textContent = now.toLocaleDateString('fr-FR', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    }) + ' à ' + now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    invoiceNumber.textContent = 'FACT-' + now.getFullYear() + '-' + 
        String(Math.floor(Math.random() * 10000)).padStart(4, '0');
    
    // Items
    let itemsHTML = `
        <tr>
            <td>📄 ${fichier ? fichier.name : 'Document'}</td>
            <td>${resultat.pages} page(s) × ${resultat.copies} copie(s)</td>
            <td>${formatFCFA(resultat.prixBase)}/page</td>
            <td>${formatFCFA(resultat.sousTotalImpression)}</td>
        </tr>
    `;
    
    if (resultat.majorationFormat > 0) {
        itemsHTML += `
            <tr>
                <td>📐 Majoration format (${resultat.paperSize.toUpperCase()})</td>
                <td>-</td>
                <td>-</td>
                <td>${formatFCFA(resultat.majorationFormat)}</td>
            </tr>
        `;
    }
    
    if (resultat.majorationGrammage > 0) {
        itemsHTML += `
            <tr>
                <td>📋 Majoration grammage (${resultat.paperWeight} g/m²)</td>
                <td>-</td>
                <td>-</td>
                <td>${formatFCFA(resultat.majorationGrammage)}</td>
            </tr>
        `;
    }
    
    if (resultat.prixReliure > 0) {
        const bindingLabels = { spiral: 'Reliure spirale', thermal: 'Reliure thermique', hardcover: 'Couverture rigide' };
        itemsHTML += `
            <tr>
                <td>📚 ${bindingLabels[resultat.binding] || 'Reliure'}</td>
                <td>${resultat.copies} copie(s)</td>
                <td>-</td>
                <td>${formatFCFA(resultat.prixReliure)}</td>
            </tr>
        `;
    }
    
    if (resultat.majorationDelai > 0) {
        const delaiLabels = { express: 'Express (4h)', urgent: 'Urgent (1h)' };
        itemsHTML += `
            <tr>
                <td>⚡ Majoration délai (${delaiLabels[resultat.deadline] || 'Standard'})</td>
                <td>-</td>
                <td>-</td>
                <td>${formatFCFA(resultat.majorationDelai)}</td>
            </tr>
        `;
    }
    
    invoiceItems.innerHTML = itemsHTML;
    
    // Sous-total
    subtotal.textContent = formatFCFA(resultat.sousTotal);
    
    // Remise
    if (resultat.remise > 0) {
        discountRow.style.display = 'flex';
        discount.textContent = `-${formatFCFA(resultat.remise)} (${resultat.remisePercent}%)`;
    } else {
        discountRow.style.display = 'none';
    }
    
    // TVA
    if (CONFIG.tva > 0) {
        const tvaAmount = Math.round(resultat.total * CONFIG.tva / 100);
        taxRow.style.display = 'flex';
        tax.textContent = formatFCFA(tvaAmount);
    } else {
        taxRow.style.display = 'none';
    }
    
    // Total
    totalAmount.textContent = formatFCFA(resultat.total);
    
    // Afficher
    invoicePro.style.display = 'block';
    invoicePro.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    // Anim
    invoicePro.style.animation = 'none';
    invoicePro.offsetHeight;
    invoicePro.style.animation = 'slideUp 0.5s ease-out';
}

// =============================================
// 3ème FONCTION: Détection de pages
// =============================================
async function detecterPages(fichier) {
    const extension = fichier.name.toLowerCase().split('.').pop();
    
    try {
        if (extension === 'pdf') {
            const arrayBuffer = await fichier.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            return { success: true, pages: pdf.numPages, type: 'pdf' };
        } 
        else if (extension === 'doc' || extension === 'docx') {
            const arrayBuffer = await fichier.arrayBuffer();
            const result = await mammoth.extractRawText({ arrayBuffer: arrayBuffer });
            const text = result.value;
            const charsPerPage = 2500;
            const estimatedPages = Math.max(1, Math.ceil(text.length / charsPerPage));
            return { success: true, pages: estimatedPages, type: 'word', estimation: true };
        }
        
        return { success: false, pages: 0, error: 'Format non supporté' };
    } catch (error) {
        console.error('Erreur détection:', error);
        return { success: false, pages: 0, error: error.message };
    }
}

// =============================================
// FONCTIONS UTILITAIRES
// =============================================
function formatFCFA(montant) {
    return montant.toLocaleString('fr-FR') + ' FCFA';
}

function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' o';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' Ko';
    return (bytes / 1048576).toFixed(2) + ' Mo';
}

function calculerRemiseAutomatique(total) {
    let remise = 0;
    for (const [seuil, pourcentage] of Object.entries(CONFIG.remiseSeuil)) {
        if (total >= parseInt(seuil)) {
            remise = Math.max(remise, pourcentage);
        }
    }
    return remise;
}

function genererId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function afficherToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        toast.style.transition = 'all 0.3s ease-in';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// =============================================
// GESTION DES FICHIERS
// =============================================
function processFiles(fileList) {
    const newFiles = Array.from(fileList).filter(file => {
        const ext = file.name.toLowerCase().split('.').pop();
        const valid = ['doc', 'docx', 'pdf'].includes(ext);
        const sizeOk = file.size <= CONFIG.maxFileSize;
        
        if (!valid) afficherToast(`Format non supporté: ${file.name}`, 'error');
        if (!sizeOk) afficherToast(`Fichier trop volumineux: ${file.name}`, 'error');
        
        return valid && sizeOk;
    });
    
    if (newFiles.length > 0) {
        appState.files = [...appState.files, ...newFiles].slice(0, 10); // Max 10 fichiers
        appState.currentFileIndex = appState.files.length - 1;
        afficherFilesQueue();
        afficherFilePreview(appState.files[appState.currentFileIndex]);
        detecterPagesAuto(appState.files[appState.currentFileIndex]);
        updateCalculateButton();
        afficherToast(`${newFiles.length} fichier(s) ajouté(s)`, 'success');
    }
}

function afficherFilesQueue() {
    const queue = document.getElementById('filesQueue');
    if (appState.files.length <= 1) {
        queue.innerHTML = '';
        return;
    }
    
    queue.innerHTML = appState.files.map((file, index) => `
        <div class="queue-item ${index === appState.currentFileIndex ? 'active' : ''}" 
             onclick="switchFile(${index})">
            <span>${file.name.split('.').pop() === 'pdf' ? '📕' : '📝'}</span>
            <span>${file.name.substring(0, 20)}${file.name.length > 20 ? '...' : ''}</span>
            <span style="color: #94a3b8; font-size: 0.75rem;">${formatFileSize(file.size)}</span>
            <button onclick="event.stopPropagation(); removeFile(${index})" 
                    style="background:none;border:none;color:var(--accent-red);cursor:pointer;">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `).join('');
}

function afficherFilePreview(file) {
    const preview = document.getElementById('filePreviewPro');
    const icon = document.getElementById('previewIcon');
    const name = document.getElementById('previewName');
    const size = document.getElementById('previewSize');
    const type = document.getElementById('previewType');
    const pages = document.getElementById('detectedPagesText');
    
    if (!file) {
        preview.style.display = 'none';
        return;
    }
    
    const ext = file.name.toLowerCase().split('.').pop();
    preview.style.display = 'block';
    icon.textContent = ext === 'pdf' ? '📕' : '📝';
    name.textContent = file.name;
    size.textContent = formatFileSize(file.size);
    type.textContent = ext === 'pdf' ? 'PDF' : 'Word';
    pages.textContent = 'Détection en cours...';
}

async function detecterPagesAuto(file) {
    const detectBtn = document.getElementById('detectPagesBtn');
    const pagesText = document.getElementById('detectedPagesText');
    
    detectBtn.disabled = true;
    detectBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analyse...';
    
    const result = await detecterPages(file);
    
    if (result.success) {
        appState.pages = result.pages;
        document.getElementById('pagesInput').value = result.pages;
        pagesText.innerHTML = `<i class="fas fa-check-circle" style="color: var(--accent-green);"></i> 
            ${result.pages} page(s) ${result.estimation ? '(estimation)' : '(détecté)'}`;
        
        detectBtn.innerHTML = '<i class="fas fa-check-circle" style="color: var(--accent-green);"></i> Détecté !';
        setTimeout(() => {
            detectBtn.innerHTML = '<i class="fas fa-magic"></i> Auto-détecter';
        }, 3000);
    } else {
        pagesText.innerHTML = '<i class="fas fa-exclamation-triangle" style="color: var(--accent-yellow);"></i> Détection impossible';
        detectBtn.innerHTML = '<i class="fas fa-magic"></i> Auto-détecter';
    }
    
    detectBtn.disabled = false;
}

function switchFile(index) {
    appState.currentFileIndex = index;
    afficherFilesQueue();
    afficherFilePreview(appState.files[index]);
}

function removeFile(index) {
    appState.files.splice(index, 1);
    if (appState.currentFileIndex >= appState.files.length) {
        appState.currentFileIndex = Math.max(0, appState.files.length - 1);
    }
    
    if (appState.files.length === 0) {
        document.getElementById('filePreviewPro').style.display = 'none';
        document.getElementById('filesQueue').innerHTML = '';
        appState.currentFileIndex = 0;
    } else {
        afficherFilesQueue();
        afficherFilePreview(appState.files[appState.currentFileIndex]);
    }
    
    updateCalculateButton();
}

// =============================================
// GESTION OPTIONS
// =============================================
function updateCalculateButton() {
    const btn = document.getElementById('calculateBtn');
    btn.disabled = appState.files.length === 0;
}

function executerCalcul() {
    if (appState.files.length === 0) {
        afficherToast('Veuillez charger un document', 'error');
        return;
    }
    
    const resultat = calculerPrix({
        type: appState.selectedType,
        pages: appState.pages,
        copies: appState.copies,
        paperSize: appState.paperSize,
        orientation: appState.orientation,
        rectoVerso: appState.rectoVerso,
        paperWeight: appState.paperWeight,
        binding: appState.binding,
        deadline: appState.deadline,
        discountPercent: appState.discountPercent
    });
    
    afficherFacture(resultat, appState.files[appState.currentFileIndex]);
    ajouterHistorique(resultat, appState.files[appState.currentFileIndex]);
    
    // Afficher section discount
    document.getElementById('discountSection').style.display = 'block';
    
    // Scroll to result
    document.getElementById('result').scrollIntoView({ behavior: 'smooth' });
    
    afficherToast('Calcul effectué avec succès !', 'success');
}

// =============================================
// HISTORIQUE
// =============================================
function ajouterHistorique(resultat, fichier) {
    const entry = {
        id: genererId(),
        date: new Date().toISOString(),
        fileName: fichier ? fichier.name : 'Document',
        type: resultat.type,
        typeLabel: resultat.typeLabel,
        pages: resultat.pages,
        copies: resultat.copies,
        total: resultat.total,
        details: resultat
    };
    
    appState.history.unshift(entry);
    if (appState.history.length > 50) appState.history.pop();
    
    sauvegarderHistorique();
    afficherHistorique();
    afficherStats();
}

function sauvegarderHistorique() {
    try {
        localStorage.setItem('printlab_pro_history', JSON.stringify(appState.history));
    } catch (e) {
        console.warn('Impossible de sauvegarder l\'historique');
    }
}

function chargerHistorique() {
    try {
        const saved = localStorage.getItem('printlab_pro_history');
        if (saved) appState.history = JSON.parse(saved);
    } catch (e) {
        appState.history = [];
    }
}

function afficherHistorique() {
    const list = document.getElementById('historyList');
    const filter = appState.filter;
    
    let filtered = appState.history;
    
    if (filter === 'couleur') {
        filtered = filtered.filter(h => h.type === 'couleur');
    } else if (filter === 'nb') {
        filtered = filtered.filter(h => h.type === 'nb');
    } else if (filter === 'today') {
        const today = new Date().toDateString();
        filtered = filtered.filter(h => new Date(h.date).toDateString() === today);
    }
    
    if (filtered.length === 0) {
        list.innerHTML = `
            <div class="history-empty">
                <i class="fas fa-inbox"></i>
                <p>Aucune impression dans l'historique</p>
            </div>
        `;
    } else {
        list.innerHTML = filtered.map((entry, index) => `
            <div class="history-item-pro" style="animation: slideUp 0.3s ${index * 0.03}s both;">
                <div class="history-item-icon ${entry.type}">
                    ${entry.type === 'couleur' ? '🌈' : '⬛'}
                </div>
                <div class="history-item-details">
                    <div class="history-item-name">${entry.fileName}</div>
                    <div class="history-item-meta">
                        ${entry.pages} page(s) × ${entry.copies} copie(s) • 
                        ${entry.typeLabel} • 
                        ${new Date(entry.date).toLocaleDateString('fr-FR')}
                    </div>
                </div>
                <div class="history-item-price ${entry.type}">
                    ${formatFCFA(entry.total)}
                </div>
            </div>
        `).join('');
    }
    
    document.getElementById('historyCount').textContent = appState.history.length;
}

function afficherStats() {
    const stats = document.getElementById('historyStats');
    if (appState.history.length === 0) {
        stats.style.display = 'none';
        return;
    }
    
    stats.style.display = 'grid';
    document.getElementById('totalPrints').textContent = appState.history.length;
    
    const totalPages = appState.history.reduce((sum, h) => sum + h.pages * h.copies, 0);
    document.getElementById('totalPages').textContent = totalPages;
    
    const totalSpent = appState.history.reduce((sum, h) => sum + h.total, 0);
    document.getElementById('totalSpent').textContent = formatFCFA(totalSpent);
}

function exporterHistorique() {
    if (appState.history.length === 0) {
        afficherToast('Aucune donnée à exporter', 'error');
        return;
    }
    
    const data = JSON.stringify(appState.history, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `printlab_history_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    afficherToast('Historique exporté !', 'success');
}

function viderHistorique() {
    if (confirm('Vider tout l\'historique ?')) {
        appState.history = [];
        sauvegarderHistorique();
        afficherHistorique();
        afficherStats();
        afficherToast('Historique vidé', 'info');
    }
}

// =============================================
// CODE PROMO
// =============================================
function appliquerCodePromo() {
    const input = document.getElementById('discountCode');
    const message = document.getElementById('discountMessage');
    const code = input.value.trim().toUpperCase();
    
    if (code === '') {
        appState.discountPercent = 0;
        appState.discountCode = '';
        message.innerHTML = '';
        message.style.color = '';
        return;
    }
    
    if (CONFIG.codesPromo[code]) {
        appState.discountPercent = CONFIG.codesPromo[code];
        appState.discountCode = code;
        message.innerHTML = `✅ Code "${code}" appliqué : -${appState.discountPercent}%`;
        message.style.color = 'var(--accent-green)';
        afficherToast(`Code promo appliqué : -${appState.discountPercent}%`, 'success');
    } else {
        appState.discountPercent = 0;
        appState.discountCode = '';
        message.innerHTML = '❌ Code invalide';
        message.style.color = 'var(--accent-red)';
        afficherToast('Code promo invalide', 'error');
    }
}

// =============================================
// PARTICULES
// =============================================
function initParticles() {
    const canvas = document.getElementById('particlesCanvas');
    const ctx = canvas.getContext('2d');
    let particles = [];
    
    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    
    function create() {
        const count = Math.floor((canvas.width * canvas.height) / 12000);
        particles = [];
        for (let i = 0; i < count; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                size: Math.random() * 2 + 0.5,
                speedX: (Math.random() - 0.5) * 0.4,
                speedY: (Math.random() - 0.5) * 0.4,
                opacity: Math.random() * 0.6 + 0.1,
                hue: Math.random() * 60 + 200
            });
        }
    }
    
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach(p => {
            p.x += p.speedX;
            p.y += p.speedY;
            
            if (p.x < 0) p.x = canvas.width;
            if (p.x > canvas.width) p.x = 0;
            if (p.y < 0) p.y = canvas.height;
            if (p.y > canvas.height) p.y = 0;
            
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = `hsla(${p.hue}, 70%, 60%, ${p.opacity})`;
            ctx.fill();
        });
        
        // Connexions
        ctx.strokeStyle = 'rgba(84, 160, 255, 0.06)';
        ctx.lineWidth = 0.5;
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                if (Math.sqrt(dx * dx + dy * dy) < 120) {
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }
        
        requestAnimationFrame(animate);
    }
    
    window.addEventListener('resize', () => { resize(); create(); });
    resize();
    create();
    animate();
}

// =============================================
// ÉTOILES
// =============================================
function initStars() {
    const container = document.getElementById('starsContainer');
    const count = 150;
    let html = '';
    
    for (let i = 0; i < count; i++) {
        const size = Math.random() * 2 + 1;
        const x = Math.random() * 100;
        const y = Math.random() * 100;
        const duration = Math.random() * 3 + 2;
        const delay = Math.random() * 5;
        
        html += `<div class="star" style="
            left: ${x}%; top: ${y}%;
            width: ${size}px; height: ${size}px;
            --duration: ${duration}s;
            --delay: ${delay}s;
        "></div>`;
    }
    
    container.innerHTML = html;
}

// =============================================
// HORLOGE
// =============================================
function initClock() {
    function update() {
        const now = new Date();
        document.getElementById('currentTime').textContent = 
            now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        document.getElementById('liveDate').textContent = 
            now.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    }
    update();
    setInterval(update, 1000);
}

// =============================================
// MOBILE MENU
// =============================================
function initMobileMenu() {
    const toggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebarPro');
    const overlay = document.getElementById('mobileOverlay');
    
    toggle.addEventListener('click', () => {
        sidebar.classList.toggle('open');
        overlay.classList.toggle('active');
    });
    
    overlay.addEventListener('click', () => {
        sidebar.classList.remove('open');
        overlay.classList.remove('active');
    });
    
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => {
            if (window.innerWidth <= 992) {
                sidebar.classList.remove('open');
                overlay.classList.remove('active');
            }
        });
    });
}

// =============================================
// IMPRESSION FACTURE
// =============================================
function imprimerFacture() {
    const invoice = document.getElementById('invoicePro');
    if (invoice.style.display === 'none') {
        afficherToast('Aucune facture à imprimer', 'error');
        return;
    }
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Facture PrintLab Pro</title>
            <style>
                body { font-family: 'Plus Jakarta Sans', Arial, sans-serif; padding: 40px; color: #1a1a2e; }
                .invoice { max-width: 800px; margin: 0 auto; }
                table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                th { background: #f3f4f6; padding: 10px; text-align: left; }
                td { padding: 10px; border-bottom: 1px solid #e5e7eb; }
                .total { font-size: 1.4rem; font-weight: bold; margin-top: 20px; }
            </style>
        </head>
        <body>
            <div class="invoice">
                ${invoice.innerHTML}
            </div>
            <script>window.print(); setTimeout(() => window.close(), 500);<\/script>
        </body>
        </html>
    `);
}

// =============================================
// INITIALISATION
// =============================================
document.addEventListener('DOMContentLoaded', function() {
    
    // AOS
    AOS.init({ duration: 800, once: false, mirror: true, offset: 80 });
    
    // Particules et étoiles
    initParticles();
    initStars();
    initClock();
    initMobileMenu();
    
    // Charger historique
    chargerHistorique();
    afficherHistorique();
    afficherStats();
    
    // ====== EVENT LISTENERS ======
    
    // Upload
    const uploadZone = document.getElementById('uploadZone');
    const fileInput = document.getElementById('fileInput');
    
    uploadZone.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', (e) => processFiles(e.target.files));
    
    uploadZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadZone.classList.add('drag-active');
    });
    uploadZone.addEventListener('dragleave', () => {
        uploadZone.classList.remove('drag-active');
    });
    uploadZone.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadZone.classList.remove('drag-active');
        if (e.dataTransfer.files.length > 0) {
            processFiles(e.dataTransfer.files);
        }
    });
    
    // Remove file
    document.getElementById('removeFileBtn').addEventListener('click', () => {
        removeFile(appState.currentFileIndex);
    });
    
    // Type sélection
    document.getElementById('couleurCard').addEventListener('click', function() {
        appState.selectedType = 'couleur';
        this.classList.add('selected');
        document.getElementById('nbCard').classList.remove('selected');
    });
    
    document.getElementById('nbCard').addEventListener('click', function() {
        appState.selectedType = 'nb';
        this.classList.add('selected');
        document.getElementById('couleurCard').classList.remove('selected');
    });
    
    // Pages spinner
    document.getElementById('decPages').addEventListener('click', () => {
        const input = document.getElementById('pagesInput');
        if (parseInt(input.value) > 1) input.value = parseInt(input.value) - 1;
        appState.pages = parseInt(input.value);
    });
    
    document.getElementById('incPages').addEventListener('click', () => {
        const input = document.getElementById('pagesInput');
        if (parseInt(input.value) < 9999) input.value = parseInt(input.value) + 1;
        appState.pages = parseInt(input.value);
    });
    
    document.getElementById('pagesInput').addEventListener('change', function() {
        const val = parseInt(this.value);
        if (isNaN(val) || val < 1) this.value = 1;
        if (val > 9999) this.value = 9999;
        appState.pages = parseInt(this.value);
    });
    
    // Copies spinner
    document.getElementById('decCopies').addEventListener('click', () => {
        const input = document.getElementById('copiesInput');
        if (parseInt(input.value) > 1) input.value = parseInt(input.value) - 1;
        appState.copies = parseInt(input.value);
    });
    
    document.getElementById('incCopies').addEventListener('click', () => {
        const input = document.getElementById('copiesInput');
        if (parseInt(input.value) < 100) input.value = parseInt(input.value) + 1;
        appState.copies = parseInt(input.value);
    });
    
    document.getElementById('copiesInput').addEventListener('change', function() {
        const val = parseInt(this.value);
        if (isNaN(val) || val < 1) this.value = 1;
        if (val > 100) this.value = 100;
        appState.copies = parseInt(this.value);
    });
    
    // Paper size
    document.getElementById('paperSize').addEventListener('change', function() {
        appState.paperSize = this.value;
    });
    
    // Orientation
    document.querySelectorAll('.orient-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.orient-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            appState.orientation = this.dataset.orient;
        });
    });
    
    // Recto-verso
    document.getElementById('rectoVerso').addEventListener('change', function() {
        appState.rectoVerso = this.checked;
    });
    
    // Binding
    document.getElementById('binding').addEventListener('change', function() {
        appState.binding = this.value;
    });
    
    document.getElementById('paperWeight').addEventListener('change', function() {
        appState.paperWeight = parseInt(this.value);
    });
    
    document.getElementById('deadline').addEventListener('change', function() {
        appState.deadline = this.value;
    });
    
    // Detect pages
    document.getElementById('detectPagesBtn').addEventListener('click', async () => {
        if (appState.files.length > 0) {
            await detecterPagesAuto(appState.files[appState.currentFileIndex]);
        } else {
            afficherToast('Chargez d\'abord un document', 'error');
        }
    });
    
    // Calculate
    document.getElementById('calculateBtn').addEventListener('click', executerCalcul);
    
    // Discount
    document.getElementById('applyDiscount').addEventListener('click', appliquerCodePromo);
    document.getElementById('discountCode').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') appliquerCodePromo();
    });
    
    // Print invoice
    document.getElementById('printInvoiceBtn').addEventListener('click', imprimerFacture);
    
    // History filters
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            appState.filter = this.dataset.filter;
            afficherHistorique();
        });
    });
    
    // Export/Clear history
    document.getElementById('exportHistory').addEventListener('click', exporterHistorique);
    document.getElementById('clearHistory').addEventListener('click', viderHistorique);
    
    // Keyboard shortcut
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'Enter') {
            executerCalcul();
        }
    });
    
    // Console welcome
    console.log(`
    %c🖨️ PRINTLAB PRO DIVINE v${CONFIG.version} ✨
    %c👨‍💻 ${CONFIG.author} (${CONFIG.matricule})
    %c👨‍🏫 Encadreur: ${CONFIG.encadreur}
    %c✅ Toutes les fonctionnalités sont opérationnelles !
    `, 
    'font-size: 20px; font-weight: bold; background: linear-gradient(135deg, #ff6b6b, #feca57, #48dbfb, #ff9ff3, #54a0ff); color: white; padding: 10px 20px; border-radius: 12px;',
    'font-size: 14px; color: #54a0ff;',
    'font-size: 14px; color: #f59e0b;',
    'font-size: 13px; color: #10b981;'
    );
    
});