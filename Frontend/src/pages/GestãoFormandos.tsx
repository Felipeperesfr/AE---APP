import ModernIcon from "../components/ModernIcon";
import React, { useState, useEffect, useMemo} from "react";
import { faFilterCircleXmark, faClose, faPenToSquare, faTrash, faPlusCircle, faFilter, faReceipt, faDatabase, IconDefinition } from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import { useConfirm } from "../components/UseConfirm"
import { motion, AnimatePresence } from "framer-motion"
import Modal from '../components/Modal'
import ConfirmBox from "../components/ConfirmBox"
import ParcelaPagamento from "../components/ParcelaPagamento"
import "../cssComponents/parcelapagamento.css"




export default function GestãoFormandos() {

    // Types

    type escola = {
        nome: string,
        id: number
    }


    type escolaRelato = {
        nome: string,
        totalAlunos: number,
        pagamentosAtrasados: number
    }

    type turmaRelato = {
        escola: string,
        turma: string,
        alunos: aluno[]
    }

    type aluno = {
        nome: string,
        escola: string,
        tel1: string,
        tel2: string | "",
        parcelas: string,
        valor: string,
        ano: string,
        turma: string,
        anotacoes: string | "",
        status: string, // "Criado" | "Mensagem enviada" | "Pagamento em dia" | "Pagamento atrasado" | "Cancelado"
        metodo: string,
        id: number
    }

    type pagamento = {
        id: number;
        p1: string;
        p2?: string;
        p3?: string;
        p4?: string;
        p5?: string;
        p6?: string;
        p7?: string;
        p8?: string;
    };

    type modalModeType = "add" | "edit"


    // Constantes

    const EMPTY_ALUNO: aluno = {
        nome: "",
        escola: "",
        tel1: "",
        tel2: "",
        parcelas: "",
        valor: "",
        ano: "",
        turma: "",
        anotacoes: "",
        status: "Criado",
        metodo: "",
        id: 0
    };

    const { open: openWarn, confirm: confirmWarn, handleResolve: handleResolveWarn } = useConfirm()
    const { open: openDelete, confirm: confirmDelete, handleResolve: handleResolveDelete } = useConfirm()



    // Funções Gerais

    const registerEntry = (aluno: aluno): void => {
        setAlunos(prev => [...prev, aluno]);
    }


    const handleSort = (key: "nome" | "escola") => {
        if (sortKey === key) {
            // same column → toggle direction
            setSortDirection(prev => (prev === "asc" ? "desc" : "asc"));
        } else {
            // new column → reset to asc
            setSortKey(key);
            setSortDirection("asc");
        }
    };



    const sendAnotacoesValue = async (id: number) => {
        const response = await fetch(`http://localhost:3001/api/editaluno/${id}?from=baixaAnotacao`, {
            method: "PUT",
            headers: { "Content-Type": "application/json", },
            body: JSON.stringify({ anotacoes: valueAnotacao }),
        })

        if (response.ok) {
            const data = await response.json()
            setAlunos(data)
            toast.success("Atualização bem sucedida!")
        }

        else
            toast.error(`Erro: ${response.statusText}`)
    }

    // Funções Requests

    const deleteAluno = async (id: number): Promise<void> => {
        const response = await fetch(`http://localhost:3001/api/deletealuno/${id}`, {
            method: "DELETE"
        })

        if (response.ok) {
            setAlunos(prev => {
                const updated = [...prev]
                const index = alunos.findIndex((a: aluno) => a.id === id)
                updated.splice(index, 1)
                return updated
            })
            toast.success("Produto deletado com sucesso!")
        }
        else {
            const errorData = await response.json();
            toast.error(errorData.error ?? "Erro inesperado.");
            return;
        }
    }


    // Constantes useState

    const [subpage, setSubpage] = useState<string>("gestão-formandos")
    const [alunos, setAlunos] = useState<aluno[]>([])
    const [escolas, setEscolas] = useState<string[]>([])
    const [pagamentos, setPagamentos] = useState<pagamento[]>([])
    const [selectedAluno, setSelectedAluno] = useState<aluno>(EMPTY_ALUNO)
    const [openModalAluno, setopenModalAluno] = useState<boolean>(false)
    const [filterIcon, setFilterIcon] = useState<IconDefinition>(faFilter)
    const [openModalFilter, setopenModalFilter] = useState<boolean>(false)
    const [searchValue, setSearchValue] = useState<string>("")
    const [selectFilterValue, setSelectFilterValue] = useState<string>("")
    const [sortKey, setSortKey] = useState<"nome" | "escola">("nome");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
    const [modalMode, setModalMode] = useState<modalModeType>("add")
    const [modalHeight, setModalHeight] = useState<number>(0)
    const [activeEscola, setActiveEscola] = useState<string | null>(null)
    const [valueAnotacao, setValueAnotacao] = useState<string>("")

    // Constantes useMemo


    const filteredAlunos = useMemo(() => {
        const filter1 = alunos.filter((a: aluno) =>
            a.nome.trim().toLowerCase().includes(searchValue.trim().toLowerCase()))
        return filter1.filter((a: aluno) =>
            a.escola.includes(selectFilterValue))
    }, [alunos, searchValue, selectFilterValue])

    const sortedAlunos = useMemo(() => {
        return [...filteredAlunos].sort((a, b) => {
            const aVal = a[sortKey].toLowerCase();
            const bVal = b[sortKey].toLowerCase();

            return sortDirection === "asc"
                ? aVal.localeCompare(bVal, "pt-BR")
                : bVal.localeCompare(aVal, "pt-BR");
        });
    }, [filteredAlunos, sortKey, sortDirection]);

    const atrasoPorAluno = useMemo(() => {
        const map = new Map<number, boolean>()

        pagamentos.forEach(p => {
            let atrasado = false

            const isPagamentoAtrasado = (value: string | number, m: number): boolean => {
                if (value === "PIX" || value === "CC" || value === "BOL.")
                    return false
                else {
                    const now = new Date()
                    const day = now.getDate()
                    const month = now.getMonth() + 1

                    if (month < m)
                        return false

                    else if (month === m) {
                        if (day > 9)
                            return true
                        else
                            return false
                    }
                    else {
                        return true
                    }

                }
            }

            for (const [key, value] of Object.entries(p)) {
                if (key === "id") continue
                const m = Number(key.slice(1))
                if (isPagamentoAtrasado(value, m)) {
                    atrasado = true
                    break
                }
            }

            map.set(p.id, atrasado)
        })

        return map
    }, [pagamentos])

    const escolasRelato: escolaRelato[] = useMemo(() => {
        const escolaMap = new Map<
            string,
            { totalAlunos: number; pagamentosAtrasados: number }
        >()

        alunos.forEach(async aluno => {
            const isAtrasado = atrasoPorAluno.get(aluno.id) ?? false


            const entry = escolaMap.get(aluno.escola)

            if (!entry) {
                escolaMap.set(aluno.escola, {
                    totalAlunos: 1,
                    pagamentosAtrasados: isAtrasado ? 1 : 0
                })
            } else {
                entry.totalAlunos++
                if (isAtrasado) entry.pagamentosAtrasados++
            }
        })

        return Array.from(escolaMap, ([nome, data]) => ({
            nome,
            totalAlunos: data.totalAlunos,
            pagamentosAtrasados: data.pagamentosAtrasados
        }))
    }, [alunos, atrasoPorAluno])


    const turmasRelato: turmaRelato[] = useMemo(() => {
        return Object.values(
            alunos.reduce((acc, aluno) => {     // reduce passa pelo array como se fosse for each e cria alguma coisa
                const key = `${aluno.escola}-${aluno.ano}-${aluno.turma}`

                if (!acc[key]) {
                    acc[key] = {
                        escola: aluno.escola,
                        turma: `${aluno.ano} ${aluno.turma}`,
                        alunos: []
                    }
                }

                acc[key].alunos.push(aluno)
                return acc
            }, {} as Record<string, turmaRelato>) // transforma o acc que é um objeto de objetos em um array de objetos com keys iguais ao tipo turmaRelato
        )
    }, [alunos])



    // Funções useEffect

    useEffect(() => {
        if (filteredAlunos.length === alunos.length)
            setFilterIcon(faFilter)
        else
            setFilterIcon(faFilterCircleXmark)
    }, [filteredAlunos.length, alunos.length])

    useEffect(() => {
        if (alunos.length === 0) return

        const alunosAtualizados = alunos.map(aluno => {
            const isAtrasado = atrasoPorAluno.get(aluno.id) ?? false

            const novoStatus = isAtrasado
                ? "Pagamento atrasado"
                : "Pagamento em dia"

            return {
                id: aluno.id,
                status: novoStatus
            }
        })

        fetch("http://localhost:3001/api/sync-status", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ alunos: alunosAtualizados })
        })
            .catch(() => toast.error("Erro ao sincronizar status"))

    }, [alunos, atrasoPorAluno])






    useEffect(() => {
        const loadData = async () => {
            const [alunosRes, escolasRes, pagamentoRes] = await Promise.all([
                fetch("http://localhost:3001/api/getalunos"),
                fetch("http://localhost:3001/api/getescolas"),
                fetch("http://localhost:3001/api/getpagamentos"),
            ]);

            const alunosData = await alunosRes.json();
            const escolasData = await escolasRes.json();
            const pagamentosData = await pagamentoRes.json();
            const escolaNomes: string[] = []

            setAlunos(alunosData);
            escolasData.map((e: escola) => (
                escolaNomes.push(e.nome)
            ))
            setEscolas(escolaNomes)
            setPagamentos(pagamentosData)
        };

        loadData();

    }, []);


    return (
        <div className="gestãoformandos-main-container">

            <ConfirmBox
                open={openDelete}
                title="Deletar Aluno?"
                message="Essa ação não pode ser desfeita."
                //onConfirm={async () => deleteProduct(selectedProduct!.id)}
                onResolve={handleResolveDelete}
            />

            <ConfirmBox
                open={openWarn}
                title="Aluno semelhante já existente"
                message="Há um aluno com o nome semelhante nessa escola, ano e turma! Prosseguir mesmo assim?"
                onResolve={handleResolveWarn}
            />

            <Modal open={openModalFilter} onClose={() => setopenModalFilter(false)} height={150}>
                <header>
                    <div />
                    <h1>Filtros</h1>
                    <span className="close-modal-icon" onClick={() => setopenModalFilter(false)}><ModernIcon icon={faClose} direction="horizontal-right" text="Fechar"></ModernIcon></span>
                </header>
                <div className="body">
                    <div className="input">
                        <p>Filtro por aluno:</p>
                        <input type="text" onChange={(e) => {
                            setSearchValue(e.target.value)
                        }} />
                    </div>
                    <div className="input">
                        <p>Filtro por escola:</p>
                        <select name="fornecedor-select" onChange={e => (
                            setSelectFilterValue(e.target.value)
                        )}>
                            <>
                                <option value=""></option>
                                {
                                    escolas.map((e: string) => (
                                        <option key={e} value={e}>{e}</option>
                                    ))
                                }
                            </>
                        </select>
                    </div>
                </div>
            </Modal>

            <Modal open={openModalAluno} onClose={() => setopenModalAluno(false)} width={"450px"} height={modalHeight}>
                <header>
                    <div />
                    <h1>
                        {modalMode === "add" ? "Adicionar novo Aluno" : "Editar Aluno"}
                    </h1>
                    <span className="close-modal-icon" onClick={() => setopenModalAluno(false)}><ModernIcon icon={faClose} direction="horizontal-right" text="Fechar"></ModernIcon></span>
                </header>
                <div className="body">
                    {modalMode === "add" ?
                        <>
                            <div className="input">
                                <p>Nome:</p>
                                <input type="text" value={selectedAluno.nome} onChange={(e) => { setSelectedAluno(prev => ({ ...prev!, nome: e.target.value })) }} />
                            </div>
                            <div className="input">
                                <p>Escola:</p>
                                <select value={selectedAluno.escola} name="escola-select" onChange={(e) => { setSelectedAluno(prev => ({ ...prev!, escola: e.target.value })) }}>
                                    <>
                                        <option value=""></option>
                                        {
                                            [...escolas].sort((a, b) => a.localeCompare(b)).map((e: string) => (
                                                <option key={e} value={e}>{e}</option>
                                            ))
                                        }
                                    </>
                                </select>
                            </div>
                            <div className="input">
                                <p>Ano:</p>
                                <select name="Ano select" value={selectedAluno.ano} onChange={(e) => { setSelectedAluno(prev => ({ ...prev!, ano: e.target.value })) }}>
                                    <option value=""></option>
                                    <option value="5º">5º</option>
                                    <option value="9º">9º</option>
                                    <option value="3º">3º</option>
                                    <option value="Técnico/Faculdade">Técnico/Faculdade</option>
                                </select>
                            </div>
                            <div className="input">
                                <p>Turma:</p>
                                <input type="text" value={selectedAluno.turma} onChange={(e) => { setSelectedAluno(prev => ({ ...prev!, turma: e.target.value })) }} />
                            </div>
                            <div className="input">
                                <p>Tel1:</p>
                                <input type="text" value={selectedAluno.tel1} onChange={(e) => { setSelectedAluno(prev => ({ ...prev!, tel1: e.target.value })) }} />
                            </div>
                            <div className="input">
                                <p>Tel2:</p>
                                <input type="text" value={selectedAluno.tel2} onChange={(e) => { setSelectedAluno(prev => ({ ...prev!, tel2: e.target.value })) }} />
                            </div>
                            <div className="input">
                                <p>Parcelas:</p>
                                <select name="parcelas select" value={selectedAluno.parcelas} onChange={(e) => { setSelectedAluno(prev => ({ ...prev!, parcelas: e.target.value })) }}>
                                    <option value=""></option>
                                    <option value="1">1</option>
                                    <option value="2">2</option>
                                    <option value="4">4</option>
                                    <option value="6">6</option>
                                    <option value="8">8</option>
                                    <option value="10">10</option>
                                    <option value="12">12</option>
                                </select>
                            </div>
                            <div className="input">
                                <p>Valor:</p>
                                <input type="text" value={selectedAluno.valor} onChange={(e) => { setSelectedAluno(prev => ({ ...prev!, valor: e.target.value })) }} />
                            </div>
                            <div className="input">
                                <p>Método PG.:</p>
                                <select name="Método select" value={selectedAluno.metodo} onChange={(e) => { setSelectedAluno(prev => ({ ...prev!, metodo: e.target.value })) }}>
                                    <option value=""></option>
                                    <option value="PIX">PIX</option>
                                    <option value="CC">CC</option>
                                    <option value="BOLETO">BOLETO</option>
                                </select>
                            </div>
                            <div className="input">
                                <p>Anotações:</p>
                                <input type="text" value={selectedAluno.anotacoes} onChange={(e) => { setSelectedAluno(prev => ({ ...prev!, anotacoes: e.target.value })) }} />
                            </div>

                            <button onClick={async () => {
                                const nome = selectedAluno.nome
                                const escola = selectedAluno.escola
                                const tel1 = selectedAluno.tel1
                                const tel2 = selectedAluno.tel2
                                const ano = selectedAluno.ano
                                const turma = selectedAluno.turma
                                const anotacoes = selectedAluno.anotacoes
                                const status = "Criado"
                                const parcelas = selectedAluno.parcelas
                                const valor = selectedAluno.valor
                                const metodo = selectedAluno.metodo

                                if ((Number.isNaN(valor) || Number.isNaN(parcelas)) || (selectedAluno.valor.trim() === "") || parcelas.trim() === "") {
                                    toast.error("Valor/Parcelas inválido")
                                    return
                                }

                                if (!nome || !escola) {
                                    toast.error("Nome e Escola são obrigatórios")
                                    return
                                }

                                if (
                                    alunos.filter((a: aluno) => a.escola === escola).filter((a: aluno) => a.ano === ano).filter((a: aluno) => a.turma === turma).find((a: aluno) =>
                                        a.nome.trim().toLowerCase()
                                            .includes(selectedAluno.nome.trim().toLowerCase())
                                    )
                                ) {
                                    const userResponse = await confirmWarn()
                                    if (!userResponse) return
                                }


                                const response = await fetch("http://localhost:3001/api/newaluno", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json", },
                                    body: JSON.stringify({ nome, escola, tel1, tel2, ano, turma, anotacoes, status, parcelas, valor, metodo }),
                                })

                                if (!response.ok) {
                                    const errorData = await response.json();
                                    toast.error(errorData.error ?? "Erro inesperado.");
                                    return;
                                }

                                const data: aluno = await response.json();

                                registerEntry(data);
                                setSelectedAluno(EMPTY_ALUNO)
                                toast.success("Aluno adicionado!");

                            }}>Adicionar</button>
                        </>
                        :
                        <>
                            <div className="input">
                                <p>Nome:</p>
                                <input type="text" value={selectedAluno.nome} onChange={(e) => { setSelectedAluno(prev => ({ ...prev!, nome: e.target.value })) }} />
                            </div>
                            <div className="input">
                                <p>Escola:</p>
                                <select value={selectedAluno.escola} name="escola-select" onChange={(e) => { setSelectedAluno(prev => ({ ...prev!, escola: e.target.value })) }}>
                                    <>
                                        {
                                            [...escolas].sort((a, b) => a.localeCompare(b)).map((e: string) => (
                                                <option key={e} value={e}>{e}</option>
                                            ))
                                        }
                                    </>
                                </select>
                            </div>
                            <div className="input">
                                <p>Ano:</p>
                                <select name="Ano select" value={selectedAluno.ano} onChange={(e) => { setSelectedAluno(prev => ({ ...prev!, ano: e.target.value })) }}>
                                    <option value=""></option>
                                    <option value="5º">5º</option>
                                    <option value="9º">9º</option>
                                    <option value="3º">3º</option>
                                    <option value="Técnico/Faculdade">Técnico/Faculdade</option>
                                </select>
                            </div>
                            <div className="input">
                                <p>Turma:</p>
                                <input type="text" value={selectedAluno.turma} onChange={(e) => { setSelectedAluno(prev => ({ ...prev!, turma: e.target.value })) }} />
                            </div>
                            <div className="input">
                                <p>Tel1:</p>
                                <input type="text" value={selectedAluno.tel1} onChange={(e) => { setSelectedAluno(prev => ({ ...prev!, tel1: e.target.value })) }} />
                            </div>
                            <div className="input">
                                <p>Tel2:</p>
                                <input type="text" value={selectedAluno.tel2} onChange={(e) => { setSelectedAluno(prev => ({ ...prev!, tel2: e.target.value })) }} />
                            </div>
                            <div className="input">
                                <p>Parcelas:</p>
                                <select name="parcelas select" value={selectedAluno.parcelas} onChange={(e) => { setSelectedAluno(prev => ({ ...prev!, parcelas: e.target.value })) }}>
                                    <option value="1">1</option>
                                    <option value="2">2</option>
                                    <option value="4">4</option>
                                    <option value="6">6</option>
                                    <option value="8">8</option>
                                    <option value="10">10</option>
                                    <option value="12">12</option>
                                </select>
                            </div>
                            <div className="input">
                                <p>Valor:</p>
                                <input type="text" value={selectedAluno.valor} onChange={(e) => { setSelectedAluno(prev => ({ ...prev!, valor: e.target.value })) }} />
                            </div>
                            <div className="input">
                                <p>Método PG.:</p>
                                <select name="Método select" value={selectedAluno.metodo} onChange={(e) => { setSelectedAluno(prev => ({ ...prev!, metodo: e.target.value })) }}>
                                    <option value=""></option>
                                    <option value="PIX">PIX</option>
                                    <option value="CC">CC</option>
                                    <option value="BOLETO">BOLETO</option>
                                </select>
                            </div>
                            <div className="input">
                                <p>Anotações:</p>
                                <input type="text" value={selectedAluno.anotacoes} onChange={(e) => { setSelectedAluno(prev => ({ ...prev!, anotacoes: e.target.value })) }} />
                            </div>
                            <div className="input">
                                <p>Status:</p>
                                <select name="status select" value={selectedAluno.status} onChange={(e) => { setSelectedAluno(prev => ({ ...prev!, status: e.target.value })) }}>
                                    <option value="Criado">Criado</option>
                                    <option value="Mensagem enviada">Mensagem enviada</option>
                                    <option value="Pagamento em dia">Pagamento em dia</option>
                                    <option value="Pagamento atrasado">Pagamento atrasado</option>
                                    <option value="Cancelado">Cancelado</option>
                                </select>
                            </div>

                            <button onClick={async () => {
                                const nome = selectedAluno.nome
                                const escola = selectedAluno.escola
                                const tel1 = selectedAluno.tel1
                                const tel2 = selectedAluno.tel2
                                const ano = selectedAluno.ano
                                const turma = selectedAluno.turma
                                const anotacoes = selectedAluno.anotacoes
                                const status = selectedAluno.status
                                const parcelas = selectedAluno.parcelas
                                const metodo = selectedAluno.metodo
                                const valor = selectedAluno.valor

                                if ((Number.isNaN(valor) || Number.isNaN(parcelas)) || (String(valor).trim() === "") || String(parcelas).trim() === "") {
                                    toast.error("Valor/Parcelas inválido")
                                    return
                                }

                                if (!nome || !escola) {
                                    toast.error("Nome e Escola são obrigatórios")
                                    return
                                }

                                if (
                                    alunos.filter((a: aluno) => a.escola === escola).filter((a: aluno) => a.ano === ano).filter((a: aluno) => a.turma === turma).find((a: aluno) =>
                                        a.nome.trim().toLowerCase()
                                            .includes(selectedAluno.nome.trim().toLowerCase())
                                    )
                                ) {
                                    const userResponse = await confirmWarn()
                                    if (!userResponse) return
                                }


                                const response = await fetch(`http://localhost:3001/api/editaluno/${selectedAluno.id}`, {
                                    method: "PUT",
                                    headers: { "Content-Type": "application/json", },
                                    body: JSON.stringify({ nome, escola, tel1, tel2, ano, turma, anotacoes, status, parcelas, valor, metodo }),
                                })

                                if (response.ok) {
                                    const data = await response.json()
                                    setAlunos(data)
                                    toast.success("Atualização bem sucedida!")
                                }

                                else
                                    toast.error(`Erro: ${response.statusText}`)

                            }}>Editar</button>
                        </>
                    }
                </div>
            </Modal>


            <div className="content">
                <div className="bar-selection">
                    <span className={`first bar ${subpage === "gestão-formandos" ? "active" : ""}`} onClick={() => { setSubpage("gestão-formandos") }}><ModernIcon direction="vertical-up" distance={50} icon={faReceipt} text="Gestão de Baixas"></ModernIcon></span>
                    <span className={`second bar ${subpage === "gestão-formandos" ? "" : "active"}`} onClick={() => setSubpage("bd")}><ModernIcon direction="vertical-up" distance={50} icon={faDatabase} text="Banco de Dados"></ModernIcon></span>
                </div>
                <div className="subpage">
                    {subpage === "gestão-formandos" ?
                        <>
                            <div className="baixa-container">
                                <ul className="header-ul">
                                    {escolasRelato.map((es: escolaRelato) => (
                                        <motion.li layout initial={false} className={activeEscola === es.nome ? "li-header activeescola" : "li-header"} key={es.nome} >
                                            <div onClick={() => es.nome === activeEscola ? setActiveEscola(null) : setActiveEscola(es.nome)} className={activeEscola === es.nome ? "escola-header activeheader" : "escola-header"}>
                                                <h2>{es.nome}</h2>
                                                <div className="info-baixa">
                                                    <p>Alunos: <b>{es.totalAlunos}</b></p>
                                                    <p>/</p>
                                                    <p>PG. Atrasados: <b className={es.pagamentosAtrasados > 0 ? "escola-pg-atrasado" : ""}>{es.pagamentosAtrasados}</b></p>
                                                </div>
                                            </div>
                                            <AnimatePresence>
                                                {activeEscola === es.nome && (
                                                    <motion.ul key={`turmas-${es.nome}`} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="turmas-list">
                                                        {turmasRelato
                                                            .filter((t: turmaRelato) => t.escola === es.nome)
                                                            .sort((x, y) => x.turma.localeCompare(y.turma))
                                                            .map((t: turmaRelato) => (
                                                                <li key={`${t.escola}-${t.turma}-${es.totalAlunos}`} className="li-turma">
                                                                    <p className="p-turma">Turma {t.turma}</p>
                                                                    <ul className="alunos-list">
                                                                        {
                                                                            t.alunos.map((a: aluno) =>
                                                                                <li key={`${a.nome}-${a.id}`} className="li-aluno"><span className="nome-aluno">{a.nome}</span><span className="pagamentos">
                                                                                    {
                                                                                        Object.entries(pagamentos.find((p: pagamento) => p.id === a.id)!).map(([key, value]) =>
                                                                                            key === "id" ? null :
                                                                                                <span className="span-parcelaPagamento" key={`${a.id}-${key}`}>
                                                                                                    <ParcelaPagamento onChange={(novoValor) => {
                                                                                                        setPagamentos(prev =>
                                                                                                            prev.map(p =>
                                                                                                                p.id !== a.id
                                                                                                                    ? p
                                                                                                                    : { ...p, [key]: novoValor }
                                                                                                            )
                                                                                                        )
                                                                                                    }} valor={value} idPagamento={a.id} nParcela={key} key={`${key}-${value}`} direction="vertical-down" text={["", "PIX", "BOL.", "CC"]}></ParcelaPagamento>
                                                                                                </span>
                                                                                        )
                                                                                    }
                                                                                </span>
                                                                                    <div className="status">
                                                                                        <h2>Status</h2>
                                                                                        <span>{a.status}</span>
                                                                                    </div>
                                                                                    <div className="anotacoes">
                                                                                        <h2>Anotações</h2>
                                                                                        <input defaultValue={a.anotacoes} type="text" onFocus={() => setValueAnotacao(a.anotacoes)} onChange={(e) => setValueAnotacao(e.target.value)} onKeyDown={(e) => {
                                                                                            if (e.key === "Enter") {
                                                                                                if (valueAnotacao !== a.anotacoes)
                                                                                                    sendAnotacoesValue(a.id)
                                                                                            }

                                                                                        }} onBlur={() => {
                                                                                            if (valueAnotacao !== a.anotacoes) {
                                                                                                console.log(valueAnotacao)
                                                                                                sendAnotacoesValue(a.id)
                                                                                            }
                                                                                        }} />
                                                                                    </div>
                                                                                </li>
                                                                            )
                                                                        }
                                                                    </ul>
                                                                </li>
                                                            ))}
                                                    </motion.ul>
                                                )}
                                            </AnimatePresence>
                                        </motion.li>
                                    ))}
                                </ul>
                            </div>
                        </>
                        :
                        <>
                            <div className="bd-container">
                                <div className="header-bd">
                                    <span className="filter-icon" onClick={() => {
                                        if (filterIcon === faFilter)
                                            setopenModalFilter(true)
                                        else {
                                            setSearchValue("")
                                            setSelectFilterValue("")
                                        }
                                    }}><ModernIcon icon={filterIcon} text="Filtro" direction="vertical-down"></ModernIcon></span>
                                    <h2 className="clicable-element nome" onClick={() => handleSort("nome")}>Aluno</h2>
                                    <h2 className="clicable-element maior-espaço" onClick={() => handleSort("escola")}>Escola</h2>
                                    <h2 className="menor-espaço">Ano</h2>
                                    <h2 className="menor-espaço">Turma</h2>
                                    <h2 className="menor-espaço">Tel1.</h2>
                                    <h2 className="menor-espaço">Tel2.</h2>
                                    <h2 className="menor-espaço">Parcelas</h2>
                                    <h2 className="menor-espaço">Valor</h2>
                                    <h2 className="menor-espaço">Método</h2>
                                    <h2 className="maior-espaço">Status</h2>
                                    <h2 className="maior-espaço">Anotações</h2>
                                    <div className="add-icon"><span onClick={() => { setModalHeight(505); setModalMode("add"); setopenModalAluno(true); setSelectedAluno(EMPTY_ALUNO) }}><ModernIcon direction="vertical-down" icon={faPlusCircle} text="Adicionar Aluno"></ModernIcon></span></div>
                                </div>
                                <ul>
                                    {sortedAlunos.map(a => (
                                        <li key={a.id}>
                                            <div className="info-bd">
                                                <span className="filter-width"></span>
                                                <span className="nome">{a.nome}</span>
                                                <span className="maior-espaço">{a.escola}</span>
                                                <span className="menor-espaço">{a.ano}</span>
                                                <span className="menor-espaço">{a.turma}</span>
                                                <span className="menor-espaço"><a href={`https://wa.me/55${a.tel1}`} target="_blank" rel="noopener noreferrer">{a.tel1}</a></span>
                                                <span className="menor-espaço"><a href={`https://wa.me/55${a.tel2}`} target="_blank" rel="noopener noreferrer">{a.tel2}</a></span>
                                                <span className="menor-espaço">{a.parcelas}</span>
                                                <span className="menor-espaço">{a.valor}</span>
                                                <span className="menor-espaço">{a.metodo}</span>
                                                <span className="maior-espaço"><select name="status-select" value={a.status} onChange={async (e) => {
                                                    const response = await fetch(`http://localhost:3001/api/editaluno/${a.id}`, {
                                                        method: "PUT",
                                                        headers: { "Content-Type": "application/json", },
                                                        body: JSON.stringify({ nome: a.nome, escola: a.escola, tel1: a.tel1, tel2: a.tel2, ano: a.ano, turma: a.turma, anotacoes: a.anotacoes, status: e.target.value, parcelas: a.parcelas, valor: a.valor, metodo: a.metodo }),
                                                    })

                                                    if (response.ok) {
                                                        const data = await response.json()
                                                        setAlunos(data)
                                                        toast.success("Atualização bem sucedida!")
                                                    }

                                                    else
                                                        toast.error(`Erro: ${response.statusText}`)
                                                }}>
                                                    <option value="Criado">Criado</option>
                                                    <option value="Mensagem enviada">Mensagem enviada</option>
                                                    <option value="Pagamento em dia">Pagamento em dia</option>
                                                    <option value="Pagamento atrasado">Pagamento atrasado</option>
                                                    <option value="Cancelado">Cancelado</option>
                                                </select></span>
                                                <span className="maior-espaço">{a.anotacoes}</span>
                                                <div className="icones"><span className="modernIcon" onClick={() => { setModalHeight(535); setModalMode("edit"); setSelectedAluno(a); setopenModalAluno(true) }}><ModernIcon distance={40} direction="horizontal-left" icon={faPenToSquare} text="Editar"></ModernIcon></span>
                                                    <span onClick={async () => { setSelectedAluno(a); const userReturn = await confirmDelete(); if (userReturn) deleteAluno(a.id) }} className="modernIcon"><ModernIcon direction="horizontal-right" icon={faTrash} text="Excluir"></ModernIcon></span></div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </>
                    }
                </div>
            </div>

        </div>

    )
}
