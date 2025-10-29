"use client";

import { useState, useEffect } from "react";
import { Archive, CheckCircle, Trash2, AlertTriangle, Clock4, Mail, Check, PlayCircle, Star, Home, Calendar } from "lucide-react";
import Link from "next/link";

interface Message {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  content: string;
  type: 'CONTACT' | 'REQUEST' | 'COMPLAINT' | 'INFO';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'UNREAD' | 'READ' | 'ANSWERED' | 'ARCHIVED' | 'IN_PROGRESS' | 'COMPLETED' | 'URGENT';
  createdAt: string;
  updatedAt: string;
  code?: string;
  expanded?: boolean;
  appointmentDate?: string | null;
}

export default function MessagesPage() {
  // Clé pour le localStorage
  const STORAGE_KEY = "ebf-messages-data";
  const NOTIFICATION_KEY = "ebf-notifications";

  // Fonction pour charger les données depuis le localStorage
  const loadFromStorage = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error("Erreur lors du chargement depuis localStorage:", error);
    }
    
    // Données par défaut si rien n'est stocké
    return {
      stats: {
        total: 0,
        lus: 0,
        nonLus: 0,
        archives: 0,
        enCours: 0,
        executes: 0,
        urgents: 0,
      },
      messages: [],
    };
  };

  // Fonction pour sauvegarder les données dans le localStorage
  const saveToStorage = (data) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error("Erreur lors de la sauvegarde dans localStorage:", error);
    }
  };

  // Générer un code aléatoire de 4 chiffres
  const generateCode = () => {
    return Math.floor(1000 + Math.random() * 9000).toString();
  };

  // État pour les notifications
  const [notificationBlink, setNotificationBlink] = useState(false);
  const [showClientDialog, setShowClientDialog] = useState(false);
  const [clientCode, setClientCode] = useState("");
  const [clientMessage, setClientMessage] = useState<Message | null>(null);

  const [stats, setStats] = useState({
    total: 0,
    lus: 0,
    nonLus: 0,
    archives: 0,
    enCours: 0,
    executes: 0,
    urgents: 0,
  });

  const [messages, setMessages] = useState<Message[]>([]);

  // Effet de clignotement pour les notifications
  useEffect(() => {
    // Vérifier s'il y a de nouveaux messages non lus
    const hasUnreadMessages = messages.some(msg => msg.status === "UNREAD");
    
    if (hasUnreadMessages) {
      const interval = setInterval(() => {
        setNotificationBlink(prev => !prev);
      }, 1000);
      
      return () => clearInterval(interval);
    } else {
      setNotificationBlink(false);
    }
  }, [messages]);

  // Charger les données au montage du composant
  useEffect(() => {
    const data = loadFromStorage();
    setStats(data.stats);
    setMessages(data.messages);
  }, []);

  // Recalculer les statistiques à chaque changement des messages
  useEffect(() => {
    const calculatedStats = calculateStats(messages);
    setStats(calculatedStats);
    
    // Sauvegarder les données
    const data = { stats: calculatedStats, messages };
    saveToStorage(data);
  }, [messages]);

  // Écouter les événements de nouveaux messages
  useEffect(() => {
    const handleNewMessage = (event: CustomEvent) => {
      const newMessage = event.detail;
      setMessages(prev => {
        // Vérifier si le message existe déjà pour éviter les doublons
        const exists = prev.some(msg => msg.id === newMessage.id);
        if (!exists) {
          return [newMessage, ...prev];
        }
        return prev;
      });
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('newMessage', handleNewMessage as EventListener);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('newMessage', handleNewMessage as EventListener);
      }
    };
  }, []);

  // Fonction pour calculer les statistiques à partir des messages
  const calculateStats = (messagesList) => {
    const stats = {
      total: messagesList.length,
      lus: 0,
      nonLus: 0,
      archives: 0,
      enCours: 0,
      executes: 0,
      urgents: 0,
    };

    messagesList.forEach(msg => {
      switch (msg.status) {
        case "READ":
          stats.lus += 1;
          break;
        case "UNREAD":
          stats.nonLus += 1;
          break;
        case "ARCHIVED":
          stats.archives += 1;
          break;
        case "IN_PROGRESS":
          stats.enCours += 1;
          break;
        case "COMPLETED":
          stats.executes += 1;
          break;
        case "URGENT":
          stats.urgents += 1;
          break;
      }
    });

    return stats;
  };

  // Fonction pour ajouter une nouvelle demande client
  const addNewClientRequest = (clientData) => {
    const newMessage: Message = {
      id: Date.now().toString(), // ID unique basé sur le timestamp
      name: clientData.name,
      email: clientData.email || '',
      phone: clientData.phone,
      subject: `Nouvelle demande - ${clientData.name}`,
      content: clientData.description,
      type: 'REQUEST',
      priority: 'MEDIUM',
      status: 'UNREAD', // Nouveau message non lu
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      code: generateCode(), // Générer un code à 4 chiffres
      expanded: false,
      appointmentDate: null,
    };

    setMessages(prev => [newMessage, ...prev]);
    
    // Émettre un événement personnalisé pour notifier les autres composants
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('newMessage', { detail: newMessage }));
    }
  };

  // Fonction pour programmer un rendez-vous
  const scheduleAppointment = (messageId) => {
    const date = prompt("Entrez la date et l'heure du rendez-vous (format: JJ/MM/AAAA HH:MM):");
    if (date) {
      setMessages(prev =>
        prev.map(msg =>
          msg.id === messageId 
            ? { ...msg, appointmentDate: date, status: "IN_PROGRESS" }
            : msg
        )
      );
      alert(`Rendez-vous programmé pour le ${date}`);
    }
  };

  // Fonction pour vérifier le code client
  const checkClientCode = () => {
    const message = messages.find(msg => msg.code === clientCode);
    if (message) {
      setClientMessage(message);
    } else {
      alert("Code incorrect. Veuillez réessayer.");
      setClientMessage(null);
    }
  };

  // Fonction pour réinitialiser un message individuel
  const resetMessage = (id) => {
    if (confirm("Êtes-vous sûr de vouloir réinitialiser ce message à son état initial ?")) {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === id ? { ...msg, status: "READ", expanded: false } : msg
        )
      );
    }
  };

  const updateMessageStatus = (id, newStatus) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === id ? { ...msg, status: newStatus } : msg
      )
    );
  };

  const deleteMessage = (id) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce message ?")) {
      setMessages((prev) => prev.filter((m) => m.id !== id));
    }
  };

  const toggleMessage = (id) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === id ? { ...msg, expanded: !msg.expanded } : msg
      )
    );
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "UNREAD": return <Mail className="w-4 h-4" />;
      case "READ": return <Check className="w-4 h-4" />;
      case "IN_PROGRESS": return <PlayCircle className="w-4 h-4" />;
      case "COMPLETED": return <CheckCircle className="w-4 h-4" />;
      case "URGENT": return <AlertTriangle className="w-4 h-4" />;
      case "ARCHIVED": return <Archive className="w-4 h-4" />;
      default: return <Mail className="w-4 h-4" />;
    }
  };

  const isStatusActive = (messageStatus, buttonStatus) => {
    return messageStatus === buttonStatus;
  };

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      {/* 📋 En-tête avec bouton retour et notification */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1 md:mb-2">Gestion des demandes clients</h1>
          <p className="text-sm md:text-base text-gray-600">Consultez et gérez toutes les demandes clients en un seul endroit</p>
        </div>
        <div className="flex items-center gap-2 md:gap-3">
          {/* Icône de notification clignotante */}
          <button
            onClick={() => setShowClientDialog(true)}
            className={`p-2 md:p-3 rounded-full transition-all duration-300 ${
              notificationBlink 
                ? 'bg-red-500 text-white animate-pulse' 
                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
            }`}
            title="Suivre votre rendez-vous"
          >
            <Mail size={16} />
          </button>
          <Link href="/">
            <button className="flex items-center gap-1 md:gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 md:px-4 py-2 rounded-lg transition-colors">
              <Home size={14} />
              <span className="text-sm">Accueil</span>
            </button>
          </Link>
        </div>
      </div>

      {/* 🟩 Section Statistiques */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2 md:gap-4">
        {[
          { label: "Total", value: stats.total, icon: "📨" },
          { label: "Non lus", value: stats.nonLus, icon: "🔴" },
          { label: "Lus", value: stats.lus, icon: "✅" },
          { label: "Archivés", value: stats.archives, icon: "🗃️" },
          { label: "En cours", value: stats.enCours, icon: "⏳" },
          { label: "Exécutés", value: stats.executes, icon: "⚙️" },
          { label: "Urgents", value: stats.urgents, icon: "🚨" },
        ].map((item, i) => (
          <div
            key={i}
            className="bg-white shadow rounded-xl md:rounded-2xl p-2 md:p-4 flex flex-col items-center text-center border hover:shadow-md transition"
          >
            <div className="text-xl md:text-2xl">{item.icon}</div>
            <div className="text-base md:text-lg font-semibold">{item.value}</div>
            <div className="text-xs md:text-sm text-gray-500">{item.label}</div>
          </div>
        ))}
      </div>

      {/* 📩 Liste des messages */}
      <div className="space-y-4">
        {messages.length === 0 ? (
          <div className="bg-white rounded-2xl shadow p-8 text-center border-2 border-dashed border-gray-200">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Aucune demande client</h3>
            <p className="text-gray-500 mb-4">Les nouvelles demandes clients apparaîtront ici lorsqu'elles seront soumises.</p>
            <Link href="/">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors">
                Retour à l'accueil
              </button>
            </Link>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id}>
              <div
                className="bg-white rounded-2xl shadow p-4 border hover:shadow-lg transition cursor-pointer"
                onClick={() => toggleMessage(msg.id)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">{msg.subject}</h3>
                    <p className="text-sm text-gray-500">
                      {msg.name} – {msg.phone}
                    </p>
                    <p className="mt-2 text-gray-600 text-sm line-clamp-2">{msg.content}</p>
                  </div>

                {/* 🟦 Boutons d'action - Tous les statuts */}
                <div className="flex gap-2 ml-4 flex-wrap" onClick={(e) => e.stopPropagation()}>
                  {/* Non lu */}
                  <button
                    onClick={() => updateMessageStatus(msg.id, "UNREAD")}
                    title="Marquer comme non lu"
                    disabled={isStatusActive(msg.status, "UNREAD")}
                    className={`p-2 rounded-lg transition-all ${
                      isStatusActive(msg.status, "UNREAD")
                        ? "bg-red-100 text-red-400 cursor-not-allowed opacity-50"
                        : "text-gray-600 hover:bg-red-100 hover:text-red-500"
                    }`}
                  >
                    <Mail size={16} />
                  </button>

                  {/* Lu */}
                  <button
                    onClick={() => updateMessageStatus(msg.id, "READ")}
                    title="Marquer comme lu"
                    disabled={isStatusActive(msg.status, "READ")}
                    className={`p-2 rounded-lg transition-all ${
                      isStatusActive(msg.status, "READ")
                        ? "bg-blue-100 text-blue-400 cursor-not-allowed opacity-50"
                        : "text-gray-600 hover:bg-blue-100 hover:text-blue-500"
                    }`}
                  >
                    <Check size={16} />
                  </button>

                  {/* En cours */}
                  <button
                    onClick={() => updateMessageStatus(msg.id, "IN_PROGRESS")}
                    title="Marquer comme en cours"
                    disabled={isStatusActive(msg.status, "IN_PROGRESS")}
                    className={`p-2 rounded-lg transition-all ${
                      isStatusActive(msg.status, "IN_PROGRESS")
                        ? "bg-yellow-100 text-yellow-400 cursor-not-allowed opacity-50"
                        : "text-gray-600 hover:bg-yellow-100 hover:text-yellow-500"
                    }`}
                  >
                    <PlayCircle size={16} />
                  </button>

                  {/* Exécuté */}
                  <button
                    onClick={() => updateMessageStatus(msg.id, "COMPLETED")}
                    title="Marquer comme exécuté"
                    disabled={isStatusActive(msg.status, "COMPLETED")}
                    className={`p-2 rounded-lg transition-all ${
                      isStatusActive(msg.status, "COMPLETED")
                        ? "bg-green-100 text-green-400 cursor-not-allowed opacity-50"
                        : "text-gray-600 hover:bg-green-100 hover:text-green-500"
                    }`}
                  >
                    <CheckCircle size={16} />
                  </button>

                  {/* Urgent */}
                  <button
                    onClick={() => updateMessageStatus(msg.id, "URGENT")}
                    title="Marquer comme urgent"
                    disabled={isStatusActive(msg.status, "URGENT")}
                    className={`p-2 rounded-lg transition-all ${
                      isStatusActive(msg.status, "URGENT")
                        ? "bg-red-100 text-red-400 cursor-not-allowed opacity-50"
                        : "text-gray-600 hover:bg-red-100 hover:text-red-500"
                    }`}
                  >
                    <AlertTriangle size={16} />
                  </button>

                  {/* Archiver */}
                  <button
                    onClick={() => updateMessageStatus(msg.id, "ARCHIVED")}
                    title="Archiver"
                    disabled={isStatusActive(msg.status, "ARCHIVED")}
                    className={`p-2 rounded-lg transition-all ${
                      isStatusActive(msg.status, "ARCHIVED")
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed opacity-50"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-500"
                    }`}
                  >
                    <Archive size={16} />
                  </button>

                  {/* Programmer rendez-vous */}
                  <button
                    onClick={() => scheduleAppointment(msg.id)}
                    title="Programmer un rendez-vous"
                    disabled={msg.appointmentDate !== null}
                    className={`p-2 rounded-lg transition-all ${
                      msg.appointmentDate !== null
                        ? "bg-green-100 text-green-400 cursor-not-allowed opacity-50"
                        : "text-gray-600 hover:bg-green-100 hover:text-green-500"
                    }`}
                  >
                    <Calendar size={16} />
                  </button>

                  {/* Réinitialiser */}
                  <button
                    onClick={() => resetMessage(msg.id)}
                    title="Réinitialiser le message"
                    className="p-2 rounded-lg text-gray-600 hover:bg-purple-100 hover:text-purple-500 transition-all"
                  >
                    <Clock4 size={16} />
                  </button>

                  {/* Supprimer */}
                  <button
                    onClick={() => deleteMessage(msg.id)}
                    title="Supprimer"
                    className="p-2 rounded-lg text-gray-600 hover:bg-red-100 hover:text-red-500 transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* 📋 Contenu détaillé du message */}
            {msg.expanded && (
              <div className="bg-gray-50 rounded-2xl p-4 mt-2 border-l-4 border-blue-500">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-gray-800">Détails du message</h4>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(msg.status)}
                      <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
                        {msg.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Client</p>
                      <p className="text-gray-800">{msg.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Téléphone</p>
                      <p className="text-gray-800">{msg.phone}</p>
                    </div>
                  </div>

                  {/* Code client et rendez-vous */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-sm text-blue-600 font-medium">Code de suivi</p>
                      <p className="text-lg font-bold text-blue-800">{msg.code}</p>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg">
                      <p className="text-sm text-green-600 font-medium">Rendez-vous</p>
                      <p className="text-green-800">
                        {msg.appointmentDate 
                          ? msg.appointmentDate 
                          : "Non programmé"
                        }
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Description complète</p>
                    <p className="text-gray-800 mt-1 leading-relaxed">{msg.content}</p>
                  </div>
                  
                  <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Clock4 size={14} />
                      <span>Message reçu</span>
                    </div>
                    <button
                      onClick={() => toggleMessage(msg.id)}
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Réduire
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
          ))
        )}
      </div>

      {/* 📞 Boîte de dialogue pour le suivi client */}
      {showClientDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Suivre votre rendez-vous</h3>
            
            {!clientMessage ? (
              <div className="space-y-4">
                <p className="text-gray-600">Entrez votre code de suivi (EBF-1234) pour suivre votre rendez-vous :</p>
                <input
                  type="text"
                  maxLength={9}
                  value={clientCode}
                  onChange={(e) => setClientCode(e.target.value.toUpperCase())}
                  placeholder="EBF-1234"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg font-mono"
                />
                <div className="flex gap-3">
                  <button
                    onClick={checkClientCode}
                    disabled={clientCode.length !== 9 || !clientCode.startsWith('EBF-')}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white py-2 rounded-lg transition-colors"
                  >
                    Vérifier
                  </button>
                  <button
                    onClick={() => {
                      setShowClientDialog(false);
                      setClientCode("");
                      setClientMessage(null);
                    }}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 rounded-lg transition-colors"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-2">Informations de votre rendez-vous</h4>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm text-green-600">Client :</span>
                      <span className="ml-2 text-green-800">{clientMessage.name}</span>
                    </div>
                    <div>
                      <span className="text-sm text-green-600">Téléphone :</span>
                      <span className="ml-2 text-green-800">{clientMessage.phone}</span>
                    </div>
                    <div>
                      <span className="text-sm text-green-600">Demande :</span>
                      <span className="ml-2 text-green-800">{clientMessage.content}</span>
                    </div>
                    <div>
                      <span className="text-sm text-green-600">Rendez-vous :</span>
                      <span className="ml-2 text-green-800 font-semibold">
                        {clientMessage.appointmentDate || "En attente de programmation"}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowClientDialog(false);
                    setClientCode("");
                    setClientMessage(null);
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors"
                >
                  Fermer
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}