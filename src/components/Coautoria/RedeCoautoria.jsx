import React, { useEffect, useMemo, useState } from 'react';
import docentes from '../../data/docentes.json';
import producoes from '../../data/producoes.json';
import {
  buildCoauthorshipGraph,
  getCoauthorshipYears,
} from '../../utils/coautoriaDataProcessor';
import './RedeCoautoria.css';

const LARGURA = 1000;
const ALTURA = 650;
const PARTICULAS = new Set(['da', 'das', 'de', 'do', 'dos', 'e']);

const formatarNome = (nome = '') => nome
  .trim()
  .split(/\s+/)
  .map((parte, indice) => (
    indice > 0 && PARTICULAS.has(parte.toLocaleLowerCase('pt-BR'))
      ? parte.toLocaleLowerCase('pt-BR')
      : `${parte.charAt(0).toLocaleUpperCase('pt-BR')}${parte.slice(1).toLocaleLowerCase('pt-BR')}`
  ))
  .join(' ');

const nomeCurto = (nome = '') => {
  const partes = formatarNome(nome).split(' ').filter((parte) => !PARTICULAS.has(parte));
  if (partes.length < 2) return partes[0] || nome;
  return `${partes[0]} ${partes[partes.length - 1]}`;
};

const calcularLayout = (nos, arestas) => {
  if (nos.length === 0) return new Map();

  const centroX = LARGURA / 2;
  const centroY = ALTURA / 2;
  const raio = Math.min(LARGURA, ALTURA) * 0.37;
  const pontos = nos.map((no, indice) => {
    const angulo = (2 * Math.PI * indice) / nos.length - Math.PI / 2;
    return {
      id: no.id,
      x: centroX + Math.cos(angulo) * raio,
      y: centroY + Math.sin(angulo) * raio,
      vx: 0,
      vy: 0,
    };
  });
  const porId = new Map(pontos.map((ponto) => [ponto.id, ponto]));

  for (let iteracao = 0; iteracao < 280; iteracao += 1) {
    for (let i = 0; i < pontos.length; i += 1) {
      for (let j = i + 1; j < pontos.length; j += 1) {
        const a = pontos[i];
        const b = pontos[j];
        const dx = b.x - a.x || 0.01;
        const dy = b.y - a.y || 0.01;
        const distanciaQuadrada = Math.max(dx * dx + dy * dy, 400);
        const distancia = Math.sqrt(distanciaQuadrada);
        const forca = 9200 / distanciaQuadrada;
        const fx = (dx / distancia) * forca;
        const fy = (dy / distancia) * forca;
        a.vx -= fx;
        a.vy -= fy;
        b.vx += fx;
        b.vy += fy;
      }
    }

    arestas.forEach((aresta) => {
      const source = porId.get(aresta.source);
      const target = porId.get(aresta.target);
      if (!source || !target) return;
      const dx = target.x - source.x;
      const dy = target.y - source.y;
      const distancia = Math.max(Math.sqrt(dx * dx + dy * dy), 1);
      const distanciaIdeal = 155;
      const forca = (distancia - distanciaIdeal) * 0.0035 * (1 + Math.log1p(aresta.peso));
      const fx = (dx / distancia) * forca;
      const fy = (dy / distancia) * forca;
      source.vx += fx;
      source.vy += fy;
      target.vx -= fx;
      target.vy -= fy;
    });

    pontos.forEach((ponto) => {
      ponto.vx += (centroX - ponto.x) * 0.0015;
      ponto.vy += (centroY - ponto.y) * 0.0015;
      ponto.vx *= 0.82;
      ponto.vy *= 0.82;
      ponto.x = Math.max(65, Math.min(LARGURA - 65, ponto.x + ponto.vx));
      ponto.y = Math.max(55, Math.min(ALTURA - 55, ponto.y + ponto.vy));
    });
  }

  return new Map(pontos.map(({ id, x, y }) => [id, { x, y }]));
};

