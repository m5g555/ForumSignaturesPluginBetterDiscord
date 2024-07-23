/**
 * @name ForumSignatures
 * @author msg555
 * @description Automatically sends a message in the form of a forum signature (using -#) after every time you send a message. Currently has a keyboard shortcut for windows to toggle whether it works: LCtrl + LShift + W.
 * @version 0.0.1
 */

module.exports = (meta) => {
  const settings = {
    message: "Forum Signature Here",
    signatureActive: true,
  };

  const BD = new BdApi("ForumSignatures");
  const { getByKeys } = BD.Webpack;

  const MessageActions = getByKeys("sendMessage");

  return {
    start: () => {
      // Called when the plugin is activated (including after reloads)
      Object.assign(settings, BdApi.Data.load(meta.name, "settings"));

      BD.Patcher.before(MessageActions, "sendMessage", (_, [, msg]) => {
        if (settings.signatureActive) {
          msg.content = msg.content + "\n-# " + settings.message;
        }
      });

      DiscordNative.nativeModules
        .requireModule("discord_utils")
        .inputEventRegister(
          0,
          [
            [0, 0xA2], // LControl
            [0, 0xA0], // Shift
            [0, 0x57], // W
          ],
          (isDown) => {
            settings.signatureActive = !settings.signatureActive;
            BdApi.Data.save(meta.name, "settings", this.settings);
          },
          {
            blurred: false,
            focused: true,
            keydown: true,
            keyup: false,
          }
        );
    },

    stop: () => {
      // Called when the plugin is deactivated
      BD.Patcher.unpatchAll();
    },

    getSettingsPanel: () => {
      // Returns an HTML Element
      const settingsDOM = document;
      const settingsPanel = settingsDOM.createElement("div");
      settingsPanel.id = "settingsPanel";

      const messageInputSetting = settingsDOM.createElement("div");
      messageInputSetting.classList.add("setting");

      const messageInputLabel = settingsDOM.createElement("span");
      messageInputLabel.innerText = "Signature: ";

      const messageInput = settingsDOM.createElement("input");
      messageInput.type = "text";
      messageInput.name = "message";
      messageInput.value = settings.message;

      messageInputSetting.append(messageInputLabel, messageInput);

      signatureActiveSetting = settingsDOM.createElement("div");
      signatureActiveSetting.classList.add("setting");

      const signatureActiveLabel = settingsDOM.createElement("span");
      signatureActiveLabel.innerText = "Signature Active: ";

      const signatureActiveToggle = settingsDOM.createElement("input");
      signatureActiveToggle.type = "checkbox";
      signatureActiveToggle.name = "signatureActive";
      signatureActiveToggle.checked = settings.signatureActive;

      signatureActiveSetting.append(
        signatureActiveLabel,
        signatureActiveToggle
      );

      settingsPanel.append(signatureActiveSetting, messageInputSetting);

      messageInput.addEventListener("change", () => {
        settings.message = messageInput.value;
        BdApi.Data.save(meta.name, "settings", this.settings);
      });

      signatureActiveToggle.addEventListener("change", () => {
        settings.signatureActive = signatureActiveToggle.checked;
        BdApi.Data.save(meta.name, "settings", this.settings);
      });

      return settingsPanel;
    },
  };
};
