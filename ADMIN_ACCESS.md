# Acesso ao Painel Administrativo

## Como Acessar

Para acessar o painel administrativo da Onzy Barber, você tem duas opções:

### Opção 1: Navegar pela URL (Recomendado)
1. Abra seu navegador
2. Digite na barra de endereços: `seu-dominio.com/` e clique no botão "Início"
3. Na URL, adicione `#admin` ao final: `seu-dominio.com/#admin`
4. Ou simplesmente navegue até a página inicial e no console do navegador digite:
   ```javascript
   window.location.hash = 'admin'
   ```

### Opção 2: Acesso Direto pela Aplicação
1. Abra o arquivo `src/App.tsx`
2. Localize a linha que define `currentPage`
3. Temporariamente altere para `useState<Page>('admin')` para testar

## Senha Padrão
- **Senha:** `onzy2025`

## Alterando a Senha
1. Acesse o painel administrativo
2. Clique em "Configurações"
3. Role até "Senha do Painel Administrativo"
4. Digite a nova senha
5. Clique em "Salvar Configurações"

## Recursos do Painel

### Dashboard Principal
- Visualizar todos os agendamentos
- Filtrar por status (Todos, Pendentes, Confirmados, Cancelados)
- Confirmar ou cancelar agendamentos
- Atualização automática a cada 30 segundos
- Botão de atualização manual

### Configurações
- **Dias Fixos de Folga:** Configure quais dias da semana você não trabalha
- **Datas Específicas de Folga:** Adicione feriados ou dias específicos de descanso
- **Horário de Funcionamento:** Defina hora de início e término do expediente
- **Intervalo Entre Agendamentos:** Escolha 15, 30, 45 ou 60 minutos
- **WhatsApp da Barbearia:** Configure o número para notificações automáticas
- **Senha do Painel:** Altere a senha de acesso

## Segurança
- A autenticação é mantida durante a sessão do navegador
- Ao fechar o navegador, será necessário fazer login novamente
- Não compartilhe a senha do painel administrativo
- Apenas pessoas autorizadas devem ter acesso

## Notificações WhatsApp
Para ativar as notificações automáticas:
1. Acesse Configurações
2. Preencha o campo "WhatsApp da Barbearia" com o número no formato: `5511987654321`
3. Salve as configurações
4. Quando um cliente fizer um agendamento, uma mensagem será aberta automaticamente

## Suporte
Em caso de problemas ou dúvidas, entre em contato com o desenvolvedor do sistema.