const RedeCoautoria = () => {
  const anos = useMemo(() => getCoauthorshipYears(producoes), []);
  const [anoInicial, setAnoInicial] = useState(anos[0]);
  const [anoFinal, setAnoFinal] = useState(anos[anos.length - 1]);
  const [natureza, setNatureza] = useState('todas');
  const [pesoMinimo, setPesoMinimo] = useState(1);
  const [docenteSelecionado, setDocenteSelecionado] = useState('');
  const [arestaSelecionada, setArestaSelecionada] = useState('');

  const grafoCompleto = useMemo(() => buildCoauthorshipGraph({
    docentes,
    producoes,
    anoInicial,
    anoFinal,
    natureza,
  }), [anoInicial, anoFinal, natureza]);

  const maiorPeso = Math.max(1, ...grafoCompleto.arestas.map((aresta) => aresta.peso));

  const grafo = useMemo(() => buildCoauthorshipGraph({
    docentes,
    producoes,
    anoInicial,
    anoFinal,
    natureza,
    pesoMinimo,
  }), [anoInicial, anoFinal, natureza, pesoMinimo]);

  const nosPorId = useMemo(
    () => new Map(grafo.nos.map((no) => [no.id, no])),
    [grafo.nos]
  );
  const posicoes = useMemo(
    () => calcularLayout(grafo.nos, grafo.arestas),
    [grafo.nos, grafo.arestas]
  );
  const arestaAtiva = grafo.arestas.find((aresta) => aresta.id === arestaSelecionada);
  const noAtivo = nosPorId.get(docenteSelecionado);

  const vizinhos = useMemo(() => {
    if (!docenteSelecionado) return [];
    return grafo.arestas
      .filter((aresta) => aresta.source === docenteSelecionado || aresta.target === docenteSelecionado)
      .map((aresta) => ({
        ...aresta,
        docente: nosPorId.get(
          aresta.source === docenteSelecionado ? aresta.target : aresta.source
        ),
      }))
      .sort((a, b) => b.peso - a.peso);
  }, [docenteSelecionado, grafo.arestas, nosPorId]);

  const idsDestacados = useMemo(() => {
    if (arestaAtiva) return new Set([arestaAtiva.source, arestaAtiva.target]);
    if (!docenteSelecionado) return new Set();
    return new Set([
      docenteSelecionado,
      ...vizinhos.map((item) => item.docente.id),
    ]);
  }, [arestaAtiva, docenteSelecionado, vizinhos]);

  // Alterações nos filtros invalidam a colaboração selecionada, pois a aresta
  // pode deixar de existir no novo recorte da rede.
  useEffect(() => {
    setArestaSelecionada('');
    if (pesoMinimo > maiorPeso) setPesoMinimo(maiorPeso);
  }, [anoInicial, anoFinal, natureza, pesoMinimo, maiorPeso]);

  // A troca entre a visão de um docente e os detalhes de uma colaboração não
  // deve limpar a aresta recém-selecionada.
  useEffect(() => {
    if (docenteSelecionado && !nosPorId.has(docenteSelecionado)) {
      setDocenteSelecionado('');
    }
  }, [docenteSelecionado, nosPorId]);

  const selecionarNo = (id) => {
    setDocenteSelecionado((atual) => (atual === id ? '' : id));
    setArestaSelecionada('');
  };

  const selecionarAresta = (id) => {
    setArestaSelecionada((atual) => (atual === id ? '' : id));
    setDocenteSelecionado('');
  };

  const estaDestacada = (aresta) => (
    arestaSelecionada === aresta.id
    || (docenteSelecionado
      && (aresta.source === docenteSelecionado || aresta.target === docenteSelecionado))
  );

  return (
    <main className="rede-container">
      <header className="rede-header">
        <div>
          <h1>Rede de Coautoria</h1>
          <p>Colaborações em produções integradas entre os docentes do PPGCC.</p>
        </div>
      </header>

      <section className="rede-filtros" aria-label="Filtros da rede">
        <label>
          Ano inicial
          <select
            value={anoInicial}
            onChange={(evento) => {
              const ano = Number(evento.target.value);
              setAnoInicial(ano);
              if (ano > anoFinal) setAnoFinal(ano);
            }}
          >
            {anos.map((ano) => <option value={ano} key={ano}>{ano}</option>)}
          </select>
        </label>
        <label>
          Ano final
          <select
            value={anoFinal}
            onChange={(evento) => {
              const ano = Number(evento.target.value);
              setAnoFinal(ano);
              if (ano < anoInicial) setAnoInicial(ano);
            }}
          >
            {anos.map((ano) => <option value={ano} key={ano}>{ano}</option>)}
          </select>
        </label>
        <label>
          Natureza
          <select value={natureza} onChange={(evento) => setNatureza(evento.target.value)}>
            <option value="todas">Todas</option>
            <option value="bibliografica">Bibliográfica</option>
            <option value="tecnica">Técnica</option>
          </select>
        </label>
        <label>
          Docente em destaque
          <select
            value={docenteSelecionado}
            onChange={(evento) => selecionarNo(evento.target.value)}
          >
            <option value="">Todos os docentes</option>
            {[...grafo.nos]
              .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
              .map((no) => <option value={no.id} key={no.id}>{formatarNome(no.nome)}</option>)}
          </select>
        </label>
        <label className="filtro-peso">
          Mínimo de produções: <strong>{pesoMinimo}</strong>
          <input
            type="range"
            min="1"
            max={maiorPeso}
            value={Math.min(pesoMinimo, maiorPeso)}
            onChange={(evento) => setPesoMinimo(Number(evento.target.value))}
          />
        </label>
      </section>

      <section className="rede-estatisticas" aria-label="Resumo da rede filtrada">
        <article><strong>{grafo.estatisticas.docentesConectados}</strong><span>docentes conectados</span></article>
        <article><strong>{grafo.estatisticas.paresCoautoria}</strong><span>pares de coautoria</span></article>
        <article><strong>{grafo.estatisticas.producoesComCoautoria}</strong><span>produções compartilhadas</span></article>
        <article><strong>{grafo.estatisticas.totalVinculos}</strong><span>vínculos ponderados</span></article>
      </section>

      <div className="rede-conteudo">
        <section className="rede-grafo-card">
          <div className="rede-grafo-topo">
            <div className="rede-grafo-instrucao">Clique em um docente ou em uma ligação para ver os detalhes.</div>
          </div>
          <div className="rede-legenda" aria-label="Legenda da rede">
            <span><i className="legenda-cor legenda-cor--permanente" /> Permanente</span>
            <span><i className="legenda-cor legenda-cor--colaborador" /> Colaborador</span>
          </div>
          <svg
            className="rede-grafo"
            viewBox={`0 0 ${LARGURA} ${ALTURA}`}
            role="img"
            aria-label={`Rede com ${grafo.estatisticas.docentesConectados} docentes conectados e ${grafo.arestas.length} ligações`}
            onClick={() => {
              setDocenteSelecionado('');
              setArestaSelecionada('');
            }}
          >
            <g className="rede-arestas">
              {grafo.arestas.map((aresta) => {
                const origem = posicoes.get(aresta.source);
                const destino = posicoes.get(aresta.target);
                const destacada = estaDestacada(aresta);
                const esmaecida = (docenteSelecionado || arestaSelecionada) && !destacada;
                if (!origem || !destino) return null;
                return (
                  <g key={aresta.id}>
                    <line
                      className={`rede-aresta ${destacada ? 'rede-aresta--ativa' : ''} ${esmaecida ? 'rede-aresta--esmaecida' : ''}`}
                      x1={origem.x}
                      y1={origem.y}
                      x2={destino.x}
                      y2={destino.y}
                      style={{ strokeWidth: Math.min(12, 1.2 + Math.sqrt(aresta.peso) * 1.25) }}
                    />
                    <line
                      className="rede-aresta-alvo"
                      x1={origem.x}
                      y1={origem.y}
                      x2={destino.x}
                      y2={destino.y}
                      onClick={(evento) => {
                        evento.stopPropagation();
                        selecionarAresta(aresta.id);
                      }}
                    >
                      <title>{`${formatarNome(nosPorId.get(aresta.source)?.nome)} × ${formatarNome(nosPorId.get(aresta.target)?.nome)}: ${aresta.peso} produção(ões)`}</title>
                    </line>
                  </g>
                );
              })}
            </g>

            <g className="rede-nos">
              {grafo.nos.map((no) => {
                const posicao = posicoes.get(no.id);
                const selecionado = no.id === docenteSelecionado || idsDestacados.has(no.id);
                const esmaecido = idsDestacados.size > 0 && !idsDestacados.has(no.id);
                const raio = 13 + Math.min(13, Math.sqrt(no.pesoTotal) * 1.25);
                return (
                  <g
                    key={no.id}
                    className={`rede-no ${selecionado ? 'rede-no--ativo' : ''} ${esmaecido ? 'rede-no--esmaecido' : ''}`}
                    transform={`translate(${posicao.x} ${posicao.y})`}
                    role="button"
                    tabIndex="0"
                    aria-label={`${formatarNome(no.nome)}, ${no.grau} coautores`}
                    onClick={(evento) => {
                      evento.stopPropagation();
                      selecionarNo(no.id);
                    }}
                    onKeyDown={(evento) => {
                      if (evento.key === 'Enter' || evento.key === ' ') selecionarNo(no.id);
                    }}
                  >
                    <circle
                      r={raio}
                      className={no.categoria === 'colaborador' ? 'rede-no-circulo--colaborador' : 'rede-no-circulo--permanente'}
                    >
                      <title>{`${formatarNome(no.nome)} — ${no.grau} coautores, ${no.pesoTotal} vínculos`}</title>
                    </circle>
                    <text y={raio + 17} textAnchor="middle">{nomeCurto(no.nome)}</text>
                  </g>
                );
              })}
            </g>
          </svg>
          {grafo.arestas.length === 0 && (
            <div className="rede-vazia">Nenhuma coautoria atende aos filtros selecionados.</div>
          )}
        </section>

        <aside className="rede-detalhes" aria-live="polite">
          {arestaAtiva && (
            <>
              <span className="detalhes-kicker">Colaboração selecionada</span>
              <h2>{nomeCurto(nosPorId.get(arestaAtiva.source)?.nome)} × {nomeCurto(nosPorId.get(arestaAtiva.target)?.nome)}</h2>
              <p className="detalhes-resumo"><strong>{arestaAtiva.peso}</strong> produções em conjunto no período.</p>
              <h3>Produções compartilhadas</h3>
              <ul className="detalhes-producoes">
                {[...arestaAtiva.producoes]
                  .sort((a, b) => b.ano - a.ano || a.titulo.localeCompare(b.titulo))
                  .map((producao) => (
                    <li key={producao.id}>
                      <span>{producao.ano}</span>
                      <p>{producao.titulo}</p>
                    </li>
                  ))}
              </ul>
            </>
          )}

          {!arestaAtiva && noAtivo && (
            <>
              <span className="detalhes-kicker">Docente selecionado</span>
              <h2>{formatarNome(noAtivo.nome)}</h2>
              <div className="detalhes-metricas">
                <div><strong>{noAtivo.grau}</strong><span>coautores</span></div>
                <div><strong>{noAtivo.pesoTotal}</strong><span>vínculos</span></div>
                <div><strong>{noAtivo.totalProducoes}</strong><span>produções</span></div>
              </div>
              <h3>Principais colaborações</h3>
              {vizinhos.length > 0 ? (
                <ul className="detalhes-colaboradores">
                  {vizinhos.map((item) => (
                    <li key={item.id}>
                      <button type="button" onClick={() => selecionarAresta(item.id)}>
                        <span>{formatarNome(item.docente.nome)}</span>
                        <strong>{item.peso}</strong>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : <p className="detalhes-vazio">Nenhuma colaboração atende ao peso mínimo.</p>}
            </>
          )}

          {!arestaAtiva && !noAtivo && (
            <>
              <span className="detalhes-kicker">Visão geral</span>
              <h2>Colaborações mais frequentes</h2>
              <p className="detalhes-intro">Selecione uma ligação para consultar as produções que a formam.</p>
              <ul className="detalhes-colaboradores">
                {grafo.arestas.slice(0, 10).map((aresta) => (
                  <li key={aresta.id}>
                    <button type="button" onClick={() => selecionarAresta(aresta.id)}>
                      <span>{nomeCurto(nosPorId.get(aresta.source)?.nome)} × {nomeCurto(nosPorId.get(aresta.target)?.nome)}</span>
                      <strong>{aresta.peso}</strong>
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </aside>
      </div>
    </main>
  );
};

export default RedeCoautoria;
