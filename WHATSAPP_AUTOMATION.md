# Sistema de Automação WhatsApp

Este documento descreve o sistema completo de automação de mensagens WhatsApp implementado no sistema de agendamentos.

## Funcionalidades Implementadas

### 1. Envio Automático de Confirmação

Quando um cliente completa um agendamento, o sistema:
- Cria o agendamento no banco de dados
- Chama automaticamente a Edge Function `send-whatsapp-confirmation`
- Gera uma mensagem formatada com todos os detalhes do agendamento
- Abre o WhatsApp Web com a mensagem pré-preenchida
- Registra o envio no log de mensagens

**Formato da mensagem:**
```
✅ Seu agendamento foi confirmado com sucesso!

❗Informações 👇

📅 Data: {{data}}
⏰ Horário: {{horario}}
💈 Serviço: {{servico}}
💇 Profissional: {{profissional}}
💵 Valor: R$ {{valor}}

Para cancelar esse agendamento digite a palavra: cancelar
```

### 2. Lembretes Automáticos

O sistema envia lembretes 1 hora antes do horário agendado através da Edge Function `cron-send-reminders`.

**Como funcionar:**
- A função verifica agendamentos que ocorrerão entre 1 e 2 horas a partir do momento da execução
- Envia lembretes apenas para agendamentos confirmados que ainda não receberam lembrete
- Marca os agendamentos como "lembrete enviado" para evitar duplicação
- Registra todos os envios no log

**Formato da mensagem:**
```
Boa tarde {{nome_cliente}}, só estou passando aqui para lembrar que você tem um horário agendado conosco hoje às {{horario}}. Espero por você, até breve!

⚠️ Atenção:
Tolerância de até 5 minutos. Após esse tempo, seu horário será cedido a outro cliente.
```

**Para ativar os lembretes automáticos:**

Você precisa configurar um serviço de cron job externo para chamar a função periodicamente. Opções recomendadas:

1. **cron-job.org** (Gratuito)
   - URL: `https://csgzrnyqnyqszowbvkud.supabase.co/functions/v1/cron-send-reminders`
   - Método: POST
   - Frequência: A cada 15 minutos
   - Headers: `Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzZ3pybnlxbnlxc3pvd2J2a3VkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2MDAzNjksImV4cCI6MjA3NzE3NjM2OX0.BFlPE5N0aGNXA2hfeNoRRVA4YbbvmSraN-S-DoO9y5g`

2. **EasyCron** (Gratuito com limitações)
3. **Supabase Cron Jobs** (Se disponível no seu plano)

### 3. Cancelamento via WhatsApp

Clientes podem cancelar agendamentos enviando a palavra "cancelar" via WhatsApp.

**Como funciona:**
- Cliente envia mensagem com a palavra "cancelar"
- Webhook recebe a mensagem na Edge Function `whatsapp-webhook`
- Sistema identifica o agendamento pelo número de telefone
- Verifica se o cancelamento está dentro do prazo (2 horas antes)
- Se permitido, cancela o agendamento e libera o horário
- Envia mensagem de confirmação ou erro

**Mensagem de sucesso:**
```
❌ Agendamento cancelado com sucesso!
O horário das {{horario}} do dia {{data}} foi liberado.
Esperamos você em uma próxima oportunidade!
```

**Mensagem de erro (fora do prazo):**
```
⚠️ O cancelamento só é permitido até 2 horas antes do seu horário.
Entre em contato com o barbeiro para mais informações.
```

### 4. Bloqueio Automático de Horários

O sistema gerencia automaticamente a disponibilidade de horários:
- Quando um agendamento é criado, o horário é bloqueado
- Outros clientes não conseguem selecionar o mesmo horário
- Se um agendamento é cancelado, o horário é liberado automaticamente
- A verificação de disponibilidade ocorre em tempo real

### 5. Painel Administrativo - Logs WhatsApp

