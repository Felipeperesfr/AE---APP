import express, { NextFunction, Request, Response } from "express";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";
import archiver from "archiver";
import cors from "cors";
import path from "path";
import fs from "fs/promises";
import fsSync from "fs";
import cron from "node-cron";
import axios from "axios";
import multer from "multer";
import csv from "csv-parser";
import { v4 as uuid } from "uuid";

const app = express();
app.use(express.json());
app.use(cors());

const dbPath = path.join(process.cwd(), "data", "database.json");
const TMP_PATH = path.join(process.cwd(), "data", "database.tmp.json");
const DATA_DIR = path.join(process.cwd(), "data");
const TENANT_ID = "03d2f93d-c2fa-40e9-9760-63b25ce264dd";
const CLIENT_ID = "21b125b4-781b-4e45-9f26-4a71e99a502c";
const CLIENT_SECRET = "0f08Q~patCimdBicIukLFMMg80sJq30QuN_mnbEy";

type produto = {
  nome: String;
  unidade: String;
  fornecedor: String;
  valor: number;
  id: string;
};

type pagamentos = {
  id: string;
  p1: string;
  p2?: string;
  p3?: string;
  p4?: string;
  p5?: string;
  p6?: string;
  p7?: string;
  p8?: string;
};

type escola = {
  nome: string;
  id: number;
};

type aluno = {
  id: string;
  nome: string;
  escola: string;
  tel1: string;
  tel2: string | null;
  qntParcelas: number;
  valorParcelas: number;
  ano: string;
  turma: string;
  anotações: string | null;
  status: string;
  metodo: string;
};

const EMPTY_DB = {
  alunos: [],
  pagamentos: [],
  products: [],
  escolas: [],
};

function isPagamentoAtrasado(
  value: string | number,
  parcelaMes: number,
): boolean {
  if (value === "PIX" || value === "CC" || value === "BOL.") {
    return false;
  }

  const now = new Date();
  const day = now.getDate();
  const month = now.getMonth() + 1;

  if (month < parcelaMes) return false;

  if (month === parcelaMes) {
    return day > 9;
  }

  return true;
}

async function recalculateStatus(pagamento: pagamentos, db: any) {
  const aluno = db.alunos.find((a: aluno) => a.id === pagamento.id);
  if (!aluno) return;

  if (aluno.status === "Cancelado") return;

  let atrasado = false;
  for (const [key, value] of Object.entries(pagamento)) {
    if (key === "id") continue;

    const parcelaMes = Number(key.slice(1)) + 3;

    if (isPagamentoAtrasado(value as string, parcelaMes)) {
      atrasado = true;
      break;
    }
  }

  aluno.status = atrasado ? "Pagamento atrasado" : "Pagamento em dia";
}

async function recalculateStatuses(db: any) {
  db.pagamentos.forEach((pagamento: pagamentos) => {
    const aluno = db.alunos.find((a: aluno) => a.id === pagamento.id);
    if (!aluno) return;

    if (aluno.status === "Cancelado") return;

    let atrasado = false;

    for (const [key, value] of Object.entries(pagamento)) {
      if (key === "id") continue;

      const parcelaMes = Number(key.slice(1)) + 3;

      if (isPagamentoAtrasado(value as string, parcelaMes)) {
        atrasado = true;
        break;
      }
    }

    aluno.status = atrasado ? "Pagamento atrasado" : "Pagamento em dia";
  });

  await saveDB(db);
}

async function ensureDBExists() {
  await fs.mkdir(DATA_DIR, { recursive: true });

  try {
    await fs.access(dbPath);
  } catch {
    await fs.writeFile(dbPath, JSON.stringify(EMPTY_DB, null, 2), "utf-8");
  }
}

let dbQueue = Promise.resolve<any>(null);

