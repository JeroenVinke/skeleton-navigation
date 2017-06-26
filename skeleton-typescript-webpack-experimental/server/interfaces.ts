export class RenderOptions {
  route: string;
  preboot: boolean;
  stylesheets: Array<string>;
  bundles: Array<string>;
  templateContext: any;

  /**
   * The ejs template which is used as index.html template
   */
  template: string;

  /**
   * When using preboot, how long is the delay between Aurelia start and before the view has loaded
   */
  replayDelay?: number;
}

export class InitializeOptions {
  /**
   * The module id of the server main file (e.g. 'main')
   */
  serverMainId: string;

  /**
   * The result of require('../src/main') where main is the server main
   */
  // serverMain: { configure: Promise<any> };

  /**
   * The module id of the client main (e.g. 'main')
   */
  clientMainId: string;

  /**
   * The directory containing the source code (e.g. 'src')
   */
  srcRoot?: string;
}