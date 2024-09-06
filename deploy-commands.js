// Slash command deployment script, so that the new commands we've added in the commands folder can be shown in the Discord interface.

const { REST, Routes } = require("discord.js");
const { clientId, guildId, token } = require("./config.json");
const fs = require("node:fs");
const path = require("node:path");

// Fetch all commands from the commands folder.
const commands = [];

const foldersPath = path.join(__dirname, "commands");
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
  const commandsPath = path.join(foldersPath, folder);
  const commandFiles = fs.readdirSync(commandsPath).filter((file) => {
    console.log(`Checking file: ${file}`);
    return file.match(/\.(js)$/);
  });

  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);

    // Set new item in Collection with key as the command name and value as the exported module

    // NOTE: EVERY COMMAND MUST HAVE A DATA OR EXECUTE FIELD WITHIN ITS EXPORT MODULE! IF IT DOESN'T, IT WON'T WORK HERE

    if ("data" in command && "execute" in command) {
      commands.push(command.data.toJSON());
    } else {
      console.warn(
        `The command at ${filePath} is missing a required "data" or "execute" property.`
      );
    }
  }
}

// New instance of the REST module
const rest = new REST().setToken(token);

// Deploy commands
(async () => {
  try {
    console.log(`Started refreshing ${commands.length} slash commands.`);

    const data = await rest.put(
      Routes.applicationGuildCommands(clientId, guildId),
      { body: commands }
    );

    console.log(`Successfully reloaded ${data.length} slash commands.`);
  } catch (error) {
    console.error(error);
  }
})();
