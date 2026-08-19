#!/usr/bin/env python3
"""Gera o relatório financeiro em HTML a partir de um snapshot JSON do Notion.

Uso:
    python3 gerar_relatorio.py dados/2026-08-19/edgar-pereira.json relatorios/relatorio-edgar-2026-08.html

O snapshot é a fonte auditável: todo número do relatório sai dele, sem
recálculo manual. Regenerar o relatório = capturar um snapshot novo e rodar
este script.
"""

import json
import sys
from datetime import date, datetime

MESES_CURTOS = ["jan", "fev", "mar", "abr", "mai", "jun",
                "jul", "ago", "set", "out", "nov", "dez"]
MESES_LONGOS = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
                "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"]

LOGO = ('<svg viewBox="0 0 32 32" width="30" height="30" aria-hidden="true">'
        '<rect x="4" y="6" width="11" height="11" rx="2" fill="#2F6DF0"></rect>'
        '<rect x="17" y="6" width="11" height="11" rx="5.5" fill="#2F6DF0" opacity="0.4"></rect>'
        '<rect x="4" y="19" width="24" height="7" rx="2" fill="#0A1A2F"></rect></svg>')


# ---------------------------------------------------------------- utilidades

def dia(iso):
    return date(int(iso[0:4]), int(iso[5:7]), int(iso[8:10]))


def rotulo_mes(mes, longo=False):
    a, m = mes.split("-")
    nome = MESES_LONGOS[int(m) - 1] if longo else MESES_CURTOS[int(m) - 1]
    return f"{nome}/{a[2:]}" if not longo else f"{nome}/{a}"


def brl(valor, sinal=False):
    s = f"{abs(valor):,.2f}".replace(",", "@").replace(".", ",").replace("@", ".")
    if valor < 0:
        return f"-R$ {s}"
    return (f"+R$ {s}" if sinal and valor > 0 else f"R$ {s}")


def esc(t):
    if t is None:
        return ""
    return (str(t).replace("&", "&amp;").replace("<", "&lt;")
            .replace(">", "&gt;").replace('"', "&quot;"))


def mes_seguinte(mes):
    a, m = int(mes[:4]), int(mes[5:])
    return f"{a + 1}-01" if m == 12 else f"{a}-{m + 1:02d}"


def intervalo(inicio, fim):
    meses, atual = [], inicio
    while atual <= fim:
        meses.append(atual)
        atual = mes_seguinte(atual)
    return meses


# ------------------------------------------------------------------- cálculo

def montar(snapshot, hoje):
    receber, pagar = snapshot["receber"], snapshot["pagar"]
    mes_atual = hoje.strftime("%Y-%m")

    todos = [r["vencimento"][:7] for r in receber] + [p["vencimento"][:7] for p in pagar]
    fim = max(todos + [mes_atual])
    # O snapshot pode trazer detalhe linha a linha só até certo mês; a projeção
    # para aí para não mostrar um mês pela metade.
    if snapshot.get("detalhe_ate"):
        fim = min(fim, snapshot["detalhe_ate"])
    meses = intervalo(min(todos + [mes_atual]), fim)
    receber = [r for r in receber if r["vencimento"][:7] <= fim]
    pagar = [p for p in pagar if p["vencimento"][:7] <= fim]

    linhas = {m: {"mes": m, "rotulo": rotulo_mes(m),
                  "entRe": 0.0, "saiRe": 0.0, "entPr": 0.0, "saiPr": 0.0,
                  "entAtraso": 0.0, "saiAtraso": 0.0} for m in meses}

    atrasos = []
    for r in receber:
        L = linhas[r["vencimento"][:7]]
        if r["status"] == "Recebido":
            L["entRe"] += r["valor"]
        else:
            L["entPr"] += r["valor"]
            if dia(r["vencimento"]) < hoje:
                L["entAtraso"] += r["valor"]
                atrasos.append({**r, "fluxo": "receber", "dias": (hoje - dia(r["vencimento"])).days})
    for p in pagar:
        L = linhas[p["vencimento"][:7]]
        if p["status"] == "Pago":
            L["saiRe"] += p["valor"]
        else:
            L["saiPr"] += p["valor"]
            if dia(p["vencimento"]) < hoje:
                L["saiAtraso"] += p["valor"]
                atrasos.append({**p, "fluxo": "pagar", "dias": (hoje - dia(p["vencimento"])).days})
    atrasos.sort(key=lambda a: -a["dias"])

    saldo_ini = snapshot["saldo_inicial"]["valor"]

    # Saldo de caixa realizado (só Pago/Recebido), acumulado mês a mês.
    saldo, caixa = saldo_ini, {}
    for m in meses:
        L = linhas[m]
        saldo += L["entRe"] - L["saiRe"]
        caixa[m] = saldo
    saldo_hoje = caixa[mes_atual]

    idx = meses.index(mes_atual)
    mes_ant = meses[idx - 1] if idx > 0 else None

    return {
        "meses": meses,
        "linhas": [linhas[m] for m in meses],
        "caixa": caixa,
        "mes_atual": mes_atual,
        "mes_anterior": mes_ant,
        "saldo_inicial": saldo_ini,
        "saldo_hoje": saldo_hoje,
        "saldo_mes_anterior": caixa[mes_ant] if mes_ant else saldo_ini,
        "atrasos": atrasos,
    }


