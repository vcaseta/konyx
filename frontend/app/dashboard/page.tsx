{/* Contenido */}
<section className="space-y-6">
  {/* Panel de selección */}
  <div className="bg-white/90 backdrop-blur rounded-2xl shadow p-6">

    {menu === "formatoImport" && (
      <div>
        <h2 className="text-lg font-semibold mb-4">Formato Importación</h2>
        <OptionGrid options={FORMATO_IMPORT_OPTS} value={formatoImport} onChange={setFormatoImport} />
      </div>
    )}

    {menu === "formatoExport" && (
      <div>
        <h2 className="text-lg font-semibold mb-4">Formato Exportación</h2>
        <OptionGrid options={FORMATO_EXPORT_OPTS} value={formatoExport} onChange={setFormatoExport} />
      </div>
    )}

    {menu === "empresa" && (
      <div>
        <h2 className="text-lg font-semibold mb-4">Empresa</h2>
        <OptionGrid options={EMPRESAS} value={empresa} onChange={setEmpresa} />
      </div>
    )}

    {menu === "fecha" && (
      <div>
        <h2 className="text-lg font-semibold mb-4">Fecha factura</h2>
        <input
          type="date"
          value={fechaFactura}
          onChange={(e) => setFechaFactura(e.target.value)}
          className="rounded-lg border border-indigo-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>
    )}

    {menu === "proyecto" && (
      <div>
        <h2 className="text-lg font-semibold mb-4">Proyecto</h2>
        <OptionGrid options={PROYECTOS} value={proyecto} onChange={setProyecto} />
      </div>
    )}

    {menu === "cuenta" && (
      <div>
        <h2 className="text-lg font-semibold mb-4">Cuenta contable</h2>
        <OptionGrid options={CUENTAS} value={cuenta} onChange={setCuenta} />
        {cuenta === "Otra (introducir)" && (
          <div className="mt-4">
            <label className="block text-sm font-medium mb-1">Otra cuenta</label>
            <input
              type="text"
              value={cuentaOtra}
              onChange={(e) => setCuentaOtra(e.target.value)}
              placeholder="Introduce tu cuenta"
              className="w-full rounded-lg border border-indigo-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        )}
      </div>
    )}

    {menu === "fichero" && (
      <div>
        <h2 className="text-lg font-semibold mb-4">Fichero de datos</h2>
        <label className="inline-flex items-center gap-3 px-4 py-2 rounded-lg border border-indigo-300 hover:bg-indigo-50 cursor-pointer">
          <span className="text-indigo-700 font-medium">Seleccionar Excel</span>
          <input ref={fileInputRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={onPickFile} />
        </label>
        {ficheroNombre && (
          <p className="mt-2 text-sm text-indigo-700 font-semibold">{ficheroNombre}</p>
        )}
      </div>
    )}

    {menu === "config" && (
      <div className="space-y-8">
        <h2 className="text-lg font-semibold">Configuración</h2>

        {/* Cambio de contraseña */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold">Cambio de contraseña</h3>
          <div className="grid md:grid-cols-[1fr_1fr_1fr_auto] gap-3 items-center">
            <input
              type="password"
              value={passActual}
              onChange={(e) => setPassActual(e.target.value)}
              placeholder="Contraseña actual"
              className="rounded-lg border border-indigo-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <input
              type="password"
              value={passNueva}
              onChange={(e) => setPassNueva(e.target.value)}
              placeholder="Nueva contraseña"
              className="rounded-lg border border-indigo-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <input
              type="password"
              value={passConfirma}
              onChange={(e) => setPassConfirma(e.target.value)}
              placeholder="Confirmar nueva contraseña"
              className="rounded-lg border border-indigo-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="button"
              onClick={onCambioPassword}
              className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700"
            >
              Cambio
            </button>
          </div>
          {passMsg && <p className={`text-sm ${passMsg.type==="ok"?"text-green-700":"text-red-700"}`}>{passMsg.text}</p>}
        </div>

        {/* API Kissoro */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold">API Holded Kissoro</h3>
          <div className="grid md:grid-cols-[1fr_1fr_auto] gap-3 items-center">
            <input
              type="text"
              value={apiKissoroVigente}
              readOnly
              placeholder="API vigente"
              className="rounded-lg border border-indigo-300 px-3 py-2 bg-gray-100 text-gray-600"
            />
            <input
              type="text"
              value={apiKissoroNuevo}
              onChange={(e) => setApiKissoroNuevo(e.target.value)}
              placeholder="Nuevo API"
              className="rounded-lg border border-indigo-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="button"
              onClick={onCambioApis}
              className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700"
            >
              Cambio
            </button>
          </div>
          {apiKissoroMsg && <p className={`text-sm ${apiKissoroMsg.type==="ok"?"text-green-700":"text-red-700"}`}>{apiKissoroMsg.text}</p>}
        </div>

        {/* API En Plural */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold">API Holded En Plural Psicologia</h3>
          <div className="grid md:grid-cols-[1fr_1fr_auto] gap-3 items-center">
            <input
              type="text"
              value={apiEnPluralVigente}
              readOnly
              placeholder="API vigente"
              className="rounded-lg border border-indigo-300 px-3 py-2 bg-gray-100 text-gray-600"
            />
            <input
              type="text"
              value={apiEnPluralNuevo}
              onChange={(e) => setApiEnPluralNuevo(e.target.value)}
              placeholder="Nuevo API"
              className="rounded-lg border border-indigo-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="button"
              onClick={onCambioApis}
              className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700"
            >
              Cambio
            </button>
          </div>
          {apiEnPluralMsg && <p className={`text-sm ${apiEnPluralMsg.type==="ok"?"text-green-700":"text-red-700"}`}>{apiEnPluralMsg.text}</p>}
        </div>
      </div>
    )}

    {menu === "exportar" && (
      <div>
        <h2 className="text-lg font-semibold mb-4">Exportar</h2>
        <p className="text-sm text-gray-700 mb-4">¿Deseas exportar los datos con la configuración seleccionada?</p>
        <div className="flex gap-3">
          <button onClick={()=>onConfirmExport(true)} className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">Sí, exportar</button>
          <button onClick={()=>onConfirmExport(false)} className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50">No, cancelar</button>
        </div>
      </div>
    )}

    {menu === "cerrar" && (
      <div>
        <h2 className="text-lg font-semibold mb-4">Cerrar Sesión</h2>
        <p className="text-sm text-gray-700 mb-4">¿Seguro que quieres cerrar sesión?</p>
        <div className="flex gap-3">
          <button onClick={logout} className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">Sí</button>
          <button onClick={()=>setMenu("formatoImport")} className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50">No</button>
        </div>
      </div>
    )}

  </div>

  {/* Resumen inferior */}
  <div className="bg-indigo-100/90 rounded-2xl shadow p-6 border border-indigo-200 mt-8">
    <h3 className="text-base font-semibold text-indigo-800 mb-3">Resumen de selección</h3>
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
      <SummaryItem label="Formato Importación" value={formatoImport ?? "—"} />
      <SummaryItem label="Formato Exportación" value={formatoExport ?? "—"} />
      <SummaryItem label="Empresa" value={empresa ?? "—"} />
      <SummaryItem label="Fecha factura" value={fmtFecha(fechaFactura)} />
      <SummaryItem label="Proyecto" value={proyecto ?? "—"} />
      <SummaryItem label="Cuenta contable" value={cuenta === "Otra (introducir)" ? (cuentaOtra || "—") : (cuenta ?? "—")} />
      <SummaryItem label="Fichero" value={ficheroNombre || "—"} />
    </div>
  </div>
</section>
