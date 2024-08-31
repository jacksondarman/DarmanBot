// A command that looks up a Civ in the database, reads out it's name, UU, UB, and/or UA, and renders it to the Discord client.

const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("civ")
    .setDescription("Looks up a civ in the database! [NOT IMPLEMENTED YET]"),
  async execute(interaction) {
    await interaction.reply("Not done yet!");
  },
};
