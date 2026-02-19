import { useEffect, useState } from "react";
import { toast } from "react-toastify";

type Direction =
    | "horizontal-left"
    | "horizontal-right"
    | "vertical-up"
    | "vertical-down";

type ParcelaPagamentoProps = {
    valor: string | number,
    text: string[],
    direction?: Direction,
    distance?: number,
    nParcela: string,
    onChange: (valor: string) => void,
    idPagamento: number
};

export default function ParcelaPagamento({
    valor,
    text,
    direction = "horizontal-right",
    distance = 30,
    nParcela = "p1",
    idPagamento,
    onChange
}: ParcelaPagamentoProps) {
    const [showDropdown, setShowDropdown] = useState(false);
    const [activePagamento, setActivePagamento] = useState(false)
    const [statusPagamento, setStatusPagamento] = useState<"pago" | "atrasado" | "invalido">("invalido")
    const [textoParcela, setTextoParcela] = useState<string | number>(valor)




    useEffect(() => {
        const parcelaActions: Record<string, () => void> = {
            "p1": () => evaluateP(1),
            "p2": () => evaluateP(2),
            "p3": () => evaluateP(6),
            "p4": () => evaluateP(7),
            "p5": () => evaluateP(8),
            "p6": () => evaluateP(9),
            "p7": () => evaluateP(10),
            "p8": () => evaluateP(11),
        };

        const evaluateP = (m: number): void => {
            if (textoParcela === "PIX" || textoParcela === "CC" || textoParcela === "BOL.")
                setStatusPagamento("pago")
            else {
                const now = new Date()
                const day = now.getDate()
                const month = now.getMonth() + 1

                if (month < m)
                    setStatusPagamento("invalido")

                else if (month === m)
                    day > 9 ? setStatusPagamento("atrasado") : setStatusPagamento("invalido")
                else {
                    setStatusPagamento("atrasado")
                }

            }
        }
        parcelaActions[nParcela]()
    }, [nParcela, textoParcela])

    return (
        <div
            className="drop-down"
            onClick={() => showDropdown === false ? setShowDropdown(true) : setShowDropdown(false)}
        >
            <span onClick={() => activePagamento ? setActivePagamento(false) : setActivePagamento(true)} className={`
                ${activePagamento ? "pagamento activepagamento" : "pagamento"} ${statusPagamento}`
            }><p className="texto-parcela">{textoParcela}</p></span>
            <div
                className={`dropdown-content ${direction} ${showDropdown ? "show" : ""}`}
                style={{ "--dropdown-distance": `${distance}px` } as React.CSSProperties}
                onClick={(e) => e.stopPropagation()}
            >
                <select value={valor} onChange={async (e) => {
                    setActivePagamento(false)
                    setShowDropdown(false)
                    setTextoParcela(e.target.value)

                    onChange(e.target.value)

                    const response = await fetch(`${process.env.REACT_APP_API_URL}/editpagamento/${idPagamento}`, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json", },
                        body: JSON.stringify({ parcelaEdit: nParcela, valorParcela: e.target.value }),
                    })
                    if (response.ok) {
                        toast.success("Baixa efetuada")
                    }

                    else
                        toast.error(`Erro: ${response.statusText}`)
                }}>
                    {text.map(t => (
                        <option key={t} value={t}>{t}</option>
                    ))}
                </select>
            </div>
        </div>
    );
}