O painel admin agora inclui uma aba "WhatsApp Logs" onde você pode:
- Visualizar todas as mensagens enviadas
- Ver estatísticas de envios (total, enviadas, falhadas, pendentes)
- Filtrar mensagens por tipo (confirmação, lembrete, cancelamento)
- Ver detalhes de cada mensagem incluindo conteúdo e horário
- Identificar mensagens com erro
- Disparar lembretes manualmente através do botão "Enviar Lembretes"

## Estrutura do Banco de Dados

### Tabela: whatsapp_logs
Registra todas as mensagens WhatsApp enviadas pelo sistema.

```sql
- id: uuid (PK)
- appointment_id: uuid (FK para appointments)
- message_type: text (confirmation, reminder, cancellation_success, cancellation_error)
- recipient_number: text
- message_content: text
- status: text (pending, sent, failed, delivered)
- error_message: text (nullable)
- sent_at: timestamptz
- delivered_at: timestamptz (nullable)
- created_at: timestamptz
```

### Tabela: whatsapp_templates
Armazena templates de mensagens configuráveis.

```sql
- id: uuid (PK)
- template_type: text (confirmation, reminder, cancellation_success, cancellation_error)
- template_content: text
- active: boolean
- created_at: timestamptz
- updated_at: timestamptz
```

### Campos Adicionados em appointments
```sql
- reminder_sent: boolean (indica se lembrete foi enviado)
- reminder_sent_at: timestamptz (quando o lembrete foi enviado)
- cancellation_token: text (token para cancelamento seguro - reservado para uso futuro)
- cancellation_requested_at: timestamptz (quando cancelamento foi solicitado)
```

## Edge Functions Implementadas

### 1. send-whatsapp-confirmation
- **URL:** `https://csgzrnyqnyqszowbvkud.supabase.co/functions/v1/send-whatsapp-confirmation`
- **Método:** POST
- **Chamada:** Automática após criação de agendamento
- **Payload:**
```json
{
  "appointmentId": "uuid",
  "customerName": "string",
  "customerWhatsapp": "string",
  "appointmentDate": "string",
  "appointmentTime": "string",
  "serviceName": "string",
  "servicePrice": number
}
```

### 2. cron-send-reminders
- **URL:** `https://csgzrnyqnyqszowbvkud.supabase.co/functions/v1/cron-send-reminders`
- **Método:** POST ou GET
- **Chamada:** Via cron job externo (recomendado: a cada 15 minutos)
- **Retorno:**
```json
{
  "success": true,
  "message": "X de Y lembretes processados",
  "count": number,
  "successCount": number,
  "failureCount": number,
  "results": [...],
  "checkedAt": "ISO datetime"
}
```

### 3. whatsapp-webhook
- **URL:** `https://csgzrnyqnyqszowbvkud.supabase.co/functions/v1/whatsapp-webhook`
- **Método:** POST
- **Chamada:** Webhook de API WhatsApp (quando configurado)
- **Payload:**
```json
{
  "customerWhatsapp": "string",
  "message": "string"
}
```

## Configuração de API WhatsApp (Para Implementação Completa)

Atualmente, o sistema gera links WhatsApp que abrem o WhatsApp Web. Para automação completa, você precisa integrar com uma API WhatsApp:

### Opções de API:

1. **WhatsApp Business API (Oficial)**
   - Mais confiável
   - Requer processo de aprovação
   - Custos variáveis
   - URL: https://business.whatsapp.com/

2. **Twilio**
   - Fácil integração
   - Boa documentação
   - Preço por mensagem
   - URL: https://www.twilio.com/whatsapp

3. **Z-API** (Brasileiro)
   - Suporte em português
   - Preços acessíveis
   - Boa para pequenos negócios
   - URL: https://www.z-api.io/

4. **Evolution API** (Open Source)
   - Gratuito (self-hosted)
   - Requer servidor próprio
   - Mais técnico
   - URL: https://github.com/EvolutionAPI/evolution-api

### Para Integrar uma API WhatsApp:

