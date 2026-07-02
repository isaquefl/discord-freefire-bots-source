const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require("discord.js");
const { tables } = require("../../database/db");
const { sucesso, erro, info } = require("../../utils/embeds");
const { isAdmin } = require("../../utils/permissions");
const { ownerID } = require("../../config.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("perm")
    .setDescription("Gerenciar permissões customizadas de cargos para comandos (Admin)")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(s => s.setName("adicionar")
      .setDescription("Adiciona um cargo de acesso para um comando")
      .addStringOption(o => o.setName("comando").setDescription("Nome do comando (ex: v, cancel, bo)").setRequired(true))
      .addRoleOption(o => o.setName("cargo").setDescription("O cargo que terá acesso").setRequired(true)))
    .addSubcommand(s => s.setName("remover")
      .setDescription("Remove o acesso de um cargo para um comando")
      .addStringOption(o => o.setName("comando").setDescription("Nome do comando").setRequired(true))
      .addRoleOption(o => o.setName("cargo").setDescription("O cargo para remover acesso").setRequired(true)))
    .addSubcommand(s => s.setName("listar").setDescription("Lista todas as permissões customizadas")),

  async execute(interaction) {
    const { guild, member, options } = interaction;
    const flags = MessageFlags.Ephemeral;
    if (!isAdmin(member, guild.id, ownerID)) return interaction.reply({ embeds: [erro("Acesso Negado", "Acesso Negado")], flags });

    const sub = options.getSubcommand();

    if (sub === "adicionar") {
      const comando = options.getString("comando").toLowerCase();
      const cargo = options.getRole("cargo");
      
      const existing = tables.permissoes.find(p => p.guild_id === guild.id && p.comando === comando && p.cargo_id === cargo.id);
      if (existing) {
        return interaction.reply({ embeds: [erro("Permissão Duplicada", "Este cargo já possui permissão para este comando.")], flags });
      }
      
      tables.permissoes.insert({
        guild_id: guild.id,
        comando: comando,
        cargo_id: cargo.id
      });
      return interaction.reply({ embeds: [sucesso("Permissão Adicionada", "O cargo " + cargo + " agora tem permissão para usar o comando `" + comando + "`.") ], flags });
    }

    if (sub === "remover") {
      const comando = options.getString("comando").toLowerCase();
      const cargo = options.getRole("cargo");
      tables.permissoes.delete(p => p.guild_id === guild.id && p.comando === comando && p.cargo_id === cargo.id);
      return interaction.reply({ embeds: [sucesso("PERMISSAO REMOVIDA", "O cargo " + cargo + " nao tem mais permissao para o comando `" + comando + "`.") ], flags });
    }

    if (sub === "listar") {
      const perms = tables.permissoes.filter(p => p.guild_id === guild.id);
      if (!perms.length) return interaction.reply({ embeds: [info("NENHUMA PERMISSAO", "Nenhuma permissao customizada configurada.")], flags });
      const embed = info("PERMISSOES CUSTOMIZADAS", "Cargos com acesso extra aos comandos.")
        .setDescription(perms.map(p => "COMANDO: `" + p.comando + "` | CARGO: <@&" + p.cargo_id + ">").join("\n"));
      return interaction.reply({ embeds: [embed], flags });
    }
  }
};
