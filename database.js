/* database.js v3 - Core Engine */

window.appSettings = {
    getCurrency() { return localStorage.getItem('APP_CURRENCY') || 'USD'; },
    getRate() { return parseFloat(localStorage.getItem('EXCHANGE_RATE')) || 2800; },
    setSettings(curr, rate) {
        localStorage.setItem('APP_CURRENCY', curr);
        localStorage.setItem('EXCHANGE_RATE', rate);
    },
    convertToUsd(amount) {
        if (this.getCurrency() === 'USD') return amount;
        return amount / this.getRate();
    },
    getTheme() { return localStorage.getItem('APP_THEME') || 'dark'; },
    setTheme(theme) {
        localStorage.setItem('APP_THEME', theme);
        document.documentElement.setAttribute('data-theme', theme);
    }
};

document.documentElement.setAttribute('data-theme', window.appSettings.getTheme());

window.formatMoney = function(amount_usd, historical_rate = null) {
    const curr = window.appSettings.getCurrency();
    const isNegative = amount_usd < 0;
    const val = Math.abs(amount_usd);
    
    if (curr === 'USD') {
        return (isNegative ? "-" : "") + val.toFixed(2) + ' $';
    } else {
        const rate = historical_rate || window.appSettings.getRate();
        return (isNegative ? "-" : "") + (val * rate).toLocaleString('fr-FR', {maximumFractionDigits:0}) + ' CDF';
    }
};

