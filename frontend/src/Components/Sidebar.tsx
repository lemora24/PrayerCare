
import { useEffect, useState } from 'react'
import {
  ArrowUpRight,
  BookHeart,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Church,
  HeartHandshake,
  LayoutDashboard,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Sparkles,
  UsersRound,
  Waves,
  X,
} from 'lucide-react'
import { NavLink, useLocation } from 'react-router-dom'


const navigation = [
  {
    label: 'Mi espacio',
    description: 'Dashboard',
    icon: LayoutDashboard,
    path: '/',
  },
  {
    label: 'Personas',
    description: 'A quienes acompaño',
    icon: UsersRound,
    path: '/personas',
  },
  {
    label: 'Peticiones',
    description: 'Lo que entrego',
    icon: BookHeart,
    path: '/peticiones',
  },
  {
    label: 'Mi agenda',
    description: 'Momentos de oración',
    icon: CalendarDays,
    path: '/agenda',
  },
  {
    label: 'Mis comunidades',
    description: 'Caminamos juntos',
    icon: Church,
    path: '/comunidades',
  },
]


export default function Sidebar() {
  const location = useLocation()

  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  // CERRAR MENÚ MÓVIL AL CAMBIAR DE RUTA
  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  // BLOQUEAR SCROLL CUANDO EL MENÚ MÓVIL ESTÁ ABIERTO
  useEffect(() => {
    if (!mobileOpen) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [mobileOpen])

  return (
    <>
      {/* BOTÓN PARA ABRIR MENÚ EN MÓVIL */}
      <button
        type="button"
        aria-label="Abrir menú de navegación"
        aria-expanded={mobileOpen}
        onClick={() => setMobileOpen(true)}
        className="fixed bottom-5 left-5 z-40 flex h-14 w-14 items-center justify-center rounded-full border border-white/70 bg-[#526e82] text-white shadow-[0_15px_35px_rgba(38,61,80,0.25)] transition hover:scale-105 lg:hidden"
      >
        <Menu size={24} />
      </button>

      {/* FONDO OSCURO DEL MENÚ MÓVIL */}
      {mobileOpen && (
        <button
          type="button"
          aria-label="Cerrar menú de navegación"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-[#263d50]/45 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex flex-col
          border-r border-[#526e82]/10
          bg-[#f8f5f0]/95
          shadow-[15px_0_55px_rgba(38,61,80,0.04)]
          backdrop-blur-xl
          transition-[width,transform] duration-300 ease-out
          lg:sticky lg:top-0 lg:h-screen lg:translate-x-0
          ${
            mobileOpen
              ? 'translate-x-0'
              : '-translate-x-full'
          }
          ${collapsed ? 'w-[92px]' : 'w-[290px]'}
        `}
      >
        {/* LOGO */}
        <div
          className={`
            flex min-h-[112px] items-center
            border-b border-[#526e82]/10
            ${collapsed ? 'justify-center px-3' : 'justify-between px-7'}
          `}
        >
          <NavLink
            to="/"
            onClick={() => setMobileOpen(false)}
            className="flex min-w-0 items-center gap-3"
            aria-label="Ir al inicio de PrayerCare"
          >
            <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px] bg-gradient-to-br from-[#526e82] to-[#8fa8ba] text-white shadow-[0_10px_25px_rgba(82,110,130,0.22)]">
              <Waves size={25} strokeWidth={1.7} />

              <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-[3px] border-[#f8f5f0] bg-[#c99c73]" />
            </div>

            {!collapsed && (
              <div className="min-w-0">
                <h1 className="font-display text-[29px] font-semibold leading-none tracking-tight text-[#263d50]">
                  PrayerCare
                </h1>

                <p className="mt-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8394a3]">
                  Surrender
                </p>
              </div>
            )}
          </NavLink>

          {/* CERRAR MÓVIL */}
          <button
            type="button"
            aria-label="Cerrar menú"
            onClick={() => setMobileOpen(false)}
            className="rounded-xl p-2 text-[#526e82] hover:bg-white/80 lg:hidden"
          >
            <X size={22} />
          </button>
        </div>

        {/* TEXTO DE SECCIÓN */}
        {!collapsed && (
          <div className="px-7 pb-4 pt-9">
            <p className="pc-eyebrow">
              TU REFUGIO DIGITAL
            </p>

            <p className="mt-2 text-xs leading-6 text-[#8394a3]">
              Un espacio para entregar,
              <br />
              confiar y recordar.
            </p>
          </div>
        )}

        {/* NAVEGACIÓN */}
        <nav
          aria-label="Navegación principal"
          className={`flex-1 space-y-2 overflow-y-auto px-4 ${
            collapsed ? 'pt-8' : 'pt-3'
          }`}
        >
          {navigation.map(
            ({ label, description, icon: Icon, path }) => (
              <NavLink
                key={path}
                to={path}
                end={path === '/'}
                title={collapsed ? label : undefined}
                aria-label={collapsed ? label : undefined}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `
                    group relative flex min-h-[62px]
                    items-center rounded-2xl
                    transition-all duration-300
                    ${
                      collapsed
                        ? 'justify-center px-2'
                        : 'gap-4 px-4'
                    }
                    ${
                      isActive
                        ? 'bg-white text-[#263d50] shadow-[0_8px_30px_rgba(38,61,80,0.07)] ring-1 ring-[#526e82]/10'
                        : 'text-[#718394] hover:bg-white/70 hover:text-[#263d50]'
                    }
                  `
                }
              >
                {({ isActive }) => (
                  <>
                    {/* INDICADOR ACTIVO */}
                    {isActive && (
                      <span className="absolute -left-4 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-[#526e82]" />
                    )}

                    <div
                      className={`
                        flex h-10 w-10 shrink-0 items-center justify-center
                        rounded-xl transition-colors
                        ${
                          isActive
                            ? 'bg-[#dce9e9] text-[#526e82]'
                            : 'text-[#8394a3] group-hover:bg-[#dce9e9]/60 group-hover:text-[#526e82]'
                        }
                      `}
                    >
                      <Icon size={20} strokeWidth={1.8} />
                    </div>

                    {!collapsed && (
                      <>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold">
                            {label}
                          </p>

                          <p className="mt-0.5 text-[11px] text-[#97a4af]">
                            {description}
                          </p>
                        </div>

                        {isActive && (
                          <ChevronRight
                            size={17}
                            className="text-[#8fa8ba]"
                          />
                        )}
                      </>
                    )}
                  </>
                )}
              </NavLink>
            ),
          )}
        </nav>

        {/* VERSÍCULO */}
        {!collapsed && (
          <div className="mx-4 mb-5 overflow-hidden rounded-[24px] bg-gradient-to-br from-[#dce9e9] via-[#e8e8ee] to-[#f5e5d8] p-5">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/60 text-[#526e82]">
                <Sparkles size={18} />
              </div>

              <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#718394]">
                1 Pedro 5:7
              </span>
            </div>

            <p className="font-display text-[25px] font-medium leading-[1.15] text-[#263d50]">
              Él tiene cuidado
              <br />
              de vosotros.
            </p>

            <div className="mt-5 flex items-center gap-2 text-xs font-medium text-[#526e82]">
              <HeartHandshake size={15} />
              Nunca estás solo.
            </div>
          </div>
        )}

        {/* CONTROLES INFERIORES */}
        <div
          className={`
            border-t border-[#526e82]/10 py-5
            ${collapsed ? 'px-3' : 'px-5'}
          `}
        >
          {/* CONTRAER SIDEBAR */}
          <button
            type="button"
            onClick={() => setCollapsed((current) => !current)}
            title={collapsed ? 'Expandir menú' : 'Contraer menú'}
            aria-label={collapsed ? 'Expandir menú' : 'Contraer menú'}
            className={`
              hidden w-full items-center rounded-xl
              px-3 py-3 text-sm font-medium text-[#718394]
              transition hover:bg-white hover:text-[#263d50]
              lg:flex
              ${collapsed ? 'justify-center' : 'gap-3'}
            `}
          >
            {collapsed ? (
              <PanelLeftOpen size={19} />
            ) : (
              <>
                <PanelLeftClose size={19} />
                <span>Contraer menú</span>
                <ChevronLeft size={16} className="ml-auto" />
              </>
            )}
          </button>

          {/* FIRMA */}
          {!collapsed && (
            <div className="mt-3 flex items-center justify-between px-3">
              <span className="text-[10px] font-medium tracking-wide text-[#9aa8b2]">
                Made with faith & care
              </span>

              <ArrowUpRight
                size={14}
                className="text-[#a8b9d0]"
              />
            </div>
          )}
        </div>
      </aside>
    </>
  )
}
