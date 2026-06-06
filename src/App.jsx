import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Wheel } from 'react-custom-roulette';
import { Users, User, Tent, Play, Volume2, VolumeX, CheckCircle, RefreshCcw, UserPlus, X, Trash2, FileSpreadsheet, FolderPlus } from 'lucide-react';
import * as XLSX from 'xlsx';

const INITIAL_BOYS = [
  { id: 'b1', name: 'Bagus Prasetya', gender: 'L', group: null },
  { id: 'b2', name: 'Lutfi Bukhori', gender: 'L', group: null },
  { id: 'b3', name: 'Muhammad Kevin Kautsar', gender: 'L', group: null },
  { id: 'b4', name: 'Abdallah Hizqil NaufalI', gender: 'L', group: null },
  { id: 'b5', name: 'Fajar Arief', gender: 'L', group: null },
  { id: 'b6', name: 'Alka', gender: 'L', group: null },
  { id: 'b7', name: 'Sulton Aulia', gender: 'L', group: null },
  { id: 'b8', name: 'Khoirul Ihsan', gender: 'L', group: null },
  { id: 'b9', name: 'Firman Haq Al-Mujahidin', gender: 'L', group: null },
  { id: 'b10', name: 'Irfan', gender: 'L', group: null },
  { id: 'b11', name: 'Riski', gender: 'L', group: null },
  { id: 'b12', name: 'Aji', gender: 'L', group: null },
  { id: 'b13', name: 'Yahya', gender: 'L', group: null },
  { id: 'b14', name: 'Rizal', gender: 'L', group: null },
  { id: 'b15', name: 'Guntur Bayu Aji', gender: 'L', group: null },
];

const INITIAL_GIRLS = [
  { id: 'g1', name: 'Novita', gender: 'P', group: null },
  { id: 'g2', name: 'Ulfa Laili Anjani', gender: 'P', group: null },
  { id: 'g3', name: 'Rizqa Auliyana', gender: 'P', group: null },
  { id: 'g4', name: 'Fika Aprilia Nazzala', gender: 'P', group: null },
  { id: 'g5', name: 'Ayu Jazilatil Hunafiah', gender: 'P', group: null },
  { id: 'g6', name: 'Hanum Hidayani', gender: 'P', group: null },
  { id: 'g7', name: 'Dara Cahaya Mutiara', gender: 'P', group: null },
  { id: 'g8', name: 'Ara', gender: 'P', group: null },
  { id: 'g9', name: 'Alia Muttiah Bilqis', gender: 'P', group: null },
  { id: 'g10', name: 'Salsabila', gender: 'P', group: null },
  { id: 'g11', name: 'Gitta Rahmadhani', gender: 'P', group: null },
  { id: 'g12', name: 'Wilien Chan Shi Heni Octavia', gender: 'P', group: null },
  { id: 'g13', name: 'Ikha Ansahela', gender: 'P', group: null },
  { id: 'g14', name: 'Iqlimata Rachil', gender: 'P', group: null },
  { id: 'g15', name: "Lulu' Azka Wati", gender: 'P', group: null },
  { id: 'g16', name: 'Zulfa Lukluil Aulya', gender: 'P', group: null },
  { id: 'g17', name: 'Aeesyata Ramadhani', gender: 'P', group: null },
  { id: 'g18', name: 'Aprilia Irma Kusumah', gender: 'P', group: null },
];

const ALL_PARTICIPANTS = [...INITIAL_BOYS, ...INITIAL_GIRLS];

const WHEEL_COLORS = [
  '#166534', // green-800
  '#15803d', // green-700
  '#22c55e', // green-500
  '#4ade80', // green-400
  '#14532d', // green-900
];

