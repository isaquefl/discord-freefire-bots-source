const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

// Variáveis globais para gerenciar filas
let filaTime1 = [];
let filaTime2 = [];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('criarfila')
    .setDescription('Cria uma fila para partidas 2v2.'),
  
  async execute(interaction) {
    // Criar o embed inicial
    const embed = new EmbedBuilder()
      .setTitle('2v2 | Desafio Criado!')
      .setDescription('Abaixo encontram-se os participantes da fila.')
      .addFields(
        { name: 'Time 1', value: 'Nenhum jogador', inline: true },
        { name: 'Time 2', value: 'Nenhum jogador', inline: true }
      );

    // Criar botões interativos
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('entrar_time1')
        .setLabel('Entrar [0/2]')
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId('entrar_time2')
        .setLabel('Entrar [0/2]')
        .setStyle(ButtonStyle.Danger),
      new ButtonBuilder()
        .setCustomId('sair_fila')
        .setLabel('Sair da Fila')
        .setStyle(ButtonStyle.Secondary)
    );

    // Enviar mensagem inicial
    await interaction.reply({ embeds: [embed], components: [row] });
  }
};