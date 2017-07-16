declare namespace NodeJS {
  export interface Global {
    window: typeof window;
    self: typeof window;
    document: typeof Window.prototype.document;
    Element: typeof Element;
    SVGElement: typeof SVGElement;
    HTMLElement: typeof HTMLElement;
    requestAnimationFrame: typeof requestAnimationFrame;
    location: typeof location;
    history: typeof history;
    System: {
      import(moduleId: string): Promise<any>;
    };
    PAL: {
      DOM: any;
      PLATFORM: any;
      FEATURE: any;
    };
  }
}
