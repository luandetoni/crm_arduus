const nodemailer = require('nodemailer');

/**
 * Envia um email usando a configuração definida nas variáveis de ambiente
 * @param {Object} options Opções para o email
 * @param {String} options.email Endereço de email do destinatário
 * @param {String} options.subject Assunto do email
 * @param {String} options.text Conteúdo de texto do email (opcional se html for fornecido)
 * @param {String} options.html Conteúdo HTML do email (opcional se text for fornecido)
 * @param {Array} options.attachments Anexos para o email (opcional)
 * @returns {Promise} Promise resolvida/rejeitada do envio do email
 */
const sendEmail = async (options) => {
  // Criar transportador reutilizável usando SMTP
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_PORT === '465', // true para 465, false para outros portas
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  // Definir opções do email
  const mailOptions = {
    from: `CRM <${process.env.SMTP_USER}>`,
    to: options.email,
    subject: options.subject,
    text: options.text,
    html: options.html,
    attachments: options.attachments,
  };

  // Enviar email
  return await transporter.sendMail(mailOptions);
};

/**
 * Envia um email de boas-vindas para um novo usuário
 * @param {Object} user Objeto de usuário com email e nome
 * @returns {Promise} Promise do envio do email
 */
const sendWelcomeEmail = async (user) => {
  const subject = 'Bem-vindo ao CRM';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
      <h1 style="color: #333; text-align: center;">Bem-vindo ao CRM</h1>
      <p>Olá, ${user.name}!</p>
      <p>Estamos felizes em tê-lo como parte da nossa equipe. O CRM foi projetado para ajudá-lo a gerenciar seus clientes e vendas de forma eficiente.</p>
      <p>Para começar, você pode:</p>
      <ul>
        <li>Personalizar seu perfil</li>
        <li>Adicionar seus primeiros contatos</li>
        <li>Começar a registrar suas atividades</li>
      </ul>
      <p>Se tiver alguma dúvida, não hesite em entrar em contato conosco.</p>
      <p style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
        <span style="color: #777;">CRM - Gerenciamento de Relacionamento com o Cliente</span>
      </p>
    </div>
  `;

  return sendEmail({
    email: user.email,
    subject,
    html,
  });
};

/**
 * Envia uma notificação de tarefa atribuída
 * @param {Object} options Opções para o email de notificação
 * @param {Object} options.user Objeto de usuário destinatário
 * @param {Object} options.task Objeto da tarefa
 * @param {Object} options.assigner Objeto do usuário que atribuiu a tarefa
 * @returns {Promise} Promise do envio do email
 */
const sendTaskAssignmentEmail = async (options) => {
  const subject = `Nova tarefa atribuída: ${options.task.title}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
      <h1 style="color: #333; text-align: center;">Nova Tarefa Atribuída</h1>
      <p>Olá, ${options.user.name}!</p>
      <p>${options.assigner.name} atribuiu uma nova tarefa a você.</p>
      
      <div style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #4a90e2; margin: 20px 0;">
        <h2 style="margin-top: 0; color: #4a90e2;">${options.task.title}</h2>
        <p><strong>Descrição:</strong> ${options.task.description || 'Nenhuma descrição fornecida.'}</p>
        <p><strong>Prioridade:</strong> ${options.task.priority}</p>
        <p><strong>Data de Vencimento:</strong> ${new Date(options.task.dueDate).toLocaleDateString('pt-BR')}</p>
      </div>
      
      <p>Você pode visualizar mais detalhes e gerenciar esta tarefa no sistema CRM.</p>
      <p style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
        <span style="color: #777;">CRM - Gerenciamento de Relacionamento com o Cliente</span>
      </p>
    </div>
  `;

  return sendEmail({
    email: options.user.email,
    subject,
    html,
  });
};

/**
 * Envia um relatório por email
 * @param {Object} options Opções para o email de relatório
 * @param {String} options.email Email do destinatário
 * @param {String} options.subject Assunto do email
 * @param {String} options.reportName Nome do relatório
 * @param {String} options.periodDescription Descrição do período do relatório
 * @param {String} options.summaryText Texto de resumo do relatório
 * @param {Buffer} options.attachmentBuffer Buffer do arquivo PDF ou Excel
 * @param {String} options.attachmentFilename Nome do arquivo anexo
 * @returns {Promise} Promise do envio do email
 */
const sendReportEmail = async (options) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
      <h1 style="color: #333; text-align: center;">Relatório: ${options.reportName}</h1>
      <p>Olá,</p>
      <p>Segue anexo o relatório "${options.reportName}" para ${options.periodDescription}.</p>
      
      <div style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #4a90e2; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #4a90e2;">Resumo</h3>
        <p>${options.summaryText}</p>
      </div>
      
      <p>Este relatório foi gerado automaticamente pelo sistema CRM.</p>
      <p style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
        <span style="color: #777;">CRM - Gerenciamento de Relacionamento com o Cliente</span>
      </p>
    </div>
  `;

  return sendEmail({
    email: options.email,
    subject: options.subject,
    html,
    attachments: [
      {
        filename: options.attachmentFilename,
        content: options.attachmentBuffer,
      },
    ],
  });
};

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendTaskAssignmentEmail,
  sendReportEmail,
};