const UI = {
    injectStyles() {
        if (document.getElementById('ui-core-styles')) return;
        const style = document.createElement('style');
        style.id = 'ui-core-styles';
        style.innerHTML = `
            .neon-toast { position: fixed; bottom: 95px; left: 50%; transform: translateX(-50%) translateY(100px); background: var(--surface-solid); color: var(--text-main); padding: 14px 24px; border-radius: 12px; z-index: 9999; box-shadow: var(--card-shadow); opacity: 0; transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); border-left: 4px solid var(--neon-cyan); white-space: nowrap; font-size: 0.95rem; font-weight: 500; font-family: 'Outfit', sans-serif;}
            .neon-toast.success { border-left-color: var(--neon-green); } .neon-toast.error { border-left-color: var(--neon-red); background: rgba(255,51,102,0.1); } .neon-toast.info { border-left-color: var(--neon-cyan); } .neon-toast.show { opacity: 1; transform: translateX(-50%) translateY(0); }
            .custom-modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: var(--modal-overlay); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); z-index: 10000; display: flex; align-items: center; justify-content: center; padding: 20px; animation: fadeIn 0.3s ease; }
            .custom-modal { background: var(--surface-color); width: 100%; max-width: 420px; border-radius: 20px; padding: 24px; border: 1px solid var(--border-color); color: var(--text-main); box-shadow: var(--card-shadow); animation: slideUp 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); backdrop-filter: blur(16px); }
            .custom-modal h3 { margin-bottom: 12px; font-size: 1.3rem; color: var(--neon-cyan); font-weight: 600; display:flex; align-items:center; gap:8px;}
            .custom-modal.danger h3 { color: var(--neon-red); }
            .custom-modal input { width: 100%; padding: 14px; margin-bottom: 15px; background: var(--bg-color); border: 1px solid var(--border-color); color: var(--text-main); border-radius: 10px; font-family: 'Outfit', sans-serif; font-size: 1rem; transition: all 0.3s ease;}
            .custom-modal input:focus { outline: none; border-color: var(--neon-cyan); box-shadow: 0 0 0 3px var(--neon-cyan-glow); }
            .custom-modal button { padding: 14px; border: none; border-radius: 10px; font-weight: 600; font-size: 1rem; width: 100%; cursor: pointer; margin-bottom: 12px; background-color: var(--neon-cyan); color: #000; transition: all 0.2s ease;}
            .custom-modal button:hover { transform: translateY(-2px); box-shadow: 0 4px 15px var(--neon-cyan-glow); }
            .custom-modal button.danger { background: transparent; border: 1px solid var(--neon-red); color: var(--neon-red); box-shadow: none; }
            .custom-modal button.danger:hover { background: rgba(255,51,102,0.1); transform: translateY(-2px); }
            .radio-group { display: flex; gap: 15px; margin-bottom: 20px; }
            .radio-group label { display: flex; align-items: center; gap: 8px; font-size: 1rem; cursor: pointer; color:var(--text-muted); font-weight: 500;}
            .radio-group input[type="radio"]:checked + span { color: var(--neon-green); font-weight:700;}
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            @keyframes slideUp { from { transform: translateY(30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        `;
        document.head.appendChild(style);
    },

    showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `neon-toast ${type}`;
        toast.innerText = message;
        document.body.appendChild(toast);
        toast.offsetHeight;
        toast.classList.add('show');
        setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 300); }, 3000);
    },

    confirm(title, message, isDanger = false) {
        return new Promise((resolve) => {
            const overlay = document.createElement('div');
            overlay.className = 'custom-modal-overlay';
            overlay.innerHTML = `
                <div class="custom-modal ${isDanger ? 'danger' : ''}" style="${isDanger ? 'border-left-color:var(--neon-red);' : ''}">
                    <h3 style="color: ${isDanger ? 'var(--neon-red)' : 'var(--neon-cyan)'}"><i class="ph-fill ph-${isDanger ? 'warning-circle' : 'question'}"></i> ${title}</h3>
                    <p style="margin-bottom: 24px; font-size:0.95rem; color:var(--text-muted); line-height:1.4;">${message}</p>
                    <button id="modal-btn-ok" style="background-color: ${isDanger ? 'var(--neon-red)' : 'var(--neon-cyan)'}">Confirmer</button>
                    <button id="modal-btn-cancel" class="danger" style="border-color:var(--border-color); color:var(--text-muted)">Annuler</button>
                </div>
            `;
            document.body.appendChild(overlay);
            overlay.querySelector('#modal-btn-cancel').onclick = () => { overlay.remove(); resolve(false); };
            overlay.querySelector('#modal-btn-ok').onclick = () => { overlay.remove(); resolve(true); };
        });
    },

    prompt(title, placeholder = '', defaultValue = '', type = 'text') {
        return new Promise((resolve) => {
            const overlay = document.createElement('div');
            overlay.className = 'custom-modal-overlay';
            overlay.innerHTML = `
                <div class="custom-modal">
                    <h3><i class="ph-fill ph-chat-text"></i> ${title}</h3>
                    <input type="${type}" id="modal-input" placeholder="${placeholder}" value="${defaultValue}" step="any">
                    <button id="modal-btn-ok">Valider</button>
                    <button id="modal-btn-cancel" class="danger">Annuler</button>
                </div>
            `;
            document.body.appendChild(overlay);
            overlay.querySelector('#modal-btn-cancel').onclick = () => { overlay.remove(); resolve(null); };
            overlay.querySelector('#modal-btn-ok').onclick = () => {
                const val = overlay.querySelector('#modal-input').value;
                overlay.remove(); resolve(val);
            };
        });
    },

    saleModal(pName, maxStock, currentPrice) {
        return new Promise((resolve) => {
            const overlay = document.createElement('div');
            overlay.className = 'custom-modal-overlay';
            overlay.innerHTML = `
                <div class="custom-modal" style="border-left-color: var(--neon-green)">
                    <h3 style="color:var(--neon-green);"><i class="ph-fill ph-shopping-cart"></i> Vente: ${pName}</h3>
                    <div style="margin-bottom: 15px; font-size:0.85rem; color:var(--text-muted); padding:10px; background:var(--bg-color); border-radius:8px; display:flex; justify-content:space-between;">
                        <span>Stock: <strong style="color:var(--text-main);">${maxStock}</strong></span>
                        <span>Prix: <strong style="color:var(--neon-cyan);">${formatMoney(currentPrice)}</strong></span>
                    </div>
                    <input type="number" id="sale-qte" placeholder="Quantité à vendre" value="1" min="1" max="${maxStock}">
                    <div class="radio-group" style="padding: 10px 0;">
                        <label><input type="radio" name="sale-type" value="PAYE" checked><span>Payé Comptant</span></label>
                        <label><input type="radio" name="sale-type" value="DETTE"><span>Mettre en Dette</span></label>
                    </div>
                    <input type="text" id="sale-client" placeholder="Nom du débiteur (Obligatoire)" style="display:none; transition: all 0.3s ease;">
                    <button id="sale-btn-ok" style="background-color: var(--neon-green);">Valider la Vente</button>
                    <button id="sale-btn-cancel" class="danger">Annuler</button>
                </div>
            `;
            document.body.appendChild(overlay);

            const rDette = overlay.querySelector('input[value="DETTE"]');
            const rPaye = overlay.querySelector('input[value="PAYE"]');
            const inputClient = overlay.querySelector('#sale-client');

            rDette.onchange = () => inputClient.style.display = 'block';
            rPaye.onchange = () => inputClient.style.display = 'none';

            overlay.querySelector('#sale-btn-cancel').onclick = () => { overlay.remove(); resolve(null); };
            overlay.querySelector('#sale-btn-ok').onclick = () => { 
                const qte = parseInt(overlay.querySelector('#sale-qte').value);
                const type = overlay.querySelector('input[name="sale-type"]:checked').value;
                const clientName = inputClient.value;
                
                if(isNaN(qte) || qte <= 0 || qte > maxStock) return UI.showToast("Quantité invalide", "error");
                if(type === 'DETTE' && !clientName.trim()) return UI.showToast("Le nom est obligatoire pour une dette", "error");
                
                overlay.remove();
                resolve({ qte, statut_paiement: type, dette_nom: clientName.trim() });
            };
        });
    }
};

