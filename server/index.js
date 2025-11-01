import express from "express";
import axios from "axios";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const EVOLUTION_URL = process.env.EVOLUTION_URL; // ex: http://localhost:8080
const EVOLUTION_TOKEN = process.env.EVOLUTION_TOKEN; // token gerado no painel Evolution

// ✅ Enviar mensagem de confirmação
app.post("/send-confirmation", async (req, res) => {
  const { phone, nomeCliente, data, hora, servico, profissional, valor } = req.body;

  const mensagem = `
✅ *Seu agendamento foi confirmado com sucesso!*

📅 *Data:* ${data}
⏰ *Hora:* ${hora}
💈 *Serviço:* ${servico}
👤 *Profissional:* ${profissional}
💰 *Valor:* R$ ${valor}

Para cancelar esse agendamento, digite a palavra: *cancelar*`;

  try {
    await axios.post(`${EVOLUTION_URL}/message/text`, {
      number: phone,
      text: mensagem,
    }, {
      headers: { apikey: EVOLUTION_TOKEN },
    });

    res.json({ success: true });
  } catch (err) {
    console.error("Erro ao enviar:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ✅ Receber mensagens do cliente (cancelamento)
app.post("/webhook", async (req, res) => {
  const message = req.body?.message?.text?.toLowerCase();
  const from = req.body?.message?.from;

  if (message === "cancelar") {
    await axios.post(`${EVOLUTION_URL}/message/text`, {
      number: from,
      text: "❌ Seu agendamento foi cancelado com sucesso.",
    }, {
      headers: { apikey: EVOLUTION_TOKEN },
    });

    console.log("Agendamento cancelado para:", from);
  }

  res.sendStatus(200);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
