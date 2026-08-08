import { useState } from "react";

export interface PreorderRowState {
  id: string;
  item: string;
  quantity: string;
}

let idCounter = 0;
const generateId = () => `row-${Date.now()}-${idCounter++}`;

export function usePreorderItemRows() {
  const [rows, setRows] = useState<PreorderRowState[]>([]);
  const [draftItem, setDraftItem] = useState('');
  const [draftQuantity, setDraftQuantity] = useState('');
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [editBuffer, setEditBuffer] = useState<{ item: string; quantity: string }>({ item: '', quantity: '' });

  const draftReady = draftItem.trim().length > 0 && draftQuantity.trim().length > 0;

  const confirmDraft = () => {
    if (!draftReady) return;
    setRows(prev => [...prev, { id: generateId(), item: draftItem.trim(), quantity: draftQuantity.trim() }]);
    setDraftItem('');
    setDraftQuantity('');
  };

  const startEdit = (id: string) => {
    const target = rows.find(r => r.id === id);
    if (!target) return;
    setEditBuffer({ item: target.item, quantity: target.quantity });
    setEditingRowId(id);
  };

  const updateEditBuffer = (field: 'item' | 'quantity', value: string) => {
    setEditBuffer(prev => ({ ...prev, [field]: value }));
  };

  const confirmEdit = () => {
    if (!editingRowId) return;
    if (!editBuffer.item.trim() || !editBuffer.quantity.trim()) return;
    setRows(prev => prev.map(r =>
      r.id === editingRowId ? { ...r, item: editBuffer.item.trim(), quantity: editBuffer.quantity.trim() } : r
    ));
    setEditingRowId(null);
  };

  const deleteRow = (id: string) => {
    setRows(prev => prev.filter(r => r.id !== id));
    if (editingRowId === id) setEditingRowId(null);
  };

  // Send enabled only when: at least one saved row exists, and no row is mid-edit
  const canSend = rows.length > 0 && editingRowId === null;

  const resetAll = () => {
    setRows([]);
    setDraftItem('');
    setDraftQuantity('');
    setEditingRowId(null);
  };

  return {
    rows, draftItem, draftQuantity, draftReady, editingRowId, editBuffer, canSend,
    setDraftItem, setDraftQuantity, confirmDraft,
    startEdit, updateEditBuffer, confirmEdit, deleteRow,
    resetAll,
  };
}