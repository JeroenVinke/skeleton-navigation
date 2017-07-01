export interface RenderOptions extends InitializationOptions {
  /**
   * The pathname of the route (e.g. /users)
   * will be sent to router.navigate(<route>)
   */
  route?: string;

  /**
   * Whether or not to use preboot. Preboot allows you to record (and playback) events
   * that occur before the client-app is loaded (defaults to false)
   */
  preboot: boolean;

  /**
   * Context (object) that is used to generate the index.html template
   */
  templateContext: any;

  /**
   * The ejs template which is used as index.html template
   */
  template: string;

  /**
   * When using preboot, how long is the delay between Aurelia start and before the view has loaded
   */
  replayDelay?: number;

  /**
   * The queryselector(s) of the approot(s)
   * e.g. ['body']
   */
  appRoots?: string[];

  /**
   * Options that are passed to preboot
   */
  prebootOptions?: any;

  /**
   * The main class to use as entry point for Aurelia (server side)
   */
  main: { configure: (aurelia) => void };
}

export interface InitializationOptions {
  /**
   * The module id of the server main file (e.g. 'main')
   */
  serverMainId?: string;

  /**
   * The path to the server main (defaults to path.join(options.srcRoot, options.serverMain))
   */
  serverMain?: string;

  /**
   * The directory containing the source code (e.g. 'src')
   */
  srcRoot?: string;
}