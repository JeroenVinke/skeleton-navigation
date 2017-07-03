export interface RenderOptions {
  /**
   * The pathname of the route (e.g. /users)
   * will be sent to router.navigate(<route>)
   */
  route?: string;

  /**
   * The template where <!-- app --> indicates where server side rendered html will be inserted
   */
  template: string;

  /**
   * Whether or not to use preboot. Preboot allows you to record (and playback) events
   * that occur before the client-app is loaded (defaults to false)
   */
  preboot: boolean;

  /**
   * When using preboot, how long is the delay between Aurelia start and before the view has loaded
   */
  replayDelay?: number;

  /**
   * Options that are passed to preboot
   */
  prebootOptions?: any;

  /**
   * The queryselector(s) of the approot(s). Used by preboot
   * e.g. ['body']
   */
  appRoots?: string[];

  /**
   * Whether to minify the HTML or not
   */
  minifyHtml?: boolean;

  /**
   * Options of the html-minifier package which will be used
   * to minify the HTML (if the minifyHtml property is set to true)
   */
  minifyOptions?: any;
}

export interface AppInitializationOptions {
  /**
   * The main class to use as entry point for Aurelia (server side)
   */
  main: { configure: (aurelia) => Promise<void> };
  
  /**
   * The module id of the server main file (e.g. 'main')
   */
  serverMainId?: string;
}

export interface TransformerContext {
  /**
   * The body of the server side rendered app
   */
  app: string;
}