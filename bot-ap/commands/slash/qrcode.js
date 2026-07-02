const { SlashCommandBuilder, AttachmentBuilder, MessageFlags } = require("discord.js");
const QRCode = require("qrcode");
const { tables, getConfig, updateConfig } = require("../../database/db");
const { sucesso, erro, info } = require("../../utils/embeds");
const { isAdmin } = require("../../utils/permissions");
const { ownerID } = require("../../config.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("qrcode")
    .setDescription("Gerenciar QR Code de mediador ou da org")
    .addSubcommand(s => s.setName("ver").setDescription("Ver seu QR Code de pix"))
    .addSubcommand(s => s.setName("definir")
      .setDescription("Definir conteúdo do QR Code")
      .addStringOption(o => o.setName("conteudo").setDescription("Chave pix ou URL para o QR Code").setRequired(true)))
    .addSubcommand(s => s.setName("padrao")
      .setDescription("(Admin) Definir QR Code padrão da org")
      .addStringOption(o => o.setName("conteudo").setDescription("Conteúdo do QR Code padrão").setRequired(true))),

  async execute(interaction) {
    const flags = MessageFlags.Ephemeral;
    await interaction.deferReply({ flags });
    const { guild, user, member } = interaction;
    const sub = interaction.options.getSubcommand();

    if (sub === "padrao") {
      if (!isAdmin(member, guild.id, ownerID)) return interaction.editReply({ embeds: [erro("Acesso Negado", "Acesso Negado")] });
      const conteudo = interaction.options.getString("conteudo");
      updateConfig(guild.id, { qrcode_padrao: conteudo });
      const buf = await QRCode.toBuffer(conteudo, { width: 300, margin: 2 });
      const att = new AttachmentBuilder(buf, { name: "qrcode.png" });
      return interaction.editReply({ embeds: [sucesso("QR Code Padrão Definido", "Conteúdo: `" + conteudo + "`").setImage("attachment://qrcode.png")], files: [att] });
    }

    if (sub === "definir") {
      const conteudo = interaction.options.getString("conteudo");
      const medData = tables.mediadores.find(m => m.discord_id === user.id && m.guild_id === guild.id);
      tables.mediadores.upsert(m => m.discord_id === user.id && m.guild_id === guild.id, {
        discord_id: user.id,
        guild_id: guild.id,
        qrcode_url: conteudo,
        ativo: medData ? medData.ativo : 1
      });
      tables.jogadores.update(j => j.discord_id === user.id, { pix: conteudo });
      const buf = await QRCode.toBuffer(conteudo, { width: 300, margin: 2 });
      const att = new AttachmentBuilder(buf, { name: "qrcode.png" });
      return interaction.editReply({ embeds: [sucesso("Modificação de QR Code", "Seu código de pagamento foi devidamente atualizado no sistema.").setImage("attachment://qrcode.png")], files: [att] });
    }

    if (sub === "ver") {
      const q = tables.config_qrcode.find(c => c.guild_id === guild.id);
      if (q) {
        const embed = info("QR Code de Pagamento", "Utilize a imagem abaixo para realizar o depósito.").setImage(q.url);
        return interaction.editReply({ embeds: [embed] });
      }
      const med = tables.mediadores.find(m => m.discord_id === user.id && m.guild_id === guild.id);
      const cfg = getConfig(guild.id);
      const conteudo = med?.qrcode_url || cfg.qrcode_padrao;
      if (!conteudo) return interaction.editReply({ embeds: [erro("Sem QR Code", "Nenhum QR code cadastrado. Use /qrcode definir primeiro.")] });
      const buf = await QRCode.toBuffer(conteudo, { width: 300, margin: 2 });
      const att = new AttachmentBuilder(buf, { name: "qrcode.png" });
      const embed = info("Seu QR Code", "`" + conteudo + "`").setImage("attachment://qrcode.png");
      if (cfg.pix_frame_url) embed.setThumbnail(cfg.pix_frame_url);
      return interaction.editReply({ embeds: [embed], files: [att] });
    }
  },
};