1. Escolha e configure uma das APIs acima
2. Obtenha as credenciais (API Key, Token, etc.)
3. Modifique as Edge Functions para usar a API escolhida em vez de gerar links
4. Atualize o código de envio nas funções:

```typescript
// Exemplo com Twilio
const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
const authToken = Deno.env.get('TWILIO_AUTH_TOKEN');
const client = twilio(accountSid, authToken);

await client.messages.create({
  from: 'whatsapp:+551199999999',
  body: message,
  to: `whatsapp:+55${cleanPhone}`
});
```

## Personalizando Templates de Mensagens

Para personalizar as mensagens:

1. Acesse o Supabase Dashboard
2. Navegue até a tabela `whatsapp_templates`
3. Edite o campo `template_content` do template desejado
4. Use as seguintes variáveis:
   - `{{data}}` - Data do agendamento
   - `{{horario}}` - Horário do agendamento
   - `{{servico}}` - Nome do serviço
   - `{{profissional}}` - Nome do profissional
   - `{{valor}}` - Valor do serviço
   - `{{nome_cliente}}` - Nome do cliente

## Monitoramento e Logs

### Via Painel Admin:
- Acesse o painel administrativo
- Clique na aba "WhatsApp Logs"
- Visualize estatísticas e mensagens enviadas

### Via Supabase Dashboard:
- Acesse o Supabase Dashboard
- Navegue até a tabela `whatsapp_logs`
- Filtre por status, tipo de mensagem ou data

## Testando o Sistema

### 1. Teste de Confirmação:
1. Faça um novo agendamento pelo site
2. Verifique se a mensagem de confirmação aparece no WhatsApp Web
3. Confira o log na aba "WhatsApp Logs" do painel admin

### 2. Teste de Lembrete:
1. No painel admin, clique em "Enviar Lembretes"
2. O sistema verificará agendamentos nas próximas 1-2 horas
3. Verifique os logs para confirmar o envio

### 3. Teste de Cancelamento:
1. Crie um agendamento de teste para daqui a 3+ horas
2. Chame a função webhook simulando um cancelamento:
```bash
curl -X POST https://csgzrnyqnyqszowbvkud.supabase.co/functions/v1/whatsapp-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "customerWhatsapp": "11999999999",
    "message": "cancelar"
  }'
```

## Troubleshooting

### Mensagens não estão sendo enviadas:
1. Verifique se o número do WhatsApp está configurado em `business_settings`
2. Confira os logs de erro na tabela `whatsapp_logs`
3. Verifique se as Edge Functions estão ativas no Supabase Dashboard

### Lembretes não estão funcionando:
1. Confirme que o cron job está configurado e ativo
2. Teste manualmente via botão no painel admin
3. Verifique se há agendamentos nas próximas 1-2 horas

### Cancelamentos não funcionam:
1. Verifique se o webhook está configurado na API WhatsApp
2. Teste manualmente chamando a função diretamente
3. Confira se o número de telefone do cliente está correto

## Próximos Passos Recomendados

1. **Integrar API WhatsApp oficial** - Para envio automático sem intervenção manual
2. **Adicionar notificações para o admin** - Quando novos agendamentos são criados
3. **Implementar confirmação de leitura** - Tracking se o cliente leu a mensagem
4. **Adicionar templates personalizáveis via UI** - Editar templates direto no painel admin
5. **Criar dashboard de métricas** - Taxa de no-show, taxa de cancelamento, etc.
6. **Implementar sistema de fila** - Para envios em massa mais eficientes
7. **Adicionar suporte a múltiplos profissionais** - Cada um com seu WhatsApp

## Suporte

Para dúvidas ou problemas:
1. Verifique os logs no painel administrativo
2. Consulte a documentação do Supabase Edge Functions
3. Revise os logs das funções no Supabase Dashboard

---

**Desenvolvido para:** Sistema de Agendamentos Onzy Barber
**Última atualização:** Outubro 2025
