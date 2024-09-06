// A command that looks up a Civ in the database, reads out it's name, UU, UB, and/or UA, and renders it to the Discord client.

const {
  SlashCommandBuilder,
  DiscordAPIError,
  AttachmentBuilder,
  EmbedBuilder,
  channelLink,
  PermissionsBitField,
  discordSort,
} = require("discord.js");
const PocketBase = require("pocketbase/cjs");

// The "civ" command requires one option, the name of the civ to look up. Everything else is optional.

/* 
Essential options:
civ [name]: Look up a civs information.

Optional(one or more of uu, ua, sb, and ub):
civ [name] [uu]: Looks up a civ's Unique Unit, if it has one.
civ [name] [ua]: Looks up a civ's Unique Ability, if it has one.
civ [name] [ub]: Looks up a civ's Unique Building, if it has one.
civ [name] [sb]: Looks up a starting bias, if the civ has one.


The hierarchy looks like this:
Civs
|----- ID
|----- Name
|----- Leader
|----- Symbol
|----- Starting Bias

Unique Abilities

Unique Buildings

Unique Units

*/

const pb = new PocketBase("http://127.0.0.1:8090");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("civ")
    .setDescription("Looks up a civ in the database")
    .addStringOption((option) =>
      option
        .setName("name")
        .setDescription("The name of the Civilization to look up.")
        .setRequired(true)
    ),
  async execute(interaction) {
    const name = interaction.options.getString("name");
    try {
      // Fetch civ data from PocketBase
      const civ = await pb
        .collection("Civs")
        .getFirstListItem(`name="${name}"`);

      if (!civ) {
        await interaction.reply(`Civ with name "${name}" not found.`);
        return;
      }

      const url = pb.files.getUrl(civ, civ.symbol);

      // Use discord.file.Attachment() to create a file attachment from the URL
      const file = new AttachmentBuilder(url);

      // Construct the response embed
      embed = new EmbedBuilder()
        .setColor(0x7289da)
        .setTitle(civ.leader + " of " + civ.name)
        .addFields(
          {
            name: `UA: ${civ.unique_ability_name}`,
            value: `${civ.unique_ability_effect}`,
          },
          {
            name: "Starting Bias",
            value: civ.starting_bias !== "" ? civ.starting_bias : "None",
          }
        );

      // Send the embed to the Discord channel
      await interaction.reply({ embeds: [embed], files: [file] });
    } catch (error) {
      console.error(error);
      await interaction.reply("An error occurred while fetching Civ data");
    }
  },
};
