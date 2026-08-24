import { useState } from 'react';

const ColorSelectionModal = ({ isOpen, onClose, colors = [], productName, onConfirm }) => {
  const [selectedColor, setSelectedColor] = useState('');

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (!selectedColor) return;
    onConfirm(selectedColor);
    onClose();
    setSelectedColor('');
  };

  const handleClose = () => {
    onClose();
    setSelectedColor('');
  };

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={handleClose} />
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-sm bg-white rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in duration-200">
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-extrabold text-slate-800 tracking-tight">Choose a Color</h2>
              <p className="text-slate-400 text-xs font-medium mt-1">{productName}</p>
            </div>
            <button onClick={handleClose} className="p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-xl transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>

          <div className="p-6">
            <select
              value={selectedColor}
              onChange={(e) => setSelectedColor(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-sky-500 focus:ring-4 focus:ring-sky-500/5 transition-all outline-none font-medium text-slate-700 text-sm appearance-none"
            >
              <option value="">Select a color</option>
              {colors.map((color) => (
                <option key={color} value={color}>{color}</option>
              ))}
            </select>
          </div>

          <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-6 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-all active:scale-95 text-sm"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={!selectedColor}
              className="flex-1 px-6 py-3 rounded-xl bg-sky-500 text-white font-bold shadow-lg shadow-sky-200 hover:bg-sky-600 transition-all active:scale-95 text-sm disabled:opacity-50"
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColorSelectionModal;
