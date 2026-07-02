const { tables, getConfig } = require("../database/db");

function temPermissao(member, guildId, comando, ownerId) {
  if (!member) return false;
  if (member.id === ownerId) return true;
  if (member.permissions.has("Administrator")) return true;

  const cfg = getConfig(guildId);
  if (cfg.cargo_admin && member.roles.cache.has(cfg.cargo_admin)) return true;

  const perms = tables.permissoes.filter(p => p.guild_id === guildId && p.comando === comando);
  if (perms.length > 0) {
    return perms.some(p => member.roles.cache.has(p.cargo_id));
  }

  return false;
}

function isAdmin(member, guildId, ownerId) {
  if (temPermissao(member, guildId, "_admin", ownerId)) return true;
  const cfg = getConfig(guildId);
  return cfg.cargo_admin && member.roles.cache.has(cfg.cargo_admin);
}

function isMediador(member, guildId, ownerId) {
  if (isAdmin(member, guildId, ownerId)) return true;
  const cfg = getConfig(guildId);
  if (cfg.cargo_mediador && member.roles.cache.has(cfg.cargo_mediador)) return true;
  
  const perms = tables.permissoes.filter(p => p.guild_id === guildId && p.comando === "_mediador");
  return perms.some(p => member.roles.cache.has(p.cargo_id));
}

function isOwner(userId, ownerId) {
  return userId === ownerId;
}

module.exports = { temPermissao, isAdmin, isMediador, isOwner };