UI.injectStyles();

const dbManager = {
    dbName: "NeonBusinessDB",
    dbVersion: 3, 
    db: null,

    initDB: function() {
        return new Promise((resolve, reject) => {
            if(this.db) return resolve();
            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains('Produits')) {
                    db.createObjectStore('Produits', { keyPath: 'id' });
                }
                if (!db.objectStoreNames.contains('Transactions')) {
                    db.createObjectStore('Transactions', { keyPath: 'id' });
                }
            };

            request.onsuccess = (event) => {
                this.db = event.target.result;
                resolve();
            };

            request.onerror = (event) => reject("Erreur d'ouverture DB");
        });
    },

    getProducts: function() { return this._getAll('Produits'); },
    getTransactions: function() { return this._getAll('Transactions'); },
    
    getTransaction: function(id) {
        return new Promise((resolve, reject) => {
            if(!this.db) return resolve(null);
            const transaction = this.db.transaction(['Transactions'], 'readonly');
            const request = transaction.objectStore('Transactions').get(id.toString());
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    },

    payDebt: function(id) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['Transactions'], 'readwrite');
            const store = transaction.objectStore('Transactions');
            const request = store.get(id.toString());
            
            request.onsuccess = (event) => {
                const trans = event.target.result;
                if(!trans) return reject(new Error("Transaction non trouvée"));
                if(trans.statut_paiement !== 'DETTE') return reject(new Error("Cette transaction n'est pas une dette en cours"));
                
                trans.statut_paiement = 'PAYE';
                trans.date_paiement = new Date().toISOString();
                
                store.put(trans);
            };
            
            request.onerror = () => reject(new Error("Erreur de récupération de la dette"));
            transaction.oncomplete = () => resolve();
            transaction.onerror = () => reject(new Error("Erreur lors du paiement"));
        });
    },
    
    _getAll: async function(storeName) {
        await this.initDB();
        return new Promise((resolve, reject) => {
            if(!this.db.objectStoreNames.contains(storeName)) return resolve([]);
            const request = this.db.transaction([storeName], 'readonly').objectStore(storeName).getAll();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    },

    addProduct: async function(product) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['Produits', 'Transactions'], 'readwrite');
            
            product.id = Date.now().toString();
            product.date_ajout = new Date().toISOString();
            // product format expected: { nom, prix_achat_moyen, prix_vente, stock_actuel, seuil_alerte, image_base64 }
            
            const trans = {
                id: Date.now().toString(),
                type: 'ACHAT',
                produit_id: product.id,
                nom_produit_historique: product.nom,
                quantite: product.stock_actuel,
                prix_unitaire: product.prix_achat_moyen, // In USD
                montant_total: -(product.prix_achat_moyen * product.stock_actuel), // In USD
                date_transaction: new Date().toISOString(),
                details: 'Stock initial',
                taux_historique: window.appSettings.getRate(),
                statut_paiement: 'PAYE',
                dette_nom: ''
            };

            transaction.objectStore('Produits').put(product);
            transaction.objectStore('Transactions').add(trans);
            
            transaction.oncomplete = () => resolve();
            transaction.onerror = () => reject(transaction.error);
        });
    },

    sellProduct: async function(id, saleData) { // saleData: { qte, statut_paiement, dette_nom }
        return new Promise(async (resolve, reject) => {
            const strId = id.toString();
            const products = await this.getProducts();
            const product = products.find(p => p.id === strId);
            
            if (!product) return reject(new Error("Produit non trouvé."));
            if (product.stock_actuel < saleData.qte) return reject(new Error("Stock insuffisant !"));

            const transaction = this.db.transaction(['Produits', 'Transactions'], 'readwrite');

            product.stock_actuel -= saleData.qte;
            
            const trans = {
                id: Date.now().toString(),
                type: 'VENTE',
                produit_id: product.id,
                nom_produit_historique: product.nom,
                quantite: saleData.qte,
                prix_unitaire: product.prix_vente,
                montant_total: (product.prix_vente * saleData.qte),
                marge_realisee: (product.prix_vente - product.prix_achat_moyen) * saleData.qte,
                date_transaction: new Date().toISOString(),
                taux_historique: window.appSettings.getRate(),
                statut_paiement: saleData.statut_paiement,
                dette_nom: saleData.dette_nom
            };

            transaction.objectStore('Produits').put(product);
            transaction.objectStore('Transactions').add(trans);
            
            transaction.oncomplete = () => resolve();
            transaction.onerror = () => reject(new Error("Erreur transaction."));
        });
    },

    restockProduct: async function(id, qte, purchasePriceUsd) {
        return new Promise(async (resolve, reject) => {
            const strId = id.toString();
            const products = await this.getProducts();
            const product = products.find(p => p.id === strId);
            if (!product) return reject(new Error("Produit non trouvé."));

            const currentTotalValue = product.stock_actuel * product.prix_achat_moyen;
            const addedValue = qte * purchasePriceUsd;
            const newTotalStock = product.stock_actuel + qte;
            
            product.prix_achat_moyen = (currentTotalValue + addedValue) / newTotalStock;
            product.stock_actuel = newTotalStock;

            const transaction = this.db.transaction(['Produits', 'Transactions'], 'readwrite');
            const trans = {
                id: Date.now().toString(),
                type: 'ACHAT',
                produit_id: product.id,
                nom_produit_historique: product.nom,
                quantite: qte,
                prix_unitaire: purchasePriceUsd,
                montant_total: -(purchasePriceUsd * qte),
                date_transaction: new Date().toISOString(),
                details: 'Réapprovisionnement',
                taux_historique: window.appSettings.getRate(),
                statut_paiement: 'PAYE',
                dette_nom: ''
            };

            transaction.objectStore('Produits').put(product);
            transaction.objectStore('Transactions').add(trans);
            
            transaction.oncomplete = () => resolve();
            transaction.onerror = () => reject(new Error("Erreur achat."));
        });
    },

    updateProduct: async function(id, newProps) { // props: { nom, prix_vente, seuil_alerte, image_base64 }
        return new Promise(async (resolve, reject) => {
            const strId = id.toString();
            const products = await this.getProducts();
            const product = products.find(p => p.id === strId);
            if (!product) return reject(new Error("Produit non trouvé."));

            Object.assign(product, newProps);
            const transaction = this.db.transaction(['Produits', 'Transactions'], 'readwrite');
            const trans = {
                id: Date.now().toString(), type: 'EDITION', produit_id: product.id, nom_produit_historique: product.nom,
                quantite: 0, prix_unitaire: 0, montant_total: 0, date_transaction: new Date().toISOString(),
                details: 'Édition produit', taux_historique: window.appSettings.getRate(), statut_paiement: 'PAYE', dette_nom: ''
            };
            
            transaction.objectStore('Produits').put(product);
            transaction.objectStore('Transactions').add(trans);
            transaction.oncomplete = () => resolve();
            transaction.onerror = () => reject(transaction.error);
        });
    },

    deleteProduct: async function(id) {
        return new Promise(async (resolve, reject) => {
            const transaction = this.db.transaction(['Produits', 'Transactions'], 'readwrite');
            const trans = {
                id: Date.now().toString(), type: 'EDITION', produit_id: id.toString(), nom_produit_historique: 'Produit Supprimé',
                quantite: 0, prix_unitaire: 0, montant_total: 0, date_transaction: new Date().toISOString(),
                details: 'Suppression produit', statut_paiement: 'PAYE'
            };
            transaction.objectStore('Produits').delete(id.toString());
            transaction.objectStore('Transactions').add(trans);
            transaction.oncomplete = () => resolve();
            transaction.onerror = () => reject(transaction.error);
        });
    },

    withdrawFunds: async function(amountLocal, reason) {
        return new Promise((resolve, reject) => {
            const amountUsd = window.appSettings.convertToUsd(amountLocal);
            const transaction = this.db.transaction(['Transactions'], 'readwrite');
            const trans = {
                id: Date.now().toString(),
                type: 'RETRAIT',
                produit_id: '',
                nom_produit_historique: 'Retrait Fonds',
                quantite: 0,
                prix_unitaire: 0,
                montant_total: -(amountUsd),
                date_transaction: new Date().toISOString(),
                details: reason || 'Non spécifié',
                taux_historique: window.appSettings.getRate(),
                statut_paiement: 'PAYE',
                dette_nom: ''
            };
            transaction.objectStore('Transactions').add(trans);
            transaction.oncomplete = () => resolve();
            transaction.onerror = () => reject(new Error("Erreur de transaction, retrait non effectué."));
        });
    },

    exportJSON: async function() {
        try {
            await this.initDB();
            const data = { 
                Produits: await this.getProducts(), 
                Transactions: await this.getTransactions(),
                Settings: {
                    curr: window.appSettings.getCurrency(),
                    rate: window.appSettings.getRate(),
                    theme: window.appSettings.getTheme()
                }
            };
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url; a.download = "export_business_manager_" + new Date().toISOString().slice(0,10) + ".json";
            document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
            UI.showToast("Données sauvegardées avec succès", "success");
        } catch(e) { UI.showToast("Erreur d'exportation", "error"); }
    },
    
    importJSON: async function(jsonString) {
        try {
            await this.initDB();
            const data = JSON.parse(jsonString);
            if (!data.Produits) throw new Error("Format JSON invalide");
            const transaction = this.db.transaction(['Produits', 'Transactions'], 'readwrite');
            transaction.objectStore('Produits').clear();
            transaction.objectStore('Transactions').clear();
            
            data.Produits.forEach(p => transaction.objectStore('Produits').add(p));
            if(data.Transactions) data.Transactions.forEach(t => transaction.objectStore('Transactions').add(t));
            
            // Backward compatibility: Only load settings if they exist in the JSON
            if(data.Settings) {
                if(data.Settings.curr && data.Settings.rate) window.appSettings.setSettings(data.Settings.curr, data.Settings.rate);
                if(data.Settings.theme) window.appSettings.setTheme(data.Settings.theme);
            }
            
            return new Promise((resolve, reject) => {
                transaction.oncomplete = () => { 
                    UI.showToast("Importation réussie ! Rechargement...", "success"); 
                    setTimeout(() => window.location.reload(), 1500);
                    resolve(); 
                };
                transaction.onerror = () => { UI.showToast("Erreur import (données corrompues)", "error"); reject(transaction.error); };
            });
        } catch(e) {
            UI.showToast("Fichier corrompu ou format de données incorrect", "error");
        }
    },

    clearData: async function() {
        const check1 = await UI.confirm("Réinitialisation", "Êtes-vous sûr de vouloir tout effacer ?", true);
        if(!check1) return;
        const check2 = await UI.confirm("ALERTE ROUGE", "C'est irréversible. Toutes les données seront détruites. Confirmer ?", true);
        if(!check2) return;
        
        await this.initDB();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['Produits', 'Transactions'], 'readwrite');
            transaction.objectStore('Produits').clear();
            transaction.objectStore('Transactions').clear();
            transaction.oncomplete = () => {
                UI.showToast("Application réinitialisée !");
                setTimeout(() => location.reload(), 1000);
                resolve();
            };
            transaction.onerror = () => reject();
        });
    }
};

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js').then(reg => {
            console.log('NEON Business Service Worker Registered!', reg.scope);
        }).catch(err => {
            console.error('Service Worker registration failed: ', err);
        });
    });
}
