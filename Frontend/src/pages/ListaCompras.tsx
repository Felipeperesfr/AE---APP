import ModernIcon from "../components/ModernIcon";
import React, { useState, useEffect, useMemo } from "react";
import { faCartPlus, faTrash, faDatabase, faPenToSquare, faPlusCircle, faClose, faFilter, faFilterCircleXmark, faFilePdf, faClipboardList, IconDefinition } from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import Modal from '../components/Modal'
import ConfirmBox from "../components/ConfirmBox"
import { useConfirm } from "../components/UseConfirm"
import "../cssComponents/confirmbox.css"
import "../cssComponents/modal.css"


export default function ListaCompras() {

  //Types
  type product = {
    nome: string,
    unidade: string,
    valor: string,
    fornecedor: string,
    id: number
  }

  type pdfProduct =
    {
      nome: string,
      quantidade: number,
      unidade: string,
      fornecedor: string,
    }

  type modalModeType = "add" | "edit"

  const EMPTY_PRODUCT = {
    nome: "",
    unidade: "",
    valor: "",
    fornecedor: "",
    id: 0,
  };

  // Constantes useState
  const [products, setProducts] = useState<product[]>([])
  const [subpage, setSubpage] = useState<string>("lista-compras")
  const [openModalProduct, setopenModalProduct] = useState<boolean>(false)
  const [openModalFilter, setopenModalFilter] = useState<boolean>(false)
  const [modalMode, setModalMode] = useState<modalModeType>("add")
  const [selectedProduct, setSelectedProduct] = useState<product>(EMPTY_PRODUCT)
  const [sortKey, setSortKey] = useState<"nome" | "fornecedor">("nome");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [filterIcon, setFilterIcon] = useState<IconDefinition>(faFilter)
  const [searchValue, setSearchValue] = useState<string>("")
  const [selectFilterValue, setSelectFilterValue] = useState<string>("")
  const [peopleValue, setPeopleValue] = useState<string>("")
  const [fornecedorPDF, setFornecedorPDF] = useState<string>("Todos Fornecedores")
  const [generateListPDF, setGenerateListPDF] = useState<boolean>(false)
  const [editablePdfProducts, setEditablePdfProducts] = useState<pdfProduct[]>([])

  // Constantes

  const { open: openWarn, confirm: confirmWarn, handleResolve: handleResolveWarn } = useConfirm()
  const { open: openDelete, confirm: confirmDelete, handleResolve: handleResolveDelete } = useConfirm()

  const fornecedores: string[] = useMemo(() => {
    return [...new Set(products.map(p => p.fornecedor))];
  }, [products]);

  const pdfProducts: pdfProduct[] = useMemo(() => {
    const filteredProducts =
      fornecedorPDF === "Todos Fornecedores"
        ? products
        : products.filter(
          (p: product) => p.fornecedor === fornecedorPDF
        )

    return filteredProducts.map((p: product) => ({
      nome: p.nome,
      quantidade: Math.ceil(Number(peopleValue) * Number(p.valor)),
      unidade: p.unidade,
      fornecedor: p.fornecedor
    }))
  }, [fornecedorPDF, peopleValue, products])

  // Constantes useMesmo

  const filteredProducts = useMemo(() => {
    const filter1 = products.filter((p: product) =>
      p.nome.trim().toLowerCase().includes(searchValue.trim().toLowerCase()))
    return filter1.filter((p: product) =>
      p.fornecedor.includes(selectFilterValue))
  }, [products, searchValue, selectFilterValue])

  const sortedProducts = useMemo(() => {
    return [...filteredProducts].sort((a, b) => {
      const aVal = a[sortKey].toLowerCase();
      const bVal = b[sortKey].toLowerCase();

      return sortDirection === "asc"
        ? aVal.localeCompare(bVal, "pt-BR")
        : bVal.localeCompare(aVal, "pt-BR");
    });
  }, [filteredProducts, sortKey, sortDirection]);



  // Funções useEffect
  useEffect(() => {
    const loadData = async () => {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/getproducts`);
      const data = await response.json();
      //console.log(data)
      setProducts(data);
    };

    loadData();
  }, [])

  useEffect(() => {
    if (filteredProducts.length === products.length)
      setFilterIcon(faFilter)
    else
      setFilterIcon(faFilterCircleXmark)
  }, [filteredProducts.length, products.length])


  useEffect(() => {
    setEditablePdfProducts(pdfProducts)
  }, [pdfProducts])


  // Funções Gerais

  const registerEntry = (product: product): void => {
    setProducts(prev => [...prev, product]);
  }

  const handleQuantidadeChange = (
    index: number,
    value: string
  ) => {
    setEditablePdfProducts(prev =>
      prev.map((p, i) =>
        i === index
          ? { ...p, quantidade: Number(value) || 0 }
          : p
      )
    )
  }

  const handleSort = (key: "nome" | "fornecedor") => {
    if (sortKey === key) {
      // same column → toggle direction
      setSortDirection(prev => (prev === "asc" ? "desc" : "asc"));
    } else {
      // new column → reset to asc
      setSortKey(key);
      setSortDirection("asc");
    }
  };


  const deleteProduct = async (id: number): Promise<void> => {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/deleteproduct/${id}`, {
      method: "DELETE"
    })

    if (response.ok) {
      setProducts(prev => {
        const updated = [...prev]
        const index = products.findIndex((p: product) => p.id === id)
        updated.splice(index, 1)
        return updated
      })
      toast.success("Produto deletado com sucesso!")
    }
  }


  return (
    <div className="listacompras-main-container">

      <ConfirmBox
        open={openDelete}
        title="Deletar Produto?"
        message="Essa ação não pode ser desfeita."
        //onConfirm={async () => deleteProduct(selectedProduct!.id)}
        onResolve={handleResolveDelete}
      />

      <ConfirmBox
        open={openWarn}
        title="Produto semelhante já existente"
        message="Há um produto com o nome semelhante, prosseguir mesmo assim?"
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
            <p>Filtro por nome:</p>
            <input type="text" onChange={(e) => {
              setSearchValue(e.target.value)
            }} />
          </div>
          <div className="input">
            <p>Filtro por fornecedor:</p>
            <select name="fornecedor-select" onChange={e => (
              setSelectFilterValue(e.target.value)
            )}>
              <>
                <option value=""></option>
                {
                  fornecedores.map((f: string) => (
                    <option key={f} value={f}>{f}</option>
                  ))
                }
              </>
            </select>
          </div>
        </div>
      </Modal>

      <Modal open={openModalProduct} onClose={() => setopenModalProduct(false)} width={"450px"} height={"265px"}>
        <header>
          <div />
          <h1>
            {modalMode === "add" ? "Adicionar novo Produto" : "Editar Produto"}
          </h1>
          <span className="close-modal-icon" onClick={() => setopenModalProduct(false)}><ModernIcon icon={faClose} direction="horizontal-right" text="Fechar"></ModernIcon></span>
        </header>
        <div className="body">
          {modalMode === "add" ?
            <>
              <div className="input">
                <p>Nome:</p>
                <input type="text" value={selectedProduct.nome} onChange={(e) => { setSelectedProduct(prev => ({ ...prev!, nome: e.target.value })) }} />
              </div>
              <div className="input">
                <p>Mult. (p/ pessoa):</p>
                <input type="text" value={selectedProduct.valor} onChange={(e) => { const value = e.target.value.replace(',', '.'); setSelectedProduct(prev => ({ ...prev!, valor: value })) }} />

              </div>
              <div className="input">
                <p>Unidade:</p>
                <input type="text" value={selectedProduct.unidade} onChange={(e) => { setSelectedProduct(prev => ({ ...prev!, unidade: e.target.value })) }} />
              </div>
              <div className="input">
                <p>Fornecedor:</p>
                <input type="text" value={selectedProduct.fornecedor} onChange={(e) => { setSelectedProduct(prev => ({ ...prev!, fornecedor: e.target.value })) }} />
              </div>

              <button onClick={async () => {
                const nome = selectedProduct!.nome
                const unidade = selectedProduct!.unidade
                const valor = Number(selectedProduct!.valor)
                const fornecedor = selectedProduct!.fornecedor

                if (Number.isNaN(valor)) {
                  toast.error("Valor inválido")
                  return
                }

                if (
                  products.find((p: product) =>
                    p.nome.trim().toLowerCase()
                      .includes(selectedProduct.nome.trim().toLowerCase())
                  )
                ) {
                  const userResponse = await confirmWarn()
                  if (!userResponse) return
                }


                const response = await fetch(`${process.env.REACT_APP_API_URL}/newproduct`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json", },
                  body: JSON.stringify({ nome, unidade, valor, fornecedor }),
                })

                if (!response.ok) {
                  const errorData = await response.json();
                  toast.error(errorData.error ?? "Erro inesperado.");
                  return;
                }

                const data: product = await response.json();

                registerEntry(data);
                setSelectedProduct(EMPTY_PRODUCT)
                toast.success("Produto registrado!");

              }}>Adicionar</button>
            </>
            :
            <>
              <div className="input">
                <p>Nome: </p>
                <input type="text" value={selectedProduct.nome} onChange={(e) => { setSelectedProduct(prev => ({ ...prev!, nome: e.target.value })) }} />
              </div>
              <div className="input">
                <p>Mult. (p/ pessoa)</p>
                <input type="text" value={selectedProduct.valor} onChange={(e) => { const value = e.target.value.replace(',', '.'); setSelectedProduct(prev => ({ ...prev!, valor: value })) }} />
              </div>
              <div className="input">
                <p>Unidade</p>
                <input type="text" value={selectedProduct.unidade} onChange={(e) => { setSelectedProduct(prev => ({ ...prev!, unidade: e.target.value })) }} />
              </div>
              <div className="input">
                <p>Fornecedor</p>
                <input type="text" value={selectedProduct.fornecedor} onChange={(e) => { setSelectedProduct(prev => ({ ...prev!, fornecedor: e.target.value })) }} />
              </div>
              <button onClick={async () => {
                const nome = selectedProduct!.nome
                const unidade = selectedProduct!.unidade
                const valor = Number(selectedProduct!.valor)
                const fornecedor = selectedProduct!.fornecedor

                if (Number.isNaN(valor)) {
                  toast.error("Valor inválido")
                  return
                }

                const response = await fetch(`${process.env.REACT_APP_API_URL}/editproduct/${selectedProduct!.id}`, {
                  method: "PUT",
                  headers: { "Content-Type": "application/json", },
                  body: JSON.stringify({ nome, unidade, valor, fornecedor }),
                })


                if (response.ok) {
                  const data = await response.json()
                  setProducts(data)
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
          <span className={`first bar ${subpage === "lista-compras" ? "active" : ""}`} onClick={() => { setSubpage("lista-compras"); setGenerateListPDF(false); setPeopleValue("") }}><ModernIcon direction="vertical-up" distance={50} icon={faCartPlus} text="Gerar Lista"></ModernIcon></span>
          <span className={`second bar ${subpage === "lista-compras" ? "" : "active"}`} onClick={() => setSubpage("bd")}><ModernIcon direction="vertical-up" distance={50} icon={faDatabase} text="Banco de Dados"></ModernIcon></span>
        </div>
        <div className="subpage">
          <>
            {subpage === "lista-compras" ?
              <div className="report-container">
                <div className="info-report-header">
                  <div className="qnt-pessoas">
                    <p>Quantidade de Pessoas:</p>
                    <input type="text" onChange={(e) => setPeopleValue(e.target.value)} />
                    <select name="" id="" onChange={(e) => setFornecedorPDF(e.target.value)}>
                      <option value="Todos Fornecedores">Todos Fornecedores</option>
                      {
                        fornecedores.map((f: string) => (
                          <option key={f} value={f}>{f}</option>
                        ))
                      }
                    </select>
                  </div>

                  {generateListPDF ?
                    <>
                      <span className="pdf-icon" onClick={async () => {
                        const newTab = window.open("", "_blank");
                        if (newTab)
                          newTab.document.write("<p>Gerando PDF...</p>");
                        const response = await fetch(`${process.env.REACT_APP_API_URL}/getPDFFiles`, {
                          method: "POST",
                          body: JSON.stringify({
                            fornecedor: fornecedorPDF,
                            fornecedores: fornecedores,
                            peopleQuantity: peopleValue
                          }),
                          headers: { "Content-Type": "application/json" }
                        });

                        if (!response.ok) {
                          newTab?.close();
                          throw new Error("Failed to generate PDF");
                        }

                        if (fornecedorPDF === "Todos Fornecedores") {
                          const blob = await response.blob();

                          const url = window.URL.createObjectURL(blob);
                          const a = document.createElement("a");

                          a.href = url;
                          a.download = "relatorios.zip";
                          document.body.appendChild(a);
                          a.click();

                          a.remove();
                          window.URL.revokeObjectURL(url);
                        }
                        else {
                          const arrayBuffer = await response.arrayBuffer();
                          const blob = new Blob([arrayBuffer], {
                            type: "application/pdf",
                          });
                          const pdfUrl = URL.createObjectURL(blob);
                          if (newTab) {
                            newTab.location.href = pdfUrl;
                          }
                        }

                      }
                      }><ModernIcon icon={faFilePdf} text="Download PDF" distance={45}></ModernIcon></span>
                    </>
                    :
                    <>
                      <span className="pdf-icon" onClick={() => {
                        if (peopleValue === "") {
                          toast.error("É necessário uma quantidade de pessoas")
                          return
                        }
                        setGenerateListPDF(true)
                      }}><ModernIcon icon={faClipboardList} text="Gerar Lista" distance={45}></ModernIcon></span>
                    </>
                  }
                </div>
                {generateListPDF && (
                  <>
                    <div className="info-report-body">
                      <div className="table-header">
                        <h2 className="coluna-1">Produto</h2>
                        <h2 className="coluna-2">QNT.</h2>
                        <h2 className="resto-colunas">Unidade</h2>
                        <h2 className="resto-colunas">Fornecedor</h2>
                      </div>
                      <ul>
                        {editablePdfProducts.map((p: pdfProduct, index) => (
                          <li key={`${p.nome}-${index}`}>
                            <span className="coluna-1">{p.nome}</span>
                            <span className="coluna-2"><input value={p.quantidade} type="text" onChange={e => handleQuantidadeChange(index, e.target.value)} /></span>
                            <span className="resto-colunas">{p.unidade}</span>
                            <span className="resto-colunas">{p.fornecedor}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </>
                )}
              </div>
              :
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
                  <h2 className="clicable-element" onClick={() => handleSort("nome")}>Produto</h2>
                  <h2>Mult. (p/pessoa)</h2>
                  <h2>Unidade</h2>
                  <h2 className="clicable-element" onClick={() => handleSort("fornecedor")}>Fornecedor</h2>
                  <div className="add-icon"><span onClick={() => { setModalMode("add"); setopenModalProduct(true); setSelectedProduct(EMPTY_PRODUCT) }}><ModernIcon direction="vertical-down" icon={faPlusCircle} text="Adicionar Item"></ModernIcon></span></div>
                </div>
                <ul>
                  {sortedProducts.map(p => (
                    <li key={p.id}>
                      <div className="info-bd">
                        <span className="filter-width"></span>
                        <span>{p.nome}</span>
                        <span>{p.valor}</span>
                        <span>{p.unidade}</span>
                        <span>{p.fornecedor}</span>
                        <div className="icones"><span className="modernIcon" onClick={() => { setModalMode("edit"); setSelectedProduct(p); setopenModalProduct(true) }}><ModernIcon distance={40} direction="horizontal-left" icon={faPenToSquare} text="Editar"></ModernIcon></span>
                          <span onClick={async () => { setSelectedProduct(p); const userReturn = await confirmDelete(); if (userReturn) deleteProduct(p.id) }} className="modernIcon"><ModernIcon direction="horizontal-right" icon={faTrash} text="Excluir"></ModernIcon></span></div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            }
          </>
        </div>
      </div>
    </div >
  )
}
