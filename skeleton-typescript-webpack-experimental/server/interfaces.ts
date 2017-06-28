export interface RenderOptions extends InitializationOptions {
  /**
   * The pathname of the route (e.g. /users)
   * will be sent to router.navigate(<route>)
   */
  route?: string;

  /**
   * Whether or not to use preboot. Preboot allows you to record (and playback) events
   * that occur before the client-app is loaded
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
   * Which template to use to render 404 pages where the "path" variable
   * contains the pathname that was requested
   */
  notFoundTemplate?: string;

  /**
   * The queryselector(s) of the approot(s)
   * e.g. ['body']
   */
  appRoots?: string[];
}

export interface InitializationOptions {
  /**
   * The module id of the server main file (e.g. 'main')
   */
  serverMainId?: string;

  /**
   * The result of require('../src/main') where main is the server main
   */
  // serverMain: { configure: Promise<any> };

  /**
   * The directory containing the source code (e.g. 'src')
   */
  srcRoot?: string;
}