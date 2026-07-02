const { 
  SlashCommandBuilder, 
  PermissionFlagsBits, 
  ActionRowBuilder, 
  StringSelectMenuBuilder, 
  ButtonBuilder, 
  ButtonStyle, 
  ModalBuilder, 
  TextInputBuilder, 
  TextInputStyle,
  ChannelSelectMenuBuilder,
  RoleSelectMenuBuilder,
  ChannelType,
  MessageFlags 
} = require("discord.js");
const { tables, getConfig, updateConfig } = require("../../database/db");
const { centralConfig, sucesso, erro, info, base, COR } = require("../../utils/embeds");
const { isAdmin } = require("../../utils/permissions");
const { ownerID } = require("../../config.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("central")
    .setDescription("Central de Configuração Administrativa: Master Control")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const { guild, member, user } = interaction;
    const flags = MessageFlags.Ephemeral;

    if (!isAdmin(member, guild.id, ownerID)) {
      return interaction.reply({ embeds: [erro("Acesso Negado", "Acesso Negado")], flags });
    }

    const cfg = getConfig(guild.id);

    const categorias = [
      { label: "Sistema & Taxas", value: "cat_sistema", description: "Moeda, Taxas de Sala e Mediação, Jogos." },
      { label: "Mercado VIP", value: "cat_loja", description: "Gerenciar Itens, Caixas Misteriosas e Lojas." },
      { label: "Streamer Hub", value: "cat_streamer", description: "Configurar Live, Regras e Filas de Influencer." },
      { label: "Mediadores", value: "cat_mediadores", description: "Cargos, Distribuição de Filas, Limites e Pix." },
      { label: "Design & Customização", value: "cat_design", description: "Molduras PIX, QR Codes e Estilo da UI." },
      { label: "Segurança & BO", value: "cat_seguranca", description: "Analistas, Logs de BO e Sistema de SS." }
    ];

    const menuRow = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId("central_menu")
        .setPlaceholder("Selecione uma categoria para configurar...")
        .addOptions(categorias)
    );

    const response = await interaction.reply({
      embeds: [centralConfig(guild, "Início", null)],
      components: [menuRow],
      flags
    });

    const collector = response.createMessageComponentCollector({ time: 600000 });

    collector.on("collect", async (i) => {
      if (i.user.id !== user.id) return i.reply({ content: "Você não pode interagir com este menu.", flags });

      const currentCfg = getConfig(guild.id);

      if (i.isStringSelectMenu() && i.customId === "central_menu") {
        const val = i.values[0];
        let embedFields = [];
        let components = [menuRow];

        if (val === "cat_sistema") {
          embedFields = [
            { name: "Nome da Moeda", value: "```\n" + (currentCfg.nome_moeda || "Coins") + "\n```", inline: true },
            { name: "Taxa de Sala", value: "```\nR$ " + (currentCfg.taxa_sala || 0).toFixed(2) + "\n```", inline: true },
            { name: "Taxa Mediação", value: "```\nR$ " + (currentCfg.taxa_mediacao_fixa || 0).toFixed(2) + "\n```", inline: true },
            { name: "Coins p/ Vitória", value: "```\n" + (currentCfg.coins_por_vitoria || 0) + "\n```", inline: true }
          ];

          const btnRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId("cfg_moeda").setLabel("Moeda").setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId("cfg_taxas").setLabel("Taxas").setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId("cfg_jogos").setLabel("Gerenciar Jogos").setStyle(ButtonStyle.Secondary)
          );
          components.push(btnRow);
        }

        if (val === "cat_streamer") {
          embedFields = [
            { name: "Live URL", value: "```\n" + (currentCfg.streamer_live_url || "Não configurado") + "\n```", inline: false },
            { name: "Canal das Filas", value: "```\n" + (currentCfg.streamer_canal_nome || "contra • [[nome]]") + "\n```", inline: true },
            { name: "Modo Painel", value: "```\n" + (currentCfg.streamer_modo || "Básico").toUpperCase() + "\n```", inline: true }
          ];

          const btnRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId("cfg_streamer_info").setLabel("Configurar Link/Regras/Nome").setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId("cfg_streamer_modo").setLabel("Alternar Modo").setStyle(ButtonStyle.Secondary)
          );
          components.push(btnRow);
        }

        if (val === "cat_mediadores") {
          embedFields = [
            { name: "Cargo Mediador", value: currentCfg.cargo_mediador ? "<@&" + currentCfg.cargo_mediador + ">" : "```\nNão definido\n```", inline: true },
            { name: "Distribuição", value: "```\n" + (currentCfg.distribuicao_fila === "equilibrado" ? "Equilibrado" : "1 por 1") + "\n```", inline: true },
            { name: "Limite Filas", value: "```\n" + (currentCfg.limite_filas_mediador || 5) + "\n```", inline: true },
            { name: "Pix Autônomo", value: "```\n" + (currentCfg.mediador_pix_autonomo ? "Ativado" : "Desativado") + "\n```", inline: true }
          ];

          const btnRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId("cfg_med_cargo").setLabel("Cargo Mediador").setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId("cfg_streamer_med").setLabel("Mediador Streamer").setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId("cfg_med_dist").setLabel("Alternar Distribuição").setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId("cfg_med_pix").setLabel("Toggle Pix").setStyle(ButtonStyle.Danger)
          );
          components.push(btnRow);
        }

        if (val === "cat_loja") {
            const itens = tables.itens_loja.filter(it => it.guild_id === guild.id).length;
            const caixas = tables.caixas.filter(cx => cx.guild_id === guild.id).length;
            embedFields = [
                { name: "Itens Cadastrados", value: "```\n" + itens + "\n```", inline: true },
                { name: "Caixas Misteriosas", value: "```\n" + caixas + "\n```", inline: true }
            ];
            const btnRow = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId("cfg_loja_itens").setLabel("Criar Item").setStyle(ButtonStyle.Success),
                new ButtonBuilder().setCustomId("cfg_loja_caixas").setLabel("Criar Caixa").setStyle(ButtonStyle.Success)
            );
            components.push(btnRow);
        }

        if (val === "cat_design") {
            embedFields = [
                { name: "Tipo de UI", value: "```\n" + (currentCfg.ui_tipo === "select" ? "Menu de Seleção" : "Botões") + "\n```", inline: true },
                { name: "Moldura PIX", value: currentCfg.pix_frame_url ? "[Clique Aqui](" + currentCfg.pix_frame_url + ")" : "```\nPadrao\n```", inline: true }
            ];
            const btnRow = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId("cfg_design_ui").setLabel("Alternar Estilo").setStyle(ButtonStyle.Primary),
                new ButtonBuilder().setCustomId("cfg_design_pix").setLabel("Configurar Moldura").setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId("cfg_design_ui_custom").setLabel("Avançado (X/Y/Placeholder)").setStyle(ButtonStyle.Secondary)
            );
            components.push(btnRow);
        }

        if (val === "cat_seguranca") {
          embedFields = [
            { name: "Cargo Analista", value: currentCfg.cargo_analista ? "<@&" + currentCfg.cargo_analista + ">" : "```\nNão definido\n```", inline: true },
            { name: "Canal de B.O.", value: currentCfg.canal_bo ? "<#" + currentCfg.canal_bo + ">" : "```\nNão definido\n```", inline: true }
          ];

          const btnRow = new ActionRowBuilder().addComponents(
            new RoleSelectMenuBuilder().setCustomId("cfg_bo_role").setPlaceholder("Selecionar Cargo Analista").setMaxValues(1),
          );
          const btnRow2 = new ActionRowBuilder().addComponents(
            new ChannelSelectMenuBuilder().setCustomId("cfg_bo_channel").setPlaceholder("Selecionar Canal de B.O.").setChannelTypes(ChannelType.GuildText).setMaxValues(1)
          );
          components.push(btnRow, btnRow2);
        }

        await i.update({ embeds: [centralConfig(guild, val.replace("cat_", "").toUpperCase().replace("_", " "), embedFields)], components });
      }

      // Handling Buttons for Modals and Toggles
      if (i.isButton()) {
        if (i.customId === "cfg_moeda") {
          const modal = new ModalBuilder().setCustomId("modal_moeda").setTitle("Configurar Moeda");
          const input = new TextInputBuilder().setCustomId("nome_moeda").setLabel("Nome da Moeda").setStyle(TextInputStyle.Short).setValue(currentCfg.nome_moeda || "Coins").setRequired(true);
          modal.addComponents(new ActionRowBuilder().addComponents(input));
          return await i.showModal(modal);
        }
        if (i.customId === "cfg_taxas") {
          const modal = new ModalBuilder().setCustomId("modal_taxas").setTitle("Configurar Taxas (R$)");
          const ts = new TextInputBuilder().setCustomId("taxa_sala").setLabel("Taxa de Sala").setStyle(TextInputStyle.Short).setValue((currentCfg.taxa_sala || 0).toString()).setRequired(true);
          const tm = new TextInputBuilder().setCustomId("taxa_mediacao").setLabel("Taxa de Mediação Fixa").setStyle(TextInputStyle.Short).setValue((currentCfg.taxa_mediacao_fixa || 0).toString()).setRequired(true);
          const cv = new TextInputBuilder().setCustomId("coins_vitoria").setLabel("Coins por Vitória").setStyle(TextInputStyle.Short).setValue((currentCfg.coins_por_vitoria || 0).toString()).setRequired(true);
          modal.addComponents(new ActionRowBuilder().addComponents(ts), new ActionRowBuilder().addComponents(tm), new ActionRowBuilder().addComponents(cv));
          return await i.showModal(modal);
        }
        if (i.customId === "cfg_streamer_info") {
          const modal = new ModalBuilder().setCustomId("modal_streamer").setTitle("Configure Streamer");
          const live = new TextInputBuilder().setCustomId("live_url").setLabel("Link da sua Live").setStyle(TextInputStyle.Short).setValue(currentCfg.streamer_live_url || "").setRequired(true);
          const rules = new TextInputBuilder().setCustomId("regras").setLabel("Descrição/Regras").setStyle(TextInputStyle.Paragraph).setValue(currentCfg.streamer_regras || "").setRequired(true);
          const name = new TextInputBuilder().setCustomId("canal_nome").setLabel("Nome do Seu Canal de Filas").setStyle(TextInputStyle.Short).setValue(currentCfg.streamer_canal_nome || "contra • [[nome_streamer]]").setRequired(true);
          modal.addComponents(new ActionRowBuilder().addComponents(live), new ActionRowBuilder().addComponents(rules), new ActionRowBuilder().addComponents(name));
          return await i.showModal(modal);
        }
        if (i.customId === "cfg_design_pix") {
            const modal = new ModalBuilder().setCustomId("modal_design_pix").setTitle("Molduras PIX");
            const frame = new TextInputBuilder().setCustomId("pix_frame").setLabel("URL da Moldura (Fundo/Poster)").setStyle(TextInputStyle.Short).setValue(currentCfg.pix_frame_url || "").setRequired(true);
            const gp = new TextInputBuilder().setCustomId("pix_gp").setLabel("URL da Moldura !gp").setStyle(TextInputStyle.Short).setValue(currentCfg.pix_gp_url || "").setRequired(true);
            modal.addComponents(new ActionRowBuilder().addComponents(frame), new ActionRowBuilder().addComponents(gp));
            return await i.showModal(modal);
        }
        
        // Simple toggles
        if (i.customId === "cfg_streamer_modo") {
            const next = currentCfg.streamer_modo === "basico" ? "avancado" : "basico";
            updateConfig(guild.id, { streamer_modo: next });
            return await i.reply({ content: "Modo Streamer alterado para: " + next, flags });
        }
        if (i.customId === "cfg_med_dist") {
            const next = currentCfg.distribuicao_fila === "equilibrado" ? "1por1" : "equilibrado";
            updateConfig(guild.id, { distribuicao_fila: next });
            return await i.reply({ content: "Distribuição de filas alterada para: " + next, flags });
        }
        if (i.customId === "cfg_med_pix") {
            const next = currentCfg.mediador_pix_autonomo ? 0 : 1;
            updateConfig(guild.id, { mediador_pix_autonomo: next });
            return await i.reply({ content: "Pix Autônomo " + (next ? "Ativado" : "Desativado"), flags });
        }
        if (i.customId === "cfg_design_ui_custom") {
            const modal = new ModalBuilder().setCustomId("modal_design_ui").setTitle("Customização de UI");
            const x = new TextInputBuilder().setCustomId("ui_x").setLabel("Posição X (ou Ordem)").setStyle(TextInputStyle.Short).setRequired(false);
            const y = new TextInputBuilder().setCustomId("ui_y").setLabel("Posição Y").setStyle(TextInputStyle.Short).setRequired(false);
            const placeholder = new TextInputBuilder().setCustomId("ui_placeholder").setLabel("Placeholder do Menu").setStyle(TextInputStyle.Short).setRequired(false);
            const desc = new TextInputBuilder().setCustomId("ui_desc").setLabel("Descrição Custom").setStyle(TextInputStyle.Paragraph).setRequired(false);
            modal.addComponents(new ActionRowBuilder().addComponents(x), new ActionRowBuilder().addComponents(y), new ActionRowBuilder().addComponents(placeholder), new ActionRowBuilder().addComponents(desc));
            return await i.showModal(modal);
        }
        if (i.customId === "cfg_design_ui") {
            const next = currentCfg.ui_tipo === "botao" ? "select" : "botao";
            updateConfig(guild.id, { ui_tipo: next });
            return await i.reply({ content: "Estilo da UI alterado para: " + (next === "select" ? "Menu de Seleção" : "Botões"), flags });
        }
        if (i.customId === "cfg_loja_itens") {
            const modal = new ModalBuilder().setCustomId("modal_loja_item").setTitle("Criar Item de Loja");
            const nome = new TextInputBuilder().setCustomId("item_nome").setLabel("Nome do Item").setStyle(TextInputStyle.Short).setRequired(true);
            const preco = new TextInputBuilder().setCustomId("item_preco").setLabel("Preço (" + (currentCfg.nome_moeda || "Coins") + ")").setStyle(TextInputStyle.Short).setRequired(true);
            const raridade = new TextInputBuilder().setCustomId("item_raridade").setLabel("Raridade (comum, raro, epico, lendario)").setStyle(TextInputStyle.Short).setRequired(true);
            const desc = new TextInputBuilder().setCustomId("item_desc").setLabel("Descrição do Item").setStyle(TextInputStyle.Paragraph).setRequired(false);
            modal.addComponents(new ActionRowBuilder().addComponents(nome), new ActionRowBuilder().addComponents(preco), new ActionRowBuilder().addComponents(raridade), new ActionRowBuilder().addComponents(desc));
            return await i.showModal(modal);
        }
        if (i.customId === "cfg_loja_caixas") {
            const modal = new ModalBuilder().setCustomId("modal_loja_caixa").setTitle("Criar Caixa Misteriosa");
            const nome = new TextInputBuilder().setCustomId("caixa_nome").setLabel("Nome da Caixa").setStyle(TextInputStyle.Short).setRequired(true);
            const preco = new TextInputBuilder().setCustomId("caixa_preco").setLabel("Preço para Abrir").setStyle(TextInputStyle.Short).setRequired(true);
            const cor = new TextInputBuilder().setCustomId("caixa_cor").setLabel("Cor HEX (ex: #FF0000)").setStyle(TextInputStyle.Short).setRequired(false);
            const gif = new TextInputBuilder().setCustomId("caixa_gif").setLabel("URL do GIF de Abertura").setStyle(TextInputStyle.Short).setRequired(false);
            modal.addComponents(new ActionRowBuilder().addComponents(nome), new ActionRowBuilder().addComponents(preco), new ActionRowBuilder().addComponents(cor), new ActionRowBuilder().addComponents(gif));
            return await i.showModal(modal);
        }
        if (i.customId === "cfg_med_limit") {
            const modal = new ModalBuilder().setCustomId("modal_med_limit").setTitle("Limite de Filas");
            const input = new TextInputBuilder().setCustomId("limit").setLabel("Limite por Mediador").setStyle(TextInputStyle.Short).setValue((currentCfg.limite_filas_mediador || 5).toString()).setRequired(true);
            modal.addComponents(new ActionRowBuilder().addComponents(input));
            return await i.showModal(modal);
        }
        if (i.customId === "cfg_med_cargo") {
            const row = new ActionRowBuilder().addComponents(
                new RoleSelectMenuBuilder().setCustomId("cfg_mediador_role").setPlaceholder("Selecionar Cargo Mediador").setMaxValues(1)
            );
            return await i.reply({ content: "Selecione o novo cargo para mediadores:", components: [row], flags });
        }
        if (i.customId === "cfg_jogos") {
            const modal = new ModalBuilder().setCustomId("modal_criar_jogo").setTitle("Cadastrar Novo Jogo");
            const nome = new TextInputBuilder().setCustomId("jogo_nome").setLabel("Nome do Jogo (ex: Clash Royale)").setStyle(TextInputStyle.Short).setRequired(true);
            modal.addComponents(new ActionRowBuilder().addComponents(nome));
            return await i.showModal(modal);
        }
        if (i.customId === "cfg_streamer_med") {
            const row = new ActionRowBuilder().addComponents(
                new RoleSelectMenuBuilder().setCustomId("cfg_streamer_mediador_role").setPlaceholder("Selecionar Cargo Mediador de Streamer").setMaxValues(1)
            );
            return await i.reply({ content: "Selecione o cargo para mediadores de streamer:", components: [row], flags });
        }
      }

      // Handling Select Menus for roles/channels
      if (i.isRoleSelectMenu()) {
          const roleId = i.values[0];
          if (i.customId === "cfg_bo_role") {
              updateConfig(guild.id, { cargo_analista: roleId });
              return await i.reply({ content: "Cargo de Analista definido: <@&" + roleId + ">", flags });
          }
          if (i.customId === "cfg_mediador_role") {
              updateConfig(guild.id, { cargo_mediador: roleId });
              return await i.reply({ content: "Cargo de Mediador definido: <@&" + roleId + ">", flags });
          }
          if (i.customId === "cfg_streamer_mediador_role") {
              updateConfig(guild.id, { cargo_streamer_mediador: roleId }); // Need to add to db or just use a dynamic field
              return await i.reply({ content: "Cargo de Mediador de Streamer definido: <@&" + roleId + ">", flags });
          }
      }
      if (i.isChannelSelectMenu()) {
          if (i.customId === "cfg_bo_channel") {
              const chId = i.values[0];
              updateConfig(guild.id, { canal_bo: chId });
              return await i.reply({ content: "Canal de B.O. definido: <#" + chId + ">", flags });
          }
      }
    });

    // Handle Modals
    const modalListener = async (mi) => {
        if (!mi.isModalSubmit()) return;
        if (mi.user.id !== user.id) return;

        if (mi.customId === "modal_moeda") {
            const nome = mi.fields.getTextInputValue("nome_moeda");
            updateConfig(guild.id, { nome_moeda: nome });
            await mi.reply({ content: "Nome da moeda alterado para: " + nome, flags });
        }
        if (mi.customId === "modal_taxas") {
            const ts = parseFloat(mi.fields.getTextInputValue("taxa_sala")) || 0;
            const tm = parseFloat(mi.fields.getTextInputValue("taxa_mediacao")) || 0;
            const cv = parseInt(mi.fields.getTextInputValue("coins_vitoria")) || 0;
            updateConfig(guild.id, { taxa_sala: ts, taxa_mediacao_fixa: tm, coins_por_vitoria: cv });
            await mi.reply({ content: "Taxas atualizadas com sucesso.", flags });
        }
        if (mi.customId === "modal_streamer") {
            const live = mi.fields.getTextInputValue("live_url");
            const rules = mi.fields.getTextInputValue("regras");
            const canal = mi.fields.getTextInputValue("canal_nome");
            updateConfig(guild.id, { streamer_live_url: live, streamer_regras: rules, streamer_canal_nome: canal });
            await mi.reply({ content: "Configurações de Streamer atualizadas.", flags });
        }
        if (mi.customId === "modal_design_pix") {
            const frame = mi.fields.getTextInputValue("pix_frame");
            const gp = mi.fields.getTextInputValue("pix_gp");
            updateConfig(guild.id, { pix_frame_url: frame, pix_gp_url: gp });
            await mi.reply({ content: "Molduras PIX atualizadas com sucesso.", flags });
        }
        if (mi.customId === "modal_loja_item") {
            const n = mi.fields.getTextInputValue("item_nome");
            const p = parseInt(mi.fields.getTextInputValue("item_preco")) || 0;
            const r = mi.fields.getTextInputValue("item_raridade").toLowerCase();
            const d = mi.fields.getTextInputValue("item_desc") || "Sem descrição.";
            tables.itens_loja.insert({ guild_id: guild.id, nome: n, preco: p, raridade: r, descricao: d, ativo: 1 });
            await mi.reply({ content: "Item de loja `" + n + "` criado com sucesso.", flags });
        }
        if (mi.customId === "modal_loja_caixa") {
            const n = mi.fields.getTextInputValue("caixa_nome");
            const p = parseInt(mi.fields.getTextInputValue("caixa_preco")) || 0;
            const c = mi.fields.getTextInputValue("caixa_cor") || "#D4AF37";
            const g = mi.fields.getTextInputValue("caixa_gif") || null;
            tables.caixas.insert({ guild_id: guild.id, nome: n, preco: p, cor: c, gif_url: g, ativo: 1 });
            await mi.reply({ content: "Caixa misteriosa `" + n + "` criada com sucesso.", flags });
        }
        if (mi.customId === "modal_med_limit") {
            const limit = parseInt(mi.fields.getTextInputValue("limit")) || 5;
            updateConfig(guild.id, { limite_filas_mediador: limit });
            await mi.reply({ content: "Limite de filas por mediador definido para: " + limit, flags });
        }
        if (mi.customId === "modal_criar_jogo") {
            const n = mi.fields.getTextInputValue("jogo_nome");
            tables.jogos.insert({ nome: n });
            await mi.reply({ content: "Novo jogo `" + n + "` cadastrado com sucesso.", flags });
        }
        if (mi.customId === "modal_design_ui") {
            // These would be used for advanced canvas/embed logic
            await mi.reply({ content: "Configurações de UI avançadas salvas (Simulado).", flags });
        }
    };
    client.on("interactionCreate", modalListener);
    setTimeout(() => client.off("interactionCreate", modalListener), 600000);
  },
};
