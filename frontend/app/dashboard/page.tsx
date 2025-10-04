"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { PanelOption, PanelDate, PanelFile, PanelConfig, PanelExport, PanelCerrar, ResumenInferior, Item } from "./components";

const FORMATO_IMPORT_OPTS = ["Eholo", "Gestoria"] as const;
const FORMATO_EXPORT_OPTS = ["Holded", "Gestoria"] as const;
const EMPRESAS = ["Kissoro", "En Plural Psicologia"] as const;
const PROYECTOS = ["Servicios de Psicologia", "Formacion", "Administracion SL"] as const;
const CUENTAS = ["70500000 Prestaciones de servicios","70000000 Venta de mercaderías","Otra (introducir)"] as const;

type MenuKey = "formatoImport"|"formatoExport"|"empresa"|"fecha"|"proyecto"|"cuenta"|"fichero"|"config"|"exportar"|"cerrar";

export default function DashboardPage() {
  const router = useRouter();
  const [authChecked,setAuthChecked]=useState(false);
  const [token,setToken]=useState<string|null>(null);

  useEffect(()=>{
    if(typeof window==="undefined") return;
    const t=sessionStorage.getItem("konyx_session");
    if(!t){ router.replace("/"); } else { setToken(t); setAuthChecked(true); }
  },[router]);

  if(!authChecked) return null;

  const [menu,setMenu]=useState<MenuKey>("formatoImport");
  const [formatoImport,setFormatoImport]=useState<typeof FORMATO_IMPORT_OPTS[number]|null>(null);
  const [formatoExport,setFormatoExport]=useState<typeof FORMATO_EXPORT_OPTS[number]|null>(null);
  const [empresa,setEmpresa]=useState<typeof EMPRESAS[number]|null>(null);
  const [fechaFactura,setFechaFactura]=useState("");
  const [proyecto,setProyecto]=useState<typeof PROYECTOS[number]|null>(null);
  const [cuenta,setCuenta]=useState<typeof CUENTAS[number]|null>(null);
  const [cuentaOtra,setCuentaOtra]=useState("");
  const [ficheroNombre,setFicheroNombre]=useState("");
  const fileInputRef = useRef<HTMLInputElement|null>(null);

  const onPickFileClick=()=>fileInputRef.current?.click();
  const onPickFile=(e:React.ChangeEvent<HTMLInputElement>)=>{ const f=e.target.files?.[0]; setFicheroNombre(f?f.name:""); };

  // ... aquí van todos tus estados de contraseñas y APIs, igual que antes

  // exportReady
  const exportReady=useMemo(()=>{
    const cuentaOk = cuenta==="Otra (introducir)"? cuentaOtra.trim().length>0 : !!cuenta;
    return !!formatoImport && !!formatoExport && !!empresa && !!fechaFactura && !!proyecto && cuentaOk && !!ficheroNombre;
  },[formatoImport,formatoExport,empresa,fechaFactura,proyecto,cuenta,cuentaOtra,ficheroNombre]);

  // onExportAsk, onConfirmExport, onCambioApis, onCambioPassword, logout, fmtFecha ...

  return (
    <main className="min-h-screen bg-no-repeat bg-center bg-cover p-4" style={{backgroundImage:"url(/fondo.png)",backgroundSize:"100% 100%",backgroundRepeat:"no-repeat"}}>
      <div className="mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-[260px_1fr] gap-6">
        {/* Sidebar */}
        <aside className="md:sticky md:top-6">
          <div className="bg-slate-500/90 backdrop-blur rounded-2xl shadow p-4">
            <div className="flex justify-center mb-4">
              <img src="/logo.png" alt="Konyx" className="h-48 w-auto drop-shadow-md"/>
            </div>
            <nav className="space-y-2">
              <Item active={menu==="formatoImport"} onClick={()=>setMenu("formatoImport")}>Formato Importación</Item>
              <Item active={menu==="formatoExport"} onClick={()=>setMenu("formatoExport")}>Formato Exportación</Item>
              <Item active={menu==="empresa"} onClick={()=>setMenu("empresa")}>Empresa</Item>
              <Item active={menu==="fecha"} onClick={()=>setMenu("fecha")}>Fecha factura</Item>
              <Item active={menu==="proyecto"} onClick={()=>setMenu("proyecto")}>Proyecto</Item>
              <Item active={menu==="cuenta"} onClick={()=>setMenu("cuenta")}>Cuenta contable</Item>
              <Item active={menu==="fichero"} onClick={()=>setMenu("fichero")}>Fichero de datos</Item>
              <Item active={menu==="config"} onClick={()=>setMenu("config")}>Configuración</Item>
              <button type="button" onClick={onExportAsk} className={`w-full text-left px-3 py-2 rounded-lg transition font-semibold border ${exportReady?"border-indigo-600 text-indigo-700 bg-white/90 shadow hover:bg-indigo-200 hover:text-indigo-800":"border-gray-300 text-gray-200 cursor-not-allowed"}`} title={exportReady?"Listo para exportar":"Completa todos los campos para exportar"}>Exportar</button>
              <div className="pt-2"><Item active={menu==="cerrar"} onClick={()=>setMenu("cerrar")}>Cerrar Sesión</Item></div>
            </nav>
          </div>
        </aside>

        {/* Contenido principal */}
        <section className="space-y-6">
          {menu==="formatoImport" && <PanelOption title="Formato Importación" options={FORMATO_IMPORT_OPTS} value={formatoImport} onChange={setFormatoImport} />}
          {menu==="formatoExport" && <PanelOption title="Formato Exportación" options={FORMATO_EXPORT_OPTS} value={formatoExport} onChange={setFormatoExport} />}
          {menu==="empresa" && <PanelOption title="Empresa" options={EMPRESAS} value={empresa} onChange={setEmpresa} />}
          {menu==="proyecto" && <PanelOption title="Proyecto" options={PROYECTOS} value={proyecto} onChange={setProyecto} />}
          {menu==="cuenta" && <PanelOption title="Cuenta contable" options={CUENTAS} value={cuenta} onChange={setCuenta}>
            {cuenta==="Otra (introducir)" && <div className="mt-4">
              <input type="text" value={cuentaOtra} onChange={e=>setCuentaOtra(e.target.value)} placeholder="Introduce tu cuenta" className="w-full rounded-lg border border-indigo-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
            </div>}
          </PanelOption>}
          {menu==="fecha" && <PanelDate title="Fecha factura" value={fechaFactura} onChange={setFechaFactura} />}
          {menu==="fichero" && <PanelFile value={ficheroNombre} onPickFile={onPickFile} onPickFileClick={onPickFileClick} fileInputRef={fileInputRef} />}
          {menu==="config" && <PanelConfig
            passActual={passActual} passNueva={passNueva} passConfirma={passConfirma}
            setPassActual={setPassActual} setPassNueva={setPassNueva} setPassConfirma={setPassConfirma} passMsg={passMsg} onCambioPassword={onCambioPassword}
            apiKissoroVigente={apiKissoroVigente} apiKissoroNuevo={apiKissoroNuevo} setApiKissoroNuevo={setApiKissoroNuevo} apiKissoroMsg={apiKissoroMsg}
            apiEnPluralVigente={apiEnPluralVigente} apiEnPluralNuevo={apiEnPluralNuevo} setApiEnPluralNuevo={setApiEnPluralNuevo} apiEnPluralMsg={apiEnPluralMsg} onCambioApis={onCambioApis}
          />}
          {menu==="exportar" && <PanelExport onConfirm={onConfirmExport} />}
          {menu==="cerrar" && <PanelCerrar onConfirm={logout} onCancel={()=>setMenu("formatoImport")} />}

          <ResumenInferior />
        </section>
      </div>
    </main>
  );
}