function App() {
  const [participants, setParticipants] = useState(() => {
    const saved = localStorage.getItem('campMawarParticipants');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return ALL_PARTICIPANTS;
      }
    }
    return ALL_PARTICIPANTS;
  });

  const [groups, setGroups] = useState(() => {
    const saved = localStorage.getItem('campMawarGroups');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [1, 2, 3, 4, 5];
      }
    }
    return [1, 2, 3, 4, 5];
  });

  const [selectedParticipantId, setSelectedParticipantId] = useState('');
  const [mustSpin, setMustSpin] = useState(false);
  const [prizeNumber, setPrizeNumber] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [winningGroup, setWinningGroup] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newGender, setNewGender] = useState('L');

  const spinAudioRef = useRef(null);
  const winAudioRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('campMawarParticipants', JSON.stringify(participants));
  }, [participants]);

  useEffect(() => {
    localStorage.setItem('campMawarGroups', JSON.stringify(groups));
  }, [groups]);

  useEffect(() => {
    spinAudioRef.current = new Audio('/spin.mp3');
    spinAudioRef.current.loop = true;
    winAudioRef.current = new Audio('/win.mp3');
  }, []);

  const playSpinAudio = () => {
    if (soundEnabled && spinAudioRef.current) {
      spinAudioRef.current.currentTime = 0;
      spinAudioRef.current.play().catch(e => console.log('Audio play failed:', e));
    }
  };

  const stopSpinAudioAndPlayWin = () => {
    if (spinAudioRef.current) {
      spinAudioRef.current.pause();
    }
    if (soundEnabled && winAudioRef.current) {
      winAudioRef.current.currentTime = 0;
      winAudioRef.current.play().catch(e => console.log('Audio play failed:', e));
    }
  };

  const handleAddParticipant = (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    const newParticipant = {
      id: `new_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      name: newName.trim(),
      gender: newGender,
      group: null
    };
    setParticipants(prev => [...prev, newParticipant]);
    setNewName('');
    setNewGender('L');
    setShowAddModal(false);
  };

  const handleDeleteParticipant = (id) => {
    if (confirm('Yakin ingin menghapus peserta ini?')) {
      setParticipants(prev => prev.filter(p => p.id !== id));
      if (selectedParticipantId === id) {
        setSelectedParticipantId('');
      }
    }
  };

  const handleAddGroup = () => {
    setGroups(prev => {
      const nextGroup = prev.length > 0 ? Math.max(...prev) + 1 : 1;
      return [...prev, nextGroup];
    });
  };

  const handleDeleteGroup = (groupNum) => {
    if (confirm(`Yakin ingin menghapus Kelompok ${groupNum}? Peserta di kelompok ini akan kembali belum diundi.`)) {
      setGroups(prev => prev.filter(g => g !== groupNum));
      setParticipants(prev => prev.map(p => p.group === groupNum ? { ...p, group: null } : p));
      if (winningGroup === groupNum) {
        setWinningGroup(null);
        setShowModal(false);
      }
    }
  };

  const handleExportExcel = () => {
    const exportData = participants.map((p) => ({
      'Nama Peserta': p.name,
      'Gender': p.gender === 'L' ? 'Laki-laki' : 'Perempuan',
      'Kelompok': p.group !== null ? `Kelompok ${p.group}` : 'Belum Diundi'
    }));

    exportData.sort((a, b) => {
      if (a.Kelompok === 'Belum Diundi' && b.Kelompok !== 'Belum Diundi') return 1;
      if (a.Kelompok !== 'Belum Diundi' && b.Kelompok === 'Belum Diundi') return -1;
      if (a.Kelompok < b.Kelompok) return -1;
      if (a.Kelompok > b.Kelompok) return 1;
      return 0;
    });

    const finalData = exportData.map((row, i) => ({ No: i + 1, ...row }));

    const worksheet = XLSX.utils.json_to_sheet(finalData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data Peserta");

    worksheet['!cols'] = [
      { wch: 5 }, 
      { wch: 30 },
      { wch: 15 },
      { wch: 15 },
    ];

    XLSX.writeFile(workbook, "Hasil_Undian_Kicaw_Mania_Brangsong.xlsx");
  };

  const unassignedParticipants = participants.filter(p => p.group === null);
  const selectedParticipant = participants.find(p => p.id === selectedParticipantId);

  const availableGroups = useMemo(() => {
    if (!selectedParticipant) return groups;

    const groupCounts = groups.map(g => ({
      group: g,
      boys: participants.filter(p => p.group === g && p.gender === 'L').length,
      girls: participants.filter(p => p.group === g && p.gender === 'P').length
    }));

    const totalOfGender = participants.filter(p => p.gender === selectedParticipant.gender).length;
    const maxPerGroup = Math.ceil(totalOfGender / groups.length) || 1;
    const groupsWithMax = totalOfGender % groups.length;
    const allowedGroupsWithMax = groupsWithMax === 0 ? groups.length : groupsWithMax;

    const countOfGenderInGroup = (g) => selectedParticipant.gender === 'L' ? g.boys : g.girls;
    const currentGroupsWithMax = groupCounts.filter(g => countOfGenderInGroup(g) >= maxPerGroup).length;

    return groupCounts.filter(g => {
      const c = countOfGenderInGroup(g);
      if (c >= maxPerGroup) return false;
      if (c === maxPerGroup - 1 && currentGroupsWithMax >= allowedGroupsWithMax && groupsWithMax !== 0) return false;
      return true;
    }).map(g => g.group);
  }, [selectedParticipant, participants, groups]);

  const wheelData = availableGroups.length > 0 ? availableGroups.map((g, index) => ({
    option: `Kelompok ${g}`,
    style: { backgroundColor: WHEEL_COLORS[index % WHEEL_COLORS.length], textColor: 'white' },
    groupNumber: g
  })) : [{ option: 'Penuh', style: { backgroundColor: '#6b7280', textColor: 'white' }, groupNumber: 0 }];

  const handleSpinClick = () => {
    if (!selectedParticipant || mustSpin || availableGroups.length === 0) return;

    const newPrizeNumber = Math.floor(Math.random() * availableGroups.length);
    setPrizeNumber(newPrizeNumber);
    setMustSpin(true);
    playSpinAudio();
  };

  const handleStopSpinning = () => {
    setMustSpin(false);
    stopSpinAudioAndPlayWin();
    
    const assignedGroup = wheelData[prizeNumber].groupNumber;
    setWinningGroup(assignedGroup);
    setShowModal(true);

    setParticipants(prev => prev.map(p => 
      p.id === selectedParticipantId ? { ...p, group: assignedGroup } : p
    ));
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedParticipantId('');
    setWinningGroup(null);
  };

  const handleReset = () => {
    if (confirm('Apakah Anda yakin ingin mengulang undian dari awal?')) {
      setParticipants(ALL_PARTICIPANTS);
      setSelectedParticipantId('');
      setGroups([1, 2, 3, 4, 5]);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4fbf7] text-emerald-950 font-sans pb-12 selection:bg-emerald-200 relative overflow-x-hidden">
      {/* Background Blobs for Modern Aesthetic */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-300/20 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute top-[40%] right-0 w-[500px] h-[500px] bg-green-300/20 rounded-full blur-[120px] translate-x-1/3 pointer-events-none" />

      {/* Header */}
      <header className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-green-800 text-white shadow-xl shadow-emerald-900/10 sticky top-0 z-40 border-b border-emerald-600/30">
        <div className="container mx-auto px-4 py-4 flex flex-col lg:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-2xl backdrop-blur-md border border-white/10 shadow-inner">
              <Tent size={28} className="text-emerald-50" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-2xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-emerald-200 leading-tight">
                Kicaw Mania Camping
              </h1>
              <p className="text-emerald-200 text-sm font-semibold opacity-90 tracking-wide">
                Desa Brangsong
              </p>
            </div>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-3">
            <button 
              onClick={handleExportExcel}
              className="flex items-center gap-2 px-3 py-2 sm:px-4 bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md text-white rounded-xl text-sm font-semibold shadow-sm transition-all duration-300 hover:scale-105 active:scale-95"
              title="Export ke Excel"
            >
              <FileSpreadsheet size={16} /> <span className="hidden sm:inline">Export</span>
            </button>
            <button 
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-3 py-2 sm:px-4 bg-white text-emerald-800 hover:bg-emerald-50 rounded-xl text-sm font-bold shadow-lg shadow-black/10 transition-all duration-300 hover:scale-105 active:scale-95"
            >
              <UserPlus size={16} /> <span className="hidden sm:inline">Peserta</span>
            </button>
            <button 
              onClick={handleAddGroup}
              className="flex items-center gap-2 px-3 py-2 sm:px-4 bg-white text-emerald-800 hover:bg-emerald-50 rounded-xl text-sm font-bold shadow-lg shadow-black/10 transition-all duration-300 hover:scale-105 active:scale-95"
              title="Tambah Kelompok"
            >
              <FolderPlus size={16} /> <span className="hidden sm:inline">Kelompok</span>
            </button>
            <button 
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2.5 bg-emerald-900/50 hover:bg-emerald-900 border border-emerald-600/50 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 text-emerald-100"
              title={soundEnabled ? "Mute Sound" : "Enable Sound"}
            >
              {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
            </button>
            <button 
              onClick={handleReset}
              className="flex items-center gap-2 px-3 py-2 sm:px-4 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-red-500/20 transition-all duration-300 hover:scale-105 active:scale-95"
            >
              <RefreshCcw size={16} /> <span className="hidden sm:inline">Reset</span>
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 mt-6 sm:mt-10 flex flex-col xl:flex-row gap-6 sm:gap-8 relative z-10">
        
        {/* Left Column: Spinner Section */}
        <section className="w-full xl:w-1/3 flex flex-col gap-6 shrink-0">
          <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-xl shadow-emerald-900/5 p-6 sm:p-8 border border-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-100 to-transparent rounded-bl-full opacity-50 pointer-events-none" />
            <h2 className="text-xl font-extrabold mb-6 flex items-center gap-3 text-emerald-950 relative z-10">
              <div className="p-2 bg-emerald-100 rounded-xl text-emerald-600 shadow-inner">
                <Play size={20} className="fill-current" />
              </div>
              Undian Kelompok
            </h2>
            
            <div className="mb-6 relative z-10">
              <label className="block text-sm font-bold mb-2 text-emerald-800">Pilih Peserta:</label>
              <div className="flex gap-2">
                <select 
                  className="flex-1 p-3.5 border-2 border-emerald-100 rounded-xl bg-white/50 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-400 focus:outline-none transition-all disabled:opacity-50 font-semibold text-emerald-900 shadow-sm appearance-none"
                  value={selectedParticipantId}
                  onChange={(e) => setSelectedParticipantId(e.target.value)}
                  disabled={mustSpin}
                  style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23059669' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem' }}
                >
                  <option value="">-- Pilih Peserta --</option>
                  <optgroup label="Laki-laki (Cowo)">
                    {unassignedParticipants.filter(p => p.gender === 'L').map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </optgroup>
                  <optgroup label="Perempuan (Cewe)">
                    {unassignedParticipants.filter(p => p.gender === 'P').map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </optgroup>
                </select>
                {selectedParticipant && !mustSpin && (
                  <button
                    onClick={() => handleDeleteParticipant(selectedParticipant.id)}
                    className="p-3.5 bg-red-50 hover:bg-red-500 text-red-500 hover:text-white rounded-xl border-2 border-red-100 hover:border-red-500 transition-all duration-300 shadow-sm"
                    title="Hapus Peserta"
                  >
                    <Trash2 size={20} />
                  </button>
                )}
              </div>
              <div className="text-sm mt-3 text-emerald-600/80 font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse block"></span>
                Sisa: {unassignedParticipants.length} peserta belum diundi
              </div>
            </div>

            <button
              onClick={handleSpinClick}
              disabled={!selectedParticipant || mustSpin || availableGroups.length === 0}
              className="w-full py-4 relative group overflow-hidden bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 disabled:from-gray-300 disabled:to-gray-400 text-white rounded-2xl font-extrabold text-lg shadow-xl shadow-emerald-600/30 transition-all duration-300 transform hover:-translate-y-1 active:translate-y-0 disabled:transform-none disabled:shadow-none z-10"
            >
              <div className="absolute inset-0 w-full h-full bg-white/20 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500 ease-out" />
              <span className="relative z-10">
              {!selectedParticipant 
                ? 'Pilih Peserta Dulu' 
                : mustSpin 
                  ? 'Sedang Mengundi...' 
                  : `Spin untuk ${selectedParticipant.name.split(' ')[0]}`}
              </span>
            </button>
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-xl shadow-emerald-900/5 p-4 sm:p-8 border border-white flex flex-col items-center">
            <div className="w-full flex justify-center items-center scale-[0.65] sm:scale-[0.8] md:scale-90 lg:scale-100 origin-center transition-transform duration-300 -my-14 sm:-my-8 md:-my-4 lg:my-0 pb-4">
              <Wheel
                mustStartSpinning={mustSpin}
                prizeNumber={prizeNumber}
                data={wheelData}
                onStopSpinning={handleStopSpinning}
                outerBorderColor="#064e3b" // emerald-900
                outerBorderWidth={6}
                innerBorderColor="#ffffff"
                innerBorderWidth={3}
                radiusLineColor="#ffffff"
                radiusLineWidth={2}
                textColors={['#ffffff']}
                fontSize={22}
                spinDuration={0.5}
              />
            </div>
            {selectedParticipant && !mustSpin && (
               <div className="mt-4 lg:mt-8 p-4 bg-emerald-50/80 rounded-2xl w-full text-center border border-emerald-100/50 shadow-sm relative z-10">
                 <p className="text-sm font-bold text-emerald-800">
                   Memperebutkan Kelompok: <span className="text-emerald-600">{availableGroups.join(', ')}</span>
                 </p>
               </div>
            )}
          </div>
        </section>

        {/* Right Column: Groups Grid */}
        <section className="w-full xl:w-2/3">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map(groupNum => {
              const groupMembers = participants.filter(p => p.group === groupNum);
              const boys = groupMembers.filter(p => p.gender === 'L');
              const girls = groupMembers.filter(p => p.gender === 'P');
              
              const totalBoys = participants.filter(p => p.gender === 'L').length;
              const totalGirls = participants.filter(p => p.gender === 'P').length;
              const maxBoys = Math.ceil(totalBoys / groups.length) || 1;
              const maxGirls = Math.ceil(totalGirls / groups.length) || 1;

              const boysLabel = `${boys.length}/${totalBoys % groups.length === 0 ? maxBoys : `${maxBoys-1}-${maxBoys}`}`;
              const girlsLabel = `${girls.length}/${totalGirls % groups.length === 0 ? maxGirls : `${maxGirls-1}-${maxGirls}`}`;

              return (
                <div key={groupNum} className="bg-white/80 backdrop-blur-md rounded-[2rem] shadow-lg shadow-emerald-900/5 border border-white overflow-hidden flex flex-col h-full hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                  <div className="bg-gradient-to-br from-emerald-50 to-white px-5 py-4 border-b border-emerald-100 flex flex-col gap-3">
                    <div className="flex justify-between items-center">
                      <h3 className="font-extrabold text-xl text-emerald-950 flex items-center gap-3 whitespace-nowrap">
                        <div className="p-2 bg-emerald-100 rounded-xl text-emerald-600 shadow-inner">
                          <Users size={20} />
                        </div>
                        Kelompok {groupNum}
                      </h3>
                      <button 
                        onClick={() => handleDeleteGroup(groupNum)}
                        className="text-gray-400 hover:text-red-500 transition-colors duration-200 p-1.5 hover:bg-red-50 rounded-lg"
                        title="Hapus Kelompok"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                    <div className="flex gap-2 text-xs font-bold w-full">
                      <span className="flex-1 text-center px-2 py-1.5 rounded-lg bg-blue-50 text-blue-700 ring-1 ring-blue-500/20 shadow-sm">
                        L: {boysLabel}
                      </span>
                      <span className="flex-1 text-center px-2 py-1.5 rounded-lg bg-pink-50 text-pink-700 ring-1 ring-pink-500/20 shadow-sm">
                        P: {girlsLabel}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-6 flex-1 flex flex-col gap-5">
                    <div>
                      <h4 className="text-xs font-extrabold text-emerald-800/50 uppercase tracking-widest mb-3 border-b border-emerald-100/50 pb-2 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div> Laki-laki
                      </h4>
                      <ul className="space-y-1.5 text-sm">
                        {boys.length > 0 ? boys.map(b => (
                          <li key={b.id} className="flex items-center justify-between group hover:bg-emerald-50 rounded-xl px-2.5 py-2 -mx-2.5 transition-colors duration-200">
                            <span className="flex items-center gap-3 text-gray-700 font-semibold">
                              <div className="bg-blue-100/80 p-1.5 rounded-lg text-blue-600 shadow-sm">
                                <User size={14} />
                              </div>
                              {b.name}
                            </span>
                            <button 
                              onClick={() => handleDeleteParticipant(b.id)}
                              className="p-1.5 bg-white text-gray-400 hover:text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-red-500 shadow-sm transform hover:scale-110"
                              title="Hapus"
                            >
                              <Trash2 size={14} />
                            </button>
                          </li>
                        )) : <li className="text-gray-400 italic text-sm px-2.5">Kosong</li>}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold text-emerald-800/50 uppercase tracking-widest mb-3 border-b border-emerald-100/50 pb-2 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-pink-400"></div> Perempuan
                      </h4>
                      <ul className="space-y-1.5 text-sm">
                        {girls.length > 0 ? girls.map(g => (
                          <li key={g.id} className="flex items-center justify-between group hover:bg-emerald-50 rounded-xl px-2.5 py-2 -mx-2.5 transition-colors duration-200">
                            <span className="flex items-center gap-3 text-gray-700 font-semibold">
                              <div className="bg-pink-100/80 p-1.5 rounded-lg text-pink-600 shadow-sm">
                                <User size={14} />
                              </div>
                              {g.name}
                            </span>
                            <button 
                              onClick={() => handleDeleteParticipant(g.id)}
                              className="p-1.5 bg-white text-gray-400 hover:text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-red-500 shadow-sm transform hover:scale-110"
                              title="Hapus"
                            >
                              <Trash2 size={14} />
                            </button>
                          </li>
                        )) : <li className="text-gray-400 italic text-sm px-2.5">Kosong</li>}
                      </ul>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

      </main>

      {/* Win Modal */}
      {showModal && selectedParticipant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-emerald-950/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[2.5rem] p-8 sm:p-10 max-w-sm w-full text-center shadow-2xl shadow-emerald-900/40 transform scale-100 animate-bounce-short border-2 border-emerald-50">
            <div className="w-24 h-24 bg-gradient-to-br from-emerald-100 to-green-200 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner relative">
              <div className="absolute inset-0 rounded-full border-4 border-white"></div>
              <CheckCircle size={48} className="text-emerald-600 drop-shadow-md" />
            </div>
            <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-emerald-600 to-green-800 mb-3 tracking-tight">SELAMAT!</h2>
            <p className="text-lg text-gray-600 mb-8 font-medium">
              <span className="font-extrabold text-emerald-900 block text-2xl mb-1">{selectedParticipant.name}</span>
              kamu masuk ke
            </p>
            <div className="bg-gradient-to-r from-emerald-500 to-green-600 text-white text-3xl font-black py-4 px-8 rounded-2xl mb-10 inline-block shadow-xl shadow-emerald-500/30 transform -rotate-2 hover:rotate-0 transition-transform duration-300">
              Kelompok {winningGroup}
            </div>
            <button
              onClick={handleModalClose}
              className="w-full py-4 bg-gray-50 hover:bg-gray-100 text-gray-800 rounded-2xl font-extrabold transition-all duration-300 shadow-sm border border-gray-200 hover:shadow-md"
            >
              Lanjut Undian
            </button>
          </div>
        </div>
      )}

      {/* Add Participant Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-emerald-950/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[2.5rem] p-8 sm:p-10 max-w-md w-full shadow-2xl shadow-emerald-900/40 transform scale-100 animate-bounce-short relative border-2 border-emerald-50">
            <button 
              onClick={() => setShowAddModal(false)}
              className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-all duration-200"
            >
              <X size={24} />
            </button>
            <h2 className="text-3xl font-black text-emerald-950 mb-8 flex items-center gap-3 tracking-tight">
              <div className="p-2.5 bg-emerald-100 rounded-2xl text-emerald-600 shadow-inner">
                <UserPlus size={28} />
              </div>
              Tambah Peserta
            </h2>
            <form onSubmit={handleAddParticipant} className="flex flex-col gap-6">
              <div>
                <label className="block text-sm font-extrabold text-emerald-900 mb-3 uppercase tracking-wider">Nama Lengkap</label>
                <input 
                  type="text" 
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  className="w-full p-4 border-2 border-emerald-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-400 focus:outline-none transition-all font-semibold text-emerald-950 bg-emerald-50/50"
                  placeholder="Masukkan nama..."
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-extrabold text-emerald-900 mb-3 uppercase tracking-wider">Gender</label>
                <div className="flex gap-4">
                  <label className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 font-bold ${newGender === 'L' ? 'bg-blue-50 border-blue-400 text-blue-700 shadow-md shadow-blue-100' : 'bg-gray-50 border-gray-100 text-gray-500 hover:bg-gray-100'}`}>
                    <input type="radio" name="gender" value="L" checked={newGender === 'L'} onChange={e => setNewGender(e.target.value)} className="sr-only" />
                    Laki-laki
                  </label>
                  <label className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 font-bold ${newGender === 'P' ? 'bg-pink-50 border-pink-400 text-pink-700 shadow-md shadow-pink-100' : 'bg-gray-50 border-gray-100 text-gray-500 hover:bg-gray-100'}`}>
                    <input type="radio" name="gender" value="P" checked={newGender === 'P'} onChange={e => setNewGender(e.target.value)} className="sr-only" />
                    Perempuan
                  </label>
                </div>
              </div>
              <button 
                type="submit"
                disabled={!newName.trim()}
                className="mt-4 w-full py-4 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 disabled:from-gray-300 disabled:to-gray-400 text-white rounded-2xl font-extrabold text-lg shadow-xl shadow-emerald-600/20 transition-all duration-300 hover:-translate-y-1 active:translate-y-0 disabled:transform-none"
              >
                Simpan Peserta
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Simple style for modal animation */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes bounceShort {
          0% { transform: scale(0.9); opacity: 0; }
          60% { transform: scale(1.02); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-bounce-short {
          animation: bounceShort 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
      `}} />
    </div>
  );
}

export default App;
