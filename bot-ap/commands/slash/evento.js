const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require("discord.js");
const { tables } = require("../../database/db");
const { sucesso, erro, info } = require("../../utils/embeds");
const { isAdmin } = require("../../utils/permissions");
const { ownerID } = require("../../config.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("evento")
    .setDescription("Gerenciar eventos personalizados de apostado (Admin)")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(s => s.setName("criar")
      .setDescription("Criar um novo evento")
      .addStringOption(o => o.setName("nome").setDescription("Nome do evento").setRequired(true))
      .addStringOption(o => o.setName("tipo").setDescription("Tipo: vitorias | derrotas").addChoices({ name: "Vitorias", value: "vitorias" }, { name: "Derrotas", value: "derrotas" }).setRequired(true))
      .addStringOption(o => o.setName("premiacao").setDescription("Descricao do premio").setRequired(false))
      .addIntegerOption(o => o.setName("wo_timeout").setDescription("Tempo de W.O em segundos").setRequired(false))
      .addBooleanOption(o => o.setName("revanche").setDescription("Permitir revanche").setRequired(false))
      .addIntegerOption(o => o.setName("consecutivo").setDescription("Vitorias consecutivas necessarias").setRequired(false)))
    .addSubcommand(s => s.setName("listar").setDescription("Listar eventos ativos"))
    .addSubcommand(s => s.setName("encerrar").setDescription("Encerrar um evento pelo ID").addIntegerOption(o => o.setName("id").setDescription("ID do evento").setRequired(true)))
    .addSubcommand(s => s.setName("notificar").setDescription("Notificar um evento")
      .addStringOption(o => o.setName("modalidade").setDescription("Modalidade do evento").setRequired(true))
      .addChannelOption(o => o.setName("canal").setDescription("Canal de notificação").setRequired(true))
      .addStringOption(o => o.setName("mensagem").setDescription("Mensagem personalizada").setRequired(false))),

  async execute(interaction) {
    const { guild, member, options } = interaction;
    const flags = MessageFlags.Ephemeral;
    if (!isMediador(member, guild.id, ownerID)) return interaction.reply({ embeds: [erro("Acesso Negado", "Acesso Negado")], flags });

    const sub = options.getSubcommand();

    if (sub === "notificar") {
      const tipo  = options.getString("modalidade");
      const canal = options.getChannel("canal");
      const msg   = options.getString("mensagem") || "Partida disponivel para mediacao no canal secundario.";
      
      const evtEmbed = info("Notificação de Evento: " + tipo, "### Protocolo de Engajamento\n" + msg)
        .addFields({ name: "Localização", value: "<#" + canal.id + ">", inline: true });

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId("evento_participar").setLabel("Participar").setStyle(ButtonStyle.Primary)
      );

      await canal.send({ content: "@here", embeds: [evtEmbed], components: [row] });
      return interaction.reply({ embeds: [sucesso("Evento Iniciado", "As notificações de " + tipo + " foram disparadas.")], flags });
    }

    if (sub === "criar") {
      const nome = options.getString("nome");
      const tipo = options.getString("tipo");
      const premio = options.getString("premiacao") || "Coins e Honra";
      const wo = options.getInteger("wo_timeout") || 300;
      const rev = options.getBoolean("revanche") || false;
      const con = options.getInteger("consecutivo") || 0;

      const res = tables.eventos.insert({
        guild_id: guild.id,
        nome: nome,
        tipo: tipo,
        premiacao: premio,
        wo_timeout: wo,
        permite_revanche: rev ? 1 : 0,
        req_consecutivo: con,
        ativo: 1,
        criado_em: new Date().toISOString()
      });

      const embed = sucesso("Evento Criado", "O evento '" + nome + "' está agora em operação no sistema.")
        .addFields(
          { name: "Identificador", value: "```\n#" + res.id + "\n```", inline: true },
          { name: "Tipo Operação", value: "```\n" + tipo + "\n```", inline: true },
          { name: "Premiação",   value: "```\n" + premio + "\n```", inline: true },
          { name: "Consecutividade", value: "```\n" + (con > 0 ? con + " Vitorias" : "Nenhum") + "\n```", inline: false }
        );
      return interaction.reply({ embeds: [embed] });
    }

    if (sub === "listar") {
      const evs = tables.eventos.filter(e => e.guild_id === guild.id && e.ativo === 1);
      if (!evs.length) return interaction.reply({ embeds: [info("SISTEMA VAZIO", "NÃO HÁ EVENTOS PROGRAMADOS OU EM ANDAMENTO NO MOMENTO.")], flags });
      const embed = info("Eventos Ativos: Operacionais", "Participe das atividades para garantir recompensas exclusivas.")
        .setDescription("```\n" + evs.map(e => "ID #" + e.id + ": " + e.nome + "\nTipo: " + e.tipo + " | Prêmio: " + e.premiacao).join("\n\n") + "\n```");
      return interaction.reply({ embeds: [embed] });
    }

    if (sub === "encerrar") {
      const id = options.getInteger("id");
      tables.eventos.update(e => e.id === id && e.guild_id === guild.id, { ativo: 0 });
      return interaction.reply({ embeds: [sucesso("EVENTO ENCERRADO", "O EVENTO #" + id + " FOI DEVIDAMENTE FINALIZADO E REMOVIDO DA LISTAGEM ATIVA.") ] });
    }
  }
};
