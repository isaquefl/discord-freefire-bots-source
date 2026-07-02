const { tables, getConfig, getJogador, proximoMediador, logPartida } = require("../database/db");
const { sucesso, erro, info, base, COR, partidaEmbed, perfil } = require("../utils/embeds");
const { isMediador, isAdmin } = require("../utils/permissions");
const { ownerID, guildID } = require("../config.json");
const { MessageFlags, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require("discord.js");

module.exports = {
  nome: "interactionCreate",
  once: false,

  async executar(interaction, client) {
    if (!interaction.guild || interaction.guild.id !== guildID) return;

    const replyOptions = (content, eph = true) => ({ 
      content, 
      ephemeral: eph 
    });
    
    const embedOptions = (embed, eph = true) => ({ 
      embeds: [embed], 
      ephemeral: eph 
    });

    if (interaction.isChatInputCommand()) {
      const command = client.slashCommands.get(interaction.commandName);
      if (!command) return;

      try {
        await command.execute(interaction);
      } catch (error) {
        console.error(`[COMMAND ERROR] Error executing ${interaction.commandName}:`, error);
        if (error.code === 10062) return;
        
        try {
          const res = replyOptions("Ocorreu um erro ao processar o comando.");
          if (interaction.replied || interaction.deferred) await interaction.followUp(res);
          else await interaction.reply(res);
        } catch (e) {}
      }
      return;
    }

    if (interaction.isAutocomplete()) {
      if (interaction.commandName === "gp") {
        const focusedValue = interaction.options.getFocused().toLowerCase();
        const choices = tables.modos_partida.all().map(m => m.nome);
        const filtered = choices.filter(c => c.toLowerCase().includes(focusedValue)).slice(0, 25);
        return interaction.respond(filtered.map(c => ({ name: c, value: c })));
      }
      return;
    }

    if (interaction.isModalSubmit()) return;

    if (!interaction.isButton()) return;

    const { customId, guild, user, member } = interaction;

    try {
      if (customId.startsWith("med_aceitar_")) {
        const pId = parseInt(customId.split("_")[2]);
        if (!isMediador(member, guild.id, ownerID)) {
          return interaction.reply(embedOptions(erro("ACESSO NEGADO", "Você não possui as credenciais administrativas necessárias.")));
        }

        const p = tables.partidas.find(p => p.id === pId && p.status === "aguardando");
        if (!p) return interaction.reply(embedOptions(erro("OPERACÃO INVÁLIDA", "Esta partida já foi processada ou removida do sistema.")));
        
        if ([p.criador_id, p.oponente_id].includes(user.id)) {
          return interaction.reply(embedOptions(erro("CONFLITO DE INTERESSE", "Você não pode intermediar sua própria partida.")));
        }

        tables.partidas.update(p => p.id === pId, { status: "em_andamento", mediador_id: user.id });
        logPartida(guild.id, pId, "mediador", user.id, "Mediador aceitou a partida.");

        const embed = interaction.message.embeds[0];
        const updatedFields = [...(embed.data.fields || [])].filter(f => f.name !== "STATUS ATUAL" && f.name !== "Status");
        updatedFields.push({ name: "STATUS ATUAL", value: "EM ANDAMENTO", inline: false });
        updatedFields.push({ name: "MEDIADOR", value: "<@" + user.id + ">", inline: true });

        await interaction.update({
           embeds: [{ ...embed.data, color: COR.sucesso, fields: updatedFields }],
           components: []
        });
      }

      if (customId.startsWith("partida_cancelar_")) {
        const pId = parseInt(customId.split("_")[2]);
        const p = tables.partidas.find(p => p.id === pId);
        if (!p) return interaction.reply(replyOptions("PARTIDA NÃO LOCALIZADA."));

        if (p.criador_id !== user.id && !isMediador(member, guild.id, ownerID)) {
          return interaction.reply(embedOptions(erro("ACESSO NEGADO", "Apenas o proprietário ou um mediador pode cancelar.")));
        }

        tables.partidas.update(p => p.id === pId, { status: "cancelada", finalizado_em: new Date().toISOString() });
        logPartida(guild.id, pId, "cancelado", user.id, "Partida cancelada via interface de botão.");

        if (p.thread_id) guild.channels.fetch(p.thread_id).then(t => t.setArchived(true)).catch(() => {});

        return interaction.update({
          embeds: [base(COR.erro).setTitle("PARTIDA CANCELADA").setDescription("A PARTIDA #" + pId + " FOI DEVIDAMENTE ENCERRADA PELO USUARIO <@" + user.id + ">.")],
          components: []
        });
      }

      if (customId.startsWith("bo_")) {
        const [_, action, boId] = customId.split("_");
        const bId = parseInt(boId);
        if (!isMediador(member, guild.id, ownerID)) return interaction.reply(replyOptions("ACESSO RESTRITO A MEDIADORES."));

        const bo = tables.bo_analises.find(b => b.id === bId);
        if (!bo) return interaction.reply(replyOptions("ANÁLISE NÃO LOCALIZADA."));

        const status = action === "aprovar" ? "aprovada" : "rejeitada";
        tables.bo_analises.update(b => b.id === bId, { status: status, julgado_por: user.id });

        return interaction.update({
           embeds: [{ ...interaction.message.embeds[0].data, fields: [...interaction.message.embeds[0].data.fields, { name: "JULGAMENTO", value: "STATUS: " + status.toUpperCase() + "\nPOR: <@" + user.id + ">", inline: false }] }],
           components: []
        });
      }

      if (customId.startsWith("revanche_")) {
        const action = customId.split("_")[1];
        const pId = parseInt(customId.split("_")[2]);
        const targetId = customId.split("_")[3];

        if (action === "aceitar") {
          if (user.id !== targetId) return interaction.reply(replyOptions("VOCÊ NÃO É O ALVO DESTA SOLICITAÇÃO."));
          
          const original = tables.partidas.find(p => p.id === pId);
          const ins = tables.partidas.insert({
             guild_id: guild.id,
             fila_id: original.fila_id,
             criador_id: user.id,
             oponente_id: original.criador_id,
             valor_aposta: original.valor_aposta,
             modo: original.modo,
             canal_id: interaction.channel.id,
             status: "aguardando",
             criado_em: new Date().toISOString()
          });
          
          return interaction.update({ content: "Revanche Aceita: Nova Partida #" + ins.id, embeds: [], components: [] });
        }

        if (action === "recusar") {
          return interaction.update({ content: "REVANCHE RECUSADA PELO DESAFIADO.", embeds: [], components: [] });
        }
      }

      if (customId === "streamer_entrar") {
        tables.fila_mediadores.upsert(f => f.guild_id === guild.id && f.mediador_id === user.id, {
          guild_id: guild.id,
          mediador_id: user.id,
          ultima_at: new Date().toISOString()
        });
        return interaction.reply(replyOptions("Protocolo de entrada concluído: aguarde o contato"));
      }

      if (customId === "panel_profile") {
        const j = getJogador(user.id);
        const embed = perfil(j, member);
        return interaction.reply(embedOptions(embed));
      }

      if (customId === "panel_rules") {
        const cfg = getConfig(guild.id);
        const embed = base(COR.roxo).setTitle("Diretrizes do Servidor").setDescription(cfg.regras_texto || "Sem regras configuradas.");
        return interaction.reply(embedOptions(embed));
      }

      if (customId === "panel_ranking") {
        const top = getRankingGlobal(guild.id, "vitorias", 10);
        const embed = rankingEmbed(top, "vitorias", guild);
        return interaction.reply(embedOptions(embed));
      }

      if (customId === "panel_shop") {
        return interaction.reply(replyOptions("Módulo de Mercado em manutenção. Utilize `/loja` para compras.", true));
      }

      if (customId === "panel_create_match") {
         const modal = new ModalBuilder().setCustomId("gp_modal_setup").setTitle("Gerar Ordem de Partida");
         const valorInput = new TextInputBuilder().setCustomId("gp_valor").setLabel("Valor da Aposta (R$)").setStyle(TextInputStyle.Short).setPlaceholder("Ex: 10.00").setRequired(true);
         const modoInput = new TextInputBuilder().setCustomId("gp_modo").setLabel("Modo de Jogo").setStyle(TextInputStyle.Short).setPlaceholder("Ex: UMP (X1)").setRequired(true);
         modal.addComponents(new ActionRowBuilder().addComponents(valorInput), new ActionRowBuilder().addComponents(modoInput));
         return interaction.showModal(modal);
      }

      if (customId.startsWith("admin_btn_")) {
        if (user.id !== ownerID) return interaction.reply(replyOptions("Acesso restrito ao proprietário."));
        const type = customId.split("_")[2];
        
        if (type === "setup") {
          const modal = new ModalBuilder().setCustomId("admin_modal_setup").setTitle("Configurar Canal do Painel");
          const input = new TextInputBuilder().setCustomId("canal_id").setLabel("ID do Canal de Texto").setStyle(TextInputStyle.Short).setPlaceholder("Cole o ID do canal aqui").setRequired(true);
          modal.addComponents(new ActionRowBuilder().addComponents(input));
          return interaction.showModal(modal);
        }

        if (type === "canais") {
          const cfg = getConfig(guild.id);
          const modal = new ModalBuilder().setCustomId("admin_modal_canais").setTitle("Configurar Canais do Sistema");
          const logs = new TextInputBuilder().setCustomId("logs").setLabel("ID Canal de Logs").setStyle(TextInputStyle.Short).setValue(cfg.canal_logs || "").setRequired(false);
          const bo = new TextInputBuilder().setCustomId("bo").setLabel("ID Canal de B.O/SS").setStyle(TextInputStyle.Short).setValue(cfg.canal_bo || "").setRequired(false);
          const rank = new TextInputBuilder().setCustomId("rank").setLabel("ID Canal de Ranking").setStyle(TextInputStyle.Short).setValue(cfg.canal_ranking || "").setRequired(false);
          modal.addComponents(new ActionRowBuilder().addComponents(logs), new ActionRowBuilder().addComponents(bo), new ActionRowBuilder().addComponents(rank));
          return interaction.showModal(modal);
        }

        if (type === "cargos") {
          const cfg = getConfig(guild.id);
          const modal = new ModalBuilder().setCustomId("admin_modal_cargos").setTitle("Configurar Cargos");
          const med = new TextInputBuilder().setCustomId("mediador").setLabel("ID Cargo Mediador").setStyle(TextInputStyle.Short).setValue(cfg.cargo_mediador || "").setRequired(false);
          const adm = new TextInputBuilder().setCustomId("admin").setLabel("ID Cargo Admin").setStyle(TextInputStyle.Short).setValue(cfg.cargo_admin || "").setRequired(false);
          modal.addComponents(new ActionRowBuilder().addComponents(med), new ActionRowBuilder().addComponents(adm));
          return interaction.showModal(modal);
        }

        if (type === "economia") {
          const cfg = getConfig(guild.id);
          const modal = new ModalBuilder().setCustomId("admin_modal_economia").setTitle("Configurar Economia");
          const coins = new TextInputBuilder().setCustomId("coins").setLabel("Coins por Vitória").setStyle(TextInputStyle.Short).setValue((cfg.coins_por_vitoria || 0).toString()).setRequired(true);
          const com = new TextInputBuilder().setCustomId("comissao").setLabel("Comissão Mediador (ex: 0.05)").setStyle(TextInputStyle.Short).setValue((cfg.comissao_mediador || 0).toString()).setRequired(true);
          modal.addComponents(new ActionRowBuilder().addComponents(coins), new ActionRowBuilder().addComponents(com));
          return interaction.showModal(modal);
        }

        if (type === "modos") {
          const modal = new ModalBuilder().setCustomId("admin_modal_modos").setTitle("Adicionar Modo de Jogo");
          const nome = new TextInputBuilder().setCustomId("nome").setLabel("Nome do Novo Modo").setStyle(TextInputStyle.Short).setPlaceholder("Ex: 1v1 Sniper").setRequired(true);
          modal.addComponents(new ActionRowBuilder().addComponents(nome));
          return interaction.showModal(modal);
        }

        if (type === "regras") {
          const cfg = getConfig(guild.id);
          const modal = new ModalBuilder().setCustomId("admin_modal_regras").setTitle("Configurar Regras");
          const texto = new TextInputBuilder().setCustomId("texto").setLabel("Texto das Regras").setStyle(TextInputStyle.Paragraph).setValue(cfg.regras_texto || "").setRequired(true);
          modal.addComponents(new ActionRowBuilder().addComponents(texto));
          return interaction.showModal(modal);
        }
      }

      if (customId.startsWith("gp_aceitar_")) {
        const pId = parseInt(customId.split("_")[2]);
        const p = tables.partidas.find(x => x.id === pId);
        if (!p) return interaction.reply(replyOptions("Partida não localizada."));
        if (p.criador_id === user.id) return interaction.reply(replyOptions("Você não pode aceitar seu próprio desafio."));
        if (p.oponente_id) return interaction.reply(replyOptions("Este desafio já foi aceito por outro jogador."));

        if (getPartidaAtiva(user.id, guild.id)) return interaction.reply(replyOptions("Você já possui uma partida ativa no sistema."));

        tables.partidas.update(x => x.id === pId, { oponente_id: user.id });
        logPartida(guild.id, pId, "aceito", user.id, "Jogador aceitou o desafio.");

        const oldEmbed = interaction.message.embeds[0];
        const newEmbed = { ...oldEmbed.data, fields: oldEmbed.data.fields.map(f => {
          if (f.name === "Oponente") return { name: "Oponente", value: "<@" + user.id + ">", inline: true };
          if (f.name === "Status Atual") return { name: "Status Atual", value: "Aguardando Mediador", inline: false };
          return f;
        }) };

        const row = new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId("med_aceitar_" + pId).setLabel("Mediar Partida").setStyle(ButtonStyle.Primary),
          new ButtonBuilder().setCustomId("partida_cancelar_" + pId).setLabel("Cancelar").setStyle(ButtonStyle.Danger)
        );

        return interaction.update({ embeds: [newEmbed], components: [row] });
      }
    } catch (btnErr) {
      if (btnErr.code === 10062) return;
      console.error("[ERROR] Erro no processamento de botão:", btnErr);
    }

    if (interaction.isModalSubmit()) {
      if (interaction.customId === "gp_modal_setup") {
        const valorInput = interaction.fields.getTextInputValue("gp_valor").replace(",", ".");
        const valor = parseFloat(valorInput);
        const modo = interaction.fields.getTextInputValue("gp_modo");

        if (isNaN(valor) || valor <= 0) return interaction.reply(replyOptions("Valor de aposta inválido. Use números (ex: 10.00)."));

        const ins = tables.partidas.insert({
          guild_id: guild.id,
          criador_id: user.id,
          valor_aposta: valor,
          modo: modo,
          channel_id: interaction.channelId,
          status: "aguardando",
          criado_em: new Date().toISOString()
        });

        logPartida(guild.id, ins.id, "criacao", user.id, "Partida criada via Painel.");

        const embed = info("Solicitação de Partida", "### Protocolo de Desafio\n<@" + user.id + "> está em busca de um oponente.\n\n```\nValor Aposta : R$ " + valor.toFixed(2) + "\nModos de Jogo: " + modo + "\n```")
          .addFields(
            { name: "Desafiante", value: "<@" + user.id + ">", inline: true },
            { name: "Oponente", value: "Aguardando...", inline: true },
            { name: "Status Atual", value: "Aguardando Oponente", inline: false }
          );

        const row = new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId("gp_aceitar_" + ins.id).setLabel("Aceitar Desafio").setStyle(ButtonStyle.Success),
          new ButtonBuilder().setCustomId("partida_cancelar_" + ins.id).setLabel("Cancelar").setStyle(ButtonStyle.Danger)
        );

        await interaction.channel.send({ embeds: [embed], components: [row] });
        return interaction.reply(replyOptions("Sua ordem de partida `#" + ins.id + "` foi publicada. Boa sorte!"));
      }

      if (interaction.customId === "admin_modal_canais") {
        const logs = interaction.fields.getTextInputValue("logs");
        const bo = interaction.fields.getTextInputValue("bo");
        const rank = interaction.fields.getTextInputValue("rank");
        updateConfig(guild.id, { canal_logs: logs || null, canal_bo: bo || null, canal_ranking: rank || null });
        return interaction.reply(replyOptions("Canais configurados com sucesso."));
      }

      if (interaction.customId === "admin_modal_cargos") {
        const med = interaction.fields.getTextInputValue("mediador");
        const adm = interaction.fields.getTextInputValue("admin");
        updateConfig(guild.id, { cargo_mediador: med || null, cargo_admin: adm || null });
        return interaction.reply(replyOptions("Cargos configurados com sucesso."));
      }

      if (interaction.customId === "admin_modal_economia") {
        const coins = parseInt(interaction.fields.getTextInputValue("coins"));
        const com = parseFloat(interaction.fields.getTextInputValue("comissao").replace(",", "."));
        if (isNaN(coins) || isNaN(com)) return interaction.reply(replyOptions("Valores numéricos inválidos."));
        updateConfig(guild.id, { coins_por_vitoria: coins, comissao_mediador: com });
        return interaction.reply(replyOptions("Economia configurada com sucesso."));
      }

      if (interaction.customId === "admin_modal_regras") {
        const texto = interaction.fields.getTextInputValue("texto");
        updateConfig(guild.id, { regras_texto: texto });
        return interaction.reply(replyOptions("Regras atualizadas com sucesso."));
      }

      if (interaction.customId === "admin_modal_modos") {
        const nome = interaction.fields.getTextInputValue("nome");
        tables.modos_partida.upsert(m => m.nome.toLowerCase() === nome.toLowerCase(), { nome: nome });
        return interaction.reply(replyOptions("Modo `" + nome + "` adicionado com sucesso."));
      }

      if (customId === "admin_modal_setup") {
        const canalId = interaction.fields.getTextInputValue("canal_id");
        const canal = guild.channels.cache.get(canalId);
        if (!canal || !canal.isTextBased()) return interaction.reply(replyOptions("ID de canal de texto inválido ou inacessível."));

        const embed = base(COR.ouro)
          .setTitle("Apostado VIP: Central de Operações")
          .setDescription(
            "Bem-vindo à central de apostas oficial. Utilize os botões abaixo para interagir com o sistema de forma rápida e segura.\n\n" +
            "**Gerar Partida**\nInicia o protocolo de desafio.\n\n" +
            "**Meu Perfil**\nConsulta estatísticas e saldo.\n\n" +
            "**Mercado**\nAcessa a loja de itens.\n\n" +
            "**Regras**\nVisualiza os termos de conduta."
          )
          .setImage("https://i.imgur.com/8QZqZ8q.png");

        const row = new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId("panel_create_match").setLabel("Gerar Partida").setStyle(ButtonStyle.Success),
          new ButtonBuilder().setCustomId("panel_profile").setLabel("Meu Perfil").setStyle(ButtonStyle.Primary),
          new ButtonBuilder().setCustomId("panel_shop").setLabel("Mercado").setStyle(ButtonStyle.Secondary),
          new ButtonBuilder().setCustomId("panel_rules").setLabel("Regras").setStyle(ButtonStyle.Secondary)
        );

        await canal.send({ embeds: [embed], components: [row] });
        updateConfig(guild.id, { canal_painel: canal.id });
        return interaction.reply(replyOptions("Painel enviado para <#" + canal.id + ">."));
      }
    }
  }
};
