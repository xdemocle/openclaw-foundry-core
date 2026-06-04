/**
 * Fallback type declarations for the optional `clawdbot/plugin-sdk` peer
 * dependency. The real types ship with the host (clawdbot/openclaw/moltbot)
 * install; these loose shapes let Foundry typecheck standalone when the host
 * package is not present in node_modules.
 */
declare module "clawdbot/plugin-sdk" {
  export interface ClawdbotPluginToolContext {
    injectSystemMessage?(message: string): void;
    [key: string]: any;
  }

  export interface ClawdbotPluginApi {
    logger: any;
    pluginConfig?: Record<string, any>;
    registerTool(
      tools: any,
      opts?: { names?: string[]; [key: string]: any }
    ): void;
    on(event: string, handler: (event: any, ctx?: any) => any): void;
    [key: string]: any;
  }
}