# --------------------------------------------------------------------- blocos

def bloco_kpis(c, snap):
    L = {l["mes"]: l for l in c["linhas"]}[c["mes_atual"]]
    atras_ent = sum(a["valor"] for a in c["atrasos"] if a["fluxo"] == "receber")
    atras_sai = sum(a["valor"] for a in c["atrasos"] if a["fluxo"] == "pagar")
    projetado = c["saldo_hoje"] + L["entPr"] - L["saiPr"]
    resultado_comp = (L["entRe"] + L["entPr"]) - (L["saiRe"] + L["saiPr"])

    cards = [
        ("Saldo em caixa hoje", brl(c["saldo_hoje"]), c["saldo_hoje"] >= 0,
         f"Fecho de {rotulo_mes(c['mes_anterior'])}: {brl(c['saldo_mes_anterior'])}"),
        ("Projeção de fechamento do mês", brl(projetado), projetado >= 0,
         "Caixa de hoje + tudo que vence até o fim do mês"),
        ("Realizado no mês", brl(L["entRe"] - L["saiRe"], sinal=True), (L["entRe"] - L["saiRe"]) >= 0,
         f"Entradas {brl(L['entRe'])} · Saídas {brl(L['saiRe'])}"),
        ("Resultado do mês (competência)", brl(resultado_comp, sinal=True), resultado_comp >= 0,
         "Todo lançamento do mês, pago ou não"),
        ("A receber vencido", brl(atras_ent), atras_ent == 0,
         f"{len([a for a in c['atrasos'] if a['fluxo'] == 'receber'])} título(s) em atraso"),
        ("A pagar vencido", brl(atras_sai), atras_sai == 0,
         f"{len([a for a in c['atrasos'] if a['fluxo'] == 'pagar'])} título(s) em atraso"),
    ]
    out = ['<section class="kpis">']
    for titulo, valor, bom, nota in cards:
        cor = "pos" if bom else "neg"
        out.append(f'<article class="kpi"><h3>{esc(titulo)}</h3>'
                   f'<p class="kpi-valor {cor}">{esc(valor)}</p>'
                   f'<p class="kpi-nota">{esc(nota)}</p></article>')
    out.append("</section>")
    return "\n".join(out)


def bloco_atrasos(c):
    if not c["atrasos"]:
        return ('<section class="aviso ok"><strong>Nenhum título vencido.</strong> '
                'Tudo que venceu até a data do relatório está liquidado.</section>')
    linhas = []
    for a in c["atrasos"]:
        quem = a.get("inquilino") or a.get("cliente") or a.get("centro_custo") or ""
        rot = "A receber" if a["fluxo"] == "receber" else "A pagar"
        linhas.append(
            f'<tr><td><span class="tag {"tag-ent" if a["fluxo"] == "receber" else "tag-sai"}">{rot}</span></td>'
            f'<td>{esc(a["descricao"])}</td><td>{esc(quem)}</td>'
            f'<td class="num">{esc(dia(a["vencimento"]).strftime("%d/%m/%Y"))}</td>'
            f'<td class="num"><span class="atraso">{a["dias"]} d</span></td>'
            f'<td class="num forte">{esc(brl(a["valor"]))}</td></tr>')
    return f'''<section class="aviso alerta">
  <div class="aviso-topo"><strong>{len(c["atrasos"])} título(s) vencido(s)</strong>
  <span>posição em {c["hoje_br"]}</span></div>
  <table class="tabela compacta">
    <thead><tr><th></th><th>Descrição</th><th>Contraparte</th><th class="num">Vencimento</th><th class="num">Atraso</th><th class="num">Valor</th></tr></thead>
    <tbody>{"".join(linhas)}</tbody>
  </table>
</section>'''


