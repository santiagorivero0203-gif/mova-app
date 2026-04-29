/**
 * ============================================
 * CustomSignsManager.js — Manejador de Señas Custom
 * ============================================
 */
const STORAGE_KEY = 'senas_mova';

export const CustomSignsManager = {
  load() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch {
      return [];
    }
  },

  saveCurrentSigns(signs) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(signs));
  },

  addSign(name, vector) {
    const signs = this.load();
    const newSign = { nombre: name, vector };
    // Evitar duplicados por nombre
    const filteredSigns = signs.filter(s => s.nombre !== name);
    filteredSigns.push(newSign);
    this.saveCurrentSigns(filteredSigns);
    return newSign;
  },

  deleteSign(name) {
    const signs = this.load();
    const filteredSigns = signs.filter(s => s.nombre !== name);
    this.saveCurrentSigns(filteredSigns);
    return filteredSigns;
  }
};
