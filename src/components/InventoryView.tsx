import React, { useState, useMemo } from 'react';
import { 
  Boxes, 
  Plus, 
  Search, 
  Filter, 
  AlertTriangle, 
  Calendar, 
  ArrowUpRight, 
  ArrowDownRight, 
  History, 
  Edit3, 
  Trash2, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  Package, 
  Tag, 
  MapPin, 
  DollarSign, 
  FileText, 
  Printer, 
  Download, 
  RotateCcw,
  Check,
  ChevronDown,
  X,
  Layers,
  ShoppingBag,
  Pill,
  Activity,
  UserCheck
} from 'lucide-react';
import { InventoryItem, StockMovement, InventoryCategory, InventoryUnit, Patient, UserAccount } from '../types';
import { INVENTORY_CATEGORIES, INVENTORY_UNITS, PRESET_SUPPLY_TEMPLATES, PresetSupplyTemplate } from '../data/inventorySeedData';
import { NutriaAvatar } from './NutriaAvatar';

interface InventoryViewProps {
  inventory: InventoryItem[];
  patients?: Patient[];
  userAccount?: UserAccount;
  onSaveItem: (item: InventoryItem) => void;
  onDeleteItem: (itemId: string) => void;
  onRecordMovement?: (movement: StockMovement, updatedItem: InventoryItem) => void;
  onLogMovement?: (movement: StockMovement, updatedItem: InventoryItem) => void;
  onOpenNutriaWithPrompt: (prompt: string) => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  inventory = [],
  patients = [],
  userAccount,
  onSaveItem,
  onDeleteItem,
  onRecordMovement,
  onLogMovement,
  onOpenNutriaWithPrompt
}) => {
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'low_stock' | 'expiring' | 'normal'>('all');

  // Modals state
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [isNewItem, setIsNewItem] = useState(false);
  const [selectedPresetSupply, setSelectedPresetSupply] = useState<string>('');

  const [movementItem, setMovementItem] = useState<InventoryItem | null>(null);
  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);

  const [historyItem, setHistoryItem] = useState<InventoryItem | null>(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isGlobalHistoryOpen, setIsGlobalHistoryOpen] = useState(false);

  // Success toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleRecordMovement = (movement: StockMovement, updatedItem: InventoryItem) => {
    if (onRecordMovement) {
      onRecordMovement(movement, updatedItem);
    } else if (onLogMovement) {
      onLogMovement(movement, updatedItem);
    }
  };

  // Helper date checking
  const today = new Date();
  const getExpirationStatus = (expDate?: string) => {
    if (!expDate) return { label: 'Sem Validade', color: 'text-purple-300 bg-purple-950/40 border-purple-800/40', isExpiring: false, isExpired: false };
    const exp = new Date(expDate);
    const diffTime = exp.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { label: `VENCIDO (${Math.abs(diffDays)}d)`, color: 'text-rose-300 bg-rose-950/80 border-rose-600/80 font-bold', isExpiring: true, isExpired: true };
    }
    if (diffDays <= 60) {
      return { label: `Vence em ${diffDays}d`, color: 'text-amber-300 bg-amber-950/80 border-amber-600/70 font-semibold', isExpiring: true, isExpired: false };
    }
    return { label: `Val: ${exp.toLocaleDateString('pt-BR')}`, color: 'text-emerald-300 bg-emerald-950/40 border-emerald-800/40', isExpiring: false, isExpired: false };
  };

  // Filtered items
  const filteredItems = useMemo(() => {
    return inventory.filter(item => {
      // Text search
      const query = searchQuery.toLowerCase().trim();
      const matchesQuery = !query || 
        item.name.toLowerCase().includes(query) ||
        (item.subcategory && item.subcategory.toLowerCase().includes(query)) ||
        (item.lotNumber && item.lotNumber.toLowerCase().includes(query)) ||
        (item.location && item.location.toLowerCase().includes(query)) ||
        (item.supplier && item.supplier.toLowerCase().includes(query));

      // Category filter
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;

      // Status filter
      let matchesStatus = true;
      if (selectedStatus === 'low_stock') {
        matchesStatus = item.currentStock <= item.minStock;
      } else if (selectedStatus === 'expiring') {
        const expStatus = getExpirationStatus(item.expirationDate);
        matchesStatus = expStatus.isExpiring;
      } else if (selectedStatus === 'normal') {
        const expStatus = getExpirationStatus(item.expirationDate);
        matchesStatus = item.currentStock > item.minStock && !expStatus.isExpiring;
      }

      return matchesQuery && matchesCategory && matchesStatus;
    });
  }, [inventory, searchQuery, selectedCategory, selectedStatus]);

  // Key KPI metrics
  const totalItems = inventory.length;
  const lowStockItems = inventory.filter(i => i.currentStock <= i.minStock);
  const expiringItems = inventory.filter(i => getExpirationStatus(i.expirationDate).isExpiring);
  const totalStockValue = inventory.reduce((acc, i) => acc + ((i.costPrice || 0) * i.currentStock), 0);
  
  // All global movements collected
  const allMovements = useMemo(() => {
    const list: StockMovement[] = [];
    inventory.forEach(item => {
      if (Array.isArray(item.movements)) {
        list.push(...item.movements);
      }
    });
    return list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [inventory]);

  // Quick +1 / -1 handler
  const handleQuickAdjustment = (item: InventoryItem, delta: number) => {
    const newStock = Math.max(0, item.currentStock + delta);
    if (newStock === item.currentStock) return;

    const isEntry = delta > 0;
    const movementType = isEntry ? 'entrada' : 'saida';
    const reason = isEntry ? 'Entrada rápida (+1)' : 'Saída rápida (-1)';

    const movement: StockMovement = {
      id: `mov-${Date.now()}`,
      itemId: item.id,
      itemName: item.name,
      type: movementType,
      quantity: Math.abs(delta),
      previousStock: item.currentStock,
      newStock: newStock,
      reason: reason,
      timestamp: new Date().toISOString(),
      user: userAccount?.name || 'Profissional'
    };

    const updatedItem: InventoryItem = {
      ...item,
      currentStock: newStock,
      updatedAt: new Date().toISOString(),
      lastMovementDate: new Date().toISOString(),
      movements: [movement, ...(item.movements || [])]
    };

    handleRecordMovement(movement, updatedItem);
    showToast(`${isEntry ? '+1 adicionado ao' : '-1 retirado do'} estoque de ${item.name}`);
  };

  // Open item create modal
  const handleOpenCreateItem = () => {
    setIsNewItem(true);
    setSelectedPresetSupply('');
    setEditingItem({
      id: `inv-${Date.now()}`,
      name: '',
      category: '' as any,
      subcategory: '',
      currentStock: 0,
      minStock: 0,
      unit: '' as any,
      unitLabel: '',
      lotNumber: '',
      expirationDate: '',
      location: '',
      costPrice: 0,
      salePrice: 0,
      supplier: '',
      notes: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    setIsItemModalOpen(true);
  };

  // Handle selection of preset supply template from dropdown
  const handleSelectPresetSupply = (value: string) => {
    setSelectedPresetSupply(value);
    if (!editingItem) return;

    if (value === 'custom') {
      // "+ Adicionar novo (Personalizado)" selected
      setEditingItem({
        ...editingItem,
        name: '',
        category: '' as any,
        subcategory: '',
        unit: '' as any,
        unitLabel: '',
        location: '',
        currentStock: 0,
        minStock: 0,
        costPrice: 0
      });
      return;
    }

    const template = PRESET_SUPPLY_TEMPLATES.find(t => t.name === value);
    if (template) {
      setEditingItem({
        ...editingItem,
        name: template.name,
        category: template.category,
        subcategory: template.subcategory,
        unit: template.unit,
        unitLabel: template.unitLabel,
        location: template.defaultLocation || '',
        currentStock: 0,
        minStock: 0,
        costPrice: 0,
        lotNumber: '',
        expirationDate: ''
      });
    }
  };

  const handleOpenEditItem = (item: InventoryItem) => {
    setIsNewItem(false);
    setSelectedPresetSupply('custom');
    setEditingItem({ ...item });
    setIsItemModalOpen(true);
  };

  const handleSaveItemModal = (itemToSave: InventoryItem) => {
    const categoryObj = INVENTORY_CATEGORIES.find(c => c.id === itemToSave.category);
    const unitObj = INVENTORY_UNITS.find(u => u.id === itemToSave.unit);

    const finalItem: InventoryItem = {
      ...itemToSave,
      categoryLabel: categoryObj?.label || itemToSave.categoryLabel,
      unitLabel: unitObj?.plural || itemToSave.unitLabel,
      updatedAt: new Date().toISOString()
    };

    onSaveItem(finalItem);
    setIsItemModalOpen(false);
    setEditingItem(null);
    showToast(`Item "${finalItem.name}" salvo no estoque!`);
  };

  // Handle custom stock movement
  const handleOpenMovementModal = (item: InventoryItem) => {
    setMovementItem(item);
    setIsMovementModalOpen(true);
  };

  const handleSaveCustomMovement = (
    item: InventoryItem, 
    type: StockMovement['type'], 
    quantity: number, 
    reason: string, 
    patientName?: string,
    notes?: string
  ) => {
    const isIncrement = type === 'entrada';
    const calculatedNewStock = isIncrement 
      ? item.currentStock + quantity 
      : Math.max(0, item.currentStock - quantity);

    const movement: StockMovement = {
      id: `mov-${Date.now()}`,
      itemId: item.id,
      itemName: item.name,
      type: type,
      quantity: quantity,
      previousStock: item.currentStock,
      newStock: calculatedNewStock,
      reason: reason,
      patientName: patientName,
      notes: notes,
      timestamp: new Date().toISOString(),
      user: userAccount?.name || 'Profissional'
    };

    const updatedItem: InventoryItem = {
      ...item,
      currentStock: calculatedNewStock,
      updatedAt: new Date().toISOString(),
      lastMovementDate: new Date().toISOString(),
      movements: [movement, ...(item.movements || [])]
    };

    handleRecordMovement(movement, updatedItem);
    setIsMovementModalOpen(false);
    setMovementItem(null);
    showToast(`Movimentação de ${quantity} ${item.unit} gravada com sucesso!`);
  };

  // Print summary report
  const handlePrintInventory = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-16">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#220743] border border-fuchsia-500/80 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-slideUp">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs sm:text-sm font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#1b0638] via-[#290a50] to-[#16042e] border border-purple-800/60 rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-fuchsia-600/20 border border-fuchsia-500/40 flex items-center justify-center text-fuchsia-400 shadow-inner">
              <Boxes className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                Gestão de Estoque & Insumos Clínicos
              </h1>
              <p className="text-xs sm:text-sm text-purple-200/80">
                Suplementos, ampolas, fitoterápicos, consumíveis, controle de lotes e baixas automáticas.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => onOpenNutriaWithPrompt("NÚTRIA, consulte o estoque do consultório e liste todos os itens com estoque baixo ou próximos da validade.")}
            className="px-3.5 py-2.5 rounded-xl bg-[#230846] hover:bg-[#320c62] text-fuchsia-200 border border-fuchsia-500/40 text-xs font-bold flex items-center gap-2 transition-all shadow-md cursor-pointer"
          >
            <NutriaAvatar size="xs" className="w-4 h-4 border-fuchsia-300/80 shadow" />
            <span>Consultar NÚTRIA IA</span>
          </button>

          <button
            onClick={() => setIsGlobalHistoryOpen(true)}
            className="px-3.5 py-2.5 rounded-xl bg-[#1b0638] hover:bg-[#2c0b56] text-purple-200 border border-purple-700/50 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
          >
            <History className="w-4 h-4 text-purple-300" />
            <span>Histórico ({allMovements.length})</span>
          </button>

          <button
            onClick={handlePrintInventory}
            className="px-3.5 py-2.5 rounded-xl bg-[#1b0638] hover:bg-[#2c0b56] text-purple-200 border border-purple-700/50 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
            title="Imprimir relatório de estoque"
          >
            <Printer className="w-4 h-4 text-purple-300" />
            <span className="hidden sm:inline">Imprimir</span>
          </button>

          <button
            onClick={handleOpenCreateItem}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-fuchsia-600 via-purple-600 to-indigo-600 hover:from-fuchsia-500 hover:to-purple-500 text-white text-xs sm:text-sm font-black flex items-center gap-2 shadow-lg shadow-fuchsia-950/60 border border-fuchsia-400/50 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Novo Item</span>
          </button>
        </div>
      </div>

      {/* KPI Metrics Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Total Items */}
        <div 
          onClick={() => { setSelectedCategory('all'); setSelectedStatus('all'); }}
          className="bg-[#15042a] border border-purple-800/50 hover:border-purple-600/70 p-4 rounded-2xl cursor-pointer transition-all shadow-md group"
        >
          <div className="flex items-center justify-between text-purple-300 text-xs font-bold mb-1">
            <span>Total Cadastrado</span>
            <Package className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-white">{totalItems}</div>
          <span className="text-[11px] text-purple-300/70">Produtos & Insumos ativos</span>
        </div>

        {/* Low Stock Alert */}
        <div 
          onClick={() => setSelectedStatus(selectedStatus === 'low_stock' ? 'all' : 'low_stock')}
          className={`p-4 rounded-2xl cursor-pointer transition-all shadow-md border group ${
            lowStockItems.length > 0 
              ? 'bg-rose-950/40 border-rose-700/60 hover:border-rose-500' 
              : 'bg-[#15042a] border-purple-800/50 hover:border-purple-600/70'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold mb-1">
            <span className={lowStockItems.length > 0 ? 'text-rose-300' : 'text-purple-300'}>Estoque Crítico / Baixo</span>
            <AlertTriangle className={`w-4 h-4 ${lowStockItems.length > 0 ? 'text-rose-400 animate-pulse' : 'text-purple-400'}`} />
          </div>
          <div className={`text-2xl font-black ${lowStockItems.length > 0 ? 'text-rose-300' : 'text-white'}`}>
            {lowStockItems.length}
          </div>
          <span className="text-[11px] text-purple-300/70">Abaixo da margem mínima</span>
        </div>

        {/* Expiration Alert */}
        <div 
          onClick={() => setSelectedStatus(selectedStatus === 'expiring' ? 'all' : 'expiring')}
          className={`p-4 rounded-2xl cursor-pointer transition-all shadow-md border group ${
            expiringItems.length > 0 
              ? 'bg-amber-950/40 border-amber-700/60 hover:border-amber-500' 
              : 'bg-[#15042a] border-purple-800/50 hover:border-purple-600/70'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold mb-1">
            <span className={expiringItems.length > 0 ? 'text-amber-300' : 'text-purple-300'}>Vencimento Próximo</span>
            <Clock className={`w-4 h-4 ${expiringItems.length > 0 ? 'text-amber-400' : 'text-purple-400'}`} />
          </div>
          <div className={`text-2xl font-black ${expiringItems.length > 0 ? 'text-amber-300' : 'text-white'}`}>
            {expiringItems.length}
          </div>
          <span className="text-[11px] text-purple-300/70">Vencendo em até 60 dias</span>
        </div>

        {/* Total Value / Movements */}
        <div 
          onClick={() => setIsGlobalHistoryOpen(true)}
          className="bg-[#15042a] border border-purple-800/50 hover:border-purple-600/70 p-4 rounded-2xl cursor-pointer transition-all shadow-md group"
        >
          <div className="flex items-center justify-between text-purple-300 text-xs font-bold mb-1">
            <span>Movimentações Gravadas</span>
            <History className="w-4 h-4 text-fuchsia-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-fuchsia-300">{allMovements.length}</div>
          <span className="text-[11px] text-purple-300/70">
            {totalStockValue > 0 ? `Valor em estoque: R$ ${totalStockValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'Rastreio auditável 100%'}
          </span>
        </div>

      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#140428] border border-purple-800/60 rounded-2xl p-4 space-y-4 shadow-md">
        <div className="flex flex-col md:flex-row items-center gap-3">
          
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-purple-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por nome do produto, lote, fornecedor, subcategoria..."
              className="w-full bg-[#1b0638] border border-purple-700/50 rounded-xl pl-9 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-purple-400/60 focus:outline-none focus:border-fuchsia-400 transition-all"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Status Quick Filter */}
          <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            <button
              onClick={() => setSelectedStatus('all')}
              className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedStatus === 'all'
                  ? 'bg-[#2b0852] text-white border border-fuchsia-500/50'
                  : 'bg-[#180530] text-purple-300 border border-purple-800/40 hover:bg-[#220743]'
              }`}
            >
              Todos ({inventory.length})
            </button>

            <button
              onClick={() => setSelectedStatus('low_stock')}
              className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                selectedStatus === 'low_stock'
                  ? 'bg-rose-950 text-rose-200 border border-rose-500'
                  : 'bg-[#180530] text-rose-300/80 border border-rose-900/40 hover:bg-rose-950/40'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              <span>Estoque Crítico ({lowStockItems.length})</span>
            </button>

            <button
              onClick={() => setSelectedStatus('expiring')}
              className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                selectedStatus === 'expiring'
                  ? 'bg-amber-950 text-amber-200 border border-amber-500'
                  : 'bg-[#180530] text-amber-300/80 border border-amber-900/40 hover:bg-amber-950/40'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Vencimentos ({expiringItems.length})</span>
            </button>
          </div>

        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white shadow-sm'
                : 'bg-[#1b0638] text-purple-300 hover:text-white border border-purple-800/40'
            }`}
          >
            Todas Categorias
          </button>
          {INVENTORY_CATEGORIES.map(cat => {
            const isSelected = selectedCategory === cat.id;
            const count = inventory.filter(i => i.category === cat.id).length;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white font-bold shadow-sm'
                    : 'bg-[#1b0638] text-purple-300 hover:text-white border border-purple-800/40'
                }`}
              >
                <span>{cat.label}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-purple-950/80 text-purple-200 border border-purple-800/50">
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Items List / Cards or Clean Empty State */}
      {inventory.length === 0 ? (
        <div className="bg-[#140428] border border-purple-800/50 rounded-3xl p-12 text-center space-y-4 shadow-xl">
          <div className="w-16 h-16 rounded-3xl bg-purple-900/30 border border-purple-700/50 flex items-center justify-center text-purple-400 mx-auto shadow-inner">
            <Boxes className="w-8 h-8 opacity-70" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base sm:text-lg font-bold text-white">Nenhum insumo cadastrado no estoque</h3>
            <p className="text-xs sm:text-sm text-purple-300/80 max-w-lg mx-auto">
              Nenhum insumo cadastrado no estoque. Clique em '+ Novo Item' para iniciar o controle do consultório.
            </p>
          </div>
          <div className="pt-2">
            <button
              onClick={handleOpenCreateItem}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-fuchsia-600 via-purple-600 to-indigo-600 hover:from-fuchsia-500 hover:to-purple-500 text-white text-xs sm:text-sm font-black inline-flex items-center gap-2 shadow-lg shadow-fuchsia-950/60 border border-fuchsia-400/50 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Novo Item</span>
            </button>
          </div>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="bg-[#140428] border border-purple-800/50 rounded-3xl p-10 text-center space-y-3">
          <Boxes className="w-12 h-12 text-purple-400/50 mx-auto" />
          <h3 className="text-base font-bold text-white">Nenhum item encontrado para os filtros selecionados</h3>
          <p className="text-xs text-purple-300/80 max-w-md mx-auto">
            Tente limpar a busca ou os filtros de categoria/status para visualizar os outros itens cadastrados.
          </p>
          <div className="pt-2">
            <button
              onClick={() => { setSearchQuery(''); setSelectedCategory('all'); setSelectedStatus('all'); }}
              className="px-4 py-2 rounded-xl bg-[#20063e] hover:bg-[#2e0958] text-purple-200 text-xs font-bold inline-flex items-center gap-1.5 border border-purple-700/50 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Limpar Filtros</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map(item => {
            const expStatus = getExpirationStatus(item.expirationDate);
            const isLowStock = item.currentStock <= item.minStock;

            return (
              <div 
                key={item.id}
                className={`bg-[#140428] border rounded-3xl p-5 space-y-4 shadow-lg transition-all hover:border-fuchsia-500/50 flex flex-col justify-between ${
                  isLowStock 
                    ? 'border-rose-700/60 shadow-rose-950/30 ring-1 ring-rose-500/20' 
                    : 'border-purple-800/60'
                }`}
              >
                {/* Top Item Info */}
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {item.subcategory && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#250849] text-fuchsia-300 border border-fuchsia-700/40 uppercase">
                            {item.subcategory}
                          </span>
                        )}
                        {isLowStock && (
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-rose-950 text-rose-300 border border-rose-600/80 uppercase animate-pulse flex items-center gap-1">
                            <AlertTriangle className="w-2.5 h-2.5 text-rose-400" />
                            Estoque Baixo
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-black text-white leading-snug">
                        {item.name}
                      </h3>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditItem(item)}
                        className="p-1.5 rounded-lg bg-[#1e073c] hover:bg-[#2d0959] text-purple-300 hover:text-white border border-purple-700/40 cursor-pointer"
                        title="Editar Produto"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`Deseja realmente remover "${item.name}" do estoque?`)) {
                            onDeleteItem(item.id);
                            showToast(`"${item.name}" removido.`);
                          }
                        }}
                        className="p-1.5 rounded-lg bg-[#1e073c] hover:bg-rose-950 text-purple-300 hover:text-rose-300 border border-purple-700/40 cursor-pointer"
                        title="Excluir Produto"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Stock Quantity Highlight */}
                  <div className="bg-[#1b0638] rounded-2xl p-3 border border-purple-700/40 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-purple-300 font-bold block uppercase tracking-wider">
                        Estoque Atual
                      </span>
                      <div className="flex items-baseline gap-1.5">
                        <span className={`text-2xl font-black ${isLowStock ? 'text-rose-400' : 'text-white'}`}>
                          {item.currentStock}
                        </span>
                        <span className="text-xs text-purple-300 font-bold uppercase">
                          {item.unitLabel || item.unit}
                        </span>
                      </div>
                    </div>

                    <div className="text-right text-[11px] text-purple-300 space-y-0.5">
                      <div>Mínimo: <strong>{item.minStock} {item.unit}</strong></div>
                      {item.lotNumber && (
                        <div className="text-[10px] text-fuchsia-300">Lote: {item.lotNumber}</div>
                      )}
                    </div>
                  </div>

                  {/* Details metadata */}
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-purple-300/90 pt-1">
                    {item.location && (
                      <div className="flex items-center gap-1.5 truncate">
                        <MapPin className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                        <span className="truncate">{item.location}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-1.5 justify-end">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border ${expStatus.color}`}>
                        {expStatus.label}
                      </span>
                    </div>
                  </div>

                  {item.notes && (
                    <p className="text-[11px] text-purple-300/80 line-clamp-2 italic bg-[#15042a] p-2 rounded-xl border border-purple-900/30">
                      "{item.notes}"
                    </p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="pt-3 border-t border-purple-800/40 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleQuickAdjustment(item, -1)}
                      disabled={item.currentStock <= 0}
                      className="py-2 px-3 rounded-xl bg-[#20063e] hover:bg-rose-950/60 text-rose-200 hover:text-rose-100 border border-rose-800/40 text-xs font-black flex items-center justify-center gap-1.5 transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                      title="Dar baixa em 1 unidade"
                    >
                      <ArrowDownRight className="w-3.5 h-3.5 text-rose-400" />
                      <span>-1 Saída</span>
                    </button>

                    <button
                      onClick={() => handleQuickAdjustment(item, 1)}
                      className="py-2 px-3 rounded-xl bg-[#20063e] hover:bg-emerald-950/60 text-emerald-200 hover:text-emerald-100 border border-emerald-800/40 text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      title="Dar entrada em 1 unidade"
                    >
                      <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
                      <span>+1 Entrada</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleOpenMovementModal(item)}
                      className="py-1.5 px-3 rounded-xl bg-[#26084c] hover:bg-[#340c67] text-white border border-purple-700/50 text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer"
                    >
                      <Layers className="w-3 h-3 text-fuchsia-400" />
                      <span>Movimentar</span>
                    </button>

                    <button
                      onClick={() => {
                        setHistoryItem(item);
                        setIsHistoryModalOpen(true);
                      }}
                      className="py-1.5 px-3 rounded-xl bg-[#1b0638] hover:bg-[#250849] text-purple-300 hover:text-white border border-purple-800/40 text-xs font-medium flex items-center justify-center gap-1 transition-all cursor-pointer"
                    >
                      <History className="w-3 h-3 text-purple-400" />
                      <span>Histórico ({(item.movements || []).length})</span>
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* MODAL 1: Cadastrar / Editar Produto com Dropdown de Catálogo e Adicionar Novo */}
      {isItemModalOpen && editingItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#16042e] border border-purple-800/80 rounded-3xl w-full max-w-2xl p-6 space-y-5 shadow-2xl animate-scaleUp max-h-[92vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-purple-800/50 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-fuchsia-600/20 border border-fuchsia-500/40 flex items-center justify-center text-fuchsia-400">
                  <Package className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-black text-white">
                  {isNewItem ? 'Cadastrar Novo Item no Estoque' : 'Editar Produto / Insumo'}
                </h3>
              </div>
              <button 
                onClick={() => setIsItemModalOpen(false)}
                className="text-purple-400 hover:text-white p-1 rounded-lg hover:bg-[#250849]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Dropdown de Seleção de Catálogo Pré-cadastrado (Suplementos, Injetáveis, etc.) ou Personalizado */}
            {isNewItem && (
              <div className="bg-[#1b0638]/90 border border-fuchsia-500/40 rounded-2xl p-4 space-y-2 shadow-inner">
                <div className="flex items-center justify-between">
                  <label className="text-purple-100 font-extrabold text-xs flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-fuchsia-400" />
                    <span>Selecione da Lista Pré-Cadastrada ou Cadastre um Novo:</span>
                  </label>
                  {selectedPresetSupply && selectedPresetSupply !== 'custom' && (
                    <button
                      type="button"
                      onClick={() => handleSelectPresetSupply('custom')}
                      className="text-[11px] text-fuchsia-300 hover:text-white underline cursor-pointer"
                    >
                      Personalizar nome
                    </button>
                  )}
                </div>
                
                <select
                  value={selectedPresetSupply}
                  onChange={(e) => handleSelectPresetSupply(e.target.value)}
                  className="w-full bg-[#120324] border border-fuchsia-500/60 rounded-xl px-3.5 py-2.5 text-white text-xs sm:text-sm font-bold focus:outline-none focus:border-fuchsia-400 focus:ring-1 focus:ring-fuchsia-400/50 transition-all cursor-pointer"
                >
                  <option value="" disabled>
                    Selecione um insumo da lista ou adicione um novo...
                  </option>
                  <option value="custom" className="text-fuchsia-300 font-black bg-[#250849]">
                    ✨ + Adicionar novo (Personalizado)
                  </option>
                  
                  {INVENTORY_CATEGORIES.map(cat => {
                    const templatesInCat = PRESET_SUPPLY_TEMPLATES.filter(t => t.category === cat.id);
                    if (templatesInCat.length === 0) return null;
                    return (
                      <optgroup key={cat.id} label={`📂 ${cat.label}`} className="bg-[#19042f] text-purple-200">
                        {templatesInCat.map(t => (
                          <option key={t.name} value={t.name} className="text-white bg-[#150428]">
                            {t.name} ({t.unitLabel})
                          </option>
                        ))}
                      </optgroup>
                    );
                  })}
                </select>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              
              {/* Product Name */}
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-purple-200 font-bold block">Nome do Produto / Medicamento / Insumo *</label>
                <input
                  type="text"
                  value={editingItem.name || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                  placeholder="Ex: Creatina Creapure 300g, Vitamina B12 Injetável..."
                  className="w-full bg-[#1b0638] border border-purple-700/60 rounded-xl px-3.5 py-2 text-white placeholder-purple-400/50 focus:outline-none focus:border-fuchsia-400 text-xs sm:text-sm font-semibold"
                />
              </div>

              {/* Category */}
              <div className="space-y-1.5">
                <label className="text-purple-200 font-bold block">Categoria Principal *</label>
                <select
                  value={editingItem.category || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value as InventoryCategory })}
                  className="w-full bg-[#1b0638] border border-purple-700/60 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-fuchsia-400 text-xs font-semibold"
                >
                  <option value="" disabled>Selecione uma categoria...</option>
                  {INVENTORY_CATEGORIES.map(c => (
                    <option key={c.id} value={c.id}>{c.label}</option>
                  ))}
                </select>
              </div>

              {/* Subcategory */}
              <div className="space-y-1.5">
                <label className="text-purple-200 font-bold block">Subcategoria / Especialidade</label>
                <input
                  type="text"
                  value={editingItem.subcategory || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, subcategory: e.target.value })}
                  placeholder="Ex: Aminoácidos, Injetáveis, Antropometria..."
                  className="w-full bg-[#1b0638] border border-purple-700/60 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-fuchsia-400 text-xs font-semibold"
                />
              </div>

              {/* Current Stock & Min Stock */}
              <div className="space-y-1.5">
                <label className="text-purple-200 font-bold block">Quantidade Atual em Estoque *</label>
                <input
                  type="number"
                  min="0"
                  value={editingItem.currentStock === 0 ? '' : editingItem.currentStock}
                  placeholder="0"
                  onChange={(e) => setEditingItem({ ...editingItem, currentStock: e.target.value === '' ? 0 : Math.max(0, parseInt(e.target.value, 10) || 0) })}
                  className="w-full bg-[#1b0638] border border-purple-700/60 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-fuchsia-400 text-xs font-semibold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-purple-200 font-bold block">Estoque Mínimo (Ponto de Reposição)</label>
                <input
                  type="number"
                  min="0"
                  value={editingItem.minStock === 0 ? '' : editingItem.minStock}
                  placeholder="0"
                  onChange={(e) => setEditingItem({ ...editingItem, minStock: e.target.value === '' ? 0 : Math.max(0, parseInt(e.target.value, 10) || 0) })}
                  className="w-full bg-[#1b0638] border border-purple-700/60 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-fuchsia-400 text-xs font-semibold"
                />
              </div>

              {/* Unit of measure */}
              <div className="space-y-1.5">
                <label className="text-purple-200 font-bold block">Unidade de Medida *</label>
                <select
                  value={editingItem.unit || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, unit: e.target.value as InventoryUnit })}
                  className="w-full bg-[#1b0638] border border-purple-700/60 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-fuchsia-400 text-xs font-semibold"
                >
                  <option value="" disabled>Selecione a unidade de medida...</option>
                  {INVENTORY_UNITS.map(u => (
                    <option key={u.id} value={u.id}>{u.plural} ({u.label})</option>
                  ))}
                </select>
              </div>

              {/* Lot Number */}
              <div className="space-y-1.5">
                <label className="text-purple-200 font-bold block">Número de Lote</label>
                <input
                  type="text"
                  value={editingItem.lotNumber || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, lotNumber: e.target.value })}
                  placeholder="Ex: LOTE-2026-X (opcional)"
                  className="w-full bg-[#1b0638] border border-purple-700/60 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-fuchsia-400 text-xs font-semibold"
                />
              </div>

              {/* Expiration Date */}
              <div className="space-y-1.5">
                <label className="text-purple-200 font-bold block">Data de Validade</label>
                <input
                  type="date"
                  value={editingItem.expirationDate || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, expirationDate: e.target.value })}
                  className="w-full bg-[#1b0638] border border-purple-700/60 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-fuchsia-400 text-xs font-semibold"
                />
              </div>

              {/* Location in Clinic */}
              <div className="space-y-1.5">
                <label className="text-purple-200 font-bold block">Localização no Consultório</label>
                <input
                  type="text"
                  value={editingItem.location || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, location: e.target.value })}
                  placeholder="Ex: Armário A, Prateleira 2 (opcional)"
                  className="w-full bg-[#1b0638] border border-purple-700/60 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-fuchsia-400 text-xs font-semibold"
                />
              </div>

              {/* Cost Price and Supplier */}
              <div className="space-y-1.5">
                <label className="text-purple-200 font-bold block">Preço de Custo Unitário (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={editingItem.costPrice === 0 ? '' : editingItem.costPrice}
                  placeholder="0.00"
                  onChange={(e) => setEditingItem({ ...editingItem, costPrice: e.target.value === '' ? 0 : parseFloat(e.target.value) || 0 })}
                  className="w-full bg-[#1b0638] border border-purple-700/60 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-fuchsia-400 text-xs font-semibold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-purple-200 font-bold block">Fornecedor / Laboratório</label>
                <input
                  type="text"
                  value={editingItem.supplier || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, supplier: e.target.value })}
                  placeholder="Ex: Distribuidora MedSul (opcional)"
                  className="w-full bg-[#1b0638] border border-purple-700/60 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-fuchsia-400 text-xs font-semibold"
                />
              </div>

              {/* Notes */}
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-purple-200 font-bold block">Observações e Orientações de Uso</label>
                <textarea
                  rows={2}
                  value={editingItem.notes || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, notes: e.target.value })}
                  placeholder="Informações posológicas, armazenamento ou indicações clínicas..."
                  className="w-full bg-[#1b0638] border border-purple-700/60 rounded-xl p-3 text-white focus:outline-none focus:border-fuchsia-400 text-xs"
                />
              </div>

            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-purple-800/50">
              <button
                type="button"
                onClick={() => setIsItemModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-[#20063e] hover:bg-[#2e0958] text-purple-300 text-xs font-bold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => handleSaveItemModal(editingItem)}
                disabled={!editingItem.name?.trim() || !editingItem.category || !editingItem.unit}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 text-white text-xs font-black shadow-md disabled:opacity-40 cursor-pointer"
              >
                Salvar no Estoque
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL 2: Registrar Movimentação Customizada */}
      {isMovementModalOpen && movementItem && (
        <MovementCustomModal
          item={movementItem}
          patients={patients}
          onClose={() => setIsMovementModalOpen(false)}
          onConfirm={(type, qty, reason, patName, notes) => handleSaveCustomMovement(movementItem, type, qty, reason, patName, notes)}
        />
      )}

      {/* MODAL 3: Histórico de Movimentações do Item */}
      {isHistoryModalOpen && historyItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#16042e] border border-purple-800/80 rounded-3xl w-full max-w-xl p-6 space-y-4 shadow-2xl max-h-[85vh] flex flex-col animate-scaleUp">
            
            <div className="flex items-center justify-between border-b border-purple-800/50 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-fuchsia-600/20 border border-fuchsia-500/40 flex items-center justify-center text-fuchsia-400">
                  <History className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">
                    Histórico de Movimentações
                  </h3>
                  <span className="text-xs text-purple-300 font-semibold">{historyItem.name}</span>
                </div>
              </div>
              <button 
                onClick={() => setIsHistoryModalOpen(false)}
                className="text-purple-400 hover:text-white p-1 rounded-lg hover:bg-[#250849]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 space-y-2.5 pr-1 scrollbar-thin">
              {(!historyItem.movements || historyItem.movements.length === 0) ? (
                <div className="text-center py-8 text-purple-300/70 text-xs">
                  Nenhuma movimentação registrada para este item ainda.
                </div>
              ) : (
                historyItem.movements.map(mov => {
                  const isEntry = mov.type === 'entrada';
                  const isAuto = mov.type === 'baixa_automatica';
                  return (
                    <div 
                      key={mov.id}
                      className="bg-[#1b0638] border border-purple-800/40 rounded-2xl p-3.5 space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-[11px] font-black px-2 py-0.5 rounded-md flex items-center gap-1 uppercase ${
                          isEntry 
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/60' 
                            : isAuto
                            ? 'bg-fuchsia-950 text-fuchsia-300 border border-fuchsia-700/60'
                            : 'bg-rose-950 text-rose-300 border border-rose-700/60'
                        }`}>
                          {isEntry ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                          {isEntry ? 'Entrada' : isAuto ? 'Baixa Automática' : 'Saída'} ({isEntry ? '+' : '-'}{mov.quantity} {historyItem.unit})
                        </span>

                        <span className="text-[10px] text-purple-300">
                          {new Date(mov.timestamp).toLocaleString('pt-BR')}
                        </span>
                      </div>

                      <p className="text-xs font-semibold text-white">
                        {mov.reason}
                      </p>

                      <div className="flex items-center justify-between text-[10px] text-purple-300/80 pt-1 border-t border-purple-900/30">
                        <span>Estoque: {mov.previousStock} ➔ <strong>{mov.newStock} {historyItem.unit}</strong></span>
                        {mov.patientName && (
                          <span className="text-fuchsia-300 font-bold">Paciente: {mov.patientName}</span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="pt-2 border-t border-purple-800/50 flex justify-end">
              <button
                onClick={() => setIsHistoryModalOpen(false)}
                className="px-4 py-1.5 rounded-xl bg-[#20063e] hover:bg-[#2e0958] text-white text-xs font-bold"
              >
                Fechar
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL 4: Histórico Global Auditável de Todas as Movimentações */}
      {isGlobalHistoryOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#16042e] border border-purple-800/80 rounded-3xl w-full max-w-3xl p-6 space-y-4 shadow-2xl max-h-[88vh] flex flex-col animate-scaleUp">
            
            <div className="flex items-center justify-between border-b border-purple-800/50 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-fuchsia-600/20 border border-fuchsia-500/40 flex items-center justify-center text-fuchsia-400">
                  <History className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">
                    Histórico Geral de Movimentações do Consultório
                  </h3>
                  <span className="text-xs text-purple-300 font-medium">Auditoria de entradas, saídas e baixas automáticas</span>
                </div>
              </div>
              <button 
                onClick={() => setIsGlobalHistoryOpen(false)}
                className="text-purple-400 hover:text-white p-1 rounded-lg hover:bg-[#250849]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 space-y-2 pr-1 scrollbar-thin">
              {allMovements.length === 0 ? (
                <div className="text-center py-12 text-purple-300/70 text-xs">
                  Nenhuma movimentação registrada no consultório.
                </div>
              ) : (
                allMovements.map(mov => {
                  const isEntry = mov.type === 'entrada';
                  const isAuto = mov.type === 'baixa_automatica';
                  return (
                    <div 
                      key={mov.id}
                      className="bg-[#1b0638] border border-purple-800/40 rounded-2xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-md flex items-center gap-1 uppercase ${
                            isEntry 
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/60' 
                              : isAuto
                              ? 'bg-fuchsia-950 text-fuchsia-300 border border-fuchsia-700/60'
                              : 'bg-rose-950 text-rose-300 border border-rose-700/60'
                          }`}>
                            {isEntry ? '+' : '-'}{mov.quantity}
                          </span>
                          <span className="text-xs font-black text-white">{mov.itemName}</span>
                        </div>
                        <p className="text-[11px] text-purple-200">
                          {mov.reason} {mov.patientName ? `• Paciente: ${mov.patientName}` : ''}
                        </p>
                      </div>

                      <div className="text-right text-[10px] text-purple-300 shrink-0">
                        <span>{new Date(mov.timestamp).toLocaleString('pt-BR')}</span>
                        <div className="text-purple-400 font-bold">
                          {mov.previousStock} ➔ {mov.newStock}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="pt-3 border-t border-purple-800/50 flex items-center justify-between">
              <span className="text-xs text-purple-300">Total: <strong>{allMovements.length}</strong> movimentações registradas</span>
              <button
                onClick={() => setIsGlobalHistoryOpen(false)}
                className="px-5 py-2 rounded-xl bg-[#20063e] hover:bg-[#2e0958] text-white text-xs font-bold cursor-pointer"
              >
                Fechar
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

// Subcomponent for custom stock movements
function MovementCustomModal({
  item,
  patients = [],
  onClose,
  onConfirm
}: {
  item: InventoryItem;
  patients?: Patient[];
  onClose: () => void;
  onConfirm: (type: StockMovement['type'], qty: number, reason: string, patientName?: string, notes?: string) => void;
}) {
  const [movementType, setMovementType] = useState<StockMovement['type']>('saida');
  const [quantity, setQuantity] = useState<number>(1);
  const [reasonCategory, setReasonCategory] = useState<string>('prescricao');
  const [customReason, setCustomReason] = useState<string>('');
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  const selectedPatient = (patients || []).find(p => p.id === selectedPatientId);

  const handleConfirm = () => {
    if (quantity <= 0) return;

    let finalReason = customReason.trim();
    if (!finalReason) {
      if (reasonCategory === 'prescricao') finalReason = `Prescrito / Entregue ao paciente ${selectedPatient?.name || ''}`.trim();
      else if (reasonCategory === 'compra') finalReason = 'Compra de lote / Reposição de estoque';
      else if (reasonCategory === 'amostra') finalReason = `Amostra grátis entregue a ${selectedPatient?.name || 'paciente'}`;
      else if (reasonCategory === 'uso_clinico') finalReason = 'Uso em consulta / Avaliação antropométrica';
      else if (reasonCategory === 'perda') finalReason = 'Perda / Descarte por validade ou avaria';
      else finalReason = 'Ajuste manual de inventário';
    }

    onConfirm(movementType, quantity, finalReason, selectedPatient?.name, notes);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#16042e] border border-purple-800/80 rounded-3xl w-full max-w-lg p-6 space-y-5 shadow-2xl animate-scaleUp">
        
        <div className="flex items-center justify-between border-b border-purple-800/50 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-fuchsia-600/20 border border-fuchsia-500/40 flex items-center justify-center text-fuchsia-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">
                Movimentar Estoque
              </h3>
              <span className="text-xs text-purple-300 font-bold">{item.name}</span>
            </div>
          </div>
          <button onClick={onClose} className="text-purple-400 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-xs">
          
          {/* Movement Type */}
          <div className="space-y-1.5">
            <label className="text-purple-200 font-bold block">Tipo de Movimentação</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => { setMovementType('saida'); setReasonCategory('prescricao'); }}
                className={`py-2 px-3 rounded-xl border font-bold flex items-center justify-center gap-1.5 cursor-pointer ${
                  movementType === 'saida'
                    ? 'bg-rose-950 text-rose-200 border-rose-500'
                    : 'bg-[#1b0638] text-purple-300 border-purple-800/40'
                }`}
              >
                <ArrowDownRight className="w-3.5 h-3.5 text-rose-400" />
                <span>Saída / Baixa</span>
              </button>

              <button
                type="button"
                onClick={() => { setMovementType('entrada'); setReasonCategory('compra'); }}
                className={`py-2 px-3 rounded-xl border font-bold flex items-center justify-center gap-1.5 cursor-pointer ${
                  movementType === 'entrada'
                    ? 'bg-emerald-950 text-emerald-200 border-emerald-500'
                    : 'bg-[#1b0638] text-purple-300 border-purple-800/40'
                }`}
              >
                <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
                <span>Entrada / Reposição</span>
              </button>

              <button
                type="button"
                onClick={() => { setMovementType('perda'); setReasonCategory('perda'); }}
                className={`py-2 px-3 rounded-xl border font-bold flex items-center justify-center gap-1.5 cursor-pointer col-span-2 sm:col-span-1 ${
                  movementType === 'perda'
                    ? 'bg-amber-950 text-amber-200 border-amber-500'
                    : 'bg-[#1b0638] text-purple-300 border-purple-800/40'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span>Perda / Descarte</span>
              </button>
            </div>
          </div>

          {/* Quantity */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-purple-200 font-bold">Quantidade a movimentar ({item.unit})</label>
              <span className="text-[11px] text-purple-300">Estoque atual: <strong>{item.currentStock} {item.unit}</strong></span>
            </div>
            <input
              type="number"
              min="1"
              max={movementType !== 'entrada' ? item.currentStock : 9999}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
              className="w-full bg-[#1b0638] border border-purple-700/60 rounded-xl px-3.5 py-2 text-white font-bold text-sm focus:outline-none focus:border-fuchsia-400"
            />
          </div>

          {/* Reason Preset */}
          <div className="space-y-1.5">
            <label className="text-purple-200 font-bold block">Motivo da Movimentação</label>
            <select
              value={reasonCategory}
              onChange={(e) => setReasonCategory(e.target.value)}
              className="w-full bg-[#1b0638] border border-purple-700/60 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-fuchsia-400 font-semibold"
            >
              {movementType === 'saida' ? (
                <>
                  <option value="prescricao">Prescrito ao paciente</option>
                  <option value="amostra">Amostra grátis entregue</option>
                  <option value="uso_clinico">Uso em consulta / Avaliação</option>
                  <option value="outro">Outro motivo personalizado</option>
                </>
              ) : movementType === 'entrada' ? (
                <>
                  <option value="compra">Compra de novo lote / Fornecedor</option>
                  <option value="cortesia">Recebimento de amostras / Brinde</option>
                  <option value="devolucao">Devolução</option>
                  <option value="outro">Outro motivo</option>
                </>
              ) : (
                <>
                  <option value="perda">Vencimento de prazo de validade</option>
                  <option value="avaria">Avaria na embalagem / Quebra</option>
                  <option value="ajuste">Ajuste de inventário físico</option>
                </>
              )}
            </select>
          </div>

          {/* Patient Selector if applicable */}
          {(reasonCategory === 'prescricao' || reasonCategory === 'amostra') && (
            <div className="space-y-1.5">
              <label className="text-purple-200 font-bold block">Vincular ao Paciente</label>
              <select
                value={selectedPatientId}
                onChange={(e) => setSelectedPatientId(e.target.value)}
                className="w-full bg-[#1b0638] border border-purple-700/60 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-fuchsia-400 font-semibold"
              >
                <option value="">Selecione o paciente (opcional)...</option>
                {(patients || []).map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Custom motive text */}
          <div className="space-y-1.5">
            <label className="text-purple-200 font-bold block">Detalhes Adicionais (opcional)</label>
            <input
              type="text"
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              placeholder="Ex: Entregue 1 pote de amostra na 1ª consulta..."
              className="w-full bg-[#1b0638] border border-purple-700/60 rounded-xl px-3 py-2 text-white placeholder-purple-400/50 focus:outline-none focus:border-fuchsia-400 font-semibold"
            />
          </div>

        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-purple-800/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#20063e] hover:bg-[#2e0958] text-purple-300 text-xs font-bold cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className={`px-5 py-2 rounded-xl text-white text-xs font-black shadow-md cursor-pointer ${
              movementType === 'entrada'
                ? 'bg-emerald-600 hover:bg-emerald-500'
                : 'bg-gradient-to-r from-fuchsia-600 to-rose-600 hover:from-fuchsia-500 hover:to-rose-500'
            }`}
          >
            Confirmar Movimentação
          </button>
        </div>

      </div>
    </div>
  );
}