def bloco_competencia(c, snap):
    linhas = []
    for L in c["linhas"]:
        ent = L["entRe"] + L["entPr"]
        sai = L["saiRe"] + L["saiPr"]
        res = ent - sai
        destaque = ' class="mes-atual"' if L["mes"] == c["mes_atual"] else ""
        linhas.append(
            f'<tr{destaque}><td>{esc(rotulo_mes(L["mes"], True))}</td>'
            f'<td class="num">{esc(brl(ent))}</td>'
            f'<td class="num">{esc(brl(sai))}</td>'
            f'<td class="num forte {"pos" if res >= 0 else "neg"}">{esc(brl(res, sinal=True))}</td></tr>')
    tot_ent = sum(l["entRe"] + l["entPr"] for l in c["linhas"])
    tot_sai = sum(l["saiRe"] + l["saiPr"] for l in c["linhas"])
    return f'''<table class="tabela">
  <thead><tr><th>Mês</th><th class="num">Receitas</th><th class="num">Custos</th><th class="num">Resultado</th></tr></thead>
  <tbody>{"".join(linhas)}</tbody>
  <tfoot><tr><td>Total do horizonte</td><td class="num">{esc(brl(tot_ent))}</td>
  <td class="num">{esc(brl(tot_sai))}</td>
  <td class="num forte {"pos" if tot_ent - tot_sai >= 0 else "neg"}">{esc(brl(tot_ent - tot_sai, sinal=True))}</td></tr></tfoot>
</table>'''


def bloco_composicao(c, snap, hoje):
    """Custos por centro de custo — realizado do ano corrente e previsto."""
    por_centro = {}
    for p in snap["pagar"]:
        chave = p.get("centro_custo") or "Sem centro"
        d = por_centro.setdefault(chave, {"pago": 0.0, "aberto": 0.0})
        d["pago" if p["status"] == "Pago" else "aberto"] += p["valor"]
    ordenado = sorted(por_centro.items(), key=lambda kv: -(kv[1]["pago"] + kv[1]["aberto"]))
    total = sum(v["pago"] + v["aberto"] for _, v in ordenado) or 1
    linhas = []
    for nome, v in ordenado:
        soma = v["pago"] + v["aberto"]
        pct = soma / total * 100
        linhas.append(
            f'<tr><td>{esc(nome)}</td>'
            f'<td class="num">{esc(brl(v["pago"]))}</td>'
            f'<td class="num">{esc(brl(v["aberto"]))}</td>'
            f'<td class="num forte">{esc(brl(soma))}</td>'
            f'<td class="barra-cel"><span class="barra" style="width:{pct:.1f}%"></span>'
            f'<span class="barra-num">{pct:.1f}%</span></td></tr>')
    return f'''<table class="tabela">
  <thead><tr><th>Centro de custo</th><th class="num">Pago</th><th class="num">Em aberto</th><th class="num">Total</th><th>Peso</th></tr></thead>
  <tbody>{"".join(linhas)}</tbody>
</table>'''


def bloco_lancamentos(c, snap, hoje):
    mes = c["mes_atual"]
    prox = mes_seguinte(mes)
    itens = []
    for r in snap["receber"]:
        if r["vencimento"][:7] in (mes, prox):
            itens.append(("Entrada", r["vencimento"], r["descricao"],
                          r.get("inquilino") or r.get("cliente") or "",
                          r["valor"], r["status"]))
    for p in snap["pagar"]:
        if p["vencimento"][:7] in (mes, prox):
            itens.append(("Saída", p["vencimento"], p["descricao"],
                          p.get("centro_custo") or "", -p["valor"], p["status"]))
    itens.sort(key=lambda i: i[1])

    linhas = []
    for tipo, venc, desc, quem, valor, status in itens:
        vencido = dia(venc) < hoje and status in ("A Receber", "A Pagar")
        classe = {"Recebido": "ok", "Pago": "ok"}.get(status, "atraso" if vencido else "aberto")
        rotulo_status = status + (" · vencido" if vencido else "")
        linhas.append(
            f'<tr data-mes="{venc[:7]}"><td><span class="tag {"tag-ent" if tipo == "Entrada" else "tag-sai"}">{tipo}</span></td>'
            f'<td class="num">{esc(dia(venc).strftime("%d/%m"))}</td>'
            f'<td>{esc(desc)}</td><td>{esc(quem)}</td>'
            f'<td class="num forte {"pos" if valor >= 0 else "neg"}">{esc(brl(valor, sinal=True))}</td>'
            f'<td><span class="pill {classe}">{esc(rotulo_status)}</span></td></tr>')
    return f'''<div class="filtro-linha">
  <label for="filtroMes">Mês</label>
  <select id="filtroMes">
    <option value="{mes}">{esc(rotulo_mes(mes, True))}</option>
    <option value="{prox}">{esc(rotulo_mes(prox, True))}</option>
    <option value="todos">Os dois</option>
  </select>
</div>
<table class="tabela" id="tabelaLancamentos">
  <thead><tr><th></th><th class="num">Venc.</th><th>Descrição</th><th>Contraparte</th><th class="num">Valor</th><th>Status</th></tr></thead>
  <tbody>{"".join(linhas)}</tbody>
</table>'''


# ----------------------------------------------------------------------- HTML