export async function reportTemplate(
  fornecedor: string,
  peopleQuantity: number,
) {
  const data = await loadDB();
  const filteredProducts: produto[] = data.products.filter(
    (p: produto) => p.fornecedor === fornecedor,
  );
  const mappedProducts = filteredProducts.map((p: produto) => ({
    ...p,
    valor: Math.ceil(p.valor * peopleQuantity),
  }));

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />

        <style>
          @page {
            size: A4;
            margin: 20mm;
          }

          body {
            font-family: Arial, sans-serif;
            font-size: 12px;
          }

          h1 {
            text-align: center;
            margin-bottom: 16px;
          }

          table {
            width: 100%;
            border-collapse: collapse;
          }

          th, td {
            border: 1px solid #ccc;
            padding: 6px;
            text-align: left;
          }

          thead {
            background: #f5f5f5;
          }

          tr {
            page-break-inside: avoid;
          }
        </style>
      </head>

      <body>
        <h1>${fornecedor}</h1>

        <table>
          <thead>
            <tr>
              <th>Produto</th>
              <th>Qtd</th>
              <th>Unidade</th>
            </tr>
          </thead>

          <tbody>
            ${mappedProducts
              .map(
                (p) => `
              <tr>
                <td>${p.nome}</td>
                <td>${p.valor}</td>
                <td>${p.unidade}</td>
              </tr>
            `,
              )
              .join("")}
          </tbody>
        </table>
      </body>
    </html>
  `;
}

function buildPagamentos(id: string, parcelas: number): pagamentos {
  const pagamento: pagamentos = { id, p1: "" };

  for (let i = 2; i <= parcelas && i <= 8; i++) {
    (pagamento as any)[`p${i}`] = "";
  }

  return pagamento;
}

function loadDB() {
  dbQueue = dbQueue.then(async () => {
    await ensureDBExists();
    const raw = await fs.readFile(dbPath, "utf-8");
    return JSON.parse(raw);
  });

  return dbQueue;
}

function saveDB(db: any) {
  dbQueue = dbQueue.then(async () => {
    await ensureDBExists();

    const json = JSON.stringify(db, null, 2);

    await fs.writeFile(TMP_PATH, json, "utf-8");

    try {
      await fs.unlink(dbPath);
    } catch {}

    await fs.rename(TMP_PATH, dbPath);

    return db;
  });

  return dbQueue;
}

app.post("/api/getPDFFiles", async (req: Request, res: Response) => {
  let browser;

  try {
    const fornecedor = req.body.fornecedor;
    const peopleQuantity = req.body.peopleQuantity;

    browser = await puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: true,
    });

    // 🔽 MULTIPLE PDFs (ZIP)
    if (fornecedor === "Todos Fornecedores") {
      const fornecedores: string[] = req.body.fornecedores;

      const archive = archiver("zip", { zlib: { level: 9 } });

      res.setHeader("Content-Type", "application/zip");
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=relatorios.zip",
      );

      archive.on("error", (err) => {
        console.error("🔥 ARCHIVE ERROR:", err);
        if (!res.headersSent) {
          res.status(500).end();
        }
      });

      archive.pipe(res);

      for (const f of fornecedores) {
        const html = await reportTemplate(f, peopleQuantity);
        const page = await browser.newPage();

        await page.setContent(html, {
          waitUntil: "domcontentloaded", // ✅ safer than networkidle0
        });

        const pdfBuffer = await page.pdf({
          format: "A4",
          printBackground: true,
        });

        await page.close();

        archive.append(Buffer.from(pdfBuffer), {
          name: `${f}.pdf`,
        });
      }

      await archive.finalize();
      return;
    }

    // 🔽 SINGLE PDF
    const html = await reportTemplate(fornecedor, peopleQuantity);
    const page = await browser.newPage();

    await page.setContent(html, {
      waitUntil: "domcontentloaded", // ✅ safer
    });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
    });

    await page.close();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "inline; filename=report.pdf");
    res.setHeader("Content-Length", pdfBuffer.length.toString());

    return res.end(pdfBuffer);
  } catch (err) {
    console.error("🔥 PDF ERROR:", err);

    if (!res.headersSent) {
      return res.status(500).json({
        error: "Erro ao gerar PDF",
        details: err instanceof Error ? err.message : err,
      });
    }
  } finally {
    if (browser) {
      try {
        await browser.close();
      } catch (e) {
        console.error("Erro ao fechar browser:", e);
      }
    }
  }
});

app.get("/api/getproducts", async (req: Request, res: Response) => {
  const db = await loadDB();
  return res.json(db.products);
});

app.get("/api/getalunos", async (req: Request, res: Response) => {
  const db = await loadDB();
  return res.json(db.alunos);
});

app.get("/api/getpagamentos", async (req: Request, res: Response) => {
  const db = await loadDB();
  return res.json(db.pagamentos);
});

app.get("/api/getescolas", async (req: Request, res: Response) => {
  const db = await loadDB();
  return res.json(db.escolas);
});

app.post("/api/login", async (req: Request, res: Response) => {
  const db = await loadDB();
  const auth = db.login;
  const user = req.body.user;
  const pw = req.body.password;

  if (!user || !pw)
    return res.status(400).json({ error: "Usuário e/ou senha não fornecidos" });

  if (user != auth.user)
    return res.status(400).json({ error: "Usuário inválido" });
  else if (pw != auth.pw)
    return res.status(400).json({ error: "Senha inválida" });
  else return res.sendStatus(200);
});

app.post("/api/newproduct", async (req: Request, res: Response) => {
  const db = await loadDB();
  const nome = req.body.nome;
  const valor = req.body.valor;

  if (!nome || valor === undefined) {
    return res.status(400).json({ error: "Nome e Mult. são obrigatórios" });
  }

  const newProduct = {
    id: Date.now(),
    ...req.body,
  };

  db.products.push(newProduct);
  await saveDB(db);

  return res.status(201).send(newProduct);
});

app.post("/api/newescola", async (req: Request, res: Response) => {
  const db = await loadDB();
  const nome = req.body.nome;

  if (!nome === undefined) {
    return res.status(400).json({ error: "Nome é obrigatório" });
  }

  const newEscola = {
    id: Date.now(),
    ...req.body,
  };

  db.escolas.push(newEscola);
  await saveDB(db);

  return res.status(201).send(db.escolas);
});

app.post("/api/newaluno", async (req: Request, res: Response) => {
  const db = await loadDB();
  const nome = req.body.nome;
  const escola = req.body.escola;
  const parcelas = req.body.parcelas;
  const id = uuid();

  if (!nome || !escola) {
    return res.status(400).json({ error: "Nome e/ou escola inválidas" });
  }

  const newAluno = {
    id: id,
    ...req.body,
  };

  const newPagamento: pagamentos = buildPagamentos(id, parcelas);

  db.alunos.push(newAluno);
  db.pagamentos.push(newPagamento);
  await saveDB(db);

  return res.status(201).send(newAluno);
});

app.delete("/api/deleteproduct/:id", async (req: Request, res: Response) => {
  const db = await loadDB();
  const id = req.params.id;

  if (!id) {
    return res.status(400).json({ error: "ID inválido" });
  }

  const index = db.products.findIndex((p: produto) => p.id === id);

  if (index === -1) {
    return res.status(404).json({ error: "Produto não encontrado" });
  }

  db.products.splice(index, 1);
  await saveDB(db);

  return res.sendStatus(200);
});

app.delete("/api/deletealuno/:id", async (req: Request, res: Response) => {
  const db = await loadDB();
  const id = req.params.id;

  if (!id) {
    return res.status(400).json({ error: "ID inválido" });
  }

  const indexAlunos = db.alunos.findIndex((a: aluno) => a.id === id);
  const indexPagamentos = db.pagamentos.findIndex(
    (p: pagamentos) => p.id === id,
  );

  if (indexAlunos === -1 || indexPagamentos === -1) {
    return res.status(404).json({ error: "Aluno não encontrado" });
  }

  db.alunos.splice(indexAlunos, 1);
  db.pagamentos.splice(indexPagamentos, 1);
  await saveDB(db);

  return res.sendStatus(200);
});

app.put("/api/editaluno/:id", async (req: Request, res: Response) => {
  const nome = req.body.nome;
  const escola = req.body.escola;
  const tel1 = req.body.tel1;
  const tel2 = req.body.tel2;
  const ano = req.body.ano;
  const turma = req.body.turma;
  const anotacoes = req.body.anotacoes;
  const status = req.body.status;
  const parcelas = Number(req.body.parcelas);
  const valor = Number(req.body.valor);
  const metodo = req.body.metodo;
  const id = req.params.id as string;
  const from = req.query.from;

  if (!from) {
    if (!nome || !escola) {
      return res.status(400).json({ error: "Nome e/ou escola inválidas" });
    }
  }

  const db = await loadDB();

  const aluno = db.alunos.find((a: aluno) => a.id === id);

  if (!aluno) {
    return res.status(404).json({ error: "Aluno não encontrado" });
  }

  if (!from) {
    aluno.nome = nome;
    aluno.escola = escola;
    aluno.tel1 = tel1;
    aluno.tel2 = tel2;
    aluno.ano = ano;
    aluno.turma = turma;
    aluno.status = status;
    aluno.valor = valor;
    aluno.anotacoes = anotacoes;
    aluno.metodo = metodo;

    if (aluno.parcelas !== parcelas) {
      aluno.parcelas = parcelas;
      const pagamentoIndex = db.pagamentos.findIndex(
        (p: pagamentos) => p.id === id,
      );
      if (pagamentoIndex !== -1) {
        db.pagamentos[pagamentoIndex] = buildPagamentos(id, parcelas);
      }
    }
  } else if (from === "pagamento") aluno.status = status;
  else if (from === "baixaAnotacao") aluno.anotacoes = anotacoes;

  await saveDB(db);

  return res.status(200).json(db.alunos);
});

app.put("/api/editpagamento/:id", async (req: Request, res: Response) => {
  const id = req.params.id;
  const parcelaEdit = req.body.parcelaEdit;
  const valorParcela = req.body.valorParcela;
  const db = await loadDB();
  const pagamento = db.pagamentos.find((p: pagamentos) => p.id === id);

  if (!pagamento) {
    return res.status(404).json({ error: "Pagamento não encontrado" });
  }

  if (!["p1", "p2", "p3", "p4", "p5", "p6", "p7", "p8"].includes(parcelaEdit)) {
    return res.status(400).json({ error: "Parcela inválida" });
  }

  pagamento[parcelaEdit] = valorParcela;

  await recalculateStatus(pagamento, db);

  await saveDB(db);

  return res.sendStatus(200);
});

app.put("/api/editproduct/:id", async (req: Request, res: Response) => {
  const nome = req.body.nome;
  const valor = req.body.valor;
  const unidade = req.body.unidade;
  const fornecedor = req.body.fornecedor;
  const id = req.params.id;

  if (!nome || valor === undefined) {
    return res.status(400).json({ error: "Nome e Mult. são obrigatórios" });
  }

  const db = await loadDB();

  const product = db.products.find((p: produto) => p.id === id);

  if (!product) {
    return res.status(404).json({ error: "Produto não encontrado" });
  }

  product.nome = nome;
  product.valor = valor;
  product.unidade = unidade;
  product.fornecedor = fornecedor;

  await saveDB(db);

  return res.status(200).json(db.products);
});

const upload = multer({
  dest: "uploads/",
});

app.post("/api/getcsv", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      error: "Arquivo não enviado",
    });
  }

  const alunos: aluno[] = [];
  const pagamentos: pagamentos[] = [];

  fsSync
    .createReadStream(req.file.path)
    .pipe(csv())
    .on("data", (row) => {
      const id = `${row.nome}-${row.escola}-${row.tel1}`;
      const aluno: aluno = {
        id: id,
        nome: row.nome,
        escola: row.escola,
        tel1: row.tel1,
        tel2: row.tel2,
        qntParcelas: row.parcelas,
        valorParcelas: row.valorparcela,
        ano: row.ano,
        turma: row.turma,
        anotações: row.anotações,
        status: "Importado",
        metodo: "",
      };
      const pagamento: pagamentos = {
        id: id,
        p1: row.PG1,
        p2: row.PG2,
        p3: row.PG3,
        p4: row.PG4,
        p5: row.PG5,
        p6: row.PG6,
        p7: row.PG7,
        p8: row.PG8 
      };
      alunos.push(aluno);
      pagamentos.push(pagamento);
    })
    .on("end", () => {
      const banco = JSON.parse(
        fsSync.readFileSync("data/database.json", "utf-8"),
      );

      for (const alunoImportado of alunos) {
        const index = banco.alunos.findIndex(
          (a: aluno) => a.id === alunoImportado.id,
        );

        if (index !== -1) {
          // UPDATE
          //banco.alunos[index] = alunoImportado;
          banco.pagamentos[index] = pagamentos.find((p:pagamentos) => p.id === alunoImportado.id)
        } else {
          // INSERT
          banco.alunos.push(alunoImportado);
          banco.pagamentos.push(pagamentos.find((p:pagamentos) => p.id === alunoImportado.id))
        }
      }

      // Salva novamente
      fsSync.writeFileSync(
        "data/database.json",
        JSON.stringify(banco, null, 2),
      );

      // Remove CSV temporário
      fsSync.unlinkSync(req.file!.path);

      return res.json({
        sucesso: true,
        adicionados: alunos.length,
      });
    });
});
cron.schedule(
  "0 0 * * *",
  async () => {
    const db = await loadDB();
    await recalculateStatuses(db);
  },
  {
    timezone: "America/Sao_Paulo",
  },
);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// BI API

app.get("/api/bi/getalunos", async (req: Request, res: Response) => {
  const db = await loadDB();
  return res.json(db.alunos);
});

app.get("/api/bi/getpagamentos", async (req: Request, res: Response) => {
  const db = await loadDB();
  return res.json(db.pagamentos);
});

export async function getPowerBIAccessToken(): Promise<string> {
  try {
    const response = await axios.post(
      `https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/token`,
      new URLSearchParams({
        grant_type: "client_credentials",
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        scope: "https://analysis.windows.net/powerbi/api/.default",
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      },
    );

    return response.data.access_token;
  } catch (error: any) {
    console.error(
      "Erro ao obter token Power BI:",
      error.response?.data || error.message,
    );

    throw error;
  }
}

async function listWorkspaces() {
  const token = await getPowerBIAccessToken();

  const response = await axios.get(
    "https://api.powerbi.com/v1.0/myorg/groups",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  console.log(response.data);
}
