"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  DollarSign,
  User,
  Briefcase,
  TrendingUp,
  Save,
  Loader2,
  Plus,
  X,
  HelpCircle,
} from "lucide-react";

const RATE_TOOLTIPS: Record<string, string> = {
  rateGeneral: "Tarifa estándar aplicada por defecto a tareas no categorizadas.",
  rateFrontend: "Tarifa para desarrollo de interfaces, maquetación HTML/CSS y componentes del cliente.",
  rateBackend: "Tarifa para desarrollo de APIs, bases de datos, integraciones y lógica de negocio.",
  rateAI: "Tarifa para integraciones con LLMs, prompts avanzados, embeddings y agentes inteligentes.",
  rateDesign: "Tarifa para diseño de experiencia de usuario (UX), diseño visual (UI) y prototipos.",
  rateConsulting: "Tarifa para workshops, reuniones con clientes y consultoría de ingeniería de requerimientos.",
  rateDevOps: "Tarifa para configuración de pipelines CI/CD, infraestructura cloud y despliegues.",
  rateQA: "Tarifa para diseño de casos de prueba, automatización de pruebas y aseguramiento de calidad.",
};

export default function SettingsPage() {
  const { state } = useApp();
  const { username } = state;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"rates" | "profile" | "costs" | "market">("rates");

  // Form State
  const [rates, setRates] = useState({
    rateGeneral: 35,
    rateFrontend: 30,
    rateBackend: 40,
    rateAI: 55,
    rateDesign: 25,
    rateConsulting: 50,
    rateDevOps: 45,
    rateQA: 28,
  });

  const [profileData, setProfileData] = useState({
    yearsExperience: 5,
    professionalLevel: "SEMI_SENIOR",
    educationLevel: "ENGINEERING",
    completedProjects: 10,
    specializations: [] as string[],
    certifications: [] as string[],
  });

  const [costs, setCosts] = useState({
    internetCost: 40,
    electricityCost: 30,
    coworkingCost: 0,
    hostingCost: 20,
    licenseCost: 15,
    domainCostYearly: 12,
    accountingCost: 50,
    incomeTaxRate: 15,
    insuranceCost: 0,
  });

  const [market, setMarket] = useState({
    providerCountry: "Guatemala",
    mainCurrency: "USD",
    localCurrency: "GTQ",
    exchangeRate: 7.8,
    costOfLiving: "MEDIUM",
    marketScope: "LATAM",
    aiProductivityBoost: 25,
    aiTools: [] as string[],
    teamMembers: [] as string[],
  });

  // Helpers for tags inputs
  const [newSpec, setNewSpec] = useState("");
  const [newCert, setNewCert] = useState("");
  const [newTool, setNewTool] = useState("");
  const [newMember, setNewMember] = useState("");

  useEffect(() => {
    if (!username) return;

    const loadProfile = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/settings/provider-profile?username=${encodeURIComponent(username)}`);
        if (!res.ok) throw new Error("Error loading profile");
        const data = await res.json();

        if (data) {
          setRates({
            rateGeneral: data.rateGeneral ?? 35,
            rateFrontend: data.rateFrontend ?? 30,
            rateBackend: data.rateBackend ?? 40,
            rateAI: data.rateAI ?? 55,
            rateDesign: data.rateDesign ?? 25,
            rateConsulting: data.rateConsulting ?? 50,
            rateDevOps: data.rateDevOps ?? 45,
            rateQA: data.rateQA ?? 28,
          });

          setProfileData({
            yearsExperience: data.yearsExperience ?? 5,
            professionalLevel: data.professionalLevel ?? "SEMI_SENIOR",
            educationLevel: data.educationLevel ?? "ENGINEERING",
            completedProjects: data.completedProjects ?? 10,
            specializations: data.specializations ?? [],
            certifications: data.certifications ?? [],
          });

          setCosts({
            internetCost: data.internetCost ?? 0,
            electricityCost: data.electricityCost ?? 0,
            coworkingCost: data.coworkingCost ?? 0,
            hostingCost: data.hostingCost ?? 0,
            licenseCost: data.licenseCost ?? 0,
            domainCostYearly: data.domainCostYearly ?? 0,
            accountingCost: data.accountingCost ?? 0,
            incomeTaxRate: data.incomeTaxRate ?? 0,
            insuranceCost: data.insuranceCost ?? 0,
          });

          setMarket({
            providerCountry: data.providerCountry ?? "",
            mainCurrency: data.mainCurrency ?? "USD",
            localCurrency: data.localCurrency ?? "",
            exchangeRate: data.exchangeRate ?? 1,
            costOfLiving: data.costOfLiving ?? "MEDIUM",
            marketScope: data.marketScope ?? "LATAM",
            aiProductivityBoost: data.aiProductivityBoost ?? 25,
            aiTools: data.aiTools ?? [],
            teamMembers: data.teamMembers ?? [],
          });
        }
      } catch (err) {
        console.error("Error fetching provider profile settings:", err);
        toast.error("No se pudo cargar el perfil del proveedor.");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [username]);

  const handleSave = async () => {
    try {
      setSaving(true);
      const payload = {
        username,
        ...rates,
        ...profileData,
        ...costs,
        ...market,
      };

      const res = await fetch("/api/settings/provider-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Error saving profile");
      toast.success("¡Perfil de proveedor guardado con éxito!");
    } catch (err) {
      console.error("Error saving profile:", err);
      toast.error("Error al guardar la configuración.");
    } finally {
      setSaving(false);
    }
  };

  const addTag = (
    field: "specializations" | "certifications" | "aiTools" | "teamMembers",
    val: string,
    setVal: React.Dispatch<React.SetStateAction<string>>
  ) => {
    if (!val.trim()) return;
    if (field === "specializations" || field === "certifications") {
      setProfileData((prev) => ({
        ...prev,
        [field]: [...new Set([...prev[field], val.trim()])],
      }));
    } else {
      setMarket((prev) => ({
        ...prev,
        [field]: [...new Set([...prev[field], val.trim()])],
      }));
    }
    setVal("");
  };

  const removeTag = (
    field: "specializations" | "certifications" | "aiTools" | "teamMembers",
    index: number
  ) => {
    if (field === "specializations" || field === "certifications") {
      setProfileData((prev) => ({
        ...prev,
        [field]: prev[field].filter((_, i) => i !== index),
      }));
    } else {
      setMarket((prev) => ({
        ...prev,
        [field]: prev[field].filter((_, i) => i !== index),
      }));
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 text-primary animate-spin mb-2" />
        <p className="text-xs text-muted-foreground">Cargando configuración del perfil...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full max-h-full overflow-hidden bg-background">
      {/* Header */}
      <header className="p-5 border-b border-border flex items-center justify-between bg-card/40 backdrop-blur-md z-10">
        <div>
          <h1 className="font-bold text-lg tracking-tight">Configuración del Proveedor</h1>
          <p className="text-xs text-muted-foreground">
            Ajusta tus tarifas base, nivel, costos operativos y variables que regulan el motor de cotización IA.
          </p>
        </div>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="gap-1.5 text-xs font-semibold px-4 py-2 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          {saving ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Save className="h-3.5 w-3.5" />
          )}
          {saving ? "Guardando..." : "Guardar Perfil"}
        </Button>
      </header>

      {/* Main Area */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Navigation / Tabs */}
        <div className="w-full md:w-60 border-b md:border-b-0 md:border-r border-border p-3 flex flex-row md:flex-col gap-1 overflow-x-auto shrink-0 bg-card/10">
          <button
            onClick={() => setActiveTab("rates")}
            className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-medium transition-all text-left whitespace-nowrap ${
              activeTab === "rates"
                ? "bg-primary/15 text-primary"
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            }`}
          >
            <DollarSign className="h-4 w-4" />
            Tarifas por Hora
          </button>
          <button
            onClick={() => setActiveTab("profile")}
            className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-medium transition-all text-left whitespace-nowrap ${
              activeTab === "profile"
                ? "bg-primary/15 text-primary"
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            }`}
          >
            <User className="h-4 w-4" />
            Perfil & Experiencia
          </button>
          <button
            onClick={() => setActiveTab("costs")}
            className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-medium transition-all text-left whitespace-nowrap ${
              activeTab === "costs"
                ? "bg-primary/15 text-primary"
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            }`}
          >
            <Briefcase className="h-4 w-4" />
            Costos Operativos
          </button>
          <button
            onClick={() => setActiveTab("market")}
            className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-medium transition-all text-left whitespace-nowrap ${
              activeTab === "market"
                ? "bg-primary/15 text-primary"
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            }`}
          >
            <TrendingUp className="h-4 w-4" />
            Mercado & Productividad
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 max-w-4xl">
          {/* TAB 1: RATES */}
          {activeTab === "rates" && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h3 className="text-sm font-semibold text-foreground">Tarifas de Trabajo (USD/hr)</h3>
                <p className="text-xs text-muted-foreground">
                  Estas tarifas se utilizarán según las categorías requeridas en la planificación del software.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(Object.keys(rates) as Array<keyof typeof rates>).map((key) => {
                  const label =
                    key === "rateGeneral"
                      ? "Tarifa General"
                      : key === "rateFrontend"
                      ? "Tarifa Frontend"
                      : key === "rateBackend"
                      ? "Tarifa Backend"
                      : key === "rateAI"
                      ? "Tarifa IA / ML"
                      : key === "rateDesign"
                      ? "Tarifa Diseño & UX"
                      : key === "rateConsulting"
                      ? "Tarifa Consultoría / Reuniones"
                      : key === "rateDevOps"
                      ? "Tarifa DevOps"
                      : "Tarifa QA / Testing";

                  return (
                    <div key={key} className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground capitalize flex items-center justify-between">
                        <span className="flex items-center gap-1">
                          {label}
                          <span
                            className="cursor-help text-muted-foreground/50 hover:text-foreground transition-colors"
                            title={RATE_TOOLTIPS[key]}
                          >
                            <HelpCircle className="h-3 w-3" />
                          </span>
                        </span>
                        <span className="text-[10px] text-primary/70">USD/hr</span>
                      </label>
                      <div className="relative rounded-lg shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-muted-foreground text-xs">$</span>
                        </div>
                        <input
                          type="number"
                          value={rates[key]}
                          onChange={(e) =>
                            setRates((prev) => ({
                              ...prev,
                              [key]: parseFloat(e.target.value) || 0,
                            }))
                          }
                          className="block w-full pl-7 pr-3 py-2 text-xs bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: PROFILE */}
          {activeTab === "profile" && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h3 className="text-sm font-semibold text-foreground">Perfil Profesional</h3>
                <p className="text-xs text-muted-foreground">
                  Detalles sobre tu experiencia profesional que la IA considera para justificar los presupuestos.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Nivel Profesional</label>
                  <select
                    value={profileData.professionalLevel}
                    onChange={(e) =>
                      setProfileData((prev) => ({
                        ...prev,
                        professionalLevel: e.target.value,
                      }))
                    }
                    className="block w-full px-3 py-2 text-xs bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="JUNIOR">Junior</option>
                    <option value="SEMI_SENIOR">Semi Senior</option>
                    <option value="SENIOR">Senior</option>
                    <option value="TECH_LEAD">Tech Lead</option>
                    <option value="ARCHITECT">Arquitecto</option>
                    <option value="SPECIALIST">Especialista</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Nivel de Educación</label>
                  <select
                    value={profileData.educationLevel}
                    onChange={(e) =>
                      setProfileData((prev) => ({
                        ...prev,
                        educationLevel: e.target.value,
                      }))
                    }
                    className="block w-full px-3 py-2 text-xs bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="TECHNICAL">Técnico</option>
                    <option value="BACHELOR">Licenciatura / Grado</option>
                    <option value="ENGINEERING">Ingeniería</option>
                    <option value="MASTER">Maestría</option>
                    <option value="DOCTORATE">Doctorado</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Años de Experiencia</label>
                  <input
                    type="number"
                    value={profileData.yearsExperience}
                    onChange={(e) =>
                      setProfileData((prev) => ({
                        ...prev,
                        yearsExperience: parseInt(e.target.value) || 0,
                      }))
                    }
                    className="block w-full px-3 py-2 text-xs bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Proyectos Completados</label>
                  <input
                    type="number"
                    value={profileData.completedProjects}
                    onChange={(e) =>
                      setProfileData((prev) => ({
                        ...prev,
                        completedProjects: parseInt(e.target.value) || 0,
                      }))
                    }
                    className="block w-full px-3 py-2 text-xs bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              {/* Specializations Tags */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">Especializaciones / Frameworks</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSpec}
                    onChange={(e) => setNewSpec(e.target.value)}
                    placeholder="Ej. React, Node.js, Next.js..."
                    className="flex-1 px-3 py-1.5 text-xs bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addTag("specializations", newSpec, setNewSpec);
                      }
                    }}
                  />
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => addTag("specializations", newSpec, setNewSpec)}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {profileData.specializations.map((spec, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-primary/10 text-primary border border-primary/20"
                    >
                      {spec}
                      <X
                        className="h-3 w-3 cursor-pointer hover:text-destructive"
                        onClick={() => removeTag("specializations", i)}
                      />
                    </span>
                  ))}
                  {profileData.specializations.length === 0 && (
                    <span className="text-[10px] text-muted-foreground italic">Ninguna agregada aún.</span>
                  )}
                </div>
              </div>

              {/* Certifications Tags */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">Certificaciones</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newCert}
                    onChange={(e) => setNewCert(e.target.value)}
                    placeholder="Ej. AWS Solutions Architect, Scrum Master..."
                    className="flex-1 px-3 py-1.5 text-xs bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addTag("certifications", newCert, setNewCert);
                      }
                    }}
                  />
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => addTag("certifications", newCert, setNewCert)}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {profileData.certifications.map((cert, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-primary/10 text-primary border border-primary/20"
                    >
                      {cert}
                      <X
                        className="h-3 w-3 cursor-pointer hover:text-destructive"
                        onClick={() => removeTag("certifications", i)}
                      />
                    </span>
                  ))}
                  {profileData.certifications.length === 0 && (
                    <span className="text-[10px] text-muted-foreground italic">Ninguna agregada aún.</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: COSTS */}
          {activeTab === "costs" && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h3 className="text-sm font-semibold text-foreground">Costos Operativos Mensuales (USD)</h3>
                <p className="text-xs text-muted-foreground">
                  Definir tus costos fijos de operación permite al motor calcular tarifas mínimas recomendables (punto de equilibrio).
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(Object.keys(costs) as Array<keyof typeof costs>).map((key) => {
                  const label =
                    key === "internetCost"
                      ? "Costo de Internet"
                      : key === "electricityCost"
                      ? "Costo de Electricidad"
                      : key === "coworkingCost"
                      ? "Espacio de Coworking"
                      : key === "hostingCost"
                      ? "Hosting & Cloud"
                      : key === "licenseCost"
                      ? "Licencias de Software"
                      : key === "domainCostYearly"
                      ? "Dominios (Anual)"
                      : key === "accountingCost"
                      ? "Servicios Contables"
                      : key === "incomeTaxRate"
                      ? "Impuesto / Retención (%)"
                      : "Seguro Médico / Profesional";

                  return (
                    <div key={key} className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground capitalize flex items-center justify-between">
                        <span>{label}</span>
                        <span className="text-[10px] text-primary/70">
                          {key === "incomeTaxRate" ? "%" : "USD/mes"}
                        </span>
                      </label>
                      <div className="relative rounded-lg shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-muted-foreground text-xs">
                            {key === "incomeTaxRate" ? "%" : "$"}
                          </span>
                        </div>
                        <input
                          type="number"
                          value={costs[key]}
                          onChange={(e) =>
                            setCosts((prev) => ({
                              ...prev,
                              [key]: parseFloat(e.target.value) || 0,
                            }))
                          }
                          className="block w-full pl-7 pr-3 py-2 text-xs bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: MARKET & PRODUCTIVITY */}
          {activeTab === "market" && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h3 className="text-sm font-semibold text-foreground">Mercado & Productividad</h3>
                <p className="text-xs text-muted-foreground">
                  Variables de ubicación, divisas e impacto de herramientas de inteligencia artificial.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">País de Residencia</label>
                  <input
                    type="text"
                    value={market.providerCountry}
                    onChange={(e) =>
                      setMarket((prev) => ({
                        ...prev,
                        providerCountry: e.target.value,
                      }))
                    }
                    className="block w-full px-3 py-2 text-xs bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1.5 col-span-1">
                    <label className="text-xs font-medium text-muted-foreground">Divisa Principal</label>
                    <input
                      type="text"
                      value={market.mainCurrency}
                      onChange={(e) =>
                        setMarket((prev) => ({
                          ...prev,
                          mainCurrency: e.target.value.toUpperCase(),
                        }))
                      }
                      className="block w-full px-2 py-2 text-xs bg-background border border-border rounded-lg text-center focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div className="space-y-1.5 col-span-1">
                    <label className="text-xs font-medium text-muted-foreground">Divisa Local</label>
                    <input
                      type="text"
                      value={market.localCurrency}
                      onChange={(e) =>
                        setMarket((prev) => ({
                          ...prev,
                          localCurrency: e.target.value.toUpperCase(),
                        }))
                      }
                      className="block w-full px-2 py-2 text-xs bg-background border border-border rounded-lg text-center focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div className="space-y-1.5 col-span-1">
                    <label className="text-xs font-medium text-muted-foreground">Tipo de Cambio</label>
                    <input
                      type="number"
                      step="any"
                      value={market.exchangeRate}
                      onChange={(e) =>
                        setMarket((prev) => ({
                          ...prev,
                          exchangeRate: parseFloat(e.target.value) || 1,
                        }))
                      }
                      className="block w-full px-2 py-2 text-xs bg-background border border-border rounded-lg text-center focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Costo de Vida Regional</label>
                  <select
                    value={market.costOfLiving}
                    onChange={(e) =>
                      setMarket((prev) => ({
                        ...prev,
                        costOfLiving: e.target.value,
                      }))
                    }
                    className="block w-full px-3 py-2 text-xs bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="VERY_LOW">Muy Bajo</option>
                    <option value="LOW">Bajo</option>
                    <option value="MEDIUM">Medio</option>
                    <option value="HIGH">Alto</option>
                    <option value="VERY_HIGH">Muy Alto</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Alcance de tu Mercado</label>
                  <select
                    value={market.marketScope}
                    onChange={(e) =>
                      setMarket((prev) => ({
                        ...prev,
                        marketScope: e.target.value,
                      }))
                    }
                    className="block w-full px-3 py-2 text-xs bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="LOCAL">Local (Solo tu país)</option>
                    <option value="LATAM">Latinoamérica</option>
                    <option value="NORTH_AMERICA">Norteamérica / EEUU</option>
                    <option value="EUROPE">Europa</option>
                    <option value="GLOBAL">Global / Todo el mundo</option>
                  </select>
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-medium text-muted-foreground flex justify-between">
                    <span>Mejora de Productividad por IA (%)</span>
                    <span className="text-primary font-semibold">{market.aiProductivityBoost}%</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={market.aiProductivityBoost}
                    onChange={(e) =>
                      setMarket((prev) => ({
                        ...prev,
                        aiProductivityBoost: parseInt(e.target.value) || 0,
                      }))
                    }
                    className="w-full h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <span className="text-[10px] text-muted-foreground mt-1 block">
                    Porcentaje de horas que ahorras usando copilotos de IA (reduce el tiempo estimado global de los proyectos).
                  </span>
                </div>
              </div>

              {/* AI Tools */}
              <div className="space-y-2 pt-2">
                <label className="text-xs font-medium text-muted-foreground">Herramientas IA que utilizas</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTool}
                    onChange={(e) => setNewTool(e.target.value)}
                    placeholder="Ej. GitHub Copilot, ChatGPT, v0, Cursor..."
                    className="flex-1 px-3 py-1.5 text-xs bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addTag("aiTools", newTool, setNewTool);
                      }
                    }}
                  />
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => addTag("aiTools", newTool, setNewTool)}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {market.aiTools.map((tool, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-primary/10 text-primary border border-primary/20"
                    >
                      {tool}
                      <X
                        className="h-3 w-3 cursor-pointer hover:text-destructive"
                        onClick={() => removeTag("aiTools", i)}
                      />
                    </span>
                  ))}
                  {market.aiTools.length === 0 && (
                    <span className="text-[10px] text-muted-foreground italic">Ninguna herramienta agregada aún.</span>
                  )}
                </div>
              </div>

              {/* Team Members */}
              <div className="space-y-2 pt-2">
                <label className="text-xs font-medium text-muted-foreground">Miembros del equipo / Roles de Apoyo</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMember}
                    onChange={(e) => setNewMember(e.target.value)}
                    placeholder="Ej. Diseñador UX UI, QA Tester Freelance..."
                    className="flex-1 px-3 py-1.5 text-xs bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addTag("teamMembers", newMember, setNewMember);
                      }
                    }}
                  />
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => addTag("teamMembers", newMember, setNewMember)}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {market.teamMembers.map((member, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-primary/10 text-primary border border-primary/20"
                    >
                      {member}
                      <X
                        className="h-3 w-3 cursor-pointer hover:text-destructive"
                        onClick={() => removeTag("teamMembers", i)}
                      />
                    </span>
                  ))}
                  {market.teamMembers.length === 0 && (
                    <span className="text-[10px] text-muted-foreground italic">Ninguno (Freelancer Solo).</span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