def gerar(snapshot, hoje):
    c = montar(snapshot, hoje)
    c["hoje_br"] = hoje.strftime("%d/%m/%Y")

    dados_js = json.dumps({
        "meses": [{k: (round(v, 2) if isinstance(v, float) else v) for k, v in L.items()}
                  for L in c["linhas"]],
        "saldoInicial": round(c["saldo_inicial"], 2),
        "mesAtual": c["mes_atual"],
        "saldoHoje": round(c["saldo_hoje"], 2),
    }, ensure_ascii=False)

    obs = "".join(f"<li>{esc(o)}</li>" for o in snapshot.get("observacoes", []))
    fontes = snapshot["fontes"]

    return f'''<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Relatório Financeiro — {esc(snapshot["titulo"])} — {esc(rotulo_mes(c["mes_atual"], True))}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Manrope:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
:root {{
  --blue-50:#EFF5FF; --blue-100:#DBE8FE; --blue-200:#BED4FD; --blue-400:#5F93F7;
  --blue-500:#2F6DF0; --blue-600:#1A52D6; --blue-800:#16326B; --navy:#0A1A2F;
  --gray-50:#F6F8FA; --gray-100:#ECF0F4; --gray-200:#DCE3EA; --gray-300:#C0CBD6;
  --gray-400:#8E9CAB; --gray-500:#6B7A8B; --gray-600:#4F5D6C; --gray-700:#3A4653;
  --gray-800:#27313C; --gray-900:#18202A;
  --success:#12876A; --success-bg:#E7F5F0; --warning:#C2760A; --warning-bg:#FDF3E3;
  --danger:#C7382E; --danger-bg:#FCEDEB;
  --radius-sm:6px; --radius-md:12px; --pill:999px;
  --shadow-sm:0 1px 2px rgba(10,26,47,.06), 0 2px 8px rgba(10,26,47,.04);
  --font-display:'Space Grotesk',sans-serif; --font-body:'Manrope',sans-serif; --font-mono:'IBM Plex Mono',monospace;
}}
* {{ box-sizing:border-box; }}
body {{ margin:0; background:var(--gray-50); color:var(--gray-800);
  font-family:var(--font-body); font-size:15px; line-height:1.5;
  -webkit-font-smoothing:antialiased; }}
.wrap {{ max-width:1080px; margin:0 auto; padding:24px 16px 64px; }}
h1,h2,h3 {{ font-family:var(--font-display); color:var(--navy); margin:0; }}
h1 {{ font-size:28px; font-weight:600; letter-spacing:-.4px; }}
h2 {{ font-size:20px; font-weight:600; margin-bottom:12px; }}
h3 {{ font-size:13.5px; font-weight:600; color:var(--gray-500); text-transform:uppercase; letter-spacing:.4px; }}
.num, .kpi-valor, td.num, .mono {{ font-family:var(--font-mono); font-variant-numeric:tabular-nums; }}
header.topo {{ display:flex; align-items:flex-start; justify-content:space-between;
  gap:16px; flex-wrap:wrap; padding-bottom:16px; border-bottom:1px solid var(--gray-200); margin-bottom:24px; }}
.marca {{ display:flex; align-items:center; gap:12px; }}
.marca .sub {{ font-size:13.5px; color:var(--gray-500); }}
.meta {{ text-align:right; font-size:13.5px; color:var(--gray-500); font-family:var(--font-mono); }}
.meta strong {{ color:var(--gray-700); }}
.kpis {{ display:grid; grid-template-columns:repeat(auto-fit,minmax(220px,1fr)); gap:12px; margin-bottom:24px; }}
.kpi {{ background:#fff; border:1px solid var(--gray-200); border-radius:var(--radius-md); padding:16px; box-shadow:var(--shadow-sm); }}
.kpi-valor {{ font-size:24px; font-weight:500; margin:8px 0 4px; letter-spacing:-.5px; }}
.kpi-nota {{ margin:0; font-size:13px; color:var(--gray-500); }}
.pos {{ color:var(--success); }} .neg {{ color:var(--danger); }}
.aviso {{ border-radius:var(--radius-md); padding:16px; margin-bottom:24px; border:1px solid; }}
.aviso.ok {{ background:var(--success-bg); border-color:#BFE3D8; color:#0C6350; }}
.aviso.alerta {{ background:var(--danger-bg); border-color:#F3C9C4; color:#8E2921; }}
.aviso-topo {{ display:flex; justify-content:space-between; align-items:baseline; gap:12px; margin-bottom:8px; font-size:14px; }}
.aviso-topo span {{ font-family:var(--font-mono); font-size:13px; opacity:.75; }}
.abas {{ display:flex; gap:4px; border-bottom:1px solid var(--gray-200); margin-bottom:16px; flex-wrap:wrap; }}
.aba {{ appearance:none; background:none; border:0; border-bottom:2px solid transparent; cursor:pointer;
  font-family:var(--font-body); font-size:14px; font-weight:600; color:var(--gray-500); padding:10px 12px; }}
.aba[aria-selected="true"] {{ color:var(--blue-600); border-bottom-color:var(--blue-500); }}
.painel[hidden] {{ display:none; }}
.card {{ background:#fff; border:1px solid var(--gray-200); border-radius:var(--radius-md);
  padding:16px; box-shadow:var(--shadow-sm); margin-bottom:16px; overflow-x:auto; }}
.tabela {{ width:100%; border-collapse:collapse; font-size:14px; }}
.tabela th {{ text-align:left; font-size:12.5px; text-transform:uppercase; letter-spacing:.4px;
  color:var(--gray-500); font-weight:600; padding:8px; border-bottom:1px solid var(--gray-200); white-space:nowrap; }}
.tabela td {{ padding:8px; border-bottom:1px solid var(--gray-100); vertical-align:middle; }}
.tabela tfoot td {{ border-top:2px solid var(--gray-200); border-bottom:0; font-weight:600; }}
.tabela .num {{ text-align:right; white-space:nowrap; }}
.tabela th.num {{ text-align:right; }}
.tabela .forte {{ font-weight:600; }}
.tabela tr.mes-atual td {{ background:var(--blue-50); }}
.tabela tr.passado td:first-child::after {{ content:" ·"; color:var(--gray-300); }}
.compacta td, .compacta th {{ padding:6px 8px; }}
.tag {{ display:inline-block; font-size:11.5px; font-weight:600; padding:2px 8px; border-radius:var(--pill); white-space:nowrap; }}
.tag-ent {{ background:var(--success-bg); color:var(--success); }}
.tag-sai {{ background:var(--blue-50); color:var(--blue-600); }}
.pill {{ display:inline-block; font-size:12px; font-weight:600; padding:2px 10px; border-radius:var(--pill); white-space:nowrap; }}
.pill.ok {{ background:var(--success-bg); color:var(--success); }}
.pill.aberto {{ background:var(--gray-100); color:var(--gray-600); }}
.pill.atraso {{ background:var(--danger-bg); color:var(--danger); }}
.atraso {{ color:var(--danger); font-weight:600; }}
.barra-cel {{ min-width:160px; }}
.barra {{ display:inline-block; height:8px; border-radius:var(--pill); background:var(--blue-400); vertical-align:middle; }}
.barra-num {{ font-family:var(--font-mono); font-size:12px; color:var(--gray-500); margin-left:8px; }}
.controles {{ display:flex; gap:16px; flex-wrap:wrap; align-items:flex-end; margin-bottom:16px; }}
.campo {{ display:flex; flex-direction:column; gap:4px; }}
.campo label, .filtro-linha label {{ font-size:12.5px; font-weight:600; color:var(--gray-500);
  text-transform:uppercase; letter-spacing:.4px; }}
select, input {{ font-family:var(--font-body); font-size:14px; padding:7px 10px;
  border:1px solid var(--gray-300); border-radius:var(--radius-sm); background:#fff; color:var(--gray-800); }}
input[type=number] {{ font-family:var(--font-mono); width:120px; }}
.filtro-linha {{ display:flex; gap:8px; align-items:center; margin-bottom:12px; }}
.btn {{ font-family:var(--font-body); font-size:14px; font-weight:600; padding:8px 14px;
  border-radius:var(--radius-sm); border:1px solid var(--blue-500); background:var(--blue-500);
  color:#fff; cursor:pointer; }}
.botoes {{ display:flex; gap:8px; }}
.btn.secundario {{ background:#fff; color:var(--blue-600); }}
.grafico {{ width:100%; height:220px; display:block; }}
.legenda {{ display:flex; gap:16px; flex-wrap:wrap; font-size:13px; color:var(--gray-500); margin-top:8px; }}
.legenda i {{ display:inline-block; width:10px; height:10px; border-radius:3px; margin-right:6px; vertical-align:middle; }}
.nota {{ font-size:13px; color:var(--gray-500); }}
.rodape {{ margin-top:32px; padding-top:16px; border-top:1px solid var(--gray-200); font-size:13px; color:var(--gray-500); }}
.rodape a {{ color:var(--blue-600); }}
.rodape ul {{ margin:8px 0 0; padding-left:18px; }}
.sim-aviso {{ font-size:13px; color:var(--warning); background:var(--warning-bg);
  border:1px solid #F0DCB8; border-radius:var(--radius-sm); padding:8px 12px; margin-top:12px; }}
@media (max-width:640px) {{ h1 {{ font-size:22px; }} .meta {{ text-align:left; }} }}
</style>
</head>
<body>
<div class="wrap">

<header class="topo">
  <div class="marca">
    {LOGO}
    <div>
      <h1>Relatório Financeiro — {esc(snapshot["titulo"])}</h1>
      <div class="sub">Fluxo de caixa e competência · {esc(rotulo_mes(c["mes_atual"], True))}</div>
    </div>
  </div>
  <div class="meta">
    Atualizado em <strong>{esc(c["hoje_br"])}</strong><br>
    Base: Notion · captura {esc(datetime.strptime(snapshot["capturado_em"], "%Y-%m-%d").strftime("%d/%m/%Y"))}<br>
    {esc(snapshot["saldo_inicial"]["rotulo"])}: <strong>{esc(brl(c["saldo_inicial"]))}</strong>
  </div>
</header>

{bloco_kpis(c, snapshot)}
{bloco_atrasos(c)}

<div class="abas" role="tablist">
  <button class="aba" role="tab" aria-selected="true" data-painel="caixa">Fluxo de caixa</button>
  <button class="aba" role="tab" aria-selected="false" data-painel="competencia">Competência</button>
  <button class="aba" role="tab" aria-selected="false" data-painel="custos">Custos por centro</button>
  <button class="aba" role="tab" aria-selected="false" data-painel="lancamentos">Lançamentos</button>
</div>

<section class="painel" id="painel-caixa">
  <div class="card">
    <div class="controles">
      <div class="campo">
        <label for="cenario">Cenário</label>
        <select id="cenario">
          <option value="base">Base — tudo entra no vencimento</option>
          <option value="conservador">Conservador — atraso a receber não entra</option>
          <option value="realizado">Só realizado — ignora previsões</option>
        </select>
      </div>
      <div class="campo">
        <label for="horizonte">Horizonte</label>
        <select id="horizonte">
          <option value="6">6 meses à frente</option>
          <option value="12" selected>12 meses à frente</option>
          <option value="99">Tudo que está lançado</option>
        </select>
      </div>
      <div class="campo">
        <label for="simValor">Simular custo extra</label>
        <input id="simValor" type="number" min="0" step="100" placeholder="0,00">
      </div>
      <div class="campo">
        <label for="simParcelas">Parcelas</label>
        <input id="simParcelas" type="number" min="1" max="60" value="1">
      </div>
      <div class="campo">
        <label for="simInicio">A partir de</label>
        <select id="simInicio"></select>
      </div>
      <div class="botoes"><button class="btn" id="simAplicar">Aplicar</button><button class="btn secundario" id="simLimpar">Limpar</button></div>
    </div>
    <div id="simAviso" class="sim-aviso" hidden></div>
    <svg class="grafico" id="grafico" role="img" aria-label="Saldo acumulado projetado"></svg>
    <div class="legenda">
      <span><i style="background:var(--blue-500)"></i>Saldo realizado</span>
      <span><i style="background:var(--blue-200)"></i>Saldo projetado</span>
      <span><i style="background:var(--danger)"></i>Saldo negativo</span>
    </div>
  </div>
  <div class="card">
    <table class="tabela" id="tabelaCaixa">
      <thead><tr>
        <th>Mês</th>
        <th class="num">Entradas realizadas</th><th class="num">Saídas realizadas</th>
        <th class="num">Entradas previstas</th><th class="num">Saídas previstas</th>
        <th class="num">Resultado</th><th class="num">Saldo no fim do mês</th>
      </tr></thead>
      <tbody></tbody>
    </table>
    <p class="nota">Meses até {esc(rotulo_mes(c["mes_atual"], True))} usam o que foi efetivamente pago/recebido.
    A partir daí, o saldo é projeção pelo cenário escolhido.</p>
  </div>
</section>

<section class="painel" id="painel-competencia" hidden>
  <div class="card">
    <h2>Resultado por competência</h2>
    <p class="nota">Considera todo lançamento pela data de vencimento, tenha sido liquidado ou não.</p>
    {bloco_competencia(c, snapshot)}
  </div>
</section>

<section class="painel" id="painel-custos" hidden>
  <div class="card">
    <h2>Custos por centro de custo</h2>
    <p class="nota">Todo o período lançado — pago e em aberto.</p>
    {bloco_composicao(c, snapshot, hoje)}
  </div>
</section>

<section class="painel" id="painel-lancamentos" hidden>
  <div class="card">
    <h2>Lançamentos do mês e do mês seguinte</h2>
    {bloco_lancamentos(c, snapshot, hoje)}
  </div>
</section>

<footer class="rodape">
  <strong>Origem dos números</strong>
  <ul>
    <li>Contas a Receber e Contas a Pagar do Notion, capturadas em {esc(datetime.strptime(snapshot["capturado_em"], "%Y-%m-%d").strftime("%d/%m/%Y"))}.</li>
    <li>Regime de caixa aproximado pela data de vencimento dos títulos liquidados (as bases não guardam data de pagamento).</li>
    <li>Saldo inicial informado na página de Controle Financeiro: {esc(snapshot["saldo_inicial"]["rotulo"])} = {esc(brl(c["saldo_inicial"]))}.</li>
    {obs}
  </ul>
  <p>Fontes: <a href="{esc(fontes["contas_a_receber"])}">Contas a Receber</a> ·
     <a href="{esc(fontes["contas_a_pagar"])}">Contas a Pagar</a> ·
     <a href="{esc(fontes["pagina"])}">Centro de custo</a></p>
</footer>

</div>
<script>
const DADOS = {dados_js};

const fmt = v => (v < 0 ? "-" : "") + "R$ " +
  Math.abs(v).toLocaleString("pt-BR", {{minimumFractionDigits: 2, maximumFractionDigits: 2}});
const idxAtual = DADOS.meses.findIndex(m => m.mes === DADOS.mesAtual);
let extras = [];

function projetar() {{
  const cenario = document.getElementById("cenario").value;
  const linhas = [];
  let saldo = DADOS.saldoInicial;
  // Atrasos são realocados para o mês corrente: já venceram e não foram liquidados.
  let entAtrasoAcum = 0, saiAtrasoAcum = 0;
  DADOS.meses.forEach((m, i) => {{
    const passado = i < idxAtual;
    let entPr = m.entPr, saiPr = m.saiPr;
    if (passado) {{ entAtrasoAcum += m.entAtraso; saiAtrasoAcum += m.saiAtraso; entPr = 0; saiPr = 0; }}
    if (i === idxAtual) {{ entPr += entAtrasoAcum; saiPr += saiAtrasoAcum; }}
    if (cenario === "realizado") {{ entPr = 0; saiPr = 0; }}
    if (cenario === "conservador") {{
      const atrasoEnt = (i === idxAtual ? entAtrasoAcum + m.entAtraso : 0);
      entPr = Math.max(0, entPr - atrasoEnt);
    }}
    const extra = extras.filter(e => e.mes === m.mes).reduce((s, e) => s + e.valor, 0);
    saiPr += extra;
    const resultado = (m.entRe + entPr) - (m.saiRe + saiPr);
    saldo += resultado;
    linhas.push({{...m, entPrEfetiva: entPr, saiPrEfetiva: saiPr, extra, resultado, saldo, passado}});
  }});
  return linhas;
}}

function limitar(linhas) {{
  const h = parseInt(document.getElementById("horizonte").value, 10);
  if (h >= 99) return linhas;
  return linhas.filter((l, i) => i <= idxAtual + h);
}}

function renderTabela(linhas) {{
  const corpo = document.querySelector("#tabelaCaixa tbody");
  corpo.innerHTML = linhas.map(l => {{
    const cls = l.mes === DADOS.mesAtual ? ' class="mes-atual"' : "";
    const sc = l.saldo < 0 ? "neg" : "pos";
    const rc = l.resultado < 0 ? "neg" : "pos";
    return `<tr${{cls}}><td>${{l.rotulo}}</td>` +
      `<td class="num">${{l.entRe ? fmt(l.entRe) : "—"}}</td>` +
      `<td class="num">${{l.saiRe ? fmt(l.saiRe) : "—"}}</td>` +
      `<td class="num">${{l.entPrEfetiva ? fmt(l.entPrEfetiva) : "—"}}</td>` +
      `<td class="num">${{l.saiPrEfetiva ? fmt(l.saiPrEfetiva) : "—"}}</td>` +
      `<td class="num forte ${{rc}}">${{fmt(l.resultado)}}</td>` +
      `<td class="num forte ${{sc}}">${{fmt(l.saldo)}}</td></tr>`;
  }}).join("");
}}

function renderGrafico(linhas) {{
  const svg = document.getElementById("grafico");
  const L = 44, R = 34, T = 12, B = 26;
  const larg = svg.clientWidth || 900, alt = 220;
  const saldos = linhas.map(l => l.saldo);
  const max = Math.max(...saldos, 0), min = Math.min(...saldos, 0);
  const span = (max - min) || 1;
  const x = i => L + (linhas.length === 1 ? 0 : i * (larg - L - R) / (linhas.length - 1));
  const y = v => T + (max - v) / span * (alt - T - B);
  const barraW = Math.max(4, Math.min(28, (larg - L - R) / (linhas.length * 1.6)));
  let out = "";
  out += `<line x1="${{L}}" y1="${{y(0)}}" x2="${{larg - R}}" y2="${{y(0)}}" stroke="#DCE3EA"/>`;
  linhas.forEach((l, i) => {{
    const topo = Math.min(y(l.saldo), y(0)), altura = Math.abs(y(l.saldo) - y(0));
    const cor = l.saldo < 0 ? "#C7382E" : (l.passado || l.mes === DADOS.mesAtual ? "#2F6DF0" : "#BED4FD");
    out += `<rect x="${{x(i) - barraW / 2}}" y="${{topo}}" width="${{barraW}}" height="${{Math.max(1, altura)}}" rx="2" fill="${{cor}}"><title>${{l.rotulo}}: ${{fmt(l.saldo)}}</title></rect>`;
    if (linhas.length <= 18 || i % 2 === 0) {{
      const anchor = i === linhas.length - 1 ? "end" : (i === 0 ? "start" : "middle");
      out += `<text x="${{x(i)}}" y="${{alt - 8}}" text-anchor="${{anchor}}" font-size="11" font-family="IBM Plex Mono, monospace" fill="#6B7A8B">${{l.rotulo}}</text>`;
    }}
  }});
  out += `<text x="4" y="${{y(max) + 4}}" font-size="11" font-family="IBM Plex Mono, monospace" fill="#8E9CAB">${{Math.round(max / 1000)}}k</text>`;
  out += `<text x="4" y="${{y(min) + 4}}" font-size="11" font-family="IBM Plex Mono, monospace" fill="#8E9CAB">${{Math.round(min / 1000)}}k</text>`;
  svg.setAttribute("viewBox", `0 0 ${{larg}} ${{alt}}`);
  svg.innerHTML = out;
}}

function atualizar() {{
  const linhas = limitar(projetar());
  renderTabela(linhas);
  renderGrafico(linhas);
  const aviso = document.getElementById("simAviso");
  if (extras.length) {{
    const total = extras.reduce((s, e) => s + e.valor, 0);
    aviso.hidden = false;
    aviso.textContent = `Simulação ativa: ${{fmt(total)}} em ${{extras.length}} parcela(s) a partir de ` +
      `${{extras[0].mes}}. Só afeta esta tela — nada é gravado no Notion.`;
  }} else {{
    aviso.hidden = true;
  }}
}}

document.querySelectorAll(".aba").forEach(b => b.addEventListener("click", () => {{
  document.querySelectorAll(".aba").forEach(o => o.setAttribute("aria-selected", String(o === b)));
  document.querySelectorAll(".painel").forEach(p => {{
    p.hidden = p.id !== "painel-" + b.dataset.painel;
  }});
  if (b.dataset.painel === "caixa") atualizar();
}}));

const filtroMes = document.getElementById("filtroMes");
if (filtroMes) {{
  filtroMes.addEventListener("change", () => {{
    const v = filtroMes.value;
    document.querySelectorAll("#tabelaLancamentos tbody tr").forEach(tr => {{
      tr.style.display = (v === "todos" || tr.dataset.mes === v) ? "" : "none";
    }});
  }});
  filtroMes.dispatchEvent(new Event("change"));
}}

const simInicio = document.getElementById("simInicio");
DADOS.meses.forEach((m, i) => {{
  if (i < idxAtual) return;
  const o = document.createElement("option");
  o.value = m.mes; o.textContent = m.rotulo;
  simInicio.appendChild(o);
}});

document.getElementById("simAplicar").addEventListener("click", () => {{
  const valor = parseFloat(document.getElementById("simValor").value || "0");
  const parcelas = Math.max(1, parseInt(document.getElementById("simParcelas").value || "1", 10));
  const inicio = simInicio.value;
  if (!valor) {{ extras = []; atualizar(); return; }}
  const i0 = DADOS.meses.findIndex(m => m.mes === inicio);
  extras = [];
  for (let k = 0; k < parcelas && i0 + k < DADOS.meses.length; k++) {{
    extras.push({{mes: DADOS.meses[i0 + k].mes, valor: valor}});
  }}
  atualizar();
}});
document.getElementById("simLimpar").addEventListener("click", () => {{
  document.getElementById("simValor").value = "";
  document.getElementById("simParcelas").value = "1";
  extras = [];
  atualizar();
}});
["cenario", "horizonte"].forEach(id =>
  document.getElementById(id).addEventListener("change", atualizar));
window.addEventListener("resize", () => atualizar());
atualizar();
</script>
</body>
</html>
'''


def main():
    if len(sys.argv) < 3:
        print(__doc__)
        sys.exit(1)
    entrada, saida = sys.argv[1], sys.argv[2]
    snapshot = json.load(open(entrada, encoding="utf-8"))
    hoje = dia(sys.argv[3]) if len(sys.argv) > 3 else dia(snapshot["capturado_em"])
    html = gerar(snapshot, hoje)
    with open(saida, "w", encoding="utf-8") as f:
        f.write(html)
    print(f"{saida} — {len(html) / 1024:.0f} KB")


if __name__ == "__main__":
    main()
