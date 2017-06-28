import {AppRouter, PipelineProvider} from 'aurelia-router';
import {Container} from 'aurelia-dependency-injection';
import {History} from 'aurelia-history';
import {EventAggregator} from 'aurelia-event-aggregator';
import * as LogManager from 'aurelia-logging';

const logger = LogManager.getLogger('app-router');

export class SSRRouter extends AppRouter {

  static inject() { return [Container, History, PipelineProvider, EventAggregator]; }

  _createNavigationInstruction: (url) => Promise<any>;
  _queueInstruction: (instruction) => Promise<any>;
  restorePreviousLocation: (router: AppRouter) => void;

  constructor(container: Container, history: History, pipelineProvider: PipelineProvider, events: EventAggregator) {
    super(container, history, pipelineProvider, events);
  }

  loadUrl(url) {
    return this._createNavigationInstruction(url)
      .then(instruction => this._queueInstruction(instruction))
      .catch(error => {
        restorePreviousLocation(this);
        throw error;
      });
  }
}

function restorePreviousLocation(router) {
  let previousLocation = router.history.previousLocation;
  if (previousLocation) {
    router.navigate(router.history.previousLocation, { trigger: false, replace: true });
  } else if (router.fallbackRoute) {
    router.navigate(router.fallbackRoute, { trigger: true, replace: true });
  } else {
    logger.error('Router navigation failed, and no previous location or fallbackRoute could be restored.');
  }
}