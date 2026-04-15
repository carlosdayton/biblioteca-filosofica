import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLocalQuotes, useLocalTags } from '../hooks/useLocalQuotes'
import QuoteCard from '../components/QuoteCard'
import PageHeader from '../components/PageHeader'
import SkeletonCard from '../components/SkeletonCard'
import { colors, fonts, shadows, gradients, transitions } from '../styles/theme'

type SortOption = 'date-desc' | 'date-asc' | 'author-asc' | 'author-desc'

export default function QuoteListPage() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<SortOption>('date-desc')

  // Carregar todas as citações de uma vez para filtro e paginação no cliente
  const { data: allData, isLoading, isError } = useLocalQuotes(1, 500)
  const { data: tags = [] } = useLocalTags()

  const PAGE_SIZE = 20

  // Filtrar por tag
  const afterFilter = selectedTag
    ? (allData?.items ?? []).filter(q => q.tags.some(t => t.id === selectedTag))
    : (allData?.items ?? [])

  // Ordenar
  const sorted = [...afterFilter].sort((a, b) => {
    switch (sortBy) {
      case 'date-desc': return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      case 'date-asc':  return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      case 'author-asc':  return a.author.localeCompare(b.author)
      case 'author-desc': return b.author.localeCompare(a.author)
      default: return 0
    }
  })

  // Paginar no cliente
  const totalFiltered = sorted.length
  const totalPages = Math.max(1, Math.ceil(totalFiltered / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const filtered = sorted.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  // Resetar para página 1 ao mudar filtro ou ordenação
  const handleTagChange = (tag: string | null) => {
    setSelectedTag(tag)
    setPage(1)
  }
  const handleSortChange = (sort: SortOption) => {
    setSortBy(sort)
    setPage(1)
  }

  return (
    <div style={{ minHeight: '100vh', background: gradients.page }}>
      <PageHeader
        title="Acervo de Citações"
        subtitle={allData ? `${totalFiltered} citação${totalFiltered !== 1 ? 'ões' : ''} ${selectedTag ? 'encontradas' : 'registradas'}` : undefined}
      />

      <div style={{ maxWidth: 840, margin: '0 auto', padding: '36px 24px 80px' }}>
        {/* Toolbar with enhanced styling */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: 24, 
          flexWrap: 'wrap', 
          gap: 16 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
            {totalPages > 1 && (
              <div style={{ 
                fontFamily: fonts.sans, 
                fontSize: 13, 
                color: colors.brownLight,
                padding: '6px 14px',
                background: colors.goldFaint,
                borderRadius: 20,
                border: `1px solid ${colors.gold}44`,
              }}>
                Página {currentPage} de {totalPages}
              </div>
            )}
            {/* Sort dropdown with enhanced styling */}
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value as SortOption)}
              style={{
                padding: '8px 16px', 
                borderRadius: 10,
                fontFamily: fonts.sans, 
                fontSize: 13,
                fontWeight: 600,
                border: `2px solid ${colors.parchmentDeep}`,
                background: colors.creamWarm, 
                color: colors.brownMid,
                cursor: 'pointer',
                transition: `all ${transitions.fast}`,
                outline: 'none',
              }}
              onFocus={(e) => {
                (e.currentTarget as HTMLSelectElement).style.borderColor = colors.gold
                ;(e.currentTarget as HTMLSelectElement).style.boxShadow = shadows.inputFocus
              }}
              onBlur={(e) => {
                (e.currentTarget as HTMLSelectElement).style.borderColor = colors.parchmentDeep
                ;(e.currentTarget as HTMLSelectElement).style.boxShadow = 'none'
              }}
            >
              <option value="date-desc">Mais recentes</option>
              <option value="date-asc">Mais antigas</option>
              <option value="author-asc">Autor (A-Z)</option>
              <option value="author-desc">Autor (Z-A)</option>
            </select>
          </div>
          <div style={{ marginLeft: 'auto' }}>
            <button onClick={() => navigate('/quotes/new')} style={{
              padding: '12px 28px',
              background: gradients.goldRich,
              border: 'none', 
              borderRadius: 10,
              fontFamily: fonts.sans, 
              fontSize: 14, 
              fontWeight: 700,
              color: colors.brown, 
              cursor: 'pointer',
              boxShadow: shadows.cardGold, 
              letterSpacing: '0.04em',
              transition: `all ${transitions.normal}`,
            }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px) scale(1.02)'
                ;(e.currentTarget as HTMLButtonElement).style.boxShadow = shadows.cardGoldHover
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.transform = 'none'
                ;(e.currentTarget as HTMLButtonElement).style.boxShadow = shadows.cardGold
              }}
            >
              + Nova Citação
            </button>
          </div>
        </div>

        {/* Tag filter with enhanced styling */}
        {tags.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 28 }}>
            <button
              onClick={() => handleTagChange(null)}
              style={{
                padding: '7px 18px', 
                borderRadius: 24, 
                cursor: 'pointer',
                fontFamily: fonts.sans, 
                fontSize: 13, 
                fontWeight: 700,
                letterSpacing: '0.05em', 
                transition: `all ${transitions.normal}`,
                background: !selectedTag ? gradients.goldRich : colors.parchment,
                border: `2px solid ${!selectedTag ? colors.gold : colors.parchmentDeep}`,
                color: !selectedTag ? colors.brown : colors.brownLight,
                boxShadow: !selectedTag ? shadows.cardGold : 'none',
              }}
              onMouseEnter={(e) => {
                if (selectedTag) {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = colors.gold + '66'
                  ;(e.currentTarget as HTMLButtonElement).style.background = colors.goldFaint
                }
              }}
              onMouseLeave={(e) => {
                if (selectedTag) {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = colors.parchmentDeep
                  ;(e.currentTarget as HTMLButtonElement).style.background = colors.parchment
                }
              }}
            >
              Todas
            </button>
            {tags.map(tag => {
              const active = selectedTag === tag.id
              return (
                <button
                  key={tag.id}
                  onClick={() => handleTagChange(active ? null : tag.id)}
                  style={{
                    padding: '7px 18px', 
                    borderRadius: 24, 
                    cursor: 'pointer',
                    fontFamily: fonts.sans, 
                    fontSize: 13, 
                    fontWeight: 700,
                    letterSpacing: '0.05em', 
                    transition: `all ${transitions.normal}`,
                    background: active ? tag.color + '35' : colors.parchment,
                    border: `2px solid ${active ? tag.color : colors.parchmentDeep}`,
                    color: active ? tag.color : colors.brownLight,
                    boxShadow: active ? `0 2px 8px ${tag.color}33` : 'none',
                  }}
                  onMouseEnter={(e) => {
                    if (!active) {
                      (e.currentTarget as HTMLButtonElement).style.borderColor = tag.color + '66'
                      ;(e.currentTarget as HTMLButtonElement).style.background = tag.color + '15'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      (e.currentTarget as HTMLButtonElement).style.borderColor = colors.parchmentDeep
                      ;(e.currentTarget as HTMLButtonElement).style.background = colors.parchment
                    }
                  }}
                >
                  {tag.name}
                  {tag.quoteCount > 0 && (
                    <span style={{ 
                      marginLeft: 7, 
                      opacity: 0.7, 
                      fontSize: 11,
                      padding: '1px 6px',
                      background: active ? 'rgba(255,255,255,0.3)' : tag.color + '22',
                      borderRadius: 10,
                    }}>
                      {tag.quoteCount}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        )}

        {/* States */}
        {isLoading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
          </div>
        )}
        {isError && <ErrorState />}
        {!isLoading && filtered.length === 0 && allData && (
          <EmptyState onNew={() => navigate('/quotes/new')} filtered={!!selectedTag} onClear={() => handleTagChange(null)} />
        )}

        {/* List with fade-in animation */}
        {filtered.length > 0 && (
          <>
            <style>{`
              @keyframes card-in {
                from { opacity: 0; transform: translateY(12px); }
                to   { opacity: 1; transform: translateY(0); }
              }
            `}</style>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {filtered.map((quote, i) => (
                <div key={quote.id} style={{
                  animation: `card-in 0.3s ease both`,
                  animationDelay: `${i * 40}ms`,
                }}>
                  <QuoteCard quote={quote} />
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6, marginTop: 40 }}>
                <PageBtn onClick={() => setPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>← Anterior</PageBtn>
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  const p = totalPages <= 7 ? i + 1 : currentPage <= 4 ? i + 1 : currentPage >= totalPages - 3 ? totalPages - 6 + i : currentPage - 3 + i
                  return (
                    <button key={p} onClick={() => setPage(p)} style={{
                      width: 36, height: 36, borderRadius: 8,
                      border: `1px solid ${p === currentPage ? colors.gold : colors.parchmentDeep}`,
                      background: p === currentPage ? gradients.gold : 'transparent',
                      color: p === currentPage ? colors.cream : colors.brownMid,
                      fontFamily: fonts.sans, fontSize: 13, fontWeight: p === currentPage ? 700 : 400,
                      cursor: 'pointer', transition: 'all 0.15s',
                    }}>{p}</button>
                  )
                })}
                <PageBtn onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Próxima →</PageBtn>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function PageBtn({ onClick, disabled, children }: { onClick: () => void; disabled: boolean; children: React.ReactNode }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      padding: '8px 16px', background: 'transparent',
      border: `1px solid ${disabled ? colors.parchmentDeep : colors.gold}`,
      borderRadius: 8, fontFamily: fonts.sans, fontSize: 13,
      color: disabled ? colors.brownLight : colors.brownMid,
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.4 : 1, transition: 'all 0.15s',
    }}>{children}</button>
  )
}

function ErrorState() {
  return (
    <div style={{
      textAlign: 'center', padding: '40px 32px',
      background: colors.errorBg, border: `1px solid ${colors.error}33`,
      borderRadius: 12, color: colors.error, fontFamily: fonts.sans, fontSize: 14,
    }}>
      ⚠️ Erro ao carregar citações. Verifique a conexão com o servidor.
    </div>
  )
}

function EmptyState({ onNew, filtered, onClear }: { onNew: () => void; filtered: boolean; onClear: () => void }) {
  return (
    <div style={{
      textAlign: 'center', padding: '72px 40px',
      background: gradients.card, border: `1px dashed ${colors.gold}66`,
      borderRadius: 16,
    }}>
      <div style={{ fontSize: 48, marginBottom: 20, opacity: 0.5 }}>📜</div>
      {filtered ? (
        <>
          <p style={{ fontFamily: fonts.serif, fontSize: 22, color: colors.brownMid, fontStyle: 'italic', margin: '0 0 8px', lineHeight: 1.3 }}>
            Nenhuma citação com essa tag.
          </p>
          <button onClick={onClear} style={{
            marginTop: 16, padding: '8px 22px', background: 'transparent',
            border: `1px solid ${colors.gold}`, borderRadius: 8,
            fontFamily: fonts.sans, fontSize: 13, color: colors.goldDark, cursor: 'pointer',
          }}>
            Ver todas
          </button>
        </>
      ) : (
        <>
          <p style={{ fontFamily: fonts.serif, fontSize: 24, color: colors.brownMid, fontStyle: 'italic', margin: '0 0 8px', lineHeight: 1.3 }}>
            Nenhuma citação registrada ainda.
          </p>
          <p style={{ fontFamily: fonts.sans, fontSize: 14, color: colors.brownLight, margin: '0 0 24px' }}>
            Comece adicionando sua primeira reflexão filosófica.
          </p>
          <button onClick={onNew} style={{
            padding: '10px 28px', background: gradients.gold,
            border: 'none', borderRadius: 8, fontFamily: fonts.sans,
            fontSize: 14, fontWeight: 700, color: colors.cream, cursor: 'pointer',
          }}>
            + Adicionar citação
          </button>
        </>
      )}
    </div>
  )
}
